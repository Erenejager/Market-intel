#!/usr/bin/env node
/*
  Backfill outcome_1h_pct / outcome_4h_pct / outcome_24h_pct on data/llm-review-log.jsonl.

  The LLM reviewer (scripts/llm-review-alert.js) has been logging directional
  verdicts since 2026-06-08 with these fields pre-allocated but never filled —
  there was no evaluation loop. This reuses the same entry/horizon-return
  pattern as scripts/build-trade-quality-report.js (priceAtOrAfter + directionReturnPct)
  against data/autoresearch/price-15m.jsonl.

  Entry price is sampled at alert_timestamp_utc (the original alert, not the
  later review timestamp), matching the price the alert/review were actually about.
  Run on a cron (or manually) — only fills rows that are missing and have a
  future price sample available; rows newer than a horizon stay null until they age in.
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LOG_PATH = path.join(ROOT, 'data', 'llm-review-log.jsonl');
const PRICE_PATH = path.join(ROOT, 'data', 'autoresearch', 'price-15m.jsonl');
const ASSETS = ['BTC', 'ETH', 'SOL'];
const HORIZONS = { outcome_1h_pct: 1, outcome_4h_pct: 4, outcome_24h_pct: 24 };
const MAX_LAG_MS = 25 * 60 * 1000;

function readJsonl(file) {
  try { return fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(line => JSON.parse(line)); } catch { return []; }
}
function num(x) { const n = Number(x); return Number.isFinite(n) ? n : null; }
function ts(row) { return Date.parse(row.timestamp_utc || ''); }

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

function priceAtOrAfter(rows, targetMs, maxLagMs = MAX_LAG_MS) {
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

function directionReturnPct(direction, entry, future) {
  if (!Number.isFinite(entry) || !Number.isFinite(future)) return null;
  const raw = ((future - entry) / entry) * 100;
  return direction === 'SHORT' ? -raw : raw;
}

function main() {
  const rows = readJsonl(LOG_PATH);
  const priceRows = readJsonl(PRICE_PATH);
  const priceIndex = buildPriceIndex(priceRows);
  let filled = 0;
  let skippedNoEntry = 0;
  let skippedNoFuture = 0;

  for (const row of rows) {
    if (!ASSETS.includes(row.asset) || !['LONG', 'SHORT'].includes(row.direction)) continue;
    const anchorMs = Date.parse(row.alert_timestamp_utc || row.timestamp_utc || '');
    if (!Number.isFinite(anchorMs)) continue;
    const priceRowsForAsset = priceIndex[row.asset] || [];
    const entry = priceAtOrAfter(priceRowsForAsset, anchorMs)?.price;
    if (!Number.isFinite(entry)) { skippedNoEntry += 1; continue; }

    for (const [field, hours] of Object.entries(HORIZONS)) {
      if (row[field] !== null && row[field] !== undefined) continue;
      const future = priceAtOrAfter(priceRowsForAsset, anchorMs + hours * 60 * 60 * 1000);
      if (!future) { skippedNoFuture += 1; continue; }
      row[field] = directionReturnPct(row.direction, entry, future.price);
      filled += 1;
    }
  }

  fs.writeFileSync(LOG_PATH, rows.map(r => JSON.stringify(r)).join('\n') + '\n');
  process.stdout.write(JSON.stringify({ ok: true, rows: rows.length, fields_filled: filled, skipped_no_entry_price: skippedNoEntry, skipped_no_future_price: skippedNoFuture }, null, 2) + '\n');
}

main();
