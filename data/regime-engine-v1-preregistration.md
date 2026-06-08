# Regime Engine v1 Preregistration

Generated: 2026-06-07
Status: **FROZEN BEFORE CANDIDATE RULE TESTING**

## Scope

This document pre-registers pass/fail criteria for BTC regime-engine v1 candidate rules before testing algorithmic rules against the manual labels.

Reference labels:

- `data/regime-labels-manual-v1.json`
- Version: `manual_btc_price_regime_v1`
- Basis: `BTC_PRICE_ONLY`

Important constraint:

> Manual BTC price regime v1 labels are **reference labels for rule discovery**, not validated ground truth.

This preregistration exists to prevent overfitting candidate rules to the manual windows.

## Candidate outputs

Regime engine v1 candidate rules may output:

- `BULLISH_SQUEEZE`
- `BEARISH_TREND`
- `FLUSH_CANDIDATE`
- `NEUTRAL`

Optional metadata may include:

- `confidence`: `HIGH | MEDIUM | LOW`
- `basis`: list of rule inputs used
- `transition_state`: boolean
- `reason_codes`: short machine-readable explanations

## Asymmetric cost model

Different outputs have different error costs.

### `BULLISH_SQUEEZE`

Purpose: block SHORTs during squeeze/uptrend conditions.

Primary risk:

- False negative: SHORT fires into squeeze — worst failure mode.

Tolerance:

- False positives are acceptable if limited, because the cost is mostly a missed SHORT rather than a bad SHORT.

Pass criteria:

- Recall against manual `BULLISH_SQUEEZE` window must be `>= 80%`.
- Median detection delay from manual squeeze-window start must be `<= 60 minutes`.
- No missed squeeze segment may last longer than `2 hours`.
- False-positive squeeze calls must not persist for more than `2 hours` inside strong manual `BEARISH_TREND` windows.

Fail criteria:

- Recall `< 80%`.
- Median detection delay `> 60 minutes`.
- Any missed squeeze segment `> 2 hours`.
- Persistent false squeeze call `> 2 hours` inside strong manual `BEARISH_TREND`.

### `BEARISH_TREND`

Purpose: allow/watch BTC/ETH SHORTs only when BTC trend context supports them.

Primary risk:

- False positive: non-bearish period called bearish, allowing SHORTs when they should not be allowed.

Tolerance:

- Some false negatives are acceptable because missed SHORTs are less costly than bad SHORTs.

Pass criteria:

- False-positive rate on non-bearish reference windows must be `<= 15%`.
- Median detection delay after manual bearish-window start must be `<= 2 hours`.
- Coverage of manual `BEARISH_TREND` windows, excluding manual `FLUSH`, must be `>= 70%`.
- Must not classify manual `BULLISH_SQUEEZE` as `BEARISH_TREND` for any continuous segment longer than `45 minutes`.

Fail criteria:

- False-positive rate on non-bearish windows `> 15%`.
- Median detection delay `> 2 hours`.
- Coverage of non-FLUSH bearish trend windows `< 70%`.
- Any continuous `BEARISH_TREND` call inside manual `BULLISH_SQUEEZE` lasting `> 45 minutes`.

### `FLUSH_CANDIDATE`

Purpose: exclude late bearish SHORTs where the alert fires during/near the end of a fast downside flush and the 24h window captures recovery/reversal.

Current evidence:

- Manual `BEARISH_FLUSH` sample is low-n (`n=6` SHORT alerts in current diagnostic).
- Statistical validation is not valid yet.
- v1 FLUSH is mechanism-based and shadow-only.

Expected mechanism:

A valid `FLUSH_CANDIDATE` should reflect:

- large recent downside acceleration,
- range/volatility expansion,
- extension below a recent mean/reference level,
- elevated risk that the downside move is late rather than early.

Pass criteria for v1 shadow candidate:

- Must identify the known May 22–24 manual `BEARISH_FLUSH` window as `FLUSH_CANDIDATE` for at least part of the window.
- Must not call more than `2` false `FLUSH_CANDIDATE` segments per manual `GRIND` window.
- Each false `FLUSH_CANDIDATE` segment inside manual `GRIND`/`CONTINUATION` must be manually inspected and remain observation-only.
- No production exclusion may be wired from FLUSH until promotion criteria below are met.

Definition of false `FLUSH_CANDIDATE` call:

A `FLUSH_CANDIDATE` call inside a manual `GRIND` or `CONTINUATION` window where either:

- subsequent 24h SHORT outcome remains favorable, or
- price does not show a recovery/reversal profile after the call.

Promotion criteria for future hard exclusion:

- At least `n >= 15` `FLUSH_CANDIDATE` SHORT-alert observations.
- The adverse/reversal 24h profile persists.
- False FLUSH blocking remains within the pre-registered cap.
- Forward shadow observation has run for at least `2–4 weeks`.

Fail criteria for v1 shadow candidate:

- Does not identify any portion of the known May 22–24 manual `BEARISH_FLUSH` window.
- Produces more than `2` false `FLUSH_CANDIDATE` segments in a manual `GRIND` window.
- Produces frequent FLUSH calls that make `BEARISH_TREND` unusable as a SHORT watch regime.

## Global stability criteria

These criteria apply to the total emitted regime state, not separately per output type.

Pass criteria:

- Total regime flips per day must be `<= 3` on average across the scored historical window.
- No single-state flicker shorter than `45 minutes`, except inside explicitly marked transition periods.
- `UNKNOWN`/unclassified state must be `< 10%` of scored samples.
- State history must be contiguous and timestamped at the classifier cadence.

Fail criteria:

- Average total regime flips/day `> 3`.
- Repeated sub-45-minute flickers outside transition periods.
- `UNKNOWN`/unclassified state `>= 10%` of scored samples.

## Candidate rule testing protocol

Rules may be tested only after this document exists.

For each candidate rule set, report:

- input features used,
- output labels generated,
- confusion summary versus manual reference labels,
- detection delay by output type,
- false-positive/false-negative examples,
- flip count/day,
- unclassified percentage,
- whether each pre-registered pass/fail criterion passed.

Candidate rules should start simple before adding more factors:

1. BTC rolling returns: 4h, 8h, 24h.
2. BTC price vs 5d/7d SMA.
3. BTC distance from 5d/7d SMA.
4. SMA slope / trend persistence.
5. Realized range / volatility expansion.
6. Only if BTC_PRICE_ONLY is too noisy: OI character and funding/crowding for v2.

## Shadow-only rule

No alert gating, routing, active-context creation, or Telegram wording changes may be wired from regime engine v1 during candidate testing.

Allowed outputs during shadow phase:

- `data/regime-current.json`
- `data/regime-history.jsonl`
- diagnostic reports comparing regime calls to outcomes

Production wiring requires:

- pre-registered historical criteria pass,
- `2–4 weeks` forward shadow observation,
- review of missed squeeze / false bearish / false flush examples,
- separate decision report explicitly approving wiring.

## Relationship to LONG gating

LONG gating analysis remains required before production wiring, but it does not block shadow-only regime classifier logging.

Required LONG analysis before wiring:

- Join `LONG_CONFIRMED HIGH` alerts to the same regime outputs.
- Report outcomes by asset, parent regime, and momentum type.
- Use results for risk-control / downgrade logic, not LONG promotion in bearish regimes.

## Current intended interpretation if criteria pass

If future candidate rules pass this preregistration and forward shadow validation:

- `BULLISH_SQUEEZE` may become a hard SHORT block candidate.
- `BEARISH_TREND` non-FLUSH may permit/watch BTC SHORT continuation setups.
- `FLUSH_CANDIDATE` may remain an exclusion candidate until sufficient n accumulates.
- ETH SHORT may use weaker `not BULLISH_SQUEEZE` gating unless stronger bearish-vs-neutral separation appears.
- SOL SHORT remains unpromoted unless future evidence changes.
