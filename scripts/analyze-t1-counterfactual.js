#!/usr/bin/env node
/*
  Read-only T1 opposite-watch counterfactual.

  Question: when SOL T1_FRESH_LONGS_LONG opens a 120m opposite SHORT watch,
  do same-asset SHORT_CONFIRMED alerts arrive after the 120m expiry but within
  a longer regime window, and how did they perform?

  Writes:
  - data/t1-counterfactual-report.md
  - data/t1-counterfactual-report.json
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const ALERTS_PATH = path.join(DATA, 'phase1d-alerts.jsonl');
const PRICE_PATH = path.join(DATA, 'autoresearch', 'price-15m.jsonl');
const OUT_MD = path.join(DATA, 't1-counterfactual-report.md');
const OUT_JSON = path.join(DATA, 't1-counterfactual-report.json');
const WATCH_MS = 120 * 60 * 1000;
const DEFAULT_MAX_DAYS = 7;

function readJsonl(file) {
  try { return fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(line => JSON.parse(line)); } catch { return []; }
}
function ts(row) { return Date.parse(row.timestamp_utc || row.timestamp || ''); }
function num(x) { const n = Number(x); return Number.isFinite(n) ? n : null; }
function pct(x, d = 3) { return Number.isFinite(x) ? `${x.toFixed(d)}%` : 'n/a'; }
function fmt(x, d = 4) { return Number.isFinite(x) ? String(Number(x.toFixed(d))) : 'n/a'; }
function directionReturnPct(direction, entry, future) {
  if (!Number.isFinite(entry) || !Number.isFinite(future)) return null;
  const raw = ((future - entry) / entry) * 100;
  return direction === 'SHORT' ? -raw : raw;
}
function parseArgs(argv = process.argv.slice(2)) {
  const out = { maxDays: DEFAULT_MAX_DAYS, since: null, until: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => argv[++i];
    if (arg === '--max-days') out.maxDays = Number(next());
    else if (arg.startsWith('--max-days=')) out.maxDays = Number(arg.slice('--max-days='.length));
    else if (arg === '--since') out.since = next();
    else if (arg.startsWith('--since=')) out.since = arg.slice('--since='.length);
    else if (arg === '--until') out.until = next();
    else if (arg.startsWith('--until=')) out.until = arg.slice('--until='.length);
    else if (arg === '--help' || arg === '-h') {
      process.stdout.write('Usage: node scripts/analyze-t1-counterfactual.js [--since ISO] [--until ISO] [--max-days 7]\n');
      process.exit(0);
    }
  }
  if (!Number.isFinite(out.maxDays) || out.maxDays <= 0) throw new Error('Invalid --max-days');
  return out;
}
function msOrNull(x) {
  if (!x) return null;
  const ms = Date.parse(x);
  if (!Number.isFinite(ms)) throw new Error(`Invalid timestamp: ${x}`);
  return ms;
}
function inRange(row, sinceMs, untilMs) {
  const t = ts(row);
  if (!Number.isFinite(t)) return false;
  if (sinceMs !== null && t < sinceMs) return false;
  if (untilMs !== null && t > untilMs) return false;
  return true;
}
function pricesBetween(priceRows, asset, startMs, endMs) {
  return priceRows.map(row => {
    const t = ts(row);
    const price = num(row.prices?.[asset]?.lastPrice);
    if (!Number.isFinite(t) || !Number.isFinite(price) || t < startMs || t > endMs) return null;
    return { t, price, timestamp_utc: row.timestamp_utc };
  }).filter(Boolean).sort((a, b) => a.t - b.t);
}
function nearestPriceAtOrAfter(priceRows, asset, targetMs) {
  let best = null;
  for (const row of priceRows) {
    const t = ts(row);
    if (!Number.isFinite(t) || t < targetMs) continue;
    const price = num(row.prices?.[asset]?.lastPrice);
    if (!Number.isFinite(price)) continue;
    if (!best || t < best.t) best = { t, price, timestamp_utc: row.timestamp_utc };
  }
  return best;
}
function outcomeForShort(shortAlert, priceRows) {
  const asset = shortAlert.asset;
  const start = ts(shortAlert);
  const entry = num(shortAlert.diagnostics?.price);
  const horizons = {};
  for (const [label, ms] of Object.entries({ '1h': 3600000, '4h': 14400000, '24h': 86400000 })) {
    const p = nearestPriceAtOrAfter(priceRows, asset, start + ms);
    horizons[label] = p ? {
      timestamp_utc: p.timestamp_utc,
      price: p.price,
      directional_return_pct: directionReturnPct('SHORT', entry, p.price),
    } : null;
  }
  const samples4h = pricesBetween(priceRows, asset, start, start + 4 * 60 * 60 * 1000);
  const vals = samples4h.map(s => directionReturnPct('SHORT', entry, s.price)).filter(Number.isFinite);
  return {
    entry,
    horizons,
    mfe_4h_pct: vals.length ? Math.max(...vals) : null,
    mae_4h_pct: vals.length ? Math.min(...vals) : null,
    price_samples_4h: samples4h.length,
  };
}
function isT1(alert) {
  return alert.pattern?.key === 'T1_FRESH_LONGS_LONG' || alert.research_note?.pattern_key === 'T1_FRESH_LONGS_LONG';
}
function summarize(rows) {
  const out = { n: rows.length };
  for (const h of ['1h', '4h', '24h']) {
    const vals = rows.map(r => r.outcome?.horizons?.[h]?.directional_return_pct).filter(Number.isFinite);
    out[h] = {
      n: vals.length,
      hit_rate_positive: vals.length ? vals.filter(v => v > 0).length / vals.length : null,
      avg_directional_return_pct: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null,
    };
  }
  const mfe = rows.map(r => r.outcome?.mfe_4h_pct).filter(Number.isFinite);
  const mae = rows.map(r => r.outcome?.mae_4h_pct).filter(Number.isFinite);
  out.mfe_4h_avg = mfe.length ? mfe.reduce((a, b) => a + b, 0) / mfe.length : null;
  out.mae_4h_avg = mae.length ? mae.reduce((a, b) => a + b, 0) / mae.length : null;
  return out;
}
function mdTable(headers, rows) {
  const esc = x => String(x ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
  return [`| ${headers.map(esc).join(' | ')} |`, `| ${headers.map(() => '---').join(' | ')} |`, ...rows.map(r => `| ${r.map(esc).join(' | ')} |`)].join('\n');
}
function render(result) {
  const lines = [];
  lines.push('# T1 Opposite-Watch Counterfactual');
  lines.push('');
  lines.push(`Generated: ${result.generated_at}`);
  lines.push(`Window: ${result.filters.since || '-∞'} → ${result.filters.until || '+∞'}; post-expiry search max ${result.filters.max_days}d`);
  lines.push('');
  lines.push('Definition: T1 event = `T1_FRESH_LONGS_LONG`. Current production watch = SHORT confirmations within first 120m. Counterfactual post-expiry = same-asset SHORT confirmations from T+120m to T+maxDays.');
  if (result.no_data_interpretation) {
    lines.push('');
    lines.push(`No-data interpretation: ${result.no_data_interpretation}`);
  }
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(mdTable(['bucket', 'n', '1h hit/avg', '4h hit/avg', '24h hit/avg', 'avg MFE4h', 'avg MAE4h'], Object.entries(result.summary).map(([k, s]) => [
    k,
    s.n,
    `${s['1h'].n ? (s['1h'].hit_rate_positive * 100).toFixed(1) + '%' : 'n/a'} / ${pct(s['1h'].avg_directional_return_pct)}`,
    `${s['4h'].n ? (s['4h'].hit_rate_positive * 100).toFixed(1) + '%' : 'n/a'} / ${pct(s['4h'].avg_directional_return_pct)}`,
    `${s['24h'].n ? (s['24h'].hit_rate_positive * 100).toFixed(1) + '%' : 'n/a'} / ${pct(s['24h'].avg_directional_return_pct)}`,
    pct(s.mfe_4h_avg),
    pct(s.mae_4h_avg),
  ])));
  lines.push('');
  lines.push('## T1 events');
  lines.push('');
  lines.push(mdTable(['T1 time', 'asset', 'price', 'within 120m shorts', 'post-expiry shorts'], result.t1_events.map(e => [
    e.timestamp_utc,
    e.asset,
    fmt(e.price),
    e.within_120m.length,
    e.post_expiry.length,
  ])));
  lines.push('');
  lines.push('## Post-expiry SHORT rows');
  lines.push('');
  lines.push(mdTable(['T1 time', 'short time', 'asset', 'hours after T1', 'entry', '+1h', '+4h', '+24h', 'MFE4h', 'MAE4h'], result.post_expiry_rows.map(r => [
    r.t1_timestamp_utc,
    r.short_timestamp_utc,
    r.asset,
    (r.minutes_after_t1 / 60).toFixed(2),
    fmt(r.outcome.entry),
    pct(r.outcome.horizons['1h']?.directional_return_pct),
    pct(r.outcome.horizons['4h']?.directional_return_pct),
    pct(r.outcome.horizons['24h']?.directional_return_pct),
    pct(r.outcome.mfe_4h_pct),
    pct(r.outcome.mae_4h_pct),
  ])));
  lines.push('');
  return lines.join('\n');
}

function main() {
  const args = parseArgs();
  const sinceMs = msOrNull(args.since);
  const untilMs = msOrNull(args.until);
  const maxMs = args.maxDays * 24 * 60 * 60 * 1000;
  const alerts = readJsonl(ALERTS_PATH).filter(a => inRange(a, sinceMs, untilMs)).sort((a, b) => ts(a) - ts(b));
  const priceRows = readJsonl(PRICE_PATH).sort((a, b) => ts(a) - ts(b));
  const t1s = alerts.filter(isT1);
  const shorts = alerts.filter(a => a.type === 'SHORT_CONFIRMED');
  const t1Events = [];
  const withinRows = [];
  const postRows = [];
  for (const t1 of t1s) {
    const t = ts(t1);
    const sameAssetShorts = shorts.filter(s => s.asset === t1.asset && ts(s) > t && ts(s) <= t + maxMs);
    const within = sameAssetShorts.filter(s => ts(s) <= t + WATCH_MS);
    const post = sameAssetShorts.filter(s => ts(s) > t + WATCH_MS);
    const eventRow = {
      id: t1.id,
      timestamp_utc: t1.timestamp_utc,
      asset: t1.asset,
      price: num(t1.diagnostics?.price),
      within_120m: [],
      post_expiry: [],
    };
    for (const s of within) {
      const row = { t1_timestamp_utc: t1.timestamp_utc, short_timestamp_utc: s.timestamp_utc, asset: s.asset, minutes_after_t1: Math.round((ts(s) - t) / 60000), short_alert_id: s.id, outcome: outcomeForShort(s, priceRows) };
      withinRows.push(row); eventRow.within_120m.push(row);
    }
    for (const s of post) {
      const row = { t1_timestamp_utc: t1.timestamp_utc, short_timestamp_utc: s.timestamp_utc, asset: s.asset, minutes_after_t1: Math.round((ts(s) - t) / 60000), short_alert_id: s.id, outcome: outcomeForShort(s, priceRows) };
      postRows.push(row); eventRow.post_expiry.push(row);
    }
    t1Events.push(eventRow);
  }
  const result = {
    generated_at: new Date().toISOString(),
    filters: { since: args.since || null, until: args.until || null, max_days: args.maxDays },
    inputs: { alerts: path.relative(ROOT, ALERTS_PATH), price_15m: path.relative(ROOT, PRICE_PATH), alert_rows: alerts.length, t1_events: t1s.length },
    no_data_interpretation: t1s.length === 0
      ? 'No tagged T1_FRESH_LONGS_LONG events were found in this alert-log window. This is an absence-of-data result, not evidence for or against T1 validity. T1 has not recurred in tagged form in the inspected log/window; do not use this report to validate or invalidate persistent T1 watch behavior.'
      : null,
    summary: { within_120m: summarize(withinRows), post_expiry: summarize(postRows) },
    t1_events: t1Events,
    within_120m_rows: withinRows,
    post_expiry_rows: postRows,
  };
  const md = render(result);
  fs.writeFileSync(OUT_JSON, JSON.stringify(result, null, 2) + '\n');
  fs.writeFileSync(OUT_MD, md + '\n');
  process.stdout.write(`${md}\nWrote ${path.relative(process.cwd(), OUT_MD)} and ${path.relative(process.cwd(), OUT_JSON)}\n`);
}

main();
