# Alert Classification Working Rules

Generated: 2026-06-06

Purpose: pre-analysis guardrails for classifying OI/regime buckets after locked-definition decomposition. These are heuristics until validated; do not tune them after seeing one bucket's result without documenting the change.

## Confirmation source split

LONG and SHORT classification must not assume the same confirmation source.

- LONG analysis may use shadow state (`SHADOW_CONFIRMED`) only when locked rows actually contain shadow-confirmed entries.
- SHORT analysis currently uses production `SHORT_CONFIRMED` as the empirical entry gate, then treats shadow state as context only. Post-2026-05-21 audit found zero `SHADOW_CONFIRMED` SHORT rows across BTC/ETH/SOL despite production `SHORT_CONFIRMED` alerts.
- Therefore `confirmed-alert mode` means production confirmed-alert mode, not shadow-confirmed mode.
- Until the SHORT shadow scoring issue is fixed and validated on an independent sample, or a separate production-alert classifier is independently validated, no SHORT bucket may exceed `WATCH`.
- Regime-specific SHORT watches may use `applicable_when: regime_engine_live_and_bearish_sideways_confirmed` or `interim_bearish_proxy == true`.
- The interim proxy is predeclared in `data/interim-bearish-proxy-spec.md` and evaluated by `scripts/evaluate-interim-bearish-proxy.js`: BTC 4h return `< -0.5%` on at least 2 of the last 3 rolling 4h windows; latest BTC gate is not `BTC_STRONG_ALT_FOLLOWING`; and no recent bullish squeeze in the last 8h.

## Evidence modes required

For every candidate bucket, report all four views:

- confirmed-alert mode, full window
- episode mode, full window
- confirmed-alert mode, post-2026-05-21
- episode mode, post-2026-05-21

A bucket is not promotable if confirmed-alert and episode modes disagree materially, or if recent-window expectancy flips against full-window expectancy.

Required source/schema check for every OI-labeled bucket:

- OI label must trace to a direct `readiness-shadow.jsonl` join within ±16m, using `readiness_shadow.source_metrics.oi_price_regime` or direct shadow source metrics.
- If the OI label only appears through grouping, legacy schema attachment, report labels, or derived episode metadata, the stat does **not** survive as locked-definition evidence regardless of win rate.

## Regime scope

All current decomposition stats are validated only for the current bearish/sideways collection window unless explicitly tagged otherwise.

- Bad data in matched regime => BLOCKED_CURRENT_REGIME.
- Missing data in another regime => QUARANTINED_OBSERVATION_ONLY, not universal block.
- No confirmed-entry claim may cite setup-stage rows as evidence.

## Remaining LONG bucket batch trigger rules

Run remaining LONG buckets as a bounded batch. Do not hand-audit each bucket unless a predefined trigger fires.

Investigate further only if:

- confirmed-alert 4h win rate is `>55%`, or
- confirmed-alert result differs from old remembered/statistical claim by `>10 percentage points` in either direction, or
- confirmed-alert and episode modes materially disagree, or
- full-window and post-2026-05-21 results reverse direction.

If none of those triggers fire, accept the locked-definition result, classify, and move on.

Regime-label dependency: manual regime labeling remains parallel by default, but becomes blocking for any LONG bucket whose locked-definition result is non-obvious/regime-dependent, especially `SHORTS_COVERING+LONG` or `LONGS_EXITING+LONG`.

## Initial class criteria

### TRADABLE_CANDIDATE

Current restriction: SHORT-side buckets cannot be `TRADABLE_CANDIDATE` while the post-May21 SHORT shadow engine has zero `SHADOW_CONFIRMED` rows unless a separate production-alert classifier has independent validation and either a full regime engine or `interim_bearish_proxy == true`. Until then, SHORT buckets can be `WATCH_REGIME_SPECIFIC_*` using production `SHORT_CONFIRMED` evidence.

Requires all:

- n >= 20 in confirmed-alert mode OR n >= 12 in episode mode with confirmed-alert support.
- 4h or 24h win rate >= 60% in both confirmed-alert and episode mode.
- Average return positive in the target horizon in both modes.
- Recent/post-May21 window does not degrade by >15 percentage points in win rate or flip average return negative.
- Path risk acceptable: median MAE at target horizon better than -0.75%, or explicit wording marks wide-stop/path-risk if between -0.75% and -1.25%.
- No hard regime conflict / BTC veto.

### WATCH

Any promising bucket that fails one TRADABLE criterion but has positive expectancy or strong MFE profile.

### BLOCKED_CURRENT_REGIME

Use when matched-regime confirmed-entry evidence is adverse:

- 4h win rate < 45% with negative average, or
- 24h win rate < 45% with negative average, or
- median MAE 24h <= -1.25% and win rate does not compensate.

Low-n adverse buckets can block more readily than low-n favorable buckets can promote, but must remain regime-scoped.

### INVERSE_WATCH

Requires BLOCKED_CURRENT_REGIME plus one of:

- validated opposite-direction mechanism confirms, or
- validated FADE pattern applies, or
- adverse bucket has medium confidence and opposite-direction MFE/close-to-close was separately measured.

BLOCKED alone is not automatically INVERSE_WATCH.

### OBSERVATION_ONLY / QUARANTINED_OBSERVATION_ONLY

Use when regime is unvalidated or sample is insufficient. No promotion, no hard block, collect outcomes.

## Manual regime labeling method draft

Before automated regime detection, manually label known episodes using four factors:

- BTC trend/momentum from 4h candles and 3d/7d context.
- OI character from readiness-shadow `source_metrics.oi_price_regime`, summarized over episode windows with flip counts/stability.
- Funding/crowding from `source_metrics.cross_exchange_positioning.classification`, respecting funding staleness.
- Momentum type from ATR/realized range expansion vs compression.

Known episodes to label:

- May 10 squeeze: expected BULLISH_SQUEEZE.
- May 13 crash: expected BEARISH_ACCELERATION.
- May 17-18 grind: expected BEARISH_GRIND.
- May21+ collection window: expected BEARISH_SIDEWAYS / BEARISH_GRIND depending factor split.

Resolve conflicts by primary factors first (BTC trend + OI character). If primary factors split, label TRANSITION unless one primary is stale/low confidence.
