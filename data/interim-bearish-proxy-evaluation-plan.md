# Interim Bearish Proxy Evaluation Plan

Generated: 2026-06-06

Purpose: decide whether `interim_bearish_proxy` is accurate/stable enough to use as a BTC SHORT `WATCH_REGIME_SPECIFIC_24H_CONTINUATION` gate before the full regime engine exists.

This is an evaluation plan, not activation approval.

## Preconditions before activation

Activation is allowed only if all checks below pass. If any check fails, keep proxy in observation/logging mode.

## Check 0 — Stat provenance first

Before evaluating activation, reconcile the quoted BTC SHORT downtrend stat:

- Source claim: regime-split report row `Downtrend BTC SHORT`, reportedly around `69.2% 4h / 100% 24h`.
- Required clarification: this is broad BTC SHORT in a downtrend window, **not** automatically a specific OI bucket.
- Required decomposition: identify row composition behind the stat:
  - OI bucket distribution from direct `readiness-shadow.jsonl` ±16m joins.
  - production state / alert type composition.
  - shadow state distribution.
  - full-window vs downtrend-window comparison.
  - whether any single OI bucket is driving the edge.

Do not treat the broad BTC SHORT downtrend stat as canonical bucket evidence until this provenance check is complete.

## Check 1 — Timeline accuracy

Evaluate proxy state across known windows, not only alert rows:

- May 9–21 mixed/chop window.
- May 10 squeeze.
- May 13 crash.
- May 17–18 grind.
- May 25–current bearish/downtrend or bearish/sideways collection window.

Expected behavior:

- `proxy=true` should cluster mainly in bearish/sideways or bearish/downtrend windows.
- `proxy=false` should avoid mixed/chop/squeeze periods.
- Proxy must avoid obvious bullish-squeeze windows.

## Check 2 — BTC SHORT alert-row behavior

For BTC SHORT candidate rows, report outcomes split by:

- proxy true/false,
- OI bucket,
- shadow state,
- production alert type,
- 4h and 24h directional returns,
- MFE/MAE if available.

This is a sanity check only; it is not independent validation if rows overlap the design sample.

## Check 3 — Proxy stability / persistence

Proxy must be usable as a gate, not flicker.

Report:

- total true samples,
- total false samples,
- number of transitions,
- median/mean/max true-run length,
- median/mean/max false-run length,
- true-run count by duration bucket: `<45m`, `45m–2h`, `2h–6h`, `>6h`.

Predeclared persistence requirement before any wiring:

```text
proxy_active_for_alerts = interim_bearish_proxy true for >=3 consecutive 15m samples
```

If the proxy frequently flips or most true-runs are shorter than 45 minutes, do not wire it as an alert gate.

## Check 4 — Activation scope if checks pass

If checks pass, activation is limited to:

```text
BTC SHORT WATCH_REGIME_SPECIFIC_24H_CONTINUATION
```

Allowed wording:

```text
regime proxy active
```

Disallowed wording:

```text
validated regime engine
tradable signal
validated win rate
```

## Check 5 — Continuous logging after activation

If wired, log on every BTC SHORT candidate:

- raw `interim_bearish_proxy`,
- persisted `proxy_active_for_alerts`,
- condition-level pass/fail details,
- true-run length at alert time,
- OI bucket and shadow state,
- later 4h/24h outcomes.

Promotion beyond WATCH requires future independent validation, not this activation.
