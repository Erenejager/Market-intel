# Phase 1 Alert Quality Report

Generated: 2026-06-04T15:27:41.086Z
Window: 2026-05-25T00:00:00Z → +∞

## 1. HIGH Alert Outcome Table

Pre-fix rows are labeled and excluded from directional precision summaries. Directional returns are positive when price moved in the alert direction. MFE/MAE use `data/autoresearch/price-15m.jsonl`.

| time | asset | type | price | pre-fix? | +30m | +1h | +4h | +8h | +12h | +24h | MFE 4h | MAE 4h | invalidation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
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
| 2026-06-01T06:15:02.078Z | ETH | LONG_CONFIRMED | 1990.135 |  | -0.244% | -0.335% | -0.454% | -1.227% | -0.063% | -0.388% | -0.186% | -0.836% |  |
| 2026-06-01T07:30:02.577Z | SOL | LONG_CONFIRMED | 81.105 |  | -0.512% | -0.549% | -0.117% | -1.671% | 0.068% | -1.720% | -0.043% | -0.672% |  |
| 2026-06-01T08:45:02.377Z | ETH | LONG_CONFIRMED | 1977.235 |  | 0.389% | 0.428% | 0.486% | -0.069% | 1.313% | -0.057% | 0.576% | -0.120% |  |
| 2026-06-01T10:30:02.049Z | SOL | SHORT_CONFIRMED | 80.795 |  | -0.254% | -0.266% | 1.640% | -0.217% | 0.155% | 2.073% | 1.714% | -0.340% |  |
| 2026-06-01T12:30:02.109Z | BTC | LONG_CONFIRMED | 72165.85 |  | -0.510% | -0.916% | -1.253% | -0.871% | -1.464% | -4.178% | 0.056% | -1.943% | 570m LONG_INVALIDATED (other) -1.655% |
| 2026-06-01T12:45:02.556Z | ETH | LONG_CONFIRMED | 1991.875 |  | -0.904% | -1.198% | -0.803% | 0.568% | 0.131% | -0.895% | -0.253% | -1.625% |  |
| 2026-06-01T12:45:02.556Z | CROSS_ASSET | CROSS_ASSET_COVER | n/a |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-06-01T13:45:02.654Z | SOL | SHORT_CONFIRMED | 80.115 |  | 0.880% | 0.693% | -0.930% | -0.643% | 0.081% | 1.616% | 1.192% | -1.042% |  |
| 2026-06-01T16:30:02.714Z | BTC | LONG_CONFIRMED | 71025.75 |  | 0.694% | 0.873% | 0.720% | 0.117% | -0.128% | -4.897% | 0.873% | 0.332% | 330m LONG_INVALIDATED (other) -0.077% |
| 2026-06-01T17:00:02.214Z | ETH | LONG_CONFIRMED | 1975.995 |  | 0.765% | 0.322% | 1.092% | 0.976% | 1.109% | -2.727% | 1.502% | 0.277% |  |
| 2026-06-01T17:30:02.170Z | SOL | LONG_CONFIRMED | 80.845 |  | -0.353% | 0.155% | -0.278% | -0.612% | -1.082% | -5.065% | 0.390% | -0.353% |  |
| 2026-06-01T19:30:02.812Z | BTC | LONG_CONFIRMED | 71562.35 |  | -0.069% | -0.035% | -0.166% | -0.919% | -2.001% | -6.564% | 0.031% | -0.891% | 150m LONG_INVALIDATED (other) -0.826% |
| 2026-06-01T21:15:02.528Z | BTC | ACTIVE_CONTEXT_STRESSED | 71155.75 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-06-01T22:00:02.526Z | BTC | ACTIVE_CONTEXT_FAILED | 70971.35 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-06-01T22:00:02.526Z | BTC | LONG_INVALIDATED | 70971.35 |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-06-01T23:00:02.474Z | BTC | SHORT_CONFIRMED | 71341.75 |  | -0.142% | 0.199% | 0.715% | 1.908% | 2.620% | 6.647% | 1.575% | -0.142% |  |
| 2026-06-02T02:45:01.945Z | BTC | LONG_CONFIRMED | 70524.45 |  | 0.520% | 0.510% | -0.703% | -1.317% | -3.709% | -5.615% | 0.582% | -0.466% |  |
| 2026-06-02T06:00:02.900Z | BTC | SHORT_CONFIRMED | 70194.65 |  | -0.013% | 0.305% | 0.873% | 2.356% | 3.798% | 4.440% | 1.222% | -0.138% |  |
| 2026-06-02T06:00:02.900Z | SOL | SHORT_CONFIRMED | 79.495 |  | 0.057% | -0.006% | 0.296% | 1.050% | 3.629% | 5.893% | 0.874% | -0.270% |  |
| 2026-06-02T15:30:03.112Z | ETH | SHORT_CONFIRMED | 1909.445 |  | -1.046% | -0.717% | 0.501% | 2.967% | 4.601% | 3.482% | 0.372% | -1.046% |  |
| 2026-06-02T19:15:02.066Z | BTC | LONG_CONFIRMED | 67271.35 |  | -0.086% | -0.565% | -1.330% | -1.780% | -0.224% | -2.032% | 0.769% | -1.503% |  |
| 2026-06-02T19:15:02.066Z | SOL | LONG_CONFIRMED | 75.995 |  | -0.796% | -1.625% | -4.046% | -3.020% | -1.244% | -4.257% | -0.322% | -3.165% |  |
| 2026-06-02T19:15:02.066Z | CROSS_ASSET | CROSS_ASSET_COVER | n/a |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-06-03T00:00:02.379Z | ETH | SHORT_CONFIRMED | 1857.745 |  | -0.528% | 0.052% | 1.061% | -0.956% | -0.781% | 2.305% | 1.946% | -0.528% |  |
| 2026-06-03T00:45:02.616Z | BTC | SHORT_CONFIRMED | 66989.85 |  | 0.045% | 0.200% | 0.905% | 0.063% | -0.017% | 5.523% | 1.855% | 0.045% |  |
| 2026-06-03T03:45:02.078Z | SOL | SHORT_CONFIRMED | 72.745 |  | -1.093% | -1.656% | -3.306% | -3.127% | -1.148% | 1.821% | 0.199% | -3.361% |  |
| 2026-06-03T07:30:02.876Z | BTC | SHORT_CONFIRMED | 67115.65 |  | 0.182% | 0.132% | 0.015% | 1.319% | 2.067% | 4.798% | 0.680% | -0.222% |  |
| 2026-06-03T16:15:02.075Z | ETH | LONG_CONFIRMED | 1832.735 |  | -0.119% | -0.323% | -1.360% | -2.762% | -1.206% | n/a | 0.085% | -1.643% |  |
| 2026-06-03T20:15:02.142Z | BTC | SHORT_CONFIRMED | 65427.15 |  | 0.734% | -0.077% | 3.125% | 1.412% | 3.031% | n/a | 2.074% | -0.405% |  |
| 2026-06-04T02:45:02.237Z | SOL | LONG_CONFIRMED | 70.035 |  | 1.278% | 1.978% | 0.421% | -3.048% | -0.393% | n/a | 2.249% | -0.093% |  |
| 2026-06-04T08:30:02.084Z | SOL | SHORT_CONFIRMED | 69.025 |  | 0.891% | 1.470% | -0.398% | n/a | n/a | n/a | 2.079% | -0.225% |  |
| 2026-06-04T11:30:02.140Z | ETH | SHORT_CONFIRMED | 1746.395 |  | 0.067% | -1.100% | n/a | n/a | n/a | n/a | 0.418% | -2.371% |  |
| 2026-06-04T14:45:02.492Z | BTC | SHORT_CONFIRMED | 63961.35 |  | n/a | n/a | n/a | n/a | n/a | n/a | 0.104% | -0.491% |  |

### Directional HIGH precision summary, excluding pre-fix rows

| horizon | n | hit rate > 0 | avg directional return |
| --- | --- | --- | --- |
| 30m | 96 | 52.1% | 0.015% |
| 1h | 96 | 45.8% | -0.041% |
| 4h | 95 | 43.2% | -0.144% |
| 8h | 94 | 38.3% | -0.241% |
| 12h | 94 | 46.8% | 0.129% |
| 24h | 91 | 48.4% | -0.122% |

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
| ETH | 1022 | 745 | 73.0% | 150 | NEUTRAL -> BTC_WEAK_VETO_ALT_LONGS: 76; BTC_WEAK_VETO_ALT_LONGS -> NEUTRAL: 74; BTC_WEAK_VETO_ALT_LONGS -> BTC_STRONG_ALT_NOT_FOLLOWING: 72; BTC_STRONG_ALT_NOT_FOLLOWING -> BTC_WEAK_VETO_ALT_LONGS: 72; BTC_WEAK_VETO_ALT_LONGS -> BTC_CONFIRMS_ALT_LONG_CONTEXT: 64 |
| SOL | 1022 | 744 | 72.9% | 150 | NEUTRAL -> BTC_WEAK_VETO_ALT_LONGS: 76; BTC_WEAK_VETO_ALT_LONGS -> NEUTRAL: 74; BTC_WEAK_VETO_ALT_LONGS -> BTC_STRONG_ALT_NOT_FOLLOWING: 74; BTC_STRONG_ALT_NOT_FOLLOWING -> BTC_WEAK_VETO_ALT_LONGS: 72; BTC_CONFIRMS_ALT_LONG_CONTEXT -> BTC_WEAK_VETO_ALT_LONGS: 62 |

## 4. SHORT_CONFIRMED Timing vs Local Lows

`forward 4h low` shows whether a short had downside left after confirmation. `surrounding low lag` uses a window from 2h before to 4h after alert; positive lag means the alert fired after the local low, i.e. likely late.

| time | asset | alert price | forward 4h low | minutes to fwd low | return to fwd low | surrounding low | alert lag vs surrounding low |
| --- | --- | --- | --- | --- | --- | --- | --- |
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
| 2026-06-04T14:45:02.492Z | BTC | 63961.35 | 2026-06-04T15:00:02.053Z @ 63894.6 | 15 | 0.104% | 2026-06-04T13:30:01.908Z @ 63202 | 75m |

