#!/usr/bin/env node
/*
  Daily paper-trading strategy book (Phase S1, started 2026-09-26).

  Three sleeves, equal capital (1/3 each), rebalanced at the Binance daily close (00:00 UTC):
    1. trend       - long/flat per coin while daily close > SMA50, inverse-vol sized (40% target, cap 2x),
                     each coin gets 1/N of the sleeve. Only active while BTC closes above its 200-day SMA.
    2. xs_carry    - every Monday: short the 4 coins with the highest 7d funding, long the 4 lowest,
                     inverse-vol weights normalised to gross 1.
    3. cash_carry  - BTC/ETH long spot + short perp while 3d average daily funding > 0; earns funding only.

  Rules and costs mirror the 2021-2026 backtest (see docs/STRATEGY_BOOK.md). Paper only: no orders are placed.

  Usage:
    node scripts/strategy-book.js                      # live: process every completed daily close since last run
    node scripts/strategy-book.js --replay-from 2025-01-01 [--replay-to 2025-12-31]
                                                        # rebuild a separate replay book from history, no Telegram
  Env:
    STRATEGY_BOOK_DISABLE_TELEGRAM=1                   # live run without sending the daily summary
*/

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const BOOK_DIR = path.join(ROOT, 'data', 'strategy-book');
const CONFIG_PATH = path.join(ROOT, 'config.json');
const BINANCE = 'https://fapi.binance.com/fapi/v1';

const UNIVERSE = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'LINK', 'DOT', 'LTC', 'TRX', 'BCH', 'ATOM', 'NEAR', 'UNI', 'FIL', 'ETC', 'XLM'];
const CASH_CARRY_COINS = ['BTC', 'ETH'];
const FEE_PER_SIDE = 0.0006;      // taker fee + slippage per unit of notional traded
const SMA_DAYS = 50;
const REGIME_DAYS = 200;         // trend sleeve trades only while BTC > its 200-day SMA
const VOL_DAYS = 30;
const VOL_TARGET = 0.4;
const VOL_CAP = 2;
const XS_LEGS = 4;
const XS_FUNDING_DAYS = 7;
const CARRY_FUNDING_DAYS = 3;
const START_EQUITY = 10000;
const SLEEVES = ['trend', 'xs_carry', 'cash_carry'];
const DAY_MS = 86400000;
const PAPER_DAYS = 56;
const KILL_DRAWDOWN = -0.15;

function nowIso() { return new Date().toISOString(); }
function dayStr(ms) { return new Date(ms).toISOString().slice(0, 10); }
function readJson(file) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; } }
function writeJson(file, obj) { fs.writeFileSync(file, `${JSON.stringify(obj, null, 2)}\n`); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getJson(url) {
  let lastErr;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': 'openclaw-market-intel/1.0' } });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return await res.json();
    } catch (e) {
      lastErr = e;
      await sleep(2000 * (attempt + 1));
    }
  }
  throw new Error(`fetch failed after retries: ${url} :: ${lastErr?.message || lastErr}`);
}

// Daily klines keyed by close time (open time + 1 day). Only fully closed candles are kept.
async function fetchDailyCloses(coin, startMs) {
  const out = new Map();
  let t = startMs;
  for (;;) {
    const rows = await getJson(`${BINANCE}/klines?symbol=${coin}USDT&interval=1d&limit=1500&startTime=${t}`);
    for (const k of rows) {
      const closeMs = Number(k[0]) + DAY_MS;
      if (closeMs <= Date.now()) out.set(closeMs, Number(k[4]));
    }
    if (rows.length < 1500) break;
    t = Number(rows[rows.length - 1][0]) + 1;
  }
  return out;
}

async function fetchFunding(coin, startMs) {
  const out = [];
  let t = startMs;
  for (;;) {
    const rows = await getJson(`${BINANCE}/fundingRate?symbol=${coin}USDT&limit=1000&startTime=${t}`);
    for (const r of rows) out.push([Number(r.fundingTime), Number(r.fundingRate)]);
    if (rows.length < 1000) break;
    t = Number(rows[rows.length - 1].fundingTime) + 1;
    await sleep(200);
  }
  return out;
}

async function loadMarket(startMs) {
  const closes = {};
  const funding = {};
  for (const coin of UNIVERSE) {
    closes[coin] = await fetchDailyCloses(coin, startMs);
    funding[coin] = await fetchFunding(coin, startMs);
  }
  const allCloses = [...new Set(Object.values(closes).flatMap(m => [...m.keys()]))].sort((a, b) => a - b);
  return { closes, funding, closeTimes: allCloses };
}

// Funding paid by a long over (fromMs, toMs]; a short receives the same amount.
function fundingBetween(events, fromMs, toMs) {
  let sum = 0;
  for (const [t, r] of events) if (t > fromMs && t <= toMs) sum += r;
  return sum;
}

function history(market, coin, closeMs, days) {
  const out = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const v = market.closes[coin].get(closeMs - i * DAY_MS);
    if (v === undefined) return null;
    out.push(v);
  }
  return out;
}

function annualVol(prices) {
  const rets = [];
  for (let i = 1; i < prices.length; i += 1) rets.push(prices[i] / prices[i - 1] - 1);
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const variance = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / (rets.length - 1);
  return Math.sqrt(variance) * Math.sqrt(365);
}

function normaliseGross(weights) {
  const gross = Object.values(weights).reduce((a, w) => a + Math.abs(w), 0);
  if (!gross) return {};
  return Object.fromEntries(Object.entries(weights).map(([c, w]) => [c, w / gross]));
}

// Target weights per sleeve, decided with data up to and including the close at closeMs.
function computeTargets(market, closeMs, previous) {
  const info = {};
  for (const coin of UNIVERSE) {
    const px = history(market, coin, closeMs, Math.max(SMA_DAYS, VOL_DAYS + 1));
    if (!px) continue;
    const sma = px.slice(-SMA_DAYS).reduce((a, b) => a + b, 0) / SMA_DAYS;
    const vol = annualVol(px.slice(-(VOL_DAYS + 1)));
    const dailyFunding = d => fundingBetween(market.funding[coin], closeMs - d * DAY_MS, closeMs) / d;
    info[coin] = {
      close: px[px.length - 1],
      sma50: sma,
      vol30: vol,
      invvol: Math.min(VOL_TARGET / vol, VOL_CAP),
      funding7d: dailyFunding(XS_FUNDING_DAYS),
      funding3d: dailyFunding(CARRY_FUNDING_DAYS),
    };
  }
  const coins = Object.keys(info);

  const btcHistory = history(market, 'BTC', closeMs, REGIME_DAYS);
  const btcSma200 = btcHistory ? btcHistory.reduce((a, b) => a + b, 0) / REGIME_DAYS : null;
  const regime = { btc_close: info.BTC?.close ?? null, btc_sma200: btcSma200, bull: !!(btcSma200 && info.BTC && info.BTC.close > btcSma200) };

  const trend = {};
  if (regime.bull) for (const c of coins) if (info[c].close > info[c].sma50) trend[c] = info[c].invvol / coins.length;

  // Monday close = candle that opened Sunday 00:00 closes Monday 00:00; rebalance on the candle opened Monday,
  // i.e. close time Tuesday 00:00, matching the backtest's dayofweek==0 on candle open time.
  const openDay = new Date(closeMs - DAY_MS).getUTCDay();
  let xs = previous?.xs_carry || {};
  let xsRebalanced = false;
  if (openDay === 1 || !previous) {
    const ranked = [...coins].sort((a, b) => info[a].funding7d - info[b].funding7d);
    const raw = {};
    for (const c of ranked.slice(0, XS_LEGS)) raw[c] = info[c].invvol;
    for (const c of ranked.slice(-XS_LEGS)) raw[c] = -info[c].invvol;
    xs = normaliseGross(raw);
    xsRebalanced = true;
  }

  const carryHeld = CASH_CARRY_COINS.filter(c => info[c] && info[c].funding3d > 0);
  const cash = Object.fromEntries(carryHeld.map(c => [c, 1 / carryHeld.length]));

  return { targets: { trend, xs_carry: xs, cash_carry: cash }, info, regime, xsRebalanced };
}

function turnover(prev = {}, next = {}) {
  const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  let t = 0;
  for (const k of keys) t += Math.abs((next[k] || 0) - (prev[k] || 0));
  return t;
}

// P&L of holding `positions` from prevClose to closeMs, as a fraction of each sleeve's capital.
function sleeveReturns(market, positions, prevClose, closeMs) {
  const out = {};
  for (const sleeve of SLEEVES) {
    let r = 0;
    for (const [coin, w] of Object.entries(positions[sleeve] || {})) {
      const f = fundingBetween(market.funding[coin], prevClose, closeMs);
      if (sleeve === 'cash_carry') { r += w * f; continue; }
      const p0 = market.closes[coin].get(prevClose);
      const p1 = market.closes[coin].get(closeMs);
      if (p0 === undefined || p1 === undefined) continue;
      r += w * (p1 / p0 - 1) - w * f;
    }
    out[sleeve] = r;
  }
  return out;
}

function stepDay(state, market, closeMs) {
  const hadPositions = !!state.last_close_ms;
  const gross = hadPositions ? sleeveReturns(market, state.positions, state.last_close_ms, closeMs) : { trend: 0, xs_carry: 0, cash_carry: 0 };
  const { targets, info, regime, xsRebalanced } = computeTargets(market, closeMs, hadPositions ? state.positions : null);
  const fees = {};
  const net = {};
  for (const s of SLEEVES) {
    const legs = s === 'cash_carry' ? 2 : 1;
    fees[s] = turnover(state.positions[s], targets[s]) * FEE_PER_SIDE * legs;
    net[s] = gross[s] - fees[s];
    state.sleeve_equity[s] *= 1 + net[s];
  }
  const equity = SLEEVES.reduce((a, s) => a + state.sleeve_equity[s], 0);
  state.peak_equity = Math.max(state.peak_equity, equity);
  const changes = describeChanges(state.positions, targets);
  state.positions = targets;
  state.last_close_ms = closeMs;
  state.equity = equity;
  const row = {
    timestamp_utc: nowIso(),
    close_utc: new Date(closeMs).toISOString(),
    day: dayStr(closeMs - DAY_MS),
    sleeve_return_net: net,
    sleeve_fees: fees,
    day_return: SLEEVES.reduce((a, s) => a + net[s], 0) / SLEEVES.length,
    equity,
    drawdown: equity / state.peak_equity - 1,
    xs_rebalanced: xsRebalanced,
    regime,
    changes,
    positions: targets,
  };
  return { row, info: { ...info, _regime: regime } };
}

function describeChanges(prev, next) {
  const out = {};
  for (const s of SLEEVES) {
    const a = prev[s] || {};
    const b = next[s] || {};
    const entered = Object.keys(b).filter(c => !(c in a) || Math.sign(a[c]) !== Math.sign(b[c]));
    const exited = Object.keys(a).filter(c => !(c in b));
    if (entered.length || exited.length) out[s] = { entered, exited };
  }
  return out;
}

function freshState() {
  return {
    version: 'strategy-book-v2',
    started_at: nowIso(),
    start_equity: START_EQUITY,
    sleeve_equity: Object.fromEntries(SLEEVES.map(s => [s, START_EQUITY / SLEEVES.length])),
    equity: START_EQUITY,
    peak_equity: START_EQUITY,
    positions: { trend: {}, xs_carry: {}, cash_carry: {} },
    last_close_ms: null,
    first_close_ms: null,
  };
}

function pct(x, digits = 2) { return `${x >= 0 ? '+' : ''}${(x * 100).toFixed(digits)}%`; }

function formatSummary(state, rows, info) {
  const last = rows[rows.length - 1];
  const daysLive = Math.round((state.last_close_ms - state.first_close_ms) / DAY_MS);
  const total = state.equity / state.start_equity - 1;
  const lines = [
    `📒 Strategy book (paper) — close ${last.close_utc.slice(0, 10)} 00:00 UTC`,
    `Equity ${state.equity.toFixed(0)} USDT (${pct(total)} since start, day ${daysLive}/${PAPER_DAYS})`,
    `Today ${pct(last.day_return)} | trend ${pct(last.sleeve_return_net.trend)} | xs-carry ${pct(last.sleeve_return_net.xs_carry)} | cash-carry ${pct(last.sleeve_return_net.cash_carry)}`,
    `Drawdown ${pct(last.drawdown)} (kill switch at ${pct(KILL_DRAWDOWN, 0)})`,
  ];
  if (last.drawdown <= KILL_DRAWDOWN) lines.push('🛑 KILL SWITCH: drawdown limit reached. Review before continuing.');

  const changeLines = [];
  for (const row of rows) {
    for (const [s, c] of Object.entries(row.changes)) {
      if (c.entered.length) changeLines.push(`${row.close_utc.slice(0, 10)} ${s}: enter ${c.entered.join(', ')}`);
      if (c.exited.length) changeLines.push(`${row.close_utc.slice(0, 10)} ${s}: exit ${c.exited.join(', ')}`);
    }
  }
  lines.push('', changeLines.length ? 'Changes:' : 'No position changes.');
  lines.push(...changeLines.slice(0, 12));

  const trend = Object.keys(state.positions.trend);
  const rg = info._regime;
  const coinsCount = Object.keys(info).filter(k => !k.startsWith('_')).length;
  lines.push('', `BTC regime: ${rg.bull ? 'BULL' : 'BEAR — trend sleeve flat'} (BTC ${rg.btc_close} vs 200d avg ${rg.btc_sma200 ? rg.btc_sma200.toFixed(0) : 'n/a'})`);
  lines.push(`Trend longs (${trend.length}/${coinsCount}), exit if daily close < SMA50:`);
  for (const c of trend.sort()) lines.push(`• ${c} ${info[c].close} (SMA50 ${info[c].sma50.toPrecision(5)})`);
  const xs = Object.entries(state.positions.xs_carry).sort((a, b) => b[1] - a[1]);
  lines.push('', `XS-carry (weekly, Mon): long ${xs.filter(([, w]) => w > 0).map(([c]) => c).join(', ')} | short ${xs.filter(([, w]) => w < 0).map(([c]) => c).join(', ')}`);
  const cash = Object.keys(state.positions.cash_carry);
  lines.push(`Cash-carry: ${cash.length ? cash.join(', ') : 'flat (funding ≤ 0)'} — BTC 3d funding ${pct(info.BTC.funding3d * 365, 1)}/yr, ETH ${pct(info.ETH.funding3d * 365, 1)}/yr`);
  lines.push('', 'Paper only. No orders placed.');
  return lines.join('\n');
}

function sendTelegram(message) {
  if (process.env.STRATEGY_BOOK_DISABLE_TELEGRAM === '1') return { sent: false, reason: 'disabled_by_env' };
  const config = readJson(CONFIG_PATH) || {};
  const channel = config.telegram?.channel || 'telegram';
  const target = config.telegram?.to;
  if (!target) return { sent: false, reason: 'no_telegram_target_in_config' };
  const res = spawnSync('openclaw', ['message', 'send', '--channel', channel, '--target', String(target), '--message', message], { encoding: 'utf8', timeout: 30_000 });
  return { sent: res.status === 0, error: res.status === 0 ? null : (res.stderr || res.stdout || `exit ${res.status}`).slice(0, 300) };
}

function writeReport(dir, state, rows, info, telegram) {
  const ledger = fs.existsSync(path.join(dir, 'ledger.jsonl'))
    ? fs.readFileSync(path.join(dir, 'ledger.jsonl'), 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l))
    : rows;
  const rets = ledger.map(r => r.day_return);
  const mean = rets.reduce((a, b) => a + b, 0) / Math.max(rets.length, 1);
  const sd = Math.sqrt(rets.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(rets.length - 1, 1));
  const summary = {
    timestamp_utc: nowIso(),
    version: state.version,
    days: ledger.length,
    equity: state.equity,
    total_return: state.equity / state.start_equity - 1,
    annualised_return: mean * 365,
    annualised_sharpe: sd > 0 ? (mean / sd) * Math.sqrt(365) : null,
    max_drawdown: Math.min(0, ...ledger.map(r => r.drawdown)),
    sleeve_equity: state.sleeve_equity,
    positions: state.positions,
    market: info,
    telegram,
  };
  writeJson(path.join(dir, 'latest.json'), summary);
  fs.writeFileSync(path.join(dir, 'latest.md'), `${formatSummary(state, rows, info)}\n`);
  return summary;
}

async function main() {
  const args = process.argv.slice(2);
  const replayFrom = args.includes('--replay-from') ? Date.parse(`${args[args.indexOf('--replay-from') + 1]}T00:00:00Z`) : null;
  const replayTo = args.includes('--replay-to') ? Date.parse(`${args[args.indexOf('--replay-to') + 1]}T00:00:00Z`) : null;
  const dir = replayFrom ? path.join(BOOK_DIR, 'replay') : BOOK_DIR;
  fs.mkdirSync(dir, { recursive: true });
  const statePath = path.join(dir, 'state.json');

  if (replayFrom) for (const f of ['state.json', 'ledger.jsonl']) fs.rmSync(path.join(dir, f), { force: true });
  const state = readJson(statePath) || freshState();

  const lookbackMs = (Math.max(SMA_DAYS, VOL_DAYS + 1, REGIME_DAYS) + 10) * DAY_MS;
  const fromMs = (replayFrom || state.last_close_ms || Date.now()) - lookbackMs;
  const market = await loadMarket(fromMs);

  let pending = market.closeTimes.filter(t => t > (state.last_close_ms || 0));
  if (replayFrom) pending = pending.filter(t => t >= replayFrom && (!replayTo || t <= replayTo));
  else if (!state.last_close_ms) pending = pending.slice(-1); // live book starts at the latest close
  // Only step on closes every coin in the universe has reported, so a lagging symbol cannot skew a day.
  pending = pending.filter(t => UNIVERSE.every(c => market.closes[c].has(t) || !market.closes[c].has(t - DAY_MS)));

  if (!pending.length) {
    process.stdout.write(JSON.stringify({ ok: true, processed: 0, reason: 'no new daily close', last_close_utc: state.last_close_ms ? new Date(state.last_close_ms).toISOString() : null }));
    return;
  }

  const rows = [];
  let info = null;
  for (const closeMs of pending) {
    if (!state.first_close_ms) state.first_close_ms = closeMs;
    const step = stepDay(state, market, closeMs);
    rows.push(step.row);
    info = step.info;
    fs.appendFileSync(path.join(dir, 'ledger.jsonl'), `${JSON.stringify(step.row)}\n`);
  }
  writeJson(statePath, state);

  const telegram = replayFrom ? { sent: false, reason: 'replay' } : sendTelegram(formatSummary(state, rows, info));
  const summary = writeReport(dir, state, rows, info, telegram);
  process.stdout.write(JSON.stringify({
    ok: true,
    mode: replayFrom ? 'replay' : 'live',
    processed: rows.length,
    last_close_utc: new Date(state.last_close_ms).toISOString(),
    equity: Number(state.equity.toFixed(2)),
    total_return: Number(summary.total_return.toFixed(4)),
    annualised_sharpe: summary.annualised_sharpe === null ? null : Number(summary.annualised_sharpe.toFixed(2)),
    max_drawdown: Number(summary.max_drawdown.toFixed(4)),
    telegram,
  }));
}

main().catch(e => {
  process.stdout.write(JSON.stringify({ ok: false, timestamp_utc: nowIso(), error: String(e?.message || e) }));
  process.exit(1);
});
