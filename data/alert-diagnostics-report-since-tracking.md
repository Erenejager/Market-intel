# Alert Diagnostics Report

Generated: 2026-05-28T10:37:10.374Z
Since: 2026-05-26T09:29:00.000Z

## 1. Trade opportunity alerts
Measured from LONG_CONFIRMED / SHORT_CONFIRMED in the alert direction. This is the entry/opportunity scorecard only.
- Overall: n=18 | 1h 27.8% avg -0.022% n=18 | 4h 53.3% avg -0.129% n=15
- 4h path favorable-anytime 88.9% n=18 | avg MFE 0.417% | avg MAE -0.687% | median first favorable 15m | median max favorable 97.5m

### By type
- LONG_CONFIRMED: n=10 | 1h 10.0% avg -0.094% n=10 | 4h 42.9% avg -0.548% n=7
- SHORT_CONFIRMED: n=8 | 1h 50.0% avg 0.068% n=8 | 4h 62.5% avg 0.238% n=8

### By diagnostics bucket
- context_created:shadow_confirmed: n=6 | 1h 0.0% avg -0.221% n=6 | 4h 33.3% avg -0.763% n=3
- context_blocked:readiness_shadow_gate_not_confirmed_or_below_70: n=4 | 1h 75.0% avg 0.185% n=4 | 4h 100.0% avg 0.724% n=4
- context_created:below_threshold: n=2 | 1h 0.0% avg -0.126% n=2 | 4h 0.0% avg -0.466% n=2
- suppressed:btc_weak_veto_alt_longs: n=2 | 1h 50.0% avg 0.366% n=2 | 4h 50.0% avg -0.444% n=2
- context_created:unknown: n=1 | 1h 0.0% avg -0.170% n=1 | 4h 100.0% avg 0.338% n=1
- delivered_no_context_marker: n=1 | 1h 0.0% avg -0.174% n=1 | 4h 0.0% avg -0.999% n=1
- watch_only:FADE_SHORT_POSITIVE_FUNDING: n=1 | 1h 0.0% avg -0.109% n=1 | 4h 100.0% avg 0.555% n=1
- watch_only:SOL_SHORT_BELOW_GATE_WATCH: n=1 | 1h 100.0% avg 0.162% n=1 | 4h 0.0% avg -0.616% n=1

### Trade rows — 4h path detail
- 2026-05-26T11:15:02.713Z ETH SHORT_CONFIRMED SHORT | 4h close 1.305% | favorable anytime? yes | first favorable 2026-05-26T11:30:01.569Z | MFE 0.775% @ 2026-05-26T15:00:01.900Z | MAE -0.574% | bucket context_blocked:readiness_shadow_gate_not_confirmed_or_below_70
- 2026-05-26T11:45:02.737Z BTC SHORT_CONFIRMED SHORT | 4h close 0.944% | favorable anytime? yes | first favorable 2026-05-26T12:00:02.101Z | MFE 0.907% @ 2026-05-26T15:45:02.236Z | MAE -0.965% | bucket context_blocked:readiness_shadow_gate_not_confirmed_or_below_70
- 2026-05-26T17:00:02.485Z ETH SHORT_CONFIRMED SHORT | 4h close 0.378% | favorable anytime? yes | first favorable 2026-05-26T17:30:01.703Z | MFE 0.675% @ 2026-05-26T17:30:01.703Z | MAE -0.045% | bucket context_blocked:readiness_shadow_gate_not_confirmed_or_below_70
- 2026-05-26T18:30:02.766Z SOL SHORT_CONFIRMED SHORT | 4h close 0.269% | favorable anytime? yes | first favorable 2026-05-26T18:45:01.649Z | MFE 0.507% @ 2026-05-26T19:15:01.828Z | MAE -0.066% | bucket context_blocked:readiness_shadow_gate_not_confirmed_or_below_70
- 2026-05-26T20:45:02.042Z ETH LONG_CONFIRMED LONG | 4h close 0.338% | favorable anytime? yes | first favorable 2026-05-26T21:00:01.768Z | MFE 0.152% @ 2026-05-27T00:45:01.881Z | MAE -0.395% | bucket context_created:unknown
- 2026-05-26T22:45:02.844Z SOL SHORT_CONFIRMED SHORT | 4h close -0.329% | favorable anytime? no | first favorable n/a | MFE -0.006% @ 2026-05-26T23:00:01.719Z | MAE -0.641% | bucket context_created:below_threshold
- 2026-05-27T01:30:02.006Z ETH LONG_CONFIRMED LONG | 4h close 0.103% | favorable anytime? yes | first favorable 2026-05-27T01:45:01.814Z | MFE 0.161% @ 2026-05-27T03:15:02.167Z | MAE -0.549% | bucket suppressed:btc_weak_veto_alt_longs
- 2026-05-27T04:30:02.423Z BTC SHORT_CONFIRMED SHORT | 4h close -0.603% | favorable anytime? yes | first favorable 2026-05-27T04:45:01.483Z | MFE 0.236% @ 2026-05-27T04:45:01.483Z | MAE -0.736% | bucket context_created:below_threshold
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
- Overall: n=9 | 1h 0.0% avg -0.194% n=9 | 4h 33.3% avg -0.480% n=6
- 4h path favorable-anytime 77.8% n=9 | avg MFE 0.150% | avg MAE -0.739% | median first favorable 90m | median max favorable 120m

### By final health
- FAILED: n=5 | 1h 0.0% avg -0.240% n=5 | 4h 20.0% avg -0.632% n=5
- HEALTHY: n=4 | 1h 0.0% avg -0.138% n=4 | 4h 100.0% avg 0.279% n=1

### Active context rows — 4h path detail
- 2026-05-26T22:45:02.844Z SOL SHORT_CONFIRMED SHORT | 4h close -0.329% | favorable anytime? no | first favorable n/a | MFE -0.006% @ 2026-05-26T23:00:01.719Z | MAE -0.641% | bucket FAILED
- 2026-05-26T20:45:02.042Z ETH LONG_CONFIRMED LONG | 4h close 0.338% | favorable anytime? yes | first favorable 2026-05-26T21:00:01.768Z | MFE 0.152% @ 2026-05-27T00:45:01.881Z | MAE -0.395% | bucket FAILED
- 2026-05-27T04:30:02.423Z BTC SHORT_CONFIRMED SHORT | 4h close -0.603% | favorable anytime? yes | first favorable 2026-05-27T04:45:01.483Z | MFE 0.236% @ 2026-05-27T04:45:01.483Z | MAE -0.736% | bucket FAILED
- 2026-05-27T15:30:02.145Z SOL LONG_CONFIRMED LONG | 4h close -0.705% | favorable anytime? no | first favorable n/a | MFE -0.018% @ 2026-05-27T16:15:01.423Z | MAE -1.381% | bucket FAILED
- 2026-05-28T05:00:02.068Z ETH LONG_CONFIRMED LONG | 4h close 0.279% | favorable anytime? yes | first favorable 2026-05-28T07:00:02.084Z | MFE 0.665% @ 2026-05-28T07:45:01.350Z | MAE -0.391% | bucket HEALTHY
- 2026-05-28T00:45:02.569Z BTC LONG_CONFIRMED LONG | 4h close -1.862% | favorable anytime? yes | first favorable 2026-05-28T01:00:02.156Z | MFE 0.009% @ 2026-05-28T01:00:02.156Z | MAE -2.069% | bucket FAILED
- 2026-05-28T08:15:01.943Z SOL LONG_CONFIRMED LONG | 4h close n/a | favorable anytime? yes | first favorable 2026-05-28T10:00:01.309Z | MFE 0.068% @ 2026-05-28T10:15:02.229Z | MAE -0.327% | bucket HEALTHY
- 2026-05-28T08:15:01.943Z BTC LONG_CONFIRMED LONG | 4h close n/a | favorable anytime? yes | first favorable 2026-05-28T09:45:02.238Z | MFE 0.173% @ 2026-05-28T10:15:02.229Z | MAE -0.255% | bucket HEALTHY
- 2026-05-28T07:45:02.089Z ETH LONG_CONFIRMED LONG | 4h close n/a | favorable anytime? yes | first favorable 2026-05-28T10:15:02.229Z | MFE 0.069% @ 2026-05-28T10:15:02.229Z | MAE -0.456% | bucket HEALTHY

## 3. Tracking / health alerts
Measured from ACTIVE_CONTEXT_* event time. Original = existing context direction; opposite = inverse direction.
- Original direction overall: n=16 | 1h 42.9% avg -0.142% n=14 | 4h 46.2% avg -0.168% n=13
- Opposite direction overall: n=16 | 1h 57.1% avg 0.142% n=14 | 4h 53.8% avg 0.168% n=13
- Original 4h path favorable-anytime 87.5% n=16 | avg MFE 0.406% | avg MAE -0.537% | median first favorable 15m | median max favorable 90m
- Opposite 4h path favorable-anytime 75.0% n=16 | avg MFE 0.537% | avg MAE -0.406% | median first favorable 15m | median max favorable 67.5m

### Original direction by tracking type
- ACTIVE_CONTEXT_STRESSED: n=6 | 1h 33.3% avg -0.075% n=6 | 4h 40.0% avg -0.234% n=5
- ACTIVE_CONTEXT_BTC_WEAK: n=5 | 1h 33.3% avg -0.445% n=3 | 4h 66.7% avg 0.137% n=3
- ACTIVE_CONTEXT_FAILED: n=5 | 1h 60.0% avg -0.041% n=5 | 4h 40.0% avg -0.284% n=5

### Opposite direction by tracking type
- ACTIVE_CONTEXT_STRESSED: n=6 | 1h 66.7% avg 0.075% n=6 | 4h 60.0% avg 0.234% n=5
- ACTIVE_CONTEXT_BTC_WEAK: n=5 | 1h 66.7% avg 0.445% n=3 | 4h 33.3% avg -0.137% n=3
- ACTIVE_CONTEXT_FAILED: n=5 | 1h 40.0% avg 0.041% n=5 | 4h 60.0% avg 0.284% n=5

### Tracking rows — 4h path detail
- 2026-05-26T22:00:02.845Z ETH ACTIVE_CONTEXT_BTC_WEAK original LONG: 4h close 0.054% | favorable anytime? yes | first favorable 2026-05-26T23:15:02.187Z | MFE 0.498% @ 2026-05-27T01:00:01.398Z || opposite SHORT: 4h close -0.054% | favorable anytime? yes | first favorable 2026-05-26T22:15:01.279Z | MFE 0.236% @ 2026-05-26T22:45:02.402Z
- 2026-05-26T22:45:02.844Z ETH ACTIVE_CONTEXT_STRESSED original LONG: 4h close 0.335% | favorable anytime? yes | first favorable 2026-05-26T23:00:01.719Z | MFE 0.744% @ 2026-05-27T01:00:01.398Z || opposite SHORT: 4h close -0.335% | favorable anytime? no | first favorable n/a | MFE -0.044% @ 2026-05-26T23:00:01.719Z
- 2026-05-27T00:30:02.323Z SOL ACTIVE_CONTEXT_STRESSED original SHORT: 4h close 0.924% | favorable anytime? yes | first favorable 2026-05-27T01:30:01.550Z | MFE 0.602% @ 2026-05-27T04:30:01.988Z || opposite LONG: 4h close -0.924% | favorable anytime? yes | first favorable 2026-05-27T00:45:01.881Z | MFE 0.221% @ 2026-05-27T01:00:01.398Z
- 2026-05-27T01:15:02.395Z SOL ACTIVE_CONTEXT_FAILED original SHORT: 4h close 0.423% | favorable anytime? yes | first favorable 2026-05-27T01:30:01.550Z | MFE 1.101% @ 2026-05-27T04:45:01.483Z || opposite LONG: 4h close -0.423% | favorable anytime? no | first favorable n/a | MFE -0.113% @ 2026-05-27T01:45:01.814Z
- 2026-05-27T04:00:02.533Z ETH ACTIVE_CONTEXT_FAILED original LONG: 4h close 0.769% | favorable anytime? yes | first favorable 2026-05-27T04:15:01.328Z | MFE 0.686% @ 2026-05-27T08:00:01.570Z || opposite SHORT: 4h close -0.769% | favorable anytime? yes | first favorable 2026-05-27T04:30:01.988Z | MFE 0.323% @ 2026-05-27T04:45:01.483Z
- 2026-05-27T06:15:02.629Z BTC ACTIVE_CONTEXT_STRESSED original SHORT: 4h close -0.374% | favorable anytime? no | first favorable n/a | MFE -0.011% @ 2026-05-27T06:30:01.828Z || opposite LONG: 4h close 0.374% | favorable anytime? yes | first favorable 2026-05-27T06:30:01.828Z | MFE 0.451% @ 2026-05-27T08:30:01.329Z
- 2026-05-27T07:00:01.769Z BTC ACTIVE_CONTEXT_FAILED original SHORT: 4h close -0.181% | favorable anytime? yes | first favorable 2026-05-27T07:15:01.662Z | MFE 0.079% @ 2026-05-27T09:15:01.965Z || opposite LONG: 4h close 0.181% | favorable anytime? yes | first favorable 2026-05-27T07:30:02.229Z | MFE 0.314% @ 2026-05-27T08:30:01.329Z
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
