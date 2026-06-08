# Regime Engine v1 Candidate Evaluation

Generated: 2026-06-07T12:40:33.983Z

## Scope

- Diagnostic threshold sweep only.
- Manual labels are reference labels, not validated ground truth.
- No alert wiring.

## Sample counts

```json
{
  "total": 3040,
  "first": "2026-05-05T19:41:53.229Z",
  "last": "2026-06-07T12:30:01.426Z",
  "squeeze": 142,
  "non_bear": 864,
  "bear_non_flush": 2032,
  "flush": 144
}
```

## Pass counts

```json
{
  "BULLISH_SQUEEZE": 0,
  "BEARISH_TREND": 3,
  "FLUSH_CANDIDATE": 0
}
```

## BULLISH_SQUEEZE top candidates

| candidate | verdict | metric 1 | metric 2 | metric 3 | metric 4 |
| --- | --- | --- | --- | --- | --- |
| dist5d_gt_0 | FAIL | recall 100.0% | delay 0m | max missed 0m | false in bear 810m |
| ret4h_gt_0.5_or_dist5d_gt_0 | FAIL | recall 100.0% | delay 0m | max missed 0m | false in bear 810m |
| ret4h_gt_0.75_or_dist5d_gt_0 | FAIL | recall 100.0% | delay 0m | max missed 0m | false in bear 810m |
| ret4h_gt_1_or_dist5d_gt_0 | FAIL | recall 100.0% | delay 0m | max missed 0m | false in bear 810m |
| ret4h_gt_1.25_or_dist5d_gt_0 | FAIL | recall 100.0% | delay 0m | max missed 0m | false in bear 810m |
| ret4h_gt_1.5_or_dist5d_gt_0 | FAIL | recall 100.0% | delay 0m | max missed 0m | false in bear 810m |
| ret4h_gt_0.25_or_dist5d_gt_0 | FAIL | recall 100.0% | delay 0m | max missed 0m | false in bear 930m |
| dist5d_gt_0.25 | FAIL | recall 99.3% | delay 0m | max missed 15m | false in bear 540m |
| ret4h_gt_1.25_or_dist5d_gt_0.25 | FAIL | recall 99.3% | delay 0m | max missed 15m | false in bear 540m |
| ret4h_gt_1.5_or_dist5d_gt_0.25 | FAIL | recall 99.3% | delay 0m | max missed 15m | false in bear 540m |
| ret4h_gt_0.75_or_dist5d_gt_0.25 | FAIL | recall 99.3% | delay 0m | max missed 15m | false in bear 555m |
| ret4h_gt_1_or_dist5d_gt_0.25 | FAIL | recall 99.3% | delay 0m | max missed 15m | false in bear 555m |
| ret4h_gt_0.5_or_dist5d_gt_0.25 | FAIL | recall 99.3% | delay 0m | max missed 15m | false in bear 570m |
| ret4h_gt_0.25_or_dist5d_gt_0.25 | FAIL | recall 99.3% | delay 0m | max missed 15m | false in bear 585m |
| dist5d_gt_0.5 | FAIL | recall 89.4% | delay 0m | max missed 135m | false in bear 480m |

## BEARISH_TREND top candidates

| candidate | verdict | metric 1 | metric 2 | metric 3 | metric 4 |
| --- | --- | --- | --- | --- | --- |
| dist5d_lt_-1 | PASS | FPR 1.6% | coverage 73.8% | delay 45m | squeeze false 0m |
| dist5d_lt_-0.5 | PASS | FPR 10.4% | coverage 81.9% | delay 0m | squeeze false 0m |
| ret7d_lt_-1 | PASS | FPR 14.8% | coverage 93.8% | delay 0m | squeeze false 0m |
| ret7d_lt_-3 | FAIL | FPR 0.0% | coverage 71.8% | delay 210m | squeeze false 0m |
| dist5d_lt_-1.5 | FAIL | FPR 0.0% | coverage 67.1% | delay 158m | squeeze false 0m |
| ret7d_lt_-4 | FAIL | FPR 0.0% | coverage 56.4% | delay 0m | squeeze false 0m |
| dist5d_lt_-2 | FAIL | FPR 0.0% | coverage 53.1% | delay 338m | squeeze false 0m |
| ret24h_lt_-0.5_and_dist5d_lt_-1.5 | FAIL | FPR 0.0% | coverage 48.4% | delay 158m | squeeze false 0m |
| ret24h_lt_-1_and_dist5d_lt_-1.5 | FAIL | FPR 0.0% | coverage 44.9% | delay 158m | squeeze false 0m |
| ret7d_lt_-5 | FAIL | FPR 0.0% | coverage 41.8% | delay 105m | squeeze false 0m |
| dist5d_lt_-2.5 | FAIL | FPR 0.0% | coverage 41.2% | delay 330m | squeeze false 0m |
| ret24h_lt_-0.5_and_dist5d_lt_-2 | FAIL | FPR 0.0% | coverage 41.1% | delay 338m | squeeze false 0m |
| ret24h_lt_-1_and_dist5d_lt_-2 | FAIL | FPR 0.0% | coverage 38.3% | delay 338m | squeeze false 0m |
| ret24h_lt_-1.5_and_dist5d_lt_-1.5 | FAIL | FPR 0.0% | coverage 37.1% | delay 195m | squeeze false 0m |
| ret24h_lt_-1.5_and_dist5d_lt_-2 | FAIL | FPR 0.0% | coverage 32.0% | delay 338m | squeeze false 0m |

## FLUSH_CANDIDATE top candidates

| candidate | verdict | metric 1 | metric 2 | metric 3 | metric 4 |
| --- | --- | --- | --- | --- | --- |
| ret4h_lt_-1_dist5d_lt_-1_range_ratio_gt_1.75 | FAIL | flush coverage 14.6% | false seg cap 5 | | |
| ret4h_lt_-1_dist5d_lt_-1_range_ratio_gt_1.25 | FAIL | flush coverage 14.6% | false seg cap 8 | | |
| ret4h_lt_-1_dist5d_lt_-1_range_ratio_gt_1.5 | FAIL | flush coverage 14.6% | false seg cap 8 | | |
| ret4h_lt_-1_accel_lt_-0.5_range_ratio_gt_1.1 | FAIL | flush coverage 13.9% | false seg cap 10 | | |
| ret4h_lt_-1_accel_lt_-0.5_range_ratio_gt_1.75 | FAIL | flush coverage 13.2% | false seg cap 5 | | |
| ret4h_lt_-1_accel_lt_-0.5_range_ratio_gt_1.5 | FAIL | flush coverage 13.2% | false seg cap 8 | | |
| ret4h_lt_-1_accel_lt_-0.5_range_ratio_gt_1.25 | FAIL | flush coverage 13.2% | false seg cap 9 | | |
| ret4h_lt_-1_dist5d_lt_-1_range_ratio_gt_2 | FAIL | flush coverage 11.8% | false seg cap 4 | | |
| ret4h_lt_-1_accel_lt_-0.5_range_ratio_gt_2 | FAIL | flush coverage 10.4% | false seg cap 4 | | |
| ret4h_lt_-1_accel_lt_-1_range_ratio_gt_1.75 | FAIL | flush coverage 6.9% | false seg cap 5 | | |
| ret4h_lt_-1_accel_lt_-1_range_ratio_gt_1.25 | FAIL | flush coverage 6.9% | false seg cap 8 | | |
| ret4h_lt_-1_accel_lt_-1_range_ratio_gt_1.5 | FAIL | flush coverage 6.9% | false seg cap 8 | | |
| ret4h_lt_-1_accel_lt_-1_range_ratio_gt_1.1 | FAIL | flush coverage 6.9% | false seg cap 9 | | |
| ret4h_lt_-1_dist5d_lt_-3_range_ratio_gt_1.75 | FAIL | flush coverage 5.6% | false seg cap 4 | | |
| ret4h_lt_-1_dist5d_lt_-3_range_ratio_gt_1.5 | FAIL | flush coverage 5.6% | false seg cap 5 | | |

## Composite candidates

| squeeze | bearish | flush | component pass | global pass | flips/day | sub45 flickers |
| --- | --- | --- | --- | --- | ---: | ---: |
| dist5d_gt_0 | ret7d_lt_-1 | ret4h_lt_-1_dist5d_lt_-1_range_ratio_gt_1.75 | FAIL | FAIL | 4.22 | 53 |
| dist5d_gt_0 | ret7d_lt_-1 | ret4h_lt_-1_accel_lt_-0.5_range_ratio_gt_1.75 | FAIL | FAIL | 4.43 | 58 |
| dist5d_gt_0 | ret7d_lt_-1 | ret4h_lt_-1_dist5d_lt_-1_range_ratio_gt_1.5 | FAIL | FAIL | 4.77 | 60 |
| dist5d_gt_0 | dist5d_lt_-1 | ret4h_lt_-1_dist5d_lt_-1_range_ratio_gt_1.75 | FAIL | FAIL | 4.89 | 67 |
| dist5d_gt_0 | ret7d_lt_-1 | ret4h_lt_-1_dist5d_lt_-1_range_ratio_gt_1.25 | FAIL | FAIL | 5.02 | 61 |
| dist5d_gt_0 | dist5d_lt_-1 | ret4h_lt_-1_accel_lt_-0.5_range_ratio_gt_1.75 | FAIL | FAIL | 5.14 | 73 |
| dist5d_gt_0 | dist5d_lt_-1.5 | ret4h_lt_-1_dist5d_lt_-1_range_ratio_gt_1.75 | FAIL | FAIL | 5.35 | 72 |
| dist5d_gt_0 | ret7d_lt_-3 | ret4h_lt_-1_dist5d_lt_-1_range_ratio_gt_1.75 | FAIL | FAIL | 5.38 | 78 |
| ret4h_gt_1.25_or_dist5d_gt_0 | ret7d_lt_-1 | ret4h_lt_-1_dist5d_lt_-1_range_ratio_gt_1.75 | FAIL | FAIL | 5.44 | 73 |
| dist5d_gt_0 | dist5d_lt_-1 | ret4h_lt_-1_dist5d_lt_-1_range_ratio_gt_1.5 | FAIL | FAIL | 5.44 | 74 |
| dist5d_gt_0 | dist5d_lt_-1.5 | ret4h_lt_-1_accel_lt_-0.5_range_ratio_gt_1.75 | FAIL | FAIL | 5.60 | 77 |
| dist5d_gt_0 | ret7d_lt_-3 | ret4h_lt_-1_accel_lt_-0.5_range_ratio_gt_1.75 | FAIL | FAIL | 5.63 | 85 |
| ret4h_gt_1.25_or_dist5d_gt_0 | ret7d_lt_-1 | ret4h_lt_-1_accel_lt_-0.5_range_ratio_gt_1.75 | FAIL | FAIL | 5.66 | 78 |
| dist5d_gt_0 | dist5d_lt_-1 | ret4h_lt_-1_dist5d_lt_-1_range_ratio_gt_1.25 | FAIL | FAIL | 5.69 | 75 |
| dist5d_gt_0 | ret7d_lt_-1 | ret4h_lt_-1_accel_lt_-0.5_range_ratio_gt_1.1 | FAIL | FAIL | 5.75 | 82 |

## Preliminary read

- Passing individual thresholds are discovery candidates only; wide passing bands matter more than single thresholds.
- Composite global stability is expected to be difficult with raw threshold rules; if flip/flicker fails, add hysteresis/persistence before live shadow logging.
- FLUSH remains mechanism-based and low-n; do not promote to hard exclusion from this report alone.

