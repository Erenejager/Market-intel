# Regime Engine v1.1 Plan — Hysteresis + FLUSH Substate

Generated: 2026-06-07
Status: planning handoff; build fresh next session

## Context

Previous artifacts:

- `data/regime-engine-v1-preregistration.md`
- `data/regime-labels-manual-v1.json`
- `scripts/evaluate-regime-engine-v1-candidates.js`
- `data/regime-engine-v1-candidate-evaluation.md/json`

v1 candidate sweep result:

```text
BULLISH_SQUEEZE candidates passing: 0
BEARISH_TREND candidates passing: 3
FLUSH_CANDIDATE candidates passing: 0
Composite candidates passing: 0
```

Interpretation:

- Simple BTC price-only bearish trend detection is feasible.
- Raw instantaneous thresholds are too flickery at 15m cadence.
- BULLISH_SQUEEZE needs stateful entry/exit handling; high-recall raw rules falsely persist inside bearish windows.
- FLUSH_CANDIDATE is not solved by simple rolling return/range thresholds.
- No production wiring. Continue diagnostic/shadow-only evaluation.

## v1.1 objective

Add state management on top of simple threshold candidates:

- asymmetric hysteresis,
- persistence-based entry/exit,
- FLUSH as a sub-state of established BEARISH_TREND,
- FLUSH hard TTL expiry.

Goal: rescore against the already frozen preregistration criteria without changing those criteria.

## Architecture

Regime state should be hierarchical, not three independent detectors racing.

Priority/flow:

```text
1. If BULLISH_SQUEEZE active:
     emit BULLISH_SQUEEZE

2. Else if BEARISH_TREND active:
     if FLUSH substate active:
       emit FLUSH_CANDIDATE
     else:
       emit BEARISH_TREND

3. Else:
     emit NEUTRAL
```

Important:

- `FLUSH_CANDIDATE` may activate only inside established `BEARISH_TREND`.
- This prevents FLUSH from firing on random sharp drops during NEUTRAL/RANGING periods.
- `BULLISH_SQUEEZE` overrides bearish/flush because missed squeeze is the highest-cost failure.

## Hysteresis model

Each detector has separate raw condition and active state.

State fields:

```js
{
  active: boolean,
  consecutiveTrue: number,
  consecutiveFalse: number,
  activatedAt: timestamp | null,
  expiresAt: timestamp | null // FLUSH only
}
```

### BULLISH_SQUEEZE

Cost model:

- False negative is dangerous: SHORT fires into squeeze.
- False positive is less costly: missed SHORT.

Hysteresis:

```text
entry: fast — 2 or 3 consecutive true samples
exit: slow — 4 or 6 consecutive false samples
```

Candidate sweep:

```text
entry_samples: 2, 3, 4
exit_samples: 4, 6, 8
```

### BEARISH_TREND

Cost model:

- False positive is dangerous: SHORT allowed in non-bearish context.
- Some false negatives are acceptable.

Hysteresis:

```text
entry: 3 or 4 consecutive true samples
exit: slow — 4, 6, or 8 consecutive false samples
```

Candidate sweep:

```text
entry_samples: 2, 3, 4
exit_samples: 4, 6, 8
```

### FLUSH_CANDIDATE

Cost model:

- False negative: may fire into late-flush trap.
- False positive: blocks valid bearish SHORT.
- Evidence is low-n, so v1.1 remains mechanism-based and shadow-only.

Rules:

```text
- may activate only while BEARISH_TREND is active
- entry after 3 consecutive flush-mechanism samples
- exits on hard TTL or consecutive non-flush samples
- hard max duration: 8h or 12h
```

Candidate sweep:

```text
flush_entry_samples: 3
flush_exit_samples: 3
flush_ttl_hours: 8, 12
```

## Base threshold candidates

Use v1 results as starting points.

### BEARISH_TREND base candidates that passed v1 individual criteria

```text
1. dist5d < -1%
   FPR 1.6%, coverage 73.8%, delay 45m

2. dist5d < -0.5%
   FPR 10.4%, coverage 81.9%, delay 0m

3. ret7d < -1%
   FPR 14.8%, coverage 93.8%, delay 0m
```

These are candidates only. v1.1 must test whether hysteresis preserves pass criteria while improving stability.

### BULLISH_SQUEEZE candidate pool

v1 had high-recall candidates that failed because false squeeze calls persisted too long inside bearish windows.

Start with high-recall candidates from v1:

```text
- dist5d > 0
- dist5d > 0.25
- ret4h > 0.5 OR dist5d > 0
- ret4h > 1.0 OR dist5d > 0.25
```

v1.1 should test whether slow exit / priority handling can reduce false persistence without missing squeeze onset.

### FLUSH_CANDIDATE candidate pool

v1 raw candidates all failed. Start with mechanism features, not one final rule:

```text
- recent 4h return sharply negative
- recent 4h return worse than prior 4h (acceleration)
- 4h realized range expansion vs rolling median
- distance below 5d SMA
```

Initial candidate forms:

```text
ret4h < threshold
AND accel4h < threshold
AND range4h_ratio > threshold

ret4h < threshold
AND dist5d < threshold
AND range4h_ratio > threshold
```

Then apply FLUSH substate + TTL.

## Sweep dimensions

Expected tractable sweep:

```text
3 bearish base candidates
× 3 bearish entry settings
× 3 bearish exit settings
× 2 FLUSH TTL settings
= 54 core bearish/flush combinations
```

Also sweep squeeze entry/exit settings separately or combine with a small set of squeeze base candidates.

Keep total candidate combinations manageable; prioritize interpretability over exhaustive search.

## Scoring requirements

Reuse `data/regime-engine-v1-preregistration.md` without changing criteria.

Required metrics:

- BULLISH_SQUEEZE recall
- BULLISH_SQUEEZE median detection delay
- max missed squeeze segment
- max false squeeze segment inside manual BEARISH_TREND
- BEARISH_TREND false-positive rate on non-bearish windows
- BEARISH_TREND coverage of manual BEARISH_TREND excluding FLUSH
- BEARISH_TREND median detection delay
- max BEARISH_TREND false segment inside manual BULLISH_SQUEEZE
- FLUSH coverage of manual FLUSH window
- false FLUSH segments per manual GRIND/CONTINUATION window
- total regime flips/day
- sub-45m flickers
- unknown/unclassified percentage

Strict global targets remain:

```text
flips/day <= 3
sub45 flickers = 0
unknown/unclassified < 10%
```

## Expected outputs

Build a new evaluator, do not overwrite v1:

```text
scripts/evaluate-regime-engine-v1p1-candidates.js
data/regime-engine-v1p1-candidate-evaluation.json
data/regime-engine-v1p1-candidate-evaluation.md
```

The report should include:

- pass/fail counts,
- top passing/near-passing candidates,
- examples of missed squeeze / false bearish / false flush,
- stability metrics,
- explicit recommendation: pass, fail, or needs v1.2.

## Non-goals

- No production alert gating.
- No Telegram wording changes.
- No active-context changes.
- No changing preregistration criteria after seeing v1.1 results.
- No promotion of FLUSH to hard exclusion until future n is sufficient.

## Decision rule after v1.1

If v1.1 passes preregistered historical criteria:

- create shadow-only live classifier writer:
  - `data/regime-current.json`
  - `data/regime-history.jsonl`
- run forward observation for 2–4 weeks.

If v1.1 fails because price-only features remain unstable or cannot solve FLUSH/SQUEEZE:

- do not wire shadow classifier yet,
- define v1.2 using additional inputs:
  - OI character,
  - funding/crowding,
  - range expansion / volatility compression regime,
  - transition-state handling.
