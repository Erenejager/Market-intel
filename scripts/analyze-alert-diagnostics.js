#!/usr/bin/env node
/*
  Separates Phase 1D alert diagnostics into independent scorecards:

  1) Trade opportunity alerts: LONG_CONFIRMED / SHORT_CONFIRMED measured in their
     alert direction from alert time.
  2) Active trade-context lifecycle: contexts created by trade alerts, measured
     from activation and grouped by final health/status.
  3) Tracking / health alerts: ACTIVE_CONTEXT_* events measured both in original
     context direction and opposite direction from tracking-event time.

  Writes:
  - data/alert-diagnostics-report.json
  - data/alert-diagnostics-report.md

  Usage:
  - node scripts/analyze-alert-diagnostics.js
  - node scripts/analyze-alert-diagnostics.js --since 2026-05-26T09:29:00.000Z
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const ALERTS_PATH = path.join(DATA, 'phase1d-alerts.jsonl');
const PRICE_PATH = path.join(DATA, 'autoresearch', 'price-15m.jsonl');
const STATE_PATH = path.join(DATA, 'phase1d-alert-state.json');
const OUT_JSON = path.join(DATA, 'alert-diagnostics-report.json');
const OUT_MD = path.join(DATA, 'alert-diagnostics-report.md');

const HORIZONS = [
  { label: '1h', ms: 60 * 60 * 1000 },
  { label: '4h', ms: 4 * 60 * 60 * 1000 },
  { label: '24h', ms: 24 * 60 * 60 * 1000 },
];

function argValue(name) {
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : null;
}
function readJsonl(file) {
  try {
    return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map(line => JSON.parse(line));
  } catch {
    return [];
  }
}
function readJson(file, fallback = null) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}
function ts(row) { return Date.parse(row?.timestamp_utc || row?.timestamp || row || ''); }
function num(x) { const n = Number(x); return Number.isFinite(n) ? n : null; }
function avg(vals) { return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null; }
function median(vals) {
  const a = vals.filter(Number.isFinite).sort((x, y) => x - y);
  if (!a.length) return null;
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
}
function pct(x, d = 1) { return Number.isFinite(x) ? `${(x * 100).toFixed(d)}%` : 'n/a'; }
function ret(x, d = 3) { return Number.isFinite(x) ? `${x.toFixed(d)}%` : 'n/a'; }
function directionForType(type) {
  if (String(type || '').startsWith('LONG')) return 'LONG';
  if (String(type || '').startsWith('SHORT')) return 'SHORT';
  return null;
}
function opposite(direction) {
  if (direction === 'LONG') return 'SHORT';
  if (direction === 'SHORT') return 'LONG';
  return null;
}
function directionReturnPct(direction, entry, future) {
  if (!direction || !Number.isFinite(entry) || !Number.isFinite(future)) return null;
  const raw = ((future - entry) / entry) * 100;
  return direction === 'SHORT' ? -raw : raw;
}
function summarizeReturns(vals) {
  const clean = vals.filter(Number.isFinite);
  return {
    n: clean.length,
    hit_rate: clean.length ? clean.filter(v => v > 0).length / clean.length : null,
    avg_pct: avg(clean),
    median_pct: median(clean),
  };
}
function summarizeRows(rows, fieldPrefix = '') {
  const horizons = {};
  for (const h of HORIZONS) {
    horizons[h.label] = summarizeReturns(rows.map(r => r[`${fieldPrefix}${h.label}`]));
  }
  return { n: rows.length, horizons };
}
function groupBy(rows, fn) {
  const map = new Map();
  for (const row of rows) {
    const key = fn(row) || 'UNKNOWN';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(row);
  }
  return [...map.entries()].map(([key, bucketRows]) => ({ key, ...summarizeRows(bucketRows), rows: bucketRows }))
    .sort((a, b) => b.n - a.n || String(a.key).localeCompare(String(b.key)));
}
function groupByTracking(rows, fn, prefix) {
  const map = new Map();
  for (const row of rows) {
    const key = fn(row) || 'UNKNOWN';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(row);
  }
  return [...map.entries()].map(([key, bucketRows]) => ({ key, ...summarizeRows(bucketRows, prefix), rows: bucketRows }))
    .sort((a, b) => b.n - a.n || String(a.key).localeCompare(String(b.key)));
}
function buildPriceIndex(priceRows) {
  const byAsset = new Map();
  for (const row of priceRows) {
    const rowTs = ts(row);
    if (!Number.isFinite(rowTs)) continue;
    for (const [asset, obj] of Object.entries(row.prices || {})) {
      const price = num(obj?.lastPrice);
      if (!Number.isFinite(price)) continue;
      if (!byAsset.has(asset)) byAsset.set(asset, []);
      byAsset.get(asset).push({ t: rowTs, timestamp_utc: row.timestamp_utc, price });
    }
  }
  for (const arr of byAsset.values()) arr.sort((a, b) => a.t - b.t);
  return byAsset;
}
function priceAtOrAfter(priceIndex, asset, targetMs) {
  const arr = priceIndex.get(asset) || [];
  let lo = 0, hi = arr.length - 1, ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid].t >= targetMs) { ans = mid; hi = mid - 1; }
    else lo = mid + 1;
  }
  return ans >= 0 ? arr[ans] : null;
}
function pricesBetween(priceIndex, asset, startMs, endMs) {
  return (priceIndex.get(asset) || []).filter(s => s.t >= startMs && s.t <= endMs);
}
function addHorizons(row, priceIndex, asset, direction, entry, startMs, prefix = '') {
  for (const h of HORIZONS) {
    const p = priceAtOrAfter(priceIndex, asset, startMs + h.ms);
    row[`${prefix}${h.label}`] = p ? directionReturnPct(direction, entry, p.price) : null;
    row[`${prefix}${h.label}_at`] = p?.timestamp_utc || null;
  }
}
function addPathMetrics(row, priceIndex, asset, direction, entry, startMs, prefix = '') {
  const directional = pricesBetween(priceIndex, asset, startMs, startMs + 4 * 60 * 60 * 1000)
    .map(s => ({ ...s, directional_return_pct: directionReturnPct(direction, entry, s.price) }))
    .filter(s => Number.isFinite(s.directional_return_pct));
  if (!directional.length) {
    row[`${prefix}mfe_4h_pct`] = null;
    row[`${prefix}mfe_4h_at`] = null;
    row[`${prefix}minutes_to_mfe_4h`] = null;
    row[`${prefix}mae_4h_pct`] = null;
    row[`${prefix}mae_4h_at`] = null;
    row[`${prefix}first_favorable_at`] = null;
    row[`${prefix}minutes_to_first_favorable`] = null;
    row[`${prefix}favorable_anytime_4h`] = false;
    return;
  }
  const mfe = directional.reduce((best, s) => s.directional_return_pct > best.directional_return_pct ? s : best, directional[0]);
  const mae = directional.reduce((worst, s) => s.directional_return_pct < worst.directional_return_pct ? s : worst, directional[0]);
  const firstFav = directional.find(s => s.directional_return_pct > 0) || null;
  row[`${prefix}mfe_4h_pct`] = mfe.directional_return_pct;
  row[`${prefix}mfe_4h_at`] = mfe.timestamp_utc;
  row[`${prefix}minutes_to_mfe_4h`] = Math.round((mfe.t - startMs) / 60000);
  row[`${prefix}mae_4h_pct`] = mae.directional_return_pct;
  row[`${prefix}mae_4h_at`] = mae.timestamp_utc;
  row[`${prefix}first_favorable_at`] = firstFav?.timestamp_utc || null;
  row[`${prefix}minutes_to_first_favorable`] = firstFav ? Math.round((firstFav.t - startMs) / 60000) : null;
  row[`${prefix}favorable_anytime_4h`] = Boolean(firstFav);
}
function pathSummary(rows, prefix = '') {
  const complete = rows.filter(r => Number.isFinite(r[`${prefix}mfe_4h_pct`]));
  const favorable = complete.filter(r => r[`${prefix}favorable_anytime_4h`]);
  return {
    n: complete.length,
    favorable_anytime_rate: complete.length ? favorable.length / complete.length : null,
    avg_mfe_4h_pct: avg(complete.map(r => r[`${prefix}mfe_4h_pct`]).filter(Number.isFinite)),
    avg_mae_4h_pct: avg(complete.map(r => r[`${prefix}mae_4h_pct`]).filter(Number.isFinite)),
    median_minutes_to_first_favorable: median(favorable.map(r => r[`${prefix}minutes_to_first_favorable`]).filter(Number.isFinite)),
    median_minutes_to_mfe: median(complete.map(r => r[`${prefix}minutes_to_mfe_4h`]).filter(Number.isFinite)),
  };
}
function tradeBucket(alert) {
  if (alert.telegram_suppressed) return `suppressed:${alert.telegram_suppressed.reason || 'unknown'}`;
  if (alert.active_context_created) return `context_created:${alert.active_context_created.readiness_tier || 'unknown'}`;
  if (alert.active_context_blocked) return `context_blocked:${alert.active_context_blocked.reason || 'unknown'}`;
  if (alert.empirical_watch?.active_context === false) return `watch_only:${alert.empirical_watch.key || 'unknown'}`;
  return 'delivered_no_context_marker';
}
function contextRowsFromState(state, sinceMs, priceIndex) {
  const archived = Array.isArray(state?.active_context_history) ? state.active_context_history : [];
  const active = Object.entries(state?.active_contexts || {}).map(([asset, ctx]) => ({ asset, ...ctx, close_reason: 'ACTIVE_NOW', closed_at: null }));
  return [...archived, ...active]
    .filter(ctx => Number.isFinite(Date.parse(ctx.activated_at)) && Date.parse(ctx.activated_at) >= sinceMs)
    .map(ctx => {
      const row = {
        timestamp_utc: ctx.activated_at,
        closed_at: ctx.closed_at || null,
        asset: ctx.asset,
        direction: ctx.direction,
        source_type: ctx.source_type,
        score: num(ctx.readiness_gate?.score),
        readiness_tier: ctx.readiness_tier || null,
        oi_context: ctx.oi_context || null,
        funding_context: ctx.funding_context || null,
        final_health: ctx.health?.status || 'UNKNOWN',
        max_adverse_pct: num(ctx.health?.max_adverse_pct),
        close_reason: ctx.close_reason || null,
        entry: num(ctx.activated_price),
      };
      addHorizons(row, priceIndex, row.asset, row.direction, row.entry, Date.parse(row.timestamp_utc));
      addPathMetrics(row, priceIndex, row.asset, row.direction, row.entry, Date.parse(row.timestamp_utc));
      return row;
    });
}
function main() {
  const sinceArg = argValue('--since');
  const sinceMs = sinceArg ? Date.parse(sinceArg) : 0;
  if (sinceArg && !Number.isFinite(sinceMs)) throw new Error(`Invalid --since: ${sinceArg}`);

  const alerts = readJsonl(ALERTS_PATH).filter(a => Number.isFinite(ts(a)) && ts(a) >= sinceMs).sort((a, b) => ts(a) - ts(b));
  const priceIndex = buildPriceIndex(readJsonl(PRICE_PATH));
  const state = readJson(STATE_PATH, {});

  const tradeRows = alerts
    .filter(a => ['LONG_CONFIRMED', 'SHORT_CONFIRMED'].includes(a.type))
    .map(alert => {
      const direction = directionForType(alert.type);
      const entry = num(alert.diagnostics?.price);
      const row = {
        timestamp_utc: alert.timestamp_utc,
        asset: alert.asset,
        type: alert.type,
        direction,
        entry,
        severity: alert.severity || null,
        score: num(alert.readiness_shadow?.effective_score ?? alert.readiness_shadow?.score),
        shadow_state: alert.readiness_shadow?.state || null,
        oi: alert.readiness_shadow?.source_metrics?.oi_price_regime || null,
        funding: alert.readiness_shadow?.source_metrics?.cross_exchange_positioning?.classification || null,
        btc_gate: alert.readiness_shadow?.source_metrics?.btc_gate || alert.diagnostics?.btc_gate || null,
        pattern_key: alert.empirical_watch?.key || alert.pattern?.key || null,
        pattern_verdict: alert.empirical_watch?.verdict || alert.pattern?.verdict || null,
        diagnostics_bucket: tradeBucket(alert),
      };
      addHorizons(row, priceIndex, row.asset, direction, entry, ts(alert));
      addPathMetrics(row, priceIndex, row.asset, direction, entry, ts(alert));
      return row;
    });

  const contextRows = contextRowsFromState(state, sinceMs, priceIndex);

  const trackingRows = alerts
    .filter(a => ['ACTIVE_CONTEXT_STRESSED', 'ACTIVE_CONTEXT_RECOVERING', 'ACTIVE_CONTEXT_FAILED', 'ACTIVE_CONTEXT_BTC_WEAK'].includes(a.type))
    .map(alert => {
      const ctx = alert.active_context || alert.invalidates || alert.active_context_created || {};
      const originalDirection = ctx.direction || null;
      const entry = num(alert.diagnostics?.price);
      const row = {
        timestamp_utc: alert.timestamp_utc,
        asset: alert.asset,
        type: alert.type,
        original_direction: originalDirection,
        opposite_direction: opposite(originalDirection),
        entry,
        context_activated_at: ctx.activated_at || null,
        context_source_type: ctx.source_type || null,
        context_score: num(ctx.readiness_gate?.score),
        context_oi: ctx.oi_context || null,
        context_funding: ctx.funding_context || null,
        health_status: ctx.health?.status || null,
        health_adverse_pct: num(ctx.health?.adverse_pct),
        health_max_adverse_pct: num(ctx.health?.max_adverse_pct),
      };
      addHorizons(row, priceIndex, row.asset, originalDirection, entry, ts(alert), 'original_');
      addHorizons(row, priceIndex, row.asset, opposite(originalDirection), entry, ts(alert), 'opposite_');
      addPathMetrics(row, priceIndex, row.asset, originalDirection, entry, ts(alert), 'original_');
      addPathMetrics(row, priceIndex, row.asset, opposite(originalDirection), entry, ts(alert), 'opposite_');
      return row;
    });

  const report = {
    generated_at: new Date().toISOString(),
    since: sinceArg || null,
    inputs: { alerts: ALERTS_PATH, prices: PRICE_PATH, state: STATE_PATH },
    trade_opportunity: {
      purpose: 'Entry/opportunity quality. Directional return is measured in alert direction from LONG_CONFIRMED / SHORT_CONFIRMED time.',
      summary: summarizeRows(tradeRows),
      path_4h: pathSummary(tradeRows),
      by_type: groupBy(tradeRows, r => r.type).map(({ rows, ...x }) => x),
      by_asset: groupBy(tradeRows, r => r.asset).map(({ rows, ...x }) => x),
      by_diagnostics_bucket: groupBy(tradeRows, r => r.diagnostics_bucket).map(({ rows, ...x }) => x),
      by_pattern: groupBy(tradeRows.filter(r => r.pattern_key), r => r.pattern_key).map(({ rows, ...x }) => x),
      rows: tradeRows,
    },
    active_context_lifecycle: {
      purpose: 'Trade-context quality after context creation. Directional return is measured in context direction from activation time, grouped by final health/status.',
      summary: summarizeRows(contextRows),
      path_4h: pathSummary(contextRows),
      by_final_health: groupBy(contextRows, r => r.final_health).map(({ rows, ...x }) => x),
      by_direction: groupBy(contextRows, r => r.direction).map(({ rows, ...x }) => x),
      by_source_type: groupBy(contextRows, r => r.source_type).map(({ rows, ...x }) => x),
      rows: contextRows,
    },
    tracking_health: {
      purpose: 'Tracking/management quality. Original and opposite returns are both measured from ACTIVE_CONTEXT_* tracking-event time.',
      original_summary: summarizeRows(trackingRows, 'original_'),
      opposite_summary: summarizeRows(trackingRows, 'opposite_'),
      original_path_4h: pathSummary(trackingRows, 'original_'),
      opposite_path_4h: pathSummary(trackingRows, 'opposite_'),
      by_type_original: groupByTracking(trackingRows, r => r.type, 'original_').map(({ rows, ...x }) => x),
      by_type_opposite: groupByTracking(trackingRows, r => r.type, 'opposite_').map(({ rows, ...x }) => x),
      rows: trackingRows,
    },
  };

  fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2) + '\n');

  const md = [];
  const oneLine = s => `n=${s.n} | 1h ${pct(s.horizons['1h'].hit_rate)} avg ${ret(s.horizons['1h'].avg_pct)} n=${s.horizons['1h'].n} | 4h ${pct(s.horizons['4h'].hit_rate)} avg ${ret(s.horizons['4h'].avg_pct)} n=${s.horizons['4h'].n}`;
  const pathLine = s => `4h path favorable-anytime ${pct(s.favorable_anytime_rate)} n=${s.n} | avg MFE ${ret(s.avg_mfe_4h_pct)} | avg MAE ${ret(s.avg_mae_4h_pct)} | median first favorable ${Number.isFinite(s.median_minutes_to_first_favorable) ? `${s.median_minutes_to_first_favorable}m` : 'n/a'} | median max favorable ${Number.isFinite(s.median_minutes_to_mfe) ? `${s.median_minutes_to_mfe}m` : 'n/a'}`;
  const rowLine = r => `${r.timestamp_utc} ${r.asset} ${r.type || r.source_type || ''} ${r.direction || ''} | 4h close ${ret(r['4h'])} | favorable anytime? ${r.favorable_anytime_4h ? 'yes' : 'no'} | first favorable ${r.first_favorable_at || 'n/a'} | MFE ${ret(r.mfe_4h_pct)} @ ${r.mfe_4h_at || 'n/a'} | MAE ${ret(r.mae_4h_pct)} | bucket ${r.diagnostics_bucket || r.final_health || ''}`;
  md.push('# Alert Diagnostics Report');
  md.push('');
  md.push(`Generated: ${report.generated_at}`);
  md.push(`Since: ${report.since || 'all available data'}`);
  md.push('');
  md.push('## 1. Trade opportunity alerts');
  md.push('Measured from LONG_CONFIRMED / SHORT_CONFIRMED in the alert direction. This is the entry/opportunity scorecard only.');
  md.push(`- Overall: ${oneLine(report.trade_opportunity.summary)}`);
  md.push(`- ${pathLine(report.trade_opportunity.path_4h)}`);
  md.push('');
  md.push('### By type');
  for (const s of report.trade_opportunity.by_type) md.push(`- ${s.key}: ${oneLine(s)}`);
  md.push('');
  md.push('### By diagnostics bucket');
  for (const s of report.trade_opportunity.by_diagnostics_bucket) md.push(`- ${s.key}: ${oneLine(s)}`);
  md.push('');
  md.push('### Trade rows — 4h path detail');
  for (const r of tradeRows) md.push(`- ${rowLine(r)}`);
  md.push('');
  md.push('## 2. Active context lifecycle');
  md.push('Measured from active-context activation in context direction. This separates context creation quality from later tracking alerts.');
  md.push(`- Overall: ${oneLine(report.active_context_lifecycle.summary)}`);
  md.push(`- ${pathLine(report.active_context_lifecycle.path_4h)}`);
  md.push('');
  md.push('### By final health');
  for (const s of report.active_context_lifecycle.by_final_health) md.push(`- ${s.key}: ${oneLine(s)}`);
  md.push('');
  md.push('### Active context rows — 4h path detail');
  for (const r of contextRows) md.push(`- ${rowLine(r)}`);
  md.push('');
  md.push('## 3. Tracking / health alerts');
  md.push('Measured from ACTIVE_CONTEXT_* event time. Original = existing context direction; opposite = inverse direction.');
  md.push(`- Original direction overall: ${oneLine(report.tracking_health.original_summary)}`);
  md.push(`- Opposite direction overall: ${oneLine(report.tracking_health.opposite_summary)}`);
  md.push(`- Original ${pathLine(report.tracking_health.original_path_4h)}`);
  md.push(`- Opposite ${pathLine(report.tracking_health.opposite_path_4h)}`);
  md.push('');
  md.push('### Original direction by tracking type');
  for (const s of report.tracking_health.by_type_original) md.push(`- ${s.key}: ${oneLine(s)}`);
  md.push('');
  md.push('### Opposite direction by tracking type');
  for (const s of report.tracking_health.by_type_opposite) md.push(`- ${s.key}: ${oneLine(s)}`);
  md.push('');
  md.push('### Tracking rows — 4h path detail');
  for (const r of trackingRows) {
    md.push(`- ${r.timestamp_utc} ${r.asset} ${r.type} original ${r.original_direction}: 4h close ${ret(r.original_4h)} | favorable anytime? ${r.original_favorable_anytime_4h ? 'yes' : 'no'} | first favorable ${r.original_first_favorable_at || 'n/a'} | MFE ${ret(r.original_mfe_4h_pct)} @ ${r.original_mfe_4h_at || 'n/a'} || opposite ${r.opposite_direction}: 4h close ${ret(r.opposite_4h)} | favorable anytime? ${r.opposite_favorable_anytime_4h ? 'yes' : 'no'} | first favorable ${r.opposite_first_favorable_at || 'n/a'} | MFE ${ret(r.opposite_mfe_4h_pct)} @ ${r.opposite_mfe_4h_at || 'n/a'}`);
  }
  md.push('');
  md.push('## Interpretation guide');
  md.push('- Trade opportunity win-rate answers: “Was the entry alert direction right?”');
  md.push('- Active context lifecycle answers: “Did contexts created by trade alerts remain profitable after activation?”');
  md.push('- Tracking/health win-rate answers: “When health changed, was it useful as hold/exit/opposite information?”');
  md.push('- Do not mix these three into one win-rate; they have different jobs.');
  fs.writeFileSync(OUT_MD, md.join('\n') + '\n');

  console.log(JSON.stringify({ ok: true, out_json: OUT_JSON, out_md: OUT_MD, since: report.since, trade_rows: tradeRows.length, context_rows: contextRows.length, tracking_rows: trackingRows.length }, null, 2));
}

if (require.main === module) main();
