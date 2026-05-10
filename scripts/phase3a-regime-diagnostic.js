#!/usr/bin/env node
/*
  Phase 3A pre-registered regime/path diagnostic.

  Historical window is diagnostic only. Any readiness_shadow_v1 formula/spec derived from
  this report must be frozen before forward validation; do not claim validation on this sample.

  Pre-registered BTC regime candidates from price-15m.jsonl:
  1) BTC 4h return <= -1% / <= -2%
  2) BTC 24h return <= -2% / <= -4%
  3) Consecutive fully closed UTC-anchored down 4h candles >= 2

  LONG eligibility criteria for v1 consideration:
  - win-rate separation >= 15pp at 1h or 4h, OR
  - bearish mean directional return <= -0.30% while non-bearish >= 0.00%, OR
  - bearish avg MAE at least 0.30pp worse than non-bearish.

  Blocked SHORT path criteria:
  - favorable target +0.30% before adverse stop -0.30% within 4h using 15m close samples;
  - bearish favorable-first >=70% and non-bearish <=55%, OR bearish exceeds non-bearish by >=20pp;
  - bearish avg MFE - abs(MAE) >= +0.15pp and >=0.20pp better than non-bearish;
  - bearish median time-to-target <=60m.

  Caveats:
  - bucket n is reported; small buckets are low-confidence even if thresholds pass.
  - 15m close resolution misses intra-candle excursions, likely overstating favorable-first rates.
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const ALERTS = path.join(DATA, 'phase1d-alerts.jsonl');
const STATE = path.join(DATA, 'phase1d-alert-state.json');
const PRICE = path.join(DATA, 'autoresearch', 'price-15m.jsonl');
const OUT_JSON = path.join(DATA, 'phase3a-regime-diagnostic.json');
const OUT_MD = path.join(DATA, 'phase3a-regime-diagnostic.md');

const START = Date.parse('2026-05-09T00:00:00Z');
const END = Date.parse('2026-05-21T23:59:59Z');
const TARGET = 0.30;
const STOP = -0.30;

function readJsonl(file) {
  return fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
}
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function t(row) { return Date.parse(row.timestamp_utc || row.timestamp || ''); }
function num(x) { const v = Number(x); return Number.isFinite(v) ? v : null; }
function pct(x, d = 3) { return Number.isFinite(x) ? `${x.toFixed(d)}%` : 'n/a'; }
function pp(x, d = 1) { return Number.isFinite(x) ? `${x.toFixed(d)}pp` : 'n/a'; }
function ratio(x) { return Number.isFinite(x) ? `${(x * 100).toFixed(1)}%` : 'n/a'; }
function iso(ms) { return new Date(ms).toISOString(); }
function median(vals) {
  if (!vals.length) return null;
  const s = vals.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function avg(vals) { return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null; }
function dirForType(type) {
  if (type === 'LONG_CONFIRMED') return 'LONG';
  if (type === 'SHORT_CONFIRMED') return 'SHORT';
  return null;
}
function dirRet(direction, entry, future) {
  if (!Number.isFinite(entry) || !Number.isFinite(future)) return null;
  const raw = ((future - entry) / entry) * 100;
  return direction === 'SHORT' ? -raw : raw;
}

const priceRows = readJsonl(PRICE).map(r => ({ ...r, _t: t(r) })).filter(r => Number.isFinite(r._t)).sort((a, b) => a._t - b._t);
const priceTimes = priceRows.map(r => r._t);
function lowerBound(arr, x) { let lo = 0, hi = arr.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (arr[mid] < x) lo = mid + 1; else hi = mid; } return lo; }
function priceAtOrAfter(asset, ms) {
  let i = lowerBound(priceTimes, ms);
  while (i < priceRows.length) {
    const p = num(priceRows[i].prices?.[asset]?.lastPrice);
    if (p !== null) return { price: p, t: priceRows[i]._t, timestamp_utc: priceRows[i].timestamp_utc };
    i++;
  }
  return null;
}
function priceAtOrBefore(asset, ms) {
  let i = lowerBound(priceTimes, ms);
  if (i >= priceRows.length || priceRows[i]._t > ms) i--;
  while (i >= 0) {
    const p = num(priceRows[i].prices?.[asset]?.lastPrice);
    if (p !== null) return { price: p, t: priceRows[i]._t, timestamp_utc: priceRows[i].timestamp_utc };
    i--;
  }
  return null;
}
function priceWindow(asset, start, end) {
  const out = [];
  let i = lowerBound(priceTimes, start);
  while (i < priceRows.length && priceRows[i]._t <= end) {
    const p = num(priceRows[i].prices?.[asset]?.lastPrice);
    if (p !== null) out.push({ price: p, t: priceRows[i]._t, timestamp_utc: priceRows[i].timestamp_utc });
    i++;
  }
  return out;
}
function pctChange(asset, endMs, lookbackMs) {
  const end = priceAtOrBefore(asset, endMs);
  const start = priceAtOrBefore(asset, endMs - lookbackMs);
  if (!end || !start) return null;
  return ((end.price - start.price) / start.price) * 100;
}
function closed4hBucket(ms) { return Math.floor(ms / (4 * 60 * 60 * 1000)) * 4 * 60 * 60 * 1000; }
function fourHourCandlesBefore(asset, alertMs, count = 8) {
  const currentBucket = closed4hBucket(alertMs);
  const candles = [];
  for (let end = currentBucket; candles.length < count && end > priceTimes[0]; end -= 4 * 60 * 60 * 1000) {
    const start = end - 4 * 60 * 60 * 1000;
    const samples = priceWindow(asset, start, end - 1);
    if (!samples.length) break;
    candles.push({ start, end, open: samples[0].price, close: samples[samples.length - 1].price, down: samples[samples.length - 1].price < samples[0].price });
  }
  return candles;
}
function down4hStreakBefore(alertMs) {
  const candles = fourHourCandlesBefore('BTC', alertMs, 8);
  let streak = 0;
  for (const c of candles) {
    if (c.down) streak++;
    else break;
  }
  return streak;
}
function btcRegimeMetrics(ms) {
  const ret4h = pctChange('BTC', ms, 4 * 60 * 60 * 1000);
  const ret24h = pctChange('BTC', ms, 24 * 60 * 60 * 1000);
  const down4h = down4hStreakBefore(ms);
  return {
    btc_return_4h_pct: ret4h,
    btc_return_24h_pct: ret24h,
    btc_down_4h_closed_streak: down4h,
    btc4h_le_m1: ret4h !== null && ret4h <= -1,
    btc4h_le_m2: ret4h !== null && ret4h <= -2,
    btc24h_le_m2: ret24h !== null && ret24h <= -2,
    btc24h_le_m4: ret24h !== null && ret24h <= -4,
    btc_down4h_ge2: down4h >= 2,
  };
}
const METRICS = [
  { key: 'btc4h_le_m1', label: 'BTC 4h return <= -1%' },
  { key: 'btc4h_le_m2', label: 'BTC 4h return <= -2%' },
  { key: 'btc24h_le_m2', label: 'BTC 24h return <= -2%' },
  { key: 'btc24h_le_m4', label: 'BTC 24h return <= -4%' },
  { key: 'btc_down4h_ge2', label: 'BTC closed 4h down streak >= 2' },
];

const state = readJson(STATE);
const allowedKey = new Set((state.active_context_gate_stats?.allowed_events || []).map(e => `${e.timestamp_utc}:${e.asset}:${e.type}`));
const allowedEvents = (state.active_context_gate_stats?.allowed_events || []).filter(e => Date.parse(e.timestamp_utc) >= START && Date.parse(e.timestamp_utc) <= END);
const alerts = readJsonl(ALERTS).filter(a => Number.isFinite(t(a)) && t(a) >= START && t(a) <= END);

function rowFromAlert(a, source = 'alert') {
  const direction = dirForType(a.type);
  if (!direction) return null;
  const ms = t(a);
  const asset = a.asset;
  const entry = num(a.diagnostics?.price) ?? priceAtOrAfter(asset, ms)?.price;
  if (!Number.isFinite(entry)) return null;
  const p1 = priceAtOrAfter(asset, ms + 60 * 60 * 1000);
  const p4 = priceAtOrAfter(asset, ms + 4 * 60 * 60 * 1000);
  const win = priceWindow(asset, ms, ms + 4 * 60 * 60 * 1000);
  const dvals = win.map(x => dirRet(direction, entry, x.price)).filter(Number.isFinite);
  const metrics = btcRegimeMetrics(ms);
  const readiness = a.readiness_shadow || null;
  const score = num(readiness?.effective_score ?? readiness?.score);
  return {
    source,
    timestamp_utc: a.timestamp_utc,
    t: ms,
    asset,
    type: a.type,
    direction,
    entry_price: entry,
    gate_allowed: allowedKey.has(`${a.timestamp_utc}:${a.asset}:${a.type}`),
    score,
    shadow_state: readiness?.state || null,
    r1h_pct: p1 ? dirRet(direction, entry, p1.price) : null,
    r4h_pct: p4 ? dirRet(direction, entry, p4.price) : null,
    mfe4h_pct: dvals.length ? Math.max(...dvals) : null,
    mae4h_pct: dvals.length ? Math.min(...dvals) : null,
    ...metrics,
  };
}
function rowFromAllowedEvent(e) {
  const match = alerts.find(a => a.timestamp_utc === e.timestamp_utc && a.asset === e.asset && a.type === e.type);
  if (match) return rowFromAlert(match, 'allowed_event');
  const direction = dirForType(e.type);
  const ms = Date.parse(e.timestamp_utc);
  const asset = e.asset;
  const entry = priceAtOrAfter(asset, ms)?.price;
  if (!direction || !entry) return null;
  const p1 = priceAtOrAfter(asset, ms + 60 * 60 * 1000);
  const p4 = priceAtOrAfter(asset, ms + 4 * 60 * 60 * 1000);
  const win = priceWindow(asset, ms, ms + 4 * 60 * 60 * 1000);
  const dvals = win.map(x => dirRet(direction, entry.price, x.price)).filter(Number.isFinite);
  return { source: 'allowed_event_state', timestamp_utc: e.timestamp_utc, t: ms, asset, type: e.type, direction, entry_price: entry.price, gate_allowed: true, score: e.score, shadow_state: e.state, r1h_pct: p1 ? dirRet(direction, entry.price, p1.price) : null, r4h_pct: p4 ? dirRet(direction, entry.price, p4.price) : null, mfe4h_pct: dvals.length ? Math.max(...dvals) : null, mae4h_pct: dvals.length ? Math.min(...dvals) : null, ...btcRegimeMetrics(ms) };
}
const allowedRows = allowedEvents.map(rowFromAllowedEvent).filter(Boolean);
const allDirectional = alerts.map(a => rowFromAlert(a, 'all_high')).filter(Boolean).filter(r => ['LONG_CONFIRMED', 'SHORT_CONFIRMED'].includes(r.type));

function summarizeRows(rows) {
  const r1 = rows.map(r => r.r1h_pct).filter(Number.isFinite);
  const r4 = rows.map(r => r.r4h_pct).filter(Number.isFinite);
  const mae = rows.map(r => r.mae4h_pct).filter(Number.isFinite);
  const mfe = rows.map(r => r.mfe4h_pct).filter(Number.isFinite);
  return {
    n: rows.length,
    r1h_n: r1.length,
    r1h_win_rate: r1.length ? r1.filter(v => v > 0).length / r1.length : null,
    r1h_avg_pct: avg(r1),
    r4h_n: r4.length,
    r4h_win_rate: r4.length ? r4.filter(v => v > 0).length / r4.length : null,
    r4h_avg_pct: avg(r4),
    mfe4h_avg_pct: avg(mfe),
    mae4h_avg_pct: avg(mae),
  };
}
function metricLongEvaluation(rows, metricKey) {
  const bear = rows.filter(r => r[metricKey] === true);
  const non = rows.filter(r => r[metricKey] === false);
  const bs = summarizeRows(bear);
  const ns = summarizeRows(non);
  const winSep1h = Number.isFinite(bs.r1h_win_rate) && Number.isFinite(ns.r1h_win_rate) ? (ns.r1h_win_rate - bs.r1h_win_rate) * 100 : null;
  const winSep4h = Number.isFinite(bs.r4h_win_rate) && Number.isFinite(ns.r4h_win_rate) ? (ns.r4h_win_rate - bs.r4h_win_rate) * 100 : null;
  const returnSep1h = Number.isFinite(bs.r1h_avg_pct) && Number.isFinite(ns.r1h_avg_pct) ? (bs.r1h_avg_pct <= -0.30 && ns.r1h_avg_pct >= 0) : false;
  const returnSep4h = Number.isFinite(bs.r4h_avg_pct) && Number.isFinite(ns.r4h_avg_pct) ? (bs.r4h_avg_pct <= -0.30 && ns.r4h_avg_pct >= 0) : false;
  const maeWorse = Number.isFinite(bs.mae4h_avg_pct) && Number.isFinite(ns.mae4h_avg_pct) ? (ns.mae4h_avg_pct - bs.mae4h_avg_pct >= 0.30) : false;
  const winRatePass = (Number.isFinite(winSep1h) && winSep1h >= 15) || (Number.isFinite(winSep4h) && winSep4h >= 15);
  return { metricKey, bearish: bs, non_bearish: ns, win_sep_1h_pp: winSep1h, win_sep_4h_pp: winSep4h, pass: { win_rate_separation: winRatePass, return_separation_1h: returnSep1h, return_separation_4h: returnSep4h, mae_risk_separation: maeWorse, eligible_any: winRatePass || returnSep1h || returnSep4h || maeWorse }, change_mapping: winRatePass || returnSep1h || returnSep4h ? 'score_penalty_candidate' : maeWorse ? 'risk_flag_or_tighter_expiry_only' : 'not_eligible' };
}

function pathStatsForShort(row) {
  const win = priceWindow(row.asset, row.t, row.t + 4 * 60 * 60 * 1000).filter(x => x.t > row.t);
  let targetHit = null, stopHit = null;
  for (const s of win) {
    const r = dirRet('SHORT', row.entry_price, s.price);
    if (!targetHit && r >= TARGET) targetHit = { t: s.t, timestamp_utc: s.timestamp_utc, ret_pct: r, minutes: Math.round((s.t - row.t) / 60000) };
    if (!stopHit && r <= STOP) stopHit = { t: s.t, timestamp_utc: s.timestamp_utc, ret_pct: r, minutes: Math.round((s.t - row.t) / 60000) };
  }
  let first = 'none';
  if (targetHit && !stopHit) first = 'favorable';
  else if (!targetHit && stopHit) first = 'adverse';
  else if (targetHit && stopHit) first = targetHit.t <= stopHit.t ? 'favorable' : 'adverse';
  return { target_hit: targetHit, stop_hit: stopHit, first_path: first, favorable_first: first === 'favorable' };
}

// Blocked SHORT 50-67 May17-21 from all directional rows.
const blockedShorts = allDirectional
  .filter(r => r.type === 'SHORT_CONFIRMED' && r.t >= Date.parse('2026-05-17T00:00:00Z') && r.t <= END && !r.gate_allowed && Number.isFinite(r.score) && r.score >= 50 && r.score <= 67)
  .map(r => ({ ...r, path: pathStatsForShort(r) }));

function shortPathSummary(rows) {
  const n = rows.length;
  const fav = rows.filter(r => r.path.favorable_first).length;
  const mfe = rows.map(r => r.mfe4h_pct).filter(Number.isFinite);
  const mae = rows.map(r => r.mae4h_pct).filter(Number.isFinite);
  const ttt = rows.map(r => r.path.target_hit?.minutes).filter(Number.isFinite);
  const edge = avg(mfe) !== null && avg(mae) !== null ? avg(mfe) - Math.abs(avg(mae)) : null;
  return { n, favorable_first_rate: n ? fav / n : null, mfe4h_avg_pct: avg(mfe), mae4h_avg_pct: avg(mae), mfe_minus_abs_mae_pp: edge, median_time_to_target_min: median(ttt), target_hit_n: ttt.length };
}
function metricShortEvaluation(rows, metricKey) {
  const bear = rows.filter(r => r[metricKey] === true);
  const non = rows.filter(r => r[metricKey] === false);
  const bs = shortPathSummary(bear);
  const ns = shortPathSummary(non);
  const favSep = Number.isFinite(bs.favorable_first_rate) && Number.isFinite(ns.favorable_first_rate) ? (bs.favorable_first_rate - ns.favorable_first_rate) * 100 : null;
  const edgeSep = Number.isFinite(bs.mfe_minus_abs_mae_pp) && Number.isFinite(ns.mfe_minus_abs_mae_pp) ? bs.mfe_minus_abs_mae_pp - ns.mfe_minus_abs_mae_pp : null;
  const favorablePass = Number.isFinite(bs.favorable_first_rate) && (bs.favorable_first_rate >= 0.70) && (Number.isFinite(ns.favorable_first_rate) ? (ns.favorable_first_rate <= 0.55 || favSep >= 20) : true);
  const edgePass = Number.isFinite(bs.mfe_minus_abs_mae_pp) && bs.mfe_minus_abs_mae_pp >= 0.15 && Number.isFinite(edgeSep) && edgeSep >= 0.20;
  const timePass = Number.isFinite(bs.median_time_to_target_min) && bs.median_time_to_target_min <= 60;
  let treatment = 'C_monitor_only';
  if (favorablePass && edgePass && timePass) treatment = 'A_score_boost_candidate';
  else if ((favorablePass || edgePass) && timePass) treatment = 'B_separate_shadow_only_short_forming_bucket';
  return { metricKey, bearish: bs, non_bearish: ns, favorable_first_sep_pp: favSep, edge_sep_pp: edgeSep, pass: { favorable_first_separation: favorablePass, mfe_mae_edge: edgePass, time_to_target: timePass }, treatment };
}

const gateAllowedLongs = allowedRows.filter(r => r.direction === 'LONG');
const gateAllowedSolLongs = gateAllowedLongs.filter(r => r.asset === 'SOL');
const gateAllowedWinningControls = allowedRows.filter(r => (r.r1h_pct !== null && r.r1h_pct > 0) || (r.r4h_pct !== null && r.r4h_pct > 0));
const gateAllowedLongControls = gateAllowedLongs.filter(r => (r.r1h_pct !== null && r.r1h_pct > 0) || (r.r4h_pct !== null && r.r4h_pct > 0));

const longEvaluations = Object.fromEntries(METRICS.map(m => [m.key, metricLongEvaluation(gateAllowedLongs, m.key)]));
const solLongEvaluations = Object.fromEntries(METRICS.map(m => [m.key, metricLongEvaluation(gateAllowedSolLongs, m.key)]));
const shortEvaluations = Object.fromEntries(METRICS.map(m => [m.key, metricShortEvaluation(blockedShorts, m.key)]));

const output = {
  generated_at: new Date().toISOString(),
  methodology: {
    window: '2026-05-09 through 2026-05-21 diagnostic only',
    price_source: PRICE,
    candle_anchor: 'UTC 4h candles: 00:00,04:00,08:00,12:00,16:00,20:00; closed candles only before alert timestamp',
    caveats: [
      'Bucket n is reported; small buckets are low-confidence even if pre-registered thresholds pass.',
      'Path ordering uses 15m close samples; intra-candle target/stop excursions are invisible and favorable-first can be overstated.',
      'Historical sample is diagnostic only; v1 validation must use post-freeze divergence events.',
    ],
    locked_forward_validation: { min_divergence_events: 20, min_per_major_divergence_type: 5 },
    metrics: METRICS,
    long_acceptance: 'eligible if win-rate separation >=15pp OR bearish mean <=-0.30% while non-bearish >=0 OR bearish MAE >=0.30pp worse; win/return => score penalty candidate, MAE-only => risk/expiry only',
    short_acceptance: `blocked shorts score 50-67; favorable +${TARGET}% before adverse ${STOP}% using 15m closes within 4h`,
  },
  counts: {
    allowed_events: allowedRows.length,
    allowed_longs: gateAllowedLongs.length,
    allowed_sol_longs: gateAllowedSolLongs.length,
    allowed_winning_controls: gateAllowedWinningControls.length,
    allowed_long_winning_controls: gateAllowedLongControls.length,
    blocked_short_50_67_may17_21: blockedShorts.length,
  },
  summaries: {
    allowed_all: summarizeRows(allowedRows),
    allowed_longs: summarizeRows(gateAllowedLongs),
    allowed_sol_longs: summarizeRows(gateAllowedSolLongs),
    allowed_winning_controls: summarizeRows(gateAllowedWinningControls),
    allowed_long_winning_controls: summarizeRows(gateAllowedLongControls),
    blocked_short_50_67_path: shortPathSummary(blockedShorts),
  },
  evaluations: { allowed_longs: longEvaluations, allowed_sol_longs: solLongEvaluations, blocked_shorts_50_67: shortEvaluations },
  rows: { allowed: allowedRows, blocked_shorts_50_67: blockedShorts },
};
fs.writeFileSync(OUT_JSON, JSON.stringify(output, null, 2));

function metricTable(evalObj, type) {
  let md = `| metric | bear n | non n | bear 1h/FF | non 1h/FF | bear 4h/edge | non 4h/edge | pass | mapping/treatment |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |\n`;
  for (const m of METRICS) {
    const e = evalObj[m.key];
    if (type === 'short') {
      md += `| ${m.label} | ${e.bearish.n} | ${e.non_bearish.n} | ${ratio(e.bearish.favorable_first_rate)} | ${ratio(e.non_bearish.favorable_first_rate)} | edge ${pp(e.bearish.mfe_minus_abs_mae_pp, 3)} / t ${e.bearish.median_time_to_target_min ?? 'n/a'}m | edge ${pp(e.non_bearish.mfe_minus_abs_mae_pp, 3)} / t ${e.non_bearish.median_time_to_target_min ?? 'n/a'}m | ${Object.entries(e.pass).filter(([,v])=>v).map(([k])=>k).join(', ') || 'none'} | ${e.treatment} |\n`;
    } else {
      md += `| ${m.label} | ${e.bearish.n} | ${e.non_bearish.n} | ${ratio(e.bearish.r1h_win_rate)} avg ${pct(e.bearish.r1h_avg_pct)} | ${ratio(e.non_bearish.r1h_win_rate)} avg ${pct(e.non_bearish.r1h_avg_pct)} | ${ratio(e.bearish.r4h_win_rate)} avg ${pct(e.bearish.r4h_avg_pct)} / MAE ${pct(e.bearish.mae4h_avg_pct)} | ${ratio(e.non_bearish.r4h_win_rate)} avg ${pct(e.non_bearish.r4h_avg_pct)} / MAE ${pct(e.non_bearish.mae4h_avg_pct)} | ${Object.entries(e.pass).filter(([,v])=>v).map(([k])=>k).join(', ') || 'none'} | ${e.change_mapping} |\n`;
    }
  }
  return md;
}
let md = `# Phase 3A Regime/Path Diagnostic\n\nGenerated: ${output.generated_at}\n\n## Methodology\n\nThis is a **diagnostic-only** historical report. It may inform a frozen future \`readiness_shadow_v1\` spec, but it is not validation of v1. Forward validation must use post-freeze v0/v1 divergence events only: minimum 20 divergence events and minimum 5 per major divergence type.\n\nPre-registered metrics only:\n`;
for (const m of METRICS) md += `- ${m.label}\n`;
md += `\nUTC 4h candles are anchored at 00:00/04:00/08:00/12:00/16:00/20:00 and only fully closed candles before the alert are counted.\n\nCaveats:\n- Bucket n is reported; small buckets are low-confidence even if thresholds pass.\n- Path ordering uses 15m close samples; intra-candle target/stop excursions are invisible and favorable-first can be overstated.\n\n## Counts\n\n\`\`\`json\n${JSON.stringify(output.counts, null, 2)}\n\`\`\`\n\n## Gate-allowed LONG regime evaluation\n\n${metricTable(longEvaluations, 'long')}\n\n## Gate-allowed SOL LONG regime evaluation\n\n${metricTable(solLongEvaluations, 'long')}\n\n## Blocked SHORT 50-67 path evaluation\n\nTarget +${TARGET}% before stop ${STOP}% within 4h, using 15m close samples.\n\n${metricTable(shortEvaluations, 'short')}\n\n## Row details — allowed contexts\n\n| time | asset | dir | score | 1h | 4h | MFE4 | MAE4 | BTC 4h | BTC 24h | down4h streak |\n| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n`;
for (const r of allowedRows) md += `| ${r.timestamp_utc} | ${r.asset} | ${r.direction} | ${r.score ?? 'n/a'} | ${pct(r.r1h_pct)} | ${pct(r.r4h_pct)} | ${pct(r.mfe4h_pct)} | ${pct(r.mae4h_pct)} | ${pct(r.btc_return_4h_pct)} | ${pct(r.btc_return_24h_pct)} | ${r.btc_down_4h_closed_streak} |\n`;
md += `\n## Row details — blocked SHORT 50-67\n\n| time | asset | score | 1h | 4h | MFE4 | MAE4 | path first | target min | stop min | BTC 4h | BTC 24h | down4h streak |\n| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: | ---: | ---: |\n`;
for (const r of blockedShorts) md += `| ${r.timestamp_utc} | ${r.asset} | ${r.score ?? 'n/a'} | ${pct(r.r1h_pct)} | ${pct(r.r4h_pct)} | ${pct(r.mfe4h_pct)} | ${pct(r.mae4h_pct)} | ${r.path.first_path} | ${r.path.target_hit?.minutes ?? 'n/a'} | ${r.path.stop_hit?.minutes ?? 'n/a'} | ${pct(r.btc_return_4h_pct)} | ${pct(r.btc_return_24h_pct)} | ${r.btc_down_4h_closed_streak} |\n`;
fs.writeFileSync(OUT_MD, md);
console.log(JSON.stringify({ out_json: OUT_JSON, out_md: OUT_MD, counts: output.counts }, null, 2));
