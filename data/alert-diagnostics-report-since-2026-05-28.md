# Alert Diagnostics Report

Generated: 2026-05-29T11:07:44.445Z
Since: 2026-05-28T00:00:00.000Z

## 1. Trade opportunity alerts
Measured from LONG_CONFIRMED / SHORT_CONFIRMED in the alert direction. This is the entry/opportunity scorecard only.
- Overall: n=19 | 1h 36.8% avg -0.064% n=19 | 4h 31.3% avg -0.275% n=16
- 4h path favorable-anytime 89.5% n=19 | avg MFE 0.276% | avg MAE -0.518% | median first favorable 15m | median max favorable 120m

### By type
- LONG_CONFIRMED: n=16 | 1h 31.3% avg -0.063% n=16 | 4h 38.5% avg -0.164% n=13
- SHORT_CONFIRMED: n=3 | 1h 66.7% avg -0.070% n=3 | 4h 0.0% avg -0.756% n=3

### By diagnostics bucket
- context_created:shadow_confirmed: n=10 | 1h 20.0% avg -0.118% n=10 | 4h 25.0% avg -0.295% n=8
- delivered_no_context_marker: n=3 | 1h 66.7% avg 0.101% n=3 | 4h 66.7% avg 0.084% n=3
- watch_only:FADE_SHORT_POSITIVE_FUNDING: n=3 | 1h 66.7% avg -0.070% n=3 | 4h 0.0% avg -0.756% n=3
- suppressed:btc_weak_veto_alt_longs: n=2 | 1h 50.0% avg 0.123% n=2 | 4h 50.0% avg -0.014% n=2
- watch_only:SOL_LONG_WATCH_ONLY: n=1 | 1h 0.0% avg -0.370% n=1 | 4h n/a avg n/a n=0

### Trade rows — 4h path detail
- 2026-05-28T00:45:02.569Z BTC LONG_CONFIRMED LONG | 4h close -1.862% | favorable anytime? yes | first favorable 2026-05-28T01:00:02.156Z | MFE 0.009% @ 2026-05-28T01:00:02.156Z | MAE -2.069% | bucket context_created:shadow_confirmed
- 2026-05-28T05:00:02.068Z ETH LONG_CONFIRMED LONG | 4h close 0.279% | favorable anytime? yes | first favorable 2026-05-28T07:00:02.084Z | MFE 0.665% @ 2026-05-28T07:45:01.350Z | MAE -0.391% | bucket context_created:shadow_confirmed
- 2026-05-28T07:45:02.089Z ETH LONG_CONFIRMED LONG | 4h close -0.243% | favorable anytime? yes | first favorable 2026-05-28T10:15:02.229Z | MFE 0.069% @ 2026-05-28T10:15:02.229Z | MAE -0.456% | bucket context_created:shadow_confirmed
- 2026-05-28T08:15:01.943Z BTC LONG_CONFIRMED LONG | 4h close -0.084% | favorable anytime? yes | first favorable 2026-05-28T09:45:02.238Z | MFE 0.173% @ 2026-05-28T10:15:02.229Z | MAE -0.255% | bucket context_created:shadow_confirmed
- 2026-05-28T08:15:01.943Z SOL LONG_CONFIRMED LONG | 4h close -0.537% | favorable anytime? yes | first favorable 2026-05-28T10:00:01.309Z | MFE 0.068% @ 2026-05-28T10:15:02.229Z | MAE -0.549% | bucket context_created:shadow_confirmed
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
- Overall: n=10 | 1h 20.0% avg -0.118% n=10 | 4h 25.0% avg -0.295% n=8
- 4h path favorable-anytime 90.0% n=10 | avg MFE 0.218% | avg MAE -0.541% | median first favorable 30m | median max favorable 127.5m

### By final health
- HEALTHY: n=8 | 1h 25.0% avg -0.030% n=8 | 4h 33.3% avg -0.068% n=6
- FAILED: n=2 | 1h 0.0% avg -0.469% n=2 | 4h 0.0% avg -0.977% n=2

### Active context rows — 4h path detail
- 2026-05-28T05:00:02.068Z ETH LONG_CONFIRMED LONG | 4h close 0.279% | favorable anytime? yes | first favorable 2026-05-28T07:00:02.084Z | MFE 0.665% @ 2026-05-28T07:45:01.350Z | MAE -0.391% | bucket HEALTHY
- 2026-05-28T00:45:02.569Z BTC LONG_CONFIRMED LONG | 4h close -1.862% | favorable anytime? yes | first favorable 2026-05-28T01:00:02.156Z | MFE 0.009% @ 2026-05-28T01:00:02.156Z | MAE -2.069% | bucket FAILED
- 2026-05-28T08:15:01.943Z SOL LONG_CONFIRMED LONG | 4h close -0.537% | favorable anytime? yes | first favorable 2026-05-28T10:00:01.309Z | MFE 0.068% @ 2026-05-28T10:15:02.229Z | MAE -0.549% | bucket HEALTHY
- 2026-05-28T07:45:02.089Z ETH LONG_CONFIRMED LONG | 4h close -0.243% | favorable anytime? yes | first favorable 2026-05-28T10:15:02.229Z | MFE 0.069% @ 2026-05-28T10:15:02.229Z | MAE -0.456% | bucket HEALTHY
- 2026-05-28T08:15:01.943Z BTC LONG_CONFIRMED LONG | 4h close -0.084% | favorable anytime? yes | first favorable 2026-05-28T09:45:02.238Z | MFE 0.173% @ 2026-05-28T10:15:02.229Z | MAE -0.255% | bucket HEALTHY
- 2026-05-29T01:15:02.781Z ETH LONG_CONFIRMED LONG | 4h close -0.091% | favorable anytime? no | first favorable n/a | MFE -0.066% @ 2026-05-29T05:15:01.638Z | MAE -0.771% | bucket FAILED
- 2026-05-29T05:00:02.516Z ETH LONG_CONFIRMED LONG | 4h close 0.212% | favorable anytime? yes | first favorable 2026-05-29T05:15:01.638Z | MFE 0.520% @ 2026-05-29T07:15:01.592Z | MAE -0.198% | bucket HEALTHY
- 2026-05-29T06:45:03.087Z BTC LONG_CONFIRMED LONG | 4h close -0.033% | favorable anytime? yes | first favorable 2026-05-29T07:00:01.923Z | MFE 0.251% @ 2026-05-29T09:30:01.423Z | MAE -0.401% | bucket HEALTHY
- 2026-05-29T08:45:02.509Z BTC LONG_CONFIRMED LONG | 4h close n/a | favorable anytime? yes | first favorable 2026-05-29T09:15:02.121Z | MFE 0.105% @ 2026-05-29T09:30:01.423Z | MAE -0.235% | bucket HEALTHY
- 2026-05-29T08:15:02.354Z ETH LONG_CONFIRMED LONG | 4h close n/a | favorable anytime? yes | first favorable 2026-05-29T08:30:02.184Z | MFE 0.388% @ 2026-05-29T09:30:01.423Z | MAE -0.087% | bucket HEALTHY

## 3. Tracking / health alerts
Measured from ACTIVE_CONTEXT_* event time. Original = existing context direction; opposite = inverse direction.
- Original direction overall: n=11 | 1h 45.5% avg -0.051% n=11 | 4h 55.6% avg -0.232% n=9
- Opposite direction overall: n=11 | 1h 54.5% avg 0.051% n=11 | 4h 44.4% avg 0.232% n=9
- Original 4h path favorable-anytime 90.9% n=11 | avg MFE 0.399% | avg MAE -0.458% | median first favorable 15m | median max favorable 105m
- Opposite 4h path favorable-anytime 81.8% n=11 | avg MFE 0.458% | avg MAE -0.399% | median first favorable 30m | median max favorable 90m

### Original direction by tracking type
- ACTIVE_CONTEXT_BTC_WEAK: n=5 | 1h 20.0% avg -0.039% n=5 | 4h 50.0% avg -0.087% n=4
- ACTIVE_CONTEXT_STRESSED: n=4 | 1h 75.0% avg 0.175% n=4 | 4h 66.7% avg -0.261% n=3
- ACTIVE_CONTEXT_FAILED: n=2 | 1h 50.0% avg -0.530% n=2 | 4h 50.0% avg -0.479% n=2

### Opposite direction by tracking type
- ACTIVE_CONTEXT_BTC_WEAK: n=5 | 1h 80.0% avg 0.039% n=5 | 4h 50.0% avg 0.087% n=4
- ACTIVE_CONTEXT_STRESSED: n=4 | 1h 25.0% avg -0.175% n=4 | 4h 33.3% avg 0.261% n=3
- ACTIVE_CONTEXT_FAILED: n=2 | 1h 50.0% avg 0.530% n=2 | 4h 50.0% avg 0.479% n=2

### Tracking rows — 4h path detail
- 2026-05-28T01:30:02.818Z BTC ACTIVE_CONTEXT_STRESSED original LONG: 4h close -1.667% | favorable anytime? yes | first favorable 2026-05-28T01:45:01.476Z | MFE 0.110% @ 2026-05-28T02:15:01.382Z || opposite SHORT: 4h close 1.667% | favorable anytime? yes | first favorable 2026-05-28T02:30:01.308Z | MFE 1.750% @ 2026-05-28T05:30:01.269Z
- 2026-05-28T03:00:02.248Z BTC ACTIVE_CONTEXT_FAILED original LONG: 4h close -1.441% | favorable anytime? no | first favorable n/a | MFE -0.117% @ 2026-05-28T03:15:01.339Z || opposite SHORT: 4h close 1.441% | favorable anytime? yes | first favorable 2026-05-28T03:15:01.339Z | MFE 1.878% @ 2026-05-28T06:45:01.557Z
- 2026-05-28T05:30:02.017Z ETH ACTIVE_CONTEXT_BTC_WEAK original LONG: 4h close 0.895% | favorable anytime? yes | first favorable 2026-05-28T05:45:02.174Z | MFE 0.998% @ 2026-05-28T07:45:01.350Z || opposite SHORT: 4h close -0.895% | favorable anytime? yes | first favorable 2026-05-28T06:45:01.557Z | MFE 0.062% @ 2026-05-28T06:45:01.557Z
- 2026-05-28T08:30:02.895Z ETH ACTIVE_CONTEXT_STRESSED original LONG: 4h close 0.239% | favorable anytime? yes | first favorable 2026-05-28T08:45:02.128Z | MFE 0.453% @ 2026-05-28T10:15:02.229Z || opposite SHORT: 4h close -0.239% | favorable anytime? yes | first favorable 2026-05-28T12:15:01.518Z | MFE 0.056% @ 2026-05-28T12:30:01.865Z
- 2026-05-28T09:30:02.134Z ETH ACTIVE_CONTEXT_BTC_WEAK original LONG: 4h close -0.768% | favorable anytime? yes | first favorable 2026-05-28T09:45:02.238Z | MFE 0.238% @ 2026-05-28T10:15:02.229Z || opposite SHORT: 4h close 0.768% | favorable anytime? yes | first favorable 2026-05-28T11:00:01.515Z | MFE 0.270% @ 2026-05-28T12:30:01.865Z
- 2026-05-28T09:30:02.134Z SOL ACTIVE_CONTEXT_BTC_WEAK original LONG: 4h close -0.759% | favorable anytime? yes | first favorable 2026-05-28T10:00:01.309Z | MFE 0.105% @ 2026-05-28T10:15:02.229Z || opposite SHORT: 4h close 0.759% | favorable anytime? yes | first favorable 2026-05-28T09:45:02.238Z | MFE 0.512% @ 2026-05-28T11:00:01.515Z
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
