#!/usr/bin/env node
/*
  Telegram alert LLM reviewer — advisory-only follow-up layer.

  This script is intentionally separate from phase1d-alerts.js so the primary
  Telegram alert can be delivered immediately. phase1d-alerts.js launches this
  script asynchronously after a successful Telegram send.

  Behavior:
  - Builds a structured context packet for one Telegram-delivered alert.
  - Asks the configured OpenClaw LLM for a skeptical second opinion.
  - Logs every attempt to data/llm-review-log.jsonl before outcome backfill.
  - Sends a second Telegram message with an advisory-only summary when enabled.

  It does not change alert generation, delivery, readiness, active contexts,
  or gating.
*/

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const ALERTS_PATH = path.join(DATA, 'phase1d-alerts.jsonl');
const STATE_PATH = path.join(DATA, 'phase1d-alert-state.json');
const CURRENT_PATH = path.join(DATA, 'microstructure-context.json');
const HISTORY_PATH = path.join(DATA, 'microstructure-history.jsonl');
const BACKPACK_LITE_PATH = path.join(DATA, 'backpack-snapshot-lite.json');
const REGIME_CURRENT_PATH = path.join(DATA, 'regime-current.json');
const EMPIRICAL_WATCH_REPORT_PATH = path.join(DATA, 'empirical-watch-report.json');
const CONFIG_PATH = path.join(ROOT, 'config.json');
const LOG_PATH = path.join(DATA, 'llm-review-log.jsonl');

function nowIso() { return new Date().toISOString(); }
function toNum(x) { const n = Number(x); return Number.isFinite(n) ? n : null; }
function round(x, d = 6) { return Number.isFinite(x) ? Number(x.toFixed(d)) : null; }
function readJson(file, fallback = null) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } }
function readJsonl(file) {
  try { return fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(line => JSON.parse(line)); }
  catch { return []; }
}
function appendJsonl(file, row) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, JSON.stringify(row) + '\n');
}
function last(arr, n) { return Array.isArray(arr) ? arr.slice(Math.max(0, arr.length - n)) : []; }

const MAX_BACKPACK_SNAPSHOT_AGE_MS = 20 * 60 * 1000;

// backpack-snapshot-lite.json went 11 days unrefreshed (orphaned from the
// orchestrator.js-only fetch path) before this existed, silently feeding an
// 11-day-stale candle/trend/level into every review as if it were current.
function readFreshJson(file, maxAgeMs = MAX_BACKPACK_SNAPSHOT_AGE_MS) {
  const json = readJson(file, null);
  if (!json) return { value: {}, stale: false, age_minutes: null, reason: 'missing or unparsable' };
  const tsMs = Date.parse(json.timestamp_utc || json.timestamp || json.updated_at || '');
  if (!Number.isFinite(tsMs)) return { value: json, stale: false, age_minutes: null, reason: 'no timestamp' };
  const ageMs = Date.now() - tsMs;
  const ageMinutes = Math.round(ageMs / 60000);
  if (ageMs > maxAgeMs) return { value: {}, stale: true, age_minutes: ageMinutes, reason: `stale ${ageMinutes}m` };
  return { value: json, stale: false, age_minutes: ageMinutes, reason: null };
}

function directionFromAlert(alert) {
  if (alert?.readiness_shadow?.direction) return alert.readiness_shadow.direction;
  if (String(alert?.type || '').startsWith('LONG')) return 'LONG';
  if (String(alert?.type || '').startsWith('SHORT')) return 'SHORT';
  if (alert?.active_context_created?.direction) return alert.active_context_created.direction;
  if (alert?.invalidates?.direction) return alert.invalidates.direction;
  return null;
}

function empiricalSummary(alert) {
  const key = alert?.empirical_watch?.key || alert?.pattern?.key || null;
  if (!key) return null;
  const report = readJson(EMPIRICAL_WATCH_REPORT_PATH, null);
  const summary = report?.summaries?.find(s => s.key === key) || null;
  if (!summary) return { bucket_key: key, available: false };
  return {
    bucket_key: key,
    available: true,
    status: summary.status || null,
    sample_size: summary.n ?? null,
    primary_review_window: '30m_to_4h',
    note: 'For Telegram alert review, prioritize 30m-4h tactical window. If only 1h/4h/24h empirical horizons exist, use 1h as primary, 4h as secondary, and 24h only as background context.',
    horizons: summary.horizons || null,
    generated_at: report.generated_at || null,
  };
}

function flowSequence(asset, limit = 8) {
  return last(readJsonl(HISTORY_PATH), limit).map(row => ({
    timestamp_utc: row.timestamp_utc || null,
    flow: row.markets?.[asset]?.flow_quality?.classification || row.markets?.[asset]?.flow_consensus?.current || null,
    consensus_current: row.markets?.[asset]?.flow_consensus?.current || null,
    consensus_confirmed: row.markets?.[asset]?.flow_consensus?.confirmed ?? null,
    spot_taker_buy_share: row.markets?.[asset]?.flow_quality?.spot_taker_buy_share ?? null,
    futures_taker_buy_share: row.markets?.[asset]?.flow_quality?.futures_taker_buy_share ?? null,
    oi_regime: row.markets?.[asset]?.oi_price_regime?.classification || null,
    price: row.markets?.[asset]?.backpack?.order_book?.mid ?? null,
  })).filter(x => x.flow || x.price !== null);
}

function recentAlertsSameAsset(alert, limit = 8) {
  return last(readJsonl(ALERTS_PATH).filter(a => a.asset === alert.asset && a.id !== alert.id), limit).map(a => ({
    id: a.id,
    timestamp_utc: a.timestamp_utc,
    type: a.type,
    severity: a.severity,
    reason: a.reason,
    direction: directionFromAlert(a),
    readiness: a.readiness_shadow ? {
      direction: a.readiness_shadow.direction,
      score: a.readiness_shadow.score,
      effective_score: a.readiness_shadow.effective_score,
      state: a.readiness_shadow.state,
      blocked_by: a.readiness_shadow.blocked_by || null,
    } : null,
  }));
}

function previousContextSameDirection(alert, direction) {
  const state = readJson(STATE_PATH, {});
  const rows = Array.isArray(state.active_context_history) ? state.active_context_history : [];
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    const c = rows[i];
    if (c.asset !== alert.asset || c.direction !== direction) continue;
    return {
      asset: c.asset,
      direction: c.direction,
      source_type: c.source_type || null,
      activated_at: c.activated_at || null,
      source_alert_id: c.source_alert_id || null,
      terminal_status: c.terminal_status || c.status || null,
      health_status: c.health_status || c.health?.status || null,
      failed_at: c.failed_at || null,
      expired_at: c.expired_at || null,
      invalidated_at: c.invalidated_at || null,
      readiness_gate: c.readiness_gate || null,
    };
  }
  return null;
}

function buildPacket(alert) {
  const current = readJson(CURRENT_PATH, {});
  const backpackFresh = readFreshJson(BACKPACK_LITE_PATH);
  const backpack = backpackFresh.value;
  const regime = readJson(REGIME_CURRENT_PATH, null);
  const m = current?.markets?.[alert.asset] || {};
  const bp = backpack?.markets?.[alert.asset] || {};
  const r = alert.readiness_shadow || {};
  const sm = r.source_metrics || {};
  const direction = directionFromAlert(alert);
  const ob = m.backpack?.order_book || {};
  const depth25 = ob.depth_bands?.['25bps'] || null;

  return {
    schema_version: 'llm_alert_review_packet_v1',
    advisory_only: true,
    generated_at: nowIso(),
    alert: {
      id: alert.id,
      timestamp_utc: alert.timestamp_utc,
      asset: alert.asset,
      direction,
      alert_type: alert.type,
      severity: alert.severity,
      trigger_price: alert.diagnostics?.failed_level ?? null,
      current_price: alert.diagnostics?.price ?? ob.mid ?? bp.ticker?.lastPrice ?? null,
      reason: alert.reason || null,
      readiness_score: r.effective_score ?? r.score ?? null,
      readiness_state: r.state || null,
      setup_bucket: sm.oi_price_regime || m.oi_price_regime?.classification || null,
      flow_regime: alert.diagnostics?.flow || m.flow_quality?.classification || null,
      flow_streak: alert.diagnostics?.flow_streak ?? m.flow_consensus?.current_streak ?? null,
      btc_gate: alert.diagnostics?.btc_gate || sm.btc_gate || m.btc_flow_gate?.classification || null,
      system_reasons: r.reasons || [],
      active_context_created: !!alert.active_context_created,
      active_context_blocked: alert.active_context_blocked || null,
      review_window: {
        primary: '30m_to_2h',
        extended: '2h_to_4h',
        background_only: '24h',
        instruction: 'Judge entry/direction quality for the next 30 minutes to 4 hours. Do not let 24h history dominate unless short-horizon data is missing or sharply contradictory.',
      },
    },
    data_freshness: {
      backpack_snapshot_stale: backpackFresh.stale,
      backpack_snapshot_age_minutes: backpackFresh.age_minutes,
      note: backpackFresh.stale
        ? 'backpack snapshot (trend/ATR/levels/candles below) is stale and has been omitted; treat those fields as missing, not as current.'
        : null,
    },
    current_market: {
      btc_regime: regime?.state || null,
      btc_squeeze_risk: typeof regime?.squeeze_risk === 'string' ? regime.squeeze_risk : regime?.squeeze_risk?.state || null,
      btc_flush_risk: typeof regime?.flush_risk === 'string' ? regime.flush_risk : regime?.flush_risk?.state || null,
      asset_4h_trend: bp.derived?.trend_4h || sm.long_horizon_regime?.trend_4h || null,
      asset_7d_return_pct: sm.long_horizon_regime?.return_7d_pct ?? null,
      atr_1h: bp.derived?.atr_14_1h ?? null,
      atr_4h: bp.derived?.atr_14_4h ?? null,
      price_vs_key_levels: {
        support: bp.derived?.levels_1h?.support || null,
        resistance: bp.derived?.levels_1h?.resistance || null,
      },
      last_1h_candle: bp.last_1h_candle || null,
      last_4h_candle: bp.last_4h_candle || null,
    },
    perps: {
      oi_regime: m.oi_price_regime?.classification || sm.oi_price_regime || null,
      oi_change_30m: m.oi_price_regime?.oi_change_30m ?? null,
      oi_change_4h: m.oi_price_regime?.oi_change_4h ?? null,
      price_change_from_1h_open: m.oi_price_regime?.price_change_from_1h_open ?? null,
      funding_cross_exchange: m.cross_exchange_positioning || sm.cross_exchange_positioning || null,
      futures_cvd: m.flow_quality?.futures_cvd_notional ?? null,
      futures_taker_buy_share: m.flow_quality?.futures_taker_buy_share ?? null,
    },
    spot: {
      spot_cvd: m.flow_quality?.spot_cvd_notional ?? null,
      spot_taker_buy_share: m.flow_quality?.spot_taker_buy_share ?? null,
      spot_bias: m.flow_quality?.spot_bias || null,
      spot_vs_futures_read: m.flow_quality?.rationale || null,
    },
    orderbook_liquidity: {
      spread_bps: ob.spread_bps ?? null,
      depth_25bps_imbalance: depth25?.imbalance ?? null,
      depth_25bps_bid_notional: depth25?.bid_notional ?? null,
      depth_25bps_ask_notional: depth25?.ask_notional ?? null,
      trigger_zone_liquidity: ob.trigger_zone || null,
    },
    recent_history: {
      flow_sequence: flowSequence(alert.asset, 8),
      recent_alerts_same_asset: recentAlertsSameAsset(alert, 8),
      previous_context_same_direction: previousContextSameDirection(alert, direction),
    },
    empirical_history: empiricalSummary(alert),
  };
}

function reviewerPrompt(packet) {
  return `You are an advisory-only second-opinion reviewer for a crypto Telegram alert system.\n\nYour job is skeptical review: find whether the current context strengthens or weakens the alert direction. You are not generating a new signal and you must not change delivery/gating behavior.\n\nRules:\n- Return ONLY valid JSON matching the schema below. No markdown.\n- Do not invent numeric odds or calibrated probabilities.\n- Use empirical_history as the authoritative historical prior when available. Do not re-estimate it.\n- prior_vs_now means whether current context strengthens or weakens the empirical prior: above, below, neutral, or insufficient_data.\n- The review horizon is tactical: entry and direction quality over the next 30 minutes to 4 hours. Prioritize current spot/perp flow, order book, OI/funding, 1h empirical outcomes, recent flow sequence, and nearby levels for entry timing. Use 4h empirical outcomes/trend for tactical continuation. Treat 24h as background only, not the main verdict driver.\n- If important fields are null, ignore them and mention missing data only if it materially affects the verdict.\n- Check data_freshness first. If backpack_snapshot_stale is true, treat asset_4h_trend, atr_1h, atr_4h, price_vs_key_levels, last_1h_candle, and last_4h_candle as unavailable, not as current data, and rely on perps/spot/flow_sequence/empirical_history instead.\n- Be especially alert for: crowded shorts/longs, spot-perp divergence, BTC regime/gate conflict, unknown squeeze/flush risk, low sample empirical history, stale or contradicted context.\n- If btc_squeeze_risk is BULLISH_SQUEEZE or known bullish squeeze risk, direction_verdict must be STAND_ASIDE. If it is UNKNOWN, treat it only as a risk flag, not a hard block.\n- Do not add generic caveats such as DYOR or markets are unpredictable.\n- main_reason, execution_note, and telegram_summary must speak about the 30m to 4h tactical window, not a 24h swing view.\n- telegram_summary must start with "LLM review advisory only:" and be short enough for Telegram.\n\nReturn schema:\n{\n  "direction_verdict": "AGREE | DISAGREE | MIXED | STAND_ASIDE",\n  "confidence_label": "HIGH | MEDIUM | LOW",\n  "prior_vs_now": "above | below | neutral | insufficient_data",\n  "review_horizon": "30m_to_4h",\n  "main_reason": "one sentence",\n  "risk_flags": ["short strings"],\n  "execution_note": "one sentence",\n  "telegram_summary": "LLM review advisory only: ..."\n}\n\nAlert packet:\n${JSON.stringify(packet)}`;
}

function extractJsonObject(text) {
  const raw = String(text || '').trim();
  try { return JSON.parse(raw); } catch {}
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try { return JSON.parse(raw.slice(start, end + 1)); } catch {}
  }
  return null;
}

function callLlm(prompt, reviewerConfig) {
  if (process.env.LLM_REVIEW_DISABLE_MODEL === '1') {
    return {
      ok: true,
      skipped: true,
      latency_ms: 0,
      parsed: {
        direction_verdict: 'MIXED',
        confidence_label: 'LOW',
        prior_vs_now: 'insufficient_data',
        review_horizon: '30m_to_4h',
        main_reason: 'Dry-run model disabled; no live LLM review was requested.',
        risk_flags: ['dry_run'],
        execution_note: 'No execution note in dry run.',
        telegram_summary: 'LLM review advisory only: DRY RUN — model disabled; no live verdict.',
      },
      stdout: '',
      stderr: '',
      model: 'dry-run',
    };
  }

  const model = reviewerConfig.model && reviewerConfig.model !== 'openclaw-default' ? reviewerConfig.model : null;
  const transport = reviewerConfig.transport || 'agent';
  const timeoutMs = Number(reviewerConfig.timeout_ms || 45_000);
  const timeoutSeconds = Math.max(5, Math.ceil(timeoutMs / 1000));
  const sessionId = `market-intel-llm-review-${Date.now()}-${crypto.createHash('sha1').update(prompt).digest('hex').slice(0, 8)}`;
  let args;
  if (transport === 'infer') {
    args = ['infer', 'model', 'run', '--gateway', '--json', '--prompt', prompt];
    if (model) args.splice(4, 0, '--model', model);
  } else {
    // Use the same Gateway-backed agent/model path OpenClaw uses in chat. A
    // unique session keeps reviews independent and avoids prompt accumulation.
    args = ['agent', '--session-id', sessionId, '--json', '--timeout', String(timeoutSeconds), '--thinking', 'off', '--message', prompt];
    if (model) args.splice(1, 0, '--model', model);
  }
  const started = Date.now();
  const res = spawnSync('openclaw', args, {
    cwd: path.dirname(ROOT),
    encoding: 'utf8',
    timeout: timeoutMs,
    maxBuffer: 2 * 1024 * 1024,
  });
  const latencyMs = Date.now() - started;
  let text = String(res.stdout || '').trim();
  const outer = extractJsonObject(text);
  // Different OpenClaw CLI versions use different JSON envelopes. Try common fields.
  if (outer && typeof outer === 'object' && !outer.direction_verdict) {
    text = outer.text
      || outer.output
      || outer.response
      || outer.message
      || outer.content
      || outer.result?.payloads?.[0]?.text
      || outer.result?.text
      || outer.result?.output
      || JSON.stringify(outer);
  }
  const parsed = extractJsonObject(text);
  return {
    ok: res.status === 0 && !!parsed,
    status: res.status,
    signal: res.signal,
    latency_ms: latencyMs,
    parsed,
    stdout: String(res.stdout || '').trim().slice(0, 4000),
    stderr: String(res.stderr || '').trim().slice(0, 4000),
    model: model || 'openclaw-default',
    transport,
    session_id: transport === 'agent' ? sessionId : null,
  };
}

function normalizeReview(x) {
  const allowedVerdicts = new Set(['AGREE', 'DISAGREE', 'MIXED', 'STAND_ASIDE']);
  const allowedConfidence = new Set(['HIGH', 'MEDIUM', 'LOW']);
  const allowedPrior = new Set(['above', 'below', 'neutral', 'insufficient_data']);
  const verdict = String(x?.direction_verdict || 'MIXED').toUpperCase();
  const confidence = String(x?.confidence_label || 'LOW').toUpperCase();
  const prior = String(x?.prior_vs_now || 'insufficient_data').toLowerCase();
  return {
    direction_verdict: allowedVerdicts.has(verdict) ? verdict : 'MIXED',
    confidence_label: allowedConfidence.has(confidence) ? confidence : 'LOW',
    prior_vs_now: allowedPrior.has(prior) ? prior : 'insufficient_data',
    review_horizon: String(x?.review_horizon || '30m_to_4h').slice(0, 40),
    main_reason: String(x?.main_reason || '').slice(0, 500),
    risk_flags: Array.isArray(x?.risk_flags) ? x.risk_flags.map(v => String(v).slice(0, 80)).slice(0, 8) : [],
    execution_note: String(x?.execution_note || '').slice(0, 500),
    telegram_summary: String(x?.telegram_summary || '').slice(0, 900),
  };
}

function formatTelegramReview(review, packet) {
  const lines = [];
  const summary = review.telegram_summary.startsWith('LLM review advisory only:')
    ? review.telegram_summary
    : `LLM review advisory only: ${review.telegram_summary}`;
  lines.push(summary);
  lines.push(`Verdict: ${review.direction_verdict} / ${review.confidence_label} confidence / ${review.review_horizon || '30m_to_4h'} / prior ${review.prior_vs_now}`);
  if (review.main_reason) lines.push(`Why: ${review.main_reason}`);
  if (review.risk_flags?.length) lines.push(`Risk flags: ${review.risk_flags.join(', ')}`);
  if (review.execution_note) lines.push(`Execution: ${review.execution_note}`);
  lines.push(`Alert: ${packet.alert.asset} ${packet.alert.alert_type} ${packet.alert.direction || ''}`.trim());
  lines.push('No suppression/gating impact; logged for outcome validation.');
  return lines.join('\n');
}

function sendTelegram(message, config) {
  const channel = config.telegram?.channel || 'telegram';
  const target = config.telegram?.to || 'YOUR_TELEGRAM_CHAT_ID';
  if (process.env.LLM_REVIEW_DISABLE_TELEGRAM === '1' || process.env.PHASE1D_DISABLE_TELEGRAM === '1') {
    return { ok: true, skipped: true, reason: 'telegram disabled by env', channel, target: String(target) };
  }
  const sent = spawnSync('openclaw', ['message', 'send', '--channel', channel, '--target', String(target), '--message', message], {
    cwd: path.dirname(ROOT),
    encoding: 'utf8',
    timeout: 30_000,
  });
  return {
    ok: sent.status === 0,
    status: sent.status,
    channel,
    target: String(target),
    stdout: String(sent.stdout || '').trim().slice(0, 1000),
    stderr: String(sent.stderr || '').trim().slice(0, 1000),
  };
}

function main() {
  const alertId = process.argv[2];
  if (!alertId) throw new Error('Usage: llm-review-alert.js <alert_id>');
  const config = readJson(CONFIG_PATH, {});
  const reviewerConfig = config.llm_reviewer || {};
  if (reviewerConfig.enabled === false && process.env.LLM_REVIEW_FORCE !== '1') return;

  const alert = readJsonl(ALERTS_PATH).find(a => a.id === alertId);
  if (!alert) throw new Error(`Alert not found: ${alertId}`);
  const packet = buildPacket(alert);
  const prompt = reviewerPrompt(packet);
  const llm = callLlm(prompt, reviewerConfig);
  const review = llm.parsed ? normalizeReview(llm.parsed) : null;
  const telegram = review ? sendTelegram(formatTelegramReview(review, packet), config) : null;

  appendJsonl(LOG_PATH, {
    schema_version: 'llm_review_log_v1',
    alert_id: alert.id,
    timestamp_utc: nowIso(),
    alert_timestamp_utc: alert.timestamp_utc || null,
    asset: alert.asset,
    direction: packet.alert.direction,
    alert_type: alert.type,
    model: llm.model,
    transport: llm.transport || null,
    session_id: llm.session_id || null,
    advisory_only: true,
    direction_verdict: review?.direction_verdict || null,
    confidence_label: review?.confidence_label || null,
    prior_vs_now: review?.prior_vs_now || null,
    review_horizon: review?.review_horizon || null,
    main_reason: review?.main_reason || null,
    risk_flags: review?.risk_flags || [],
    execution_note: review?.execution_note || null,
    telegram_summary: review?.telegram_summary || null,
    latency_ms: llm.latency_ms,
    llm_ok: llm.ok,
    llm_status: llm.status ?? null,
    llm_signal: llm.signal || null,
    llm_skipped: llm.skipped || false,
    llm_error: llm.ok ? null : { stdout: llm.stdout, stderr: llm.stderr },
    telegram_delivery: telegram,
    packet_summary: {
      readiness_state: packet.alert.readiness_state,
      readiness_score: packet.alert.readiness_score,
      setup_bucket: packet.alert.setup_bucket,
      flow_regime: packet.alert.flow_regime,
      btc_regime: packet.current_market.btc_regime,
      empirical_bucket: packet.empirical_history?.bucket_key || null,
      empirical_status: packet.empirical_history?.status || null,
      backpack_snapshot_stale: packet.data_freshness.backpack_snapshot_stale,
      backpack_snapshot_age_minutes: packet.data_freshness.backpack_snapshot_age_minutes,
    },
    outcome_1h_pct: null,
    outcome_4h_pct: null,
    outcome_24h_pct: null,
  });
}

if (require.main === module) {
  try { main(); }
  catch (e) {
    appendJsonl(LOG_PATH, {
      schema_version: 'llm_review_log_v1',
      alert_id: process.argv[2] || null,
      timestamp_utc: nowIso(),
      advisory_only: true,
      llm_ok: false,
      fatal_error: e.message,
      outcome_1h_pct: null,
      outcome_4h_pct: null,
      outcome_24h_pct: null,
    });
    process.exitCode = 1;
  }
}

module.exports = {
  buildPacket,
  reviewerPrompt,
  callLlm,
  normalizeReview,
  formatTelegramReview,
  readJsonl,
  ALERTS_PATH,
  CONFIG_PATH,
  readJson,
};
