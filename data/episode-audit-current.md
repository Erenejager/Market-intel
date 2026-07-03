# Episode Audit — Current

Generated: 2026-07-03T15:11:53.282Z

Window: last 7d since 2026-06-26T15:11:53.282Z

## Headline

- Active episodes: **0**
- Closed episodes in window: **18** / total stored **18**
- Target hit: **13** (72.2%)
- Failed: **3** (16.7%)
- Invalidated: **3** (16.7%)
- MFE > |MAE|: **12** (66.7%)
- Adverse-first where order known: **6/11** (54.5%)
- Avg MFE / MAE: **+0.944% / -0.457%**

- Direction mismatches detected: **9** (50.0%) — these historical episode extrema were tracked on the source direction, not intended inverse trade direction, so treat all headline MFE/MAE metrics as contaminated until enough post-fix episodes accrue.

## Clean-direction subset

Episodes without detected source/intended direction mismatch: **9**

- Target hit: **5** (55.6%)
- Failed: **3** (33.3%)
- MFE > |MAE|: **5** (55.6%)
- Avg MFE / MAE: **+0.781% / -0.677%**

## Closed episode status counts

| Status | Count |
| --- | --- |
| EXPIRED_AFTER_MFE_HIT | 12 |
| FAILED | 3 |
| INVALIDATED | 3 |

## Closed episodes by asset/direction

| Asset:Direction | Count |
| --- | --- |
| ETH:SHORT | 8 |
| BTC:SHORT | 7 |
| SOL:LONG | 3 |

## Closed episodes by pattern family

| Pattern | Count |
| --- | --- |
| BTC_LONG_SETUP_INVERSE_SHORT_POSTFIX | 7 |
| ETH_BTC_PERMITS_ALT_LONG_INVERSE_SHORT_POSTFIX | 4 |
| SOL_SHORT_BLOCKED_SPOT_LED_INVERSE_LONG_POSTFIX | 3 |
| ETH_LONG_BLOCKED_SELL_PRESSURE_INVERSE_SHORT_POSTFIX | 2 |
| ETH_LONG_SETUP_STRUCTURAL_BUYING_INVERSE_SHORT | 2 |

## Suppression reasons in alert log window

| Reason | Count |
| --- | --- |
| oi_price_regime_pre_fix_data_quarantined | 284 |
| trade_quality_max_win_rate_1_to_6_not_above_70 | 63 |
| telegram_pattern_gate_disabled | 26 |
| btc_weak_veto_alt_longs | 10 |
| active_episode_open_same_asset_direction | 10 |

## Telegram candidate concentration in alert log window

| Bucket / pattern | Count |
| --- | --- |
| FADE_SHORT_LATE_AFTER_LOW | 150 |
| SOL_LONG_WATCH_ONLY | 46 |
| ETH_LONG_BLOCKED_SELL_PRESSURE_INVERSE_SHORT_POSTFIX | 33 |
| ETH_LONG_SETUP_STRUCTURAL_BUYING_INVERSE_SHORT | 30 |
| T1_FRESH_LONGS_LONG | 28 |
| ETH_BTC_PERMITS_ALT_LONG_INVERSE_SHORT_POSTFIX | 28 |
| BTC_LONG_SETUP_INVERSE_SHORT_POSTFIX | 27 |
| SOL_SHORT_BLOCKED_SPOT_LED_INVERSE_LONG_POSTFIX | 24 |
| ETH_LONG_SHADOW_NO_SETUP_INVERSE_SHORT | 19 |
| BTC_LONG_SETUP_SPOT_LED_ACCUMULATION | 14 |
| SHORTS_COVERING_LONG_BEARISH | 14 |
| ETH_LONG_SHADOW_BLOCKED_INVERSE_SHORT | 13 |
| FADE_SHORT_POSITIVE_FUNDING | 12 |
| NEUTRAL_OI_LONG | 10 |
| FRESH_LONGS_LONG_UNVALIDATED | 9 |

## Bucket cap state

| Bucket | Deliveries in window | Cap | Source | Updated |
| --- | --- | --- | --- | --- |
| SOL_INVERSE_LONG_OPPORTUNITY | 1 | 2 |  | 2026-07-01T07:30:20.885Z |
| ETH_INVERSE_SHORT_OPPORTUNITY | 1 | 2 | telegram_pattern_gate | 2026-07-01T17:15:20.948Z |
| PATTERN:BTC_LONG_SETUP_INVERSE_SHORT_POSTFIX | 1 | 2 | telegram_pattern_gate | 2026-07-03T03:00:21.746Z |

## Recent closed episodes

| Opened | Asset | Dir | Pattern | Status | MFE | MAE | Close reason |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-07-03T03:00:10.753Z | BTC | LONG | BTC_LONG_SETUP_INVERSE_SHORT_POSTFIX | EXPIRED_AFTER_MFE_HIT | +0.681% | -0.146% | DIR_MISMATCH: episode_horizon_expired_6h |
| 2026-07-02T16:45:11.672Z | BTC | LONG | BTC_LONG_SETUP_INVERSE_SHORT_POSTFIX | EXPIRED_AFTER_MFE_HIT | +0.669% | -0.100% | DIR_MISMATCH: episode_horizon_expired_6h |
| 2026-07-02T08:15:10.809Z | BTC | LONG | BTC_LONG_SETUP_INVERSE_SHORT_POSTFIX | EXPIRED_AFTER_MFE_HIT | +2.901% | +0.000% | DIR_MISMATCH: episode_horizon_expired_6h |
| 2026-07-02T01:00:09.725Z | BTC | LONG | BTC_LONG_SETUP_INVERSE_SHORT_POSTFIX | EXPIRED_AFTER_MFE_HIT | +2.198% | +0.000% | DIR_MISMATCH: episode_horizon_expired_6h |
| 2026-07-01T17:15:09.922Z | BTC | LONG | BTC_LONG_SETUP_INVERSE_SHORT_POSTFIX | EXPIRED_AFTER_MFE_HIT | +1.508% | +0.000% | DIR_MISMATCH: episode_horizon_expired_6h |
| 2026-07-01T17:15:09.922Z | ETH | SHORT | ETH_BTC_PERMITS_ALT_LONG_INVERSE_SHORT_POSTFIX | FAILED | +0.000% | -0.563% | mae_threshold_no_30pct_recovery_after_30m |
| 2026-07-01T10:30:10.582Z | ETH | SHORT | ETH_BTC_PERMITS_ALT_LONG_INVERSE_SHORT_POSTFIX | EXPIRED_AFTER_MFE_HIT | +0.499% | -3.098% | episode_horizon_expired_6h |
| 2026-07-01T07:30:11.249Z | SOL | LONG | SOL_SHORT_BLOCKED_SPOT_LED_INVERSE_LONG_POSTFIX | EXPIRED_AFTER_MFE_HIT | +1.365% | +0.000% | episode_horizon_expired_6h |
| 2026-07-01T06:30:10.373Z | BTC | LONG | BTC_LONG_SETUP_INVERSE_SHORT_POSTFIX | EXPIRED_AFTER_MFE_HIT | +0.309% | -0.625% | DIR_MISMATCH: episode_horizon_expired_6h |
| 2026-07-01T04:00:11.680Z | ETH | SHORT | ETH_BTC_PERMITS_ALT_LONG_INVERSE_SHORT_POSTFIX | EXPIRED_AFTER_MFE_HIT | +1.389% | -0.300% | episode_horizon_expired_6h |
| 2026-07-01T00:00:15.581Z | SOL | LONG | SOL_SHORT_BLOCKED_SPOT_LED_INVERSE_LONG_POSTFIX | EXPIRED_AFTER_MFE_HIT | +2.623% | -0.870% | episode_horizon_expired_6h |
| 2026-06-30T21:45:12.703Z | BTC | LONG | BTC_LONG_SETUP_INVERSE_SHORT_POSTFIX | EXPIRED_AFTER_MFE_HIT | +0.962% | -0.453% | DIR_MISMATCH: episode_horizon_expired_6h |

## Notes

- This report audits the lifecycle book in `data/phase1d-alert-state.json` plus alert-log suppressions in `data/phase1d-alerts.jsonl`.
- `MFE > |MAE|` is computed from stored episode extrema, not fixed-horizon close.
- Adverse-first requires both `mae_at` and `mfe_at` to be present.
- Direction mismatch means the stored episode direction differs from the inverse direction implied by the pattern key. Those episode MFE/MAE values are not reliable for trade-direction evaluation.
