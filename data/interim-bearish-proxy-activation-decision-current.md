# Interim Bearish Proxy Activation Decision

Generated: 2026-06-16T17:49:13.789Z

Decision: **DO NOT WIRE — keep observation/logging only**

## Check verdicts

| Check | Verdict | Reason |
|---|---|---|
| check0_stat_provenance | PASS | May25-current broad BTC SHORT rows decompose cleanly to direct-join BTC SHORT + FRESH_SHORTS; the older all-window high-winrate row remains broad, but the downtrend-window provenance is not an OI composition artifact. |
| check1_timeline_accuracy | PASS | Proxy=true should be more common in May25-current than May9-21 mixed and nearly absent in May10 squeeze. |
| check2_alert_row_behavior | FAIL | Proxy split must add meaningful discrimination, not merely select a subset inside an already strong high-base-rate BTC SHORT + FRESH_SHORTS window. |
| check3_stability_persistence | FAIL | Proxy must have non-flickery true-runs; wiring would require >=3 consecutive 15m true samples. |
| check4_activation_scope | PASS | Scope predeclared as BTC SHORT WATCH_REGIME_SPECIFIC_24H_CONTINUATION only. |
| check5_continuous_logging | PASS | Logging fields specified but not wired unless activation passes. |

## Check 0 — BTC SHORT stat provenance

- The quoted high-winrate row is broad `BTC|SHORT_CONFIRMED`, not OI-bucket evidence. In `high-winrate-alert-configs.md` it is `n=41`, 4h `51.2%`, 24h `69.2%`.
- May25-current broad BTC SHORT confirmed rows: n=14, 4h 69.2% avg +0.521%, 24h 100.0% avg +3.038%.
- May25-current OI composition via direct ±16m readiness-shadow join:
  - FRESH_SHORTS: n=14, 4h 69.2% avg +0.521%, 24h 100.0% avg +3.038%

Interpretation: May25-current broad BTC SHORT does decompose cleanly to direct-join BTC SHORT + FRESH_SHORTS. That supports the bucket provenance for the downtrend window, but does not by itself validate the proxy as a gate.

## Proxy timeline/stability

| Window | Samples | proxy=true | true rate | transitions | true-run median/max |
|---|---:|---:|---:|---:|---:|
| may09_may21_mixed | 1200 | 70 | 5.8% | 54 | 15m / 135m |
| may10_squeeze | 100 | 0 | 0.0% | 0 | —m / —m |
| may13_crash | 100 | 17 | 17.0% | 8 | 90m / 105m |
| may17_18_grind | 200 | 7 | 3.5% | 8 | 15m / 30m |
| may25_current_downtrend | 2182 | 454 | 20.8% | 192 | 15m / 1185m |

Overall transitions: 264; true-run buckets: {"<45m":93,"45m-2h":24,"2h-6h":12,">6h":3}.

## BTC SHORT alert-row proxy split — May25-current

- proxy_false: n=10, 4h 66.7% avg +0.253%, 24h 100.0% avg +2.827%
- proxy_true: n=4, 4h 75.0% avg +1.125%, 24h 100.0% avg +3.669%

## Final decision

Do **not** wire the soft gate yet. Keep the proxy in observation/logging mode. Bucket provenance for May25-current BTC SHORT + FRESH_SHORTS passes, but the proxy is too flickery and does not add enough discrimination because proxy=false BTC SHORT rows were also very strong. Revisit only after a less flickery persistence/regime proxy is evaluated on future data.
