#!/usr/bin/env node
/*
  Evaluate the predeclared interim bearish regime proxy.

  Rule:
  - BTC 4h return < -0.5% on at least 2 of last 3 rolling 4h windows.
  - Latest BTC gate is not BTC_STRONG_ALT_FOLLOWING.
  - No bullish squeeze in last 8h: at least 2 of BTC/ETH/SOL with
    OI bucket SHORTS_COVERING and 4h price return > +1.0%.

  This is a proxy, not the full regime engine. It should be deprecated when the
  full regime engine is live.
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const PRICE_PATH = path.join(DATA, 'autoresearch', 'price-15m.jsonl');
const SHADOW_PATH = path.join(DATA, 'readiness-shadow.jsonl');
const OUT_PATH = path.join(DATA, 'interim-bearish-proxy-latest.json');
const ASSETS = ['BTC', 'ETH', 'SOL'];

function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, 'utf8').trim();
  if (!raw) return [];
  return raw.split('\n').filter(Boolean).map(line => JSON.parse(line));
}
function ts(row) { return Date.parse(row.timestamp_utc || row.timestamp || ''); }
function num(x) { const n = Number(x); return Number.isFinite(n) ? n : null; }
function arg(name) {
  const i = process.argv.indexOf(name);
  if (i >= 0) return process.argv[i + 1];
  const pref = `${name}=`;
  const found = process.argv.find(a => a.startsWith(pref));
  return found ? found.slice(pref.length) : null;
}
function priceOf(row, asset) {
  return num(row.prices?.[asset]?.lastPrice ?? row.prices?.[asset]?.price ?? row.markets?.[asset]?.price);
}
function nearestAtOrBefore(rows, asset, targetMs, maxAgeMs = 45 * 60 * 1000) {
  let best = null;
  for (const row of rows) {
    const t = ts(row);
    if (!Number.isFinite(t) || t > targetMs) continue;
    const p = priceOf(row, asset);
    if (!Number.isFinite(p)) continue;
    const age = targetMs - t;
    if (age <= maxAgeMs && (!best || age < best.age)) best = { row, t, price: p, age };
  }
  return best;
}
function returnPct(prices, asset, endMs, windowMs) {
  const end = nearestAtOrBefore(prices, asset, endMs);
  const start = nearestAtOrBefore(prices, asset, endMs - windowMs);
  if (!end || !start) return null;
  return ((end.price - start.price) / start.price) * 100;
}
function latestShadowAtOrBefore(shadows, asset, direction, atMs, maxAgeMs = 45 * 60 * 1000) {
  let best = null;
  for (const row of shadows) {
    if (row.asset !== asset || row.direction !== direction) continue;
    const t = ts(row);
    if (!Number.isFinite(t) || t > atMs) continue;
    const age = atMs - t;
    if (age <= maxAgeMs && (!best || age < best.age)) best = { row, t, age };
  }
  return best?.row || null;
}
function latestBtcGate(shadows, atMs) {
  let best = null;
  for (const row of shadows) {
    const t = ts(row);
    if (!Number.isFinite(t) || t > atMs) continue;
    const gate = row.source_metrics?.btc_gate || row.regime?.btc_gate || null;
    if (!gate) continue;
    const age = atMs - t;
    if (age <= 2 * 60 * 60 * 1000 && (!best || age < best.age)) best = { gate, age, timestamp_utc: row.timestamp_utc };
  }
  return best || null;
}
function bullishSqueezeAt(prices, shadows, atMs) {
  const assetChecks = ASSETS.map(asset => {
    const shadow = latestShadowAtOrBefore(shadows, asset, 'LONG', atMs) || latestShadowAtOrBefore(shadows, asset, 'SHORT', atMs);
    const oi = shadow?.source_metrics?.oi_price_regime || null;
    const ret4h = returnPct(prices, asset, atMs, 4 * 60 * 60 * 1000);
    return { asset, oi, ret4h, squeeze_component: oi === 'SHORTS_COVERING' && Number.isFinite(ret4h) && ret4h > 1.0 };
  });
  return { at: new Date(atMs).toISOString(), components: assetChecks, count: assetChecks.filter(a => a.squeeze_component).length };
}
function evaluate({ asOf }) {
  const prices = readJsonl(PRICE_PATH).sort((a, b) => ts(a) - ts(b));
  const shadows = readJsonl(SHADOW_PATH).sort((a, b) => ts(a) - ts(b));
  const latestPriceTs = prices.length ? ts(prices[prices.length - 1]) : NaN;
  const atMs = asOf ? Date.parse(asOf) : latestPriceTs;
  const fourH = 4 * 60 * 60 * 1000;

  const btc4hWindows = [0, 1, 2].map(i => {
    const endMs = atMs - i * fourH;
    return { end: new Date(endMs).toISOString(), return_pct: returnPct(prices, 'BTC', endMs, fourH) };
  });
  const btcWeakCount = btc4hWindows.filter(w => Number.isFinite(w.return_pct) && w.return_pct < -0.5).length;
  const btc4hWeakPass = btcWeakCount >= 2;

  const gate = latestBtcGate(shadows, atMs);
  const btcGatePass = gate ? gate.gate !== 'BTC_STRONG_ALT_FOLLOWING' : false;

  const squeezeChecks = [];
  for (let ms = atMs; ms >= atMs - 8 * 60 * 60 * 1000; ms -= 15 * 60 * 1000) squeezeChecks.push(bullishSqueezeAt(prices, shadows, ms));
  const squeezeHits = squeezeChecks.filter(c => c.count >= 2);
  const noBullishSqueezePass = squeezeHits.length === 0;

  const ok = btc4hWeakPass && btcGatePass && noBullishSqueezePass;
  return {
    generated_at: new Date().toISOString(),
    as_of: new Date(atMs).toISOString(),
    proxy: 'interim_bearish_proxy',
    result: ok,
    conditions: {
      btc_4h_weak_2_of_3: { pass: btc4hWeakPass, weak_count: btcWeakCount, threshold: '< -0.5% on >=2 of last 3 rolling 4h windows', windows: btc4hWindows },
      btc_gate_not_bullish_following: { pass: btcGatePass, latest_gate: gate?.gate || null, gate_timestamp_utc: gate?.timestamp_utc || null, fail_closed_if_missing: true },
      no_bullish_squeeze_last_8h: { pass: noBullishSqueezePass, definition: '>=2 assets with SHORTS_COVERING and 4h price return > +1.0%', hits: squeezeHits.slice(0, 10), hit_count: squeezeHits.length },
    },
    data_sources: { prices: PRICE_PATH, shadows: SHADOW_PATH },
    usage: 'May raise independently validated SHORT bucket to WATCH_REGIME_SPECIFIC_* only; not sufficient for TRADABLE by itself.',
  };
}

const result = evaluate({ asOf: arg('--as-of') });
fs.writeFileSync(OUT_PATH, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
