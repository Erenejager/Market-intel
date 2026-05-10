#!/usr/bin/env node
/*
  Build rolling trade-quality summaries for live alert presentation.

  Trade quality answers: did the alert direction move favorably within 1-6h
  without too much adverse path risk? This is deliberately presentation-only;
  phase1d-alerts may display it and may use explicit presentation-routing policy,
  but must not change readiness scoring from it.
*/

const fs = require('fs');
const path = require('path');
const tradeQuality = require('./trade-quality');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const ALERTS_PATH = path.join(DATA, 'phase1d-alerts.jsonl');
const PRICE_PATH = path.join(DATA, 'autoresearch', 'price-15m.jsonl');
const OUT_JSON = path.join(DATA, 'trade-quality-report.json');
const OUT_MD = path.join(DATA, 'trade-quality-report.md');
const HORIZONS = [1, 2, 3, 4, 5, 6];
const ASSETS = ['BTC', 'ETH', 'SOL'];

// fetch-backpack-snapshot.js and fetch-binance-context.js were orphaned from
// cron (only reachable via dead orchestrator.js) from 2026-06-09T20:05Z until
// fixed today. oi_price_regime (and any pattern/bucket key derived from it,
// e.g. LONGS_EXITING/FRESH_LONGS/FRESH_SHORTS/SHORTS_COVERING) was a frozen
// near-constant for that whole window, not a real classification. Buckets
// keyed on oi/pattern need a minimum amount of post-fix evidence before their
// win rate can be trusted as fully validated, even if win rate already reads
// >70%. If every episode in the rolling window is post-fix, this is no longer
// a stale-data quarantine; it is low-N forward evidence and should be exposed
// separately so routing can choose a provisional policy for HIGH alerts.
const OI_DATA_FIX_CUTOFF_MS = Date.parse('2026-06-20T20:15:00Z');
const OI_QUARANTINE_MIN_POST_FIX_N = 20;
const LIVE_DECISION_CUTOFF_MS = OI_DATA_FIX_CUTOFF_MS;
function isOiDependentKey(key) { return key.startsWith('pattern:') || key.startsWith('asset_dir_oi_funding:'); }

function readJsonl(file) {
  try { return fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(line => JSON.parse(line)); } catch { return []; }
}
function num(x) { const n = Number(x); return Number.isFinite(n) ? n : null; }
function ts(row) { return Date.parse(row.timestamp_utc || row.timestamp || ''); }
function iso(ms) { return new Date(ms).toISOString(); }
function pct(x, d = 1) { return Number.isFinite(x) ? `${x.toFixed(d)}%` : 'n/a'; }
function signedPct(x, d = 3) { return Number.isFinite(x) ? `${x >= 0 ? '+' : ''}${x.toFixed(d)}%` : 'n/a'; }
function median(vals) {
  const arr = vals.filter(Number.isFinite).sort((a, b) => a - b);
  if (!arr.length) return null;
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
}
function avg(vals) {
  const arr = vals.filter(Number.isFinite);
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
}
function dirForType(type) {
  if (String(type || '').startsWith('LONG')) return 'LONG';
  if (String(type || '').startsWith('SHORT')) return 'SHORT';
  return null;
}
function oppositeDirection(direction) {
  if (direction === 'LONG') return 'SHORT';
  if (direction === 'SHORT') return 'LONG';
  return null;
}
const INVERTING_VERDICTS = new Set(['fade_candidate', 'avoid_original', 'avoid_original_short_primed']);
// Two distinct alert shapes carry a trade direction that differs from `type`:
// 1. OPPORTUNITY_* alerts (generated via opportunityAlert()) put the final,
//    already-inverted trade direction directly in research_note.trade_direction.
// 2. Older fade/avoid alerts (LONG_SETUP, LONG_CONFIRMED, RETEST_HELD, ...)
//    keep `type` as the natural/source direction and signal the inversion via
//    pattern.verdict / empirical_watch.verdict (fade_candidate etc) instead.
//    Naively using dirForType(type) for these measures the wrong side of the
//    trade — e.g. BTC_LONG_SETUP_INVERSE_SHORT_POSTFIX's `type` is LONG_SETUP
//    but the alerted trade is the inverse SHORT.
// Without handling both shapes, these alerts were silently dropped (case 1)
// or measured backwards (case 2) — no MFE/MAE ever existed for them.
function tradeDirectionForAlert(alert) {
  if (alert.research_note?.trade_direction) return alert.research_note.trade_direction;
  const natural = dirForType(alert.type) || alert?.readiness_shadow?.direction || null;
  const verdict = alert?.empirical_watch?.verdict || alert?.pattern?.verdict || null;
  if (INVERTING_VERDICTS.has(verdict)) return oppositeDirection(natural);
  return natural;
}
function directionReturnPct(direction, entry, future) {
  if (!Number.isFinite(entry) || !Number.isFinite(future)) return null;
  const raw = ((future - entry) / entry) * 100;
  return direction === 'SHORT' ? -raw : raw;
}
function parseArgs(argv = process.argv.slice(2)) {
  const out = { days: 10, since: null, until: null, minN: 5, includePreFix: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => argv[++i];
    if (arg === '--days') out.days = Number(next());
    else if (arg.startsWith('--days=')) out.days = Number(arg.slice('--days='.length));
    else if (arg === '--since') out.since = next();
    else if (arg.startsWith('--since=')) out.since = arg.slice('--since='.length);
    else if (arg === '--until') out.until = next();
    else if (arg.startsWith('--until=')) out.until = arg.slice('--until='.length);
    else if (arg === '--min-n') out.minN = Number(next());
    else if (arg.startsWith('--min-n=')) out.minN = Number(arg.slice('--min-n='.length));
    else if (arg === '--include-pre-fix') out.includePreFix = true;
    else if (arg === '--help' || arg === '-h') {
      process.stdout.write('Usage: node scripts/build-trade-quality-report.js [--days 10] [--since ISO] [--until ISO] [--min-n 5] [--include-pre-fix]\n');
      process.exit(0);
    }
  }
  return out;
}

function buildPriceIndex(priceRows) {
  const byAsset = Object.fromEntries(ASSETS.map(a => [a, []]));
  for (const row of priceRows) {
    const t = ts(row);
    if (!Number.isFinite(t)) continue;
    for (const asset of ASSETS) {
      const p = num(row.prices?.[asset]?.lastPrice);
      if (Number.isFinite(p)) byAsset[asset].push({ t, price: p, timestamp_utc: row.timestamp_utc });
    }
  }
  for (const rows of Object.values(byAsset)) rows.sort((a, b) => a.t - b.t);
  return byAsset;
}

function priceAtOrAfter(rows, targetMs, maxLagMs = 25 * 60 * 1000) {
  let lo = 0, hi = rows.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (rows[mid].t < targetMs) lo = mid + 1;
    else hi = mid;
  }
  const row = rows[lo];
  if (!row || row.t - targetMs > maxLagMs) return null;
  return row;
}

function pricesBetween(rows, startMs, endMs) {
  return rows.filter(r => r.t >= startMs && r.t <= endMs);
}

function groupKeys(row) {
  const keys = [];
  if (row.pattern) keys.push(`pattern:${row.pattern}`);
  if (row.oi || row.funding) keys.push(`asset_dir_oi_funding:${row.asset}|${row.direction}|${row.oi || 'NONE'}|${row.funding || 'NONE'}`);
  if (row.flow) keys.push(`asset_dir_flow:${row.asset}|${row.direction}|${row.flow}`);
  keys.push(`asset_type:${row.asset}|${row.type}`);
  keys.push(`asset_dir:${row.asset}|${row.direction}`);
  return keys;
}

const DEDUP_COOLDOWN_MS = Math.max(...HORIZONS) * 60 * 60 * 1000;

// Episodes within the same group that fire less than the longest measured
// horizon apart share most of their outcome window and are not independent
// draws — counting them separately inflates n and win rate. Confirmed via
// data/clean-candidates-redo-2026-06-20.md: a 90-minute cooldown (and this
// function's prior lack of any cooldown at all) produced win rates 10-23
// points higher than independent episodes support.
function percentile(sortedVals, p) {
  if (!sortedVals.length) return null;
  const idx = (sortedVals.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sortedVals[lo];
  return sortedVals[lo] + (sortedVals[hi] - sortedVals[lo]) * (idx - lo);
}
// A single median/avg hides shape: a pattern with mostly small MFE and one
// big outlier looks identical to one with consistently decent MFE unless we
// look at the spread. p25 close to 0 (or negative) while p75/max are large
// means most episodes never got a real favorable excursion.
function distribution(vals) {
  const arr = vals.filter(Number.isFinite).sort((a, b) => a - b);
  if (!arr.length) return null;
  return {
    n: arr.length,
    min: arr[0],
    p25: percentile(arr, 0.25),
    median: percentile(arr, 0.5),
    p75: percentile(arr, 0.75),
    max: arr[arr.length - 1],
    values: arr.map(v => Number(v.toFixed(3))),
  };
}

function countBy(rows, fn) {
  const out = {};
  for (const row of rows) {
    const value = fn(row) || 'NONE';
    out[value] = (out[value] || 0) + 1;
  }
  return out;
}

function dedupeEpisodes(rows) {
  const sorted = [...rows].sort((a, b) => ts(a) - ts(b));
  const kept = [];
  let lastMs = -Infinity;
  for (const row of sorted) {
    const t = ts(row);
    if (!Number.isFinite(t)) continue;
    if (t - lastMs < DEDUP_COOLDOWN_MS) continue;
    lastMs = t;
    kept.push(row);
  }
  return kept;
}

function summarize(key, rawRows) {
  const rows = dedupeEpisodes(rawRows);
  const latestRow = rows.slice().sort((a, b) => ts(a) - ts(b)).at(-1) || null;
  const horizons = {};
  for (const h of HORIZONS) {
    const vals = rows.map(r => r.horizons[`${h}h`]).filter(Number.isFinite);
    const wins = vals.filter(v => v > 0).length;
    horizons[`${h}h`] = {
      n: vals.length,
      win_rate_pct: vals.length ? wins / vals.length * 100 : null,
      loss_rate_pct: vals.length ? (vals.length - wins) / vals.length * 100 : null,
      avg_pct: avg(vals),
      median_pct: median(vals),
      best_pct: vals.length ? Math.max(...vals) : null,
      worst_pct: vals.length ? Math.min(...vals) : null,
    };
  }
  const mfe = rows.map(r => r.path6h?.mfe_pct).filter(Number.isFinite);
  const mae = rows.map(r => r.path6h?.mae_pct).filter(Number.isFinite);
  const favFirstRows = rows.filter(r => ['favorable', 'adverse'].includes(r.path6h?.first));
  const favFirst = favFirstRows.filter(r => r.path6h.first === 'favorable').length;
  const tMfe = rows.map(r => r.path6h?.minutes_to_mfe).filter(Number.isFinite);
  const tMae = rows.map(r => r.path6h?.minutes_to_mae).filter(Number.isFinite);
  // Per-episode reward-vs-risk: did the favorable excursion actually beat the
  // adverse one on that specific episode, not just on average across all of them.
  const bothRows = rows.filter(r => Number.isFinite(r.path6h?.mfe_pct) && Number.isFinite(r.path6h?.mae_pct));
  const mfeBeatsMae = bothRows.filter(r => r.path6h.mfe_pct > Math.abs(r.path6h.mae_pct)).length;
  const summary = {
    key,
    n: rows.length,
    raw_n_before_dedup: rawRows.length,
    rows_with_6h_path: mfe.length,
    horizons,
    path6h: {
      median_mfe_pct: median(mfe),
      avg_mfe_pct: avg(mfe),
      median_mae_pct: median(mae),
      avg_mae_pct: avg(mae),
      mfe_distribution: distribution(mfe),
      mae_distribution: distribution(mae),
      episodes_mfe_beats_mae_n: bothRows.length,
      episodes_mfe_beats_mae_count: mfeBeatsMae,
      episodes_mfe_beats_mae_pct: bothRows.length ? (mfeBeatsMae / bothRows.length) * 100 : null,
      favorable_first_rate_pct: favFirstRows.length ? favFirst / favFirstRows.length * 100 : null,
      first_order_n: favFirstRows.length,
      median_minutes_to_mfe: median(tMfe),
      median_minutes_to_mae: median(tMae),
    },
    examples: rows.slice(-5).map(r => ({ timestamp_utc: r.timestamp_utc, asset: r.asset, type: r.type, price: r.price, pattern: r.pattern })),
    latest_regime: latestRow?.regime || null,
    regime_counts: {
      btc_gate: countBy(rows, r => r.regime?.btc_gate),
      funding: countBy(rows, r => r.regime?.funding || r.funding),
      label: countBy(rows, r => r.regime?.label),
    },
  };
  if (isOiDependentKey(key)) {
    const postFixN = rows.filter(r => ts(r) >= OI_DATA_FIX_CUTOFF_MS).length;
    const preFixN = rows.length - postFixN;
    summary.oi_dependent = true;
    summary.post_fix_n = postFixN;
    summary.pre_fix_n = preFixN;
    summary.post_fix_only_low_n = preFixN === 0 && postFixN > 0 && postFixN < OI_QUARANTINE_MIN_POST_FIX_N;
    summary.oi_data_quarantined = preFixN > 0 && postFixN < OI_QUARANTINE_MIN_POST_FIX_N;
    if (summary.oi_data_quarantined) {
      summary.oi_data_quarantine_reason = `oi_price_regime was frozen pre-2026-06-20T20:15Z; ${preFixN} pre-fix contaminated episodes remain and only ${postFixN} post-fix episodes are available (need >= ${OI_QUARANTINE_MIN_POST_FIX_N})`;
    } else if (summary.post_fix_only_low_n) {
      summary.oi_data_low_n_reason = `all ${postFixN} episodes are post-fix, but post-fix N is below full-validation threshold ${OI_QUARANTINE_MIN_POST_FIX_N}`;
    }
  }
  summary.classification = tradeQuality.classifySummary(summary);
  return summary;
}

function main() {
  const args = parseArgs();
  const alerts = readJsonl(ALERTS_PATH);
  const priceRows = readJsonl(PRICE_PATH);
  const priceIndex = buildPriceIndex(priceRows);
  const latestMs = Math.max(...priceRows.map(ts).filter(Number.isFinite));
  const untilMs = args.until ? Date.parse(args.until) : latestMs;
  const requestedSinceMs = args.since ? Date.parse(args.since) : untilMs - Number(args.days || 10) * 24 * 60 * 60 * 1000;
  const sinceMs = args.includePreFix ? requestedSinceMs : Math.max(requestedSinceMs, LIVE_DECISION_CUTOFF_MS);
  if (!Number.isFinite(sinceMs) || !Number.isFinite(untilMs)) throw new Error('Invalid since/until');

  const rows = [];
  for (const alert of alerts) {
    const t = ts(alert);
    if (!Number.isFinite(t) || t < sinceMs || t > untilMs) continue;
    const direction = tradeDirectionForAlert(alert);
    if (!direction) continue;
    const asset = alert.asset;
    if (!ASSETS.includes(asset)) continue;
    const priceRowsForAsset = priceIndex[asset] || [];
    const entry = num(alert.diagnostics?.price) ?? priceAtOrAfter(priceRowsForAsset, t)?.price;
    if (!Number.isFinite(entry)) continue;
    const row = {
      timestamp_utc: alert.timestamp_utc,
      asset,
      type: alert.type,
      direction,
      price: entry,
      flow: alert.diagnostics?.flow || null,
      oi: alert.readiness_shadow?.source_metrics?.oi_price_regime || null,
      funding: alert.readiness_shadow?.source_metrics?.cross_exchange_positioning?.classification || null,
      regime: alert.regime || null,
      pattern: alert.empirical_watch?.key || alert.pattern?.key || alert.research_note?.pattern_key || null,
      horizons: {},
      path6h: null,
    };
    for (const h of HORIZONS) {
      const future = priceAtOrAfter(priceRowsForAsset, t + h * 60 * 60 * 1000);
      row.horizons[`${h}h`] = future ? directionReturnPct(direction, entry, future.price) : null;
    }
    // MFE/MAE must scan the full horizon (6h), not just the first 4h — a
    // best/worst excursion clipped to 4h understates risk/reward for setups
    // whose median time-to-MFE/MAE lands in hour 5-6 (seen on several of the
    // inverse/opportunity patterns).
    const pathRows = pricesBetween(priceRowsForAsset, t, t + 6 * 60 * 60 * 1000);
    if (pathRows.length) {
      let best = null;
      let worst = null;
      for (const p of pathRows) {
        const dr = directionReturnPct(direction, entry, p.price);
        if (!best || dr > best.dr) best = { dr, t: p.t };
        if (!worst || dr < worst.dr) worst = { dr, t: p.t };
      }
      let first = null;
      if (best && worst) first = best.t <= worst.t ? 'favorable' : 'adverse';
      row.path6h = {
        mfe_pct: best?.dr ?? null,
        mae_pct: worst?.dr ?? null,
        minutes_to_mfe: best ? Math.round((best.t - t) / 60000) : null,
        minutes_to_mae: worst ? Math.round((worst.t - t) / 60000) : null,
        first,
      };
    }
    rows.push(row);
  }

  const groups = new Map();
  for (const row of rows) {
    for (const key of groupKeys(row)) {
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(row);
    }
  }
  const summaries = [...groups.entries()]
    .filter(([, rs]) => rs.length >= Number(args.minN || 5))
    .map(([key, rs]) => summarize(key, rs))
    .sort((a, b) => b.n - a.n || a.key.localeCompare(b.key));

  const output = {
    generated_at: new Date().toISOString(),
    window: { since: iso(sinceMs), until: iso(untilMs), days: (untilMs - sinceMs) / (24 * 60 * 60 * 1000) },
    decision_data_policy: {
      mode: args.includePreFix ? 'historical_include_pre_fix' : 'live_post_fix_only',
      live_decision_cutoff_utc: iso(LIVE_DECISION_CUTOFF_MS),
      requested_since: Number.isFinite(requestedSinceMs) ? iso(requestedSinceMs) : null,
      effective_since: iso(sinceMs),
      note: args.includePreFix
        ? 'Historical/postmortem mode may include contaminated pre-fix OI labels; do not use directly for live routing.'
        : 'Live routing/reporting excludes pre-fix frozen-OI window from all summary rates and path metrics.',
    },
    inputs: { alerts: ALERTS_PATH.replace(`${ROOT}/`, ''), prices: PRICE_PATH.replace(`${ROOT}/`, ''), directional_alert_rows: rows.length },
    thresholds: {
      note: 'Classification uses live post-fix-only rows by default. It is presentation/routing support only and does not change readiness score.',
      tradeable: 'n>=20 or n>=12 very-clean; best 1-6h win>=60%, avg>0, median MFE6h>=0.35%, median MAE6h better than -0.75%, favorable-first>=55%',
      front_loaded: 'early 1h/2h win>=60%, avg>0, acceptable MAE; do not overhold',
      bad_path: 'best horizon <45% win, or <50% with negative avg, or MAE6h <= -1.0% with weak win-rate',
    },
    summaries,
  };
  fs.writeFileSync(OUT_JSON, JSON.stringify(output, null, 2));

  const md = [];
  md.push(`# Trade Quality Report\n`);
  md.push(`Generated: ${output.generated_at}`);
  md.push(`Window: ${output.window.since} → ${output.window.until}`);
  md.push(`Decision data policy: ${output.decision_data_policy.mode} (cutoff ${output.decision_data_policy.live_decision_cutoff_utc})`);
  md.push(`Directional alert rows: ${rows.length}`);
  md.push(`\nPresentation-only: no score/delivery/active-context impact.\n`);
  md.push('| key | class | n | best | avg | MFE6h p25/med/p75 | MAE6h p25/med/p75 | MFE>|MAE| | fav-first | reason |');
  md.push('| --- | --- | ---: | --- | ---: | --- | --- | ---: | ---: | --- |');
  for (const s of summaries.slice(0, 80)) {
    const c = s.classification || {};
    const p = s.path6h || {};
    const mfeD = p.mfe_distribution;
    const maeD = p.mae_distribution;
    const mfeSpread = mfeD ? `${signedPct(mfeD.p25)}/${signedPct(mfeD.median)}/${signedPct(mfeD.p75)}` : 'n/a';
    const maeSpread = maeD ? `${signedPct(maeD.p25)}/${signedPct(maeD.median)}/${signedPct(maeD.p75)}` : 'n/a';
    const rr = Number.isFinite(p.episodes_mfe_beats_mae_pct) ? `${pct(p.episodes_mfe_beats_mae_pct)} (${p.episodes_mfe_beats_mae_count}/${p.episodes_mfe_beats_mae_n})` : 'n/a';
    md.push(`| ${s.key} | ${c.label || 'n/a'} | ${s.n} | ${c.best_horizon || 'n/a'} ${pct(c.best_win_rate_pct)} | ${signedPct(c.best_avg_pct)} | ${mfeSpread} | ${maeSpread} | ${rr} | ${pct(p.favorable_first_rate_pct)} | ${(c.reason || '').replace(/\|/g, '/')} |`);
  }
  fs.writeFileSync(OUT_MD, `${md.join('\n')}\n`);
  process.stdout.write(`Wrote ${OUT_JSON} and ${OUT_MD}\n`);
}

if (require.main === module) main();
