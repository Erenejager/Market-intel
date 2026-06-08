# Regime Engine Decision — 2026-06-07

## Decision

Price-only `BULLISH_SQUEEZE` detection is considered failed for v1.

This conclusion is based on three successive diagnostic attempts:

- `scripts/evaluate-regime-engine-v1-candidates.js`
- `scripts/evaluate-regime-engine-v1p1-candidates.js`
- `scripts/evaluate-regime-engine-v1p2-candidates.js`
- `scripts/evaluate-regime-engine-v1p3-candidates.js`

All versions failed the frozen preregistered criteria because squeeze detection remained falsely active inside manual bearish windows.

## Interpretation

This is no longer treated as a parameter-tuning issue.

The likely issue is signal identity:

> BTC price alone cannot reliably distinguish a true bullish squeeze from a bearish bounce / dead-cat recovery.

Both can look similar in price-only features.

The expected differentiators are microstructure/positioning fields already collected elsewhere:

- OI contraction / SHORTS_COVERING behavior,
- funding/crowding shifts,
- liquidation/cascade context if available,
- flow consensus,
- range expansion relative to positioning.

## What remains usable

The `BEARISH_TREND` detector is usable for shadow logging.

Across v1.1–v1.3, bearish detection repeatedly passed or near-passed with stable behavior. Best v1.3-style candidate:

```text
bearish rule: ret7d < -1%
entry persistence: 4 samples
exit persistence: 6 samples
best observed stability: ~1.09 flips/day, 0 sub-45m flickers
```

This is sufficient to begin forward shadow logging of bearish regime context.

## What is not wired

No production alert behavior changes are authorized from this decision.

Explicitly not changed:

- no alert suppression,
- no alert promotion,
- no Telegram wording,
- no active-context creation,
- no readiness score changes,
- no routing changes.

## Shadow logging plan

Start a narrow shadow regime writer with only:

```text
state: BEARISH_TREND | NEUTRAL
squeeze_risk: UNKNOWN_SQUEEZE_RISK
flush_risk: UNKNOWN_FLUSH_RISK
changes_alert_behavior: false
```

Purpose:

- collect forward regime context for later outcome analysis,
- avoid blocking forward data collection on unresolved squeeze detection,
- keep all records clearly versioned.

Initial version name:

```text
regime_engine_bearish_shadow_v1
```

## False-squeeze diagnostic result

Completed after this decision record was opened.

Artifacts:

- `scripts/diagnose-false-squeeze-microstructure.js`
- `data/false-squeeze-microstructure-diagnostic.json`
- `data/false-squeeze-microstructure-diagnostic.md`

Question answered:

```text
Can microstructure distinguish real BULLISH_SQUEEZE from bearish bounce?
```

Result:

```text
No — not cleanly in this historical sample.
```

Key comparison from the representative v1.3 price squeeze config:

```text
real/manual BULLISH_SQUEEZE rows:
  OI4h contraction share: 47.2%
  SHORTS_COVERING share: 1.4%

false active bearish-window rows:
  OI4h expansion share: 31.3%
  FRESH_SHORTS share: 11.6%
```

Interpretation:

- existing OI/funding/flow fields do not cleanly separate real squeeze from bearish bounce in the current labeled sample,
- do not create a hard microstructure squeeze proxy from this sample,
- keep `squeeze_risk: UNKNOWN_SQUEEZE_RISK`,
- continue bearish-only shadow logging.

## Production constraint

Production wiring still requires:

- forward shadow observation,
- reviewed outcomes under the versioned shadow state,
- separate decision report approving any alert behavior change.
