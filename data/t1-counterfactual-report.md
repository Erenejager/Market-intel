# T1 Opposite-Watch Counterfactual

Generated: 2026-06-04T15:35:30.767Z
Window: -∞ → +∞; post-expiry search max 7d

Definition: T1 event = `T1_FRESH_LONGS_LONG`. Current production watch = SHORT confirmations within first 120m. Counterfactual post-expiry = same-asset SHORT confirmations from T+120m to T+maxDays.

No-data interpretation: No tagged T1_FRESH_LONGS_LONG events were found in this alert-log window. This is an absence-of-data result, not evidence for or against T1 validity. T1 has not recurred in tagged form in the inspected log/window; do not use this report to validate or invalidate persistent T1 watch behavior.

## Summary

| bucket | n | 1h hit/avg | 4h hit/avg | 24h hit/avg | avg MFE4h | avg MAE4h |
| --- | --- | --- | --- | --- | --- | --- |
| within_120m | 0 | n/a / n/a | n/a / n/a | n/a / n/a | n/a | n/a |
| post_expiry | 0 | n/a / n/a | n/a / n/a | n/a / n/a | n/a | n/a |

## T1 events

| T1 time | asset | price | within 120m shorts | post-expiry shorts |
| --- | --- | --- | --- | --- |

## Post-expiry SHORT rows

| T1 time | short time | asset | hours after T1 | entry | +1h | +4h | +24h | MFE4h | MAE4h |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

