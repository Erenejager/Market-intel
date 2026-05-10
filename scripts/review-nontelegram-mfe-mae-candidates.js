#!/usr/bin/env node
/*
  Review non-Telegram/log-only alerts with the central candidate-review rule.

  Uses actual traded direction, independent 6h episode dedupe, and 6h MFE/MAE
  distributions. Mean/fixed-horizon win rate is secondary only.
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const ASSETS = ['BTC', 'ETH', 'SOL'];
const HORIZONS = [1, 2, 3, 4, 5, 6];
const DEDUP_MS = 6 * 60 * 60 * 1000;
const DEFAULT_DAYS = 15;
const daysArg = process.argv.find(a => a.startsWith('--days='));
const sinceArg = process.argv.find(a => a.startsWith('--since='));
const minNArg = process.argv.find(a => a.startsWith('--min-n='));
const MIN_N = Number(minNArg?.slice(8) || 5);
const SINCE = sinceArg ? Date.parse(sinceArg.slice(8)) : Date.now() - Number(daysArg?.slice(7) || DEFAULT_DAYS) * 24 * 60 * 60 * 1000;
const UNTIL = Date.now();
const MIN_MFE_BEATS_MAE_PCT = 70;
const OI_DATA_FIX_CUTOFF_MS = Date.parse('2026-06-20T20:15:00Z');

function readJson(file, fallback = null) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } }
function readJsonl(file) { try { return fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)); } catch { return []; } }
function ts(row) { return Date.parse(row.timestamp_utc || row.timestamp || row.generated_at || ''); }
function num(x) { const n = Number(x); return Number.isFinite(n) ? n : null; }
function avg(vals) { const v = vals.filter(Number.isFinite); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; }
function percentile(vals, p) {
  const arr = vals.filter(Number.isFinite).sort((a, b) => a - b);
  if (!arr.length) return null;
  const idx = (arr.length - 1) * p;
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  if (lo === hi) return arr[lo];
  return arr[lo] + (arr[hi] - arr[lo]) * (idx - lo);
}
function dist(vals) {
  const arr = vals.filter(Number.isFinite).sort((a, b) => a - b);
  if (!arr.length) return null;
  return { n: arr.length, min: arr[0], p25: percentile(arr, 0.25), median: percentile(arr, 0.5), p75: percentile(arr, 0.75), max: arr[arr.length - 1], values: arr.map(v => Number(v.toFixed(6))) };
}
function pct(x, d = 1) { return Number.isFinite(x) ? `${x.toFixed(d)}%` : 'n/a'; }
function spct(x, d = 3) { return Number.isFinite(x) ? `${x >= 0 ? '+' : ''}${x.toFixed(d)}%` : 'n/a'; }
function dirFromType(type) { if (String(type || '').startsWith('LONG')) return 'LONG'; if (String(type || '').startsWith('SHORT')) return 'SHORT'; return null; }
function opposite(d) { return d === 'LONG' ? 'SHORT' : d === 'SHORT' ? 'LONG' : null; }
const INVERTING_VERDICTS = new Set(['fade_candidate', 'avoid_original', 'avoid_original_short_primed']);
function tradeDirection(alert) {
  if (alert?.research_note?.trade_direction) return alert.research_note.trade_direction;
  const natural = dirFromType(alert?.type) || alert?.readiness_shadow?.direction || null;
  const verdict = alert?.empirical_watch?.verdict || alert?.pattern?.verdict || null;
  if (INVERTING_VERDICTS.has(verdict)) return opposite(natural);
  return natural;
}
function naturalDirection(alert) { return dirFromType(alert?.type) || alert?.readiness_shadow?.direction || null; }
function retPct(dir, entry, future) { if (!Number.isFinite(entry) || !Number.isFinite(future) || entry === 0) return null; const raw = (future - entry) / entry * 100; return dir === 'SHORT' ? -raw : raw; }
function patternKey(alert) { return alert?.empirical_watch?.key || alert?.pattern?.key || alert?.research_note?.pattern_key || null; }
function entryPrice(alert) { return num(alert?.diagnostics?.price ?? alert?.readiness_shadow?.source_metrics?.long_horizon_regime?.price); }
function flow(alert) { return alert?.diagnostics?.flow || alert?.readiness_shadow?.source_metrics?.flow || 'NONE'; }
function oi(alert) { return alert?.readiness_shadow?.source_metrics?.oi_price_regime || 'NONE'; }
function funding(alert) { return alert?.readiness_shadow?.source_metrics?.cross_exchange_positioning?.classification || 'NONE'; }
function btcGate(alert) { return alert?.diagnostics?.btc_gate || alert?.readiness_shadow?.source_metrics?.btc_gate || 'NONE'; }

const prices = Object.fromEntries(ASSETS.map(a => [a, []]));
for (const row of readJsonl(path.join(DATA, 'autoresearch', 'price-15m.jsonl'))) {
  const t = ts(row); if (!Number.isFinite(t)) continue;
  for (const asset of ASSETS) {
    const p = num(row.prices?.[asset]?.lastPrice);
    if (Number.isFinite(p)) prices[asset].push({ t, price: p });
  }
}
for (const rows of Object.values(prices)) rows.sort((a, b) => a.t - b.t);
function priceAtOrAfter(asset, target, maxLagMs = 25 * 60 * 1000) {
  const rows = prices[asset] || [];
  let lo = 0, hi = rows.length;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (rows[mid].t < target) lo = mid + 1; else hi = mid; }
  const r = rows[lo];
  return r && r.t - target <= maxLagMs ? r : null;
}
function pricesBetween(asset, start, end) { return (prices[asset] || []).filter(r => r.t >= start && r.t <= end); }
function evaluate(alert) {
  const t = ts(alert), asset = alert.asset, dir = tradeDirection(alert), entry = entryPrice(alert);
  if (!Number.isFinite(t) || !asset || !ASSETS.includes(asset) || !dir || !Number.isFinite(entry)) return null;
  const horizons = {};
  for (const h of HORIZONS) {
    const p = priceAtOrAfter(asset, t + h * 60 * 60 * 1000);
    horizons[`${h}h`] = p ? retPct(dir, entry, p.price) : null;
  }
  const pathRows = pricesBetween(asset, t, t + 6 * 60 * 60 * 1000);
  let best = null, worst = null;
  for (const p of pathRows) {
    const dr = retPct(dir, entry, p.price);
    if (!Number.isFinite(dr)) continue;
    if (!best || dr > best.dr) best = { dr, t: p.t };
    if (!worst || dr < worst.dr) worst = { dr, t: p.t };
  }
  if (!best || !worst) return null;
  return {
    id: alert.id,
    timestamp_utc: alert.timestamp_utc,
    t,
    asset,
    type: alert.type,
    severity: alert.severity,
    direction: dir,
    natural_direction: naturalDirection(alert),
    pattern: patternKey(alert),
    flow: flow(alert),
    oi: oi(alert),
    funding: funding(alert),
    btc_gate: btcGate(alert),
    suppressed_reason: alert.telegram_suppressed?.reason || null,
    entry,
    horizons,
    mfe6: best.dr,
    mae6: worst.dr,
    minutes_to_mfe: Math.round((best.t - t) / 60000),
    minutes_to_mae: Math.round((worst.t - t) / 60000),
    favorable_first: best.t <= worst.t,
    mfe_beats_mae: best.dr > Math.abs(worst.dr),
    post_oi_fix: t >= OI_DATA_FIX_CUTOFF_MS,
  };
}

const state = readJson(path.join(DATA, 'phase1d-alert-state.json'), {});
const telegram = state.telegram_delivery || {};
function deliveredToTelegram(id) { const d = telegram[id]; return d && d.ok === true && !d.skipped; }

const allAlerts = readJsonl(path.join(DATA, 'phase1d-alerts.jsonl'));
const rows = [];
for (const alert of allAlerts) {
  const t = ts(alert);
  if (!Number.isFinite(t) || t < SINCE || t > UNTIL) continue;
  if (deliveredToTelegram(alert.id)) continue;
  const ev = evaluate(alert);
  if (ev) rows.push(ev);
}

function dedup(events) {
  const sorted = events.slice().sort((a, b) => a.t - b.t);
  const out = [];
  const lastByAsset = new Map();
  for (const ev of sorted) {
    const last = lastByAsset.get(ev.asset) ?? -Infinity;
    if (ev.t - last >= DEDUP_MS) { out.push(ev); lastByAsset.set(ev.asset, ev.t); }
  }
  return out;
}
function horizonSummary(events) {
  const out = {};
  for (const h of HORIZONS) {
    const label = `${h}h`;
    const vals = events.map(e => e.horizons[label]).filter(Number.isFinite);
    out[label] = { n: vals.length, win_rate_pct: vals.length ? vals.filter(v => v > 0).length / vals.length * 100 : null, avg_pct: avg(vals), median_pct: percentile(vals, 0.5) };
  }
  return out;
}
function bestHorizon(horizons, n) {
  return Object.entries(horizons)
    .filter(([, v]) => v.n >= Math.min(n, 5) && Number.isFinite(v.win_rate_pct))
    .sort((a, b) => b[1].win_rate_pct - a[1].win_rate_pct || b[1].avg_pct - a[1].avg_pct)[0] || null;
}
function summarize(kind, key, rawEvents) {
  const events = dedup(rawEvents);
  if (events.length < MIN_N) return null;
  const horizons = horizonSummary(events);
  const best = bestHorizon(horizons, events.length);
  const mfe = events.map(e => e.mfe6), mae = events.map(e => e.mae6);
  const rrN = events.filter(e => Number.isFinite(e.mfe6) && Number.isFinite(e.mae6)).length;
  const rrCount = events.filter(e => e.mfe_beats_mae).length;
  const favN = events.filter(e => typeof e.favorable_first === 'boolean').length;
  const favCount = events.filter(e => e.favorable_first).length;
  const postFixN = events.filter(e => e.post_oi_fix).length;
  const exactPattern = kind === 'pattern';
  const mfeDist = dist(mfe), maeDist = dist(mae);
  const rrPct = rrN ? rrCount / rrN * 100 : null;
  const goodPath = rrN >= MIN_N && rrPct >= MIN_MFE_BEATS_MAE_PCT && Number.isFinite(mfeDist?.p25) && mfeDist.p25 > 0.15 && Number.isFinite(maeDist?.median) && maeDist.median > -1.0;
  const maybeTailRisk = Number.isFinite(maeDist?.p25) && maeDist.p25 <= -1.25;
  const oiDependent = key.includes('SHORTS_COVERING') || key.includes('LONGS_EXITING') || key.includes('FRESH_LONGS') || key.includes('FRESH_SHORTS') || key.includes('|SHORTS_COVERING|') || key.includes('|LONGS_EXITING|') || key.includes('|FRESH_LONGS|') || key.includes('|FRESH_SHORTS|');
  const quarantined = oiDependent && postFixN < Math.min(events.length, 20);
  return {
    kind, key, exactPattern, raw_n: rawEvents.length, n: events.length, post_fix_n: postFixN, quarantined,
    assets: [...new Set(events.map(e => e.asset))].sort(),
    types: [...new Set(events.map(e => e.type))].sort().slice(0, 8),
    direction: [...new Set(events.map(e => e.direction))].sort().join('/'),
    best_horizon: best?.[0] || null,
    best_win_rate_pct: best?.[1]?.win_rate_pct ?? null,
    best_avg_pct: best?.[1]?.avg_pct ?? null,
    one_h: horizons['1h'], horizons,
    path6h: {
      mfe_distribution: mfeDist,
      mae_distribution: maeDist,
      episodes_mfe_beats_mae_n: rrN,
      episodes_mfe_beats_mae_count: rrCount,
      episodes_mfe_beats_mae_pct: rrPct,
      favorable_first_rate_pct: favN ? favCount / favN * 100 : null,
      median_minutes_to_mfe: percentile(events.map(e => e.minutes_to_mfe), 0.5),
      median_minutes_to_mae: percentile(events.map(e => e.minutes_to_mae), 0.5),
    },
    goodPath, maybeTailRisk,
    examples: events.slice(-4).map(e => ({ timestamp_utc: e.timestamp_utc, asset: e.asset, type: e.type, pattern: e.pattern, reason: e.suppressed_reason, entry: e.entry, mfe6: Number(e.mfe6.toFixed(4)), mae6: Number(e.mae6.toFixed(4)) })),
  };
}

const groupers = [
  ['pattern', e => e.pattern],
  ['asset_type', e => `${e.asset}|${e.type}|${e.direction}`],
  ['asset_type_flow', e => `${e.asset}|${e.type}|${e.flow}|${e.direction}`],
  ['asset_flow', e => `${e.asset}|${e.flow}|${e.direction}`],
  ['asset_oi_funding', e => `${e.asset}|${e.oi}|${e.funding}|${e.direction}`],
  ['asset_btcgate', e => `${e.asset}|${e.btc_gate}|${e.direction}`],
];
const summaries = [];
for (const [kind, fn] of groupers) {
  const groups = new Map();
  for (const ev of rows) {
    const key = fn(ev);
    if (!key || key.includes('undefined')) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(ev);
  }
  for (const [key, evs] of groups) {
    const s = summarize(kind, key, evs);
    if (s) summaries.push(s);
  }
}

const exactStrong = summaries.filter(s => s.kind === 'pattern' && s.goodPath && !s.quarantined).sort((a, b) => b.path6h.episodes_mfe_beats_mae_pct - a.path6h.episodes_mfe_beats_mae_pct || b.n - a.n || (b.path6h.mfe_distribution?.p25 ?? -Infinity) - (a.path6h.mfe_distribution?.p25 ?? -Infinity));
const exactWatch = summaries.filter(s => s.kind === 'pattern' && s.goodPath && s.quarantined).sort((a, b) => b.path6h.episodes_mfe_beats_mae_pct - a.path6h.episodes_mfe_beats_mae_pct || b.n - a.n);
const broadStrong = summaries.filter(s => s.kind !== 'pattern' && s.goodPath && !s.quarantined).sort((a, b) => b.path6h.episodes_mfe_beats_mae_pct - a.path6h.episodes_mfe_beats_mae_pct || b.n - a.n).slice(0, 80);
const badPath = summaries.filter(s => s.kind === 'pattern' && s.path6h.episodes_mfe_beats_mae_n >= MIN_N && s.path6h.episodes_mfe_beats_mae_pct < 50).sort((a, b) => a.path6h.episodes_mfe_beats_mae_pct - b.path6h.episodes_mfe_beats_mae_pct || b.n - a.n);

function line(s) {
  const p = s.path6h;
  return `- ${s.kind} ${s.key} | n=${s.n} raw=${s.raw_n} postFix=${s.post_fix_n}${s.quarantined ? ' QUARANTINED' : ''} | dir ${s.direction} | MFE>|MAE| ${pct(p.episodes_mfe_beats_mae_pct)} (${p.episodes_mfe_beats_mae_count}/${p.episodes_mfe_beats_mae_n}) | MFE p25/med/p75 ${spct(p.mfe_distribution?.p25)}/${spct(p.mfe_distribution?.median)}/${spct(p.mfe_distribution?.p75)} | MAE p25/med/p75 ${spct(p.mae_distribution?.p25)}/${spct(p.mae_distribution?.median)}/${spct(p.mae_distribution?.p75)} | fav-first ${pct(p.favorable_first_rate_pct)} | best ${s.best_horizon || 'n/a'} ${pct(s.best_win_rate_pct)} avg ${spct(s.best_avg_pct)}${s.maybeTailRisk ? ' | tail-risk' : ''}`;
}
const md = [];
md.push('# Non-Telegram MFE/MAE Candidate Review');
md.push(`Generated: ${new Date().toISOString()}`);
md.push(`Window: ${new Date(SINCE).toISOString()} → ${new Date(UNTIL).toISOString()}`);
md.push(`Scope: phase1d alerts not actually delivered to Telegram. Dry/skipped/suppressed/log-only rows included.`);
md.push(`Rule: actual traded direction, 6h path, >=6h independent episode dedupe, min n=${MIN_N}, strong if MFE>|MAE| >= ${MIN_MFE_BEATS_MAE_PCT}% plus distribution sanity.`);
md.push(`Central rule: CANDIDATE-REVIEW-RULES.md`);
md.push(`Events evaluated: ${rows.length}; summaries: ${summaries.length}.`);
md.push('\n## Exact pattern buckets that pass path gate');
for (const s of exactStrong) md.push(line(s));
md.push('\n## Exact pattern buckets that pass path gate but are quarantined/low post-fix evidence');
for (const s of exactWatch) md.push(line(s));
md.push('\n## Broad buckets that pass path gate (secondary only; require exact-pattern validation before Telegram)');
for (const s of broadStrong) md.push(line(s));
md.push('\n## Exact pattern buckets with bad path (<50% MFE>|MAE|)');
for (const s of badPath) md.push(line(s));

const output = { generated_at: new Date().toISOString(), since: new Date(SINCE).toISOString(), until: new Date(UNTIL).toISOString(), min_n: MIN_N, rule: { min_mfe_beats_mae_pct: MIN_MFE_BEATS_MAE_PCT, dedup_ms: DEDUP_MS }, counts: { events: rows.length, summaries: summaries.length, exactStrong: exactStrong.length, exactWatch: exactWatch.length, broadStrong: broadStrong.length, badPath: badPath.length }, exactStrong, exactWatch, broadStrong, badPath, all: summaries };
const outJson = path.join(DATA, 'nontelegram-mfe-mae-candidate-review-current.json');
const outMd = path.join(DATA, 'nontelegram-mfe-mae-candidate-review-current.md');
fs.writeFileSync(outJson, JSON.stringify(output, null, 2));
fs.writeFileSync(outMd, `${md.join('\n')}\n`);
console.log(JSON.stringify({ ok: true, outJson: path.relative(ROOT, outJson), outMd: path.relative(ROOT, outMd), counts: output.counts }, null, 2));
