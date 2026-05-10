#!/usr/bin/env node
/*
  OI bucket decomposition for confirmed Phase 1d alerts.

  Modes:
  - confirmed-alert: one row per LONG_CONFIRMED/SHORT_CONFIRMED HIGH alert.
  - episode: one row per unique active context episode, using the first confirmed
    alert as entry and deduplicating later same asset/direction confirmations
    until the same-direction invalidation, opposite confirmed signal, or 24h
    fallback window if no context boundary exists.

  Joins each row to nearest readiness-shadow row with same asset/direction within
  16 minutes and uses source_metrics.oi_price_regime + shadow state.
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const ALERTS_PATH = path.join(DATA, 'phase1d-alerts.jsonl');
const SHADOW_PATH = path.join(DATA, 'readiness-shadow.jsonl');
const PRICE_PATH = path.join(DATA, 'autoresearch', 'price-15m.jsonl');

const HORIZONS = [
  ['30m', 30 * 60 * 1000],
  ['1h', 60 * 60 * 1000],
  ['4h', 4 * 60 * 60 * 1000],
  ['8h', 8 * 60 * 60 * 1000],
  ['12h', 12 * 60 * 60 * 1000],
  ['24h', 24 * 60 * 60 * 1000],
];
const JOIN_TOLERANCE_MS = 16 * 60 * 1000;
const EPISODE_FALLBACK_MS = 24 * 60 * 60 * 1000;

function readJsonl(file) {
  return fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
}
function ts(row) { return Date.parse(row.timestamp_utc || row.timestamp || ''); }
function num(x) { const n = Number(x); return Number.isFinite(n) ? n : null; }
function dirForType(type) {
  if (type === 'LONG_CONFIRMED') return 'LONG';
  if (type === 'SHORT_CONFIRMED') return 'SHORT';
  return null;
}
function invalidTypeForDirection(direction) {
  return direction === 'LONG' ? 'LONG_INVALIDATED' : direction === 'SHORT' ? 'SHORT_INVALIDATED' : null;
}
function oppositeConfirmedType(direction) {
  return direction === 'LONG' ? 'SHORT_CONFIRMED' : direction === 'SHORT' ? 'LONG_CONFIRMED' : null;
}
function directionReturnPct(direction, entry, future) {
  if (!Number.isFinite(entry) || !Number.isFinite(future)) return null;
  const raw = ((future - entry) / entry) * 100;
  return direction === 'SHORT' ? -raw : raw;
}
function priceAtOrAfter(priceRows, asset, targetMs, toleranceMs = 20 * 60 * 1000) {
  for (const row of priceRows) {
    const t = ts(row);
    if (t < targetMs) continue;
    if (t > targetMs + toleranceMs) return null;
    const price = num(row.prices?.[asset]?.lastPrice);
    if (Number.isFinite(price)) return { t, timestamp_utc: row.timestamp_utc, price };
  }
  return null;
}
function pricesBetween(priceRows, asset, startMs, endMs) {
  return priceRows.map(row => {
    const t = ts(row);
    const price = num(row.prices?.[asset]?.lastPrice);
    if (!Number.isFinite(t) || !Number.isFinite(price) || t < startMs || t > endMs) return null;
    return { t, timestamp_utc: row.timestamp_utc, price };
  }).filter(Boolean).sort((a, b) => a.t - b.t);
}
function excursion(direction, entry, samples, startMs) {
  let mfe = null;
  let mae = null;
  for (const sample of samples) {
    const ret = directionReturnPct(direction, entry, sample.price);
    if (!Number.isFinite(ret)) continue;
    const min = Math.round((sample.t - startMs) / 60000);
    if (!mfe || ret > mfe.ret) mfe = { ret, min };
    if (!mae || ret < mae.ret) mae = { ret, min };
  }
  const first = !mfe || !mae ? null : mfe.min < mae.min ? 'favorable' : mae.min < mfe.min ? 'adverse' : 'simultaneous';
  return {
    mfe_pct: mfe?.ret ?? null,
    time_to_mfe_min: mfe?.min ?? null,
    mae_pct: mae?.ret ?? null,
    time_to_mae_min: mae?.min ?? null,
    first_extreme: first,
  };
}
function findShadow(shadows, alert) {
  const direction = dirForType(alert.type);
  const t0 = ts(alert);
  let best = null;
  for (const s of shadows) {
    if (s.asset !== alert.asset || s.direction !== direction) continue;
    const dt = Math.abs(ts(s) - t0);
    if (dt <= JOIN_TOLERANCE_MS && (!best || dt < best.dt)) best = { row: s, dt };
  }
  return best;
}
function findBoundary(alert, alerts) {
  const direction = dirForType(alert.type);
  const start = ts(alert);
  const invalidType = invalidTypeForDirection(direction);
  const oppositeType = oppositeConfirmedType(direction);
  const boundary = alerts
    .filter(a => a.asset === alert.asset && ts(a) > start && (a.type === invalidType || a.type === oppositeType))
    .sort((a, b) => ts(a) - ts(b))[0];
  if (boundary) return { endMs: ts(boundary), reason: boundary.type, timestamp_utc: boundary.timestamp_utc };
  return { endMs: start + EPISODE_FALLBACK_MS, reason: '24h_fallback_open_context', timestamp_utc: new Date(start + EPISODE_FALLBACK_MS).toISOString() };
}
function buildConfirmedRows(alerts, shadows, prices, sinceMs, untilMs) {
  const confirmed = alerts
    .filter(a => a.severity === 'HIGH' && dirForType(a.type) && ts(a) >= sinceMs && (!untilMs || ts(a) <= untilMs))
    .sort((a, b) => ts(a) - ts(b));
  return confirmed.map(alert => buildRow(alert, shadows, prices, { mode: 'confirmed-alert' })).filter(Boolean);
}
function buildEpisodeRows(alerts, shadows, prices, sinceMs, untilMs) {
  const confirmed = alerts
    .filter(a => a.severity === 'HIGH' && dirForType(a.type) && ts(a) >= sinceMs && (!untilMs || ts(a) <= untilMs))
    .sort((a, b) => ts(a) - ts(b));
  const rows = [];
  const activeUntil = new Map();
  for (const alert of confirmed) {
    const direction = dirForType(alert.type);
    const key = `${alert.asset}:${direction}`;
    const t0 = ts(alert);
    if ((activeUntil.get(key) || 0) > t0) continue;
    const boundary = findBoundary(alert, alerts);
    activeUntil.set(key, boundary.endMs);
    const row = buildRow(alert, shadows, prices, { mode: 'episode', episode_boundary: boundary });
    if (row) rows.push(row);
  }
  return rows;
}
function buildRow(alert, shadows, prices, extra = {}) {
  const direction = dirForType(alert.type);
  const entry = num(alert.diagnostics?.price);
  const t0 = ts(alert);
  if (!direction || !Number.isFinite(entry)) return null;
  const shadow = findShadow(shadows, alert);
  const horizon = {};
  for (const [label, ms] of HORIZONS) {
    const p = priceAtOrAfter(prices, alert.asset, t0 + ms);
    horizon[label] = p ? directionReturnPct(direction, entry, p.price) : null;
  }
  const samples4h = pricesBetween(prices, alert.asset, t0, t0 + 4 * 60 * 60 * 1000);
  const samples24h = pricesBetween(prices, alert.asset, t0, t0 + 24 * 60 * 60 * 1000);
  return {
    ...extra,
    timestamp_utc: alert.timestamp_utc,
    asset: alert.asset,
    type: alert.type,
    direction,
    price: entry,
    btc_gate: alert.diagnostics?.btc_gate || null,
    flow: alert.diagnostics?.flow || null,
    shadow_join_dt_min: shadow ? Math.round(shadow.dt / 60000) : null,
    shadow_state: shadow?.row?.state || 'NO_JOIN',
    shadow_score: shadow?.row?.score ?? null,
    oi_bucket: shadow?.row?.source_metrics?.oi_price_regime || 'NO_JOIN',
    horizon,
    excursion: {
      '4h': excursion(direction, entry, samples4h, t0),
      '24h': excursion(direction, entry, samples24h, t0),
    },
  };
}
function avg(vals) { return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null; }
function median(vals) {
  if (!vals.length) return null;
  const sorted = vals.slice().sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}
function statRows(rows) {
  const groups = new Map();
  for (const r of rows) {
    const key = [r.direction, r.asset, r.oi_bucket, r.shadow_state, r.btc_gate || 'NONE'].join('|');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  return [...groups.entries()].map(([key, rs]) => {
    const out = { key, direction: key.split('|')[0], asset: key.split('|')[1], oi_bucket: key.split('|')[2], shadow_state: key.split('|')[3], btc_gate: key.split('|')[4], n: rs.length };
    for (const [label] of HORIZONS) {
      const vals = rs.map(r => r.horizon[label]).filter(Number.isFinite);
      out[label] = {
        n: vals.length,
        win_rate: vals.length ? vals.filter(v => v > 0).length / vals.length : null,
        avg_return_pct: avg(vals),
      };
    }
    for (const label of ['4h', '24h']) {
      const mfe = rs.map(r => r.excursion[label].mfe_pct).filter(Number.isFinite);
      const mae = rs.map(r => r.excursion[label].mae_pct).filter(Number.isFinite);
      out[`mfe_${label}`] = { avg: avg(mfe), median: median(mfe) };
      out[`mae_${label}`] = { avg: avg(mae), median: median(mae) };
      out[`first_${label}`] = {
        favorable: rs.filter(r => r.excursion[label].first_extreme === 'favorable').length,
        adverse: rs.filter(r => r.excursion[label].first_extreme === 'adverse').length,
        simultaneous: rs.filter(r => r.excursion[label].first_extreme === 'simultaneous').length,
      };
    }
    return out;
  }).sort((a, b) => b.n - a.n || a.key.localeCompare(b.key));
}
function pct(x, d = 1) { return Number.isFinite(x) ? `${(x * 100).toFixed(d)}%` : 'n/a'; }
function numFmt(x, d = 3) { return Number.isFinite(x) ? x.toFixed(d) : 'n/a'; }
function renderMd(result) {
  const lines = [];
  lines.push('# OI Alert Decomposition');
  lines.push('');
  lines.push(`Generated: ${result.generated_at}`);
  lines.push(`Window: ${result.window.since} → ${result.window.until || '+∞'}`);
  lines.push('');
  lines.push('Definitions:');
  lines.push('- Confirmed-alert mode: one row per `LONG_CONFIRMED` / `SHORT_CONFIRMED` HIGH alert, entry at alert timestamp.');
  lines.push('- Episode mode: one row per unique active context episode, entry at first confirmed alert; later same asset/direction confirmations are deduped until same-direction invalidation, opposite confirmed alert, or 24h open-context fallback.');
  lines.push('- OI bucket/state join: nearest same asset/direction `readiness-shadow.jsonl` row within ±16 minutes.');
  lines.push('');
  for (const mode of ['confirmed-alert', 'episode']) {
    const m = result.modes[mode];
    lines.push(`## ${mode}`);
    lines.push('');
    lines.push(`Rows: ${m.rows.length}; joined to shadow: ${m.rows.filter(r => r.oi_bucket !== 'NO_JOIN').length}`);
    lines.push('');
    lines.push('| direction | asset | OI bucket | shadow | BTC gate | n | 1h win/avg | 4h win/avg | 24h win/avg | med MFE4h | med MAE4h | first4h fav/adverse | med MFE24h | med MAE24h | first24h fav/adverse |');
    lines.push('| --- | --- | --- | --- | --- | ---: | --- | --- | --- | ---: | ---: | --- | ---: | ---: | --- |');
    for (const g of m.groups) {
      lines.push(`| ${g.direction} | ${g.asset} | ${g.oi_bucket} | ${g.shadow_state} | ${g.btc_gate} | ${g.n} | ${pct(g['1h'].win_rate)}/${numFmt(g['1h'].avg_return_pct)}% | ${pct(g['4h'].win_rate)}/${numFmt(g['4h'].avg_return_pct)}% | ${pct(g['24h'].win_rate)}/${numFmt(g['24h'].avg_return_pct)}% | ${numFmt(g.mfe_4h.median)}% | ${numFmt(g.mae_4h.median)}% | ${g.first_4h.favorable}/${g.first_4h.adverse} | ${numFmt(g.mfe_24h.median)}% | ${numFmt(g.mae_24h.median)}% | ${g.first_24h.favorable}/${g.first_24h.adverse} |`);
    }
    lines.push('');
  }
  return lines.join('\n');
}
function parseArgs() {
  const args = { since: '2026-05-09T00:00:00Z', until: null, suffix: 'oi-decomposition' };
  for (let i = 2; i < process.argv.length; i++) {
    const a = process.argv[i];
    const next = () => process.argv[++i];
    if (a === '--since') args.since = next();
    else if (a.startsWith('--since=')) args.since = a.slice(8);
    else if (a === '--until') args.until = next();
    else if (a.startsWith('--until=')) args.until = a.slice(8);
    else if (a === '--suffix') args.suffix = next();
    else if (a.startsWith('--suffix=')) args.suffix = a.slice(9);
  }
  return args;
}
function main() {
  const args = parseArgs();
  const sinceMs = Date.parse(args.since);
  const untilMs = args.until ? Date.parse(args.until) : null;
  const alerts = readJsonl(ALERTS_PATH).sort((a, b) => ts(a) - ts(b));
  const shadows = readJsonl(SHADOW_PATH).sort((a, b) => ts(a) - ts(b));
  const prices = readJsonl(PRICE_PATH).sort((a, b) => ts(a) - ts(b));
  const confirmed = buildConfirmedRows(alerts, shadows, prices, sinceMs, untilMs);
  const episode = buildEpisodeRows(alerts, shadows, prices, sinceMs, untilMs);
  const result = {
    generated_at: new Date().toISOString(),
    window: { since: args.since, until: args.until },
    inputs: {
      alerts: path.relative(ROOT, ALERTS_PATH),
      shadows: path.relative(ROOT, SHADOW_PATH),
      prices: path.relative(ROOT, PRICE_PATH),
    },
    modes: {
      'confirmed-alert': { rows: confirmed, groups: statRows(confirmed) },
      episode: { rows: episode, groups: statRows(episode) },
    },
  };
  const jsonPath = path.join(DATA, `${args.suffix}.json`);
  const mdPath = path.join(DATA, `${args.suffix}.md`);
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2) + '\n');
  fs.writeFileSync(mdPath, renderMd(result) + '\n');
  process.stdout.write(`Wrote ${path.relative(process.cwd(), mdPath)} and ${path.relative(process.cwd(), jsonPath)}\n`);
  for (const mode of ['confirmed-alert', 'episode']) {
    console.log(`\n${mode}: rows=${result.modes[mode].rows.length}, joined=${result.modes[mode].rows.filter(r => r.oi_bucket !== 'NO_JOIN').length}`);
    for (const g of result.modes[mode].groups.slice(0, 12)) {
      console.log(`${g.direction} ${g.asset} ${g.oi_bucket} ${g.shadow_state} ${g.btc_gate} n=${g.n} 4h=${pct(g['4h'].win_rate)}/${numFmt(g['4h'].avg_return_pct)} 24h=${pct(g['24h'].win_rate)}/${numFmt(g['24h'].avg_return_pct)}`);
    }
  }
}
main();
