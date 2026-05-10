#!/usr/bin/env node
/*
  BTC SHORT time-shape analysis.

  Produces win rates + avg return at 30m / 1h / 2h / 3h / 4h / 24h for:
  - All BTC SHORT_CONFIRMED HIGH (May25-current downtrend window)
  - BTC SHORT + FRESH_SHORTS OI bucket only

  Joins each alert to nearest readiness-shadow.jsonl row (same asset/direction)
  within ±16 minutes for OI bucket. OI label must come from a direct join —
  rows with no join within tolerance are grouped separately as NO_JOIN.

  Usage:
    node scripts/analyze-btc-short-time-shape.js
    node scripts/analyze-btc-short-time-shape.js --since 2026-05-25T00:00:00Z
    node scripts/analyze-btc-short-time-shape.js --since 2026-05-09T00:00:00Z --all-assets
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const ALERTS_PATH = path.join(DATA, 'phase1d-alerts.jsonl');
const SHADOW_PATH = path.join(DATA, 'readiness-shadow.jsonl');
const PRICE_PATH = path.join(DATA, 'autoresearch', 'price-15m.jsonl');

const HORIZONS = [
  ['30m',  30  * 60 * 1000],
  ['1h',   60  * 60 * 1000],
  ['2h',   2   * 60 * 60 * 1000],
  ['3h',   3   * 60 * 60 * 1000],
  ['4h',   4   * 60 * 60 * 1000],
  ['24h',  24  * 60 * 60 * 1000],
];
const JOIN_TOLERANCE_MS = 16 * 60 * 1000;
const PRICE_TOLERANCE_MS = 20 * 60 * 1000;

// ── helpers ──────────────────────────────────────────────────────────────────

function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
}
function ts(row) { return Date.parse(row.timestamp_utc || row.timestamp || ''); }
function num(x) { const n = Number(x); return Number.isFinite(n) ? n : null; }

function returnPct(entryPrice, futurePrice, direction) {
  if (!Number.isFinite(entryPrice) || !Number.isFinite(futurePrice)) return null;
  const raw = ((futurePrice - entryPrice) / entryPrice) * 100;
  return direction === 'SHORT' ? -raw : raw;
}

function priceAtOrAfter(prices, asset, targetMs) {
  for (const row of prices) {
    const t = ts(row);
    if (t < targetMs) continue;
    if (t > targetMs + PRICE_TOLERANCE_MS) return null;
    const p = num(row.prices?.[asset]?.lastPrice);
    if (Number.isFinite(p)) return p;
  }
  return null;
}

function nearestShadow(shadows, asset, direction, alertMs) {
  let best = null;
  let bestDist = Infinity;
  for (const s of shadows) {
    if (s.asset !== asset || s.direction !== direction) continue;
    const dist = Math.abs(ts(s) - alertMs);
    if (dist < bestDist && dist <= JOIN_TOLERANCE_MS) {
      bestDist = dist;
      best = s;
    }
  }
  return best;
}

function avg(arr) {
  const clean = arr.filter(Number.isFinite);
  return clean.length ? clean.reduce((a, b) => a + b, 0) / clean.length : null;
}
function median(arr) {
  const clean = arr.filter(Number.isFinite).sort((a, b) => a - b);
  if (!clean.length) return null;
  const mid = Math.floor(clean.length / 2);
  return clean.length % 2 ? clean[mid] : (clean[mid - 1] + clean[mid]) / 2;
}

function statBlock(returns) {
  const wins = returns.filter(r => Number.isFinite(r) && r > 0).length;
  return {
    n: returns.filter(Number.isFinite).length,
    win_rate: returns.filter(Number.isFinite).length ? wins / returns.filter(Number.isFinite).length : null,
    avg: avg(returns),
    median: median(returns),
  };
}

// ── core ─────────────────────────────────────────────────────────────────────

function buildRows(alerts, shadows, prices, sinceMs, assetFilter) {
  const confirmed = alerts
    .filter(a =>
      a.type === 'SHORT_CONFIRMED' &&
      a.severity === 'HIGH' &&
      ts(a) >= sinceMs &&
      (!assetFilter || a.asset === assetFilter)
    )
    .sort((a, b) => ts(a) - ts(b));

  return confirmed.map(alert => {
    const t0 = ts(alert);
    const entryPrice = num(alert.diagnostics?.price);
    const shadow = nearestShadow(shadows, alert.asset, 'SHORT', t0);
    const oiBucket = shadow?.source_metrics?.oi_price_regime ?? 'NO_JOIN';
    const shadowState = shadow?.state ?? 'NO_JOIN';

    const horizon = {};
    for (const [label, ms] of HORIZONS) {
      const futurePrice = priceAtOrAfter(prices, alert.asset, t0 + ms);
      horizon[label] = returnPct(entryPrice, futurePrice, 'SHORT');
    }

    return {
      id: alert.id,
      timestamp_utc: alert.timestamp_utc,
      asset: alert.asset,
      entry_price: entryPrice,
      oi_bucket: oiBucket,
      shadow_state: shadowState,
      btc_gate: alert.diagnostics?.btc_gate ?? null,
      horizon,
    };
  });
}

function statGroup(rows) {
  const result = {};
  for (const [label] of HORIZONS) {
    result[label] = statBlock(rows.map(r => r.horizon[label]));
  }
  return result;
}

// ── formatting ───────────────────────────────────────────────────────────────

function pct(x, d = 1) {
  return Number.isFinite(x) ? `${(x * 100).toFixed(d)}%` : 'n/a';
}
function ret(x, d = 3) {
  if (!Number.isFinite(x)) return 'n/a';
  const sign = x >= 0 ? '+' : '';
  return `${sign}${x.toFixed(d)}%`;
}
function row(label, stats, n) {
  const s = stats[label];
  return `| ${label.padEnd(4)} | ${String(s.n ?? n).padStart(3)} | ${pct(s.win_rate).padStart(6)} | ${ret(s.avg).padStart(9)} | ${ret(s.median).padStart(9)} |`;
}

function renderTable(title, stats, n) {
  const lines = [
    `### ${title} (n=${n})`,
    '',
    '| win | n | win rate | avg return | median return |',
    '| --- | --: | ------: | ---------: | ------------: |',
  ];
  for (const [label] of HORIZONS) {
    lines.push(row(label, stats, n));
  }
  return lines.join('\n');
}

function renderMd(result) {
  const lines = [
    '# BTC SHORT Time-Shape Analysis',
    '',
    `Generated: ${result.generated_at}`,
    `Window: since ${result.since}`,
    '',
    '## Methodology',
    '',
    '- Entry: `SHORT_CONFIRMED` HIGH alert timestamp and price.',
    '- OI bucket: nearest `readiness-shadow.jsonl` row (same asset/direction) within ±16m.',
    '  Rows with no join within tolerance are labelled `NO_JOIN`.',
    '- Win: price moved in SHORT direction (return > 0) at the given horizon.',
    '- Price lookup tolerance: ±20m from target time.',
    '',
  ];

  for (const [cohortKey, cohort] of Object.entries(result.cohorts)) {
    lines.push(`## ${cohort.label}`);
    lines.push('');
    lines.push(renderTable(cohort.label, cohort.stats, cohort.n));
    lines.push('');
    if (cohort.oi_breakdown) {
      lines.push('### OI bucket breakdown');
      lines.push('');
      lines.push('| OI bucket | n | 1h win | 2h win | 3h win | 4h win | 24h win |');
      lines.push('| --- | --: | -----: | -----: | -----: | -----: | ------: |');
      for (const [bucket, bs] of Object.entries(cohort.oi_breakdown)) {
        const s = bs.stats;
        lines.push(`| ${bucket} | ${bs.n} | ${pct(s['1h'].win_rate)} | ${pct(s['2h'].win_rate)} | ${pct(s['3h'].win_rate)} | ${pct(s['4h'].win_rate)} | ${pct(s['24h'].win_rate)} |`);
      }
      lines.push('');
    }
  }

  lines.push('## Raw rows');
  lines.push('');
  lines.push('| timestamp | entry price | OI bucket | shadow state | 30m | 1h | 2h | 3h | 4h | 24h |');
  lines.push('| --- | ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |');
  for (const r of result.all_rows) {
    const h = r.horizon;
    lines.push(`| ${r.timestamp_utc} | ${r.entry_price} | ${r.oi_bucket} | ${r.shadow_state} | ${ret(h['30m'])} | ${ret(h['1h'])} | ${ret(h['2h'])} | ${ret(h['3h'])} | ${ret(h['4h'])} | ${ret(h['24h'])} |`);
  }

  return lines.join('\n');
}

// ── main ─────────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = { since: '2026-05-25T00:00:00Z', allAssets: false };
  for (let i = 2; i < process.argv.length; i++) {
    const a = process.argv[i];
    const next = () => process.argv[++i];
    if (a === '--since') args.since = next();
    else if (a.startsWith('--since=')) args.since = a.slice(8);
    else if (a === '--all-assets') args.allAssets = true;
  }
  return args;
}

function main() {
  const args = parseArgs();
  const sinceMs = Date.parse(args.since);

  const alerts  = readJsonl(ALERTS_PATH).sort((a, b) => ts(a) - ts(b));
  const shadows = readJsonl(SHADOW_PATH).sort((a, b) => ts(a) - ts(b));
  const prices  = readJsonl(PRICE_PATH).sort((a, b) => ts(a) - ts(b));

  const assetFilter = args.allAssets ? null : 'BTC';
  const allRows = buildRows(alerts, shadows, prices, sinceMs, assetFilter);

  // cohort 1: all BTC SHORT
  const allStats = statGroup(allRows);

  // cohort 2: FRESH_SHORTS only
  const freshShortsRows = allRows.filter(r => r.oi_bucket === 'FRESH_SHORTS');
  const freshShortsStats = statGroup(freshShortsRows);

  // cohort 3: no join (data quality check)
  const noJoinRows = allRows.filter(r => r.oi_bucket === 'NO_JOIN');

  // OI breakdown within all rows
  const buckets = {};
  for (const r of allRows) {
    const b = r.oi_bucket;
    if (!buckets[b]) buckets[b] = [];
    buckets[b].push(r);
  }
  const oiBreakdown = {};
  for (const [b, rows] of Object.entries(buckets)) {
    oiBreakdown[b] = { n: rows.length, stats: statGroup(rows) };
  }

  const result = {
    generated_at: new Date().toISOString(),
    since: args.since,
    asset: assetFilter ?? 'ALL',
    cohorts: {
      all: {
        label: `${assetFilter ?? 'ALL'} SHORT (all OI buckets)`,
        n: allRows.length,
        stats: allStats,
        oi_breakdown: oiBreakdown,
      },
      fresh_shorts: {
        label: `${assetFilter ?? 'ALL'} SHORT + FRESH_SHORTS`,
        n: freshShortsRows.length,
        stats: freshShortsStats,
      },
    },
    no_join_n: noJoinRows.length,
    all_rows: allRows,
  };

  const jsonPath = path.join(DATA, 'btc-short-time-shape.json');
  const mdPath   = path.join(DATA, 'btc-short-time-shape.md');
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2) + '\n');
  fs.writeFileSync(mdPath, renderMd(result) + '\n');

  // console summary
  console.log(`\nBTC SHORT time-shape (since ${args.since})`);
  console.log(`Total rows: ${allRows.length} | FRESH_SHORTS: ${freshShortsRows.length} | NO_JOIN: ${noJoinRows.length}`);
  console.log('');
  console.log('window | all BTC SHORT                 | BTC SHORT + FRESH_SHORTS');
  console.log('       | n    win%   avg      median   | n    win%   avg      median');
  console.log('-------+--------------------------------+--------------------------------');
  for (const [label] of HORIZONS) {
    const a = allStats[label];
    const f = freshShortsStats[label];
    const fmt = (s) => {
      if (!s.n) return '  -     -       -         -    ';
      return `${String(s.n).padStart(3)}  ${pct(s.win_rate).padStart(6)}  ${ret(s.avg).padStart(8)}  ${ret(s.median).padStart(8)}`;
    };
    console.log(`${label.padEnd(6)} | ${fmt(a)} | ${fmt(f)}`);
  }
  console.log('');
  console.log('OI bucket breakdown (4h win rate):');
  for (const [b, bs] of Object.entries(oiBreakdown).sort((x, y) => y[1].n - x[1].n)) {
    const s = bs.stats;
    console.log(`  ${b.padEnd(20)} n=${bs.n}  1h=${pct(s['1h'].win_rate)}  2h=${pct(s['2h'].win_rate)}  3h=${pct(s['3h'].win_rate)}  4h=${pct(s['4h'].win_rate)}  24h=${pct(s['24h'].win_rate)}`);
  }
  console.log(`\nWrote ${path.relative(process.cwd(), mdPath)}`);
}

main();
