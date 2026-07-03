# Phase 1 Alert Quality Report

Generated: 2026-06-16T17:49:11.077Z
Window: 2026-06-07T18:00:00Z → +∞

## 1. HIGH Alert Outcome Table

Pre-fix rows are labeled and excluded from directional precision summaries. Directional returns are positive when price moved in the alert direction. MFE/MAE use `data/autoresearch/price-15m.jsonl`.

| time | asset | type | price | pre-fix? | +30m | +1h | +4h | +8h | +12h | +24h | MFE 4h | MAE 4h | invalidation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-06-07T20:15:02.835Z | BTC | SHORT_CONFIRMED | 61545.15 |  | -0.507% | -0.349% | -3.019% | -2.228% | -2.430% | -2.605% | -0.240% | -3.468% |  |
| 2026-06-07T20:30:03.075Z | ETH | SHORT_CONFIRMED | 1623.675 |  | -0.334% | -0.044% | -4.789% | -2.027% | -2.476% | -3.804% | 0.036% | -4.482% |  |
| 2026-06-08T01:30:02.198Z | SOL | SHORT_CONFIRMED | 65.505 |  | -1.366% | -1.275% | 0.725% | -0.878% | -1.595% | -0.588% | 0.542% | -1.519% |  |
| 2026-06-08T02:00:02.006Z | BTC | LONG_CONFIRMED | 63190.95 |  | -0.254% | 0.092% | -0.433% | 0.216% | 1.009% | -0.755% | 0.092% | -1.176% |  |
| 2026-06-08T05:15:02.674Z | SOL | SHORT_CONFIRMED | 65.175 |  | -0.054% | -0.928% | -1.235% | -2.463% | -2.892% | -2.831% | 0.222% | -1.312% |  |
| 2026-06-08T13:00:03.088Z | SOL | LONG_CONFIRMED | 67.215 |  | -0.989% | -0.632% | -0.930% | 1.004% | -2.522% | -1.570% | 0.766% | -0.989% |  |
| 2026-06-08T14:30:02.394Z | SOL | LONG_CONFIRMED | 66.795 |  | 1.400% | 0.786% | 0.711% | 0.367% | -1.729% | -3.436% | 1.400% | -0.307% |  |
| 2026-06-08T17:00:02.524Z | SOL | LONG_CONFIRMED | 66.955 |  | -0.067% | 0.709% | 1.396% | -2.143% | 0.127% | -3.607% | 0.948% | -0.545% |  |
| 2026-06-08T18:00:02.864Z | ETH | LONG_CONFIRMED | 1685.915 |  | -0.226% | -0.148% | 0.242% | -1.136% | 0.076% | -2.528% | 1.593% | -0.453% |  |
| 2026-06-08T18:00:02.864Z | SOL | LONG_CONFIRMED | 67.355 |  | -0.126% | 0.304% | -0.542% | -2.234% | -0.260% | -3.734% | 0.794% | -0.542% |  |
| 2026-06-08T18:00:02.864Z | CROSS_ASSET | CROSS_ASSET_COVER | n/a |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-06-08T19:15:02.687Z | SOL | LONG_CONFIRMED | 67.485 |  | -0.170% | -0.733% | -1.015% | -2.423% | -1.282% | -3.282% | 0.600% | -0.733% |  |
| 2026-06-08T23:30:02.429Z | ETH | LONG_CONFIRMED | 1695.915 |  | -0.690% | -1.506% | -1.690% | -0.956% | -1.527% | -3.627% | -0.014% | -2.093% |  |
| 2026-06-09T00:15:02.403Z | BTC | SHORT_CONFIRMED | 62987.05 |  | 0.727% | 0.357% | 0.354% | 0.227% | 0.598% | 1.860% | 0.727% | 0.133% |  |
| 2026-06-09T00:30:02.525Z | SOL | SHORT_CONFIRMED | 65.955 |  | 0.660% | 0.235% | -1.615% | -1.099% | -0.129% | 2.191% | 0.872% | -0.220% |  |
| 2026-06-09T03:15:02.426Z | BTC | LONG_CONFIRMED | 62881.65 |  | -0.060% | -0.187% | 0.184% | -0.517% | -2.549% | -2.145% | 0.825% | -0.187% |  |
| 2026-06-09T07:00:02.834Z | BTC | LONG_CONFIRMED | 63276.65 |  | -0.197% | -0.654% | -1.221% | -2.597% | -2.438% | -2.796% | -0.035% | -1.056% |  |
| 2026-06-09T07:30:03.038Z | SOL | SHORT_CONFIRMED | 66.675 |  | 0.202% | -0.007% | 0.952% | 3.052% | 2.107% | 3.157% | 1.072% | -0.247% |  |
| 2026-06-09T07:45:02.160Z | ETH | SHORT_CONFIRMED | 1679.775 |  | 0.290% | 0.358% | 0.493% | 2.619% | 1.436% | 2.477% | 0.766% | 0.074% |  |
| 2026-06-09T10:15:02.194Z | SOL | SHORT_CONFIRMED | 66.145 |  | 0.053% | 0.280% | 2.169% | 1.973% | 1.655% | 3.923% | 1.217% | -0.355% |  |
| 2026-06-09T11:00:02.582Z | SOL | LONG_CONFIRMED | 66.355 |  | -0.475% | -0.053% | -1.726% | -1.786% | -2.178% | -4.483% | -0.053% | -2.796% |  |
| 2026-06-09T12:45:02.756Z | SOL | SHORT_CONFIRMED | 66.035 |  | 0.522% | 0.341% | 2.930% | 0.750% | 1.431% | 2.885% | 3.097% | -0.189% |  |
| 2026-06-09T13:45:02.661Z | ETH | SHORT_CONFIRMED | 1671.595 |  | 2.038% | 1.651% | 1.764% | 1.399% | 2.053% | 1.322% | 2.662% | 0.209% |  |
| 2026-06-09T18:30:02.980Z | BTC | LONG_CONFIRMED | 61675.65 |  | 0.094% | 0.271% | 0.216% | -0.599% | -0.518% | 0.014% | 0.762% | -0.127% |  |
| 2026-06-09T18:30:02.980Z | SOL | LONG_CONFIRMED | 65.075 |  | 0.146% | 0.300% | 0.008% | -1.176% | -1.452% | -2.620% | 0.791% | -0.207% |  |
| 2026-06-09T18:30:02.980Z | CROSS_ASSET | CROSS_ASSET_COVER | n/a |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-06-09T19:30:03.070Z | ETH | LONG_CONFIRMED | 1651.185 |  | 0.517% | 0.510% | -1.016% | -1.318% | -0.724% | -1.295% | 0.517% | -1.067% |  |
| 2026-06-09T20:30:03.097Z | ETH | LONG_CONFIRMED | 1656.455 |  | 0.085% | -0.421% | -1.574% | -2.050% | -2.163% | -1.709% | 0.190% | -1.382% |  |
| 2026-06-09T20:30:03.097Z | CROSS_ASSET | CROSS_ASSET_COVER | n/a |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-06-09T22:00:03.401Z | SOL | SHORT_CONFIRMED | 64.975 |  | -0.162% | 0.100% | 0.208% | 1.547% | 2.362% | 3.840% | 0.716% | -0.208% |  |
| 2026-06-10T00:30:02.738Z | SOL | LONG_CONFIRMED | 65.025 |  | -0.038% | -0.269% | -1.315% | -2.299% | -1.238% | -2.314% | 0.131% | -1.100% |  |
| 2026-06-10T04:15:02.713Z | ETH | LONG_CONFIRMED | 1628.555 |  | -0.282% | -0.298% | 0.229% | -0.323% | 1.115% | 1.285% | 0.655% | -0.488% |  |
| 2026-06-10T04:30:02.320Z | BTC | SHORT_CONFIRMED | 61419.05 |  | 0.538% | 0.316% | 0.347% | -0.331% | -1.265% | -1.899% | 0.538% | -0.445% |  |
| 2026-06-10T09:15:02.698Z | ETH | SHORT_CONFIRMED | 1612.105 |  | -0.627% | -0.688% | -1.459% | -1.033% | -0.353% | -2.648% | -0.139% | -1.555% |  |
| 2026-06-10T13:45:02.979Z | SOL | LONG_CONFIRMED | 65.43 |  | -0.718% | -0.703% | -2.201% | -4.478% | -0.886% | 0.015% | -0.138% | -2.659% |  |
| 2026-06-10T19:45:02.289Z | ETH | LONG_CONFIRMED | 1630.425 |  | 0.058% | -0.097% | -0.625% | 1.446% | 1.382% | 3.057% | 0.058% | -1.336% |  |
| 2026-06-11T01:30:02.250Z | SOL | LONG_CONFIRMED | 64.245 |  | 0.755% | 0.288% | 1.269% | 1.658% | 1.502% | 3.448% | 1.533% | 0.195% |  |
| 2026-06-11T10:00:04.062Z | BTC | LONG_CONFIRMED | 62842.95 |  | 0.010% | 0.440% | -0.147% | 0.892% | 1.153% | 1.351% | 0.440% | -0.387% |  |
| 2026-06-11T15:45:03.544Z | BTC | SHORT_CONFIRMED | 62618.15 |  | 0.062% | 0.122% | -1.497% | -1.491% | -1.310% | -1.488% | 0.341% | -1.588% |  |
| 2026-06-11T16:45:03.260Z | BTC | LONG_CONFIRMED | 62591.05 |  | 0.425% | 1.583% | 1.203% | 1.592% | 1.646% | 2.127% | 1.632% | -0.298% |  |
| 2026-06-11T19:45:03.022Z | ETH | LONG_CONFIRMED | 1683.655 |  | -0.932% | -1.027% | -0.750% | -0.781% | -1.447% | -1.113% | -0.164% | -1.027% |  |
| 2026-06-11T20:00:03.365Z | SOL | LONG_CONFIRMED | 66.855 |  | -0.696% | 0.217% | 0.067% | -0.052% | -0.501% | -0.366% | 0.217% | -0.696% |  |
| 2026-06-11T21:15:05.009Z | SOL | LONG_CONFIRMED | 66.935 |  | -0.217% | -0.052% | -0.710% | -0.351% | 0.306% | -0.261% | 0.097% | -0.471% |  |
| 2026-06-11T22:15:05.787Z | SOL | LONG_CONFIRMED | 66.965 |  | -0.231% | -0.455% | -0.067% | -0.859% | -0.500% | -0.441% | -0.007% | -0.754% |  |
| 2026-06-11T23:15:05.337Z | BTC | SHORT_CONFIRMED | 63350.35 |  | -0.318% | -0.339% | -0.011% | 0.620% | -0.629% | -0.104% | 0.099% | -0.502% |  |
| 2026-06-12T00:15:03.784Z | SOL | LONG_CONFIRMED | 66.865 |  | -0.037% | -0.606% | 0.247% | -0.022% | -0.277% | 0.007% | 0.516% | -0.606% |  |
| 2026-06-12T08:15:03.279Z | SOL | LONG_CONFIRMED | 66.525 |  | 0.458% | 0.924% | 0.233% | 1.586% | 0.218% | 1.210% | 1.075% | 0.158% |  |
| 2026-06-12T09:30:03.546Z | BTC | LONG_CONFIRMED | 63694.85 |  | -0.004% | -0.165% | -0.964% | 0.125% | -0.306% | 0.093% | 0.195% | -0.546% |  |
| 2026-06-12T15:15:02.664Z | BTC | LONG_CONFIRMED | 64314.95 |  | -1.189% | -0.721% | -0.981% | -1.397% | -1.315% | -0.134% | -0.377% | -1.189% |  |
| 2026-06-12T16:15:02.728Z | ETH | LONG_CONFIRMED | 1670.495 |  | 0.043% | -0.089% | -0.334% | -0.281% | -0.380% | 0.076% | 0.043% | -0.334% |  |
| 2026-06-12T17:00:02.470Z | ETH | LONG_CONFIRMED | 1671.345 |  | -0.265% | -0.274% | -0.309% | -0.237% | -0.465% | 0.129% | -0.052% | -0.447% |  |
| 2026-06-12T17:00:02.470Z | SOL | LONG_CONFIRMED | 67.975 |  | -0.919% | -1.111% | -1.729% | -1.331% | -1.773% | -0.081% | -0.287% | -2.008% |  |
| 2026-06-12T17:00:02.470Z | CROSS_ASSET | CROSS_ASSET_COVER | n/a |  | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |  |
| 2026-06-12T20:15:02.525Z | SOL | SHORT_CONFIRMED | 66.695 |  | 0.067% | -0.097% | -0.262% | -0.052% | -0.952% | -2.152% | 0.247% | -0.292% |  |
| 2026-06-12T21:15:02.225Z | BTC | LONG_CONFIRMED | 63559.85 |  | -0.181% | 0.013% | 0.076% | -0.074% | 0.312% | 1.023% | 0.061% | -0.226% |  |
| 2026-06-13T02:00:02.241Z | ETH | LONG_CONFIRMED | 1672.925 |  | -0.392% | -0.349% | -0.591% | -0.024% | 0.275% | 0.701% | -0.106% | -0.610% |  |
| 2026-06-13T12:45:03.843Z | BTC | LONG_CONFIRMED | 63961.55 |  | 0.315% | 0.139% | 0.002% | 0.444% | 0.866% | 0.502% | 0.465% | -0.032% |  |
| 2026-06-13T14:15:03.668Z | SOL | LONG_CONFIRMED | 68.235 |  | -0.051% | 0.359% | -0.037% | 1.238% | 0.960% | -1.004% | 0.476% | -0.462% |  |
| 2026-06-13T15:00:03.171Z | SOL | LONG_CONFIRMED | 68.225 |  | 0.227% | -0.183% | -0.198% | 0.975% | 0.828% | -1.253% | 0.491% | -0.447% |  |
| 2026-06-13T15:30:02.938Z | BTC | LONG_CONFIRMED | 64229.05 |  | -0.336% | -0.366% | 0.023% | 0.315% | 0.330% | -0.357% | 0.046% | -0.496% |  |
| 2026-06-13T20:45:02.553Z | ETH | LONG_CONFIRMED | 1674.465 |  | 0.061% | 0.653% | 0.427% | 0.158% | -0.013% | -0.299% | 0.731% | -0.024% |  |
| 2026-06-14T01:15:02.744Z | BTC | LONG_CONFIRMED | 64606.35 |  | -0.075% | -0.164% | -0.511% | -0.442% | -0.577% | 1.184% | 0.008% | -0.454% |  |
| 2026-06-14T04:30:02.713Z | ETH | LONG_CONFIRMED | 1679.885 |  | -0.208% | -0.131% | -0.202% | -0.695% | -0.862% | 2.119% | 0.092% | -0.381% |  |
| 2026-06-14T05:00:02.398Z | BTC | SHORT_CONFIRMED | 64315.85 |  | -0.074% | -0.191% | -0.124% | -0.012% | 0.612% | -2.040% | 0.162% | -0.207% |  |
| 2026-06-14T08:00:02.622Z | ETH | LONG_CONFIRMED | 1675.485 |  | 0.061% | -0.079% | -0.157% | -0.690% | -0.779% | 2.573% | 0.157% | -0.290% |  |
| 2026-06-14T08:30:02.315Z | SOL | LONG_CONFIRMED | 68.275 |  | -0.286% | 0.095% | -0.710% | -0.886% | -0.608% | 4.606% | 0.242% | -0.461% |  |
| 2026-06-14T09:30:02.745Z | ETH | SHORT_CONFIRMED | 1670.395 |  | -0.285% | -0.304% | 0.205% | 0.457% | -2.686% | -2.566% | 0.345% | -0.462% |  |
| 2026-06-14T11:45:02.451Z | SOL | LONG_CONFIRMED | 68.205 |  | -0.359% | -0.608% | -1.136% | -1.019% | 4.406% | 6.356% | -0.213% | -1.825% |  |
| 2026-06-14T19:15:03.079Z | ETH | LONG_CONFIRMED | 1663.885 |  | -0.008% | 0.124% | 3.508% | 3.370% | 3.396% | 9.256% | 3.683% | -0.087% |  |
| 2026-06-14T20:30:02.926Z | BTC | LONG_CONFIRMED | 63899.65 |  | 0.240% | 2.088% | 2.475% | 2.705% | 2.842% | 4.146% | 3.001% | 0.106% |  |
| 2026-06-14T21:45:02.389Z | ETH | LONG_CONFIRMED | 1717.235 |  | 0.141% | 0.167% | -0.165% | 0.114% | 0.001% | 5.394% | 0.648% | -0.351% |  |
| 2026-06-14T23:45:02.159Z | ETH | SHORT_CONFIRMED | 1718.015 |  | -0.373% | -0.081% | -0.073% | 0.160% | -2.431% | -4.203% | 0.397% | -0.602% |  |
| 2026-06-15T05:45:02.536Z | ETH | SHORT_CONFIRMED | 1715.805 |  | -0.309% | -0.174% | -0.084% | -5.612% | -6.503% | -2.636% | 0.149% | -0.309% |  |
| 2026-06-15T07:30:02.544Z | ETH | SHORT_CONFIRMED | 1720.395 |  | 0.104% | 0.021% | -2.289% | -6.256% | -6.232% | -2.925% | 0.415% | -2.213% |  |
| 2026-06-15T09:30:02.534Z | BTC | SHORT_CONFIRMED | 65590.15 |  | -0.144% | -0.149% | -1.367% | -1.934% | -1.201% | -1.577% | 0.126% | -1.807% |  |
| 2026-06-15T10:15:03.086Z | BTC | LONG_CONFIRMED | 65684.35 |  | 0.238% | 0.771% | 1.202% | 1.661% | 0.642% | 1.414% | 1.661% | -0.038% |  |
| 2026-06-15T11:45:02.922Z | BTC | SHORT_CONFIRMED | 66103.25 |  | -0.160% | -0.601% | -1.643% | -0.536% | -0.251% | -0.501% | -0.085% | -1.108% |  |
| 2026-06-15T13:00:03.103Z | SOL | LONG_CONFIRMED | 72.765 |  | 1.148% | 0.873% | 3.127% | 2.907% | 1.793% | 2.000% | 4.281% | 0.680% |  |
| 2026-06-15T15:30:02.215Z | BTC | LONG_CONFIRMED | 66586.65 |  | 0.938% | 0.781% | 0.098% | -0.609% | -0.790% | -1.192% | 0.938% | -0.175% |  |
| 2026-06-15T17:00:02.674Z | ETH | SHORT_CONFIRMED | 1840.825 |  | 0.574% | 0.697% | 1.244% | 2.729% | 4.305% | 3.359% | 1.377% | 0.554% |  |
| 2026-06-15T18:15:02.469Z | ETH | LONG_CONFIRMED | 1828.895 |  | -0.104% | -0.602% | -2.045% | -3.116% | -3.439% | n/a | 0.094% | -1.142% |  |
| 2026-06-15T20:45:02.716Z | ETH | SHORT_CONFIRMED | 1816.295 |  | 0.123% | 0.354% | 1.510% | 3.141% | 0.799% | n/a | 1.539% | -0.090% |  |
| 2026-06-16T01:45:02.455Z | ETH | LONG_CONFIRMED | 1794.065 |  | -1.235% | -1.452% | -1.841% | -0.339% | 0.188% | n/a | -0.223% | -1.941% |  |
| 2026-06-16T02:30:02.533Z | SOL | SHORT_CONFIRMED | 72.805 |  | -0.282% | -1.023% | -1.696% | -2.946% | 0.021% | n/a | -0.144% | -1.531% |  |
| 2026-06-16T06:45:02.257Z | SOL | LONG_CONFIRMED | 74.015 |  | 0.290% | 0.588% | 0.831% | -1.588% | n/a | n/a | 1.804% | 0.155% |  |
| 2026-06-16T07:15:02.823Z | BTC | SHORT_CONFIRMED | 66281.45 |  | -0.058% | -0.315% | -0.294% | 0.784% | n/a | n/a | 0.016% | -0.822% |  |
| 2026-06-16T07:15:02.823Z | ETH | SHORT_CONFIRMED | 1768.005 |  | -0.230% | -0.782% | -1.504% | -0.586% | n/a | n/a | -0.154% | -1.910% |  |
| 2026-06-16T08:45:02.366Z | SOL | LONG_CONFIRMED | 74.945 |  | -0.047% | -0.193% | -0.100% | -2.569% | n/a | n/a | 0.540% | -0.460% |  |
| 2026-06-16T10:45:03.310Z | SOL | LONG_CONFIRMED | 74.965 |  | -0.300% | -0.487% | -2.835% | n/a | n/a | n/a | -0.033% | -2.981% |  |
| 2026-06-16T11:00:02.568Z | BTC | LONG_CONFIRMED | 66449.65 |  | 0.040% | 0.093% | -0.966% | n/a | n/a | n/a | 0.141% | -1.412% |  |
| 2026-06-16T12:15:03.109Z | ETH | LONG_CONFIRMED | 1808.345 |  | 0.307% | -0.361% | -1.707% | n/a | n/a | n/a | 0.552% | -1.974% |  |
| 2026-06-16T14:15:02.505Z | BTC | SHORT_CONFIRMED | 65975.85 |  | 0.588% | 0.324% | n/a | n/a | n/a | n/a | 0.704% | 0.244% |  |

## 1b. Excursion / Path Risk Table

MFE/MAE are directional: positive MFE means max move in alert direction; negative MAE means max move against alert direction. `first extreme` shows whether the favorable or adverse extreme was reached first inside the window.

| time | asset | type | BTC gate | MFE 4h | tMFE 4h | MAE 4h | tMAE 4h | first 4h | MFE 24h | tMFE 24h | MAE 24h | tMAE 24h | first 24h |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-06-07T20:15:02.835Z | BTC | SHORT_CONFIRMED |  | -0.240% | 90m | -3.468% | 120m | favorable | -0.240% | 90m | -4.242% | 1140m | favorable |
| 2026-06-07T20:30:03.075Z | ETH | SHORT_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 0.036% | 15m | -4.482% | 240m | favorable | 0.036% | 15m | -4.898% | 1125m | favorable |
| 2026-06-08T01:30:02.198Z | SOL | SHORT_CONFIRMED | BTC_STRONG_ALT_NOT_FOLLOWING | 0.542% | 225m | -1.519% | 105m | adverse | 0.725% | 255m | -3.641% | 1185m | favorable |
| 2026-06-08T02:00:02.006Z | BTC | LONG_CONFIRMED |  | 0.092% | 75m | -1.176% | 225m | favorable | 1.527% | 795m | -1.176% | 225m | adverse |
| 2026-06-08T05:15:02.674Z | SOL | SHORT_CONFIRMED | NEUTRAL | 0.222% | 30m | -1.312% | 165m | favorable | 0.222% | 30m | -4.166% | 960m | favorable |
| 2026-06-08T13:00:03.088Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.766% | 135m | -0.989% | 45m | adverse | 1.004% | 495m | -2.730% | 720m | favorable |
| 2026-06-08T14:30:02.394Z | SOL | LONG_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 1.400% | 45m | -0.307% | 165m | favorable | 1.639% | 405m | -3.121% | 1440m | favorable |
| 2026-06-08T17:00:02.524Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.948% | 150m | -0.545% | 15m | adverse | 1.396% | 255m | -4.428% | 1395m | favorable |
| 2026-06-08T18:00:02.864Z | ETH | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 1.593% | 225m | -0.453% | 150m | adverse | 1.593% | 225m | -3.489% | 1365m | favorable |
| 2026-06-08T18:00:02.864Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.794% | 195m | -0.542% | 150m | adverse | 0.794% | 195m | -4.996% | 1335m | favorable |
| 2026-06-08T19:15:02.687Z | SOL | LONG_CONFIRMED | NEUTRAL | 0.600% | 120m | -0.733% | 75m | adverse | 0.600% | 120m | -5.179% | 1260m | favorable |
| 2026-06-08T23:30:02.429Z | ETH | LONG_CONFIRMED | NEUTRAL | -0.014% | 15m | -2.093% | 195m | favorable | -0.014% | 15m | -4.058% | 1035m | favorable |
| 2026-06-09T00:15:02.403Z | BTC | SHORT_CONFIRMED |  | 0.727% | 45m | 0.133% | 240m | favorable | 3.215% | 960m | -0.656% | 375m | adverse |
| 2026-06-09T00:30:02.525Z | SOL | SHORT_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 0.872% | 30m | -0.220% | 225m | favorable | 2.979% | 945m | -1.963% | 360m | adverse |
| 2026-06-09T03:15:02.426Z | BTC | LONG_CONFIRMED |  | 0.825% | 195m | -0.187% | 75m | adverse | 0.825% | 195m | -3.052% | 780m | favorable |
| 2026-06-09T07:00:02.834Z | BTC | LONG_CONFIRMED |  | -0.035% | 15m | -1.056% | 165m | favorable | -0.035% | 15m | -3.658% | 555m | favorable |
| 2026-06-09T07:30:03.038Z | SOL | SHORT_CONFIRMED | BTC_STRONG_ALT_NOT_FOLLOWING | 1.072% | 240m | -0.247% | 30m | adverse | 4.057% | 1365m | -0.247% | 30m | adverse |
| 2026-06-09T07:45:02.160Z | ETH | SHORT_CONFIRMED | NEUTRAL | 0.766% | 225m | 0.074% | 15m | adverse | 3.523% | 1290m | 0.074% | 15m | adverse |
| 2026-06-09T10:15:02.194Z | SOL | SHORT_CONFIRMED | BTC_STRONG_ALT_NOT_FOLLOWING | 1.217% | 240m | -0.355% | 45m | adverse | 4.135% | 1395m | -0.355% | 45m | adverse |
| 2026-06-09T11:00:02.582Z | SOL | LONG_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | -0.053% | 75m | -2.796% | 225m | favorable | -0.053% | 75m | -4.438% | 1350m | favorable |
| 2026-06-09T12:45:02.756Z | SOL | SHORT_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 3.097% | 210m | -0.189% | 30m | adverse | 4.384% | 1365m | -0.189% | 30m | adverse |
| 2026-06-09T13:45:02.661Z | ETH | SHORT_CONFIRMED | NEUTRAL | 2.662% | 180m | 0.209% | 15m | adverse | 3.494% | 1170m | 0.209% | 15m | adverse |
| 2026-06-09T18:30:02.980Z | BTC | LONG_CONFIRMED |  | 0.762% | 105m | -0.127% | 15m | adverse | 1.465% | 1290m | -1.242% | 1020m | adverse |
| 2026-06-09T18:30:02.980Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.791% | 135m | -0.207% | 195m | favorable | 0.791% | 135m | -2.973% | 1020m | favorable |
| 2026-06-09T19:30:03.070Z | ETH | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.517% | 45m | -1.067% | 240m | favorable | 0.858% | 1095m | -2.301% | 825m | adverse |
| 2026-06-09T20:30:03.097Z | ETH | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.190% | 15m | -1.382% | 180m | favorable | 0.537% | 1035m | -2.612% | 765m | adverse |
| 2026-06-09T22:00:03.401Z | SOL | SHORT_CONFIRMED | NEUTRAL | 0.716% | 165m | -0.208% | 210m | favorable | 3.809% | 1440m | -0.577% | 945m | adverse |
| 2026-06-10T00:30:02.738Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.131% | 60m | -1.100% | 135m | favorable | 0.500% | 795m | -3.914% | 1305m | favorable |
| 2026-06-10T04:15:02.713Z | ETH | LONG_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 0.655% | 210m | -0.488% | 60m | adverse | 2.259% | 570m | -1.222% | 1095m | favorable |
| 2026-06-10T04:30:02.320Z | BTC | SHORT_CONFIRMED |  | 0.538% | 45m | -0.445% | 195m | favorable | 0.830% | 420m | -1.957% | 1410m | favorable |
| 2026-06-10T09:15:02.698Z | ETH | SHORT_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | -0.139% | 135m | -1.555% | 210m | favorable | 0.214% | 795m | -3.303% | 270m | adverse |
| 2026-06-10T13:45:02.979Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | -0.138% | 120m | -2.659% | 240m | favorable | 0.565% | 1335m | -4.509% | 510m | adverse |
| 2026-06-10T19:45:02.289Z | ETH | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.058% | 45m | -1.336% | 165m | favorable | 3.296% | 1380m | -1.336% | 165m | adverse |
| 2026-06-11T01:30:02.250Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 1.533% | 150m | 0.195% | 105m | adverse | 4.366% | 990m | 0.195% | 105m | adverse |
| 2026-06-11T10:00:04.062Z | BTC | LONG_CONFIRMED |  | 0.440% | 75m | -0.387% | 150m | favorable | 1.553% | 1425m | -0.698% | 435m | adverse |
| 2026-06-11T15:45:03.544Z | BTC | SHORT_CONFIRMED |  | 0.341% | 90m | -1.588% | 240m | favorable | 0.341% | 90m | -2.710% | 1410m | favorable |
| 2026-06-11T16:45:03.260Z | BTC | LONG_CONFIRMED |  | 1.632% | 180m | -0.298% | 30m | adverse | 2.754% | 1350m | -0.298% | 30m | adverse |
| 2026-06-11T19:45:03.022Z | ETH | LONG_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | -0.164% | 90m | -1.027% | 60m | adverse | 0.225% | 1170m | -1.847% | 660m | adverse |
| 2026-06-11T20:00:03.365Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.217% | 75m | -0.696% | 45m | adverse | 2.760% | 1155m | -1.369% | 645m | adverse |
| 2026-06-11T21:15:05.009Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.097% | 60m | -0.471% | 240m | favorable | 2.637% | 1080m | -1.487% | 570m | adverse |
| 2026-06-11T22:15:05.787Z | SOL | LONG_CONFIRMED | NEUTRAL | -0.007% | 240m | -0.754% | 195m | adverse | 2.591% | 1020m | -1.531% | 510m | adverse |
| 2026-06-11T23:15:05.337Z | BTC | SHORT_CONFIRMED |  | 0.099% | 135m | -0.502% | 60m | adverse | 0.766% | 450m | -1.523% | 960m | favorable |
| 2026-06-12T00:15:03.784Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.516% | 150m | -0.606% | 75m | adverse | 2.744% | 900m | -1.383% | 390m | adverse |
| 2026-06-12T08:15:03.279Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 1.075% | 90m | 0.158% | 135m | favorable | 3.269% | 420m | -0.023% | 330m | adverse |
| 2026-06-12T09:30:03.546Z | BTC | LONG_CONFIRMED |  | 0.195% | 15m | -0.546% | 195m | favorable | 0.974% | 345m | -0.964% | 255m | adverse |
| 2026-06-12T15:15:02.664Z | BTC | LONG_CONFIRMED |  | -0.377% | 15m | -1.189% | 45m | favorable | -0.122% | 1440m | -1.406% | 345m | adverse |
| 2026-06-12T16:15:02.728Z | ETH | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.043% | 45m | -0.334% | 225m | favorable | 0.741% | 1395m | -0.634% | 420m | adverse |
| 2026-06-12T17:00:02.470Z | ETH | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | -0.052% | 105m | -0.447% | 240m | favorable | 0.690% | 1350m | -0.684% | 375m | adverse |
| 2026-06-12T17:00:02.470Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | -0.287% | 15m | -2.008% | 195m | favorable | 0.861% | 1380m | -2.126% | 300m | adverse |
| 2026-06-12T20:15:02.525Z | SOL | SHORT_CONFIRMED | BTC_STRONG_ALT_NOT_FOLLOWING | 0.247% | 105m | -0.292% | 240m | favorable | 0.247% | 105m | -2.796% | 1185m | favorable |
| 2026-06-12T21:15:02.225Z | BTC | LONG_CONFIRMED |  | 0.061% | 240m | -0.226% | 135m | adverse | 1.106% | 1365m | -0.226% | 135m | adverse |
| 2026-06-13T02:00:02.241Z | ETH | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | -0.106% | 15m | -0.610% | 135m | favorable | 0.824% | 1185m | -0.610% | 135m | adverse |
| 2026-06-13T12:45:03.843Z | BTC | LONG_CONFIRMED |  | 0.465% | 195m | -0.032% | 225m | favorable | 1.017% | 765m | -0.080% | 270m | adverse |
| 2026-06-13T14:15:03.668Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.476% | 105m | -0.462% | 180m | favorable | 1.429% | 450m | -0.975% | 1395m | favorable |
| 2026-06-13T15:00:03.171Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.491% | 60m | -0.447% | 135m | favorable | 1.444% | 405m | -1.854% | 1425m | favorable |
| 2026-06-13T15:30:02.938Z | BTC | LONG_CONFIRMED |  | 0.046% | 30m | -0.496% | 105m | favorable | 0.596% | 600m | -0.525% | 1395m | favorable |
| 2026-06-13T20:45:02.553Z | ETH | LONG_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 0.731% | 60m | -0.024% | 30m | adverse | 0.731% | 60m | -1.218% | 1080m | favorable |
| 2026-06-14T01:15:02.744Z | BTC | LONG_CONFIRMED |  | 0.008% | 15m | -0.454% | 225m | favorable | 1.874% | 1380m | -1.427% | 1035m | adverse |
| 2026-06-14T04:30:02.713Z | ETH | LONG_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 0.092% | 105m | -0.381% | 195m | favorable | 2.886% | 1185m | -1.537% | 615m | adverse |
| 2026-06-14T05:00:02.398Z | BTC | SHORT_CONFIRMED |  | 0.162% | 135m | -0.207% | 225m | favorable | 0.982% | 810m | -2.390% | 1365m | favorable |
| 2026-06-14T08:00:02.622Z | ETH | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.157% | 120m | -0.290% | 90m | adverse | 3.156% | 975m | -1.278% | 405m | adverse |
| 2026-06-14T08:30:02.315Z | SOL | LONG_CONFIRMED | NEUTRAL | 0.242% | 90m | -0.461% | 240m | favorable | 4.929% | 945m | -1.926% | 375m | adverse |
| 2026-06-14T09:30:02.745Z | ETH | SHORT_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 0.345% | 240m | -0.462% | 30m | adverse | 0.977% | 315m | -3.470% | 885m | favorable |
| 2026-06-14T11:45:02.451Z | SOL | LONG_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | -0.213% | 15m | -1.825% | 180m | favorable | 6.356% | 1425m | -1.825% | 180m | adverse |
| 2026-06-14T19:15:03.079Z | ETH | LONG_CONFIRMED | NEUTRAL | 3.683% | 210m | -0.087% | 60m | adverse | 10.767% | 1245m | -0.087% | 60m | adverse |
| 2026-06-14T20:30:02.926Z | BTC | LONG_CONFIRMED |  | 3.001% | 225m | 0.106% | 30m | adverse | 5.182% | 1185m | 0.106% | 30m | adverse |
| 2026-06-14T21:45:02.389Z | ETH | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.648% | 150m | -0.351% | 225m | favorable | 7.326% | 1095m | -0.351% | 225m | adverse |
| 2026-06-14T23:45:02.159Z | ETH | SHORT_CONFIRMED | NEUTRAL | 0.397% | 105m | -0.602% | 30m | adverse | 0.397% | 105m | -7.277% | 975m | favorable |
| 2026-06-15T05:45:02.536Z | ETH | SHORT_CONFIRMED | BTC_STRONG_ALT_NOT_FOLLOWING | 0.149% | 240m | -0.309% | 45m | adverse | 0.149% | 240m | -7.415% | 615m | favorable |
| 2026-06-15T07:30:02.544Z | ETH | SHORT_CONFIRMED | BTC_STRONG_ALT_NOT_FOLLOWING | 0.415% | 135m | -2.213% | 240m | favorable | 0.415% | 135m | -7.129% | 510m | favorable |
| 2026-06-15T09:30:02.534Z | BTC | SHORT_CONFIRMED |  | 0.126% | 15m | -1.807% | 240m | favorable | 0.126% | 15m | -2.471% | 405m | favorable |
| 2026-06-15T10:15:03.086Z | BTC | LONG_CONFIRMED |  | 1.661% | 195m | -0.038% | 15m | adverse | 2.324% | 360m | -0.038% | 15m | adverse |
| 2026-06-15T11:45:02.922Z | BTC | SHORT_CONFIRMED |  | -0.085% | 15m | -1.108% | 240m | favorable | 0.643% | 915m | -1.676% | 270m | adverse |
| 2026-06-15T13:00:03.103Z | SOL | LONG_CONFIRMED | NEUTRAL | 4.281% | 225m | 0.680% | 15m | adverse | 4.281% | 225m | -0.021% | 810m | favorable |
| 2026-06-15T15:30:02.215Z | BTC | LONG_CONFIRMED |  | 0.938% | 45m | -0.175% | 240m | favorable | 0.938% | 45m | -1.615% | 1380m | favorable |
| 2026-06-15T17:00:02.674Z | ETH | SHORT_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 1.377% | 240m | 0.554% | 135m | adverse | 4.431% | 720m | 0.554% | 135m | adverse |
| 2026-06-15T18:15:02.469Z | ETH | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.094% | 60m | -1.142% | 240m | favorable | 0.094% | 60m | -3.808% | 645m | favorable |
| 2026-06-15T20:45:02.716Z | ETH | SHORT_CONFIRMED | NEUTRAL | 1.539% | 165m | -0.090% | 30m | adverse | 3.141% | 495m | -0.111% | 945m | favorable |
| 2026-06-16T01:45:02.455Z | ETH | LONG_CONFIRMED | NEUTRAL | -0.223% | 15m | -1.941% | 195m | favorable | 1.352% | 645m | -1.941% | 195m | adverse |
| 2026-06-16T02:30:02.533Z | SOL | SHORT_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | -0.144% | 30m | -1.531% | 240m | favorable | 0.103% | 720m | -3.496% | 390m | adverse |
| 2026-06-16T06:45:02.257Z | SOL | LONG_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | 1.804% | 135m | 0.155% | 15m | adverse | 1.804% | 135m | -1.736% | 465m | favorable |
| 2026-06-16T07:15:02.823Z | BTC | SHORT_CONFIRMED |  | 0.016% | 30m | -0.822% | 105m | favorable | 1.162% | 435m | -0.822% | 105m | adverse |
| 2026-06-16T07:15:02.823Z | ETH | SHORT_CONFIRMED | BTC_WEAK_VETO_ALT_LONGS | -0.154% | 30m | -1.910% | 105m | favorable | -0.154% | 30m | -2.846% | 315m | favorable |
| 2026-06-16T08:45:02.366Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.540% | 15m | -0.460% | 195m | favorable | 0.540% | 15m | -2.956% | 345m | favorable |
| 2026-06-16T10:45:03.310Z | SOL | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | -0.033% | 105m | -2.981% | 225m | favorable | -0.033% | 105m | -2.981% | 225m | favorable |
| 2026-06-16T11:00:02.568Z | BTC | LONG_CONFIRMED |  | 0.141% | 90m | -1.412% | 210m | favorable | 0.141% | 90m | -1.412% | 210m | favorable |
| 2026-06-16T12:15:03.109Z | ETH | LONG_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 0.552% | 15m | -1.974% | 135m | favorable | 0.552% | 15m | -1.974% | 135m | favorable |
| 2026-06-16T14:15:02.505Z | BTC | SHORT_CONFIRMED |  | 0.704% | 15m | 0.244% | 105m | favorable | 0.704% | 15m | 0.244% | 105m | favorable |

### Directional HIGH precision summary, excluding pre-fix rows

| horizon | n | hit rate > 0 | avg directional return |
| --- | --- | --- | --- |
| 30m | 88 | 42.0% | -0.035% |
| 1h | 88 | 43.2% | -0.048% |
| 4h | 87 | 39.1% | -0.296% |
| 8h | 84 | 38.1% | -0.365% |
| 12h | 80 | 42.5% | -0.326% |
| 24h | 76 | 44.7% | -0.025% |

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
| ETH | 873 | 639 | 73.3% | 157 | NEUTRAL -> BTC_WEAK_VETO_ALT_LONGS: 82; BTC_WEAK_VETO_ALT_LONGS -> NEUTRAL: 75; BTC_CONFIRMS_ALT_LONG_CONTEXT -> BTC_WEAK_VETO_ALT_LONGS: 67; BTC_WEAK_VETO_ALT_LONGS -> BTC_CONFIRMS_ALT_LONG_CONTEXT: 62; BTC_WEAK_VETO_ALT_LONGS -> BTC_STRONG_ALT_NOT_FOLLOWING: 58 |
| SOL | 873 | 625 | 71.7% | 157 | NEUTRAL -> BTC_WEAK_VETO_ALT_LONGS: 82; BTC_WEAK_VETO_ALT_LONGS -> NEUTRAL: 75; BTC_WEAK_VETO_ALT_LONGS -> BTC_STRONG_ALT_NOT_FOLLOWING: 64; BTC_STRONG_ALT_NOT_FOLLOWING -> BTC_WEAK_VETO_ALT_LONGS: 60; BTC_WEAK_VETO_ALT_LONGS -> BTC_CONFIRMS_ALT_LONG_CONTEXT: 56 |

## 4. SHORT_CONFIRMED Timing vs Local Lows

`forward 4h low` shows whether a short had downside left after confirmation. `surrounding low lag` uses a window from 2h before to 4h after alert; positive lag means the alert fired after the local low, i.e. likely late.

| time | asset | alert price | forward 4h low | minutes to fwd low | return to fwd low | surrounding low | alert lag vs surrounding low |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-06-07T20:15:02.835Z | BTC | 61545.15 | 2026-06-07T21:45:01.834Z @ 61692.8 | 90 | -0.240% | 2026-06-07T19:45:01.272Z @ 61188.1 | 30m |
| 2026-06-07T20:30:03.075Z | ETH | 1623.675 | 2026-06-07T20:45:02.212Z @ 1623.09 | 15 | 0.036% | 2026-06-07T19:45:01.272Z @ 1606.44 | 45m |
| 2026-06-08T01:30:02.198Z | SOL | 65.505 | 2026-06-08T05:15:02.023Z @ 65.15 | 225 | 0.542% | 2026-06-08T05:15:02.023Z @ 65.15 | -225m |
| 2026-06-08T05:15:02.674Z | SOL | 65.175 | 2026-06-08T05:45:01.293Z @ 65.03 | 30 | 0.222% | 2026-06-08T05:45:01.293Z @ 65.03 | -30m |
| 2026-06-09T00:15:02.403Z | BTC | 62987.05 | 2026-06-09T01:00:01.391Z @ 62529.2 | 45 | 0.727% | 2026-06-09T01:00:01.391Z @ 62529.2 | -45m |
| 2026-06-09T00:30:02.525Z | SOL | 65.955 | 2026-06-09T01:00:01.391Z @ 65.38 | 30 | 0.872% | 2026-06-09T01:00:01.391Z @ 65.38 | -30m |
| 2026-06-09T07:30:03.038Z | SOL | 66.675 | 2026-06-09T11:30:01.460Z @ 65.96 | 240 | 1.072% | 2026-06-09T11:30:01.460Z @ 65.96 | -240m |
| 2026-06-09T07:45:02.160Z | ETH | 1679.775 | 2026-06-09T11:30:01.460Z @ 1666.9 | 225 | 0.766% | 2026-06-09T11:30:01.460Z @ 1666.9 | -225m |
| 2026-06-09T10:15:02.194Z | SOL | 66.145 | 2026-06-09T14:15:02.187Z @ 65.34 | 240 | 1.217% | 2026-06-09T14:15:02.187Z @ 65.34 | -240m |
| 2026-06-09T12:45:02.756Z | SOL | 66.035 | 2026-06-09T16:15:02.190Z @ 63.99 | 210 | 3.097% | 2026-06-09T16:15:02.190Z @ 63.99 | -210m |
| 2026-06-09T13:45:02.661Z | ETH | 1671.595 | 2026-06-09T16:45:01.731Z @ 1627.09 | 180 | 2.662% | 2026-06-09T16:45:01.731Z @ 1627.09 | -180m |
| 2026-06-09T22:00:03.401Z | SOL | 64.975 | 2026-06-10T00:45:01.957Z @ 64.51 | 165 | 0.716% | 2026-06-10T00:45:01.957Z @ 64.51 | -165m |
| 2026-06-10T04:30:02.320Z | BTC | 61419.05 | 2026-06-10T05:15:02.550Z @ 61088.4 | 45 | 0.538% | 2026-06-10T05:15:02.550Z @ 61088.4 | -45m |
| 2026-06-10T09:15:02.698Z | ETH | 1612.105 | 2026-06-10T11:30:01.628Z @ 1614.34 | 135 | -0.139% | 2026-06-10T09:15:01.821Z @ 1613.19 | 0m |
| 2026-06-11T15:45:03.544Z | BTC | 62618.15 | 2026-06-11T17:15:02.137Z @ 62404.6 | 90 | 0.341% | 2026-06-11T17:15:02.137Z @ 62404.6 | -90m |
| 2026-06-11T23:15:05.337Z | BTC | 63350.35 | 2026-06-12T01:30:02.319Z @ 63287.7 | 135 | 0.099% | 2026-06-12T01:30:02.319Z @ 63287.7 | -135m |
| 2026-06-12T20:15:02.525Z | SOL | 66.695 | 2026-06-12T22:00:02.151Z @ 66.53 | 105 | 0.247% | 2026-06-12T22:00:02.151Z @ 66.53 | -105m |
| 2026-06-14T05:00:02.398Z | BTC | 64315.85 | 2026-06-14T07:15:01.712Z @ 64211.7 | 135 | 0.162% | 2026-06-14T07:15:01.712Z @ 64211.7 | -135m |
| 2026-06-14T09:30:02.745Z | ETH | 1670.395 | 2026-06-14T13:30:02.129Z @ 1664.64 | 240 | 0.345% | 2026-06-14T13:30:02.129Z @ 1664.64 | -240m |
| 2026-06-14T23:45:02.159Z | ETH | 1718.015 | 2026-06-15T01:30:01.397Z @ 1711.2 | 105 | 0.397% | 2026-06-15T01:30:01.397Z @ 1711.2 | -105m |
| 2026-06-15T05:45:02.536Z | ETH | 1715.805 | 2026-06-15T09:45:01.908Z @ 1713.25 | 240 | 0.149% | 2026-06-15T09:45:01.908Z @ 1713.25 | -240m |
| 2026-06-15T07:30:02.544Z | ETH | 1720.395 | 2026-06-15T09:45:01.908Z @ 1713.25 | 135 | 0.415% | 2026-06-15T09:45:01.908Z @ 1713.25 | -135m |
| 2026-06-15T09:30:02.534Z | BTC | 65590.15 | 2026-06-15T09:45:01.908Z @ 65507.3 | 15 | 0.126% | 2026-06-15T09:45:01.908Z @ 65507.3 | -15m |
| 2026-06-15T11:45:02.922Z | BTC | 66103.25 | 2026-06-15T12:00:01.495Z @ 66159.6 | 15 | -0.085% | 2026-06-15T10:00:01.355Z @ 65539.9 | 105m |
| 2026-06-15T17:00:02.674Z | ETH | 1840.825 | 2026-06-15T21:00:02.264Z @ 1815.48 | 240 | 1.377% | 2026-06-15T15:15:01.761Z @ 1814.64 | 105m |
| 2026-06-15T20:45:02.716Z | ETH | 1816.295 | 2026-06-15T23:30:01.497Z @ 1788.35 | 165 | 1.539% | 2026-06-15T23:30:01.497Z @ 1788.35 | -165m |
| 2026-06-16T02:30:02.533Z | SOL | 72.805 | 2026-06-16T03:00:01.247Z @ 72.91 | 30 | -0.144% | 2026-06-16T02:30:01.623Z @ 72.75 | 0m |
| 2026-06-16T07:15:02.823Z | BTC | 66281.45 | 2026-06-16T07:45:01.353Z @ 66271.1 | 30 | 0.016% | 2026-06-16T05:30:01.383Z @ 66004.9 | 105m |
| 2026-06-16T07:15:02.823Z | ETH | 1768.005 | 2026-06-16T07:45:01.353Z @ 1770.72 | 30 | -0.154% | 2026-06-16T06:00:01.925Z @ 1761.03 | 75m |
| 2026-06-16T14:15:02.505Z | BTC | 65975.85 | 2026-06-16T14:30:01.797Z @ 65511.4 | 15 | 0.704% | 2026-06-16T14:30:01.797Z @ 65511.4 | -15m |

