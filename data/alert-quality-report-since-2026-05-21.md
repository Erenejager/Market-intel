# Phase 1 Alert Quality Report

Generated: 2026-06-06T09:52:13.055Z
Window: 2026-05-21T00:00:00Z → +∞

## 1. HIGH Alert Outcome Table

Pre-fix rows are labeled and excluded from directional precision summaries. Directional returns are positive when price moved in the alert direction. MFE/MAE use `data/autoresearch/price-15m.jsonl`.

| time | asset | type | price | pre-fix? | +30m | +1h | +4h | +8h | +12h | +24h | MFE 4h | MAE 4h | invalidation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-05-21T00:15:02.520Z | SOL | LONG_CONFIRMED | 86.265 |  | 0.342% | 0.214% | 0.701% | 0.806% | -0.933% | 0.840% | 0.655% | -0.110% | 3915m LONG_INVALIDATED (other) -2.469% |
| 2026-05-21T00:30:02.389Z | ETH | LONG_CONFIRMED | 2133.135 |  | 0.561% | 0.333% | 0.415% | 0.099% | -0.841% | -0.172% | 0.561% | 0.070% | 4470m LONG_INVALIDATED (other) -0.616% |
| 2026-05-21T05:15:02.454Z | ETH | SHORT_CONFIRMED | 2140.205 |  | 0.276% | 0.343% | 0.196% | 1.205% | -0.286% | 0.349% | 0.759% | -0.193% |  |
| 2026-05-21T05:30:02.452Z | SOL | SHORT_CONFIRMED | 86.555 |  | 0.283% | 0.364% | 0.156% | 1.461% | -1.022% | -0.352% | 0.375% | -0.549% | 8385m SHORT_INVALIDATED (other) 2.946% |
| 2026-05-21T11:00:02.093Z | BTC | LONG_CONFIRMED | 77127.85 |  | 0.070% | -0.026% | -0.055% | 0.438% | 0.531% | 0.128% | 0.180% | -0.551% | 2925m LONG_INVALIDATED (other) -3.120% |
| 2026-05-21T15:15:02.646Z | SOL | LONG_CONFIRMED | 86.335 |  | 0.075% | -0.087% | 1.199% | 0.851% | 0.666% | 0.353% | 1.651% | -0.330% | 3015m LONG_INVALIDATED (other) -2.548% |
| 2026-05-21T18:30:02.382Z | BTC | SHORT_CONFIRMED | 77673.45 |  | 0.267% | 0.147% | 0.139% | 0.156% | 0.444% | 1.505% | 0.515% | -0.054% | 8010m SHORT_INVALIDATED (other) 2.348% |
| 2026-05-21T18:30:02.382Z | ETH | SHORT_CONFIRMED | 2138.195 |  | 0.327% | 0.112% | 0.295% | 0.142% | 0.659% | 1.505% | 0.619% | -0.144% |  |
| 2026-05-21T19:45:02.413Z | BTC | SHORT_CONFIRMED | 77555.05 |  | -0.084% | -0.081% | -0.009% | -0.166% | 0.316% | 2.329% | 0.022% | -0.207% | 7935m SHORT_INVALIDATED (other) 2.199% |
| 2026-05-21T21:00:02.629Z | SOL | SHORT_CONFIRMED | 87.505 |  | 0.211% | 0.291% | 0.714% | 0.577% | 0.486% | 2.931% | 0.840% | 0.029% | 7455m SHORT_INVALIDATED (other) 4.000% |
| 2026-05-21T22:15:02.236Z | SOL | SHORT_CONFIRMED | 87.255 |  | 0.166% | 0.304% | 0.304% | 0.934% | 0.350% | 2.710% | 0.579% | -0.040% | 7380m SHORT_INVALIDATED (other) 3.725% |
| 2026-05-22T01:45:01.839Z | SOL | LONG_CONFIRMED | 86.755 |  | 0.317% | 0.409% | 0.121% | 0.548% | 0.617% | -2.622% | 0.490% | 0.075% | 2385m LONG_INVALIDATED (other) -3.020% |
| 2026-05-22T05:15:03.139Z | BTC | SHORT_CONFIRMED | 77601.75 |  | 0.272% | 0.294% | 0.517% | 0.466% | 0.828% | 2.826% | 0.600% | 0.125% | 7365m SHORT_INVALIDATED (other) 2.258% |
| 2026-05-22T06:00:02.077Z | SOL | SHORT_CONFIRMED | 86.715 |  | 0.052% | 0.075% | -0.375% | -0.663% | 0.317% | 2.762% | 0.317% | -0.698% | 6915m SHORT_INVALIDATED (other) 3.125% |
| 2026-05-22T08:00:02.298Z | ETH | LONG_CONFIRMED | 2126.745 |  | -0.218% | -0.367% | 0.338% | -0.390% | -2.663% | -4.719% | 0.121% | -0.367% | 2580m LONG_INVALIDATED (other) -0.317% |
| 2026-05-22T14:30:02.275Z | BTC | SHORT_CONFIRMED | 76777.55 |  | 0.114% | 0.210% | 0.356% | 1.584% | 1.787% | 1.818% | 0.210% | -0.236% | 6810m SHORT_INVALIDATED (other) 1.209% |
| 2026-05-22T15:15:02.565Z | ETH | SHORT_CONFIRMED | 2115.195 |  | -0.136% | -0.149% | 1.495% | 2.283% | 2.228% | 2.654% | 1.299% | -0.563% |  |
| 2026-05-23T00:45:02.794Z | SOL | SHORT_CONFIRMED | 84.145 |  | -0.398% | -0.362% | -0.196% | 2.537% | 2.109% | -1.931% | -0.065% | -0.529% | 5790m SHORT_INVALIDATED (other) 0.166% |
| 2026-05-23T05:15:02.224Z | SOL | LONG_CONFIRMED | 84.265 |  | 0.065% | 0.042% | -2.712% | -1.371% | -0.172% | 1.513% | 0.101% | -2.949% | 735m LONG_INVALIDATED (other) -0.154% |
| 2026-05-23T07:15:02.721Z | SOL | SHORT_CONFIRMED | 84.115 |  | 2.372% | 2.550% | 2.110% | 0.327% | -0.993% | -2.384% | 2.776% | 0.137% | 5400m SHORT_INVALIDATED (other) 0.131% |
| 2026-05-23T10:00:02.789Z | ETH | LONG_CONFIRMED | 2025.565 |  | 0.201% | 0.300% | 0.929% | 2.341% | 4.361% | 4.555% | 0.830% | 0.054% | 1020m LONG_INVALIDATED (other) 4.662% |
| 2026-05-23T10:30:02.606Z | BTC | LONG_CONFIRMED | 74660.05 |  | 0.077% | 0.087% | 0.966% | 1.554% | 2.387% | 3.275% | 0.744% | -0.036% | 75m LONG_INVALIDATED (other) 0.082% |
| 2026-05-23T11:00:02.819Z | ETH | LONG_CONFIRMED | 2029.445 |  | 0.013% | -0.137% | 1.794% | 2.016% | 4.261% | 4.627% | 1.506% | -0.137% | 960m LONG_INVALIDATED (other) 4.462% |
| 2026-05-23T11:45:02.547Z | BTC | LONG_INVALIDATED | 74721.45 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-23T11:45:02.547Z | BTC | SHORT_CONFIRMED | 74721.45 |  | 0.088% | 0.086% | -0.955% | -1.573% | -2.602% | -3.330% | 0.118% | -1.133% | 5535m SHORT_INVALIDATED (other) -1.509% |
| 2026-05-23T15:30:02.790Z | BTC | SHORT_CONFIRMED | 75459.95 |  | 0.003% | 0.044% | -0.478% | -1.527% | -1.585% | -1.176% | 0.163% | -0.542% | 5310m SHORT_INVALIDATED (other) -0.516% |
| 2026-05-23T16:00:02.627Z | SOL | LONG_CONFIRMED | 84.075 |  | 0.006% | 0.054% | 0.886% | 1.754% | 2.183% | 1.612% | 1.041% | -0.172% | 90m LONG_INVALIDATED (other) 0.071% |
| 2026-05-23T17:30:02.421Z | SOL | LONG_INVALIDATED | 84.135 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-23T17:30:02.421Z | SOL | SHORT_CONFIRMED | 84.135 |  | -0.672% | -0.743% | -2.419% | -2.086% | -1.706% | -1.777% | 0.125% | -3.239% | 4785m SHORT_INVALIDATED (other) 0.155% |
| 2026-05-23T18:00:02.712Z | ETH | LONG_CONFIRMED | 2062.225 |  | 0.746% | 0.394% | 2.505% | 2.872% | 2.805% | 1.862% | 3.982% | 0.394% | 540m LONG_INVALIDATED (other) 2.802% |
| 2026-05-24T00:45:02.402Z | BTC | LONG_CONFIRMED | 76654.45 |  | 0.182% | 0.181% | 0.048% | 0.104% | 0.487% | 0.529% | 0.225% | -0.012% | 1005m LONG_INVALIDATED (other) -0.169% |
| 2026-05-24T00:45:02.402Z | ETH | LONG_CONFIRMED | 2114.255 |  | 0.337% | 0.273% | 0.207% | 0.179% | 0.162% | -0.536% | 0.346% | 0.038% | 135m LONG_INVALIDATED (other) 0.272% |
| 2026-05-24T00:45:02.402Z | CROSS_ASSET | CROSS_ASSET_COVER | n/a |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-24T03:00:02.827Z | ETH | LONG_INVALIDATED | 2120.005 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-24T03:00:02.827Z | BTC | SHORT_CONFIRMED | 76726.85 |  | 0.092% | 0.008% | -0.112% | -0.615% | 0.389% | -0.358% | 0.211% | -0.221% | 4620m SHORT_INVALIDATED (other) 1.144% |
| 2026-05-24T05:00:02.818Z | ETH | SHORT_CONFIRMED | 2117.715 |  | 0.278% | -0.111% | -0.069% | 0.050% | 0.820% | 0.494% | 0.278% | -0.388% |  |
| 2026-05-24T06:45:02.734Z | BTC | LONG_CONFIRMED | 76718.05 |  | 0.104% | -0.029% | 0.494% | -0.442% | -0.190% | 0.796% | 0.544% | -0.091% | 645m LONG_INVALIDATED (other) -0.252% |
| 2026-05-24T13:15:02.837Z | BTC | LONG_CONFIRMED | 76954.45 |  | -0.370% | -0.820% | -0.558% | -0.732% | 0.154% | 0.398% | -0.084% | -0.872% | 255m LONG_INVALIDATED (other) -0.558% |
| 2026-05-24T16:00:02.103Z | SOL | LONG_CONFIRMED | 85.175 |  | 0.053% | 0.417% | -0.288% | 0.088% | -0.346% | 1.004% | 0.534% | -0.018% | 1140m LONG_INVALIDATED (other) 0.939% |
| 2026-05-24T17:30:02.581Z | BTC | LONG_INVALIDATED | 76524.75 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-24T22:00:02.077Z | SOL | SHORT_CONFIRMED | 83.915 |  | -1.078% | -1.329% | -1.948% | -2.199% | -2.330% | -1.782% | -0.971% | -1.746% | 3075m SHORT_INVALIDATED (other) -0.107% |
| 2026-05-24T23:45:02.043Z | BTC | LONG_CONFIRMED | 77085.45 |  | 0.047% | -0.033% | -0.196% | 0.268% | 0.397% | 0.217% | 0.290% | -0.319% | 2055m LONG_INVALIDATED (other) -0.673% |
| 2026-05-25T04:00:02.340Z | BTC | SHORT_CONFIRMED | 76934.75 |  | -0.260% | -0.509% | -0.366% | -0.460% | -0.667% | 0.457% | -0.017% | -0.577% | 3120m SHORT_INVALIDATED (other) 1.411% |
| 2026-05-25T05:00:02.225Z | SOL | LONG_CONFIRMED | 85.735 |  | 0.332% | 0.029% | 0.239% | 0.064% | 0.554% | -1.580% | 0.332% | -0.216% | 360m LONG_INVALIDATED (other) 0.280% |
| 2026-05-25T11:00:01.706Z | SOL | LONG_INVALIDATED | 85.975 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-25T14:15:01.920Z | BTC | LONG_CONFIRMED | 77416.55 |  | 0.294% | 0.184% | 0.196% | -0.103% | -1.061% | 0.607% | 0.322% | 0.041% | 1185m LONG_INVALIDATED (other) -1.098% |
| 2026-05-25T15:45:02.183Z | BTC | SHORT_CONFIRMED | 77589.45 |  | 0.089% | -0.099% | 0.267% | 0.434% | 1.288% | 1.479% | 0.341% | -0.099% | 2415m SHORT_INVALIDATED (other) 2.243% |
| 2026-05-25T18:45:02.277Z | SOL | LONG_CONFIRMED | 85.975 |  | -0.169% | -0.483% | -1.448% | -2.413% | -1.727% | -2.902% | -0.169% | -1.425% | 420m LONG_INVALIDATED (other) -2.419% |
| 2026-05-25T21:00:02.366Z | ETH | LONG_CONFIRMED | 2106.155 |  | 0.043% | 0.281% | -0.437% | -0.568% | -0.544% | -1.778% | 0.281% | -0.604% | 300m LONG_INVALIDATED (pre_fix_or_leveraged_chase) -0.634% |
| 2026-05-25T22:30:01.941Z | SOL | ACTIVE_CONTEXT_FAILED | 85.135 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-25T22:45:01.852Z | ETH | LONG_CONFIRMED | 2104.555 |  | 0.063% | 0.332% | -0.885% | -0.214% | 0.979% | -1.848% | 0.332% | -0.876% | 195m LONG_INVALIDATED (pre_fix_or_leveraged_chase) -0.558% |
| 2026-05-25T23:00:02.430Z | ETH | ACTIVE_CONTEXT_BTC_WEAK | 2100.755 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-25T23:00:02.430Z | SOL | ACTIVE_CONTEXT_BTC_WEAK | 84.665 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-26T00:45:02.597Z | ETH | ACTIVE_CONTEXT_STRESSED | 2094.615 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-26T01:30:02.480Z | ETH | ACTIVE_CONTEXT_FAILED | 2093.865 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-26T01:45:02.146Z | SOL | LONG_INVALIDATED | 83.895 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-26T02:00:01.955Z | ETH | LONG_INVALIDATED | 2092.805 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-26T02:45:02.748Z | BTC | SHORT_CONFIRMED | 76517.65 |  | 0.077% | -0.095% | -0.404% | -1.085% | -0.434% | 1.042% | 0.077% | -0.493% | 1755m SHORT_INVALIDATED (other) 0.873% |
| 2026-05-26T04:30:02.580Z | BTC | LONG_CONFIRMED | 76662.35 |  | 0.104% | 0.187% | 0.099% | 0.465% | -0.269% | -1.879% | 0.303% | -0.116% | 330m LONG_INVALIDATED (other) -0.125% |
| 2026-05-26T08:15:02.236Z | BTC | LONG_CONFIRMED | 76697.95 |  | -0.052% | -0.070% | 0.295% | -0.340% | -0.845% | -0.969% | 0.938% | -0.145% | 105m LONG_INVALIDATED (other) -0.171% |
| 2026-05-26T10:00:02.799Z | BTC | LONG_INVALIDATED | 76566.75 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-26T11:15:02.713Z | ETH | SHORT_CONFIRMED | 2123.755 |  | 0.224% | 0.459% | 1.305% | 2.612% | 2.553% | 2.065% | 0.775% | -0.574% |  |
| 2026-05-26T11:45:02.737Z | BTC | SHORT_CONFIRMED | 77142.05 |  | 0.283% | 0.116% | 0.944% | 1.526% | 1.684% | 1.918% | 0.907% | -0.965% | 1215m SHORT_INVALIDATED (other) 1.676% |
| 2026-05-26T17:00:02.485Z | ETH | SHORT_CONFIRMED | 2076.555 |  | 0.644% | 0.170% | 0.378% | -0.092% | 0.336% | 1.121% | 0.675% | -0.045% |  |
| 2026-05-26T18:30:02.766Z | SOL | SHORT_CONFIRMED | 83.765 |  | 0.507% | -0.006% | 0.269% | 0.257% | -0.161% | 0.245% | 0.507% | -0.066% | 405m SHORT_INVALIDATED (other) -0.287% |
| 2026-05-26T20:45:02.042Z | ETH | LONG_CONFIRMED | 2073.855 |  | -0.057% | -0.170% | 0.338% | -0.227% | 0.397% | -0.765% | 0.152% | -0.395% | 435m LONG_INVALIDATED (other) -0.351% |
| 2026-05-26T22:00:02.845Z | ETH | ACTIVE_CONTEXT_BTC_WEAK | 2070.565 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-26T22:45:02.844Z | ETH | ACTIVE_CONTEXT_STRESSED | 2065.505 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-26T22:45:02.844Z | SOL | SHORT_CONFIRMED | 83.505 |  | -0.066% | -0.090% | -0.329% | -0.485% | -0.437% | 1.347% | -0.006% | -0.641% | 150m SHORT_INVALIDATED (other) -0.599% |
| 2026-05-27T00:30:02.323Z | SOL | ACTIVE_CONTEXT_STRESSED | 83.855 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-27T01:15:02.395Z | SOL | ACTIVE_CONTEXT_FAILED | 84.005 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-27T01:15:02.395Z | SOL | SHORT_INVALIDATED | 84.005 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-27T01:30:02.006Z | ETH | LONG_CONFIRMED | 2071.295 |  | 0.019% | -0.175% | 0.103% | 0.566% | -0.325% | -2.737% | 0.161% | -0.549% | 150m LONG_INVALIDATED (other) -0.227% |
| 2026-05-27T04:00:02.533Z | ETH | ACTIVE_CONTEXT_FAILED | 2066.585 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-27T04:00:02.533Z | ETH | LONG_INVALIDATED | 2066.585 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-27T04:30:02.423Z | BTC | SHORT_CONFIRMED | 75400.05 |  | -0.146% | -0.162% | -0.603% | -0.533% | 0.478% | 3.036% | 0.236% | -0.736% | 210m SHORT_INVALIDATED (other) -0.596% |
| 2026-05-27T06:15:02.629Z | BTC | ACTIVE_CONTEXT_STRESSED | 75614.45 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-27T07:00:01.769Z | BTC | ACTIVE_CONTEXT_FAILED | 75717.45 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-27T08:00:02.236Z | BTC | SHORT_INVALIDATED | 75849.35 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-27T11:00:01.915Z | BTC | LONG_CONFIRMED | 75793.65 |  | -0.090% | -0.174% | -0.999% | -1.139% | -1.929% | -3.261% | 0.080% | -1.390% | 1560m LONG_INVALIDATED (other) -3.131% |
| 2026-05-27T11:30:02.418Z | ETH | SHORT_CONFIRMED | 2079.385 |  | 0.302% | -0.109% | 0.555% | 1.259% | 2.894% | 4.456% | 1.408% | -0.111% |  |
| 2026-05-27T12:15:02.030Z | SOL | SHORT_CONFIRMED | 83.565 |  | -0.712% | 0.162% | -0.616% | -0.269% | 1.346% | 3.500% | 0.736% | -0.963% |  |
| 2026-05-27T15:30:02.145Z | SOL | LONG_CONFIRMED | 84.385 |  | -0.018% | -0.456% | -0.705% | -2.554% | -4.071% | -4.165% | -0.018% | -1.381% | 510m LONG_INVALIDATED (other) -2.441% |
| 2026-05-27T16:00:02.652Z | SOL | ACTIVE_CONTEXT_BTC_WEAK | 84.335 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-27T16:30:02.723Z | SOL | ACTIVE_CONTEXT_STRESSED | 84.025 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-27T18:00:02.472Z | SOL | ACTIVE_CONTEXT_FAILED | 83.245 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-27T18:00:02.472Z | SOL | LONG_CONFIRMED | 83.245 |  | 0.378% | 0.907% | -0.991% | -1.219% | -3.057% | -0.811% | 0.907% | -1.051% | 360m LONG_INVALIDATED (other) -1.105% |
| 2026-05-28T00:00:02.139Z | SOL | LONG_INVALIDATED | 82.325 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-28T00:45:02.569Z | BTC | LONG_CONFIRMED | 74467.65 |  | -0.328% | -0.320% | -1.862% | -1.676% | -1.406% | -1.114% | 0.009% | -2.069% | 735m LONG_INVALIDATED (other) -1.406% |
| 2026-05-28T01:30:02.818Z | BTC | ACTIVE_CONTEXT_STRESSED | 74178.35 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-28T03:00:02.248Z | BTC | ACTIVE_CONTEXT_FAILED | 74184.75 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-28T05:00:02.068Z | ETH | LONG_CONFIRMED | 1979.055 |  | -0.126% | -0.174% | 0.279% | 0.272% | 1.698% | 1.556% | 0.665% | -0.391% | 360m LONG_INVALIDATED (other) 0.427% |
| 2026-05-28T05:30:02.017Z | ETH | ACTIVE_CONTEXT_BTC_WEAK | 1972.525 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-28T07:45:02.089Z | ETH | LONG_CONFIRMED | 1991.735 |  | -0.456% | -0.283% | -0.243% | -0.266% | 1.017% | 0.632% | 0.069% | -0.456% | 195m LONG_INVALIDATED (other) -0.212% |
| 2026-05-28T08:15:01.943Z | BTC | LONG_CONFIRMED | 73340.65 |  | -0.245% | -0.051% | -0.084% | -0.355% | 0.005% | 0.490% | 0.173% | -0.255% | 285m LONG_INVALIDATED (other) 0.109% |
| 2026-05-28T08:15:01.943Z | SOL | LONG_CONFIRMED | 81.075 |  | -0.253% | -0.043% | -0.537% | 0.401% | 1.141% | 1.486% | 0.068% | -0.549% | 105m LONG_INVALIDATED (other) 0.025% |
| 2026-05-28T08:15:01.943Z | CROSS_ASSET | CROSS_ASSET_COVER | n/a |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-28T08:30:02.895Z | ETH | ACTIVE_CONTEXT_STRESSED | 1984.115 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-28T09:30:02.134Z | ETH | ACTIVE_CONTEXT_BTC_WEAK | 1988.365 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-28T09:30:02.134Z | SOL | ACTIVE_CONTEXT_BTC_WEAK | 81.045 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-28T10:00:02.022Z | SOL | LONG_INVALIDATED | 81.095 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-28T11:00:02.410Z | ETH | LONG_INVALIDATED | 1987.515 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-28T13:00:02.501Z | BTC | LONG_INVALIDATED | 73420.55 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-28T13:15:02.583Z | BTC | SHORT_CONFIRMED | 73238.35 |  | 0.428% | 0.532% | -0.100% | -0.519% | -0.400% | 0.364% | 0.762% | -0.222% |  |
| 2026-05-28T16:15:02.477Z | ETH | SHORT_CONFIRMED | 1992.955 |  | -0.859% | -0.956% | -1.230% | -0.999% | -0.454% | -1.505% | -0.146% | -1.504% |  |
| 2026-05-28T18:00:02.483Z | BTC | LONG_CONFIRMED | 73459.05 |  | 0.091% | -0.115% | 0.226% | 0.118% | 0.192% | 0.657% | 0.499% | -0.196% | 1020m LONG_INVALIDATED (other) 0.122% |
| 2026-05-28T18:15:02.446Z | SOL | LONG_CONFIRMED | 82.645 |  | 0.175% | -0.079% | -0.756% | -1.083% | -0.611% | -0.188% | 0.175% | -0.780% |  |
| 2026-05-28T23:45:02.275Z | BTC | LONG_CONFIRMED | 73517.95 |  | 0.253% | 0.163% | -0.424% | -0.151% | -0.178% | -0.171% | 0.273% | -0.521% | 675m LONG_INVALIDATED (other) 0.042% |
| 2026-05-29T01:15:02.781Z | ETH | LONG_CONFIRMED | 2011.165 |  | -0.257% | -0.618% | -0.091% | 0.108% | -0.845% | 0.358% | -0.066% | -0.771% | 180m LONG_INVALIDATED (other) -0.633% |
| 2026-05-29T02:00:02.330Z | ETH | ACTIVE_CONTEXT_BTC_WEAK | 2006.345 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-29T02:30:02.320Z | ETH | ACTIVE_CONTEXT_STRESSED | 1999.165 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-29T03:00:02.053Z | SOL | SHORT_CONFIRMED | 81.535 |  | -0.018% | 0.215% | -0.938% | -0.595% | 0.399% | -1.662% | 0.215% | -0.803% |  |
| 2026-05-29T04:15:02.296Z | ETH | ACTIVE_CONTEXT_FAILED | 1998.425 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-29T04:15:02.296Z | ETH | LONG_INVALIDATED | 1998.425 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-29T05:00:02.516Z | BTC | LONG_CONFIRMED | 73412.75 |  | 0.004% | 0.255% | 0.451% | -0.521% | 1.040% | 0.012% | 0.430% | -0.131% | 360m LONG_INVALIDATED (other) 0.185% |
| 2026-05-29T05:00:02.516Z | ETH | LONG_CONFIRMED | 2006.245 |  | 0.053% | 0.288% | 0.212% | -0.696% | 1.721% | 0.236% | 0.520% | -0.198% | 30m LONG_INVALIDATED (other) 0.132% |
| 2026-05-29T05:00:02.516Z | CROSS_ASSET | CROSS_ASSET_COVER | n/a |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-29T05:30:02.023Z | ETH | LONG_INVALIDATED | 2008.885 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-29T05:45:02.268Z | SOL | LONG_CONFIRMED | 81.785 |  | 0.434% | 0.324% | 0.728% | -0.446% | 1.082% | 0.899% | 0.838% | 0.092% |  |
| 2026-05-29T06:45:03.087Z | BTC | LONG_CONFIRMED | 73611.55 |  | 0.091% | -0.278% | -0.033% | -0.826% | -0.467% | -0.144% | 0.251% | -0.401% | 255m LONG_INVALIDATED (other) -0.085% |
| 2026-05-29T07:45:02.100Z | BTC | ACTIVE_CONTEXT_STRESSED | 73319.05 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-29T08:15:02.354Z | ETH | LONG_CONFIRMED | 2005.555 |  | -0.087% | 0.388% | -0.306% | 0.867% | 0.681% | 0.339% | 0.388% | -0.359% | 315m LONG_INVALIDATED (other) -0.605% |
| 2026-05-29T08:45:02.509Z | BTC | LONG_CONFIRMED | 73718.55 |  | 0.105% | -0.090% | -0.673% | 0.355% | -0.170% | -0.404% | 0.105% | -0.709% | 135m LONG_INVALIDATED (other) -0.230% |
| 2026-05-29T09:15:02.890Z | ETH | ACTIVE_CONTEXT_BTC_WEAK | 2010.845 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-29T09:45:02.154Z | SOL | LONG_CONFIRMED | 82.365 |  | -0.261% | -0.370% | -1.147% | 0.370% | -0.844% | -0.091% | 0.018% | -1.427% |  |
| 2026-05-29T11:00:02.294Z | BTC | LONG_INVALIDATED | 73548.65 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-29T12:15:02.184Z | ETH | ACTIVE_CONTEXT_STRESSED | 1997.705 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-29T13:30:01.869Z | ETH | ACTIVE_CONTEXT_FAILED | 1993.425 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-29T13:30:01.869Z | ETH | LONG_INVALIDATED | 1993.425 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-29T17:30:02.765Z | BTC | LONG_CONFIRMED | 74135.15 |  | -0.261% | -0.581% | -0.810% | -0.830% | -0.860% | -0.392% | 0.014% | -1.226% | 1575m LONG_INVALIDATED (other) -0.279% |
| 2026-05-29T18:30:02.886Z | BTC | LONG_CONFIRMED | 73701.45 |  | -0.485% | -0.158% | -0.423% | -0.083% | -0.181% | 0.336% | 0.044% | -0.645% | 1515m LONG_INVALIDATED (other) 0.308% |
| 2026-05-29T22:00:01.980Z | BTC | LONG_CONFIRMED | 73354.15 |  | 0.049% | 0.076% | 0.295% | 0.147% | 0.262% | 0.705% | 0.285% | -0.056% | 1305m LONG_INVALIDATED (other) 0.783% |
| 2026-05-29T23:15:03.176Z | ETH | SHORT_CONFIRMED | 2008.605 |  | -0.192% | -0.135% | -0.473% | -0.330% | -0.280% | -0.532% | 0.130% | -0.564% |  |
| 2026-05-30T01:45:02.111Z | SOL | LONG_CONFIRMED | 82.675 |  | 0.042% | 0.151% | -0.187% | -0.562% | -0.441% | 0.284% | 0.260% | -0.708% |  |
| 2026-05-30T10:15:02.232Z | SOL | LONG_CONFIRMED | 82.315 |  | -0.055% | -0.079% | 0.334% | 0.589% | 0.334% | 0.249% | 0.213% | -0.164% |  |
| 2026-05-30T12:45:02.303Z | BTC | LONG_CONFIRMED | 73584.95 |  | 0.134% | 0.085% | 0.339% | 0.390% | 0.482% | 0.339% | 0.478% | 0.024% | 420m LONG_INVALIDATED (other) 0.467% |
| 2026-05-30T15:00:02.698Z | ETH | LONG_CONFIRMED | 2025.285 |  | -0.152% | 0.025% | -0.094% | -0.318% | 0.292% | -0.800% | 0.187% | -0.170% | 1410m LONG_INVALIDATED (other) -0.842% |
| 2026-05-30T15:45:02.938Z | BTC | LONG_CONFIRMED | 73780.45 |  | 0.045% | 0.073% | 0.204% | -0.009% | 0.374% | -0.281% | 0.228% | 0.042% | 240m LONG_INVALIDATED (other) 0.201% |
| 2026-05-30T17:30:02.646Z | SOL | LONG_CONFIRMED | 82.765 |  | 0.151% | 0.187% | 0.248% | 0.199% | 0.236% | -1.226% | 0.236% | -0.006% |  |
| 2026-05-30T19:15:01.943Z | BTC | LONG_CONFIRMED | 73944.05 |  | -0.017% | -0.096% | -0.257% | 0.237% | -0.168% | -0.692% | -0.017% | -0.302% | 30m LONG_INVALIDATED (other) -0.021% |
| 2026-05-30T19:15:01.943Z | SOL | LONG_CONFIRMED | 82.845 |  | 0.018% | -0.006% | -0.380% | 0.356% | -0.308% | -1.732% | 0.151% | -0.525% |  |
| 2026-05-30T19:15:01.943Z | CROSS_ASSET | CROSS_ASSET_COVER | n/a |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-30T19:45:02.198Z | BTC | LONG_INVALIDATED | 73928.45 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-31T03:15:02.292Z | BTC | LONG_CONFIRMED | 74052.05 |  | 0.006% | 0.076% | -0.313% | -0.227% | -0.538% | -0.290% | 0.091% | -0.226% | 75m LONG_INVALIDATED (other) 0.060% |
| 2026-05-31T04:30:02.544Z | BTC | LONG_INVALIDATED | 74096.45 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-31T09:30:02.687Z | ETH | LONG_CONFIRMED | 2024.285 |  | -0.345% | -0.423% | -0.207% | -1.053% | -0.815% | -1.910% | 0.060% | -0.433% | 300m LONG_INVALIDATED (other) -0.793% |
| 2026-05-31T09:45:02.420Z | SOL | LONG_CONFIRMED | 82.895 |  | -0.452% | -0.344% | -0.283% | -1.393% | -0.863% | -2.322% | -0.018% | -0.537% |  |
| 2026-05-31T10:00:02.515Z | ETH | ACTIVE_CONTEXT_BTC_WEAK | 2018.595 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-31T10:15:02.961Z | ETH | LONG_CONFIRMED | 2017.335 |  | 0.050% | 0.110% | -0.471% | -0.792% | -0.455% | -1.796% | 0.268% | -0.090% | 255m LONG_INVALIDATED (other) -0.452% |
| 2026-05-31T10:30:02.643Z | ETH | ACTIVE_CONTEXT_STRESSED | 2016.295 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-31T12:45:02.245Z | ETH | LONG_CONFIRMED | 2022.465 |  | 0.014% | -0.218% | -1.106% | -0.858% | -0.435% | -1.761% | 0.014% | -1.177% | 105m LONG_INVALIDATED (other) -0.704% |
| 2026-05-31T13:15:02.389Z | SOL | LONG_CONFIRMED | 82.835 |  | -0.211% | -1.093% | -1.455% | -1.213% | -0.742% | -3.217% | 0.054% | -1.660% |  |
| 2026-05-31T13:30:02.879Z | ETH | ACTIVE_CONTEXT_BTC_WEAK | 2022.255 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-31T14:15:02.213Z | ETH | ACTIVE_CONTEXT_STRESSED | 2013.505 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-31T14:30:02.782Z | ETH | ACTIVE_CONTEXT_FAILED | 2008.225 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-31T14:30:02.782Z | ETH | LONG_INVALIDATED | 2008.225 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-31T15:00:02.707Z | BTC | SHORT_CONFIRMED | 73518.55 |  | -0.038% | -0.033% | 0.005% | -0.458% | -0.373% | 2.831% | 0.129% | -0.183% |  |
| 2026-05-31T15:45:02.562Z | BTC | LONG_CONFIRMED | 73551.65 |  | -0.060% | -0.149% | -0.107% | 0.042% | 0.169% | -3.412% | 0.086% | -0.174% | 30m LONG_INVALIDATED (other) -0.026% |
| 2026-05-31T16:15:02.857Z | BTC | LONG_INVALIDATED | 73532.75 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-05-31T16:30:02.279Z | ETH | SHORT_CONFIRMED | 2004.455 |  | 0.326% | 0.074% | 0.177% | -0.530% | 0.352% | 1.765% | 0.492% | 0.044% |  |
| 2026-05-31T17:30:02.091Z | BTC | LONG_CONFIRMED | 73507.45 |  | 0.104% | 0.065% | 0.185% | 0.038% | -0.309% | -2.532% | 0.199% | -0.102% | 195m LONG_INVALIDATED (other) 0.130% |
| 2026-05-31T17:30:02.091Z | ETH | SHORT_CONFIRMED | 2000.565 |  | -0.076% | 0.076% | -0.361% | -0.144% | 0.450% | 0.472% | 0.298% | -0.227% |  |
| 2026-05-31T20:45:02.373Z | BTC | LONG_INVALIDATED | 73602.95 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-06-01T03:00:02.154Z | SOL | LONG_CONFIRMED | 82.615 |  | 0.006% | -0.478% | -1.531% | -1.955% | -3.553% | -2.342% | 0.200% | -1.870% |  |
| 2026-06-01T03:45:02.904Z | BTC | SHORT_CONFIRMED | 73773.85 |  | 0.613% | 0.422% | 1.402% | 1.894% | 3.703% | 3.917% | 1.207% | 0.132% |  |
| 2026-06-01T03:45:02.904Z | ETH | SHORT_CONFIRMED | 2010.595 |  | 0.853% | 0.592% | 1.803% | 1.562% | 2.244% | 0.479% | 1.522% | 0.152% |  |
| 2026-06-01T03:45:02.904Z | SOL | SHORT_CONFIRMED | 82.645 |  | 0.998% | 0.865% | 2.414% | 2.341% | 3.818% | 2.196% | 2.003% | 0.175% |  |
| 2026-06-01T06:15:02.078Z | ETH | LONG_CONFIRMED | 1990.135 |  | -0.244% | -0.335% | -0.454% | -1.227% | -0.063% | -0.388% | -0.186% | -0.836% | 5160m LONG_INVALIDATED (other) -10.985% |
| 2026-06-01T07:30:02.577Z | SOL | LONG_CONFIRMED | 81.105 |  | -0.512% | -0.549% | -0.117% | -1.671% | 0.068% | -1.720% | -0.043% | -0.672% |  |
| 2026-06-01T08:45:02.377Z | ETH | LONG_CONFIRMED | 1977.235 |  | 0.389% | 0.428% | 0.486% | -0.069% | 1.313% | -0.057% | 0.576% | -0.120% | 5010m LONG_INVALIDATED (other) -10.404% |
| 2026-06-01T10:30:02.049Z | SOL | SHORT_CONFIRMED | 80.795 |  | -0.254% | -0.266% | 1.640% | -0.217% | 0.155% | 2.073% | 1.714% | -0.340% |  |
| 2026-06-01T12:30:02.109Z | BTC | LONG_CONFIRMED | 72165.85 |  | -0.510% | -0.916% | -1.253% | -0.871% | -1.464% | -4.178% | 0.056% | -1.943% | 570m LONG_INVALIDATED (other) -1.655% |
| 2026-06-01T12:45:02.556Z | ETH | LONG_CONFIRMED | 1991.875 |  | -0.904% | -1.198% | -0.803% | 0.568% | 0.131% | -0.895% | -0.253% | -1.625% | 4770m LONG_INVALIDATED (other) -11.063% |
| 2026-06-01T12:45:02.556Z | CROSS_ASSET | CROSS_ASSET_COVER | n/a |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-06-01T13:45:02.654Z | SOL | SHORT_CONFIRMED | 80.115 |  | 0.880% | 0.693% | -0.930% | -0.643% | 0.081% | 1.616% | 1.192% | -1.042% |  |
| 2026-06-01T16:30:02.714Z | BTC | LONG_CONFIRMED | 71025.75 |  | 0.694% | 0.873% | 0.720% | 0.117% | -0.128% | -4.897% | 0.873% | 0.332% | 330m LONG_INVALIDATED (other) -0.077% |
| 2026-06-01T17:00:02.214Z | ETH | LONG_CONFIRMED | 1975.995 |  | 0.765% | 0.322% | 1.092% | 0.976% | 1.109% | -2.727% | 1.502% | 0.277% | 4515m LONG_INVALIDATED (other) -10.348% |
| 2026-06-01T17:30:02.170Z | SOL | LONG_CONFIRMED | 80.845 |  | -0.353% | 0.155% | -0.278% | -0.612% | -1.082% | -5.065% | 0.390% | -0.353% |  |
| 2026-06-01T19:30:02.812Z | BTC | LONG_CONFIRMED | 71562.35 |  | -0.069% | -0.035% | -0.166% | -0.919% | -2.001% | -6.564% | 0.031% | -0.891% | 150m LONG_INVALIDATED (other) -0.826% |
| 2026-06-01T21:15:02.528Z | BTC | ACTIVE_CONTEXT_STRESSED | 71155.75 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-06-01T22:00:02.526Z | BTC | ACTIVE_CONTEXT_FAILED | 70971.35 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-06-01T22:00:02.526Z | BTC | LONG_INVALIDATED | 70971.35 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-06-01T23:00:02.474Z | BTC | SHORT_CONFIRMED | 71341.75 |  | -0.142% | 0.199% | 0.715% | 1.908% | 2.620% | 6.647% | 1.575% | -0.142% |  |
| 2026-06-02T02:45:01.945Z | BTC | LONG_CONFIRMED | 70524.45 |  | 0.520% | 0.510% | -0.703% | -1.317% | -3.709% | -5.615% | 0.582% | -0.466% | 4680m LONG_INVALIDATED (other) -11.449% |
| 2026-06-02T06:00:02.900Z | BTC | SHORT_CONFIRMED | 70194.65 |  | -0.013% | 0.305% | 0.873% | 2.356% | 3.798% | 4.440% | 1.222% | -0.138% |  |
| 2026-06-02T06:00:02.900Z | SOL | SHORT_CONFIRMED | 79.495 |  | 0.057% | -0.006% | 0.296% | 1.050% | 3.629% | 5.893% | 0.874% | -0.270% |  |
| 2026-06-02T15:30:03.112Z | ETH | SHORT_CONFIRMED | 1909.445 |  | -1.046% | -0.717% | 0.501% | 2.967% | 4.601% | 3.482% | 0.372% | -1.046% |  |
| 2026-06-02T19:15:02.066Z | BTC | LONG_CONFIRMED | 67271.35 |  | -0.086% | -0.565% | -1.330% | -1.780% | -0.224% | -2.032% | 0.769% | -1.503% | 3690m LONG_INVALIDATED (other) -7.167% |
| 2026-06-02T19:15:02.066Z | SOL | LONG_CONFIRMED | 75.995 |  | -0.796% | -1.625% | -4.046% | -3.020% | -1.244% | -4.257% | -0.322% | -3.165% |  |
| 2026-06-02T19:15:02.066Z | CROSS_ASSET | CROSS_ASSET_COVER | n/a |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-06-03T00:00:02.379Z | ETH | SHORT_CONFIRMED | 1857.745 |  | -0.528% | 0.052% | 1.061% | -0.956% | -0.781% | 2.305% | 1.946% | -0.528% |  |
| 2026-06-03T00:45:02.616Z | BTC | SHORT_CONFIRMED | 66989.85 |  | 0.045% | 0.200% | 0.905% | 0.063% | -0.017% | 5.523% | 1.855% | 0.045% |  |
| 2026-06-03T03:45:02.078Z | SOL | SHORT_CONFIRMED | 72.745 |  | -1.093% | -1.656% | -3.306% | -3.127% | -1.148% | 1.821% | 0.199% | -3.361% |  |
| 2026-06-03T07:30:02.876Z | BTC | SHORT_CONFIRMED | 67115.65 |  | 0.182% | 0.132% | 0.015% | 1.319% | 2.067% | 4.798% | 0.680% | -0.222% |  |
| 2026-06-03T16:15:02.075Z | ETH | LONG_CONFIRMED | 1832.735 |  | -0.119% | -0.323% | -1.360% | -2.762% | -1.206% | -3.499% | 0.085% | -1.643% | 1680m LONG_INVALIDATED (other) -3.340% |
| 2026-06-03T20:15:02.142Z | BTC | SHORT_CONFIRMED | 65427.15 |  | 0.734% | -0.077% | 3.125% | 1.412% | 3.031% | 3.295% | 2.074% | -0.405% |  |
| 2026-06-04T02:45:02.237Z | SOL | LONG_CONFIRMED | 70.035 |  | 1.278% | 1.978% | 0.421% | -3.048% | -0.393% | -3.877% | 2.249% | -0.093% |  |
| 2026-06-04T08:30:02.084Z | SOL | SHORT_CONFIRMED | 69.025 |  | 0.891% | 1.470% | -0.398% | -0.688% | 0.181% | 5.281% | 2.079% | -0.225% |  |
| 2026-06-04T11:30:02.140Z | ETH | SHORT_CONFIRMED | 1746.395 |  | 0.067% | -1.100% | -1.793% | -1.742% | -1.258% | 4.565% | 0.418% | -2.371% |  |
| 2026-06-04T14:45:02.492Z | BTC | SHORT_CONFIRMED | 63961.35 |  | 0.026% | 0.105% | 0.252% | 0.380% | 2.187% | 4.875% | 1.525% | -0.491% |  |
| 2026-06-04T19:00:02.469Z | ETH | LONG_CONFIRMED | 1773.875 |  | 0.165% | -0.175% | -0.300% | -2.861% | -7.679% | -12.610% | 0.478% | -1.053% | 75m LONG_INVALIDATED (other) -0.133% |
| 2026-06-04T19:45:02.596Z | ETH | ACTIVE_CONTEXT_BTC_WEAK | 1776.635 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-06-04T20:15:02.805Z | ETH | LONG_INVALIDATED | 1771.515 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-06-04T20:15:02.805Z | BTC | SHORT_CONFIRMED | 63462.15 |  | -0.209% | -0.004% | -0.547% | 0.464% | 1.113% | 4.002% | 0.343% | -0.532% |  |
| 2026-06-05T05:30:02.956Z | BTC | LONG_CONFIRMED | 63477.95 |  | -2.194% | -2.202% | -1.101% | -2.641% | -4.331% | -4.291% | -0.638% | -3.137% | 195m LONG_INVALIDATED (other) -1.620% |
| 2026-06-05T07:00:02.150Z | BTC | LONG_CONFIRMED | 61890.15 |  | 0.502% | 1.332% | 0.635% | -1.691% | -4.102% | -1.338% | 1.911% | -0.652% | 105m LONG_INVALIDATED (other) 0.904% |
| 2026-06-05T07:45:02.109Z | ETH | LONG_CONFIRMED | 1672.095 |  | -0.064% | -0.313% | -0.604% | -5.281% | -5.791% | -5.851% | 0.676% | -0.535% | 75m LONG_INVALIDATED (other) -0.596% |
| 2026-06-05T08:30:02.694Z | ETH | ACTIVE_CONTEXT_BTC_WEAK | 1672.505 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-06-05T08:45:02.877Z | BTC | LONG_INVALIDATED | 62449.85 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-06-05T09:00:02.109Z | ETH | LONG_INVALIDATED | 1662.125 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-06-05T09:00:02.109Z | SOL | SHORT_CONFIRMED | 65.255 |  | -1.249% | -1.908% | -1.571% | -0.851% | 0.682% | 3.180% | -0.605% | -1.923% |  |
| 2026-06-05T12:45:02.587Z | BTC | LONG_CONFIRMED | 61947.65 |  | 0.242% | -2.010% | -0.935% | -0.511% | -1.113% | n/a | 0.242% | -2.657% | 45m LONG_INVALIDATED (other) 0.097% |
| 2026-06-05T13:30:02.337Z | BTC | LONG_INVALIDATED | 62007.95 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-06-05T14:45:02.510Z | ETH | LONG_CONFIRMED | 1609.115 |  | -1.050% | -1.574% | -3.503% | -0.738% | -2.072% | n/a | -0.079% | -2.847% | 60m LONG_INVALIDATED (other) -1.587% |
| 2026-06-05T15:00:02.965Z | ETH | ACTIVE_CONTEXT_STRESSED | 1598.525 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-06-05T15:00:02.965Z | ETH | ACTIVE_CONTEXT_BTC_WEAK | 1598.525 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-06-05T15:45:02.449Z | ETH | ACTIVE_CONTEXT_FAILED | 1583.585 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-06-05T15:45:02.449Z | ETH | LONG_INVALIDATED | 1583.585 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-06-05T16:30:02.550Z | BTC | SHORT_CONFIRMED | 60879.45 |  | -0.250% | 0.248% | -0.610% | -0.544% | 1.812% | n/a | 2.510% | -0.803% |  |
| 2026-06-05T21:00:02.809Z | SOL | LONG_CONFIRMED | 64.565 |  | 1.123% | -0.441% | -0.379% | -6.188% | -2.145% | n/a | 1.123% | -2.145% |  |
| 2026-06-06T05:00:02.371Z | SOL | SHORT_CONFIRMED | 60.715 |  | -2.512% | -3.698% | -4.060% | n/a | n/a | n/a | 0.239% | -4.356% |  |
| 2026-06-06T07:00:02.363Z | SOL | SHORT_CONFIRMED | 62.185 |  | -1.262% | -1.182% | n/a | n/a | n/a | n/a | -0.716% | -2.115% |  |

## 1b. Excursion / Path Risk Table

MFE/MAE are directional: positive MFE means max move in alert direction; negative MAE means max move against alert direction. `first extreme` shows whether the favorable or adverse extreme was reached first inside the window.

| time | asset | type | BTC gate | MFE 4h | tMFE 4h | MAE 4h | tMAE 4h | first 4h | MFE 24h | tMFE 24h | MAE 24h | tMAE 24h | first 24h |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-05-21T00:15:02.520Z | SOL | LONG_CONFIRMED | NEUTRAL | 0.655% | 240m | -0.110% | 5m | adverse | 1.745% | 1200m | -1.130% | 810m | adverse |
| 2026-05-21T00:30:02.389Z | ETH | LONG_CONFIRMED | NEUTRAL | 0.561% | 45m | 0.070% | 15m | adverse | 0.619% | 1020m | -1.324% | 795m | adverse |
| 2026-05-21T05:15:02.454Z | ETH | SHORT_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 0.759% | 125m | -0.193% | 180m | favorable | 1.650% | 510m | -0.286% | 735m | favorable |
| 2026-05-21T05:30:02.452Z | SOL | SHORT_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 0.375% | 90m | -0.549% | 165m | favorable | 1.461% | 495m | -1.404% | 885m | favorable |
| 2026-05-21T11:00:02.093Z | BTC | LONG_CONFIRMED |  | 0.180% | 15m | -0.551% | 165m | favorable | 1.006% | 390m | -0.551% | 165m | adverse |
| 2026-05-21T15:15:02.646Z | SOL | LONG_CONFIRMED | NEUTRAL | 1.651% | 135m | -0.330% | 90m | adverse | 1.662% | 300m | -0.330% | 90m | adverse |
| 2026-05-21T18:30:02.382Z | BTC | SHORT_CONFIRMED |  | 0.515% | 30m | -0.054% | 180m | favorable | 1.361% | 1275m | -0.139% | 585m | adverse |
| 2026-05-21T18:30:02.382Z | ETH | SHORT_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 0.619% | 30m | -0.144% | 90m | favorable | 1.116% | 1245m | -0.144% | 90m | adverse |
| 2026-05-21T19:45:02.413Z | BTC | SHORT_CONFIRMED |  | 0.022% | 210m | -0.207% | 105m | adverse | 2.369% | 1440m | -0.291% | 510m | adverse |
| 2026-05-21T21:00:02.629Z | SOL | SHORT_CONFIRMED | NEUTRAL | 0.840% | 240m | 0.029% | 15m | adverse | 3.777% | 1365m | -0.109% | 975m | adverse |
| 2026-05-21T22:15:02.236Z | SOL | SHORT_CONFIRMED | BTC_STRONG_ALT_NOT_FOLLOWING | 0.579% | 210m | -0.040% | 15m | adverse | 3.501% | 1290m | -0.395% | 900m | adverse |
| 2026-05-22T01:45:01.839Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.490% | 150m | 0.075% | 225m | favorable | 0.974% | 690m | -3.083% | 1350m | favorable |
| 2026-05-22T05:15:03.139Z | BTC | SHORT_CONFIRMED |  | 0.600% | 240m | 0.125% | 15m | adverse | 3.061% | 1170m | 0.125% | 15m | adverse |
| 2026-05-22T06:00:02.077Z | SOL | SHORT_CONFIRMED | NEUTRAL | 0.317% | 30m | -0.698% | 150m | favorable | 3.039% | 1095m | -1.021% | 435m | adverse |
| 2026-05-22T08:00:02.298Z | ETH | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.121% | 30m | -0.367% | 75m | favorable | 0.338% | 255m | -4.732% | 1440m | favorable |
| 2026-05-22T14:30:02.275Z | BTC | SHORT_CONFIRMED |  | 0.210% | 75m | -0.236% | 180m | favorable | 3.146% | 1095m | -0.236% | 180m | adverse |
| 2026-05-22T15:15:02.565Z | ETH | SHORT_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 1.299% | 240m | -0.563% | 135m | adverse | 4.387% | 1050m | -0.563% | 135m | adverse |
| 2026-05-23T00:45:02.794Z | SOL | SHORT_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | -0.065% | 105m | -0.529% | 180m | favorable | 2.811% | 480m | -3.227% | 1215m | favorable |
| 2026-05-23T05:15:02.224Z | SOL | LONG_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 0.101% | 30m | -2.949% | 210m | favorable | 3.080% | 945m | -2.949% | 210m | adverse |
| 2026-05-23T07:15:02.721Z | SOL | SHORT_CONFIRMED | BTC_STRONG_ALT_NOT_FOLLOWING | 2.776% | 90m | 0.137% | 15m | adverse | 2.776% | 90m | -3.263% | 825m | favorable |
| 2026-05-23T10:00:02.789Z | ETH | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.830% | 240m | 0.054% | 135m | adverse | 5.864% | 660m | 0.054% | 135m | adverse |
| 2026-05-23T10:30:02.606Z | BTC | LONG_CONFIRMED |  | 0.744% | 240m | -0.036% | 105m | adverse | 3.402% | 630m | -0.036% | 105m | adverse |
| 2026-05-23T11:00:02.819Z | ETH | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 1.506% | 240m | -0.137% | 75m | adverse | 5.662% | 600m | -0.137% | 75m | adverse |
| 2026-05-23T11:45:02.547Z | BTC | SHORT_CONFIRMED |  | 0.118% | 30m | -1.133% | 210m | favorable | 0.118% | 30m | -3.317% | 555m | favorable |
| 2026-05-23T15:30:02.790Z | BTC | SHORT_CONFIRMED |  | 0.163% | 135m | -0.542% | 240m | favorable | 0.163% | 135m | -2.319% | 1230m | favorable |
| 2026-05-23T16:00:02.627Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 1.041% | 210m | -0.172% | 15m | adverse | 3.313% | 300m | -0.172% | 15m | adverse |
| 2026-05-23T17:30:02.421Z | SOL | SHORT_CONFIRMED | BTC_STRONG_ALT_NOT_FOLLOWING | 0.125% | 15m | -3.239% | 210m | favorable | 0.125% | 15m | -3.239% | 210m | favorable |
| 2026-05-23T18:00:02.712Z | ETH | LONG_CONFIRMED | NEUTRAL | 3.982% | 180m | 0.394% | 75m | adverse | 3.982% | 180m | 0.394% | 75m | adverse |
| 2026-05-24T00:45:02.402Z | BTC | LONG_CONFIRMED |  | 0.225% | 150m | -0.012% | 105m | adverse | 0.724% | 675m | -0.803% | 1275m | favorable |
| 2026-05-24T00:45:02.402Z | ETH | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.346% | 165m | 0.038% | 180m | favorable | 0.553% | 375m | -2.279% | 1260m | favorable |
| 2026-05-24T03:00:02.827Z | BTC | SHORT_CONFIRMED |  | 0.211% | 165m | -0.221% | 240m | favorable | 0.896% | 1140m | -0.759% | 1395m | favorable |
| 2026-05-24T05:00:02.818Z | ETH | SHORT_CONFIRMED | NEUTRAL | 0.278% | 45m | -0.388% | 120m | favorable | 2.439% | 1005m | -0.388% | 120m | adverse |
| 2026-05-24T06:45:02.734Z | BTC | LONG_CONFIRMED |  | 0.544% | 225m | -0.091% | 90m | adverse | 0.861% | 1380m | -0.885% | 915m | adverse |
| 2026-05-24T13:15:02.837Z | BTC | LONG_CONFIRMED |  | -0.084% | 30m | -0.872% | 165m | favorable | 0.770% | 1260m | -1.189% | 525m | adverse |
| 2026-05-24T16:00:02.103Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.534% | 105m | -0.018% | 210m | favorable | 1.297% | 1350m | -1.732% | 345m | adverse |
| 2026-05-24T22:00:02.077Z | SOL | SHORT_CONFIRMED | BTC_STRONG_ALT_NOT_FOLLOWING | -0.971% | 240m | -1.746% | 180m | adverse | -0.971% | 240m | -2.818% | 990m | favorable |
| 2026-05-24T23:45:02.043Z | BTC | LONG_CONFIRMED |  | 0.290% | 150m | -0.319% | 135m | adverse | 0.753% | 1035m | -0.319% | 135m | adverse |
| 2026-05-25T04:00:02.340Z | BTC | SHORT_CONFIRMED |  | -0.017% | 15m | -0.577% | 105m | favorable | 0.619% | 1410m | -0.950% | 780m | adverse |
| 2026-05-25T05:00:02.225Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.332% | 45m | -0.216% | 150m | favorable | 0.636% | 570m | -2.280% | 1335m | favorable |
| 2026-05-25T14:15:01.920Z | BTC | LONG_CONFIRMED |  | 0.322% | 165m | 0.041% | 120m | adverse | 0.322% | 165m | -1.237% | 795m | favorable |
| 2026-05-25T15:45:02.183Z | BTC | SHORT_CONFIRMED |  | 0.341% | 240m | -0.099% | 75m | adverse | 1.457% | 705m | -0.383% | 1365m | favorable |
| 2026-05-25T18:45:02.277Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | -0.169% | 15m | -1.425% | 240m | favorable | -0.017% | 1185m | -3.076% | 1365m | favorable |
| 2026-05-25T21:00:02.366Z | ETH | LONG_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 0.281% | 75m | -0.604% | 225m | favorable | 1.414% | 1050m | -2.071% | 1230m | favorable |
| 2026-05-25T22:45:01.852Z | ETH | LONG_CONFIRMED | NEUTRAL | 0.332% | 75m | -0.876% | 180m | favorable | 1.491% | 945m | -1.997% | 1125m | favorable |
| 2026-05-26T02:45:02.748Z | BTC | SHORT_CONFIRMED |  | 0.077% | 45m | -0.493% | 240m | favorable | 1.152% | 1440m | -1.789% | 705m | adverse |
| 2026-05-26T04:30:02.580Z | BTC | LONG_CONFIRMED |  | 0.303% | 135m | -0.116% | 195m | favorable | 1.597% | 600m | -1.620% | 1440m | favorable |
| 2026-05-26T08:15:02.236Z | BTC | LONG_CONFIRMED |  | 0.938% | 150m | -0.145% | 105m | adverse | 1.550% | 375m | -1.925% | 1230m | favorable |
| 2026-05-26T11:15:02.713Z | ETH | SHORT_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 0.775% | 225m | -0.574% | 195m | adverse | 3.006% | 1050m | -0.574% | 195m | adverse |
| 2026-05-26T11:45:02.737Z | BTC | SHORT_CONFIRMED |  | 0.907% | 240m | -0.965% | 165m | adverse | 2.489% | 1020m | -0.965% | 165m | adverse |
| 2026-05-26T17:00:02.485Z | ETH | SHORT_CONFIRMED | BTC_STRONG_ALT_NOT_FOLLOWING | 0.675% | 30m | -0.045% | 15m | adverse | 1.274% | 1245m | -0.704% | 930m | adverse |
| 2026-05-26T18:30:02.766Z | SOL | SHORT_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 0.507% | 45m | -0.066% | 150m | favorable | 0.973% | 1155m | -0.722% | 1305m | favorable |
| 2026-05-26T20:45:02.042Z | ETH | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.152% | 240m | -0.395% | 120m | adverse | 0.835% | 705m | -1.502% | 1290m | favorable |
| 2026-05-26T22:45:02.844Z | SOL | SHORT_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | -0.006% | 15m | -0.641% | 135m | favorable | 1.359% | 1395m | -1.036% | 1050m | adverse |
| 2026-05-27T01:30:02.006Z | ETH | LONG_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 0.161% | 105m | -0.549% | 195m | favorable | 0.960% | 420m | -2.619% | 1320m | favorable |
| 2026-05-27T04:30:02.423Z | BTC | SHORT_CONFIRMED |  | 0.236% | 15m | -0.736% | 240m | favorable | 3.280% | 1440m | -0.736% | 240m | adverse |
| 2026-05-27T11:00:01.915Z | BTC | LONG_CONFIRMED |  | 0.080% | 15m | -1.390% | 210m | favorable | 0.080% | 15m | -3.961% | 1185m | favorable |
| 2026-05-27T11:30:02.418Z | ETH | SHORT_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 1.408% | 135m | -0.111% | 60m | adverse | 5.197% | 1155m | -0.111% | 60m | adverse |
| 2026-05-27T12:15:02.030Z | SOL | SHORT_CONFIRMED | BTC_STRONG_ALT_NOT_FOLLOWING | 0.736% | 90m | -0.963% | 240m | favorable | 3.955% | 975m | -0.963% | 240m | adverse |
| 2026-05-27T15:30:02.145Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | -0.018% | 45m | -1.381% | 165m | favorable | -0.018% | 45m | -4.888% | 780m | favorable |
| 2026-05-27T18:00:02.472Z | SOL | LONG_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 0.907% | 75m | -1.051% | 240m | favorable | 0.907% | 75m | -3.586% | 630m | favorable |
| 2026-05-28T00:45:02.569Z | BTC | LONG_CONFIRMED |  | 0.009% | 15m | -2.069% | 225m | favorable | 0.009% | 15m | -2.401% | 780m | favorable |
| 2026-05-28T05:00:02.068Z | ETH | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.665% | 165m | -0.391% | 105m | adverse | 2.217% | 840m | -0.391% | 105m | adverse |
| 2026-05-28T07:45:02.089Z | ETH | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.069% | 150m | -0.456% | 45m | adverse | 1.566% | 675m | -0.936% | 360m | adverse |
| 2026-05-28T08:15:01.943Z | BTC | LONG_CONFIRMED |  | 0.173% | 120m | -0.255% | 15m | adverse | 0.662% | 810m | -0.901% | 330m | adverse |
| 2026-05-28T08:15:01.943Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.068% | 120m | -0.549% | 165m | favorable | 2.115% | 645m | -0.796% | 330m | adverse |
| 2026-05-28T13:15:02.583Z | BTC | SHORT_CONFIRMED |  | 0.762% | 30m | -0.222% | 240m | favorable | 0.762% | 30m | -0.802% | 510m | favorable |
| 2026-05-28T16:15:02.477Z | ETH | SHORT_CONFIRMED | BTC_STRONG_ALT_NOT_FOLLOWING | -0.146% | 15m | -1.504% | 165m | favorable | 0.499% | 1350m | -2.028% | 1440m | favorable |
| 2026-05-28T18:00:02.483Z | BTC | LONG_CONFIRMED |  | 0.499% | 225m | -0.196% | 120m | adverse | 0.976% | 1395m | -1.193% | 1245m | adverse |
| 2026-05-28T18:15:02.446Z | SOL | LONG_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 0.175% | 45m | -0.780% | 120m | favorable | 0.442% | 1380m | -2.571% | 1230m | adverse |
| 2026-05-28T23:45:02.275Z | BTC | LONG_CONFIRMED |  | 0.273% | 60m | -0.521% | 195m | favorable | 0.895% | 1050m | -1.272% | 900m | adverse |
| 2026-05-29T01:15:02.781Z | ETH | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | -0.066% | 240m | -0.771% | 105m | adverse | 1.473% | 960m | -1.399% | 810m | adverse |
| 2026-05-29T03:00:02.053Z | SOL | SHORT_CONFIRMED | BTC_STRONG_ALT_NOT_FOLLOWING | 0.215% | 75m | -0.803% | 240m | favorable | 1.245% | 705m | -1.809% | 855m | favorable |
| 2026-05-29T05:00:02.516Z | BTC | LONG_CONFIRMED |  | 0.430% | 135m | -0.131% | 165m | favorable | 1.040% | 735m | -1.130% | 585m | adverse |
| 2026-05-29T05:00:02.516Z | ETH | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.520% | 135m | -0.198% | 165m | favorable | 1.721% | 735m | -1.158% | 585m | adverse |
| 2026-05-29T05:45:02.268Z | SOL | LONG_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 0.838% | 225m | 0.092% | 120m | adverse | 1.498% | 690m | -1.547% | 540m | adverse |
| 2026-05-29T06:45:03.087Z | BTC | LONG_CONFIRMED |  | 0.251% | 165m | -0.401% | 60m | adverse | 0.767% | 630m | -1.397% | 480m | adverse |
| 2026-05-29T08:15:02.354Z | ETH | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.388% | 75m | -0.359% | 240m | favorable | 1.756% | 540m | -1.124% | 390m | adverse |
| 2026-05-29T08:45:02.509Z | BTC | LONG_CONFIRMED |  | 0.105% | 45m | -0.709% | 240m | favorable | 0.621% | 510m | -1.540% | 360m | adverse |
| 2026-05-29T09:45:02.154Z | SOL | LONG_CONFIRMED | NEUTRAL | 0.018% | 15m | -1.427% | 210m | favorable | 0.783% | 450m | -2.240% | 300m | adverse |
| 2026-05-29T17:30:02.765Z | BTC | LONG_CONFIRMED |  | 0.014% | 15m | -1.226% | 120m | favorable | 0.014% | 15m | -1.231% | 675m | favorable |
| 2026-05-29T18:30:02.886Z | BTC | LONG_CONFIRMED |  | 0.044% | 165m | -0.645% | 60m | adverse | 0.319% | 1245m | -0.650% | 615m | adverse |
| 2026-05-29T22:00:01.980Z | BTC | LONG_CONFIRMED |  | 0.285% | 210m | -0.056% | 90m | adverse | 0.811% | 1245m | -0.179% | 405m | adverse |
| 2026-05-29T23:15:03.176Z | ETH | SHORT_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 0.130% | 15m | -0.564% | 240m | favorable | 0.224% | 330m | -1.019% | 960m | favorable |
| 2026-05-30T01:45:02.111Z | SOL | LONG_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 0.260% | 90m | -0.708% | 180m | favorable | 0.357% | 1200m | -0.708% | 180m | adverse |
| 2026-05-30T10:15:02.232Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.213% | 240m | -0.164% | 120m | adverse | 1.014% | 1125m | -0.164% | 120m | adverse |
| 2026-05-30T12:45:02.303Z | BTC | LONG_CONFIRMED |  | 0.478% | 150m | 0.024% | 15m | adverse | 0.726% | 885m | 0.024% | 15m | adverse |
| 2026-05-30T15:00:02.698Z | ETH | LONG_CONFIRMED | NEUTRAL | 0.187% | 15m | -0.170% | 165m | favorable | 0.423% | 750m | -0.999% | 1440m | favorable |
| 2026-05-30T15:45:02.938Z | BTC | LONG_CONFIRMED |  | 0.228% | 180m | 0.042% | 90m | adverse | 0.459% | 705m | -0.355% | 1365m | favorable |
| 2026-05-30T17:30:02.646Z | SOL | LONG_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 0.236% | 225m | -0.006% | 120m | adverse | 0.465% | 690m | -1.577% | 1425m | favorable |
| 2026-05-30T19:15:01.943Z | BTC | LONG_CONFIRMED |  | -0.017% | 45m | -0.302% | 210m | favorable | 0.237% | 495m | -0.703% | 1290m | favorable |
| 2026-05-30T19:15:01.943Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.151% | 150m | -0.525% | 210m | favorable | 0.368% | 585m | -1.672% | 1320m | favorable |
| 2026-05-31T03:15:02.292Z | BTC | LONG_CONFIRMED |  | 0.091% | 15m | -0.226% | 240m | favorable | 0.091% | 15m | -1.155% | 1365m | favorable |
| 2026-05-31T09:30:02.687Z | ETH | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.060% | 15m | -0.433% | 60m | favorable | 0.060% | 15m | -2.509% | 1380m | favorable |
| 2026-05-31T09:45:02.420Z | SOL | LONG_CONFIRMED | NEUTRAL | -0.018% | 225m | -0.537% | 60m | adverse | -0.018% | 225m | -2.817% | 1365m | favorable |
| 2026-05-31T10:15:02.961Z | ETH | LONG_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 0.268% | 195m | -0.090% | 15m | adverse | 0.268% | 195m | -2.173% | 1335m | favorable |
| 2026-05-31T12:45:02.245Z | ETH | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.014% | 45m | -1.177% | 240m | favorable | 0.014% | 45m | -2.421% | 1185m | favorable |
| 2026-05-31T13:15:02.389Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.054% | 15m | -1.660% | 240m | favorable | 0.054% | 15m | -3.097% | 1440m | favorable |
| 2026-05-31T15:00:02.707Z | BTC | SHORT_CONFIRMED |  | 0.129% | 105m | -0.183% | 30m | adverse | 2.886% | 1425m | -0.482% | 480m | adverse |
| 2026-05-31T15:45:02.562Z | BTC | LONG_CONFIRMED |  | 0.086% | 120m | -0.174% | 60m | adverse | 0.437% | 435m | -3.462% | 1425m | favorable |
| 2026-05-31T16:30:02.279Z | ETH | SHORT_CONFIRMED | BTC_STRONG_ALT_NOT_FOLLOWING | 0.492% | 180m | 0.044% | 90m | adverse | 2.243% | 1380m | -0.530% | 480m | adverse |
| 2026-05-31T17:30:02.091Z | BTC | LONG_CONFIRMED |  | 0.199% | 210m | -0.102% | 120m | adverse | 0.497% | 330m | -3.732% | 1365m | favorable |
| 2026-05-31T17:30:02.091Z | ETH | SHORT_CONFIRMED | BTC_STRONG_ALT_NOT_FOLLOWING | 0.298% | 120m | -0.227% | 210m | favorable | 2.053% | 1320m | -0.726% | 420m | adverse |
| 2026-06-01T03:00:02.154Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.200% | 30m | -1.870% | 225m | favorable | 0.200% | 30m | -4.182% | 750m | favorable |
| 2026-06-01T03:45:02.904Z | BTC | SHORT_CONFIRMED |  | 1.207% | 240m | 0.132% | 15m | adverse | 4.820% | 1350m | 0.132% | 15m | adverse |
| 2026-06-01T03:45:02.904Z | ETH | SHORT_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 1.522% | 180m | 0.152% | 15m | adverse | 2.541% | 705m | 0.152% | 15m | adverse |
| 2026-06-01T03:45:02.904Z | SOL | SHORT_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 2.003% | 240m | 0.175% | 15m | adverse | 4.217% | 705m | 0.175% | 15m | adverse |
| 2026-06-01T06:15:02.078Z | ETH | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | -0.186% | 60m | -0.836% | 135m | favorable | 0.781% | 870m | -1.539% | 555m | adverse |
| 2026-06-01T07:30:02.577Z | SOL | LONG_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | -0.043% | 240m | -0.672% | 60m | adverse | 0.277% | 930m | -2.398% | 480m | adverse |
| 2026-06-01T08:45:02.377Z | ETH | LONG_CONFIRMED | NEUTRAL | 0.576% | 240m | -0.120% | 210m | adverse | 1.439% | 720m | -0.897% | 405m | adverse |
| 2026-06-01T10:30:02.049Z | SOL | SHORT_CONFIRMED | BTC_STRONG_ALT_NOT_FOLLOWING | 1.714% | 240m | -0.340% | 60m | adverse | 2.469% | 1380m | -0.662% | 750m | adverse |
| 2026-06-01T12:30:02.109Z | BTC | LONG_CONFIRMED |  | 0.056% | 15m | -1.943% | 225m | favorable | 0.056% | 15m | -4.101% | 1440m | favorable |
| 2026-06-01T12:45:02.556Z | ETH | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | -0.253% | 15m | -1.625% | 165m | favorable | 0.693% | 480m | -1.625% | 165m | adverse |
| 2026-06-01T13:45:02.654Z | SOL | SHORT_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 1.192% | 105m | -1.042% | 240m | favorable | 1.829% | 1350m | -1.517% | 555m | adverse |
| 2026-06-01T16:30:02.714Z | BTC | LONG_CONFIRMED |  | 0.873% | 75m | 0.332% | 15m | adverse | 0.873% | 75m | -5.420% | 1395m | favorable |
| 2026-06-01T17:00:02.214Z | ETH | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 1.502% | 225m | 0.277% | 15m | adverse | 1.502% | 225m | -3.549% | 1365m | favorable |
| 2026-06-01T17:30:02.170Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.390% | 135m | -0.353% | 45m | adverse | 0.600% | 330m | -5.869% | 1335m | favorable |
| 2026-06-01T19:30:02.812Z | BTC | LONG_CONFIRMED |  | 0.031% | 15m | -0.891% | 165m | favorable | 0.031% | 15m | -6.490% | 1440m | favorable |
| 2026-06-01T23:00:02.474Z | BTC | SHORT_CONFIRMED |  | 1.575% | 195m | -0.142% | 45m | adverse | 7.122% | 1440m | -0.142% | 45m | adverse |
| 2026-06-02T02:45:01.945Z | BTC | LONG_CONFIRMED |  | 0.582% | 120m | -0.466% | 195m | favorable | 0.582% | 120m | -6.046% | 1215m | favorable |
| 2026-06-02T06:00:02.900Z | BTC | SHORT_CONFIRMED |  | 1.222% | 210m | -0.138% | 30m | adverse | 6.336% | 1305m | -0.138% | 30m | adverse |
| 2026-06-02T06:00:02.900Z | SOL | SHORT_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 0.874% | 210m | -0.270% | 105m | adverse | 8.674% | 1320m | -0.270% | 105m | adverse |
| 2026-06-02T15:30:03.112Z | ETH | SHORT_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 0.372% | 240m | -1.046% | 45m | adverse | 4.601% | 735m | -1.046% | 45m | adverse |
| 2026-06-02T19:15:02.066Z | BTC | LONG_CONFIRMED |  | 0.769% | 135m | -1.503% | 225m | favorable | 0.769% | 135m | -2.584% | 1275m | favorable |
| 2026-06-02T19:15:02.066Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | -0.322% | 150m | -3.165% | 225m | favorable | -0.322% | 150m | -4.823% | 1275m | favorable |
| 2026-06-03T00:00:02.379Z | ETH | SHORT_CONFIRMED | BTC_STRONG_ALT_NOT_FOLLOWING | 1.946% | 225m | -0.528% | 45m | adverse | 4.242% | 1260m | -1.456% | 690m | adverse |
| 2026-06-03T00:45:02.616Z | BTC | SHORT_CONFIRMED |  | 1.855% | 180m | 0.045% | 45m | adverse | 5.385% | 1425m | -0.413% | 315m | adverse |
| 2026-06-03T03:45:02.078Z | SOL | SHORT_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 0.199% | 15m | -3.361% | 240m | favorable | 6.303% | 1350m | -3.787% | 450m | adverse |
| 2026-06-03T07:30:02.876Z | BTC | SHORT_CONFIRMED |  | 0.680% | 135m | -0.222% | 240m | favorable | 7.466% | 1110m | -0.222% | 240m | adverse |
| 2026-06-03T16:15:02.075Z | ETH | LONG_CONFIRMED | NEUTRAL | 0.085% | 90m | -1.643% | 225m | favorable | 0.747% | 345m | -5.341% | 1140m | favorable |
| 2026-06-03T20:15:02.142Z | BTC | SHORT_CONFIRMED |  | 2.074% | 225m | -0.405% | 105m | adverse | 5.078% | 345m | -0.405% | 105m | adverse |
| 2026-06-04T02:45:02.237Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 2.249% | 90m | -0.093% | 15m | adverse | 2.249% | 90m | -3.491% | 510m | favorable |
| 2026-06-04T08:30:02.084Z | SOL | SHORT_CONFIRMED | NEUTRAL | 2.079% | 165m | -0.225% | 30m | adverse | 7.092% | 1365m | -2.093% | 345m | adverse |
| 2026-06-04T11:30:02.140Z | ETH | SHORT_CONFIRMED | BTC_STRONG_ALT_NOT_FOLLOWING | 0.418% | 15m | -2.371% | 165m | favorable | 6.226% | 1185m | -2.371% | 165m | adverse |
| 2026-06-04T14:45:02.492Z | BTC | SHORT_CONFIRMED |  | 1.525% | 180m | -0.491% | 30m | adverse | 5.641% | 1425m | -0.491% | 30m | adverse |
| 2026-06-04T19:00:02.469Z | ETH | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.478% | 30m | -1.053% | 195m | favorable | 0.478% | 30m | -12.466% | 1440m | favorable |
| 2026-06-04T20:15:02.805Z | BTC | SHORT_CONFIRMED |  | 0.343% | 105m | -0.532% | 225m | favorable | 6.477% | 1380m | -0.547% | 255m | adverse |
| 2026-06-05T05:30:02.956Z | BTC | LONG_CONFIRMED |  | -0.638% | 240m | -3.137% | 105m | adverse | -0.638% | 240m | -6.500% | 825m | favorable |
| 2026-06-05T07:00:02.150Z | BTC | LONG_CONFIRMED |  | 1.911% | 150m | -0.652% | 15m | adverse | 1.911% | 150m | -4.102% | 735m | favorable |
| 2026-06-05T07:45:02.109Z | ETH | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.676% | 105m | -0.535% | 75m | adverse | 0.676% | 105m | -9.237% | 1290m | favorable |
| 2026-06-05T09:00:02.109Z | SOL | SHORT_CONFIRMED | NEUTRAL | -0.605% | 225m | -1.923% | 150m | adverse | 7.195% | 1185m | -1.923% | 150m | adverse |
| 2026-06-05T12:45:02.587Z | BTC | LONG_CONFIRMED |  | 0.242% | 45m | -2.657% | 180m | favorable | 0.242% | 45m | -4.191% | 390m | favorable |
| 2026-06-05T14:45:02.510Z | ETH | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | -0.079% | 135m | -2.847% | 240m | favorable | 0.248% | 420m | -5.684% | 870m | favorable |
| 2026-06-05T16:30:02.550Z | BTC | SHORT_CONFIRMED |  | 2.510% | 165m | -0.803% | 30m | adverse | 2.510% | 165m | -1.596% | 315m | favorable |
| 2026-06-05T21:00:02.809Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 1.123% | 45m | -2.145% | 165m | favorable | 1.123% | 45m | -6.203% | 465m | favorable |
| 2026-06-06T05:00:02.371Z | SOL | SHORT_CONFIRMED | NEUTRAL | 0.239% | 15m | -4.356% | 210m | favorable | 0.239% | 15m | -4.587% | 270m | favorable |
| 2026-06-06T07:00:02.363Z | SOL | SHORT_CONFIRMED | BTC_STRONG_ALT_NOT_FOLLOWING | -0.716% | 30m | -2.115% | 150m | favorable | -0.716% | 30m | -2.115% | 150m | favorable |

### Directional HIGH precision summary, excluding pre-fix rows

| horizon | n | hit rate > 0 | avg directional return |
| --- | --- | --- | --- |
| 30m | 146 | 58.2% | -0.002% |
| 1h | 146 | 48.6% | -0.086% |
| 4h | 145 | 45.5% | -0.149% |
| 8h | 144 | 44.4% | -0.220% |
| 12h | 144 | 50.7% | 0.026% |
| 24h | 140 | 53.6% | 0.036% |

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
| ETH | 1620 | 1175 | 72.6% | 237 | BTC_WEAK_VETO_ALT_LONGS -> NEUTRAL: 120; NEUTRAL -> BTC_WEAK_VETO_ALT_LONGS: 117; BTC_WEAK_VETO_ALT_LONGS -> BTC_CONFIRMS_ALT_LONG_CONTEXT: 116; BTC_CONFIRMS_ALT_LONG_CONTEXT -> BTC_WEAK_VETO_ALT_LONGS: 114; BTC_STRONG_ALT_NOT_FOLLOWING -> BTC_WEAK_VETO_ALT_LONGS: 110 |
| SOL | 1620 | 1170 | 72.3% | 237 | BTC_WEAK_VETO_ALT_LONGS -> BTC_STRONG_ALT_NOT_FOLLOWING: 131; BTC_STRONG_ALT_NOT_FOLLOWING -> BTC_WEAK_VETO_ALT_LONGS: 122; BTC_WEAK_VETO_ALT_LONGS -> NEUTRAL: 120; NEUTRAL -> BTC_WEAK_VETO_ALT_LONGS: 117; BTC_CONFIRMS_ALT_LONG_CONTEXT -> BTC_WEAK_VETO_ALT_LONGS: 102 |

## 4. SHORT_CONFIRMED Timing vs Local Lows

`forward 4h low` shows whether a short had downside left after confirmation. `surrounding low lag` uses a window from 2h before to 4h after alert; positive lag means the alert fired after the local low, i.e. likely late.

| time | asset | alert price | forward 4h low | minutes to fwd low | return to fwd low | surrounding low | alert lag vs surrounding low |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-05-21T05:15:02.454Z | ETH | 2140.205 | 2026-05-21T07:19:34.481Z @ 2123.97 | 125 | 0.759% | 2026-05-21T07:19:34.481Z @ 2123.97 | -125m |
| 2026-05-21T05:30:02.452Z | SOL | 86.555 | 2026-05-21T07:00:01.588Z @ 86.23 | 90 | 0.375% | 2026-05-21T07:00:01.588Z @ 86.23 | -90m |
| 2026-05-21T18:30:02.382Z | BTC | 77673.45 | 2026-05-21T19:00:01.646Z @ 77273.4 | 30 | 0.515% | 2026-05-21T16:45:01.368Z @ 76972.3 | 105m |
| 2026-05-21T18:30:02.382Z | ETH | 2138.195 | 2026-05-21T19:00:01.646Z @ 2124.97 | 30 | 0.619% | 2026-05-21T16:45:01.368Z @ 2122.32 | 105m |
| 2026-05-21T19:45:02.413Z | BTC | 77555.05 | 2026-05-21T23:15:02.294Z @ 77537.7 | 210 | 0.022% | 2026-05-21T19:00:01.646Z @ 77273.4 | 45m |
| 2026-05-21T21:00:02.629Z | SOL | 87.505 | 2026-05-22T01:00:02.185Z @ 86.77 | 240 | 0.840% | 2026-05-22T01:00:02.185Z @ 86.77 | -240m |
| 2026-05-21T22:15:02.236Z | SOL | 87.255 | 2026-05-22T01:45:01.430Z @ 86.75 | 210 | 0.579% | 2026-05-22T01:45:01.430Z @ 86.75 | -210m |
| 2026-05-22T05:15:03.139Z | BTC | 77601.75 | 2026-05-22T09:15:01.546Z @ 77136.4 | 240 | 0.600% | 2026-05-22T09:15:01.546Z @ 77136.4 | -240m |
| 2026-05-22T06:00:02.077Z | SOL | 86.715 | 2026-05-22T06:30:01.367Z @ 86.44 | 30 | 0.317% | 2026-05-22T06:30:01.367Z @ 86.44 | -30m |
| 2026-05-22T14:30:02.275Z | BTC | 76777.55 | 2026-05-22T15:45:02.023Z @ 76616.1 | 75 | 0.210% | 2026-05-22T15:45:02.023Z @ 76616.1 | -75m |
| 2026-05-22T15:15:02.565Z | ETH | 2115.195 | 2026-05-22T19:15:01.431Z @ 2087.71 | 240 | 1.299% | 2026-05-22T19:15:01.431Z @ 2087.71 | -240m |
| 2026-05-23T00:45:02.794Z | SOL | 84.145 | 2026-05-23T02:30:01.918Z @ 84.2 | 105 | -0.065% | 2026-05-23T00:15:01.279Z @ 84.08 | 30m |
| 2026-05-23T07:15:02.721Z | SOL | 84.115 | 2026-05-23T08:45:01.614Z @ 81.78 | 90 | 2.776% | 2026-05-23T08:45:01.614Z @ 81.78 | -90m |
| 2026-05-23T11:45:02.547Z | BTC | 74721.45 | 2026-05-23T12:15:02.131Z @ 74633.2 | 30 | 0.118% | 2026-05-23T10:00:02.099Z @ 74588.5 | 105m |
| 2026-05-23T15:30:02.790Z | BTC | 75459.95 | 2026-05-23T17:45:02.012Z @ 75336.7 | 135 | 0.163% | 2026-05-23T13:45:01.764Z @ 74863.9 | 105m |
| 2026-05-23T17:30:02.421Z | SOL | 84.135 | 2026-05-23T17:45:02.012Z @ 84.03 | 15 | 0.125% | 2026-05-23T15:45:02.040Z @ 83.75 | 105m |
| 2026-05-24T03:00:02.827Z | BTC | 76726.85 | 2026-05-24T05:45:01.262Z @ 76564.8 | 165 | 0.211% | 2026-05-24T05:45:01.262Z @ 76564.8 | -165m |
| 2026-05-24T05:00:02.818Z | ETH | 2117.715 | 2026-05-24T05:45:01.262Z @ 2111.83 | 45 | 0.278% | 2026-05-24T05:45:01.262Z @ 2111.83 | -45m |
| 2026-05-24T22:00:02.077Z | SOL | 83.915 | 2026-05-25T02:00:01.856Z @ 84.73 | 240 | -0.971% | 2026-05-24T21:45:02.186Z @ 83.7 | 15m |
| 2026-05-25T04:00:02.340Z | BTC | 76934.75 | 2026-05-25T04:15:01.405Z @ 76947.6 | 15 | -0.017% | 2026-05-25T04:00:01.663Z @ 76934.7 | 0m |
| 2026-05-25T15:45:02.183Z | BTC | 77589.45 | 2026-05-25T19:45:01.350Z @ 77325.2 | 240 | 0.341% | 2026-05-25T14:00:02.153Z @ 77270.1 | 105m |
| 2026-05-26T02:45:02.748Z | BTC | 76517.65 | 2026-05-26T03:30:02.102Z @ 76458.6 | 45 | 0.077% | 2026-05-26T03:30:02.102Z @ 76458.6 | -45m |
| 2026-05-26T11:15:02.713Z | ETH | 2123.755 | 2026-05-26T15:00:01.900Z @ 2107.3 | 225 | 0.775% | 2026-05-26T10:00:02.113Z @ 2094.7 | 75m |
| 2026-05-26T11:45:02.737Z | BTC | 77142.05 | 2026-05-26T15:45:02.236Z @ 76442.2 | 240 | 0.907% | 2026-05-26T15:45:02.236Z @ 76442.2 | -240m |
| 2026-05-26T17:00:02.485Z | ETH | 2076.555 | 2026-05-26T17:30:01.703Z @ 2062.53 | 30 | 0.675% | 2026-05-26T17:30:01.703Z @ 2062.53 | -30m |
| 2026-05-26T18:30:02.766Z | SOL | 83.765 | 2026-05-26T19:15:01.828Z @ 83.34 | 45 | 0.507% | 2026-05-26T17:30:01.703Z @ 83.33 | 60m |
| 2026-05-26T22:45:02.844Z | SOL | 83.505 | 2026-05-26T23:00:01.719Z @ 83.51 | 15 | -0.006% | 2026-05-26T21:15:01.979Z @ 83.47 | 90m |
| 2026-05-27T04:30:02.423Z | BTC | 75400.05 | 2026-05-27T04:45:01.483Z @ 75221.8 | 15 | 0.236% | 2026-05-27T04:45:01.483Z @ 75221.8 | -15m |
| 2026-05-27T11:30:02.418Z | ETH | 2079.385 | 2026-05-27T13:45:01.800Z @ 2050.1 | 135 | 1.408% | 2026-05-27T13:45:01.800Z @ 2050.1 | -135m |
| 2026-05-27T12:15:02.030Z | SOL | 83.565 | 2026-05-27T13:45:01.800Z @ 82.95 | 90 | 0.736% | 2026-05-27T13:45:01.800Z @ 82.95 | -90m |
| 2026-05-28T13:15:02.583Z | BTC | 73238.35 | 2026-05-28T13:45:01.311Z @ 72680 | 30 | 0.762% | 2026-05-28T13:45:01.311Z @ 72680 | -30m |
| 2026-05-28T16:15:02.477Z | ETH | 1992.955 | 2026-05-28T16:30:01.795Z @ 1995.86 | 15 | -0.146% | 2026-05-28T14:45:02.110Z @ 1980.22 | 90m |
| 2026-05-29T03:00:02.053Z | SOL | 81.535 | 2026-05-29T04:15:01.503Z @ 81.36 | 75 | 0.215% | 2026-05-29T04:15:01.503Z @ 81.36 | -75m |
| 2026-05-29T23:15:03.176Z | ETH | 2008.605 | 2026-05-29T23:30:01.730Z @ 2005.99 | 15 | 0.130% | 2026-05-29T23:30:01.730Z @ 2005.99 | -15m |
| 2026-05-31T15:00:02.707Z | BTC | 73518.55 | 2026-05-31T16:45:01.968Z @ 73423.9 | 105 | 0.129% | 2026-05-31T16:45:01.968Z @ 73423.9 | -105m |
| 2026-05-31T16:30:02.279Z | ETH | 2004.455 | 2026-05-31T19:30:01.574Z @ 1994.6 | 180 | 0.492% | 2026-05-31T19:30:01.574Z @ 1994.6 | -180m |
| 2026-05-31T17:30:02.091Z | ETH | 2000.565 | 2026-05-31T19:30:01.574Z @ 1994.6 | 120 | 0.298% | 2026-05-31T19:30:01.574Z @ 1994.6 | -120m |
| 2026-06-01T03:45:02.904Z | BTC | 73773.85 | 2026-06-01T07:45:01.910Z @ 72883.3 | 240 | 1.207% | 2026-06-01T07:45:01.910Z @ 72883.3 | -240m |
| 2026-06-01T03:45:02.904Z | ETH | 2010.595 | 2026-06-01T06:45:02.021Z @ 1980 | 180 | 1.522% | 2026-06-01T06:45:02.021Z @ 1980 | -180m |
| 2026-06-01T03:45:02.904Z | SOL | 82.645 | 2026-06-01T07:45:01.910Z @ 80.99 | 240 | 2.003% | 2026-06-01T07:45:01.910Z @ 80.99 | -240m |
| 2026-06-01T10:30:02.049Z | SOL | 80.795 | 2026-06-01T14:30:01.546Z @ 79.41 | 240 | 1.714% | 2026-06-01T14:30:01.546Z @ 79.41 | -240m |
| 2026-06-01T13:45:02.654Z | SOL | 80.115 | 2026-06-01T15:30:02.432Z @ 79.16 | 105 | 1.192% | 2026-06-01T15:30:02.432Z @ 79.16 | -105m |
| 2026-06-01T23:00:02.474Z | BTC | 71341.75 | 2026-06-02T02:15:01.499Z @ 70218 | 195 | 1.575% | 2026-06-02T02:15:01.499Z @ 70218 | -195m |
| 2026-06-02T06:00:02.900Z | BTC | 70194.65 | 2026-06-02T09:30:01.378Z @ 69336.8 | 210 | 1.222% | 2026-06-02T09:30:01.378Z @ 69336.8 | -210m |
| 2026-06-02T06:00:02.900Z | SOL | 79.495 | 2026-06-02T09:30:01.378Z @ 78.8 | 210 | 0.874% | 2026-06-02T09:30:01.378Z @ 78.8 | -210m |
| 2026-06-02T15:30:03.112Z | ETH | 1909.445 | 2026-06-02T19:30:01.914Z @ 1902.35 | 240 | 0.372% | 2026-06-02T19:30:01.914Z @ 1902.35 | -240m |
| 2026-06-03T00:00:02.379Z | ETH | 1857.745 | 2026-06-03T03:45:01.299Z @ 1821.59 | 225 | 1.946% | 2026-06-03T03:45:01.299Z @ 1821.59 | -225m |
| 2026-06-03T00:45:02.616Z | BTC | 66989.85 | 2026-06-03T03:45:01.299Z @ 65747.1 | 180 | 1.855% | 2026-06-03T03:45:01.299Z @ 65747.1 | -180m |
| 2026-06-03T03:45:02.078Z | SOL | 72.745 | 2026-06-03T04:00:01.582Z @ 72.6 | 15 | 0.199% | 2026-06-03T04:00:01.582Z @ 72.6 | -15m |
| 2026-06-03T07:30:02.876Z | BTC | 67115.65 | 2026-06-03T09:45:01.660Z @ 66659.2 | 135 | 0.680% | 2026-06-03T09:45:01.660Z @ 66659.2 | -135m |
| 2026-06-03T20:15:02.142Z | BTC | 65427.15 | 2026-06-04T00:00:02.256Z @ 64070.4 | 225 | 2.074% | 2026-06-04T00:00:02.256Z @ 64070.4 | -225m |
| 2026-06-04T08:30:02.084Z | SOL | 69.025 | 2026-06-04T11:15:01.659Z @ 67.59 | 165 | 2.079% | 2026-06-04T11:15:01.659Z @ 67.59 | -165m |
| 2026-06-04T11:30:02.140Z | ETH | 1746.395 | 2026-06-04T11:45:02.294Z @ 1739.1 | 15 | 0.418% | 2026-06-04T11:15:01.659Z @ 1734.85 | 15m |
| 2026-06-04T14:45:02.492Z | BTC | 63961.35 | 2026-06-04T17:45:01.812Z @ 62986.2 | 180 | 1.525% | 2026-06-04T17:45:01.812Z @ 62986.2 | -180m |
| 2026-06-04T20:15:02.805Z | BTC | 63462.15 | 2026-06-04T22:00:01.989Z @ 63244.7 | 105 | 0.343% | 2026-06-04T22:00:01.989Z @ 63244.7 | -105m |
| 2026-06-05T09:00:02.109Z | SOL | 65.255 | 2026-06-05T12:45:01.835Z @ 65.65 | 225 | -0.605% | 2026-06-05T07:15:02.170Z @ 64.13 | 105m |
| 2026-06-05T16:30:02.550Z | BTC | 60879.45 | 2026-06-05T19:15:01.458Z @ 59351.6 | 165 | 2.510% | 2026-06-05T19:15:01.458Z @ 59351.6 | -165m |
| 2026-06-06T05:00:02.371Z | SOL | 60.715 | 2026-06-06T05:15:02.225Z @ 60.57 | 15 | 0.239% | 2026-06-06T04:45:01.280Z @ 60.56 | 15m |
| 2026-06-06T07:00:02.363Z | SOL | 62.185 | 2026-06-06T07:30:01.364Z @ 62.63 | 30 | -0.716% | 2026-06-06T05:15:02.225Z @ 60.57 | 105m |

