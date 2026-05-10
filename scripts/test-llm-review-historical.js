#!/usr/bin/env node
/*
  One-off test harness: re-run the LLM reviewer against past CONFIRMED alerts
  using the now-fixed pipeline (fresh backpack snapshot + staleness guard),
  to see what message it would produce. Does not send Telegram and writes to
  a separate test log so it never mixes with production llm-review-log.jsonl
  stats. Caveat: current_market context is sampled NOW, not reconstructed at
  each alert's original timestamp, so this is a wiring/quality check, not a
  true point-in-time backtest.

  Usage: node scripts/test-llm-review-historical.js <alert_id> [<alert_id> ...]
*/

const fs = require('fs');
const path = require('path');
const review = require('./llm-review-alert');

const ROOT = path.join(__dirname, '..');
const TEST_LOG_PATH = path.join(ROOT, 'data', 'llm-review-test-log.jsonl');

function nowIso() { return new Date().toISOString(); }
function appendJsonl(file, row) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, JSON.stringify(row) + '\n');
}

function main() {
  const alertIds = process.argv.slice(2);
  if (!alertIds.length) throw new Error('Usage: test-llm-review-historical.js <alert_id> [...]');
  const config = review.readJson(review.CONFIG_PATH, {});
  const reviewerConfig = config.llm_reviewer || {};
  const alerts = review.readJsonl(review.ALERTS_PATH);

  for (const alertId of alertIds) {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) {
      console.error(`SKIP: alert not found: ${alertId}`);
      continue;
    }
    const packet = review.buildPacket(alert);
    const prompt = review.reviewerPrompt(packet);
    const llm = review.callLlm(prompt, reviewerConfig);
    const parsedReview = llm.parsed ? review.normalizeReview(llm.parsed) : null;
    const message = parsedReview ? review.formatTelegramReview(parsedReview, packet) : null;

    const row = {
      schema_version: 'llm_review_test_log_v1',
      test_run_at: nowIso(),
      alert_id: alert.id,
      alert_timestamp_utc: alert.timestamp_utc || null,
      asset: alert.asset,
      direction: packet.alert.direction,
      alert_type: alert.type,
      backpack_snapshot_stale: packet.data_freshness.backpack_snapshot_stale,
      backpack_snapshot_age_minutes: packet.data_freshness.backpack_snapshot_age_minutes,
      direction_verdict: parsedReview?.direction_verdict || null,
      confidence_label: parsedReview?.confidence_label || null,
      prior_vs_now: parsedReview?.prior_vs_now || null,
      main_reason: parsedReview?.main_reason || null,
      risk_flags: parsedReview?.risk_flags || [],
      execution_note: parsedReview?.execution_note || null,
      telegram_summary: parsedReview?.telegram_summary || null,
      llm_ok: llm.ok,
      llm_error: llm.ok ? null : { stdout: llm.stdout, stderr: llm.stderr },
      outcome_1h_pct: null,
      outcome_4h_pct: null,
      outcome_24h_pct: null,
    };
    appendJsonl(TEST_LOG_PATH, row);

    console.log('='.repeat(70));
    console.log(`${alert.timestamp_utc}  ${alert.asset} ${alert.type}  (id: ${alert.id})`);
    console.log(`stale backpack data: ${packet.data_freshness.backpack_snapshot_stale} (age ${packet.data_freshness.backpack_snapshot_age_minutes}m)`);
    if (message) {
      console.log('--- message ---');
      console.log(message);
    } else {
      console.log('LLM call failed:', llm.stderr || llm.stdout);
    }
  }
}

main();
