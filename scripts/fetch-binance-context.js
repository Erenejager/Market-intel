#!/usr/bin/env node
/*
  fetch-binance-context.js

  Phase 1 Binance context collector for Market Intel.
  Backpack remains venue truth; Binance is used only as high-liquidity derivatives context.

  Fetches, no API key required:
  - OI change over 30m and 4h
  - taker buy/sell flow over 30m and 4h
  - perp basis / premium
  - funding rate streak/duration

  Output:
  - market-intel/data/binance-context.json
  - market-intel/data/binance-context-history.jsonl
*/

const fs = require('fs');
const path = require('path');

const OUT_PATH = path.join(__dirname, '..', 'data', 'binance-context.json');
const OUT_HISTORY_PATH = path.join(__dirname, '..', 'data', 'binance-context-history.jsonl');
const BASE_FAPI = 'https://fapi.binance.com';

const SYMBOLS = {
  BTC: 'BTCUSDT',
  ETH: 'ETHUSDT',
  SOL: 'SOLUSDT',
  PAXG: 'PAXGUSDT',
};

const MAX_STALE_MS = 45 * 60 * 1000;

function nowUtcIso() {
  return new Date().toISOString();
}

function toNum(x) {
  if (x === null || x === undefined || x === '') return null;
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

function pctChange(latest, previous) {
  if (!Number.isFinite(latest) || !Number.isFinite(previous) || previous === 0) return null;
  return (latest - previous) / previous;
}

async function jget(pathname, params = {}) {
  const url = new URL(pathname, BASE_FAPI);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  }
  const res = await fetch(url, {
    headers: {
      'user-agent': 'openclaw-market-intel/1.0',
      'accept': 'application/json,text/plain,*/*',
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${body.slice(0, 180)}`);
  }
  return res.json();
}

function nearestBeforeOrAt(rows, targetMs) {
  if (!Array.isArray(rows) || rows.length === 0) return null;
  let best = null;
  for (const row of rows) {
    const ts = toNum(row.timestamp ?? row.time ?? row.fundingTime);
    if (!Number.isFinite(ts)) continue;
    if (ts <= targetMs && (!best || ts > toNum(best.timestamp ?? best.time ?? best.fundingTime))) best = row;
  }
  return best || rows[0];
}

function aggregateTaker(rows, windowMs, nowMs) {
  const cutoff = nowMs - windowMs;
  let buyVol = 0;
  let sellVol = 0;
  let count = 0;
  for (const row of rows || []) {
    const ts = toNum(row.timestamp);
    if (!Number.isFinite(ts) || ts < cutoff) continue;
    buyVol += toNum(row.buyVol) || 0;
    sellVol += toNum(row.sellVol) || 0;
    count += 1;
  }
  const total = buyVol + sellVol;
  return {
    buy_volume: buyVol,
    sell_volume: sellVol,
    total_volume: total,
    buy_sell_ratio: sellVol > 0 ? buyVol / sellVol : null,
    buy_share: total > 0 ? buyVol / total : null,
    samples: count,
  };
}

function fundingStreak(fundingRows, currentFundingRate) {
  const rows = [...(fundingRows || [])].sort((a, b) => toNum(b.fundingTime) - toNum(a.fundingTime));
  const latestRate = Number.isFinite(currentFundingRate) ? currentFundingRate : toNum(rows[0]?.fundingRate);
  if (!Number.isFinite(latestRate) || latestRate === 0) {
    return { sign: 'NEUTRAL', current_rate: latestRate, streak_count: 0, estimated_hours: 0 };
  }
  const sign = latestRate > 0 ? 'POSITIVE' : 'NEGATIVE';
  let count = 0;
  for (const row of rows) {
    const rate = toNum(row.fundingRate);
    if (!Number.isFinite(rate) || rate === 0) break;
    const rowSign = rate > 0 ? 'POSITIVE' : 'NEGATIVE';
    if (rowSign !== sign) break;
    count += 1;
  }
  // Binance USD-M funding is usually every 8h.
  return { sign, current_rate: latestRate, streak_count: count, estimated_hours: count * 8 };
}

async function fetchSymbol(asset, symbol, nowMs) {
  const errors = [];
  const out = { asset, symbol, data_quality: 'OK', errors };

  let premium = null;
  try {
    premium = await jget('/fapi/v1/premiumIndex', { symbol });
    const mark = toNum(premium.markPrice);
    const index = toNum(premium.indexPrice);
    out.premium = {
      mark_price: mark,
      index_price: index,
      basis: Number.isFinite(mark) && Number.isFinite(index) ? mark - index : null,
      basis_rate: Number.isFinite(mark) && Number.isFinite(index) && index !== 0 ? (mark - index) / index : null,
      last_funding_rate: toNum(premium.lastFundingRate),
      next_funding_time: toNum(premium.nextFundingTime),
      timestamp: toNum(premium.time),
    };
  } catch (e) {
    errors.push(`premiumIndex: ${e.message}`);
  }

  try {
    const rows = await jget('/futures/data/openInterestHist', { symbol, period: '5m', limit: 60 });
    const latest = rows?.[rows.length - 1] || null;
    const latestOi = toNum(latest?.sumOpenInterest);
    const latestOiUsd = toNum(latest?.sumOpenInterestValue);
    const row30 = nearestBeforeOrAt(rows, nowMs - 30 * 60 * 1000);
    const row4h = nearestBeforeOrAt(rows, nowMs - 4 * 60 * 60 * 1000);
    out.open_interest = {
      latest: latestOi,
      latest_usd: latestOiUsd,
      timestamp: toNum(latest?.timestamp),
      change_30m: pctChange(latestOi, toNum(row30?.sumOpenInterest)),
      change_30m_usd: pctChange(latestOiUsd, toNum(row30?.sumOpenInterestValue)),
      change_4h: pctChange(latestOi, toNum(row4h?.sumOpenInterest)),
      change_4h_usd: pctChange(latestOiUsd, toNum(row4h?.sumOpenInterestValue)),
      source_period: '5m',
      samples: Array.isArray(rows) ? rows.length : 0,
    };
  } catch (e) {
    errors.push(`openInterestHist: ${e.message}`);
  }

  try {
    const rows = await jget('/futures/data/takerlongshortRatio', { symbol, period: '5m', limit: 60 });
    out.taker_flow = {
      window_30m: aggregateTaker(rows, 30 * 60 * 1000, nowMs),
      window_4h: aggregateTaker(rows, 4 * 60 * 60 * 1000, nowMs),
      source_period: '5m',
      samples: Array.isArray(rows) ? rows.length : 0,
    };
  } catch (e) {
    errors.push(`takerlongshortRatio: ${e.message}`);
  }

  try {
    const rows = await jget('/fapi/v1/fundingRate', { symbol, limit: 30 });
    out.funding_streak = fundingStreak(rows, out.premium?.last_funding_rate);
    out.funding_streak.source_samples = Array.isArray(rows) ? rows.length : 0;
    out.funding_streak.latest_history_time = toNum(rows?.[rows.length - 1]?.fundingTime);
  } catch (e) {
    errors.push(`fundingRate: ${e.message}`);
  }

  if (errors.length > 0) out.data_quality = errors.length >= 3 ? 'DEGRADED' : 'PARTIAL';

  return out;
}

async function main() {
  const nowMs = Date.now();
  const context = {
    timestamp_utc: nowUtcIso(),
    source: 'binance-usdm-public',
    role: 'context_only_backpack_remains_truth',
    max_stale_ms: MAX_STALE_MS,
    data_quality: 'OK',
    degraded_reasons: [],
    markets: {},
    interpretation_notes: {
      oi_change: 'Price and OI rising together supports real demand; price rising with OI falling suggests short covering/squeeze and weaker follow-through.',
      taker_flow: 'Buy share above its normal baseline confirms aggressive buying; sell share confirms aggressive selling. Phase 1 records raw values; Phase 2 adds rolling baselines.',
      basis: 'Elevated positive basis can indicate overheated/crowded longs; negative basis can indicate stress or short crowding.',
      funding_streak: 'Persistent negative funding supports short-squeeze pressure; persistent positive funding can indicate crowded longs.'
    }
  };

  for (const [asset, symbol] of Object.entries(SYMBOLS)) {
    try {
      context.markets[asset] = await fetchSymbol(asset, symbol, nowMs);
    } catch (e) {
      context.markets[asset] = { asset, symbol, data_quality: 'DEGRADED', errors: [String(e?.message || e)] };
    }
  }

  const qualities = Object.values(context.markets).map(m => m.data_quality);
  if (qualities.includes('DEGRADED')) context.data_quality = 'DEGRADED';
  else if (qualities.includes('PARTIAL')) context.data_quality = 'PARTIAL';
  context.degraded_reasons = Object.values(context.markets)
    .flatMap(m => (m.errors || []).map(e => `${m.asset}: ${e}`));

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(context, null, 2) + '\n');
  fs.appendFileSync(OUT_HISTORY_PATH, JSON.stringify(context) + '\n');

  process.stdout.write(JSON.stringify({
    ok: context.data_quality !== 'DEGRADED',
    timestamp_utc: context.timestamp_utc,
    data_quality: context.data_quality,
    out: path.relative(process.cwd(), OUT_PATH),
    history: path.relative(process.cwd(), OUT_HISTORY_PATH),
  }));
}

main().catch(err => {
  const out = {
    timestamp_utc: nowUtcIso(),
    source: 'binance-usdm-public',
    role: 'context_only_backpack_remains_truth',
    data_quality: 'DEGRADED',
    degraded_reasons: [`collector_fatal: ${err.message}`],
    markets: {},
  };
  try {
    fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
    fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + '\n');
  } catch {}
  process.stdout.write(JSON.stringify({ ok: false, ...out }));
  process.exit(1);
});
