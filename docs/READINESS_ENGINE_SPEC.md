# Readiness Engine Spec

Status: Phase 2 shadow design
Created: 2026-05-09
Canonical parent: `docs/MICROSTRUCTURE_CONFIRMATION_ENGINE.md`

## Purpose

Detect when market conditions are becoming tradeable without prematurely firing actionable trade alerts.

The readiness engine answers:

> Is the market ready for a long or short?

It does **not** decide final production alert delivery during Phase 2. It runs shadow-only and writes outcomes for Phase 3 evaluation.

## Non-goals

- Do not replace Phase 1d alerts yet.
- Do not activate new Telegram gating yet.
- Do not tune weights after looking at outcome data.
- Do not let numeric score override hard semantic gates.
- Do not rely on LLM scoring for flow/OI/CVD/funding facts.

## Architecture

Two separate shadow outputs are required:

1. **Readiness engine** — conditions/tradeability
2. **Execution-plan engine** — mechanical trigger/stop/targets

They should be stored together for evaluation but remain logically separate.

```json
{
  "timestamp_utc": "2026-05-09T13:45:00Z",
  "asset": "SOL",
  "direction": "LONG",
  "phase": "PHASE_2_SHADOW",
  "readiness": {
    "score": 0.78,
    "state": "SHADOW_CONFIRMED",
    "hard_gates": {},
    "components": {},
    "reasons": []
  },
  "execution_plan": {
    "trigger": 94.14,
    "entry_rule": "1H close/retest above 94.14",
    "stop": 92.71,
    "tp1": 96.40,
    "tp2": 98.80,
    "invalidation": "1H close below 93.20",
    "risk_reward": 2.1,
    "source": "deterministic_levels_atr_v0"
  },
  "source_metrics": {}
}
```

## Data sources

No new data fetching should be required for v0.

Primary files:

- `data/microstructure-context.json`
- `data/microstructure-history.jsonl`
- `data/backpack-snapshot-lite.json`
- `data/extras/crypto-fear-greed.json`
- `data/extras/usd-index.json`
- `data/extras/yields.json`
- `data/extras/vix.json`

Useful fields already available:

- `flow_consensus`
- `oi_price_regime`
- `cvd_divergence`
- `btc_flow_gate`
- `cross_exchange_positioning`
- Binance/Bybit/OKX funding
- raw spot/futures taker buy shares
- Backpack order book depth imbalance
- ETHBTC/SOLBTC relative strength
- failed-breakout counter/retest state
- macro extras: VIX, USD, yields
- Fear & Greed

Derived from history:

- funding streak
- 4h taker-flow window
- 4h OI/price regime stability

## Phase 2 principle

All scoring is shadow-only.

Design principle: scores are only comparable inside a valid regime. Evaluate readiness in order: **regime → mechanism → empirical pattern history → score**. `BTC_WEAK_VETO_ALT_LONGS` means local setup present / regime invalid for alt longs; numeric score must never override that veto.

**Inverse-signal principle:** a setup bucket with a high historical error rate is not neutral/noise; it is potentially valuable opposite-direction information. When prior same-configuration outcomes repeatedly move against the alert direction, mark the bucket as adverse/inverse and treat the opposite side as the default interpretation unless newer validation disproves it. A high numeric readiness score must not silently override this empirical contradiction.

Phase 2 may emit files/reports but must not alter:

- Telegram delivery
- Phase 1d alert severity
- active contexts
- orchestrator signal strength
- cooldown behavior

## Hard gates v0

Hard gates decide `max_state`. Numeric score cannot override them.

### Long hard gates

A long cannot be `SHADOW_CONFIRMED` unless:

1. Flow is bullish and confirmed:
   - `STRUCTURAL_BUYING`, or
   - `SPOT_LED_ACCUMULATION`
2. CVD does not show bearish divergence:
   - block on `SPOT_NEGATIVE_FUTURES_POSITIVE`
3. BTC gate does not block alt long:
   - block on persistent `BTC_WEAK_VETO_ALT_LONGS`
4. Failed-breakout state is not actively hostile:
   - block or cap if near failed resistance with active penalty
5. Data freshness is acceptable.

Freshness thresholds are inherited from `docs/MICROSTRUCTURE_CONFIRMATION_ENGINE.md` unless explicitly versioned here. Current reference thresholds: order-book depth 180s, spot/futures CVD and taker flow 300s, OI 600s, funding 1800s, macro 21600s.

### Short hard gates

A short cannot be `SHADOW_CONFIRMED` unless:

1. Flow is bearish and confirmed:
   - `SELL_PRESSURE`, or
   - `DISTRIBUTION`
2. CVD does not show bullish divergence:
   - block on `SPOT_POSITIVE_FUTURES_NEGATIVE`
3. Failed-breakout/reclaim state does not show clean bullish reclaim.
4. Data freshness is acceptable.

### Caution states

If flow is not confirmed but has streak 2, classify as:

- `SHADOW_SETUP_FORMING`

If flow is mixed/choppy:

- `SHADOW_NO_SETUP` with reason `mixed_or_choppy_flow`

If a hard gate blocks despite high score:

- `SHADOW_BLOCKED`

## Frozen v0 readiness scoring formula

This formula is frozen before Phase 3 outcome validation.

Do not tune these weights using the same outcome sample used for validation. Any later formula must be versioned, e.g. `readiness_shadow_v1`, and evaluated separately.

## `readiness_shadow_v1` boundary — instrumentation only

Status: field-addition only. No scoring authority.

The May 9–21 Phase 3A diagnostic showed that the failed high-score SOL LONG cluster was not captured by acute BTC 4h/24h weakness metrics. Those alerts fired during BTC stabilization/bounce windows inside a broader multi-day BTC downtrend. This is a time-horizon mismatch, not enough evidence for a v0 score-weight change.

Therefore `readiness_shadow_v1` is frozen as instrumentation-only:

- Add longer-horizon BTC regime fields to microstructure/readiness shadow rows.
- Keep v0 score weights, thresholds, hard gates, Telegram behavior, active-context logic, and cooldowns unchanged.
- Do not use May 9–21 outcomes to validate v1 scoring; there is no v1 scoring change.
- Future `readiness_shadow_v2` scoring changes may only be proposed after these fields have forward coverage and must be validated on post-freeze v0/v2 divergence events.

New instrumentation fields should be stored under `source_metrics.long_horizon_regime` when available:

```json
{
  "role": "readiness_shadow_v1_instrumentation_only_no_scoring",
  "version": "v1-fields-only",
  "source": "backpack_4h_klines",
  "price": 77521.2,
  "return_3d_pct": -2.34,
  "return_7d_pct": -5.67,
  "reference_5d_sma": 78000.0,
  "distance_from_5d_sma_pct": -0.61,
  "reference_7d_sma": 79000.0,
  "distance_from_7d_sma_pct": -1.87,
  "trend_4h": "DOWN",
  "readiness_instrumentation_version": "v1-fields-only",
  "note": "Instrumentation only. These fields do not change v0 readiness score, alerts, Telegram, or active contexts."
}
```

Forward validation requirement for any future scoring version remains locked: evaluate only post-freeze divergence events where v0 and the candidate version make different decisions, with at least 20 resolved divergence events total and at least 5 per major divergence type before making type-specific claims.

All Phase 2 outputs must include:

```json
{
  "readiness_shadow": {
    "role": "phase2_shadow_no_alert_impact",
    "version": "v0",
    "direction": "LONG|SHORT",
    "score": 0,
    "state": "SHADOW_NO_SETUP|SHADOW_SETUP_FORMING|SHADOW_CONFIRMED|SHADOW_BLOCKED",
    "setup_detected": true,
    "regime_valid": false,
    "blocked_by": "BTC_WEAK_VETO_ALT_LONGS|null",
    "gate_version": "v0.2-regime-first",
    "decision_order": "regime -> mechanism -> score",
    "hard_gates": {},
    "components": {},
    "reasons": [],
    "note": "Shadow-only. Does not affect alert type, severity, delivery, active contexts, or cooldown."
  }
}
```

### Score thresholds

- `>= 70`: `SHADOW_CONFIRMED`
- `40–69`: `SHADOW_SETUP_FORMING`
- `< 40`: `SHADOW_NO_SETUP`
- any hard gate blocked: `SHADOW_BLOCKED`, score reported for audit only but `effective_score = 0`

### Direction candidates

Compute both LONG and SHORT readiness for each asset on every 15m sample.

The event diagnostic may show only the event direction, but the periodic snapshot should store both.

### Long readiness v0 — 100 point scale

Start at 0. Add:

1. **Flow confirmation — max 30**
   - confirmed `STRUCTURAL_BUYING`: +30
   - confirmed `SPOT_LED_ACCUMULATION`: +28
   - bullish flow streak = 2: +15
   - bullish flow streak = 1: +6
   - otherwise: +0

2. **OI/price regime — max 20**
   - `FRESH_SHORTS`: +20
   - `FRESH_LONGS`: +12
   - `SHORTS_COVERING`: +8
   - `LONGS_EXITING`: -12
   - `NEUTRAL`/unknown: +0

3. **CVD alignment — max 15**
   - `SPOT_POSITIVE_FUTURES_NEGATIVE`: +15
   - `NONE`: +10
   - `SPOT_NEGATIVE_FUTURES_POSITIVE`: hard gate if near trigger/resistance, otherwise -10

4. **Cross-exchange funding/crowding — max 10**
   - broad short pressure / majority negative funding: +10
   - mixed: +3
   - broad positive funding / crowded longs: -8
   - insufficient data: +0

5. **BTC/relative-strength context — max 10**
   - `BTC_CONFIRMS_ALT_LONG_CONTEXT`: +10
   - ETHBTC/SOLBTC positive 24h while asset flow bullish: +5
   - neutral/no BTC gate: +3
   - `BTC_STRONG_ALT_NOT_FOLLOWING`: -6
   - persistent `BTC_WEAK_VETO_ALT_LONGS`: hard gate for alt longs

6. **Liquidity/order-book support — max 5**
   - bid imbalance positive at 10/25bps near support/trigger: +5
   - neutral: +0
   - ask imbalance hostile: -5

7. **Macro/risk context — max 5**
   - risk-on or benign VIX/USD/yields: +5
   - neutral/mixed: +2
   - risk-off/high USD/yields: -5
   - VIX >= 30: hard gate for new crypto longs

8. **Failed-breakout/time context — max 5**
   - no failed level or clean reset: +5
   - near unproven resistance: +1
   - active failed-breakout penalty: hard gate or cap to `SHADOW_SETUP_FORMING`

### Short readiness v0 — 100 point scale

Start at 0. Add:

1. **Flow confirmation — max 30**
   - confirmed `SELL_PRESSURE`: +30
   - confirmed `DISTRIBUTION`: +28
   - bearish flow streak = 2: +15
   - bearish flow streak = 1: +6
   - otherwise: +0

2. **OI/price regime — max 20**
   - `FRESH_LONGS`: +20
   - `LONGS_EXITING`: +12
   - `FRESH_SHORTS`: +6, because it can mean late chase
   - `SHORTS_COVERING`: -12
   - `NEUTRAL`/unknown: +0

3. **CVD alignment — max 15**
   - `SPOT_NEGATIVE_FUTURES_POSITIVE`: +15
   - `NONE`: +10
   - `SPOT_POSITIVE_FUTURES_NEGATIVE`: hard gate if near trigger/support, otherwise -10

4. **Cross-exchange funding/crowding — max 10**
   - broad positive funding / crowded longs: +10
   - mixed: +3
   - broad short pressure / majority negative funding: -8
   - insufficient data: +0

5. **BTC/relative-strength context — max 10**
   - BTC weak + alt weak / alt underperforming: +10
   - neutral/no BTC gate: +3
   - BTC strong + alt holding up: -6

6. **Liquidity/order-book pressure — max 5**
   - ask imbalance positive at 10/25bps near resistance/trigger: +5
   - neutral: +0
   - bid imbalance hostile to short: -5

7. **Macro/risk context — max 5**
   - risk-off supports crypto shorts: +5
   - neutral/mixed: +2
   - risk-on: -5

8. **Failed-breakout/reclaim context — max 5**
   - rejection below failed/reclaimed level: +5
   - no relevant level: +2
   - clean bullish reclaim/retest held: hard gate for shorts

### Hard gates v0

Hard gates do not delete the raw score; they set `state = SHADOW_BLOCKED` and `effective_score = 0`.

Long hard gates:

- flow explicitly bearish and confirmed
- `SPOT_NEGATIVE_FUTURES_POSITIVE` near long trigger/resistance
- persistent `BTC_WEAK_VETO_ALT_LONGS` for alt longs
- active failed-breakout penalty near resistance
- macro VIX >= 30 for new crypto longs
- stale execution-critical data

Short hard gates:

- flow explicitly bullish and confirmed
- `SPOT_POSITIVE_FUTURES_NEGATIVE` near short trigger/support
- clean bullish reclaim/retest held over failed level
- active short invalidation context already present
- stale execution-critical data

### Caps v0

Caps preserve state discipline when evidence is incomplete.

- If flow is only streak 1: cap at `SHADOW_NO_SETUP`, max effective score 39.
- If flow is streak 2 but not confirmed: cap at `SHADOW_SETUP_FORMING`, max effective score 69.
- If execution plan has R:R < 1.5 to TP1: cap at `SHADOW_SETUP_FORMING`, max effective score 69.
  - When Level 4 execution-plan derivation is not implemented, this cap is skipped and recorded as `execution_plan_unavailable_v0`.
- If macro/extras are stale but microstructure is fresh: no hard block; remove macro points and mark `macro_stale: true`.

## Deterministic execution-plan v0

The execution-plan engine answers:

> If this setup later becomes actionable, what mechanical plan would we use?

It is not an order instruction.

### Long plan

Inputs:

- Backpack current price
- `levels_1h.resistance`
- `levels_1h.support`
- ATR if available, otherwise nearest structure fallback

Rules:

1. Trigger = nearest resistance above current price.
2. Entry rule = close/retest above trigger, not blind market buy.
3. Stop = max of:
   - nearest support below price/trigger, adjusted below support, or
   - trigger - 1.5 ATR
4. TP1 = next resistance above trigger, or trigger + 1R.
5. TP2 = next resistance after TP1, or trigger + 2R.
6. Minimum R:R to TP1 should be tracked; if below 1.5R, mark `execution_quality: POOR`.

### Short plan

Rules:

1. Trigger = nearest support below current price, or failed reclaim level when shorting a rejection.
2. Entry rule = break/retest below trigger, or rejection under resistance.
3. Stop = nearest resistance above price/trigger, adjusted above resistance, or trigger + 1.5 ATR.
4. TP1 = next support below trigger, or trigger - 1R.
5. TP2 = next support after TP1, or trigger - 2R.
6. Track R:R and mark poor plans.

## LLM/agent role after Phase 2

Agents are not the readiness authority.

Possible future roles:

- macro event risk review
- trigger refinement when deterministic plan quality is poor
- human-readable thesis generation
- manual market brief on request

Agent strength scores should be stored as an optional context field, not used as a primary readiness input until evaluated.

## Phase 3 evaluation

Evaluate shadow rows against:

- `data/signal-outcome-events.jsonl`
- `data/signal-outcome-resolutions.jsonl`
- `data/autoresearch/price-15m.jsonl`
- `data/phase1d-alerts.jsonl`

Questions:

1. Do `SHADOW_CONFIRMED` rows outperform `SHADOW_SETUP_FORMING`?
2. Which hard gates avoid false positives?
3. Do OI alignment and CVD divergence improve precision?
4. Are long/short rules symmetric, or does one side need different weights?
5. Are execution plans producing acceptable R:R and realistic triggers?

## Phase 4 activation rule

Only activate one condition at a time after Phase 3 evidence.

Suggested order:

1. Flow confirmed gate
2. OI alignment gate
3. CVD divergence block
4. BTC gate / relative strength gate
5. Cross-exchange funding/crowding
6. Macro/risk cap
7. Execution-plan R:R minimum

Each activation must define:

- expected benefit
- rollback criterion
- affected alert types
- validation window


## Implementation constraints — locked before coding

### Unconditional periodic snapshots

`phase1d-alerts.js` currently appends `data/phase1d-alerts.jsonl` only when events are emitted.

For Phase 2 shadow evaluation, readiness snapshots must be written **unconditionally on every 15m run**, even if:

- no event fired
- no flow changed
- market is quiet
- all assets are `SHADOW_NO_SETUP`

Reason: event-only samples would bias Phase 3 evaluation toward moments that already looked interesting to Phase 1d.

Required output:

- `data/phase1d-alerts.jsonl` — event stream, unchanged behavior
- `data/readiness-shadow.jsonl` — periodic per-asset readiness snapshots, always written

### Level 3 metrics are optional in v0

The v0 scoring formula must function without history-derived Level 3 metrics:

- recent funding-sign continuity
- 4h taker/OI window

If these are absent, null, degraded, or not yet implemented:

- score as neutral / zero contribution
- do not error
- do not hard block
- include `data_quality` / `missing_metrics` notes

Level 3 should slot in later as additional positive/negative evidence, not as a dependency.

### Funding streak naming

Do not label 15m-sampled funding sign continuity as an “8h funding streak.”

Correct naming:

- `recent_funding_sign_continuity`
- `recent_positive_funding_samples`
- `recent_negative_funding_samples`

Reason: repeated 15m samples may all belong to the same 8h funding period and should not be interpreted as consecutive settled funding periods.

A true 8h funding-period streak requires funding-history data by period and should be a separate future metric.

### Initial implementation scope

Phase 2 shadow v0 implementation should start with:

- Level 1: additional fields already in `microstructure-context.json`
- Level 2: extras file reads for macro/Fear & Greed
- readiness scoring that treats missing Level 3 as neutral
- unconditional `data/readiness-shadow.jsonl` writes

Do not implement Level 4 execution-plan derivation in the first readiness-shadow patch.
