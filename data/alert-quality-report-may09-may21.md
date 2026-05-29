# Phase 1 Alert Quality Report

Generated: 2026-06-04T15:27:39.834Z
Window: 2026-05-09T00:00:00Z → 2026-05-21T23:59:59Z

## 1. HIGH Alert Outcome Table

Pre-fix rows are labeled and excluded from directional precision summaries. Directional returns are positive when price moved in the alert direction. MFE/MAE use `data/autoresearch/price-15m.jsonl`.

| time | asset | type | price | pre-fix? | +30m | +1h | +4h | +8h | +12h | +24h | MFE 4h | MAE 4h | invalidation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-05-09T00:15:02.512Z | BTC | SHORT_INVALIDATED | 80133.85 | YES | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-09T01:30:02.035Z | SOL | SHORT_CONFIRMED | 92.445 |  | -1.195% | -1.033% | -1.076% | -0.903% | -0.849% | -0.168% | -0.687% | -1.606% | 15m SHORT_INVALIDATED (flow) -0.768% |
| 2026-05-09T01:45:02.524Z | SOL | SHORT_INVALIDATED | 93.155 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-09T07:15:02.275Z | ETH | LONG_CONFIRMED | 2312.545 |  | 0.072% | 0.213% | 0.072% | -0.111% | 0.642% | 0.683% | 0.221% | -0.043% | 15m LONG_INVALIDATED (btc_gate) 0.131% |
| 2026-05-09T07:30:01.795Z | ETH | LONG_INVALIDATED | 2315.565 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-09T09:30:19.781Z | BTC | SHORT_CONFIRMED | 80221.15 |  | 0.063% | -0.088% | -0.081% | -0.720% | -0.629% | -0.646% | 0.063% | -0.181% | 30m SHORT_INVALIDATED (flow) 0.025% |
| 2026-05-09T10:00:02.678Z | BTC | SHORT_INVALIDATED | 80200.95 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-09T14:30:02.659Z | BTC | SHORT_INVALIDATED | 80288.05 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-09T14:30:02.659Z | BTC | LONG_CONFIRMED | 80288.05 |  | -0.035% | 0.174% | 0.730% | 0.632% | 0.509% | 0.701% | 0.893% | -0.035% | 30m LONG_INVALIDATED (pre_fix_or_leveraged_chase) 0.009% |
| 2026-05-09T15:00:02.517Z | BTC | LONG_INVALIDATED | 80295.05 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-09T17:00:02.270Z | ETH | SHORT_CONFIRMED | 2319.085 |  | -0.494% | -0.414% | -0.466% | -0.096% | -0.337% | -1.292% | -0.333% | -0.714% | 120m SHORT_INVALIDATED (pre_fix_or_leveraged_chase) -0.449% |
| 2026-05-09T18:30:02.134Z | ETH | SHORT_CONFIRMED | 2335.625 |  | 0.268% | 0.377% | 0.232% | 0.434% | 0.310% | -0.889% | 0.377% | 0.196% | 30m SHORT_INVALIDATED (pre_fix_or_leveraged_chase) 0.262% |
| 2026-05-09T18:45:02.377Z | SOL | LONG_INVALIDATED | 93.335 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-09T18:50:12.231Z | SOL | RETEST_FAILED | 93.295 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-09T19:00:02.662Z | ETH | SHORT_INVALIDATED | 2329.495 | YES | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-09T21:30:02.304Z | SOL | LONG_CONFIRMED | 93.325 |  | 0.113% | 0.091% | -0.627% | 0.038% | 1.002% | 2.181% | 0.113% | -0.777% | 45m LONG_INVALIDATED (flow) 0.000% |
| 2026-05-09T22:15:02.601Z | SOL | LONG_INVALIDATED | 93.325 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-09T23:00:02.269Z | SOL | LONG_CONFIRMED | 93.295 |  | -0.273% | -0.166% | -0.188% | 0.134% | 0.520% | 3.124% | -0.038% | -0.745% | 15m LONG_INVALIDATED (flow) -0.054% |
| 2026-05-09T23:15:02.564Z | SOL | LONG_INVALIDATED | 93.245 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-09T23:30:02.136Z | BTC | SHORT_CONFIRMED | 80645.75 |  | -0.054% | -0.041% | -0.174% | -0.121% | -0.184% | -2.115% | 0.100% | -0.123% | 210m SHORT_INVALIDATED (other) -0.109% |
| 2026-05-09T23:30:02.136Z | ETH | SHORT_CONFIRMED | 2325.595 |  | -0.052% | -0.046% | -0.108% | -0.107% | 0.162% | -2.264% | 0.284% | -0.097% | 705m SHORT_INVALIDATED (flow) 0.085% |
| 2026-05-10T03:00:02.364Z | BTC | SHORT_INVALIDATED | 80733.65 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-10T03:00:02.364Z | BTC | LONG_CONFIRMED | 80733.65 |  | 0.065% | 0.000% | -0.025% | 0.174% | 0.324% | -0.062% | 0.065% | -0.112% | 45m LONG_INVALIDATED (flow) 0.050% |
| 2026-05-10T03:45:02.355Z | BTC | LONG_INVALIDATED | 80774.05 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-10T04:00:02.274Z | ETH | SHORT_CONFIRMED | 2326.675 |  | -0.032% | -0.009% | -0.057% | 0.200% | -0.785% | -0.054% | 0.023% | -0.123% | 435m SHORT_INVALIDATED (flow) 0.132% |
| 2026-05-10T05:45:02.388Z | ETH | SHORT_CONFIRMED | 2327.305 |  | 0.037% | -0.036% | -0.005% | -0.081% | -1.499% | -0.315% | 0.039% | -0.105% | 330m SHORT_INVALIDATED (flow) 0.159% |
| 2026-05-10T07:18:50.235Z | SOL | LONG_CONFIRMED | 93.435 |  | -0.016% | 0.444% | -0.134% | 0.936% | 3.559% | 2.135% | 1.097% | -0.016% | 11m LONG_INVALIDATED (flow) 0.064% |
| 2026-05-10T07:30:02.153Z | SOL | LONG_INVALIDATED | 93.495 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-10T09:45:02.771Z | ETH | SHORT_CONFIRMED | 2327.015 |  | 0.058% | 0.085% | -0.094% | -1.512% | -0.143% | -0.362% | 0.270% | -0.070% | 90m SHORT_INVALIDATED (flow) 0.146% |
| 2026-05-10T10:15:02.487Z | SOL | SHORT_CONFIRMED | 93.785 |  | -0.059% | 0.506% | 0.112% | -3.012% | -2.063% | -1.797% | 0.581% | -0.069% | 60m SHORT_INVALIDATED (flow) 0.032% |
| 2026-05-10T11:15:02.454Z | ETH | SHORT_INVALIDATED | 2323.615 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-10T11:15:02.454Z | SOL | SHORT_INVALIDATED | 93.755 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-10T13:21:10.479Z | SOL | LONG_CONFIRMED | 93.505 |  | 0.273% | 0.187% | 2.529% | 1.888% | 2.786% | 1.695% | 1.791% | 0.176% | 24m LONG_INVALIDATED (flow) 0.203% |
| 2026-05-10T13:45:02.605Z | SOL | LONG_INVALIDATED | 93.695 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-10T13:45:02.605Z | BTC | LONG_CONFIRMED | 80944.15 |  | -0.087% | -0.046% | 0.592% | -0.315% | 0.634% | 0.106% | 0.572% | -0.115% | 15m LONG_INVALIDATED (flow) -0.027% |
| 2026-05-10T14:00:02.796Z | BTC | LONG_INVALIDATED | 80922.05 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-10T14:30:02.724Z | BTC | SHORT_CONFIRMED | 80877.65 |  | -0.145% | -0.238% | -0.418% | -1.189% | -0.366% | 0.128% | 0.033% | -0.675% | 15m SHORT_INVALIDATED (flow) 0.027% |
| 2026-05-10T14:45:02.161Z | BTC | SHORT_INVALIDATED | 80855.95 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-10T14:45:02.161Z | ETH | SHORT_CONFIRMED | 2329.765 |  | -0.168% | -0.741% | -1.201% | -1.799% | -0.599% | 0.625% | 0.005% | -1.449% | 60m SHORT_INVALIDATED (flow) -0.483% |
| 2026-05-10T15:00:02.062Z | SOL | LONG_CONFIRMED | 93.855 |  | 0.687% | 0.677% | 2.456% | 2.509% | 1.497% | 1.508% | 2.978% | 0.453% | 30m LONG_INVALIDATED (flow) 0.511% |
| 2026-05-10T15:30:02.618Z | SOL | LONG_INVALIDATED | 94.335 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-10T15:45:02.358Z | ETH | SHORT_INVALIDATED | 2341.015 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-10T16:00:02.642Z | BTC | LONG_CONFIRMED | 81399.95 |  | -0.222% | -0.118% | -0.325% | 0.572% | -0.886% | 0.359% | 0.046% | -0.226% | 45m LONG_INVALIDATED (other) -0.226% |
| 2026-05-10T16:45:02.098Z | BTC | LONG_INVALIDATED | 81216.15 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-10T17:15:01.914Z | BTC | LONG_CONFIRMED | 81302.25 |  | 0.149% | 0.117% | -0.646% | 0.190% | -0.578% | 0.339% | 0.166% | -0.827% | 6255m LONG_INVALIDATED (other) 0.051% |
| 2026-05-10T17:15:01.914Z | ETH | LONG_CONFIRMED | 2349.015 |  | 0.561% | 0.618% | -0.641% | 0.272% | -0.692% | -0.893% | 0.694% | -0.984% | 8355m LONG_INVALIDATED (other) -7.443% |
| 2026-05-10T17:15:01.914Z | CROSS_ASSET | CROSS_ASSET_COVER | n/a |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-10T18:30:01.752Z | BTC | SHORT_CONFIRMED | 81326.65 |  | -0.002% | -0.078% | -0.198% | 0.161% | 0.470% | -0.708% | 0.856% | -0.136% | 4200m SHORT_INVALIDATED (other) 2.870% |
| 2026-05-10T19:00:02.135Z | ETH | LONG_CONFIRMED | 2357.475 |  | 0.284% | 0.277% | 0.865% | -0.584% | -1.154% | -0.872% | 0.602% | -1.339% | 8250m LONG_INVALIDATED (other) -7.775% |
| 2026-05-10T19:15:02.161Z | ETH | LONG_CONFIRMED | 2356.705 |  | 0.310% | -0.247% | 0.705% | -1.372% | -1.086% | -0.874% | 0.898% | -1.307% | 8235m LONG_INVALIDATED (other) -7.745% |
| 2026-05-10T19:15:02.161Z | CROSS_ASSET | CROSS_ASSET_COVER | n/a |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-10T19:30:51.270Z | ETH | LONG_CONFIRMED | 2364.045 |  | -0.422% | -1.221% | 0.601% | -1.540% | -1.512% | -0.989% | 0.585% | -1.614% | 8219m LONG_INVALIDATED (other) -8.031% |
| 2026-05-10T19:45:02.154Z | SOL | LONG_CONFIRMED | 96.565 |  | -0.782% | -2.170% | 0.140% | -1.890% | -1.310% | 1.621% | -0.150% | -2.170% | 3720m LONG_INVALIDATED (btc_gate) -0.911% |
| 2026-05-10T20:00:02.727Z | BTC | LONG_CONFIRMED | 81390.55 |  | -0.727% | -0.934% | 0.583% | -0.875% | -0.864% | 0.565% | 1.180% | -0.934% | 6090m LONG_INVALIDATED (other) -0.058% |
| 2026-05-10T20:00:02.727Z | CROSS_ASSET | CROSS_ASSET_COVER | n/a |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-10T20:15:02.678Z | ETH | SHORT_CONFIRMED | 2354.025 |  | 1.162% | 0.853% | 0.057% | 1.010% | 1.142% | 0.688% | 1.195% | -1.029% | 5m SHORT_INVALIDATED (other) 0.133% |
| 2026-05-10T20:20:01.406Z | ETH | SHORT_INVALIDATED | 2350.895 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-10T20:20:28.014Z | ETH | LONG_CONFIRMED | 2353.125 |  | -1.125% | -0.815% | 0.052% | -0.972% | -1.104% | -0.669% | 1.068% | -1.157% | 8170m LONG_INVALIDATED (other) -7.604% |
| 2026-05-10T21:30:02.792Z | SOL | LONG_CONFIRMED | 95.385 |  | 0.131% | 0.540% | 0.603% | 0.100% | -0.257% | 2.249% | 1.379% | -0.288% | 3615m LONG_INVALIDATED (btc_gate) 0.315% |
| 2026-05-10T23:00:02.054Z | SOL | LONG_CONFIRMED | 96.355 |  | 0.358% | 0.057% | -1.136% | -1.022% | -1.406% | 1.147% | 0.358% | -1.074% | 3525m LONG_INVALIDATED (btc_gate) -0.695% |
| 2026-05-11T00:00:02.763Z | SOL | LONG_CONFIRMED | 96.455 |  | -0.461% | -0.648% | -2.027% | -1.508% | -1.788% | 0.814% | -0.337% | -1.778% | 3465m LONG_INVALIDATED (btc_gate) -0.798% |
| 2026-05-11T00:19:28.861Z | ETH | SHORT_CONFIRMED | 2353.575 |  | 0.083% | -0.341% | 0.991% | 1.123% | 0.759% | 0.852% | 1.240% | -0.341% | 1440m SHORT_INVALIDATED (structure) 0.793% |
| 2026-05-11T07:00:01.760Z | BTC | SHORT_CONFIRMED | 80794.05 |  | 0.120% | 0.124% | -0.162% | -0.193% | -1.238% | -0.299% | 0.210% | -0.435% | 3450m SHORT_INVALIDATED (other) 2.230% |
| 2026-05-11T12:30:02.353Z | BTC | LONG_CONFIRMED | 81255.85 |  | -0.024% | -0.258% | 0.347% | 0.619% | 0.223% | -0.494% | 0.557% | -0.593% | 5100m LONG_INVALIDATED (other) 0.108% |
| 2026-05-11T12:45:02.062Z | ETH | SHORT_CONFIRMED | 2331.685 |  | 0.055% | 0.455% | 0.171% | -0.219% | -0.035% | 1.902% | 0.856% | -0.245% | 694m SHORT_INVALIDATED (structure) -0.138% |
| 2026-05-11T13:00:02.605Z | SOL | LONG_CONFIRMED | 94.755 |  | 0.596% | 0.902% | 2.517% | 3.013% | 2.380% | 0.311% | 3.266% | -0.132% | 2685m LONG_INVALIDATED (btc_gate) 0.981% |
| 2026-05-11T13:19:48.986Z | BTC | SHORT_CONFIRMED | 81196.15 |  | 0.205% | 0.495% | -0.470% | -0.482% | -0.165% | 0.704% | 0.520% | -0.631% | 3070m SHORT_INVALIDATED (other) 2.714% |
| 2026-05-11T17:00:02.470Z | ETH | SHORT_CONFIRMED | 2329.075 |  | -0.469% | -0.451% | -0.418% | 0.182% | 0.849% | 2.581% | 0.173% | -0.497% | 439m SHORT_INVALIDATED (structure) -0.250% |
| 2026-05-11T17:30:02.412Z | SOL | LONG_CONFIRMED | 97.205 |  | 0.303% | 0.190% | 0.334% | -1.157% | -0.602% | -2.639% | 0.972% | 0.046% | 2415m LONG_INVALIDATED (btc_gate) -1.564% |
| 2026-05-11T18:30:02.228Z | ETH | SHORT_CONFIRMED | 2340.015 |  | 0.132% | -0.028% | 0.030% | 1.298% | 1.437% | 2.514% | 0.271% | -0.028% | 349m SHORT_INVALIDATED (structure) 0.218% |
| 2026-05-11T19:30:02.198Z | SOL | LONG_CONFIRMED | 97.675 |  | 0.466% | 0.128% | -0.292% | -1.377% | -1.623% | -3.087% | 0.486% | -0.558% | 2295m LONG_INVALIDATED (btc_gate) -2.037% |
| 2026-05-11T23:00:02.168Z | BTC | SHORT_CONFIRMED | 81763.85 |  | 0.030% | 0.235% | 0.728% | 0.891% | 1.487% | 1.488% | 0.916% | 0.030% | 2490m SHORT_INVALIDATED (other) 3.389% |
| 2026-05-12T00:19:11.324Z | ETH | SHORT_INVALIDATED | 2334.905 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-12T00:19:11.324Z | SOL | LONG_CONFIRMED | 97.325 |  | 0.128% | -0.519% | -1.094% | -1.742% | -2.574% | -3.005% | 0.128% | -1.289% | 2006m LONG_INVALIDATED (btc_gate) -1.685% |
| 2026-05-12T03:00:02.263Z | ETH | LONG_CONFIRMED | 2314.395 |  | -0.115% | -0.356% | -0.531% | -1.384% | -1.872% | -0.934% | -0.115% | -0.504% | 6330m LONG_INVALIDATED (other) -6.058% |
| 2026-05-12T05:15:02.744Z | ETH | SHORT_CONFIRMED | 2309.695 |  | 0.010% | -0.013% | 1.128% | 1.081% | 1.542% | 0.348% | 1.151% | -0.085% |  |
| 2026-05-12T08:00:02.081Z | SOL | SHORT_CONFIRMED | 95.885 |  | 0.120% | 0.256% | 0.986% | 2.112% | 1.059% | 0.798% | 1.215% | -0.057% |  |
| 2026-05-12T08:15:01.993Z | ETH | SHORT_CONFIRMED | 2282.675 |  | -0.173% | -0.042% | -0.280% | 0.686% | -0.091% | -0.847% | 0.023% | -0.446% |  |
| 2026-05-12T15:00:02.252Z | ETH | SHORT_CONFIRMED | 2267.105 |  | 0.165% | 0.004% | -0.714% | -0.511% | -1.132% | 0.466% | 0.416% | -0.621% |  |
| 2026-05-12T20:20:12.231Z | SOL | LONG_CONFIRMED | 94.895 |  | -0.184% | -0.216% | -0.553% | 0.827% | 0.269% | -3.925% | 0.005% | -0.796% | 805m LONG_INVALIDATED (btc_gate) 0.832% |
| 2026-05-12T20:45:02.164Z | ETH | SHORT_CONFIRMED | 2282.275 |  | -0.127% | -0.112% | -0.055% | -0.953% | -1.447% | 0.883% | 0.361% | -0.163% |  |
| 2026-05-12T21:30:02.791Z | ETH | LONG_CONFIRMED | 2286.065 |  | -0.003% | -0.099% | 0.277% | 0.464% | 1.494% | -1.321% | 0.248% | -0.526% | 5220m LONG_INVALIDATED (other) -4.894% |
| 2026-05-13T05:45:01.909Z | BTC | SHORT_CONFIRMED | 81000.05 |  | -0.058% | 0.062% | -0.257% | 1.499% | 1.901% | 1.531% | 0.130% | -0.237% | 645m SHORT_INVALIDATED (other) 2.478% |
| 2026-05-13T05:45:01.909Z | ETH | SHORT_CONFIRMED | 2296.215 |  | -0.231% | -0.174% | -1.046% | 1.192% | 1.675% | 1.244% | 0.015% | -0.959% |  |
| 2026-05-13T06:45:01.898Z | ETH | LONG_CONFIRMED | 2303.145 |  | -0.133% | -0.141% | 0.095% | -1.692% | -1.917% | -1.568% | 0.742% | -0.241% | 4665m LONG_INVALIDATED (other) -5.599% |
| 2026-05-13T09:00:02.775Z | SOL | LONG_CONFIRMED | 95.535 |  | 0.152% | -0.215% | -2.319% | -4.778% | -4.852% | -4.778% | 0.152% | -2.716% | 45m LONG_INVALIDATED (btc_gate) 0.157% |
| 2026-05-13T09:45:02.728Z | SOL | LONG_INVALIDATED | 95.685 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-13T09:45:02.728Z | BTC | SHORT_CONFIRMED | 81206.05 |  | 0.315% | 0.500% | 1.951% | 2.150% | 2.278% | 1.990% | 1.749% | -0.037% | 405m SHORT_INVALIDATED (other) 2.726% |
| 2026-05-13T10:15:02.523Z | ETH | SHORT_CONFIRMED | 2313.555 |  | 0.264% | 0.592% | 2.030% | 2.138% | 2.654% | 2.197% | 2.238% | 0.220% |  |
| 2026-05-13T10:45:02.618Z | SOL | SHORT_CONFIRMED | 94.805 |  | 0.469% | 0.512% | 3.233% | 4.119% | 3.866% | 3.982% | 3.149% | 0.026% |  |
| 2026-05-13T11:15:02.174Z | BTC | SHORT_CONFIRMED | 80543.05 |  | 0.081% | 0.294% | 1.392% | 1.380% | 1.604% | 1.511% | 1.144% | -0.106% | 315m SHORT_INVALIDATED (other) 1.925% |
| 2026-05-13T13:21:50.116Z | BTC | SHORT_CONFIRMED | 80215.55 |  | 0.741% | 0.494% | 1.164% | 1.059% | 0.892% | 0.407% | 1.741% | 0.131% | 188m SHORT_INVALIDATED (other) 1.525% |
| 2026-05-13T13:21:50.116Z | SOL | LONG_CONFIRMED | 93.295 |  | -1.120% | -1.217% | -2.524% | -2.631% | -2.385% | -2.128% | -0.123% | -3.049% | 8m LONG_INVALIDATED (btc_gate) -0.129% |
| 2026-05-13T13:30:02.446Z | SOL | LONG_INVALIDATED | 93.175 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-13T16:30:02.408Z | BTC | SHORT_INVALIDATED | 78992.65 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-13T16:45:01.564Z | BTC | LONG_CONFIRMED | 79074.35 |  | 0.263% | 0.488% | 0.747% | 0.640% | 0.313% | 3.022% | 0.767% | -0.068% | 1965m LONG_INVALIDATED (other) 2.870% |
| 2026-05-13T20:22:42.225Z | ETH | LONG_CONFIRMED | 2259.155 |  | 0.132% | -0.238% | 0.166% | -0.370% | 0.275% | 1.339% | 0.244% | -0.310% | 3847m LONG_INVALIDATED (other) -3.761% |
| 2026-05-13T21:30:01.923Z | SOL | SHORT_CONFIRMED | 90.875 |  | 0.017% | -0.237% | -0.215% | -0.215% | 0.215% | -2.118% | 0.017% | -0.490% |  |
| 2026-05-14T01:15:02.301Z | SOL | SHORT_CONFIRMED | 91.135 |  | -0.005% | -0.027% | 0.324% | 0.368% | -0.192% | -1.158% | 1.333% | -0.027% |  |
| 2026-05-14T02:45:01.733Z | SOL | SHORT_CONFIRMED | 91.045 |  | 0.632% | 0.851% | -0.346% | 0.016% | -0.522% | -1.422% | 1.236% | -0.401% |  |
| 2026-05-14T04:00:02.589Z | BTC | LONG_CONFIRMED | 78993.95 |  | 0.415% | 0.476% | 0.987% | 0.412% | 3.218% | 2.513% | 1.095% | 0.262% | 1290m LONG_INVALIDATED (other) 2.974% |
| 2026-05-14T07:15:02.542Z | ETH | SHORT_CONFIRMED | 2263.195 |  | -0.036% | -0.096% | 0.387% | -1.044% | -1.492% | 0.051% | 0.338% | -0.225% |  |
| 2026-05-14T08:30:02.743Z | BTC | SHORT_CONFIRMED | 79731.05 |  | -0.054% | 0.167% | 0.150% | -2.173% | -1.869% | -1.169% | 0.627% | -0.137% |  |
| 2026-05-14T11:15:02.313Z | ETH | SHORT_CONFIRMED | 2257.335 |  | 0.146% | 0.194% | -1.307% | -1.755% | -1.713% | -0.060% | 0.384% | -1.250% |  |
| 2026-05-14T12:45:02.293Z | SOL | LONG_CONFIRMED | 91.075 |  | 0.258% | -0.346% | 2.498% | 1.795% | 1.455% | -0.500% | 2.597% | -0.346% | 390m LONG_INVALIDATED (btc_gate) 2.470% |
| 2026-05-14T13:22:50.122Z | BTC | LONG_CONFIRMED | 79981.35 |  | -0.342% | 0.153% | 1.784% | 1.764% | 1.720% | -0.012% | 2.258% | -0.342% | 727m LONG_INVALIDATED (other) 1.703% |
| 2026-05-14T16:00:02.104Z | BTC | LONG_CONFIRMED | 81270.95 |  | 0.237% | 0.563% | 0.093% | 0.152% | -0.359% | -2.602% | 0.699% | 0.051% | 570m LONG_INVALIDATED (other) 0.089% |
| 2026-05-14T16:15:02.483Z | SOL | LONG_CONFIRMED | 93.485 |  | -0.144% | -1.193% | -0.850% | -1.171% | -1.888% | -4.669% | 0.091% | -1.193% | 180m LONG_INVALIDATED (btc_gate) -0.171% |
| 2026-05-14T16:15:02.483Z | CROSS_ASSET | CROSS_ASSET_COVER | n/a |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-14T18:15:02.118Z | SOL | LONG_CONFIRMED | 93.305 |  | -0.113% | -0.391% | -0.595% | -1.720% | -2.749% | -3.874% | 0.284% | -0.852% | 60m LONG_INVALIDATED (btc_gate) 0.021% |
| 2026-05-14T18:30:02.063Z | ETH | SHORT_CONFIRMED | 2314.235 |  | 0.427% | 0.645% | 0.779% | 2.171% | 2.572% | 3.795% | 1.073% | 0.225% |  |
| 2026-05-14T19:15:02.016Z | SOL | LONG_INVALIDATED | 93.325 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-14T22:45:02.309Z | ETH | LONG_CONFIRMED | 2298.475 |  | -0.108% | -0.742% | -1.020% | -1.952% | -1.638% | -3.321% | -0.064% | -1.500% | 2265m LONG_INVALIDATED (other) -5.407% |
| 2026-05-14T22:45:02.309Z | SOL | LONG_CONFIRMED | 92.825 |  | -0.275% | -0.759% | -0.522% | -2.020% | -1.514% | -3.808% | -0.275% | -1.212% | 2775m LONG_INVALIDATED (other) -6.668% |
| 2026-05-14T22:45:02.309Z | CROSS_ASSET | CROSS_ASSET_COVER | n/a |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-15T00:18:59.248Z | SOL | LONG_CONFIRMED | 92.365 |  | 0.038% | -0.189% | -0.698% | -1.348% | -1.684% | -3.351% | 0.092% | -0.720% | 2681m LONG_INVALIDATED (other) -6.204% |
| 2026-05-15T00:45:02.311Z | BTC | LONG_CONFIRMED | 81298.25 |  | 0.072% | -0.237% | -0.740% | -0.852% | -1.174% | -2.796% | 0.254% | -0.517% | 45m LONG_INVALIDATED (other) 0.056% |
| 2026-05-15T01:30:02.350Z | BTC | LONG_INVALIDATED | 81343.45 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-15T04:15:01.983Z | BTC | SHORT_CONFIRMED | 80984.85 |  | 0.356% | 0.304% | 0.409% | 0.726% | 2.197% | 2.411% | 0.819% | 0.099% |  |
| 2026-05-15T05:00:02.183Z | ETH | SHORT_CONFIRMED | 2261.335 |  | 0.668% | 0.605% | 0.281% | 0.700% | 1.588% | 1.666% | 0.753% | -0.221% |  |
| 2026-05-15T05:00:02.183Z | SOL | SHORT_CONFIRMED | 91.225 |  | 0.685% | 0.685% | 0.060% | 1.036% | 1.759% | 2.965% | 0.762% | -0.389% |  |
| 2026-05-15T07:21:36.817Z | BTC | LONG_CONFIRMED | 80785.95 |  | 0.001% | -0.338% | -0.251% | -2.100% | -2.132% | -2.928% | 0.108% | -0.472% | 2033m LONG_INVALIDATED (other) -3.183% |
| 2026-05-15T07:21:36.817Z | ETH | LONG_CONFIRMED | 2262.355 |  | 0.081% | -0.418% | -0.162% | -2.156% | -1.717% | -3.158% | 0.176% | -0.446% | 1748m LONG_INVALIDATED (other) -3.897% |
| 2026-05-15T07:21:36.817Z | CROSS_ASSET | CROSS_ASSET_COVER | n/a |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-15T09:00:02.029Z | BTC | LONG_CONFIRMED | 80616.75 |  | -0.263% | -0.210% | -0.653% | -1.728% | -1.854% | -2.968% | 0.070% | -0.338% | 1935m LONG_INVALIDATED (other) -2.979% |
| 2026-05-15T12:00:02.476Z | SOL | SHORT_CONFIRMED | 91.225 |  | 0.619% | 1.036% | 2.571% | 2.143% | 2.044% | 5.662% | 2.680% | 0.455% |  |
| 2026-05-15T12:15:02.494Z | ETH | SHORT_CONFIRMED | 2250.755 |  | -0.101% | 0.145% | 1.061% | 1.451% | 1.124% | 3.477% | 1.745% | -0.302% |  |
| 2026-05-15T15:00:02.528Z | ETH | SHORT_CONFIRMED | 2212.395 |  | -0.185% | -0.428% | -0.443% | -0.394% | -0.722% | 1.570% | -0.054% | -0.803% |  |
| 2026-05-15T18:15:02.016Z | ETH | LONG_CONFIRMED | 2230.255 |  | -0.156% | -0.303% | -0.506% | -0.172% | -0.513% | -2.424% | -0.156% | -0.680% | 1095m LONG_INVALIDATED (other) -2.514% |
| 2026-05-15T19:30:02.008Z | BTC | SHORT_CONFIRMED | 79064.45 |  | -0.053% | 0.054% | 0.019% | 0.024% | 0.763% | 1.041% | 0.196% | -0.073% |  |
| 2026-05-16T00:00:02.645Z | SOL | LONG_CONFIRMED | 89.175 |  | 0.095% | 0.017% | -0.275% | -1.979% | -3.493% | -2.989% | 0.207% | -0.275% | 1260m LONG_INVALIDATED (other) -2.848% |
| 2026-05-16T00:20:55.241Z | BTC | LONG_CONFIRMED | 79119.65 |  | -0.120% | -0.166% | -0.165% | -0.970% | -1.554% | -1.250% | 0.006% | -0.179% | 1014m LONG_INVALIDATED (other) -1.144% |
| 2026-05-16T00:20:55.241Z | SOL | LONG_CONFIRMED | 89.285 |  | -0.151% | -0.353% | -0.622% | -2.044% | -3.623% | -3.186% | 0.017% | -0.398% | 1239m LONG_INVALIDATED (other) -2.968% |
| 2026-05-16T00:20:55.241Z | CROSS_ASSET | CROSS_ASSET_COVER | n/a |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-16T05:15:02.810Z | ETH | LONG_CONFIRMED | 2223.785 |  | -0.038% | -0.224% | -2.478% | -2.197% | -2.094% | -1.644% | 0.055% | -1.751% | 435m LONG_INVALIDATED (other) -2.230% |
| 2026-05-16T09:30:02.527Z | SOL | SHORT_CONFIRMED | 85.925 |  | 0.169% | 0.192% | -0.367% | -1.007% | -0.646% | -0.890% | 0.367% | -0.413% |  |
| 2026-05-16T11:45:03.072Z | ETH | LONG_CONFIRMED | 2177.485 |  | -0.229% | -0.106% | 0.062% | 0.020% | 0.069% | 0.583% | 0.176% | -0.253% | 45m LONG_INVALIDATED (other) -0.152% |
| 2026-05-16T12:00:01.602Z | BTC | SHORT_CONFIRMED | 78027.55 |  | 0.017% | 0.068% | -0.211% | -0.287% | -0.127% | -0.408% | 0.242% | -0.183% |  |
| 2026-05-16T12:30:02.069Z | ETH | LONG_INVALIDATED | 2174.185 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-16T12:42:14.641Z | BTC | LONG_CONFIRMED | 78017.85 |  | -0.214% | -0.229% | 0.074% | 0.212% | 0.087% | 0.500% | 0.318% | -0.229% | 273m LONG_INVALIDATED (other) 0.253% |
| 2026-05-16T13:30:02.192Z | BTC | LONG_CONFIRMED | 77911.25 |  | -0.012% | 0.333% | 0.432% | 0.374% | 0.037% | 0.395% | 0.456% | -0.093% | 225m LONG_INVALIDATED (other) 0.390% |
| 2026-05-16T13:45:01.669Z | ETH | LONG_CONFIRMED | 2176.095 |  | -0.037% | 0.113% | 0.085% | 0.208% | -0.342% | 0.661% | 0.240% | -0.256% |  |
| 2026-05-16T14:00:02.730Z | SOL | LONG_CONFIRMED | 86.245 |  | 0.122% | 0.087% | 0.504% | 0.296% | -0.377% | 0.041% | 0.632% | -0.261% | 420m LONG_INVALIDATED (other) 0.452% |
| 2026-05-16T14:57:27.854Z | BTC | LONG_CONFIRMED | 78087.15 |  | 0.031% | 0.135% | 0.142% | 0.074% | -0.294% | -0.118% | 0.229% | -0.041% | 138m LONG_INVALIDATED (other) 0.164% |
| 2026-05-16T17:15:02.785Z | BTC | LONG_INVALIDATED | 78214.85 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-16T17:30:01.880Z | BTC | SHORT_CONFIRMED | 78244.45 |  | 0.082% | 0.121% | 0.053% | 0.389% | 0.139% | 0.425% | 0.121% | -0.028% |  |
| 2026-05-16T20:15:02.177Z | ETH | LONG_CONFIRMED | 2180.485 |  | -0.029% | -0.036% | 0.085% | 0.175% | 0.129% | 0.299% | 0.097% | -0.073% |  |
| 2026-05-16T20:17:02.852Z | SOL | LONG_CONFIRMED | 86.805 |  | -0.167% | -0.225% | -0.351% | -0.086% | -0.282% | -0.225% | 0.017% | -0.374% | 43m LONG_INVALIDATED (other) -0.196% |
| 2026-05-16T21:00:02.554Z | SOL | LONG_INVALIDATED | 86.635 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-16T21:05:48.017Z | SOL | SHORT_CONFIRMED | 86.675 |  | 0.225% | 0.202% | 0.548% | -0.398% | -0.179% | -0.029% | 0.767% | 0.075% |  |
| 2026-05-16T21:45:10.836Z | BTC | LONG_CONFIRMED | 78246.35 |  | -0.023% | -0.130% | -0.707% | -0.230% | -0.051% | 0.138% | -0.020% | -0.656% |  |
| 2026-05-16T23:15:02.214Z | BTC | SHORT_CONFIRMED | 78150.05 |  | 0.029% | -0.018% | 0.285% | 0.183% | -0.213% | 0.469% | 0.584% | -0.035% |  |
| 2026-05-17T01:45:01.871Z | ETH | SHORT_CONFIRMED | 2168.455 |  | -0.154% | -0.172% | -0.744% | -0.810% | -1.015% | 2.736% | -0.009% | -0.972% |  |
| 2026-05-17T04:15:01.829Z | ETH | SHORT_CONFIRMED | 2181.455 |  | -0.249% | -0.370% | -0.085% | -0.508% | -0.183% | 3.131% | 0.014% | -0.370% |  |
| 2026-05-17T07:20:56.879Z | BTC | SHORT_CONFIRMED | 78010.35 |  | -0.130% | -0.035% | -0.369% | 0.098% | -0.228% | 1.315% | -0.022% | -0.607% |  |
| 2026-05-17T07:20:56.879Z | SOL | LONG_CONFIRMED | 86.765 |  | 0.179% | -0.236% | 0.029% | -0.582% | -0.398% | -2.196% | 0.386% | -0.236% | 1799m LONG_INVALIDATED (other) -1.763% |
| 2026-05-17T10:00:02.387Z | ETH | LONG_CONFIRMED | 2188.835 |  | 0.172% | 0.037% | -0.126% | -0.282% | -0.294% | -3.508% | 0.310% | -0.077% |  |
| 2026-05-17T11:30:02.043Z | BTC | SHORT_CONFIRMED | 78294.85 |  | -0.070% | -0.145% | 0.461% | 0.136% | 1.416% | 1.271% | 0.441% | -0.145% |  |
| 2026-05-17T12:00:02.512Z | SOL | LONG_CONFIRMED | 86.845 |  | 0.017% | -0.478% | -0.455% | -0.144% | -2.297% | -1.940% | 0.052% | -0.697% | 1520m LONG_INVALIDATED (other) -1.854% |
| 2026-05-17T13:20:16.937Z | SOL | SHORT_CONFIRMED | 86.325 |  | -0.041% | 0.052% | 0.226% | -0.608% | 1.720% | 1.419% | 0.295% | -0.261% |  |
| 2026-05-17T14:00:02.456Z | ETH | LONG_CONFIRMED | 2190.845 |  | -0.329% | -0.194% | -0.374% | -0.385% | -3.150% | -3.102% | -0.159% | -0.614% |  |
| 2026-05-17T14:30:01.961Z | BTC | SHORT_CONFIRMED | 78004.05 |  | 0.012% | 0.090% | -0.087% | 0.063% | 1.525% | 1.757% | 0.184% | -0.131% |  |
| 2026-05-17T19:15:01.982Z | ETH | LONG_CONFIRMED | 2187.135 |  | 0.171% | -0.006% | -0.820% | -3.144% | -3.397% | -3.770% | 0.221% | -0.678% |  |
| 2026-05-17T21:00:02.427Z | SOL | SHORT_CONFIRMED | 86.605 |  | -0.271% | 0.352% | 1.634% | 1.588% | 2.338% | 1.819% | 2.592% | -0.306% |  |
| 2026-05-18T00:00:02.237Z | ETH | SHORT_CONFIRMED | 2129.265 |  | 0.984% | 0.753% | 0.412% | 0.449% | -0.572% | -0.090% | 0.984% | 0.349% |  |
| 2026-05-18T00:15:02.144Z | SOL | LONG_CONFIRMED | 84.845 |  | 0.513% | 0.407% | -0.194% | -0.077% | 0.348% | 0.819% | 0.513% | -0.265% | 785m LONG_INVALIDATED (other) 0.460% |
| 2026-05-18T02:15:02.543Z | SOL | LONG_CONFIRMED | 85.255 |  | -0.522% | -0.381% | -0.944% | -1.144% | -1.284% | -0.217% | -0.018% | -0.721% | 665m LONG_INVALIDATED (other) -0.023% |
| 2026-05-18T07:20:22.627Z | BTC | SHORT_CONFIRMED | 76758.85 |  | -0.339% | -0.235% | -0.048% | 0.873% | 0.199% | -0.395% | 0.081% | -0.339% |  |
| 2026-05-18T12:15:02.324Z | SOL | LONG_CONFIRMED | 85.235 |  | 0.323% | -0.006% | -1.402% | -0.006% | 0.358% | -0.827% | 0.452% | -1.860% | 65m LONG_INVALIDATED (other) 0.000% |
| 2026-05-18T13:19:58.890Z | SOL | LONG_INVALIDATED | 85.235 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-18T13:19:58.890Z | SOL | SHORT_CONFIRMED | 85.235 |  | 0.698% | 1.261% | 0.991% | 0.006% | 0.276% | 1.074% | 1.860% | 0.158% |  |
| 2026-05-18T14:00:02.542Z | BTC | SHORT_CONFIRMED | 76890.95 |  | 0.521% | 0.834% | 0.638% | -0.266% | 0.334% | 0.401% | 1.043% | 0.291% |  |
| 2026-05-18T20:15:01.848Z | BTC | LONG_CONFIRMED | 77006.75 |  | -0.108% | -0.171% | 0.140% | -0.470% | 0.004% | -0.162% | 0.123% | -0.182% |  |
| 2026-05-18T21:30:02.125Z | BTC | SHORT_CONFIRMED | 76971.15 |  | -0.162% | -0.022% | 0.196% | 0.155% | 0.325% | 0.009% | 0.361% | -0.211% |  |
| 2026-05-18T22:15:02.094Z | ETH | LONG_CONFIRMED | 2134.635 |  | -0.068% | -0.030% | -0.197% | -0.040% | -0.952% | -1.534% | 0.189% | -0.539% |  |
| 2026-05-18T23:45:01.899Z | ETH | LONG_CONFIRMED | 2132.525 |  | 0.073% | 0.083% | -0.161% | 0.306% | -1.097% | -1.060% | 0.221% | -0.561% |  |
| 2026-05-19T00:19:54.943Z | ETH | LONG_CONFIRMED | 2134.395 |  | -0.005% | -0.489% | -0.339% | -0.112% | -0.899% | -1.289% | 0.133% | -0.648% |  |
| 2026-05-19T03:45:01.878Z | ETH | LONG_CONFIRMED | 2130.295 |  | -0.147% | 0.061% | 0.411% | -1.058% | -1.081% | -0.960% | 0.488% | -0.147% |  |
| 2026-05-19T06:00:02.782Z | SOL | LONG_CONFIRMED | 85.075 |  | 0.476% | 0.264% | -0.570% | -0.876% | -0.488% | -0.335% | 0.476% | -0.488% | 195m LONG_INVALIDATED (other) 0.059% |
| 2026-05-19T07:20:07.937Z | SOL | LONG_CONFIRMED | 85.355 |  | 0.076% | -0.264% | -1.013% | -1.435% | -1.341% | -0.674% | 0.076% | -1.177% | 115m LONG_INVALIDATED (other) -0.269% |
| 2026-05-19T08:00:01.860Z | SOL | LONG_CONFIRMED | 85.425 |  | -0.100% | -0.369% | -1.305% | -1.563% | -1.247% | -0.884% | -0.100% | -1.434% | 75m LONG_INVALIDATED (other) -0.351% |
| 2026-05-19T09:15:02.464Z | SOL | LONG_INVALIDATED | 85.125 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-19T09:30:02.112Z | SOL | SHORT_CONFIRMED | 84.495 |  | -0.112% | 0.172% | -0.065% | -0.124% | -0.041% | -0.527% | 0.349% | -0.243% |  |
| 2026-05-19T11:30:02.667Z | BTC | LONG_CONFIRMED | 76808.35 |  | -0.130% | 0.038% | -0.491% | 0.006% | 0.026% | 0.640% | 0.104% | -0.614% |  |
| 2026-05-19T13:00:02.321Z | SOL | SHORT_CONFIRMED | 84.715 |  | 0.195% | 0.454% | 0.006% | 0.207% | 0.466% | -0.171% | 0.773% | -0.089% |  |
| 2026-05-19T13:19:34.267Z | ETH | SHORT_CONFIRMED | 2110.555 |  | -0.305% | 0.236% | -0.332% | -0.291% | 0.377% | -0.852% | 0.344% | -0.457% |  |
| 2026-05-19T16:15:02.416Z | BTC | LONG_CONFIRMED | 76406.95 |  | 0.561% | 0.520% | 0.602% | 0.140% | 0.406% | 0.717% | 0.764% | 0.181% |  |
| 2026-05-19T20:19:40.686Z | BTC | SHORT_CONFIRMED | 76862.75 |  | -0.120% | -0.093% | 0.338% | 0.190% | -0.414% | -0.937% | 0.454% | -0.133% |  |
| 2026-05-19T22:30:01.767Z | ETH | SHORT_CONFIRMED | 2101.555 |  | -0.368% | -0.601% | -0.440% | -1.240% | -1.360% | -1.063% | -0.050% | -0.601% |  |
| 2026-05-20T00:19:39.753Z | SOL | SHORT_CONFIRMED | 83.945 |  | -0.244% | 0.113% | -0.137% | -0.959% | -0.983% | -2.651% | 0.113% | -0.447% |  |
| 2026-05-20T01:45:01.800Z | BTC | LONG_CONFIRMED | 76545.15 |  | 0.240% | 0.032% | 0.751% | 1.151% | 0.559% | 1.619% | 0.799% | 0.014% |  |
| 2026-05-20T02:30:02.496Z | SOL | LONG_CONFIRMED | 84.205 |  | -0.327% | -0.172% | 0.730% | 0.861% | 1.550% | 2.892% | 0.695% | -0.374% |  |
| 2026-05-20T06:45:02.391Z | BTC | LONG_CONFIRMED | 77231.15 |  | 0.038% | -0.041% | 0.264% | 0.225% | 0.143% | 0.408% | 0.362% | -0.065% |  |
| 2026-05-20T07:20:10.612Z | ETH | SHORT_CONFIRMED | 2129.195 |  | 0.097% | 0.033% | 0.132% | -0.363% | -0.294% | 0.073% | 0.112% | -0.259% |  |
| 2026-05-20T10:15:02.397Z | ETH | LONG_CONFIRMED | 2130.285 |  | -0.077% | -0.183% | -0.054% | 0.145% | -0.258% | -0.741% | 0.084% | -0.608% |  |
| 2026-05-20T10:30:02.504Z | BTC | LONG_CONFIRMED | 77521.95 |  | -0.167% | -0.287% | -0.268% | -0.141% | -0.203% | -0.311% | 0.029% | -0.708% |  |
| 2026-05-20T11:15:02.501Z | SOL | LONG_CONFIRMED | 84.875 |  | -0.289% | -0.124% | 1.243% | 1.467% | 1.149% | 1.043% | 1.137% | -0.713% |  |
| 2026-05-20T11:30:02.351Z | BTC | SHORT_CONFIRMED | 77386.35 |  | 0.067% | -0.056% | 0.050% | -0.228% | -0.027% | 0.264% | 0.534% | -0.204% |  |
| 2026-05-20T13:00:02.877Z | SOL | LONG_CONFIRMED | 85.065 |  | -0.935% | -0.511% | 1.699% | 1.393% | 2.016% | 0.935% | 1.581% | -0.935% |  |
| 2026-05-20T13:19:39.958Z | SOL | SHORT_CONFIRMED | 84.835 |  | 0.301% | -0.242% | -2.222% | -1.291% | -1.904% | -1.173% | 0.666% | -1.974% |  |
| 2026-05-20T18:45:02.270Z | SOL | SHORT_CONFIRMED | 85.865 |  | -0.297% | -0.285% | -0.111% | -0.809% | -0.425% | -1.310% | 0.181% | -0.448% |  |
| 2026-05-20T22:00:02.850Z | ETH | SHORT_CONFIRMED | 2128.155 |  | 0.200% | 0.272% | -0.535% | -0.226% | 0.074% | -0.233% | 0.397% | -0.797% |  |
| 2026-05-20T22:45:02.230Z | ETH | LONG_CONFIRMED | 2123.785 |  | -0.033% | 0.165% | 0.745% | 0.131% | -0.564% | 0.296% | 1.004% | -0.067% |  |
| 2026-05-21T00:15:02.520Z | SOL | LONG_CONFIRMED | 86.265 |  | 0.342% | 0.214% | 0.701% | 0.806% | -0.933% | 0.840% | 0.655% | -0.110% |  |
| 2026-05-21T00:30:02.389Z | ETH | LONG_CONFIRMED | 2133.135 |  | 0.561% | 0.333% | 0.415% | 0.099% | -0.841% | -0.172% | 0.561% | 0.070% |  |
| 2026-05-21T05:15:02.454Z | ETH | SHORT_CONFIRMED | 2140.205 |  | 0.276% | 0.343% | 0.196% | 1.205% | -0.286% | 0.349% | 0.759% | -0.193% |  |
| 2026-05-21T05:30:02.452Z | SOL | SHORT_CONFIRMED | 86.555 |  | 0.283% | 0.364% | 0.156% | 1.461% | -1.022% | -0.352% | 0.375% | -0.549% |  |
| 2026-05-21T11:00:02.093Z | BTC | LONG_CONFIRMED | 77127.85 |  | 0.070% | -0.026% | -0.055% | 0.438% | 0.531% | 0.128% | 0.180% | -0.551% |  |
| 2026-05-21T15:15:02.646Z | SOL | LONG_CONFIRMED | 86.335 |  | 0.075% | -0.087% | 1.199% | 0.851% | 0.666% | 0.353% | 1.651% | -0.330% |  |
| 2026-05-21T18:30:02.382Z | BTC | SHORT_CONFIRMED | 77673.45 |  | 0.267% | 0.147% | 0.139% | 0.156% | 0.444% | 1.505% | 0.515% | -0.054% |  |
| 2026-05-21T18:30:02.382Z | ETH | SHORT_CONFIRMED | 2138.195 |  | 0.327% | 0.112% | 0.295% | 0.142% | 0.659% | 1.505% | 0.619% | -0.144% |  |
| 2026-05-21T19:45:02.413Z | BTC | SHORT_CONFIRMED | 77555.05 |  | -0.084% | -0.081% | -0.009% | -0.166% | 0.316% | 2.329% | 0.022% | -0.207% |  |
| 2026-05-21T21:00:02.629Z | SOL | SHORT_CONFIRMED | 87.505 |  | 0.211% | 0.291% | 0.714% | 0.577% | 0.486% | 2.931% | 0.840% | 0.029% |  |
| 2026-05-21T22:15:02.236Z | SOL | SHORT_CONFIRMED | 87.255 |  | 0.166% | 0.304% | 0.304% | 0.934% | 0.350% | 2.710% | 0.579% | -0.040% |  |

### Directional HIGH precision summary, excluding pre-fix rows

| horizon | n | hit rate > 0 | avg directional return |
| --- | --- | --- | --- |
| 30m | 173 | 52.6% | 0.031% |
| 1h | 173 | 48.0% | -0.005% |
| 4h | 173 | 50.3% | 0.060% |
| 8h | 173 | 49.7% | -0.115% |
| 12h | 173 | 43.9% | -0.161% |
| 24h | 173 | 50.3% | -0.057% |

## 2. Per-Penalty Outcome Split

Rows come from `phase1b-replay-report.json`. Positive return means price rose after a BUY-risk penalty; for a penalty intended to block bad longs, lower/negative is better.

| penalty / combo | mode | n | avg next-4 | median next-4 | positive rate | assets |
| --- | --- | --- | --- | --- | --- | --- |
| btc_gate_weak_penalize_alt_longs | ALONE | 3 | 0.099% | 0.108% | 100.0% | {"ETH":2,"SOL":1} |
| btc_gate_weak_penalize_alt_longs | ANY | 157 | 0.016% | 0.007% | 50.3% | {"ETH":45,"SOL":112} |
| btc_gate_weak_penalize_alt_longs+cvd_divergence_against_direction | COMBO | 3 | -0.080% | -0.069% | 33.3% | {"ETH":3} |
| btc_gate_weak_penalize_alt_longs+cvd_divergence_against_direction+failed_breakout_counter_ge_2 | COMBO | 1 | -0.308% | -0.308% | 0.0% | {"SOL":1} |
| btc_gate_weak_penalize_alt_longs+cvd_divergence_against_direction+failed_breakout_counter_ge_2+flow_consensus_unconfirmed_streak_2 | COMBO | 1 | -0.225% | -0.225% | 0.0% | {"SOL":1} |
| btc_gate_weak_penalize_alt_longs+cvd_divergence_against_direction+failed_breakout_counter_ge_2+flow_consensus_unconfirmed_streak_lt_2 | COMBO | 7 | -0.011% | 0.065% | 57.1% | {"ETH":2,"SOL":5} |
| btc_gate_weak_penalize_alt_longs+cvd_divergence_against_direction+failed_breakout_counter_ge_5 | COMBO | 3 | -0.076% | -0.064% | 33.3% | {"SOL":3} |
| btc_gate_weak_penalize_alt_longs+cvd_divergence_against_direction+failed_breakout_counter_ge_5+flow_consensus_unconfirmed_streak_2 | COMBO | 3 | -0.240% | -0.043% | 33.3% | {"SOL":3} |
| btc_gate_weak_penalize_alt_longs+cvd_divergence_against_direction+failed_breakout_counter_ge_5+flow_consensus_unconfirmed_streak_lt_2 | COMBO | 6 | -0.030% | 0.023% | 50.0% | {"ETH":1,"SOL":5} |
| btc_gate_weak_penalize_alt_longs+cvd_divergence_against_direction+flow_consensus_unconfirmed_streak_2 | COMBO | 3 | -0.221% | 0.025% | 66.7% | {"ETH":3} |
| btc_gate_weak_penalize_alt_longs+cvd_divergence_against_direction+flow_consensus_unconfirmed_streak_lt_2 | COMBO | 18 | 0.037% | -0.005% | 44.4% | {"ETH":14,"SOL":4} |
| btc_gate_weak_penalize_alt_longs+failed_breakout_counter_ge_2 | COMBO | 2 | 0.076% | 0.470% | 50.0% | {"SOL":2} |
| btc_gate_weak_penalize_alt_longs+failed_breakout_counter_ge_2+flow_consensus_unconfirmed_streak_2 | COMBO | 5 | 0.042% | 0.236% | 60.0% | {"SOL":5} |
| btc_gate_weak_penalize_alt_longs+failed_breakout_counter_ge_2+flow_consensus_unconfirmed_streak_lt_2 | COMBO | 16 | -0.012% | 0.062% | 56.3% | {"ETH":3,"SOL":13} |
| btc_gate_weak_penalize_alt_longs+failed_breakout_counter_ge_5 | COMBO | 14 | 0.228% | 0.083% | 50.0% | {"SOL":14} |
| btc_gate_weak_penalize_alt_longs+failed_breakout_counter_ge_5+flow_consensus_unconfirmed_streak_2 | COMBO | 7 | -0.045% | -0.062% | 14.3% | {"SOL":7} |
| btc_gate_weak_penalize_alt_longs+failed_breakout_counter_ge_5+flow_consensus_unconfirmed_streak_lt_2 | COMBO | 36 | 0.018% | 0.062% | 52.8% | {"ETH":5,"SOL":31} |
| btc_gate_weak_penalize_alt_longs+flow_consensus_unconfirmed_streak_2 | COMBO | 6 | 0.046% | 0.098% | 50.0% | {"ETH":3,"SOL":3} |
| btc_gate_weak_penalize_alt_longs+flow_consensus_unconfirmed_streak_lt_2 | COMBO | 23 | 0.007% | 0.027% | 56.5% | {"ETH":9,"SOL":14} |
| cvd_divergence_against_direction | ALONE | 21 | 0.031% | 0.065% | 76.2% | {"BTC":8,"ETH":13} |
| cvd_divergence_against_direction | ANY | 227 | 0.008% | 0.009% | 51.1% | {"BTC":62,"ETH":99,"SOL":66} |
| cvd_divergence_against_direction+failed_breakout_counter_ge_2 | COMBO | 7 | -0.009% | 0.113% | 57.1% | {"ETH":2,"SOL":5} |
| cvd_divergence_against_direction+failed_breakout_counter_ge_2+flow_consensus_unconfirmed_streak_2 | COMBO | 2 | -0.425% | -0.117% | 0.0% | {"ETH":1,"SOL":1} |
| cvd_divergence_against_direction+failed_breakout_counter_ge_2+flow_consensus_unconfirmed_streak_lt_2 | COMBO | 18 | -0.087% | -0.037% | 33.3% | {"BTC":3,"ETH":1,"SOL":14} |
| cvd_divergence_against_direction+failed_breakout_counter_ge_5 | COMBO | 4 | 0.185% | 0.484% | 75.0% | {"BTC":2,"SOL":2} |
| cvd_divergence_against_direction+failed_breakout_counter_ge_5+flow_consensus_unconfirmed_streak_2 | COMBO | 5 | -0.116% | -0.182% | 20.0% | {"BTC":1,"SOL":4} |
| cvd_divergence_against_direction+failed_breakout_counter_ge_5+flow_consensus_unconfirmed_streak_lt_2 | COMBO | 23 | 0.085% | 0.014% | 52.2% | {"BTC":8,"ETH":2,"SOL":13} |
| cvd_divergence_against_direction+flow_consensus_unconfirmed_streak_2 | COMBO | 18 | 0.095% | 0.027% | 55.6% | {"BTC":7,"ETH":10,"SOL":1} |
| cvd_divergence_against_direction+flow_consensus_unconfirmed_streak_lt_2 | COMBO | 84 | 0.021% | 0.030% | 52.4% | {"BTC":33,"ETH":47,"SOL":4} |
| failed_breakout_counter_ge_2 | ALONE | 11 | 0.141% | 0.104% | 54.5% | {"BTC":1,"SOL":10} |
| failed_breakout_counter_ge_2 | ANY | 125 | -0.016% | -0.011% | 48.8% | {"BTC":14,"ETH":13,"SOL":98} |
| failed_breakout_counter_ge_2+flow_consensus_unconfirmed_streak_2 | COMBO | 11 | -0.066% | -0.115% | 36.4% | {"BTC":2,"SOL":9} |
| failed_breakout_counter_ge_2+flow_consensus_unconfirmed_streak_lt_2 | COMBO | 44 | 0.004% | 0.031% | 54.5% | {"BTC":8,"ETH":4,"SOL":32} |
| failed_breakout_counter_ge_5 | ALONE | 41 | 0.245% | 0.150% | 63.4% | {"SOL":41} |
| failed_breakout_counter_ge_5 | ANY | 265 | 0.094% | 0.023% | 54.3% | {"BTC":36,"ETH":17,"SOL":212} |
| failed_breakout_counter_ge_5+flow_consensus_unconfirmed_streak_2 | COMBO | 32 | 0.078% | 0.054% | 62.5% | {"BTC":6,"ETH":1,"SOL":25} |
| failed_breakout_counter_ge_5+flow_consensus_unconfirmed_streak_lt_2 | COMBO | 91 | 0.085% | 0.024% | 54.9% | {"BTC":19,"ETH":8,"SOL":64} |
| flow_consensus_unconfirmed_streak_2 | ANY | 93 | 0.007% | 0.000% | 48.4% | {"BTC":16,"ETH":18,"SOL":59} |
| flow_consensus_unconfirmed_streak_lt_2 | ANY | 366 | 0.030% | 0.022% | 52.5% | {"BTC":71,"ETH":96,"SOL":199} |

## 3. BTC Gate Flip Frequency

| asset | rows | changes | change rate | NEUTRAL<->WEAK flips | top transitions |
| --- | --- | --- | --- | --- | --- |
| ETH | 1531 | 1066 | 69.7% | 254 | BTC_WEAK_PENALIZE_ALT_LONGS -> NEUTRAL: 93; BTC_STRONG_ALT_NOT_FOLLOWING -> BTC_WEAK_PENALIZE_ALT_LONGS: 92; NEUTRAL -> BTC_WEAK_PENALIZE_ALT_LONGS: 86; NEUTRAL -> BTC_STRONG_ALT_NOT_FOLLOWING: 84; BTC_WEAK_PENALIZE_ALT_LONGS -> BTC_STRONG_ALT_NOT_FOLLOWING: 81 |
| SOL | 1531 | 1043 | 68.2% | 254 | BTC_WEAK_PENALIZE_ALT_LONGS -> NEUTRAL: 93; NEUTRAL -> BTC_WEAK_PENALIZE_ALT_LONGS: 86; BTC_WEAK_PENALIZE_ALT_LONGS -> BTC_STRONG_ALT_NOT_FOLLOWING: 84; BTC_STRONG_ALT_NOT_FOLLOWING -> BTC_WEAK_PENALIZE_ALT_LONGS: 81; BTC_CONFIRMS_ALT_LONG_CONTEXT -> BTC_WEAK_PENALIZE_ALT_LONGS: 76 |

## 4. SHORT_CONFIRMED Timing vs Local Lows

`forward 4h low` shows whether a short had downside left after confirmation. `surrounding low lag` uses a window from 2h before to 4h after alert; positive lag means the alert fired after the local low, i.e. likely late.

| time | asset | alert price | forward 4h low | minutes to fwd low | return to fwd low | surrounding low | alert lag vs surrounding low |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-05-09T01:30:02.035Z | SOL | 92.445 | 2026-05-09T05:15:01.228Z @ 93.08 | 225 | -0.687% | 2026-05-08T23:45:01.741Z @ 91.8 | 105m |
| 2026-05-09T09:30:19.781Z | BTC | 80221.15 | 2026-05-09T10:15:01.944Z @ 80170.9 | 45 | 0.063% | 2026-05-09T10:15:01.944Z @ 80170.9 | -45m |
| 2026-05-09T17:00:02.270Z | ETH | 2319.085 | 2026-05-09T19:45:01.935Z @ 2326.81 | 165 | -0.333% | 2026-05-09T15:15:01.305Z @ 2302.51 | 105m |
| 2026-05-09T18:30:02.134Z | ETH | 2335.625 | 2026-05-09T19:45:01.935Z @ 2326.81 | 75 | 0.377% | 2026-05-09T16:45:01.458Z @ 2318.5 | 105m |
| 2026-05-09T23:30:02.136Z | BTC | 80645.75 | 2026-05-10T01:30:02.063Z @ 80564.9 | 120 | 0.100% | 2026-05-10T01:30:02.063Z @ 80564.9 | -120m |
| 2026-05-09T23:30:02.136Z | ETH | 2325.595 | 2026-05-10T01:45:01.930Z @ 2319 | 135 | 0.284% | 2026-05-10T01:45:01.930Z @ 2319 | -135m |
| 2026-05-10T04:00:02.274Z | ETH | 2326.675 | 2026-05-10T04:15:01.353Z @ 2326.15 | 15 | 0.023% | 2026-05-10T02:15:01.309Z @ 2321.13 | 105m |
| 2026-05-10T05:45:02.388Z | ETH | 2327.305 | 2026-05-10T06:00:01.436Z @ 2326.4 | 15 | 0.039% | 2026-05-10T04:15:01.353Z @ 2326.15 | 90m |
| 2026-05-10T09:45:02.771Z | ETH | 2327.015 | 2026-05-10T11:45:02.247Z @ 2320.74 | 120 | 0.270% | 2026-05-10T11:45:02.247Z @ 2320.74 | -120m |
| 2026-05-10T10:15:02.487Z | SOL | 93.785 | 2026-05-10T13:00:02.049Z @ 93.24 | 165 | 0.581% | 2026-05-10T13:00:02.049Z @ 93.24 | -165m |
| 2026-05-10T14:30:02.724Z | BTC | 80877.65 | 2026-05-10T14:45:01.628Z @ 80851 | 15 | 0.033% | 2026-05-10T14:45:01.628Z @ 80851 | -15m |
| 2026-05-10T14:45:02.161Z | ETH | 2329.765 | 2026-05-10T15:00:01.564Z @ 2329.65 | 15 | 0.005% | 2026-05-10T13:00:02.049Z @ 2322.31 | 105m |
| 2026-05-10T18:30:01.752Z | BTC | 81326.65 | 2026-05-10T21:15:01.797Z @ 80630.2 | 165 | 0.856% | 2026-05-10T21:15:01.797Z @ 80630.2 | -165m |
| 2026-05-10T20:15:02.678Z | ETH | 2354.025 | 2026-05-10T21:15:01.797Z @ 2325.9 | 60 | 1.195% | 2026-05-10T21:15:01.797Z @ 2325.9 | -60m |
| 2026-05-11T00:19:28.861Z | ETH | 2353.575 | 2026-05-11T03:30:01.790Z @ 2324.38 | 191 | 1.240% | 2026-05-11T03:30:01.790Z @ 2324.38 | -191m |
| 2026-05-11T07:00:01.760Z | BTC | 80794.05 | 2026-05-11T08:30:02.110Z @ 80624 | 90 | 0.210% | 2026-05-11T08:30:02.110Z @ 80624 | -90m |
| 2026-05-11T12:45:02.062Z | ETH | 2331.685 | 2026-05-11T14:45:01.750Z @ 2311.72 | 120 | 0.856% | 2026-05-11T14:45:01.750Z @ 2311.72 | -120m |
| 2026-05-11T13:19:48.986Z | BTC | 81196.15 | 2026-05-11T14:45:01.750Z @ 80773.9 | 85 | 0.520% | 2026-05-11T14:45:01.750Z @ 80773.9 | -85m |
| 2026-05-11T17:00:02.470Z | ETH | 2329.075 | 2026-05-11T17:15:01.525Z @ 2325.04 | 15 | 0.173% | 2026-05-11T15:15:01.609Z @ 2319.91 | 105m |
| 2026-05-11T18:30:02.228Z | ETH | 2340.015 | 2026-05-11T19:00:01.940Z @ 2333.67 | 30 | 0.271% | 2026-05-11T17:15:01.525Z @ 2325.04 | 75m |
| 2026-05-11T23:00:02.168Z | BTC | 81763.85 | 2026-05-12T01:45:01.760Z @ 81015.1 | 165 | 0.916% | 2026-05-12T01:45:01.760Z @ 81015.1 | -165m |
| 2026-05-12T05:15:02.744Z | ETH | 2309.695 | 2026-05-12T09:15:01.903Z @ 2283.11 | 240 | 1.151% | 2026-05-12T09:15:01.903Z @ 2283.11 | -240m |
| 2026-05-12T08:00:02.081Z | SOL | 95.885 | 2026-05-12T11:30:01.806Z @ 94.72 | 210 | 1.215% | 2026-05-12T11:30:01.806Z @ 94.72 | -210m |
| 2026-05-12T08:15:01.993Z | ETH | 2282.675 | 2026-05-12T11:30:01.806Z @ 2282.15 | 195 | 0.023% | 2026-05-12T11:30:01.806Z @ 2282.15 | -195m |
| 2026-05-12T15:00:02.252Z | ETH | 2267.105 | 2026-05-12T15:30:02.067Z @ 2257.68 | 30 | 0.416% | 2026-05-12T15:30:02.067Z @ 2257.68 | -30m |
| 2026-05-12T20:45:02.164Z | ETH | 2282.275 | 2026-05-13T00:00:01.417Z @ 2274.04 | 195 | 0.361% | 2026-05-13T00:00:01.417Z @ 2274.04 | -195m |
| 2026-05-13T05:45:01.909Z | BTC | 81000.05 | 2026-05-13T07:30:01.793Z @ 80894.5 | 105 | 0.130% | 2026-05-13T07:30:01.793Z @ 80894.5 | -105m |
| 2026-05-13T05:45:01.909Z | ETH | 2296.215 | 2026-05-13T06:00:01.737Z @ 2295.86 | 15 | 0.015% | 2026-05-13T06:00:01.737Z @ 2295.86 | -15m |
| 2026-05-13T09:45:02.728Z | BTC | 81206.05 | 2026-05-13T13:45:02.026Z @ 79785.8 | 240 | 1.749% | 2026-05-13T13:45:02.026Z @ 79785.8 | -240m |
| 2026-05-13T10:15:02.523Z | ETH | 2313.555 | 2026-05-13T14:00:01.558Z @ 2261.77 | 225 | 2.238% | 2026-05-13T14:00:01.558Z @ 2261.77 | -225m |
| 2026-05-13T10:45:02.618Z | SOL | 94.805 | 2026-05-13T14:45:02.509Z @ 91.82 | 240 | 3.149% | 2026-05-13T14:45:02.509Z @ 91.82 | -240m |
| 2026-05-13T11:15:02.174Z | BTC | 80543.05 | 2026-05-13T14:00:01.558Z @ 79621.4 | 165 | 1.144% | 2026-05-13T14:00:01.558Z @ 79621.4 | -165m |
| 2026-05-13T13:21:50.116Z | BTC | 80215.55 | 2026-05-13T16:00:01.549Z @ 78819.1 | 158 | 1.741% | 2026-05-13T16:00:01.549Z @ 78819.1 | -158m |
| 2026-05-13T21:30:01.923Z | SOL | 90.875 | 2026-05-13T22:00:02.015Z @ 90.86 | 30 | 0.017% | 2026-05-13T21:30:01.366Z @ 90.84 | 0m |
| 2026-05-14T01:15:02.301Z | SOL | 91.135 | 2026-05-14T04:00:02.045Z @ 89.92 | 165 | 1.333% | 2026-05-14T04:00:02.045Z @ 89.92 | -165m |
| 2026-05-14T02:45:01.733Z | SOL | 91.045 | 2026-05-14T04:00:02.045Z @ 89.92 | 75 | 1.236% | 2026-05-14T04:00:02.045Z @ 89.92 | -75m |
| 2026-05-14T07:15:02.542Z | ETH | 2263.195 | 2026-05-14T10:45:01.407Z @ 2255.54 | 210 | 0.338% | 2026-05-14T10:45:01.407Z @ 2255.54 | -210m |
| 2026-05-14T08:30:02.743Z | BTC | 79731.05 | 2026-05-14T12:00:01.355Z @ 79231.2 | 210 | 0.627% | 2026-05-14T12:00:01.355Z @ 79231.2 | -210m |
| 2026-05-14T11:15:02.313Z | ETH | 2257.335 | 2026-05-14T14:00:01.920Z @ 2248.66 | 165 | 0.384% | 2026-05-14T14:00:01.920Z @ 2248.66 | -165m |
| 2026-05-14T18:30:02.063Z | ETH | 2314.235 | 2026-05-14T20:30:01.813Z @ 2289.41 | 120 | 1.073% | 2026-05-14T20:30:01.813Z @ 2289.41 | -120m |
| 2026-05-15T04:15:01.983Z | BTC | 80984.85 | 2026-05-15T06:00:01.829Z @ 80321.6 | 105 | 0.819% | 2026-05-15T06:00:01.829Z @ 80321.6 | -105m |
| 2026-05-15T05:00:02.183Z | ETH | 2261.335 | 2026-05-15T06:00:01.829Z @ 2244.31 | 60 | 0.753% | 2026-05-15T06:00:01.829Z @ 2244.31 | -60m |
| 2026-05-15T05:00:02.183Z | SOL | 91.225 | 2026-05-15T06:00:01.829Z @ 90.53 | 60 | 0.762% | 2026-05-15T06:00:01.829Z @ 90.53 | -60m |
| 2026-05-15T12:00:02.476Z | SOL | 91.225 | 2026-05-15T15:45:01.474Z @ 88.78 | 225 | 2.680% | 2026-05-15T15:45:01.474Z @ 88.78 | -225m |
| 2026-05-15T12:15:02.494Z | ETH | 2250.755 | 2026-05-15T14:00:01.993Z @ 2211.48 | 105 | 1.745% | 2026-05-15T14:00:01.993Z @ 2211.48 | -105m |
| 2026-05-15T15:00:02.528Z | ETH | 2212.395 | 2026-05-15T15:30:02.206Z @ 2213.58 | 30 | -0.054% | 2026-05-15T14:00:01.993Z @ 2211.48 | 60m |
| 2026-05-15T19:30:02.008Z | BTC | 79064.45 | 2026-05-15T22:00:01.506Z @ 78909.7 | 150 | 0.196% | 2026-05-15T22:00:01.506Z @ 78909.7 | -150m |
| 2026-05-16T09:30:02.527Z | SOL | 85.925 | 2026-05-16T10:30:01.850Z @ 85.61 | 60 | 0.367% | 2026-05-16T10:30:01.850Z @ 85.61 | -60m |
| 2026-05-16T12:00:01.602Z | BTC | 78027.55 | 2026-05-16T13:45:01.319Z @ 77838.9 | 105 | 0.242% | 2026-05-16T10:30:01.850Z @ 77736 | 90m |
| 2026-05-16T17:30:01.880Z | BTC | 78244.45 | 2026-05-16T18:30:02.209Z @ 78150 | 60 | 0.121% | 2026-05-16T16:45:01.994Z @ 78075.9 | 45m |
| 2026-05-16T21:05:48.017Z | SOL | 86.675 | 2026-05-17T01:00:01.540Z @ 86.01 | 234 | 0.767% | 2026-05-17T01:00:01.540Z @ 86.01 | -234m |
| 2026-05-16T23:15:02.214Z | BTC | 78150.05 | 2026-05-17T02:00:02.007Z @ 77693.5 | 165 | 0.584% | 2026-05-17T02:00:02.007Z @ 77693.5 | -165m |
| 2026-05-17T01:45:01.871Z | ETH | 2168.455 | 2026-05-17T02:00:02.007Z @ 2168.65 | 15 | -0.009% | 2026-05-17T01:45:01.288Z @ 2167.98 | 0m |
| 2026-05-17T04:15:01.829Z | ETH | 2181.455 | 2026-05-17T07:20:56.242Z @ 2181.16 | 186 | 0.014% | 2026-05-17T02:15:02.180Z @ 2171.79 | 120m |
| 2026-05-17T07:20:56.879Z | BTC | 78010.35 | 2026-05-17T09:00:01.862Z @ 78027.2 | 99 | -0.022% | 2026-05-17T06:45:01.793Z @ 78005 | 36m |
| 2026-05-17T11:30:02.043Z | BTC | 78294.85 | 2026-05-17T14:45:01.667Z @ 77949.3 | 195 | 0.441% | 2026-05-17T14:45:01.667Z @ 77949.3 | -195m |
| 2026-05-17T13:20:16.937Z | SOL | 86.325 | 2026-05-17T17:15:02.128Z @ 86.07 | 235 | 0.295% | 2026-05-17T17:15:02.128Z @ 86.07 | -235m |
| 2026-05-17T14:30:01.961Z | BTC | 78004.05 | 2026-05-17T17:15:02.128Z @ 77860.6 | 165 | 0.184% | 2026-05-17T17:15:02.128Z @ 77860.6 | -165m |
| 2026-05-17T21:00:02.427Z | SOL | 86.605 | 2026-05-17T23:45:02.030Z @ 84.36 | 165 | 2.592% | 2026-05-17T23:45:02.030Z @ 84.36 | -165m |
| 2026-05-18T00:00:02.237Z | ETH | 2129.265 | 2026-05-18T00:45:01.880Z @ 2108.31 | 45 | 0.984% | 2026-05-18T00:45:01.880Z @ 2108.31 | -45m |
| 2026-05-18T07:20:22.627Z | BTC | 76758.85 | 2026-05-18T11:15:01.967Z @ 76696.7 | 235 | 0.081% | 2026-05-18T06:30:01.907Z @ 76690.2 | 50m |
| 2026-05-18T13:19:58.890Z | SOL | 85.235 | 2026-05-18T15:30:01.619Z @ 83.65 | 130 | 1.860% | 2026-05-18T15:30:01.619Z @ 83.65 | -130m |
| 2026-05-18T14:00:02.542Z | BTC | 76890.95 | 2026-05-18T15:30:01.619Z @ 76089.1 | 90 | 1.043% | 2026-05-18T15:30:01.619Z @ 76089.1 | -90m |
| 2026-05-18T21:30:02.125Z | BTC | 76971.15 | 2026-05-19T01:30:02.118Z @ 76692.9 | 240 | 0.361% | 2026-05-19T01:30:02.118Z @ 76692.9 | -240m |
| 2026-05-19T09:30:02.112Z | SOL | 84.495 | 2026-05-19T11:45:01.897Z @ 84.2 | 135 | 0.349% | 2026-05-19T11:45:01.897Z @ 84.2 | -135m |
| 2026-05-19T13:00:02.321Z | SOL | 84.715 | 2026-05-19T15:00:01.784Z @ 84.06 | 120 | 0.773% | 2026-05-19T15:00:01.784Z @ 84.06 | -120m |
| 2026-05-19T13:19:34.267Z | ETH | 2110.555 | 2026-05-19T15:30:02.001Z @ 2103.3 | 130 | 0.344% | 2026-05-19T15:30:02.001Z @ 2103.3 | -130m |
| 2026-05-19T20:19:40.686Z | BTC | 76862.75 | 2026-05-20T00:19:39.133Z @ 76513.9 | 240 | 0.454% | 2026-05-20T00:19:39.133Z @ 76513.9 | -240m |
| 2026-05-19T22:30:01.767Z | ETH | 2101.555 | 2026-05-20T01:30:02.066Z @ 2102.6 | 180 | -0.050% | 2026-05-19T22:30:01.395Z @ 2101.88 | 0m |
| 2026-05-20T00:19:39.753Z | SOL | 83.945 | 2026-05-20T01:30:02.066Z @ 83.85 | 70 | 0.113% | 2026-05-20T01:30:02.066Z @ 83.85 | -70m |
| 2026-05-20T07:20:10.612Z | ETH | 2129.195 | 2026-05-20T10:00:01.626Z @ 2126.81 | 160 | 0.112% | 2026-05-20T05:30:02.073Z @ 2121.5 | 110m |
| 2026-05-20T11:30:02.351Z | BTC | 77386.35 | 2026-05-20T13:45:01.954Z @ 76972.9 | 135 | 0.534% | 2026-05-20T13:45:01.954Z @ 76972.9 | -135m |
| 2026-05-20T13:19:39.958Z | SOL | 84.835 | 2026-05-20T13:45:01.954Z @ 84.27 | 25 | 0.666% | 2026-05-20T13:45:01.954Z @ 84.27 | -25m |
| 2026-05-20T18:45:02.270Z | SOL | 85.865 | 2026-05-20T22:15:02.116Z @ 85.71 | 210 | 0.181% | 2026-05-20T22:15:02.116Z @ 85.71 | -210m |
| 2026-05-20T22:00:02.850Z | ETH | 2128.155 | 2026-05-20T22:15:02.116Z @ 2119.71 | 15 | 0.397% | 2026-05-20T22:15:02.116Z @ 2119.71 | -15m |
| 2026-05-21T05:15:02.454Z | ETH | 2140.205 | 2026-05-21T07:19:34.481Z @ 2123.97 | 125 | 0.759% | 2026-05-21T07:19:34.481Z @ 2123.97 | -125m |
| 2026-05-21T05:30:02.452Z | SOL | 86.555 | 2026-05-21T07:00:01.588Z @ 86.23 | 90 | 0.375% | 2026-05-21T07:00:01.588Z @ 86.23 | -90m |
| 2026-05-21T18:30:02.382Z | BTC | 77673.45 | 2026-05-21T19:00:01.646Z @ 77273.4 | 30 | 0.515% | 2026-05-21T16:45:01.368Z @ 76972.3 | 105m |
| 2026-05-21T18:30:02.382Z | ETH | 2138.195 | 2026-05-21T19:00:01.646Z @ 2124.97 | 30 | 0.619% | 2026-05-21T16:45:01.368Z @ 2122.32 | 105m |
| 2026-05-21T19:45:02.413Z | BTC | 77555.05 | 2026-05-21T23:15:02.294Z @ 77537.7 | 210 | 0.022% | 2026-05-21T19:00:01.646Z @ 77273.4 | 45m |
| 2026-05-21T21:00:02.629Z | SOL | 87.505 | 2026-05-22T01:00:02.185Z @ 86.77 | 240 | 0.840% | 2026-05-22T01:00:02.185Z @ 86.77 | -240m |
| 2026-05-21T22:15:02.236Z | SOL | 87.255 | 2026-05-22T01:45:01.430Z @ 86.75 | 210 | 0.579% | 2026-05-22T01:45:01.430Z @ 86.75 | -210m |

