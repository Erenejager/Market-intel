# Post-FAILED Same-Direction Reentry Report

Generated: 2026-06-04T15:56:33.025Z
Window: 2026-05-25T00:00:00Z → +∞; reentry window 4h

Definition: after `ACTIVE_CONTEXT_FAILED`, find same asset and same context direction `LONG_CONFIRMED`/`SHORT_CONFIRMED` alerts inside the reentry window. Outcome is measured in the new alert direction.

## Summary

| bucket | n | 1h hit/avg | 4h hit/avg | 24h hit/avg |
| --- | --- | --- | --- | --- |
| all | 1 | 100.0% / 0.288% | 100.0% / 0.212% | 100.0% / 0.236% |
| ETH_LONG | 1 | 100.0% / 0.288% | 100.0% / 0.212% | 100.0% / 0.236% |

## Reentry rows

| failed time | asset | direction | reentry time | minutes after | entry | +1h | +4h | +24h | MFE4h | MAE4h |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-05-29T04:15:02.296Z | ETH | LONG | 2026-05-29T05:00:02.516Z | 45 | 2006.245 | 0.288% | 0.212% | 0.236% | 0.520% | -0.198% |

