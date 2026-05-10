#!/usr/bin/env node
/*
  Fresh scan for non-Telegram alert opportunities.
  - Excludes alerts actually delivered to Telegram (ok && !skipped).
  - Tests natural and inverse direction over 1h..6h.
  - Reports >70% positive buckets, <30% natural buckets that may be inverse candidates,
    and shadow/readiness rows that did not emit alerts (missing alert opportunities).
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const SINCE = Date.parse(process.argv.find(a => a.startsWith('--since='))?.slice(8) || '2026-06-20T20:15:00Z');
const UNTIL = Date.now();
const MIN_N = Number(process.argv.find(a => a.startsWith('--min-n='))?.slice(8) || 8);
const DEDUP_MS = 6 * 60 * 60 * 1000;
const HORIZONS = [1,2,3,4,5,6];
const ASSETS = ['BTC','ETH','SOL'];

function readJson(file, fallback = null) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } }
function readJsonl(file) { try { return fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)); } catch { return []; } }
function ts(row) { return Date.parse(row.timestamp_utc || row.timestamp || row.generated_at || ''); }
function num(x) { const n = Number(x); return Number.isFinite(n) ? n : null; }
function pct(x, d=1) { return Number.isFinite(x) ? `${x.toFixed(d)}%` : 'n/a'; }
function spct(x, d=3) { return Number.isFinite(x) ? `${x>=0?'+':''}${x.toFixed(d)}%` : 'n/a'; }
function avg(a) { const v=a.filter(Number.isFinite); return v.length ? v.reduce((x,y)=>x+y,0)/v.length : null; }
function median(a) { const v=a.filter(Number.isFinite).sort((x,y)=>x-y); if (!v.length) return null; const m=Math.floor(v.length/2); return v.length%2?v[m]:(v[m-1]+v[m])/2; }
function q(a, p) { const v=a.filter(Number.isFinite).sort((x,y)=>x-y); if (!v.length) return null; return v[Math.min(v.length-1, Math.max(0, Math.floor((v.length-1)*p)))]; }
function dirFromType(type) { if (String(type||'').startsWith('LONG')) return 'LONG'; if (String(type||'').startsWith('SHORT')) return 'SHORT'; return null; }
function inv(d) { return d === 'LONG' ? 'SHORT' : d === 'SHORT' ? 'LONG' : null; }
function retPct(dir, entry, future) { if (!Number.isFinite(entry) || !Number.isFinite(future)) return null; const raw=(future-entry)/entry*100; return dir==='SHORT' ? -raw : raw; }
function priceOfAlert(a) { return num(a.diagnostics?.price ?? a.readiness_shadow?.source_metrics?.long_horizon_regime?.price); }
function shadowPrice(s) { return num(s.source_metrics?.long_horizon_regime?.price); }
function flowOf(a) { return a.diagnostics?.flow || a.readiness_shadow?.source_metrics?.flow || 'NONE'; }
function oiOfShadow(s) { return s.source_metrics?.oi_price_regime || 'NONE'; }
function fundOfShadow(s) { return s.source_metrics?.cross_exchange_positioning?.classification || 'NONE'; }
function btcGateOf(a) { return a.diagnostics?.btc_gate || a.readiness_shadow?.source_metrics?.btc_gate || 'NONE'; }
function patternOf(a) { return a.empirical_watch?.key || a.pattern?.key || null; }

const pricesRows = readJsonl(path.join(DATA, 'autoresearch', 'price-15m.jsonl'));
const priceIndex = Object.fromEntries(ASSETS.map(a => [a, []]));
for (const r of pricesRows) {
  const t = ts(r); if (!Number.isFinite(t)) continue;
  for (const asset of ASSETS) {
    const p = num(r.prices?.[asset]?.lastPrice);
    if (Number.isFinite(p)) priceIndex[asset].push({t,p});
  }
}
for (const rows of Object.values(priceIndex)) rows.sort((a,b)=>a.t-b.t);
function atOrAfter(asset, target, maxLagMs=25*60*1000) {
  const rows=priceIndex[asset]||[]; let lo=0,hi=rows.length;
  while (lo<hi) { const m=(lo+hi)>>1; if (rows[m].t<target) lo=m+1; else hi=m; }
  const r=rows[lo]; return r && r.t-target<=maxLagMs ? r : null;
}
function between(asset, start, end) { return (priceIndex[asset]||[]).filter(r => r.t>=start && r.t<=end); }
function evalEvent(asset, t, entry, dir) {
  if (!Number.isFinite(entry) || !dir) return null;
  const horizons = {};
  for (const h of HORIZONS) {
    const r=atOrAfter(asset, t+h*3600000);
    horizons[`${h}h`] = r ? retPct(dir, entry, r.p) : null;
  }
  const path=between(asset, t, t+6*3600000);
  let mfe=-Infinity, mae=Infinity, mfeMin=null, maeMin=null;
  for (const r of path) {
    const v=retPct(dir, entry, r.p);
    if (!Number.isFinite(v)) continue;
    if (v>mfe) { mfe=v; mfeMin=Math.round((r.t-t)/60000); }
    if (v<mae) { mae=v; maeMin=Math.round((r.t-t)/60000); }
  }
  return { horizons, mfe6: Number.isFinite(mfe)?mfe:null, mae6: Number.isFinite(mae)?mae:null, mfeMin, maeMin };
}

const state = readJson(path.join(DATA, 'phase1d-alert-state.json'), {});
const telegram = state.telegram_delivery || {};
function deliveredToTelegram(id) { const d=telegram[id]; return d && d.ok === true && !d.skipped; }

const phaseAlerts = readJsonl(path.join(DATA, 'phase1d-alerts.jsonl'))
  .filter(a => { const t=ts(a); return Number.isFinite(t) && t>=SINCE && t<=UNTIL && !deliveredToTelegram(a.id); });
const emittedKeys = new Set(phaseAlerts.map(a => `${a.timestamp_utc}|${a.asset}|${dirFromType(a.type)||''}`));
const allAlertIds = new Set(readJsonl(path.join(DATA, 'phase1d-alerts.jsonl')).map(a => a.id));

const events = [];
for (const a of phaseAlerts) {
  const t=ts(a); const nd=dirFromType(a.type); if (!nd) continue;
  const entry=priceOfAlert(a); if (!Number.isFinite(entry)) continue;
  const base = {
    source: 'emitted_nontelegram', id:a.id, timestamp_utc:a.timestamp_utc, asset:a.asset, type:a.type,
    severity:a.severity, flow:flowOf(a), btc_gate:btcGateOf(a), pattern:patternOf(a),
    shadow_state:a.readiness_shadow?.state || 'NONE', oi:a.readiness_shadow?.source_metrics?.oi_price_regime || 'NONE',
    funding:a.readiness_shadow?.source_metrics?.cross_exchange_positioning?.classification || 'NONE', entry
  };
  for (const mode of ['natural','inverse']) {
    const dir = mode==='natural' ? nd : inv(nd);
    const ev = evalEvent(a.asset, t, entry, dir); if (!ev) continue;
    events.push({...base, mode, direction:dir, natural_direction:nd, ...ev});
  }
}

const shadowRows = readJsonl(path.join(DATA, 'readiness-shadow.jsonl'))
  .filter(s => { const t=ts(s); return Number.isFinite(t) && t>=SINCE && t<=UNTIL; });
for (const s of shadowRows) {
  const t=ts(s); const key=`${s.timestamp_utc}|${s.asset}|${s.direction||''}`;
  // Missing opportunity = readiness/shadow row with no emitted nontelegram alert for that exact asset+direction timestamp.
  // Keep both setup rows and near-threshold/blocked rows; later grouping will decide whether any edge exists.
  if (emittedKeys.has(key)) continue;
  const entry=shadowPrice(s); if (!Number.isFinite(entry) || !s.direction) continue;
  const base={
    source:'missing_shadow_no_alert', id:`shadow:${s.timestamp_utc}:${s.asset}:${s.direction}:${s.state}`,
    timestamp_utc:s.timestamp_utc, asset:s.asset, type:`SHADOW_${s.direction}`, severity:'SHADOW',
    flow:s.source_metrics?.flow || 'NONE', btc_gate:s.source_metrics?.btc_gate || 'NONE', pattern:null,
    shadow_state:s.state || 'NONE', oi:oiOfShadow(s), funding:fundOfShadow(s), score:s.score, effective_score:s.effective_score,
    setup_detected:!!s.setup_detected, blocked:Object.keys(s.hard_gates||{}).join('+') || 'NONE', entry
  };
  for (const mode of ['natural','inverse']) {
    const dir = mode==='natural' ? s.direction : inv(s.direction);
    const ev = evalEvent(s.asset, t, entry, dir); if (!ev) continue;
    events.push({...base, mode, direction:dir, natural_direction:s.direction, ...ev});
  }
}

function addGroup(map, key, ev) { if (!map.has(key)) map.set(key, []); map.get(key).push(ev); }
const groupers = [
  ['asset_type_mode', e => `${e.asset}|${e.type}|${e.mode}`],
  ['asset_type_flow_mode', e => `${e.asset}|${e.type}|${e.flow}|${e.mode}`],
  ['asset_flow_mode', e => `${e.asset}|${e.flow}|${e.mode}`],
  ['asset_shadow_state_mode', e => `${e.asset}|${e.shadow_state}|${e.mode}`],
  ['asset_oi_funding_mode', e => `${e.asset}|${e.oi}|${e.funding}|${e.mode}`],
  ['asset_btcgate_mode', e => `${e.asset}|${e.btc_gate}|${e.mode}`],
  ['pattern_mode', e => e.pattern ? `${e.pattern}|${e.mode}` : null],
  ['missing_shadow_state_mode', e => e.source==='missing_shadow_no_alert' ? `${e.asset}|${e.natural_direction}|${e.shadow_state}|${e.flow}|${e.mode}` : null],
  ['missing_setup_score_mode', e => e.source==='missing_shadow_no_alert' ? `${e.asset}|${e.natural_direction}|setup=${e.setup_detected}|score=${Math.floor((num(e.score)||0)/10)*10}s|eff=${Math.floor((num(e.effective_score)||0)/10)*10}s|${e.mode}` : null],
];

function dedup(rows) {
  rows = rows.slice().sort((a,b)=>ts(a)-ts(b));
  const out=[]; let lastByAsset={};
  for (const r of rows) { const t=ts(r); const last=lastByAsset[r.asset] ?? -Infinity; if (t-last >= DEDUP_MS) { out.push(r); lastByAsset[r.asset]=t; } }
  return out;
}
function summarize(kind, key, rows) {
  const raw_n=rows.length; rows=dedup(rows); const n=rows.length; if (n<MIN_N) return null;
  const horizons={};
  for (const h of HORIZONS) {
    const label=`${h}h`; const vals=rows.map(r=>r.horizons[label]).filter(Number.isFinite);
    horizons[label]={n:vals.length, win: vals.length ? vals.filter(v=>v>0).length/vals.length*100 : null, avg:avg(vals), med:median(vals)};
  }
  const ranked=Object.entries(horizons).filter(([_,v])=>v.n>=Math.min(n,6) && Number.isFinite(v.win)).sort((a,b)=>b[1].win-a[1].win || b[1].avg-a[1].avg);
  if (!ranked.length) return null;
  const [bestH,best]=ranked[0];
  const one=horizons['1h'];
  const mfeVals=rows.map(r=>r.mfe6).filter(Number.isFinite), maeVals=rows.map(r=>r.mae6).filter(Number.isFinite);
  const mfeTimes=rows.map(r=>r.mfeMin).filter(Number.isFinite), maeTimes=rows.map(r=>r.maeMin).filter(Number.isFinite);
  const good = best.win >= 70 && best.avg > 0;
  const bad = best.win <= 30 || (one?.win <= 30 && one.avg < 0);
  const invCandidate = rows[0]?.mode === 'inverse' && good;
  const badNatural = rows[0]?.mode === 'natural' && bad;
  const quick = one?.win >= 60 && one.avg > 0;
  return {kind,key,raw_n,n,source_mix:[...new Set(rows.map(r=>r.source))].join(','), mode:rows[0].mode, direction:rows[0].direction, natural_direction:rows[0].natural_direction, best_horizon:bestH, best_win:best.win, best_avg:best.avg, one_h_win:one?.win, one_h_avg:one?.avg, horizons, med_mfe6:median(mfeVals), avg_mfe6:avg(mfeVals), q75_mfe6:q(mfeVals,.75), med_mae6:median(maeVals), avg_mae6:avg(maeVals), med_mfe_min:median(mfeTimes), med_mae_min:median(maeTimes), good, bad, invCandidate, badNatural, quick, examples:rows.slice(-3).map(r=>({t:r.timestamp_utc,asset:r.asset,type:r.type,source:r.source,flow:r.flow,shadow:r.shadow_state,score:r.score,eff:r.effective_score,entry:r.entry}))};
}

const summaries=[];
for (const [kind, fn] of groupers) {
  const m=new Map();
  for (const e of events) { const key=fn(e); if (key) addGroup(m,key,e); }
  for (const [key,rows] of m) { const s=summarize(kind,key,rows); if (s) summaries.push(s); }
}

const strong = summaries.filter(s=>s.good).sort((a,b)=>b.best_win-a.best_win || b.n-a.n || b.best_avg-a.best_avg);
const badNatural = summaries.filter(s=>s.badNatural).sort((a,b)=>a.best_win-b.best_win || b.n-a.n);
const missing = strong.filter(s=>s.source_mix.includes('missing_shadow_no_alert')).sort((a,b)=>b.best_win-a.best_win || b.n-a.n);
const inverse = strong.filter(s=>s.mode==='inverse').sort((a,b)=>b.best_win-a.best_win || b.n-a.n);
const quick = summaries.filter(s=>s.quick && s.good).sort((a,b)=>b.one_h_win-a.one_h_win || b.one_h_avg-a.one_h_avg);

function line(s) {
  return `- ${s.kind} ${s.key} | ${s.source_mix} | n=${s.n} raw=${s.raw_n} | ${s.mode.toUpperCase()} ${s.direction} | best ${s.best_horizon} ${pct(s.best_win)} avg ${spct(s.best_avg)} | 1h ${pct(s.one_h_win)} avg ${spct(s.one_h_avg)} | MFE6 med ${spct(s.med_mfe6)} avg ${spct(s.avg_mfe6)} q75 ${spct(s.q75_mfe6)} @med ${s.med_mfe_min}m | MAE6 med ${spct(s.med_mae6)} @med ${s.med_mae_min}m`;
}
let md=[];
md.push(`# Non-Telegram / missing alert opportunity scan`);
md.push(`Generated: ${new Date().toISOString()}`);
md.push(`Window: ${new Date(SINCE).toISOString()} → ${new Date(UNTIL).toISOString()}`);
md.push(`Exclusions: phase1d alerts actually delivered to Telegram (ok && !skipped). Telegram-suppressed/log-only rows remain included.`);
md.push(`Dedup: one episode per asset per group per 6h. Min n=${MIN_N}.`);
md.push(`Events tested: ${events.length}; emitted nontelegram alerts: ${phaseAlerts.length}; shadow rows: ${shadowRows.length}.`);
md.push(`\n## Strong natural/inverse buckets (>70% best 1–6h, avg > 0)`);
for (const s of strong.slice(0,80)) md.push(line(s));
md.push(`\n## Quick 1h candidates among strong buckets`);
for (const s of quick.slice(0,50)) md.push(line(s));
md.push(`\n## Bad natural buckets (<30% / inverse warning)`);
for (const s of badNatural.slice(0,80)) md.push(line(s));
md.push(`\n## Inverse-trade candidates`);
for (const s of inverse.slice(0,80)) md.push(line(s));
md.push(`\n## Missing alert candidates from shadow rows`);
for (const s of missing.slice(0,80)) md.push(line(s));

const outJson=path.join(DATA,'nontelegram-alert-opportunity-scan-current.json');
const outMd=path.join(DATA,'nontelegram-alert-opportunity-scan-current.md');
fs.writeFileSync(outJson, JSON.stringify({generated_at:new Date().toISOString(), since:new Date(SINCE).toISOString(), until:new Date(UNTIL).toISOString(), min_n:MIN_N, counts:{events:events.length, emitted_nontelegram_alerts:phaseAlerts.length, shadow_rows:shadowRows.length, summaries:summaries.length}, strong, quick, badNatural, inverse, missing, all:summaries}, null, 2));
fs.writeFileSync(outMd, md.join('\n')+'\n');
console.log(JSON.stringify({ok:true,outJson:path.relative(ROOT,outJson),outMd:path.relative(ROOT,outMd),counts:{events:events.length, emitted_nontelegram_alerts:phaseAlerts.length, shadow_rows:shadowRows.length, summaries:summaries.length, strong:strong.length, quick:quick.length, badNatural:badNatural.length, inverse:inverse.length, missing:missing.length}}, null, 2));
