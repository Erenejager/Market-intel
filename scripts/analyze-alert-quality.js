#!/usr/bin/env node
/*
  Read-only Phase 1d / Phase 1b quality diagnostics.

  Sections:
  1) HIGH alert outcome table using price-15m.jsonl for fixed-horizon returns/MFE/MAE.
  2) Per-penalty outcome split from phase1b-replay-report.json.
  3) BTC gate flip frequency from microstructure-history.jsonl.
  4) SHORT_CONFIRMED timing versus local lows.

  Writes:
  - data/alert-quality-report.md
  - data/alert-quality-report.json
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const ALERTS_PATH = path.join(DATA, 'phase1d-alerts.jsonl');
const PRICE_PATH = path.join(DATA, 'autoresearch', 'price-15m.jsonl');
const REPLAY_PATH = path.join(DATA, 'phase1b-replay-report.json');
const MICRO_PATH = path.join(DATA, 'microstructure-history.jsonl');
const DEFAULT_OUT_MD = path.join(DATA, 'alert-quality-report.md');
const DEFAULT_OUT_JSON = path.join(DATA, 'alert-quality-report.json');

const ASSETS = ['BTC', 'ETH', 'SOL'];
const HORIZONS = [
  { label: '30m', ms: 30 * 60 * 1000 },
  { label: '1h', ms: 60 * 60 * 1000 },
  { label: '4h', ms: 4 * 60 * 60 * 1000 },
  { label: '8h', ms: 8 * 60 * 60 * 1000 },
  { label: '12h', ms: 12 * 60 * 60 * 1000 },
  { label: '24h', ms: 24 * 60 * 60 * 1000 },
];

function readJsonl(file) {
  try {
    return fs.readFileSync(file, 'utf8')
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line));
  } catch {
    return [];
  }
}
function readJson(file, fallback = null) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}
function parseArgs(argv = process.argv.slice(2)) {
  const out = { since: null, until: null, outputSuffix: '' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => argv[++i];
    if (arg === '--since') out.since = next();
    else if (arg.startsWith('--since=')) out.since = arg.slice('--since='.length);
    else if (arg === '--until') out.until = next();
    else if (arg.startsWith('--until=')) out.until = arg.slice('--until='.length);
    else if (arg === '--output-suffix') out.outputSuffix = next() || '';
    else if (arg.startsWith('--output-suffix=')) out.outputSuffix = arg.slice('--output-suffix='.length);
    else if (arg === '--help' || arg === '-h') {
      process.stdout.write('Usage: node scripts/analyze-alert-quality.js [--since ISO] [--until ISO] [--output-suffix name]\n');
      process.exit(0);
    }
  }
  return out;
}
function toMsOrNull(x) {
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
function outputPaths(outputSuffix) {
  const safe = String(outputSuffix || '').trim().replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  if (!safe) return { md: DEFAULT_OUT_MD, json: DEFAULT_OUT_JSON };
  return {
    md: path.join(DATA, `alert-quality-report-${safe}.md`),
    json: path.join(DATA, `alert-quality-report-${safe}.json`),
  };
}
function ts(row) { return Date.parse(row.timestamp_utc || row.timestamp || ''); }
function num(x) { const n = Number(x); return Number.isFinite(n) ? n : null; }
function pct(x, d = 3) { return Number.isFinite(x) ? `${x.toFixed(d)}%` : 'n/a'; }
function fmt(x, d = 4) { return Number.isFinite(x) ? String(Number(x.toFixed(d))) : 'n/a'; }
function dirForType(type) {
  if (type === 'LONG_CONFIRMED') return 'LONG';
  if (type === 'SHORT_CONFIRMED') return 'SHORT';
  return null;
}
function directionReturnPct(direction, entry, future) {
  if (!Number.isFinite(entry) || !Number.isFinite(future)) return null;
  const raw = ((future - entry) / entry) * 100;
  return direction === 'SHORT' ? -raw : raw;
}
function rawReturnPct(entry, future) {
  if (!Number.isFinite(entry) || !Number.isFinite(future)) return null;
  return ((future - entry) / entry) * 100;
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
function pricesBetween(priceRows, asset, startMs, endMs) {
  return priceRows.map(row => {
    const t = ts(row);
    const price = num(row.prices?.[asset]?.lastPrice);
    if (!Number.isFinite(t) || !Number.isFinite(price) || t < startMs || t > endMs) return null;
    return { t, price, timestamp_utc: row.timestamp_utc };
  }).filter(Boolean).sort((a, b) => a.t - b.t);
}
function mfeMae(direction, entry, samples, startMs = null) {
  if (!Number.isFinite(entry) || !samples.length || !direction) {
    return {
      mfe_pct: null,
      time_to_mfe_min: null,
      mae_pct: null,
      time_to_mae_min: null,
      first_extreme: null,
    };
  }
  const baseMs = Number.isFinite(startMs) ? startMs : samples[0].t;
  let mfe = null;
  let mae = null;
  for (const sample of samples) {
    const ret = directionReturnPct(direction, entry, sample.price);
    if (!Number.isFinite(ret)) continue;
    const minutes = Math.round((sample.t - baseMs) / 60000);
    if (!mfe || ret > mfe.ret) mfe = { ret, minutes };
    if (!mae || ret < mae.ret) mae = { ret, minutes };
  }
  const firstExtreme = !mfe || !mae ? null
    : mfe.minutes < mae.minutes ? 'favorable'
    : mae.minutes < mfe.minutes ? 'adverse'
    : 'simultaneous';
  return {
    mfe_pct: mfe?.ret ?? null,
    time_to_mfe_min: mfe?.minutes ?? null,
    mae_pct: mae?.ret ?? null,
    time_to_mae_min: mae?.minutes ?? null,
    first_extreme: firstExtreme,
  };
}
function isPreFixBug(alert, allAlerts) {
  if (alert.type === 'SHORT_INVALIDATED' && /flow left bearish regime \(LEVERAGED_CHASE\)/.test(alert.reason || '')) return true;
  if (alert.type === 'SHORT_CAUTION') {
    return allAlerts.some(a => a.timestamp_utc === alert.timestamp_utc && a.asset === alert.asset && a.type === 'SHORT_INVALIDATED' && /LEVERAGED_CHASE/.test(a.reason || ''));
  }
  return false;
}
function findNextInvalidation(alert, alerts) {
  const start = ts(alert);
  const invalidType = alert.type === 'LONG_CONFIRMED' ? 'LONG_INVALIDATED' : alert.type === 'SHORT_CONFIRMED' ? 'SHORT_INVALIDATED' : null;
  if (!invalidType) return null;
  return alerts
    .filter(a => a.asset === alert.asset && a.type === invalidType && ts(a) > start)
    .sort((a, b) => ts(a) - ts(b))[0] || null;
}
function classifyInvalidation(alert) {
  if (!alert) return null;
  const r = alert.reason || '';
  if (/pre-fix/i.test(r) || /LEVERAGED_CHASE/.test(r)) return 'pre_fix_or_leveraged_chase';
  if (/BTC gate/.test(r)) return 'btc_gate';
  if (/flow turned bullish|flow left bearish|flow left bullish|flow turned/.test(r)) return 'flow';
  if (/retest|reclaimed|failed level/.test(r)) return 'structure';
  return 'other';
}
function alertOutcomes(alerts, priceRows) {
  const high = alerts.filter(a => a.severity === 'HIGH').sort((a, b) => ts(a) - ts(b));
  const rows = high.map(alert => {
    const direction = dirForType(alert.type);
    const asset = alert.asset;
    const t = ts(alert);
    const entry = num(alert.diagnostics?.price);
    const invalidation = findNextInvalidation(alert, alerts);
    const invalidPrice = invalidation ? num(invalidation.diagnostics?.price) : null;
    const horizon = {};
    for (const h of HORIZONS) {
      const p = direction ? nearestPriceAtOrAfter(priceRows, asset, t + h.ms) : null;
      horizon[h.label] = p ? {
        timestamp_utc: p.timestamp_utc,
        price: p.price,
        directional_return_pct: directionReturnPct(direction, entry, p.price),
        raw_return_pct: rawReturnPct(entry, p.price),
      } : null;
    }
    const windowSamples4h = direction ? pricesBetween(priceRows, asset, t, t + 4 * 60 * 60 * 1000) : [];
    const windowSamples24h = direction ? pricesBetween(priceRows, asset, t, t + 24 * 60 * 60 * 1000) : [];
    const mm4h = mfeMae(direction, entry, windowSamples4h, t);
    const mm24h = mfeMae(direction, entry, windowSamples24h, t);
    return {
      timestamp_utc: alert.timestamp_utc,
      asset,
      type: alert.type,
      direction,
      price: entry,
      pre_fix_bug: isPreFixBug(alert, alerts),
      reason: alert.reason,
      btc_gate: alert.diagnostics?.btc_gate || null,
      flow: alert.diagnostics?.flow || null,
      flow_streak: alert.diagnostics?.flow_streak ?? null,
      invalidation: invalidation ? {
        timestamp_utc: invalidation.timestamp_utc,
        price: invalidPrice,
        type: invalidation.type,
        reason: invalidation.reason,
        category: classifyInvalidation(invalidation),
        minutes_after: Math.round((ts(invalidation) - t) / 60000),
        directional_return_pct: direction ? directionReturnPct(direction, entry, invalidPrice) : null,
      } : null,
      horizon,
      excursion: {
        '4h': mm4h,
        '24h': mm24h,
      },
      price_samples_4h: windowSamples4h.length,
      price_samples_24h: windowSamples24h.length,
    };
  });
  const directional = rows.filter(r => r.direction && !r.pre_fix_bug);
  const precisionByHorizon = Object.fromEntries(HORIZONS.map(h => {
    const vals = directional.map(r => r.horizon[h.label]?.directional_return_pct).filter(Number.isFinite);
    return [h.label, {
      n: vals.length,
      hit_rate_positive: vals.length ? vals.filter(v => v > 0).length / vals.length : null,
      avg_directional_return_pct: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null,
    }];
  }));
  return { rows, summary: { high_alerts: rows.length, directional_non_prefix: directional.length, precisionByHorizon } };
}
function penaltySplits(replay) {
  const rows = replay?.rows || [];
  const groups = new Map();
  function add(key, row) {
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  for (const row of rows) {
    const penalties = row.penalties || [];
    const ret = num(row.next_4_sample_return_pct);
    if (!Number.isFinite(ret)) continue;
    const conditions = penalties.map(p => p.condition).sort();
    for (const cond of conditions) add(`${cond}__ANY`, row);
    if (conditions.length === 1) add(`${conditions[0]}__ALONE`, row);
    if (conditions.length > 1) add(`${conditions.join('+')}__COMBO`, row);
  }
  const out = [];
  for (const [key, rs] of groups.entries()) {
    const [name, mode] = key.split('__');
    const vals = rs.map(r => num(r.next_4_sample_return_pct)).filter(Number.isFinite);
    out.push({
      penalty: name,
      mode,
      n: vals.length,
      avg_next_4_sample_return_pct: vals.reduce((a, b) => a + b, 0) / vals.length,
      median_next_4_sample_return_pct: vals.slice().sort((a, b) => a - b)[Math.floor(vals.length / 2)],
      positive_rate: vals.filter(v => v > 0).length / vals.length,
      non_positive_rate: vals.filter(v => v <= 0).length / vals.length,
      assets: Object.fromEntries(ASSETS.map(asset => [asset, rs.filter(r => r.asset === asset).length]).filter(([, n]) => n)),
    });
  }
  return out.sort((a, b) => a.penalty.localeCompare(b.penalty) || a.mode.localeCompare(b.mode));
}
function shortConfirmedTiming(alertRows, priceRows) {
  return alertRows
    .filter(r => r.type === 'SHORT_CONFIRMED' && !r.pre_fix_bug && Number.isFinite(r.price))
    .map(r => {
      const start = Date.parse(r.timestamp_utc);
      const forwardSamples = pricesBetween(priceRows, r.asset, start, start + 4 * 60 * 60 * 1000);
      const surroundingSamples = pricesBetween(priceRows, r.asset, start - 2 * 60 * 60 * 1000, start + 4 * 60 * 60 * 1000);
      const forwardLow = forwardSamples.reduce((best, s) => (!best || s.price < best.price ? s : best), null);
      const surroundingLow = surroundingSamples.reduce((best, s) => (!best || s.price < best.price ? s : best), null);
      const forwardLowMs = forwardLow ? forwardLow.t - start : null;
      const surroundingLowMs = surroundingLow ? start - surroundingLow.t : null;
      return {
        timestamp_utc: r.timestamp_utc,
        asset: r.asset,
        alert_price: r.price,
        forward_4h_low: forwardLow ? {
          timestamp_utc: forwardLow.timestamp_utc,
          price: forwardLow.price,
          minutes_after_alert: Math.round(forwardLowMs / 60000),
          directional_return_pct: directionReturnPct('SHORT', r.price, forwardLow.price),
        } : null,
        surrounding_2h_before_4h_after_low: surroundingLow ? {
          timestamp_utc: surroundingLow.timestamp_utc,
          price: surroundingLow.price,
          // Positive means alert came after the local low; negative means the low came after alert.
          alert_lag_minutes_after_low: Math.round(surroundingLowMs / 60000),
          directional_return_pct: directionReturnPct('SHORT', r.price, surroundingLow.price),
        } : null,
      };
    });
}
function btcGateFlips(microRows) {
  const byAsset = {};
  for (const asset of ['ETH', 'SOL']) {
    let prev = null;
    const transitions = {};
    let changes = 0;
    let consecutiveNeutralWeak = 0;
    let rows = 0;
    for (const row of microRows.sort((a, b) => ts(a) - ts(b))) {
      const gate = row.markets?.[asset]?.btc_flow_gate?.classification || 'NONE';
      if (gate === 'NONE') continue;
      rows += 1;
      if (prev && prev.gate !== gate) {
        changes += 1;
        const key = `${prev.gate} -> ${gate}`;
        transitions[key] = (transitions[key] || 0) + 1;
        const pair = new Set([prev.gate, gate]);
        if (pair.has('NEUTRAL') && (pair.has('BTC_WEAK_VETO_ALT_LONGS') || pair.has('BTC_WEAK_PENALIZE_ALT_LONGS'))) consecutiveNeutralWeak += 1;
      }
      prev = { gate, timestamp_utc: row.timestamp_utc };
    }
    byAsset[asset] = {
      rows_with_gate: rows,
      changes,
      change_rate: rows > 1 ? changes / (rows - 1) : null,
      neutral_weak_consecutive_flips: consecutiveNeutralWeak,
      transitions,
    };
  }
  return byAsset;
}
function mdTable(headers, rows) {
  const esc = x => String(x ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
  return [
    `| ${headers.map(esc).join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map(r => `| ${r.map(esc).join(' | ')} |`),
  ].join('\n');
}
function renderMarkdown(result) {
  const lines = [];
  lines.push('# Phase 1 Alert Quality Report');
  lines.push('');
  lines.push(`Generated: ${result.generated_at}`);
  if (result.filters?.since || result.filters?.until) {
    lines.push(`Window: ${result.filters.since || '-∞'} → ${result.filters.until || '+∞'}`);
  }
  lines.push('');
  lines.push('## 1. HIGH Alert Outcome Table');
  lines.push('');
  lines.push('Pre-fix rows are labeled and excluded from directional precision summaries. Directional returns are positive when price moved in the alert direction. MFE/MAE use `data/autoresearch/price-15m.jsonl`.');
  lines.push('');
  const horizonLabels = HORIZONS.map(h => h.label);
  lines.push(mdTable(
    ['time', 'asset', 'type', 'price', 'pre-fix?', ...horizonLabels.map(h => `+${h}`), 'MFE 4h', 'MAE 4h', 'invalidation'],
    result.alert_quality.rows.map(r => [
      r.timestamp_utc,
      r.asset,
      r.type,
      fmt(r.price, 4),
      r.pre_fix_bug ? 'YES' : '',
      ...horizonLabels.map(h => pct(r.horizon[h]?.directional_return_pct)),
      pct(r.excursion?.['4h']?.mfe_pct),
      pct(r.excursion?.['4h']?.mae_pct),
      r.invalidation ? `${r.invalidation.minutes_after}m ${r.invalidation.type} (${r.invalidation.category}) ${pct(r.invalidation.directional_return_pct)}` : '',
    ])
  ));

  lines.push('');
  lines.push('## 1b. Excursion / Path Risk Table');
  lines.push('');
  lines.push('MFE/MAE are directional: positive MFE means max move in alert direction; negative MAE means max move against alert direction. `first extreme` shows whether the favorable or adverse extreme was reached first inside the window.');
  lines.push('');
  lines.push(mdTable(
    ['time', 'asset', 'type', 'BTC gate', 'MFE 4h', 'tMFE 4h', 'MAE 4h', 'tMAE 4h', 'first 4h', 'MFE 24h', 'tMFE 24h', 'MAE 24h', 'tMAE 24h', 'first 24h'],
    result.alert_quality.rows.filter(r => r.direction && !r.pre_fix_bug).map(r => [
      r.timestamp_utc,
      r.asset,
      r.type,
      r.btc_gate || '',
      pct(r.excursion?.['4h']?.mfe_pct),
      r.excursion?.['4h']?.time_to_mfe_min == null ? 'n/a' : `${r.excursion['4h'].time_to_mfe_min}m`,
      pct(r.excursion?.['4h']?.mae_pct),
      r.excursion?.['4h']?.time_to_mae_min == null ? 'n/a' : `${r.excursion['4h'].time_to_mae_min}m`,
      r.excursion?.['4h']?.first_extreme || 'n/a',
      pct(r.excursion?.['24h']?.mfe_pct),
      r.excursion?.['24h']?.time_to_mfe_min == null ? 'n/a' : `${r.excursion['24h'].time_to_mfe_min}m`,
      pct(r.excursion?.['24h']?.mae_pct),
      r.excursion?.['24h']?.time_to_mae_min == null ? 'n/a' : `${r.excursion['24h'].time_to_mae_min}m`,
      r.excursion?.['24h']?.first_extreme || 'n/a',
    ])
  ));
  lines.push('');
  lines.push('### Directional HIGH precision summary, excluding pre-fix rows');
  lines.push('');
  lines.push(mdTable(
    ['horizon', 'n', 'hit rate > 0', 'avg directional return'],
    Object.entries(result.alert_quality.summary.precisionByHorizon).map(([h, s]) => [h, s.n, s.hit_rate_positive == null ? 'n/a' : `${(s.hit_rate_positive * 100).toFixed(1)}%`, pct(s.avg_directional_return_pct)])
  ));
  lines.push('');
  lines.push('## 2. Per-Penalty Outcome Split');
  lines.push('');
  lines.push('Rows come from `phase1b-replay-report.json`. Positive return means price rose after a BUY-risk penalty; for a penalty intended to block bad longs, lower/negative is better.');
  lines.push('');
  lines.push(mdTable(
    ['penalty / combo', 'mode', 'n', 'avg next-4', 'median next-4', 'positive rate', 'assets'],
    result.penalty_splits.map(p => [p.penalty, p.mode, p.n, pct(p.avg_next_4_sample_return_pct), pct(p.median_next_4_sample_return_pct), `${(p.positive_rate * 100).toFixed(1)}%`, JSON.stringify(p.assets)])
  ));
  lines.push('');
  lines.push('## 3. BTC Gate Flip Frequency');
  lines.push('');
  lines.push(mdTable(
    ['asset', 'rows', 'changes', 'change rate', 'NEUTRAL<->WEAK flips', 'top transitions'],
    Object.entries(result.btc_gate_flips).map(([asset, s]) => [
      asset,
      s.rows_with_gate,
      s.changes,
      s.change_rate == null ? 'n/a' : `${(s.change_rate * 100).toFixed(1)}%`,
      s.neutral_weak_consecutive_flips,
      Object.entries(s.transitions).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `${k}: ${v}`).join('; '),
    ])
  ));
  lines.push('');
  lines.push('## 4. SHORT_CONFIRMED Timing vs Local Lows');
  lines.push('');
  lines.push('`forward 4h low` shows whether a short had downside left after confirmation. `surrounding low lag` uses a window from 2h before to 4h after alert; positive lag means the alert fired after the local low, i.e. likely late.');
  lines.push('');
  lines.push(mdTable(
    ['time', 'asset', 'alert price', 'forward 4h low', 'minutes to fwd low', 'return to fwd low', 'surrounding low', 'alert lag vs surrounding low'],
    result.short_confirmed_timing.map(r => [
      r.timestamp_utc,
      r.asset,
      fmt(r.alert_price, 4),
      r.forward_4h_low ? `${r.forward_4h_low.timestamp_utc} @ ${fmt(r.forward_4h_low.price, 4)}` : 'n/a',
      r.forward_4h_low?.minutes_after_alert ?? 'n/a',
      pct(r.forward_4h_low?.directional_return_pct),
      r.surrounding_2h_before_4h_after_low ? `${r.surrounding_2h_before_4h_after_low.timestamp_utc} @ ${fmt(r.surrounding_2h_before_4h_after_low.price, 4)}` : 'n/a',
      r.surrounding_2h_before_4h_after_low ? `${r.surrounding_2h_before_4h_after_low.alert_lag_minutes_after_low}m` : 'n/a',
    ])
  ));
  lines.push('');
  return lines.join('\n');
}

function main() {
  const args = parseArgs();
  const sinceMs = toMsOrNull(args.since);
  const untilMs = toMsOrNull(args.until);
  const outPaths = outputPaths(args.outputSuffix);
  const allAlerts = readJsonl(ALERTS_PATH).sort((a, b) => ts(a) - ts(b));
  const alerts = allAlerts.filter(a => inRange(a, sinceMs, untilMs));
  const priceRows = readJsonl(PRICE_PATH).sort((a, b) => ts(a) - ts(b));
  const replay = readJson(REPLAY_PATH, {});
  const microRows = readJsonl(MICRO_PATH).sort((a, b) => ts(a) - ts(b)).filter(r => inRange(r, sinceMs, untilMs));

  const alertQuality = alertOutcomes(alerts, priceRows);
  const result = {
    generated_at: new Date().toISOString(),
    filters: {
      since: args.since || null,
      until: args.until || null,
    },
    inputs: {
      alerts: path.relative(ROOT, ALERTS_PATH),
      price_15m: path.relative(ROOT, PRICE_PATH),
      replay: path.relative(ROOT, REPLAY_PATH),
      microstructure_history: path.relative(ROOT, MICRO_PATH),
      alert_rows: alerts.length,
      alert_rows_total: allAlerts.length,
      price_rows: priceRows.length,
      replay_rows: replay.rows?.length || 0,
      microstructure_rows: microRows.length,
    },
    alert_quality: alertQuality,
    penalty_splits: penaltySplits(replay),
    btc_gate_flips: btcGateFlips(microRows),
    short_confirmed_timing: shortConfirmedTiming(alertQuality.rows, priceRows),
  };

  const md = renderMarkdown(result);
  fs.writeFileSync(outPaths.json, JSON.stringify(result, null, 2) + '\n');
  fs.writeFileSync(outPaths.md, md + '\n');
  process.stdout.write(`${md}\nWrote ${path.relative(process.cwd(), outPaths.md)} and ${path.relative(process.cwd(), outPaths.json)}\n`);
}

main();
