#!/usr/bin/env node
/*
  BTC SHORT discriminator analysis.

  For all BTC SHORT_CONFIRMED HIGH, splits by flow_streak and flow_type
  and shows 30m / 1h / 2h / 3h / 4h / 24h win rates per cohort.

  Run twice internally: full history and May25+ downtrend window.

  Usage:
    node scripts/analyze-btc-short-discriminators.js
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const ALERTS_PATH = path.join(DATA, 'phase1d-alerts.jsonl');
const PRICE_PATH  = path.join(DATA, 'autoresearch', 'price-15m.jsonl');

const HORIZONS = [
  ['30m',  30 * 60 * 1000],
  ['1h',    1 * 60 * 60 * 1000],
  ['2h',    2 * 60 * 60 * 1000],
  ['3h',    3 * 60 * 60 * 1000],
  ['4h',    4 * 60 * 60 * 1000],
  ['24h',  24 * 60 * 60 * 1000],
];
const PRICE_TOL = 20 * 60 * 1000;

function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
}
function ts(r) { return Date.parse(r.timestamp_utc || r.timestamp || ''); }
function num(x) { const n = Number(x); return Number.isFinite(n) ? n : null; }

function priceAt(prices, asset, targetMs) {
  for (const r of prices) {
    const t = ts(r);
    if (t < targetMs) continue;
    if (t > targetMs + PRICE_TOL) return null;
    const p = num(r.prices?.[asset]?.lastPrice);
    if (Number.isFinite(p)) return p;
  }
  return null;
}

function returnPct(entry, future) {
  if (!Number.isFinite(entry) || !Number.isFinite(future)) return null;
  return ((entry - future) / entry) * 100; // SHORT direction: price drop = positive return
}

function stats(returns) {
  const clean = returns.filter(Number.isFinite);
  const wins = clean.filter(r => r > 0).length;
  const avg = clean.length ? clean.reduce((a,b) => a+b, 0) / clean.length : null;
  return { n: clean.length, wins, win_rate: clean.length ? wins / clean.length : null, avg };
}

function buildRows(alerts, prices, sinceMs) {
  return alerts
    .filter(a =>
      a.asset === 'BTC' &&
      a.type === 'SHORT_CONFIRMED' &&
      a.severity === 'HIGH' &&
      ts(a) >= sinceMs
    )
    .sort((a, b) => ts(a) - ts(b))
    .map(alert => {
      const t0 = ts(alert);
      const d = alert.diagnostics || {};
      const entry = num(d.price);
      const horizons = {};
      for (const [label, ms] of HORIZONS) {
        const fp = priceAt(prices, 'BTC', t0 + ms);
        horizons[label] = returnPct(entry, fp);
      }
      return {
        timestamp_utc: alert.timestamp_utc,
        entry_price: entry,
        flow_type: d.flow || 'UNKNOWN',
        flow_streak: d.flow_streak ?? null,
        cvd_divergence: d.cvd_divergence || 'NONE',
        horizons,
      };
    });
}

function statGroup(rows) {
  const out = {};
  for (const [label] of HORIZONS) {
    out[label] = stats(rows.map(r => r.horizons[label]));
  }
  return out;
}

function pct(x) { return Number.isFinite(x) ? `${(x*100).toFixed(1)}%` : 'n/a'; }
function ret(x) {
  if (!Number.isFinite(x)) return 'n/a';
  return `${x >= 0 ? '+' : ''}${x.toFixed(3)}%`;
}

function printTable(label, rows, note) {
  const sg = statGroup(rows);
  const tag = rows.length < 10 ? ' [obs-only n<10]' : '';
  console.log(`\n### ${label}  n=${rows.length}${tag}`);
  if (note) console.log(`    ${note}`);
  console.log(`  ${'win'.padEnd(4)} | ${'n'.padStart(3)} | ${'win%'.padStart(6)} | ${'avg ret'.padStart(9)}`);
  console.log(`  ${'-'.repeat(4)}-+-${'-'.repeat(3)}-+-${'-'.repeat(6)}-+-${'-'.repeat(9)}`);
  for (const [lbl] of HORIZONS) {
    const s = sg[lbl];
    console.log(`  ${lbl.padEnd(4)} | ${String(s.n).padStart(3)} | ${pct(s.win_rate).padStart(6)} | ${ret(s.avg).padStart(9)}`);
  }
}

function printRawRows(rows) {
  console.log(`\n${'timestamp'.padEnd(20)} ${'str'.padStart(3)} ${'cvd'.padEnd(28)} ${'flow'.padEnd(22)} ${'30m'.padStart(7)} ${'1h'.padStart(7)} ${'2h'.padStart(7)} ${'3h'.padStart(7)} ${'4h'.padStart(7)} ${'24h'.padStart(8)}`);
  for (const r of rows) {
    const h = r.horizons;
    console.log(
      `${r.timestamp_utc.slice(0,19).padEnd(20)} ${String(r.flow_streak ?? '?').padStart(3)} ${(r.cvd_divergence||'').padEnd(28)} ${r.flow_type.padEnd(22)} ${ret(h['30m']).padStart(7)} ${ret(h['1h']).padStart(7)} ${ret(h['2h']).padStart(7)} ${ret(h['3h']).padStart(7)} ${ret(h['4h']).padStart(7)} ${ret(h['24h']).padStart(8)}`
    );
  }
}

function analyze(rows, windowLabel) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`BTC SHORT discriminators — ${windowLabel}  (total n=${rows.length})`);
  console.log('='.repeat(70));

  printTable('ALL BTC SHORT', rows);

  console.log('\n── flow_streak ─────────────────────────────────────────────────────');
  printTable('streak = 1 (fresh confirmation)', rows.filter(r => r.flow_streak === 1));
  printTable('streak = 2', rows.filter(r => r.flow_streak === 2));
  printTable('streak = 3 (sustained pressure)', rows.filter(r => r.flow_streak === 3));
  printTable('streak 1–2 combined', rows.filter(r => r.flow_streak <= 2));

  console.log('\n── flow_type ───────────────────────────────────────────────────────');
  printTable('SELL_PRESSURE', rows.filter(r => r.flow_type === 'SELL_PRESSURE'));
  printTable('LEVERAGED_CHASE', rows.filter(r => r.flow_type === 'LEVERAGED_CHASE'));
  printTable('other flow types', rows.filter(r => !['SELL_PRESSURE','LEVERAGED_CHASE'].includes(r.flow_type)));

  console.log('\n── cvd_divergence ──────────────────────────────────────────────────');
  printTable('CVD = NONE', rows.filter(r => r.cvd_divergence === 'NONE'));
  printTable('CVD = SPOT_NEGATIVE_FUTURES_POSITIVE',
    rows.filter(r => r.cvd_divergence === 'SPOT_NEGATIVE_FUTURES_POSITIVE'),
    'spot selling ahead of futures — early real selling');
  printTable('CVD = SPOT_POSITIVE_FUTURES_NEGATIVE',
    rows.filter(r => r.cvd_divergence === 'SPOT_POSITIVE_FUTURES_NEGATIVE'),
    'spot bidding vs futures weakness — fragile move');
  printTable('any CVD divergence combined', rows.filter(r => r.cvd_divergence !== 'NONE'));

  console.log('\n── cross-cuts ──────────────────────────────────────────────────────');
  printTable('streak=3 + SELL_PRESSURE',
    rows.filter(r => r.flow_streak === 3 && r.flow_type === 'SELL_PRESSURE'));
  printTable('streak=3 + CVD=NONE',
    rows.filter(r => r.flow_streak === 3 && r.cvd_divergence === 'NONE'));
  printTable('streak=1 + SELL_PRESSURE',
    rows.filter(r => r.flow_streak === 1 && r.flow_type === 'SELL_PRESSURE'));
  printTable('streak=1 + CVD divergent',
    rows.filter(r => r.flow_streak === 1 && r.cvd_divergence !== 'NONE'));

  console.log('\n── raw rows ────────────────────────────────────────────────────────');
  printRawRows(rows);
}

function main() {
  const alerts = readJsonl(ALERTS_PATH);
  const prices  = readJsonl(PRICE_PATH).sort((a, b) => ts(a) - ts(b));

  const allRows   = buildRows(alerts, prices, Date.parse('2026-05-08T00:00:00Z'));
  const may25Rows = buildRows(alerts, prices, Date.parse('2026-05-25T00:00:00Z'));

  analyze(allRows,   'full history (May8–current)');
  analyze(may25Rows, 'May25+ downtrend window only');
}

main();
