# Market Intel Improvements

**Canonical improvement log for the Market Intelligence orchestrator.**

Last updated: 2026-05-28 12:30 UTC
Status: Phase 1/1d burn-in + Phase 2 shadow collection; next work is regime-state gating

---

## Current NEXT Work — Regime-State Gating Track — 2026-05-28

Az corrected the execution order again after reviewing `IMPROVEMENTS.md` and `PHASE_STATUS.md`: regime-state work must start by auditing the already-collected `long_horizon_regime` v1 instrumentation, not by inventing a fresh regime model. Also, divergence review and PATTERN_STATS refresh were already planned and must not be skipped.

Priority order:

1. **Audit v1 `long_horizon_regime` data collected since 2026-05-21**
   - Check coverage/sparsity for `return_3d_pct`, `return_7d_pct`, `trend_4h`, distance from 5d/7d SMA, and BTC long-horizon context.
   - Decide whether existing v1 fields are sufficient for machine-readable regime labels or whether gaps must be filled first.

2. **Divergence review before building on readiness**
   - Review cases where Phase 1d fired but readiness disagreed/diverged.
   - Understand whether `readiness_shadow_v0` is reliable enough to use as part of gating/regime logic.

3. **PATTERN_STATS refresh**
   - Rerun/review alert outcomes now that post-gate and health-alert samples exist.
   - Update `scripts/pattern-classifier.js` stats from current evidence, with low-n caveats.

4. **Machine-readable regime labels**
   - Build labels using existing v1 long-horizon fields where possible; fill only proven gaps.
   - Candidate labels: `BULLISH`, `RECOVERING`, `RANGING`, `BEARISH`, `BEARISH_SIDEWAYS`.
   - Log regime labels on alert/readiness rows for auditability.

5. **Tighten LONG gating using regime**
   - In bearish / bearish-sideways regimes, LONGs need extra confirmation or become watch-only.
   - This is the highest-priority behavior change, but only after items 1–4 establish the inputs.

6. **STRESSED / FAILED as hard risk controls**
   - `STRESSED`: no-add / reduce confidence / prepare exit.
   - `FAILED`: close-or-avoid original direction; original thesis invalid.
   - Do not auto-open opposite trades from these states yet.

7. **Silent opposite-watch research logging**
   - From exact STRESSED/FAILED timestamps, silently log hypothetical opposite outcomes: 1h/4h close, MFE, MAE, first favorable time.
   - No Telegram noise for research-only hypotheticals.

8. **Lifecycle / staleness rule**
   - If a context goes STRESSED → FAILED within a defined window, resolve/close the related research window cleanly to avoid double-counting one failure sequence.

9. **Telegram wording cleanup**
   - Lower priority than regime/gating/data work.

10. **Daily diagnostics + promotion review**
   - Keep split diagnostics for trade opportunity, active-context lifecycle, tracking health, and silent opposite-watch research.
   - Promote opposite-trade behavior only after bucket n ≥ 10, positive avg 4h return, acceptable MAE, and rollback criteria.

Current evidence basis:

- LONG signal direction is weak enough to act defensively, but `trend_4h=DOWN` alone is not a standalone LONG block.
- May21+ path analysis showed DOWN-regime LONG and opposite-SHORT MFE/timing are nearly symmetric; the market is moving both ways, so regime does not provide entry timing by itself.
- Current May21+ data has almost no regime variation: 32/35 LONG_CONFIRMED rows are already `trend_4h=DOWN`, so regime marginal value inside OI buckets cannot be proven yet. The honest current answer is “insufficient regime variation,” not “DOWN has no marginal value.”
- Main discriminator remains asset × OI bucket, but SOL LONGs are failing across most current OI contexts during this DOWN-only period. T1 already blocks/cautions weak SOL LONG buckets, `SHORTS_COVERING` is weak, and the new `SOL + FRESH_SHORTS + LONG` slice is also poor.
- Practical current implication: treat SOL LONGs as watch-only / no active context regardless of OI bucket until regime shifts and non-DOWN samples accumulate. Do not overfit separate asset × OI × regime rules from tiny sub-buckets.
- `ETH + FRESH_SHORTS + LONG + DOWN` has remained constructive in current samples, so avoid broad ETH restrictions from regime alone.
- STRESSED/FAILED opposite behavior is interesting, but too small-n for auto-trading.
- Health alerts are sufficiently useful as exit/avoid/risk controls.
- v1 long-horizon regime instrumentation already exists and must be audited before new regime labels are designed.

---
## Current Operating Principle

**Backpack remains venue truth.**

Backpack data is the primary source for:
- traded instrument price
- candles / levels / ATR
- venue funding
- venue open interest
- signal triggers and execution levels

**Binance is context only.**

Binance USD-M data is used for high-liquidity derivatives context, not as the source of truth for execution.

---

## Completed — Phase 1: Low-Risk Data Upgrades

### 1. Binance Context Collector

Added:

- `market-intel/scripts/fetch-binance-context.js`

Outputs:

- `market-intel/data/binance-context.json`
- `market-intel/data/binance-context-history.jsonl`

Symbols:

- BTCUSDT
- ETHUSDT
- SOLUSDT
- PAXGUSDT

Fields collected:

- `open_interest.change_30m`
- `open_interest.change_4h`
- `open_interest.change_30m_usd`
- `open_interest.change_4h_usd`
- `taker_flow.window_30m.buy_share`
- `taker_flow.window_4h.buy_share`
- `taker_flow.window_30m.buy_sell_ratio`
- `taker_flow.window_4h.buy_sell_ratio`
- `premium.basis_rate`
- `premium.last_funding_rate`
- `funding_streak.sign`
- `funding_streak.streak_count`
- `funding_streak.estimated_hours`

Purpose:

- OI change confirms whether positioning is expanding/contracting.
- Taker flow confirms aggressive buying/selling.
- Basis/premium flags overheated/crowded perps.
- Funding streak captures persistent squeeze pressure.

Caution:

- Raw values are not baseline-normalized yet.
- Phase 1 weighting is intentionally light.
- Positive Binance boosts should not be applied if context is stale/degraded.

---

### 2. Orchestrator Wiring

Updated:

- `market-intel/agents/orchestrator-agent.md`

Step 0 now instructs orchestrator runs to refresh:

```bash
node market-intel/scripts/fetch-backpack-snapshot.js
node market-intel/scripts/fetch-extras-cache.js
node market-intel/scripts/fetch-binance-context.js
```

The orchestrator now passes/mentions:

- `BACKPACK_SNAPSHOT_PATH`
- `BINANCE_CONTEXT_PATH`

Rules added:

- Backpack = truth.
- Binance = context only.
- Binance context older than 45 minutes should not produce positive boosts.
- Binance adjustment is capped at ±0.05 per asset.

---

### 3. Analyst Wiring

Updated:

- `market-intel/agents/crypto-analyst.md`
- `market-intel/agents/gold-analyst.md`

Both analysts now know how to read Binance context while preserving Backpack as truth.

Expected optional output field:

```json
"binance_context": {
  "oi_change_30m": 0,
  "oi_change_4h": 0,
  "taker_buy_share_30m": 0,
  "taker_buy_share_4h": 0,
  "basis_rate": 0,
  "funding_streak_sign": "NEGATIVE|POSITIVE|NEUTRAL",
  "funding_streak_hours": 0,
  "data_quality": "OK|PARTIAL|DEGRADED"
}
```

---

### 4. Alert Threshold and Cooldown

Updated:

- `market-intel/config.json`

Changes:

- Immediate Telegram alert threshold: `0.65 → 0.70`
- Digest/log threshold remains: `0.50`
- Telegram target: `YOUR_TELEGRAM_CHAT_ID`
- Added alert cooldown config:
  - enabled: true
  - cooldown: 2 hours
  - state file: `market-intel/data/alert-cooldown-state.json`

Reasoning:

- Phase 1 context is new and not normalized yet.
- Keeping 0.70 avoids noisy early alerts.
- Signals between 0.50 and 0.69 are logged for review.

---

### 5. Cron Wiring

Added:

- **Market Intel — Binance Context Collector (30m)**
  - schedule: `*/30 * * * *` UTC
  - runs: `node market-intel/scripts/fetch-binance-context.js`
  - delivery: none

Updated:

- **Market Intel Alert Check (30m)**
  - schedule: `*/30 * * * *` UTC
  - runs full orchestrator workflow
  - sends Telegram only if final signal ≥0.70 and cooldown allows
  - otherwise stores/logs silently

---

## Phase 1 Validation Run

Manual run completed: 2026-05-05 11:48 UTC

Collectors:

- Backpack snapshot: OK
- Extras cache: OK
- Binance context: OK/fresh

Final signals:

- ETH WATCH — 0.52
- BTC WATCH — 0.50
- PAXG_PERP WATCH — 0.48
- SOL WATCH — 0.42

Telegram:

- Not sent, because no signal reached ≥0.70.

Caveat:

- `web_search` unavailable during run; macro used cached/FRED-style data.

---

## Planned — Phase 2: Scoring Rebuild

Do not start until Phase 1 has accumulated enough context history.

Goals:

- Split scoring into:
  1. directional score
  2. crowding penalty
  3. entry quality
- Add rolling baselines / percentiles / z-scores for:
  - OI change
  - taker buy share
  - basis rate
  - long/short ratios if added later
- Define explicit major confirmations.
- Backtest March–May history before live deployment.
- Preserve per-asset parameters, especially ETH-specific treatment.

Important design decisions:

- Funding rate/streak belongs in directional squeeze pressure.
- Basis/premium belongs in crowding/overheated penalty.
- Do not double-count funding as both directional and crowding.

Example major confirmations to formalize:

- Price direction and OI change agree.
- Taker flow confirms direction above baseline percentile.
- Funding streak supports squeeze direction.
- Basis is not overheated against the trade.
- Macro does not strongly contradict.
- Entry has acceptable distance to support/resistance/target.

---

## Planned — Phase 3: Advanced Infrastructure

More complex, do not mix with Phase 1/2 deployment.

Candidates:

1. **Binance liquidation websocket daemon**
   - Source: `wss://fstream.binance.com/...@forceOrder`
   - Requires always-on process, reconnect logic, buffering, and JSONL storage.
   - REST liquidation endpoint was tested and is unavailable/out of maintenance.

2. **Estimated BTC liquidation heatmap**
   - Public-data estimate using Binance futures klines and leverage assumptions.
   - Useful for directional liquidation-pressure asymmetry, not precise true liquidation map.
   - Prefer 24h and 1w periods; 1m may be too stale for active trades.

3. **Paid provider evaluation**
   - CoinGlass UI is not ideal for automation unless official API/export includes heatmap data.
   - Bitcoin CounterFlow API appears more directly useful for machine-readable BTC heatmap buckets, but requires Pro/API access.

---

## Related Docs

Existing docs are useful but not canonical:

- `market-intel/SYSTEM_OVERVIEW.md`
- `market-intel/DEPLOYMENT_LOG.md`
- `market-intel/IMPLEMENTATION-SUMMARY.md`
- `market-intel/data/agent-improvement-analysis.md`
- `market-intel/data/orchestrator-run-log.txt`

This file should be updated first for future Market Intel improvements.

---

## Proposed — Phase 1b: Hyperliquid Context

Analysis date: 2026-05-05 12:30 UTC
Status: researched; not yet wired into orchestrator

### Why Hyperliquid Is Useful

Hyperliquid is a major perp venue with an aggressive speculative trader base. It should be treated as a second external perp-context venue beside Binance.

Architecture role:

1. Backpack = venue truth and execution reference
2. Binance = broad derivatives market context
3. Hyperliquid = aggressive perp-crowd context

Hyperliquid should not override Backpack price, candles, trigger levels, or execution planning.

### Public API Tested

Base endpoint:

- `https://api.hyperliquid.xyz/info`

No auth was required for the useful market-data endpoints tested.

Tested endpoint types:

- `metaAndAssetCtxs`
- `allMids`
- `l2Book`
- `candleSnapshot`
- `fundingHistory`
- `recentTrades`

Sample saved at:

- `market-intel/data/hyperliquid-api-sample.json`

Assets confirmed available:

- BTC
- ETH
- SOL
- PAXG

### Recommended Metrics

Priority 1:

- Current open interest
- OI notional
- OI change 30m / 4h / 24h from local history
- Current funding
- Funding streak sign/count/hours
- Premium / mark-oracle basis

Priority 2:

- Recent trade buy/sell imbalance
- 15m/30m trade notional imbalance if websocket or repeated polling is added
- 24h notional volume
- Volume spike vs rolling baseline

Priority 3 / entry quality only:

- Top-of-book spread
- 0.1% / 0.25% book depth
- Impact bid/ask prices

Order book should not be used as a directional signal.

### Proposed Files

Add:

- `market-intel/scripts/fetch-hyperliquid-context.js`

Outputs:

- `market-intel/data/hyperliquid-context.json`
- `market-intel/data/hyperliquid-context-history.jsonl`

Optional later:

- `market-intel/data/hyperliquid-trades.jsonl` if websocket collection is added

### Proposed Orchestrator Wiring

Step 0 would become:

```bash
node market-intel/scripts/fetch-backpack-snapshot.js
node market-intel/scripts/fetch-extras-cache.js
node market-intel/scripts/fetch-binance-context.js
node market-intel/scripts/fetch-hyperliquid-context.js
```

Add `HYPERLIQUID_CONTEXT_PATH` to analyst context.

### Scoring Guardrails

Do not let external venues stack into excessive signal inflation.

Recommended caps:

- Binance adjustment max: ±0.05
- Hyperliquid adjustment max: ±0.03
- Combined external venue adjustment max: ±0.06

Apply no positive Hyperliquid boost if:

- data is stale over 45 minutes
- endpoint result is partial/degraded
- only order book confirms the trade
- Backpack price action does not support the setup

### How It Helps Current Signals

Long setup confirmation:

- Backpack setup is bullish
- Hyperliquid price/OI rising
- taker buy share above baseline
- funding not overheated or negative funding streak suggests squeeze pressure
- premium not excessively positive

Short setup confirmation:

- Backpack setup is bearish
- Hyperliquid price down with OI up
- taker sell share above baseline
- positive funding streak suggests crowded longs vulnerable to squeeze down
- premium not excessively negative

Crowding penalty:

- strong long setup but Hyperliquid funding and premium are already stretched positive
- strong short setup but premium is already deeply negative

Entry-quality caution:

- wide spread or thin book on Hyperliquid during signal time suggests broader perp liquidity is poor, but this should only reduce confidence slightly.

### Recommendation

Implement as Phase 1b after observing Phase 1 Binance context for a short period. This is useful, low-risk, and compatible with the current architecture if kept context-only and capped.

### Revised Hyperliquid / External Venue Guardrails

Added after review: 2026-05-05 13:17 UTC

Important corrections to the Phase 1b Hyperliquid idea:

1. **Binance and Hyperliquid are correlated sources.**

They should not be treated as independent confirmations. If Binance OI expands and Hyperliquid OI expands, that is usually one broad leverage signal observed on two venues, not two separate pieces of evidence.

Revised cap:

- Combined external derivatives context should stay around ±0.05 until validated.
- Hyperliquid should only add marginal value when it shows something Binance does not, especially HL-specific crowding, cascade risk, or venue-local stress.

2. **Current caps are provisional, not empirical.**

The prior ±0.05 Binance / ±0.03 Hyperliquid / ±0.06 combined caps are educated guesses. They should not be treated as proven. Validate against historical Backpack signal outcomes before increasing weight.

3. **Broad confirmation can mean late/crowded, not right.**

If Backpack, Binance, and Hyperliquid all show:

- rising price
- expanding OI
- aggressive buying
- rising positive funding

that can be late-stage momentum and crowded long risk, not pure confirmation. Scoring must separate:

- directional confirmation
- crowding penalty
- entry timing risk

4. **Funding divergence is venue-specific.**

External negative funding on Binance/Hyperliquid can imply squeeze pressure there, but if Backpack funding is neutral, the squeeze is not necessarily local to Backpack. Backpack may follow via arbitrage, but timing/magnitude can differ. External squeeze pressure should improve context only if Backpack price action confirms.

5. **PAXG needs separate treatment.**

PAXG perps are much thinner and less comparable across venues. Binance/Hyperliquid PAXG context may have low predictive value for Backpack PAXG.

Rules to add before using external PAXG context:

- require minimum OI / volume threshold
- external context cap near zero until validated
- flag low-liquidity PAXG data separately
- do not apply BTC/ETH/SOL external-context assumptions to PAXG

6. **Hyperliquid represents HL traders, not all aggressive perp traders.**

The label "aggressive perp crowd" is useful but imprecise. HL-specific data may be noisy or self-similar. Use it mainly for HL-specific crowding/cascade risk, not broad market truth.

7. **Add inter-venue price divergence.**

Cheap and useful metric to add across Backpack/Binance/Hyperliquid:

- Backpack vs Binance mark/last spread
- Backpack vs Hyperliquid mark/mid spread
- Binance vs Hyperliquid spread

Use cases:

- Backpack premium = possible execution risk / local demand / liquidity stress
- Backpack discount = possible local selling pressure
- widening spreads = caution on entry quality

8. **Sequence discipline.**

Do not wire Hyperliquid into scoring immediately. First run Phase 1 Binance-only context for 4–6 weeks and measure whether it improves signal accuracy versus baseline. Hyperliquid should be added only if it adds marginal value beyond Binance.

Revised model:

- Backpack decides whether a trade exists.
- Binance validates whether the broader derivatives market agrees.
- Hyperliquid adds only if it shows something Binance does not: HL-specific crowding, cascade risk, or venue stress.

---

## Output Routing Fix — Telegram Orchestrator Runs

Added: 2026-05-05 13:24 UTC

Problem observed:

- When the orchestrator is triggered from Telegram, internal analyst/subagent completions can appear as multiple user-facing messages.
- Some child agents return raw JSON by design, and that JSON can leak to the chat instead of being used only for synthesis.
- The desired behavior is one clean Market Intel brief, not progress chatter or raw asset JSON.

Fix / rule:

- Analyst outputs are internal only.
- No child completion messages, progress notes, or raw JSON should be sent to Telegram.
- Manual user-requested runs should return exactly one clear final summary:
  - market situation
  - signals sorted by strength
  - entries/stops/targets when available
  - macro/sentiment context
  - whether alert criteria were met
  - bottom line / what to watch
- Scheduled 30-minute alert checks should send Telegram only if a signal is ≥0.70 and cooldown allows; otherwise final reply should be `NO_REPLY` / no delivery.

Files updated:

- `market-intel/agents/orchestrator-agent.md`
- cron payload for `Market Intel Alert Check (30m)`

Follow-up fix: 2026-05-05 13:47 UTC

Raw JSON/progress messages were still appearing in Telegram. This suggests leakage from visible subagent completion delivery, not just wording in the orchestrator prompt.

Mitigation applied:

- Disabled direct delivery on the 30-minute alert-check cron while a clean renderer is pending.
- Added `market-intel/run-orchestrator-clean.md` for Telegram/manual runs.
- Clean runs should avoid visible `sessions_spawn` from Telegram-facing sessions and produce one final human-readable summary only.

Next engineering step:

- Build a deterministic renderer script that converts the latest `signals.json` run into one Telegram summary, then only deliver that rendered text.

---

## Data Reset — Phase 1 Clean Start

Date: 2026-05-05 19:18 UTC

Archived old/backtest/autoresearch data to:

- `market-intel/data/archive/pre-phase1-2026-05-05-1918/`

Archived files included:

- `signals.json`
- `autoresearch/price-15m.jsonl`
- `autoresearch/episodes.jsonl`
- `autoresearch/episodes-updates.jsonl`
- `autoresearch/scores.jsonl`
- `backtest-results.json`
- `signal-performance.json`
- `signals-history.jsonl`
- `signal-history.json`

Reset active files:

- `market-intel/data/signals.json` → `[]`
- `market-intel/data/autoresearch/price-15m.jsonl` → empty
- `market-intel/data/autoresearch/episodes.jsonl` → empty
- `market-intel/data/autoresearch/episodes-updates.jsonl` → empty
- `market-intel/data/autoresearch/scores.jsonl` → empty

Note: autoresearch files were not empty before reset. They contained baseline-v1.0 episodes and price samples from 2026-04-19 onward. They are now intentionally empty so Phase 1 tracking starts cleanly.

---

## Binance Context Collector Fix — 2026-05-05 19:31 UTC

Checked `market-intel/scripts/fetch-binance-context.js` directly from `/home/clawdbot/.openclaw/workspace`.

Result:

- Script execution: OK
- Output: `market-intel/data/binance-context.json`
- History append: `market-intel/data/binance-context-history.jsonl`
- Data quality: OK
- Markets: BTC, ETH, SOL, PAXG

Root cause of cron failures was not the Binance script itself. The failing cron was using an AI `agentTurn` wrapper every 30m, and recent failures were model/response/rate-limit failures such as `Agent couldn't generate a response` / provider cooldown.

Cron `ae7eb854-8ed7-4c4b-b3b0-400786663370` was simplified to a minimal command-only prompt, switched to `deepseek`, delivery kept `none`, and failure alert configured after 3 consecutive failures to Telegram `YOUR_TELEGRAM_CHAT_ID`.

Note: long-term best fix is deterministic non-LLM script scheduling if OpenClaw supports it; current cron system still uses `agentTurn`.

---

## Autoresearch Cron Cleanup — 2026-05-05 19:41 UTC

Actions taken:

1. Kept/fixed price sampler cron `54ce96d7-4299-43c2-9526-9b9d34b124c1`.
   - Runs `node market-intel/scripts/autoresearch-sample-prices.js`
   - Model: `openai-codex/gpt-5.5`
   - `lightContext: true`
   - Delivery: `none`
   - Failure alert: after 3 consecutive failures to Telegram `YOUR_TELEGRAM_CHAT_ID`
   - Manual test: OK, appended to `market-intel/data/autoresearch/price-15m.jsonl`

2. Disabled baseline episode issuer cron `acb79763-26d5-4a77-9891-98d05cc475a7`.
   - Reason: old `baseline-v1.0` episode generation should not contaminate Phase 1 tracking after today’s improvements.

3. Disabled episode evaluator cron `0c6fe8ed-d7a7-4b0c-8e10-5dd2db719f18`.
   - Reason: it evaluates old `baseline-v1.0` episodes, not actual Phase 1 Market Intel signals.

Future redesign:

- Build a Phase 1 autoresearch evaluator that reads actual runs from `market-intel/data/signals.json`.
- Convert qualifying and watch-level signals into evaluation records with the exact Phase 1 config/version.
- Use `price-15m.jsonl` as the price path for entry/fill/TP/SL/outcome checks.
- Keep archived baseline-v1.0 files as historical comparison only.

Update 2026-05-05 19:45 UTC:

- Disabled price sampler cron `54ce96d7-4299-43c2-9526-9b9d34b124c1` after confirming it works.
- Reason: running sampler as an `agentTurn` every 15m consumes GPT tokens. Keep disabled until moved to deterministic/non-LLM scheduling or explicitly re-enabled.

Update 2026-05-05 19:55 UTC:

- Changed Market Intel orchestrator cron `2f4ef81b-54c0-4aa2-a412-344aea281455` from every 30 minutes to strategic 4x/day:
  - cron: `15 0,7,13,20 * * *` UTC
  - runs at 00:15, 07:15, 13:15, 20:15 UTC
  - rationale: capture Asia/daily reset, London/Europe, pre-US/NY setup, and US close/risk reset while reducing GPT token burn.
- Disabled standalone Binance collector cron `ae7eb854-8ed7-4c4b-b3b0-400786663370` because main orchestrator already runs `fetch-binance-context.js` in Step 0b.

Update 2026-05-05 19:58 UTC:

- Fixed remaining subagent leakage source in `market-intel/agents/orchestrator-agent.md`.
- Root cause: despite earlier routing warnings, the orchestrator instructions still explicitly told the runtime to `sessions_spawn` crypto/gold/macro/sentiment analysts. Manual chat runs could therefore still emit visible child-agent trigger/completion messages.
- Changed orchestrator to single-session-only:
  - hard rule: do not call `sessions_spawn`
  - do not spawn analyst agents or child sessions
  - read analyst instruction files as guidance only
  - perform BTC/ETH/SOL/PAXG/macro/sentiment analysis inside the same run
  - store structured results but output only one clean brief or `NO_REPLY`
- Updated strategic Market Intel cron payload `2f4ef81b-54c0-4aa2-a412-344aea281455` with the same no-subagent rule.

Update 2026-05-05 20:03 UTC — second leakage source:

- Az reported continued user-visible tidings like `exec run node`, `yield`, or `orchestrator is running` when asking from chat to run the orchestrator.
- Root cause is not only subagents. Any chat-triggered agent workflow that uses OpenClaw tools/exec can surface runtime activity/progress tidings outside the final message.
- Prompt wording cannot reliably suppress UI/runtime tool activity. The safe architecture is:
  1. Scheduled strategic cron runs in isolated session with delivery `none`.
  2. Manual chat command should NOT directly execute the orchestrator agent workflow.
  3. Build/use a deterministic non-agent runner + renderer that writes clean result files, then the assistant reads final artifact and sends exactly one clean summary.
  4. Until that exists, manual chat runs may still show tool/progress tidings if executed directly.
- Important: The no-subagent patch fixed child-agent completion leakage, but not tool/exec progress leakage from the parent run.

Update 2026-05-05 20:12 UTC — restored old clean execution path:

- Disabled newer Market Intel cron `2f4ef81b-54c0-4aa2-a412-344aea281455` because it was part of the chat-facing/agent-workflow path that caused visible runtime tidings.
- Re-enabled old working cron `49982d09-769f-436e-a2ad-88b345ca0bcd` (`Market Intelligence Orchestrator (4x Daily)`) and changed schedule to strategic times:
  - `15 0,7,13,20 * * *` UTC
- Rationale: old job runs isolated and announces final Telegram output instead of exposing live chat tool/progress activity.
- Important operational rule: do not ask the live chat session to run the orchestrator directly. Use isolated cron/one-shot jobs only.

Update 2026-05-05 20:15 UTC — DeepSeek/default-model regression evidence:

- Cron history shows old orchestrator runs worked cleanly for many earlier runs with summary `Run complete`.
- Around the DeepSeek/default-model period, runs for `49982d09-769f-436e-a2ad-88b345ca0bcd` and `2f4ef81b-54c0-4aa2-a412-344aea281455` used `deepseek-v4-flash` and produced intermediate summaries like `All 3 Wave 1 analysts spawned`, `Yielding`, etc., plus delivery resolution errors using `channel: last` with missing target.
- This strongly suggests the DeepSeek/default routing + old spawn/yield prompt behavior contributed to noisy/intermediate Telegram-visible output.
- Pinned restored clean orchestrator cron `49982d09-769f-436e-a2ad-88b345ca0bcd` explicitly to `openai-codex/gpt-5.5` and explicit Telegram delivery target `YOUR_TELEGRAM_CHAT_ID`.

---

## Canonical Runner Migration — 2026-05-06

Status: implemented.

Canonical runner:

```bash
node market-intel/orchestrator.js
```

Scheduled alert-only mode:

```bash
node market-intel/orchestrator.js --alert-only
```

Artifacts written on every canonical run:

- `market-intel/data/latest-market-brief.txt`
- `market-intel/data/latest-market-run.json`
- `market-intel/data/signals.json`

Operational changes:

- `market-intel/agents/orchestrator-agent.md` is deprecated and replaced with a stub pointing to the canonical runner.
- `market-intel/run-market-intel.js` is deprecated and exits with guidance to use `orchestrator.js`.
- Original copies were archived under `market-intel/archive/orchestrators/2026-05-06-canonical-migration/`.
- Strategic cron `2f4ef81b-54c0-4aa2-a412-344aea281455` now runs `node market-intel/orchestrator.js --alert-only` on `15 0,7,13,20 * * *` UTC.
- Manual clean Telegram run job created: `80b5cafd-201a-4407-a832-ffe319c27209`. It is disabled by default and should be triggered on demand, not scheduled.

Delivery rules:

- Scheduled runs use `--alert-only`; if no qualifying alert survives threshold/cooldown/event timing, stdout is exactly `NO_REPLY`.
- Manual clean runs use normal mode and send the full rendered summary.
- Do not run the old prompt orchestrator or deprecated runner from chat-facing sessions.

---

## Macro/Extras Reliability Cleanup — 2026-05-06

Status: implemented.

Changes:

- Removed unused/stale PM job-search and old Market Intel/autoresearch cron jobs.
- Removed separate AM/PM Market Intel extras cache cron jobs because the canonical orchestrator refreshes extras internally before each run.
- Active cron list is now intentionally small:
  - `2f4ef81b-54c0-4aa2-a412-344aea281455` — canonical scheduled Market Intel alert-only run.
  - `80b5cafd-201a-4407-a832-ffe319c27209` — disabled manual clean Telegram run, triggered on demand.
- `market-intel/scripts/fetch-extras-cache.js` now also fetches VIX from FRED `VIXCLS` and writes:
  - `market-intel/data/extras/vix.json`
- `market-intel/orchestrator.js` now loads structured extras for Fear & Greed, USD index, yields, and VIX.
- Macro synthesis now stores `macro_structured` with:
  - `risk_regime`
  - `risk_off_driver`
  - `vix`
  - `vix_tier`
  - `usd_index`
  - `usd_pressure`
  - `ten_year_yield`
  - `ten_year_breakeven`
  - `real_yield_proxy`
  - `yield_pressure`
- `market-intel/agents/macro-scout.md` was updated to request those structured fields explicitly.

Verification:

- `node --check market-intel/scripts/fetch-extras-cache.js` passed.
- `node --check market-intel/orchestrator.js` passed.
- `node market-intel/scripts/fetch-extras-cache.js` succeeded:
  - Fear & Greed: 46
  - USD index: 118.3926
  - 10Y yield: 4.45
  - VIX: 18.29
- Full orchestrator test succeeded and recorded structured macro:
  - risk_regime: `RISK_OFF`
  - risk_off_driver: `RATES_USD`
  - vix: `18.29`
  - vix_tier: `MILD`
  - usd_pressure: `HIGH`
  - yield_pressure: `HIGH`

Resulting scoring behavior:

- ETH BUY remained 60% because mild VIX risk-off penalty `-0.03` was offset by Binance negative-funding squeeze support `+0.03`.
- PAXG_PERP WATCH received no automatic gold risk-off boost, as intended.

---

## Telegram Brief Readability Upgrade — 2026-05-06

Status: implemented.

Changed `market-intel/orchestrator.js` renderer from compressed one-line signal bullets to structured sections:

- Header with status and top setup.
- Market regime section:
  - risk regime / driver
  - VIX and tier
  - USD pressure
  - yield pressure
  - sentiment/event timing when available
- Action section showing whether anything is above alert threshold.
- Watchlist/best setups section with per-asset blocks:
  - current price
  - entry
  - stop
  - targets
  - reasoning
  - Binance OI/taker/funding context
  - confluence adjustments
- Bottom line explaining setup quality vs timing and Backpack/Binance roles.

Verification:

- `node --check market-intel/orchestrator.js` passed.
- `node market-intel/orchestrator.js --test crypto_analyst` produced structured output with ETH entry/SL/targets and Binance context.

---

## Cross-Asset Divergence Phase 1.1 — 2026-05-06

Status: implemented.

Design decisions:

- Cross-asset context is owned by the deterministic orchestrator only.
- It is not injected into the crypto analyst prompt to avoid double-counting leadership/divergence.
- BTC breadth caution was intentionally not added; BTC can validly lead while alts lag.
- No new API/data source was added for Phase 1.1.

Data used:

- Existing Backpack signal fields, including `price_24h_change`.
- Existing Binance context:
  - OI change 4h
  - taker buy share 4h
  - funding streak sign/hours
- Existing 90d correlation cache:
  - BTC/ETH correlation currently ~0.928.

Rules added in `orchestrator.js`:

1. BTC/ETH high-correlation signal conflict:
   - If BTC and ETH have opposing BUY/SELL signals and BTC/ETH correlation > 0.85,
   - and neither side has clear OI + taker-flow leadership evidence,
   - apply `-0.04` to both.

2. SOL crowded alt caution:
   - If SOL BUY + positive Binance funding streak >= 48h + SOL taker buy share 4h < BTC taker buy share 4h,
   - apply `-0.03` to SOL.

3. ETH leadership confirmation:
   - If ETH BUY + negative funding streak >= 24h + ETH OI 4h expanding + ETH taker buy share 4h > BTC taker buy share 4h,
   - apply `+0.02` to ETH.

Also fixed sentiment contrarian boost:

- Extreme fear boost now requires numeric Fear & Greed <= 25 when available.
- This prevents phrases like “far from extreme fear” from incorrectly triggering the boost.

---

## OI/Taker Funding Guard — 2026-05-06

Status: implemented.

Problem fixed:

- Negative funding was being treated as automatic squeeze support.
- ETH showed why this was wrong: negative funding persisted while Binance OI contracted and taker flow stayed below 50%, meaning deleveraging/flush rather than confirmed squeeze pressure.

Analyst changes:

- `market-intel/agents/crypto-analyst.md` now distinguishes:
  - `SQUEEZE_CONFIRMED`
  - `SQUEEZE_POTENTIAL`
  - `FLUSH_DELEVERAGING`
- Negative funding may only add conviction when OI/taker flow confirm or recover and price structure confirms.
- If OI 4h < 0, taker 4h < 0.50, OI 30m < 0, and taker 30m < 0.50, the analyst must not output BUY and should cap at WATCH <= 0.55.
- If 4h is weak but 30m recovers, cautious post-flush BUY may be allowed only with structure confirmation and reduced strength.

Orchestrator changes:

- Added deterministic `applyOiFlowGuard()` and `classifyOiTakerFundingState()`.
- Negative funding boost now requires `SQUEEZE_CONFIRMED`.
- `FLUSH_DELEVERAGING` downgrades crypto BUY to WATCH and caps strength at 0.55.
- `POST_FLUSH_RECOVERY` allows BUY but applies `-0.06` penalty.
- `SQUEEZE_POTENTIAL` caps strength at 0.60 and removes the squeeze boost.

Verification:

- `node --check market-intel/orchestrator.js` passed.
- `node market-intel/orchestrator.js --test crypto_analyst` produced:
  - SOL WATCH 48%
  - BTC WATCH 47%
  - ETH WATCH 45%
- ETH reasoning correctly classified negative funding + falling OI + weak taker flow as `flush deleveraging`, not squeeze fuel.

---

## Scheduled Cron Reliability Fix — 2026-05-07

Status: implemented.

Problem:

- Strategic scheduled Market Intel cron `2f4ef81b-54c0-4aa2-a412-344aea281455` had a recent `Agent couldn't generate a response` failure after the orchestrator command path.
- The cron payload embedded a long shell command directly in the agent prompt, which made the run more dependent on final agent-response reliability.

Changes:

- Added deterministic wrapper:
  - `market-intel/scripts/run-orchestrator-cron.sh`
- Wrapper behavior:
  - runs `node market-intel/orchestrator.js`
  - suppresses harmless stderr/plugin warnings on success
  - prints only `market-intel/data/latest-market-brief.txt`
  - prints bounded stdout/stderr diagnostics only on failure
- Updated scheduled cron payload to call the wrapper directly.
- Switched parent cron agent model to `sonnet` with fallbacks:
  - `deepseek/deepseek-v4-flash`
  - `openai-codex/gpt-5.5`
- Enabled light context for the cron run.
- Added failure alert after 2 consecutive failures to Telegram `YOUR_TELEGRAM_CHAT_ID`.

Verification:

- `bash -n market-intel/scripts/run-orchestrator-cron.sh` passed.
- Direct wrapper execution completed successfully and produced a clean Market Intel brief at `2026-05-07 11:05 UTC`.

Next check:

- Confirm the next scheduled cron run at `13:15 UTC` completes with status `ok`.

Update 2026-05-07 11:14 UTC:

- Az clarified cron model order should be Codex first, then DeepSeek fallback — not Sonnet.
- Updated strategic cron `2f4ef81b-54c0-4aa2-a412-344aea281455`:
  - primary model: `openai-codex/gpt-5.5`
  - fallback: `deepseek/deepseek-v4-flash`

---

## ETH Review -> Microstructure Confirmation Engine Spec — 2026-05-07

Status: spec drafted.

Az and I reviewed the premature ETH `BUY 65%` upgrade from 2026-05-07. The discussion exposed the main Market Intel weakness: the system can confuse a forming setup with a confirmed trade setup.

Key lesson:

- Trigger not fired should cap output at WATCH.
- Trigger tested and failed should enter cooldown/reset-required state.
- Binance-local negative funding is not broad market squeeze confirmation.
- Futures CVD without spot CVD can be leveraged chase, not structural buying.
- Heavy overhead ask liquidity requires absorption/reclaim confirmation.

New build spec written:

- `market-intel/docs/MICROSTRUCTURE_CONFIRMATION_ENGINE.md`

The spec defines:

- immediate safe semantic gates
- explicit state machine
- failed-trigger cooldown and reset criteria
- per-data-type freshness thresholds
- hard gates vs soft component scores
- microstructure collector requirements
- cross-exchange OI-weighted funding aggregation
- spot/futures CVD flow quality classes
- BTC scenario gate
- counterfactual outcome tracking from trigger price
- position sizing tiers
- Phase 1 alerting rules
- Phase 2/3/4 rollout and rollback criteria

Implementation priority:

1. Build Phase 1 instrumentation and semantic gates.
2. Do not activate deeper guards until shadow scoring has enough outcome data.

Update 2026-05-07 12:13 UTC:

- Tightened `market-intel/docs/MICROSTRUCTURE_CONFIRMATION_ENGINE.md` before Phase 1 build:
  - Added `Execution Venue Context`: Backpack is the execution venue for trigger/entry/stop/target/order-book decisions; Binance OB is context only.
  - Added compatibility note that the existing OI/taker/funding guard in `orchestrator.js` should be extended, not duplicated.
  - Added initial fallback weights for cross-exchange composite funding: Binance 0.50, Bybit 0.30, OKX 0.20 when dynamic USD OI weights are unavailable.
  - Clarified that options are context-only until explicit action rules are implemented; removed options from soft scoring contributors for now.
- The new microstructure spec is the canonical phase plan for this confirmation-engine work. Older broad `Planned — Phase 2: Scoring Rebuild` notes remain historical/contextual and should defer to the new spec for implementation order.

Update 2026-05-07 12:21 UTC — Phase 1 semantic gates started:

Implemented in `market-intel/orchestrator.js`:

- Added persistent trigger state path: `market-intel/data/trigger-state.json`.
- Added outcome/counterfactual event path: `market-intel/data/signal-outcome-events.jsonl`.
- Added compact Backpack execution context extraction from `backpack-snapshot-lite.json`.
- Added semantic trigger gate pass after confluence/cross-asset adjustments and before delivery:
  - BUY/SELL with trigger not fired is capped to WATCH.
  - Trigger tested and failed is capped to WATCH and enters cooldown/reset-required state.
  - Cooldown persists across production runs via `trigger-state.json`.
  - Blocked signals append pending counterfactual outcome events anchored to trigger price.

Verification:

- `node --check market-intel/orchestrator.js` passed.
- `node market-intel/orchestrator.js --test crypto_analyst` completed.
- Test output downgraded ETH from BUY-style setup to `WATCH 58%` with reason: semantic trigger gate tested but not held.
- Test output also downgraded SOL to `WATCH 58%` on failed trigger.

Notes:

- Test mode does not persist `trigger-state.json` or outcome events; production scheduled/manual runs will persist them.
- Next Phase 1 work: enable/rework price sampler for pending outcome evaluation, then build microstructure collector.

Update 2026-05-07 12:25 UTC — trigger extraction audit:

- Audited recent `signals.json` crypto playbooks for explicit trigger fields.
- Finding: recent crypto signals did not include explicit `trigger` / `breakout_trigger` fields; many only embedded trigger-like levels in `entry.order_type` text such as `reclaim_trigger_above_2335.7` or `STOP_MARKET_ABOVE_2422.41`.
- Risk: semantic trigger gate fallback to entry range max can test the wrong level when the real trigger is embedded in `order_type`.
- Mitigation applied:
  - `orchestrator.js` now attempts to parse numeric `above/reclaim/breakout_stop_above` or `below/breakdown_below` trigger levels from `entry.order_type` before falling back to entry range/optimal.
  - `agents/crypto-analyst.md` now explicitly requires numeric `trigger` and `breakout_trigger` fields in actionable playbooks.
- `node --check market-intel/orchestrator.js` passed.

Update 2026-05-07 12:46 UTC — price sampler + outcome resolver:

Implemented Phase 1 outcome loop scaffold:

- Added `market-intel/scripts/resolve-signal-outcomes.js`.
  - Reads semantic gate events from `market-intel/data/signal-outcome-events.jsonl`.
  - Reads Backpack price samples from `market-intel/data/autoresearch/price-15m.jsonl`.
  - Measures counterfactuals from trigger price, not signal price.
  - Writes current statuses to `market-intel/data/signal-outcome-status.json`.
  - Appends terminal outcomes once to `market-intel/data/signal-outcome-resolutions.jsonl`.
  - Uses conservative `15m_last_price_sampling`; ambiguous same-sample TP/stop is marked `AMBIGUOUS_TP_STOP`.
- Updated `market-intel/scripts/autoresearch-sample-prices.js` to run the resolver after every successful price sample.
- Added active OpenClaw cron `12d3bb40-d77a-4c9d-9d80-9e2d630ff50f`:
  - name: `Market Intel — Price Sampler + Outcome Resolver (15m)`
  - schedule: `*/15 * * * *` UTC
  - delivery: none
  - model: `deepseek/deepseek-v4-flash`, light context, low thinking
  - failure alert after 3 consecutive failures to Telegram `YOUR_TELEGRAM_CHAT_ID`

Verification:

- `node --check market-intel/scripts/resolve-signal-outcomes.js` passed.
- `node --check market-intel/scripts/autoresearch-sample-prices.js` passed.
- Direct sampler run succeeded and appended a new Backpack price sample.
- Manual cron run succeeded at `2026-05-07T12:45:02.836Z` and resolver reported:
  - events: 0
  - price_samples: 4
  - terminal_total: 0
  - pending: 0

Note:

- OpenClaw cron currently uses an agentTurn wrapper, so the 15m sampler still consumes some LLM tokens despite running deterministic Node scripts. DeepSeek/light-context minimizes cost. A true non-LLM scheduler would be preferable if/when available.

Update 2026-05-07 12:49 UTC:

- Az clarified the 15m price sampler cron should use the same model as OpenClaw.
- Current OpenClaw model checked via session status: `openai-codex/gpt-5.5`.
- Updated cron `12d3bb40-d77a-4c9d-9d80-9e2d630ff50f`:
  - primary model: `openai-codex/gpt-5.5`
  - fallback: `deepseek/deepseek-v4-flash`

Update 2026-05-07 12:56 UTC — sampler scheduling options:

Explored low-token scheduling for the deterministic price sampler/outcome resolver.

Findings:

- Real system cron is available at `/usr/bin/crontab`.
- No user systemd timers are active.
- The sampler and resolver already use `#!/usr/bin/env node`; `/usr/bin/env` exists and Node resolves to `/home/clawdbot/.nvm/versions/node/v24.13.0/bin/node` in this runtime.
- OpenClaw cron only supports agent turns/system events in the current tool surface, so running the 15m sampler through OpenClaw consumes LLM tokens.
- The first OpenClaw sampler run consumed ~13.7k tokens; at 15m cadence that would be ~1.3M tokens/day, too high for deterministic work.

Actions taken:

- Added `market-intel/scripts/run-price-sampler-cron.sh`, a non-LLM-safe shell wrapper with explicit PATH and file logging under `market-intel/data/autoresearch/logs/`.
- Tested the wrapper successfully; it sampled Backpack prices and ran outcome resolution.
- Reduced OpenClaw sampler cron `12d3bb40-d77a-4c9d-9d80-9e2d630ff50f` from every 15m to hourly fallback (`5 * * * *` UTC) to avoid immediate token burn.
- Updated `market-intel/scripts/run-orchestrator-cron.sh` so scheduled Market Intel reports silently run the sampler afterward without changing Telegram stdout.

Recommended final setup:

- Install a real user crontab entry for `market-intel/scripts/run-price-sampler-cron.sh` if 15m sampling is desired.
- Once system cron is active and verified, disable the OpenClaw hourly sampler fallback to eliminate LLM token usage.

Update 2026-05-07 14:03 UTC — non-LLM sampler cron activated:

- Installed user crontab entry:
  - `*/15 * * * * /home/clawdbot/.openclaw/workspace/market-intel/scripts/run-price-sampler-cron.sh`
- Disabled OpenClaw sampler cron `12d3bb40-d77a-4c9d-9d80-9e2d630ff50f` and renamed it to indicate system cron is active.
- Verified crontab contains the sampler entry.
- Verified wrapper remains executable and syntax-valid.
- Existing sampler logs show successful runs, including post-report sampling at `2026-05-07T13:18:30.152Z` with 1 pending event.

Update 2026-05-07 14:14 UTC — microstructure collector built:

Added `market-intel/scripts/fetch-market-microstructure.js`.

Outputs:

- `market-intel/data/microstructure-context.json`
- `market-intel/data/microstructure-history.jsonl`

Collector scope:

- Backpack execution truth:
  - top-of-book bid/ask, mid, spread, spread bps
  - depth-band bid/ask notional and imbalance at 10/25/50/100 bps
  - pending-trigger zone liquidity using `market-intel/data/signal-outcome-status.json`
- Binance context only:
  - recent spot CVD proxy from aggregate trades
  - recent futures CVD proxy from aggregate trades
  - open interest
  - funding/mark/index context
  - ETHBTC/SOLBTC relative strength where available
- Bybit/OKX context only:
  - funding
  - open interest
- Cross-exchange positioning classification:
  - requires at least 2 fresh/non-degraded venues
  - otherwise `INSUFFICIENT_FRESH_VENUES`
  - no scoring/guard activation yet; display-only Phase 1 instrumentation

Validation:

- `node --check market-intel/scripts/fetch-market-microstructure.js` passed.
- Collector run succeeded with `data_quality: OK` for BTC/ETH/SOL/PAXG.
- ETH example at validation:
  - Backpack spread: ~0.043 bps
  - ETH pending BUY trigger: 2331.5
  - ask notional from mid to trigger: ~2.26M
  - cross-exchange funding: MIXED across Binance/Bybit/OKX

Scheduling:

- Updated `market-intel/scripts/run-price-sampler-cron.sh` so the existing non-LLM 15m system cron runs both:
  1. `autoresearch-sample-prices.js` + outcome resolver
  2. `fetch-market-microstructure.js`
- Verified combined wrapper run succeeded and wrote both sampler and microstructure logs.

Update 2026-05-07 14:18 UTC — flow quality populated:

Az flagged that `flow_quality` was empty despite the collector already capturing Binance spot/futures CVD proxies.

Implemented `classifyFlowQuality()` in `market-intel/scripts/fetch-market-microstructure.js`.

Display-only Phase 1 classifications:

- `STRUCTURAL_BUYING`: spot and futures taker buy share both buyer-dominant
- `SELL_PRESSURE`: spot and futures taker buy share both seller-dominant
- `LEVERAGED_CHASE`: futures buyer-dominant without spot confirmation
- `DISTRIBUTION`: spot seller-dominant without matching futures sell pressure
- `SPOT_LED_ACCUMULATION`: spot buyer-dominant without futures confirmation
- `MIXED_OR_NEUTRAL`: mixed/near-neutral flow
- `UNKNOWN`: missing inputs

Threshold:

- Buy/sell dominance requires taker buy share to be at least 3 percentage points away from 0.50.

Validation:

- `node --check market-intel/scripts/fetch-market-microstructure.js` passed.
- Collector run succeeded with `data_quality: OK`.
- Current ETH flow quality classified as `SELL_PRESSURE` because both spot and futures CVD proxies were seller-dominant.
- Full non-LLM wrapper still runs sampler/resolver then microstructure collector successfully.

Update 2026-05-07 14:32 UTC — report now surfaces microstructure display-only:

- Updated `market-intel/orchestrator.js` to refresh/load `market-intel/data/microstructure-context.json`.
- Added `microstructure_context` to the canonical run JSON.
- Added compact per-signal report line:
  - Backpack spread
  - 50bps order-book imbalance
  - trigger-zone bid/ask liquidity when a pending trigger exists
  - flow quality classification
  - cross-exchange funding classification
  - ETHBTC/SOLBTC relative strength when available
  - explicit `(display-only)` label
- Added bottom-line reminder: microstructure block is Phase 1 display-only and does not change scoring yet.

Validation:

- `node --check market-intel/orchestrator.js` passed.
- `node market-intel/orchestrator.js --test crypto_analyst` completed successfully.
- Test report showed:
  - `Data: Backpack OK; Binance OK; Microstructure OK; VIX OK`
  - ETH WATCH 58% retained semantic-gate cap behavior.
  - ETH microstructure line included Backpack spread, 50bps imbalance, asks-to-trigger, trigger distance, flow classification, funding classification, and ETHBTC context.
  - SOL microstructure line included spread, imbalance, flow, funding, and SOLBTC context.
