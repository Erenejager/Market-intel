#!/usr/bin/env node
/*
  Regime engine v1.3 candidate evaluator.

  Adds hysteresis/persistence and FLUSH as a sub-state of BEARISH_TREND.
  Diagnostic only; no alert wiring.
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const PRICE_PATH = path.join(DATA, 'autoresearch', 'price-15m.jsonl');
const LABELS_PATH = path.join(DATA, 'regime-labels-manual-v1.json');
const OUT_JSON = path.join(DATA, 'regime-engine-v1p3-candidate-evaluation.json');
const OUT_MD = path.join(DATA, 'regime-engine-v1p3-candidate-evaluation.md');

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const SAMPLE_MS = 15 * MIN;

function readJsonl(file) { return fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse); }
function ts(r) { return Date.parse(r.timestamp_utc || r.timestamp || ''); }
function num(x) { const n = Number(x); return Number.isFinite(n) ? n : null; }
function avg(vals) { return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null; }
function median(vals) { if (!vals.length) return null; const s = vals.slice().sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
function max(vals) { return vals.length ? Math.max(...vals) : null; }
function pct(x, d = 1) { return Number.isFinite(x) ? `${(x * 100).toFixed(d)}%` : 'n/a'; }
function mins(x) { return Number.isFinite(x) ? `${Math.round(x / MIN)}m` : 'n/a'; }
function iso(ms) { return new Date(ms).toISOString(); }

const pricesRaw = readJsonl(PRICE_PATH)
  .map(r => ({ timestamp_utc: r.timestamp_utc, t: ts(r), price: num(r.prices?.BTC?.lastPrice) }))
  .filter(r => Number.isFinite(r.t) && Number.isFinite(r.price))
  .sort((a, b) => a.t - b.t);
const labels = JSON.parse(fs.readFileSync(LABELS_PATH, 'utf8'));
const windows = labels.windows.map(w => ({ ...w, s: Date.parse(w.start), e: Date.parse(w.end) }));

function labelAt(t) { return windows.find(w => t >= w.s && t < w.e) || null; }
function lowerBound(arr, x) { let lo = 0, hi = arr.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (arr[mid].t < x) lo = mid + 1; else hi = mid; } return lo; }
function priceAtOrBefore(t) { let i = lowerBound(pricesRaw, t); if (i >= pricesRaw.length || pricesRaw[i].t > t) i--; return i >= 0 ? pricesRaw[i] : null; }
function windowPrices(start, end) { const out = []; let i = lowerBound(pricesRaw, start); while (i < pricesRaw.length && pricesRaw[i].t <= end) out.push(pricesRaw[i++]); return out; }
function retPct(t, lookbackMs) { const e = priceAtOrBefore(t), s = priceAtOrBefore(t - lookbackMs); return e && s && s.price ? ((e.price - s.price) / s.price) * 100 : null; }
function sma(t, lookbackMs) { const rows = windowPrices(t - lookbackMs, t); return rows.length ? avg(rows.map(r => r.price)) : null; }
function distFromSmaPct(t, lookbackMs) { const p = priceAtOrBefore(t)?.price; const s = sma(t, lookbackMs); return Number.isFinite(p) && Number.isFinite(s) && s ? ((p - s) / s) * 100 : null; }
function realizedRangePct(t, lookbackMs) { const rows = windowPrices(t - lookbackMs, t); if (rows.length < 2) return null; const ps = rows.map(r => r.price); const p = rows.at(-1).price; return p ? ((Math.max(...ps) - Math.min(...ps)) / p) * 100 : null; }
function medianRangePct(t, windowMs, periods) { const vals = []; for (let i = 1; i <= periods; i++) { const v = realizedRangePct(t - (i - 1) * windowMs, windowMs); if (Number.isFinite(v)) vals.push(v); } return median(vals); }
function drawdownFromHighPct(t, lookbackMs) {
  const rows = windowPrices(t - lookbackMs, t);
  if (rows.length < 2) return null;
  const p = rows.at(-1).price;
  const hi = Math.max(...rows.map(r => r.price));
  return hi ? ((p - hi) / hi) * 100 : null;
}

const samples = pricesRaw.map(r => {
  const lab = labelAt(r.t);
  const ret4h = retPct(r.t, 4 * HOUR);
  const prior4h = (() => { const now = priceAtOrBefore(r.t - 4 * HOUR), prev = priceAtOrBefore(r.t - 8 * HOUR); return now && prev && prev.price ? ((now.price - prev.price) / prev.price) * 100 : null; })();
  const range4h = realizedRangePct(r.t, 4 * HOUR);
  const medRange4h = medianRangePct(r.t - 4 * HOUR, 4 * HOUR, 12);
  return {
    ...r,
    manual_label: lab?.label || 'UNCLASSIFIED',
    manual_parent: lab?.parent_regime || 'UNCLASSIFIED',
    manual_momentum: lab?.momentum_type || 'UNCLASSIFIED',
    features: {
      ret4h,
      ret8h: retPct(r.t, 8 * HOUR),
      ret24h: retPct(r.t, 24 * HOUR),
      ret7d: retPct(r.t, 7 * DAY),
      dist5d: distFromSmaPct(r.t, 5 * DAY),
      dist7d: distFromSmaPct(r.t, 7 * DAY),
      range4h,
      range4h_ratio: Number.isFinite(range4h) && Number.isFinite(medRange4h) && medRange4h > 0 ? range4h / medRange4h : null,
      drawdown12h: drawdownFromHighPct(r.t, 12 * HOUR),
      prior4h,
      accel4h: Number.isFinite(ret4h) && Number.isFinite(prior4h) ? ret4h - prior4h : null,
    },
  };
}).filter(s => s.manual_label !== 'UNCLASSIFIED');

const squeezeRules = [
  { name: 'dist5d_gt_0', pred: r => r.features.dist5d > 0 },
  { name: 'dist5d_gt_0.25', pred: r => r.features.dist5d > 0.25 },
  { name: 'ret4h_gt_0.5_or_dist5d_gt_0', pred: r => r.features.ret4h > 0.5 || r.features.dist5d > 0 },
  { name: 'ret4h_gt_1_or_dist5d_gt_0.25', pred: r => r.features.ret4h > 1 || r.features.dist5d > 0.25 },
];
const squeezeInvalidators = [
  { name: 'ret4h_lt_-0.5', pred: r => r.features.ret4h < -0.5 },
  { name: 'ret8h_lt_-0.75', pred: r => r.features.ret8h < -0.75 },
  { name: 'ret24h_lt_0', pred: r => r.features.ret24h < 0 },
  { name: 'dist5d_lt_0', pred: r => r.features.dist5d < 0 },
  { name: 'drawdown12h_lt_-1', pred: r => r.features.drawdown12h < -1 },
  { name: 'ret4h_lt_-0.5_or_dist5d_lt_0', pred: r => r.features.ret4h < -0.5 || r.features.dist5d < 0 },
  { name: 'ret8h_lt_-0.75_or_drawdown12h_lt_-1', pred: r => r.features.ret8h < -0.75 || r.features.drawdown12h < -1 },
];
const bearRules = [
  // v1.3 is focused on squeeze invalidation. Keep a small set of v1.1/v1.2 strong bearish bases.
  { name: 'dist5d_lt_-0.5', pred: r => r.features.dist5d < -0.5 },
  { name: 'ret7d_lt_-1', pred: r => r.features.ret7d < -1 },
];
const flushRules = [
  // Representative v1.1/v1.2 FLUSH candidates. FLUSH is not the target of v1.3.
  { name: 'ret4h_lt_-1.25_dist5d_lt_-1.5_range_ratio_gt_1.75', pred: r => r.features.ret4h < -1.25 && r.features.dist5d < -1.5 && r.features.range4h_ratio > 1.75 },
  { name: 'ret4h_lt_-1_dist5d_lt_-1.5_range_ratio_gt_1.75', pred: r => r.features.ret4h < -1 && r.features.dist5d < -1.5 && r.features.range4h_ratio > 1.75 },
  { name: 'ret4h_lt_-1.5_dist5d_lt_-1.5_range_ratio_gt_1.75', pred: r => r.features.ret4h < -1.5 && r.features.dist5d < -1.5 && r.features.range4h_ratio > 1.75 },
  { name: 'ret4h_lt_-1_accel_lt_-0.5_range_ratio_gt_1.75', pred: r => r.features.ret4h < -1 && r.features.accel4h < -0.5 && r.features.range4h_ratio > 1.75 },
];

function updateHyst(state, raw, row, entrySamples, exitSamples) {
  if (raw) { state.consecutiveTrue++; state.consecutiveFalse = 0; }
  else { state.consecutiveFalse++; state.consecutiveTrue = 0; }
  if (!state.active && state.consecutiveTrue >= entrySamples) { state.active = true; state.activatedAt = row.t; }
  if (state.active && state.consecutiveFalse >= exitSamples) { state.active = false; state.activatedAt = null; }
}
function simulate({ squeezeRule, squeezeInvalidator, bearRule, flushRule, squeezeEntry, squeezeExit, bearEntry, bearExit, flushEntry = 3, flushExit = 3, flushTtlHours }) {
  const sq = { active: false, consecutiveTrue: 0, consecutiveFalse: 0, activatedAt: null };
  const br = { active: false, consecutiveTrue: 0, consecutiveFalse: 0, activatedAt: null };
  const fl = { active: false, consecutiveTrue: 0, consecutiveFalse: 0, activatedAt: null, expiresAt: null };
  const out = [];
  for (const r of samples) {
    const squeezeInvalidated = !!squeezeInvalidator.pred(r);
    const squeezeRaw = !!squeezeRule.pred(r) && !squeezeInvalidated;
    updateHyst(sq, squeezeRaw, r, squeezeEntry, squeezeExit);
    updateHyst(br, !!bearRule.pred(r), r, bearEntry, bearExit);

    // v1.3 squeeze invalidation:
    // A high-recall squeeze condition is not enough; it must expire when price
    // action shows failure/exhaustion. This is deliberately separate from the
    // bearish-confirmed override, because v1.2 showed squeeze can linger before
    // bearish state is established.
    if (sq.active && squeezeInvalidated) {
      sq.active = false;
      sq.activatedAt = null;
      sq.consecutiveTrue = 0;
      sq.consecutiveFalse = 0;
    }

    // v1.3 squeeze-exit override:
    // If BEARISH_TREND is established, stale squeeze state must not linger and
    // keep blocking/overriding bearish context. This specifically addresses the
    // v1.1 failure mode where high-recall squeeze rules persisted deep into
    // manual bearish windows. Any bearish false-positive during manual squeeze is
    // still caught by the frozen BEARISH_TREND max_squeeze_false criterion.
    if (br.active && sq.active) {
      sq.active = false;
      sq.activatedAt = null;
      sq.consecutiveTrue = 0;
      sq.consecutiveFalse = 0;
    }

    const flushRaw = br.active && !!flushRule.pred(r);
    if (flushRaw) { fl.consecutiveTrue++; fl.consecutiveFalse = 0; }
    else { fl.consecutiveFalse++; fl.consecutiveTrue = 0; }
    if (!br.active) { fl.active = false; fl.consecutiveTrue = 0; fl.consecutiveFalse = 0; fl.activatedAt = null; fl.expiresAt = null; }
    else if (!fl.active && fl.consecutiveTrue >= flushEntry) {
      fl.active = true;
      fl.activatedAt = r.t;
      fl.expiresAt = r.t + flushTtlHours * HOUR;
    }
    if (fl.active && (r.t >= fl.expiresAt || fl.consecutiveFalse >= flushExit)) {
      fl.active = false;
      fl.activatedAt = null;
      fl.expiresAt = null;
    }

    let state = 'NEUTRAL';
    if (sq.active) state = 'BULLISH_SQUEEZE';
    else if (br.active) state = fl.active ? 'FLUSH_CANDIDATE' : 'BEARISH_TREND';
    out.push({ ...r, state, raw: { squeeze: !!squeezeRule.pred(r), squeezeInvalidated, bearish: !!bearRule.pred(r), flush: !!flushRule.pred(r) } });
  }
  return out;
}

function segs(rows, pred) { const res = []; let cur = null; for (const r of rows) { const yes = pred(r); if (yes && !cur) cur = { start: r.t, end: r.t, rows: [r] }; else if (yes) { cur.end = r.t; cur.rows.push(r); } else if (cur) { res.push(cur); cur = null; } } if (cur) res.push(cur); return res.map(s => ({ ...s, durationMs: s.end - s.start + SAMPLE_MS })); }
function rowsInWindow(rows, w) { return rows.filter(r => r.t >= w.s && r.t < w.e); }
function recall(rows, pred) { return rows.length ? rows.filter(pred).length / rows.length : null; }
function fpr(rows, pred) { return rows.length ? rows.filter(pred).length / rows.length : null; }
function firstDelay(rows, w, pred) { const first = rowsInWindow(rows, w).find(pred); return first ? first.t - w.s : null; }
function maxMissed(rows, w, pred) { return max(segs(rowsInWindow(rows, w), r => !pred(r)).map(s => s.durationMs)) || 0; }
function maxFalseInWindows(rows, winFilter, pred) { let m = 0; for (const w of windows.filter(winFilter)) { m = Math.max(m, max(segs(rowsInWindow(rows, w), pred).map(s => s.durationMs)) || 0); } return m; }
function flipsPerDay(rows) { let flips = 0; for (let i = 1; i < rows.length; i++) if (rows[i].state !== rows[i - 1].state) flips++; const days = (rows.at(-1).t - rows[0].t) / DAY; return days ? flips / days : null; }
function sub45Flickers(rows) { return segs(rows, () => true) && (() => { const s = []; let cur = null; for (const r of rows) { if (!cur) cur = { state: r.state, start: r.t, end: r.t }; else if (cur.state === r.state) cur.end = r.t; else { s.push(cur); cur = { state: r.state, start: r.t, end: r.t }; } } if (cur) s.push(cur); return s.filter(x => (x.end - x.start + SAMPLE_MS) < 45 * MIN).length; })(); }
function falseFlushSegmentsPerGrind(rows) { let maxCount = 0; const examples = []; for (const w of windows.filter(w => ['GRIND', 'CONTINUATION'].includes(w.momentum_type))) { const ss = segs(rowsInWindow(rows, w), r => r.state === 'FLUSH_CANDIDATE'); maxCount = Math.max(maxCount, ss.length); for (const s of ss.slice(0, 3)) examples.push({ window: w.label, start: iso(s.start), duration_min: Math.round(s.durationMs / MIN) }); } return { maxCount, examples: examples.slice(0, 8) }; }
function score(rows) {
  const squeezeRows = rows.filter(r => r.manual_label === 'BULLISH_SQUEEZE');
  const nonBear = rows.filter(r => r.manual_parent !== 'BEARISH_TREND');
  const bearNonFlush = rows.filter(r => r.manual_parent === 'BEARISH_TREND' && r.manual_momentum !== 'FLUSH');
  const flush = rows.filter(r => r.manual_momentum === 'FLUSH');
  const squeezeWin = windows.find(w => w.label === 'BULLISH_SQUEEZE');
  const bearWins = windows.filter(w => w.parent_regime === 'BEARISH_TREND' && w.momentum_type !== 'FLUSH');
  const bearDelays = bearWins.map(w => firstDelay(rows, w, r => r.state === 'BEARISH_TREND' || r.state === 'FLUSH_CANDIDATE')).filter(Number.isFinite);
  const ff = falseFlushSegmentsPerGrind(rows);
  const s = {
    squeeze: {
      recall: recall(squeezeRows, r => r.state === 'BULLISH_SQUEEZE'),
      delay_ms: firstDelay(rows, squeezeWin, r => r.state === 'BULLISH_SQUEEZE'),
      max_missed_ms: maxMissed(rows, squeezeWin, r => r.state === 'BULLISH_SQUEEZE'),
      max_false_bear_ms: maxFalseInWindows(rows, w => w.parent_regime === 'BEARISH_TREND', r => r.state === 'BULLISH_SQUEEZE'),
    },
    bearish: {
      false_positive_rate: fpr(nonBear, r => r.state === 'BEARISH_TREND' || r.state === 'FLUSH_CANDIDATE'),
      coverage: recall(bearNonFlush, r => r.state === 'BEARISH_TREND' || r.state === 'FLUSH_CANDIDATE'),
      median_delay_ms: median(bearDelays),
      max_squeeze_false_ms: maxFalseInWindows(rows, w => w.label === 'BULLISH_SQUEEZE', r => r.state === 'BEARISH_TREND' || r.state === 'FLUSH_CANDIDATE'),
    },
    flush: {
      coverage: recall(flush, r => r.state === 'FLUSH_CANDIDATE'),
      identifies_flush: flush.some(r => r.state === 'FLUSH_CANDIDATE'),
      max_false_segments_per_grind_or_continuation_window: ff.maxCount,
      false_examples: ff.examples,
    },
    global: {
      flips_per_day: flipsPerDay(rows),
      sub45_flickers: sub45Flickers(rows),
      unknown_rate: 0,
    },
  };
  s.squeeze.pass = s.squeeze.recall >= 0.8 && s.squeeze.delay_ms !== null && s.squeeze.delay_ms <= 60 * MIN && s.squeeze.max_missed_ms <= 2 * HOUR && s.squeeze.max_false_bear_ms <= 2 * HOUR;
  s.bearish.pass = s.bearish.false_positive_rate <= 0.15 && s.bearish.coverage >= 0.7 && s.bearish.median_delay_ms !== null && s.bearish.median_delay_ms <= 2 * HOUR && s.bearish.max_squeeze_false_ms <= 45 * MIN;
  s.flush.pass = s.flush.identifies_flush && s.flush.max_false_segments_per_grind_or_continuation_window <= 2;
  s.global.pass = s.global.flips_per_day <= 3 && s.global.sub45_flickers === 0 && s.global.unknown_rate < 0.10;
  s.all_pass = s.squeeze.pass && s.bearish.pass && s.flush.pass && s.global.pass;
  return s;
}

const candidates = [];
for (const squeezeRule of squeezeRules) {
  for (const squeezeInvalidator of squeezeInvalidators) {
    for (const bearRule of bearRules) {
      for (const flushRule of flushRules) {
        for (const squeezeEntry of [2, 3]) for (const squeezeExit of [4, 6]) {
          for (const bearEntry of [3, 4]) for (const bearExit of [4, 6]) {
            for (const flushTtlHours of [8, 12]) {
              const cfg = { squeezeRule, squeezeInvalidator, bearRule, flushRule, squeezeEntry, squeezeExit, bearEntry, bearExit, flushTtlHours };
              const rows = simulate(cfg);
              const sc = score(rows);
              candidates.push({
                config: { squeeze: squeezeRule.name, squeezeInvalidator: squeezeInvalidator.name, bearish: bearRule.name, flush: flushRule.name, squeezeEntry, squeezeExit, bearEntry, bearExit, flushEntry: 3, flushExit: 3, flushTtlHours },
                score: sc,
              });
            }
          }
        }
      }
    }
  }
}

function rank(a, b) {
  return Number(b.score.all_pass) - Number(a.score.all_pass)
    || Number(b.score.squeeze.pass && b.score.bearish.pass && b.score.flush.pass) - Number(a.score.squeeze.pass && a.score.bearish.pass && a.score.flush.pass)
    || Number(b.score.global.pass) - Number(a.score.global.pass)
    || a.score.global.flips_per_day - b.score.global.flips_per_day
    || a.score.global.sub45_flickers - b.score.global.sub45_flickers
    || b.score.bearish.coverage - a.score.bearish.coverage;
}
candidates.sort(rank);

const passCounts = {
  total: candidates.length,
  all_pass: candidates.filter(c => c.score.all_pass).length,
  squeeze_pass: candidates.filter(c => c.score.squeeze.pass).length,
  bearish_pass: candidates.filter(c => c.score.bearish.pass).length,
  flush_pass: candidates.filter(c => c.score.flush.pass).length,
  global_pass: candidates.filter(c => c.score.global.pass).length,
  component_all_pass: candidates.filter(c => c.score.squeeze.pass && c.score.bearish.pass && c.score.flush.pass).length,
};

const result = {
  generated_at: new Date().toISOString(),
  inputs: { prices: PRICE_PATH, labels: LABELS_PATH, plan: path.join(DATA, 'regime-engine-v1p3-plan.md'), preregistration: path.join(DATA, 'regime-engine-v1-preregistration.md') },
  sample_counts: {
    total: samples.length,
    first: samples[0]?.timestamp_utc,
    last: samples.at(-1)?.timestamp_utc,
    squeeze: samples.filter(r => r.manual_label === 'BULLISH_SQUEEZE').length,
    bear_non_flush: samples.filter(r => r.manual_parent === 'BEARISH_TREND' && r.manual_momentum !== 'FLUSH').length,
    flush: samples.filter(r => r.manual_momentum === 'FLUSH').length,
  },
  pass_counts: passCounts,
  top_candidates: candidates.slice(0, 50),
};

function line(c) {
  const s = c.score;
  return `| ${c.config.squeeze} | ${c.config.squeezeInvalidator} | ${c.config.bearish} | ${c.config.flush} | ${c.config.squeezeEntry}/${c.config.squeezeExit} | ${c.config.bearEntry}/${c.config.bearExit} | ${c.config.flushTtlHours}h | ${s.all_pass ? 'PASS' : 'FAIL'} | ${s.squeeze.pass ? 'Y' : 'N'} | ${s.bearish.pass ? 'Y' : 'N'} | ${s.flush.pass ? 'Y' : 'N'} | ${s.global.pass ? 'Y' : 'N'} | ${s.global.flips_per_day.toFixed(2)} | ${s.global.sub45_flickers} | ${pct(s.squeeze.recall)} | ${pct(s.bearish.coverage)} | ${pct(s.bearish.false_positive_rate)} | ${pct(s.flush.coverage)} |`;
}
function renderMd() {
  const lines = [];
  lines.push('# Regime Engine v1.3 Candidate Evaluation', '', `Generated: ${result.generated_at}`, '', '## Scope', '', '- Diagnostic only.', '- Adds squeeze invalidators on top of hysteresis, FLUSH sub-state, and bearish-confirmed squeeze-exit override.', '- Reuses frozen preregistration criteria; no alert wiring.', '', '## v1.3 change', '', 'BULLISH_SQUEEZE now requires the high-recall squeeze condition to remain un-invalidated by downside/reclaim-failure signals. If invalidated, squeeze state is cleared even before BEARISH_TREND is established.', '', '## Pass counts', '', '```json', JSON.stringify(passCounts, null, 2), '```', '', '## Top candidates', '', '| squeeze rule | squeeze invalidator | bearish rule | flush rule | sq e/x | bear e/x | flush ttl | all | sq | bear | flush | global | flips/day | flickers | sq recall | bear cov | bear FPR | flush cov |', '| --- | --- | --- | --- | ---: | ---: | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |');
  for (const c of candidates.slice(0, 25)) lines.push(line(c));
  lines.push('', '## Preliminary read', '');
  if (passCounts.all_pass > 0) lines.push(`- ${passCounts.all_pass} candidate(s) passed all preregistered historical criteria. Review examples before shadow-live writer.`);
  else lines.push('- No candidate passed all preregistered historical criteria. Do not wire shadow-live classifier yet without a v1.3 plan.');
  lines.push(`- Component pass counts: squeeze ${passCounts.squeeze_pass}, bearish ${passCounts.bearish_pass}, flush ${passCounts.flush_pass}, global ${passCounts.global_pass}.`);
  lines.push('- If global stability fails broadly, hysteresis alone is insufficient or thresholds need stronger state priority/transition handling.');
  lines.push('- FLUSH remains low-n and mechanism-based; even passing candidates are exclusion candidates only, not production rules.');
  return lines.join('\n');
}

fs.writeFileSync(OUT_JSON, JSON.stringify(result, null, 2) + '\n');
fs.writeFileSync(OUT_MD, renderMd() + '\n');
console.log(`Wrote ${path.relative(ROOT, OUT_JSON)}`);
console.log(`Wrote ${path.relative(ROOT, OUT_MD)}`);
console.log(JSON.stringify({ pass_counts: passCounts, top: candidates[0] }, null, 2));
