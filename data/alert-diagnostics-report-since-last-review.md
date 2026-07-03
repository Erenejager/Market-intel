# Alert Diagnostics Report

Generated: 2026-05-29T11:07:44.667Z
Since: 2026-05-28T13:11:00.000Z

## 1. Trade opportunity alerts
Measured from LONG_CONFIRMED / SHORT_CONFIRMED in the alert direction. This is the entry/opportunity scorecard only.
- Overall: n=14 | 1h 50.0% avg -0.024% n=14 | 4h 36.4% avg -0.178% n=11
- 4h path favorable-anytime 85.7% n=14 | avg MFE 0.304% | avg MAE -0.438% | median first favorable 15m | median max favorable 75m

### By type
- LONG_CONFIRMED: n=11 | 1h 45.5% avg -0.012% n=11 | 4h 50.0% avg 0.039% n=8
- SHORT_CONFIRMED: n=3 | 1h 66.7% avg -0.070% n=3 | 4h 0.0% avg -0.756% n=3

### By diagnostics bucket
- context_created:shadow_confirmed: n=5 | 1h 40.0% avg -0.062% n=5 | 4h 33.3% avg 0.029% n=3
- delivered_no_context_marker: n=3 | 1h 66.7% avg 0.101% n=3 | 4h 66.7% avg 0.084% n=3
- watch_only:FADE_SHORT_POSITIVE_FUNDING: n=3 | 1h 66.7% avg -0.070% n=3 | 4h 0.0% avg -0.756% n=3
- suppressed:btc_weak_veto_alt_longs: n=2 | 1h 50.0% avg 0.123% n=2 | 4h 50.0% avg -0.014% n=2
- watch_only:SOL_LONG_WATCH_ONLY: n=1 | 1h 0.0% avg -0.370% n=1 | 4h n/a avg n/a n=0

### Trade rows — 4h path detail
- 2026-05-28T13:15:02.583Z BTC SHORT_CONFIRMED SHORT | 4h close -0.100% | favorable anytime? yes | first favorable 2026-05-28T13:30:01.826Z | MFE 0.762% @ 2026-05-28T13:45:01.311Z | MAE -0.222% | bucket watch_only:FADE_SHORT_POSITIVE_FUNDING
- 2026-05-28T16:15:02.477Z ETH SHORT_CONFIRMED SHORT | 4h close -1.230% | favorable anytime? no | first favorable n/a | MFE -0.146% @ 2026-05-28T16:30:01.795Z | MAE -1.504% | bucket watch_only:FADE_SHORT_POSITIVE_FUNDING
- 2026-05-28T18:00:02.483Z BTC LONG_CONFIRMED LONG | 4h close 0.226% | favorable anytime? yes | first favorable 2026-05-28T18:15:01.731Z | MFE 0.499% @ 2026-05-28T21:45:02.172Z | MAE -0.196% | bucket delivered_no_context_marker
- 2026-05-28T18:15:02.446Z SOL LONG_CONFIRMED LONG | 4h close -0.756% | favorable anytime? yes | first favorable 2026-05-28T18:45:01.555Z | MFE 0.175% @ 2026-05-28T19:00:01.381Z | MAE -0.780% | bucket suppressed:btc_weak_veto_alt_longs
- 2026-05-28T23:45:02.275Z BTC LONG_CONFIRMED LONG | 4h close -0.424% | favorable anytime? yes | first favorable 2026-05-29T00:00:01.252Z | MFE 0.273% @ 2026-05-29T00:45:01.328Z | MAE -0.521% | bucket delivered_no_context_marker
- 2026-05-29T01:15:02.781Z ETH LONG_CONFIRMED LONG | 4h close -0.091% | favorable anytime? no | first favorable n/a | MFE -0.066% @ 2026-05-29T05:15:01.638Z | MAE -0.771% | bucket context_created:shadow_confirmed
- 2026-05-29T03:00:02.053Z SOL SHORT_CONFIRMED SHORT | 4h close -0.938% | favorable anytime? yes | first favorable 2026-05-29T04:00:01.318Z | MFE 0.215% @ 2026-05-29T04:15:01.503Z | MAE -0.803% | bucket watch_only:FADE_SHORT_POSITIVE_FUNDING
- 2026-05-29T05:00:02.516Z BTC LONG_CONFIRMED LONG | 4h close 0.451% | favorable anytime? yes | first favorable 2026-05-29T05:15:01.638Z | MFE 0.430% @ 2026-05-29T07:15:01.592Z | MAE -0.131% | bucket delivered_no_context_marker
- 2026-05-29T05:00:02.516Z ETH LONG_CONFIRMED LONG | 4h close 0.212% | favorable anytime? yes | first favorable 2026-05-29T05:15:01.638Z | MFE 0.520% @ 2026-05-29T07:15:01.592Z | MAE -0.198% | bucket context_created:shadow_confirmed
- 2026-05-29T05:45:02.268Z SOL LONG_CONFIRMED LONG | 4h close 0.728% | favorable anytime? yes | first favorable 2026-05-29T06:00:01.279Z | MFE 0.838% @ 2026-05-29T09:30:01.423Z | MAE 0.092% | bucket suppressed:btc_weak_veto_alt_longs
- 2026-05-29T06:45:03.087Z BTC LONG_CONFIRMED LONG | 4h close -0.033% | favorable anytime? yes | first favorable 2026-05-29T07:00:01.923Z | MFE 0.251% @ 2026-05-29T09:30:01.423Z | MAE -0.401% | bucket context_created:shadow_confirmed
- 2026-05-29T08:15:02.354Z ETH LONG_CONFIRMED LONG | 4h close n/a | favorable anytime? yes | first favorable 2026-05-29T08:30:02.184Z | MFE 0.388% @ 2026-05-29T09:30:01.423Z | MAE -0.087% | bucket context_created:shadow_confirmed
- 2026-05-29T08:45:02.509Z BTC LONG_CONFIRMED LONG | 4h close n/a | favorable anytime? yes | first favorable 2026-05-29T09:15:02.121Z | MFE 0.105% @ 2026-05-29T09:30:01.423Z | MAE -0.235% | bucket context_created:shadow_confirmed
- 2026-05-29T09:45:02.154Z SOL LONG_CONFIRMED LONG | 4h close n/a | favorable anytime? yes | first favorable 2026-05-29T10:00:01.481Z | MFE 0.018% @ 2026-05-29T10:00:01.481Z | MAE -0.370% | bucket watch_only:SOL_LONG_WATCH_ONLY

## 2. Active context lifecycle
Measured from active-context activation in context direction. This separates context creation quality from later tracking alerts.
- Overall: n=5 | 1h 40.0% avg -0.062% n=5 | 4h 33.3% avg 0.029% n=3
- 4h path favorable-anytime 80.0% n=5 | avg MFE 0.239% | avg MAE -0.339% | median first favorable 15m | median max favorable 135m

### By final health
- HEALTHY: n=4 | 1h 50.0% avg 0.077% n=4 | 4h 50.0% avg 0.089% n=2
- FAILED: n=1 | 1h 0.0% avg -0.618% n=1 | 4h 0.0% avg -0.091% n=1

### Active context rows — 4h path detail
- 2026-05-29T01:15:02.781Z ETH LONG_CONFIRMED LONG | 4h close -0.091% | favorable anytime? no | first favorable n/a | MFE -0.066% @ 2026-05-29T05:15:01.638Z | MAE -0.771% | bucket FAILED
- 2026-05-29T05:00:02.516Z ETH LONG_CONFIRMED LONG | 4h close 0.212% | favorable anytime? yes | first favorable 2026-05-29T05:15:01.638Z | MFE 0.520% @ 2026-05-29T07:15:01.592Z | MAE -0.198% | bucket HEALTHY
- 2026-05-29T06:45:03.087Z BTC LONG_CONFIRMED LONG | 4h close -0.033% | favorable anytime? yes | first favorable 2026-05-29T07:00:01.923Z | MFE 0.251% @ 2026-05-29T09:30:01.423Z | MAE -0.401% | bucket HEALTHY
- 2026-05-29T08:45:02.509Z BTC LONG_CONFIRMED LONG | 4h close n/a | favorable anytime? yes | first favorable 2026-05-29T09:15:02.121Z | MFE 0.105% @ 2026-05-29T09:30:01.423Z | MAE -0.235% | bucket HEALTHY
- 2026-05-29T08:15:02.354Z ETH LONG_CONFIRMED LONG | 4h close n/a | favorable anytime? yes | first favorable 2026-05-29T08:30:02.184Z | MFE 0.388% @ 2026-05-29T09:30:01.423Z | MAE -0.087% | bucket HEALTHY

## 3. Tracking / health alerts
Measured from ACTIVE_CONTEXT_* event time. Original = existing context direction; opposite = inverse direction.
- Original direction overall: n=5 | 1h 60.0% avg 0.158% n=5 | 4h 100.0% avg 0.471% n=3
- Opposite direction overall: n=5 | 1h 40.0% avg -0.158% n=5 | 4h 0.0% avg -0.471% n=3
- Original 4h path favorable-anytime 100.0% n=5 | avg MFE 0.521% | avg MAE -0.102% | median first favorable 15m | median max favorable 180m
- Opposite 4h path favorable-anytime 60.0% n=5 | avg MFE 0.102% | avg MAE -0.521% | median first favorable 30m | median max favorable 30m

### Original direction by tracking type
- ACTIVE_CONTEXT_BTC_WEAK: n=2 | 1h 0.0% avg -0.089% n=2 | 4h 100.0% avg 0.283% n=1
- ACTIVE_CONTEXT_STRESSED: n=2 | 1h 100.0% avg 0.211% n=2 | 4h 100.0% avg 0.646% n=1
- ACTIVE_CONTEXT_FAILED: n=1 | 1h 100.0% avg 0.546% n=1 | 4h 100.0% avg 0.483% n=1

### Opposite direction by tracking type
- ACTIVE_CONTEXT_BTC_WEAK: n=2 | 1h 100.0% avg 0.089% n=2 | 4h 0.0% avg -0.283% n=1
- ACTIVE_CONTEXT_STRESSED: n=2 | 1h 0.0% avg -0.211% n=2 | 4h 0.0% avg -0.646% n=1
- ACTIVE_CONTEXT_FAILED: n=1 | 1h 0.0% avg -0.546% n=1 | 4h 0.0% avg -0.483% n=1

### Tracking rows — 4h path detail
- 2026-05-29T02:00:02.330Z ETH ACTIVE_CONTEXT_BTC_WEAK original LONG: 4h close 0.283% | favorable anytime? yes | first favorable 2026-05-29T02:15:01.580Z | MFE 0.219% @ 2026-05-29T06:00:01.279Z || opposite SHORT: 4h close -0.283% | favorable anytime? yes | first favorable 2026-05-29T02:30:01.614Z | MFE 0.533% @ 2026-05-29T03:00:01.594Z
- 2026-05-29T02:30:02.320Z ETH ACTIVE_CONTEXT_STRESSED original LONG: 4h close 0.646% | favorable anytime? yes | first favorable 2026-05-29T03:15:01.470Z | MFE 0.698% @ 2026-05-29T06:30:01.657Z || opposite SHORT: 4h close -0.646% | favorable anytime? yes | first favorable 2026-05-29T02:45:02.007Z | MFE 0.176% @ 2026-05-29T03:00:01.594Z
- 2026-05-29T04:15:02.296Z ETH ACTIVE_CONTEXT_FAILED original LONG: 4h close 0.483% | favorable anytime? yes | first favorable 2026-05-29T04:30:01.862Z | MFE 0.913% @ 2026-05-29T07:15:01.592Z || opposite SHORT: 4h close -0.483% | favorable anytime? no | first favorable n/a | MFE -0.179% @ 2026-05-29T04:30:01.862Z
- 2026-05-29T07:45:02.100Z BTC ACTIVE_CONTEXT_STRESSED original LONG: 4h close n/a | favorable anytime? yes | first favorable 2026-05-29T08:00:01.386Z | MFE 0.651% @ 2026-05-29T09:30:01.423Z || opposite SHORT: 4h close n/a | favorable anytime? no | first favorable n/a | MFE -0.120% @ 2026-05-29T08:00:01.386Z
- 2026-05-29T09:15:02.890Z ETH ACTIVE_CONTEXT_BTC_WEAK original LONG: 4h close n/a | favorable anytime? yes | first favorable 2026-05-29T09:30:01.423Z | MFE 0.124% @ 2026-05-29T09:30:01.423Z || opposite SHORT: 4h close n/a | favorable anytime? yes | first favorable 2026-05-29T09:45:01.653Z | MFE 0.101% @ 2026-05-29T10:45:02.175Z

## Interpretation guide
- Trade opportunity win-rate answers: “Was the entry alert direction right?”
- Active context lifecycle answers: “Did contexts created by trade alerts remain profitable after activation?”
- Tracking/health win-rate answers: “When health changed, was it useful as hold/exit/opposite information?”
- Do not mix these three into one win-rate; they have different jobs.
