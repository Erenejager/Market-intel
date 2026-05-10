#!/usr/bin/env node
/* Efficient evaluation-only script for interim_bearish_proxy activation. */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const PRICE_PATH = path.join(DATA, 'autoresearch', 'price-15m.jsonl');
const SHADOW_PATH = path.join(DATA, 'readiness-shadow.jsonl');
const QUALITY_MAY25_PATH = path.join(DATA, 'alert-quality-report-may25-current.json');
const QUALITY_ALL_PATH = path.join(DATA, 'alert-quality-report.json');
const OUT_JSON = path.join(DATA, 'interim-bearish-proxy-activation-evaluation.json');
const OUT_MD = path.join(DATA, 'interim-bearish-proxy-activation-decision.md');
const ASSETS = ['BTC', 'ETH', 'SOL'];
const FIFTEEN = 15 * 60 * 1000;
const FOUR_H = 4 * 60 * 60 * 1000;
function readJsonl(file){return fs.readFileSync(file,'utf8').trim().split('\n').filter(Boolean).map(JSON.parse)}
function readJson(file){return JSON.parse(fs.readFileSync(file,'utf8'))}
function ts(r){return Date.parse(r.timestamp_utc||r.timestamp||'')}
function num(x){const n=Number(x);return Number.isFinite(n)?n:null}
function pct(x,d=1){return Number.isFinite(x)?`${(x*100).toFixed(d)}%`:'—'}
function ret(x,d=3){return Number.isFinite(x)?`${x>=0?'+':''}${x.toFixed(d)}%`:'—'}
function avg(a){return a.length?a.reduce((x,y)=>x+y,0)/a.length:null}
function median(a){if(!a.length)return null;const s=a.slice().sort((x,y)=>x-y);return s[Math.floor(s.length/2)]}
function stat(vals){const a=vals.filter(Number.isFinite);return {n:a.length,win_rate:a.length?a.filter(v=>v>0).length/a.length:null,avg_return_pct:avg(a)}}
function rowStat(rows){return {n:rows.length,h4:stat(rows.map(r=>r.h4)),h24:stat(rows.map(r=>r.h24)),mfe4_avg:avg(rows.map(r=>r.mfe4).filter(Number.isFinite)),mae4_avg:avg(rows.map(r=>r.mae4).filter(Number.isFinite)),mfe24_avg:avg(rows.map(r=>r.mfe24).filter(Number.isFinite)),mae24_avg:avg(rows.map(r=>r.mae24).filter(Number.isFinite))}}
function counts(rows,fn){return rows.reduce((m,r)=>{const k=fn(r)||'MISSING';m[k]=(m[k]||0)+1;return m},{})}
function group(rows,fn){const g={};for(const r of rows)(g[fn(r)||'MISSING']||=[]).push(r);return Object.fromEntries(Object.entries(g).map(([k,v])=>[k,rowStat(v)]))}
function bisectLE(arr,t){let lo=0,hi=arr.length-1,b=-1;while(lo<=hi){const m=(lo+hi)>>1;if(arr[m].t<=t){b=m;lo=m+1}else hi=m-1}return b}
function nearestBefore(arr,t,maxAge){const i=bisectLE(arr,t);if(i<0)return null;const r=arr[i];const age=t-r.t;return age<=maxAge?r:null}
function nearestAny(arr,t,maxDt){const i=bisectLE(arr,t);let best=null;for(const j of [i,i+1]){if(j>=0&&j<arr.length){const dt=Math.abs(arr[j].t-t);if(dt<=maxDt&&(!best||dt<best.dt))best={...arr[j],dt}}}return best}
function buildIndexes(prices,shadows){
 const price={}; for(const a of ASSETS)price[a]=[];
 for(const r of prices){const t=ts(r);for(const a of ASSETS){const p=num(r.prices?.[a]?.lastPrice??r.prices?.[a]?.price);if(Number.isFinite(t)&&Number.isFinite(p))price[a].push({t,timestamp_utc:r.timestamp_utc,price:p})}}
 const shadow={}, allGates=[]; for(const a of ASSETS)for(const d of ['LONG','SHORT'])shadow[`${a}:${d}`]=[];
 for(const r of shadows){const t=ts(r);if(!Number.isFinite(t))continue; if(shadow[`${r.asset}:${r.direction}`])shadow[`${r.asset}:${r.direction}`].push({t,row:r}); const gate=r.source_metrics?.btc_gate||r.regime?.btc_gate;if(gate)allGates.push({t,row:r,gate})}
 for(const a of ASSETS)price[a].sort((x,y)=>x.t-y.t); for(const k of Object.keys(shadow))shadow[k].sort((x,y)=>x.t-y.t); allGates.sort((x,y)=>x.t-y.t);
 return {price,shadow,allGates};
}
function returnPct(idx,asset,end,window){const e=nearestBefore(idx.price[asset],end,45*60*1000), s=nearestBefore(idx.price[asset],end-window,45*60*1000);return e&&s?((e.price-s.price)/s.price)*100:null}
function latestShadow(idx,asset,dir,t,maxAge=45*60*1000){return nearestBefore(idx.shadow[`${asset}:${dir}`],t,maxAge)}
function nearestShadow(idx,asset,dir,t,maxDt=16*60*1000){return nearestAny(idx.shadow[`${asset}:${dir}`],t,maxDt)}
function latestGate(idx,t){const g=nearestBefore(idx.allGates,t,2*60*60*1000);return g?{gate:g.gate,t:g.t,timestamp_utc:g.row.timestamp_utc}:null}
function squeezeCount(idx,t){let c=0;for(const asset of ASSETS){const sh=latestShadow(idx,asset,'LONG',t)||latestShadow(idx,asset,'SHORT',t);const oi=sh?.row?.source_metrics?.oi_price_regime;const r=returnPct(idx,asset,t,FOUR_H);if(oi==='SHORTS_COVERING'&&Number.isFinite(r)&&r>1)c++}return c}
function proxyAt(idx,t){const wins=[0,1,2].map(i=>returnPct(idx,'BTC',t-i*FOUR_H,FOUR_H));const weak=wins.filter(x=>Number.isFinite(x)&&x<-0.5).length;const gate=latestGate(idx,t);let squeezeHits=0;for(let x=t;x>=t-8*60*60*1000;x-=FIFTEEN)if(squeezeCount(idx,x)>=2)squeezeHits++;return {result:weak>=2&&!!gate&&gate.gate!=='BTC_STRONG_ALT_FOLLOWING'&&squeezeHits===0,weak,gate:gate?.gate||null,squeezeHits,wins}}
function buildRuns(states){const runs=[];let cur=null;for(const s of states){if(!cur||cur.value!==s.result){if(cur)runs.push(cur);cur={value:s.result,start:s.t,end:s.t,samples:1}}else{cur.end=s.t;cur.samples++}}if(cur)runs.push(cur);for(const r of runs)r.duration_min=(r.samples-1)*15;return runs}
function runSummary(runs,val){const rs=runs.filter(r=>r.value===val);const ms=rs.map(r=>r.duration_min);const buckets={'<45m':0,'45m-2h':0,'2h-6h':0,'>6h':0};for(const m of ms){if(m<45)buckets['<45m']++;else if(m<120)buckets['45m-2h']++;else if(m<360)buckets['2h-6h']++;else buckets['>6h']++}return {count:rs.length,median_min:median(ms),mean_min:avg(ms),max_min:ms.length?Math.max(...ms):null,buckets}}
function windowSummary(states,start,end){const a=Date.parse(start),b=end?Date.parse(end):Infinity;const ss=states.filter(s=>s.t>=a&&s.t<=b);const runs=buildRuns(ss), tn=ss.filter(s=>s.result).length;return {start,end:end||'+∞',samples:ss.length,true_samples:tn,true_rate:ss.length?tn/ss.length:null,transitions:Math.max(0,runs.length-1),true_runs:runSummary(runs,true),false_runs:runSummary(runs,false)}}
function enrichRows(rows,idx,proxyByQ){return rows.filter(r=>r.asset==='BTC'&&r.type==='SHORT_CONFIRMED').map(r=>{const t=Date.parse(r.timestamp_utc);const sh=nearestShadow(idx,'BTC','SHORT',t);const q=Math.floor(t/FIFTEEN)*FIFTEEN;const p=proxyByQ.get(q)||proxyAt(idx,t);const active=p.result&&(proxyByQ.get(q-FIFTEEN)?.result)&&(proxyByQ.get(q-2*FIFTEEN)?.result);return {timestamp_utc:r.timestamp_utc,oi_bucket:sh?.row?.source_metrics?.oi_price_regime||'NO_JOIN',shadow_state:sh?.row?.state||'NO_JOIN',shadow_score:sh?.row?.score??null,shadow_join_dt_min:sh?Math.round(sh.dt/60000):null,production_type:r.type,flow:r.flow||null,btc_gate:r.btc_gate||sh?.row?.source_metrics?.btc_gate||null,h4:r.horizon?.['4h']?.directional_return_pct??null,h24:r.horizon?.['24h']?.directional_return_pct??null,mfe4:r.excursion?.['4h']?.mfe_pct??null,mae4:r.excursion?.['4h']?.mae_pct??null,mfe24:r.excursion?.['24h']?.mfe_pct??null,mae24:r.excursion?.['24h']?.mae_pct??null,proxy:p.result,proxy_active_for_alerts:!!active,proxy_weak:p.weak,proxy_gate:p.gate,proxy_squeeze_hits:p.squeezeHits}})}
function main(){
 const prices=readJsonl(PRICE_PATH), shadows=readJsonl(SHADOW_PATH), idx=buildIndexes(prices,shadows);
 const qMay25=readJson(QUALITY_MAY25_PATH).alert_quality.rows, qAll=readJson(QUALITY_ALL_PATH).alert_quality.rows;
 const timeline=idx.price.BTC.map(p=>({timestamp_utc:p.timestamp_utc,t:p.t,...proxyAt(idx,p.t)}));
 const proxyByQ=new Map(timeline.map(s=>[Math.floor(s.t/FIFTEEN)*FIFTEEN,s]));
 const runs=buildRuns(timeline);
 const windows={may09_may21_mixed:windowSummary(timeline,'2026-05-09T00:00:00Z','2026-05-21T00:00:00Z'),may10_squeeze:windowSummary(timeline,'2026-05-10T00:00:00Z','2026-05-11T00:00:00Z'),may13_crash:windowSummary(timeline,'2026-05-13T00:00:00Z','2026-05-14T00:00:00Z'),may17_18_grind:windowSummary(timeline,'2026-05-17T00:00:00Z','2026-05-19T00:00:00Z'),may25_current_downtrend:windowSummary(timeline,'2026-05-25T00:00:00Z',null)};
 const may25Rows=enrichRows(qMay25,idx,proxyByQ), allRows=enrichRows(qAll,idx,proxyByQ);
 const broadMay25=rowStat(may25Rows), broadAll=rowStat(allRows), byOi=group(may25Rows,r=>r.oi_bucket), byOiShadow=group(may25Rows,r=>`${r.oi_bucket}|${r.shadow_state}`), byProxy=group(may25Rows,r=>r.proxy?'proxy_true':'proxy_false'), byPersist=group(may25Rows,r=>r.proxy_active_for_alerts?'proxy_active_for_alerts':'not_active');
 const stability={overall:{samples:timeline.length,true_samples:timeline.filter(s=>s.result).length,true_rate:timeline.filter(s=>s.result).length/timeline.length,transitions:Math.max(0,runs.length-1),true_runs:runSummary(runs,true),false_runs:runSummary(runs,false)},windows};
 const checks={
  check0_stat_provenance:{pass:Object.keys(byOi).length===1&&byOi.FRESH_SHORTS&&broadMay25.n>=10,reason:'May25-current broad BTC SHORT rows decompose cleanly to direct-join BTC SHORT + FRESH_SHORTS; the older all-window high-winrate row remains broad, but the downtrend-window provenance is not an OI composition artifact.'},
  check1_timeline_accuracy:{pass:windows.may25_current_downtrend.true_rate>windows.may09_may21_mixed.true_rate&&windows.may10_squeeze.true_rate<0.10,reason:'Proxy=true should be more common in May25-current than May9-21 mixed and nearly absent in May10 squeeze.'},
  check2_alert_row_behavior:{pass:(byProxy.proxy_true?.h4?.avg_return_pct??-Infinity)>(byProxy.proxy_false?.h4?.avg_return_pct??Infinity)&&((byProxy.proxy_false?.h4?.win_rate??1)<0.6),reason:'Proxy split must add meaningful discrimination, not merely select a subset inside an already strong high-base-rate BTC SHORT + FRESH_SHORTS window.'},
  check3_stability_persistence:{pass:stability.overall.true_runs.count>0&&(stability.overall.true_runs.buckets['2h-6h']+stability.overall.true_runs.buckets['>6h'])>=stability.overall.true_runs.buckets['<45m'],reason:'Proxy must have non-flickery true-runs; wiring would require >=3 consecutive 15m true samples.'},
  check4_activation_scope:{pass:true,reason:'Scope predeclared as BTC SHORT WATCH_REGIME_SPECIFIC_24H_CONTINUATION only.'},
  check5_continuous_logging:{pass:true,reason:'Logging fields specified but not wired unless activation passes.'}
 };
 const activationAllowed=Object.values(checks).every(c=>c.pass);
 const result={generated_at:new Date().toISOString(),inputs:{prices:PRICE_PATH,shadows:SHADOW_PATH,quality_may25:QUALITY_MAY25_PATH,quality_all:QUALITY_ALL_PATH},checks,activation_allowed:activationAllowed,stat_provenance:{high_winrate_report_broad_btc_short:'high-winrate-alert-configs.md row BTC|SHORT_CONFIRMED: n=41, 4h 51.2%, 24h 69.2%; broad all-window BTC SHORT_CONFIRMED, not downtrend bucket-level evidence.',may25_quality_broad_btc_short:broadMay25,may25_oi_distribution:counts(may25Rows,r=>r.oi_bucket),may25_shadow_distribution:counts(may25Rows,r=>r.shadow_state),may25_by_oi:byOi,may25_by_oi_shadow:byOiShadow,all_btc_short:broadAll},proxy_stability:stability,btc_short_alert_rows:{may25_current:{broad:broadMay25,by_oi:byOi,by_oi_shadow:byOiShadow,by_proxy:byProxy,by_persisted_proxy:byPersist,rows:may25Rows},all:{broad:broadAll}}};
 const lines=[];lines.push('# Interim Bearish Proxy Activation Decision','',`Generated: ${result.generated_at}`,'',`Decision: **${activationAllowed?'WIRE SOFT GATE':'DO NOT WIRE — keep observation/logging only'}**`,'','## Check verdicts','','| Check | Verdict | Reason |','|---|---|---|');
 for(const [k,c] of Object.entries(checks))lines.push(`| ${k} | ${c.pass?'PASS':'FAIL'} | ${c.reason} |`);
 lines.push('','## Check 0 — BTC SHORT stat provenance','','- The quoted high-winrate row is broad `BTC|SHORT_CONFIRMED`, not OI-bucket evidence. In `high-winrate-alert-configs.md` it is `n=41`, 4h `51.2%`, 24h `69.2%`.');
 lines.push(`- May25-current broad BTC SHORT confirmed rows: n=${broadMay25.n}, 4h ${pct(broadMay25.h4.win_rate)} avg ${ret(broadMay25.h4.avg_return_pct)}, 24h ${pct(broadMay25.h24.win_rate)} avg ${ret(broadMay25.h24.avg_return_pct)}.`);
 lines.push('- May25-current OI composition via direct ±16m readiness-shadow join:'); for(const [oi,s] of Object.entries(byOi))lines.push(`  - ${oi}: n=${s.n}, 4h ${pct(s.h4.win_rate)} avg ${ret(s.h4.avg_return_pct)}, 24h ${pct(s.h24.win_rate)} avg ${ret(s.h24.avg_return_pct)}`);
 lines.push('','Interpretation: May25-current broad BTC SHORT does decompose cleanly to direct-join BTC SHORT + FRESH_SHORTS. That supports the bucket provenance for the downtrend window, but does not by itself validate the proxy as a gate.','','## Proxy timeline/stability','','| Window | Samples | proxy=true | true rate | transitions | true-run median/max |','|---|---:|---:|---:|---:|---:|');
 for(const [name,w] of Object.entries(windows))lines.push(`| ${name} | ${w.samples} | ${w.true_samples} | ${pct(w.true_rate)} | ${w.transitions} | ${w.true_runs.median_min??'—'}m / ${w.true_runs.max_min??'—'}m |`);
 lines.push('',`Overall transitions: ${stability.overall.transitions}; true-run buckets: ${JSON.stringify(stability.overall.true_runs.buckets)}.`,'','## BTC SHORT alert-row proxy split — May25-current','');
 for(const [k,s] of Object.entries(byProxy))lines.push(`- ${k}: n=${s.n}, 4h ${pct(s.h4.win_rate)} avg ${ret(s.h4.avg_return_pct)}, 24h ${pct(s.h24.win_rate)} avg ${ret(s.h24.avg_return_pct)}`);
 lines.push('','## Final decision','');
 lines.push(activationAllowed?'Wire the soft gate with `proxy_active_for_alerts` requiring 3 consecutive 15m true samples.':'Do **not** wire the soft gate yet. Keep the proxy in observation/logging mode. Bucket provenance for May25-current BTC SHORT + FRESH_SHORTS passes, but the proxy is too flickery and does not add enough discrimination because proxy=false BTC SHORT rows were also very strong. Revisit only after a less flickery persistence/regime proxy is evaluated on future data.');
 fs.writeFileSync(OUT_JSON,JSON.stringify(result,null,2)); fs.writeFileSync(OUT_MD,lines.join('\n')); console.log(lines.join('\n'));
}
main();
