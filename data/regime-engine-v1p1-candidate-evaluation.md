# Regime Engine v1.1 Candidate Evaluation

Generated: 2026-06-07T12:54:22.821Z

## Scope

- Diagnostic only.
- Adds hysteresis and FLUSH sub-state per `data/regime-engine-v1p1-plan.md`.
- Reuses frozen preregistration criteria; no alert wiring.

## Pass counts

```json
{
  "total": 349920,
  "all_pass": 0,
  "squeeze_pass": 0,
  "bearish_pass": 278280,
  "flush_pass": 79920,
  "global_pass": 20304,
  "component_all_pass": 0
}
```

## Top candidates

| squeeze rule | bearish rule | flush rule | sq e/x | bear e/x | flush ttl | all | sq | bear | flush | global | flips/day | flickers | sq recall | bear cov | bear FPR | flush cov |
| --- | --- | --- | ---: | ---: | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-2_accel_lt_-0.25_range_ratio_gt_2 | 4/8 | 4/8 | 8h | FAIL | N | Y | N | Y | 0.76 | 0 | 100.0% | 89.0% | 13.2% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-2_accel_lt_-0.25_range_ratio_gt_2 | 4/8 | 4/8 | 12h | FAIL | N | Y | N | Y | 0.76 | 0 | 100.0% | 89.0% | 13.2% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-2_accel_lt_-0.5_range_ratio_gt_2 | 4/8 | 4/8 | 8h | FAIL | N | Y | N | Y | 0.76 | 0 | 100.0% | 89.0% | 13.2% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-2_accel_lt_-0.5_range_ratio_gt_2 | 4/8 | 4/8 | 12h | FAIL | N | Y | N | Y | 0.76 | 0 | 100.0% | 89.0% | 13.2% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-2_accel_lt_-0.75_range_ratio_gt_2 | 4/8 | 4/8 | 8h | FAIL | N | Y | N | Y | 0.76 | 0 | 100.0% | 89.0% | 13.2% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-2_accel_lt_-0.75_range_ratio_gt_2 | 4/8 | 4/8 | 12h | FAIL | N | Y | N | Y | 0.76 | 0 | 100.0% | 89.0% | 13.2% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-2_accel_lt_-1_range_ratio_gt_2 | 4/8 | 4/8 | 8h | FAIL | N | Y | N | Y | 0.76 | 0 | 100.0% | 89.0% | 13.2% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-2_accel_lt_-1_range_ratio_gt_2 | 4/8 | 4/8 | 12h | FAIL | N | Y | N | Y | 0.76 | 0 | 100.0% | 89.0% | 13.2% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-2_dist5d_lt_-0.5_range_ratio_gt_2 | 4/8 | 4/8 | 8h | FAIL | N | Y | N | Y | 0.76 | 0 | 100.0% | 89.0% | 13.2% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-2_dist5d_lt_-0.5_range_ratio_gt_2 | 4/8 | 4/8 | 12h | FAIL | N | Y | N | Y | 0.76 | 0 | 100.0% | 89.0% | 13.2% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-2_dist5d_lt_-1_range_ratio_gt_2 | 4/8 | 4/8 | 8h | FAIL | N | Y | N | Y | 0.76 | 0 | 100.0% | 89.0% | 13.2% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-2_dist5d_lt_-1_range_ratio_gt_2 | 4/8 | 4/8 | 12h | FAIL | N | Y | N | Y | 0.76 | 0 | 100.0% | 89.0% | 13.2% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-2_dist5d_lt_-1.5_range_ratio_gt_2 | 4/8 | 4/8 | 8h | FAIL | N | Y | N | Y | 0.76 | 0 | 100.0% | 89.0% | 13.2% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-2_dist5d_lt_-1.5_range_ratio_gt_2 | 4/8 | 4/8 | 12h | FAIL | N | Y | N | Y | 0.76 | 0 | 100.0% | 89.0% | 13.2% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-2_dist5d_lt_-2_range_ratio_gt_2 | 4/8 | 4/8 | 8h | FAIL | N | Y | N | Y | 0.76 | 0 | 100.0% | 89.0% | 13.2% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-2_dist5d_lt_-2_range_ratio_gt_2 | 4/8 | 4/8 | 12h | FAIL | N | Y | N | Y | 0.76 | 0 | 100.0% | 89.0% | 13.2% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-2_dist5d_lt_-3_range_ratio_gt_2 | 4/8 | 4/8 | 8h | FAIL | N | Y | N | Y | 0.76 | 0 | 100.0% | 89.0% | 13.2% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-2_dist5d_lt_-3_range_ratio_gt_2 | 4/8 | 4/8 | 12h | FAIL | N | Y | N | Y | 0.76 | 0 | 100.0% | 89.0% | 13.2% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-2_accel_lt_-0.25_range_ratio_gt_2 | 3/8 | 4/6 | 8h | FAIL | N | Y | N | Y | 0.76 | 0 | 100.0% | 88.9% | 12.8% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-2_accel_lt_-0.25_range_ratio_gt_2 | 3/8 | 4/6 | 12h | FAIL | N | Y | N | Y | 0.76 | 0 | 100.0% | 88.9% | 12.8% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-2_accel_lt_-0.25_range_ratio_gt_2 | 3/8 | 4/8 | 8h | FAIL | N | Y | N | Y | 0.76 | 0 | 100.0% | 88.9% | 12.8% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-2_accel_lt_-0.25_range_ratio_gt_2 | 3/8 | 4/8 | 12h | FAIL | N | Y | N | Y | 0.76 | 0 | 100.0% | 88.9% | 12.8% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-2_accel_lt_-0.5_range_ratio_gt_2 | 3/8 | 4/6 | 8h | FAIL | N | Y | N | Y | 0.76 | 0 | 100.0% | 88.9% | 12.8% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-2_accel_lt_-0.5_range_ratio_gt_2 | 3/8 | 4/6 | 12h | FAIL | N | Y | N | Y | 0.76 | 0 | 100.0% | 88.9% | 12.8% | 0.0% |
| dist5d_gt_0.25 | ret7d_lt_-1 | ret4h_lt_-2_accel_lt_-0.5_range_ratio_gt_2 | 3/8 | 4/8 | 8h | FAIL | N | Y | N | Y | 0.76 | 0 | 100.0% | 88.9% | 12.8% | 0.0% |

## Preliminary read

- No candidate passed all preregistered historical criteria. Do not wire shadow-live classifier yet without a v1.2 plan.
- Component pass counts: squeeze 0, bearish 278280, flush 79920, global 20304.
- If global stability fails broadly, hysteresis alone is insufficient or thresholds need stronger state priority/transition handling.
- FLUSH remains low-n and mechanism-based; even passing candidates are exclusion candidates only, not production rules.
