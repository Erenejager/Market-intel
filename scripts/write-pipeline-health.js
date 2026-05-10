#!/usr/bin/env node
/*
  Writes data/pipeline-health.json after the 15m market-intel pipeline runs.

  Purpose: detect two different failure classes:
  1) Did the cron pipeline steps run recently?
  2) Are the input/output files those steps depend on fresh?

  This is observability-only. It does not send Telegram or change alert routing.
*/

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const LOGS = path.join(DATA, 'autoresearch', 'logs');
const OUT = path.join(DATA, 'pipeline-health.json');
const STATE_PATH = path.join(DATA, 'pipeline-health-state.json');
const CONFIG_PATH = path.join(ROOT, 'config.json');
const MAX_AGE_MS = 20 * 60 * 1000;
const WARN_AGE_MS = 30 * 60 * 1000;

function nowIso() { return new Date().toISOString(); }
function rel(file) { return path.relative(ROOT, file); }
function readJson(file) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; } }
function stat(file) { try { return fs.statSync(file); } catch { return null; } }
function ageMinutes(ms) { return Number.isFinite(ms) ? Math.round(ms / 60000) : null; }
function latestJsonlTimestamp(file) {
  try {
    const lines = fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean);
    for (let i = lines.length - 1; i >= Math.max(0, lines.length - 20); i -= 1) {
      const row = JSON.parse(lines[i]);
      const ts = Date.parse(row.timestamp_utc || row.timestamp || '');
      if (Number.isFinite(ts)) return ts;
    }
  } catch {}
  return null;
}
function timestampMs(file, kind = 'json') {
  if (kind === 'jsonl') return latestJsonlTimestamp(file);
  const json = readJson(file);
  if (json) {
    const ts = Date.parse(json.timestamp_utc || json.timestamp || json.generated_at || json.updated_at || '');
    if (Number.isFinite(ts)) return ts;
  }
  const s = stat(file);
  return s ? s.mtimeMs : null;
}
function freshnessCheck(name, file, { kind = 'json', maxAgeMs = MAX_AGE_MS, critical = true } = {}) {
  const ts = timestampMs(file, kind);
  const exists = !!stat(file);
  const ageMs = Number.isFinite(ts) ? Date.now() - ts : null;
  let status = 'OK';
  const reasons = [];
  if (!exists) { status = critical ? 'DEGRADED' : 'PARTIAL'; reasons.push('missing'); }
  else if (!Number.isFinite(ts)) { status = critical ? 'DEGRADED' : 'PARTIAL'; reasons.push('no timestamp or mtime'); }
  else if (ageMs > maxAgeMs) { status = critical ? 'DEGRADED' : 'PARTIAL'; reasons.push(`stale ${ageMinutes(ageMs)}m > ${ageMinutes(maxAgeMs)}m`); }
  return { name, file: rel(file), exists, timestamp_utc: Number.isFinite(ts) ? new Date(ts).toISOString() : null, age_minutes: ageMinutes(ageMs), max_age_minutes: ageMinutes(maxAgeMs), critical, status, reasons };
}
function runCheck(name, logFile, { maxAgeMs = WARN_AGE_MS, critical = true } = {}) {
  const s = stat(logFile);
  const ageMs = s ? Date.now() - s.mtimeMs : null;
  let status = 'OK';
  const reasons = [];
  if (!s) { status = critical ? 'DEGRADED' : 'PARTIAL'; reasons.push('log missing'); }
  else if (ageMs > maxAgeMs) { status = critical ? 'DEGRADED' : 'PARTIAL'; reasons.push(`not updated ${ageMinutes(ageMs)}m > ${ageMinutes(maxAgeMs)}m`); }
  return { name, log: rel(logFile), last_updated_utc: s ? new Date(s.mtimeMs).toISOString() : null, age_minutes: ageMinutes(ageMs), max_age_minutes: ageMinutes(maxAgeMs), critical, status, reasons };
}
function rollup(checks) {
  if (checks.some(c => c.status === 'DEGRADED')) return 'DEGRADED';
  if (checks.some(c => c.status === 'PARTIAL')) return 'PARTIAL';
  return 'OK';
}
function statusRank(status) {
  if (status === 'DEGRADED') return 2;
  if (status === 'PARTIAL') return 1;
  return 0;
}
function transitionKind(prev, next) {
  if (!prev || prev === next) return null;
  if (prev === 'OK' && next !== 'OK') return 'DEGRADED_FROM_OK';
  if (prev !== 'OK' && next === 'OK') return 'RECOVERED_TO_OK';
  if (statusRank(next) > statusRank(prev)) return 'WORSENED';
  if (statusRank(next) < statusRank(prev)) return 'IMPROVED';
  return null;
}
function formatHealthMessage(output, previousStatus, kind) {
  const icon = output.status === 'OK' ? '✅' : output.status === 'DEGRADED' ? '🚨' : '⚠️';
  const lines = [
    `${icon} Market-intel pipeline health ${previousStatus || 'UNKNOWN'} → ${output.status}`,
    `Transition: ${kind}`,
    `Time: ${output.timestamp_utc}`,
  ];
  if (output.degraded_reasons.length) {
    lines.push('Reasons:');
    for (const r of output.degraded_reasons.slice(0, 8)) lines.push(`- ${r}`);
    if (output.degraded_reasons.length > 8) lines.push(`- ...${output.degraded_reasons.length - 8} more`);
  } else {
    lines.push('All monitored steps/files are fresh.');
  }
  lines.push('Health alert only. Phase1d trade Telegram delivery is blocked while health is non-OK/stale.');
  return lines.join('\n');
}
function maybeSendTransitionTelegram(output) {
  const previous = readJson(STATE_PATH) || {};
  const previousStatus = previous.status || null;
  const kind = transitionKind(previousStatus, output.status);
  const state = {
    timestamp_utc: output.timestamp_utc,
    status: output.status,
    previous_status: previousStatus,
    last_transition_kind: kind,
    last_transition_at: kind ? output.timestamp_utc : previous.last_transition_at || null,
    last_degraded_reasons: output.degraded_reasons.slice(0, 20),
  };
  fs.writeFileSync(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`);
  if (!kind) return { sent: false, reason: previousStatus ? 'no_status_transition' : 'initial_state_recorded' };
  if (process.env.PIPELINE_HEALTH_DISABLE_TELEGRAM === '1') return { sent: false, reason: 'disabled_by_env', transition: kind };
  const config = readJson(CONFIG_PATH) || {};
  const channel = config.telegram?.channel || 'telegram';
  const target = config.telegram?.to || 'YOUR_TELEGRAM_CHAT_ID';
  const message = formatHealthMessage(output, previousStatus, kind);
  const result = spawnSync('openclaw', ['message', 'send', '--channel', channel, '--target', String(target), '--message', message], {
    encoding: 'utf8',
    timeout: 30_000,
  });
  return {
    sent: result.status === 0,
    transition: kind,
    channel,
    target: String(target),
    error: result.status === 0 ? null : (result.stderr || result.stdout || `exit ${result.status}`),
  };
}

const step_checks = [
  runCheck('price_sampler', path.join(LOGS, 'price-sampler-cron.out')),
  runCheck('regime_shadow', path.join(LOGS, 'regime-shadow-cron.out')),
  runCheck('backpack_snapshot_fetch', path.join(LOGS, 'backpack-snapshot-cron.out')),
  runCheck('binance_context_fetch', path.join(LOGS, 'binance-context-cron.out')),
  runCheck('microstructure_collector', path.join(LOGS, 'microstructure-cron.out')),
  runCheck('trade_quality_report_build', path.join(LOGS, 'trade-quality-cron.out')),
  runCheck('phase1d_alerts', path.join(LOGS, 'phase1d-alerts-cron.out')),
];

const file_checks = [
  freshnessCheck('price_samples', path.join(DATA, 'autoresearch', 'price-15m.jsonl'), { kind: 'jsonl' }),
  freshnessCheck('regime_current', path.join(DATA, 'regime-current.json')),
  freshnessCheck('backpack_snapshot_lite', path.join(DATA, 'backpack-snapshot-lite.json')),
  freshnessCheck('backpack_snapshot_full', path.join(DATA, 'backpack-snapshot.json')),
  freshnessCheck('binance_context', path.join(DATA, 'binance-context.json')),
  freshnessCheck('microstructure_context', path.join(DATA, 'microstructure-context.json')),
  freshnessCheck('phase1d_alert_state', path.join(DATA, 'phase1d-alert-state.json'), { maxAgeMs: WARN_AGE_MS, critical: false }),
  freshnessCheck('trade_quality_report', path.join(DATA, 'trade-quality-report.json'), { maxAgeMs: 6 * 60 * 60 * 1000, critical: false }),
];

const checks = [...step_checks, ...file_checks];
const status = rollup(checks);
const degraded_reasons = checks.flatMap(c => (c.reasons || []).map(r => `${c.name}: ${r}`));
const output = {
  timestamp_utc: nowIso(),
  status,
  max_age_minutes_default: ageMinutes(MAX_AGE_MS),
  step_checks,
  file_checks,
  degraded_reasons,
  behavior: 'health_transition_pings_plus_phase1d_trade_delivery_hard_gate',
};

fs.writeFileSync(OUT, `${JSON.stringify(output, null, 2)}\n`);
const telegram = maybeSendTransitionTelegram(output);
process.stdout.write(JSON.stringify({ ok: true, out: rel(OUT), status, degraded_reasons: degraded_reasons.slice(0, 8), telegram }));
