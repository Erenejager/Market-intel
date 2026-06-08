# Regime Engine v1.2 Candidate Evaluation

Generated: 2026-06-07T17:03:58.249Z

## Scope

- Diagnostic only.
- Adds hysteresis, FLUSH sub-state, and bearish-confirmed squeeze-exit override.
- Reuses frozen preregistration criteria; no alert wiring.

## v1.2 change

If BEARISH_TREND is established, stale BULLISH_SQUEEZE state is forcibly cleared. This targets the v1.1 failure where high-recall squeeze rules persisted too long inside bearish windows.

## Pass counts

```json
{
  "total": 23040,
  "all_pass": 0,
  "squeeze_pass": 0,
  "bearish_pass": 16640,
  "flush_pass": 7200,
  "global_pass": 28,
  "component_all_pass": 0
}
```

## Top candidates

| squeeze rule | bearish rule | flush rule | sq e/x | bear e/x | flush ttl | all | sq | bear | flush | global | flips/day | flickers | sq recall | bear cov | bear FPR | flush cov |
| --- | --- | --- | ---: | ---: | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| dist5d_gt_0 | ret7d_lt_-1 | ret4h_lt_-1.5_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/4 | 4/6 | 8h | FAIL | N | N | N | Y | 1.16 | 0 | 100.0% | 93.8% | 15.4% | 0.0% |
| dist5d_gt_0 | ret7d_lt_-1 | ret4h_lt_-1.5_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/4 | 4/6 | 12h | FAIL | N | N | N | Y | 1.16 | 0 | 100.0% | 93.8% | 15.4% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-1.5_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/4 | 4/6 | 8h | FAIL | N | N | N | Y | 1.16 | 0 | 100.0% | 93.8% | 15.4% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-1.5_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/4 | 4/6 | 12h | FAIL | N | N | N | Y | 1.16 | 0 | 100.0% | 93.8% | 15.4% | 0.0% |
| dist5d_gt_0 | ret7d_lt_-1 | ret4h_lt_-1.5_dist5d_lt_-1_range_ratio_gt_1.75 | 3/4 | 4/6 | 8h | FAIL | N | N | N | Y | 1.22 | 0 | 100.0% | 93.8% | 15.4% | 0.0% |
| dist5d_gt_0 | ret7d_lt_-1 | ret4h_lt_-1.5_dist5d_lt_-1_range_ratio_gt_1.75 | 3/4 | 4/6 | 12h | FAIL | N | N | N | Y | 1.22 | 0 | 100.0% | 93.8% | 15.4% | 0.0% |
| dist5d_gt_0 | ret7d_lt_-1 | ret4h_lt_-1.5_dist5d_lt_-1.5_range_ratio_gt_1.5 | 3/4 | 4/6 | 8h | FAIL | N | N | N | Y | 1.22 | 0 | 100.0% | 93.8% | 15.4% | 0.0% |
| dist5d_gt_0 | ret7d_lt_-1 | ret4h_lt_-1.5_dist5d_lt_-1.5_range_ratio_gt_1.5 | 3/4 | 4/6 | 12h | FAIL | N | N | N | Y | 1.22 | 0 | 100.0% | 93.8% | 15.4% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-1.5_dist5d_lt_-1_range_ratio_gt_1.75 | 3/4 | 4/6 | 8h | FAIL | N | N | N | Y | 1.22 | 0 | 100.0% | 93.8% | 15.4% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-1.5_dist5d_lt_-1_range_ratio_gt_1.75 | 3/4 | 4/6 | 12h | FAIL | N | N | N | Y | 1.22 | 0 | 100.0% | 93.8% | 15.4% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-1.5_dist5d_lt_-1.5_range_ratio_gt_1.5 | 3/4 | 4/6 | 8h | FAIL | N | N | N | Y | 1.22 | 0 | 100.0% | 93.8% | 15.4% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-1.5_dist5d_lt_-1.5_range_ratio_gt_1.5 | 3/4 | 4/6 | 12h | FAIL | N | N | N | Y | 1.22 | 0 | 100.0% | 93.8% | 15.4% | 0.0% |
| dist5d_gt_0 | ret7d_lt_-1 | ret4h_lt_-1.25_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/4 | 4/6 | 8h | FAIL | N | N | Y | Y | 1.28 | 0 | 100.0% | 93.8% | 15.4% | 9.0% |
| dist5d_gt_0 | ret7d_lt_-1 | ret4h_lt_-1.25_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/4 | 4/6 | 12h | FAIL | N | N | Y | Y | 1.28 | 0 | 100.0% | 93.8% | 15.4% | 9.0% |
| dist5d_gt_0 | ret7d_lt_-1 | ret4h_lt_-1.5_dist5d_lt_-1_range_ratio_gt_1.5 | 3/4 | 4/6 | 8h | FAIL | N | N | N | Y | 1.28 | 0 | 100.0% | 93.8% | 15.4% | 0.0% |
| dist5d_gt_0 | ret7d_lt_-1 | ret4h_lt_-1.5_dist5d_lt_-1_range_ratio_gt_1.5 | 3/4 | 4/6 | 12h | FAIL | N | N | N | Y | 1.28 | 0 | 100.0% | 93.8% | 15.4% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-1.25_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/4 | 4/6 | 8h | FAIL | N | N | Y | Y | 1.28 | 0 | 100.0% | 93.8% | 15.4% | 9.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-1.25_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/4 | 4/6 | 12h | FAIL | N | N | Y | Y | 1.28 | 0 | 100.0% | 93.8% | 15.4% | 9.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-1.5_dist5d_lt_-1_range_ratio_gt_1.5 | 3/4 | 4/6 | 8h | FAIL | N | N | N | Y | 1.28 | 0 | 100.0% | 93.8% | 15.4% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-1.5_dist5d_lt_-1_range_ratio_gt_1.5 | 3/4 | 4/6 | 12h | FAIL | N | N | N | Y | 1.28 | 0 | 100.0% | 93.8% | 15.4% | 0.0% |
| dist5d_gt_0 | ret7d_lt_-1 | ret4h_lt_-1_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/4 | 4/6 | 8h | FAIL | N | N | Y | Y | 1.40 | 0 | 100.0% | 93.8% | 15.4% | 15.3% |
| dist5d_gt_0 | ret7d_lt_-1 | ret4h_lt_-1_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/4 | 4/6 | 12h | FAIL | N | N | Y | Y | 1.40 | 0 | 100.0% | 93.8% | 15.4% | 15.3% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-1_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/4 | 4/6 | 8h | FAIL | N | N | Y | Y | 1.40 | 0 | 100.0% | 93.8% | 15.4% | 15.3% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-1_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/4 | 4/6 | 12h | FAIL | N | N | Y | Y | 1.40 | 0 | 100.0% | 93.8% | 15.4% | 15.3% |
| dist5d_gt_0 | ret7d_lt_-1 | ret4h_lt_-0.75_dist5d_lt_-1.5_range_ratio_gt_1.75 | 3/4 | 4/6 | 8h | FAIL | N | N | Y | Y | 1.58 | 0 | 100.0% | 93.8% | 15.4% | 18.8% |

## Preliminary read

- No candidate passed all preregistered historical criteria. Do not wire shadow-live classifier yet; v1.2 squeeze-exit override was insufficient and a v1.3 plan is needed.
- Component pass counts: squeeze 0, bearish 16640, flush 7200, global 28.
- Global stability can pass, but component criteria still fail. The remaining blocker is not flicker; it is squeeze false-persistence / bearish-vs-squeeze separation.
- FLUSH remains low-n and mechanism-based; even passing candidates are exclusion candidates only, not production rules.
