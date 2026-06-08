# Telegram Alert Improvement Review — 2026-06-07

## Scope

Review current alerts that can reach Telegram and identify low-risk improvements that add useful context without changing production alert behavior.

Current primary sender: `scripts/phase1d-alerts.js`.

Current delivery rule:

```text
Send HIGH severity alerts + selected research-note alerts.
Do not send LOW/MEDIUM setup noise by default.
```

Current deliverable/high alert types observed in `data/phase1d-alerts.jsonl`:

```text
LONG_CONFIRMED
SHORT_CONFIRMED
LONG_INVALIDATED
SHORT_INVALIDATED
ACTIVE_CONTEXT_BTC_WEAK
ACTIVE_CONTEXT_STRESSED
ACTIVE_CONTEXT_FAILED
CROSS_ASSET_COVER
RETEST_FAILED
```

Non-delivered by default:

```text
SETUP_CHANGE LOW
LONG_SETUP MEDIUM
SHORT_SETUP MEDIUM
SHORT_CAUTION MEDIUM
RETEST_HELD MEDIUM
RETESTING_RECLAIMED_LEVEL MEDIUM
```

## Main issue found

Some Telegram pattern lines still use static hardcoded history strings in `scripts/pattern-classifier.js`.

But newer empirical reports exist, especially:

```text
data/empirical-watch-report.md
data/empirical-watch-report.json
```

Example mismatch risk:

- `FADE_SHORT_LATE_AFTER_LOW` static text says prior sample was tiny/mixed.
- Latest empirical report shows it is now large enough to review/untrack:

```text
FADE_SHORT_LATE_AFTER_LOW: n=96 | 1h 44.8% avg -0.174% | 4h 35.9% avg -0.383%
```

This means current Telegram wording can be stale even when the logs have fresher outcomes.

## Recommended improvements

### 1. Add dynamic empirical outcome line to HIGH alerts

For every Telegram-delivered `LONG_CONFIRMED` / `SHORT_CONFIRMED`, attach a compact fresh outcome line from the latest empirical watch data when `alert.empirical_watch.key` exists.

Suggested line:

```text
History: <bucket> | status <STATUS> | n=<N> | 1h <hit>% avg <avg>% | 4h <hit>% avg <avg>%
```

If 24h data is available and n is meaningful, add:

```text
24h <hit>% avg <avg>%
```

Why this helps:

- Telegram shows current evidence, not stale hardcoded summaries.
- The user can immediately see whether this bucket is still valid, weak, or review/untrack.
- Avoids manually updating static strings after every report.

Risk:

- Low if presentation-only.
- Must include `changes_alert_behavior:false` / no delivery change.

### 2. Add regime shadow context to HIGH alerts

Attach latest `data/regime-current.json` to delivered HIGH alerts as context only:

```text
BTC regime shadow: BEARISH_TREND | squeeze UNKNOWN | behavior unchanged
```

For SHORT alerts, this is especially useful:

```text
BTC regime shadow: BEARISH_TREND — supports SHORT continuation research context; not production gating.
```

Why this helps:

- Connects the alert to the newly live bearish regime logger.
- Makes forward review easier because Telegram and JSON both show the same regime context.

Risk:

- Low if context-only.
- Do not use it to suppress/promote alerts yet.

### 3. Reclassify stale/poor empirical watch labels in wording

Current empirical report says these buckets are `REVIEW_OR_UNTRACK`:

```text
FADE_SHORT_LATE_AFTER_LOW
SOL_LONG_WATCH_ONLY
FRESH_SHORTS_LONG
SOL_SHORT_BELOW_GATE_WATCH
FADE_SHORT_POSITIVE_FUNDING
```

Telegram should not phrase these as attractive candidates. Prefer wording:

```text
Empirical status: REVIEW_OR_UNTRACK — weak/recently degraded; treat as caution or avoid, not signal.
```

For LOW_N buckets, use:

```text
Empirical status: LOW_N_TRACKING — insufficient n; observation only.
```

Why this helps:

- Prevents alerts from sounding tradable when their current bucket stats have degraded.
- Makes the label honest and immediately actionable.

### 4. Add outcome horizon guidance by bucket

For BTC SHORT continuation specifically, add horizon context:

```text
BTC SHORT + FRESH_SHORTS history: not a scalp edge; strongest evidence starts ~2h, best at 24h.
```

Example known recent locked result:

```text
30m 56.3% | 1h 56.3% | 2h 75.0% | 24h 100.0% on recent n=16 cohort
```

Why this helps:

- Alerts become more useful for hold-time decisions.
- Prevents exiting/invalidating too early based on a signal whose edge is slower.

Risk:

- Medium if over-displayed on unrelated SHORT buckets.
- Only show when the bucket matches BTC SHORT + FRESH_SHORTS / applicable classifier context.

### 5. Keep MEDIUM setup alerts off Telegram for now

Do **not** broadly push:

```text
LONG_SETUP
SHORT_SETUP
SETUP_CHANGE
SHORT_CAUTION
RETEST_HELD
```

Reason:

- Volume is high.
- Many are watch-only / weak / stale.
- Telegram would become noisy.

Possible exception later:

- A daily or hourly digest of MEDIUM setups, not realtime Telegram spam.
- Or only send MEDIUM if empirical status is validated and current regime agrees.

### 6. Add concise reason hierarchy to Telegram

Current alerts include many details. Add a one-line decision hierarchy:

```text
Decision: REGIME ✅/⚠️ | MECHANISM ✅/⚠️ | HISTORY ✅/⚠️ | SCORE ✅/⚠️
```

Example:

```text
Decision: REGIME ✅ BEARISH_TREND | MECHANISM ✅ FRESH_SHORTS | HISTORY ⚠ WATCH | SCORE ⚠ v0 SHORT cap
```

Why this helps:

- Makes the alert readable under pressure.
- Aligns with the agreed rule: regime → mechanism → empirical history → score.

## Best implementation order

### Phase A — safe presentation-only patch

1. Read latest `data/empirical-watch-report.json` inside `phase1d-alerts.js`.
2. Add dynamic empirical line to `formatTelegramAlert()` when `alert.empirical_watch.key` exists.
3. Read latest `data/regime-current.json` and add a regime shadow line to HIGH alerts.
4. Add `changes_alert_behavior:false` / `presentation_only` note in diagnostic fields.

No delivery changes.

### Phase B — static text cleanup

Update or downgrade stale `PATTERN_STATS` strings in `scripts/pattern-classifier.js`, especially:

```text
FADE_SHORT_LATE_AFTER_LOW
FADE_SHORT_POSITIVE_FUNDING
SOL_SHORT_BELOW_GATE
FRESH_SHORTS_LONG
SOL_LONG_WATCH_ONLY
```

Goal: static text should not contradict the dynamic empirical report.

### Phase C — optional digest, not realtime

Create a daily Telegram digest for MEDIUM setup alerts:

```text
Top watch-only setups
Bucket status
Recent outcomes
Regime context
```

This avoids increasing realtime Telegram noise.

## Do not do yet

Do not yet:

- suppress or promote alerts based on `regime_engine_bearish_shadow_v1`,
- change Telegram delivery severity rules,
- send all MEDIUM setup alerts live,
- create active contexts from WATCH labels,
- revive hard squeeze gating.

## Bottom line

The best immediate improvement is not more alerts. It is better Telegram context on the alerts already being sent:

```text
fresh empirical win-rate line
+ BTC regime shadow line
+ clear WATCH / REVIEW_OR_UNTRACK / LOW_N status
+ horizon guidance where validated
```

This makes alerts more decision-useful while preserving `changes_alert_behavior:false`.

## Implementation status — Phase A shipped

Implemented in `scripts/phase1d-alerts.js` after this review:

- dynamic empirical watch line from `data/empirical-watch-report.json`,
- stale-report flag when empirical report age is >7 days,
- BTC regime shadow line from `data/regime-current.json`,
- BTC SHORT + FRESH_SHORTS horizon guidance only for that specific validated bucket,
- presentation-only wording: no delivery/gating/active-context impact.

Validation:

```text
node --check scripts/phase1d-alerts.js
PHASE1D_DISABLE_TELEGRAM=1 node scripts/phase1d-alerts.js
```

Both passed. Disabled run emitted no Telegram messages.

## Formatting refinement — 2026-06-07 18:12 UTC

After review, tightened presentation wording:

- Per-horizon samples now render as `1h n=<n> ...` rather than `1h <n> ...`, so total bucket n and horizon n are clearly distinct.
- BTC SHORT+FRESH_SHORTS horizon line now includes concrete recent cohort stats: 30m/1h 56.3%, 2h 75.0%, 24h 100.0% on n=14 valid 24h rows, avg +3.038%.

Validation repeated:

```text
node --check scripts/phase1d-alerts.js
PHASE1D_DISABLE_TELEGRAM=1 node scripts/phase1d-alerts.js
```
