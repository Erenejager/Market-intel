#!/usr/bin/env node
/*
  Phase 1d deterministic microstructure alerts.

  Transition-based, file-backed alerting. No LLM required.

  Reads:
  - data/microstructure-context.json (current)
  - data/microstructure-history.jsonl (previous snapshots)
  - data/phase1d-alert-state.json (dedupe/cooldown)

  Writes:
  - data/phase1d-alerts.jsonl
  - data/phase1d-alert-state.json

  Design principle:
  Emit directional microstructure events, not just BUY penalties.
*/

const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const hypothesisTracker = require('./hypothesis-tracker');
const patternClassifier = require('./pattern-classifier');
const tradeQuality = require('./trade-quality');

const ROOT = path.join(__dirname, '..');
const CURRENT_PATH = path.join(ROOT, 'data', 'microstructure-context.json');
const HISTORY_PATH = path.join(ROOT, 'data', 'microstructure-history.jsonl');
const ALERTS_PATH = path.join(ROOT, 'data', 'phase1d-alerts.jsonl');
const READINESS_SHADOW_PATH = path.join(ROOT, 'data', 'readiness-shadow.jsonl');
const STATE_PATH = path.join(ROOT, 'data', 'phase1d-alert-state.json');
const CONFIG_PATH = path.join(ROOT, 'config.json');
const EXTRAS_DIR = path.join(ROOT, 'data', 'extras');
const EMPIRICAL_WATCH_REPORT_PATH = path.join(ROOT, 'data', 'empirical-watch-report.json');
const ALERT_PRESENTATION_ACTIONS_PATH = path.join(ROOT, 'data', 'alert-presentation-actions.json');
const TELEGRAM_PATTERN_GATE_PATH = path.join(ROOT, 'data', 'telegram-pattern-gate.json');
const REGIME_CURRENT_PATH = path.join(ROOT, 'data', 'regime-current.json');
const PIPELINE_HEALTH_PATH = process.env.PHASE1D_PIPELINE_HEALTH_PATH || path.join(ROOT, 'data', 'pipeline-health.json');
const LLM_REVIEW_SCRIPT_PATH = path.join(__dirname, 'llm-review-alert.js');

const ASSETS = ['BTC', 'ETH', 'SOL'];
const DEFAULT_COOLDOWN_MS = 30 * 60 * 1000;
const TELEGRAM_DELIVERY_SEVERITIES = new Set(['HIGH']);
const TELEGRAM_BUCKET_CAP_WINDOW_MS = 6 * 60 * 60 * 1000;
const TELEGRAM_BUCKET_CAPS = {
  // High-frequency opportunity families. Keep Telegram useful while the
  // episode/lifecycle layer is still pending.
  ETH_INVERSE_SHORT_OPPORTUNITY: 2,
  SOL_INVERSE_LONG_OPPORTUNITY: 2,
  'PATTERN:ETH_LONGS_EXITING_BROAD_SHORT_PRESSURE_LONG_POSTFIX': 1,
  'PATTERN:SOL_SHORTS_COVERING_BROAD_SHORT_PRESSURE_INVERSE_SHORT_POSTFIX': 1,
  'PATTERN:ETH_LONG_SETUP_STRUCTURAL_BUYING_INVERSE_SHORT': 1,
  'PATTERN:ETH_LONG_SHADOW_SETUP_FORMING_INVERSE_SHORT': 1,
};
const ALERT_EPISODE_EXPIRY_MS = 6 * 60 * 60 * 1000;
const ALERT_EPISODE_MFE_HIT_PCT = 0.30;
const ALERT_EPISODE_ADVERSE_PCT = -0.50;
const ALERT_EPISODE_RECOVERY_CHECK_MS = 30 * 60 * 1000;
const ALERT_EPISODE_MIN_RECOVERY_RATIO = 0.30;
const ACTIVE_CONTEXT_SHADOW_MIN_SCORE = 70;
const ACTIVE_CONTEXT_EROSION_LIMIT = 8;
const ACTIVE_CONTEXT_HEALTH_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000;
const OPPOSITE_WATCH_EXPIRY_MS = 2 * 60 * 60 * 1000;
const ACTIVE_CONTEXT_STRESS_FLOORS_PCT = { BTC: 0.20, ETH: 0.25, SOL: 0.35 };
const GATE_VERSION = 'v0.2-regime-first';
const READINESS_INSTRUMENTATION_VERSION = 'v1-fields-only';
const BTC_WEAK_LEGACY_GATE = 'BTC_WEAK_PENALIZE_ALT_LONGS';
const BTC_WEAK_VETO_GATE = 'BTC_WEAK_VETO_ALT_LONGS';
const BTC_CONFIRMS_LEGACY_GATE = 'BTC_CONFIRMS_ALT_LONG_CONTEXT';
const BTC_PERMITS_GATE = 'BTC_PERMITS_ALT_LONG_OBSERVATION';
const MIN_ENABLED_MAX_WIN_RATE_1_TO_6_PCT = 70;
const MIN_PROVISIONAL_HIGH_MAX_WIN_RATE_1_TO_6_PCT = 65;
const MIN_PROVISIONAL_HIGH_POST_FIX_N = 8;
// 2026-07-01 redo: build-trade-quality-report.js was silently dropping every
// OPPORTUNITY_* alert (direction derived only from `type` LONG/SHORT prefix)
// and, separately, measuring the wrong side of fade_candidate alerts whose
// `type` is the natural/source direction rather than the traded one. Once
// both bugs were fixed, real 6h-path MFE/MAE became available per pattern.
// Gate: keep a pattern in Telegram only if, on a per-episode basis, the
// favorable excursion (MFE) beat the adverse one (|MAE|) in >=70% of
// independent (>=6h-spaced) episodes — not just on median/average, since a
// pattern can have a fine median while most individual episodes still lose.
// See data/trade-quality-report.json path6h.episodes_mfe_beats_mae_pct.
const MIN_MFE_BEATS_MAE_PCT = 70;
const ENABLED_WIN_RATE_EXEMPT_PATTERN_KEYS = new Set([
  // 2026-07-03: no static/manual Telegram exemptions. Pattern-gated watches
  // must be enabled in data/telegram-pattern-gate.json and must have a current
  // exact `pattern:<key>` trade-quality summary; missing exact evidence
  // suppresses Telegram instead of falling through to broader buckets.
]);

// Below MIN_MFE_BEATS_MAE_PCT on real 6h-path episodes, or no post-fix 6h-path
// evidence at all yet. Keep logged/tracked, but do not page Telegram unless a
// future review moves them back up with fresh evidence.
const DISABLED_TELEGRAM_WATCH_PATTERN_KEYS = new Set([
  'ETH_BTC_PERMITS_ALT_LONG_INVERSE_SHORT_POSTFIX', // 2026-07-02 last-24h audit: delivered path failed; disable pending fresh exact-pattern revalidation
  'BTC_LONG_SETUP_INVERSE_SHORT_POSTFIX', // 2026-07-02 last-24h audit: delivered path failed; disable pending fresh exact-pattern revalidation
  'ETH_LONG_BLOCKED_SELL_PRESSURE_INVERSE_SHORT_POSTFIX', // n=7, MFE>|MAE| 42.9%
  'SOL_SHORT_BLOCKED_SPOT_LED_INVERSE_LONG_POSTFIX', // n=6, MFE>|MAE| 50.0%
  'ETH_LONG_SETUP_STRUCTURAL_BUYING_INVERSE_SHORT', // n=24, MFE>|MAE| 62.5%, fat left tail to -4.15%
  'ETH_LONG_SHADOW_SETUP_FORMING_INVERSE_SHORT', // n=8, MFE>|MAE| 62.5%
  'ETH_LONGS_EXITING_BROAD_SHORT_PRESSURE_LONG_POSTFIX', // no post-fix 6h-path rows yet
  'SOL_SHORTS_COVERING_BROAD_SHORT_PRESSURE_INVERSE_SHORT_POSTFIX', // no post-fix 6h-path rows yet
]);
const DEFAULT_TELEGRAM_PATTERN_CAP = { cap: 2, window_ms: TELEGRAM_BUCKET_CAP_WINDOW_MS };

/*
  Readiness gate decision tree (GATE_VERSION v0.2-regime-first):
  1) Regime first — scores are only comparable inside a valid regime.
     BTC_WEAK_VETO_ALT_LONGS means local alt-long setup may exist, but the
     BTC regime invalidates it; numeric score cannot override this veto.
  2) Mechanism second — OI/CVD/funding explain why a valid-regime setup may
     have squeeze/fade potential. Thin OI findings stay in observation mode.
  3) Score last — score ranks setup quality only after regime/mechanism pass.
*/

function nowIso() { return new Date().toISOString(); }
function toNum(x) { const n = Number(x); return Number.isFinite(n) ? n : null; }
function round(x, d = 6) { return Number.isFinite(x) ? Number(x.toFixed(d)) : null; }
function pctChange(from, to) { return Number.isFinite(from) && from !== 0 && Number.isFinite(to) ? ((to - from) / from) * 100 : null; }
function readJson(file, fallback = null) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}
function readJsonl(file) {
  try { return fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(line => JSON.parse(line)); } catch { return []; }
}
function appendJsonl(file, rows) {
  if (!rows.length) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, rows.map(r => JSON.stringify(r)).join('\n') + '\n');
}
function fmtPct(x, d = 1) { return Number.isFinite(x) ? `${(x * 100).toFixed(d)}%` : 'n/a'; }
function fmtSignedPct(x, d = 3) { return Number.isFinite(x) ? `${x >= 0 ? '+' : ''}${x.toFixed(d)}%` : 'n/a'; }

let empiricalWatchReportCache = undefined;
let alertPresentationActionsCache = undefined;
let tradeQualityReportCache = undefined;
let telegramPatternGateCache = undefined;
let pipelineHealthCache = undefined;

function defaultTelegramPatternGate() {
  const patterns = {};
  for (const key of ENABLED_WIN_RATE_EXEMPT_PATTERN_KEYS) {
    patterns[key] = {
      status: 'enabled',
      source: 'phase1d_fallback_seed',
      telegram_cap: { ...DEFAULT_TELEGRAM_PATTERN_CAP },
    };
  }
  for (const key of DISABLED_TELEGRAM_WATCH_PATTERN_KEYS) {
    patterns[key] = { status: 'disabled', source: 'phase1d_fallback_seed' };
  }
  return { generated_at: null, source: 'fallback_hardcoded_sets', patterns };
}

function telegramPatternGate() {
  if (telegramPatternGateCache !== undefined) return telegramPatternGateCache;
  const gate = readJson(TELEGRAM_PATTERN_GATE_PATH, null);
  if (gate && gate.patterns && typeof gate.patterns === 'object') {
    telegramPatternGateCache = gate;
  } else {
    telegramPatternGateCache = defaultTelegramPatternGate();
  }
  return telegramPatternGateCache;
}

function telegramPatternGateEntry(alertOrKey) {
  const key = typeof alertOrKey === 'string' ? alertOrKey : telegramWatchPatternKey(alertOrKey);
  if (!key) return null;
  return telegramPatternGate().patterns?.[key] || null;
}

function telegramPatternStatus(alertOrKey) {
  return telegramPatternGateEntry(alertOrKey)?.status || null;
}

function tradeQualityReport() {
  if (tradeQualityReportCache !== undefined) return tradeQualityReportCache;
  const report = tradeQuality.loadReport();
  if (!report) {
    tradeQualityReportCache = null;
    return tradeQualityReportCache;
  }
  const generatedMs = Date.parse(report.generated_at || '');
  let ageDays = null;
  if (Number.isFinite(generatedMs)) ageDays = (Date.now() - generatedMs) / (24 * 60 * 60 * 1000);
  else {
    try { ageDays = (Date.now() - fs.statSync(tradeQuality.REPORT_PATH).mtimeMs) / (24 * 60 * 60 * 1000); } catch {}
  }
  tradeQualityReportCache = { ...report, _age_days: ageDays, _stale: Number.isFinite(ageDays) && ageDays > 3 };
  return tradeQualityReportCache;
}

function formatTradeQualityLine(alert) {
  const report = tradeQualityReport();
  const line = tradeQuality.formatTradeQualityLine(alert, report);
  if (!line) return null;
  const stale = report?._stale ? ` | STALE report ${report._age_days.toFixed(1)}d old` : '';
  return `${line}${stale}`;
}

function alertPresentationActions() {
  if (alertPresentationActionsCache !== undefined) return alertPresentationActionsCache;
  const config = readJson(ALERT_PRESENTATION_ACTIONS_PATH, null);
  alertPresentationActionsCache = config && typeof config === 'object' ? config : { actions: {}, asset_direction_overlays: {} };
  return alertPresentationActionsCache;
}

function pipelineHealth() {
  if (pipelineHealthCache !== undefined) return pipelineHealthCache;
  const health = readJson(PIPELINE_HEALTH_PATH, null);
  if (!health || typeof health !== 'object') {
    pipelineHealthCache = {
      status: 'DEGRADED',
      timestamp_utc: null,
      degraded_reasons: [`pipeline_health_file_missing_or_unreadable:${path.relative(ROOT, PIPELINE_HEALTH_PATH)}`],
      _hard_gate: true,
      _gate_reason: 'pipeline_health_missing',
    };
    return pipelineHealthCache;
  }
  const tsMs = Date.parse(health.timestamp_utc || health.generated_at || health.updated_at || '');
  const ageMinutes = Number.isFinite(tsMs) ? Math.max(0, (Date.now() - tsMs) / 60000) : null;
  const stale = !Number.isFinite(ageMinutes) || ageMinutes > 45;
  const status = health.status || 'UNKNOWN';
  pipelineHealthCache = {
    ...health,
    _age_minutes: Number.isFinite(ageMinutes) ? round(ageMinutes, 1) : null,
    _stale: stale,
    _hard_gate: stale || status !== 'OK',
    _gate_reason: stale ? 'pipeline_health_stale_or_unparseable' : status !== 'OK' ? 'pipeline_health_not_ok' : null,
  };
  return pipelineHealthCache;
}

function pipelineHealthGateDecision() {
  const health = pipelineHealth();
  if (!health?._hard_gate) return { blocked: false, health };
  const degradedReasons = Array.isArray(health.degraded_reasons) ? health.degraded_reasons : [];
  return {
    blocked: true,
    health,
    reason: 'pipeline_health_degraded_trade_delivery_blocked',
    status: health.status || 'UNKNOWN',
    gate_reason: health._gate_reason || null,
    age_minutes: health._age_minutes ?? null,
    health_timestamp_utc: health.timestamp_utc || null,
    degraded_reasons: degradedReasons.slice(0, 12),
    policy: 'telegram_suppressed_but_logged_and_tracked',
  };
}

function isPotentialTradeDeliveryAlert(alert) {
  if (!alert) return false;
  if (isInformationalSuppressedAlert(alert)) return false;
  return TELEGRAM_DELIVERY_SEVERITIES.has(alert.severity)
    || enabledByExplicitWinRateCandidate(alert)
    || alert.research_note?.type === 'N1_GATE_COST';
}

function applyPipelineHealthDeliveryGate(alerts, state) {
  const decision = pipelineHealthGateDecision();
  state.pipeline_health_delivery_gate = {
    checked_at: nowIso(),
    blocked: decision.blocked,
    status: decision.health?.status || null,
    health_timestamp_utc: decision.health?.timestamp_utc || null,
    age_minutes: decision.health?._age_minutes ?? null,
    reason: decision.gate_reason || null,
  };
  if (!decision.blocked) return decision;
  for (const alert of alerts) {
    if (!isPotentialTradeDeliveryAlert(alert)) continue;
    alert.pipeline_health_gate = {
      status: decision.status,
      reason: decision.gate_reason,
      health_timestamp_utc: decision.health_timestamp_utc,
      age_minutes: decision.age_minutes,
      degraded_reasons: decision.degraded_reasons,
      policy: 'block_trade_telegram_delivery_and_active_context_creation',
    };
    if (!alert.telegram_suppressed || isInformationalSuppressedAlert(alert)) {
      alert.telegram_suppressed = {
        reason: decision.reason,
        pipeline_health_status: decision.status,
        pipeline_health_reason: decision.gate_reason,
        pipeline_health_age_minutes: decision.age_minutes,
        pipeline_health_timestamp_utc: decision.health_timestamp_utc,
        degraded_reasons: decision.degraded_reasons,
        policy: decision.policy,
      };
    }
    alert.active_context_blocked_by_pipeline_health = {
      reason: decision.reason,
      pipeline_health_status: decision.status,
      pipeline_health_reason: decision.gate_reason,
    };
  }
  return decision;
}

function presentationKeyForAlert(alert) {
  return alert?.empirical_watch?.key || alert?.pattern?.key || null;
}

function presentationActionForAlert(alert) {
  const config = alertPresentationActions();
  const key = presentationKeyForAlert(alert);
  const action = key ? config.actions?.[key] || null : null;
  const overlayKey = alert?.asset && alert?.type ? `${alert.asset}:${alert.type}` : null;
  const overlay = overlayKey ? config.asset_direction_overlays?.[overlayKey] || null : null;
  if (!action && !overlay) return null;
  return { key, action, overlay };
}

function presentationActionLines(alert) {
  const resolved = presentationActionForAlert(alert);
  if (!resolved) return [];
  return [resolved.action?.line, resolved.overlay?.line].filter(Boolean);
}

function isTelegramSuppressedByPresentationAction(alert) {
  const resolved = presentationActionForAlert(alert);
  return resolved?.action?.telegram === 'suppress';
}

function telegramWatchPatternKey(alert) {
  return alert?.pattern?.key || alert?.empirical_watch?.key || alert?.research_note?.pattern_key || null;
}

function enabledByExplicitWinRateCandidate(alert) {
  return telegramPatternStatus(alert) === 'enabled';
}

function exactPatternQualityBlockReason(alert) {
  if (!enabledByExplicitWinRateCandidate(alert)) return null;
  const patternKey = telegramWatchPatternKey(alert);
  if (!patternKey) return 'trade_quality_exact_pattern_key_missing';
  const patternSummary = tradeQuality.patternSummary(patternKey, tradeQualityReport());
  if (!patternSummary) return 'trade_quality_exact_pattern_summary_missing';
  const patternPath = patternSummary.path6h || {};
  const mfeBeatsMaeN = patternPath.episodes_mfe_beats_mae_n;
  const mfeBeatsMaePct = patternPath.episodes_mfe_beats_mae_pct;
  if (!Number.isFinite(mfeBeatsMaeN) || mfeBeatsMaeN < 5 || !Number.isFinite(mfeBeatsMaePct)) {
    return 'trade_quality_exact_pattern_mfe_beats_mae_insufficient';
  }
  if (mfeBeatsMaePct < MIN_MFE_BEATS_MAE_PCT) {
    return 'trade_quality_exact_pattern_mfe_beats_mae_below_70';
  }
  return null;
}

function shouldSuppressByTradeQualityWinRate(alert, quality) {
  if (!quality?.summary) return false;
  if (telegramPatternStatus(alert) === 'disabled') return true;
  if (quality.label === 'NO_TRADE_BAD_PATH') return true;
  const path = quality.path6h || quality.summary?.path6h || {};
  const medMfe = path.median_mfe_pct;
  const medMae = path.median_mae_pct;
  const favFirst = path.favorable_first_rate_pct;
  if (
    quality.n >= 6 &&
    Number.isFinite(medMfe) &&
    Number.isFinite(medMae) &&
    Math.abs(medMae) > Math.max(0.75, medMfe * 1.25) &&
    (!Number.isFinite(favFirst) || favFirst < 50)
  ) return true;
  // Per-episode reward-vs-risk safety net: median-based checks above can miss
  // a pattern where MFE beats |MAE| in barely half of episodes (a coin flip)
  // even though the median looks fine. Applies even to explicitly-exempt
  // patterns so this can't go stale the way the static lists above did.
  // Must use patternSummary() (exact `pattern:<key>` bucket), not `path` from
  // the passed-in `quality` — qualityForAlert()/candidateKeys() prefer
  // broader asset/type/flow buckets that mix unrelated setups together and
  // would dilute this specific pattern's real 6h-path evidence.
  const exactPatternBlockReason = exactPatternQualityBlockReason(alert);
  if (exactPatternBlockReason) return true;
  const patternKey = telegramWatchPatternKey(alert);
  const patternPath = tradeQuality.patternSummary(patternKey, tradeQualityReport())?.path6h;
  const mfeBeatsMaeN = patternPath?.episodes_mfe_beats_mae_n;
  const mfeBeatsMaePct = patternPath?.episodes_mfe_beats_mae_pct;
  if (Number.isFinite(mfeBeatsMaeN) && mfeBeatsMaeN >= 5 && Number.isFinite(mfeBeatsMaePct) && mfeBeatsMaePct < MIN_MFE_BEATS_MAE_PCT) {
    return true;
  }
  if (enabledByExplicitWinRateCandidate(alert)) return false;
  // A win rate >70% computed mostly/entirely from the pre-fix oi_price_regime
  // freeze (2026-06-09 to 2026-06-20T20:15Z) is not trustworthy regardless of
  // its numeric value — suppress until enough post-fix episodes accumulate.
  if (quality.summary.oi_data_quarantined) return true;
  const maxWin = tradeQuality.maxWinRate1To6(quality.summary);
  const provisionalHighAllowed = alert.severity === 'HIGH'
    && quality.summary.post_fix_only_low_n
    && Number(quality.summary.post_fix_n || 0) >= MIN_PROVISIONAL_HIGH_POST_FIX_N
    && Number.isFinite(maxWin)
    && maxWin >= MIN_PROVISIONAL_HIGH_MAX_WIN_RATE_1_TO_6_PCT;
  if (provisionalHighAllowed) return false;
  return Number.isFinite(maxWin) && maxWin <= MIN_ENABLED_MAX_WIN_RATE_1_TO_6_PCT;
}

function empiricalWatchReport() {
  if (empiricalWatchReportCache !== undefined) return empiricalWatchReportCache;
  const report = readJson(EMPIRICAL_WATCH_REPORT_PATH, null);
  if (!report?.summaries || !Array.isArray(report.summaries)) {
    empiricalWatchReportCache = null;
    return empiricalWatchReportCache;
  }
  const generatedMs = Date.parse(report.generated_at || '');
  let ageDays = null;
  if (Number.isFinite(generatedMs)) ageDays = (Date.now() - generatedMs) / (24 * 60 * 60 * 1000);
  else {
    try { ageDays = (Date.now() - fs.statSync(EMPIRICAL_WATCH_REPORT_PATH).mtimeMs) / (24 * 60 * 60 * 1000); } catch {}
  }
  empiricalWatchReportCache = { ...report, _age_days: ageDays, _stale: Number.isFinite(ageDays) && ageDays > 7 };
  return empiricalWatchReportCache;
}
function empiricalWatchSummary(key) {
  if (!key) return null;
  const report = empiricalWatchReport();
  return report?.summaries?.find(s => s.key === key) || null;
}
function formatHorizonStat(h) {
  if (!h || !Number.isFinite(h.n) || h.n <= 0) return null;
  return `n=${h.n} ${fmtPct(h.hit_rate)} avg ${fmtSignedPct(h.avg_pct)}`;
}
function formatDynamicEmpiricalLine(alert) {
  const key = alert.empirical_watch?.key || alert.pattern?.key || null;
  const summary = empiricalWatchSummary(key);
  if (!summary) return null;
  const report = empiricalWatchReport();
  const h1 = formatHorizonStat(summary.horizons?.['1h']);
  const h4 = formatHorizonStat(summary.horizons?.['4h']);
  const h24 = formatHorizonStat(summary.horizons?.['24h']);
  const parts = [`History now: ${summary.key}`, `status ${summary.status || 'UNKNOWN'}`, `n=${summary.n ?? 'n/a'}`];
  if (h1) parts.push(`1h ${h1}`);
  if (h4) parts.push(`4h ${h4}`);
  if (h24 && Number(summary.horizons?.['24h']?.n || 0) >= 8) parts.push(`24h ${h24}`);
  if (report?._stale) parts.push(`STALE report ${report._age_days.toFixed(1)}d old`);
  return `📊 ${parts.join(' | ')} — presentation-only; no delivery/gating impact.`;
}
function formatBtcRegimeShadowLine() {
  const r = readJson(REGIME_CURRENT_PATH, null);
  if (!r?.version || !r?.state) return null;
  const sq = typeof r.squeeze_risk === 'string' ? r.squeeze_risk : r.squeeze_risk?.state;
  const fl = typeof r.flush_risk === 'string' ? r.flush_risk : r.flush_risk?.state;
  const bits = [`BTC regime shadow: ${r.state}`];
  if (sq) bits.push(`squeeze ${sq.replace(/^UNKNOWN_/, 'UNKNOWN ')}`);
  if (fl) bits.push(`flush ${fl.replace(/^UNKNOWN_/, 'UNKNOWN ')}`);
  bits.push('behavior unchanged');
  return `🧭 ${bits.join(' | ')}`;
}
function formatBtcShortFreshShortsHorizonLine(alert) {
  const sm = alert.readiness_shadow?.source_metrics || {};
  if (alert.asset !== 'BTC' || alert.type !== 'SHORT_CONFIRMED' || sm.oi_price_regime !== 'FRESH_SHORTS') return null;
  return '⏱ BTC SHORT+FRESH_SHORTS horizon: recent locked cohort was weaker at 30m/1h (56.3%), improved at 2h (75.0%), strongest at 24h (100.0% on n=14 valid 24h rows, avg +3.038%). Presentation-only.';
}

let sourceAlertCache = null;
function sourceAlerts() {
  if (!sourceAlertCache) sourceAlertCache = readJsonl(ALERTS_PATH);
  return sourceAlertCache;
}

function findSourceAlertForContext(ctx) {
  if (!ctx?.activated_at || !ctx?.source_type) return null;
  const rows = sourceAlerts();
  if (ctx.source_alert_id) {
    const byId = rows.find(a => a.id === ctx.source_alert_id);
    if (byId) return byId;
  }
  const activatedMs = Date.parse(ctx.activated_at || '');
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    const a = rows[i];
    if (a.asset !== ctx.asset && ctx.asset) continue;
    if (a.type !== ctx.source_type) continue;
    const alertMs = Date.parse(a.timestamp_utc || '');
    if (Number.isFinite(activatedMs) && Number.isFinite(alertMs)) {
      if (Math.abs(alertMs - activatedMs) > 1000) continue;
    } else if (a.timestamp_utc !== ctx.activated_at) continue;
    if (ctx.fingerprint && a.fingerprint && a.fingerprint !== ctx.fingerprint) continue;
    return a;
  }
  return null;
}

function watchOnlyOrPatternBlockedSource(sourceAlert) {
  return !!(
    sourceAlert?.active_context_blocked_by_pattern ||
    sourceAlert?.pattern?.active_context === false ||
    sourceAlert?.empirical_watch?.active_context === false
  );
}

function healthDeliveryScopeForContext(ctx) {
  const sourceAlert = findSourceAlertForContext(ctx);
  if (!sourceAlert) return { source_alert_found: false, log_only: false, reason: 'source_alert_not_found_keep_default_delivery' };
  if (watchOnlyOrPatternBlockedSource(sourceAlert)) {
    return {
      source_alert_found: true,
      source_alert_id: sourceAlert.id || null,
      log_only: true,
      reason: 'watch_only_or_pattern_blocked_parent_context_health_log_only',
      parent_pattern_key: sourceAlert.pattern?.key || sourceAlert.active_context_blocked_by_pattern?.key || sourceAlert.empirical_watch?.key || null,
    };
  }
  return { source_alert_found: true, source_alert_id: sourceAlert.id || null, log_only: false, reason: 'production_parent_keep_default_delivery' };
}
function market(ctx, asset) { return ctx?.markets?.[asset] || null; }
function flow(m) { return m?.flow_consensus?.current || m?.flow_quality?.classification || 'UNKNOWN'; }
function flowConfirmed(m) { return m?.flow_consensus?.confirmed === true; }
function flowStreak(m) { return Number(m?.flow_consensus?.current_streak || 0); }
function alertConfirmed(m) {
  // For alerts, require a consecutive streak. flow_consensus.confirmed can also
  // be true via 3-of-4 dominance, which is useful context but too loose here.
  return flowConfirmed(m) && flowStreak(m) >= 3;
}
function fbcState(m) { return m?.failed_breakout_counter?.reclaim_retest_state || null; }
function price(m) { return toNum(m?.backpack?.order_book?.mid); }
function isBullishFlow(f) { return ['STRUCTURAL_BUYING', 'SPOT_LED_ACCUMULATION'].includes(f); }
function isBearishFlow(f) { return ['SELL_PRESSURE', 'DISTRIBUTION'].includes(f); }
function isLeveragedChase(f) { return f === 'LEVERAGED_CHASE'; }
function nearFailedLevel(m) { return m?.failed_breakout_counter?.near_failed_level === true; }
function cvdDivergenceType(m) { return m?.cvd_divergence?.type || 'NONE'; }
function normalizeBtcGate(gate) {
  if (gate === BTC_WEAK_LEGACY_GATE) return BTC_WEAK_VETO_GATE;
  if (gate === BTC_CONFIRMS_LEGACY_GATE) return BTC_PERMITS_GATE;
  return gate;
}
function isBtcWeakVeto(gate) { return normalizeBtcGate(gate) === BTC_WEAK_VETO_GATE; }
function btcGate(m) { return normalizeBtcGate(m?.btc_flow_gate?.classification || null); }
function compactDiagnostics(m) {
  const fq = m?.flow_quality || {};
  const fc = m?.flow_consensus || {};
  const fbc = m?.failed_breakout_counter || {};
  return {
    price: round(price(m), 6),
    flow: flow(m),
    flow_confirmed: flowConfirmed(m),
    flow_streak: flowStreak(m),
    flow_history: fc.history || [],
    spot_cvd: fq.spot_cvd_notional ?? null,
    futures_cvd: fq.futures_cvd_notional ?? null,
    spot_buy_share: fq.spot_taker_buy_share ?? null,
    futures_buy_share: fq.futures_taker_buy_share ?? null,
    cvd_divergence: cvdDivergenceType(m),
    failed_level: fbc.trigger_price ?? null,
    reclaim_retest_state: fbc.reclaim_retest_state ?? null,
    near_failed_level: fbc.near_failed_level ?? null,
    penalty_active: fbc.penalty_active ?? null,
    btc_gate: btcGate(m),
  };
}

function loadExtras() {
  return {
    fearGreed: readJson(path.join(EXTRAS_DIR, 'crypto-fear-greed.json'), null),
    usdIndex: readJson(path.join(EXTRAS_DIR, 'usd-index.json'), null),
    yields: readJson(path.join(EXTRAS_DIR, 'yields.json'), null),
    vix: readJson(path.join(EXTRAS_DIR, 'vix.json'), null),
  };
}

function freshnessMs(obj) {
  const ts = Date.parse(obj?.timestamp_utc || '');
  return Number.isFinite(ts) ? Date.now() - ts : null;
}

function macroContext(extras) {
  const vix = toNum(extras?.vix?.vix?.value);
  const usd = toNum(extras?.usdIndex?.usd_index?.value);
  const dgs10 = toNum(extras?.yields?.yields?.dgs10?.value);
  const t10yie = toNum(extras?.yields?.yields?.t10yie?.value);
  const fearGreed = toNum(extras?.fearGreed?.fear_greed?.value);
  const fearGreedLabel = extras?.fearGreed?.fear_greed?.value_classification || null;
  const stale = {
    vix: freshnessMs(extras?.vix) !== null && freshnessMs(extras?.vix) > 24 * 60 * 60 * 1000,
    usd: freshnessMs(extras?.usdIndex) !== null && freshnessMs(extras?.usdIndex) > 7 * 24 * 60 * 60 * 1000,
    yields: freshnessMs(extras?.yields) !== null && freshnessMs(extras?.yields) > 7 * 24 * 60 * 60 * 1000,
    fearGreed: freshnessMs(extras?.fearGreed) !== null && freshnessMs(extras?.fearGreed) > 36 * 60 * 60 * 1000,
  };
  let regime = 'NEUTRAL';
  if (vix !== null && vix >= 30) regime = 'SEVERE_RISK_OFF';
  else if ((vix !== null && vix >= 20) || (usd !== null && usd >= 120) || (dgs10 !== null && dgs10 >= 4.75)) regime = 'RISK_OFF';
  else if ((vix !== null && vix < 20) && (usd === null || usd < 120)) regime = 'BENIGN';
  return { vix, usd, dgs10, t10yie, real_yield_proxy: dgs10 !== null && t10yie !== null ? round(dgs10 - t10yie, 4) : null, fear_greed: fearGreed, fear_greed_label: fearGreedLabel, regime, stale };
}

function fundingCrowding(m) {
  const rates = Array.isArray(m?.cross_exchange_positioning?.rates) ? m.cross_exchange_positioning.rates : [];
  const freshRates = rates.map(r => ({ venue: r.venue, rate: toNum(r.rate), quality: r.quality })).filter(r => r.rate !== null && r.quality !== 'DEGRADED');
  const positive = freshRates.filter(r => r.rate > 0).length;
  const negative = freshRates.filter(r => r.rate < 0).length;
  const avg = freshRates.length ? freshRates.reduce((sum, r) => sum + r.rate, 0) / freshRates.length : null;
  let classification = m?.cross_exchange_positioning?.classification || 'UNKNOWN';
  if (freshRates.length >= 2) {
    if (positive >= 2) classification = 'BROAD_POSITIVE_FUNDING';
    else if (negative >= 2) classification = 'BROAD_SHORT_PRESSURE';
    else classification = 'MIXED';
  }
  return { classification, positive, negative, fresh_venues: freshRates.length, avg_rate: avg === null ? null : round(avg, 8), rates: freshRates };
}

function orderBookImbalance(m) {
  const bands = m?.backpack?.order_book?.depth_bands || {};
  const b10 = toNum(bands['10bps']?.imbalance);
  const b25 = toNum(bands['25bps']?.imbalance);
  const b50 = toNum(bands['50bps']?.imbalance);
  const primary = b25 ?? b10 ?? b50;
  return { b10, b25, b50, primary };
}

function readinessFlowScore(direction, f, confirmed, streak, components, reasons, hardGates) {
  const bullish = isBullishFlow(f);
  const bearish = isBearishFlow(f);
  if (direction === 'LONG') {
    if (confirmed && bearish) hardGates.flow_opposes_direction = `confirmed bearish flow ${f}`;
    if (confirmed && f === 'STRUCTURAL_BUYING') { components.flow = 30; reasons.push('confirmed structural buying'); }
    else if (confirmed && f === 'SPOT_LED_ACCUMULATION') { components.flow = 28; reasons.push('confirmed spot-led accumulation'); }
    else if (bullish && streak === 2) { components.flow = 15; reasons.push('bullish flow building streak 2'); }
    else if (bullish && streak === 1) { components.flow = 6; reasons.push('bullish flow initial streak 1'); }
    else components.flow = 0;
  } else {
    if (confirmed && bullish) hardGates.flow_opposes_direction = `confirmed bullish flow ${f}`;
    if (confirmed && f === 'SELL_PRESSURE') { components.flow = 30; reasons.push('confirmed sell pressure'); }
    else if (confirmed && f === 'DISTRIBUTION') { components.flow = 28; reasons.push('confirmed distribution'); }
    else if (bearish && streak === 2) { components.flow = 15; reasons.push('bearish flow building streak 2'); }
    else if (bearish && streak === 1) { components.flow = 6; reasons.push('bearish flow initial streak 1'); }
    else components.flow = 0;
  }
}

function computeReadinessShadow(asset, direction, m, extras, btcGateState = null, timestampUtc = null) {
  const components = {};
  const hard_gates = {};
  const reasons = [];
  const missing_metrics = [];
  if (!m) {
    return { role: 'phase2_shadow_no_alert_impact', version: 'v0', timestamp_utc: timestampUtc || nowIso(), asset, direction, score: 0, effective_score: 0, state: 'SHADOW_BLOCKED', hard_gates: { missing_market: true }, components, reasons: ['missing market context'], missing_metrics, note: 'Shadow-only. Does not affect alert type, severity, delivery, active contexts, or cooldown.' };
  }

  const f = flow(m);
  const confirmed = alertConfirmed(m);
  const streak = flowStreak(m);
  readinessFlowScore(direction, f, confirmed, streak, components, reasons, hard_gates);

  const oi = m?.oi_price_regime?.classification || null;
  if (!oi) missing_metrics.push('oi_price_regime.classification');
  if (direction === 'LONG') {
    components.oi_price_regime = ({ FRESH_SHORTS: 20, FRESH_LONGS: 12, SHORTS_COVERING: 8, LONGS_EXITING: -12, NEUTRAL: 0 })[oi] ?? 0;
  } else {
    components.oi_price_regime = ({ FRESH_LONGS: 20, LONGS_EXITING: 12, FRESH_SHORTS: 6, SHORTS_COVERING: -12, NEUTRAL: 0 })[oi] ?? 0;
  }
  if (oi) reasons.push(`OI regime ${oi}: ${components.oi_price_regime >= 0 ? '+' : ''}${components.oi_price_regime}`);

  const cvd = cvdDivergenceType(m);
  const nearLevel = nearFailedLevel(m);
  if (direction === 'LONG') {
    if (cvd === 'SPOT_POSITIVE_FUTURES_NEGATIVE') components.cvd = 15;
    else if (cvd === 'NONE') components.cvd = 10;
    else if (cvd === 'SPOT_NEGATIVE_FUTURES_POSITIVE') {
      components.cvd = nearLevel ? 0 : -10;
      if (nearLevel) hard_gates.cvd_against_direction_near_level = cvd;
    } else components.cvd = 0;
  } else {
    if (cvd === 'SPOT_NEGATIVE_FUTURES_POSITIVE') components.cvd = 15;
    else if (cvd === 'NONE') components.cvd = 10;
    else if (cvd === 'SPOT_POSITIVE_FUTURES_NEGATIVE') {
      components.cvd = nearLevel ? 0 : -10;
      if (nearLevel) hard_gates.cvd_against_direction_near_level = cvd;
    } else components.cvd = 0;
  }
  reasons.push(`CVD ${cvd}: ${components.cvd >= 0 ? '+' : ''}${components.cvd}`);

  const crowd = fundingCrowding(m);
  if (!crowd.fresh_venues) missing_metrics.push('cross_exchange_positioning.rates');
  if (direction === 'LONG') {
    if (crowd.classification === 'BROAD_SHORT_PRESSURE') components.funding_crowding = 10;
    else if (crowd.classification === 'MIXED') components.funding_crowding = 3;
    else if (crowd.classification === 'BROAD_POSITIVE_FUNDING') components.funding_crowding = -8;
    else components.funding_crowding = 0;
  } else {
    if (crowd.classification === 'BROAD_POSITIVE_FUNDING') components.funding_crowding = 10;
    else if (crowd.classification === 'MIXED') components.funding_crowding = 3;
    else if (crowd.classification === 'BROAD_SHORT_PRESSURE') components.funding_crowding = -8;
    else components.funding_crowding = 0;
  }
  reasons.push(`Funding ${crowd.classification}: ${components.funding_crowding >= 0 ? '+' : ''}${components.funding_crowding}`);

  const gate = btcGate(m);
  const rel = toNum(m?.binance?.relative_strength?.change_24h_pct);
  if (asset !== 'BTC' && rel === null) missing_metrics.push('binance.relative_strength.change_24h_pct');
  components.btc_relative = 0;
  if (direction === 'LONG') {
    if (asset !== 'BTC' && isBtcWeakVeto(gate)) {
      hard_gates.btc_weak_veto_alt_longs = BTC_WEAK_VETO_GATE;
      reasons.push('BTC_WEAK_VETO_ALT_LONGS: local setup present but alt-long regime invalid');
    }
    if (gate === BTC_PERMITS_GATE) components.btc_relative = 10;
    else if (asset !== 'BTC' && rel !== null && rel > 0 && isBullishFlow(f)) components.btc_relative = 5;
    else if (!gate) components.btc_relative = 3;
    else if (gate === 'BTC_STRONG_ALT_NOT_FOLLOWING') components.btc_relative = -6;
    else components.btc_relative = 0;
  } else {
    if (asset !== 'BTC' && gate === 'BTC_STRONG_ALT_NOT_FOLLOWING') components.btc_relative = 10;
    else if (!gate) components.btc_relative = 3;
    else if (asset !== 'BTC' && rel !== null && rel > 0 && isBullishFlow(f)) components.btc_relative = -6;
    else components.btc_relative = 0;
  }

  const ob = orderBookImbalance(m);
  if (ob.primary === null) missing_metrics.push('backpack.order_book.depth_bands imbalance');
  if (direction === 'LONG') components.liquidity = ob.primary === null ? 0 : ob.primary > 0.03 ? 5 : ob.primary < -0.03 ? -5 : 0;
  else components.liquidity = ob.primary === null ? 0 : ob.primary < -0.03 ? 5 : ob.primary > 0.03 ? -5 : 0;

  const macro = macroContext(extras);
  if (macro.vix === null) missing_metrics.push('extras.vix.vix.value');
  if (direction === 'LONG') {
    if (macro.vix !== null && macro.vix >= 30 && asset !== 'PAXG') hard_gates.macro_severe_risk_off = `VIX ${macro.vix}`;
    if (macro.regime === 'BENIGN') components.macro = 5;
    else if (macro.regime === 'NEUTRAL') components.macro = 2;
    else components.macro = -5;
  } else {
    if (macro.regime === 'SEVERE_RISK_OFF' || macro.regime === 'RISK_OFF') components.macro = 5;
    else if (macro.regime === 'NEUTRAL') components.macro = 2;
    else components.macro = -5;
  }

  const fbc = m?.failed_breakout_counter || {};
  if (direction === 'LONG') {
    const lastFailedTs = Date.parse(fbc.last_failed_candle_start || '');
    // Conservative fallback for old/malformed state: missing/invalid means recent,
    // so stale data does not silently lift the failed-breakout hard gate.
    const lastFailedAgeMs = Number.isFinite(lastFailedTs) ? Date.now() - lastFailedTs : 0;
    const staleFailedBreakout = lastFailedAgeMs > 12 * 60 * 60 * 1000;
    const failedBreakoutFlowException = flowConfirmed(m) && (streak >= 2 || f === 'STRUCTURAL_BUYING');
    if (fbc.penalty_active === true && fbc.near_failed_level === true && !staleFailedBreakout && !failedBreakoutFlowException) hard_gates.active_failed_breakout_penalty = true;
    if (fbc.penalty_active === true) components.failed_breakout_time = 0;
    else if (!fbc.trigger_price || fbc.deactivation_event) components.failed_breakout_time = 5;
    else if (fbc.near_failed_level) components.failed_breakout_time = 1;
    else components.failed_breakout_time = 5;
  } else {
    if (['RECLAIMED_FAILED_LEVEL', 'RETESTING_RECLAIMED_LEVEL', 'RETEST_HELD'].includes(fbc.reclaim_retest_state)) hard_gates.clean_bullish_reclaim = fbc.reclaim_retest_state;
    if (fbc.reclaim_retest_state === 'RETEST_FAILED') components.failed_breakout_time = 5;
    else if (!fbc.trigger_price) components.failed_breakout_time = 2;
    else components.failed_breakout_time = 2;
  }

  const contextQuality = m?.context_data_quality || null;
  if (m.data_quality === 'DEGRADED') hard_gates.stale_or_degraded_microstructure = m.data_quality;
  if (contextQuality && contextQuality !== 'OK') {
    hard_gates.stale_or_degraded_microstructure_context = {
      data_quality: contextQuality,
      reasons: (m.context_degraded_reasons || []).slice(0, 5),
    };
  }

  let score = Math.max(0, Math.min(100, Math.round(Object.values(components).reduce((sum, v) => sum + (Number(v) || 0), 0))));
  let cap = 100;
  if (!confirmed && streak <= 1) cap = Math.min(cap, 39);
  if (!confirmed && streak === 2) cap = Math.min(cap, 69);
  if (cap < 100) reasons.push(`flow streak cap applied: max ${cap}`);
  score = Math.min(score, cap);

  const blocked = Object.keys(hard_gates).length > 0;
  const effectiveScore = blocked ? 0 : score;
  let shadowState = 'SHADOW_NO_SETUP';
  if (blocked) shadowState = 'SHADOW_BLOCKED';
  else if (effectiveScore >= 70) shadowState = 'SHADOW_CONFIRMED';
  else if (effectiveScore >= 40) shadowState = 'SHADOW_SETUP_FORMING';
  else shadowState = 'SHADOW_NO_SETUP';
  if (!blocked && !isBullishFlow(f) && !isBearishFlow(f)) reasons.push('mixed_or_choppy_flow');

  return {
    role: 'phase2_shadow_no_alert_impact',
    version: 'v0',
    timestamp_utc: timestampUtc || nowIso(),
    asset,
    direction,
    score,
    effective_score: effectiveScore,
    state: shadowState,
    setup_detected: score >= 40,
    regime_valid: !hard_gates.btc_weak_veto_alt_longs,
    blocked_by: hard_gates.btc_weak_veto_alt_longs || null,
    gate_version: GATE_VERSION,
    decision_order: 'regime -> mechanism -> score',
    hard_gates,
    components,
    reasons,
    missing_metrics,
    source_metrics: {
      flow: f,
      flow_confirmed: flowConfirmed(m),
      alert_confirmed: confirmed,
      flow_streak: streak,
      oi_price_regime: oi,
      cvd_divergence: cvd,
      cross_exchange_positioning: crowd,
      btc_gate: gate,
      btc_gate_weak_streak: btcGateState?.weak_streak ?? null,
      relative_strength_24h_pct: rel,
      order_book_imbalance: ob,
      macro,
      failed_breakout: {
        trigger_price: fbc.trigger_price ?? null,
        near_failed_level: fbc.near_failed_level ?? null,
        penalty_active: fbc.penalty_active ?? null,
        last_failed_candle_start: fbc.last_failed_candle_start ?? null,
        stale_hard_gate_12h: direction === 'LONG' && fbc.penalty_active === true ? (Number.isFinite(Date.parse(fbc.last_failed_candle_start || '')) ? Date.now() - Date.parse(fbc.last_failed_candle_start) > 12 * 60 * 60 * 1000 : false) : null,
        flow_exception_lifted_hard_gate: direction === 'LONG' && fbc.penalty_active === true ? (flowConfirmed(m) && (streak >= 2 || f === 'STRUCTURAL_BUYING')) : null,
        reclaim_retest_state: fbc.reclaim_retest_state ?? null,
      },
      long_horizon_regime: m?.long_horizon_regime ? {
        ...m.long_horizon_regime,
        readiness_instrumentation_version: READINESS_INSTRUMENTATION_VERSION,
      } : null,
    },
    note: 'Shadow-only. Does not affect alert type, severity, delivery, active contexts, or cooldown.',
  };
}

function directionFromAlertForReadiness(alert) {
  if (alert.research_note?.source_direction) return alert.research_note.source_direction;
  if (['LONG_CONFIRMED', 'LONG_SETUP', 'RETEST_HELD', 'RETESTING_RECLAIMED_LEVEL'].includes(alert.type)) return 'LONG';
  if (['SHORT_CONFIRMED', 'SHORT_SETUP', 'SHORT_CAUTION', 'RETEST_FAILED'].includes(alert.type)) return 'SHORT';
  if (alert.type === 'LONG_INVALIDATED') return 'LONG';
  if (alert.type === 'SHORT_INVALIDATED') return 'SHORT';
  return null;
}

function readinessDivergence(alert, readiness) {
  if (!readiness) return null;
  const confirmedAlert = alert.type.includes('CONFIRMED');
  if (['SHADOW_NO_SETUP', 'SHADOW_BLOCKED'].includes(readiness.state)) return 'diverges_from_alert';
  if (confirmedAlert && readiness.state === 'SHADOW_SETUP_FORMING') return 'forming_not_confirmed';
  return null;
}

function computeBtc4hChange(history, current) {
  const currentPrice = price(market(current, 'BTC'));
  const currentTs = Date.parse(current?.timestamp_utc || '');
  if (currentPrice === null || !Number.isFinite(currentTs)) return null;
  const targetTs = currentTs - 4 * 60 * 60 * 1000;
  let closest = null;
  let closestDistance = Infinity;
  for (const row of history || []) {
    const ts = Date.parse(row?.timestamp_utc || '');
    const p = price(market(row, 'BTC'));
    if (!Number.isFinite(ts) || p === null || ts > currentTs) continue;
    const distance = Math.abs(ts - targetTs);
    if (distance < closestDistance) {
      closest = { ts, price: p };
      closestDistance = distance;
    }
  }
  if (!closest || closestDistance > 90 * 60 * 1000) return null;
  return round(((currentPrice - closest.price) / closest.price) * 100, 3);
}

function computeLateLag(history, current, asset, direction) {
  const currentTs = Date.parse(current?.timestamp_utc || '');
  const currentP = price(market(current, asset));
  if (!Number.isFinite(currentTs) || currentP === null) return null;
  const windowStart = currentTs - 4 * 60 * 60 * 1000;
  const prices = (history || [])
    .filter(row => { const ts = Date.parse(row?.timestamp_utc || ''); return Number.isFinite(ts) && ts >= windowStart && ts <= currentTs; })
    .map(row => ({ ts: Date.parse(row.timestamp_utc), p: price(market(row, asset)) }))
    .filter(x => x.p !== null);
  prices.push({ ts: currentTs, p: currentP });
  if (prices.length < 4) return null;
  const extreme = direction === 'LONG'
    ? prices.reduce((b, x) => x.p > b.p ? x : b)
    : prices.reduce((b, x) => x.p < b.p ? x : b);
  return Math.round((currentTs - extreme.ts) / 60000);
}

function attachLateLag(alerts, history, current) {
  for (const alert of alerts) {
    if (!ASSETS.includes(alert.asset)) continue;
    const direction = directionFromAlertForReadiness(alert);
    if (!direction) continue;
    const lag = computeLateLag(history, current, alert.asset, direction);
    if (lag !== null) alert.diagnostics = Object.assign({}, alert.diagnostics, { late_lag_min: lag });
  }
}

function attachBtcLongHorizonContext(readiness, current, asset) {
  if (!readiness?.source_metrics || asset === 'BTC') return;
  const btcLongHorizon = market(current, 'BTC')?.long_horizon_regime || null;
  if (btcLongHorizon) {
    readiness.source_metrics.btc_long_horizon_regime = {
      ...btcLongHorizon,
      readiness_instrumentation_version: READINESS_INSTRUMENTATION_VERSION,
    };
  }
}

function attachReadiness(alerts, current, extras, state, btc4hChange = null) {
  for (const alert of alerts) {
    const direction = directionFromAlertForReadiness(alert);
    if (!direction || !ASSETS.includes(alert.asset)) continue;
    const readiness = computeReadinessShadow(alert.asset, direction, market(current, alert.asset), extras, state.btc_gate_state?.[alert.asset], current.timestamp_utc || alert.timestamp_utc);
    attachBtcLongHorizonContext(readiness, current, alert.asset);
    readiness.divergence = readinessDivergence(alert, readiness);
    readiness.regime = patternClassifier.buildRegimeFields({ alert, readiness, btc4hChange });
    alert.readiness_shadow = readiness;
    alert.regime = readiness.regime;
    if (direction === 'LONG' && alert.asset !== 'BTC' && readiness.hard_gates?.btc_weak_veto_alt_longs && alert.research_note?.type !== 'NONTELEGRAM_OPPORTUNITY') {
      alert.telegram_suppressed = { reason: 'btc_weak_veto_alt_longs' };
      if (alert.type === 'LONG_CONFIRMED' && Number(readiness.score || 0) >= ACTIVE_CONTEXT_SHADOW_MIN_SCORE) {
        alert.research_note = {
          type: 'BTC_WEAK_VETO_INFO',
          reason: 'High-score alt LONG detected but regime vetoed by BTC weakness; informational log only',
        };
      }
    }
    if (patternClassifier.shouldMarkN1GateCost({ alert, readiness, btc4hChange })) {
      alert.research_note = {
        type: 'N1_GATE_COST',
        reason: 'SHORT 50-69 below prior >=70 shadow-confirmed tier in bearish regime; delivered contexts remain health-monitored',
      };
    }
  }
}

function longHorizonDownStack(regime, { return7dMax, distance5dMax }) {
  return !!(
    regime?.trend_4h === 'DOWN' &&
    Number(regime?.return_7d_pct) < return7dMax &&
    Number(regime?.distance_from_5d_sma_pct) < distance5dMax
  );
}

function btcSelfRegimeDownCandidate(current) {
  const btc = market(current, 'BTC');
  const regime = btc?.long_horizon_regime || null;
  const oi = btc?.oi_price_regime || null;
  return {
    active: !!(
      longHorizonDownStack(regime, { return7dMax: -10, distance5dMax: -3 }) &&
      Number(oi?.oi_change_30m) < 0 &&
      Number(oi?.oi_change_4h) < 0
    ),
    checks: {
      trend_4h: regime?.trend_4h || null,
      return_7d_pct: regime?.return_7d_pct ?? null,
      distance_from_5d_sma_pct: regime?.distance_from_5d_sma_pct ?? null,
      oi_change_30m: oi?.oi_change_30m ?? null,
      oi_change_4h: oi?.oi_change_4h ?? null,
    },
  };
}

function ethExternalRegimeDownCandidate(current, state) {
  const eth = market(current, 'ETH');
  const btc = market(current, 'BTC');
  const ownRegime = eth?.long_horizon_regime || null;
  const btcRegime = btc?.long_horizon_regime || null;
  const btcGateWeak = isBtcWeakVeto(state.btc_gate_state?.ETH?.classification || btcGate(eth));
  return {
    active: !!(
      ownRegime?.trend_4h === 'DOWN' &&
      Number(ownRegime?.return_7d_pct) < -5 &&
      Number(ownRegime?.distance_from_5d_sma_pct) < -1 &&
      (btcGateWeak || longHorizonDownStack(btcRegime, { return7dMax: -10, distance5dMax: -3 }))
    ),
    checks: {
      eth_trend_4h: ownRegime?.trend_4h || null,
      eth_return_7d_pct: ownRegime?.return_7d_pct ?? null,
      eth_distance_from_5d_sma_pct: ownRegime?.distance_from_5d_sma_pct ?? null,
      btc_gate_weak: btcGateWeak,
      btc_trend_4h: btcRegime?.trend_4h || null,
      btc_return_7d_pct: btcRegime?.return_7d_pct ?? null,
      btc_distance_from_5d_sma_pct: btcRegime?.distance_from_5d_sma_pct ?? null,
    },
  };
}

function updateRegimeLongGuardShadowState(state, current) {
  state.regime_long_watch_shadow = state.regime_long_watch_shadow || {};
  const timestampUtc = current?.timestamp_utc || nowIso();
  const candidates = {
    BTC: btcSelfRegimeDownCandidate(current),
    ETH: ethExternalRegimeDownCandidate(current, state),
  };
  for (const [asset, candidate] of Object.entries(candidates)) {
    const prev = state.regime_long_watch_shadow[asset] || {};
    const streak = candidate.active ? Number(prev.streak || 0) + 1 : 0;
    state.regime_long_watch_shadow[asset] = {
      asset,
      candidate_key: asset === 'BTC' ? 'BTC_SELF_REGIME_LONG_WATCH_ONLY_SHADOW' : 'ETH_BTC_REGIME_LONG_WATCH_ONLY_SHADOW',
      active: candidate.active,
      streak,
      required_streak: 3,
      would_block_active_context: candidate.active && streak >= 3,
      checks: candidate.checks,
      updated_at: timestampUtc,
      note: 'Shadow-only Phase 4 candidate. Does not affect alert type, severity, delivery, active contexts, cooldowns, or readiness score.',
    };
  }
}

function attachRegimeLongGuardShadow(alerts, state) {
  for (const alert of alerts) {
    const direction = directionFromAlertForReadiness(alert);
    if (direction !== 'LONG' || !['BTC', 'ETH'].includes(alert.asset)) continue;
    const shadow = state.regime_long_watch_shadow?.[alert.asset];
    if (!shadow) continue;
    alert.regime_long_watch_shadow = {
      ...shadow,
      verdict: shadow.would_block_active_context ? 'would_block_active_context_shadow' : 'monitor_only',
    };
  }
}

function addMsIso(ts, ms) {
  const base = Date.parse(ts || '');
  return new Date((Number.isFinite(base) ? base : Date.now()) + ms).toISOString();
}

function expireOppositeWatch(state, asset, reason, timestampUtc) {
  const watch = state.opposite_watch_contexts?.[asset];
  if (!watch) return null;
  state.opposite_watch_history = [...(state.opposite_watch_history || []), {
    ...watch,
    expired_at: timestampUtc || nowIso(),
    expire_reason: reason,
  }].slice(-100);
  delete state.opposite_watch_contexts[asset];
  return watch;
}

function expireOppositeWatches(state, current, timestampUtc) {
  state.opposite_watch_contexts = state.opposite_watch_contexts || {};
  const nowMs = Date.parse(timestampUtc || nowIso());
  for (const [asset, watch] of Object.entries(state.opposite_watch_contexts)) {
    const expiryMs = Date.parse(watch.expires_at || '');
    if (Number.isFinite(expiryMs) && Number.isFinite(nowMs) && nowMs >= expiryMs) {
      expireOppositeWatch(state, asset, 'expired_2h_no_trigger', timestampUtc);
      continue;
    }
    const currentOi = market(current, asset)?.oi_price_regime?.classification || null;
    if (watch.required_oi_context && currentOi && currentOi !== watch.required_oi_context) {
      expireOppositeWatch(state, asset, `oi_shift_${watch.required_oi_context}_to_${currentOi}`, timestampUtc);
    }
  }
}

function applyPatternVerdicts(alerts, state, current) {
  const timestampUtc = current?.timestamp_utc || nowIso();
  updateRegimeLongGuardShadowState(state, current);
  attachRegimeLongGuardShadow(alerts, state);
  expireOppositeWatches(state, current, timestampUtc);
  state.opposite_watch_contexts = state.opposite_watch_contexts || {};

  for (const alert of alerts) {
    if (alert.readiness_shadow) alert.pattern = patternClassifier.classifyAlertPattern({ alert, directionFromAlertForReadiness }) || null;
    if (alert.pattern?.active_context === false) {
      alert.active_context_blocked_by_pattern = {
        key: alert.pattern.key,
        verdict: alert.pattern.verdict,
        alert_class: alert.pattern.alert_class || null,
        reason: 'empirical_pattern_watch_only_no_active_context',
      };
    }

    const alertDirection = activeDirectionFromAlert(alert);
    const existingContext = state.active_contexts?.[alert.asset] || null;
    const existingHealthStatus = existingContext?.health?.status || null;
    if (
      alertDirection &&
      existingContext?.direction === alertDirection &&
      ['STRESSED', 'FAILED'].includes(existingHealthStatus) &&
      !alert.opposite_watch_inherited
    ) {
      alert.active_context_blocked_by_health = {
        status: existingHealthStatus,
        reason: existingContext.health?.reason || null,
        policy: existingHealthStatus === 'FAILED' ? 'failed_context_must_close_before_reentry' : 'stressed_context_no_add_same_direction',
      };
    }
    const q = tradeQuality.qualityForAlert(alert, tradeQualityReport());
    const gateStatus = telegramPatternStatus(alert);
    if (q) {
      const maxWinRate1To6 = tradeQuality.maxWinRate1To6(q.summary);
      const suppressByTradeQuality = shouldSuppressByTradeQualityWinRate(alert, q);
      const exactPatternBlockReason = exactPatternQualityBlockReason(alert);
      alert.trade_quality = {
        key: q.key,
        label: q.label,
        reason: q.reason,
        best_horizon: q.best_horizon,
        best_win_rate_pct: q.best_win_rate_pct,
        max_win_rate_1_to_6_pct: maxWinRate1To6,
        best_avg_pct: q.best_avg_pct,
        n: q.n,
        path6h: q.path6h,
        generated_at: q.generated_at,
        window: q.window,
        presentation_only: !suppressByTradeQuality,
        changes_score_or_delivery: suppressByTradeQuality,
      };
      if (suppressByTradeQuality) {
        const disabledByPatternGate = gateStatus === 'disabled';
        alert.telegram_suppressed = {
          reason: disabledByPatternGate
            ? 'telegram_pattern_gate_disabled'
            : exactPatternBlockReason
            ? exactPatternBlockReason
            : q.summary.oi_data_quarantined
            ? 'oi_price_regime_pre_fix_data_quarantined'
            : 'trade_quality_max_win_rate_1_to_6_not_above_70',
          key: q.key,
          pattern_key: telegramWatchPatternKey(alert),
          pattern_gate_status: gateStatus,
          max_win_rate_1_to_6_pct: maxWinRate1To6,
          threshold_pct: MIN_ENABLED_MAX_WIN_RATE_1_TO_6_PCT,
          oi_data_quarantined: q.summary.oi_data_quarantined || false,
          oi_data_quarantine_reason: q.summary.oi_data_quarantine_reason || null,
          policy: 'telegram_suppressed_but_logged_and_tracked',
        };
        alert.active_context_blocked_by_trade_quality = {
          key: q.key,
          reason: 'max_win_rate_1_to_6_not_above_70',
          max_win_rate_1_to_6_pct: maxWinRate1To6,
          threshold_pct: MIN_ENABLED_MAX_WIN_RATE_1_TO_6_PCT,
        };
      }
    }

    const exactPatternBlockReasonWithoutQuality = !q ? exactPatternQualityBlockReason(alert) : null;
    if (exactPatternBlockReasonWithoutQuality) {
      alert.telegram_suppressed = {
        reason: exactPatternBlockReasonWithoutQuality,
        pattern_key: telegramWatchPatternKey(alert),
        pattern_gate_status: gateStatus,
        policy: 'telegram_suppressed_but_logged_and_tracked',
      };
      alert.active_context_blocked_by_trade_quality = {
        reason: exactPatternBlockReasonWithoutQuality,
        pattern_key: telegramWatchPatternKey(alert),
      };
    }

    if (gateStatus === 'disabled') {
      alert.original_severity = alert.original_severity || alert.severity;
      alert.severity = 'LOW';
      alert.pattern_gate = {
        status: 'disabled',
        pattern_key: telegramWatchPatternKey(alert),
        policy: 'log_only_not_actionable',
      };
      alert.active_context_blocked_by_pattern_gate = {
        reason: 'telegram_pattern_gate_disabled',
        pattern_key: telegramWatchPatternKey(alert),
      };
      if (!alert.telegram_suppressed) {
        alert.telegram_suppressed = {
          reason: 'telegram_pattern_gate_disabled',
          pattern_key: telegramWatchPatternKey(alert),
          pattern_gate_status: gateStatus,
          policy: 'telegram_suppressed_but_logged_and_tracked',
        };
      }
    }

    if (['direction_watch', 'fade_candidate', 'watch_only'].includes(alert.pattern?.verdict)) {
      alert.empirical_watch = {
        key: alert.pattern.key,
        verdict: alert.pattern.verdict,
        alert_class: alert.pattern.alert_class || null,
        shadow_gate_applicable: alert.pattern.shadow_gate_applicable ?? null,
        shadow_gate_reason: alert.pattern.shadow_gate_reason || null,
        empirical_entry_gate: alert.pattern.empirical_entry_gate || null,
        direction: directionFromAlertForReadiness(alert),
        active_context: false,
        tracking: 'alert_jsonl_and_hypothesis_outcomes',
      };
    }

    const watch = state.opposite_watch_contexts?.[alert.asset];
    const alertOi = alert.readiness_shadow?.source_metrics?.oi_price_regime || market(current, alert.asset)?.oi_price_regime?.classification || null;
    if (alert.type === 'SHORT_CONFIRMED' && watch?.direction === 'SHORT' && watch.trigger === 'SHORT_CONFIRMED' && (!watch.required_oi_context || alertOi === watch.required_oi_context)) {
      alert.opposite_watch_inherited = { ...watch, triggered_at: alert.timestamp_utc || timestampUtc };
      alert.pattern = {
        key: 'C1_SHORT_MAX_T1_INHERITED',
        verdict: 'direction_supported',
        alert_class: watch.inverse_class || 'FADE1_INVERSE_SHORT_CANDIDATE',
        line: '✅ C1-SHORT: T1-primed FRESH_LONGS SHORT — inherited OI validation from suppressed failed-LONG bucket',
        stat: `${patternClassifier.PATTERN_STATS.C1_SHORT_MAX} | T1 opposite-watch source: ${patternClassifier.PATTERN_STATS.T1_FRESH_LONGS_LONG}`,
        deduction: 'Deduction: SHORT_CONFIRMED fired while T1 opposite-watch was active; score is metadata, OI validation came from T1/FRESH_LONGS. No auto-trade; treat as high-conviction SHORT setup requiring normal execution discipline.',
      };
      expireOppositeWatch(state, alert.asset, `triggered_by_${alert.type}`, alert.timestamp_utc || timestampUtc);
    }

    if (alert.pattern?.verdict === 'avoid_original_short_primed' && alert.type === 'LONG_CONFIRMED') {
      const opposite = alert.pattern.opposite_watch || {};
      const expiresAt = addMsIso(alert.timestamp_utc || timestampUtc, OPPOSITE_WATCH_EXPIRY_MS);
      alert.telegram_suppressed = { reason: `pattern_avoid_original:${alert.pattern.key}` };
      alert.research_note = {
        type: 'EMPIRICAL_AVOID_ORIGINAL',
        pattern_key: alert.pattern.key,
        reason: `Empirical bucket ${alert.pattern.key}: primary ${alert.readiness_shadow?.direction || 'LONG'} suppressed; opposite watch opened`,
      };
      const watchCtx = {
        asset: alert.asset,
        direction: opposite.direction || 'SHORT',
        trigger: opposite.trigger || 'SHORT_CONFIRMED',
        bucket: opposite.bucket || 'C1_SHORT_MAX',
        required_oi_context: opposite.required_oi_context || 'FRESH_LONGS',
        inverse_class: opposite.inverse_class || null,
        evidence_scope: opposite.evidence_scope || null,
        source_pattern_key: alert.pattern.key,
        source_alert_id: alert.id,
        source_alert_type: alert.type,
        source_score: alert.readiness_shadow?.effective_score ?? alert.readiness_shadow?.score ?? null,
        created_at: alert.timestamp_utc || timestampUtc,
        expires_at: expiresAt,
        auto_trade: false,
      };
      if (state.opposite_watch_contexts[alert.asset]) {
        expireOppositeWatch(state, alert.asset, `replaced_by_new_${alert.pattern.key}`, alert.timestamp_utc || timestampUtc);
      }
      state.opposite_watch_contexts[alert.asset] = watchCtx;
      alert.opposite_watch_created = watchCtx;
    }
  }
}

function buildReadinessSnapshots(current, extras, state) {
  const rows = [];
  for (const asset of ASSETS) {
    const m = market(current, asset);
    for (const direction of ['LONG', 'SHORT']) {
      const readiness = computeReadinessShadow(asset, direction, m, extras, state.btc_gate_state?.[asset], current.timestamp_utc || nowIso());
      attachBtcLongHorizonContext(readiness, current, asset);
      rows.push(readiness);
    }
  }
  return rows;
}

function severityFor(type) {
  if (['ACTIVE_CONTEXT_STRESSED', 'ACTIVE_CONTEXT_RECOVERING', 'ACTIVE_CONTEXT_FAILED', 'ACTIVE_CONTEXT_BTC_WEAK'].includes(type)) return 'HIGH';
  if (['SHORT_CONFIRMED', 'LONG_CONFIRMED', 'LONG_INVALIDATED', 'SHORT_INVALIDATED', 'RETEST_FAILED', 'CROSS_ASSET_COVER'].includes(type)) return 'HIGH';
  if (['SHORT_SETUP', 'SHORT_CAUTION', 'LONG_SETUP', 'RETESTING_RECLAIMED_LEVEL', 'RETEST_HELD'].includes(type)) return 'MEDIUM';
  return 'LOW';
}
function event(asset, type, current, previous, reason, extra = {}) {
  const m = market(current, asset);
  return {
    id: `${current.timestamp_utc || nowIso()}:${asset}:${type}`,
    timestamp_utc: current.timestamp_utc || nowIso(),
    asset,
    type,
    severity: severityFor(type),
    reason,
    diagnostics: compactDiagnostics(m),
    previous: previous ? compactDiagnostics(market(previous, asset)) : null,
    ...extra,
  };
}

function opportunityAlert({ current, previous, asset, type, sourceDirection, tradeDirection, patternKey, line, deduction, reason, alertClass = 'WATCH_ONLY_OPPORTUNITY', verdict = 'fade_candidate' }) {
  return event(asset, type, current, previous, reason, {
    severity: 'HIGH',
    cooldown_ms: 6 * 60 * 60 * 1000,
    research_note: {
      type: 'NONTELEGRAM_OPPORTUNITY',
      pattern_key: patternKey,
      source_direction: sourceDirection,
      trade_direction: tradeDirection,
      verdict,
      alert_class: alertClass,
      line,
      deduction,
      watch_only: true,
      active_context: false,
      auto_trade: false,
    },
  });
}

function generateNonTelegramOpportunityAlerts(current, previous, extras, state, btc4hChange = null) {
  const alerts = [];
  const ethLong = computeReadinessShadow('ETH', 'LONG', market(current, 'ETH'), extras, state.btc_gate_state?.ETH, current.timestamp_utc || nowIso());
  const solShort = computeReadinessShadow('SOL', 'SHORT', market(current, 'SOL'), extras, state.btc_gate_state?.SOL, current.timestamp_utc || nowIso());
  const solLong = computeReadinessShadow('SOL', 'LONG', market(current, 'SOL'), extras, state.btc_gate_state?.SOL, current.timestamp_utc || nowIso());
  attachBtcLongHorizonContext(ethLong, current, 'ETH');
  attachBtcLongHorizonContext(solShort, current, 'SOL');
  attachBtcLongHorizonContext(solLong, current, 'SOL');

  const ethFlow = ethLong?.source_metrics?.flow;
  const ethBtcGate = normalizeBtcGate(ethLong?.source_metrics?.btc_gate || null);
  const ethOi = ethLong?.source_metrics?.oi_price_regime;
  const ethFunding = ethLong?.source_metrics?.cross_exchange_positioning?.classification;
  const solShortFlow = solShort?.source_metrics?.flow;
  const solLongOi = solLong?.source_metrics?.oi_price_regime;
  const solLongFunding = solLong?.source_metrics?.cross_exchange_positioning?.classification;

  if (ethLong?.state === 'SHADOW_BLOCKED' && ethFlow === 'SELL_PRESSURE') {
    alerts.push(opportunityAlert({
      current, previous, asset: 'ETH', type: 'OPPORTUNITY_ETH_BLOCKED_LONG_SELL_PRESSURE_INV_SHORT',
      sourceDirection: 'LONG', tradeDirection: 'SHORT', patternKey: 'ETH_LONG_BLOCKED_SELL_PRESSURE_INVERSE_SHORT_POSTFIX',
      line: '🔁 ETH blocked LONG + SELL_PRESSURE — promoted inverse SHORT watch. Expected behavior: fade usually works within 1–2h; larger MFE often comes around 3–4h.',
      deduction: 'Deduction: treat ETH long attempt as fade candidate only if sell pressure persists / bounce fails. Watch-only; no active context and no auto-entry.',
      reason: 'post-fix missing-shadow opportunity: ETH blocked LONG + SELL_PRESSURE historically favored inverse SHORT',
    }));
  }
  if (solShort?.state === 'SHADOW_BLOCKED' && solShortFlow === 'SPOT_LED_ACCUMULATION') {
    alerts.push(opportunityAlert({
      current, previous, asset: 'SOL', type: 'OPPORTUNITY_SOL_BLOCKED_SHORT_SPOT_LED_INV_LONG',
      sourceDirection: 'SHORT', tradeDirection: 'LONG', patternKey: 'SOL_SHORT_BLOCKED_SPOT_LED_INVERSE_LONG_POSTFIX',
      line: '🔁 SOL blocked SHORT + SPOT_LED_ACCUMULATION — promoted inverse LONG watch. Expected behavior: frequent bounce, but wider adverse path; require spot bid / failed breakdown.',
      deduction: 'Deduction: do not take the blocked SHORT as a short; inverse LONG is watch-only and needs tight risk because MAE is materially larger than ETH/BTC candidates.',
      reason: 'post-fix missing-shadow opportunity: SOL blocked SHORT + spot-led accumulation historically favored inverse LONG',
    }));
  }
  if (ethBtcGate === BTC_PERMITS_GATE) {
    alerts.push(opportunityAlert({
      current, previous, asset: 'ETH', type: 'OPPORTUNITY_ETH_BTC_PERMITS_INV_SHORT',
      sourceDirection: 'LONG', tradeDirection: 'SHORT', patternKey: 'ETH_BTC_PERMITS_ALT_LONG_INVERSE_SHORT_POSTFIX',
      line: '🔁 ETH BTC_PERMITS_ALT_LONG_OBSERVATION — promoted inverse SHORT watch. Expected behavior: BTC permits watching, but does not validate ETH long; fade if ETH cannot lead after trigger.',
      deduction: 'Deduction: do not read BTC_PERMITS as LONG confirmation. Use only as inverse/fade watch when ETH fails to follow through.',
      reason: 'post-fix missing-shadow opportunity: ETH BTC_PERMITS alt-long observation favored inverse SHORT',
    }));
  }
  if (ethOi === 'LONGS_EXITING' && ethFunding === 'BROAD_SHORT_PRESSURE') {
    alerts.push(opportunityAlert({
      current, previous, asset: 'ETH', type: 'OPPORTUNITY_ETH_LONGS_EXITING_SHORT_PRESSURE_LONG',
      sourceDirection: 'LONG', tradeDirection: 'LONG', patternKey: 'ETH_LONGS_EXITING_BROAD_SHORT_PRESSURE_LONG_POSTFIX',
      line: '✅ ETH LONGS_EXITING + BROAD_SHORT_PRESSURE — promoted delayed LONG reversal watch. Expected behavior: not always a 1h trade; strongest around 3–5h after seller exhaustion.',
      deduction: 'Deduction: enter only after absorption / failed downside continuation; avoid while cascade is still accelerating. Watch-only; no active context.',
      reason: 'post-fix opportunity: ETH longs-exiting with broad short pressure favored delayed natural LONG reversal',
      verdict: 'direction_watch', alertClass: 'WATCH_DELAYED_LONG_REVERSAL',
    }));
  }
  if (solLongOi === 'SHORTS_COVERING' && solLongFunding === 'BROAD_SHORT_PRESSURE') {
    alerts.push(opportunityAlert({
      current, previous, asset: 'SOL', type: 'OPPORTUNITY_SOL_SHORTS_COVERING_INV_SHORT',
      sourceDirection: 'LONG', tradeDirection: 'SHORT', patternKey: 'SOL_SHORTS_COVERING_BROAD_SHORT_PRESSURE_INVERSE_SHORT_POSTFIX',
      line: '🔁 SOL SHORTS_COVERING + BROAD_SHORT_PRESSURE — promoted inverse SHORT watch. Expected behavior: delayed fade; wait for failed squeeze / rollover, not a quick 1h chase.',
      deduction: 'Deduction: SHORT only after squeeze exhaustion; median MFE timing is late (~270m), and MAE is meaningful. Watch-only; no active context.',
      reason: 'post-fix opportunity: SOL shorts-covering/broad-short-pressure rows favored inverse SHORT over 5h',
    }));
  }

  for (const alert of alerts) {
    const readiness = alert.research_note.source_direction === 'SHORT' ? solShort : alert.asset === 'SOL' ? solLong : ethLong;
    if (readiness) {
      readiness.divergence = readinessDivergence(alert, readiness);
      readiness.regime = patternClassifier.buildRegimeFields({ alert, readiness, btc4hChange });
      alert.readiness_shadow = readiness;
      alert.regime = readiness.regime;
    }
  }
  return alerts;
}
function dedupe(events, state) {
  const out = [];
  const nowMs = Date.now();
  state.events = state.events || {};
  for (const e of events) {
    const key = thesisKey(e);
    const last = state.events[key] || {};
    const cooldownMs = e.cooldown_ms || DEFAULT_COOLDOWN_MS;
    const inCooldown = Number.isFinite(Number(last.emitted_ms)) && nowMs - Number(last.emitted_ms) < cooldownMs;
    if (inCooldown) continue;
    e.fingerprint = fingerprint(e);
    e.thesis_key = key;
    out.push(e);
    state.events[key] = { emitted_ms: nowMs, timestamp_utc: e.timestamp_utc, fingerprint: e.fingerprint, thesis_key: key, type: e.type, asset: e.asset };
  }
  state.updated_at = nowIso();
  return out;
}

function patternFamilyKey(e) {
  const key = e?.pattern?.key || e?.empirical_watch?.key || e?.research_note?.pattern_key || null;
  if (key) return key;
  return e?.type || 'UNKNOWN_TYPE';
}

function thesisKey(e) {
  const direction = tradeDirectionFromAlert(e) || 'UNKNOWN_DIRECTION';
  return [e.asset || 'UNKNOWN_ASSET', direction, patternFamilyKey(e)].join(':');
}

function tradeDirectionFromAlert(alert) {
  if (alert?.research_note?.trade_direction) return alert.research_note.trade_direction;
  const patternKey = alert?.pattern?.key || alert?.empirical_watch?.key || alert?.research_note?.pattern_key || null;
  if (patternKey) {
    if (patternKey.includes('INVERSE_SHORT')) return 'SHORT';
    if (patternKey.includes('INVERSE_LONG')) return 'LONG';
  }
  if (alert?.pattern?.verdict === 'fade_candidate' || alert?.empirical_watch?.verdict === 'fade_candidate') {
    const sourceDirection = directionFromAlertForReadiness(alert);
    if (sourceDirection === 'LONG') return 'SHORT';
    if (sourceDirection === 'SHORT') return 'LONG';
  }
  return directionFromAlertForReadiness(alert);
}

function fingerprint(e) {
  const d = e.diagnostics || {};
  return [e.type, d.flow, d.flow_confirmed, d.flow_streak, d.reclaim_retest_state, d.failed_level, d.btc_gate].join('|');
}

function telegramDeliveryBucketKey(alert) {
  const key = alert?.pattern?.key || alert?.empirical_watch?.key || alert?.research_note?.pattern_key || null;
  const tradeDir = tradeDirectionFromAlert(alert);
  if (alert?.asset === 'ETH' && tradeDir === 'SHORT' && [
    'ETH_LONG_BLOCKED_SELL_PRESSURE_INVERSE_SHORT_POSTFIX',
    'ETH_BTC_PERMITS_ALT_LONG_INVERSE_SHORT_POSTFIX',
  ].includes(key)) return 'ETH_INVERSE_SHORT_OPPORTUNITY';
  if (alert?.asset === 'SOL' && tradeDir === 'LONG' && key === 'SOL_SHORT_BLOCKED_SPOT_LED_INVERSE_LONG_POSTFIX') {
    return 'SOL_INVERSE_LONG_OPPORTUNITY';
  }
  return key ? `PATTERN:${key}` : thesisKey(alert);
}

function telegramBucketCapConfig(alert) {
  const entry = telegramPatternGateEntry(alert);
  const dynamicCap = entry?.status === 'enabled' ? entry.telegram_cap : null;
  if (dynamicCap && Number.isFinite(Number(dynamicCap.cap)) && Number(dynamicCap.cap) > 0) {
    return {
      cap: Number(dynamicCap.cap),
      window_ms: Number.isFinite(Number(dynamicCap.window_ms)) && Number(dynamicCap.window_ms) > 0
        ? Number(dynamicCap.window_ms)
        : TELEGRAM_BUCKET_CAP_WINDOW_MS,
      source: 'telegram_pattern_gate',
    };
  }
  const bucket = telegramDeliveryBucketKey(alert);
  const staticCap = TELEGRAM_BUCKET_CAPS[bucket];
  if (Number.isFinite(staticCap) && staticCap > 0) {
    return { cap: staticCap, window_ms: TELEGRAM_BUCKET_CAP_WINDOW_MS, source: 'static_bucket_cap' };
  }
  return null;
}

function applyTelegramBucketCaps(alerts, state) {
  state.telegram_bucket_caps = state.telegram_bucket_caps || {};
  const nowMs = Date.now();
  const deliverable = [];
  const capped = [];
  for (const alert of alerts) {
    const bucket = telegramDeliveryBucketKey(alert);
    const capConfig = telegramBucketCapConfig(alert);
    const cap = capConfig?.cap;
    const windowMs = capConfig?.window_ms || TELEGRAM_BUCKET_CAP_WINDOW_MS;
    if (!Number.isFinite(cap) || cap <= 0) {
      deliverable.push(alert);
      continue;
    }
    const current = state.telegram_bucket_caps[bucket] || { deliveries: [] };
    const deliveries = (current.deliveries || []).filter(row => Number.isFinite(Number(row.ms)) && nowMs - Number(row.ms) < windowMs);
    if (deliveries.length >= cap) {
      capped.push({
        alert,
        result: {
          alert_id: alert.id,
          timestamp_utc: nowIso(),
          channel: null,
          target: null,
          ok: true,
          skipped: true,
          reason: 'telegram_bucket_cap',
          bucket,
          cap,
          window_ms: windowMs,
          cap_source: capConfig.source,
          presentation_only: true,
        },
      });
      state.telegram_bucket_caps[bucket] = { ...current, deliveries, cap, window_ms: windowMs, cap_source: capConfig.source, updated_at: nowIso() };
      continue;
    }
    deliveries.push({ ms: nowMs, timestamp_utc: alert.timestamp_utc || nowIso(), alert_id: alert.id });
    state.telegram_bucket_caps[bucket] = { ...current, deliveries, cap, window_ms: windowMs, cap_source: capConfig.source, updated_at: nowIso() };
    alert.telegram_delivery_bucket = bucket;
    deliverable.push(alert);
  }
  return { deliverable, capped };
}

function isInformationalSuppressedAlert(alert) {
  return ['BTC_WEAK_VETO_INFO', 'EMPIRICAL_AVOID_ORIGINAL'].includes(alert?.research_note?.type);
}

function isTelegramCandidateAlert(alert) {
  if (!alert) return false;
  if (telegramPatternStatus(alert) === 'disabled') return false;
  if (alert.telegram_suppressed && !isInformationalSuppressedAlert(alert)) return false;
  return TELEGRAM_DELIVERY_SEVERITIES.has(alert.severity)
    || enabledByExplicitWinRateCandidate(alert)
    || alert.research_note?.type === 'N1_GATE_COST'
    || isInformationalSuppressedAlert(alert);
}

function directionalReturnPct(direction, entry, currentPrice) {
  if (!Number.isFinite(entry) || !Number.isFinite(currentPrice) || entry === 0) return null;
  const raw = ((currentPrice - entry) / entry) * 100;
  return direction === 'SHORT' ? -raw : raw;
}

function episodeKey(asset, direction) {
  return `${asset}:${direction}`;
}

function oppositeDirection(direction) {
  if (direction === 'LONG') return 'SHORT';
  if (direction === 'SHORT') return 'LONG';
  return null;
}

function activeOppositeEpisode(state, asset, direction) {
  const opposite = oppositeDirection(direction);
  if (!asset || !opposite) return null;
  return state.alert_episodes?.active?.[episodeKey(asset, opposite)] || null;
}

function closeEpisode(state, episode, reason, timestampUtc, extra = {}) {
  if (!episode) return null;
  state.alert_episodes = state.alert_episodes || { active: {}, history: [] };
  const closed = {
    ...episode,
    ...extra,
    status: reason === 'invalidated_by_opposite_signal' ? 'INVALIDATED' : (extra.status || episode.status || 'CLOSED'),
    closed_at: timestampUtc || nowIso(),
    close_reason: reason,
    updated_at: timestampUtc || nowIso(),
  };
  state.alert_episodes.history = [...(state.alert_episodes.history || []), closed].slice(-300);
  if (episode.episode_key) delete state.alert_episodes.active[episode.episode_key];
  return closed;
}

function updateAlertEpisodeBook(state, current) {
  state.alert_episodes = state.alert_episodes || { active: {}, history: [] };
  state.alert_episodes.active = state.alert_episodes.active || {};
  state.alert_episodes.history = state.alert_episodes.history || [];
  const nowTs = current?.timestamp_utc || nowIso();
  const nowMs = Date.parse(nowTs);
  for (const [key, ep] of Object.entries(state.alert_episodes.active)) {
    if (!ep || ep.status === 'CLOSED') {
      delete state.alert_episodes.active[key];
      continue;
    }
    const p = price(market(current, ep.asset));
    const ret = directionalReturnPct(ep.direction, Number(ep.entry_price), p);
    if (Number.isFinite(ret)) {
      ep.current_return_pct = round(ret, 4);
      if (!Number.isFinite(Number(ep.mfe_pct)) || ret > Number(ep.mfe_pct)) {
        ep.mfe_pct = round(ret, 4);
        ep.mfe_at = nowTs;
      }
      if (!Number.isFinite(Number(ep.mae_pct)) || ret < Number(ep.mae_pct)) {
        ep.mae_pct = round(ret, 4);
        ep.mae_at = nowTs;
      }
      if (!ep.target_hit_at && ret >= ALERT_EPISODE_MFE_HIT_PCT) {
        ep.target_hit_at = nowTs;
        ep.status = 'MFE_HIT';
      }
      if (!ep.adverse_threshold_at && ret <= ALERT_EPISODE_ADVERSE_PCT) {
        ep.adverse_threshold_at = nowTs;
        ep.adverse_threshold_return_pct = round(ret, 4);
      }
      const adverseMs = Date.parse(ep.adverse_threshold_at || '');
      if (Number.isFinite(adverseMs) && Number.isFinite(nowMs) && nowMs - adverseMs >= ALERT_EPISODE_RECOVERY_CHECK_MS && !ep.target_hit_at) {
        const depth = Math.abs(Number(ep.adverse_threshold_return_pct));
        const recovery = depth > 0 ? (ret - Number(ep.adverse_threshold_return_pct)) / depth : 0;
        ep.recovery_ratio_after_adverse = round(recovery, 4);
        if (recovery < ALERT_EPISODE_MIN_RECOVERY_RATIO) {
          ep.status = 'FAILED';
          ep.closed_at = nowTs;
          ep.close_reason = 'mae_threshold_no_30pct_recovery_after_30m';
        }
      }
    }
    const openedMs = Date.parse(ep.opened_at || '');
    if (!ep.closed_at && Number.isFinite(openedMs) && Number.isFinite(nowMs) && nowMs - openedMs >= ALERT_EPISODE_EXPIRY_MS) {
      ep.status = ep.target_hit_at ? 'EXPIRED_AFTER_MFE_HIT' : 'EXPIRED';
      ep.closed_at = nowTs;
      ep.close_reason = 'episode_horizon_expired_6h';
    }
    ep.updated_at = nowTs;
    if (ep.closed_at) {
      state.alert_episodes.history = [...state.alert_episodes.history, { ...ep }].slice(-300);
      delete state.alert_episodes.active[key];
    }
  }
}

function applyEpisodeLifecycle(alerts, state, current) {
  updateAlertEpisodeBook(state, current);
  state.alert_episodes = state.alert_episodes || { active: {}, history: [] };
  const candidates = alerts.filter(isTelegramCandidateAlert).filter(a => ASSETS.includes(a.asset) && tradeDirectionFromAlert(a));
  const byAsset = new Map();
  for (const alert of candidates) {
    const arr = byAsset.get(alert.asset) || [];
    arr.push(alert);
    byAsset.set(alert.asset, arr);
  }

  const timestampUtc = current?.timestamp_utc || nowIso();
  for (const alert of candidates) {
    const direction = tradeDirectionFromAlert(alert);
    const opposite = activeOppositeEpisode(state, alert.asset, direction);
    if (!opposite) continue;
    const closed = closeEpisode(state, opposite, 'invalidated_by_opposite_signal', timestampUtc, {
      invalidated_by_alert_id: alert.id,
      invalidated_by_alert_type: alert.type,
      invalidated_by_direction: direction,
      invalidated_by_thesis_key: thesisKey(alert),
      invalidated_by_pattern_family: patternFamilyKey(alert),
    });
    alert.invalidated_opposite_episode = closed ? {
      episode_id: closed.episode_id,
      episode_key: closed.episode_key,
      closed_at: closed.closed_at,
      close_reason: closed.close_reason,
      prior_direction: closed.direction,
      prior_mfe_pct: closed.mfe_pct ?? null,
      prior_mae_pct: closed.mae_pct ?? null,
    } : null;
  }

  for (const [asset, arr] of byAsset.entries()) {
    const dirs = new Set(arr.map(tradeDirectionFromAlert).filter(Boolean));
    if (dirs.size < 2) continue;
    for (const alert of arr) {
      alert.telegram_suppressed = {
        reason: 'episode_conflict_same_asset_opposite_direction',
        asset,
        directions: [...dirs].sort(),
        policy: 'telegram_suppressed_but_logged_and_tracked',
      };
      alert.active_context_blocked_by_episode_conflict = {
        reason: 'same_asset_long_and_short_candidates_same_run',
        directions: [...dirs].sort(),
      };
    }
  }

  for (const alert of candidates) {
    if (alert.telegram_suppressed && !isInformationalSuppressedAlert(alert)) continue;
    const direction = tradeDirectionFromAlert(alert);
    const key = episodeKey(alert.asset, direction);
    const active = state.alert_episodes.active[key];
    if (active) {
      alert.telegram_suppressed = {
        reason: 'active_episode_open_same_asset_direction',
        episode_id: active.episode_id,
        episode_key: key,
        opened_at: active.opened_at,
        thesis_key: active.thesis_key,
        policy: 'telegram_suppressed_but_logged_and_tracked',
      };
      alert.active_context_blocked_by_episode = {
        reason: 'active_episode_open_same_asset_direction',
        episode_id: active.episode_id,
      };
      continue;
    }
    const entry = toNum(alert.diagnostics?.price ?? price(market(current, alert.asset)));
    const thesis = thesisKey(alert);
    const ep = {
      episode_id: `${timestampUtc}:${key}`,
      episode_key: key,
      asset: alert.asset,
      direction,
      thesis_key: thesis,
      pattern_family: patternFamilyKey(alert),
      source_alert_id: alert.id,
      source_alert_type: alert.type,
      opened_at: alert.timestamp_utc || timestampUtc,
      entry_price: entry,
      status: 'OPEN',
      mfe_pct: 0,
      mae_pct: 0,
      target_mfe_pct: ALERT_EPISODE_MFE_HIT_PCT,
      adverse_threshold_pct: ALERT_EPISODE_ADVERSE_PCT,
      recovery_check_ms: ALERT_EPISODE_RECOVERY_CHECK_MS,
      min_recovery_ratio: ALERT_EPISODE_MIN_RECOVERY_RATIO,
      updated_at: timestampUtc,
    };
    state.alert_episodes.active[key] = ep;
    alert.alert_episode = {
      episode_id: ep.episode_id,
      episode_key: ep.episode_key,
      status: ep.status,
      policy: 'one_active_episode_per_asset_direction',
    };
  }
}

function formatTelegramDisplayType(alert) {
  const blocked = alert.active_context_blocked;
  if (!blocked || !['LONG_CONFIRMED', 'SHORT_CONFIRMED'].includes(alert.type)) return alert.type;
  const direction = alert.type === 'LONG_CONFIRMED' ? 'LONG' : 'SHORT';
  const score = Number(blocked.actual_score ?? 0);
  if (blocked.actual_state === 'SHADOW_SETUP_FORMING' || (score >= 40 && score < ACTIVE_CONTEXT_SHADOW_MIN_SCORE)) {
    return `${direction}_LATE / SETUP_FORMING — DO NOT CHASE`;
  }
  return `${direction}_CONFIRMED — READINESS_BLOCKED`;
}

function classifyAlertPattern(alert) {
  return patternClassifier.classifyAlertPattern({ alert, directionFromAlertForReadiness });
}

function formatRegimeHeader(alert) {
  return patternClassifier.formatRegimeHeader(alert);
}

function formatResearchTelegramAlert(alert) {
  return patternClassifier.formatResearchTelegramAlert(alert, { activeContextShadowMinScore: ACTIVE_CONTEXT_SHADOW_MIN_SCORE });
}

function formatBtcWeakVetoInfoAlert(alert) {
  const d = alert.diagnostics || {};
  const r = alert.readiness_shadow || {};
  const lines = [];
  lines.push(`⚠️ ${alert.asset} LONG DETECTED — REGIME BLOCKED`);
  lines.push(`Score: ${r.score ?? 'n/a'} | Effective: ${r.effective_score ?? 0} | Blocked by: ${r.blocked_by || BTC_WEAK_VETO_GATE}`);
  lines.push('Setup present, regime invalid. No trade. Log only.');
  lines.push('Historical win rate: LONG + BTC_WEAK is 0% at 1h (0/7), avg -0.54%; inverse risk 100% at 1h. Shadow score does not override this regime veto.');
  if (d.price !== undefined) lines.push(`Price: ${d.price}`);
  if (d.flow) lines.push(`Flow: ${d.flow} / streak ${d.flow_streak ?? 'UNKNOWN'}`);
  if (d.btc_gate) lines.push(`BTC gate: ${d.btc_gate}`);
  if (d.late_lag_min !== null && d.late_lag_min !== undefined && d.late_lag_min > 0) lines.push(`Late lag: +${d.late_lag_min}m after local peak`);
  const sm = r.source_metrics || {};
  if (sm.oi_price_regime) lines.push(`OI: ${sm.oi_price_regime}`);
  if (sm.cvd_divergence) lines.push(`CVD: ${sm.cvd_divergence}`);
  if (sm.cross_exchange_positioning?.classification) lines.push(`Funding: ${sm.cross_exchange_positioning.classification}`);
  lines.push(`Gate version: ${r.gate_version || GATE_VERSION}`);
  lines.push(`Time: ${alert.timestamp_utc}`);
  lines.push('Source: phase1d-alerts.jsonl');
  return lines.join('\n');
}

function formatEmpiricalAvoidOriginalAlert(alert) {
  const d = alert.diagnostics || {};
  const r = alert.readiness_shadow || {};
  const p = alert.pattern || {};
  const watch = alert.opposite_watch_created || p.opposite_watch || null;
  const lines = [];
  lines.push(`⚠️ ${alert.asset} ${p.key || 'EMPIRICAL_BUCKET'} — PRIMARY ${r.direction || 'LONG'} SUPPRESSED`);
  if (p.verdict) lines.push(`Pattern verdict: ${p.verdict}`);
  if (p.line) lines.push(p.line);
  if (p.stat) lines.push(p.stat);
  if (p.deduction) lines.push(p.deduction);
  if (d.price !== undefined) lines.push(`Price: ${d.price}`);
  if (d.flow) lines.push(`Flow: ${d.flow} / streak ${d.flow_streak ?? 'UNKNOWN'}`);
  const sm = r.source_metrics || {};
  if (sm.oi_price_regime) lines.push(`OI: ${sm.oi_price_regime}`);
  if (sm.cvd_divergence) lines.push(`CVD: ${sm.cvd_divergence}`);
  if (sm.cross_exchange_positioning?.classification) lines.push(`Funding: ${sm.cross_exchange_positioning.classification}`);
  if (watch?.direction) {
    lines.push(`Opposite watch: ${watch.direction} via ${watch.trigger || 'confirmation'} | bucket ${watch.bucket || 'n/a'} | expires ${watch.expires_at || `${watch.expiry_minutes || 120}m`}`);
    lines.push('No auto-trade: wait for explicit opposite flow confirmation. If OI leaves FRESH_LONGS first, the watch expires.');
  }
  lines.push(`Score: ${r.effective_score ?? r.score ?? 'n/a'} / ${r.state ?? 'n/a'}`);
  lines.push(`Time: ${alert.timestamp_utc}`);
  lines.push('Source: phase1d-alerts.jsonl');
  return lines.join('\n');
}

function formatPctValue(v) {
  const n = toNum(v);
  if (n === null) return 'n/a';
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;
}

function formatLongHorizonOne(label, regime) {
  if (!regime) return null;
  const bits = [
    `${label} 3d ${formatPctValue(regime.return_3d_pct)}`,
    `7d ${formatPctValue(regime.return_7d_pct)}`,
    `vs7d ${formatPctValue(regime.distance_from_7d_sma_pct)}`,
  ];
  if (regime.trend_4h) bits.push(`4h ${regime.trend_4h}`);
  return bits.join(' | ');
}

function formatLongHorizonContext(alert) {
  const sm = alert.readiness_shadow?.source_metrics || {};
  const own = formatLongHorizonOne(alert.asset, sm.long_horizon_regime);
  const btc = alert.asset === 'BTC' ? null : formatLongHorizonOne('BTC', sm.btc_long_horizon_regime);
  const parts = [own, btc].filter(Boolean);
  if (!parts.length) return null;
  return `Long-horizon ctx: ${parts.join(' || ')}\nResearch-only — no score/alert impact yet.`;
}

function formatActiveContextHealth(ctx) {
  const h = ctx?.health;
  if (!h?.status) return null;
  const bits = [`Health: ${h.status}`];
  if (Number.isFinite(h.adverse_pct)) bits.push(`adverse ${h.adverse_pct.toFixed(2)}%`);
  if (Number.isFinite(h.stress_threshold_pct)) bits.push(`stress ≥${h.stress_threshold_pct.toFixed(2)}%`);
  if (Number.isFinite(h.stress_price)) bits.push(`stress price ${h.stress_price}`);
  if (Number.isFinite(h.max_adverse_pct)) bits.push(`max adverse ${h.max_adverse_pct.toFixed(2)}%`);
  if (h.reason) bits.push(h.reason);
  return `${bits.join(' | ')}\nHealth label is presentation-only; no score/erosion/invalidation impact.`;
}

function formatRegimeLongGuardShadow(alert) {
  const s = alert.regime_long_watch_shadow;
  if (!s) return null;
  const c = s.checks || {};
  const bits = [
    `Phase 4 shadow guard: ${s.candidate_key}`,
    `streak ${s.streak}/${s.required_streak}`,
    s.would_block_active_context ? 'WOULD BLOCK active context if promoted' : 'monitor only',
  ];
  if (alert.asset === 'BTC') {
    bits.push(
      `BTC 4h ${c.trend_4h || 'n/a'}`,
      `7d ${formatPctValue(c.return_7d_pct)}`,
      `vs5d ${formatPctValue(c.distance_from_5d_sma_pct)}`,
      `OI30m ${c.oi_change_30m === null || c.oi_change_30m === undefined ? 'n/a' : formatPctValue(Number(c.oi_change_30m) * 100)}`,
      `OI4h ${c.oi_change_4h === null || c.oi_change_4h === undefined ? 'n/a' : formatPctValue(Number(c.oi_change_4h) * 100)}`
    );
  } else if (alert.asset === 'ETH') {
    bits.push(`ETH 4h ${c.eth_trend_4h || 'n/a'}`, `ETH 7d ${formatPctValue(c.eth_return_7d_pct)}`, `ETH vs5d ${formatPctValue(c.eth_distance_from_5d_sma_pct)}`, `BTC weak ${c.btc_gate_weak ? 'yes' : 'no'}`, `BTC 4h ${c.btc_trend_4h || 'n/a'}`);
  }
  return `${bits.join(' | ')}\nShadow-only — no alert/delivery/active-context impact.`;
}

function formatActiveContextUpdateTelegramAlert(alert) {
  const ctx = alert.active_context || {};
  const h = ctx.health || {};
  const oi = ctx.oi_context || 'UNKNOWN';
  const lines = [];
  const icon = alert.type === 'ACTIVE_CONTEXT_FAILED' ? '❌' : alert.type === 'ACTIVE_CONTEXT_RECOVERING' ? '🔄' : '⚠️';
  lines.push(`${icon} CONTEXT UPDATE — ${alert.asset} ${ctx.direction || 'UNKNOWN'} ${h.status || alert.context_update?.status || 'UNKNOWN'}`);
  if (Number.isFinite(h.current_price)) lines.push(`Price: ${h.current_price}`);
  if (Number.isFinite(ctx.activated_price)) lines.push(`Activation: ${ctx.activated_price}`);
  if (Number.isFinite(h.adverse_pct) && Number.isFinite(h.stress_threshold_pct)) lines.push(`Adverse: ${h.adverse_pct.toFixed(2)}% vs stress ${h.stress_threshold_pct.toFixed(2)}%`);
  lines.push(`OI context: ${oi}`);

  if (alert.type === 'ACTIVE_CONTEXT_BTC_WEAK') {
    lines.push('Deduction: BTC_WEAK is now active on a live LONG context. Regime invalidation risk elevated; score does not override this condition.');
  } else if (alert.type === 'ACTIVE_CONTEXT_STRESSED') {
    if (ctx.direction === 'LONG' && alert.asset === 'SOL' && oi === 'FRESH_LONGS') {
      lines.push('Deduction: fade candidate developing — original LONG degraded. Small-n research only; do not auto-short.');
    } else if (ctx.direction === 'LONG' && oi === 'FRESH_SHORTS') {
      lines.push('Deduction: LONG compromised. FRESH_SHORTS remains crowded/squeeze fuel, so no automatic SHORT; stand aside or wait.');
    } else {
      lines.push('Deduction: original thesis degraded; opposite pressure developing. No bucket-specific auto-trade edge.');
    }
  } else if (alert.type === 'ACTIVE_CONTEXT_RECOVERING') {
    lines.push('Deduction: rare repair attempt — strict RECOVERING was 0/11 historically. Diagnostic only; no proven entry edge.');
  } else if (alert.type === 'ACTIVE_CONTEXT_FAILED') {
    if (ctx.direction === 'LONG' && alert.asset === 'SOL' && oi === 'FRESH_LONGS') {
      lines.push('Deduction: fade confirmed / research SHORT cleaner — SOL FRESH_LONGS failed sample 3/3 at 4h, avg +1.668% SHORT (small n; calibrated 2026-05-25; update after next PATTERN_STATS refresh; manual confirmation required).');
    } else if (ctx.direction === 'LONG' && oi === 'FRESH_SHORTS') {
      lines.push('Deduction: LONG thesis failed; no squeeze follow-through. Stand aside — FRESH_SHORTS can be crowded, SHORT entry is risky.');
    } else {
      lines.push('Deduction: original thesis dead. No bucket-specific fade evidence; stand aside.');
    }
    if (!(ctx.direction === 'LONG' && alert.asset === 'SOL' && oi === 'FRESH_LONGS')) {
      lines.push('Historical context: stressed LONG failures showed SHORT follow-through in 9/10 at 4h, avg +0.715% (current downtrend-heavy regime, small n). Treat as opposite-pressure evidence, not an auto-short.');
    }
  }

  if (h.reason) lines.push(`Reason: ${h.reason}`);
  lines.push('Context update only — not a new primary signal; no score/erosion/invalidation logic changed.');
  lines.push(`Time: ${alert.timestamp_utc}`);
  lines.push('Source: phase1d-alert-state.json');
  return lines.join('\n');
}

function formatSetupFormingDeduction(alert, pattern) {
  if (pattern?.deduction) return null;
  const r = alert.readiness_shadow || {};
  const blocked = alert.active_context_blocked || null;
  const score = Number(r.effective_score ?? r.score ?? blocked?.actual_score);
  const state = r.state || blocked?.actual_state || null;
  const setupForming = state === 'SHADOW_SETUP_FORMING' || (Number.isFinite(score) && score >= 40 && score < ACTIVE_CONTEXT_SHADOW_MIN_SCORE);
  if (!setupForming) return null;
  return `Deduction: below-threshold watch — alert/log outcome, but no active trade context unless shadow confirms >=${ACTIVE_CONTEXT_SHADOW_MIN_SCORE} or an inherited opposite-watch triggers (current downtrend-heavy dataset; diagnostic only)`;
}

function formatTelegramAlert(alert) {
  if (alert.context_update?.type === 'ACTIVE_CONTEXT_HEALTH') return formatActiveContextUpdateTelegramAlert(alert);
  if (alert.research_note?.type === 'N1_GATE_COST') return formatResearchTelegramAlert(alert);
  if (alert.research_note?.type === 'BTC_WEAK_VETO_INFO') return formatBtcWeakVetoInfoAlert(alert);
  if (alert.research_note?.type === 'EMPIRICAL_AVOID_ORIGINAL') return formatEmpiricalAvoidOriginalAlert(alert);
  const d = alert.diagnostics || {};
  const lines = [];
  const icon = alert.severity === 'HIGH' ? '🚨' : '⚠️';
  const displayType = formatTelegramDisplayType(alert);
  lines.push(`${icon} PHASE 1D ${alert.severity} — ${alert.asset} ${displayType}`);
  const regime = formatRegimeHeader(alert);
  if (regime) lines.push(regime);
  lines.push(alert.reason);
  const pattern = alert.pattern || classifyAlertPattern(alert);
  if (pattern) {
    lines.push(pattern.line);
    if (pattern.stat) lines.push(pattern.stat);
    if (pattern.deduction) lines.push(pattern.deduction);
  }
  if (alert.empirical_watch) {
    lines.push(`Empirical watch: ${alert.empirical_watch.verdict}; tracked in logs/outcomes; no active trade context created by this label.`);
  }
  const dynamicEmpiricalLine = formatDynamicEmpiricalLine(alert);
  if (dynamicEmpiricalLine) lines.push(dynamicEmpiricalLine);
  const tradeQualityLine = formatTradeQualityLine(alert);
  if (tradeQualityLine) lines.push(tradeQualityLine);
  for (const line of presentationActionLines(alert)) lines.push(line);
  const regimeShadowLine = formatBtcRegimeShadowLine();
  if (regimeShadowLine) lines.push(regimeShadowLine);
  const btcShortHorizonLine = formatBtcShortFreshShortsHorizonLine(alert);
  if (btcShortHorizonLine) lines.push(btcShortHorizonLine);
  const setupDeduction = formatSetupFormingDeduction(alert, pattern);
  if (setupDeduction) lines.push(setupDeduction);
  if (d.price !== undefined) lines.push(`Price: ${d.price}`);
  if (d.flow) lines.push(`Flow: ${d.flow} / streak ${d.flow_streak ?? 'UNKNOWN'}`);
  if (d.reclaim_retest_state) lines.push(`Retest: ${d.reclaim_retest_state}`);
  if (d.failed_level !== undefined && d.failed_level !== null) lines.push(`Level: ${d.failed_level}`);
  if (d.btc_gate) lines.push(`BTC gate: ${d.btc_gate}`);
  if (d.late_lag_min !== null && d.late_lag_min !== undefined && d.late_lag_min > 0) lines.push(`Late lag: +${d.late_lag_min}m after local extreme`);
  const healthLine = formatActiveContextHealth(alert.active_context || alert.invalidates || alert.active_context_created);
  if (healthLine) lines.push(healthLine);
  const regimeGuardLine = formatRegimeLongGuardShadow(alert);
  if (regimeGuardLine) lines.push(regimeGuardLine);
  const longHorizonContext = formatLongHorizonContext(alert);
  if (longHorizonContext) lines.push(longHorizonContext);
  if (alert.active_context_created) {
    lines.push('');
    const ctx = alert.active_context_created;
    if (alert.opposite_watch_inherited) {
      lines.push(`Active context: CREATED from inherited opposite-watch ${ctx.direction || 'UNKNOWN'}; score ${ctx.readiness_gate?.score ?? 'n/a'} / ${ctx.readiness_gate?.state ?? 'n/a'}. Health tracking is active; inherited watch supplied the trade-context permission.`);
    } else if (ctx.readiness_tier === 'shadow_confirmed') {
      lines.push(`Active context: CREATED — production trade-context gate passed (${ctx.readiness_gate?.score ?? 'n/a'} / ${ctx.readiness_gate?.state ?? 'n/a'}). Health tracking is active.`);
    } else {
      lines.push(`Active context: CREATED for delivered HIGH alert; readiness tier ${ctx.readiness_tier || 'unknown'} (${ctx.readiness_gate?.score ?? 'n/a'} / ${ctx.readiness_gate?.state ?? 'n/a'}). Health tracking is active; tier is diagnostic.`);
    }
  }
  if (alert.readiness_shadow) {
    const r = alert.readiness_shadow;
    const sm = r.source_metrics || {};
    if (r.divergence) {
      const label = r.divergence === 'forming_not_confirmed' ? '⚠ forming, not confirmed by shadow' : '⚠ diverges from alert';
      lines.push('');
      lines.push(`Phase 2 shadow: ${r.direction} ${r.effective_score} / ${r.state} ${label}`);
      if (sm.oi_price_regime) lines.push(`OI: ${sm.oi_price_regime}`);
      if (sm.cvd_divergence) lines.push(`CVD: ${sm.cvd_divergence}`);
      if (sm.cross_exchange_positioning?.classification) lines.push(`Funding: ${sm.cross_exchange_positioning.classification}`);
      if (sm.macro?.regime) lines.push(`Macro: ${sm.macro.regime}${sm.macro.vix !== null ? ` | VIX ${sm.macro.vix}` : ''}`);
      lines.push(alert.active_context_created ? 'Active-context impact: health tracking is live' : 'Shadow-only — no active-context impact');
    } else {
      const bits = [`Phase 2 shadow: ${r.direction} ${r.effective_score} / ${r.state}`];
      if (sm.oi_price_regime) bits.push(`OI ${sm.oi_price_regime}`);
      if (sm.cross_exchange_positioning?.classification) bits.push(`Funding ${sm.cross_exchange_positioning.classification}`);
      if (alert.active_context_created) bits.push('Active-context impact: health tracking live');
      else bits.push('Shadow-only/no active context');
      lines.push(bits.join(' | '));
    }
  }
  for (const line of hypothesisTracker.annotationLines(alert)) lines.push(line);
  lines.push(`Time: ${alert.timestamp_utc}`);
  lines.push('Source: phase1d-alerts.jsonl');
  return lines.join('\n');
}

function deliverTelegram(alerts, state) {
  const config = readJson(CONFIG_PATH, {});
  const channel = config.telegram?.channel || 'telegram';
  const target = config.telegram?.to || 'YOUR_TELEGRAM_CHAT_ID';
  const deliveryCandidates = alerts.filter(isTelegramCandidateAlert);
  if (process.env.PHASE1D_DISABLE_TELEGRAM === '1') {
    return deliveryCandidates.map(alert => ({ alert_id: alert.id, timestamp_utc: nowIso(), channel, target: String(target), ok: true, skipped: true, reason: 'PHASE1D_DISABLE_TELEGRAM=1' }));
  }
  const suppressedByPresentation = deliveryCandidates.filter(isTelegramSuppressedByPresentationAction);
  const uncappedDeliverable = deliveryCandidates.filter(a => !isTelegramSuppressedByPresentationAction(a));
  const cappedDelivery = applyTelegramBucketCaps(uncappedDeliverable, state);
  const deliverable = cappedDelivery.deliverable;
  const results = [];
  for (const alert of suppressedByPresentation) {
    const resolved = presentationActionForAlert(alert);
    results.push({
      alert_id: alert.id,
      timestamp_utc: nowIso(),
      channel,
      target: String(target),
      ok: true,
      skipped: true,
      reason: 'alert_presentation_actions:telegram_suppress',
      presentation_key: resolved?.key || null,
      presentation_action: resolved?.action?.action || null,
      presentation_only: true,
    });
  }
  for (const { result } of cappedDelivery.capped) {
    result.channel = channel;
    result.target = String(target);
    results.push(result);
  }
  state.telegram_delivery = state.telegram_delivery || {};

  for (const result of results) state.telegram_delivery[result.alert_id] = result;

  for (const alert of deliverable) {
    const message = formatTelegramAlert(alert);
    const sent = spawnSync('openclaw', ['message', 'send', '--channel', channel, '--target', String(target), '--message', message], {
      cwd: path.dirname(ROOT),
      encoding: 'utf8',
      timeout: 30_000,
    });
    const result = {
      alert_id: alert.id,
      timestamp_utc: nowIso(),
      channel,
      target: String(target),
      ok: sent.status === 0,
      status: sent.status,
      stdout: String(sent.stdout || '').trim(),
      stderr: String(sent.stderr || '').trim(),
    };
    results.push(result);
    state.telegram_delivery[alert.id] = result;
    if (result.ok) launchLlmTelegramReview(alert, config, state);
  }

  return results;
}

function launchLlmTelegramReview(alert, config, state) {
  const reviewerConfig = config.llm_reviewer || {};
  if (reviewerConfig.enabled === false) return;
  // Advisory-only second message. Never block or mutate primary alert delivery.
  // The child logs its own result to data/llm-review-log.jsonl.
  state.llm_review_delivery = state.llm_review_delivery || {};
  try {
    const child = spawn(process.execPath, [LLM_REVIEW_SCRIPT_PATH, alert.id], {
      cwd: ROOT,
      detached: true,
      stdio: 'ignore',
      env: process.env,
    });
    child.unref();
    state.llm_review_delivery[alert.id] = {
      launched_at: nowIso(),
      ok: true,
      pid: child.pid || null,
      advisory_only: true,
      delivery: 'telegram_followup',
    };
  } catch (e) {
    state.llm_review_delivery[alert.id] = {
      launched_at: nowIso(),
      ok: false,
      error: e.message,
      advisory_only: true,
      delivery: 'telegram_followup',
    };
  }
}

function generateAlerts(current, previous) {
  const alerts = [];

  for (const asset of ASSETS) {
    const cur = market(current, asset);
    const prev = market(previous, asset);
    if (!cur) continue;
    const curFlow = flow(cur);
    const prevFlow = flow(prev);
    const curConfirmed = alertConfirmed(cur);
    const prevConfirmed = alertConfirmed(prev);
    const curState = fbcState(cur);
    const prevState = fbcState(prev);

    // Flow setup changes: useful but low severity.
    if (prev && curFlow !== prevFlow) {
      alerts.push(event(asset, 'SETUP_CHANGE', current, previous, `flow changed ${prevFlow} → ${curFlow}`));
    }

    // Confirmed directional flow transitions.
    if (curConfirmed && (!prevConfirmed || curFlow !== prevFlow)) {
      if (isBullishFlow(curFlow)) alerts.push(event(asset, 'LONG_CONFIRMED', current, previous, `${curFlow} confirmed, streak ${flowStreak(cur)}`));
      if (isBearishFlow(curFlow)) alerts.push(event(asset, 'SHORT_CONFIRMED', current, previous, `${curFlow} confirmed, streak ${flowStreak(cur)}`));
    }

    // Short setup: leveraged chase / spot-negative futures-positive near resistance/failed level.
    if (
      isLeveragedChase(curFlow)
      && nearFailedLevel(cur)
      && cvdDivergenceType(cur) === 'SPOT_NEGATIVE_FUTURES_POSITIVE'
      && (!prev || flow(prev) !== curFlow || cvdDivergenceType(prev) !== cvdDivergenceType(cur))
    ) {
      alerts.push(event(asset, 'SHORT_SETUP', current, previous, 'leveraged chase near failed/resistance level; watch for absorption/rejection'));
    }

    // Long setup: building bullish streak before full confirmation, or retesting
    // a reclaimed level with bullish flow. This is the early entry-window alert.
    if (
      isBullishFlow(curFlow)
      && flowStreak(cur) === 2
      && (!prev || flow(prev) !== curFlow || flowStreak(prev) < 2)
    ) {
      alerts.push(event(asset, 'LONG_SETUP', current, previous, `${curFlow} building, streak 2; watch for confirmation`));
    }
    if (
      curState === 'RETESTING_RECLAIMED_LEVEL'
      && isBullishFlow(curFlow)
      && (!prev || prevState !== curState || flow(prev) !== curFlow)
    ) {
      alerts.push(event(asset, 'LONG_SETUP', current, previous, 'retesting reclaimed level with bullish flow; entry window approaching'));
    }

    // Reclaim/retest state transitions. RETESTING is the entry-window alert.
    if (curState && curState !== prevState) {
      const reason = `reclaim/retest state changed ${prevState || 'UNKNOWN'} → ${curState}`;
      if (curState === 'RECLAIMED_FAILED_LEVEL') alerts.push(event(asset, 'RECLAIMED_FAILED_LEVEL', current, previous, reason));
      else if (curState === 'RETESTING_RECLAIMED_LEVEL') alerts.push(event(asset, 'RETESTING_RECLAIMED_LEVEL', current, previous, `${reason}; entry window, wait for flow reload`));
      else if (curState === 'RETEST_HELD') alerts.push(event(asset, 'RETEST_HELD', current, previous, `${reason}; support retest held`));
      else if (curState === 'RETEST_FAILED') alerts.push(event(asset, 'RETEST_FAILED', current, previous, `${reason}; reclaim failed, exit longs / watch short setup`));
    }
  }

  // Cross-asset cover / risk-on impulse: 2+ major crypto assets confirmed bullish at once.
  const bullishConfirmed = ASSETS.filter(asset => {
    const m = market(current, asset);
    return m && alertConfirmed(m) && isBullishFlow(flow(m));
  });
  const prevBullishConfirmed = ASSETS.filter(asset => {
    const m = market(previous, asset);
    return m && alertConfirmed(m) && isBullishFlow(flow(m));
  });
  if (bullishConfirmed.length >= 2 && prevBullishConfirmed.length < 2) {
    alerts.push({
      id: `${current.timestamp_utc || nowIso()}:CROSS_ASSET_COVER:${bullishConfirmed.join('-')}`,
      timestamp_utc: current.timestamp_utc || nowIso(),
      asset: 'CROSS_ASSET',
      type: 'CROSS_ASSET_COVER',
      severity: 'HIGH',
      reason: `2+ assets confirmed bullish simultaneously: ${bullishConfirmed.join(', ')}`,
      assets: bullishConfirmed,
      diagnostics: Object.fromEntries(bullishConfirmed.map(a => [a, compactDiagnostics(market(current, a))])),
    });
  }

  return alerts;
}

function activeDirectionFromAlert(alert) {
  // Only actionable delivered HIGH confirmation alerts can create active contexts.
  // Phase 2 readiness is stored as a tier/metadata, not a post-delivery monitoring gate.
  // MEDIUM entry-window alerts such as RETEST_HELD are useful context, but if they
  // are not delivered to Telegram they must not later generate HIGH invalidations
  // the user never saw an activation for.
  if (alert.type === 'LONG_CONFIRMED') return 'LONG';
  if (alert.type === 'SHORT_CONFIRMED') return 'SHORT';
  return null;
}

function activeContextReadinessMeta(alert) {
  const r = alert?.readiness_shadow || null;
  const score = r?.effective_score ?? r?.score ?? null;
  const shadowConfirmed = r?.state === 'SHADOW_CONFIRMED' && Number(score) >= ACTIVE_CONTEXT_SHADOW_MIN_SCORE;
  return {
    state: r?.state || null,
    score,
    version: r?.version || null,
    tier: shadowConfirmed ? 'shadow_confirmed' : 'below_threshold',
    threshold_score: ACTIVE_CONTEXT_SHADOW_MIN_SCORE,
  };
}

function erode(active, reason) {
  active.erosion_count = Number(active.erosion_count || 0) + 1;
  active.last_erosion_reason = reason;
  active.last_erosion_at = nowIso();
  if (active.erosion_count >= ACTIVE_CONTEXT_EROSION_LIMIT) {
    return `${active.direction} context expired after ${active.erosion_count} consecutive non-confirming samples (${reason})`;
  }
  return null;
}

function resetErosion(active, reason) {
  active.erosion_count = 0;
  active.last_confirming_at = nowIso();
  active.last_confirming_reason = reason;
}

function percentile(vals, q) {
  const arr = vals.filter(Number.isFinite).sort((a, b) => a - b);
  if (!arr.length) return null;
  const idx = (arr.length - 1) * q;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return arr[lo];
  return arr[lo] + (arr[hi] - arr[lo]) * (idx - lo);
}

function computeStressThresholds(history, current) {
  const rows = [...(history || []), current].filter(Boolean).sort((a, b) => Date.parse(a.timestamp_utc || 0) - Date.parse(b.timestamp_utc || 0));
  const latestTs = Date.parse(current?.timestamp_utc || nowIso());
  const out = {};
  for (const asset of ASSETS) {
    const vals = [];
    const series = rows
      .map(row => ({ t: Date.parse(row.timestamp_utc || ''), p: price(market(row, asset)) }))
      .filter(x => Number.isFinite(x.t) && Number.isFinite(x.p));
    for (let i = 4; i < series.length; i += 1) {
      if (latestTs - series[i].t > ACTIVE_CONTEXT_HEALTH_LOOKBACK_MS) continue;
      const move = Math.abs(pctChange(series[i - 4].p, series[i].p));
      if (Number.isFinite(move)) vals.push(move);
    }
    const p75 = percentile(vals, 0.75);
    const floor = ACTIVE_CONTEXT_STRESS_FLOORS_PCT[asset] ?? 0.30;
    out[asset] = {
      source: 'asset_7d_1h_abs_move_p75_with_floor',
      p75_1h_abs_move_pct: round(p75, 4),
      floor_pct: floor,
      stress_threshold_pct: round(Math.max(p75 ?? 0, floor), 4),
      sample_count: vals.length,
    };
  }
  return out;
}

function updateActiveContextHealth(active, m, gateState = null, thresholdInfo = null, timestampUtc = nowIso()) {
  if (!active || !m) return;
  const currentPrice = price(m);
  const activatedPrice = toNum(active.activated_price);
  const threshold = toNum(thresholdInfo?.stress_threshold_pct);
  if (!Number.isFinite(currentPrice) || !Number.isFinite(activatedPrice) || !Number.isFinite(threshold)) return;

  const adversePct = active.direction === 'LONG'
    ? Math.max(0, -pctChange(activatedPrice, currentPrice))
    : Math.max(0, pctChange(activatedPrice, currentPrice));
  const favorableOrReclaimed = active.direction === 'LONG'
    ? currentPrice >= activatedPrice
    : currentPrice <= activatedPrice;
  // Legacy active contexts created before oi_context was stored are backfilled
  // from current microstructure. This is pragmatic for live wording, but may
  // differ from the activation-time OI context in retrospective analysis.
  if (!active.oi_context && m?.oi_price_regime?.classification) active.oi_context = m.oi_price_regime.classification;
  const curFlow = flow(m);
  const favorableFlow = active.direction === 'LONG' ? isBullishFlow(curFlow) : isBearishFlow(curFlow);
  const adverseFlow = active.direction === 'LONG' ? isBearishFlow(curFlow) : isBullishFlow(curFlow);
  const counterConfirmed = adverseFlow && (flowConfirmed(m) || flowStreak(m) >= 2);
  const stressed = adversePct >= threshold;

  active.health = active.health || {};
  const previousHealthStatus = active.health.status || null;
  active.health.max_adverse_pct = round(Math.max(toNum(active.health.max_adverse_pct) || 0, adversePct), 4);
  active.health.max_adverse_at = active.health.max_adverse_pct === round(adversePct, 4) ? timestampUtc : active.health.max_adverse_at;
  active.health.adverse_pct = round(adversePct, 4);
  active.health.current_price = round(currentPrice, 6);
  active.health.stress_price = active.direction === 'LONG'
    ? round(activatedPrice * (1 - threshold / 100), 6)
    : round(activatedPrice * (1 + threshold / 100), 6);
  active.health.stress_threshold_pct = round(threshold, 4);
  active.health.threshold_source = thresholdInfo?.source || null;
  active.health.threshold_sample_count = thresholdInfo?.sample_count ?? null;
  active.health.reclaim_streak = favorableOrReclaimed ? Number(active.health.reclaim_streak || 0) + 1 : 0;
  active.health.stress_streak = stressed ? Number(active.health.stress_streak || 0) + 1 : 0;
  active.health.recovery_attempt_streak = stressed && favorableFlow && !favorableOrReclaimed
    ? Number(active.health.recovery_attempt_streak || 0) + 1
    : 0;

  let status = 'HEALTHY';
  let reason = favorableFlow ? `confirming ${curFlow}` : `flow ${curFlow || 'UNKNOWN'}`;
  if (stressed) {
    status = 'STRESSED';
    reason = favorableFlow && !favorableOrReclaimed
      ? `${curFlow} below activation is recovery attempt only`
      : `price materially adverse vs activation`;
    // Presentation-only FAILED causes. These do not delete the active context
    // or change erosion/invalidation behavior:
    // - LONG stressed while BTC_WEAK_VETO persists for >=3 samples.
    // - stressed plus confirmed opposite flow (confirmed or streak >=2).
    // - stressed for 4 consecutive samples with no activation reclaim.
    if (active.direction === 'LONG' && isBtcWeakVeto(btcGate(m)) && Number(gateState?.weak_streak || 0) >= 3) {
      status = 'FAILED';
      reason = `stressed plus BTC_WEAK_VETO ${gateState.weak_streak} samples`;
    } else if (counterConfirmed) {
      status = 'FAILED';
      reason = `stressed plus confirmed opposite flow ${curFlow}`;
    } else if (Number(active.health.stress_streak || 0) >= 4 && Number(active.health.reclaim_streak || 0) === 0) {
      status = 'FAILED';
      reason = 'stressed for 4 samples with no reclaim';
    }
  } else if (['STRESSED', 'FAILED'].includes(previousHealthStatus) && active.health.reclaim_streak >= 2 && favorableFlow) {
    status = 'RECOVERING';
    reason = `reclaimed activation for ${active.health.reclaim_streak} samples with ${curFlow}`;
  }
  active.health.status = status;
  active.health.reason = reason;
  active.health.updated_at = timestampUtc;
}

function healthUpdateTypeForStatus(status) {
  if (status === 'STRESSED') return 'ACTIVE_CONTEXT_STRESSED';
  if (status === 'RECOVERING') return 'ACTIVE_CONTEXT_RECOVERING';
  if (status === 'FAILED') return 'ACTIVE_CONTEXT_FAILED';
  return null;
}

function buildBtcWeakContextEvent(asset, current, ctx, gateState) {
  if (!ctx?.direction || ctx.direction !== 'LONG') return null;
  if (!isBtcWeakVeto(gateState?.classification)) return null;
  const streak = Number(gateState?.weak_streak || 0);
  // Notify only when BTC_WEAK first activates on a live LONG. If it persists
  // to >=3 samples, the presentation-only FAILED health path handles that.
  if (streak !== 1) return null;
  const key = `${gateState.classification}:activated`;
  if (ctx.health?.last_btc_weak_notified_key === key) return null;
  ctx.health = ctx.health || {};
  ctx.health.last_btc_weak_notified_key = key;
  ctx.health.last_btc_weak_notified_at = current.timestamp_utc || nowIso();
  const deliveryScope = healthDeliveryScopeForContext({ ...ctx, asset });
  return event(asset, 'ACTIVE_CONTEXT_BTC_WEAK', current, null, `BTC_WEAK now active on live ${ctx.direction} context (streak ${streak})`, {
    active_context: ctx,
    context_update: {
      type: 'ACTIVE_CONTEXT_HEALTH',
      status: ctx.health.status || null,
      btc_gate: gateState.classification,
      weak_streak: streak,
    },
    health_delivery_scope: deliveryScope,
    telegram_suppressed: deliveryScope.log_only ? { reason: deliveryScope.reason } : null,
    cooldown_ms: 15 * 60 * 1000,
  });
}

function buildHealthTransitionEvent(asset, current, ctx, previousStatus) {
  const status = ctx?.health?.status || null;
  const type = healthUpdateTypeForStatus(status);
  if (!type) return null;
  if (status === previousStatus) return null;
  if (ctx.health.last_notified_status === status) return null;
  ctx.health.last_notified_status = status;
  ctx.health.last_notified_at = current.timestamp_utc || nowIso();
  const deliveryScope = healthDeliveryScopeForContext({ ...ctx, asset });
  return event(asset, type, current, null, `${ctx.direction} active context health changed ${previousStatus || 'UNKNOWN'} → ${status}`, {
    active_context: ctx,
    context_update: {
      type: 'ACTIVE_CONTEXT_HEALTH',
      previous_status: previousStatus || null,
      status,
    },
    health_delivery_scope: deliveryScope,
    telegram_suppressed: deliveryScope.log_only ? { reason: deliveryScope.reason } : null,
    cooldown_ms: 5 * 60 * 1000,
  });
}

function invalidationReason(active, m, gateState = null) {
  if (!active || !m) return null;
  const curFlow = flow(m);
  const curState = fbcState(m);
  const streak = flowStreak(m);
  const counterConfirmed = flowConfirmed(m) || streak >= 2;
  const d = compactDiagnostics(m);

  if (['FAILED'].includes(active.health?.status)) {
    return `${active.direction} no longer valid: active context health FAILED (${active.health?.reason || 'risk control triggered'})`;
  }

  if (active.direction === 'LONG') {
    if (curState === 'RETEST_FAILED') return `LONG no longer valid: reclaimed level retest failed (${curState})`;
    if (isBtcWeakVeto(btcGate(m)) && Number(gateState?.weak_streak || 0) >= 3) return `LONG no longer valid: BTC weak veto for ${gateState.weak_streak} consecutive samples`;
    if (isBullishFlow(curFlow)) {
      resetErosion(active, `confirming bullish flow ${curFlow}`);
      return null;
    }
    if (isBearishFlow(curFlow)) {
      if (counterConfirmed) return `LONG no longer valid: bearish counter-signal ${curFlow} (streak ${streak}, confirmed ${flowConfirmed(m)})`;
      return erode(active, `unconfirmed bearish counter-signal ${curFlow} streak ${streak}`);
    }
    return erode(active, `non-confirming flow ${curFlow || d.flow || 'UNKNOWN'}`);
  }

  if (active.direction === 'SHORT') {
    if (['RECLAIMED_FAILED_LEVEL', 'RETESTING_RECLAIMED_LEVEL', 'RETEST_HELD'].includes(curState)) return `SHORT no longer valid: failed level reclaimed/retesting (${curState})`;
    if (isBearishFlow(curFlow)) {
      resetErosion(active, `confirming bearish flow ${curFlow}`);
      return null;
    }
    if (isBullishFlow(curFlow)) {
      if (counterConfirmed) return `SHORT no longer valid: bullish counter-signal ${curFlow} (streak ${streak}, confirmed ${flowConfirmed(m)})`;
      return erode(active, `unconfirmed bullish counter-signal ${curFlow} streak ${streak}`);
    }
    return erode(active, `non-confirming flow ${curFlow || d.flow || 'UNKNOWN'}`);
  }

  if (d.flow === 'UNKNOWN') return `${active.direction} validity unknown: missing flow data`;
  return null;
}

function updateBtcGateState(current, state) {
  state.btc_gate_state = state.btc_gate_state || {};
  for (const asset of ASSETS) {
    if (asset === 'BTC') continue;
    const gate = btcGate(market(current, asset));
    const prev = state.btc_gate_state[asset] || {};
    const weak = isBtcWeakVeto(gate);
    state.btc_gate_state[asset] = {
      classification: gate,
      weak_streak: weak ? Number(prev.weak_streak || 0) + 1 : 0,
      updated_at: current.timestamp_utc || nowIso(),
    };
  }
}

function lifecycleId(asset, ctx) {
  return `${asset}:${ctx?.direction || 'UNKNOWN'}:${ctx?.fingerprint || ctx?.activated_at || 'unknown'}`;
}

function ensureOppositeResearchLifecycle(ctx, asset, timestampUtc = nowIso()) {
  if (!ctx) return null;
  ctx.opposite_research_lifecycle = ctx.opposite_research_lifecycle || {
    id: lifecycleId(asset, ctx),
    asset,
    direction: ctx.direction || null,
    source_type: ctx.source_type || null,
    activated_at: ctx.activated_at || null,
    activated_price: ctx.activated_price ?? null,
    status: 'OPEN',
    first_stressed_at: null,
    failed_at: null,
    anchor_type: null,
    anchor_at: null,
    updated_at: timestampUtc,
    note: 'Research-only lifecycle tracker. No Telegram/trading behavior. One active context lifecycle produces at most one opposite-watch research window.',
  };
  return ctx.opposite_research_lifecycle;
}

function updateOppositeResearchLifecycle(ctx, asset, previousHealthStatus, timestampUtc = nowIso()) {
  const status = ctx?.health?.status || null;
  if (!['STRESSED', 'FAILED', 'RECOVERING'].includes(status)) return;
  const lc = ensureOppositeResearchLifecycle(ctx, asset, timestampUtc);
  if (!lc || lc.status === 'CLOSED') return;
  // Recovery does not reset the STRESSED anchor. A lifecycle can move
  // STRESSED -> RECOVERING -> STRESSED -> FAILED, but the original
  // first_stressed_at remains the research-window anchor if it exists.
  if (status === 'STRESSED' && !lc.first_stressed_at) {
    lc.first_stressed_at = timestampUtc;
    lc.anchor_type = 'STRESSED';
    lc.anchor_at = timestampUtc;
  }
  if (status === 'FAILED' && !lc.failed_at) {
    lc.failed_at = timestampUtc;
    lc.anchor_type = lc.first_stressed_at ? 'STRESSED_THEN_FAILED' : 'FAILED';
    lc.anchor_at = lc.first_stressed_at || timestampUtc;
  }
  lc.last_health_status = status;
  lc.previous_health_status = previousHealthStatus || null;
  lc.updated_at = timestampUtc;
}

function closeOppositeResearchLifecycle(state, asset, ctx, reason, timestampUtc = nowIso()) {
  if (!ctx) return;
  const lc = ensureOppositeResearchLifecycle(ctx, asset, timestampUtc);
  if (!lc || lc.status === 'CLOSED') return;
  if (!lc.anchor_at) {
    lc.anchor_type = 'CONTEXT_CLOSED_WITHOUT_STRESS_OR_FAILED';
    lc.anchor_at = timestampUtc;
  }
  lc.status = 'CLOSED';
  lc.closed_at = timestampUtc;
  lc.close_reason = reason;
  lc.terminal_health_status = ctx.health?.status || null;
  lc.updated_at = timestampUtc;
  state.opposite_research_lifecycle_history = [...(state.opposite_research_lifecycle_history || []), { ...lc }].slice(-300);
}

function generateInvalidationAlerts(current, state, stressThresholds = {}) {
  const alerts = [];
  updateBtcGateState(current, state);
  const active = state.active_contexts || {};
  for (const asset of ASSETS) {
    const ctx = active[asset];
    if (!ctx?.direction) continue;
    const m = market(current, asset);
    const previousHealthStatus = ctx.health?.status || null;
    updateActiveContextHealth(ctx, m, state.btc_gate_state?.[asset], stressThresholds[asset], current.timestamp_utc || nowIso());
    updateOppositeResearchLifecycle(ctx, asset, previousHealthStatus, current.timestamp_utc || nowIso());
    const healthEvent = buildHealthTransitionEvent(asset, current, ctx, previousHealthStatus);
    if (healthEvent) alerts.push(healthEvent);
    const btcWeakEvent = buildBtcWeakContextEvent(asset, current, ctx, state.btc_gate_state?.[asset]);
    if (btcWeakEvent) alerts.push(btcWeakEvent);
    if (ctx.direction === 'SHORT' && m && isLeveragedChase(flow(m)) && cvdDivergenceType(m) === 'SPOT_NEGATIVE_FUTURES_POSITIVE') {
      alerts.push(event(asset, 'SHORT_CAUTION', current, null, 'active short caution: futures-led bounce against short; tighten stop / monitor closely', {
        active_context: ctx,
        cooldown_ms: 15 * 60 * 1000,
      }));
    }
    const reason = invalidationReason(ctx, m, state.btc_gate_state?.[asset]);
    if (!reason) continue;
    alerts.push(event(asset, `${ctx.direction}_INVALIDATED`, current, null, reason, {
      invalidates: ctx,
      cooldown_ms: 5 * 60 * 1000,
    }));
  }
  return alerts;
}

function archiveActiveContext(state, asset, ctx, reason, timestampUtc = nowIso()) {
  if (!ctx) return;
  closeOppositeResearchLifecycle(state, asset, ctx, reason, timestampUtc);
  state.active_context_history = [...(state.active_context_history || []), {
    asset,
    closed_at: timestampUtc,
    close_reason: reason,
    ...ctx,
  }].slice(-200);
}

function updateActiveContexts(emittedAlerts, state, current = null, stressThresholds = {}) {
  state.active_contexts = state.active_contexts || {};
  state.active_context_gate_stats = state.active_context_gate_stats || { allowed: 0, blocked: 0, blocked_events: [], allowed_events: [] };
  state.active_context_gate_stats.shadow_confirmed_contexts = Number(state.active_context_gate_stats.shadow_confirmed_contexts || 0);
  state.active_context_gate_stats.unconfirmed_contexts = Number(state.active_context_gate_stats.unconfirmed_contexts || 0);
  state.active_context_gate_stats.shadow_confirmed_events = state.active_context_gate_stats.shadow_confirmed_events || [];
  state.active_context_gate_stats.unconfirmed_events = state.active_context_gate_stats.unconfirmed_events || [];

  for (const alert of emittedAlerts) {
    const direction = activeDirectionFromAlert(alert);
    const readinessMeta = activeContextReadinessMeta(alert);
    if (
      direction &&
      !alert.telegram_suppressed &&
      !alert.active_context_blocked_by_pattern &&
      !alert.active_context_blocked_by_health &&
      !alert.active_context_blocked_by_trade_quality &&
      !alert.active_context_blocked_by_pipeline_health &&
      (readinessMeta.tier === 'shadow_confirmed' || alert.opposite_watch_inherited)
    ) {
      archiveActiveContext(state, alert.asset, state.active_contexts[alert.asset], 'replaced_by_new_active_context', alert.timestamp_utc || nowIso());
      const ctx = {
        direction,
        source_type: alert.type,
        source_alert_id: alert.id,
        activated_at: alert.timestamp_utc,
        activated_price: alert.diagnostics?.price ?? null,
        fingerprint: alert.fingerprint || fingerprint(alert),
        readiness_gate: {
          state: readinessMeta.state,
          score: readinessMeta.score,
          version: readinessMeta.version,
          threshold_score: readinessMeta.threshold_score,
        },
        readiness_tier: readinessMeta.tier,
        oi_context: alert.readiness_shadow?.source_metrics?.oi_price_regime || null,
        funding_context: alert.readiness_shadow?.source_metrics?.cross_exchange_positioning?.classification || null,
        erosion_count: 0,
        gate_validation_status: 'pending_n10_outcome_validation',
      };
      updateActiveContextHealth(ctx, market(current, alert.asset), state.btc_gate_state?.[alert.asset], stressThresholds[alert.asset], current?.timestamp_utc || alert.timestamp_utc || nowIso());
      state.active_contexts[alert.asset] = ctx;
      alert.active_context_created = ctx;

      const event = {
        timestamp_utc: alert.timestamp_utc,
        asset: alert.asset,
        type: alert.type,
        score: readinessMeta.score,
        state: readinessMeta.state,
        readiness_tier: readinessMeta.tier,
      };
      if (readinessMeta.tier === 'shadow_confirmed') {
        state.active_context_gate_stats.shadow_confirmed_contexts += 1;
        state.active_context_gate_stats.shadow_confirmed_events = [...state.active_context_gate_stats.shadow_confirmed_events, event].slice(-50);
        // Back-compat for existing Phase 3 diagnostics that still read allowed/allowed_events.
        state.active_context_gate_stats.allowed = Number(state.active_context_gate_stats.allowed || 0) + 1;
        state.active_context_gate_stats.allowed_events = [...(state.active_context_gate_stats.allowed_events || []), event].slice(-50);
      } else {
        state.active_context_gate_stats.unconfirmed_contexts += 1;
        state.active_context_gate_stats.unconfirmed_events = [...state.active_context_gate_stats.unconfirmed_events, event].slice(-50);
      }
    }
    if (alert.type === 'LONG_INVALIDATED' || alert.type === 'SHORT_INVALIDATED') {
      archiveActiveContext(state, alert.asset, state.active_contexts[alert.asset], alert.type, alert.timestamp_utc || nowIso());
      delete state.active_contexts[alert.asset];
    }
  }
}

function main() {
  const current = readJson(CURRENT_PATH, null);
  if (!current) {
    console.error(`Missing current microstructure context: ${CURRENT_PATH}`);
    process.exit(1);
  }
  const history = readJsonl(HISTORY_PATH);
  // Current run is often already appended to history. Use the last row older than
  // current timestamp as previous; fallback to second-last row.
  const currentTs = Date.parse(current.timestamp_utc || '');
  let previous = null;
  for (let i = history.length - 1; i >= 0; i -= 1) {
    const ts = Date.parse(history[i].timestamp_utc || '');
    if (Number.isFinite(currentTs) && Number.isFinite(ts) && ts < currentTs) { previous = history[i]; break; }
  }
  if (!previous && history.length >= 2) previous = history[history.length - 2];

  const state = readJson(STATE_PATH, {});
  const extras = loadExtras();
  const btc4hChange = computeBtc4hChange(history, current);
  const stressThresholds = computeStressThresholds(history, current);
  state.active_context_health_thresholds = stressThresholds;
  const raw = [
    ...generateInvalidationAlerts(current, state, stressThresholds),
    ...generateAlerts(current, previous),
    ...generateNonTelegramOpportunityAlerts(current, previous, extras, state, btc4hChange),
  ];
  const alerts = dedupe(raw, state);
  attachReadiness(alerts, current, extras, state, btc4hChange);
  attachLateLag(alerts, history, current);
  applyPatternVerdicts(alerts, state, current);
  const pipelineHealthGate = applyPipelineHealthDeliveryGate(alerts, state);
  applyEpisodeLifecycle(alerts, state, current);
  updateActiveContexts(alerts, state, current, stressThresholds);
  const hypothesis = hypothesisTracker.process({ emittedAlerts: alerts, blockedAlerts: alerts.filter(a => a.active_context_blocked), prices: null, now: current.timestamp_utc || nowIso() });
  appendJsonl(ALERTS_PATH, alerts);
  const telegram = deliverTelegram(alerts, state);
  const readinessSnapshots = buildReadinessSnapshots(current, extras, state);
  appendJsonl(READINESS_SHADOW_PATH, readinessSnapshots);
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n');

  process.stdout.write(JSON.stringify({
    ok: true,
    timestamp_utc: current.timestamp_utc,
    generated: raw.length,
    emitted: alerts.length,
    btc_4h_pct_change: btc4hChange,
    active_context_health_thresholds: stressThresholds,
    alerts: alerts.map(a => ({ asset: a.asset, type: a.type, severity: a.severity, original_severity: a.original_severity || null, reason: a.reason, telegram_suppressed: a.telegram_suppressed || null, pattern_gate: a.pattern_gate || null, pipeline_health_gate: a.pipeline_health_gate || null, research_note: a.research_note || null, readiness_shadow: a.readiness_shadow ? { direction: a.readiness_shadow.direction, score: a.readiness_shadow.score, effective_score: a.readiness_shadow.effective_score, state: a.readiness_shadow.state, divergence: a.readiness_shadow.divergence || null, regime: a.readiness_shadow.regime || null } : null })),
    readiness_snapshots: readinessSnapshots.length,
    pipeline_health_gate: { blocked: pipelineHealthGate.blocked, status: pipelineHealthGate.health?.status || null, reason: pipelineHealthGate.gate_reason || null, age_minutes: pipelineHealthGate.health?._age_minutes ?? null },
    telegram,
    hypothesis,
    out: path.relative(process.cwd(), ALERTS_PATH),
    readiness_out: path.relative(process.cwd(), READINESS_SHADOW_PATH),
  }));
}

if (require.main === module) main();

module.exports = {
  computeReadinessShadow,
  pipelineHealthGateDecision,
  applyPipelineHealthDeliveryGate,
  shouldSuppressByTradeQualityWinRate,
  normalizeBtcGate,
  isBtcWeakVeto,
  BTC_WEAK_VETO_GATE,
  BTC_PERMITS_GATE,
  BTC_CONFIRMS_LEGACY_GATE,
  GATE_VERSION,
};
