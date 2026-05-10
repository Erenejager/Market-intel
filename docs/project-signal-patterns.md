# Project Signal Patterns

Last updated: 2026-05-25

This file tracks empirically observed signal/market-state patterns. It is diagnostic guidance, not production gating. Do not change scoring, thresholds, delivery, active-context rules, or cooldowns from these notes without separate Phase 4 activation evidence and rollback criteria.

## Phase 3 LONG-direction baseline calibration — 2026-05-25

Population: `data/readiness-shadow.jsonl` joined to `data/autoresearch/price-15m.jsonl`, using episode-style de-duplication of adjacent same-regime rows.

### Primary finding: SHADOW_CONFIRMED LONG underperformed baseline in this regime

Cross-asset LONG baselines:

- All LONG episodes: 4h 49.4%, avg -0.058%; 24h 45.1%, avg -0.399%.
- LONG setup episodes: 4h 57.1%, avg +0.156%; 24h 60.4%, avg +0.273%.
- LONG `SHADOW_CONFIRMED` episodes: 4h 48.0%, avg -0.016%; 24h 43.5%, avg -0.267%.

Interpretation:

- In the current downtrend-heavy collection window, the `>=70 / SHADOW_CONFIRMED` LONG gate is not selecting better-than-average LONG episodes.
- This supports the existing concern that synchronized bullish components can occur near local tops in a downtrend.
- Do not lower/raise the 70 threshold from this sample. Treat this as a Phase 3 formula/structure finding requiring more regime windows.

## OI context findings

## Score band validation

Episode score bands do not show clean monotonic quality ranking in the current regime.

Cross-asset LONG episodes:

- `<40`: 4h 49.2%, avg -0.063%; 24h 44.5%, avg -0.407%.
- `40–49`: 4h 44.6%, avg -0.185%; 24h 36.4%, avg -0.817%.
- `50–59`: 4h 51.0%, avg -0.077%; 24h 50.5%, avg -0.434%.
- `60–69`: 4h 57.5%, avg +0.178%; 24h 50.0%, avg -0.162%.
- `70+`: 4h 48.0%, avg -0.016%; 24h 43.5%, avg -0.267%.

LONG setup-only episodes:

- `60–69`: 4h 74.4%, avg +0.430%; 24h 72.2%, avg +0.854%.
- `70+`: n=12, 4h 58.3%, avg +0.139%; 24h 60.0%, avg +1.283%.

Interpretation:

- v0 LONG score is not a reliable monotonic quality ranker in this downtrend-heavy window.
- `60–69` often outperformed `70+`, supporting the structural concern that `70+` can capture local-top synchronization rather than better quality.
- Do not lower the threshold from this sample; this is v2 design evidence, not v0 tuning authority.

## LONGS_EXITING check

`LONGS_EXITING` is directionally more useful for SHORT context than LONG context, but the strict N1 mechanism remains under-validated.

Cross-asset LONG `LONGS_EXITING`:

- n=172, 1h 41.3%, avg -0.096%; 4h 55.2%, avg -0.025%; 24h 49.4%, avg -0.237%.

Cross-asset SHORT `LONGS_EXITING`:

- n=101, 1h 68.3%, avg +0.116%; 4h 57.4%, avg +0.225%; 24h 63.4%, avg +0.485%.
- setup n=10, 1h 80.0%, avg +0.127%; 4h 70.0%, avg +0.033%; 24h 40.0%, avg -0.309%.
- score 50–59 n=9, 1h 44.4%, avg -0.023%; 4h 55.6%, avg +0.108%; 24h 66.7%, avg +0.577%.
- score 60–69 n=4, 1h 100%, avg +0.255%; 4h 50.0%, avg +0.002%; 24h 50.0%, avg -0.328%.

Asset split for SHORT `LONGS_EXITING`:

- SOL n=24, 4h 79.2%, avg +0.398%.
- ETH n=37, 4h 64.9%, avg +0.417%.
- BTC n=40, 4h 37.5%, avg -0.057%.

Interpretation:

- `LONGS_EXITING` supports shorts directionally in all-data, especially SOL/ETH.
- The strict N1 50–69 mechanism is not strongly validated; keep N1 conservative.

### FRESH_SHORTS + LONG — corrected: not promotable under confirmed-entry definitions

Reconciliation update (2026-06-06): the prior `n=13 / 76.9% 4h` claim was reproduced and found to be **ETH LONG + `oi=LONGS_EXITING` setup-stage rows**, not `FRESH_SHORTS + LONG + SHADOW_CONFIRMED` confirmed-entry quality. The reproduced 13-row pocket was mostly `LONG_SETUP` / `SHADOW_NO_SETUP`, with only two `LONG_CONFIRMED` rows and zero `SHADOW_CONFIRMED` rows.

Locked-definition results from `scripts/analyze-oi-alert-decomposition.js`:

- Full-window confirmed-alert mode `LONG + FRESH_SHORTS + SHADOW_CONFIRMED`: n=46; 4h 42.2%, avg -0.244%; 24h 34.1%, avg -1.216%.
- Full-window episode mode `LONG + FRESH_SHORTS + SHADOW_CONFIRMED`: n=27; 4h 50.0%, avg -0.217%; 24h 40.0%, avg -1.388%.
- Post-2026-05-21 episode mode `LONG + FRESH_SHORTS + SHADOW_CONFIRMED`: n=25; 4h 45.8%, avg -0.343%; 24h 39.1%, avg -1.508%.

Interpretation:

- In the current bearish/sideways regime, do **not** promote `FRESH_SHORTS + LONG` as a tradable confirmed-entry bucket.
- Treat `FRESH_SHORTS + LONG` confirmed alerts as blocked / observation-only **only when current regime matches the bearish/sideways validation window**.
- In other/unvalidated regimes, mark `FRESH_SHORTS + LONG` as `QUARANTINED_OBSERVATION_ONLY`: no promotion, no hard block, collect confirmed-entry data.
- The old `LONGS_EXITING` setup-stage pocket may still be useful for timing research, but it is not confirmed-entry evidence in any regime.
- `BTC_WEAK_VETO_ALT_LONGS` still overrides regardless of score while that regime-specific hard veto is active.

### SOL FRESH_LONGS + LONG — weak / near-hard-block wording

SOL baseline comparison:

- SOL all LONG baseline: 4h 47.9%, avg -0.070%; 24h 47.9%, avg -0.423%.
- SOL `FRESH_LONGS + LONG` all episodes: 4h 22.8% (-25.1pp), avg -0.851%; 24h 12.3% (-35.6pp), avg -2.162%.
- SOL `FRESH_LONGS + LONG` + `SHADOW_CONFIRMED`: n=5, 4h 0/5, avg -1.392%; 24h 0/5, avg -3.180%.

Interpretation:

- Weakness is supported by both alert cohort and all-data episode methods.
- Scope as SOL-specific until ETH/BTC collect matching samples.
- Opposite-direction path check supports this as a true fade candidate, not just avoid:
  - SOL `FRESH_LONGS + LONG` + `SHADOW_CONFIRMED` episodes: n=7, hypothetical SHORT path hit +0.5% MFE within 4h in 100% of cases; avg 4h SHORT MFE +1.542%, median +1.133%; avg 4h close-to-close SHORT return +1.270%.
  - SOL `LONG_CONFIRMED + FRESH_LONGS` alert cohort: n=7, hypothetical SHORT path hit +0.5% MFE within 4h in 100% of cases; avg 4h SHORT MFE +1.433%, median +1.039%; avg 4h close-to-close SHORT return +1.121%.
  - Caveat: adverse -0.3% occurred in 28.6–42.9% depending on cohort, so this is a fade candidate requiring execution discipline, not an automatic market short.

### SOL SHORTS_COVERING + LONG — weak/inverse in sideways/down regime

SOL baseline comparison:

- SOL `SHORTS_COVERING + LONG` all episodes: 4h 34.1% (-13.8pp), avg -0.229%; 24h 35.6% (-12.4pp), avg -1.267%.
- SOL `SHORTS_COVERING + LONG` setup episodes: n=11, 4h 27.3% (-28.3pp), avg -0.201%; 24h 27.3% (-33.8pp), avg -0.860%.

Interpretation:

- Bearish/inverse reading remains appropriate for SOL LONGs in sideways/down regimes.
- Do not mix this with blocked SOL SHORT + OI `SHORTS_COVERING`; that is a separate mechanism.
- Opposite-direction path check is weaker than `FRESH_LONGS`, but still useful as an avoid / light fade watch:
  - SOL `SHORTS_COVERING + LONG` setup episodes: n=11, hypothetical SHORT path hit +0.5% MFE within 4h in 72.7%; avg 4h SHORT MFE +0.701%, median +0.621%; avg close-to-close SHORT return only +0.227%.
  - Interpretation: more front-loaded/noisy than SOL `FRESH_LONGS`; do not frame as a clean sustained fade.

### BTC_WEAK + ALT LONG — avoid / modest fade signal

All-data opposite-direction path check:

- ALT LONG under `BTC_WEAK_VETO_ALT_LONGS` / legacy BTC weak: n=795 episodes.
- Hypothetical SHORT path hit +0.5% MFE within 4h in 40.8%; avg 4h SHORT MFE +0.591%, median +0.352%; close-to-close 4h avg only +0.052%.

Interpretation:

- BTC_WEAK remains a strong no-long / inverse-risk condition.
- It is less clean as an automatic short than SOL `FRESH_LONGS + LONG`; much of the edge is avoidance or tactical fade rather than sustained 4h directional follow-through.

### Late-lag LONG alerts — not a standalone fade

All-data alert path check:

- LONG alerts with `late_lag_min >= 15`: n=145.
- Hypothetical SHORT path hit +0.5% MFE within 4h in 35.2%; avg 4h SHORT MFE +0.482%, median +0.339%; close-to-close 4h avg -0.084%.

Interpretation:

- Late lag alone is not enough for a clean fade signal.
- Use it as supporting context only when paired with adverse OI/regime buckets.

### Blocked SOL SHORT + OI SHORTS_COVERING — separate gate-cost watch

Alert-cohort finding:

- Blocked SOL SHORT with OI `SHORTS_COVERING`: n=8, 1h 87.5%, avg +0.264%; 4h 62.5%, avg +0.073%.

Interpretation:

- Front-loaded 1h gate-cost watch candidate.
- Mechanism is distinct from `N1_GATE_COST`; do not update N1 from this bucket.
- If surfaced in Telegram, frame as research-only with single-regime sample warning.

## Active-context health findings — 2026-05-25

Population: confirmed active-like contexts from `phase1d-alerts.jsonl` joined to 15m price snapshots. Stress thresholds are presentation-only and use `max(asset 7d 1h absolute move p75, floor)` with preliminary floors BTC 0.20%, ETH 0.25%, SOL 0.35%. Caveat: snapshots are last-price close-to-close style, not true OHLC ATR.

### STRESSED is mostly a degradation state, not an entry

Stressed active-like contexts:

- All confirmed active-like: stressed 9/27; 4h outcome from activation 0/9, avg -1.185%; from stress extreme 5/9, avg -0.167%.
- All LONG: stressed 9/23; 4h from activation 0/9, avg -1.185%; from stress extreme 5/9, avg -0.167%.
- Cross-asset `FRESH_SHORTS + LONG`: stressed 3/13; 4h from activation 0/3, avg -0.776%; from stress extreme 2/3, avg +0.098%; unstressed 10/10, avg +0.781%.
- SOL `FRESH_LONGS + LONG`: stressed 4/4; 4h from activation 0/4, avg -1.606%; from stress extreme 2/4, avg -0.322%.

Interpretation:

- `STRESSED` should be framed as original thesis degraded / risk warning.
- Do not frame `STRESSED` as a good entry. For `FRESH_SHORTS + LONG`, unstressed contexts were cleaner than stressed contexts in the current sample.

### Strict RECOVERING is rare in current data

Using strict `RECOVERING = 2 consecutive samples reclaiming activation`:

- RECOVERING after STRESSED: 0/11.
- HEALTHY_RESTORED / 3-sample reclaim: 0/11.
- Provisional FAILED after 4 consecutive stressed samples: 10/11.
- Provisional FAILED after 6 consecutive stressed samples: 9/11.

Interpretation:

- Keep `RECOVERING` as a diagnostic state, but do not frame it as an entry or elevated-conviction signal.
- `FAILED` after 4 consecutive stressed samples is currently better supported than waiting 6 samples, but this remains presentation-only until Phase 4.

### Opposite-trade timing from STRESSED vs FAILED

SHORT returns after LONG contexts became STRESSED vs provisional FAILED:

- All stressed LONG contexts n=10:
  - SHORT from STRESSED trigger: 30m 7/10 avg +0.160%; 1h 7/10 avg +0.062%; 4h 9/10 avg +0.715%; avg 4h MFE +0.999%, avg MAE -0.231%.
  - SHORT from FAILED trigger n=9: 30m 4/9 avg +0.111%; 1h 6/9 avg +0.227%; 4h 6/9 avg +0.593%; avg 4h MFE +0.955%, avg MAE -0.160%.
- `FRESH_LONGS + LONG` stressed n=5:
  - SHORT from STRESSED: 4h 4/5 avg +1.152%; avg MFE +1.393%, MAE -0.381%.
  - SHORT from FAILED n=4: 4h 4/4 avg +1.323%; avg MFE +1.699%, MAE -0.129%.
- SOL `FRESH_LONGS + LONG` stressed n=4 / failed n=3:
  - SHORT from STRESSED: 4h 3/4 avg +1.267%; avg MFE +1.568%, MAE -0.364%.
  - SHORT from FAILED: 4h 3/3 avg +1.668%; avg MFE +2.031%, MAE -0.164%.
- `FRESH_SHORTS + LONG` stressed n=3:
  - SHORT from STRESSED: 4h 3/3 avg +0.193%; avg MFE +0.645%, MAE -0.102%.
  - SHORT from FAILED: 4h 2/3 avg +0.111%; avg MFE +0.292%, MAE -0.212%.

Interpretation:

- `STRESSED` provides meaningful opposite-pressure warning across buckets, but not enough for automatic opposite trades.
- For SOL `FRESH_LONGS + LONG`, `FAILED` appears cleaner than immediate `STRESSED` for research SHORT framing: stronger 4h average and lower adverse excursion in a tiny sample. Use “fade candidate developing” at STRESSED and “fade confirmed / research short cleaner” at FAILED, always with small-n caveat.
- For `FRESH_SHORTS + LONG`, do not frame STRESSED as an automatic short despite positive tiny-n path; say long compromised / stand aside / wait.

## Maintenance notes

- Future `PATTERN_STATS` refresh should be generated from episode-based scripts, not raw 15m row counts.
- Always report bucket performance as deltas vs relevant baseline: all, setup, or `SHADOW_CONFIRMED`.
- Avoid 1h edge claims for `FRESH_SHORTS + LONG`; lead with 4h/24h.
- Telegram wording scope rules:
  - `FRESH_SHORTS+LONG` can be framed cross-asset as a 4h+/24h squeeze-resolution bucket, with LOW_N and BTC/regime caveats.
  - SOL `FRESH_LONGS+LONG` may be framed as failed LONG / research fade-risk; do not apply that SOL-specific stat to ETH/BTC without samples.
  - SOL `SHORTS_COVERING+LONG` may be framed as weak/inverse / avoid-light-fade; do not apply that SOL-specific stat to ETH/BTC without samples.
  - BTC_WEAK + ALT LONG should read as no-long / tactical fade context, not automatic short.
  - Active-context health wording should treat `STRESSED` as a degradation/opposite-pressure warning, `RECOVERING` as diagnostic-only, and `FAILED` as original-thesis dead. Only SOL `FRESH_LONGS + LONG` currently supports explicit research-fade wording, with small-n caveat.
  - Health-state push messages are context updates, not primary trade signals: notify once per transition (`STRESSED`, `RECOVERING`, `FAILED`), use 1-sample `STRESSED`, strict 2-sample `RECOVERING`, and provisional 4-sample `FAILED` wording.
  - `FRESH_SHORTS+LONG` original alert wording should mention the conditional unstressed path: if it stays unstressed, that is the cleanest current path; historical unstressed `FRESH_SHORTS+LONG` was 10/10 at 4h in the current downtrend-heavy regime (small-n, diagnostic only).
  - If `BTC_WEAK_VETO_ALT_LONGS` activates after a LONG context is already live, emit a context update: BTC_WEAK is now active on a live LONG; regime invalidation risk elevated; score does not override this condition.
  - Non-`FRESH_LONGS` FAILED wording may mention all-bucket opposite-pressure evidence (stressed LONG failures had SHORT follow-through 9/10 at 4h, avg +0.715%) but must frame it as diagnostic opposite-pressure evidence, not an auto-short.
