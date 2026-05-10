#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ALERTS = path.join(ROOT, 'data/phase1d-alerts.jsonl');
const PRICES = path.join(ROOT, 'data/autoresearch/price-15m.jsonl');
const OUT_MD = path.join(ROOT, 'data/inverse-signal-review.md');
const OUT_JSON = path.join(ROOT, 'data/inverse-signal-review.json');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { since: null, minN: 3 };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--since') out.since = args[++i];
    else if (args[i] === '--min-n') out.minN = Number(args[++i]);
  }
  return out;
}
function readJsonl(file) {
  return fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
}
function t(s) { const x = Date.parse(s); return Number.isFinite(x) ? x : null; }
function num(x) { const n = Number(x); return Number.isFinite(n) ? n : null; }
function pct(entry, price, dir) {
  if (!Number.isFinite(entry) || !Number.isFinite(price) || entry <= 0) return null;
  const raw = (price - entry) / entry * 100;
  return dir === 'LONG' ? raw : -raw;
}
function avg(xs) { xs = xs.filter(Number.isFinite); return xs.length ? xs.reduce((a,b)=>a+b,0)/xs.length : null; }
function median(xs) { xs = xs.filter(Number.isFinite).sort((a,b)=>a-b); if (!xs.length) return null; const m=Math.floor(xs.length/2); return xs.length%2?xs[m]:(xs[m-1]+xs[m])/2; }
function fmtPct(x) { return Number.isFinite(x) ? `${x >= 0 ? '+' : ''}${x.toFixed(3)}%` : 'n/a'; }
function fmtRate(x) { return Number.isFinite(x) ? `${(x*100).toFixed(1)}%` : 'n/a'; }
function baseType(type) { return String(type || '').replace(/^ACTIVE_CONTEXT_/, 'CTX_'); }

function buildPriceIndex(rows) {
  const byAsset = new Map();
  for (const r of rows) {
    const ms = t(r.timestamp_utc); if (!ms) continue;
    for (const [asset, p] of Object.entries(r.prices || {})) {
      const price = num(p.lastPrice ?? p.price);
      if (!Number.isFinite(price)) continue;
      if (!byAsset.has(asset)) byAsset.set(asset, []);
      byAsset.get(asset).push({ t: ms, timestamp_utc: r.timestamp_utc, price });
    }
  }
  for (const arr of byAsset.values()) arr.sort((a,b)=>a.t-b.t);
  return byAsset;
}
function lowerBound(arr, target) {
  let lo = 0, hi = arr.length;
  while (lo < hi) { const mid=(lo+hi)>>1; if (arr[mid].t < target) lo=mid+1; else hi=mid; }
  return lo;
}
function priceAtOrAfter(index, asset, targetMs, maxLagMs = 20*60*1000) {
  const arr = index.get(asset); if (!arr) return null;
  const i = lowerBound(arr, targetMs); if (i >= arr.length) return null;
  if (arr[i].t - targetMs > maxLagMs) return null;
  return arr[i];
}
function pricePath(index, asset, startMs, endMs) {
  const arr = index.get(asset); if (!arr) return [];
  let i = lowerBound(arr, startMs);
  const out = [];
  for (; i < arr.length && arr[i].t <= endMs; i++) out.push(arr[i]);
  return out;
}

function naturalDirection(alert) {
  const type = alert.type;
  if (type === 'LONG_CONFIRMED' || type === 'LONG_SETUP' || type === 'RETEST_HELD' || type === 'RETESTING_RECLAIMED_LEVEL') return 'LONG';
  if (type === 'SHORT_CONFIRMED' || type === 'SHORT_SETUP' || type === 'RETEST_FAILED') return 'SHORT';
  if (type === 'LONG_INVALIDATED') return 'SHORT';
  if (type === 'SHORT_INVALIDATED') return 'LONG';
  if (type === 'LONG_CAUTION') return 'SHORT';
  if (type === 'SHORT_CAUTION') return 'LONG';
  if (String(type).startsWith('ACTIVE_CONTEXT_')) {
    const d = alert.active_context?.direction;
    if (d === 'LONG') return 'SHORT';
    if (d === 'SHORT') return 'LONG';
  }
  return null;
}
function opposite(d) { return d === 'LONG' ? 'SHORT' : d === 'SHORT' ? 'LONG' : null; }
function entryPrice(alert, index, ms) {
  return num(alert.diagnostics?.price) ?? num(alert.active_context?.health?.current_price) ?? num(alert.active_context?.activated_price) ?? priceAtOrAfter(index, alert.asset, ms)?.price ?? null;
}
function setupKey(alert) {
  const d = alert.diagnostics || {};
  if (alert.active_context) {
    return [
      alert.active_context.source_type || 'ctx',
      alert.active_context.oi_context || 'oi?',
      alert.active_context.funding_context || 'funding?',
      alert.active_context.health?.status || 'health?',
    ].join('|');
  }
  return [d.flow || 'flow?', d.flow_confirmed === true ? 'confirmed' : d.flow_confirmed === false ? 'unconfirmed' : 'conf?', `streak${d.flow_streak ?? '?'}`, d.btc_gate || 'btc?', d.reclaim_retest_state || 'retest?'].join('|');
}
function compactReason(alert) {
  return String(alert.reason || '').replace(/\s+/g, ' ').slice(0, 110);
}

function summarize(rows, dirField) {
  const hs = ['15m','30m','1h','2h','4h'];
  const s = { n: rows.length };
  for (const h of hs) {
    const vals = rows.map(r => r[`${dirField}_${h}`]).filter(Number.isFinite);
    s[h] = { n: vals.length, hit: vals.length ? vals.filter(v => v > 0).length / vals.length : null, avg: avg(vals), med: median(vals) };
  }
  const mfes = rows.map(r => r[`${dirField}_mfe_4h`]).filter(Number.isFinite);
  const maes = rows.map(r => r[`${dirField}_mae_4h`]).filter(Number.isFinite);
  const fav = rows.filter(r => r[`${dirField}_favorable_anytime_4h`]);
  s.path = {
    n: mfes.length,
    favorable_anytime: mfes.length ? fav.length / mfes.length : null,
    avg_mfe: avg(mfes),
    avg_mae: avg(maes),
    median_minutes_to_first_favorable: median(rows.map(r => r[`${dirField}_minutes_to_first_favorable`]).filter(Number.isFinite)),
    median_minutes_to_mfe: median(rows.map(r => r[`${dirField}_minutes_to_mfe`]).filter(Number.isFinite)),
  };
  return s;
}
function addMetrics(row, samples, entry, startMs, dir, prefix) {
  const horizons = { '15m': 15, '30m': 30, '1h': 60, '2h': 120, '4h': 240 };
  for (const [label, mins] of Object.entries(horizons)) {
    const target = startMs + mins*60000;
    const p = samples.find(s => s.t >= target && s.t - target <= 20*60000);
    row[`${prefix}_${label}`] = p ? pct(entry, p.price, dir) : null;
  }
  const directional = samples.map(s => ({...s, ret: pct(entry, s.price, dir)})).filter(s => Number.isFinite(s.ret));
  if (!directional.length) return;
  const mfe = directional.reduce((a,b) => b.ret > a.ret ? b : a, directional[0]);
  const mae = directional.reduce((a,b) => b.ret < a.ret ? b : a, directional[0]);
  const first = directional.find(s => s.ret > 0);
  row[`${prefix}_mfe_4h`] = mfe.ret;
  row[`${prefix}_mae_4h`] = mae.ret;
  row[`${prefix}_minutes_to_mfe`] = Math.round((mfe.t - startMs)/60000);
  row[`${prefix}_favorable_anytime_4h`] = Boolean(first);
  row[`${prefix}_minutes_to_first_favorable`] = first ? Math.round((first.t - startMs)/60000) : null;
}
function groupBy(rows, fn) {
  const m = new Map();
  for (const r of rows) { const k = fn(r); if (!m.has(k)) m.set(k, []); m.get(k).push(r); }
  return [...m.entries()].map(([key, rs]) => ({ key, rows: rs, inverse: summarize(rs,'inverse'), natural: summarize(rs,'natural') }));
}
function score(g) {
  const h30 = g.inverse['30m'], h1 = g.inverse['1h'], h4 = g.inverse['4h'];
  const p = g.inverse.path;
  return (h30.avg ?? -9) + (h1.avg ?? -9) + 0.5*(h4.avg ?? -9) + 0.2*(p.avg_mfe ?? 0) + ((h30.hit ?? 0)-0.5) + ((h1.hit ?? 0)-0.5);
}
function lineFor(g) {
  const inv = g.inverse, nat = g.natural;
  return `- ${g.key}: n=${inv.n} | inverse 15m ${fmtRate(inv['15m'].hit)} ${fmtPct(inv['15m'].avg)} n=${inv['15m'].n}; 30m ${fmtRate(inv['30m'].hit)} ${fmtPct(inv['30m'].avg)}; 1h ${fmtRate(inv['1h'].hit)} ${fmtPct(inv['1h'].avg)}; peak-within-4h ${fmtPct(inv.path.avg_mfe)} @ median ${inv.path.median_minutes_to_mfe ?? 'n/a'}m; 4h close ${fmtRate(inv['4h'].hit)} ${fmtPct(inv['4h'].avg)} n=${inv['4h'].n}; path fav ${fmtRate(inv.path.favorable_anytime)} firstFav ${inv.path.median_minutes_to_first_favorable ?? 'n/a'}m; MAE ${fmtPct(inv.path.avg_mae)} | natural 1h ${fmtRate(nat['1h'].hit)} ${fmtPct(nat['1h'].avg)}, peak-within-4h ${fmtPct(nat.path.avg_mfe)} @ ${nat.path.median_minutes_to_mfe ?? 'n/a'}m, 4h close ${fmtRate(nat['4h'].hit)} ${fmtPct(nat['4h'].avg)}`;
}

function main() {
  const args = parseArgs();
  const sinceMs = args.since ? Date.parse(args.since) : -Infinity;
  const priceIndex = buildPriceIndex(readJsonl(PRICES));
  const rows = [];
  for (const a of readJsonl(ALERTS)) {
    const ms = t(a.timestamp_utc); if (!ms || ms < sinceMs) continue;
    if (!a.asset || a.asset === 'CROSS_ASSET') continue;
    const nat = naturalDirection(a); if (!nat) continue;
    const inv = opposite(nat); if (!inv) continue;
    const entry = entryPrice(a, priceIndex, ms); if (!Number.isFinite(entry)) continue;
    const samples = pricePath(priceIndex, a.asset, ms, ms + 4*3600*1000 + 20*60*1000);
    if (!samples.length) continue;
    const row = {
      timestamp_utc: a.timestamp_utc,
      asset: a.asset,
      type: a.type,
      natural_direction: nat,
      inverse_direction: inv,
      entry,
      reason: compactReason(a),
      setup_key: setupKey(a),
      fingerprint: a.fingerprint || a.active_context?.fingerprint || null,
    };
    addMetrics(row, samples, entry, ms, nat, 'natural');
    addMetrics(row, samples, entry, ms, inv, 'inverse');
    rows.push(row);
  }
  const groups = {
    by_type: groupBy(rows, r => r.type).filter(g => g.rows.length >= args.minN).sort((a,b)=>score(b)-score(a)),
    by_type_asset: groupBy(rows, r => `${r.type}/${r.asset}`).filter(g => g.rows.length >= args.minN).sort((a,b)=>score(b)-score(a)),
    by_setup: groupBy(rows, r => `${r.type}/${r.asset}/${r.setup_key}`).filter(g => g.rows.length >= args.minN).sort((a,b)=>score(b)-score(a)),
  };
  const candidates = groups.by_setup.filter(g => {
    const inv = g.inverse;
    return ((inv['15m'].n >= 3 && inv['15m'].hit >= 0.6 && inv['15m'].avg > 0) ||
      (inv['30m'].n >= 3 && inv['30m'].hit >= 0.6 && inv['30m'].avg > 0) ||
      (inv['1h'].n >= 3 && inv['1h'].hit >= 0.6 && inv['1h'].avg > 0) ||
      (inv['4h'].n >= 3 && inv['4h'].hit >= 0.6 && inv['4h'].avg > 0) ||
      (inv.path.n >= 3 && inv.path.favorable_anytime >= 0.75 && inv.path.avg_mfe > Math.abs(inv.path.avg_mae || 0)*0.8));
  });
  const badInverse = groups.by_setup.filter(g => g.inverse['1h'].n >= 3 && (g.inverse['1h'].hit < 0.45 || g.inverse['1h'].avg <= 0)).slice(-999).sort((a,b)=>a.inverse['1h'].avg-b.inverse['1h'].avg);

  const md = [];
  md.push(`# Inverse Signal Review`);
  md.push(`\nGenerated: ${new Date().toISOString()}`);
  md.push(`Since: ${args.since || 'all available alerts'}`);
  md.push(`Rows measured: ${rows.length}`);
  md.push(`\nDefinition: natural direction follows the alert's normal meaning; inverse direction is the opposite trade. Examples: LONG_CONFIRMED natural LONG / inverse SHORT; LONG_INVALIDATED natural SHORT / inverse LONG; ACTIVE_CONTEXT_FAILED on a LONG context natural SHORT / inverse LONG.`);
  md.push(`\n## Best inverse candidates by specific setup`);
  md.push(...(candidates.slice(0,30).map(lineFor)));
  md.push(`\n## By signal type`);
  md.push(...groups.by_type.map(lineFor));
  md.push(`\n## By signal type and asset`);
  md.push(...groups.by_type_asset.slice(0,80).map(lineFor));
  md.push(`\n## Specific setup buckets where inverse is weak/dangerous at 1h`);
  md.push(...badInverse.slice(0,30).map(lineFor));
  md.push(`\n## Recent inverse rows`);
  for (const r of rows.slice(-60)) {
    md.push(`- ${r.timestamp_utc} ${r.asset} ${r.type} inverse ${r.inverse_direction}: 15m ${fmtPct(r.inverse_15m)} 30m ${fmtPct(r.inverse_30m)} 1h ${fmtPct(r.inverse_1h)} peak-within-4h ${fmtPct(r.inverse_mfe_4h)} @ ${r.inverse_minutes_to_mfe ?? 'n/a'}m 4h-close ${fmtPct(r.inverse_4h)} MAE ${fmtPct(r.inverse_mae_4h)} | ${r.setup_key} | ${r.reason}`);
  }
  fs.writeFileSync(OUT_MD, md.join('\n'));
  fs.writeFileSync(OUT_JSON, JSON.stringify({ generated_at: new Date().toISOString(), since: args.since || null, rows, groups, candidates: candidates.slice(0,50) }, null, 2));
  console.log(JSON.stringify({ ok: true, rows: rows.length, out_md: OUT_MD, out_json: OUT_JSON, candidates: candidates.length }, null, 2));
}
main();
