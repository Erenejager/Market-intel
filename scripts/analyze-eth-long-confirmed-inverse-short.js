#!/usr/bin/env node
/*
  Win rate + MAE/MFE for ETH_LONG_CONFIRMED_INVERSE_SHORT (the bucket the
  most recent ETH LONG alert was delivered under). Fixes a bug in the earlier
  redo script: MFE/MAE "by horizon" there only included episodes whose GLOBAL
  6h extreme happened to land within that horizon, undercounting. This
  computes the true best/worst point reached within [0,h] for every episode,
  for every horizon, independently.
*/
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const ALERTS_PATH = path.join(ROOT, 'data', 'phase1d-alerts.jsonl');
const PRICE_PATH = path.join(ROOT, 'data', 'autoresearch', 'price-15m.jsonl');
const HORIZONS = [1, 2, 3, 4, 5, 6];
const DEDUP_MS = 6 * 3600000;

function readJsonl(f) { return fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)); }
function num(x) { const n = Number(x); return Number.isFinite(n) ? n : null; }
function ts(r) { return Date.parse(r.timestamp_utc || ''); }
function pct(x, d = 3) { return Number.isFinite(x) ? `${x >= 0 ? '+' : ''}${x.toFixed(d)}%` : 'n/a'; }
function mean(v) { const a = v.filter(Number.isFinite); return a.length ? a.reduce((s, x) => s + x, 0) / a.length : null; }

const alerts = readJsonl(ALERTS_PATH);
const priceRows = readJsonl(PRICE_PATH);
const priceByT = priceRows.map(r => ({ t: ts(r), price: num(r.prices?.ETH?.lastPrice) })).filter(r => Number.isFinite(r.t) && Number.isFinite(r.price)).sort((a, b) => a.t - b.t);

function priceAtOrAfter(targetMs, maxLagMs = 25 * 60000) {
  let lo = 0, hi = priceByT.length;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (priceByT[mid].t < targetMs) lo = mid + 1; else hi = mid; }
  const row = priceByT[lo];
  if (!row || row.t - targetMs > maxLagMs) return null;
  return row;
}
function pricesBetween(startMs, endMs) { return priceByT.filter(r => r.t >= startMs && r.t <= endMs); }
function shortReturn(entry, future) { return ((entry - future) / entry) * 100; }

const matched = alerts
  .filter(a => a.asset === 'ETH' && a.type === 'LONG_CONFIRMED' && a.diagnostics?.flow !== 'SPOT_LED_ACCUMULATION')
  .sort((a, b) => ts(a) - ts(b));

const episodes = [];
let lastMs = -Infinity;
for (const a of matched) {
  const t = ts(a);
  if (t - lastMs < DEDUP_MS) continue;
  lastMs = t;
  episodes.push(a);
}

const rows = [];
for (const a of episodes) {
  const t = ts(a);
  const entry = num(a.diagnostics?.price) ?? priceAtOrAfter(t)?.price;
  if (!Number.isFinite(entry)) continue;
  const path6h = pricesBetween(t, t + 6 * 3600000);
  rows.push({ t, entry, path6h, timestamp_utc: a.timestamp_utc });
}

console.log(`ETH_LONG_CONFIRMED_INVERSE_SHORT (asset=ETH, type=LONG_CONFIRMED, flow != SPOT_LED_ACCUMULATION, direction=SHORT/fade)`);
console.log(`Matched raw alerts: ${matched.length}. Independent (>=6h-spaced) episodes: ${episodes.length}.\n`);
console.log('| horizon | n | win % | avg return | median return | mean MFE (0..h) | mean time-to-MFE | mean MAE (0..h) | mean time-to-MAE |');
console.log('|---|---:|---:|---:|---:|---:|---:|---:|---:|');

function median(vals) { const a = vals.filter(Number.isFinite).sort((x, y) => x - y); if (!a.length) return null; const m = a.length >> 1; return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; }

for (const h of HORIZONS) {
  const winVals = [];
  const mfeVals = [], tMfeVals = [], maeVals = [], tMaeVals = [];
  for (const r of rows) {
    const future = priceAtOrAfter(r.t + h * 3600000);
    if (future) winVals.push(shortReturn(r.entry, future.price));
    const windowRows = r.path6h.filter(p => p.t <= r.t + h * 3600000);
    if (!windowRows.length) continue;
    let bestDr = -Infinity, bestT = null, worstDr = Infinity, worstT = null;
    for (const p of windowRows) {
      const dr = shortReturn(r.entry, p.price);
      if (dr > bestDr) { bestDr = dr; bestT = p.t; }
      if (dr < worstDr) { worstDr = dr; worstT = p.t; }
    }
    mfeVals.push(bestDr); tMfeVals.push(Math.round((bestT - r.t) / 60000));
    maeVals.push(worstDr); tMaeVals.push(Math.round((worstT - r.t) / 60000));
  }
  const wins = winVals.filter(v => v > 0).length;
  const winPct = winVals.length ? (wins / winVals.length) * 100 : null;
  console.log(`| ${h}h | ${winVals.length} | ${winPct === null ? 'n/a' : winPct.toFixed(1) + '%'} | ${pct(mean(winVals))} | ${pct(median(winVals))} | ${pct(mean(mfeVals))} | ${mean(tMfeVals) === null ? 'n/a' : Math.round(mean(tMfeVals)) + 'm'} | ${pct(mean(maeVals))} | ${mean(tMaeVals) === null ? 'n/a' : Math.round(mean(tMaeVals)) + 'm'} |`);
}
