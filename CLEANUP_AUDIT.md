# Market Intel Cleanup Audit

Date: 2026-05-09 11:20 UTC

Purpose: identify legacy, generated, or no-longer-used components before making a clean commit. This is an audit only; nothing has been deleted.

## Current canonical runtime path

The active production path is:

1. `scripts/run-orchestrator-cron.sh`
2. `orchestrator.js`
3. Deterministic refresh scripts:
   - `scripts/fetch-backpack-snapshot.js`
   - `scripts/fetch-extras-cache.js`
   - `scripts/fetch-binance-context.js`
   - `scripts/fetch-market-microstructure.js`
4. Active analyst prompts loaded by `orchestrator.js`:
   - `agents/crypto-analyst.md`
   - `agents/gold-analyst.md`
   - `agents/macro-scout.md`
   - `agents/sentiment-radar.md`
5. Phase 1/1b/1d monitoring:
   - `scripts/run-price-sampler-cron.sh`
   - `scripts/autoresearch-sample-prices.js`
   - `scripts/resolve-signal-outcomes.js`
   - `scripts/phase1d-alerts.js`
   - `scripts/analyze-alert-quality.js`
   - `scripts/replay-phase1b-validation.js` for replay diagnostics
6. Active project docs:
   - `PHASE_STATUS.md`
   - `docs/MICROSTRUCTURE_CONFIRMATION_ENGINE.md`
   - `IMPROVEMENTS.md`

## Keep / active

These are currently used or important to the canonical path:

- `orchestrator.js`
- `correlation-matrix.js` — imported by `orchestrator.js`
- `config.json`
- `agents/crypto-analyst.md`
- `agents/gold-analyst.md`
- `agents/macro-scout.md`
- `agents/sentiment-radar.md`
- `scripts/fetch-backpack-snapshot.js`
- `scripts/fetch-extras-cache.js`
- `scripts/fetch-binance-context.js`
- `scripts/fetch-market-microstructure.js`
- `scripts/run-orchestrator-cron.sh`
- `scripts/run-price-sampler-cron.sh`
- `scripts/autoresearch-sample-prices.js`
- `scripts/resolve-signal-outcomes.js`
- `scripts/phase1d-alerts.js`
- `scripts/analyze-alert-quality.js`
- `scripts/replay-phase1b-validation.js`
- `docs/MICROSTRUCTURE_CONFIRMATION_ENGINE.md`
- `PHASE_STATUS.md`
- `IMPROVEMENTS.md`

## Strong cleanup candidates — legacy components

Likely safe to remove or move to `archive/legacy/` after one final grep/test:

- `run-market-intel.js` — explicit deprecated stub; exits with error and says use `orchestrator.js`.
- `orchestrator.js.broken.bak` — backup of old/broken orchestrator.
- `agents/orchestrator.md` — old multi-layer agent architecture, not loaded by current `orchestrator.js`.
- `agents/price-collector.md` — old architecture reference only; not loaded by current `orchestrator.js`.
- `agents/sentiment-gauge.md` — zero inbound references found.
- `agents/orchestrator-agent.md` — old manual wrapper around `orchestrator.js`; not used by canonical cron path.
- `scripts/watch-btc-clean-rejection.js` plus root marker files `.btc-clean-rejection-alert.json`, `.last-btc-clean-rejection-alert.json`, and `data/watch/btc-clean-rejection-state.json` — old standalone BTC rejection watcher, superseded by microstructure/Phase 1d alerting unless we explicitly still want it.
- `synthesize.py` — standalone old synthesizer with hard-coded sample data; zero inbound references found.
- `lib/context_aware_decision.py` — Python decision engine prototype; referenced only by docs, not runtime.
- `scripts/store-history.js` — referenced by old docs/backup only, not current runtime.
- `scripts/publish-to-github.sh` and `scripts/transform-for-website.js` — only needed if reviving GitHub website publishing; no current remote configured.

## Possible cleanup candidates — old experiments/backtests

Keep only if we want historical research continuity. Otherwise archive/remove:

- `backtester.js`
- `backtest-config.json`
- `test-historical-api.js`
- `test-full-integration.js`
- `TIER3-TIER5-README.md`
- `VALIDATION-RESULTS.md`
- old March reports under `reports/`
- old one-off trade-analysis docs:
  - `BTC-TRADING-PLAN-20260228.md`
  - `BTC-UPDATED-ANALYSIS-20260301.md`
  - `BTC-SCALP-VS-SHORT-ANALYSIS.md`
  - `ETH-SOL-ANALYSIS-20260301.md`
  - `GOLD-PRICE-ERROR-POSTMORTEM.md`
  - `WHALE-TRACKING-PROPOSAL.md`
  - `WHALE-ENHANCEMENT.md`

## Generated/live data that should probably not be committed going forward

These are runtime/state/artifact files and should be ignored or excluded from commits unless specifically snapshotting research:

- `data/signals.json`
- `data/latest-market-run.json`
- `data/latest-market-brief.txt`
- `data/backpack-snapshot.json`
- `data/backpack-snapshot-lite.json`
- `data/binance-context.json`
- `data/binance-context-history.jsonl`
- `data/microstructure-context.json`
- `data/microstructure-history.jsonl`
- `data/trigger-state.json`
- `data/signal-outcome-events.jsonl`
- `data/signal-outcome-status.json`
- `data/signal-outcome-resolutions.jsonl`
- `data/autoresearch/price-15m.jsonl`
- `data/phase1b-diagnostics-state.json`
- `data/phase1d-alerts.jsonl`
- `data/phase1d-alert-state.json`
- `data/alert-cooldown-state.json`
- `data/autoresearch/logs/*`
- `logs/*`
- `temp/*`

Potential exception:

- `data/alert-quality-report.md`
- `data/alert-quality-report.json`
- `data/phase1b-replay-report.md`
- `data/phase1b-replay-report.json`

These reports are generated, but useful for burn-in review. Either commit selected snapshots intentionally or ignore them and regenerate locally.

## Missing hygiene

- No `.gitignore` was found in or above `market-intel` during this audit.
- The git repo root is `/home/clawdbot/.openclaw/workspace`, not `market-intel`.
- There is no `origin` remote configured.
- The repo contains many unrelated workspace/skills/memory changes, so commits should use explicit path staging.

## Recommended cleanup sequence

1. Add a `market-intel/.gitignore` or root `.gitignore` section for runtime/generated files.
2. Move obvious legacy files to `market-intel/archive/legacy-2026-05-09/` instead of deleting first.
3. Run validation gates:
   - `node --check market-intel/orchestrator.js`
   - `node --check market-intel/scripts/fetch-market-microstructure.js`
   - `node --check market-intel/scripts/phase1d-alerts.js`
   - `node --check market-intel/scripts/analyze-alert-quality.js`
4. Commit only active code/docs and the cleanup audit.

## Suggested first archive batch

Lowest-risk archive batch:

- `market-intel/run-market-intel.js`
- `market-intel/orchestrator.js.broken.bak`
- `market-intel/agents/sentiment-gauge.md`
- `market-intel/agents/price-collector.md`
- `market-intel/agents/orchestrator.md`
- `market-intel/synthesize.py`
- `market-intel/test-simple-orchestrator.js`
- `market-intel/temp/`

Second batch after confirming we do not need the standalone watcher/GitHub publisher:

- `market-intel/scripts/watch-btc-clean-rejection.js`
- `market-intel/.btc-clean-rejection-alert.json`
- `market-intel/.last-btc-clean-rejection-alert.json`
- `market-intel/data/watch/`
- `market-intel/scripts/publish-to-github.sh`
- `market-intel/scripts/transform-for-website.js`
- `market-intel/docs/GITHUB_SETUP.md`
- `market-intel/docs/QUICKSTART_GITHUB.md`


---

# Addendum — 2026-05-09 11:27 UTC

User review added a stricter cleanup split. Accepted with two caveats:

1. `analysis/` appears in both Batch 1 and Batch 2; treat the whole directory as archive-only unless deleting specific one-off JSON snapshots after backup.
2. `scripts/replay-phase1b-validation.js` is a one-time diagnostic, but useful until Phase 1b burn-in is fully closed. Archive after the current validation report is accepted.

## Additional legacy candidates

### Scripts — 0-reference autoresearch experiments

- `scripts/autoresearch-issue-baseline-episodes.js`
- `scripts/autoresearch-evaluate-episodes.js`

These belonged to an autoresearch episode track that was never wired to cron. Keep `scripts/autoresearch-sample-prices.js`; that one is active.

### Agents directory — docs that are not active prompts

- `agents/PARAMETER_UPDATES.md` — one-time March update recipe, already applied.
- `agents/ETH-FIX.md` — April analysis note, not loaded by `orchestrator.js`.

### Root install scripts

- `install-priority-skills.sh`
- `install-skills.sh`

Early setup scripts; skills are already installed and these have no current runtime role.

### Analysis directory

- `analysis/2026-05-04T2001_PAXG_PERP.json` — manual run snapshot.
- `analysis/threshold-volatility-deep-dive.md` — March research doc; parameter changes already applied.

### Replay script

- `scripts/replay-phase1b-validation.js` — diagnostic replay script. Archive after Phase 1b replay report is accepted and burn-in no longer needs ad-hoc reruns.

## Consolidated cleanup plan

### Batch 1 — zero-risk archive/remove candidates

Move to `archive/legacy-2026-05-09/` first, then delete later only after checks pass:

- `run-market-intel.js`
- `orchestrator.js.broken.bak`
- `agents/orchestrator.md`
- `agents/price-collector.md`
- `agents/sentiment-gauge.md`
- `agents/orchestrator-agent.md`
- `agents/PARAMETER_UPDATES.md`
- `agents/ETH-FIX.md`
- `synthesize.py`
- `lib/context_aware_decision.py`
- `scripts/autoresearch-issue-baseline-episodes.js`
- `scripts/autoresearch-evaluate-episodes.js`
- `scripts/watch-btc-clean-rejection.js`
- `scripts/store-history.js`
- `scripts/publish-to-github.sh`
- `scripts/transform-for-website.js`
- `install-priority-skills.sh`
- `install-skills.sh`
- `temp/`
- `.btc-clean-rejection-alert.json`
- `.last-btc-clean-rejection-alert.json`
- `data/watch/`

If `lib/` is empty after moving `context_aware_decision.py`, remove/archive the empty directory.

### Batch 2 — archive-only historical/reference candidates

Move to archive, do not delete yet:

- `backtester.js`
- `backtest-config.json`
- `test-full-integration.js`
- `test-historical-api.js`
- `test-simple-orchestrator.js`
- `scripts/replay-phase1b-validation.js` after Phase 1b acceptance
- `reports/`
- `analysis/`
- historical root `.md` scratch docs, keeping only:
  - `README.md`
  - `ARCHITECTURE.md` or `SYSTEM_OVERVIEW.md` — choose one as current architecture overview
  - `PHASE_STATUS.md`
  - `IMPROVEMENTS.md`
  - `QUICK-REFERENCE.md`
  - `CLEANUP_AUDIT.md`
  - `docs/MICROSTRUCTURE_CONFIRMATION_ENGINE.md`

Historical scratch docs to archive include files like:

- `BTC-TRADING-PLAN-20260228.md`
- `BTC-UPDATED-ANALYSIS-20260301.md`
- `BTC-SCALP-VS-SHORT-ANALYSIS.md`
- `ETH-SOL-ANALYSIS-20260301.md`
- `TIER2_ENHANCEMENTS.md`
- `WHALE-ENHANCEMENT.md`
- `DEPLOY_NOW.md`
- older deployment/test summaries once superseded by `PHASE_STATUS.md`

## Confirmed clean/active set

- `orchestrator.js` — main runner
- `correlation-matrix.js` — required by orchestrator
- `config.json` — config
- `agents/crypto-analyst.md` — active prompt
- `agents/gold-analyst.md` — active prompt
- `agents/macro-scout.md` — active prompt
- `agents/sentiment-radar.md` — active prompt
- `scripts/fetch-backpack-snapshot.js` — prefetch pipeline
- `scripts/fetch-binance-context.js` — prefetch pipeline
- `scripts/fetch-extras-cache.js` — prefetch pipeline
- `scripts/fetch-market-microstructure.js` — prefetch pipeline / Phase 1 diagnostics
- `scripts/run-orchestrator-cron.sh` — cron entry point
- `scripts/run-price-sampler-cron.sh` — 15m cron entry
- `scripts/autoresearch-sample-prices.js` — 15m price sampler
- `scripts/resolve-signal-outcomes.js` — outcome tracker
- `scripts/phase1d-alerts.js` — alert emitter
- `scripts/analyze-alert-quality.js` — quality report
- `docs/MICROSTRUCTURE_CONFIRMATION_ENGINE.md` — active design doc
- `PHASE_STATUS.md` — project evolution tracker
- `IMPROVEMENTS.md` — detailed improvement history / backlog
- `CLEANUP_AUDIT.md` — cleanup plan


## Cleanup action — archive old backtester

Archived on 2026-05-09 after clarification:

- `backtester.js`
- `backtest-config.json`

Reason: these are March-era backtesting tools for the old `data/signals.json` format. The project still needs a later Phase 3 evaluation/backtesting engine, but that should be built/refactored around the current outcome/alert data:

- `data/signal-outcome-events.jsonl`
- `data/signal-outcome-resolutions.jsonl`
- `data/autoresearch/price-15m.jsonl`
- `data/phase1d-alerts.jsonl`
- alert-quality reports

So the old files are archived, not deleted.
