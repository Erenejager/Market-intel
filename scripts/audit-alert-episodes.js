#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const STATE_PATH = path.join(DATA, 'phase1d-alert-state.json');
const ALERTS_PATH = path.join(DATA, 'phase1d-alerts.jsonl');
const OUT_JSON = path.join(DATA, 'episode-audit-current.json');
const OUT_MD = path.join(DATA, 'episode-audit-current.md');

const WINDOW_DAYS = Number(process.env.EPISODE_AUDIT_DAYS || 7);
const NOW = new Date();
const SINCE_MS = NOW.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000;

function readJson(file, fallback = null) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function readJsonl(file) {
  try {
    return fs.readFileSync(file, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line));
  } catch {
    return [];
  }
}

function tsMs(x) {
  const ms = Date.parse(x || '');
  return Number.isFinite(ms) ? ms : null;
}

function inWindow(x) {
  const ms = tsMs(x);
  return ms != null && ms >= SINCE_MS;
}

function round(x, d = 3) {
  return Number.isFinite(x) ? Number(x.toFixed(d)) : null;
}

function pct(n, d = 1) {
  return Number.isFinite(n) ? `${n.toFixed(d)}%` : 'n/a';
}

function signedPct(n, d = 3) {
  return Number.isFinite(n) ? `${n >= 0 ? '+' : ''}${n.toFixed(d)}%` : 'n/a';
}

function inc(map, key, by = 1) {
  const k = key || 'UNKNOWN';
  map[k] = (map[k] || 0) + by;
}

function intendedDirectionFromPattern(ep) {
  const key = ep.pattern_family || '';
  if (key.includes('INVERSE_SHORT')) return 'SHORT';
  if (key.includes('INVERSE_LONG')) return 'LONG';
  return ep.direction || null;
}

function directionMismatch(ep) {
  const intended = intendedDirectionFromPattern(ep);
  return !!(intended && ep.direction && intended !== ep.direction);
}

function groupBy(rows, keyFn) {
  const out = {};
  for (const row of rows) {
    const key = keyFn(row) || 'UNKNOWN';
    out[key] = out[key] || [];
    out[key].push(row);
  }
  return out;
}

function summarizeEpisodes(rows) {
  const statusCounts = {};
  const byAssetDirection = {};
  const byPattern = {};
  let targetHit = 0;
  let failed = 0;
  let invalidated = 0;
  let mfeBeatsMae = 0;
  let adverseFirst = 0;
  let withOrder = 0;
  let mfeSum = 0;
  let maeSum = 0;
  let mfeN = 0;
  let maeN = 0;
  let directionMismatchCount = 0;
  for (const ep of rows) {
    inc(statusCounts, ep.status);
    const intendedDirection = intendedDirectionFromPattern(ep) || ep.direction || 'UNKNOWN';
    if (directionMismatch(ep)) directionMismatchCount++;
    inc(byAssetDirection, `${ep.asset || 'UNKNOWN'}:${intendedDirection}`);
    inc(byPattern, ep.pattern_family || 'UNKNOWN');
    if (ep.target_hit_at || String(ep.status || '').includes('MFE_HIT')) targetHit++;
    if (ep.status === 'FAILED') failed++;
    if (ep.status === 'INVALIDATED') invalidated++;
    const mfe = Number(ep.mfe_pct);
    const mae = Number(ep.mae_pct);
    if (Number.isFinite(mfe)) { mfeSum += mfe; mfeN++; }
    if (Number.isFinite(mae)) { maeSum += mae; maeN++; }
    if (Number.isFinite(mfe) && Number.isFinite(mae) && mfe > Math.abs(mae)) mfeBeatsMae++;
    const mfeAt = tsMs(ep.mfe_at);
    const maeAt = tsMs(ep.mae_at);
    if (mfeAt != null && maeAt != null) {
      withOrder++;
      if (maeAt < mfeAt) adverseFirst++;
    }
  }
  const n = rows.length;
  return {
    n,
    status_counts: statusCounts,
    by_asset_direction: byAssetDirection,
    by_pattern_family: byPattern,
    target_hit_count: targetHit,
    target_hit_pct: n ? round(targetHit / n * 100, 1) : null,
    failed_count: failed,
    failed_pct: n ? round(failed / n * 100, 1) : null,
    invalidated_count: invalidated,
    invalidated_pct: n ? round(invalidated / n * 100, 1) : null,
    mfe_beats_abs_mae_count: mfeBeatsMae,
    mfe_beats_abs_mae_pct: n ? round(mfeBeatsMae / n * 100, 1) : null,
    adverse_first_count: adverseFirst,
    adverse_first_n: withOrder,
    adverse_first_pct: withOrder ? round(adverseFirst / withOrder * 100, 1) : null,
    avg_mfe_pct: mfeN ? round(mfeSum / mfeN) : null,
    avg_mae_pct: maeN ? round(maeSum / maeN) : null,
    direction_mismatch_count: directionMismatchCount,
    direction_mismatch_pct: n ? round(directionMismatchCount / n * 100, 1) : null,
  };
}

function topEntries(obj, n = 12) {
  return Object.entries(obj || {}).sort((a, b) => b[1] - a[1]).slice(0, n);
}

function mdTable(headers, rows) {
  if (!rows.length) return '_None._\n';
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map(r => `| ${r.join(' | ')} |`),
  ].join('\n') + '\n';
}

const state = readJson(STATE_PATH, {});
const active = Object.values(state.alert_episodes?.active || {});
const history = state.alert_episodes?.history || [];
const historyWindow = history.filter(ep => inWindow(ep.opened_at) || inWindow(ep.closed_at));
const cleanDirectionHistoryWindow = historyWindow.filter(ep => !directionMismatch(ep));
const alerts = readJsonl(ALERTS_PATH).filter(a => inWindow(a.timestamp_utc));

const suppressionCounts = {};
const patternGateCounts = {};
const candidateBucketCounts = {};
const telegramCandidateRows = [];
for (const alert of alerts) {
  const severity = alert.severity;
  const suppressed = alert.telegram_suppressed?.reason || null;
  const patternKey = alert.pattern?.key || alert.empirical_watch?.key || alert.research_note?.pattern_key || null;
  const isCandidate = ['HIGH', 'MEDIUM'].includes(severity) || !!suppressed || !!alert.pattern_gate || !!alert.research_note;
  if (suppressed) inc(suppressionCounts, suppressed);
  if (alert.pattern_gate?.status) inc(patternGateCounts, alert.pattern_gate.status);
  if (isCandidate) {
    inc(candidateBucketCounts, patternKey || alert.type || 'UNKNOWN');
    telegramCandidateRows.push(alert);
  }
}

const capState = state.telegram_bucket_caps || {};
const bucketCaps = Object.fromEntries(Object.entries(capState).map(([bucket, value]) => [bucket, {
  cap: value.cap ?? null,
  window_ms: value.window_ms ?? null,
  cap_source: value.cap_source || null,
  deliveries_in_window: Array.isArray(value.deliveries) ? value.deliveries.length : 0,
  updated_at: value.updated_at || null,
} ]));

const summary = {
  generated_at: NOW.toISOString(),
  window_days: WINDOW_DAYS,
  since: new Date(SINCE_MS).toISOString(),
  files: { state: STATE_PATH, alerts: ALERTS_PATH },
  active_count: active.length,
  history_total_count: history.length,
  history_window: summarizeEpisodes(historyWindow),
  clean_direction_history_window: summarizeEpisodes(cleanDirectionHistoryWindow),
  active: summarizeEpisodes(active),
  suppressions_window: suppressionCounts,
  pattern_gate_window: patternGateCounts,
  telegram_candidate_count_window: telegramCandidateRows.length,
  telegram_candidate_buckets_window: candidateBucketCounts,
  bucket_caps: bucketCaps,
  recent_closed: history.slice(-12),
  active_episodes: active,
};

let md = '';
md += `# Episode Audit — Current\n\n`;
md += `Generated: ${summary.generated_at}\n\n`;
md += `Window: last ${WINDOW_DAYS}d since ${summary.since}\n\n`;
md += `## Headline\n\n`;
md += `- Active episodes: **${summary.active_count}**\n`;
md += `- Closed episodes in window: **${summary.history_window.n}** / total stored **${summary.history_total_count}**\n`;
md += `- Target hit: **${summary.history_window.target_hit_count}** (${pct(summary.history_window.target_hit_pct)})\n`;
md += `- Failed: **${summary.history_window.failed_count}** (${pct(summary.history_window.failed_pct)})\n`;
md += `- Invalidated: **${summary.history_window.invalidated_count}** (${pct(summary.history_window.invalidated_pct)})\n`;
md += `- MFE > |MAE|: **${summary.history_window.mfe_beats_abs_mae_count}** (${pct(summary.history_window.mfe_beats_abs_mae_pct)})\n`;
md += `- Adverse-first where order known: **${summary.history_window.adverse_first_count}/${summary.history_window.adverse_first_n}** (${pct(summary.history_window.adverse_first_pct)})\n`;
md += `- Avg MFE / MAE: **${signedPct(summary.history_window.avg_mfe_pct)} / ${signedPct(summary.history_window.avg_mae_pct)}**\n\n`;
md += `- Direction mismatches detected: **${summary.history_window.direction_mismatch_count}** (${pct(summary.history_window.direction_mismatch_pct)}) — these historical episode extrema were tracked on the source direction, not intended inverse trade direction, so treat all headline MFE/MAE metrics as contaminated until enough post-fix episodes accrue.\n\n`;

md += `## Clean-direction subset\n\n`;
md += `Episodes without detected source/intended direction mismatch: **${summary.clean_direction_history_window.n}**\n\n`;
md += `- Target hit: **${summary.clean_direction_history_window.target_hit_count}** (${pct(summary.clean_direction_history_window.target_hit_pct)})\n`;
md += `- Failed: **${summary.clean_direction_history_window.failed_count}** (${pct(summary.clean_direction_history_window.failed_pct)})\n`;
md += `- MFE > |MAE|: **${summary.clean_direction_history_window.mfe_beats_abs_mae_count}** (${pct(summary.clean_direction_history_window.mfe_beats_abs_mae_pct)})\n`;
md += `- Avg MFE / MAE: **${signedPct(summary.clean_direction_history_window.avg_mfe_pct)} / ${signedPct(summary.clean_direction_history_window.avg_mae_pct)}**\n\n`;

md += `## Closed episode status counts\n\n`;
md += mdTable(['Status', 'Count'], topEntries(summary.history_window.status_counts).map(([k, v]) => [k, String(v)]));
md += `\n## Closed episodes by asset/direction\n\n`;
md += mdTable(['Asset:Direction', 'Count'], topEntries(summary.history_window.by_asset_direction).map(([k, v]) => [k, String(v)]));
md += `\n## Closed episodes by pattern family\n\n`;
md += mdTable(['Pattern', 'Count'], topEntries(summary.history_window.by_pattern_family).map(([k, v]) => [k, String(v)]));
md += `\n## Suppression reasons in alert log window\n\n`;
md += mdTable(['Reason', 'Count'], topEntries(summary.suppressions_window).map(([k, v]) => [k, String(v)]));
md += `\n## Telegram candidate concentration in alert log window\n\n`;
md += mdTable(['Bucket / pattern', 'Count'], topEntries(summary.telegram_candidate_buckets_window, 15).map(([k, v]) => [k, String(v)]));
md += `\n## Bucket cap state\n\n`;
md += mdTable(['Bucket', 'Deliveries in window', 'Cap', 'Source', 'Updated'], Object.entries(summary.bucket_caps).map(([k, v]) => [k, String(v.deliveries_in_window), String(v.cap ?? ''), v.cap_source || '', v.updated_at || '']));

md += `\n## Recent closed episodes\n\n`;
md += mdTable(
  ['Opened', 'Asset', 'Dir', 'Pattern', 'Status', 'MFE', 'MAE', 'Close reason'],
  summary.recent_closed.slice().reverse().map(ep => [
    ep.opened_at || '', ep.asset || '', ep.direction || '', ep.pattern_family || '', ep.status || '',
    signedPct(Number(ep.mfe_pct)), signedPct(Number(ep.mae_pct)), directionMismatch(ep) ? 'DIR_MISMATCH: ' + (ep.close_reason || '') : (ep.close_reason || ''),
  ])
);

md += `\n## Notes\n\n`;
md += `- This report audits the lifecycle book in \`data/phase1d-alert-state.json\` plus alert-log suppressions in \`data/phase1d-alerts.jsonl\`.\n`;
md += `- \`MFE > |MAE|\` is computed from stored episode extrema, not fixed-horizon close.\n`;
md += `- Adverse-first requires both \`mae_at\` and \`mfe_at\` to be present.\n`;
md += `- Direction mismatch means the stored episode direction differs from the inverse direction implied by the pattern key. Those episode MFE/MAE values are not reliable for trade-direction evaluation.\n`;

fs.writeFileSync(OUT_JSON, JSON.stringify(summary, null, 2) + '\n');
fs.writeFileSync(OUT_MD, md);
console.log(`Wrote ${OUT_JSON} and ${OUT_MD}`);
console.log(JSON.stringify({
  active: summary.active_count,
  closed_window: summary.history_window.n,
  target_hit_pct: summary.history_window.target_hit_pct,
  failed_pct: summary.history_window.failed_pct,
  mfe_beats_abs_mae_pct: summary.history_window.mfe_beats_abs_mae_pct,
  adverse_first_pct: summary.history_window.adverse_first_pct,
}, null, 2));
