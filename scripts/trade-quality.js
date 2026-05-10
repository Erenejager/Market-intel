const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const REPORT_PATH = path.join(DATA, 'trade-quality-report.json');

function readJson(file, fallback = null) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function pct(x, d = 1) {
  return Number.isFinite(x) ? `${x.toFixed(d)}%` : 'n/a';
}

function signedPct(x, d = 3) {
  return Number.isFinite(x) ? `${x >= 0 ? '+' : ''}${x.toFixed(d)}%` : 'n/a';
}

function oppositeDirection(direction) {
  if (direction === 'LONG') return 'SHORT';
  if (direction === 'SHORT') return 'LONG';
  return null;
}

const INVERTING_VERDICTS = new Set(['fade_candidate', 'avoid_original', 'avoid_original_short_primed']);

function directionFromAlert(alert) {
  const type = alert?.type || '';
  if (alert?.research_note?.trade_direction) return alert.research_note.trade_direction;
  let natural = null;
  if (type.startsWith('LONG')) natural = 'LONG';
  else if (type.startsWith('SHORT')) natural = 'SHORT';
  else natural = alert?.readiness_shadow?.direction || null;
  const verdict = alert?.empirical_watch?.verdict || alert?.pattern?.verdict || null;
  if (INVERTING_VERDICTS.has(verdict)) return oppositeDirection(natural);
  return natural;
}

function oi(alert) {
  return alert?.readiness_shadow?.source_metrics?.oi_price_regime || null;
}

function funding(alert) {
  return alert?.readiness_shadow?.source_metrics?.cross_exchange_positioning?.classification || null;
}

function flow(alert) {
  return alert?.diagnostics?.flow || null;
}

function pattern(alert) {
  return alert?.empirical_watch?.key || alert?.pattern?.key || alert?.research_note?.pattern_key || null;
}

function candidateKeys(alert) {
  const direction = directionFromAlert(alert);
  if (!alert?.asset || !direction) return [];
  const keys = [];
  // Prefer asset-specific execution context before broad empirical pattern keys.
  // Some pattern keys are intentionally conservative/quarantined across assets;
  // trade-quality should describe the most specific live trade path available.
  if (oi(alert) || funding(alert)) keys.push(`asset_dir_oi_funding:${alert.asset}|${direction}|${oi(alert) || 'NONE'}|${funding(alert) || 'NONE'}`);
  if (flow(alert)) keys.push(`asset_dir_flow:${alert.asset}|${direction}|${flow(alert)}`);
  if (alert.type) keys.push(`asset_type:${alert.asset}|${alert.type}`);
  const p = pattern(alert);
  if (p) keys.push(`pattern:${p}`);
  keys.push(`asset_dir:${alert.asset}|${direction}`);
  return keys;
}

function classifySummary(summary) {
  if (!summary || !Number.isFinite(summary.n)) return null;
  const horizons = summary.horizons || {};
  const ranked = ['1h', '2h', '3h', '4h', '5h', '6h']
    .map(label => ({ label, ...(horizons[label] || {}) }))
    .filter(h => Number.isFinite(h.n) && h.n >= Math.min(summary.n, 8));
  if (!ranked.length) return null;
  const best = ranked.slice().sort((a, b) =>
    (b.win_rate_pct ?? -Infinity) - (a.win_rate_pct ?? -Infinity) ||
    (b.avg_pct ?? -Infinity) - (a.avg_pct ?? -Infinity)
  )[0];
  const earlyBest = ranked.filter(h => ['1h', '2h'].includes(h.label)).sort((a, b) =>
    (b.win_rate_pct ?? -Infinity) - (a.win_rate_pct ?? -Infinity) ||
    (b.avg_pct ?? -Infinity) - (a.avg_pct ?? -Infinity)
  )[0] || null;
  const medMae = summary.path6h?.median_mae_pct;
  const medMfe = summary.path6h?.median_mfe_pct;
  const favFirst = summary.path6h?.favorable_first_rate_pct;
  const n = summary.n;
  const enough = n >= 20 || (n >= 12 && best.win_rate_pct >= 65);

  let label = 'WATCH_ONLY';
  let reason = 'edge incomplete or sample still building';

  if (
    enough &&
    best.win_rate_pct >= 60 &&
    best.avg_pct > 0 &&
    Number.isFinite(medMfe) && medMfe >= 0.35 &&
    (!Number.isFinite(medMae) || medMae > -0.75) &&
    (!Number.isFinite(favFirst) || favFirst >= 55)
  ) {
    label = ['1h', '2h'].includes(best.label) ? 'TRADEABLE_FAST' : 'TRADEABLE_1H_4H';
    reason = `best ${best.label} win ${pct(best.win_rate_pct)} avg ${signedPct(best.avg_pct)} with acceptable 6h path`;
  } else if (
    enough && earlyBest && earlyBest.win_rate_pct >= 60 && earlyBest.avg_pct > 0 &&
    (!Number.isFinite(medMae) || medMae > -0.85)
  ) {
    label = 'TRADEABLE_1H_2H_ONLY';
    reason = `front-loaded edge: ${earlyBest.label} win ${pct(earlyBest.win_rate_pct)} avg ${signedPct(earlyBest.avg_pct)}; do not overhold`;
  } else if (
    best.win_rate_pct < 45 ||
    (best.win_rate_pct < 50 && best.avg_pct <= 0) ||
    (Number.isFinite(medMae) && medMae <= -1.0 && best.win_rate_pct < 55)
  ) {
    label = 'NO_TRADE_BAD_PATH';
    reason = `bad path/expectancy: best ${best.label} win ${pct(best.win_rate_pct)} avg ${signedPct(best.avg_pct)}, med MAE6h ${signedPct(medMae)}`;
  } else if (best.win_rate_pct <= 45 && best.avg_pct < 0) {
    label = 'FADE_RISK';
    reason = `alert direction loses often: best ${best.label} win ${pct(best.win_rate_pct)} avg ${signedPct(best.avg_pct)}`;
  }

  return {
    label,
    reason,
    best_horizon: best.label,
    best_win_rate_pct: best.win_rate_pct,
    best_avg_pct: best.avg_pct,
    n,
    path6h: summary.path6h || null,
  };
}

function maxWinRate1To6(summary) {
  const horizons = summary?.horizons || {};
  const vals = ['1h', '2h', '3h', '4h', '5h', '6h']
    .map(label => horizons[label])
    .filter(h => Number.isFinite(h?.n) && h.n >= Math.min(Number(summary?.n || 0), 8) && Number.isFinite(h.win_rate_pct))
    .map(h => h.win_rate_pct);
  return vals.length ? Math.max(...vals) : null;
}

function loadReport(reportPath = REPORT_PATH) {
  const report = readJson(reportPath, null);
  if (!report?.summaries) return null;
  const byKey = new Map(report.summaries.map(s => [s.key, s]));
  return { ...report, byKey };
}

// candidateKeys() prefers broad asset/type/flow buckets over the specific
// pattern key (by design, for live execution-context matching), so a lookup
// via qualityForAlert() can land on a bucket that mixes many unrelated setups
// together (e.g. asset_type:BTC|LONG_SETUP, n=85) instead of the one specific
// fade/inverse pattern (pattern:BTC_LONG_SETUP_INVERSE_SHORT_POSTFIX, n=6).
// Callers that need the pattern-specific path6h (not whatever broader bucket
// happened to match first) must use this instead of qualityForAlert().
function patternSummary(key, report = loadReport()) {
  if (!key || !report?.byKey) return null;
  return report.byKey.get(`pattern:${key}`) || null;
}

function qualityForAlert(alert, report = loadReport()) {
  if (!report?.byKey) return null;
  for (const key of candidateKeys(alert)) {
    const summary = report.byKey.get(key);
    if (!summary) continue;
    const classification = classifySummary(summary);
    if (!classification) continue;
    return {
      key,
      match_type: key.split(':')[0],
      generated_at: report.generated_at || null,
      window: report.window || null,
      ...classification,
      summary,
      presentation_only: true,
      changes_score_or_delivery: false,
    };
  }
  return null;
}

function formatTradeQualityLine(alert, report = loadReport()) {
  const q = qualityForAlert(alert, report);
  if (!q) return null;
  const p = q.path6h || {};
  const bits = [
    `Trade quality: ${q.label}`,
    `match ${q.key}`,
    `n=${q.n}`,
    `best ${q.best_horizon} ${pct(q.best_win_rate_pct)} avg ${signedPct(q.best_avg_pct)}`,
  ];
  const maxWin = maxWinRate1To6(q.summary);
  if (Number.isFinite(maxWin)) bits.push(`max 1–6h win ${pct(maxWin)}`);
  if (Number.isFinite(p.median_mfe_pct)) bits.push(`med MFE6h ${signedPct(p.median_mfe_pct)}`);
  if (Number.isFinite(p.median_mae_pct)) bits.push(`med MAE6h ${signedPct(p.median_mae_pct)}`);
  if (p.mfe_distribution) bits.push(`MFE6h p25/p75 ${signedPct(p.mfe_distribution.p25)}/${signedPct(p.mfe_distribution.p75)}`);
  if (p.mae_distribution) bits.push(`MAE6h p25/p75 ${signedPct(p.mae_distribution.p25)}/${signedPct(p.mae_distribution.p75)}`);
  if (Number.isFinite(p.episodes_mfe_beats_mae_pct)) bits.push(`MFE>|MAE| in ${pct(p.episodes_mfe_beats_mae_pct)} of episodes (${p.episodes_mfe_beats_mae_count}/${p.episodes_mfe_beats_mae_n})`);
  if (Number.isFinite(p.favorable_first_rate_pct)) bits.push(`fav-first ${pct(p.favorable_first_rate_pct)}`);
  bits.push(q.reason);
  bits.push('presentation-only; no score/delivery change');
  return `🎯 ${bits.join(' | ')}`;
}

module.exports = {
  REPORT_PATH,
  candidateKeys,
  classifySummary,
  maxWinRate1To6,
  loadReport,
  patternSummary,
  qualityForAlert,
  formatTradeQualityLine,
};
