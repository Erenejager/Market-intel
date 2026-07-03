# Phase 0 Alert Cleanup Investigation — 2026-06-16

Generated: 2026-06-16T18:xxZ

Inputs:
- `data/alert-quality-report-since-2026-06-07.{md,json}` generated 2026-06-16T17:49Z
- `data/alert-diagnostics-report.md` generated 2026-06-16T17:49Z
- `data/empirical-watch-report.md/json` generated 2026-06-16T17:49Z
- `data/phase1d-alerts.jsonl`
- `scripts/pattern-classifier.js`
- `scripts/phase1d-alerts.js`

## Findings

### 1. Active-context lifecycle n=0 is expected under current rules, not a tracking join bug

Since 2026-06-07T18:00Z there are 88 confirmed trade alerts and 0 active-context creates.

Reason:
- Active contexts require `readiness_shadow.state === SHADOW_CONFIRMED` and score/effective score >=70 in `updateActiveContexts()`.
- Since Jun 7, all shadow-confirmed rows were quarantined by pattern `active_context:false` before context creation.
- All non-quarantined/no-pattern rows were below the shadow-confirmed threshold.

Shadow-confirmed rows since Jun 7:
- 10 `SOL_LONG_WATCH_ONLY`
- 2 `NEUTRAL_OI_LONG`
- 1 `SHORTS_COVERING_LONG_UNVALIDATED`
- 1 `FRESH_SHORTS_LONG`

All carry pattern watch/quarantine semantics, so no active context is created. This means Phase 2 active-context validation is blocked by current conservative pattern quarantines, not by missing lifecycle instrumentation.

### 2. `SOL_SHORT_BELOW_GATE_WATCH` is underperforming because it is the fallback bucket after better SOL short cases are siphoned out

Classifier order in `scripts/pattern-classifier.js` for below-gate SHORTs:
1. `FADE_SHORT_POSITIVE_FUNDING` when score >=50 and funding is broad positive.
2. `FADE_SHORT_LATE_AFTER_LOW` when `late_lag_min >= 15`.
3. SOL-specific slices:
   - `SOL_SHORT_SHORTS_COVERING_WATCH`
   - `SOL_SHORT_50_59_WATCH`
   - fallback `SOL_SHORT_BELOW_GATE_WATCH`

So `SOL_SHORT_BELOW_GATE_WATCH` is not “raw SOL SHORT below gate”; it is the residual SOL SHORT bucket after late-lag, positive-funding, shorts-covering, and 50–59 score slices are removed.

Since Jun 7, SOL SHORT confirmed rows split as:

| bucket | rows | 4h read |
|---|---:|---|
| `FADE_SHORT_LATE_AFTER_LOW` | 5 | strongly positive in current short confirmed sample |
| `SOL_SHORT_BELOW_GATE_WATCH` | 3 | 0/3 positive; avg materially negative |
| `SOL_SHORT_SHORTS_COVERING_WATCH` | 1 | positive, tiny n |

The apparent contradiction is therefore selection bias from bucket ordering. Raw SOL SHORT can look okay while the fallback gate is bad because the stronger rows have already been classified elsewhere.

### 3. `FADE_SHORT_LATE_AFTER_LOW` must be priority cleanup despite a short-term positive pocket

Empirical watch report all tracked rows:
- `FADE_SHORT_LATE_AFTER_LOW`: n=133, REVIEW_OR_UNTRACK, 1h 48.1% avg -0.108%, 4h 39.8% avg -0.216%.
- SOL dominates: n=113, 4h 38.1% avg -0.277%.

The Jun 7+ confirmed-only SOL SHORT subset is small and currently positive, but the larger locked watch report says the bucket is not reliable enough for bullish/fade wording or promotion.

Recommendation: downrank/suppress as a general watch bucket; if retained, wording should say “historically noisy; only recent confirmed subset improved, low n.”

### 4. ETH LONG is a horizon-shape bucket, not simple noise

Since Jun 7:
- ETH LONG 1h/4h hit rates are weak (~22.2%), but 24h flips to 60% hit / avg +0.935%.

Recommendation: document as delayed/24h mean-reversion shape, not a 1h/4h trade signal. Avoid immediate-entry wording.

## Recommended next implementation step

Implement a presentation/routing action map only. No scoring, gate, active-context, or execution changes.

Initial map:

- `KEEP_TRACKING`: `LONGS_EXITING_LONG_UNVALIDATED`
- `DOWNRANK_WORDING` / `SUPPRESS_TELEGRAM`: `FADE_SHORT_LATE_AFTER_LOW`, `SOL_LONG_WATCH_ONLY`, `NEUTRAL_OI_LONG`, `FADE_SHORT_POSITIVE_FUNDING`, `SHORTS_COVERING_LONG_UNVALIDATED`, `FRESH_LONGS_LONG_UNVALIDATED`
- `DOWNRANK_WORDING`: `SOL_SHORT_BELOW_GATE_WATCH` with explanation that it is a residual underperforming fallback, not raw SOL SHORT
- `HORIZON_SHAPE_ONLY`: ETH LONG-style 24h delayed rebound framing; no 1h/4h conviction wording
- `HOLD_REVIEW`: `FRESH_SHORTS_LONG`, `SOL_SHORT_SHORTS_COVERING_WATCH` until more rows

No active-context validation can progress until at least one promoted/allowed pattern starts creating contexts again, or until a deliberate shadow-only counterfactual context tracker is added.
