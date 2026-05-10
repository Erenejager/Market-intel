#!/usr/bin/env node
/*
  replay-phase1b-validation.js

  Limited historical validation for Phase 1b diagnostics.
  Reads existing microstructure history and replays the same shadow-penalty
  logic without changing live alerts/scoring.

  Output:
  - market-intel/data/phase1b-replay-report.md
  - market-intel/data/phase1b-replay-report.json
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const MICRO_PATH = path.join(ROOT, 'data', 'microstructure-history.jsonl');
const OUT_MD = path.join(ROOT, 'data', 'phase1b-replay-report.md');
const OUT_JSON = path.join(ROOT, 'data', 'phase1b-replay-report.json');
const ASSETS = ['BTC', 'ETH', 'SOL'];

function toNum(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}
function round(x, d = 6) { return Number.isFinite(x) ? Number(x.toFixed(d)) : null; }
function readJsonl(file) {
  try {
    return fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
  } catch {
    return [];
  }
}
function priceFromMarket(m) {
  return toNum(m?.backpack?.order_book?.mid);
}
function rangeContextFromMarket(m, direction) {
  const ob = m?.backpack?.order_book || {};
  const fbc = m?.failed_breakout_counter || {};
  const price = priceFromMarket(m);
  const trigger = toNum(ob.trigger_zone?.trigger_price ?? fbc.trigger_price);
  const distanceBps = toNum(ob.trigger_zone?.distance_bps ?? fbc.distance_to_level_bps);
  const atr = toNum(m?.backpack?.atr_1h || m?.atr_1h);
  // Historical microstructure rows often do not have ATR/levels, but trigger
  // distance from the execution book is available for active pending triggers.
  let distanceAtr = null;
  if (Number.isFinite(trigger) && Number.isFinite(price) && Number.isFinite(atr) && atr > 0) distanceAtr = Math.abs(trigger - price) / atr;
  const nearByBps = Number.isFinite(distanceBps) && Math.abs(distanceBps) <= 75;
  const nearByAtr = Number.isFinite(distanceAtr) && distanceAtr <= 1.0;
  const nearByFbc = fbc.near_failed_level === true;
  const inferredReclaimed = direction === 'BUY' && Number.isFinite(price) && Number.isFinite(trigger) && price > trigger;
  const failedPenaltyActive = typeof fbc.penalty_active === 'boolean' ? fbc.penalty_active : !inferredReclaimed;
  return {
    trigger_price: Number.isFinite(trigger) ? trigger : null,
    distance_bps: Number.isFinite(distanceBps) ? distanceBps : null,
    distance_atr: Number.isFinite(distanceAtr) ? round(distanceAtr, 4) : null,
    near_relevant_level: nearByAtr || nearByBps || nearByFbc,
    failed_breakout_penalty_active: failedPenaltyActive,
    failed_breakout_inactive_reason: fbc.penalty_inactive_reason || (inferredReclaimed ? 'inferred_reclaimed_price_above_failed_level' : null),
    rule: direction === 'SELL' ? 'near support for short-risk penalties' : 'near resistance/trigger for long-risk penalties',
  };
}
function flowImpliedSignal(flow) {
  if (['STRUCTURAL_BUYING', 'SPOT_LED_ACCUMULATION', 'LEVERAGED_CHASE'].includes(flow)) return 'BUY_BIAS';
  if (['SELL_PRESSURE', 'DISTRIBUTION'].includes(flow)) return 'SELL_BIAS';
  return 'WATCH';
}
function replayConsensus(series, idx, samples = 4) {
  const hist = series.slice(Math.max(0, idx - samples + 1), idx + 1).map(x => x.flow).filter(Boolean);
  const current = hist[hist.length - 1] || 'UNKNOWN';
  const counts = hist.reduce((acc, c) => { acc[c] = (acc[c] || 0) + 1; return acc; }, {});
  let streak = 0;
  for (let i = hist.length - 1; i >= 0; i -= 1) {
    if (hist[i] !== current) break;
    streak += 1;
  }
  return {
    current,
    history: hist,
    current_streak: streak,
    confirmed: streak >= 3 || counts[current] >= 3,
  };
}
function activeFailedAttempts(asset, timestampMs, rows, level, atr) {
  if (!Number.isFinite(level)) return 0;
  const tolerance = Number.isFinite(atr) ? atr * 0.05 : level * 0.001;
  const cutoff = timestampMs - 48 * 60 * 60 * 1000;
  const seen = new Set();
  let count = 0;
  for (const r of rows) {
    const ts = Date.parse(r.timestamp_utc || '');
    if (!Number.isFinite(ts) || ts < cutoff || ts > timestampMs) continue;
    const c = r.markets?.[asset]?.backpack?.candle_1h || r.markets?.[asset]?.backpack?.last_1h_candle;
    // Most microstructure rows do not include candles. Fall back to trigger zone
    // only in live diagnostics. Replay therefore uses backfilled current counter
    // when historical candle fields are unavailable.
    if (!c?.start || seen.has(c.start)) continue;
    seen.add(c.start);
    const high = toNum(c.high);
    const close = toNum(c.close);
    if (Number.isFinite(high) && Number.isFinite(close) && high >= level - tolerance && close < level + tolerance) count += 1;
  }
  return count;
}
function btcGate(asset, flow, spotCvd, btcFlow) {
  if (asset === 'BTC') return { classification: 'N/A', penalty: 0 };
  if (['SELL_PRESSURE', 'DISTRIBUTION'].includes(btcFlow)) return { classification: 'BTC_WEAK_VETO_ALT_LONGS', penalty: -0.08 };
  if (['STRUCTURAL_BUYING', 'SPOT_LED_ACCUMULATION'].includes(btcFlow)) {
    if (flow === 'LEVERAGED_CHASE' || toNum(spotCvd) < 0 || !['STRUCTURAL_BUYING', 'SPOT_LED_ACCUMULATION'].includes(flow)) {
      return { classification: 'BTC_STRONG_ALT_NOT_FOLLOWING', penalty: -0.08 };
    }
    return { classification: 'BTC_CONFIRMS_ALT_LONG_CONTEXT', penalty: 0 };
  }
  return { classification: 'NEUTRAL', penalty: 0 };
}
function oiOpposesDirection(oiRegime, direction) {
  if (direction === 'BUY') return ['LONGS_EXITING', 'FRESH_SHORTS'].includes(oiRegime);
  if (direction === 'SELL') return ['SHORTS_COVERING', 'FRESH_LONGS'].includes(oiRegime);
  return false;
}
function inferOiRegime(row, asset) {
  // Prefer live Phase 1b field for rows collected after implementation.
  const live = row.markets?.[asset]?.oi_price_regime?.classification;
  return live || 'UNKNOWN';
}
function penaltiesFor({ direction, consensus, failedAttempts, btcGateInfo, cvdDivergenceType, oiRegime, setupContext }) {
  const penalties = [];
  if (!['BUY', 'SELL'].includes(direction)) return penalties;

  // Consensus is deliberately not a standalone event in replay. It only matters
  // when another setup condition exists (failed level, CVD divergence, BTC gate,
  // OI conflict, etc.). Otherwise it just measures the market noise floor.
  if (setupContext) {
    if (!consensus.confirmed && consensus.current_streak < 2) penalties.push({ condition: 'flow_consensus_unconfirmed_streak_lt_2', points: -5 });
    else if (!consensus.confirmed && consensus.current_streak === 2) penalties.push({ condition: 'flow_consensus_unconfirmed_streak_2', points: -2 });
  }

  if (direction === 'BUY' && setupContext) {
    if (failedAttempts >= 5) penalties.push({ condition: 'failed_breakout_counter_ge_5', points: -12 });
    else if (failedAttempts >= 2) penalties.push({ condition: 'failed_breakout_counter_ge_2', points: -8 });
  }

  if (direction === 'BUY' && btcGateInfo?.classification === 'BTC_WEAK_VETO_ALT_LONGS') penalties.push({ condition: 'btc_gate_weak_penalize_alt_longs', points: -8 });

  const divAgainst = direction === 'BUY'
    ? cvdDivergenceType === 'SPOT_NEGATIVE_FUTURES_POSITIVE'
    : cvdDivergenceType === 'SPOT_POSITIVE_FUTURES_NEGATIVE';
  if (divAgainst) penalties.push({ condition: 'cvd_divergence_against_direction', points: -5 });

  // OI regime is intentionally display-only for now. Early replay showed it was
  // noisy at current sensitivity, so do not score it until more events validate it.
  return penalties;
}

function setupReasonsFor({ direction, failedAttempts, btcGateInfo, cvdDivergenceType, oiRegime, rangeContext }) {
  if (!['BUY', 'SELL'].includes(direction)) return [];
  const reasons = [];
  const levelContext = rangeContext?.near_relevant_level;
  const failedPenaltyActive = rangeContext?.failed_breakout_penalty_active !== false;
  if (direction === 'BUY' && failedAttempts >= 2 && levelContext && failedPenaltyActive) reasons.push('failed_breakout_counter_active_near_level');
  const divAgainst = direction === 'BUY'
    ? cvdDivergenceType === 'SPOT_NEGATIVE_FUTURES_POSITIVE'
    : cvdDivergenceType === 'SPOT_POSITIVE_FUTURES_NEGATIVE';
  if (divAgainst && levelContext) reasons.push('cvd_divergence_against_direction_near_level');
  if (direction === 'BUY' && btcGateInfo?.classification === 'BTC_WEAK_VETO_ALT_LONGS' && levelContext) reasons.push('btc_weak_alt_long_context_near_level');
  // OI regime is tracked in output but no longer creates a setup event by itself.
  return reasons;
}

const rows = readJsonl(MICRO_PATH).filter(r => r?.markets);
if (!rows.length) {
  console.error(`No microstructure history found at ${MICRO_PATH}`);
  process.exit(1);
}

const byAsset = {};
for (const asset of ASSETS) {
  byAsset[asset] = rows.map((r, idx) => {
    const m = r.markets?.[asset] || {};
    const flow = m.flow_quality?.classification || 'UNKNOWN';
    const price = priceFromMarket(m);
    const spot = toNum(m.flow_quality?.spot_cvd_notional);
    const fut = toNum(m.flow_quality?.futures_cvd_notional);
    let div = 'NONE';
    if (Number.isFinite(spot) && Number.isFinite(fut)) {
      if (spot < 0 && fut > 0) div = 'SPOT_NEGATIVE_FUTURES_POSITIVE';
      else if (spot > 0 && fut < 0) div = 'SPOT_POSITIVE_FUTURES_NEGATIVE';
    }
    const fbc = m.failed_breakout_counter || {};
    return { idx, timestamp: r.timestamp_utc, row: r, asset, flow, price, spot, fut, div, failedAttempts: Number(fbc.active_failed_attempts ?? fbc.failed_attempts ?? 0) || 0, oiRegime: inferOiRegime(r, asset) };
  }).filter(x => x.flow !== 'UNKNOWN' && Number.isFinite(x.price));
}

const replayRows = [];
for (const asset of ASSETS) {
  const series = byAsset[asset];
  for (let i = 0; i < series.length; i += 1) {
    const x = series[i];
    const consensus = replayConsensus(series, i, 4);
    const oldSignal = flowImpliedSignal(x.flow);
    const direction = oldSignal === 'BUY_BIAS' ? 'BUY' : oldSignal === 'SELL_BIAS' ? 'SELL' : 'WATCH';
    const btcSeries = byAsset.BTC || [];
    const btcAtOrBefore = btcSeries.filter(b => Date.parse(b.timestamp) <= Date.parse(x.timestamp)).slice(-1)[0];
    const btcInfo = btcGate(asset, x.flow, x.spot, btcAtOrBefore?.flow);
    const rangeContext = rangeContextFromMarket(x.row.markets?.[asset], direction);
    const setup_reasons = setupReasonsFor({ direction, failedAttempts: x.failedAttempts, btcGateInfo: btcInfo, cvdDivergenceType: x.div, oiRegime: x.oiRegime, rangeContext });
    if (setup_reasons.length === 0) continue;
    const scopedBtcInfo = setup_reasons.includes('btc_weak_alt_long_context_near_level') ? btcInfo : { ...btcInfo, classification: 'NEUTRAL' };
    const scopedDiv = setup_reasons.includes('cvd_divergence_against_direction_near_level') ? x.div : 'NONE';
    const scopedFailedAttempts = setup_reasons.includes('failed_breakout_counter_active_near_level') ? x.failedAttempts : 0;
    const penalties = penaltiesFor({ direction, consensus, failedAttempts: scopedFailedAttempts, btcGateInfo: scopedBtcInfo, cvdDivergenceType: scopedDiv, oiRegime: x.oiRegime, setupContext: true });
    const next = series[i + 4] || null;
    const retNext4 = next ? (next.price / x.price - 1) * 100 : null;
    replayRows.push({
      timestamp: x.timestamp,
      asset,
      price: round(x.price, asset === 'BTC' ? 2 : 4),
      old_signal: oldSignal,
      flow: x.flow,
      setup_reasons,
      range_context: rangeContext,
      consensus_confirmed: consensus.confirmed,
      consensus_streak: consensus.current_streak,
      failed_breakouts: x.failedAttempts,
      btc_gate: btcInfo.classification,
      cvd_divergence: x.div,
      oi_regime: x.oiRegime,
      phase1b_penalty_points: penalties.reduce((s, p) => s + p.points, 0),
      penalties,
      next_4_sample_return_pct: round(retNext4, 4),
    });
  }
}

const flagged = replayRows.filter(r => r.phase1b_penalty_points < 0);
const summary = {
  generated_at: new Date().toISOString(),
  coverage: { from: rows[0].timestamp_utc, to: rows[rows.length - 1].timestamp_utc, microstructure_rows: rows.length },
  assets: Object.fromEntries(ASSETS.map(asset => {
    const all = replayRows.filter(r => r.asset === asset);
    const f = all.filter(r => r.phase1b_penalty_points < 0);
    const withRet = f.filter(r => Number.isFinite(r.next_4_sample_return_pct));
    return [asset, {
      setup_events: all.length,
      flagged: f.length,
      avg_next_4_sample_return_when_flagged_pct: withRet.length ? round(withRet.reduce((s, r) => s + r.next_4_sample_return_pct, 0) / withRet.length, 4) : null,
      negative_or_flat_rate_when_flagged: withRet.length ? round(withRet.filter(r => r.next_4_sample_return_pct <= 0).length / withRet.length, 4) : null,
    }];
  })),
  penalty_counts: flagged.flatMap(r => r.penalties.map(p => p.condition)).reduce((acc, c) => { acc[c] = (acc[c] || 0) + 1; return acc; }, {}),
};

const lines = [];
lines.push('# Phase 1b Replay Validation');
lines.push('');
lines.push(`Generated: ${summary.generated_at}`);
lines.push(`Coverage: ${summary.coverage.from} → ${summary.coverage.to} (${summary.coverage.microstructure_rows} microstructure rows)`);
lines.push('');
lines.push('## Summary');
lines.push('');
for (const asset of ASSETS) {
  const s = summary.assets[asset];
  lines.push(`- ${asset}: ${s.flagged}/${s.setup_events} setup-events flagged; avg next-4-sample return when flagged: ${s.avg_next_4_sample_return_when_flagged_pct ?? 'n/a'}%; non-positive rate: ${s.negative_or_flat_rate_when_flagged ?? 'n/a'}`);
}
lines.push('');
lines.push('## Penalty Counts');
lines.push('');
for (const [k, v] of Object.entries(summary.penalty_counts).sort((a, b) => b[1] - a[1])) lines.push(`- ${k}: ${v}`);
lines.push('');
lines.push('## Recent Flagged Rows');
lines.push('');
lines.push('| timestamp | asset | price | old_signal | flow | setup_reasons | penalties | next_4_sample_return_pct |');
lines.push('|---|---:|---:|---|---|---|---|---:|');
for (const r of flagged.slice(-40)) {
  lines.push(`| ${r.timestamp} | ${r.asset} | ${r.price} | ${r.old_signal} | ${r.flow} | ${r.setup_reasons.join('<br>')} | ${r.penalties.map(p => `${p.condition}(${p.points})`).join('<br>')} | ${r.next_4_sample_return_pct ?? ''} |`);
}

fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
fs.writeFileSync(OUT_JSON, JSON.stringify({ summary, rows: replayRows }, null, 2) + '\n');
fs.writeFileSync(OUT_MD, lines.join('\n') + '\n');
console.log(JSON.stringify({ ok: true, out: { json: path.relative(process.cwd(), OUT_JSON), markdown: path.relative(process.cwd(), OUT_MD) }, summary }));
