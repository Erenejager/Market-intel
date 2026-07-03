# Alert Diagnostics Report

Generated: 2026-05-28T10:37:10.573Z
Since: 2026-05-27T09:30:00.000Z

## 1. Trade opportunity alerts
Measured from LONG_CONFIRMED / SHORT_CONFIRMED in the alert direction. This is the entry/opportunity scorecard only.
- Overall: n=10 | 1h 20.0% avg -0.054% n=10 | 4h 28.6% avg -0.620% n=7
- 4h path favorable-anytime 90.0% n=10 | avg MFE 0.410% | avg MAE -0.839% | median first favorable 60m | median max favorable 105m

### By type
- LONG_CONFIRMED: n=8 | 1h 12.5% avg -0.074% n=8 | 4h 20.0% avg -0.856% n=5
- SHORT_CONFIRMED: n=2 | 1h 50.0% avg 0.026% n=2 | 4h 50.0% avg -0.031% n=2

### By diagnostics bucket
- context_created:shadow_confirmed: n=6 | 1h 0.0% avg -0.221% n=6 | 4h 33.3% avg -0.763% n=3
- delivered_no_context_marker: n=1 | 1h 0.0% avg -0.174% n=1 | 4h 0.0% avg -0.999% n=1
- suppressed:btc_weak_veto_alt_longs: n=1 | 1h 100.0% avg 0.907% n=1 | 4h 0.0% avg -0.991% n=1
- watch_only:FADE_SHORT_POSITIVE_FUNDING: n=1 | 1h 0.0% avg -0.109% n=1 | 4h 100.0% avg 0.555% n=1
- watch_only:SOL_SHORT_BELOW_GATE_WATCH: n=1 | 1h 100.0% avg 0.162% n=1 | 4h 0.0% avg -0.616% n=1

### Trade rows — 4h path detail
- 2026-05-27T11:00:01.915Z BTC LONG_CONFIRMED LONG | 4h close -0.999% | favorable anytime? yes | first favorable 2026-05-27T11:15:02.017Z | MFE 0.080% @ 2026-05-27T11:15:02.017Z | MAE -1.390% | bucket delivered_no_context_marker
- 2026-05-27T11:30:02.418Z ETH SHORT_CONFIRMED SHORT | 4h close 0.555% | favorable anytime? yes | first favorable 2026-05-27T11:45:01.946Z | MFE 1.408% @ 2026-05-27T13:45:01.800Z | MAE -0.111% | bucket watch_only:FADE_SHORT_POSITIVE_FUNDING
- 2026-05-27T12:15:02.030Z SOL SHORT_CONFIRMED SHORT | 4h close -0.616% | favorable anytime? yes | first favorable 2026-05-27T13:15:01.313Z | MFE 0.736% @ 2026-05-27T13:45:01.800Z | MAE -0.963% | bucket watch_only:SOL_SHORT_BELOW_GATE_WATCH
- 2026-05-27T15:30:02.145Z SOL LONG_CONFIRMED LONG | 4h close -0.705% | favorable anytime? no | first favorable n/a | MFE -0.018% @ 2026-05-27T16:15:01.423Z | MAE -1.381% | bucket context_created:shadow_confirmed
- 2026-05-27T18:00:02.472Z SOL LONG_CONFIRMED LONG | 4h close -0.991% | favorable anytime? yes | first favorable 2026-05-27T18:30:01.674Z | MFE 0.907% @ 2026-05-27T19:15:01.757Z | MAE -1.051% | bucket suppressed:btc_weak_veto_alt_longs
- 2026-05-28T00:45:02.569Z BTC LONG_CONFIRMED LONG | 4h close -1.862% | favorable anytime? yes | first favorable 2026-05-28T01:00:02.156Z | MFE 0.009% @ 2026-05-28T01:00:02.156Z | MAE -2.069% | bucket context_created:shadow_confirmed
- 2026-05-28T05:00:02.068Z ETH LONG_CONFIRMED LONG | 4h close 0.279% | favorable anytime? yes | first favorable 2026-05-28T07:00:02.084Z | MFE 0.665% @ 2026-05-28T07:45:01.350Z | MAE -0.391% | bucket context_created:shadow_confirmed
- 2026-05-28T07:45:02.089Z ETH LONG_CONFIRMED LONG | 4h close n/a | favorable anytime? yes | first favorable 2026-05-28T10:15:02.229Z | MFE 0.069% @ 2026-05-28T10:15:02.229Z | MAE -0.456% | bucket context_created:shadow_confirmed
- 2026-05-28T08:15:01.943Z BTC LONG_CONFIRMED LONG | 4h close n/a | favorable anytime? yes | first favorable 2026-05-28T09:45:02.238Z | MFE 0.173% @ 2026-05-28T10:15:02.229Z | MAE -0.255% | bucket context_created:shadow_confirmed
- 2026-05-28T08:15:01.943Z SOL LONG_CONFIRMED LONG | 4h close n/a | favorable anytime? yes | first favorable 2026-05-28T10:00:01.309Z | MFE 0.068% @ 2026-05-28T10:15:02.229Z | MAE -0.327% | bucket context_created:shadow_confirmed

## 2. Active context lifecycle
Measured from active-context activation in context direction. This separates context creation quality from later tracking alerts.
- Overall: n=6 | 1h 0.0% avg -0.221% n=6 | 4h 33.3% avg -0.763% n=3
- 4h path favorable-anytime 83.3% n=6 | avg MFE 0.161% | avg MAE -0.813% | median first favorable 105m | median max favorable 120m

### By final health
- HEALTHY: n=4 | 1h 0.0% avg -0.138% n=4 | 4h 100.0% avg 0.279% n=1
- FAILED: n=2 | 1h 0.0% avg -0.388% n=2 | 4h 0.0% avg -1.284% n=2

### Active context rows — 4h path detail
- 2026-05-27T15:30:02.145Z SOL LONG_CONFIRMED LONG | 4h close -0.705% | favorable anytime? no | first favorable n/a | MFE -0.018% @ 2026-05-27T16:15:01.423Z | MAE -1.381% | bucket FAILED
- 2026-05-28T05:00:02.068Z ETH LONG_CONFIRMED LONG | 4h close 0.279% | favorable anytime? yes | first favorable 2026-05-28T07:00:02.084Z | MFE 0.665% @ 2026-05-28T07:45:01.350Z | MAE -0.391% | bucket HEALTHY
- 2026-05-28T00:45:02.569Z BTC LONG_CONFIRMED LONG | 4h close -1.862% | favorable anytime? yes | first favorable 2026-05-28T01:00:02.156Z | MFE 0.009% @ 2026-05-28T01:00:02.156Z | MAE -2.069% | bucket FAILED
- 2026-05-28T08:15:01.943Z SOL LONG_CONFIRMED LONG | 4h close n/a | favorable anytime? yes | first favorable 2026-05-28T10:00:01.309Z | MFE 0.068% @ 2026-05-28T10:15:02.229Z | MAE -0.327% | bucket HEALTHY
- 2026-05-28T08:15:01.943Z BTC LONG_CONFIRMED LONG | 4h close n/a | favorable anytime? yes | first favorable 2026-05-28T09:45:02.238Z | MFE 0.173% @ 2026-05-28T10:15:02.229Z | MAE -0.255% | bucket HEALTHY
- 2026-05-28T07:45:02.089Z ETH LONG_CONFIRMED LONG | 4h close n/a | favorable anytime? yes | first favorable 2026-05-28T10:15:02.229Z | MFE 0.069% @ 2026-05-28T10:15:02.229Z | MAE -0.456% | bucket HEALTHY

## 3. Tracking / health alerts
Measured from ACTIVE_CONTEXT_* event time. Original = existing context direction; opposite = inverse direction.
- Original direction overall: n=9 | 1h 28.6% avg -0.364% n=7 | 4h 16.7% avg -0.688% n=6
- Opposite direction overall: n=9 | 1h 71.4% avg 0.364% n=7 | 4h 83.3% avg 0.688% n=6
- Original 4h path favorable-anytime 88.9% n=9 | avg MFE 0.311% | avg MAE -0.800% | median first favorable 15m | median max favorable 45m
- Opposite 4h path favorable-anytime 77.8% n=9 | avg MFE 0.800% | avg MAE -0.311% | median first favorable 15m | median max favorable 105m

### Original direction by tracking type
- ACTIVE_CONTEXT_BTC_WEAK: n=4 | 1h 0.0% avg -0.686% n=2 | 4h 50.0% avg 0.178% n=2
- ACTIVE_CONTEXT_STRESSED: n=3 | 1h 33.3% avg -0.159% n=3 | 4h 0.0% avg -1.027% n=2
- ACTIVE_CONTEXT_FAILED: n=2 | 1h 50.0% avg -0.350% n=2 | 4h 0.0% avg -1.216% n=2

### Opposite direction by tracking type
- ACTIVE_CONTEXT_BTC_WEAK: n=4 | 1h 100.0% avg 0.686% n=2 | 4h 50.0% avg -0.178% n=2
- ACTIVE_CONTEXT_STRESSED: n=3 | 1h 66.7% avg 0.159% n=3 | 4h 100.0% avg 1.027% n=2
- ACTIVE_CONTEXT_FAILED: n=2 | 1h 50.0% avg 0.350% n=2 | 4h 100.0% avg 1.216% n=2

### Tracking rows — 4h path detail
- 2026-05-27T16:00:02.652Z SOL ACTIVE_CONTEXT_BTC_WEAK original LONG: 4h close -0.540% | favorable anytime? yes | first favorable 2026-05-27T16:15:01.423Z | MFE 0.042% @ 2026-05-27T16:15:01.423Z || opposite SHORT: 4h close 0.540% | favorable anytime? yes | first favorable 2026-05-27T16:30:01.987Z | MFE 1.322% @ 2026-05-27T18:15:01.974Z
- 2026-05-27T16:30:02.723Z SOL ACTIVE_CONTEXT_STRESSED original LONG: 4h close -0.387% | favorable anytime? yes | first favorable 2026-05-27T17:00:01.622Z | MFE 0.065% @ 2026-05-27T17:00:01.622Z || opposite SHORT: 4h close 0.387% | favorable anytime? yes | first favorable 2026-05-27T16:45:02.141Z | MFE 0.958% @ 2026-05-27T18:15:01.974Z
- 2026-05-27T18:00:02.472Z SOL ACTIVE_CONTEXT_FAILED original LONG: 4h close -0.991% | favorable anytime? yes | first favorable 2026-05-27T18:30:01.674Z | MFE 0.907% @ 2026-05-27T19:15:01.757Z || opposite SHORT: 4h close 0.991% | favorable anytime? yes | first favorable 2026-05-27T18:15:01.974Z | MFE 1.051% @ 2026-05-27T22:00:01.677Z
- 2026-05-28T01:30:02.818Z BTC ACTIVE_CONTEXT_STRESSED original LONG: 4h close -1.667% | favorable anytime? yes | first favorable 2026-05-28T01:45:01.476Z | MFE 0.110% @ 2026-05-28T02:15:01.382Z || opposite SHORT: 4h close 1.667% | favorable anytime? yes | first favorable 2026-05-28T02:30:01.308Z | MFE 1.750% @ 2026-05-28T05:30:01.269Z
- 2026-05-28T03:00:02.248Z BTC ACTIVE_CONTEXT_FAILED original LONG: 4h close -1.441% | favorable anytime? no | first favorable n/a | MFE -0.117% @ 2026-05-28T03:15:01.339Z || opposite SHORT: 4h close 1.441% | favorable anytime? yes | first favorable 2026-05-28T03:15:01.339Z | MFE 1.878% @ 2026-05-28T06:45:01.557Z
- 2026-05-28T05:30:02.017Z ETH ACTIVE_CONTEXT_BTC_WEAK original LONG: 4h close 0.895% | favorable anytime? yes | first favorable 2026-05-28T05:45:02.174Z | MFE 0.998% @ 2026-05-28T07:45:01.350Z || opposite SHORT: 4h close -0.895% | favorable anytime? yes | first favorable 2026-05-28T06:45:01.557Z | MFE 0.062% @ 2026-05-28T06:45:01.557Z
- 2026-05-28T08:30:02.895Z ETH ACTIVE_CONTEXT_STRESSED original LONG: 4h close n/a | favorable anytime? yes | first favorable 2026-05-28T08:45:02.128Z | MFE 0.453% @ 2026-05-28T10:15:02.229Z || opposite SHORT: 4h close n/a | favorable anytime? no | first favorable n/a | MFE -0.023% @ 2026-05-28T09:15:01.604Z
- 2026-05-28T09:30:02.134Z ETH ACTIVE_CONTEXT_BTC_WEAK original LONG: 4h close n/a | favorable anytime? yes | first favorable 2026-05-28T09:45:02.238Z | MFE 0.238% @ 2026-05-28T10:15:02.229Z || opposite SHORT: 4h close n/a | favorable anytime? no | first favorable n/a | MFE -0.073% @ 2026-05-28T10:30:02.063Z
- 2026-05-28T09:30:02.134Z SOL ACTIVE_CONTEXT_BTC_WEAK original LONG: 4h close n/a | favorable anytime? yes | first favorable 2026-05-28T10:00:01.309Z | MFE 0.105% @ 2026-05-28T10:15:02.229Z || opposite SHORT: 4h close n/a | favorable anytime? yes | first favorable 2026-05-28T09:45:02.238Z | MFE 0.278% @ 2026-05-28T10:30:02.063Z

## Interpretation guide
- Trade opportunity win-rate answers: “Was the entry alert direction right?”
- Active context lifecycle answers: “Did contexts created by trade alerts remain profitable after activation?”
- Tracking/health win-rate answers: “When health changed, was it useful as hold/exit/opposite information?”
- Do not mix these three into one win-rate; they have different jobs.
