const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const WATCH_PATH = path.join(ROOT, 'data', 'hypothesis-watch.json');
const EVENTS_PATH = path.join(ROOT, 'data', 'hypothesis-events.jsonl');
const CONFIG_PATH = path.join(ROOT, 'config.json');

const T1_WINDOW_MS = 30 * 60 * 1000;
const HN1_MIN_SCORE = 55;
const HN1_LOW_SCORE = 50;
const HN1_HIGH_SCORE = 65;

function nowIso() { return new Date().toISOString(); }
function toNum(x) { const n = Number(x); return Number.isFinite(n) ? n : null; }
function readJson(file, fallback = null) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}
function appendJsonl(file, rows) {
  const clean = rows.filter(Boolean);
  if (!clean.length) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, clean.map(r => JSON.stringify(r)).join('\n') + '\n');
}
function tsMs(x) {
  const ms = Date.parse(x || '');
  return Number.isFinite(ms) ? ms : null;
}
function currentPrice(alert, prices) {
  return toNum(alert?.diagnostics?.price)
    ?? toNum(prices?.[alert?.asset]?.lastPrice)
    ?? toNum(prices?.[alert?.asset]);
}
function direction(alert) {
  if (alert?.type?.startsWith('LONG')) return 'LONG';
  if (alert?.type?.startsWith('SHORT')) return 'SHORT';
  return null;
}
function shadow(alert) { return alert?.readiness_shadow || null; }
function shadowScore(alert) { const r = shadow(alert); return toNum(r?.effective_score ?? r?.score); }
function oiRegime(alert) { return shadow(alert)?.source_metrics?.oi_price_regime || null; }
function btcGate(alert) { return shadow(alert)?.source_metrics?.btc_gate || alert?.diagnostics?.btc_gate || null; }
function isBtcWeakVeto(gate) { return gate === 'BTC_WEAK_VETO_ALT_LONGS' || gate === 'BTC_WEAK_PENALIZE_ALT_LONGS'; }
function funding(alert) { return shadow(alert)?.source_metrics?.cross_exchange_positioning?.classification || null; }
function flow(alert) { return shadow(alert)?.source_metrics?.flow || alert?.diagnostics?.flow || null; }
function isAlt(asset) { return asset && asset !== 'BTC'; }
function isHighConfirmed(alert) { return ['LONG_CONFIRMED', 'SHORT_CONFIRMED'].includes(alert?.type); }
function blockedByReadiness(alert) { return !!alert?.active_context_blocked; }

function addAnnotation(alert, annotation) {
  alert.pattern_annotations = alert.pattern_annotations || [];
  if (!alert.pattern_annotations.some(a => a.code === annotation.code)) alert.pattern_annotations.push(annotation);
}

function classifyProductionAnnotations(alert) {
  const out = [];
  const dir = direction(alert);
  const score = shadowScore(alert);
  const oi = oiRegime(alert);
  const gate = btcGate(alert);
  if (!isHighConfirmed(alert)) return out;

  if (alert.type === 'LONG_CONFIRMED' && oi === 'FRESH_SHORTS' && score >= 70) {
    out.push({
      code: 'H-N2-FRESH-SHORTS-LONG',
      verdict: 'MANAGEMENT_NOTE',
      title: 'FRESH_SHORTS long squeeze',
      message: 'Structural long candidate, but early drawdown is expected; prefer wider stop / 4h hold logic. Not a separate signal.',
      status: 'tentative',
      stats: 'n=1+; track 1h adverse and 4h follow-through',
    });
  }
  if (alert.type === 'LONG_CONFIRMED' && oi === 'FRESH_LONGS') {
    out.push({
      code: 'T1-CONFIRMED',
      verdict: 'PATTERN_BLOCK_OR_CAUTION',
      title: 'LONG + FRESH_LONGS is structurally weak',
      message: 'Entering crowded long positioning; do not blindly fade, but open/maintain SHORT watch.',
      status: 'confirmed_bad_long_context',
      stats: 'recent failures clustered; requires short confirmation for trade',
    });
  }
  if (dir === 'LONG' && isAlt(alert.asset) && isBtcWeakVeto(gate)) {
    out.push({
      code: 'C3-BTC-BLOCK',
      verdict: 'HARD_BLOCK',
      title: 'BTC weak invalidates alt long',
      message: 'BTC weakness removes long edge; this is no-long context, not an automatic alt short.',
      status: 'confirmed_block',
    });
  }
  if (alert.type === 'SHORT_CONFIRMED' && score >= 70 && oi === 'FRESH_LONGS') {
    out.push({
      code: 'C1-SHORT',
      verdict: 'MAX_CONVICTION_CONTEXT',
      title: 'SHORT >=70 + FRESH_LONGS',
      message: 'Shorting into crowded long positioning; forced liquidations can provide structural support.',
      status: 'confirmed_direction_split',
      stats: '75% 1h / 100% 4h in current sample (n=4)',
    });
  }
  return out;
}

function annotationLines(alert) {
  const anns = alert?.pattern_annotations || [];
  if (!anns.length) return [];
  const lines = ['', '━━━━ PATTERN ANALYSIS ━━━━'];
  for (const a of anns) {
    const emoji = a.verdict === 'HARD_BLOCK' || a.verdict === 'PATTERN_BLOCK_OR_CAUTION' ? '🚫'
      : a.verdict === 'MAX_CONVICTION_CONTEXT' ? '✅'
      : '⚠️';
    lines.push(`${emoji} ${a.code} — ${a.title}${a.stats ? ` (${a.stats})` : ''}`);
    if (a.message) lines.push(`→ ${a.message}`);
  }
  lines.push('━━━━━━━━━━━━━━━━━━━━━━');
  return lines;
}

function ensureWatchRoot(watch) {
  watch['H-T1-SHORT-WATCH'] = watch['H-T1-SHORT-WATCH'] || {};
  return watch;
}

function openT1Watch(alert, watch, events, prices) {
  if (alert.type !== 'LONG_CONFIRMED' || oiRegime(alert) !== 'FRESH_LONGS') return null;
  ensureWatchRoot(watch);
  const existing = watch['H-T1-SHORT-WATCH'][alert.asset];
  const openedAt = alert.timestamp_utc || nowIso();
  const expiresAt = new Date((tsMs(openedAt) || Date.now()) + T1_WINDOW_MS).toISOString();
  const id = `H-T1:${alert.asset}:${openedAt}`;
  const payload = {
    id,
    asset: alert.asset,
    opened_at: openedAt,
    expires_at: expiresAt,
    trigger_price: currentPrice(alert, prices),
    trigger_score: shadowScore(alert),
    trigger_direction: 'LONG',
    oi_regime: oiRegime(alert),
    btc_gate: btcGate(alert),
    source_alert_type: alert.type,
    source_alert_id: alert.id,
  };
  if (existing && tsMs(existing.expires_at) > (tsMs(openedAt) || Date.now())) {
    events.push(baseEvent('DUPLICATE_IGNORED', ['H-T1-SHORT-WATCH'], alert, { existing, duplicate: payload }));
    return null;
  }
  watch['H-T1-SHORT-WATCH'][alert.asset] = payload;
  events.push(baseEvent('TRIGGERED', ['H-T1-SHORT-WATCH'], alert, payload));
  return payload;
}

function hN1Matches(alert) {
  if (alert.type !== 'SHORT_CONFIRMED') return false;
  if (!blockedByReadiness(alert)) return false;
  const score = shadowScore(alert);
  if (!(score >= HN1_LOW_SCORE && score <= HN1_HIGH_SCORE)) return false;
  if (score < HN1_MIN_SCORE) return false;
  const f = flow(alert);
  const fund = funding(alert);
  return fund === 'BROAD_SHORT_PRESSURE' || f === 'SELL_PRESSURE' || f === 'DISTRIBUTION';
}

function shortInT1Window(alert, watch) {
  if (alert.type !== 'SHORT_CONFIRMED') return null;
  const active = watch?.['H-T1-SHORT-WATCH']?.[alert.asset];
  if (!active) return null;
  const at = tsMs(alert.timestamp_utc) || Date.now();
  if (at <= (tsMs(active.expires_at) || 0)) return active;
  return null;
}

function shouldConsiderT1(alert, activeWatch) {
  if (!activeWatch) return false;
  const score = shadowScore(alert);
  return score >= HN1_LOW_SCORE && score <= HN1_HIGH_SCORE;
}

function baseEvent(event, hypotheses, alert, payload = {}) {
  return {
    id: payload.id || `${hypotheses.join('+')}:${alert?.asset || 'NA'}:${alert?.timestamp_utc || nowIso()}`,
    hypotheses,
    event,
    asset: alert?.asset || payload.asset || null,
    timestamp_utc: alert?.timestamp_utc || nowIso(),
    direction: direction(alert),
    source: 'phase1d-alerts',
    unvalidated: true,
    payload,
  };
}

function formatConsiderMessage({ alert, hypotheses, activeWatch }) {
  const combined = hypotheses.length > 1;
  const code = combined ? 'H-T1 + H-N1' : (hypotheses.includes('H-T1-SHORT-WATCH') ? 'H-T1' : 'H-N1');
  const score = shadowScore(alert);
  const entry = currentPrice(alert, null);
  const failedLevel = alert?.diagnostics?.failed_level ?? activeWatch?.trigger_price ?? null;
  const title = `⚠️ [${code}] CONSIDER SHORT — ${alert.asset} [UNVALIDATED${combined ? ', CONVERGENCE' : ''}]`;
  const lines = [title];
  if (combined) {
    lines.push('Under-threshold SHORT fired inside active T1 watch and pressure context is active.');
  } else if (hypotheses.includes('H-T1-SHORT-WATCH')) {
    const deltaMin = activeWatch?.opened_at ? Math.round(((tsMs(alert.timestamp_utc) || Date.now()) - (tsMs(activeWatch.opened_at) || Date.now())) / 60000) : null;
    lines.push(`SHORT_CONFIRMED fired${Number.isFinite(deltaMin) ? ` ${deltaMin}m` : ''} after FRESH_LONGS long-trap watch opened.`);
  } else {
    lines.push('Blocked SHORT has below-gate score but strong selloff pressure context.');
  }
  lines.push(`Short score: ${score ?? 'n/a'} | OI: ${oiRegime(alert) || 'n/a'} | Funding: ${funding(alert) || 'n/a'} | Flow: ${flow(alert) || 'n/a'}`);
  lines.push('');
  lines.push(`Entry: ~${entry ?? 'n/a'}`);
  lines.push(`Failed/trigger level: ${failedLevel ?? 'n/a'}`);
  lines.push('Stop idea: above failed level / ATR band');
  lines.push('TP idea: 1R partial, reassess at 1h/4h');
  lines.push('');
  if (combined) {
    lines.push('Pattern basis: H-T1 says prior LONG + FRESH_LONGS was structurally weak; H-N1 says blocked 50–65 shorts can work when pressure is broad.');
  } else if (hypotheses.includes('H-T1-SHORT-WATCH')) {
    lines.push('Pattern basis: T1-backed short confirmation; not a blind fade of the failed long.');
  } else {
    lines.push('Pattern basis: H-N1 blocked-short hypothesis from recent selloff behavior.');
  }
  lines.push('Manual consideration only — not production-validated.');
  return lines.join('\n');
}

function sendTelegram(message) {
  if (process.env.PHASE1D_DISABLE_TELEGRAM === '1' || process.env.HYPOTHESIS_DISABLE_TELEGRAM === '1') {
    return { ok: true, skipped: true, reason: 'telegram disabled by env' };
  }
  if (process.env.ENABLE_HYPOTHESIS_ALERTS !== 'true') {
    return { ok: true, skipped: true, reason: 'ENABLE_HYPOTHESIS_ALERTS not true' };
  }
  const config = readJson(CONFIG_PATH, {});
  const channel = config.telegram?.channel || 'telegram';
  const target = String(config.telegram?.to || 'YOUR_TELEGRAM_CHAT_ID');
  const sent = spawnSync('openclaw', ['message', 'send', '--channel', channel, '--target', target, '--message', message], {
    cwd: path.dirname(ROOT),
    encoding: 'utf8',
    timeout: 30_000,
  });
  return { ok: sent.status === 0, status: sent.status, stdout: String(sent.stdout || '').trim(), stderr: String(sent.stderr || '').trim(), channel, target };
}

function resolveExpiredWatches(watch, events, now) {
  const root = watch['H-T1-SHORT-WATCH'] || {};
  const nowMs = tsMs(now) || Date.now();
  for (const [asset, active] of Object.entries(root)) {
    if ((tsMs(active.expires_at) || 0) <= nowMs) {
      events.push({
        id: active.id,
        hypotheses: ['H-T1-SHORT-WATCH'],
        event: 'RESOLVED_EXPIRED',
        asset,
        timestamp_utc: now,
        direction: 'SHORT_WATCH',
        source: 'phase1d-alerts',
        unvalidated: true,
        payload: active,
      });
      delete root[asset];
    }
  }
}

function processHypotheses({ emittedAlerts = [], blockedAlerts = [], prices = null, now = nowIso() } = {}) {
  const watch = ensureWatchRoot(readJson(WATCH_PATH, {}));
  const events = [];
  const telegram = [];
  const seenAlerts = new Set();
  const alerts = [];
  for (const alert of [...emittedAlerts, ...blockedAlerts]) {
    const key = alert?.id || `${alert?.timestamp_utc || ''}:${alert?.asset || ''}:${alert?.type || ''}`;
    if (seenAlerts.has(key)) continue;
    seenAlerts.add(key);
    alerts.push(alert);
  }

  for (const alert of alerts) {
    for (const ann of classifyProductionAnnotations(alert)) addAnnotation(alert, ann);
  }

  for (const alert of alerts) openT1Watch(alert, watch, events, prices);

  for (const alert of alerts) {
    if (alert.type !== 'SHORT_CONFIRMED') continue;
    const activeWatch = shortInT1Window(alert, watch);
    const t1 = shouldConsiderT1(alert, activeWatch);
    const hn1 = hN1Matches(alert);
    if (!t1 && !hn1) continue;

    const hypotheses = [];
    if (t1) hypotheses.push('H-T1-SHORT-WATCH');
    if (hn1) hypotheses.push('H-N1-BLOCKED-SHORT');

    if (!blockedByReadiness(alert)) {
      addAnnotation(alert, {
        code: hypotheses.length > 1 ? 'H-T1+H-N1' : hypotheses[0],
        verdict: 'CONTEXT_BACKING',
        title: 'Hypothesis backing on production short',
        message: 'Production short already fired; hypothesis context added, no duplicate manual-consider alert sent.',
        status: 'annotation_only',
      });
      events.push(baseEvent('ANNOTATED_PRODUCTION_ALERT', hypotheses, alert, { active_watch: activeWatch || null }));
      continue;
    }

    const message = formatConsiderMessage({ alert, hypotheses, activeWatch });
    const sent = sendTelegram(message);
    telegram.push({ alert_id: alert.id, hypotheses, sent });
    events.push(baseEvent('CONSIDER_ALERT_SENT', hypotheses, alert, { active_watch: activeWatch || null, message, telegram: sent }));
    if (activeWatch) {
      delete watch['H-T1-SHORT-WATCH'][alert.asset];
      events.push(baseEvent('RESOLVED_CONFIRMED', ['H-T1-SHORT-WATCH'], alert, { active_watch: activeWatch, resolving_alert_id: alert.id }));
    }
  }

  resolveExpiredWatches(watch, events, now);
  appendJsonl(EVENTS_PATH, events);
  writeJson(WATCH_PATH, watch);
  return { events: events.length, telegram, watch_path: WATCH_PATH, events_path: EVENTS_PATH };
}

module.exports = {
  process: processHypotheses,
  annotationLines,
  classifyProductionAnnotations,
  _private: { hN1Matches, shouldConsiderT1, formatConsiderMessage },
};
