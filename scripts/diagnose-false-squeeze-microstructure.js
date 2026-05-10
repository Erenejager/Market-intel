#!/usr/bin/env node
/*
  False squeeze microstructure diagnostic.

  Diagnostic only. No alert/readiness/Telegram behavior changes.

  Goal: compare price-only BULLISH_SQUEEZE false-active periods inside manual
  bearish windows against the manual BULLISH_SQUEEZE reference window using
  existing BTC microstructure fields.
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const PRICE_PATH = path.join(DATA, 'autoresearch', 'price-15m.jsonl');
const LABELS_PATH = path.join(DATA, 'regime-labels-manual-v1.json');
const MICRO_PATH = path.join(DATA, 'microstructure-history.jsonl');
const OUT_JSON = path.join(DATA, 'false-squeeze-microstructure-diagnostic.json');
const OUT_MD = path.join(DATA, 'false-squeeze-microstructure-diagnostic.md');

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const SAMPLE_MS = 15 * MIN;
const JOIN_TOLERANCE_MS = 20 * MIN;

function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  const txt = fs.readFileSync(file, 'utf8').trim();
  return txt ? txt.split('\n').filter(Boolean).map(JSON.parse) : [];
}
function ts(r) { return Date.parse(r.timestamp_utc || r.timestamp || ''); }
function num(x) { const n = Number(x); return Number.isFinite(n) ? n : null; }
function avg(vals) { const xs = vals.filter(Number.isFinite); return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null; }
function median(vals) { const xs = vals.filter(Number.isFinite).sort((a, b) => a - b); if (!xs.length) return null; const m = Math.floor(xs.length / 2); return xs.length % 2 ? xs[m] : (xs[m - 1] + xs[m]) / 2; }
function pct01(x, d = 1) { return Number.isFinite(x) ? `${(x * 100).toFixed(d)}%` : 'n/a'; }
function pct(x, d = 3) { return Number.isFinite(x) ? `${x.toFixed(d)}%` : 'n/a'; }
function fmt(x, d = 6) { return Number.isFinite(x) ? Number(x.toFixed(d)) : null; }
function iso(ms) { return new Date(ms).toISOString(); }
function keyCounts(rows, key) { const o = {}; for (const r of rows) { const v = key(r) ?? 'null'; o[v] = (o[v] || 0) + 1; } return o; }
function share(rows, pred) { return rows.length ? rows.filter(pred).length / rows.length : null; }

const prices = readJsonl(PRICE_PATH)
  .map(r => ({ timestamp_utc: r.timestamp_utc, t: ts(r), price: num(r.prices?.BTC?.lastPrice) }))
  .filter(r => Number.isFinite(r.t) && Number.isFinite(r.price))
  .sort((a, b) => a.t - b.t);
const labels = JSON.parse(fs.readFileSync(LABELS_PATH, 'utf8'));
const windows = labels.windows.map(w => ({ ...w, s: Date.parse(w.start), e: Date.parse(w.end) }));
const micro = readJsonl(MICRO_PATH)
  .map(r => ({ ...r, t: ts(r) }))
  .filter(r => Number.isFinite(r.t) && r.markets?.BTC)
  .sort((a, b) => a.t - b.t);

function lowerBound(arr, x) { let lo = 0, hi = arr.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (arr[mid].t < x) lo = mid + 1; else hi = mid; } return lo; }
function priceAtOrBefore(t) { let i = lowerBound(prices, t); if (i >= prices.length || prices[i].t > t) i--; return i >= 0 ? prices[i] : null; }
function microNearest(t) {
  const i = lowerBound(micro, t);
  const cands = [micro[i - 1], micro[i]].filter(Boolean);
  if (!cands.length) return null;
  const best = cands.sort((a, b) => Math.abs(a.t - t) - Math.abs(b.t - t))[0];
  return Math.abs(best.t - t) <= JOIN_TOLERANCE_MS ? best : null;
}
function windowPrices(start, end) { const out = []; let i = lowerBound(prices, start); while (i < prices.length && prices[i].t <= end) out.push(prices[i++]); return out; }
function retPct(t, lookbackMs) { const e = priceAtOrBefore(t), s = priceAtOrBefore(t - lookbackMs); return e && s && s.price ? ((e.price - s.price) / s.price) * 100 : null; }
function sma(t, lookbackMs) { const rows = windowPrices(t - lookbackMs, t); return rows.length ? avg(rows.map(r => r.price)) : null; }
function distFromSmaPct(t, lookbackMs) { const p = priceAtOrBefore(t)?.price; const s = sma(t, lookbackMs); return Number.isFinite(p) && Number.isFinite(s) && s ? ((p - s) / s) * 100 : null; }
function labelAt(t) { return windows.find(w => t >= w.s && t < w.e) || null; }

function extractBtcMicro(m) {
  const b = m?.markets?.BTC;
  if (!b) return null;
  const rates = b.cross_exchange_positioning?.rates || [];
  const fundingRates = rates.map(r => num(r.rate)).filter(Number.isFinite);
  return {
    timestamp_utc: m.timestamp_utc,
    t: m.t,
    price: num(b.backpack?.order_book?.mid),
    positioning: b.cross_exchange_positioning?.classification || null,
    avg_funding_rate: avg(fundingRates),
    funding_positive_count: fundingRates.filter(x => x > 0).length,
    funding_negative_count: fundingRates.filter(x => x < 0).length,
    flow: b.flow_quality?.classification || null,
    flow_consensus_current: b.flow_consensus?.current || null,
    flow_consensus_dominant: b.flow_consensus?.dominant || null,
    flow_confirmed: b.flow_consensus?.confirmed ?? null,
    flow_streak: num(b.flow_consensus?.current_streak),
    oi_regime: b.oi_price_regime?.classification || null,
    oi_change_30m: num(b.oi_price_regime?.oi_change_30m),
    oi_change_4h: num(b.oi_price_regime?.oi_change_4h),
    price_change_from_1h_open: num(b.oi_price_regime?.price_change_from_1h_open),
    cvd_divergence: b.cvd_divergence?.type || null,
    spot_buy_share: num(b.flow_quality?.spot_taker_buy_share),
    futures_buy_share: num(b.flow_quality?.futures_taker_buy_share),
    spot_cvd_notional: num(b.flow_quality?.spot_cvd_notional),
    futures_cvd_notional: num(b.flow_quality?.futures_cvd_notional),
    orderbook_25bps_imbalance: num(b.backpack?.order_book?.depth_bands?.['25bps']?.imbalance),
  };
}

function updateHyst(state, raw, row, entrySamples, exitSamples) {
  if (raw) { state.consecutiveTrue++; state.consecutiveFalse = 0; }
  else { state.consecutiveFalse++; state.consecutiveTrue = 0; }
  if (!state.active && state.consecutiveTrue >= entrySamples) { state.active = true; state.activatedAt = row.t; }
  if (state.active && state.consecutiveFalse >= exitSamples) { state.active = false; state.activatedAt = null; }
}

// Top/representative v1.3 config from candidate evaluation. The diagnostic is about
// whether price-only false squeeze rows have separable microstructure, not whether
// this exact config should be promoted.
const cfg = {
  version: 'v1p3_top_price_squeeze_diagnostic',
  squeeze: 'dist5d_gt_0.25',
  squeezeInvalidator: 'dist5d_lt_0',
  squeezeEntry: 3,
  squeezeExit: 6,
};

const sq = { active: false, consecutiveTrue: 0, consecutiveFalse: 0, activatedAt: null };
const rows = [];
for (const p of prices) {
  const lab = labelAt(p.t);
  if (!lab) continue;
  const dist5d = distFromSmaPct(p.t, 5 * DAY);
  const raw = Number.isFinite(dist5d) && dist5d > 0.25;
  const invalidated = Number.isFinite(dist5d) && dist5d < 0;
  updateHyst(sq, raw && !invalidated, p, cfg.squeezeEntry, cfg.squeezeExit);
  if (sq.active && invalidated) {
    sq.active = false;
    sq.activatedAt = null;
    sq.consecutiveTrue = 0;
    sq.consecutiveFalse = 0;
  }
  const m = extractBtcMicro(microNearest(p.t));
  rows.push({
    timestamp_utc: p.timestamp_utc,
    t: p.t,
    price: p.price,
    manual_label: lab.label,
    manual_parent: lab.parent_regime,
    manual_momentum: lab.momentum_type,
    price_squeeze_active: sq.active,
    price_squeeze_raw: raw,
    features: {
      ret4h: retPct(p.t, 4 * HOUR),
      ret8h: retPct(p.t, 8 * HOUR),
      ret24h: retPct(p.t, 24 * HOUR),
      ret7d: retPct(p.t, 7 * DAY),
      dist5d,
    },
    micro: m,
    micro_join_delta_min: m ? Math.round(Math.abs(m.t - p.t) / MIN) : null,
  });
}

function segs(items, pred) {
  const res = [];
  let cur = null;
  for (const r of items) {
    const yes = pred(r);
    if (yes && !cur) cur = { start: r.t, end: r.t, rows: [r] };
    else if (yes) { cur.end = r.t; cur.rows.push(r); }
    else if (cur) { res.push(cur); cur = null; }
  }
  if (cur) res.push(cur);
  return res.map(s => ({ ...s, duration_min: Math.round((s.end - s.start + SAMPLE_MS) / MIN) }));
}

const realRows = rows.filter(r => r.manual_label === 'BULLISH_SQUEEZE' && r.price_squeeze_active && r.micro);
const falseRows = rows.filter(r => r.manual_parent === 'BEARISH_TREND' && r.price_squeeze_active && r.micro);
const neutralRows = rows.filter(r => r.manual_parent === 'NEUTRAL' && r.price_squeeze_active && r.micro);
const allActiveRows = rows.filter(r => r.price_squeeze_active);
const missingMicroRows = allActiveRows.filter(r => !r.micro);

function summarize(name, xs) {
  return {
    name,
    n_rows: xs.length,
    start: xs.length ? xs[0].timestamp_utc : null,
    end: xs.length ? xs.at(-1).timestamp_utc : null,
    manual_labels: keyCounts(xs, r => r.manual_label),
    positioning: keyCounts(xs, r => r.micro?.positioning),
    oi_regime: keyCounts(xs, r => r.micro?.oi_regime),
    flow: keyCounts(xs, r => r.micro?.flow),
    cvd_divergence: keyCounts(xs, r => r.micro?.cvd_divergence),
    funding_positive_share: share(xs, r => (r.micro?.avg_funding_rate ?? 0) > 0),
    avg_funding_rate: fmt(avg(xs.map(r => r.micro?.avg_funding_rate))),
    median_funding_rate: fmt(median(xs.map(r => r.micro?.avg_funding_rate))),
    oi_4h_positive_share: share(xs, r => (r.micro?.oi_change_4h ?? 0) > 0),
    oi_4h_negative_share: share(xs, r => (r.micro?.oi_change_4h ?? 0) < 0),
    avg_oi_change_4h: fmt(avg(xs.map(r => r.micro?.oi_change_4h))),
    median_oi_change_4h: fmt(median(xs.map(r => r.micro?.oi_change_4h))),
    avg_oi_change_30m: fmt(avg(xs.map(r => r.micro?.oi_change_30m))),
    median_oi_change_30m: fmt(median(xs.map(r => r.micro?.oi_change_30m))),
    avg_spot_buy_share: fmt(avg(xs.map(r => r.micro?.spot_buy_share)), 4),
    avg_futures_buy_share: fmt(avg(xs.map(r => r.micro?.futures_buy_share)), 4),
    avg_ob_25bps_imbalance: fmt(avg(xs.map(r => r.micro?.orderbook_25bps_imbalance)), 4),
    avg_ret4h_pct: fmt(avg(xs.map(r => r.features.ret4h)), 3),
    avg_dist5d_pct: fmt(avg(xs.map(r => r.features.dist5d)), 3),
  };
}

const realSegments = segs(rows, r => r.manual_label === 'BULLISH_SQUEEZE' && r.price_squeeze_active);
const falseSegments = segs(rows, r => r.manual_parent === 'BEARISH_TREND' && r.price_squeeze_active);

function segmentSummary(s) {
  const xs = s.rows.filter(r => r.micro);
  const sm = summarize('segment', xs);
  return {
    start: iso(s.start),
    end: iso(s.end),
    duration_min: s.duration_min,
    n_rows: s.rows.length,
    micro_rows: xs.length,
    manual_labels: sm.manual_labels,
    positioning: sm.positioning,
    oi_regime: sm.oi_regime,
    flow: sm.flow,
    avg_funding_rate: sm.avg_funding_rate,
    avg_oi_change_4h: sm.avg_oi_change_4h,
    oi_4h_positive_share: sm.oi_4h_positive_share,
    avg_ret4h_pct: sm.avg_ret4h_pct,
    avg_dist5d_pct: sm.avg_dist5d_pct,
  };
}

const result = {
  generated_at: new Date().toISOString(),
  diagnostic: 'false_price_squeeze_microstructure_v1',
  config: cfg,
  inputs: {
    prices: path.relative(ROOT, PRICE_PATH),
    labels: path.relative(ROOT, LABELS_PATH),
    microstructure: path.relative(ROOT, MICRO_PATH),
    join_tolerance_min: JOIN_TOLERANCE_MS / MIN,
  },
  coverage: {
    rows_total_labeled: rows.length,
    price_squeeze_active_rows: allActiveRows.length,
    active_rows_missing_micro: missingMicroRows.length,
    real_squeeze_active_micro_rows: realRows.length,
    false_bearish_active_micro_rows: falseRows.length,
    neutral_active_micro_rows: neutralRows.length,
  },
  summaries: {
    real_squeeze_window: summarize('real_squeeze_window', realRows),
    false_inside_bearish_windows: summarize('false_inside_bearish_windows', falseRows),
    neutral_active_windows: summarize('neutral_active_windows', neutralRows),
  },
  segments: {
    real: realSegments.map(segmentSummary),
    false_bearish: falseSegments.map(segmentSummary),
  },
};

function mdTableSegment(rows) {
  if (!rows.length) return ['_none_'];
  const lines = ['| start | duration | labels | positioning | oi regime | flow | avg funding | avg OI 4h | OI4h+ | avg ret4h | avg dist5d |', '| --- | ---: | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: |'];
  for (const s of rows) {
    lines.push(`| ${s.start} | ${s.duration_min}m | ${JSON.stringify(s.manual_labels)} | ${JSON.stringify(s.positioning)} | ${JSON.stringify(s.oi_regime)} | ${JSON.stringify(s.flow)} | ${fmt(s.avg_funding_rate, 8)} | ${fmt(s.avg_oi_change_4h, 6)} | ${pct01(s.oi_4h_positive_share)} | ${pct(s.avg_ret4h_pct)} | ${pct(s.avg_dist5d_pct)} |`);
  }
  return lines;
}

function mdSummary(s) {
  return [
    `- rows: ${s.n_rows}`,
    `- positioning: \`${JSON.stringify(s.positioning)}\``,
    `- OI regime: \`${JSON.stringify(s.oi_regime)}\``,
    `- flow: \`${JSON.stringify(s.flow)}\``,
    `- avg funding: ${fmt(s.avg_funding_rate, 8)}; median funding: ${fmt(s.median_funding_rate, 8)}; positive share: ${pct01(s.funding_positive_share)}`,
    `- avg OI 4h: ${fmt(s.avg_oi_change_4h, 6)}; median OI 4h: ${fmt(s.median_oi_change_4h, 6)}; OI4h positive share: ${pct01(s.oi_4h_positive_share)}; negative share: ${pct01(s.oi_4h_negative_share)}`,
    `- avg spot/futures buy share: ${fmt(s.avg_spot_buy_share, 4)} / ${fmt(s.avg_futures_buy_share, 4)}`,
  ];
}

function buildMd() {
  const real = result.summaries.real_squeeze_window;
  const fals = result.summaries.false_inside_bearish_windows;
  const lines = [];
  lines.push('# False Price-Squeeze Microstructure Diagnostic', '', `Generated: ${result.generated_at}`, '');
  lines.push('## Scope', '', '- Diagnostic only; no alert/readiness/Telegram behavior changes.', '- Uses representative top v1.3 price-only squeeze config: `dist5d_gt_0.25`, entry 3, exit 6, invalidator `dist5d_lt_0`.', '- Joins active price-squeeze rows to nearest BTC microstructure row within 20 minutes.', '');
  lines.push('## Coverage', '', '```json', JSON.stringify(result.coverage, null, 2), '```', '');
  lines.push('## Real/manual BULLISH_SQUEEZE active rows', '', ...mdSummary(real), '');
  lines.push('## False active rows inside manual BEARISH_TREND', '', ...mdSummary(fals), '');
  lines.push('## Segment detail — real squeeze', '', ...mdTableSegment(result.segments.real), '');
  lines.push('## Segment detail — false bearish squeeze', '', ...mdTableSegment(result.segments.false_bearish), '');

  const realOiNeg = real.oi_4h_negative_share || 0;
  const falseOiPos = fals.oi_4h_positive_share || 0;
  const realShortCovering = (real.oi_regime.SHORTS_COVERING || 0) / Math.max(1, real.n_rows);
  const falseFreshShorts = (fals.oi_regime.FRESH_SHORTS || 0) / Math.max(1, fals.n_rows);
  lines.push('## Preliminary interpretation', '');
  if (!real.n_rows || !fals.n_rows) {
    lines.push('- Insufficient joined rows to compare real vs false squeeze robustly. Keep `UNKNOWN_SQUEEZE_RISK` until more data exists.');
  } else {
    lines.push(`- Real squeeze rows show OI4h negative share ${pct01(realOiNeg)} and SHORTS_COVERING share ${pct01(realShortCovering)}.`);
    lines.push(`- False bearish squeeze rows show OI4h positive share ${pct01(falseOiPos)} and FRESH_SHORTS share ${pct01(falseFreshShorts)}.`);
    if (realOiNeg >= 0.6 && falseOiPos >= 0.6 && realShortCovering >= 0.5 && falseFreshShorts >= 0.5) {
      lines.push('- Microstructure separates the cases in this sample: real squeeze looks like OI contraction / SHORTS_COVERING, while false bearish squeeze looks like OI expansion / FRESH_SHORTS. Candidate proxy can be preregistered, not grid-searched.');
    } else {
      lines.push('- OI/funding separation is not clean enough in this sample. Keep squeeze as `UNKNOWN_SQUEEZE_RISK`; do not create a hard squeeze classifier from price-adjacent fields.');
    }
  }
  lines.push('', '## Suggested next step', '', '- If separation is clean: write a small preregistered microstructure squeeze proxy decision note before testing/wiring.', '- If separation is not clean: leave `squeeze_risk: UNKNOWN_SQUEEZE_RISK` permanently for now and continue bearish-only shadow logging.', '');
  return lines.join('\n');
}

fs.writeFileSync(OUT_JSON, JSON.stringify(result, null, 2) + '\n');
fs.writeFileSync(OUT_MD, buildMd() + '\n');
console.log(`Wrote ${path.relative(ROOT, OUT_JSON)}`);
console.log(`Wrote ${path.relative(ROOT, OUT_MD)}`);
console.log(JSON.stringify({ coverage: result.coverage, real: result.summaries.real_squeeze_window, false: result.summaries.false_inside_bearish_windows }, null, 2));
