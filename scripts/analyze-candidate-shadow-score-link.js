#!/usr/bin/env node
/*
  Analyse whether readiness/shadow score ranges validate or invalidate selected
  non-Telegram opportunity candidates.

  Window defaults to the OI-fix/post-fix period: 2026-06-20T20:15:00Z.
  Excludes alerts actually delivered to Telegram, includes suppressed/log-only and
  missing readiness-shadow rows.
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const SINCE = Date.parse(process.argv.find(a => a.startsWith('--since='))?.slice(8) || '2026-06-20T20:15:00Z');
const UNTIL = Date.parse(process.argv.find(a => a.startsWith('--until='))?.slice(8) || new Date().toISOString());
const DEDUP_MS = Number(process.argv.find(a => a.startsWith('--dedup-hours='))?.slice(14) || 6) * 60 * 60 * 1000;
const HORIZONS = [1, 2, 3, 4, 5, 6];
const ASSETS = ['BTC', 'ETH', 'SOL'];

function readJson(file, fallback = null) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } }
function readJsonl(file) { try { return fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)); } catch { return []; } }
function ts(row) { return Date.parse(row?.timestamp_utc || row?.timestamp || row?.generated_at || ''); }
function num(x) { const n = Number(x); return Number.isFinite(n) ? n : null; }
function avg(a) { const v = a.filter(Number.isFinite); return v.length ? v.reduce((x, y) => x + y, 0) / v.length : null; }
function median(a) { const v = a.filter(Number.isFinite).sort((x, y) => x - y); if (!v.length) return null; const m = Math.floor(v.length / 2); return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; }
function pct(x, d = 1) { return Number.isFinite(x) ? `${x.toFixed(d)}%` : 'n/a'; }
function spct(x, d = 3) { return Number.isFinite(x) ? `${x >= 0 ? '+' : ''}${x.toFixed(d)}%` : 'n/a'; }
function inv(d) { return d === 'LONG' ? 'SHORT' : d === 'SHORT' ? 'LONG' : null; }
function dirFromType(type) { if (String(type || '').startsWith('LONG')) return 'LONG'; if (String(type || '').startsWith('SHORT')) return 'SHORT'; return null; }
function retPct(dir, entry, future) { if (!Number.isFinite(entry) || !Number.isFinite(future)) return null; const raw = (future - entry) / entry * 100; return dir === 'SHORT' ? -raw : raw; }
function flowOf(a) { return a?.diagnostics?.flow || a?.readiness_shadow?.source_metrics?.flow || 'NONE'; }
function priceOfAlert(a) { return num(a?.diagnostics?.price ?? a?.readiness_shadow?.source_metrics?.long_horizon_regime?.price); }
function shadowPrice(s) { return num(s?.source_metrics?.long_horizon_regime?.price); }
function oiOf(s) { return s?.source_metrics?.oi_price_regime || 'NONE'; }
function fundingOf(s) { return s?.source_metrics?.cross_exchange_positioning?.classification || 'NONE'; }
function normalizeBtcGate(gate) { return gate === 'BTC_CONFIRMS_ALT_LONG_CONTEXT' ? 'BTC_PERMITS_ALT_LONG_OBSERVATION' : (gate || 'NONE'); }
function btcGateOf(a) { return normalizeBtcGate(a?.diagnostics?.btc_gate || a?.readiness_shadow?.source_metrics?.btc_gate || a?.source_metrics?.btc_gate || 'NONE'); }
function bucket10(x) { const n = num(x); if (!Number.isFinite(n)) return 'UNKNOWN'; const lo = Math.floor(n / 10) * 10; return `${lo}-${lo + 9}`; }
function scoreLabel(e) { return `raw ${e.score ?? 'n/a'} / eff ${e.effective_score ?? 'n/a'} / ${e.shadow_state || 'NONE'}`; }

const priceRows = readJsonl(path.join(DATA, 'autoresearch', 'price-15m.jsonl'));
const priceIndex = Object.fromEntries(ASSETS.map(a => [a, []]));
for (const r of priceRows) {
  const t = ts(r); if (!Number.isFinite(t)) continue;
  for (const asset of ASSETS) {
    const p = num(r.prices?.[asset]?.lastPrice);
    if (Number.isFinite(p)) priceIndex[asset].push({ t, p });
  }
}
for (const rows of Object.values(priceIndex)) rows.sort((a, b) => a.t - b.t);
function atOrAfter(asset, target, maxLagMs = 25 * 60 * 1000) {
  const rows = priceIndex[asset] || []; let lo = 0, hi = rows.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (rows[m].t < target) lo = m + 1; else hi = m; }
  const r = rows[lo]; return r && r.t - target <= maxLagMs ? r : null;
}
function between(asset, start, end) { return (priceIndex[asset] || []).filter(r => r.t >= start && r.t <= end); }
function evalEvent(asset, t, entry, dir) {
  const horizons = {};
  for (const h of HORIZONS) {
    const r = atOrAfter(asset, t + h * 3600000);
    horizons[`${h}h`] = r ? retPct(dir, entry, r.p) : null;
  }
  let mfe = -Infinity, mae = Infinity, mfeMin = null, maeMin = null;
  for (const r of between(asset, t, t + 6 * 3600000)) {
    const v = retPct(dir, entry, r.p); if (!Number.isFinite(v)) continue;
    if (v > mfe) { mfe = v; mfeMin = Math.round((r.t - t) / 60000); }
    if (v < mae) { mae = v; maeMin = Math.round((r.t - t) / 60000); }
  }
  return { horizons, mfe6: Number.isFinite(mfe) ? mfe : null, mae6: Number.isFinite(mae) ? mae : null, mfeMin, maeMin };
}

const state = readJson(path.join(DATA, 'phase1d-alert-state.json'), {});
const telegram = state.telegram_delivery || {};
function deliveredToTelegram(id) { const d = telegram[id]; return d && d.ok === true && !d.skipped; }

const phaseAlerts = readJsonl(path.join(DATA, 'phase1d-alerts.jsonl'))
  .filter(a => { const t = ts(a); return Number.isFinite(t) && t >= SINCE && t <= UNTIL && !deliveredToTelegram(a.id); });
const emittedKeys = new Set(phaseAlerts.map(a => `${a.timestamp_utc}|${a.asset}|${dirFromType(a.type) || ''}`));

const shadowRows = readJsonl(path.join(DATA, 'readiness-shadow.jsonl'))
  .filter(s => { const t = ts(s); return Number.isFinite(t) && t >= SINCE && t <= UNTIL; });

const events = [];
for (const a of phaseAlerts) {
  const t = ts(a); const nd = dirFromType(a.type); const entry = priceOfAlert(a);
  if (!nd || !Number.isFinite(entry)) continue;
  const r = a.readiness_shadow || {};
  const base = {
    source: 'emitted_nontelegram', id: a.id, timestamp_utc: a.timestamp_utc, asset: a.asset, type: a.type,
    natural_direction: nd, flow: flowOf(a), btc_gate: btcGateOf(a), shadow_state: r.state || 'NONE',
    score: num(r.score), effective_score: num(r.effective_score), oi: oiOf(r), funding: fundingOf(r), entry,
  };
  for (const mode of ['natural', 'inverse']) {
    const direction = mode === 'natural' ? nd : inv(nd);
    events.push({ ...base, mode, direction, ...evalEvent(a.asset, t, entry, direction) });
  }
}
for (const s of shadowRows) {
  const t = ts(s); const key = `${s.timestamp_utc}|${s.asset}|${s.direction || ''}`;
  if (emittedKeys.has(key)) continue;
  const entry = shadowPrice(s); if (!s.direction || !Number.isFinite(entry)) continue;
  const base = {
    source: 'missing_shadow_no_alert', id: `shadow:${s.timestamp_utc}:${s.asset}:${s.direction}:${s.state}`,
    timestamp_utc: s.timestamp_utc, asset: s.asset, type: `SHADOW_${s.direction}`, natural_direction: s.direction,
    flow: s.source_metrics?.flow || 'NONE', btc_gate: normalizeBtcGate(s.source_metrics?.btc_gate || 'NONE'), shadow_state: s.state || 'NONE',
    score: num(s.score), effective_score: num(s.effective_score), oi: oiOf(s), funding: fundingOf(s), entry,
  };
  for (const mode of ['natural', 'inverse']) {
    const direction = mode === 'natural' ? s.direction : inv(s.direction);
    events.push({ ...base, mode, direction, ...evalEvent(s.asset, t, entry, direction) });
  }
}

const candidates = [
  { id: 'BTC_LONG_SETUP_INVERSE_SHORT_POSTFIX', label: 'BTC LONG_SETUP → inverse SHORT', mode: 'inverse', direction: 'SHORT', match: e => e.source === 'emitted_nontelegram' && e.asset === 'BTC' && e.type === 'LONG_SETUP' },
  { id: 'ETH_LONG_BLOCKED_SELL_PRESSURE_INVERSE_SHORT_POSTFIX', label: 'ETH blocked LONG + SELL_PRESSURE → inverse SHORT', mode: 'inverse', direction: 'SHORT', match: e => e.source === 'missing_shadow_no_alert' && e.asset === 'ETH' && e.natural_direction === 'LONG' && e.shadow_state === 'SHADOW_BLOCKED' && e.flow === 'SELL_PRESSURE' },
  { id: 'SOL_SHORT_BLOCKED_SPOT_LED_INVERSE_LONG_POSTFIX', label: 'SOL blocked SHORT + SPOT_LED_ACCUMULATION → inverse LONG', mode: 'inverse', direction: 'LONG', match: e => e.source === 'missing_shadow_no_alert' && e.asset === 'SOL' && e.natural_direction === 'SHORT' && e.shadow_state === 'SHADOW_BLOCKED' && e.flow === 'SPOT_LED_ACCUMULATION' },
  { id: 'ETH_LONG_SETUP_STRUCTURAL_BUYING_INVERSE_SHORT_POSTFIX', label: 'ETH LONG_SETUP + STRUCTURAL_BUYING → inverse SHORT', mode: 'inverse', direction: 'SHORT', match: e => e.source === 'emitted_nontelegram' && e.asset === 'ETH' && e.type === 'LONG_SETUP' && e.flow === 'STRUCTURAL_BUYING' },
  { id: 'ETH_BTC_PERMITS_ALT_LONG_INVERSE_SHORT_POSTFIX', label: 'ETH BTC_PERMITS_ALT_LONG_OBSERVATION → inverse SHORT', mode: 'inverse', direction: 'SHORT', match: e => e.source === 'missing_shadow_no_alert' && e.asset === 'ETH' && e.natural_direction === 'LONG' && e.btc_gate === 'BTC_PERMITS_ALT_LONG_OBSERVATION' },
  { id: 'ETH_LONGS_EXITING_BROAD_SHORT_PRESSURE_LONG_POSTFIX', label: 'ETH LONGS_EXITING + BROAD_SHORT_PRESSURE → natural LONG', mode: 'natural', direction: 'LONG', match: e => e.asset === 'ETH' && e.natural_direction === 'LONG' && e.oi === 'LONGS_EXITING' && e.funding === 'BROAD_SHORT_PRESSURE' },
  { id: 'SOL_SHORTS_COVERING_BROAD_SHORT_PRESSURE_INVERSE_SHORT_POSTFIX', label: 'SOL SHORTS_COVERING + BROAD_SHORT_PRESSURE → inverse SHORT', mode: 'inverse', direction: 'SHORT', match: e => e.asset === 'SOL' && e.natural_direction === 'LONG' && e.oi === 'SHORTS_COVERING' && e.funding === 'BROAD_SHORT_PRESSURE' },
];

function dedup(rows) {
  rows = rows.slice().sort((a, b) => ts(a) - ts(b));
  const out = []; let last = -Infinity;
  for (const r of rows) { const t = ts(r); if (t - last >= DEDUP_MS) { out.push(r); last = t; } }
  return out;
}
function summarizeRows(rows) {
  const out = { n: rows.length };
  for (const h of HORIZONS) {
    const vals = rows.map(r => r.horizons?.[`${h}h`]).filter(Number.isFinite);
    out[`${h}h`] = { n: vals.length, win: vals.length ? vals.filter(v => v > 0).length / vals.length * 100 : null, avg: avg(vals), med: median(vals) };
  }
  out.mfe6 = { med: median(rows.map(r => r.mfe6)), avg: avg(rows.map(r => r.mfe6)), med_min: median(rows.map(r => r.mfeMin)) };
  out.mae6 = { med: median(rows.map(r => r.mae6)), avg: avg(rows.map(r => r.mae6)), med_min: median(rows.map(r => r.maeMin)) };
  const scored = rows.map(r => r.score).filter(Number.isFinite);
  const eff = rows.map(r => r.effective_score).filter(Number.isFinite);
  out.score = { med: median(scored), min: scored.length ? Math.min(...scored) : null, max: scored.length ? Math.max(...scored) : null };
  out.effective_score = { med: median(eff), min: eff.length ? Math.min(...eff) : null, max: eff.length ? Math.max(...eff) : null };
  return out;
}
function summarizeBuckets(rows, by) {
  const m = new Map();
  for (const r of rows) { const k = by(r); if (!m.has(k)) m.set(k, []); m.get(k).push(r); }
  return [...m.entries()].map(([bucket, rs]) => ({ bucket, ...summarizeRows(rs) }))
    .sort((a, b) => String(a.bucket).localeCompare(String(b.bucket), undefined, { numeric: true }));
}
function validationCall(c) {
  const rows = c.dedup_rows;
  const states = summarizeBuckets(rows, r => r.shadow_state);
  const effBuckets = summarizeBuckets(rows, r => bucket10(r.effective_score));
  const rawBuckets = summarizeBuckets(rows, r => bucket10(r.score));
  const total = c.summary;
  let call = 'NO_CLEAR_LINK';
  let reason = 'Score buckets are too sparse or mixed; use pattern identity + behavior warning more than score.';
  if (states.length === 1 && /BLOCKED|NO_SETUP/.test(states[0].bucket) && total['1h'].win >= 70) {
    call = 'SHADOW_INVALIDATES_NATURAL_AND_VALIDATES_INVERSE';
    reason = `${states[0].bucket} on the natural/source direction coincides with strong ${c.direction} outcome.`;
  } else if (states.some(s => /SETUP_FORMING|CONFIRMED/.test(s.bucket) && (s['1h'].win || 0) >= 65)) {
    call = 'SHADOW_PARTLY_VALIDATES_TRADE_DIRECTION';
    reason = 'Higher shadow state has acceptable same-trade performance, but sample still needs caution.';
  } else if (total['1h'].win < 60 && (total['5h'].win >= 70 || total['6h'].win >= 70)) {
    call = 'SHADOW_NOT_ENTRY_TIMING_FILTER';
    reason = 'Edge is delayed; shadow score does not make this a quick-entry signal.';
  }
  return { call, reason, states, raw_score_buckets: rawBuckets, effective_score_buckets: effBuckets };
}

const results = [];
for (const c of candidates) {
  const raw = events.filter(e => e.mode === c.mode && e.direction === c.direction && c.match(e));
  const dedupRows = dedup(raw);
  const summary = summarizeRows(dedupRows);
  const detail = { ...c, raw_n: raw.length, dedup_n: dedupRows.length, summary, dedup_rows: dedupRows.map(r => ({ t: r.timestamp_utc, source: r.source, type: r.type, flow: r.flow, shadow: r.shadow_state, score: r.score, effective_score: r.effective_score, btc_gate: r.btc_gate, oi: r.oi, funding: r.funding, entry: r.entry, h1: r.horizons['1h'], h2: r.horizons['2h'], h4: r.horizons['4h'], h5: r.horizons['5h'], h6: r.horizons['6h'], mfe6: r.mfe6, mae6: r.mae6, mfeMin: r.mfeMin, maeMin: r.maeMin })) };
  Object.assign(detail, validationCall({ ...detail, dedup_rows: dedupRows }));
  delete detail.match;
  results.push(detail);
}

function bucketLine(b, horizon = '1h') {
  const h = b[horizon] || {}; return `${b.bucket}: n=${b.n}, ${horizon} ${pct(h.win)} avg ${spct(h.avg)}, MFE6 med ${spct(b.mfe6.med)} @${b.mfe6.med_min ?? 'n/a'}m, MAE6 med ${spct(b.mae6.med)} @${b.mae6.med_min ?? 'n/a'}m`;
}
const md = [];
md.push('# Candidate shadow-score link analysis');
md.push(`Generated: ${new Date().toISOString()}`);
md.push(`Window: ${new Date(SINCE).toISOString()} → ${new Date(UNTIL).toISOString()}`);
md.push('Excludes actually Telegram-delivered alerts; includes suppressed/log-only + missing shadow rows. Dedup: one episode per candidate per 6h.');
md.push('');
for (const r of results) {
  md.push(`## ${r.label}`);
  md.push(`- Pattern key: \`${r.id}\``);
  md.push(`- N: dedup ${r.dedup_n}, raw ${r.raw_n}`);
  md.push(`- Overall: 1h ${pct(r.summary['1h'].win)} avg ${spct(r.summary['1h'].avg)} | 2h ${pct(r.summary['2h'].win)} avg ${spct(r.summary['2h'].avg)} | 4h ${pct(r.summary['4h'].win)} avg ${spct(r.summary['4h'].avg)} | 5h ${pct(r.summary['5h'].win)} avg ${spct(r.summary['5h'].avg)} | 6h ${pct(r.summary['6h'].win)} avg ${spct(r.summary['6h'].avg)}`);
  md.push(`- Path: MFE6 med ${spct(r.summary.mfe6.med)} avg ${spct(r.summary.mfe6.avg)} @med ${r.summary.mfe6.med_min ?? 'n/a'}m | MAE6 med ${spct(r.summary.mae6.med)} avg ${spct(r.summary.mae6.avg)} @med ${r.summary.mae6.med_min ?? 'n/a'}m`);
  md.push(`- Shadow-score call: **${r.call}** — ${r.reason}`);
  md.push(`- Score range: raw ${r.summary.score.min ?? 'n/a'}–${r.summary.score.max ?? 'n/a'} med ${r.summary.score.med ?? 'n/a'}; effective ${r.summary.effective_score.min ?? 'n/a'}–${r.summary.effective_score.max ?? 'n/a'} med ${r.summary.effective_score.med ?? 'n/a'}`);
  md.push(`- By shadow state:`);
  for (const b of r.states) md.push(`  - ${bucketLine(b, r.summary['1h'].win >= 60 ? '1h' : (r.summary['5h'].win >= 70 ? '5h' : '4h'))}`);
  md.push(`- By raw score bucket:`);
  for (const b of r.raw_score_buckets) md.push(`  - ${bucketLine(b, r.summary['1h'].win >= 60 ? '1h' : (r.summary['5h'].win >= 70 ? '5h' : '4h'))}`);
  md.push(`- By effective score bucket:`);
  for (const b of r.effective_score_buckets) md.push(`  - ${bucketLine(b, r.summary['1h'].win >= 60 ? '1h' : (r.summary['5h'].win >= 70 ? '5h' : '4h'))}`);
  md.push('');
}

const outJson = path.join(DATA, 'candidate-shadow-score-link-current.json');
const outMd = path.join(DATA, 'candidate-shadow-score-link-current.md');
fs.writeFileSync(outJson, JSON.stringify({ generated_at: new Date().toISOString(), since: new Date(SINCE).toISOString(), until: new Date(UNTIL).toISOString(), dedup_hours: DEDUP_MS / 3600000, results }, null, 2));
fs.writeFileSync(outMd, md.join('\n') + '\n');
console.log(JSON.stringify({ ok: true, outJson: path.relative(ROOT, outJson), outMd: path.relative(ROOT, outMd), candidates: results.map(r => ({ id: r.id, dedup_n: r.dedup_n, raw_n: r.raw_n, call: r.call })) }, null, 2));
