#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const INVERSE = path.join(ROOT, 'data/inverse-signal-review-all.json');
const SHADOW = path.join(ROOT, 'data/readiness-shadow.jsonl');
const OUT_MD = path.join(ROOT, 'data/inverse-shadow-correlation.md');
const OUT_JSON = path.join(ROOT, 'data/inverse-shadow-correlation.json');

function readJsonl(file){return fs.readFileSync(file,'utf8').trim().split('\n').filter(Boolean).map(l=>JSON.parse(l));}
function t(s){const n=Date.parse(s); return Number.isFinite(n)?n:null;}
function n(x){const y=Number(x); return Number.isFinite(y)?y:null;}
function avg(xs){xs=xs.filter(Number.isFinite); return xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;}
function median(xs){xs=xs.filter(Number.isFinite).sort((a,b)=>a-b); if(!xs.length)return null; const m=Math.floor(xs.length/2); return xs.length%2?xs[m]:(xs[m-1]+xs[m])/2;}
function pct(x){return Number.isFinite(x)?`${x>=0?'+':''}${x.toFixed(3)}%`:'n/a';}
function rate(x){return Number.isFinite(x)?`${(x*100).toFixed(1)}%`:'n/a';}
function scoreBand(s,state){ if(!Number.isFinite(s)) return 'missing'; if(state==='SHADOW_BLOCKED') return 'blocked'; if(s>=70) return '70+ confirmed'; if(s>=50) return '50-69 forming'; if(s>=40) return '40-49 setup'; return '<40 no_setup'; }
function lowerBound(arr, target){let lo=0,hi=arr.length; while(lo<hi){const m=(lo+hi)>>1; if(arr[m]._t<target)lo=m+1; else hi=m;} return lo;}
function buildShadowIndex(rows){const m=new Map(); for(const s of rows){const ms=t(s.timestamp_utc); if(!ms)continue; const key=`${s.asset}:${s.direction}`; if(!m.has(key))m.set(key,[]); m.get(key).push({...s,_t:ms});} for(const arr of m.values())arr.sort((a,b)=>a._t-b._t); return m;}
function nearestShadow(index, asset, direction, ms, maxLagMs=20*60*1000){const arr=index.get(`${asset}:${direction}`); if(!arr)return null; const i=lowerBound(arr,ms); let best=null; for(const j of [i,i-1]){if(j>=0&&j<arr.length){const d=Math.abs(arr[j]._t-ms); if(d<=maxLagMs && (!best||d<best._d)) best={...arr[j],_d:d};}} return best;}
function groupBy(rows, fn){const m=new Map(); for(const r of rows){const k=fn(r); if(!m.has(k))m.set(k,[]); m.get(k).push(r);} return [...m.entries()].map(([key,rows])=>({key,rows,summary:summarize(rows)}));}
function summarize(rows){const hs=['15m','30m','1h','4h']; const out={n:rows.length}; for(const h of hs){const vals=rows.map(r=>r[`inverse_${h}`]).filter(Number.isFinite); out[h]={n:vals.length,hit:vals.length?vals.filter(v=>v>0).length/vals.length:null,avg:avg(vals),med:median(vals)};} const mfes=rows.map(r=>r.inverse_mfe_4h).filter(Number.isFinite); const maes=rows.map(r=>r.inverse_mae_4h).filter(Number.isFinite); out.path={n:mfes.length,fav:rows.filter(r=>r.inverse_favorable_anytime_4h).length/(mfes.length||NaN),avg_mfe:avg(mfes),avg_mae:avg(maes),first_fav:median(rows.map(r=>r.inverse_minutes_to_first_favorable).filter(Number.isFinite)),peak_min:median(rows.map(r=>r.inverse_minutes_to_mfe).filter(Number.isFinite))}; out.natural_shadow_avg=avg(rows.map(r=>r.natural_shadow_score)); out.inverse_shadow_avg=avg(rows.map(r=>r.inverse_shadow_score)); out.score_gap_avg=avg(rows.map(r=>Number.isFinite(r.natural_shadow_score)&&Number.isFinite(r.inverse_shadow_score)?r.natural_shadow_score-r.inverse_shadow_score:null)); return out;}
function line(g){const s=g.summary; return `- ${g.key}: n=${s.n} | inv 30m ${rate(s['30m'].hit)} ${pct(s['30m'].avg)}; 1h ${rate(s['1h'].hit)} ${pct(s['1h'].avg)} n=${s['1h'].n}; peak-within-4h ${pct(s.path.avg_mfe)} @ median ${s.path.first_fav ?? 'n/a'}m first-fav / ${s.path.peak_min ?? 'n/a'}m peak; 4h close ${rate(s['4h'].hit)} ${pct(s['4h'].avg)} n=${s['4h'].n}; MAE ${pct(s.path.avg_mae)} | naturalShadow avg ${s.natural_shadow_avg?.toFixed(1)??'n/a'} inverseShadow avg ${s.inverse_shadow_avg?.toFixed(1)??'n/a'} gap(nat-inv) ${s.score_gap_avg?.toFixed(1)??'n/a'}`;}
function scoreGroup(g){const s=g.summary; return (s['1h'].avg??-9)+(s['4h'].avg??-9)*0.7+((s['1h'].hit??0)-0.5)+0.2*(s.path.avg_mfe??0);}

const inverse = JSON.parse(fs.readFileSync(INVERSE,'utf8')).rows;
const shadowIndex=buildShadowIndex(readJsonl(SHADOW));
const rows=[];
for(const r of inverse){const ms=t(r.timestamp_utc); if(!ms)continue; const nat=nearestShadow(shadowIndex,r.asset,r.natural_direction,ms); const inv=nearestShadow(shadowIndex,r.asset,r.inverse_direction,ms); const ns=n(nat?.effective_score ?? nat?.score); const is=n(inv?.effective_score ?? inv?.score); rows.push({...r,natural_shadow_state:nat?.state||'missing',natural_shadow_score:ns,natural_shadow_band:scoreBand(ns,nat?.state),natural_shadow_lag_min:nat?Math.round((ms-nat._t)/60000):null,inverse_shadow_state:inv?.state||'missing',inverse_shadow_score:is,inverse_shadow_band:scoreBand(is,inv?.state),inverse_shadow_lag_min:inv?Math.round((ms-inv._t)/60000):null,shadow_score_gap:Number.isFinite(ns)&&Number.isFinite(is)?ns-is:null});}
const groups={
 by_natural_band: groupBy(rows,r=>r.natural_shadow_band).sort((a,b)=>scoreGroup(b)-scoreGroup(a)),
 by_inverse_band: groupBy(rows,r=>r.inverse_shadow_band).sort((a,b)=>scoreGroup(b)-scoreGroup(a)),
 by_score_cross: groupBy(rows,r=>`natural:${r.natural_shadow_band} / inverse:${r.inverse_shadow_band}`).filter(g=>g.rows.length>=5).sort((a,b)=>scoreGroup(b)-scoreGroup(a)),
 by_type_nat_band: groupBy(rows,r=>`${r.type} / natural:${r.natural_shadow_band}`).filter(g=>g.rows.length>=5).sort((a,b)=>scoreGroup(b)-scoreGroup(a)),
 by_type_asset_nat_band: groupBy(rows,r=>`${r.type}/${r.asset} / natural:${r.natural_shadow_band}`).filter(g=>g.rows.length>=3).sort((a,b)=>scoreGroup(b)-scoreGroup(a)),
 by_setup_nat_band: groupBy(rows,r=>`${r.type}/${r.asset}/${r.setup_key} / natural:${r.natural_shadow_band}`).filter(g=>g.rows.length>=3).sort((a,b)=>scoreGroup(b)-scoreGroup(a)),
};
const md=[];
md.push('# Inverse Signal x Shadow Score Correlation');
md.push(`\nGenerated: ${new Date().toISOString()}`);
md.push(`Rows joined: ${rows.length}; with natural shadow: ${rows.filter(r=>r.natural_shadow_band!=='missing').length}; with inverse shadow: ${rows.filter(r=>r.inverse_shadow_band!=='missing').length}`);
md.push('\nInterpretation: natural shadow = score/state in the emitted alert direction. inverse shadow = score/state for the opposite direction at the same timestamp. A promising inverse bucket often has a high natural score but blocked/low inverse score; that means shadow scoring itself is confidently wrong for that regime.');
for(const [title,key,limit] of [['By natural shadow band','by_natural_band',20],['By inverse shadow band','by_inverse_band',20],['Natural x inverse score cross','by_score_cross',30],['Type x natural shadow band','by_type_nat_band',40],['Type/asset x natural shadow band','by_type_asset_nat_band',60],['Specific setup x natural shadow band','by_setup_nat_band',40]]){md.push(`\n## ${title}`); md.push(...groups[key].slice(0,limit).map(line));}
md.push('\n## Recent rows with shadow');
for(const r of rows.slice(-80)){md.push(`- ${r.timestamp_utc} ${r.asset} ${r.type} inv ${r.inverse_direction}: 30m ${pct(r.inverse_30m)} 1h ${pct(r.inverse_1h)} 4h ${pct(r.inverse_4h)} | naturalShadow ${r.natural_shadow_state} ${r.natural_shadow_score??'n/a'} ${r.natural_shadow_band}; inverseShadow ${r.inverse_shadow_state} ${r.inverse_shadow_score??'n/a'} ${r.inverse_shadow_band} | ${r.setup_key}`)}
fs.writeFileSync(OUT_MD,md.join('\n'));
fs.writeFileSync(OUT_JSON,JSON.stringify({generated_at:new Date().toISOString(),rows,groups},null,2));
console.log(JSON.stringify({ok:true,rows:rows.length,natural_shadow:rows.filter(r=>r.natural_shadow_band!=='missing').length,inverse_shadow:rows.filter(r=>r.inverse_shadow_band!=='missing').length,out_md:OUT_MD,out_json:OUT_JSON},null,2));
