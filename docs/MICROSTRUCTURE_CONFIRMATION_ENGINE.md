# Microstructure Confirmation Engine Spec

Status: draft build spec
Created: 2026-05-07
Context: ETH review exposed premature BUY promotion caused by treating a forming setup as confirmed.

## Core Principle

Market Intel must distinguish:

1. setup exists
2. trigger pending
3. trigger tested and failed
4. trigger confirmed
5. trade active
6. expired / invalidated / reset required

A numeric score alone must never promote a setup into BUY if a hard gate is blocking.

---

## Immediate Production-Safe Rules

These are trade-semantics rules, not optimized statistical guards.

### Rule 1 — Trigger Pending Gate

If trigger has not fired:

```text
max_signal = WATCH
```

Output wording should be conditional, e.g. `WATCH — conditional long above <trigger>`.

### Rule 2 — Failed Trigger Cooldown

If trigger was tested and failed:

```text
state = TRIGGER_TESTED_FAILED
max_signal = WATCH
cooldown_required = true
```

A failed trigger is not equivalent to trigger pending. It is evidence that supply/demand at the trigger rejected the move.

Initial cooldown:

- intraday: at least 2 x 15m candles or 1 x 1h candle
- swing: at least 1 x 4h candle

---

## State Machine

```text
SETUP_FORMING
TRIGGER_PENDING
TRIGGER_TESTED_FAILED
TRIGGER_CONFIRMED
TRADE_ACTIVE
EXPIRED
INVALIDATED
RESET_REQUIRED
```

### EXPIRED Meaning

`EXPIRED` means the original impulse is stale and must be re-evaluated. It does not mean bearish by itself.

### RESET_REQUIRED -> SETUP_FORMING

Return to `SETUP_FORMING` only after all are true:

1. Minimum elapsed time since failed trigger:
   - intraday: 2 x 15m candles or 1 x 1h candle
   - swing: 1 x 4h candle
2. Price moved away from trigger by at least 0.3 x ATR(1h) OR retested the relevant support/resistance base.
3. CVD reset sequence completed:
   - Step A: CVD from failed-trigger timestamp goes flat/negative, not merely less positive.
   - Step B: after Step A, fresh positive CVD impulse appears.
4. Fresh positive CVD impulse minimum:
   - initial ETH threshold: +500 ETH delta on 15m, asset-specific thresholds to be learned later.
5. OI changed by at least 0.25%-0.50% from failed-trigger snapshot.
6. No hard invalidation breached.

This must be a sequence, not a weak OR condition.

---

## Data Freshness Thresholds

Each data point must include `timestamp_utc`, `age_seconds`, and `freshness_status`.

Initial thresholds:

```json
{
  "order_book_depth": 180,
  "spot_cvd": 300,
  "futures_cvd": 300,
  "taker_flow": 300,
  "open_interest": 600,
  "funding": 1800,
  "long_short_ratio": 900,
  "options": 3600,
  "macro": 21600
}
```

Consequences:

- stale order book / CVD / taker flow: cannot promote to BUY
- stale OI / funding / long-short: remove positioning boost
- stale options / macro: context only, no hard block unless configured separately

---

## Gated vs Contributing Components

### Hard Gates

- trigger state
- flow confirmation
- data freshness
- BTC scenario gate
- risk/reward minimum

If a hard gate blocks, final state is capped regardless of numeric score.

### Soft Contributors

- structure
- positioning
- liquidity/order book
- macro
- relative strength
- time validity

Options are not a scoring contributor until an explicit action framework is implemented. Until then, options are context-only.

---

## Component Score Output

Shadow engine should emit component scores separately:

```json
{
  "state": "TRIGGER_PENDING",
  "max_signal_allowed": "WATCH",
  "gates": {
    "trigger": { "pass": false, "reason": "2331 not reclaimed" },
    "flow": { "pass": false, "reason": "spot CVD negative" },
    "freshness": { "pass": true },
    "btc_scenario": { "pass": true },
    "risk_reward": { "pass": true }
  },
  "components": {
    "structure": 0.62,
    "trigger": 0.35,
    "flow": 0.48,
    "positioning": 0.55,
    "liquidity": 0.40,
    "macro_relative": 0.52,
    "time_validity": 0.75
  },
  "raw_score": 0.60,
  "final_signal": "WATCH"
}
```

---

## Execution Venue Context

Backpack is the execution venue.

Execution-critical values must use Backpack as primary source:

- trigger levels
- entry prices
- stop prices
- target prices
- execution order book depth near trigger/support/target

Binance/Bybit/OKX data is derivatives context unless explicitly marked otherwise:

- Binance order book depth: broad market structure context, not execution decision input
- Binance spot/futures CVD and taker flow: directional confirmation context
- Binance/Bybit/OKX funding and OI: cross-exchange positioning context

Where this spec references `order book depth near trigger`, the primary source is Backpack. Binance order book may be stored as secondary context and must not override Backpack execution-book evidence.

---

## Existing Guard Compatibility

Market Intel already has an OI/taker/funding guard in `market-intel/orchestrator.js` from 2026-05-06:

- `SQUEEZE_CONFIRMED`
- `SQUEEZE_POTENTIAL`
- `FLUSH_DELEVERAGING`
- `POST_FLUSH_RECOVERY`

Phase 1 should extend this guard rather than duplicate it. The new confirmation engine adds missing dimensions:

- spot vs futures CVD split
- cross-exchange funding/OI weighting
- explicit trigger state machine
- failed-trigger cooldown/reset
- execution-venue order book freshness
- counterfactual outcome tracking

---

## Microstructure Collector

Add `market-intel/scripts/fetch-market-microstructure.js`.

Output:

- `market-intel/data/microstructure-context.json`
- optional history: `market-intel/data/microstructure-history.jsonl`

Initial fields:

- Backpack execution order book depth near trigger/support/target
- optional Binance order book depth as broad context only
- Binance spot CVD
- Binance futures CVD
- cross-exchange funding/OI:
  - Binance
  - Bybit
  - OKX
- long/short account ratios
- ETHBTC / SOLBTC relative strength
- BTC dominance / ETH dominance
- Deribit BTC/ETH options context
- data freshness metadata for each field

---

## Cross-Exchange Positioning

Do not classify funding/OI by simple exchange vote.

Use OI-weighted aggregation where possible:

```text
composite_funding =
  binance_oi_weight * binance_funding +
  bybit_oi_weight * bybit_funding +
  okx_oi_weight * okx_funding
```

Initial weighting policy:

1. Prefer dynamic USD OI weights from fresh exchange OI data.
2. If one venue OI is missing/stale, re-normalize weights across fresh venues only and mark quality `PARTIAL`.
3. If all dynamic OI weights are unavailable, use temporary fallback weights:
   - Binance: 0.50
   - Bybit: 0.30
   - OKX: 0.20
4. If fewer than two venues are fresh, do not classify as broad pressure; cap classification at venue-local or unknown.

Classifications:

```text
BROAD_SHORT_PRESSURE
BROAD_LONG_PRESSURE
BINANCE_LOCAL_SHORT_PRESSURE
MIXED_POSITIONING
NEUTRAL
```

Binance-only negative funding should not be treated as broad squeeze confirmation.

---

## Flow Quality Classification

Use spot vs futures CVD split.

```text
STRUCTURAL_BUYING: spot CVD positive + futures CVD positive
LEVERAGED_CHASE: futures CVD positive + spot CVD negative/weak
DISTRIBUTION: spot CVD negative while futures lifts into resistance
SELL_PRESSURE: spot CVD negative + futures CVD negative
```

Decision response:

- `STRUCTURAL_BUYING`: eligible for BUY if trigger/BTC/freshness gates pass
- `LEVERAGED_CHASE`: cap at WATCH until spot CVD confirms
- `DISTRIBUTION`: apply penalty and require reset/reclaim
- `SELL_PRESSURE`: block BUY

---

## BTC Scenario Gate

ETH/SOL longs must be evaluated against BTC.

BTC breakdown if any:

1. BTC signal state == SELL
2. BTC price below 1H support and BTC 4H taker buy share < 45%
3. BTC OI expanding while BTC price declines on 30m, indicating new shorts pressing

If BTC breakdown is active:

```text
ETH long max_signal = WATCH
```

Exception: ETH can override weak BTC only if all are true:

- ETHBTC 4h relative strength > +0.75%
- ETHBTC 24h relative strength > +1.5%
- ETH spot CVD positive
- BTC is not in active breakdown mode

---

## Options Context

Options data is context-only in Phase 1.

Do not include options in final score until explicit rules are defined, e.g.:

- low IV percentile + confirmed directional setup may suggest options instead of perp leverage
- high IV + weak confirmation may discourage buying premium
- put/call volume spike + negative spot CVD may warn of downside hedge pressure
- call OI concentration near target may be noted as magnet/resistance context

If these rules are not implemented, options should be displayed but not scored.

---

## Counterfactual Outcome Tracking

Every blocked setup must be logged as a counterfactual.

Measurement anchor:

- Use trigger price, not signal price.
- This tests whether requiring confirmation helped or hurt.

Track:

- would trigger have filled?
- did price reach T1/T2/T3 before stop?
- max adverse excursion
- max favorable excursion
- time to target
- which gate blocked it

This measures recall, not just precision.

---

## Outcome / False Positive Tracking

Every active or blocked signal should write an evaluation record.

Track:

- hit T1 before stop
- hit stop before T1
- expired before trigger
- missed move because gate blocked
- average R
- expectancy
- false positive rate
- false negative / missed opportunity rate

---

## Position Sizing

Base config:

```json
{
  "base_risk_pct": 1.0,
  "tiers": {
    "no_trade": 0,
    "starter": 0.25,
    "reduced": 0.5,
    "normal": 1.0,
    "high_conviction": 1.25
  }
}
```

High conviction requires all:

- all hard gates pass
- trigger confirmed and retested or accepted
- broad cross-exchange confirmation
- spot CVD positive
- futures CVD positive
- BTC actively supportive
- risk/reward acceptable to at least T2
- no active failed-trigger cooldown

---

## Phase Plan

### Phase 1 — Instrumentation + Safe Semantic Gates

Build now:

- microstructure collector
- freshness metadata
- trigger state logger
- outcome/counterfactual logger
- two semantic gates:
  - trigger not fired -> WATCH
  - failed trigger -> WATCH + cooldown/reset required
- minimal state-transition alerts

### Phase 1 Alerting

Alert only on:

- transition to `TRIGGER_CONFIRMED`
- transition to `TRIGGER_TESTED_FAILED`
- transition to `EXPIRED`
- transition to `INVALIDATED`

Everything else silent to avoid noise.

### Phase 2 — Shadow Confirmation Engine

Before Phase 2 starts, freeze:

- data freshness thresholds
- reset criteria
- BTC gate criteria
- sizing tiers
- counterfactual measurement anchor
- rollback criteria

#### Phase 2 freeze snapshot — 2026-05-25

The following items are frozen as the canonical Phase 2 reference before any Phase 4 guard activation. This section cross-references existing spec rules and the current implementation; it does not introduce new behavior.

**Freshness thresholds**

- Canonical thresholds are the JSON values in [Data Freshness Thresholds](#data-freshness-thresholds): order-book depth 180s, spot/futures CVD and taker flow 300s, OI 600s, funding 1800s, long/short ratio 900s, options 3600s, macro 21600s.
- `docs/READINESS_ENGINE_SPEC.md` inherits these thresholds unless a later readiness version explicitly changes them.
- Current macro/extras handling in `scripts/phase1d-alerts.js` is intentionally non-blocking for microstructure: stale macro removes/limits macro contribution and is recorded, but does not hard-block otherwise fresh microstructure.

**Reset criteria**

- Failed-trigger reset criteria are the sequence in [RESET_REQUIRED -> SETUP_FORMING](#reset_required---setup_forming): elapsed time, move away/retest, CVD reset sequence, fresh CVD impulse, OI change, and no hard invalidation.
- Failed-breakout penalty deactivation is additionally implemented in `scripts/fetch-market-microstructure.js`: price must clear the failed level by more than 1 ATR for 2 consecutive samples; the row records `clean_clearance_rule` and `clean_clearance_streak`.
- Active-context erosion/expiry is implemented in `scripts/phase1d-alerts.js`: non-confirming samples increment `erosion_count`; same-direction confirming flow resets erosion; expiration occurs after 8 consecutive non-confirming samples.

**BTC gate criteria**

- Current canonical gate label is `BTC_WEAK_VETO_ALT_LONGS`; legacy `BTC_WEAK_PENALIZE_ALT_LONGS` is normalized on read.
- For alt LONG readiness, persistent `BTC_WEAK_VETO_ALT_LONGS` is a hard regime gate; numeric score must not override it.
- For active-context invalidation, `scripts/phase1d-alerts.js` requires the BTC weak veto to persist for 3 consecutive samples before invalidating an existing alt LONG context. Single-sample BTC weak flips remain scoring/context information only.
- The former positive label `BTC_CONFIRMS_ALT_LONG_CONTEXT` is legacy wording; read paths normalize it to `BTC_PERMITS_ALT_LONG_OBSERVATION` because it permits observation rather than confirming an alt LONG.

**Rollback criteria**

- Phase 4 activation remains one guard at a time.
- Canonical rollback criteria are the [Phase 4 — Guard Activation](#phase-4--guard-activation) rules: recall drop >15% versus Phase 2 baseline over minimum 20 post-activation outcomes, expectancy turns negative after minimum 20 post-activation outcomes, or a severe immediate failure mode such as repeated missed valid breakouts from the same guard.
- Each activated guard must define expected benefit, affected alert types, validation window, and rollback criterion before activation.

Run shadow scores in parallel without controlling production alerts.

### Phase 3 — Evaluation

Evaluate precision and recall.

Minimum evidence before activating non-semantic guards:

- 50 blocked/allowed outcomes per guard minimum
- ideally 100+ outcomes
- expect 3-4 months for stronger confidence

Metrics:

- expectancy primary
- precision improvement
- recall loss
- missed move rate
- stop-before-T1 rate

### Phase 4 — Guard Activation

Activate one guard at a time.

Activation threshold:

- improves precision by >= 10%-15%
- does not reduce recall by more than 10%-20%
- improves expectancy
- holds across at least 2 assets or is explicitly asset-specific

Rollback if:

- recall drops >15% versus Phase 2 baseline over minimum 20 post-activation outcomes, or
- expectancy turns negative after minimum 20 post-activation outcomes, or
- severe immediate failure mode appears, such as repeated missed valid breakouts from the same guard

---

## ETH 2026-05-07 Lesson

The original ETH BUY 65% was premature.

The system over-weighted:

- Binance-local negative funding
- short-term futures CVD
- OI expansion

It under-weighted:

- trigger not reclaimed
- failed 2331 test
- 4H taker flow below 50%
- spot CVD negative
- Bybit/OKX not confirming negative funding
- heavy overhead ask liquidity
- BTC/ETH context

Correct classification should have been:

```text
ETH WATCH — conditional long above 2331.
Futures buyers active, but spot flow negative, broad squeeze unconfirmed, and overhead supply heavy.
Setup expires/reset required if trigger is not reclaimed within the defined time window.
```
