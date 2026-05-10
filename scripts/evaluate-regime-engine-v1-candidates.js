#!/usr/bin/env node
/*
  Regime engine v1 candidate evaluator.

  Sweeps simple BTC_PRICE_ONLY threshold rules against manual_btc_price_regime_v1
  reference labels and scores them against data/regime-engine-v1-preregistration.md.

  This is diagnostic only. It does not write live regime state or affect alerts.
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const PRICE_PATH = path.join(DATA, 'autoresearch', 'price-15m.jsonl');
const LABELS_PATH = path.join(DATA, 'regime-labels-manual-v1.json');
const OUT_JSON = path.join(DATA, 'regime-engine-v1-candidate-evaluation.json');
const OUT_MD = path.join(DATA, 'regime-engine-v1-candidate-evaluation.md');

const MS = 60 * 1000;
const HOUR = 60 * MS;
const DAY = 24 * HOUR;
const SAMPLE_MS = 15 * MS;

function readJsonl(file) { return fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse); }
function ts(r) { return Date.parse(r.timestamp_utc || r.timestamp || ''); }
function num(x) { const n = Number(x); return Number.isFinite(n) ? n : null; }
function pct(x, d = 1) { return Number.isFinite(x) ? `${(x * 100).toFixed(d)}%` : 'n/a'; }
function pp(x, d = 3) { return Number.isFinite(x) ? `${x.toFixed(d)}%` : 'n/a'; }
function mins(x) { return Number.isFinite(x) ? `${Math.round(x / MS)}m` : 'n/a'; }
function avg(vals) { return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null; }
function median(vals) { if (!vals.length) return null; const s = vals.slice().sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
function max(vals) { return vals.length ? Math.max(...vals) : null; }

const pricesRaw = readJsonl(PRICE_PATH).map(r => ({
  timestamp_utc: r.timestamp_utc,
  t: ts(r),
  price: num(r.prices?.BTC?.lastPrice),
})).filter(r => Number.isFinite(r.t) && Number.isFinite(r.price)).sort((a, b) => a.t - b.t);
const labels = JSON.parse(fs.readFileSync(LABELS_PATH, 'utf8'));
const windows = labels.windows.map(w => ({ ...w, s: Date.parse(w.start), e: Date.parse(w.end) }));

function labelAt(t) {
  return windows.find(w => t >= w.s && t < w.e) || null;
}
function lowerBound(arr, x) { let lo = 0, hi = arr.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (arr[mid].t < x) lo = mid + 1; else hi = mid; } return lo; }
function priceAtOrBefore(t) {
  let i = lowerBound(pricesRaw, t);
  if (i >= pricesRaw.length || pricesRaw[i].t > t) i--;
  return i >= 0 ? pricesRaw[i] : null;
}
function windowPrices(start, end) {
  const out = [];
  let i = lowerBound(pricesRaw, start);
  while (i < pricesRaw.length && pricesRaw[i].t <= end) out.push(pricesRaw[i++]);
  return out;
}
function retPct(t, lookbackMs) {
  const end = priceAtOrBefore(t);
  const start = priceAtOrBefore(t - lookbackMs);
  if (!end || !start || start.price === 0) return null;
  return ((end.price - start.price) / start.price) * 100;
}
function sma(t, lookbackMs) {
  const rows = windowPrices(t - lookbackMs, t);
  return rows.length ? avg(rows.map(r => r.price)) : null;
}
function distFromSmaPct(t, lookbackMs) {
  const p = priceAtOrBefore(t)?.price;
  const s = sma(t, lookbackMs);
  return Number.isFinite(p) && Number.isFinite(s) && s !== 0 ? ((p - s) / s) * 100 : null;
}
function realizedRangePct(t, lookbackMs) {
  const rows = windowPrices(t - lookbackMs, t);
  if (rows.length < 2) return null;
  const ps = rows.map(r => r.price);
  const hi = Math.max(...ps), lo = Math.min(...ps);
  const p = rows.at(-1).price;
  return p ? ((hi - lo) / p) * 100 : null;
}
function medianRangePct(t, windowMs, periods) {
  const vals = [];
  for (let i = 1; i <= periods; i++) {
    const v = realizedRangePct(t - (i - 1) * windowMs, windowMs);
    if (Number.isFinite(v)) vals.push(v);
  }
  return median(vals);
}

const samples = pricesRaw.map(r => {
  const lab = labelAt(r.t);
  const ret4h = retPct(r.t, 4 * HOUR);
  const prior4h = (() => {
    const now = priceAtOrBefore(r.t - 4 * HOUR);
    const prev = priceAtOrBefore(r.t - 8 * HOUR);
    return now && prev && prev.price ? ((now.price - prev.price) / prev.price) * 100 : null;
  })();
  const range4h = realizedRangePct(r.t, 4 * HOUR);
  const medRange4h = medianRangePct(r.t - 4 * HOUR, 4 * HOUR, 12);
  return {
    ...r,
    manual_label: lab?.label || 'UNCLASSIFIED',
    manual_parent: lab?.parent_regime || 'UNCLASSIFIED',
    manual_momentum: lab?.momentum_type || 'UNCLASSIFIED',
    manual_confidence: lab?.confidence || 'UNKNOWN',
    features: {
      ret4h,
      ret8h: retPct(r.t, 8 * HOUR),
      ret24h: retPct(r.t, 24 * HOUR),
      ret7d: retPct(r.t, 7 * DAY),
      dist5d: distFromSmaPct(r.t, 5 * DAY),
      dist7d: distFromSmaPct(r.t, 7 * DAY),
      range4h,
      range4h_ratio: Number.isFinite(range4h) && Number.isFinite(medRange4h) && medRange4h > 0 ? range4h / medRange4h : null,
      prior4h,
      accel4h: Number.isFinite(ret4h) && Number.isFinite(prior4h) ? ret4h - prior4h : null,
    },
  };
}).filter(s => s.manual_label !== 'UNCLASSIFIED');

function segments(rows, pred) {
  const segs = [];
  let cur = null;
  for (const r of rows) {
    const yes = pred(r);
    if (yes && !cur) cur = { start: r.t, end: r.t, rows: [r] };
    else if (yes && cur) { cur.end = r.t; cur.rows.push(r); }
    else if (!yes && cur) { segs.push(cur); cur = null; }
  }
  if (cur) segs.push(cur);
  return segs.map(s => ({ ...s, durationMs: s.end - s.start + SAMPLE_MS }));
}
function manualWindowRows(filterFn) { return samples.filter(filterFn); }
function rowsInWindow(w) { return samples.filter(r => r.t >= w.s && r.t < w.e); }
function firstDetectionDelay(window, pred) {
  const rows = rowsInWindow(window);
  const first = rows.find(pred);
  return first ? first.t - window.s : null;
}
function maxMissedSegmentInWindow(window, pred) {
  const rows = rowsInWindow(window);
  const miss = segments(rows, r => !pred(r));
  return max(miss.map(s => s.durationMs)) ?? 0;
}
function maxFalseSegmentInWindows(winFilter, pred) {
  let m = 0;
  for (const w of windows.filter(winFilter)) {
    const seg = segments(rowsInWindow(w), pred);
    const localMax = max(seg.map(s => s.durationMs)) || 0;
    if (localMax > m) m = localMax;
  }
  return m;
}
function falsePositiveRate(rows, pred) {
  return rows.length ? rows.filter(pred).length / rows.length : null;
}
function recall(rows, pred) {
  return rows.length ? rows.filter(pred).length / rows.length : null;
}
function flipsPerDay(rows, classifier) {
  let flips = 0;
  let prev = null;
  for (const r of rows) {
    const cur = classifier(r);
    if (prev !== null && cur !== prev) flips++;
    prev = cur;
  }
  const days = (rows.at(-1).t - rows[0].t) / DAY;
  return days > 0 ? flips / days : null;
}
function sub45Flickers(rows, classifier) {
  const segs = [];
  let cur = null;
  for (const r of rows) {
    const c = classifier(r);
    if (!cur) cur = { label: c, start: r.t, end: r.t, rows: [r] };
    else if (cur.label === c) { cur.end = r.t; cur.rows.push(r); }
    else { segs.push(cur); cur = { label: c, start: r.t, end: r.t, rows: [r] }; }
  }
  if (cur) segs.push(cur);
  return segs.filter(s => (s.end - s.start + SAMPLE_MS) < 45 * MS).length;
}

const squeezeRows = manualWindowRows(r => r.manual_label === 'BULLISH_SQUEEZE');
const nonBearRows = manualWindowRows(r => r.manual_parent !== 'BEARISH_TREND');
const bearNonFlushRows = manualWindowRows(r => r.manual_parent === 'BEARISH_TREND' && r.manual_momentum !== 'FLUSH');
const flushRows = manualWindowRows(r => r.manual_momentum === 'FLUSH');

const candidateSets = [];

function addCandidate(kind, name, params, pred) {
  candidateSets.push({ kind, name, params, pred });
}

for (const th of [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4]) {
  addCandidate('BULLISH_SQUEEZE', `ret4h_gt_${th}`, { ret4h_gt: th }, r => Number.isFinite(r.features.ret4h) && r.features.ret4h > th);
}
for (const th of [0.75, 1, 1.5, 2, 2.5, 3, 4, 5, 6]) {
  addCandidate('BULLISH_SQUEEZE', `ret24h_gt_${th}`, { ret24h_gt: th }, r => Number.isFinite(r.features.ret24h) && r.features.ret24h > th);
}
for (const th of [0, 0.25, 0.5, 0.75, 1, 1.5, 2]) {
  addCandidate('BULLISH_SQUEEZE', `dist5d_gt_${th}`, { dist5d_gt: th }, r => Number.isFinite(r.features.dist5d) && r.features.dist5d > th);
}
for (const ret of [0.25, 0.5, 0.75, 1, 1.25, 1.5]) {
  for (const dist of [0, 0.25, 0.5, 0.75, 1]) {
    addCandidate('BULLISH_SQUEEZE', `ret4h_gt_${ret}_or_dist5d_gt_${dist}`, { ret4h_gt: ret, dist5d_gt: dist }, r => (Number.isFinite(r.features.ret4h) && r.features.ret4h > ret) || (Number.isFinite(r.features.dist5d) && r.features.dist5d > dist));
  }
}

for (const th of [-0.5, -0.75, -1, -1.25, -1.5, -2, -2.5, -3, -4]) {
  addCandidate('BEARISH_TREND', `ret24h_lt_${th}`, { ret24h_lt: th }, r => Number.isFinite(r.features.ret24h) && r.features.ret24h < th);
}
for (const th of [-1, -2, -3, -4, -5, -6, -8, -10, -12]) {
  addCandidate('BEARISH_TREND', `ret7d_lt_${th}`, { ret7d_lt: th }, r => Number.isFinite(r.features.ret7d) && r.features.ret7d < th);
}
for (const th of [-0.5, -1, -1.5, -2, -2.5, -3, -4, -5]) {
  addCandidate('BEARISH_TREND', `dist5d_lt_${th}`, { dist5d_lt: th }, r => Number.isFinite(r.features.dist5d) && r.features.dist5d < th);
}
for (const ret24 of [-0.5, -1, -1.5, -2, -2.5]) {
  for (const dist of [-0.5, -1, -1.5, -2]) {
    addCandidate('BEARISH_TREND', `ret24h_lt_${ret24}_and_dist5d_lt_${dist}`, { ret24h_lt: ret24, dist5d_lt: dist }, r => Number.isFinite(r.features.ret24h) && Number.isFinite(r.features.dist5d) && r.features.ret24h < ret24 && r.features.dist5d < dist);
  }
}

for (const ret4 of [-1, -1.5, -2, -2.5, -3, -4]) {
  for (const accel of [-0.5, -1, -1.5, -2]) {
    for (const ratio of [1.1, 1.25, 1.5, 1.75, 2]) {
      addCandidate('FLUSH_CANDIDATE', `ret4h_lt_${ret4}_accel_lt_${accel}_range_ratio_gt_${ratio}`, { ret4h_lt: ret4, accel4h_lt: accel, range4h_ratio_gt: ratio }, r =>
        Number.isFinite(r.features.ret4h) && r.features.ret4h < ret4 &&
        Number.isFinite(r.features.accel4h) && r.features.accel4h < accel &&
        Number.isFinite(r.features.range4h_ratio) && r.features.range4h_ratio > ratio
      );
    }
  }
}
for (const ret4 of [-1, -1.5, -2, -2.5, -3]) {
  for (const dist of [-1, -2, -3, -4]) {
    for (const ratio of [1.25, 1.5, 1.75, 2]) {
      addCandidate('FLUSH_CANDIDATE', `ret4h_lt_${ret4}_dist5d_lt_${dist}_range_ratio_gt_${ratio}`, { ret4h_lt: ret4, dist5d_lt: dist, range4h_ratio_gt: ratio }, r =>
        Number.isFinite(r.features.ret4h) && r.features.ret4h < ret4 &&
        Number.isFinite(r.features.dist5d) && r.features.dist5d < dist &&
        Number.isFinite(r.features.range4h_ratio) && r.features.range4h_ratio > ratio
      );
    }
  }
}

function scoreCandidate(c) {
  if (c.kind === 'BULLISH_SQUEEZE') {
    const rec = recall(squeezeRows, c.pred);
    const squeezeWin = windows.find(w => w.label === 'BULLISH_SQUEEZE');
    const delay = firstDetectionDelay(squeezeWin, c.pred);
    const maxMiss = maxMissedSegmentInWindow(squeezeWin, c.pred);
    const maxFalseBear = maxFalseSegmentInWindows(w => w.parent_regime === 'BEARISH_TREND', c.pred);
    const pass = rec >= 0.8 && delay !== null && delay <= 60 * MS && maxMiss <= 2 * HOUR && maxFalseBear <= 2 * HOUR;
    return { ...c, score: { recall: rec, delay_ms: delay, max_missed_ms: maxMiss, max_false_bear_ms: maxFalseBear, pass } };
  }
  if (c.kind === 'BEARISH_TREND') {
    const fpr = falsePositiveRate(nonBearRows, c.pred);
    const cov = recall(bearNonFlushRows, c.pred);
    const delays = windows.filter(w => w.parent_regime === 'BEARISH_TREND' && w.momentum_type !== 'FLUSH').map(w => firstDetectionDelay(w, c.pred)).filter(Number.isFinite);
    const delay = median(delays);
    const maxSqueezeBear = maxFalseSegmentInWindows(w => w.label === 'BULLISH_SQUEEZE', c.pred);
    const pass = fpr <= 0.15 && cov >= 0.7 && delay !== null && delay <= 2 * HOUR && maxSqueezeBear <= 45 * MS;
    return { ...c, score: { false_positive_rate: fpr, coverage: cov, median_delay_ms: delay, max_squeeze_false_ms: maxSqueezeBear, pass } };
  }
  if (c.kind === 'FLUSH_CANDIDATE') {
    const covFlush = recall(flushRows, c.pred);
    const identifiesFlush = covFlush > 0;
    let maxFalsePerGrindWindow = 0;
    const falseExamples = [];
    for (const w of windows.filter(w => ['GRIND', 'CONTINUATION'].includes(w.momentum_type))) {
      const segs = segments(rowsInWindow(w), c.pred);
      maxFalsePerGrindWindow = Math.max(maxFalsePerGrindWindow, segs.length);
      for (const s of segs.slice(0, 5)) falseExamples.push({ window: w.label, start: new Date(s.start).toISOString(), duration_min: Math.round(s.durationMs / MS) });
    }
    const pass = identifiesFlush && maxFalsePerGrindWindow <= 2;
    return { ...c, score: { flush_coverage: covFlush, identifies_flush: identifiesFlush, max_false_segments_per_grind_or_continuation_window: maxFalsePerGrindWindow, false_examples: falseExamples.slice(0, 8), pass } };
  }
  return c;
}

const scored = candidateSets.map(scoreCandidate);
function top(kind, sortFn, n = 12) { return scored.filter(c => c.kind === kind).sort(sortFn).slice(0, n); }
const byKind = {
  BULLISH_SQUEEZE: scored.filter(c => c.kind === 'BULLISH_SQUEEZE'),
  BEARISH_TREND: scored.filter(c => c.kind === 'BEARISH_TREND'),
  FLUSH_CANDIDATE: scored.filter(c => c.kind === 'FLUSH_CANDIDATE'),
};

// Construct simple composite options from top individual candidates.
const squeezeBest = top('BULLISH_SQUEEZE', (a, b) => Number(b.score.pass) - Number(a.score.pass) || b.score.recall - a.score.recall || a.score.max_false_bear_ms - b.score.max_false_bear_ms, 5);
const bearBest = top('BEARISH_TREND', (a, b) => Number(b.score.pass) - Number(a.score.pass) || a.score.false_positive_rate - b.score.false_positive_rate || b.score.coverage - a.score.coverage, 5);
const flushBest = top('FLUSH_CANDIDATE', (a, b) => Number(b.score.pass) - Number(a.score.pass) || b.score.flush_coverage - a.score.flush_coverage || a.score.max_false_segments_per_grind_or_continuation_window - b.score.max_false_segments_per_grind_or_continuation_window, 5);

function compositeClassifier(sq, bear, fl) {
  return r => {
    if (sq.pred(r)) return 'BULLISH_SQUEEZE';
    if (fl.pred(r)) return 'FLUSH_CANDIDATE';
    if (bear.pred(r)) return 'BEARISH_TREND';
    return 'NEUTRAL';
  };
}
const composites = [];
for (const sq of squeezeBest) for (const bear of bearBest) for (const fl of flushBest) {
  const cls = compositeClassifier(sq, bear, fl);
  const fpd = flipsPerDay(samples, cls);
  const flickers = sub45Flickers(samples, cls);
  const unknown = samples.filter(r => cls(r) === 'UNKNOWN').length / samples.length;
  composites.push({
    squeeze: sq.name,
    bearish: bear.name,
    flush: fl.name,
    flips_per_day: fpd,
    sub45_flickers: flickers,
    unknown_rate: unknown,
    pass_global: fpd <= 3 && flickers === 0 && unknown < 0.10,
    pass_components: sq.score.pass && bear.score.pass && fl.score.pass,
  });
}
composites.sort((a, b) => Number(b.pass_components && b.pass_global) - Number(a.pass_components && a.pass_global) || a.flips_per_day - b.flips_per_day || a.sub45_flickers - b.sub45_flickers);

const result = {
  generated_at: new Date().toISOString(),
  inputs: { prices: PRICE_PATH, labels: LABELS_PATH, preregistration: path.join(DATA, 'regime-engine-v1-preregistration.md') },
  samples: { total: samples.length, first: samples[0]?.timestamp_utc, last: samples.at(-1)?.timestamp_utc, squeeze: squeezeRows.length, non_bear: nonBearRows.length, bear_non_flush: bearNonFlushRows.length, flush: flushRows.length },
  candidate_counts: Object.fromEntries(Object.entries(byKind).map(([k, v]) => [k, v.length])),
  pass_counts: Object.fromEntries(Object.entries(byKind).map(([k, v]) => [k, v.filter(c => c.score.pass).length])),
  top: {
    BULLISH_SQUEEZE: top('BULLISH_SQUEEZE', (a, b) => Number(b.score.pass) - Number(a.score.pass) || b.score.recall - a.score.recall || a.score.max_false_bear_ms - b.score.max_false_bear_ms, 20),
    BEARISH_TREND: top('BEARISH_TREND', (a, b) => Number(b.score.pass) - Number(a.score.pass) || a.score.false_positive_rate - b.score.false_positive_rate || b.score.coverage - a.score.coverage, 20),
    FLUSH_CANDIDATE: top('FLUSH_CANDIDATE', (a, b) => Number(b.score.pass) - Number(a.score.pass) || b.score.flush_coverage - a.score.flush_coverage || a.score.max_false_segments_per_grind_or_continuation_window - b.score.max_false_segments_per_grind_or_continuation_window, 20),
    composites: composites.slice(0, 20),
  },
  all_candidates: scored.map(c => ({ kind: c.kind, name: c.name, params: c.params, score: c.score })),
};

function mdCandidateLine(c) {
  if (c.kind === 'BULLISH_SQUEEZE') return `| ${c.name} | ${c.score.pass ? 'PASS' : 'FAIL'} | recall ${pct(c.score.recall)} | delay ${mins(c.score.delay_ms)} | max missed ${mins(c.score.max_missed_ms)} | false in bear ${mins(c.score.max_false_bear_ms)} |`;
  if (c.kind === 'BEARISH_TREND') return `| ${c.name} | ${c.score.pass ? 'PASS' : 'FAIL'} | FPR ${pct(c.score.false_positive_rate)} | coverage ${pct(c.score.coverage)} | delay ${mins(c.score.median_delay_ms)} | squeeze false ${mins(c.score.max_squeeze_false_ms)} |`;
  if (c.kind === 'FLUSH_CANDIDATE') return `| ${c.name} | ${c.score.pass ? 'PASS' : 'FAIL'} | flush coverage ${pct(c.score.flush_coverage)} | false seg cap ${c.score.max_false_segments_per_grind_or_continuation_window} | | |`;
  return '';
}
function renderMd() {
  const lines = [];
  lines.push('# Regime Engine v1 Candidate Evaluation', '', `Generated: ${result.generated_at}`, '', '## Scope', '', '- Diagnostic threshold sweep only.', '- Manual labels are reference labels, not validated ground truth.', '- No alert wiring.', '', '## Sample counts', '', '```json', JSON.stringify(result.samples, null, 2), '```', '', '## Pass counts', '', '```json', JSON.stringify(result.pass_counts, null, 2), '```', '');
  for (const kind of ['BULLISH_SQUEEZE', 'BEARISH_TREND', 'FLUSH_CANDIDATE']) {
    lines.push(`## ${kind} top candidates`, '', '| candidate | verdict | metric 1 | metric 2 | metric 3 | metric 4 |', '| --- | --- | --- | --- | --- | --- |');
    for (const c of result.top[kind].slice(0, 15)) lines.push(mdCandidateLine(c));
    lines.push('');
  }
  lines.push('## Composite candidates', '', '| squeeze | bearish | flush | component pass | global pass | flips/day | sub45 flickers |', '| --- | --- | --- | --- | --- | ---: | ---: |');
  for (const c of result.top.composites.slice(0, 15)) {
    lines.push(`| ${c.squeeze} | ${c.bearish} | ${c.flush} | ${c.pass_components ? 'PASS' : 'FAIL'} | ${c.pass_global ? 'PASS' : 'FAIL'} | ${c.flips_per_day.toFixed(2)} | ${c.sub45_flickers} |`);
  }
  lines.push('', '## Preliminary read', '', '- Passing individual thresholds are discovery candidates only; wide passing bands matter more than single thresholds.', '- Composite global stability is expected to be difficult with raw threshold rules; if flip/flicker fails, add hysteresis/persistence before live shadow logging.', '- FLUSH remains mechanism-based and low-n; do not promote to hard exclusion from this report alone.', '');
  return lines.join('\n');
}

fs.writeFileSync(OUT_JSON, JSON.stringify(result, null, 2) + '\n');
fs.writeFileSync(OUT_MD, renderMd() + '\n');
console.log(`Wrote ${path.relative(ROOT, OUT_JSON)}`);
console.log(`Wrote ${path.relative(ROOT, OUT_MD)}`);
console.log(JSON.stringify({ pass_counts: result.pass_counts, top_composite: result.top.composites[0] }, null, 2));
