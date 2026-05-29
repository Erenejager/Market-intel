# Shadow vs Alerts Review — 2026-07-02 09:24 UTC

Window reviewed:
- Last 24h: 2026-07-01 09:24 → 2026-07-02 09:24 UTC
- Post OI-fix window: 2026-06-20 20:15 → 2026-07-02 09:24 UTC
- Larger history sanity check: 2026-05-09 → 2026-07-02 09:24 UTC

## Last 24h

Directional alerts with shadow: 87.

Shadow state distribution:
- SHADOW_NO_SETUP: 47
- SHADOW_BLOCKED: 35
- SHADOW_SETUP_FORMING: 4
- SHADOW_CONFIRMED: 1

Last-24h outcomes by shadow state:
- SHADOW_NO_SETUP: 1h win 43.2%, avg -0.109%; 4h win 47.2%, avg -0.076%; MFE>|MAE| 40.4%
- SHADOW_BLOCKED: 1h win 47.1%, avg +0.016%; 4h win 31.0%, avg -0.180%; MFE>|MAE| 37.1%
- SHADOW_SETUP_FORMING: n=4, 1h win 25.0%, avg -0.035%; 2h avg -0.658%
- SHADOW_CONFIRMED: n=1, 1h +0.120%; MFE>|MAE| true, but 4h/6h slightly negative

Confirmed alerts last 24h:
- 8 confirmed alerts total
- Only 1 was SHADOW_CONFIRMED
- 5 were SHADOW_NO_SETUP, 1 SHADOW_SETUP_FORMING, 1 SHADOW_BLOCKED

## Post-fix window since 2026-06-20T20:15Z

Directional alerts with shadow: 581 using replay script; raw shadow-attached lines counted 674 before stricter direction/outcome filter.

Shadow state distribution on outcome-filtered rows:
- SHADOW_NO_SETUP: 247
- SHADOW_BLOCKED: 181
- SHADOW_SETUP_FORMING: 145
- SHADOW_CONFIRMED: 8

Post-fix outcomes:
- SHADOW_CONFIRMED: n=8, 1h win 75.0%, avg +0.279%; MFE>|MAE| 75.0%
- SHADOW_SETUP_FORMING: n=145, 1h win 46.9%, avg -0.018%; MFE>|MAE| 47.6%
- SHADOW_NO_SETUP: n=247, 1h win 49.6%, avg -0.016%; MFE>|MAE| 47.4%
- SHADOW_BLOCKED: n=181, 1h win 49.4%, avg +0.033%; MFE>|MAE| 50.3%

Post-fix confirmed-alert component averages, n=90:
- flow: +29.5
- OI regime: +4.1
- CVD: +11.0
- funding/crowding: +0.2
- BTC relative: +4.8
- liquidity: +0.1
- macro: -0.3
- failed-breakout/retest: +2.8
- average raw score: 52.1; average effective score: 44.3

This explains why confirmed alerts rarely reach 70: flow confirmation alone contributes ~30, but most events lack strong OI/funding/BTC/liquidity confluence, and long alerts are often penalized by broad positive funding and risk-off macro.

## Code path finding

Alert generation and readiness shadow intentionally use different gates:
- `generateAlerts()` emits `LONG_CONFIRMED`/`SHORT_CONFIRMED` when flow consensus is confirmed with streak >=3.
- `computeReadinessShadow()` requires multi-factor confluence and `effective_score >=70` for `SHADOW_CONFIRMED`.
- Telegram delivery currently keys mainly off `severity === HIGH` or explicit enabled pattern gate, not shadow confirmation.

Therefore the shadow is not "always bad" because the scoring function is broken; it is usually bad because the alert generator is much looser than the readiness gate. The broken/unsafe part is routing: HIGH / enabled-pattern alerts can still reach Telegram while shadow says below-threshold or blocked.

## Specific likely breakages / design bugs

1. Enabled manual pattern gates can bypass the readiness-quality intent.
   - Last-24h routed patterns like `ETH_BTC_PERMITS_ALT_LONG_INVERSE_SHORT_POSTFIX` were below-threshold by shadow and had terrible path quality.

2. Missing exact pattern summaries fail open.
   - `tradeQuality.patternSummary(key)` expects `pattern:<key>` summaries. Current report did not return exact summaries for some enabled keys, so the MFE>|MAE| safety net could not suppress them.

3. Alert wording is confusing.
   - Natural alert type can be `LONG_SETUP` while the empirical pattern is an inverse SHORT watch. That makes the alert feel contradictory.

4. `setup_detected` records raw `score >=40`, not effective score. Blocked alerts can still say setup_detected true while effective score is 0. This is metadata confusion, not primary delivery cause.

## Recommendation

Fail closed for Telegram:
- Deliver ordinary HIGH directional alerts only when `readiness_shadow.state === SHADOW_CONFIRMED` and effective score >=70, unless the alert is explicitly marked observation-only / research-only.
- Enabled empirical/inverse pattern gates must require fresh exact pattern path evidence in the current report. If exact pattern summary is missing: suppress, not send.
- Separate presentation labels: natural source direction vs traded/inverse direction.
