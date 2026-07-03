# Allowed alert regime-history review
Generated: 2026-06-29T11:40:54.487Z
Method: reconstruct currently allowed candidate events from `phase1d-alerts.jsonl` + `readiness-shadow.jsonl`, exclude actually Telegram-delivered rows, dedup one episode per candidate per 6h, test selected trade direction over 1h–6h.
Regime: price-derived BTC regime for full history because formal `regime-history.jsonl` starts Jun 7; BEARISH_TREND <= -5% BTC 7d, BEARISH_DRIFT <= -1%, BULLISH_TREND >= +5%, BULLISH_DRIFT >= +1%, else RANGE.
Caveat: Jun 09 → Jun 20 20:15 has known OI stale risk; OI-dependent findings in that window are not trusted for promotion.

## ETH LONG_SETUP + STRUCTURAL_BUYING → inverse SHORT
- Key: `ETH_LONG_SETUP_STRUCTURAL_BUYING_INVERSE_SHORT`
- Overall: n=102; best 4h 65.7% avg +0.332%; 1h 56.9% avg +0.110%; MFE6 med +0.637% @232.5m; MAE6 med -0.286% @120m | raw=212 | regimes={"UNKNOWN":9,"RANGE":19,"BULLISH_DRIFT":9,"BEARISH_DRIFT":31,"BEARISH_TREND":28,"BULLISH_TREND":6}
- First non-stale effective window: **Jun 09–20 pre-fix / OI stale risk**
- Regime call: **PERSISTENT_EDGE_ACROSS_WINDOWS**
- By window:
  - May 08–20: n=25; best 6h 56.0% avg +0.140%; 1h 56.0% avg +0.082%; MFE6 med +0.554% @210m; MAE6 med -0.316% @180m | raw=50 | qualifies=false
  - May 21–31: n=25; best 5h 60.0% avg +0.277%; 1h 56.0% avg -0.040%; MFE6 med +0.486% @135m; MAE6 med -0.290% @90m | raw=57 | qualifies=false
  - Jun 01–08: n=15; best 5h 66.7% avg +0.842%; 1h 46.7% avg +0.150%; MFE6 med +1.160% @285m; MAE6 med -0.541% @120m | raw=35 | qualifies=false
  - Jun 09–20 pre-fix / OI stale risk: n=25; best 4h 84.0% avg +0.355%; 1h 64.0% avg +0.231%; MFE6 med +0.850% @195m; MAE6 med -0.255% @75m | raw=48 | qualifies=true | stale-OI rows=25
  - Post-fix Jun 20 20:15+: n=14; best 4h 78.6% avg +0.684%; 1h 50.0% avg +0.064%; MFE6 med +0.659% @210m; MAE6 med -0.331% @105m | raw=22 | qualifies=true
- By BTC price regime:
  - BEARISH_DRIFT: n=36; best 3h 61.1% avg +0.261%; 1h 52.8% avg +0.010%; MFE6 med +0.472% @165m; MAE6 med -0.303% @157.5m | raw=72 | qualifies=false | avg BTC 7d -3.142%
  - BEARISH_TREND: n=30; best 5h 46.7% avg +0.375%; 1h 43.3% avg +0.076%; MFE6 med +0.552% @255m; MAE6 med -0.571% @142.5m | raw=59 | qualifies=false | avg BTC 7d -9.470%
  - RANGE: n=21; best 4h 90.5% avg +0.538%; 1h 71.4% avg +0.141%; MFE6 med +0.757% @255m; MAE6 med -0.259% @105m | raw=34 | qualifies=true | avg BTC 7d -0.703%
  - BULLISH_DRIFT: n=11; best 3h 72.7% avg -0.140%; 1h 63.6% avg +0.132%; MFE6 med +0.421% @240m; MAE6 med -0.331% @135m | raw=19 | qualifies=false | avg BTC 7d +3.416%
  - UNKNOWN: n=9; best 4h 55.6% avg +0.340%; 1h 44.4% avg +0.073%; MFE6 med +0.805% @210m; MAE6 med -0.282% @75m | raw=17 | qualifies=false | avg BTC 7d n/a
  - BULLISH_TREND: n=6; best 5h 83.3% avg +0.728%; 1h 50.0% avg +0.340%; MFE6 med +1.470% @150m; MAE6 med -0.224% @52.5m | raw=11 | qualifies=false | avg BTC 7d +5.689%

## ETH source LONG + SHADOW_SETUP_FORMING → inverse SHORT
- Key: `ETH_LONG_SHADOW_SETUP_FORMING_INVERSE_SHORT`
- Overall: n=108; best 5h 63.9% avg +0.578%; 1h 54.6% avg +0.324%; MFE6 med +0.650% @240m; MAE6 med -0.349% @150m | raw=269 | regimes={"UNKNOWN":7,"BEARISH_DRIFT":36,"BULLISH_DRIFT":6,"BEARISH_TREND":38,"RANGE":12,"BULLISH_TREND":9}
- First non-stale effective window: **May 08–20**
- Regime call: **PERSISTENT_EDGE_ACROSS_WINDOWS**
- By window:
  - May 08–20: n=18; best 3h 77.8% avg +0.219%; 1h 55.6% avg -0.015%; MFE6 med +0.756% @247.5m; MAE6 med -0.227% @67.5m | raw=33 | qualifies=true
  - May 21–31: n=27; best 1h 74.1% avg +0.178%; 1h 74.1% avg +0.178%; MFE6 med +0.486% @135m; MAE6 med -0.380% @165m | raw=69 | qualifies=true
  - Jun 01–08: n=22; best 6h 63.6% avg +2.483%; 1h 54.5% avg +2.318%; MFE6 med +1.084% @240m; MAE6 med -0.532% @157.5m | raw=62 | qualifies=false
  - Jun 09–20 pre-fix / OI stale risk: n=24; best 6h 58.3% avg -0.980%; 1h 29.2% avg -0.903%; MFE6 med +0.453% @210m; MAE6 med -0.402% @157.5m | raw=60 | qualifies=false | stale-OI rows=24
  - Post-fix Jun 20 20:15+: n=18; best 4h 72.2% avg +0.375%; 1h 55.6% avg +0.040%; MFE6 med +0.796% @300m; MAE6 med -0.467% @112.5m | raw=45 | qualifies=true
- By BTC price regime:
  - BEARISH_TREND: n=44; best 5h 61.4% avg +1.478%; 1h 54.5% avg +1.455%; MFE6 med +0.893% @172.5m; MAE6 med -0.532% @165m | raw=109 | qualifies=false | avg BTC 7d -9.726%
  - BEARISH_DRIFT: n=41; best 1h 73.2% avg +0.169%; 1h 73.2% avg +0.169%; MFE6 med +0.609% @195m; MAE6 med -0.274% @165m | raw=83 | qualifies=true | avg BTC 7d -3.209%
  - RANGE: n=14; best 1h 85.7% avg +0.023%; 1h 85.7% avg +0.023%; MFE6 med +0.594% @255m; MAE6 med -0.475% @112.5m | raw=33 | qualifies=true | avg BTC 7d -0.579%
  - BULLISH_TREND: n=10; best 5h 40.0% avg -2.482%; 1h 20.0% avg -2.753%; MFE6 med -0.038% @210m; MAE6 med -1.215% @82.5m | raw=15 | qualifies=false | avg BTC 7d +5.799%
  - BULLISH_DRIFT: n=9; best 6h 66.7% avg +0.110%; 1h 55.6% avg +0.069%; MFE6 med +0.526% @285m; MAE6 med -0.279% @90m | raw=16 | qualifies=false | avg BTC 7d +3.352%
  - UNKNOWN: n=7; best 5h 85.7% avg +0.656%; 1h 28.6% avg -0.150%; MFE6 med +1.003% @240m; MAE6 med -0.323% @60m | raw=13 | qualifies=false | avg BTC 7d n/a

## BTC LONG_SETUP → inverse SHORT
- Key: `BTC_LONG_SETUP_INVERSE_SHORT_POSTFIX`
- Overall: n=146; best 6h 55.5% avg +0.149%; 1h 54.1% avg +0.009%; MFE6 med +0.513% @195m; MAE6 med -0.396% @165m | raw=434 | regimes={"UNKNOWN":13,"BEARISH_DRIFT":45,"RANGE":23,"BULLISH_DRIFT":9,"BEARISH_TREND":48,"BULLISH_TREND":8}
- First non-stale effective window: **Post-fix Jun 20 20:15+**
- Regime call: **POST_FIX_ONLY_OR_NEW_REGIME_EDGE**
- By window:
  - May 08–20: n=34; best 2h 61.8% avg +0.082%; 1h 55.9% avg +0.055%; MFE6 med +0.264% @180m; MAE6 med -0.415% @195m | raw=94 | qualifies=false
  - May 21–31: n=34; best 6h 61.8% avg +0.199%; 1h 52.9% avg +0.067%; MFE6 med +0.492% @210m; MAE6 med -0.234% @127.5m | raw=117 | qualifies=false
  - Jun 01–08: n=22; best 6h 59.1% avg +0.369%; 1h 45.5% avg -0.285%; MFE6 med +0.896% @232.5m; MAE6 med -0.734% @142.5m | raw=59 | qualifies=false
  - Jun 09–20 pre-fix / OI stale risk: n=34; best 6h 58.8% avg +0.006%; 1h 41.2% avg -0.066%; MFE6 med +0.434% @195m; MAE6 med -0.556% @150m | raw=93 | qualifies=false | stale-OI rows=34
  - Post-fix Jun 20 20:15+: n=24; best 1h 83.3% avg +0.273%; 1h 83.3% avg +0.273%; MFE6 med +0.854% @157.5m; MAE6 med -0.279% @180m | raw=71 | qualifies=true
- By BTC price regime:
  - BEARISH_DRIFT: n=56; best 6h 55.4% avg +0.100%; 1h 48.2% avg -0.023%; MFE6 med +0.407% @180m; MAE6 med -0.323% @112.5m | raw=146 | qualifies=false | avg BTC 7d -3.229%
  - BEARISH_TREND: n=51; best 1h 49.0% avg -0.135%; 1h 49.0% avg -0.135%; MFE6 med +0.619% @180m; MAE6 med -0.646% @180m | raw=129 | qualifies=false | avg BTC 7d -9.353%
  - RANGE: n=28; best 4h 67.9% avg +0.144%; 1h 60.7% avg +0.065%; MFE6 med +0.502% @202.5m; MAE6 med -0.309% @135m | raw=64 | qualifies=false | avg BTC 7d -0.620%
  - UNKNOWN: n=14; best 1h 50.0% avg +0.036%; 1h 50.0% avg +0.036%; MFE6 med +0.233% @240m; MAE6 med -0.438% @210m | raw=45 | qualifies=false | avg BTC 7d n/a
  - BULLISH_DRIFT: n=12; best 5h 63.6% avg -0.004%; 1h 50.0% avg -0.173%; MFE6 med +0.259% @217.5m; MAE6 med -0.315% @135m | raw=25 | qualifies=false | avg BTC 7d +3.260%
  - BULLISH_TREND: n=9; best 6h 77.8% avg +0.408%; 1h 44.4% avg +0.060%; MFE6 med +0.540% @105m; MAE6 med -0.563% @45m | raw=25 | qualifies=true | avg BTC 7d +5.774%

## ETH blocked LONG + SELL_PRESSURE → inverse SHORT
- Key: `ETH_LONG_BLOCKED_SELL_PRESSURE_INVERSE_SHORT_POSTFIX`
- Overall: n=114; best 2h 67.5% avg +3.294%; 1h 67.5% avg +3.231%; MFE6 med +1.380% @202.5m; MAE6 med -0.060% @195m | raw=447 | regimes={"BEARISH_TREND":42,"BEARISH_DRIFT":33,"RANGE":20,"BULLISH_DRIFT":10,"BULLISH_TREND":9}
- First non-stale effective window: **May 21–31**
- Regime call: **PERSISTENT_EDGE_ACROSS_WINDOWS**
- By window:
  - May 08–20: n=0; best n/a n/a avg n/a; 1h n/a avg n/a; MFE6 med n/a @n/am; MAE6 med n/a @n/am | raw=0 | qualifies=false
  - May 21–31: n=30; best 4h 86.7% avg +2.675%; 1h 86.7% avg +2.613%; MFE6 med +2.798% @142.5m; MAE6 med +1.767% @195m | raw=116 | qualifies=true
  - Jun 01–08: n=24; best 6h 100.0% avg +16.034%; 1h 100.0% avg +15.609%; MFE6 med +17.712% @270m; MAE6 med +15.075% @142.5m | raw=92 | qualifies=true
  - Jun 09–20 pre-fix / OI stale risk: n=36; best 3h 30.6% avg -2.382%; 1h 25.0% avg -2.395%; MFE6 med -0.979% @210m; MAE6 med -1.736% @202.5m | raw=138 | qualifies=false | stale-OI rows=36
  - Post-fix Jun 20 20:15+: n=25; best 2h 84.0% avg +0.435%; 1h 76.0% avg +0.229%; MFE6 med +0.862% @210m; MAE6 med -0.237% @195m | raw=101 | qualifies=true
- By BTC price regime:
  - BEARISH_TREND: n=47; best 2h 93.6% avg +8.670%; 1h 93.6% avg +8.601%; MFE6 med +6.734% @225m; MAE6 med +5.267% @165m | raw=167 | qualifies=true | avg BTC 7d -9.648%
  - BEARISH_DRIFT: n=35; best 6h 80.0% avg +2.001%; 1h 77.1% avg +1.941%; MFE6 med +2.525% @195m; MAE6 med +0.392% @195m | raw=113 | qualifies=true | avg BTC 7d -3.175%
  - RANGE: n=30; best 1h 63.3% avg -0.452%; 1h 63.3% avg -0.452%; MFE6 med +0.559% @157.5m; MAE6 med -0.615% @180m | raw=93 | qualifies=false | avg BTC 7d -0.755%
  - BULLISH_DRIFT: n=12; best 3h 8.3% avg -2.790%; 1h 0.0% avg -2.735%; MFE6 med -0.801% @210m; MAE6 med -1.576% @247.5m | raw=45 | qualifies=false | avg BTC 7d +3.359%
  - BULLISH_TREND: n=10; best 6h 0.0% avg -4.541%; 1h 0.0% avg -5.136%; MFE6 med -4.755% @277.5m; MAE6 med -7.320% @172.5m | raw=29 | qualifies=false | avg BTC 7d +5.608%

## SOL blocked SHORT + SPOT_LED_ACCUMULATION → inverse LONG
- Key: `SOL_SHORT_BLOCKED_SPOT_LED_INVERSE_LONG_POSTFIX`
- Overall: n=87; best 1h 29.9% avg -5.373%; 1h 29.9% avg -5.373%; MFE6 med -2.081% @150m; MAE6 med -3.642% @195m | raw=374 | regimes={"BEARISH_DRIFT":24,"RANGE":20,"BEARISH_TREND":38,"BULLISH_DRIFT":2,"BULLISH_TREND":3}
- First non-stale effective window: **Jun 09–20 pre-fix / OI stale risk**
- Regime call: **PERSISTENT_EDGE_ACROSS_WINDOWS**
- By window:
  - May 08–20: n=0; best n/a n/a avg n/a; 1h n/a avg n/a; MFE6 med n/a @n/am; MAE6 med n/a @n/am | raw=0 | qualifies=false
  - May 21–31: n=34; best 2h 5.9% avg -2.976%; 1h 2.9% avg -2.847%; MFE6 med -2.532% @150m; MAE6 med -3.775% @210m | raw=177 | qualifies=false
  - Jun 01–08: n=25; best 1h 4.0% avg -17.695%; 1h 4.0% avg -17.695%; MFE6 med -18.522% @90m; MAE6 med -21.621% @225m | raw=102 | qualifies=false
  - Jun 09–20 pre-fix / OI stale risk: n=12; best 2h 83.3% avg +5.853%; 1h 83.3% avg +5.801%; MFE6 med +5.793% @180m; MAE6 med +4.830% @202.5m | raw=21 | qualifies=true | stale-OI rows=12
  - Post-fix Jun 20 20:15+: n=16; best 1h 87.5% avg +0.130%; 1h 87.5% avg +0.130%; MFE6 med +0.953% @225m; MAE6 med -0.583% @135m | raw=74 | qualifies=true
- By BTC price regime:
  - BEARISH_TREND: n=38; best 1h 21.1% avg -12.097%; 1h 21.1% avg -12.097%; MFE6 med -8.255% @127.5m; MAE6 med -10.938% @195m | raw=154 | qualifies=false | avg BTC 7d -10.430%
  - BEARISH_DRIFT: n=28; best 2h 14.3% avg -3.010%; 1h 10.7% avg -2.904%; MFE6 med -2.908% @150m; MAE6 med -4.018% @225m | raw=123 | qualifies=false | avg BTC 7d -3.274%
  - RANGE: n=24; best 1h 54.2% avg +0.255%; 1h 54.2% avg +0.255%; MFE6 med +0.442% @240m; MAE6 med -1.075% @187.5m | raw=83 | qualifies=false | avg BTC 7d -1.149%
  - BULLISH_DRIFT: n=3; best 3h 66.7% avg +5.669%; 1h 66.7% avg +4.802%; MFE6 med +3.607% @15m; MAE6 med +1.697% @300m | raw=9 | qualifies=false | avg BTC 7d +3.442%
  - BULLISH_TREND: n=3; best 2h 100.0% avg +10.313%; 1h 100.0% avg +10.170%; MFE6 med +12.810% @105m; MAE6 med +10.486% @225m | raw=5 | qualifies=false | avg BTC 7d +6.232%

## ETH BTC_PERMITS_ALT_LONG_OBSERVATION → inverse SHORT
- Key: `ETH_BTC_PERMITS_ALT_LONG_INVERSE_SHORT_POSTFIX`
- Overall: n=133; best 1h 67.4% avg +3.070%; 1h 67.4% avg +3.070%; MFE6 med +1.283% @195m; MAE6 med -0.080% @150m | raw=774 | regimes={"BEARISH_DRIFT":41,"RANGE":22,"BEARISH_TREND":50,"BULLISH_DRIFT":12,"BULLISH_TREND":8}
- First non-stale effective window: **May 21–31**
- Regime call: **PERSISTENT_EDGE_ACROSS_WINDOWS**
- By window:
  - May 08–20: n=0; best n/a n/a avg n/a; 1h n/a avg n/a; MFE6 med n/a @n/am; MAE6 med n/a @n/am | raw=0 | qualifies=false
  - May 21–31: n=36; best 3h 88.9% avg +2.744%; 1h 88.9% avg +2.582%; MFE6 med +2.832% @210m; MAE6 med +1.618% @135m | raw=201 | qualifies=true
  - Jun 01–08: n=28; best 1h 100.0% avg +14.739%; 1h 100.0% avg +14.739%; MFE6 med +17.274% @202.5m; MAE6 med +14.938% @90m | raw=162 | qualifies=true
  - Jun 09–20 pre-fix / OI stale risk: n=40; best 3h 27.5% avg -2.423%; 1h 22.5% avg -2.460%; MFE6 med -0.881% @195m; MAE6 med -2.121% @150m | raw=224 | qualifies=false | stale-OI rows=40
  - Post-fix Jun 20 20:15+: n=31; best 1h 73.3% avg +0.215%; 1h 73.3% avg +0.215%; MFE6 med +0.818% @210m; MAE6 med -0.249% @105m | raw=187 | qualifies=true
- By BTC price regime:
  - BEARISH_TREND: n=59; best 1h 86.4% avg +7.644%; 1h 86.4% avg +7.644%; MFE6 med +5.371% @165m; MAE6 med +3.045% @165m | raw=316 | qualifies=true | avg BTC 7d -9.300%
  - BEARISH_DRIFT: n=48; best 1h 72.9% avg +1.409%; 1h 72.9% avg +1.409%; MFE6 med +1.985% @165m; MAE6 med +0.055% @150m | raw=225 | qualifies=true | avg BTC 7d -3.355%
  - RANGE: n=31; best 3h 54.8% avg -0.588%; 1h 45.2% avg -0.696%; MFE6 med +0.310% @210m; MAE6 med -0.595% @135m | raw=126 | qualifies=false | avg BTC 7d -0.599%
  - BULLISH_DRIFT: n=16; best 2h 18.8% avg -2.251%; 1h 12.5% avg -2.183%; MFE6 med -0.204% @165m; MAE6 med -1.439% @255m | raw=50 | qualifies=false | avg BTC 7d +3.251%
  - BULLISH_TREND: n=13; best 3h 0.0% avg -4.649%; 1h 0.0% avg -4.913%; MFE6 med -5.151% @225m; MAE6 med -7.715% @210m | raw=57 | qualifies=false | avg BTC 7d +5.928%

## ETH LONGS_EXITING + BROAD_SHORT_PRESSURE → natural LONG
- Key: `ETH_LONGS_EXITING_BROAD_SHORT_PRESSURE_LONG_POSTFIX`
- Overall: n=16; best 5h 87.5% avg +0.330%; 1h 56.3% avg +0.160%; MFE6 med +0.946% @202.5m; MAE6 med -0.154% @75m | raw=56 | regimes={"RANGE":1,"BEARISH_TREND":12,"BEARISH_DRIFT":3}
- First non-stale effective window: **Post-fix Jun 20 20:15+**
- Regime call: **POST_FIX_ONLY_OR_NEW_REGIME_EDGE**
- By window:
  - May 08–20: n=0; best n/a n/a avg n/a; 1h n/a avg n/a; MFE6 med n/a @n/am; MAE6 med n/a @n/am | raw=0 | qualifies=false
  - May 21–31: n=0; best n/a n/a avg n/a; 1h n/a avg n/a; MFE6 med n/a @n/am; MAE6 med n/a @n/am | raw=0 | qualifies=false
  - Jun 01–08: n=0; best n/a n/a avg n/a; 1h n/a avg n/a; MFE6 med n/a @n/am; MAE6 med n/a @n/am | raw=0 | qualifies=false
  - Jun 09–20 pre-fix / OI stale risk: n=0; best n/a n/a avg n/a; 1h n/a avg n/a; MFE6 med n/a @n/am; MAE6 med n/a @n/am | raw=0 | qualifies=false
  - Post-fix Jun 20 20:15+: n=16; best 5h 87.5% avg +0.330%; 1h 56.3% avg +0.160%; MFE6 med +0.946% @202.5m; MAE6 med -0.154% @75m | raw=56 | qualifies=true
- By BTC price regime:
  - BEARISH_TREND: n=13; best 5h 92.3% avg +0.766%; 1h 53.8% avg +0.090%; MFE6 med +1.120% @225m; MAE6 med -0.209% @75m | raw=43 | qualifies=true | avg BTC 7d -6.357%
  - BEARISH_DRIFT: n=3; best 1h 66.7% avg +0.161%; 1h 66.7% avg +0.161%; MFE6 med +0.772% @150m; MAE6 med -0.556% @270m | raw=7 | qualifies=false | avg BTC 7d -4.825%
  - RANGE: n=1; best 6h 100.0% avg +0.596%; 1h 0.0% avg -0.394%; MFE6 med +0.958% @360m; MAE6 med -1.724% @255m | raw=6 | qualifies=false | avg BTC 7d +0.563%

## SOL SHORTS_COVERING + BROAD_SHORT_PRESSURE → inverse SHORT
- Key: `SOL_SHORTS_COVERING_BROAD_SHORT_PRESSURE_INVERSE_SHORT_POSTFIX`
- Overall: n=23; best 5h 73.9% avg +0.574%; 1h 69.6% avg +0.265%; MFE6 med +1.092% @195m; MAE6 med -0.478% @165m | raw=143 | regimes={"UNKNOWN":2,"BEARISH_DRIFT":11,"BEARISH_TREND":9,"RANGE":1}
- First non-stale effective window: **Post-fix Jun 20 20:15+**
- Regime call: **POST_FIX_ONLY_OR_NEW_REGIME_EDGE**
- By window:
  - May 08–20: n=4; best 2h 75.0% avg +0.191%; 1h 75.0% avg +0.127%; MFE6 med +0.686% @97.5m; MAE6 med -0.381% @260.5m | raw=8 | qualifies=false
  - May 21–31: n=2; best 5h 100.0% avg +0.553%; 1h 100.0% avg +0.335%; MFE6 med +0.696% @195m; MAE6 med -0.228% @285m | raw=10 | qualifies=false
  - Jun 01–08: n=2; best 3h 100.0% avg +1.813%; 1h 100.0% avg +0.607%; MFE6 med +2.317% @150m; MAE6 med -0.200% @180m | raw=19 | qualifies=false
  - Jun 09–20 pre-fix / OI stale risk: n=2; best 1h 100.0% avg +2.191%; 1h 100.0% avg +2.191%; MFE6 med +2.783% @187.5m; MAE6 med +0.511% @180m | raw=43 | qualifies=false | stale-OI rows=2
  - Post-fix Jun 20 20:15+: n=13; best 5h 76.9% avg +0.553%; 1h 53.8% avg +0.047%; MFE6 med +1.040% @270m; MAE6 med -0.646% @105m | raw=63 | qualifies=true
- By BTC price regime:
  - BEARISH_DRIFT: n=13; best 3h 84.6% avg +0.633%; 1h 61.5% avg -0.045%; MFE6 med +1.092% @240m; MAE6 med -0.461% @105m | raw=40 | qualifies=true | avg BTC 7d -3.916%
  - BEARISH_TREND: n=11; best 5h 72.7% avg +0.364%; 1h 72.7% avg +0.356%; MFE6 med +1.040% @195m; MAE6 med -0.704% @165m | raw=97 | qualifies=true | avg BTC 7d -7.729%
  - UNKNOWN: n=2; best 1h 50.0% avg -0.018%; 1h 50.0% avg -0.018%; MFE6 med +0.003% @35.5m; MAE6 med -1.855% @260.5m | raw=5 | qualifies=false | avg BTC 7d n/a
  - RANGE: n=1; best 4h 100.0% avg +2.225%; 1h 100.0% avg +0.819%; MFE6 med +2.539% @360m; MAE6 med +0.055% @15m | raw=1 | qualifies=false | avg BTC 7d -3.393%

