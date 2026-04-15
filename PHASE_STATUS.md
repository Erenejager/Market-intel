# Market Intel Phase Status

Last updated: 2026-07-03 UTC

## Current next work — 2026-07-03

**Status:** Last-24h Telegram failure review converted into a live routing patch. The stale manual explicit watch gate has been closed: pattern-gated Telegram watches now require current exact-pattern trade-quality evidence instead of falling through to broader buckets or hardcoded exemptions.

### Telegram explicit-gate patch — 2026-07-03

Changed files:

- `scripts/phase1d-alerts.js`
- `data/telegram-pattern-gate.json`
- `data/alert-presentation-actions.json`
- `data/trade-quality-report.json/.md` regenerated

Implemented:

1. **Demoted stale explicit Telegram exemptions**
   - `ETH_BTC_PERMITS_ALT_LONG_INVERSE_SHORT_POSTFIX` is now `disabled` / log-only.
   - `BTC_LONG_SETUP_INVERSE_SHORT_POSTFIX` is now `disabled` / log-only.
   - Both were demoted because the 2026-07-02 last-24h delivered Telegram audit showed failed live path quality despite older manual seed stats.

2. **No hardcoded enabled fallback seeds**
   - `ENABLED_WIN_RATE_EXEMPT_PATTERN_KEYS` is now intentionally empty.
   - Static/manual seeds should not bypass current trade-quality evidence.

3. **Exact-pattern evidence is mandatory for enabled pattern-gated Telegram watches**
   - If a future pattern is marked enabled in `data/telegram-pattern-gate.json`, `scripts/phase1d-alerts.js` now requires an exact `pattern:<key>` summary from `trade-quality-report.json`.
   - Missing exact summary suppresses Telegram with `trade_quality_exact_pattern_summary_missing`.
   - Missing/low MFE>|MAE| evidence suppresses with exact-pattern reasons instead of allowing a broader asset/type bucket to pass.

4. **Presentation actions aligned with routing**
   - The two demoted patterns now have `SUPPRESS_TELEGRAM` presentation actions.
   - They remain logged/tracked for future revalidation; no data was deleted.

### Verification — 2026-07-03

- `node --check scripts/phase1d-alerts.js` passed.
- `jq empty data/telegram-pattern-gate.json data/alert-presentation-actions.json` passed.
- `node scripts/build-trade-quality-report.js` regenerated `data/trade-quality-report.json/.md`.
- `PHASE1D_DISABLE_TELEGRAM=1 node scripts/phase1d-alerts.js` dry-run completed at `2026-07-03T10:30:11.786Z` with `ok:true`, `generated:6`, `emitted:2`, and no Telegram sends. Current emitted sample suppressed one BTC retest via `oi_price_regime_pre_fix_data_quarantined`.

### Episode audit + direction bug — 2026-07-03

Added `scripts/audit-alert-episodes.js`, writing:

- `data/episode-audit-current.json`
- `data/episode-audit-current.md`

Audit scope: `data/phase1d-alert-state.json` lifecycle book plus suppression/concentration counts from `data/phase1d-alerts.jsonl`.

Initial finding: the lifecycle book is partially contaminated. Some inverse/fade pattern episodes were tracked using the source alert direction instead of intended trade direction. Example: `BTC_LONG_SETUP_INVERSE_SHORT_POSTFIX` historical episodes were stored as `BTC:LONG`, even though the intended pattern direction is inverse `SHORT`.

Patch added to `scripts/phase1d-alerts.js`: `tradeDirectionFromAlert()` now resolves direction from:

1. `research_note.trade_direction`
2. pattern key suffixes `INVERSE_SHORT` / `INVERSE_LONG`
3. `fade_candidate` verdict by inverting source direction
4. source alert direction fallback

Audit report now detects direction mismatches and marks old MFE/MAE lifecycle metrics as contaminated when direction mismatch exists.

Latest audit at `2026-07-03T10:39:23.827Z`:

- Active episodes: 0
- Closed stored episodes: 18
- Direction mismatches: 9 / 18 (50.0%)
- Clean-direction subset: 9 episodes; target hit 55.6%, failed 33.3%, MFE>|MAE| 55.6%, avg MFE/MAE +0.781% / -0.677%
- Suppression counts in 7d window: `oi_price_regime_pre_fix_data_quarantined` 270, `trade_quality_max_win_rate_1_to_6_not_above_70` 59, `telegram_pattern_gate_disabled` 23, `btc_weak_veto_alt_longs` 10, `active_episode_open_same_asset_direction` 10.

Verification after direction patch:

- `node --check scripts/phase1d-alerts.js` passed.
- `node --check scripts/audit-alert-episodes.js` passed.
- `PHASE1D_DISABLE_TELEGRAM=1 node scripts/phase1d-alerts.js` completed with `ok:true`, `generated:6`, `emitted:0`, no Telegram sends.
- `node scripts/audit-alert-episodes.js` regenerated report.
- `jq empty data/episode-audit-current.json` passed.

### Hard pipeline-health delivery gate — 2026-07-03

Changed files:

- `scripts/phase1d-alerts.js`
- `scripts/write-pipeline-health.js`

Implemented:

1. `phase1d-alerts.js` now reads `data/pipeline-health.json` on every alert run.
2. If pipeline health is non-`OK`, missing, unreadable, or stale/unparseable (>45m), phase1d trade Telegram delivery is suppressed.
3. Suppression reason: `pipeline_health_degraded_trade_delivery_blocked`.
4. Alerts remain logged/tracked; active-context creation is also blocked with `active_context_blocked_by_pipeline_health`.
5. The pipeline health writer's own transition Telegram ping remains separate and is not blocked by this gate, so degradation can still notify the user.
6. `PHASE1D_PIPELINE_HEALTH_PATH` can override the health file path for tests.

Verification:

- `node --check scripts/phase1d-alerts.js` passed.
- `node --check scripts/write-pipeline-health.js` passed.
- `PIPELINE_HEALTH_DISABLE_TELEGRAM=1 node scripts/write-pipeline-health.js` wrote `data/pipeline-health.json` with `status:"OK"`.
- `PHASE1D_DISABLE_TELEGRAM=1 node scripts/phase1d-alerts.js` completed with health gate `blocked:false`, status `OK`, and no Telegram sends.
- Synthetic degraded health test with `PHASE1D_PIPELINE_HEALTH_PATH=/tmp/mi-degraded-health.json` blocked a dummy HIGH alert, set `telegram_suppressed.reason = pipeline_health_degraded_trade_delivery_blocked`, and set `active_context_blocked_by_pipeline_health`.
- `jq empty data/pipeline-health.json` passed.

### Alert starvation / low-N quarantine correction — 2026-07-03

Az reported effectively no alerts for ~48h and suspected the system had become too conservative. Diagnosis confirmed the concern: after `2026-07-03T03:00Z`, HIGH/MEDIUM alerts were mostly suppressed, but not by the new health gate. The main suppressor was `oi_price_regime_pre_fix_data_quarantined`, including buckets where **all** episodes were already post-fix but `post_fix_n < 20`.

Root cause: `build-trade-quality-report.js` used one flag, `oi_data_quarantined`, for two different situations:

1. true stale/pre-fix contamination, and
2. all-post-fix but low-N forward evidence.

Patch:

- `scripts/build-trade-quality-report.js` now separates:
  - `pre_fix_n`
  - `post_fix_n`
  - `oi_data_quarantined` only when pre-fix contaminated rows remain and post-fix N is below full validation threshold
  - `post_fix_only_low_n` when all rows are post-fix but N < 20
  - `oi_data_low_n_reason` for the latter case
- `scripts/phase1d-alerts.js` now allows provisional HIGH alerts through when:
  - `severity === HIGH`
  - bucket is `post_fix_only_low_n`
  - `post_fix_n >= 8`
  - max 1–6h win rate is at least 65%
  - existing bad-path / exact-pattern / disabled-gate checks do not suppress first
- MEDIUM remains conservative unless explicitly enabled.
- True pre-fix-contaminated OI buckets remain hard-suppressed.

Targeted replay proof:

- Fixture: BTC `LONG_CONFIRMED` at `2026-07-03T14:30:10.002Z`, previously suppressed as `oi_price_regime_pre_fix_data_quarantined`.
- New summary: `pre_fix_n:0`, `post_fix_n:9`, `post_fix_only_low_n:true`, `oi_data_quarantined:false`, max 1–6h win `66.7%`.
- New decision: `suppress_after_patch:false`.

Broader sanity check over HIGH alerts since `2026-07-03T03:00Z`: only 1 of 8 recent HIGH alerts would now pass; weaker buckets remain suppressed. This restores some signal flow without reopening the bad stale manual patterns.

### Live trade-quality report switched to post-fix-only — 2026-07-03

Az challenged the previous patch: instead of keeping pre-fix rows in summaries and removing their rate from decision points, the cleaner design is to calculate live decision/report stats from post-fix rows only. This is correct.

Patch:

- `scripts/build-trade-quality-report.js` now defaults to `live_post_fix_only` mode.
- Live effective start is clamped to `2026-06-20T20:15:00Z`, the OI freshness fix cutoff.
- `--include-pre-fix` is now an explicit opt-in for historical/postmortem reports only.
- `data/trade-quality-report.json/.md` now records `decision_data_policy` with requested/effective window.

Verification:

- Regenerated `data/trade-quality-report.json/.md`.
- Current live report: 102 summaries, 58 OI-dependent summaries, `with_pre_fix_rows:0`, `oi_quarantined:0`.
- Dry-run `PHASE1D_DISABLE_TELEGRAM=1 node scripts/phase1d-alerts.js` completed with health gate `blocked:false`, status `OK`, no Telegram sends.

Important corrected conclusion: after switching to true post-fix-only stats, the earlier BTC `LONG_CONFIRMED` example at `2026-07-03T14:30:10.002Z` is **not** a clean reopen candidate. It is no longer stale-quarantined (`pre_fix_n:0`, `post_fix_n:9`), but its post-fix path is poor: MFE>|MAE| 44.4%, favorable-first 22.2%, median MAE about -0.739%. Keeping it suppressed is justified by path quality, not by stale pre-fix data.

Broader replay over HIGH alerts since `2026-07-03T03:00Z`: 0 of 8 pass with post-fix-only stats plus path-quality gates. This means the alert starvation is no longer caused by pre-fix quarantine; current candidate quality is genuinely weak/adverse-first under the active rules.

### Immediate next work

1. Decide product behavior for quiet periods: keep trade Telegram strict, or add a separate low-noise “market state / suppressed candidates digest” so Az still sees what the engine is rejecting.
2. Re-audit delivered Telegram + episode lifecycle after 24h of clean-direction data.
3. Improve Telegram wording/lifecycle update messages for target-hit, failed, invalidated, and watch-only states.
4. Consider adding a compact daily audit/health digest once clean data accumulates.

---

## Current next work — 2026-06-30

**Status:** Telegram alert routing/lifecycle patch deployed. The alert engine was not simply broken; the main failure was routing/UX: stale theses repeated, opportunity/watch alerts were framed as high-conviction pages, and delivered alerts were concentrated in ETH inverse-short / SOL inverse-long families. Today moved Phase 1d alerts from fire-and-forget toward episode-managed routing.

### Alert routing / lifecycle changes — 2026-06-30

Changed file: `scripts/phase1d-alerts.js`

Implemented:

1. **Stable thesis-level dedupe**
   - Old issue: dedupe could be bypassed by volatile fingerprint fields (`flow`, `flow_streak`, `failed_level`, `btc_gate`).
   - New key: `asset + direction + pattern_family`.
   - Cooldown is time-based; raw `failed_level` is not part of identity.
   - Volatile fingerprint remains metadata only.

2. **Trade-direction aware routing**
   - Inverse/opportunity alerts now use `research_note.trade_direction` when available.
   - Fixes source-direction vs trade-direction mismatch for ETH/SOL opportunity bucket caps and lifecycle.

3. **Telegram bucket caps**
   - `ETH_INVERSE_SHORT_OPPORTUNITY`: max 2 per 6h.
   - `SOL_INVERSE_LONG_OPPORTUNITY`: max 2 per 6h.
   - Suppression reason: `telegram_bucket_cap`.
   - Dry-run path (`PHASE1D_DISABLE_TELEGRAM=1`) does not consume cap quota.

4. **Episode lifecycle book**
   - Active/history state stored under `state.alert_episodes.active` and `state.alert_episodes.history`.
   - Current episode key is intentionally coarse: `asset:direction`. This suppresses novel same-direction patterns while an asset/direction episode is open; this is deliberate for noise control until enough live evidence accumulates.
   - Tracks entry, current return, MFE, MAE, target hit, adverse threshold, close reason.
   - Current provisional thresholds:
     - MFE target: `+0.30%`
     - adverse threshold: `-0.50%`
     - recovery check: `30m`
     - required recovery after adverse threshold: `30%`
     - expiry: `6h`

5. **Conflict / episode suppression**
   - Same-run LONG+SHORT Telegram candidates for the same asset are suppressed/logged with `episode_conflict_same_asset_opposite_direction`.
   - New same asset/direction candidates while an episode is open are suppressed/logged with `active_episode_open_same_asset_direction`.

6. **Opposite-signal invalidation**
   - If a new opposite-direction Telegram candidate appears while an old opposite episode is open, the old episode is closed immediately.
   - Close status: `INVALIDATED`.
   - Close reason: `invalidated_by_opposite_signal`.
   - The invalidating alert id/type/direction/thesis/pattern is recorded.
   - The new candidate then proceeds through normal lifecycle/gating.

### Key empirical findings from today

- Raw alert logs and delivered Telegram alerts are different datasets; raw analysis included many alerts that were correctly suppressed.
- Delivered Telegram was concentrated in three opportunity families: ETH blocked-long sell-pressure inverse short, ETH BTC-permits inverse short, and SOL blocked-short spot-led inverse long.
- `oi_price_regime_pre_fix_data_quarantined` rows showed good MFE but poor path quality: roughly 71% MFE>=+0.3%, only ~15% clean-win, and ~66% adverse-first.
- `SOL_LONG_WATCH_ONLY` was especially adverse-first (~83%). It should not be raw-released as a simple Telegram entry page.

### What was deliberately not changed

- **OI quarantine remains active.** Do not lift it yet. Quarantined buckets are often adverse-first and need lifecycle/recovery-aware presentation before release.
- **No auto-trading.** Routing/lifecycle only.
- **No final threshold tuning.** Current episode thresholds need live validation.

### Current trust guidance

Telegram alerts are more trustworthy than this morning for relevance/noise control: stale duplicate spam should be reduced, opportunity families are capped, same-direction episodes prevent repeated pages, and opposite signals invalidate stale old episodes.

However, alerts are still **setup/watch signals, not automatic entries**. Wait for 24–48h of live episode data before trusting `MFE_HIT` / `FAILED` / `INVALIDATED` classifications at scale.

### Immediate next work

1. Let the new routing/lifecycle run for 24–48h.
2. Build/re-run an episode audit report:
   - active episodes
   - episode history
   - `MFE_HIT` vs `FAILED` vs `INVALIDATED`
   - suppressed-by-reason counts
   - Telegram concentration by bucket
   - bucket cap effectiveness
3. Improve Telegram wording so messages show episode state: opened, target hit, invalidated old thesis, watch-only, etc.
4. Add lifecycle update messages for target-zone / failed / invalidated events.
5. Only then revisit quarantine staging using three axes: post-fix `n`, MFE win rate, and adverse-first / clean-win profile.

---
## Current next work — 2026-06-24

**Status:** Telegram routing review completed. Candidate list cleaned. Two candidates suppressed, three re-enabled as inverse-direction watches. Path behavior wording added to all Telegram messages. No score, threshold, active-context, or cooldown changes.

### Routing review — 2026-06-24

Primary quality metric shift: **1h win rate → 6h MFE/MAE path quality.** 1h win rate is too noisy on this cadence. Going forward, candidate quality is judged by whether median MFE exceeds median MAE over the 6h window, not by hit rate alone.

Overall HIGH directional alert quality since Jun20 fix (n=29 mature 6h episodes):
- 6h close win: 62.1%
- Avg 6h MFE: +0.828% / Avg 6h MAE: −0.576%
- Median 6h MFE: +0.697% / Median 6h MAE: −0.298%
- Verdict: path is constructive. Median favorable excursion meaningfully exceeds adverse. Entries are not just bleeding.

#### Suppressed — 2026-06-24

| key | reason |
| --- | --- |
| `SOL_SHORT_BELOW_GATE_WATCH` | Post-fix 6h MAE (−1.37%) is ~2× MFE (+0.64%). Adverse path too large. |
| `FRESH_SHORTS_LONG` | Post-fix n=1: MFE −0.340%, MAE −0.847%. Never got favorable in 6h window. Adverse-first with no recovery. |

Both remain logged and tracked; Telegram delivery suppressed pending revalidation.

#### Enabled / re-enabled — 2026-06-24

| key | action | expected path behavior |
| --- | --- | --- |
| `ETH_LONG_CONFIRMED_INVERSE_SHORT` | Keep `ENABLE_TELEGRAM_WATCH` | Can fade quickly in SHORT direction, but older sample often squeezed first; wait for exhaustion/rollover, do not chase the first print. |
| `ETH_LONG_SETUP_STRUCTURAL_BUYING_INVERSE_SHORT` | Re-enabled `ENABLE_TELEGRAM_WATCH` | Usually pops/squeezes first, then fades; wait for exhaustion rather than shorting the first print. |
| `ETH_LONG_SHADOW_SETUP_FORMING_INVERSE_SHORT` | Re-enabled `ENABLE_TELEGRAM_WATCH_LOW_N` | Often pushes up first, then rolls over; require fade confirmation. Forward n still small. |
| `SOL_LONG_CONFIRMED_STRUCTURAL_BUYING_INVERSE_SHORT` | Re-enabled `ENABLE_TELEGRAM_WATCH_SMALL_N_ENTRY_RISK` | Commonly squeezes up first, then fades; high entry timing risk — 100% adverse-first post-fix. Wait for rollover. |

Also kept active: `LONGS_EXITING_LONG_UNVALIDATED` (KEEP_TRACKING, currently TRADEABLE_1H_2H_ONLY per trade quality report) and `SOL_SHORT_SHORTS_COVERING_WATCH` (HOLD_REVIEW, n=0 post-fix).

#### Stayed suppressed — unchanged from Jun20

`BTC_LONG_SHADOW_SETUP_FORMING`, `BTC_LONG_SETUP_SPOT_LED_ACCUMULATION`, `ETH_LONG_CONFIRMED_SPOT_LED_INVERSE_SHORT`, `ETH_LONG_SHADOW_BLOCKED_INVERSE_SHORT`, `ETH_LONG_SHADOW_NO_SETUP_INVERSE_SHORT`, `SOL_LONG_SHADOW_CONFIRMED_INVERSE_SHORT` — all failed independent ≥6h-spaced re-validation or depended on frozen OI field.

#### Inverse-direction advisory added

For buckets that are suppressed as original-direction signals but show good MFE in the opposite direction: alerts now carry explicit inverse advisory wording and expected path behavior rather than just being suppressed silently. Implemented in `data/alert-presentation-actions.json` and the Telegram message renderer.

### Key gap not addressed today

`asset_dir:BTC|SHORT` is currently classified `TRADEABLE_1H_4H` in the trade quality report (3h 75.0% win, avg +0.309%, n=12, med MFE4h +0.504% vs MAE4h −0.134%). This is the strongest current bucket and aligns with BEARISH_TREND regime active since 2026-05-26. It was not discussed in today's session — no routing change was made for it. Review at next session.

### Caveats

- Post-fix n for re-enabled inverse candidates is 3–8 episodes (4 days of forward data). All re-enables are provisional — treat as WATCH/low-confidence until n≥15 post-fix.
- SOL_LONG_CONFIRMED_STRUCTURAL_BUYING_INVERSE_SHORT has 100% adverse-first post-fix entry sequence. The message wording captures this but operationalizing it from a Telegram alert is genuinely difficult.
- No score, threshold, active-context creation gate, cooldown, or readiness formula changed.

### Artifacts updated

- `data/alert-presentation-actions.json` — routing changes, behavior wording added
- `data/trade-quality-report.json/.md` — refreshed at 12:00 UTC

---

## Current next work — 2026-06-07

**Status:** Manual BTC price regime v1 diagnostic completed. No production wiring yet.

### Regime diagnostic findings (2026-06-07)

Artifacts: `data/regime-labels-manual-v1.json`, `data/regime-analysis-findings-v1.md`, `scripts/analyze-shorts-by-regime.js`

Basis: BTC_PRICE_ONLY manual labeling — not a full regime engine. OI, funding, and range-expansion not included.

**Corrected conclusions (softened from initial summary):**

1. **BULLISH_SQUEEZE = hard block for all SHORTs.** 36.4% 24h, avg −0.484%. Clearest finding. Confirmed across BTC/ETH/SOL.
2. **BEARISH_FLUSH = explicit exclusion candidate.** 0% 24h, avg −1.826% (n=6). Alert fires during flush; 24h captures reversal. Low-n — exclusion candidate, not final rule.
3. **BTC SHORT is strongest in BEARISH_TREND non-FLUSH.** 80.6% 24h. ACCELERATION gives edge at 1h/2h. GRIND is 24h-only (93% at 24h, 53% at 1h).
4. **ETH SHORT: gate is "not BULLISH_SQUEEZE," not "require BEARISH_TREND."** BEARISH vs NEUTRAL win rates are near-identical (70.4% vs 71.4%); separation only in avg return. Weaker regime gate than BTC.
5. **SOL SHORT remains weak.** 50% 24h in BEARISH_TREND. Not promoted.

**No production wiring from this analysis.** Next step: define minimum regime engine spec from these findings, starting with BULLISH_SQUEEZE hard block and BEARISH_TREND classification rule.

### Regime engine implementation status — 2026-06-07 update

Artifacts added:

- `data/regime-engine-v1-preregistration.md`
- `data/regime-engine-v1-candidate-evaluation.md/json`
- `data/regime-engine-v1p1-plan.md`
- `data/regime-engine-v1p1-candidate-evaluation.md/json`
- `data/regime-engine-v1p2-candidate-evaluation.md/json`
- `data/regime-engine-v1p3-candidate-evaluation.md/json`
- `data/regime-engine-decision-2026-06-07.md`
- `scripts/write-regime-shadow-v1.js`
- `data/regime-current.json`
- `data/regime-history.jsonl`

Decision: price-only `BULLISH_SQUEEZE` detection failed across v1→v1.3 and is no longer treated as a threshold-tuning problem. Likely requires microstructure/positioning or remains `UNKNOWN_SQUEEZE_RISK`.

Started narrow shadow logging only and wired it into the existing 15m system cron runner `scripts/run-price-sampler-cron.sh` after `autoresearch-sample-prices.js` and before microstructure/alerts:

```text
version: regime_engine_bearish_shadow_v1
state: BEARISH_TREND | NEUTRAL
squeeze_risk: UNKNOWN_SQUEEZE_RISK
flush_risk: UNKNOWN_FLUSH_RISK
changes_alert_behavior: false
```

Current latest verified manual run after cron wiring: `BEARISH_TREND`, BTC rolling 7d return `-15.304%`, latest price timestamp `2026-06-07T17:45:01.743Z`, active since `2026-05-26T18:15:01.742Z` by the v1 shadow rule.

No alert behavior, active-context logic, readiness score, routing, or suppression has changed.

Telegram presentation context update — 2026-06-07:

- Added dynamic empirical watch outcome line to delivered HIGH alerts using `data/empirical-watch-report.json`.
- Added stale-report flag if empirical report age is >7 days.
- Added latest BTC regime shadow context line using `data/regime-current.json`.
- Added BTC SHORT + FRESH_SHORTS horizon guidance only for that specific validated bucket.
- Presentation-only: no delivery/gating/active-context impact.

False-squeeze microstructure diagnostic completed in `data/false-squeeze-microstructure-diagnostic.md/json` using representative v1.3 price-only squeeze config joined to BTC microstructure rows.

Result: microstructure did **not** cleanly separate manual BULLISH_SQUEEZE from false-active bearish-window price squeezes. Real/manual squeeze rows had only 47.2% OI4h contraction and 1.4% `SHORTS_COVERING`; false bearish active rows had 31.3% OI4h expansion and 11.6% `FRESH_SHORTS`. OI/funding/flow are not clean enough in this historical sample to define a hard squeeze proxy.

Decision: keep `squeeze_risk: UNKNOWN_SQUEEZE_RISK` for now. Continue bearish-only shadow logging. Do not create a microstructure squeeze classifier without a separate preregistered hypothesis and future validation.

---

## Current next work — 2026-06-06

**Status:** Phase A decomposition found a structural SHORT shadow-engine issue. Do not promote SHORT buckets beyond `WATCH` until a separate production-alert classifier is independently validated and has either a live regime engine or a predeclared interim bearish-regime proxy; alternatively, a versioned shadow fix must be validated on a future independent sample.

### Structural SHORT shadow finding

Post-2026-05-21 `readiness-shadow.jsonl` has zero `SHADOW_CONFIRMED` SHORT rows across BTC/ETH/SOL:

- BTC SHORT: 1612 rows; 0 `SHADOW_CONFIRMED`; 67 `SHADOW_SETUP_FORMING`; setup score median/max 46/61.
- ETH SHORT: 1612 rows; 0 `SHADOW_CONFIRMED`; 55 `SHADOW_SETUP_FORMING`; setup score median/max 48/68.
- SOL SHORT: 1612 rows; 0 `SHADOW_CONFIRMED`; 40 `SHADOW_SETUP_FORMING`; setup score median/max 43/68.

Production `SHORT_CONFIRMED` and shadow `SHADOW_CONFIRMED` are therefore misaligned in the current bearish/sideways regime. `confirmed-alert mode` in Phase A SHORT reports means production `SHORT_CONFIRMED`, not shadow-confirmed.

### Freeze paradox / v1 validation constraint

Existing constraints remain in force:

- Do not tune `readiness_shadow_v0` weights or thresholds on the current sample.
- Any scoring formula change must be versioned separately, e.g. `readiness_shadow_v1`.
- Because the SHORT asymmetry was discovered on the current sample, v1 cannot be validated on that same sample without violating the freeze rule.
- A SHORT shadow fix is therefore blocked for promotion until a future independent validation window accumulates.

Practical consequence: `readiness_shadow_v0` SHORT confirmation is structurally unusable for current-regime confirmation, and v1 repair is research/shadow-only until new data exists.

### Flow-streak cap note

The `flow streak cap applied: max 69` rule is a deliberate conservative burn-in cap for unconfirmed flow streaks, not an outcome-derived data limit. It may still be defensible as a safety rule. However, in the current regime it combines with SHORT component weights to prevent `SHADOW_CONFIRMED` from firing. Do not hotfix v0 by raising/removing the cap unless explicitly treating that as a versioned v1 experiment.

### Viable SHORT analysis path

SHORT classification can proceed only as a production-alert empirical classifier:

- Entry gate: production `SHORT_CONFIRMED`.
- Required OI source gate: OI bucket must trace to a direct `readiness-shadow.jsonl` join within ±16m, not a grouping artifact or legacy report label.
- Discriminators: OI bucket, BTC gate, manually labeled/current regime window, path-risk/MFE/MAE.
- Shadow state: context/diagnostic only; not a confirmation requirement for SHORTs under v0.
- Max class before independent validation: `WATCH`, including `WATCH_REGIME_SPECIFIC_24H_CONTINUATION`.
- Promotion beyond `WATCH` requires independent validation plus either:
  - a full regime engine, or
  - the predeclared interim bearish-regime proxy in `data/interim-bearish-proxy-spec.md`, evaluated by `scripts/evaluate-interim-bearish-proxy.js`.

Remaining Phase A guardrails:

- ETH/SOL `SHORT+LONGS_EXITING` old 64.9%/79.2% claims are formally retracted in `data/retraction-r5-eth-sol-short-longs-exiting.md`. Locked confirmed-alert evidence is ETH n=4 weak/noisy and SOL n=2 tiny pre-May21 only; post-May21 n=0 for both. No ETH/SOL SHORT OI bucket is promotable from Phase A.
- Remaining LONG buckets were run as a bounded batch in `data/long-bucket-batch-phase-a.md/json`. Escalation triggers mostly fired on tiny pre-May21 or n=1 post-May21 pockets; no immediate promotion candidate is established by the batch alone.
- Manual regime labeling is parallel by default, but becomes blocking if follow-up chooses to interpret any tiny LONG pocket as regime-dependent, especially `SHORTS_COVERING+LONG` or `LONGS_EXITING+LONG`.

Interim bearish proxy activation evaluation completed:

- Artifacts: `data/interim-bearish-proxy-activation-decision.md`, `data/interim-bearish-proxy-activation-evaluation.json`, evaluator `scripts/evaluate-interim-bearish-proxy-activation.js`.
- Decision: **do not wire**; keep observation/logging only.
- Check 0 passed: May25-current broad BTC SHORT rows decompose cleanly to direct-join `BTC SHORT + FRESH_SHORTS` via ±16m readiness-shadow join: n=14, 4h 69.2% avg +0.521%, 24h 100.0% avg +3.038%.
- Activation failed because the proxy is too flickery and does not add enough discrimination: proxy=false BTC SHORT rows were also strong (n=10, 4h 66.7%, 24h 100%), and timeline stability had 209 transitions with true-run median 15m.

Operational condition for the BTC short watch:

```text
applicable_when: regime_engine_live_and_bearish_sideways_confirmed OR interim_bearish_proxy == true
interim_proxy_spec: data/interim-bearish-proxy-spec.md
interim_proxy_evaluator: scripts/evaluate-interim-bearish-proxy.js
max_class_until_independent_validation: WATCH
production_alert_confirmed != shadow_confirmed
```

## Current next work — 2026-06-04

**Status:** Phase 3 regime-split evaluation and T1 counterfactual tooling are now in place. Do not promote new behavioral guards until the pre-registered criteria below are met.

### Completed today

- Added date-window support to `scripts/analyze-alert-quality.js`:
  - `--since <ISO>`
  - `--until <ISO>`
  - `--output-suffix <name>`
- Generated regime split reports:
  - `data/alert-quality-report-may09-may21.md/json` — mixed/sideways window.
  - `data/alert-quality-report-may25-current.md/json` — downtrend window.
- Added `scripts/analyze-t1-counterfactual.js` and generated:
  - `data/t1-counterfactual-report.md/json`
- Refreshed tagged downtrend `PATTERN_STATS` wording in `scripts/pattern-classifier.js` for buckets with current tagged evidence.
- Added health-delivery scoping in `scripts/phase1d-alerts.js`: if a context-health alert resolves to a watch-only / pattern-blocked parent alert, the health transition is log-only and Telegram-suppressed. Missing parent lineage keeps default delivery and records the diagnostic scope.
- Built Phase 4 Step 5 as shadow-only in `scripts/phase1d-alerts.js`:
  - Maintains `state.regime_long_watch_shadow` for BTC/ETH.
  - Marks BTC/ETH LONG alerts with `regime_long_watch_shadow` and `would_block_active_context` only when candidate conditions reach 3+ consecutive samples.
  - Does **not** change severity, Telegram delivery, readiness score, cooldowns, or active-context creation.
- Added post-FAILED same-direction reentry analysis:
  - `scripts/analyze-post-failed-reentries.js`
  - `data/post-failed-reentry-report.md/json`

### Regime split headline

Directional HIGH precision remains regime/composition dependent rather than globally predictive:

- May 9–21 mixed window: 1h n=173 hit 48.0%, avg -0.005%; 4h n=173 hit 50.3%, avg +0.060%.
- May 25→current downtrend window: 1h n=96 hit 45.8%, avg -0.041%; 4h n=95 hit 43.2%, avg -0.144%.

Asset/direction split confirms the composition artifact:

- Downtrend BTC SHORT: 4h 69.2%, avg +0.521%; 24h 100.0%, avg +3.038%.
- Downtrend BTC LONG: 4h 40.0%, avg -0.257%; 24h 28.0%, avg -1.427%.
- Downtrend ETH LONG: 4h 33.3%, avg -0.219%; 24h 29.4%, avg -0.844%.
- Downtrend SOL LONG: 4h 26.3%, avg -0.626%; 24h 22.2%, avg -1.595%.
- Downtrend SOL SHORT: 1h 50.0%, avg +0.138%; 4h 40.0%, avg -0.190%; 24h 88.9%, avg +1.892% — useful but path-dependent, not clean 4h conviction.

### T1 counterfactual headline

Current `phase1d-alerts.jsonl` contains **0 tagged `T1_FRESH_LONGS_LONG` events**. This is an absence-of-data result, not evidence for or against T1 validity. T1 has not recurred in tagged form in the inspected log/window, so the report cannot validate or invalidate persistent T1 watch behavior. Keep the 120m production watch unchanged. Re-run `scripts/analyze-t1-counterfactual.js` after the next tagged T1 event before considering shadow infrastructure.

### Pre-registered Phase 4 candidates

1. **BTC/ETH LONG regime watch-only — shadow first**
   - Purpose: prevent production active contexts for BTC/ETH LONGs during confirmed self/market downtrend regimes.
   - No score or threshold changes.
   - Candidate remains shadow-only until at least n>=10 candidate blocks per asset/direction window with measurable improvement versus unblocked LONG outcomes.
   - ETH candidate may use BTC as external regime anchor plus ETH own v1 regime fields.
   - BTC candidate must use stricter self-regime stack because BTC has no external BTC anchor. Candidate condition for 3+ consecutive samples:
     - `long_horizon_regime.trend_4h = DOWN`
     - `long_horizon_regime.return_7d_pct < -10`
     - `long_horizon_regime.distance_from_5d_sma_pct < -3`
     - `oi_price_regime.oi_change_30m < 0`
     - `oi_price_regime.oi_change_4h < 0`

2. **Post-FAILED same-direction cooldown — shadow first**
   - Candidate: after `ACTIVE_CONTEXT_FAILED`, mark same asset/direction production active-context creation as `would_block_same_direction_failed_cooldown` for 4h.
   - Data pass 2026-05-25→current with a 4h window found only 1 same-direction reentry after 11 FAILED events. This is too thin for a standalone guard; fold into Step 5 monitoring for now rather than implementing separate cooldown shadow logic.
   - Activation criterion if revisited: June+ FAILED cohort must show >=10 intercepted same-direction reentry attempts and measurable outcome improvement versus allowed reentries.

3. **Regime-persistent T1 opposite watch — no action yet**
   - Current evidence status: 0 tagged T1 events in the alert log. This is a data gap, not a negative result; no promotion case can be evaluated yet.
   - Before any shadow infrastructure: re-run T1 counterfactual after a tagged T1 event exists.
   - Promotion requires at least one post-120m SHORT confirmation that would have inherited T1 context and resolves cleanly in the counterfactual report.

### Constraints

- No readiness score weight changes.
- No threshold changes; `SHADOW_CONFIRMED >=70` remains unchanged.
- No global `DOWN = block all LONGs` rule.
- No SHORT-side production promotion from the current data; SOL SHORT is path-dependent despite good 24h downtrend outcomes.
- Keep Phase 4 one-guard-at-a-time with rollback criteria.

## Current next work — 2026-05-28

**Priority:** audit existing v1 long-horizon regime instrumentation before changing trade behavior. Recent diagnostics show LONG weakness and useful STRESSED/FAILED risk signals, but the next implementation must respect already-planned divergence review and PATTERN_STATS maintenance.

Execution order:

1. Audit v1 `long_horizon_regime` coverage/data quality since 2026-05-21, explicitly noting that current samples have almost no regime variation; test marginal value inside asset × OI buckets only when enough non-DOWN samples exist.
2. Review Phase 1d vs readiness divergence examples before trusting readiness for gating.
3. Refresh `PATTERN_STATS` from new post-gate/health outcomes.
4. Define machine-readable regime labels using v1 fields where possible, with labels logged as context/modifiers first.
5. Tighten LONG gating conservatively: do not implement a global `DOWN = block LONG` rule, but current evidence supports SOL LONG watch-only / no active context until regime shifts and non-DOWN SOL samples accumulate.
6. Make STRESSED/FAILED hard risk controls.
7. Add silent opposite-watch research logging.
8. Add lifecycle/staleness rule for STRESSED → FAILED sequences.
9. Clean up Telegram wording after logic/data work.
10. Keep daily diagnostics and n≥10 promotion review.

## Current phase

**Phase 1 / 1b / 1c / 1d burn-in + Phase 2 shadow collection started**

Goal: keep production alert behavior stable while collecting unbiased readiness-shadow data for Phase 3 evaluation.

---

## Canonical phase source

Current canonical implementation order is `docs/MICROSTRUCTURE_CONFIRMATION_ENGINE.md`.

Older broad Phase 2/scoring notes are historical. The current rollout is:

1. **Phase 1:** instrumentation + safe semantic gates
2. **Phase 2:** shadow confirmation engine only
3. **Phase 3:** evaluation
4. **Phase 4:** one-guard-at-a-time activation with rollback criteria

---

## Previously completed — 2026-05-07 / 2026-05-08

### 1. Canonical microstructure spec

**Status:** Done

Created and marked canonical:
- `docs/MICROSTRUCTURE_CONFIRMATION_ENGINE.md`

Defines:
- setup vs confirmed trade separation
- hard semantic gates
- trigger state machine
- freshness thresholds
- Backpack as execution venue truth
- Binance/Bybit/OKX as context only
- options as context-only until explicit action rules exist
- Phase 1/2/3/4 rollout and rollback criteria

---

### 2. Phase 1 semantic gates in orchestrator

**Status:** Done

Implemented in:
- `orchestrator.js`

Added:
- persistent trigger state: `data/trigger-state.json`
- outcome/counterfactual event log: `data/signal-outcome-events.jsonl`
- Backpack execution context extraction
- semantic gate pass before delivery

Behavior:
- trigger not fired → cap BUY/SELL to WATCH
- trigger tested/failed → WATCH + cooldown/reset-required
- blocked signals append counterfactual outcome events anchored to trigger price

Validation:
- `node --check orchestrator.js` passed
- test run downgraded premature ETH/SOL BUY-style setups to WATCH

---

### 3. Trigger extraction fix

**Status:** Done

Problem:
- analyst playbooks embedded triggers inside `entry.order_type` text instead of explicit numeric fields.

Fix:
- `orchestrator.js` now parses trigger-like levels from order type text before falling back to entry range/optimal.
- `agents/crypto-analyst.md` now requires explicit numeric `trigger` / `breakout_trigger` fields.

---

### 4. Price sampler + outcome resolver scaffold

**Status:** Done / cost watch

Implemented:
- `scripts/resolve-signal-outcomes.js`
- updated `scripts/autoresearch-sample-prices.js`

Writes:
- `data/signal-outcome-status.json`
- `data/signal-outcome-resolutions.jsonl`
- `data/autoresearch/price-15m.jsonl`

Purpose:
- measure counterfactual outcomes from trigger price.

Caveat:
- 15m OpenClaw agent cron can be token-expensive; prefer non-LLM scheduler if available, or keep cost under review.

---

## Phase 1c — outcome measurement layer

**Status:** Mostly done / accumulating data

Purpose: make Phase 3 evaluation possible by measuring whether signals, blocked counterfactuals, Phase 1d alerts, and future readiness-shadow rows actually led to favorable price outcomes.

Implemented:
- `scripts/autoresearch-sample-prices.js` — 15m price samples
- `scripts/resolve-signal-outcomes.js` — outcome/status resolution
- `scripts/replay-phase1b-validation.js` — limited replay diagnostics
- `scripts/analyze-alert-quality.js` — alert quality report

Writes/uses:
- `data/autoresearch/price-15m.jsonl`
- `data/signal-outcome-status.json`
- `data/signal-outcome-resolutions.jsonl`
- `data/phase1d-alerts.jsonl`
- `data/alert-quality-report.md`
- `data/alert-quality-report.json`

Note: Phase 1c is measurement infrastructure. It does not affect alerts directly.

---

### 5. Phase 1d SHORT_CAUTION initial addition

**Status:** Done, later fixed on 2026-05-09

Added `SHORT_CAUTION` as MEDIUM severity for active shorts when:
- current flow is `LEVERAGED_CHASE`
- CVD divergence is `SPOT_NEGATIVE_FUTURES_POSITIVE`

Later validation found and fixed double-fire with `SHORT_INVALIDATED`.

---

## Completed today — 2026-05-09

### 1. SHORT_CAUTION validation/fix

**Status:** Done

- Found bug where active SHORT + `LEVERAGED_CHASE` + `SPOT_NEGATIVE_FUTURES_POSITIVE` emitted both:
  - `SHORT_CAUTION`
  - `SHORT_INVALIDATED`
- Fixed so futures-led bounce against an active short is caution-only unless:
  - failed level is reclaimed/retesting/held, or
  - flow turns confirmed bullish.

Files:
- `scripts/phase1d-alerts.js`

Validation:
- Synthetic tests pass.
- Re-run produced no duplicate/noisy alerts.

---

### 2. Alert quality diagnostics

**Status:** Done

Added read-only report script:
- `scripts/analyze-alert-quality.js`

Outputs:
- `data/alert-quality-report.md`
- `data/alert-quality-report.json`

Report sections:
1. HIGH alert outcome table
2. Per-penalty outcome split
3. BTC gate flip frequency
4. SHORT_CONFIRMED timing vs local lows

Purpose:
- Track whether HIGH alerts are timely/actionable.
- Track whether Phase 1b penalties improve or hurt signal quality.
- Track BTC gate stability.
- Track SHORT lag without changing confirmation thresholds prematurely.

---

### 3. Failed-breakout deactivation

**Status:** Done

Problem:
- `failed_breakout_counter_ge_5` penalized SOL during a real breakout.
- The counter was not deactivating after clean clearance.

Fix:
- If `price > failed_level + 1 ATR` for **2 consecutive samples**, reset/deactivate the failed-breakout penalty.
- Added `deactivated_at` cutoff so historical candle backfill cannot immediately re-seed old failures.

Files:
- `scripts/fetch-market-microstructure.js`

New fields:
- `deactivation_event`
- `clean_clearance_streak`
- `clean_clearance_rule`

Validation:
- Synthetic failed-breakout test passes.

---

### 4. BTC gate invalidation persistence

**Status:** Done

Problem:
- BTC gate flipped too frequently to invalidate active alt longs on one sample.

Fix:
- `BTC_WEAK_PENALIZE_ALT_LONGS` must persist for **3 consecutive samples** before it can invalidate an active alt long.
- Single-sample BTC gate scoring/context remains unchanged.

Files:
- `scripts/phase1d-alerts.js`

State:
- `data/phase1d-alert-state.json.btc_gate_state`

Validation:
- Synthetic BTC gate test passes:
  - weak sample 1 → no invalidation
  - weak sample 2 → no invalidation
  - weak sample 3 → invalidation
  - neutral resets streak

---

### 5. BTC false short invalidation fix

**Status:** Done

Problem:
- BTC short from 09:30 was invalidated at 10:00 on one unconfirmed `SPOT_LED_ACCUMULATION` sample.
- Flow history was still mostly sell pressure and price remained below short activation.

Fix:
- Active shorts no longer invalidate on one unconfirmed bullish-flow sample.
- Short invalidation now requires:
  - confirmed bullish flow, or
  - structural reclaim/retest/held failed level.

Files:
- `scripts/phase1d-alerts.js`

State correction:
- BTC active short context restored in `data/phase1d-alert-state.json`.

Validation:
- Current BTC context emits no invalidation.
- Synthetic confirmed bullish streak emits `SHORT_INVALIDATED`.

---

## Current live watch items

### BTC active short

**Status:** Active / monitoring

- `SHORT_CONFIRMED` fired at 2026-05-09 09:30 UTC.
- Activation price/mid: ~80221.
- Short was restored after false invalidation.
- Watch outcome in alert-quality report over time.

### BTC gate persistence

**Status:** Monitoring

Watch for:
- BTC gate reaches weak streak 3.
- New alt `LONG_CONFIRMED` happens near the same time.
- Confirm it does not create churn/noise.

### Failed-breakout reset

**Status:** Monitoring

Watch for:
- SOL or other assets clearing failed levels by >1 ATR for 2 samples.
- Confirm penalty resets and does not re-seed from old candle history.

---

## Phase 2 readiness checklist

Before Phase 2 shadow confirmation engine:

- [x] Canonical microstructure spec created
- [x] Phase 1 semantic gates implemented in orchestrator
- [x] Trigger state logger added
- [x] Outcome/counterfactual logger added
- [x] Price sampler + outcome resolver scaffold added
- [x] Microstructure collector live
- [x] Phase 1 transition alerts validated
- [x] SHORT_CAUTION double-fire fixed
- [x] HIGH alert quality report added
- [x] Per-penalty outcome split added
- [x] BTC gate flip frequency added
- [x] SHORT_CONFIRMED timing metric added
- [x] Failed-breakout deactivation implemented
- [x] BTC gate invalidation persistence implemented
- [x] Burn-in for several days with live diagnostics **(Phase 3 evaluation active; allowed-context n>=23 as of 2026-05-25)**
- [x] Review alert-quality report after enough samples **(fresh run 2026-05-25; continue weekly/regime-shift maintenance)**
- [x] Cross-reference/freeze freshness thresholds **(frozen in `docs/MICROSTRUCTURE_CONFIRMATION_ENGINE.md` Phase 2 freeze snapshot; readiness spec inherits)**
- [x] Cross-reference/freeze reset criteria **(frozen in Phase 2 freeze snapshot; failed-trigger reset, failed-breakout clean-clearance reset, and active-context erosion documented)**
- [x] Cross-reference/freeze BTC gate criteria **(frozen in Phase 2 freeze snapshot; `BTC_WEAK_VETO_ALT_LONGS`, 3-sample active invalidation persistence, legacy label normalization)**
- [x] Cross-reference/freeze rollback criteria **(frozen in Phase 2 freeze snapshot; Phase 4 one-guard rollback rules cross-referenced)**

---

## Main files to check

Code:
- `orchestrator.js`
- `agents/crypto-analyst.md`
- `scripts/fetch-market-microstructure.js`
- `scripts/phase1d-alerts.js`
- `scripts/analyze-alert-quality.js`
- `scripts/resolve-signal-outcomes.js`
- `scripts/autoresearch-sample-prices.js`

State/data:
- `data/trigger-state.json`
- `data/signal-outcome-events.jsonl`
- `data/signal-outcome-status.json`
- `data/signal-outcome-resolutions.jsonl`
- `data/autoresearch/price-15m.jsonl`
- `data/microstructure-context.json`
- `data/microstructure-history.jsonl`
- `data/phase1d-alerts.jsonl`
- `data/phase1d-alert-state.json`
- `data/alert-quality-report.md`
- `data/alert-quality-report.json`

Memory log:
- `../memory/2026-05-09.md`

---

## Phase 2 readiness-engine design — 2026-05-09 13:45 UTC

**Status:** Spec created; first shadow implementation active in `scripts/phase1d-alerts.js`. Still no production alert impact.

Added:
- `docs/READINESS_ENGINE_SPEC.md`

Decision:
- Do **not** turn Phase 1d directly into actionable trade firing yet.
- Build a Phase 2 **shadow-only readiness engine** first.
- Separate two questions:
  1. Readiness engine: is the market ready for long/short?
  2. Execution-plan engine: if tradeable, what trigger/stop/TP would be used?

Key rules:
- Readiness scoring is deterministic and shadow-only.
- Numeric score cannot override hard semantic gates.
- v0 weights are fixed before outcome validation to reduce overfitting.
- Agent/LLM scoring is downgraded from authority to context/refinement.
- Agents may still help with macro event risk, chart thesis, and trigger refinement later.

Implementation target status:
- [x] Extend `scripts/phase1d-alerts.js` with `readiness_shadow_v0` in shadow-only mode.
- [x] Keep `data/phase1d-alerts.jsonl` event-only, but add readiness to emitted event diagnostics.
- [x] Append unconditional 15m per-asset snapshots to `data/readiness-shadow.jsonl` for unbiased Phase 3 evaluation.
- [x] Preserve Telegram delivery rules, Phase 1d severity, active context logic, and cooldown behavior.
- [ ] Burn in `data/readiness-shadow.jsonl` for several days.
- [ ] Review divergence cases where Phase 1d alert fires but readiness says `SHADOW_NO_SETUP` / `SHADOW_BLOCKED`.
- [ ] Add Level 3 history-derived metrics later with data-quality guards, if needed.
- [ ] Keep Level 4 execution-plan derivation separate.
- [ ] Do not change orchestrator cadence yet.


### Readiness scoring formula frozen — 2026-05-09 13:50 UTC

Updated `docs/READINESS_ENGINE_SPEC.md` with frozen `readiness_shadow_v0` scoring before implementation/outcome validation.

Locked items:
- LONG and SHORT component weights on 100-point scale
- hard gates
- caps
- thresholds:
  - `>=70` → `SHADOW_CONFIRMED`
  - `40–69` → `SHADOW_SETUP_FORMING`
  - `<40` → `SHADOW_NO_SETUP`
  - hard gate → `SHADOW_BLOCKED`
- explicit rule: future weight changes must be versioned separately and cannot be tuned on the same validation sample.

Implementation decision:
- Add readiness shadow inside `scripts/phase1d-alerts.js`, not a separate script.
- `phase1d-alerts.jsonl` gets readiness attached to events.
- `data/readiness-shadow.jsonl` gets periodic 15m per-asset snapshots for unbiased Phase 3 evaluation.


### Readiness implementation constraints locked — 2026-05-09 13:55 UTC

Added to `docs/READINESS_ENGINE_SPEC.md`:

- readiness snapshots must write unconditionally every 15m, even when no Phase 1d events fire
- `data/phase1d-alerts.jsonl` remains event-only
- `data/readiness-shadow.jsonl` becomes unbiased periodic sample stream
- Level 3 history-derived metrics are optional in v0 and must score neutral if absent/degraded
- 15m sampled funding sign continuity must not be called an “8h funding streak”
- initial patch scope is Level 1 + Level 2 only; Level 4 execution-plan derivation stays separate



### Spec hygiene fixes — 2026-05-09 14:25 UTC

Patched `docs/READINESS_ENGINE_SPEC.md` to resolve implementation ambiguities before coding:

- canonical state name is `SHADOW_CONFIRMED`; removed stale `SHADOW_READY` wording
- removed undefined `SHADOW_WATCH`; mixed/choppy flow maps to `SHADOW_NO_SETUP` with reason `mixed_or_choppy_flow`
- added freshness-threshold cross-reference to `docs/MICROSTRUCTURE_CONFIRMATION_ENGINE.md`
- clarified that R:R cap is skipped in v0 when Level 4 execution-plan derivation is not implemented
- added explicit Phase 1c block to this status file for outcome measurement infrastructure

Architecture unchanged: Phase 2 remains shadow-only; Phase 4 activates one guard at a time after evaluation.

### Phase 2 shadow implementation — 2026-05-09 14:50 UTC

Implemented first Phase 2 shadow patch in `scripts/phase1d-alerts.js`.

Added:
- `READINESS_SHADOW_PATH = data/readiness-shadow.jsonl`
- `loadExtras()` for Level 2 macro/Fear & Greed context
- pure `computeReadinessShadow(asset, direction, m, extras, btcGateState)`
- unconditional per-run snapshots for all assets × both directions
- event enrichment: emitted Phase 1d alerts can carry `readiness_shadow_v0`
- Telegram formatting support:
  - compact line when shadow agrees
  - expanded warning when shadow diverges from alert
  - always labelled shadow-only / no alert impact
- test-only env guard `PHASE1D_DISABLE_TELEGRAM=1` to verify without sending external messages; normal behavior unchanged when unset.

Verified:
- `node --check scripts/phase1d-alerts.js` passed
- one manual run with `PHASE1D_DISABLE_TELEGRAM=1` appended 6 rows to `data/readiness-shadow.jsonl` even though 0 events emitted
- output reported `readiness_snapshots: 6`

Behavior constraints preserved:
- no Telegram delivery rule changes
- no alert severity changes
- no active-context logic changes
- no cooldown/dedupe logic changes
- readiness is shadow-only



---

## Current project view — 2026-05-09 14:55 UTC

### Done

- Phase 1 semantic safety gates are live in `orchestrator.js`.
- Phase 1b microstructure diagnostics are live via `scripts/fetch-market-microstructure.js`.
- Phase 1c outcome measurement infrastructure is live/accumulating.
- Phase 1d deterministic transition alerts are live via `scripts/phase1d-alerts.js`.
- Phase 2 readiness-shadow v0 is implemented shadow-only inside `scripts/phase1d-alerts.js`.
- `data/readiness-shadow.jsonl` now receives unconditional all-assets × LONG/SHORT snapshots every Phase 1d run.
- Emitted Phase 1d alerts can include compact/divergence readiness context in Telegram, always labelled shadow-only.
- Batch 1 legacy cleanup is archived in `archive/legacy-2026-05-09/`.
- `.gitignore` added for runtime/generated files.

### In progress / collecting data

- Burn-in of Phase 1b/1d behavior.
- Burn-in of `readiness_shadow_v0` samples.
- Alert-quality review from `data/alert-quality-report.md/json`.
- Divergence review: cases where Phase 1d alert direction and readiness state disagree.

### Next actions

1. Let the 15m cron collect `readiness-shadow.jsonl` samples.
2. Run/review `scripts/analyze-alert-quality.js` after enough samples.
3. Inspect first divergence examples before trusting the score.
4. If needed, add Level 3 history-derived metrics:
   - recent funding-sign continuity, not true 8h funding streak
   - 4h taker/OI window
   - data-quality guards and neutral fallback when missing/degraded
5. Keep Level 4 execution-plan derivation separate: trigger/stop/TP/R:R.
6. Do not activate readiness gating until Phase 3 evaluation supports it.

### Do not do yet

- Do not use readiness score to fire or suppress Telegram alerts.
- Do not change alert severity based on readiness.
- Do not change active contexts/cooldowns based on readiness.
- Do not reduce orchestrator cadence based on readiness yet.
- Do not tune readiness weights on the first validation sample; future formulas must be versioned.

### Phase 1d active-context delivery mismatch fix — 2026-05-09 18:50 UTC

Issue:
- SOL emitted `RETEST_HELD` at 18:28 UTC with severity MEDIUM.
- `RETEST_HELD` was creating an active LONG context via `activeDirectionFromAlert()`.
- MEDIUM alerts are not delivered to Telegram, so the user did not receive a long/activation alert.
- Later, when flow flipped to `SELL_PRESSURE`, Phase 1d emitted HIGH `LONG_INVALIDATED`, which was delivered — causing an invalidation alert without a prior delivered long alert.

Fix:
- `activeDirectionFromAlert()` now creates active contexts only from actionable HIGH confirmations:
  - `LONG_CONFIRMED` → active LONG
  - `SHORT_CONFIRMED` → active SHORT
- MEDIUM entry-window alerts such as `RETEST_HELD` no longer create active contexts.

Behavior preserved:
- `RETEST_HELD` can still be emitted as contextual/event alert.
- Telegram delivery rules unchanged.
- Invalidation alerts now require a prior HIGH confirmed active context.

### Phase 1d ETH short invalidation refinement — 2026-05-09 19:04 UTC

Issue:
- ETH `SHORT_INVALIDATED` fired at 19:00 because current flow changed to `LEVERAGED_CHASE`.
- The leveraged chase sample was unconfirmed (`flow_confirmed=false`, streak 1), ETH remained below the real invalidation/resistance zone (`2375.33/2386.33`), and failed-breakout/reclaim state was `NO_FAILED_LEVEL`.
- This was too aggressive: unconfirmed leveraged chase should be caution/noise, not automatic short invalidation.

Fix:
- Active SHORT invalidation now ignores `LEVERAGED_CHASE` unless a structural failed-level reclaim/retest/hold exists.
- Active SHORT invalidation still occurs on confirmed bullish flow (`STRUCTURAL_BUYING` / `SPOT_LED_ACCUMULATION` with alert confirmation) or structural reclaim/retest/held failed level.
- Restored ETH active SHORT context from the valid 18:30 `SHORT_CONFIRMED` because the 19:00 invalidation was over-aggressive.

### Phase 1d active-context shadow gate + erosion — 2026-05-10 16:20 UTC

Decision update:
- Earlier Phase 2 readiness was shadow-only. After cross-joining Phase 1d confirmed alerts with readiness/outcomes, readiness is now used as a **production guardrail for active context creation only**.
- Phase 1d can still emit/log/deliver `LONG_CONFIRMED` / `SHORT_CONFIRMED` directional events, but they only create active contexts when readiness agrees at creation time.

Evidence:
- Directional confirms with readiness attached: 17.
- `SHADOW_CONFIRMED` with score >=70: n=3, all positive on available 30m/1h data; only one has full 4h so far (+0.232%).
- Readiness-attached confirms not passing the gate: n=14, 4h hit 9.1%, avg -0.1604%.
- This is promising but not fully validated; treat as a risk-reduction guardrail pending n>=10 gated-context outcomes.

Implemented in `scripts/phase1d-alerts.js`:
- Active context creation now attaches to every delivered/actionable HIGH `LONG_CONFIRMED` / `SHORT_CONFIRMED`; delivery remains upstream and unchanged.
- Readiness no longer blocks post-delivery monitoring. Instead, active contexts store `readiness_tier`:
  - `shadow_confirmed`: readiness shadow `state === "SHADOW_CONFIRMED"` and score/effective_score >=70
  - `below_threshold`: delivered HIGH confirmation below that tier, still health-monitored
- Later shadow upgrades do not retroactively change the original context tier.
- Active contexts store `readiness_gate`, `readiness_tier`, `erosion_count`, and `gate_validation_status`.
- State tracks `active_context_gate_stats.shadow_confirmed_contexts/unconfirmed_contexts` plus recent tiered events; legacy `allowed/allowed_events` remain as back-compat for shadow-confirmed cohort diagnostics.

### Empirical inverse-pattern delivery control — 2026-05-26

Implemented first machine-readable pattern verdict behavior in `scripts/pattern-classifier.js` and `scripts/phase1d-alerts.js`:
- `classifyAlertPattern()` now returns `verdict` metadata.
- `SOL FRESH_LONGS + LONG` / `T1_FRESH_LONGS_LONG` is now `avoid_original_short_primed`:
  - Primary `LONG_CONFIRMED` Telegram trade delivery is suppressed independent of readiness score.
  - A research/info note is delivered instead (`EMPIRICAL_AVOID_ORIGINAL`).
  - The note states the LONG bucket failed empirically and opens a SHORT watch, not an auto-short.
- T1 opens `state.opposite_watch_contexts.SOL`:
  - direction `SHORT`
  - trigger `SHORT_CONFIRMED`
  - bucket `C1_SHORT_MAX`
  - required OI context `FRESH_LONGS`
  - expiry after 2h / 8 samples, or immediately if OI shifts away from `FRESH_LONGS`
- If `SOL SHORT_CONFIRMED` fires while this watch is active and OI remains `FRESH_LONGS`, the alert inherits `C1_SHORT_MAX_T1_INHERITED` pattern treatment regardless of readiness score. Score remains metadata; OI validation comes from T1/FRESH_LONGS.
- `SHORTS_COVERING + SOL LONG` remains `weak_original`: strong caution, no suppression and no opposite watch until larger/cleaner opposite-follow-through sample exists.
- BTC_WEAK alt LONG remains `avoid_original` with existing regime-veto behavior and no opposite watch.
- `fade_candidate` SHORT patterns remain metadata/message only; no behavioral suppression/context downgrade yet because broad positive funding fires too often and needs cleaner validation.

Invalidation/expiry change:
- `MIXED_OR_NEUTRAL`, `LEVERAGED_CHASE`, and `UNKNOWN` no longer immediately invalidate active contexts.
- They increment `erosion_count` as non-confirming samples.
- Same-direction confirming flow resets erosion to 0.
- Counter-signal invalidation requires streak >=2 or `flow_consensus.confirmed === true`:
  - active LONG invalidates on `SELL_PRESSURE` / `DISTRIBUTION` only when persistent/confirmed.
  - active SHORT invalidates on `STRUCTURAL_BUYING` / `SPOT_LED_ACCUMULATION` only when persistent/confirmed.
- Counter-signal streak 1 increments erosion, not invalidation.
- Context expires after 8 consecutive non-confirming samples (~2h at 15m cadence).
- `LEVERAGED_CHASE` does not reset either LONG or SHORT contexts.

Validation:
- `node --check scripts/phase1d-alerts.js` passes.
- VM harness verified:
  - shadow score 67 / `SHADOW_SETUP_FORMING` blocks active context creation.
  - shadow score 70 / `SHADOW_CONFIRMED` allows active context creation.
  - `MIXED_OR_NEUTRAL` expires only after 8 erosion samples.
  - active SHORT + bullish counter-signal streak 1 erodes, streak 2 invalidates.
  - same-direction bearish flow resets SHORT erosion.
- Dry run with `PHASE1D_DISABLE_TELEGRAM=1` succeeded; side-effect files were restored after the dry run.

---

### Pattern classifier stats tracking — 2026-05-17

Implementation note:
- `scripts/pattern-classifier.js` owns Telegram pattern labels and hardcoded `PATTERN_STATS`.
- Current stats were manually derived from the May 15–17 outcome review and are **not live rolling statistics**.
- Treat these as reviewed research constants until refreshed.

Maintenance TODO:
1. After new outcome samples accumulate, rerun/review alert outcomes and update `PATTERN_STATS` in `scripts/pattern-classifier.js`.
2. Keep Telegram stat wording directional: `UP/DOWN n/n @timeframe avg ±x% | n=...`.
3. For low-n or single-window samples, suppress percentages and mark `LOW_N single-window`.
4. Future improvement: generate `PATTERN_STATS` from `phase1d-alerts.jsonl` + outcome resolution data instead of editing strings manually.

Current tracked patterns:
- `T1_FRESH_LONGS_LONG`
- `SHORTS_COVERING_LONG_BEARISH`
- `FRESH_SHORTS_LONG`
- `NEUTRAL_OI_LONG`
- `C1_SHORT_MAX`
- `N1_GATE_COST`

---

### Gate label + alert quality changes — 2026-05-20

**Status:** Done

**1. BTC gate rename: BTC_CONFIRMS_ALT_LONG_CONTEXT → BTC_PERMITS_ALT_LONG_OBSERVATION**

Empirical finding: LONGs under `BTC_CONFIRMS_ALT_LONG_CONTEXT` had 33% 1h win rate (n=15) vs 60% under NEUTRAL and 0% under BTC_WEAK. The label "confirms" was misleading — this gate does not validate a long, it only means BTC is not actively hostile. Legacy normalization kept: old string maps to new label transparently in all read paths.

Regime label updated: `BULLISH_CONTEXT` → `PERMITS_OBSERVATION` in `buildRegimeFields`.

**2. BTC_WEAK inverse-risk empirical line added to alert text**

`formatBtcWeakVetoInfoAlert` now includes:
> Historical win rate: LONG + BTC_WEAK is 0% at 1h (0/7), avg -0.54%; inverse risk 100% at 1h. Shadow score does not override this regime veto.

Source: n=7 LONG alerts fired under `BTC_WEAK_PENALIZE_ALT_LONGS` in the burn-in dataset. All 7 failed at 1h.

**3. Late lag diagnostic added passively**

`attachLateLag` computes how many minutes after the local 4h price extreme the alert fired. Displayed in alert text when lag > 0 (`Late lag: +Xm after local extreme`). No inverse claim attached. Research-only until n grows.

**Resolved — readiness_shadow_v1 re-scoped after Phase 3A diagnostic**

`BTC_PERMITS_ALT_LONG_OBSERVATION` still contributes `+10` to `btc_relative` score in v0. This remains intentionally unchanged: tuning weights on the current diagnosis/validation sample is prohibited by `CLAUDE.md`.

After the 2026-05-21 Phase 3A diagnostic, `readiness_shadow_v1` is **not** a scoring formula. It is frozen as instrumentation-only (`v1-fields-only`) so future rows collect longer-horizon regime context before any scoring version is proposed.

---

### Phase 3A regime/path diagnostic — 2026-05-21

**Status:** Done / diagnostic only

Implemented:
- `scripts/phase3a-regime-diagnostic.js`

Outputs:
- `data/phase3a-regime-diagnostic.json`
- `data/phase3a-regime-diagnostic.md`

Pre-registered before execution:
- BTC regime candidates only:
  - BTC 4h return <= -1%
  - BTC 4h return <= -2%
  - BTC 24h return <= -2%
  - BTC 24h return <= -4%
  - UTC-anchored closed 4h down streak >=2
- UTC 4h candle anchor: 00:00/04:00/08:00/12:00/16:00/20:00, closed candles only before alert timestamp.
- Gate-matched controls separated from exploratory all-HIGH analysis.
- Blocked SHORT path test: +0.30% favorable target before -0.30% adverse stop within 4h using 15m close samples.
- Caveats recorded: small bucket n and 15m close-only path resolution can overstate favorable-first.

Counts:
- allowed contexts: 15
- allowed LONGs: 12
- allowed SOL LONGs: 9
- blocked SHORT 50–67 May17–21: 14

Result:
- No scoring change is justified from this historical sample.
- Failed SOL high-score LONGs were not captured by acute BTC 4h/24h weakness metrics; bearish buckets were near-empty for the key SOL rows.
- Interpretation: this is a time-horizon mismatch. The failed SOL LONGs fired during BTC stabilization/bounce windows inside a broader multi-day downtrend, not during acute 4h/24h BTC weakness.
- Blocked SHORT 50–67 path findings had some favorable movement but regime-qualified buckets were too small for a scoring change.

Decision:
- Do **not** lower SHORT threshold.
- Do **not** add a new inverse/short alert class.
- Do **not** change `BTC_PERMITS_ALT_LONG_OBSERVATION` scoring in v0.
- Use May 9–21 only for diagnosis, not validation.

---

### readiness_shadow_v1 instrumentation-only — 2026-05-21

**Status:** Implemented / no scoring authority

Implemented:
- `scripts/fetch-market-microstructure.js`
  - adds `market.long_horizon_regime` from Backpack 4h klines.
- `scripts/phase1d-alerts.js`
  - copies the field into `readiness_shadow.source_metrics.long_horizon_regime`.
- `docs/READINESS_ENGINE_SPEC.md`
  - documents `readiness_shadow_v1` as `v1-fields-only` and defers scoring changes to future v2.

New forward-collected fields:
- `return_3d_pct`
- `return_7d_pct`
- `reference_5d_sma`
- `distance_from_5d_sma_pct`
- `reference_7d_sma`
- `distance_from_7d_sma_pct`
- `trend_4h`

Guardrails:
- v1 fields do not affect scores, alerts, Telegram, active contexts, cooldowns, or gate thresholds.
- Future scoring changes belong to a later version (`readiness_shadow_v2` or equivalent).
- Future validation must use post-freeze v0/candidate divergence events only: minimum 20 resolved divergence events total and minimum 5 per major divergence type before type-specific claims.

Validation:
- `node --check scripts/fetch-market-microstructure.js` passed.
- `node --check scripts/phase1d-alerts.js` passed.
- `PHASE1D_DISABLE_TELEGRAM=1 node scripts/fetch-market-microstructure.js` succeeded.
- `PHASE1D_DISABLE_TELEGRAM=1 node scripts/phase1d-alerts.js` succeeded and wrote readiness rows with long-horizon fields.

---

### Phase 3 allowed-cohort milestone — 2026-05-25

**Status:** Evaluation threshold crossed / primary diagnostic now active

Az noted, and current state confirms, that the readiness active-context gate has enough allowed samples for meaningful Phase 3 cohort analysis:

- `data/readiness-shadow.jsonl`: continuous collection from May 9 through May 25, ~9.8k rows.
- `data/phase1d-alert-state.json.active_context_gate_stats`:
  - allowed contexts: 23
  - blocked contexts: 158
- This crosses the prior `n>=10` allowed-context milestone. Burn-in is no longer the main blocker for the allowed cohort.

Fresh `scripts/analyze-alert-quality.js` run at `2026-05-25T16:03:22.697Z`:

- Overall HIGH precision remains roughly flat:
  - 1h: n=204, hit 50.0%, avg directional return +0.001%
  - 4h: n=203, hit 50.2%, avg directional return +0.059%
- Allowed contexts, n=23:
  - 1h: hit 30.4%, avg -0.162%
  - 4h: hit 56.5%, avg -0.098%
- Blocked contexts, n=158:
  - 1h: hit 53.5%, avg +0.026%
  - 4h: hit 52.6%, avg +0.084%
- Main weak bucket so far: allowed `SOL LONG`:
  - n=11
  - 1h hit 18.2%, avg -0.376%
  - 4h hit 27.3%, avg -0.612%

Interpretation:

- The active-context gate is not yet globally proving quality.
- The key concern is high-score/allowed `SOL LONG` during broader downtrend or regime mismatch.
- Next Phase 3 diagnostic should isolate allowed `SOL LONG` by long-horizon regime, BTC trend, funding/OI pattern, and compare with blocked `SOL SHORT` / fade-candidate buckets.

Do not change production thresholds/scoring yet. Refresh `PATTERN_STATS` only after reviewing cohort slices and preserving sample-size warnings.

Follow-up diagnostic ordering and findings:

1. Allowed-vs-blocked split by direction confirms a major composition artifact:
   - allowed LONG n=20: 1h hit 25.0%, avg -0.252%; 4h hit 50.0%, avg -0.175%
   - allowed SHORT n=3: 1h hit 66.7%, avg +0.440%; 4h hit 100%, avg +0.417% but very low n
   - blocked LONG n=77: 1h hit 44.2%, avg -0.085%; 4h hit 51.3%, avg +0.011%
   - blocked SHORT n=81: 1h hit 62.5%, avg +0.134%; 4h hit 53.8%, avg +0.154%
2. Blocked `SOL SHORT` is a separate gate-cost watch candidate, not an `N1_GATE_COST` confirmation:
   - all blocked `SOL SHORT` n=25: 1h 72.0%, avg +0.260%; 4h 56.0%, avg +0.218%
   - OI `SHORTS_COVERING` sub-slice n=8: 1h 87.5%, avg +0.264%; 4h 62.5%, avg +0.073%
   - strict `N1_GATE_COST` / `LONGS_EXITING` mechanism has only n=2, so do not update N1 wording.
   - edge appears front-loaded at 1h; do not imply sustained 4h conviction.
3. Allowed `SOL LONG` regime slice remains data-limited for v1 long-horizon fields:
   - all allowed `SOL LONG` n=11: 1h 18.2%, avg -0.376%; 4h 27.3%, avg -0.612%; 24h 10.0%, avg -1.695%
   - v1 long-horizon fields cover only 2 of 11 rows; both were modest winners, so v1 fields cannot yet explain the earlier failed rows.
   - clearer failure pattern: allowed `SOL LONG` with weak OI mechanisms (`FRESH_LONGS` or `SHORTS_COVERING`) despite high score.

`PATTERN_STATS` wording refresh completed in `scripts/pattern-classifier.js`:

- `T1_FRESH_LONGS_LONG`: updated to cumulative 0/11 at 1h; near-hard-block wording in bearish/sideways regimes.
- `SHORTS_COVERING_LONG_BEARISH`: updated to cumulative 0/7 at 1h in sideways/down regime.
- `FRESH_SHORTS_LONG`: notes it is the only positive SOL/LONG OI sub-bucket, but remains LOW_N/watch-only and still overridden by `BTC_WEAK_VETO`.
- No threshold, scoring, delivery, active-context, or cooldown changes.
- Validation: `node --check scripts/pattern-classifier.js` passed.

ETH/BTC allowed LONG OI follow-up:

- Current matched allowed LONG counts: ETH n=4, BTC n=5, SOL n=11.
- ETH allowed LONG: all rows are `FRESH_SHORTS + BROAD_POSITIVE_FUNDING`; 1h 50.0%, avg +0.082%; 4h 100%, avg +0.748%; 24h 75%, avg +2.307%.
- BTC allowed LONG: 1h 20.0%, avg -0.246%; 4h 60.0%, avg +0.047%; 24h 80%, avg +0.435%.
  - BTC `FRESH_SHORTS` n=4: 1h 25%, avg -0.248%; 4h 75%, avg +0.244%; 24h 100%, avg +1.242%.
  - BTC `FRESH_LONGS` n=1 loser; too low to generalize.
- Cross-asset conclusion: SOL-specific weak OI mechanisms (`FRESH_LONGS`, `SHORTS_COVERING`) remain the strongest finding. Do not broaden the SOL near-hard-block wording to ETH/BTC without samples. `FRESH_SHORTS+LONG` remains the constructive OI bucket to monitor, especially beyond 1h.

### Episode-based baseline calibration — 2026-05-25

Added `docs/project-signal-patterns.md` as the current signal-pattern research note.

Primary Phase 3 LONG-direction finding:

- Cross-asset all LONG episode baseline: 4h 49.4%, avg -0.058%; 24h 45.1%, avg -0.399%.
- Cross-asset LONG setup baseline: 4h 57.1%, avg +0.156%; 24h 60.4%, avg +0.273%.
- Cross-asset LONG `SHADOW_CONFIRMED` baseline: 4h 48.0%, avg -0.016%; 24h 43.5%, avg -0.267%.
- Interpretation: in the current downtrend-heavy collection window, `SHADOW_CONFIRMED >=70` is not selecting better-than-average LONG episodes. This is the main Phase 3 LONG-direction structural finding; do not change threshold/weights from this sample.

Calibrated OI findings:

- Correction from 2026-06-06 OI reconciliation: `FRESH_SHORTS+LONG` is **not** currently promotable under confirmed-entry definitions.
  - The old `n=13 / 76.9% 4h` claim was reproduced as ETH LONG + `oi=LONGS_EXITING` setup-stage rows, mostly `LONG_SETUP` / `SHADOW_NO_SETUP`, not `FRESH_SHORTS + LONG + SHADOW_CONFIRMED`.
  - Full-window confirmed-alert `LONG + FRESH_SHORTS + SHADOW_CONFIRMED`: n=46, 4h 42.2% avg -0.244%, 24h 34.1% avg -1.216%.
  - Full-window episode `LONG + FRESH_SHORTS + SHADOW_CONFIRMED`: n=27, 4h 50.0% avg -0.217%, 24h 40.0% avg -1.388%.
  - Practical status: `BLOCKED_CURRENT_BEARISH_SIDEWAYS_REGIME` / observation-only, not tradable promotion. In other/unvalidated regimes, status is `QUARANTINED_OBSERVATION_ONLY` rather than hard-blocked.
- SOL `FRESH_LONGS+LONG` remains weak vs SOL baseline:
  - all episodes: 4h 22.8% (-25.1pp), 24h 12.3% (-35.6pp)
  - confirmed n=5: 4h 0/5, 24h 0/5
- SOL `SHORTS_COVERING+LONG` remains weak/inverse vs SOL baseline:
  - all episodes: 4h 34.1% (-13.8pp), 24h 35.6% (-12.4pp)
  - setup n=11: 4h 27.3% (-28.3pp), 24h 27.3% (-33.8pp)

`scripts/pattern-classifier.js` `FRESH_SHORTS_LONG` wording updated to the calibrated cross-asset 4h+/24h framing. Validation: `node --check scripts/pattern-classifier.js` passed.

### Active-context health updates — 2026-05-25

Implemented presentation-layer active-context health tracking and context-update notifications in `scripts/phase1d-alerts.js`.

Scope:

- No readiness score change.
- No scoring-weight change.
- No active-context creation gate change.
- No erosion-reset/invalidation behavior change.
- No cooldown logic change for primary alerts.

Health thresholds:

- `stress_threshold_pct = max(asset 7d 1h absolute move p75, asset floor)`.
- Preliminary floors: BTC 0.20%, ETH 0.25%, SOL 0.35%.
- Price data caveat: current calculation uses 15m last-price snapshots / close-to-close style ranges, not true OHLC ATR.

Health states:

- `HEALTHY`: active context not beyond stress threshold.
- `STRESSED`: adverse move exceeds the dynamic asset threshold.
- `RECOVERING`: strict 2-sample reclaim of activation with favorable flow after stress. Historical strict recovering was 0/11 in current sample, so wording is diagnostic-only.
- `FAILED`: presentation-only original-thesis failure label.

Presentation-only FAILED causes:

- LONG stressed while `BTC_WEAK_VETO_ALT_LONGS` persists for >=3 samples.
- Stressed plus confirmed opposite flow (`flow_consensus.confirmed` or streak >=2).
- Stressed for 4 consecutive samples with no activation reclaim.

Notification behavior:

- New context-update event types: `ACTIVE_CONTEXT_STRESSED`, `ACTIVE_CONTEXT_RECOVERING`, `ACTIVE_CONTEXT_FAILED`.
- These are delivered as `CONTEXT UPDATE`, not primary trade signals.
- They notify once per status transition and store `last_notified_status/at` to avoid repeats.
- Messages explicitly state: “not a new primary signal; no score/erosion/invalidation logic changed.”

OI / wording caveats:

- New contexts store activation-time `oi_context` and `funding_context`.
- Legacy contexts backfill `oi_context` from current microstructure; this may differ from activation-time OI and should not be used for retrospective calibration.
- SOL `FRESH_LONGS + LONG` FAILED wording cites the current tiny sample: SHORT from FAILED 3/3 at 4h, avg +1.668%, calibrated 2026-05-25. Update this after the next `PATTERN_STATS` / calibration refresh; do not let the literal stat go stale.

Validation:

- `node --check scripts/phase1d-alerts.js` passed.
- Dry-run with `PHASE1D_DISABLE_TELEGRAM=1` and temporary state/log restore emitted expected `ACTIVE_CONTEXT_STRESSED` for current SOL when health was reset.
