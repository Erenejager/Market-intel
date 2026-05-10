#!/usr/bin/env node
/*
  BTC/ETH/SOL SHORT outcome analysis by BTC regime.

  Tags each SHORT_CONFIRMED HIGH alert with the BTC price regime at alert time,
  then shows 30m/1h/2h/4h/24h win rates grouped by:
    1. detailed regime label
    2. parent_regime (BEARISH_TREND / NEUTRAL / BULLISH_TREND)
    3. momentum_type (ACCELERATION / GRIND / CONTINUATION / etc.)

  Regime source: data/regime-labels-manual-v1.json (BTC_PRICE_ONLY, manual v1)

  Usage:
    node scripts/analyze-shorts-by-regime.js
    node scripts/analyze-shorts-by-regime.js --asset BTC
    node scripts/analyze-shorts-by-regime.js --asset ETH
    node scripts/analyze-shorts-by-regime.js --asset SOL
*/

const fs = require('fs');
const path = require('path');

const ROOT   = path.join(__dirname, '..');
const DATA   = path.join(ROOT, 'data');
const ALERTS_PATH  = path.join(DATA, 'phase1d-alerts.jsonl');
const PRICE_PATH   = path.join(DATA, 'autoresearch', 'price-15m.jsonl');
const REGIME_PATH  = path.join(DATA, 'regime-labels-manual-v1.json');

const HORIZONS = [
  ['30m',  30 * 60 * 1000],
  ['1h',    1 * 60 * 60 * 1000],
  ['2h',    2 * 60 * 60 * 1000],
  ['4h',    4 * 60 * 60 * 1000],
  ['24h',  24 * 60 * 60 * 1000],
];
const PRICE_TOL = 20 * 60 * 1000;

// ── helpers ──────────────────────────────────────────────────────────────────

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

function shortReturn(entry, future) {
  if (!Number.isFinite(entry) || !Number.isFinite(future)) return null;
  return ((entry - future) / entry) * 100;
}

function regimeAt(windows, alertMs) {
  for (const w of windows) {
    const s = Date.parse(w.start);
    const e = Date.parse(w.end);
    if (alertMs >= s && alertMs < e) return w;
  }
  return null;
}

// ── stats ────────────────────────────────────────────────────────────────────

function statGroup(rows) {
  const out = {};
  for (const [label] of HORIZONS) {
    const rets = rows.map(r => r.horizons[label]);
    const clean = rets.filter(Number.isFinite);
    const wins = clean.filter(r => r > 0).length;
    out[label] = {
      n: clean.length,
      wins,
      win_rate: clean.length ? wins / clean.length : null,
      avg: clean.length ? clean.reduce((a, b) => a + b, 0) / clean.length : null,
    };
  }
  return out;
}

// ── formatting ───────────────────────────────────────────────────────────────

function pct(x) { return Number.isFinite(x) ? `${(x * 100).toFixed(1)}%` : 'n/a'; }
function ret(x) {
  if (!Number.isFinite(x)) return 'n/a';
  return `${x >= 0 ? '+' : ''}${x.toFixed(3)}%`;
}

function printGroupTable(groupMap, groupLabel) {
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`By ${groupLabel}:`);
  console.log(`\n  ${'group'.padEnd(28)} ${'n'.padStart(4)}  ${'30m'.padStart(6)}  ${'1h'.padStart(6)}  ${'2h'.padStart(6)}  ${'4h'.padStart(6)}  ${'24h'.padStart(6)}  ${'24h avg'.padStart(9)}`);
  console.log(`  ${'-'.repeat(28)} ${'-'.repeat(4)}  ${'-'.repeat(6)}  ${'-'.repeat(6)}  ${'-'.repeat(6)}  ${'-'.repeat(6)}  ${'-'.repeat(6)}  ${'-'.repeat(9)}`);

  for (const [key, rows] of Object.entries(groupMap).sort()) {
    const s = statGroup(rows);
    const tag = rows.length < 6 ? ' ⚠' : '';
    console.log(
      `  ${(key + tag).padEnd(28)} ${String(rows.length).padStart(4)}  ` +
      `${pct(s['30m'].win_rate).padStart(6)}  ${pct(s['1h'].win_rate).padStart(6)}  ` +
      `${pct(s['2h'].win_rate).padStart(6)}  ${pct(s['4h'].win_rate).padStart(6)}  ` +
      `${pct(s['24h'].win_rate).padStart(6)}  ${ret(s['24h'].avg).padStart(9)}`
    );
  }
}

function printRawRows(rows) {
  console.log(`\n  ${'timestamp'.padEnd(20)} ${'asset'.padEnd(5)} ${'regime'.padEnd(24)} ${'parent'.padEnd(14)} ${'momentum'.padEnd(14)} ${'30m'.padStart(7)} ${'1h'.padStart(7)} ${'2h'.padStart(7)} ${'4h'.padStart(7)} ${'24h'.padStart(8)}`);
  for (const r of rows) {
    const h = r.horizons;
    console.log(
      `  ${r.timestamp_utc.slice(0,19).padEnd(20)} ${r.asset.padEnd(5)} ${r.regime_label.padEnd(24)} ${r.parent_regime.padEnd(14)} ${r.momentum_type.padEnd(14)} ` +
      `${ret(h['30m']).padStart(7)} ${ret(h['1h']).padStart(7)} ${ret(h['2h']).padStart(7)} ${ret(h['4h']).padStart(7)} ${ret(h['24h']).padStart(8)}`
    );
  }
}

// ── core ─────────────────────────────────────────────────────────────────────

function buildRows(alerts, prices, regimeWindows, assetFilter) {
  return alerts
    .filter(a =>
      a.type === 'SHORT_CONFIRMED' &&
      a.severity === 'HIGH' &&
      (!assetFilter || a.asset === assetFilter)
    )
    .sort((a, b) => ts(a) - ts(b))
    .map(alert => {
      const t0    = ts(alert);
      const d     = alert.diagnostics || {};
      const entry = num(d.price);
      const regime = regimeAt(regimeWindows, t0);

      const horizons = {};
      for (const [label, ms] of HORIZONS) {
        const fp = priceAt(prices, alert.asset, t0 + ms);
        horizons[label] = shortReturn(entry, fp);
      }

      return {
        timestamp_utc: alert.timestamp_utc,
        asset: alert.asset,
        entry_price: entry,
        regime_label:   regime?.label        ?? 'UNCLASSIFIED',
        parent_regime:  regime?.parent_regime ?? 'UNCLASSIFIED',
        momentum_type:  regime?.momentum_type ?? 'UNCLASSIFIED',
        confidence:     regime?.confidence    ?? 'UNKNOWN',
        horizons,
      };
    })
    .filter(r => r.entry_price !== null);
}

function groupBy(rows, key) {
  const map = {};
  for (const r of rows) {
    const k = r[key];
    if (!map[k]) map[k] = [];
    map[k].push(r);
  }
  return map;
}

// ── main ─────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const assetIdx = args.indexOf('--asset');
  const assetFilter = assetIdx >= 0 ? args[assetIdx + 1] : null;

  const alerts  = readJsonl(ALERTS_PATH);
  const prices  = readJsonl(PRICE_PATH).sort((a, b) => ts(a) - ts(b));
  const regimes = JSON.parse(fs.readFileSync(REGIME_PATH, 'utf8'));
  const windows = regimes.windows;

  const assetLabel = assetFilter ?? 'BTC+ETH+SOL';
  const rows = buildRows(alerts, prices, windows, assetFilter);

  console.log(`\n${'='.repeat(80)}`);
  console.log(`SHORT outcome analysis by BTC regime (${assetLabel})`);
  console.log(`Regime basis: ${regimes._meta.version} — ${regimes._meta.basis}`);
  console.log(`Total SHORT_CONFIRMED HIGH rows: ${rows.length}`);
  console.log(`⚠ = n<6 (observation only)`);
  console.log('='.repeat(80));

  // summary: all assets combined by parent_regime
  printGroupTable(groupBy(rows, 'parent_regime'), 'parent_regime (all assets)');

  // summary: all assets combined by momentum_type
  printGroupTable(groupBy(rows, 'momentum_type'), 'momentum_type (all assets)');

  // per-asset breakdown by parent_regime
  for (const asset of ['BTC', 'ETH', 'SOL']) {
    const assetRows = rows.filter(r => r.asset === asset);
    if (!assetRows.length) continue;
    printGroupTable(groupBy(assetRows, 'parent_regime'), `parent_regime — ${asset} only (n=${assetRows.length})`);
  }

  // per-asset by momentum_type
  for (const asset of ['BTC', 'ETH', 'SOL']) {
    const assetRows = rows.filter(r => r.asset === asset);
    if (!assetRows.length) continue;
    printGroupTable(groupBy(assetRows, 'momentum_type'), `momentum_type — ${asset} only (n=${assetRows.length})`);
  }

  // detailed label breakdown (all assets)
  printGroupTable(groupBy(rows, 'regime_label'), 'detailed label (all assets)');

  // raw rows
  console.log(`\n${'─'.repeat(80)}`);
  console.log('Raw rows:');
  printRawRows(rows);
}

main();
