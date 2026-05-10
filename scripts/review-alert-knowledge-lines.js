#!/usr/bin/env node
/* Review pattern-classifier knowledge/stat lines against post-fix outcomes. */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const SINCE = Date.parse(process.argv.find(a=>a.startsWith('--since='))?.slice(8) || '2026-06-20T20:15:00Z');
const UNTIL = Date.parse(process.argv.find(a=>a.startsWith('--until='))?.slice(8) || new Date().toISOString());
const DEDUP_MS = 6*60*60*1000;
const H=[1,2,3,4,5,6];
const ASSETS=['BTC','ETH','SOL'];
function readJson(f,fb=null){try{return JSON.parse(fs.readFileSync(f,'utf8'))}catch{return fb}}
function readJsonl(f){try{return fs.readFileSync(f,'utf8').trim().split('\n').filter(Boolean).map(JSON.parse)}catch{return[]}}
function ts(r){return Date.parse(r?.timestamp_utc||r?.timestamp||r?.generated_at||'')}
function num(x){const n=Number(x);return Number.isFinite(n)?n:null}
function avg(a){const v=a.filter(Number.isFinite);return v.length?v.reduce((x,y)=>x+y,0)/v.length:null}
function med(a){const v=a.filter(Number.isFinite).sort((a,b)=>a-b);if(!v.length)return null;const m=Math.floor(v.length/2);return v.length%2?v[m]:(v[m-1]+v[m])/2}
function pct(x,d=1){return Number.isFinite(x)?`${x.toFixed(d)}%`:'n/a'}
function spct(x,d=3){return Number.isFinite(x)?`${x>=0?'+':''}${x.toFixed(d)}%`:'n/a'}
function inv(d){return d==='LONG'?'SHORT':d==='SHORT'?'LONG':null}
function dirFromType(t){return String(t||'').startsWith('LONG')?'LONG':String(t||'').startsWith('SHORT')?'SHORT':null}
function retPct(d,e,f){if(!Number.isFinite(e)||!Number.isFinite(f))return null;const raw=(f-e)/e*100;return d==='SHORT'?-raw:raw}
function normBtc(g){return g==='BTC_CONFIRMS_ALT_LONG_CONTEXT'?'BTC_PERMITS_ALT_LONG_OBSERVATION':(g||'NONE')}
function priceAlert(a){return num(a?.diagnostics?.price??a?.readiness_shadow?.source_metrics?.long_horizon_regime?.price)}
function priceShadow(s){return num(s?.source_metrics?.long_horizon_regime?.price)}
function flow(a){return a?.diagnostics?.flow||a?.readiness_shadow?.source_metrics?.flow||a?.source_metrics?.flow||'NONE'}
function oi(x){return x?.readiness_shadow?.source_metrics?.oi_price_regime||x?.source_metrics?.oi_price_regime||'NONE'}
function funding(x){return x?.readiness_shadow?.source_metrics?.cross_exchange_positioning?.classification||x?.source_metrics?.cross_exchange_positioning?.classification||'NONE'}
function btcGate(x){return normBtc(x?.diagnostics?.btc_gate||x?.readiness_shadow?.source_metrics?.btc_gate||x?.source_metrics?.btc_gate||'NONE')}

const priceRows=readJsonl(path.join(DATA,'autoresearch','price-15m.jsonl'));
const priceIndex=Object.fromEntries(ASSETS.map(a=>[a,[]]));
for(const r of priceRows){const t=ts(r); if(!Number.isFinite(t))continue; for(const a of ASSETS){const p=num(r.prices?.[a]?.lastPrice); if(Number.isFinite(p)) priceIndex[a].push({t,p});}}
for(const rs of Object.values(priceIndex))rs.sort((a,b)=>a.t-b.t);
function atOrAfter(asset,target,maxLag=25*60*1000){const rows=priceIndex[asset]||[];let lo=0,hi=rows.length;while(lo<hi){const m=(lo+hi)>>1;if(rows[m].t<target)lo=m+1;else hi=m}const r=rows[lo];return r&&r.t-target<=maxLag?r:null}
function between(asset,start,end){return (priceIndex[asset]||[]).filter(r=>r.t>=start&&r.t<=end)}
function evalEv(asset,t,entry,dir){const horizons={}; for(const h of H){const r=atOrAfter(asset,t+h*3600000); horizons[`${h}h`]=r?retPct(dir,entry,r.p):null;} let mfe=-Infinity,mae=Infinity,mfeMin=null,maeMin=null; for(const r of between(asset,t,t+6*3600000)){const v=retPct(dir,entry,r.p); if(!Number.isFinite(v))continue; if(v>mfe){mfe=v;mfeMin=Math.round((r.t-t)/60000)} if(v<mae){mae=v;maeMin=Math.round((r.t-t)/60000)}} return {horizons,mfe6:Number.isFinite(mfe)?mfe:null,mae6:Number.isFinite(mae)?mae:null,mfeMin,maeMin}}
const state=readJson(path.join(DATA,'phase1d-alert-state.json'),{}); const tg=state.telegram_delivery||{}; function delivered(id){const d=tg[id]; return d&&d.ok===true&&!d.skipped}
const alerts=readJsonl(path.join(DATA,'phase1d-alerts.jsonl')).filter(a=>{const t=ts(a);return Number.isFinite(t)&&t>=SINCE&&t<=UNTIL&&!delivered(a.id)});
const emittedKeys=new Set(alerts.map(a=>`${a.timestamp_utc}|${a.asset}|${dirFromType(a.type)||''}`));
const shadows=readJsonl(path.join(DATA,'readiness-shadow.jsonl')).filter(s=>{const t=ts(s);return Number.isFinite(t)&&t>=SINCE&&t<=UNTIL});
const events=[];
for(const a of alerts){const t=ts(a), nd=dirFromType(a.type), entry=priceAlert(a); if(!nd||!Number.isFinite(entry))continue; const base={source:'emitted_nontelegram',asset:a.asset,type:a.type,timestamp_utc:a.timestamp_utc,natural_direction:nd,flow:flow(a),oi:oi(a),funding:funding(a),btc_gate:btcGate(a),state:a.readiness_shadow?.state||'NONE',score:num(a.readiness_shadow?.score),eff:num(a.readiness_shadow?.effective_score),entry}; for(const mode of ['natural','inverse']){const dir=mode==='natural'?nd:inv(nd); events.push({...base,mode,direction:dir,...evalEv(a.asset,t,entry,dir)})}}
for(const s of shadows){const t=ts(s), key=`${s.timestamp_utc}|${s.asset}|${s.direction||''}`, entry=priceShadow(s); if(emittedKeys.has(key)||!s.direction||!Number.isFinite(entry))continue; const base={source:'missing_shadow_no_alert',asset:s.asset,type:`SHADOW_${s.direction}`,timestamp_utc:s.timestamp_utc,natural_direction:s.direction,flow:flow(s),oi:oi(s),funding:funding(s),btc_gate:btcGate(s),state:s.state||'NONE',score:num(s.score),eff:num(s.effective_score),entry}; for(const mode of ['natural','inverse']){const dir=mode==='natural'?s.direction:inv(s.direction); events.push({...base,mode,direction:dir,...evalEv(s.asset,t,entry,dir)})}}
function dedup(rows){rows=rows.slice().sort((a,b)=>ts(a)-ts(b));const out=[];let last=-Infinity;for(const r of rows){const t=ts(r); if(t-last>=DEDUP_MS){out.push(r);last=t}}return out}
function summarise(raw){const rows=dedup(raw); const hs={}; for(const h of H){const vals=rows.map(r=>r.horizons[`${h}h`]).filter(Number.isFinite); hs[`${h}h`]={n:vals.length,win:vals.length?vals.filter(v=>v>0).length/vals.length*100:null,avg:avg(vals),med:med(vals)}} const ranked=Object.entries(hs).filter(([_,v])=>v.n>=Math.min(6,rows.length)&&Number.isFinite(v.win)).sort((a,b)=>b[1].win-a[1].win||b[1].avg-a[1].avg); return {raw_n:raw.length,n:rows.length,best_horizon:ranked[0]?.[0]||null,best:ranked[0]?.[1]||{},horizons:hs,med_mfe6:med(rows.map(r=>r.mfe6)),avg_mfe6:avg(rows.map(r=>r.mfe6)),med_mae6:med(rows.map(r=>r.mae6)),avg_mae6:avg(rows.map(r=>r.mae6)),med_mfe_min:med(rows.map(r=>r.mfeMin)),med_mae_min:med(rows.map(r=>r.maeMin)),states:Object.fromEntries([...new Set(rows.map(r=>r.state))].map(st=>[st,rows.filter(r=>r.state===st).length]))}}
function line(s){return `n=${s.n} raw=${s.raw_n}; best ${s.best_horizon||'n/a'} ${pct(s.best.win)} avg ${spct(s.best.avg)}; 1h ${pct(s.horizons['1h']?.win)} avg ${spct(s.horizons['1h']?.avg)}; MFE6 med ${spct(s.med_mfe6)} @${s.med_mfe_min??'n/a'}m; MAE6 med ${spct(s.med_mae6)} @${s.med_mae_min??'n/a'}m`}
const specs=[
 {key:'T1_FRESH_LONGS_LONG',label:'SOL FRESH_LONGS + source LONG',trade:'avoid original LONG / possible SHORT only after confirmation',mode:'natural',direction:'LONG',match:e=>e.asset==='SOL'&&e.natural_direction==='LONG'&&e.oi==='FRESH_LONGS'},
 {key:'SHORTS_COVERING_LONG_BEARISH',label:'SOL SHORTS_COVERING + source LONG',trade:'avoid original LONG',mode:'natural',direction:'LONG',match:e=>e.asset==='SOL'&&e.natural_direction==='LONG'&&e.oi==='SHORTS_COVERING'},
 {key:'FRESH_SHORTS_LONG',label:'FRESH_SHORTS + source LONG all assets',trade:'quarantine/block source LONG',mode:'natural',direction:'LONG',match:e=>e.natural_direction==='LONG'&&e.oi==='FRESH_SHORTS'},
 {key:'NEUTRAL_OI_LONG',label:'NEUTRAL OI + source LONG all assets',trade:'observation-only source LONG',mode:'natural',direction:'LONG',match:e=>e.natural_direction==='LONG'&&e.oi==='NEUTRAL'},
 {key:'BTC_LONG_SHADOW_SETUP_FORMING',label:'BTC source LONG + SHADOW_SETUP_FORMING',trade:'old natural LONG watch',mode:'natural',direction:'LONG',match:e=>e.asset==='BTC'&&e.natural_direction==='LONG'&&e.state==='SHADOW_SETUP_FORMING'},
 {key:'BTC_LONG_SETUP_SPOT_LED_ACCUMULATION',label:'BTC LONG_SETUP + SPOT_LED_ACCUMULATION',trade:'old natural LONG watch',mode:'natural',direction:'LONG',match:e=>e.asset==='BTC'&&e.type==='LONG_SETUP'&&e.flow==='SPOT_LED_ACCUMULATION'},
 {key:'ETH_LONG_CONFIRMED_INVERSE_SHORT',label:'ETH LONG_CONFIRMED → inverse SHORT',trade:'inverse SHORT',mode:'inverse',direction:'SHORT',match:e=>e.asset==='ETH'&&e.type==='LONG_CONFIRMED'},
 {key:'ETH_LONG_CONFIRMED_SPOT_LED_INVERSE_SHORT',label:'ETH LONG_CONFIRMED + SPOT_LED_ACCUMULATION → inverse SHORT',trade:'inverse SHORT',mode:'inverse',direction:'SHORT',match:e=>e.asset==='ETH'&&e.type==='LONG_CONFIRMED'&&e.flow==='SPOT_LED_ACCUMULATION'},
 {key:'ETH_LONG_SHADOW_BLOCKED_INVERSE_SHORT',label:'ETH source LONG + SHADOW_BLOCKED → inverse SHORT',trade:'inverse SHORT',mode:'inverse',direction:'SHORT',match:e=>e.asset==='ETH'&&e.natural_direction==='LONG'&&e.state==='SHADOW_BLOCKED'},
 {key:'ETH_LONG_SHADOW_NO_SETUP_INVERSE_SHORT',label:'ETH source LONG + SHADOW_NO_SETUP → inverse SHORT',trade:'inverse SHORT',mode:'inverse',direction:'SHORT',match:e=>e.asset==='ETH'&&e.natural_direction==='LONG'&&e.state==='SHADOW_NO_SETUP'},
 {key:'ETH_LONG_SHADOW_SETUP_FORMING_INVERSE_SHORT',label:'ETH source LONG + SHADOW_SETUP_FORMING → inverse SHORT',trade:'inverse SHORT',mode:'inverse',direction:'SHORT',match:e=>e.asset==='ETH'&&e.natural_direction==='LONG'&&e.state==='SHADOW_SETUP_FORMING'},
 {key:'SOL_LONG_CONFIRMED_STRUCTURAL_BUYING_INVERSE_SHORT',label:'SOL LONG_CONFIRMED + STRUCTURAL_BUYING → inverse SHORT',trade:'inverse SHORT',mode:'inverse',direction:'SHORT',match:e=>e.asset==='SOL'&&e.type==='LONG_CONFIRMED'&&e.flow==='STRUCTURAL_BUYING'},
 {key:'SOL_LONG_SHADOW_CONFIRMED_INVERSE_SHORT',label:'SOL source LONG + SHADOW_CONFIRMED → inverse SHORT',trade:'inverse SHORT',mode:'inverse',direction:'SHORT',match:e=>e.asset==='SOL'&&e.natural_direction==='LONG'&&e.state==='SHADOW_CONFIRMED'},
 {key:'SOL_LONG_WATCH_ONLY',label:'SOL source LONG generic',trade:'watch-only / no active context',mode:'natural',direction:'LONG',match:e=>e.asset==='SOL'&&e.natural_direction==='LONG'},
 {key:'C1_SHORT_MAX',label:'SHORT score>=70 + FRESH_LONGS',trade:'same-direction SHORT',mode:'natural',direction:'SHORT',match:e=>e.natural_direction==='SHORT'&&e.score>=70&&e.oi==='FRESH_LONGS'},
 {key:'FADE_LONG_BTC_WEAK',label:'source LONG below gate under BTC_WEAK',trade:'avoid LONG / tactical SHORT fade context',mode:'inverse',direction:'SHORT',match:e=>e.natural_direction==='LONG'&&e.score<70&&e.btc_gate==='BTC_WEAK_VETO_ALT_LONGS'},
 {key:'FADE_SHORT_POSITIVE_FUNDING',label:'SHORT below gate 50-69 + broad positive funding',trade:'old opposite LONG fade caution',mode:'inverse',direction:'LONG',match:e=>e.natural_direction==='SHORT'&&e.score>=50&&e.score<70&&e.funding==='BROAD_POSITIVE_FUNDING'},
 {key:'FADE_SHORT_LATE_AFTER_LOW',label:'SHORT below gate late after low',trade:'opposite LONG caution',mode:'inverse',direction:'LONG',match:e=>false},
 {key:'SOL_SHORT_BELOW_GATE',label:'SOL source SHORT below gate',trade:'same-direction SHORT watch',mode:'natural',direction:'SHORT',match:e=>e.asset==='SOL'&&e.natural_direction==='SHORT'&&e.score<70},
 {key:'SOL_SHORT_50_59',label:'SOL source SHORT score 50-59',trade:'same-direction SHORT watch',mode:'natural',direction:'SHORT',match:e=>e.asset==='SOL'&&e.natural_direction==='SHORT'&&e.score>=50&&e.score<=59},
 {key:'SOL_SHORT_SHORTS_COVERING',label:'SOL source SHORT + SHORTS_COVERING',trade:'same-direction SHORT watch',mode:'natural',direction:'SHORT',match:e=>e.asset==='SOL'&&e.natural_direction==='SHORT'&&e.oi==='SHORTS_COVERING'},
];
function recommendation(key,s){
 if(s.n<8) return ['REMOVE_STATS_OR_MARK_LOW_N', 'Post-fix N is below 8 or absent; do not show historical numeric confidence as if current.'];
 const one=s.horizons['1h'], best=s.best;
 if(key==='BTC_LONG_SETUP_SPOT_LED_ACCUMULATION') return ['REMOVE_OR_INVERT', 'Conflicts with new BTC LONG_SETUP inverse-short evidence; old natural LONG watch is misleading post-fix.'];
 if(key==='BTC_LONG_SHADOW_SETUP_FORMING') return [best.win>=70? 'DOWNGRADE_RETEST':'REMOVE_PROMOTION', 'Post-fix BTC SHADOW_SETUP_FORMING no longer clears old 2–4h bounce edge; keep only if explicitly labelled stale/pre-fix.'];
 if(key.startsWith('ETH_LONG')||key.startsWith('SOL_LONG_CONFIRMED')||key.startsWith('SOL_LONG_SHADOW')) return [best.win>=70?'KEEP_WITH_UPDATED_POSTFIX_STATS':'DOWNGRADE_TO_OBSERVATION', 'Update N/MFE/MAE/timing from post-fix data; clarify source shadow is original LONG, trade is inverse SHORT.'];
 if(key.includes('FADE_SHORT')) return [best.win>=70?'KEEP_WATCH_ONLY_WITH_CAUTION':'REMOVE_NUMERIC_EDGE', 'Do not imply automatic opposite LONG; show only as caution unless current post-fix inverse clears threshold.'];
 if(key.includes('SOL_SHORT')) return [best.win>=70?'KEEP_FRONT_LOADED_WITH_RISK':'DOWNGRADE_NO_TELEGRAM', 'Show as same-direction SHORT only if 1h/front-loaded edge is clear; include MAE because path is volatile.'];
 if(key==='FADE_LONG_BTC_WEAK') return [best.win>=70||one.win>=60?'KEEP_AS_NO_LONG_CONTEXT':'KEEP_NO_STATS', 'Useful as no-long/tactical fade context; avoid automatic SHORT claim.'];
 return [best.win>=70?'KEEP_WITH_UPDATED_STATS':'KEEP_AS_QUARANTINE_OR_REMOVE_STATS', 'Current post-fix data does not justify strong trade wording; keep only decision/risk guidance.'];
}
const results=[];
for(const sp of specs){const raw=events.filter(e=>e.mode===sp.mode&&e.direction===sp.direction&&sp.match(e)); const s=summarise(raw); const [rec,why]=recommendation(sp.key,s); results.push({...sp, ...s, recommendation:rec, why});}
let md=[]; md.push('# Alert knowledge-line review excluding newly promoted candidates'); md.push(`Generated: ${new Date().toISOString()}`); md.push(`Window: ${new Date(SINCE).toISOString()} → ${new Date(UNTIL).toISOString()}`); md.push('Excludes alerts actually delivered to Telegram; includes suppressed/log-only + missing shadow rows. Dedup: 6h per reviewed bucket.'); md.push('');
for(const r of results){md.push(`## ${r.key}`); md.push(`- Meaning: ${r.label}`); md.push(`- Intended trade/read: ${r.trade}`); md.push(`- Current post-fix evidence: ${line(r)}`); md.push(`- States: ${JSON.stringify(r.states)}`); md.push(`- Recommendation: **${r.recommendation}** — ${r.why}`); md.push('');}
const outMd=path.join(DATA,'alert-knowledge-line-review-current.md'); const outJson=path.join(DATA,'alert-knowledge-line-review-current.json'); fs.writeFileSync(outMd,md.join('\n')); fs.writeFileSync(outJson,JSON.stringify({generated_at:new Date().toISOString(),since:new Date(SINCE).toISOString(),until:new Date(UNTIL).toISOString(),results},null,2)); console.log(JSON.stringify({ok:true,outMd:path.relative(ROOT,outMd),outJson:path.relative(ROOT,outJson),count:results.length},null,2));
