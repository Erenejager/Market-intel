#!/usr/bin/env node
/*
  Re-validate the 5 of 10 newly-enabled Telegram candidates that depend ONLY
  on alert type + flow (never touched by the Jun9-20 frozen backpack-snapshot/
  binance-context bug): BTC_LONG_SETUP_SPOT_LED_ACCUMULATION,
  ETH_LONG_CONFIRMED_SPOT_LED_INVERSE_SHORT, ETH_LONG_CONFIRMED_INVERSE_SHORT,
  ETH_LONG_SETUP_STRUCTURAL_BUYING_INVERSE_SHORT,
  SOL_LONG_CONFIRMED_STRUCTURAL_BUYING_INVERSE_SHORT.

  The other 5 enabled candidates key on readiness_shadow.state, which scores
  oi_price_regime as a component — that classification was a frozen near-
  constant for the whole window (confirmed via microstructure-history.jsonl),
  so they cannot be retroactively reconstructed and are intentionally excluded
  here.

  Fixes the prior methodology's dedup flaw: that pass used a 90-minute cooldown
  while measuring out to 6h, so adjacent "episodes" shared most of their outcome
  window (inflated, non-independent n). This pass dedupes per bucket with a
  cooldown >= the longest horizon measured (6h), so episodes are independent.

  Outcome computation (entry price, horizon returns, MFE/MAE, time-to-MFE/MAE)
  uses data/autoresearch/price-15m.jsonl, which was never touched by the bug.
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ALERTS_PATH = path.join(ROOT, 'data', 'phase1d-alerts.jsonl');
const PRICE_PATH = path.join(ROOT, 'data', 'autoresearch', 'price-15m.jsonl');
const OUT_PATH = path.join(ROOT, 'data', 'clean-candidates-redo-2026-06-20.md');

const HORIZONS = [1, 2, 3, 4, 5, 6];
const ASSETS = ['BTC', 'ETH', 'SOL'];
const DEDUP_COOLDOWN_MS = 6 * 60 * 60 * 1000; // >= longest horizon measured

const BUCKETS = [
  { key: 'BTC_LONG_SETUP_SPOT_LED_ACCUMULATION', asset: 'BTC', type: 'LONG_SETUP', flow: 'SPOT_LED_ACCUMULATION', direction: 'LONG' },
  { key: 'ETH_LONG_CONFIRMED_SPOT_LED_INVERSE_SHORT', asset: 'ETH', type: 'LONG_CONFIRMED', flow: 'SPOT_LED_ACCUMULATION', direction: 'SHORT' },
  { key: 'ETH_LONG_CONFIRMED_INVERSE_SHORT', asset: 'ETH', type: 'LONG_CONFIRMED', flow: null, excludeFlow: 'SPOT_LED_ACCUMULATION', direction: 'SHORT' },
  { key: 'ETH_LONG_SETUP_STRUCTURAL_BUYING_INVERSE_SHORT', asset: 'ETH', type: 'LONG_SETUP', flow: 'STRUCTURAL_BUYING', direction: 'SHORT' },
  { key: 'SOL_LONG_CONFIRMED_STRUCTURAL_BUYING_INVERSE_SHORT', asset: 'SOL', type: 'LONG_CONFIRMED', flow: 'STRUCTURAL_BUYING', direction: 'SHORT' },
];

function readJsonl(file) {
  try { return fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)); } catch { return []; }
}
function num(x) { const n = Number(x); return Number.isFinite(n) ? n : null; }
function ts(row) { return Date.parse(row.timestamp_utc || ''); }
function pct(x, d = 1) { return Number.isFinite(x) ? `${x >= 0 ? '+' : ''}${x.toFixed(d)}%` : 'n/a'; }
function median(vals) {
  const arr = vals.filter(Number.isFinite).sort((a, b) => a - b);
  if (!arr.length) return null;
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
}
function mean(vals) {
  const arr = vals.filter(Number.isFinite);
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
}

function buildPriceIndex(priceRows) {
  const byAsset = Object.fromEntries(ASSETS.map(a => [a, []]));
  for (const row of priceRows) {
    const t = ts(row);
    if (!Number.isFinite(t)) continue;
    for (const asset of ASSETS) {
      const p = num(row.prices?.[asset]?.lastPrice);
      if (Number.isFinite(p)) byAsset[asset].push({ t, price: p });
    }
  }
  for (const rows of Object.values(byAsset)) rows.sort((a, b) => a.t - b.t);
  return byAsset;
}

function priceAtOrAfter(rows, targetMs, maxLagMs = 25 * 60 * 1000) {
  let lo = 0, hi = rows.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (rows[mid].t < targetMs) lo = mid + 1;
    else hi = mid;
  }
  const row = rows[lo];
  if (!row || row.t - targetMs > maxLagMs) return null;
  return row;
}
function pricesBetween(rows, startMs, endMs) {
  return rows.filter(r => r.t >= startMs && r.t <= endMs);
}
function directionReturnPct(direction, entry, future) {
  if (!Number.isFinite(entry) || !Number.isFinite(future)) return null;
  const raw = ((future - entry) / entry) * 100;
  return direction === 'SHORT' ? -raw : raw;
}

function matchesBucket(alert, b) {
  if (alert.asset !== b.asset || alert.type !== b.type) return false;
  const flow = alert.diagnostics?.flow || null;
  if (b.flow && flow !== b.flow) return false;
  if (b.excludeFlow && flow === b.excludeFlow) return false;
  return true;
}

function main() {
  const alerts = readJsonl(ALERTS_PATH);
  const priceRows = readJsonl(PRICE_PATH);
  const priceIndex = buildPriceIndex(priceRows);
  const latestPriceMs = Math.max(...priceRows.map(ts).filter(Number.isFinite));

  const lines = [];
  lines.push('# Clean-candidate redo (type+flow only, frozen-data bug excluded) — 2026-06-20\n');
  lines.push(`Source: ${ALERTS_PATH.split('/').slice(-2).join('/')} matched against ${PRICE_PATH.split('/').slice(-3).join('/')}.`);
  lines.push(`Dedup: per-bucket cooldown ${DEDUP_COOLDOWN_MS / 3600000}h (>= longest horizon measured), so episodes do not share outcome windows.\n`);

  for (const b of BUCKETS) {
    const matched = alerts.filter(a => matchesBucket(a, b)).sort((x, y) => ts(x) - ts(y));
    const episodes = [];
    let lastEmitted = -Infinity;
    for (const a of matched) {
      const t = ts(a);
      if (!Number.isFinite(t)) continue;
      if (t - lastEmitted < DEDUP_COOLDOWN_MS) continue;
      lastEmitted = t;
      episodes.push(a);
    }

    const priceRowsForAsset = priceIndex[b.asset] || [];
    const rows = [];
    for (const a of episodes) {
      const t = ts(a);
      const entry = num(a.diagnostics?.price) ?? priceAtOrAfter(priceRowsForAsset, t)?.price;
      if (!Number.isFinite(entry)) continue;
      const horizons = {};
      for (const h of HORIZONS) {
        const future = priceAtOrAfter(priceRowsForAsset, t + h * 3600000);
        horizons[h] = future ? directionReturnPct(b.direction, entry, future.price) : null;
      }
      const pathEnd = Math.min(t + 6 * 3600000, latestPriceMs);
      const pathRows = pricesBetween(priceRowsForAsset, t, pathEnd);
      let mfe = null, mae = null, tMfe = null, tMae = null;
      for (const p of pathRows) {
        const dr = directionReturnPct(b.direction, entry, p.price);
        if (mfe === null || dr > mfe) { mfe = dr; tMfe = Math.round((p.t - t) / 60000); }
        if (mae === null || dr < mae) { mae = dr; tMae = Math.round((p.t - t) / 60000); }
      }
      rows.push({ timestamp_utc: a.timestamp_utc, horizons, mfe, mae, tMfe, tMae, fully_resolved: pathEnd >= t + 6 * 3600000 });
    }

    lines.push(`## ${b.key}`);
    lines.push(`Matched raw alerts: ${matched.length}. Independent (>=6h-spaced) episodes: ${episodes.length}.`);
    if (!rows.length) {
      lines.push('No rows with resolvable entry price.\n');
      continue;
    }
    lines.push('');
    lines.push('| horizon | n | win % | avg return | median return | mean MFE | mean time-to-MFE | mean MAE (opposite) | mean time-to-MAE |');
    lines.push('|---|---:|---:|---:|---:|---:|---:|---:|---:|');
    for (const h of HORIZONS) {
      const vals = rows.map(r => r.horizons[h]).filter(Number.isFinite);
      const wins = vals.filter(v => v > 0).length;
      const winPct = vals.length ? (wins / vals.length) * 100 : null;
      const avgR = mean(vals);
      const medR = median(vals);
      const mfeVals = rows.filter(r => r.tMfe !== null && r.tMfe <= h * 60).map(r => r.mfe);
      const maeVals = rows.filter(r => r.tMae !== null && r.tMae <= h * 60).map(r => r.mae);
      const tMfeVals = rows.filter(r => r.tMfe !== null && r.tMfe <= h * 60).map(r => r.tMfe);
      const tMaeVals = rows.filter(r => r.tMae !== null && r.tMae <= h * 60).map(r => r.tMae);
      lines.push(`| ${h}h | ${vals.length} | ${winPct === null ? 'n/a' : winPct.toFixed(1) + '%'} | ${pct(avgR, 3)} | ${pct(medR, 3)} | ${pct(mean(mfeVals), 3)} | ${mean(tMfeVals) === null ? 'n/a' : Math.round(mean(tMfeVals)) + 'm'} | ${pct(mean(maeVals), 3)} | ${mean(tMaeVals) === null ? 'n/a' : Math.round(mean(tMaeVals)) + 'm'} |`);
    }
    const unresolved = rows.filter(r => !r.fully_resolved).length;
    lines.push(`\n(${unresolved} of ${rows.length} episodes have not yet reached the full 6h window; their later horizons are excluded from those rows' stats via per-horizon n.)\n`);
  }

  fs.writeFileSync(OUT_PATH, lines.join('\n'));
  process.stdout.write(lines.join('\n'));
  process.stdout.write(`\n\n[written to ${path.relative(ROOT, OUT_PATH)}]\n`);
}

main();
