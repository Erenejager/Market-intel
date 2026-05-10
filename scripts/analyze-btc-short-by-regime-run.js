#!/usr/bin/env node
/* Split BTC SHORT outcomes by regime-history state/run to diagnose trade-quality rolling-window regression. */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const OUT_JSON = path.join(DATA, 'btc-short-regime-run-split-current.json');
const OUT_MD = path.join(DATA, 'btc-short-regime-run-split-current.md');
const H = [1, 2, 3, 4, 5, 6];
const DEDUP_MS = 6 * 60 * 60 * 1000;
const SINCE = Date.parse(process.argv.find(a => a.startsWith('--since='))?.slice(8) || '2026-06-07T17:30:00Z');
function readJsonl(file) { try { return fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)); } catch { return []; } }
function ts(r) { return Date.parse(r?.timestamp_utc || r?.timestamp || r?.generated_at || ''); }
function num(x) { const n = Number(x); return Number.isFinite(n) ? n : null; }
function avg(a) { const v = a.filter(Number.isFinite); return v.length ? v.reduce((x, y) => x + y, 0) / v.length : null; }
function med(a) { const v = a.filter(Number.isFinite).sort((a, b) => a - b); if (!v.length) return null; const m = Math.floor(v.length / 2); return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; }
function pct(x, d = 1) { return Number.isFinite(x) ? `${x.toFixed(d)}%` : 'n/a'; }
function spct(x, d = 3) { return Number.isFinite(x) ? `${x >= 0 ? '+' : ''}${x.toFixed(d)}%` : 'n/a'; }
function retPct(entry, future) { if (!Number.isFinite(entry) || !Number.isFinite(future)) return null; return -((future - entry) / entry * 100); }
const prices = readJsonl(path.join(DATA, 'autoresearch', 'price-15m.jsonl')).map(r => ({ t: ts(r), iso: r.timestamp_utc || r.timestamp, p: num(r.prices?.BTC?.lastPrice) })).filter(r => Number.isFinite(r.t) && Number.isFinite(r.p)).sort((a,b)=>a.t-b.t);
function atOrAfter(target, maxLag = 25 * 60 * 1000) { let lo=0, hi=prices.length; while(lo<hi){const m=(lo+hi)>>1; if(prices[m].t<target) lo=m+1; else hi=m;} const r=prices[lo]; return r && r.t-target<=maxLag ? r : null; }
function between(start,end){return prices.filter(r=>r.t>=start&&r.t<=end)}
function evalShort(t, entry){ const horizons={}; for(const h of H){const r=atOrAfter(t+h*3600000); horizons[`${h}h`]=r?retPct(entry,r.p):null;} let mfe=-Infinity, mae=Infinity, mfeMin=null, maeMin=null; for(const r of between(t,t+6*3600000)){const v=retPct(entry,r.p); if(!Number.isFinite(v)) continue; if(v>mfe){mfe=v;mfeMin=Math.round((r.t-t)/60000);} if(v<mae){mae=v;maeMin=Math.round((r.t-t)/60000);}} return {horizons,mfe6:Number.isFinite(mfe)?mfe:null,mae6:Number.isFinite(mae)?mae:null,mfeMin,maeMin}; }
const regRows = readJsonl(path.join(DATA, 'regime-history.jsonl')).filter(r=>Number.isFinite(ts(r))).sort((a,b)=>ts(a)-ts(b));
const runs=[]; let cur=null;
for(const r of regRows){ const t=ts(r); if(!cur || cur.state!==r.state){ if(cur) cur.end=t; cur={runId:runs.length+1,state:r.state,start:t,startIso:r.timestamp_utc,entryRet7:num(r.features?.btc_ret_7d_pct),activeSince:r.features?.active_since||null,rows:0}; runs.push(cur);} cur.rows++; cur.end=t+15*60*1000; cur.endIso=new Date(cur.end).toISOString(); cur.lastRet7=num(r.features?.btc_ret_7d_pct); cur.consecutiveTrue=r.features?.consecutive_true; cur.consecutiveFalse=r.features?.consecutive_false; }
function regimeAt(t){ let best=null; for(const r of regRows){const rt=ts(r); if(rt<=t) best=r; else break;} if(!best) return null; const run = runs.find(x=>t>=x.start && t<x.end) || runs.findLast?.(x=>x.start<=t) || null; return {state:best.state, ret7:num(best.features?.btc_ret_7d_pct), runId:run?.runId, runStart:run?.startIso, runActiveSince:best.features?.active_since||run?.activeSince||null}; }
const alerts = readJsonl(path.join(DATA, 'phase1d-alerts.jsonl')).filter(a => ts(a)>=SINCE && a.asset==='BTC' && (a.type==='SHORT_CONFIRMED' || a.type==='SHORT_SETUP' || (a.type||'').startsWith('SHORT')));
const events=[];
for(const a of alerts){ const t=ts(a); const entry=num(a.diagnostics?.price); if(!Number.isFinite(t)||!Number.isFinite(entry)) continue; const reg=regimeAt(t); events.push({id:a.id,t,iso:a.timestamp_utc,type:a.type,entry,flow:a.diagnostics?.flow,pattern:a.pattern?.key||null,score:num(a.readiness_shadow?.effective_score),oi:a.readiness_shadow?.source_metrics?.oi_price_regime||null,funding:a.readiness_shadow?.source_metrics?.cross_exchange_positioning?.classification||null,regime:reg?.state||'NO_REGIME',regimeRet7:reg?.ret7,runId:reg?.runId,runStart:reg?.runStart,...evalShort(t,entry)}); }
function dedup(rows){ rows=rows.slice().sort((a,b)=>a.t-b.t); const out=[]; let last=-Infinity; for(const r of rows){ if(r.t-last>=DEDUP_MS){out.push(r); last=r.t;}} return out; }
function summarize(raw){ const rows=dedup(raw); const horizons={}; for(const h of H){const vals=rows.map(r=>r.horizons[`${h}h`]).filter(Number.isFinite); horizons[`${h}h`]={n:vals.length,win:vals.length?vals.filter(v=>v>0).length/vals.length*100:null,avg:avg(vals),med:med(vals)};} const ranked=Object.entries(horizons).filter(([_,v])=>v.n>=Math.min(5,rows.length)&&Number.isFinite(v.win)).sort((a,b)=>b[1].win-a[1].win||b[1].avg-a[1].avg); return {raw_n:raw.length,n:rows.length,first:rows[0]?.iso||null,last:rows.at(-1)?.iso||null,best_horizon:ranked[0]?.[0]||null,best_win:ranked[0]?.[1]?.win??null,best_avg:ranked[0]?.[1]?.avg??null,horizons,med_mfe6:med(rows.map(r=>r.mfe6)),med_mae6:med(rows.map(r=>r.mae6)),med_mfe_min:med(rows.map(r=>r.mfeMin)),med_mae_min:med(rows.map(r=>r.maeMin)),examples:rows.map(r=>({t:r.iso,type:r.type,entry:r.entry,flow:r.flow,pattern:r.pattern,ret1:r.horizons['1h'],ret3:r.horizons['3h'],ret4:r.horizons['4h'],regime:r.regime,runId:r.runId})).slice(-8)}; }
function line(s){return `n=${s.n} raw=${s.raw_n}; best ${s.best_horizon||'n/a'} ${pct(s.best_win)} avg ${spct(s.best_avg)}; 1h ${pct(s.horizons['1h']?.win)} avg ${spct(s.horizons['1h']?.avg)}; 3h ${pct(s.horizons['3h']?.win)} avg ${spct(s.horizons['3h']?.avg)}; 4h ${pct(s.horizons['4h']?.win)} avg ${spct(s.horizons['4h']?.avg)}; MFE6 med ${spct(s.med_mfe6)} @${s.med_mfe_min??'n/a'}m; MAE6 med ${spct(s.med_mae6)} @${s.med_mae_min??'n/a'}m`;}
const groups=[];
function addGroup(kind,key,rows,meta={}){groups.push({kind,key,...meta,summary:summarize(rows)});}
addGroup('all','BTC_SHORT_ALL',events);
for(const state of [...new Set(events.map(e=>e.regime))]) addGroup('regime_state',state,events.filter(e=>e.regime===state));
for(const run of runs){ const rs=events.filter(e=>e.runId===run.runId); if(rs.length) addGroup('regime_run',`run_${run.runId}_${run.state}`,rs,{run}); }
const currentRun = runs.at(-1); if(currentRun) addGroup('current_run_only',`run_${currentRun.runId}_${currentRun.state}`,events.filter(e=>e.runId===currentRun.runId),{run:currentRun});
const rollingStart=Date.now()-10*24*3600000; addGroup('rolling_10d','last_10d',events.filter(e=>e.t>=rollingStart));
addGroup('pre_current_run_10d','last_10d_before_current_bear_run',events.filter(e=>e.t>=rollingStart && (!currentRun || e.t<currentRun.start)));
let md=[]; md.push('# BTC SHORT split by regime state/run'); md.push(`Generated: ${new Date().toISOString()}`); md.push(`Since: ${new Date(SINCE).toISOString()}`); md.push('Dedup: one BTC SHORT episode per 6h. Outcomes are SHORT-direction returns.'); md.push(''); md.push('## Regime runs'); for(const r of runs){md.push(`- run ${r.runId}: ${r.state} ${r.startIso} → ${r.endIso || 'now'} | entry ret7 ${spct(r.entryRet7)} | last ret7 ${spct(r.lastRet7)} | rows ${r.rows}`);} md.push(''); md.push('## BTC SHORT outcomes'); for(const g of groups){md.push(`### ${g.kind}: ${g.key}`); if(g.run) md.push(`- Run: ${g.run.state} ${g.run.startIso} → ${g.run.endIso || 'now'} | entry ret7 ${spct(g.run.entryRet7)} | last ret7 ${spct(g.run.lastRet7)}`); md.push(`- ${line(g.summary)}`); md.push('');}
fs.writeFileSync(OUT_JSON, JSON.stringify({generated_at:new Date().toISOString(), since:new Date(SINCE).toISOString(), runs, groups}, null, 2)); fs.writeFileSync(OUT_MD, md.join('\n'));
console.log(JSON.stringify({ok:true,outJson:path.relative(ROOT,OUT_JSON),outMd:path.relative(ROOT,OUT_MD),events:events.length,groups:groups.map(g=>({kind:g.kind,key:g.key,n:g.summary.n,best:g.summary.best_horizon,win:g.summary.best_win,avg:g.summary.best_avg}))},null,2));
