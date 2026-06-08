# Phase 3A Regime/Path Diagnostic

Generated: 2026-05-21T13:04:15.369Z

## Methodology

This is a **diagnostic-only** historical report. It may inform a frozen future `readiness_shadow_v1` spec, but it is not validation of v1. Forward validation must use post-freeze v0/v1 divergence events only: minimum 20 divergence events and minimum 5 per major divergence type.

Pre-registered metrics only:
- BTC 4h return <= -1%
- BTC 4h return <= -2%
- BTC 24h return <= -2%
- BTC 24h return <= -4%
- BTC closed 4h down streak >= 2

UTC 4h candles are anchored at 00:00/04:00/08:00/12:00/16:00/20:00 and only fully closed candles before the alert are counted.

Caveats:
- Bucket n is reported; small buckets are low-confidence even if thresholds pass.
- Path ordering uses 15m close samples; intra-candle target/stop excursions are invisible and favorable-first can be overstated.

## Counts

```json
{
  "allowed_events": 15,
  "allowed_longs": 12,
  "allowed_sol_longs": 9,
  "allowed_winning_controls": 6,
  "allowed_long_winning_controls": 3,
  "blocked_short_50_67_may17_21": 14
}
```

## Gate-allowed LONG regime evaluation

| metric | bear n | non n | bear 1h/FF | non 1h/FF | bear 4h/edge | non 4h/edge | pass | mapping/treatment |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| BTC 4h return <= -1% | 1 | 11 | 0.0% avg -1.217% | 0.0% avg -0.325% | 0.0% avg -2.524% / MAE -3.049% | 27.3% avg -0.540% / MAE -0.996% | win_rate_separation, mae_risk_separation, eligible_any | score_penalty_candidate |
| BTC 4h return <= -2% | 0 | 12 | n/a avg n/a | 0.0% avg -0.400% | n/a avg n/a / MAE n/a | 25.0% avg -0.706% / MAE -1.167% | none | not_eligible |
| BTC 24h return <= -2% | 2 | 10 | 0.0% avg -0.168% | 0.0% avg -0.446% | 100.0% avg 0.068% / MAE -0.241% | 10.0% avg -0.860% / MAE -1.352% | none | not_eligible |
| BTC 24h return <= -4% | 0 | 12 | n/a avg n/a | 0.0% avg -0.400% | n/a avg n/a / MAE n/a | 25.0% avg -0.706% / MAE -1.167% | none | not_eligible |
| BTC closed 4h down streak >= 2 | 3 | 9 | 0.0% avg -0.517% | 0.0% avg -0.360% | 66.7% avg -0.796% / MAE -1.177% | 11.1% avg -0.675% / MAE -1.163% | none | not_eligible |


## Gate-allowed SOL LONG regime evaluation

| metric | bear n | non n | bear 1h/FF | non 1h/FF | bear 4h/edge | non 4h/edge | pass | mapping/treatment |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| BTC 4h return <= -1% | 1 | 8 | 0.0% avg -1.217% | 0.0% avg -0.376% | 0.0% avg -2.524% / MAE -3.049% | 12.5% avg -0.667% / MAE -1.244% | mae_risk_separation, eligible_any | risk_flag_or_tighter_expiry_only |
| BTC 4h return <= -2% | 0 | 9 | n/a avg n/a | 0.0% avg -0.469% | n/a avg n/a / MAE n/a | 11.1% avg -0.874% / MAE -1.445% | none | not_eligible |
| BTC 24h return <= -2% | 0 | 9 | n/a avg n/a | 0.0% avg -0.469% | n/a avg n/a / MAE n/a | 11.1% avg -0.874% / MAE -1.445% | none | not_eligible |
| BTC 24h return <= -4% | 0 | 9 | n/a avg n/a | 0.0% avg -0.469% | n/a avg n/a / MAE n/a | 11.1% avg -0.874% / MAE -1.445% | none | not_eligible |
| BTC closed 4h down streak >= 2 | 1 | 8 | 0.0% avg -1.217% | 0.0% avg -0.376% | 0.0% avg -2.524% / MAE -3.049% | 12.5% avg -0.667% / MAE -1.244% | mae_risk_separation, eligible_any | risk_flag_or_tighter_expiry_only |


## Blocked SHORT 50-67 path evaluation

Target +0.3% before stop -0.3% within 4h, using 15m close samples.

| metric | bear n | non n | bear 1h/FF | non 1h/FF | bear 4h/edge | non 4h/edge | pass | mapping/treatment |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| BTC 4h return <= -1% | 1 | 13 | 100.0% | 38.5% | edge 0.635pp / t 15m | edge -0.051pp / t 130m | favorable_first_separation, mfe_mae_edge, time_to_target | A_score_boost_candidate |
| BTC 4h return <= -2% | 0 | 14 | n/a | 42.9% | edge n/a / t n/am | edge 0.048pp / t 130m | none | C_monitor_only |
| BTC 24h return <= -2% | 0 | 14 | n/a | 42.9% | edge n/a / t n/am | edge 0.048pp / t 130m | none | C_monitor_only |
| BTC 24h return <= -4% | 0 | 14 | n/a | 42.9% | edge n/a / t n/am | edge 0.048pp / t 130m | none | C_monitor_only |
| BTC closed 4h down streak >= 2 | 2 | 12 | 0.0% | 50.0% | edge -0.443pp / t n/am | edge 0.130pp / t 130m | none | C_monitor_only |


## Row details — allowed contexts

| time | asset | dir | score | 1h | 4h | MFE4 | MAE4 | BTC 4h | BTC 24h | down4h streak |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2026-05-10T20:15:02.678Z | ETH | SHORT | 72 | 0.853% | 0.057% | 1.195% | -1.029% | -0.333% | 0.386% | 0 |
| 2026-05-11T18:30:02.228Z | ETH | SHORT | 77 | -0.028% | 0.030% | 0.271% | -0.028% | 1.455% | 0.778% | 0 |
| 2026-05-13T09:00:02.775Z | SOL | LONG | 82 | -0.215% | -2.319% | 0.152% | -2.716% | -0.060% | 0.416% | 1 |
| 2026-05-13T13:21:50.116Z | BTC | SHORT | 75 | 0.494% | 1.164% | 1.741% | 0.131% | -1.215% | -0.736% | 2 |
| 2026-05-13T13:21:50.116Z | SOL | LONG | 80 | -1.217% | -2.524% | -0.123% | -3.049% | -1.215% | -0.736% | 2 |
| 2026-05-14T12:45:02.293Z | SOL | LONG | 90 | -0.346% | 2.498% | 2.597% | -0.346% | -0.287% | -0.602% | 1 |
| 2026-05-14T16:15:02.483Z | SOL | LONG | 77 | -1.193% | -0.850% | 0.091% | -1.193% | 2.794% | 3.398% | 0 |
| 2026-05-14T18:15:02.118Z | SOL | LONG | 77 | -0.391% | -0.595% | 0.284% | -0.852% | 2.386% | 2.846% | 0 |
| 2026-05-15T00:45:02.311Z | BTC | LONG | 75 | -0.237% | -0.740% | 0.254% | -0.517% | 0.105% | 2.169% | 1 |
| 2026-05-16T11:45:03.072Z | ETH | LONG | 72 | -0.106% | 0.062% | 0.176% | -0.253% | -0.438% | -3.085% | 8 |
| 2026-05-16T12:42:14.641Z | BTC | LONG | 70 | -0.229% | 0.074% | 0.318% | -0.229% | -0.590% | -3.226% | 8 |
| 2026-05-16T20:17:02.852Z | SOL | LONG | 83 | -0.225% | -0.351% | 0.017% | -0.374% | 0.091% | -1.059% | 0 |
| 2026-05-18T12:15:02.324Z | SOL | LONG | 83 | -0.006% | -1.402% | 0.452% | -1.860% | 0.479% | -1.278% | 0 |
| 2026-05-19T07:20:07.937Z | SOL | LONG | 83 | -0.264% | -1.013% | 0.076% | -1.177% | 0.568% | 0.294% | 1 |
| 2026-05-19T08:00:01.860Z | SOL | LONG | 86 | -0.369% | -1.305% | -0.100% | -1.434% | 0.498% | 0.178% | 0 |

## Row details — blocked SHORT 50-67

| time | asset | score | 1h | 4h | MFE4 | MAE4 | path first | target min | stop min | BTC 4h | BTC 24h | down4h streak |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: | ---: | ---: |
| 2026-05-17T07:20:56.879Z | BTC | 55 | -0.035% | -0.369% | -0.022% | -0.607% | adverse | n/a | 174 | 0.122% | -0.306% | 2 |
| 2026-05-17T11:30:02.043Z | BTC | 50 | -0.145% | 0.461% | 0.441% | -0.145% | favorable | 165 | n/a | 0.283% | 0.320% | 0 |
| 2026-05-17T13:20:16.937Z | SOL | 51 | 0.052% | 0.226% | 0.295% | -0.261% | none | n/a | n/a | 0.135% | 0.437% | 0 |
| 2026-05-18T00:00:02.237Z | ETH | 64 | 0.753% | 0.412% | 0.984% | 0.349% | favorable | 15 | n/a | -1.197% | -0.934% | 1 |
| 2026-05-18T07:20:22.627Z | BTC | 55 | -0.235% | -0.048% | 0.081% | -0.339% | adverse | n/a | 40 | -0.089% | -1.633% | 2 |
| 2026-05-18T14:00:02.542Z | BTC | 62 | 0.834% | 0.638% | 1.043% | 0.291% | favorable | 30 | n/a | -0.020% | -1.659% | 0 |
| 2026-05-18T21:30:02.125Z | BTC | 65 | -0.022% | 0.196% | 0.361% | -0.211% | favorable | 240 | n/a | 0.535% | -1.695% | 0 |
| 2026-05-19T13:19:34.267Z | ETH | 64 | 0.236% | -0.332% | 0.344% | -0.457% | adverse | 130 | 40 | -0.267% | -0.943% | 1 |
| 2026-05-19T20:19:40.686Z | BTC | 50 | -0.093% | 0.338% | 0.454% | -0.133% | favorable | 130 | n/a | 0.608% | -0.180% | 0 |
| 2026-05-19T22:30:01.767Z | ETH | 67 | -0.601% | -0.440% | -0.050% | -0.601% | adverse | n/a | 45 | -0.171% | -0.658% | 0 |
| 2026-05-20T00:19:39.753Z | SOL | 56 | 0.113% | -0.137% | 0.113% | -0.447% | adverse | n/a | 55 | -0.479% | -0.735% | 0 |
| 2026-05-20T07:20:10.612Z | ETH | 64 | 0.033% | 0.132% | 0.112% | -0.259% | none | n/a | n/a | 0.921% | 0.162% | 1 |
| 2026-05-20T18:45:02.270Z | SOL | 52 | -0.285% | -0.111% | 0.181% | -0.448% | adverse | n/a | 90 | 0.126% | 0.830% | 0 |
| 2026-05-20T22:00:02.850Z | ETH | 62 | 0.272% | -0.535% | 0.397% | -0.797% | favorable | 15 | 165 | -0.096% | 0.669% | 0 |
