#!/usr/bin/env node
/*
  Maintain Telegram pattern gate from exact-pattern 6h MFE/MAE distribution.

  Policy only. Stats are computed by build-trade-quality-report.js.
*/
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const tradeQuality = require('./trade-quality');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const GATE_PATH = path.join(DATA, 'telegram-pattern-gate.json');
const HISTORY_PATH = path.join(DATA, 'telegram-pattern-gate-history.json');
const DECISIONS_PATH = path.join(DATA, 'telegram-pattern-gate-decisions.jsonl');
const CONFIG_PATH = path.join(ROOT, 'config.json');
const ALERTS_PATH = path.join(DATA, 'phase1d-alerts.jsonl');
const PRICE_PATH = path.join(DATA, 'autoresearch', 'price-15m.jsonl');

const DEFAULT_CAP = { cap: 2, window_ms: 6 * 60 * 60 * 1000 };
const DEMOTE_MIN_N = 5;
const DEMOTE_MIN_MFE_BEATS_MAE_PCT = 70;
const PROMOTE_MIN_N = 20;
const PROMOTE_MIN_MFE_BEATS_MAE_PCT = 75;
const PROMOTE_CONSECUTIVE_RUNS = 2;
const REPORT_SOFT_STALE_MS = 36 * 60 * 60 * 1000;
const UPSTREAM_HARD_STALE_MS = 2 * 60 * 60 * 1000;

function readJson(file, fallback = null) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } }
function writeJson(file, value) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`); }
function appendJsonl(file, rows) { if (!rows.length) return; fs.mkdirSync(path.dirname(file), { recursive: true }); fs.appendFileSync(file, `${rows.map(r => JSON.stringify(r)).join('\n')}\n`); }
function pct(x, d = 1) { return Number.isFinite(x) ? `${x.toFixed(d)}%` : 'n/a'; }
function signedPct(x, d = 3) { return Number.isFinite(x) ? `${x >= 0 ? '+' : ''}${x.toFixed(d)}%` : 'n/a'; }
function nowIso() { return new Date().toISOString(); }
function today() { return nowIso().slice(0, 10); }
function parseArgs(argv = process.argv.slice(2)) {
  return {
    dryRun: argv.includes('--dry-run'),
    noTelegram: argv.includes('--no-telegram'),
    verbose: argv.includes('--verbose'),
  };
}
function tailJsonlTimestamp(file) {
  let rows;
  try { rows = fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean); } catch { return null; }
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    try {
      const row = JSON.parse(rows[i]);
      const ms = Date.parse(row.timestamp_utc || row.timestamp || row.generated_at || '');
      if (Number.isFinite(ms)) return { ms, timestamp_utc: new Date(ms).toISOString() };
    } catch {}
  }
  return null;
}
function ageMs(ms) { return Number.isFinite(ms) ? Date.now() - ms : Infinity; }
function seedGate() {
  return {
    generated_at: nowIso(),
    source: 'maintainer_default_seed',
    default_cap: { ...DEFAULT_CAP },
    patterns: {
      ETH_BTC_PERMITS_ALT_LONG_INVERSE_SHORT_POSTFIX: {
        status: 'enabled', since: '2026-07-01', reason: 'default seed', telegram_cap: { ...DEFAULT_CAP },
      },
      BTC_LONG_SETUP_INVERSE_SHORT_POSTFIX: {
        status: 'enabled', since: '2026-07-01', reason: 'default seed', telegram_cap: { ...DEFAULT_CAP },
      },
      ETH_LONG_BLOCKED_SELL_PRESSURE_INVERSE_SHORT_POSTFIX: { status: 'disabled', since: '2026-07-01', reason: 'default seed' },
      SOL_SHORT_BLOCKED_SPOT_LED_INVERSE_LONG_POSTFIX: { status: 'disabled', since: '2026-07-01', reason: 'default seed' },
      ETH_LONG_SETUP_STRUCTURAL_BUYING_INVERSE_SHORT: { status: 'disabled', since: '2026-07-01', reason: 'default seed' },
      ETH_LONG_SHADOW_SETUP_FORMING_INVERSE_SHORT: { status: 'disabled', since: '2026-07-01', reason: 'default seed' },
      ETH_LONGS_EXITING_BROAD_SHORT_PRESSURE_LONG_POSTFIX: { status: 'disabled', since: '2026-07-01', reason: 'default seed' },
      SOL_SHORTS_COVERING_BROAD_SHORT_PRESSURE_INVERSE_SHORT_POSTFIX: { status: 'disabled', since: '2026-07-01', reason: 'default seed' },
    },
  };
}
function normalizeGate(gate) {
  const out = gate && gate.patterns && typeof gate.patterns === 'object' ? gate : seedGate();
  out.default_cap = out.default_cap || { ...DEFAULT_CAP };
  out.patterns = out.patterns || {};
  for (const [key, entry] of Object.entries(out.patterns)) {
    if (entry.status === 'enabled' && !entry.telegram_cap) entry.telegram_cap = { ...out.default_cap };
    if (!entry.since) entry.since = today();
    if (!entry.reason) entry.reason = 'normalized by maintainer';
    out.patterns[key] = entry;
  }
  return out;
}
function pathStats(summary) {
  const p = summary?.path6h || {};
  return {
    n: Number(summary?.n),
    rrN: Number(p.episodes_mfe_beats_mae_n),
    rrCount: Number(p.episodes_mfe_beats_mae_count),
    rrPct: Number(p.episodes_mfe_beats_mae_pct),
    mfeP25: Number(p.mfe_distribution?.p25),
    mfeMedian: Number(p.mfe_distribution?.median),
    mfeP75: Number(p.mfe_distribution?.p75),
    maeP25: Number(p.mae_distribution?.p25),
    maeMedian: Number(p.mae_distribution?.median),
    maeMin: Number(p.mae_distribution?.min),
    favorableFirstPct: Number(p.favorable_first_rate_pct),
  };
}
function tailRisk(summary) {
  const s = pathStats(summary);
  const reasons = [];
  if (Number.isFinite(s.maeP25) && s.maeP25 <= -1.25) reasons.push(`mae_p25 ${signedPct(s.maeP25)} <= -1.25%`);
  if (Number.isFinite(s.maeMin) && s.maeMin <= -3.0) reasons.push(`mae_min ${signedPct(s.maeMin)} <= -3.0%`);
  if (Number.isFinite(s.maeMin) && Number.isFinite(s.maeMedian) && Math.abs(s.maeMin) > 3 * Math.max(Math.abs(s.maeMedian), 0.35)) {
    reasons.push(`mae_min ${signedPct(s.maeMin)} > 3x max(abs(median),0.35%)`);
  }
  if (Number.isFinite(s.mfeP25) && s.mfeP25 < 0.25) reasons.push(`mfe_p25 ${signedPct(s.mfeP25)} < +0.25%`);
  return { ok: reasons.length === 0, reasons };
}
function qualifiesForPromotion(summary) {
  const s = pathStats(summary);
  const tail = tailRisk(summary);
  const reasons = [];
  if (!Number.isFinite(s.n) || s.n < PROMOTE_MIN_N) reasons.push(`n ${s.n || 0} < ${PROMOTE_MIN_N}`);
  if (!Number.isFinite(s.rrPct) || s.rrPct < PROMOTE_MIN_MFE_BEATS_MAE_PCT) reasons.push(`MFE>|MAE| ${pct(s.rrPct)} < ${PROMOTE_MIN_MFE_BEATS_MAE_PCT}%`);
  if (summary?.oi_data_quarantined) reasons.push(`oi_data_quarantined: ${summary.oi_data_quarantine_reason || 'true'}`);
  if (!tail.ok) reasons.push(...tail.reasons);
  return { ok: reasons.length === 0, reasons, tail };
}
function shouldDemote(summary) {
  const s = pathStats(summary);
  return Number.isFinite(s.n) && s.n >= DEMOTE_MIN_N && Number.isFinite(s.rrPct) && s.rrPct < DEMOTE_MIN_MFE_BEATS_MAE_PCT;
}
function staleChecks(report) {
  const checks = [];
  const reportMs = Date.parse(report?.generated_at || '');
  if (!Number.isFinite(reportMs) || ageMs(reportMs) > REPORT_SOFT_STALE_MS) {
    checks.push({ level: 'soft', action: 'skipped_stale_report', feed: 'trade-quality-report.json', age_ms: ageMs(reportMs), timestamp_utc: Number.isFinite(reportMs) ? new Date(reportMs).toISOString() : null });
  }
  for (const [name, file] of [['price-15m.jsonl', PRICE_PATH], ['phase1d-alerts.jsonl', ALERTS_PATH]]) {
    const latest = tailJsonlTimestamp(file);
    if (!latest || ageMs(latest.ms) > UPSTREAM_HARD_STALE_MS) {
      checks.push({ level: 'hard', action: 'skipped_stale_upstream_feed', feed: name, age_ms: latest ? ageMs(latest.ms) : Infinity, timestamp_utc: latest?.timestamp_utc || null });
    }
  }
  return checks;
}
function decisionRow({ action, patternKey = null, summary = null, previousStatus = null, newStatus = null, reason = null, dryRun = false, extra = {} }) {
  const s = pathStats(summary);
  return {
    timestamp_utc: nowIso(),
    dry_run: dryRun,
    pattern_key: patternKey,
    action,
    previous_status: previousStatus,
    new_status: newStatus,
    reason,
    n: Number.isFinite(s.n) ? s.n : null,
    mfe_beats_mae_pct: Number.isFinite(s.rrPct) ? s.rrPct : null,
    mfe_beats_mae_count: Number.isFinite(s.rrCount) ? s.rrCount : null,
    mfe_beats_mae_n: Number.isFinite(s.rrN) ? s.rrN : null,
    mfe_p25: Number.isFinite(s.mfeP25) ? s.mfeP25 : null,
    mae_p25: Number.isFinite(s.maeP25) ? s.maeP25 : null,
    mae_min: Number.isFinite(s.maeMin) ? s.maeMin : null,
    latest_regime: summary?.latest_regime || null,
    btc_gate: summary?.latest_regime?.btc_gate || null,
    btc_4h_trend: summary?.latest_regime?.label || null,
    funding: summary?.latest_regime?.funding || null,
    regime_counts: summary?.regime_counts || null,
    oi_data_quarantined: summary?.oi_data_quarantined || false,
    ...extra,
  };
}
function digestMessage(changes, staleRows) {
  const lines = [`🚦 Pattern gate update (${today()})`];
  for (const row of staleRows) {
    const hours = Number.isFinite(row.age_ms) ? (row.age_ms / 3600000).toFixed(1) : 'unknown';
    lines.push(`⚠️ ${row.action}: ${row.feed} age ${hours}h`);
  }
  for (const row of changes) {
    const icon = row.action === 'promote' ? '⬆️' : row.action === 'demote' ? '⬇️' : '•';
    const cap = row.action === 'promote' ? ' (capped 2/6h)' : '';
    lines.push(`${icon} ${row.action}${cap}: ${row.pattern_key}`);
    lines.push(`   n=${row.n}, MFE>|MAE| ${pct(row.mfe_beats_mae_pct)} (${row.mfe_beats_mae_count}/${row.mfe_beats_mae_n})`);
    if (row.reason) lines.push(`   ${row.reason}`);
  }
  return lines.join('\n');
}
function sendDigest(message) {
  const config = readJson(CONFIG_PATH, {});
  const channel = config.telegram?.channel || 'telegram';
  const target = config.telegram?.to || 'YOUR_TELEGRAM_CHAT_ID';
  return spawnSync('openclaw', ['message', 'send', '--channel', channel, '--target', String(target), '--message', message], {
    cwd: path.dirname(ROOT), encoding: 'utf8', timeout: 30_000,
  });
}
function main() {
  const args = parseArgs();
  const report = tradeQuality.loadReport();
  if (!report?.summaries) throw new Error('Missing data/trade-quality-report.json; run build-trade-quality-report.js first');
  const gate = normalizeGate(readJson(GATE_PATH, null));
  const history = readJson(HISTORY_PATH, {});
  const stale = staleChecks(report);
  const staleRows = stale.map(s => ({ timestamp_utc: nowIso(), dry_run: args.dryRun, pattern_key: null, ...s }));
  const hardOrSoftStale = stale.length > 0;
  const decisions = [...staleRows];
  const changes = [];

  if (!hardOrSoftStale) {
    // Scope guard: this loop only maintains patterns that were explicitly
    // seeded/reviewed in data/telegram-pattern-gate.json. Do not mine every
    // `pattern:*` bucket in trade-quality-report.json; those labels may be
    // classifier artifacts without a human-checked thesis/trade direction.
    const patternKeys = new Set(Object.keys(gate.patterns || {}));
    for (const patternKey of [...patternKeys].sort()) {
      const summary = tradeQuality.patternSummary(patternKey, report);
      const entry = gate.patterns[patternKey];
      const status = entry.status === 'enabled' ? 'enabled' : 'disabled';
      const hist = history[patternKey] || { consecutive_qualifying_runs: 0 };
      let action = 'keep';
      let reason = null;
      let newStatus = status;
      const promo = summary ? qualifiesForPromotion(summary) : { ok: false, reasons: ['no exact pattern summary'] };

      if (status === 'enabled') {
        if (summary && shouldDemote(summary)) {
          action = 'demote';
          newStatus = 'disabled';
          reason = `MFE>|MAE| ${pct(pathStats(summary).rrPct)} below ${DEMOTE_MIN_MFE_BEATS_MAE_PCT}%`;
          gate.patterns[patternKey] = { ...entry, status: 'disabled', since: today(), reason };
        }
        hist.consecutive_qualifying_runs = promo.ok ? Math.max(Number(hist.consecutive_qualifying_runs || 0), 1) : 0;
      } else {
        if (promo.ok) {
          hist.consecutive_qualifying_runs = Number(hist.consecutive_qualifying_runs || 0) + 1;
          if (hist.consecutive_qualifying_runs >= PROMOTE_CONSECUTIVE_RUNS) {
            action = 'promote';
            newStatus = 'enabled';
            reason = `qualified ${hist.consecutive_qualifying_runs}/${PROMOTE_CONSECUTIVE_RUNS} runs; MFE>|MAE| ${pct(pathStats(summary).rrPct)}`;
            gate.patterns[patternKey] = { ...entry, status: 'enabled', since: today(), reason, telegram_cap: { ...(gate.default_cap || DEFAULT_CAP) } };
          } else {
            action = 'qualifying_watch';
            reason = `qualified ${hist.consecutive_qualifying_runs}/${PROMOTE_CONSECUTIVE_RUNS} runs before promotion`;
            gate.patterns[patternKey] = entry;
          }
        } else {
          hist.consecutive_qualifying_runs = 0;
          gate.patterns[patternKey] = entry;
          reason = promo.reasons.join('; ');
        }
      }

      hist.last_checked = today();
      hist.last_n = summary?.n || null;
      hist.last_mfe_beats_mae_pct = summary?.path6h?.episodes_mfe_beats_mae_pct ?? null;
      hist.last_qualifies_for_promotion = promo.ok;
      hist.last_promotion_blockers = promo.reasons;
      history[patternKey] = hist;

      const row = decisionRow({ action, patternKey, summary, previousStatus: status, newStatus, reason, dryRun: args.dryRun, extra: { consecutive_qualifying_runs: hist.consecutive_qualifying_runs } });
      decisions.push(row);
      if (['demote', 'promote'].includes(action)) changes.push(row);
    }
    gate.generated_at = nowIso();
    gate.source = args.dryRun ? 'maintainer_dry_run' : 'maintain-telegram-pattern-gate';
  }

  if (!args.dryRun) {
    if (!hardOrSoftStale) {
      writeJson(GATE_PATH, gate);
      writeJson(HISTORY_PATH, history);
    }
    appendJsonl(DECISIONS_PATH, decisions);
  }

  const shouldDigest = changes.length > 0 || stale.some(s => s.level === 'hard');
  let delivery = null;
  if (shouldDigest) {
    const message = digestMessage(changes, staleRows);
    if (!args.dryRun && !args.noTelegram) {
      const sent = sendDigest(message);
      delivery = { ok: sent.status === 0, status: sent.status, stdout: sent.stdout, stderr: sent.stderr };
    } else {
      delivery = { skipped: true, reason: args.dryRun ? 'dry_run' : 'no_telegram', message };
    }
  }

  const result = {
    ok: true,
    dry_run: args.dryRun,
    stale_checks: stale,
    changes: changes.map(r => ({ action: r.action, pattern_key: r.pattern_key, n: r.n, mfe_beats_mae_pct: r.mfe_beats_mae_pct, reason: r.reason })),
    decisions: decisions.length,
    gate_path: path.relative(ROOT, GATE_PATH),
    history_path: path.relative(ROOT, HISTORY_PATH),
    decisions_path: path.relative(ROOT, DECISIONS_PATH),
    delivery,
  };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (require.main === module) main();
