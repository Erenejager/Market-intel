# Regime Engine v1.3 Candidate Evaluation

Generated: 2026-06-07T17:20:57.908Z

## Scope

- Diagnostic only.
- Adds squeeze invalidators on top of hysteresis, FLUSH sub-state, and bearish-confirmed squeeze-exit override.
- Reuses frozen preregistration criteria; no alert wiring.

## v1.3 change

BULLISH_SQUEEZE now requires the high-recall squeeze condition to remain un-invalidated by downside/reclaim-failure signals. If invalidated, squeeze state is cleared even before BEARISH_TREND is established.

## Pass counts

```json
{
  "total": 7168,
  "all_pass": 0,
  "squeeze_pass": 0,
  "bearish_pass": 4480,
  "flush_pass": 5376,
  "global_pass": 36,
  "component_all_pass": 0
}
```

## Top candidates

| squeeze rule | squeeze invalidator | bearish rule | flush rule | sq e/x | bear e/x | flush ttl | all | sq | bear | flush | global | flips/day | flickers | sq recall | bear cov | bear FPR | flush cov |
| --- | --- | --- | --- | ---: | ---: | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| dist5d_gt_0.25 | dist5d_lt_0 | ret7d_lt_-1 | ret4h_lt_-1.5_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/6 | 4/6 | 8h | FAIL | N | N | N | Y | 1.09 | 0 | 100.0% | 93.8% | 15.4% | 0.0% |
| dist5d_gt_0.25 | dist5d_lt_0 | ret7d_lt_-1 | ret4h_lt_-1.5_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/6 | 4/6 | 12h | FAIL | N | N | N | Y | 1.09 | 0 | 100.0% | 93.8% | 15.4% | 0.0% |
| ret4h_gt_1_or_dist5d_gt_0.25 | dist5d_lt_0 | ret7d_lt_-1 | ret4h_lt_-1.5_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/6 | 4/6 | 8h | FAIL | N | N | N | Y | 1.09 | 0 | 100.0% | 93.8% | 15.4% | 0.0% |
| ret4h_gt_1_or_dist5d_gt_0.25 | dist5d_lt_0 | ret7d_lt_-1 | ret4h_lt_-1.5_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/6 | 4/6 | 12h | FAIL | N | N | N | Y | 1.09 | 0 | 100.0% | 93.8% | 15.4% | 0.0% |
| dist5d_gt_0.25 | dist5d_lt_0 | ret7d_lt_-1 | ret4h_lt_-1.5_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/4 | 4/6 | 8h | FAIL | N | N | N | Y | 1.16 | 0 | 100.0% | 93.8% | 15.4% | 0.0% |
| dist5d_gt_0.25 | dist5d_lt_0 | ret7d_lt_-1 | ret4h_lt_-1.5_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/4 | 4/6 | 12h | FAIL | N | N | N | Y | 1.16 | 0 | 100.0% | 93.8% | 15.4% | 0.0% |
| ret4h_gt_1_or_dist5d_gt_0.25 | dist5d_lt_0 | ret7d_lt_-1 | ret4h_lt_-1.5_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/4 | 4/6 | 8h | FAIL | N | N | N | Y | 1.16 | 0 | 100.0% | 93.8% | 15.4% | 0.0% |
| ret4h_gt_1_or_dist5d_gt_0.25 | dist5d_lt_0 | ret7d_lt_-1 | ret4h_lt_-1.5_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/4 | 4/6 | 12h | FAIL | N | N | N | Y | 1.16 | 0 | 100.0% | 93.8% | 15.4% | 0.0% |
| dist5d_gt_0.25 | dist5d_lt_0 | ret7d_lt_-1 | ret4h_lt_-1.25_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/6 | 4/6 | 8h | FAIL | N | N | Y | Y | 1.22 | 0 | 100.0% | 93.8% | 15.4% | 9.0% |
| dist5d_gt_0.25 | dist5d_lt_0 | ret7d_lt_-1 | ret4h_lt_-1.25_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/6 | 4/6 | 12h | FAIL | N | N | Y | Y | 1.22 | 0 | 100.0% | 93.8% | 15.4% | 9.0% |
| ret4h_gt_1_or_dist5d_gt_0.25 | dist5d_lt_0 | ret7d_lt_-1 | ret4h_lt_-1.25_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/6 | 4/6 | 8h | FAIL | N | N | Y | Y | 1.22 | 0 | 100.0% | 93.8% | 15.4% | 9.0% |
| ret4h_gt_1_or_dist5d_gt_0.25 | dist5d_lt_0 | ret7d_lt_-1 | ret4h_lt_-1.25_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/6 | 4/6 | 12h | FAIL | N | N | Y | Y | 1.22 | 0 | 100.0% | 93.8% | 15.4% | 9.0% |
| dist5d_gt_0.25 | dist5d_lt_0 | ret7d_lt_-1 | ret4h_lt_-1.25_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/4 | 4/6 | 8h | FAIL | N | N | Y | Y | 1.28 | 0 | 100.0% | 93.8% | 15.4% | 9.0% |
| dist5d_gt_0.25 | dist5d_lt_0 | ret7d_lt_-1 | ret4h_lt_-1.25_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/4 | 4/6 | 12h | FAIL | N | N | Y | Y | 1.28 | 0 | 100.0% | 93.8% | 15.4% | 9.0% |
| ret4h_gt_1_or_dist5d_gt_0.25 | dist5d_lt_0 | ret7d_lt_-1 | ret4h_lt_-1.25_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/4 | 4/6 | 8h | FAIL | N | N | Y | Y | 1.28 | 0 | 100.0% | 93.8% | 15.4% | 9.0% |
| ret4h_gt_1_or_dist5d_gt_0.25 | dist5d_lt_0 | ret7d_lt_-1 | ret4h_lt_-1.25_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/4 | 4/6 | 12h | FAIL | N | N | Y | Y | 1.28 | 0 | 100.0% | 93.8% | 15.4% | 9.0% |
| dist5d_gt_0.25 | dist5d_lt_0 | ret7d_lt_-1 | ret4h_lt_-1_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/6 | 4/6 | 8h | FAIL | N | N | Y | Y | 1.34 | 0 | 100.0% | 93.8% | 15.4% | 15.3% |
| dist5d_gt_0.25 | dist5d_lt_0 | ret7d_lt_-1 | ret4h_lt_-1_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/6 | 4/6 | 12h | FAIL | N | N | Y | Y | 1.34 | 0 | 100.0% | 93.8% | 15.4% | 15.3% |
| ret4h_gt_1_or_dist5d_gt_0.25 | dist5d_lt_0 | ret7d_lt_-1 | ret4h_lt_-1_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/6 | 4/6 | 8h | FAIL | N | N | Y | Y | 1.34 | 0 | 100.0% | 93.8% | 15.4% | 15.3% |
| ret4h_gt_1_or_dist5d_gt_0.25 | dist5d_lt_0 | ret7d_lt_-1 | ret4h_lt_-1_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/6 | 4/6 | 12h | FAIL | N | N | Y | Y | 1.34 | 0 | 100.0% | 93.8% | 15.4% | 15.3% |
| dist5d_gt_0.25 | dist5d_lt_0 | ret7d_lt_-1 | ret4h_lt_-1_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/4 | 4/6 | 8h | FAIL | N | N | Y | Y | 1.40 | 0 | 100.0% | 93.8% | 15.4% | 15.3% |
| dist5d_gt_0.25 | dist5d_lt_0 | ret7d_lt_-1 | ret4h_lt_-1_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/4 | 4/6 | 12h | FAIL | N | N | Y | Y | 1.40 | 0 | 100.0% | 93.8% | 15.4% | 15.3% |
| ret4h_gt_1_or_dist5d_gt_0.25 | dist5d_lt_0 | ret7d_lt_-1 | ret4h_lt_-1_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/4 | 4/6 | 8h | FAIL | N | N | Y | Y | 1.40 | 0 | 100.0% | 93.8% | 15.4% | 15.3% |
| ret4h_gt_1_or_dist5d_gt_0.25 | dist5d_lt_0 | ret7d_lt_-1 | ret4h_lt_-1_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/4 | 4/6 | 12h | FAIL | N | N | Y | Y | 1.40 | 0 | 100.0% | 93.8% | 15.4% | 15.3% |
| dist5d_gt_0.25 | ret8h_lt_-0.75 | ret7d_lt_-1 | ret4h_lt_-1.5_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/4 | 4/6 | 8h | FAIL | N | N | N | Y | 1.46 | 0 | 95.8% | 93.8% | 15.4% | 0.0% |

## Preliminary read

- No candidate passed all preregistered historical criteria. Do not wire shadow-live classifier. Per prior decision, the next step is failure-case diagnostics of squeeze false-active periods, not v1.4 feature expansion.
- Component pass counts: squeeze 0, bearish 4480, flush 5376, global 36.
- Global stability can pass, but squeeze still fails. The remaining issue is not flicker; it is that price-only squeeze conditions remain falsely active inside manual bearish windows.
- FLUSH remains low-n and mechanism-based; even passing candidates are exclusion candidates only, not production rules.
