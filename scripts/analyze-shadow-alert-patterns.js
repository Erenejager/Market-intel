#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const ALERTS = path.join(DATA, 'phase1d-alerts.jsonl');
const SHADOW = path.join(DATA, 'readiness-shadow.jsonl');
const PRICE = path.join(DATA, 'autoresearch', 'price-15m.jsonl');
const OUT_JSON = path.join(DATA, 'shadow-alert-price-patterns.json');
const OUT_MD = path.join(DATA, 'shadow-alert-price-patterns.md');
const HORIZONS = [
  ['30m', 30*60*1000], ['1h', 60*60*1000], ['4h', 4*60*60*1000],
  ['8h', 8*60*60*1000], ['12h', 12*60*60*1000], ['24h', 24*60*60*1000],
];
function readJsonl(f){try{return fs.readFileSync(f,'utf8').trim().split('\n').filter(Boolean).map(JSON.parse)}catch{return[]}}
function t(r){return Date.parse(r.timestamp_utc||r.timestamp||'')}
function n(x){const v=Number(x);return Number.isFinite(v)?v:null}
function pct(x,d=3){return Number.isFinite(x)?`${x.toFixed(d)}%`:'n/a'}
function ratio(x){return Number.isFinite(x)?`${(x*100).toFixed(1)}%`:'n/a'}
function dir(type){if(type==='LONG_CONFIRMED')return'LONG'; if(type==='SHORT_CONFIRMED')return'SHORT'; return null}
function dirRet(direction, entry, future){ if(!Number.isFinite(entry)||!Number.isFinite(future))return null; const raw=(future-entry)/entry*100; return direction==='SHORT'?-raw:raw; }
function rawRet(entry,future){ if(!Number.isFinite(entry)||!Number.isFinite(future))return null; return (future-entry)/entry*100; }
function median(vals){ if(!vals.length)return null; const s=vals.slice().sort((a,b)=>a-b); return s[Math.floor(s.length/2)]; }
function avg(vals){ return vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : null; }
function q(vals,p){ if(!vals.length)return null; const s=vals.slice().sort((a,b)=>a-b); return s[Math.min(s.length-1, Math.max(0, Math.floor((s.length-1)*p)))]; }
const alerts = readJsonl(ALERTS).sort((a,b)=>t(a)-t(b));
const shadows = readJsonl(SHADOW).sort((a,b)=>t(a)-t(b));
const prices = readJsonl(PRICE).sort((a,b)=>t(a)-t(b));
const shadowByKey = new Map();
for (const s of shadows) {
  const key = `${s.asset}:${s.direction}`;
  if (!shadowByKey.has(key)) shadowByKey.set(key, []);
  shadowByKey.get(key).push({...s, _t:t(s)});
}
function nearestShadow(asset, direction, ms) {
  const arr = shadowByKey.get(`${asset}:${direction}`)||[];
  let best=null;
  for (const s of arr) {
    const d = Math.abs(s._t - ms);
    if (d <= 16*60*1000 && (!best || d < best.diff)) best = {row:s, diff:d};
    if (s._t > ms + 16*60*1000) break;
  }
  return best ? best.row : null;
}
function priceAtOrAfter(asset, target) {
  for (const row of prices) {
    const ms=t(row); if(ms < target) continue;
    const p=n(row.prices?.[asset]?.lastPrice); if(Number.isFinite(p)) return {price:p, timestamp_utc:row.timestamp_utc, t:ms};
  }
  return null;
}
function priceWindow(asset, start, end) {
  return prices.map(row=>{const ms=t(row); const p=n(row.prices?.[asset]?.lastPrice); if(!Number.isFinite(ms)||!Number.isFinite(p)||ms<start||ms>end)return null; return {t:ms, price:p, timestamp_utc:row.timestamp_utc};}).filter(Boolean);
}
function band(score, state) {
  if (!Number.isFinite(score)) return 'missing_shadow';
  if (score >= 70 || state === 'SHADOW_CONFIRMED') return 'score>=70 confirmed';
  if (score >= 50) return 'score50-69 forming';
  return 'score<50 no_setup/blocked';
}
function stateGroup(s) { return s ? `${s.state} (${band(n(s.effective_score ?? s.score), s.state)})` : 'missing_shadow'; }
const rows = alerts.filter(a=>dir(a.type)).map(a=>{
  const ms=t(a), direction=dir(a.type), entry=n(a.diagnostics?.price), sh=nearestShadow(a.asset,direction,ms);
  const horizons={};
  for (const [label,dur] of HORIZONS) {
    const p=priceAtOrAfter(a.asset, ms+dur);
    horizons[label]=p?{timestamp_utc:p.timestamp_utc, raw_return_pct:rawRet(entry,p.price), directional_return_pct:dirRet(direction,entry,p.price), price:p.price}:null;
  }
  const win4=priceWindow(a.asset, ms, ms+4*60*60*1000);
  const dirVals=win4.map(x=>dirRet(direction,entry,x.price)).filter(Number.isFinite);
  const prev2=priceWindow(a.asset, ms-2*60*60*1000, ms);
  const surrounding=priceWindow(a.asset, ms-2*60*60*1000, ms+4*60*60*1000);
  let late=null, extreme=null;
  if (surrounding.length) {
    if (direction==='LONG') extreme = surrounding.reduce((b,x)=>!b||x.price>b.price?x:b,null);
    else extreme = surrounding.reduce((b,x)=>!b||x.price<x.price?x:b,null); // overwritten below
    if (direction==='SHORT') extreme = surrounding.reduce((b,x)=>!b||x.price<b.price?x:b,null);
    const lagMin=Math.round((ms-extreme.t)/60000);
    late = {extreme_timestamp_utc:extreme.timestamp_utc, extreme_price:extreme.price, alert_lag_minutes_after_extreme:lagMin, is_after_local_extreme:lagMin>0};
  }
  const runup2h = prev2.length ? (direction==='LONG' ? rawRet(prev2[0].price, entry) : -rawRet(prev2[0].price, entry)) : null;
  const score = sh ? n(sh.effective_score ?? sh.score) : null;
  return {
    timestamp_utc:a.timestamp_utc, asset:a.asset, type:a.type, direction, entry_price:entry,
    shadow: sh ? {timestamp_utc:sh.timestamp_utc, state:sh.state, score:n(sh.score), effective_score:score, band:band(score, sh.state), flow:sh.source_metrics?.flow, flow_confirmed:sh.source_metrics?.flow_confirmed, flow_streak:sh.source_metrics?.flow_streak, btc_gate:sh.source_metrics?.btc_gate, cvd_divergence:sh.source_metrics?.cvd_divergence, funding:sh.source_metrics?.cross_exchange_positioning?.classification, liquidity_primary:sh.source_metrics?.order_book_imbalance?.primary, macro_regime:sh.source_metrics?.macro?.regime, reasons:sh.reasons, hard_gates:sh.hard_gates} : null,
    shadow_group: stateGroup(sh), shadow_confirmed: !!(sh && (sh.state==='SHADOW_CONFIRMED' || score>=70)), shadow_score: score,
    horizons, mfe_4h_pct: dirVals.length ? Math.max(...dirVals) : null, mae_4h_pct: dirVals.length ? Math.min(...dirVals) : null,
    adverse_1h: horizons['1h']?.directional_return_pct < 0, favorable_1h: horizons['1h']?.directional_return_pct > 0,
    raw_down_1h: horizons['1h']?.raw_return_pct < 0,
    late, directional_runup_prev2h_pct: runup2h,
    alert_reason:a.reason,
  }
});
function summarize(name, subset) {
  const out={name, n:subset.length, horizons:{}};
  for (const [label] of HORIZONS) {
    const vals=subset.map(r=>r.horizons[label]?.directional_return_pct).filter(Number.isFinite);
    out.horizons[label]={n:vals.length, hit_rate:vals.length?vals.filter(v=>v>0).length/vals.length:null, adverse_rate:vals.length?vals.filter(v=>v<0).length/vals.length:null, avg_pct:avg(vals), median_pct:median(vals), p25_pct:q(vals,.25), p75_pct:q(vals,.75)};
  }
  const mae=subset.map(r=>r.mae_4h_pct).filter(Number.isFinite), mfe=subset.map(r=>r.mfe_4h_pct).filter(Number.isFinite);
  out.mfe_4h_avg_pct=avg(mfe); out.mae_4h_avg_pct=avg(mae);
  out.late_rate=subset.length?subset.filter(r=>r.late?.is_after_local_extreme).length/subset.filter(r=>r.late).length:null;
  return out;
}
function groupBy(rows, fn) { const m=new Map(); for (const r of rows) {const k=fn(r); if(!m.has(k))m.set(k,[]); m.get(k).push(r)} return [...m.entries()].map(([k,v])=>[k,v]); }
const postShadow = rows.filter(r=>r.shadow);
const summaries=[];
summaries.push(summarize('ALL directional confirmed', rows));
summaries.push(summarize('post-shadow directional confirmed', postShadow));
for (const d of ['LONG','SHORT']) summaries.push(summarize(`${d} post-shadow`, postShadow.filter(r=>r.direction===d)));
for (const [k,v] of groupBy(postShadow, r=>r.shadow.band)) summaries.push(summarize(`shadow band: ${k}`, v));
for (const d of ['LONG','SHORT']) for (const [k,v] of groupBy(postShadow.filter(r=>r.direction===d), r=>r.shadow.band)) summaries.push(summarize(`${d} shadow band: ${k}`, v));
for (const [k,v] of groupBy(postShadow, r=>r.shadow.state)) summaries.push(summarize(`shadow state: ${k}`, v));
for (const [k,v] of groupBy(postShadow.filter(r=>r.direction==='LONG'), r=>r.shadow.flow)) summaries.push(summarize(`LONG flow: ${k}`, v));
for (const [k,v] of groupBy(postShadow, r=>r.shadow.btc_gate||'none')) summaries.push(summarize(`btc_gate: ${k}`, v));
for (const [k,v] of groupBy(postShadow, r=>r.shadow.funding||'none')) summaries.push(summarize(`funding: ${k}`, v));
function tableSummary(s) { const h=s.horizons; return {name:s.name,n:s.n,'1h_n':h['1h'].n,'1h_hit':ratio(h['1h'].hit_rate),'1h_adverse':ratio(h['1h'].adverse_rate),'1h_avg':pct(h['1h'].avg_pct),'4h_hit':ratio(h['4h'].hit_rate),'4h_avg':pct(h['4h'].avg_pct),'mae4h_avg':pct(s.mae_4h_avg_pct),'late':ratio(s.late_rate)} }
const keyRows = [
  summarize('LONG score>=70', postShadow.filter(r=>r.direction==='LONG'&&r.shadow_score>=70)),
  summarize('LONG score<70', postShadow.filter(r=>r.direction==='LONG'&&Number.isFinite(r.shadow_score)&&r.shadow_score<70)),
  summarize('LONG score<50', postShadow.filter(r=>r.direction==='LONG'&&Number.isFinite(r.shadow_score)&&r.shadow_score<50)),
  summarize('LONG score50-69', postShadow.filter(r=>r.direction==='LONG'&&r.shadow_score>=50&&r.shadow_score<70)),
  summarize('SHORT score>=70', postShadow.filter(r=>r.direction==='SHORT'&&r.shadow_score>=70)),
  summarize('SHORT score<70', postShadow.filter(r=>r.direction==='SHORT'&&Number.isFinite(r.shadow_score)&&r.shadow_score<70)),
  summarize('SHORT score<50', postShadow.filter(r=>r.direction==='SHORT'&&Number.isFinite(r.shadow_score)&&r.shadow_score<50)),
  summarize('SHORT score50-69', postShadow.filter(r=>r.direction==='SHORT'&&r.shadow_score>=50&&r.shadow_score<70)),
];
const cases = rows.map(r=>({time:r.timestamp_utc, asset:r.asset, type:r.type, entry:r.entry_price, shadow_state:r.shadow?.state||'missing', shadow_score:r.shadow_score, shadow_band:r.shadow?.band||'missing', flow:r.shadow?.flow, btc_gate:r.shadow?.btc_gate, funding:r.shadow?.funding, r_30m:r.horizons['30m']?.directional_return_pct, r_1h:r.horizons['1h']?.directional_return_pct, r_4h:r.horizons['4h']?.directional_return_pct, mfe_4h:r.mfe_4h_pct, mae_4h:r.mae_4h_pct, late_lag_min:r.late?.alert_lag_minutes_after_extreme, reason:r.alert_reason}));
const json = {generated_at:new Date().toISOString(), inputs:{alerts:ALERTS, shadow:SHADOW, price:PRICE}, counts:{directional_confirmed:rows.length, post_shadow:postShadow.length, missing_shadow:rows.length-postShadow.length}, key_summary:keyRows.map(tableSummary), summaries:summaries.map(tableSummary), cases};
fs.writeFileSync(OUT_JSON, JSON.stringify(json,null,2));
let md = `# Shadow Readiness vs Trade Alert Price Evolution\n\nGenerated: ${json.generated_at}\n\nDirectional confirmed alerts only (`+'`LONG_CONFIRMED` / `SHORT_CONFIRMED`'+`). Returns are directional: positive means price moved in alert direction. Shadow is nearest same asset/direction sample within 16 minutes.\n\n`;
md += `## Key score-band summary\n\n| slice | n | 1h n | 1h hit | 1h adverse | 1h avg | 4h hit | 4h avg | avg MAE 4h | late rate |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n`;
for (const s of keyRows.map(tableSummary)) md += `| ${s.name} | ${s.n} | ${s['1h_n']} | ${s['1h_hit']} | ${s['1h_adverse']} | ${s['1h_avg']} | ${s['4h_hit']} | ${s['4h_avg']} | ${s['mae4h_avg']} | ${s.late} |\n`;
md += `\n## Main slices\n\n| slice | n | 1h n | 1h hit | 1h adverse | 1h avg | 4h hit | 4h avg | avg MAE 4h | late rate |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n`;
for (const s of summaries.map(tableSummary)) md += `| ${s.name} | ${s.n} | ${s['1h_n']} | ${s['1h_hit']} | ${s['1h_adverse']} | ${s['1h_avg']} | ${s['4h_hit']} | ${s['4h_avg']} | ${s['mae4h_avg']} | ${s.late} |\n`;
md += `\n## Alert-level joined cases\n\n| time | asset | type | shadow | score | 30m | 1h | 4h | MFE 4h | MAE 4h | late lag |\n| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n`;
for (const c of cases) md += `| ${c.time} | ${c.asset} | ${c.type} | ${c.shadow_state} | ${Number.isFinite(c.shadow_score)?c.shadow_score:'n/a'} | ${pct(c.r_30m)} | ${pct(c.r_1h)} | ${pct(c.r_4h)} | ${pct(c.mfe_4h)} | ${pct(c.mae_4h)} | ${Number.isFinite(c.late_lag_min)?c.late_lag_min+'m':'n/a'} |\n`;
fs.writeFileSync(OUT_MD, md);
console.log(JSON.stringify({out_json:OUT_JSON,out_md:OUT_MD, counts:json.counts, key_summary:json.key_summary}, null, 2));
