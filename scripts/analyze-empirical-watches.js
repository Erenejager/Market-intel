#!/usr/bin/env node
/*
  Empirical watch win-rate monitor.

  Tracks every alert tagged with empirical_watch or a watch/fade pattern verdict,
  computes forward returns for the intended watch direction, and flags buckets that
  should be reviewed/untracked if live performance degrades.

  Writes:
  - data/empirical-watch-report.json
  - data/empirical-watch-report.md
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const ALERTS_PATH = path.join(DATA, 'phase1d-alerts.jsonl');
const PRICE_PATH = path.join(DATA, 'autoresearch', 'price-15m.jsonl');
const OUT_JSON = path.join(DATA, 'empirical-watch-report.json');
const OUT_MD = path.join(DATA, 'empirical-watch-report.md');

const HORIZONS = [
  { label: '1h', ms: 60 * 60 * 1000 },
  { label: '4h', ms: 4 * 60 * 60 * 1000 },
  { label: '24h', ms: 24 * 60 * 60 * 1000 },
];

const REVIEW_RULES = {
  min_complete_n: 8,
  min_1h_hit: 0.55,
  min_4h_hit: 0.50,
  min_avg_pct: 0,
};

function readJsonl(file) {
  try {
    return fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
  } catch {
    return [];
  }
}
function ts(row) { return Date.parse(row.timestamp_utc || row.timestamp || ''); }
function num(x) { const n = Number(x); return Number.isFinite(n) ? n : null; }
function pct(x, d = 1) { return Number.isFinite(x) ? `${(x * 100).toFixed(d)}%` : 'n/a'; }
function retPct(x, d = 3) { return Number.isFinite(x) ? `${x.toFixed(d)}%` : 'n/a'; }
function avg(vals) { return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null; }
function median(vals) {
  const a = vals.filter(Number.isFinite).sort((x, y) => x - y);
  if (!a.length) return null;
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
}
function alertDirection(alert) {
  if (String(alert.type || '').startsWith('LONG')) return 'LONG';
  if (String(alert.type || '').startsWith('SHORT')) return 'SHORT';
  return null;
}
function opposite(direction) {
  if (direction === 'LONG') return 'SHORT';
  if (direction === 'SHORT') return 'LONG';
  return null;
}
function intendedDirection(alert) {
  const explicit = alert.empirical_watch?.direction || null;
  const verdict = alert.empirical_watch?.verdict || alert.pattern?.verdict || null;
  const dir = explicit || alertDirection(alert);
  if (verdict === 'fade_candidate' || verdict === 'avoid_original' || verdict === 'avoid_original_short_primed') return opposite(dir);
  return dir;
}
function watchKey(alert) {
  return alert.empirical_watch?.key || alert.pattern?.key || null;
}
function watchVerdict(alert) {
  return alert.empirical_watch?.verdict || alert.pattern?.verdict || null;
}
function isTrackedWatch(alert) {
  const verdict = watchVerdict(alert);
  if (alert.empirical_watch) return true;
  return ['direction_watch', 'fade_candidate', 'avoid_original', 'avoid_original_short_primed'].includes(verdict);
}
function directionReturnPct(direction, entry, future) {
  if (!Number.isFinite(entry) || !Number.isFinite(future) || !direction) return null;
  const raw = ((future - entry) / entry) * 100;
  return direction === 'SHORT' ? -raw : raw;
}
function nearestPriceAtOrAfter(priceRows, asset, targetMs) {
  let best = null;
  for (const row of priceRows) {
    const t = ts(row);
    if (!Number.isFinite(t) || t < targetMs) continue;
    const p = num(row.prices?.[asset]?.lastPrice);
    if (!Number.isFinite(p)) continue;
    if (!best || t < best.t) best = { t, price: p, timestamp_utc: row.timestamp_utc };
  }
  return best;
}
function summarizeRows(rows) {
  const horizons = {};
  for (const h of HORIZONS) {
    const vals = rows.map(r => r.horizon[h.label]?.directional_return_pct).filter(Number.isFinite);
    horizons[h.label] = {
      n: vals.length,
      hit_rate: vals.length ? vals.filter(v => v > 0).length / vals.length : null,
      avg_pct: avg(vals),
      median_pct: median(vals),
    };
  }
  const h1 = horizons['1h'];
  const h4 = horizons['4h'];
  const review = [];
  if (h1.n >= REVIEW_RULES.min_complete_n && (h1.hit_rate < REVIEW_RULES.min_1h_hit || h1.avg_pct <= REVIEW_RULES.min_avg_pct)) {
    review.push(`1h degraded: hit ${pct(h1.hit_rate)} avg ${retPct(h1.avg_pct)} over n=${h1.n}`);
  }
  if (h4.n >= REVIEW_RULES.min_complete_n && (h4.hit_rate < REVIEW_RULES.min_4h_hit || h4.avg_pct <= REVIEW_RULES.min_avg_pct)) {
    review.push(`4h degraded: hit ${pct(h4.hit_rate)} avg ${retPct(h4.avg_pct)} over n=${h4.n}`);
  }
  const enoughSample = h1.n >= REVIEW_RULES.min_complete_n || h4.n >= REVIEW_RULES.min_complete_n;
  return {
    n: rows.length,
    horizons,
    status: review.length ? 'REVIEW_OR_UNTRACK' : enoughSample ? 'KEEP_TRACKING' : 'LOW_N_TRACKING',
    review_reasons: review,
  };
}

function main() {
  const alerts = readJsonl(ALERTS_PATH).filter(isTrackedWatch).sort((a, b) => ts(a) - ts(b));
  const prices = readJsonl(PRICE_PATH);
  const rows = alerts.map(alert => {
    const t = ts(alert);
    const entry = num(alert.diagnostics?.price);
    const intended = intendedDirection(alert);
    const horizon = {};
    for (const h of HORIZONS) {
      const p = nearestPriceAtOrAfter(prices, alert.asset, t + h.ms);
      horizon[h.label] = p ? {
        timestamp_utc: p.timestamp_utc,
        price: p.price,
        directional_return_pct: directionReturnPct(intended, entry, p.price),
      } : null;
    }
    return {
      timestamp_utc: alert.timestamp_utc,
      asset: alert.asset,
      type: alert.type,
      alert_direction: alertDirection(alert),
      intended_direction: intended,
      key: watchKey(alert),
      verdict: watchVerdict(alert),
      score: num(alert.readiness_shadow?.effective_score ?? alert.readiness_shadow?.score),
      oi: alert.readiness_shadow?.source_metrics?.oi_price_regime || null,
      funding: alert.readiness_shadow?.source_metrics?.cross_exchange_positioning?.classification || null,
      btc_gate: alert.readiness_shadow?.source_metrics?.btc_gate || alert.diagnostics?.btc_gate || null,
      entry,
      horizon,
    };
  });

  const byKey = new Map();
  const byKeyAsset = new Map();
  for (const row of rows) {
    if (!row.key) continue;
    byKey.set(row.key, [...(byKey.get(row.key) || []), row]);
    byKeyAsset.set(`${row.key}|${row.asset}`, [...(byKeyAsset.get(`${row.key}|${row.asset}`) || []), row]);
  }
  const summaries = [...byKey.entries()].map(([key, bucketRows]) => ({ key, ...summarizeRows(bucketRows) }))
    .sort((a, b) => b.n - a.n || a.key.localeCompare(b.key));
  const asset_summaries = [...byKeyAsset.entries()].map(([keyAsset, bucketRows]) => {
    const [key, asset] = keyAsset.split('|');
    return { key, asset, ...summarizeRows(bucketRows) };
  }).sort((a, b) => b.n - a.n || a.key.localeCompare(b.key));

  const report = {
    generated_at: new Date().toISOString(),
    inputs: { alerts: ALERTS_PATH, prices: PRICE_PATH },
    review_rules: REVIEW_RULES,
    counts: { tracked_rows: rows.length, buckets: summaries.length },
    summaries,
    asset_summaries,
    rows,
  };

  fs.mkdirSync(DATA, { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2) + '\n');

  const md = [];
  md.push('# Empirical Watch Win-Rate Report');
  md.push('');
  md.push(`Generated: ${report.generated_at}`);
  md.push(`Tracked rows: ${rows.length}`);
  md.push('');
  md.push('Review rule: flag a bucket when complete n>=8 and either 1h hit <55% / avg <=0, or 4h hit <50% / avg <=0. Buckets below n=8 stay LOW_N_TRACKING, not validated.');
  md.push('');
  const iconFor = s => s.status === 'KEEP_TRACKING' ? '✅' : s.status === 'LOW_N_TRACKING' ? '🟡' : '⚠️';
  md.push('## Bucket summary');
  for (const s of summaries) {
    const h1 = s.horizons['1h'];
    const h4 = s.horizons['4h'];
    md.push(`- ${iconFor(s)} ${s.key}: ${s.status} | n=${s.n} | 1h ${pct(h1.hit_rate)} avg ${retPct(h1.avg_pct)} n=${h1.n} | 4h ${pct(h4.hit_rate)} avg ${retPct(h4.avg_pct)} n=${h4.n}`);
    for (const r of s.review_reasons) md.push(`  - Review: ${r}`);
  }
  md.push('');
  md.push('## Asset split');
  for (const s of asset_summaries) {
    const h1 = s.horizons['1h'];
    const h4 = s.horizons['4h'];
    md.push(`- ${iconFor(s)} ${s.key} / ${s.asset}: ${s.status} | n=${s.n} | 1h ${pct(h1.hit_rate)} avg ${retPct(h1.avg_pct)} n=${h1.n} | 4h ${pct(h4.hit_rate)} avg ${retPct(h4.avg_pct)} n=${h4.n}`);
  }
  fs.writeFileSync(OUT_MD, md.join('\n') + '\n');

  console.log(JSON.stringify({ ok: true, out_json: OUT_JSON, out_md: OUT_MD, tracked_rows: rows.length, buckets: summaries.length }, null, 2));
}

if (require.main === module) main();

module.exports = { intendedDirection, summarizeRows };
