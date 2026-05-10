#!/usr/bin/env node
/*
  Bearish-only regime shadow writer v1.

  Writes current BTC price-only bearish regime context for forward observation.
  Does NOT affect alerts, Telegram, readiness scores, routing, or active contexts.

  Output:
  - data/regime-current.json
  - data/regime-history.jsonl (append latest sample if timestamp is new)

  Version: regime_engine_bearish_shadow_v1
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const PRICE_PATH = path.join(DATA, 'autoresearch', 'price-15m.jsonl');
const CURRENT_OUT = path.join(DATA, 'regime-current.json');
const HISTORY_OUT = path.join(DATA, 'regime-history.jsonl');

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const VERSION = 'regime_engine_bearish_shadow_v1';
const SAMPLE_MS = 15 * MIN;

function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  const txt = fs.readFileSync(file, 'utf8').trim();
  return txt ? txt.split('\n').filter(Boolean).map(JSON.parse) : [];
}
function ts(r) { return Date.parse(r.timestamp_utc || r.timestamp || ''); }
function num(x) { const n = Number(x); return Number.isFinite(n) ? n : null; }
function iso(ms) { return new Date(ms).toISOString(); }
function round(x, d = 6) { return Number.isFinite(x) ? Number(x.toFixed(d)) : null; }

const prices = readJsonl(PRICE_PATH)
  .map(r => ({ timestamp_utc: r.timestamp_utc, t: ts(r), price: num(r.prices?.BTC?.lastPrice) }))
  .filter(r => Number.isFinite(r.t) && Number.isFinite(r.price))
  .sort((a, b) => a.t - b.t);

function lowerBound(arr, x) { let lo = 0, hi = arr.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (arr[mid].t < x) lo = mid + 1; else hi = mid; } return lo; }
function priceAtOrBefore(t) {
  let i = lowerBound(prices, t);
  if (i >= prices.length || prices[i].t > t) i--;
  return i >= 0 ? prices[i] : null;
}
function retPct(t, lookbackMs) {
  const end = priceAtOrBefore(t);
  const start = priceAtOrBefore(t - lookbackMs);
  if (!end || !start || start.price === 0) return null;
  return ((end.price - start.price) / start.price) * 100;
}

function computeSeries() {
  const state = { active: false, consecutiveTrue: 0, consecutiveFalse: 0, activatedAt: null };
  const out = [];
  for (const r of prices) {
    const ret7d = retPct(r.t, 7 * DAY);
    const rawBearish = Number.isFinite(ret7d) && ret7d < -1;

    if (rawBearish) {
      state.consecutiveTrue += 1;
      state.consecutiveFalse = 0;
    } else {
      state.consecutiveFalse += 1;
      state.consecutiveTrue = 0;
    }

    // Best v1.3-style stable bearish base: ret7d < -1%, entry 4 samples, exit 6 samples.
    if (!state.active && state.consecutiveTrue >= 4) {
      state.active = true;
      state.activatedAt = r.t;
    }
    if (state.active && state.consecutiveFalse >= 6) {
      state.active = false;
      state.activatedAt = null;
    }

    out.push({
      version: VERSION,
      timestamp_utc: r.timestamp_utc,
      generated_at: new Date().toISOString(),
      asset_anchor: 'BTC',
      state: state.active ? 'BEARISH_TREND' : 'NEUTRAL',
      parent_regime: state.active ? 'BEARISH_TREND' : 'NEUTRAL',
      confidence: state.active ? 'MEDIUM' : 'LOW',
      rule: {
        basis: 'BTC_PRICE_ONLY',
        bearish_raw_condition: 'BTC rolling 7d return < -1%',
        entry_samples: 4,
        exit_samples: 6,
        cadence_hint: '15m price samples',
      },
      features: {
        btc_price: round(r.price, 3),
        btc_ret_7d_pct: round(ret7d, 3),
        raw_bearish: rawBearish,
        consecutive_true: state.consecutiveTrue,
        consecutive_false: state.consecutiveFalse,
        active_since: state.activatedAt ? iso(state.activatedAt) : null,
      },
      squeeze_risk: {
        state: 'UNKNOWN_SQUEEZE_RISK',
        reason: 'price_only_squeeze_detection_failed_v1_to_v1p3',
      },
      flush_risk: {
        state: 'UNKNOWN_FLUSH_RISK',
        reason: 'low_n_mechanism_candidate_not_production_ready',
      },
      changes_alert_behavior: false,
      note: 'Shadow/logging only. Does not affect alerts, Telegram, active contexts, readiness scores, or routing.',
    });
  }
  return out;
}

function appendIfNew(row) {
  const history = readJsonl(HISTORY_OUT);
  const last = history.at(-1);
  if (last?.timestamp_utc === row.timestamp_utc && last?.version === row.version) {
    return { appended: false, reason: 'latest_timestamp_already_recorded' };
  }
  fs.mkdirSync(path.dirname(HISTORY_OUT), { recursive: true });
  fs.appendFileSync(HISTORY_OUT, JSON.stringify(row) + '\n');
  return { appended: true };
}

function main() {
  if (!prices.length) throw new Error(`No BTC price rows found at ${PRICE_PATH}`);
  const series = computeSeries();
  const latest = series.at(-1);
  fs.writeFileSync(CURRENT_OUT, JSON.stringify(latest, null, 2) + '\n');
  const append = appendIfNew(latest);
  console.log(JSON.stringify({ ok: true, current: path.relative(ROOT, CURRENT_OUT), history: path.relative(ROOT, HISTORY_OUT), latest: { timestamp_utc: latest.timestamp_utc, state: latest.state, ret7d: latest.features.btc_ret_7d_pct, version: latest.version }, append }, null, 2));
}

main();
