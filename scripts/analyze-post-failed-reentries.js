#!/usr/bin/env node
/*
  Read-only post-FAILED same-direction reentry analysis.

  Question: after ACTIVE_CONTEXT_FAILED, how often does the same asset/direction
  create another confirmed alert within a cooldown window, and how did it perform?

  Writes:
  - data/post-failed-reentry-report.md
  - data/post-failed-reentry-report.json
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const ALERTS_PATH = path.join(DATA, 'phase1d-alerts.jsonl');
const PRICE_PATH = path.join(DATA, 'autoresearch', 'price-15m.jsonl');
const OUT_MD = path.join(DATA, 'post-failed-reentry-report.md');
const OUT_JSON = path.join(DATA, 'post-failed-reentry-report.json');
const DEFAULT_WINDOW_HOURS = 4;

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
function dirForType(type) {
  if (type === 'LONG_CONFIRMED') return 'LONG';
  if (type === 'SHORT_CONFIRMED') return 'SHORT';
  return null;
}
function parseArgs(argv = process.argv.slice(2)) {
  const out = { since: null, until: null, windowHours: DEFAULT_WINDOW_HOURS };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => argv[++i];
    if (arg === '--since') out.since = next();
    else if (arg.startsWith('--since=')) out.since = arg.slice('--since='.length);
    else if (arg === '--until') out.until = next();
    else if (arg.startsWith('--until=')) out.until = arg.slice('--until='.length);
    else if (arg === '--window-hours') out.windowHours = Number(next());
    else if (arg.startsWith('--window-hours=')) out.windowHours = Number(arg.slice('--window-hours='.length));
    else if (arg === '--help' || arg === '-h') {
      process.stdout.write('Usage: node scripts/analyze-post-failed-reentries.js [--since ISO] [--until ISO] [--window-hours 4]\n');
      process.exit(0);
    }
  }
  if (!Number.isFinite(out.windowHours) || out.windowHours <= 0) throw new Error('Invalid --window-hours');
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
function pricesBetween(priceRows, asset, startMs, endMs) {
  return priceRows.map(row => {
    const t = ts(row);
    const price = num(row.prices?.[asset]?.lastPrice);
    if (!Number.isFinite(t) || !Number.isFinite(price) || t < startMs || t > endMs) return null;
    return { t, price, timestamp_utc: row.timestamp_utc };
  }).filter(Boolean).sort((a, b) => a.t - b.t);
}
function outcomeFor(alert, priceRows) {
  const direction = dirForType(alert.type);
  const asset = alert.asset;
  const start = ts(alert);
  const entry = num(alert.diagnostics?.price);
  const horizons = {};
  for (const [label, ms] of Object.entries({ '1h': 3600000, '4h': 14400000, '24h': 86400000 })) {
    const p = nearestPriceAtOrAfter(priceRows, asset, start + ms);
    horizons[label] = p ? { timestamp_utc: p.timestamp_utc, price: p.price, directional_return_pct: directionReturnPct(direction, entry, p.price) } : null;
  }
  const vals = pricesBetween(priceRows, asset, start, start + 4 * 60 * 60 * 1000).map(s => directionReturnPct(direction, entry, s.price)).filter(Number.isFinite);
  return { entry, horizons, mfe_4h_pct: vals.length ? Math.max(...vals) : null, mae_4h_pct: vals.length ? Math.min(...vals) : null };
}
function summarize(rows) {
  const out = { n: rows.length };
  for (const h of ['1h', '4h', '24h']) {
    const vals = rows.map(r => r.outcome?.horizons?.[h]?.directional_return_pct).filter(Number.isFinite);
    out[h] = { n: vals.length, hit_rate_positive: vals.length ? vals.filter(v => v > 0).length / vals.length : null, avg_directional_return_pct: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null };
  }
  return out;
}
function mdTable(headers, rows) {
  const esc = x => String(x ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
  return [`| ${headers.map(esc).join(' | ')} |`, `| ${headers.map(() => '---').join(' | ')} |`, ...rows.map(r => `| ${r.map(esc).join(' | ')} |`)].join('\n');
}
function render(result) {
  const lines = [];
  lines.push('# Post-FAILED Same-Direction Reentry Report');
  lines.push('');
  lines.push(`Generated: ${result.generated_at}`);
  lines.push(`Window: ${result.filters.since || '-∞'} → ${result.filters.until || '+∞'}; reentry window ${result.filters.window_hours}h`);
  lines.push('');
  lines.push('Definition: after `ACTIVE_CONTEXT_FAILED`, find same asset and same context direction `LONG_CONFIRMED`/`SHORT_CONFIRMED` alerts inside the reentry window. Outcome is measured in the new alert direction.');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(mdTable(['bucket', 'n', '1h hit/avg', '4h hit/avg', '24h hit/avg'], Object.entries(result.summary).map(([k, s]) => [
    k,
    s.n,
    `${s['1h'].n ? (s['1h'].hit_rate_positive * 100).toFixed(1) + '%' : 'n/a'} / ${pct(s['1h'].avg_directional_return_pct)}`,
    `${s['4h'].n ? (s['4h'].hit_rate_positive * 100).toFixed(1) + '%' : 'n/a'} / ${pct(s['4h'].avg_directional_return_pct)}`,
    `${s['24h'].n ? (s['24h'].hit_rate_positive * 100).toFixed(1) + '%' : 'n/a'} / ${pct(s['24h'].avg_directional_return_pct)}`,
  ])));
  lines.push('');
  lines.push('## Reentry rows');
  lines.push('');
  lines.push(mdTable(['failed time', 'asset', 'direction', 'reentry time', 'minutes after', 'entry', '+1h', '+4h', '+24h', 'MFE4h', 'MAE4h'], result.reentries.map(r => [
    r.failed_timestamp_utc,
    r.asset,
    r.direction,
    r.reentry_timestamp_utc,
    r.minutes_after_failed,
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
  const windowMs = args.windowHours * 60 * 60 * 1000;
  const alerts = readJsonl(ALERTS_PATH).filter(a => inRange(a, sinceMs, untilMs)).sort((a, b) => ts(a) - ts(b));
  const priceRows = readJsonl(PRICE_PATH).sort((a, b) => ts(a) - ts(b));
  const confirmed = alerts.filter(a => ['LONG_CONFIRMED', 'SHORT_CONFIRMED'].includes(a.type));
  const failed = alerts.filter(a => a.type === 'ACTIVE_CONTEXT_FAILED');
  const reentries = [];
  for (const f of failed) {
    const direction = f.active_context?.direction;
    const type = direction === 'LONG' ? 'LONG_CONFIRMED' : direction === 'SHORT' ? 'SHORT_CONFIRMED' : null;
    if (!type) continue;
    const start = ts(f);
    const matches = confirmed.filter(a => a.asset === f.asset && a.type === type && ts(a) > start && ts(a) <= start + windowMs);
    for (const a of matches) {
      reentries.push({
        failed_alert_id: f.id,
        failed_timestamp_utc: f.timestamp_utc,
        asset: f.asset,
        direction,
        reentry_alert_id: a.id,
        reentry_timestamp_utc: a.timestamp_utc,
        minutes_after_failed: Math.round((ts(a) - start) / 60000),
        outcome: outcomeFor(a, priceRows),
      });
    }
  }
  const byAssetDir = {};
  for (const row of reentries) {
    const key = `${row.asset}_${row.direction}`;
    byAssetDir[key] = byAssetDir[key] || [];
    byAssetDir[key].push(row);
  }
  const result = {
    generated_at: new Date().toISOString(),
    filters: { since: args.since || null, until: args.until || null, window_hours: args.windowHours },
    inputs: { alerts: path.relative(ROOT, ALERTS_PATH), price_15m: path.relative(ROOT, PRICE_PATH), alert_rows: alerts.length, failed_events: failed.length },
    summary: { all: summarize(reentries), ...Object.fromEntries(Object.entries(byAssetDir).map(([k, rows]) => [k, summarize(rows)])) },
    reentries,
  };
  const md = render(result);
  fs.writeFileSync(OUT_JSON, JSON.stringify(result, null, 2) + '\n');
  fs.writeFileSync(OUT_MD, md + '\n');
  process.stdout.write(`${md}\nWrote ${path.relative(process.cwd(), OUT_MD)} and ${path.relative(process.cwd(), OUT_JSON)}\n`);
}
main();
