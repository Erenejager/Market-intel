# Trade Quality Report

Generated: 2026-08-28T11:45:21.924Z
Window: 2026-08-18T11:45:01.611Z → 2026-08-28T11:45:01.611Z
Decision data policy: live_post_fix_only (cutoff 2026-06-20T20:15:00.000Z)
Directional alert rows: 794

Presentation-only: no score/delivery/active-context impact.

| key | class | n | best | avg | MFE6h p25/med/p75 | MAE6h p25/med/p75 | MFE>|MAE| | fav-first | reason |
| --- | --- | ---: | --- | ---: | --- | --- | ---: | ---: | --- |
| asset_dir:ETH|SHORT | NO_TRADE_BAD_PATH | 33 | 3h 35.5% | -0.579% | +0.025%/+0.357%/+0.583% | -1.862%/-0.954%/-0.437% | 24.2% (8/33) | 63.6% | bad path/expectancy: best 3h win 35.5% avg -0.579%, med MAE6h -0.954% |
| asset_dir:SOL|LONG | WATCH_ONLY | 33 | 3h 71.0% | +0.387% | +0.537%/+1.016%/+2.268% | -1.351%/-0.476%/-0.136% | 57.6% (19/33) | 42.4% | edge incomplete or sample still building |
| pattern:FADE_SHORT_LATE_AFTER_LOW | WATCH_ONLY | 33 | 3h 59.4% | +0.567% | +0.216%/+0.835%/+1.839% | -0.807%/-0.450%/-0.117% | 60.6% (20/33) | 42.4% | edge incomplete or sample still building |
| asset_dir_flow:ETH|SHORT|SELL_PRESSURE | NO_TRADE_BAD_PATH | 32 | 6h 43.3% | -0.891% | +0.002%/+0.287%/+0.622% | -1.988%/-0.879%/-0.429% | 28.1% (9/32) | 56.3% | bad path/expectancy: best 6h win 43.3% avg -0.891%, med MAE6h -0.879% |
| asset_type:ETH|OPPORTUNITY_ETH_BTC_PERMITS_INV_SHORT | TRADEABLE_1H_4H | 32 | 3h 64.5% | +0.031% | +0.362%/+0.620%/+1.167% | -1.403%/-0.591%/-0.218% | 53.1% (17/32) | 56.3% | best 3h win 64.5% avg +0.031% with acceptable 6h path |
| pattern:ETH_BTC_PERMITS_ALT_LONG_INVERSE_SHORT_POSTFIX | TRADEABLE_1H_4H | 32 | 3h 64.5% | +0.031% | +0.362%/+0.620%/+1.167% | -1.403%/-0.591%/-0.218% | 53.1% (17/32) | 56.3% | best 3h win 64.5% avg +0.031% with acceptable 6h path |
| asset_type:ETH|OPPORTUNITY_ETH_BLOCKED_LONG_SELL_PRESSURE_INV_SHORT | NO_TRADE_BAD_PATH | 31 | 5h 41.4% | -0.888% | -0.009%/+0.271%/+0.629% | -2.016%/-0.803%/-0.421% | 29.0% (9/31) | 58.1% | bad path/expectancy: best 5h win 41.4% avg -0.888%, med MAE6h -0.803% |
| pattern:ETH_LONG_BLOCKED_SELL_PRESSURE_INVERSE_SHORT_POSTFIX | NO_TRADE_BAD_PATH | 31 | 5h 41.4% | -0.888% | -0.009%/+0.271%/+0.629% | -2.016%/-0.803%/-0.421% | 29.0% (9/31) | 58.1% | bad path/expectancy: best 5h win 41.4% avg -0.888%, med MAE6h -0.803% |
| asset_dir_flow:SOL|LONG|SPOT_LED_ACCUMULATION | WATCH_ONLY | 29 | 6h 63.0% | +0.681% | +0.521%/+1.194%/+2.415% | -1.258%/-0.654%/-0.155% | 55.2% (16/29) | 37.9% | edge incomplete or sample still building |
| asset_dir:BTC|LONG | WATCH_ONLY | 29 | 4h 58.6% | +0.440% | +0.106%/+0.568%/+1.473% | -0.836%/-0.508%/-0.127% | 44.8% (13/29) | 51.7% | edge incomplete or sample still building |
| asset_type:SOL|LONG_SETUP | WATCH_ONLY | 29 | 5h 55.6% | +0.099% | +0.422%/+0.760%/+1.440% | -2.006%/-0.866%/-0.188% | 48.3% (14/29) | 55.2% | edge incomplete or sample still building |
| asset_type:SOL|OPPORTUNITY_SOL_BLOCKED_SHORT_SPOT_LED_INV_LONG | WATCH_ONLY | 29 | 3h 69.0% | +0.149% | +0.521%/+1.194%/+2.415% | -1.258%/-0.562%/-0.126% | 62.1% (18/29) | 44.8% | edge incomplete or sample still building |
| pattern:SOL_SHORT_BLOCKED_SPOT_LED_INVERSE_LONG_POSTFIX | WATCH_ONLY | 29 | 3h 69.0% | +0.149% | +0.521%/+1.194%/+2.415% | -1.258%/-0.562%/-0.126% | 62.1% (18/29) | 44.8% | edge incomplete or sample still building |
| asset_type:ETH|SHORT_SETUP | WATCH_ONLY | 28 | 4h 57.7% | +0.161% | +0.279%/+0.626%/+1.502% | -1.130%/-0.470%/-0.207% | 46.4% (13/28) | 50.0% | edge incomplete or sample still building |
| asset_dir_flow:ETH|LONG|LEVERAGED_CHASE | WATCH_ONLY | 27 | 6h 57.7% | +0.781% | +0.266%/+0.768%/+1.520% | -1.072%/-0.461%/-0.114% | 55.6% (15/27) | 44.4% | edge incomplete or sample still building |
| asset_dir:ETH|LONG | WATCH_ONLY | 27 | 6h 57.7% | +0.779% | +0.266%/+0.768%/+1.538% | -1.072%/-0.392%/-0.101% | 55.6% (15/27) | 44.4% | edge incomplete or sample still building |
| asset_dir_flow:ETH|SHORT|STRUCTURAL_BUYING | WATCH_ONLY | 26 | 3h 64.0% | +0.093% | +0.299%/+0.496%/+1.306% | -1.292%/-0.561%/-0.170% | 50.0% (13/26) | 50.0% | edge incomplete or sample still building |
| asset_dir_oi_funding:ETH|SHORT|NEUTRAL|BROAD_POSITIVE_FUNDING | WATCH_ONLY | 26 | 1h 53.8% | +0.080% | +0.248%/+0.430%/+0.661% | -1.686%/-0.879%/-0.408% | 26.9% (7/26) | 69.2% | edge incomplete or sample still building |
| asset_dir:BTC|SHORT | TRADEABLE_1H_2H_ONLY | 26 | 1h 72.0% | +0.153% | +0.233%/+0.574%/+0.912% | -0.875%/-0.298%/-0.182% | 53.8% (14/26) | 53.8% | front-loaded edge: 1h win 72.0% avg +0.153%; do not overhold |
| asset_type:BTC|LONG_SETUP | WATCH_ONLY | 26 | 1h 68.0% | -0.009% | +0.217%/+0.574%/+0.887% | -0.875%/-0.353%/-0.194% | 50.0% (13/26) | 57.7% | edge incomplete or sample still building |
| pattern:BTC_LONG_SETUP_INVERSE_SHORT_POSTFIX | WATCH_ONLY | 26 | 1h 68.0% | -0.009% | +0.217%/+0.574%/+0.887% | -0.875%/-0.353%/-0.194% | 50.0% (13/26) | 57.7% | edge incomplete or sample still building |
| asset_dir:SOL|SHORT | NO_TRADE_BAD_PATH | 24 | 4h 40.9% | -0.613% | +0.110%/+0.631%/+1.047% | -2.071%/-1.564%/-0.524% | 33.3% (8/24) | 54.2% | bad path/expectancy: best 4h win 40.9% avg -0.613%, med MAE6h -1.564% |
| asset_type:BTC|SHORT_SETUP | TRADEABLE_1H_2H_ONLY | 24 | 6h 68.2% | +0.815% | +0.286%/+0.826%/+1.887% | -0.563%/-0.293%/+0.005% | 66.7% (16/24) | 33.3% | front-loaded edge: 2h win 66.7% avg +0.550%; do not overhold |
| asset_type:ETH|LONG_SETUP | WATCH_ONLY | 24 | 4h 60.9% | -0.257% | +0.271%/+0.627%/+1.269% | -0.956%/-0.597%/-0.416% | 54.2% (13/24) | 45.8% | edge incomplete or sample still building |
| pattern:SOL_LONG_WATCH_ONLY | TRADEABLE_1H_2H_ONLY | 23 | 3h 71.4% | +0.711% | +0.586%/+1.097%/+2.916% | -1.129%/-0.449%/-0.118% | 65.2% (15/23) | 39.1% | front-loaded edge: 1h win 69.6% avg +0.271%; do not overhold |
| asset_dir_flow:BTC|LONG|LEVERAGED_CHASE | TRADEABLE_1H_2H_ONLY | 22 | 2h 68.2% | +0.519% | +0.347%/+0.826%/+1.787% | -0.609%/-0.342%/-0.041% | 63.6% (14/22) | 40.9% | front-loaded edge: 2h win 68.2% avg +0.519%; do not overhold |
| asset_dir_flow:BTC|SHORT|STRUCTURAL_BUYING | WATCH_ONLY | 22 | 3h 65.0% | -0.129% | +0.279%/+0.601%/+0.863% | -0.762%/-0.463%/-0.129% | 50.0% (11/22) | 50.0% | edge incomplete or sample still building |
| asset_dir_oi_funding:BTC|SHORT|NEUTRAL|BROAD_POSITIVE_FUNDING | TRADEABLE_1H_4H | 22 | 3h 60.0% | +0.049% | +0.008%/+0.508%/+0.869% | -1.105%/-0.560%/-0.132% | 45.5% (10/22) | 59.1% | best 3h win 60.0% avg +0.049% with acceptable 6h path |
| asset_type:SOL|SHORT_SETUP | WATCH_ONLY | 22 | 5h 66.7% | +0.800% | +0.558%/+1.229%/+2.898% | -1.407%/-0.705%/-0.309% | 59.1% (13/22) | 40.9% | edge incomplete or sample still building |
| asset_dir_flow:SOL|LONG|LEVERAGED_CHASE | WATCH_ONLY | 21 | 5h 75.0% | +0.970% | +0.546%/+1.295%/+3.039% | -1.289%/-0.623%/-0.165% | 66.7% (14/21) | 42.9% | edge incomplete or sample still building |
| asset_dir_oi_funding:BTC|LONG|NEUTRAL|BROAD_POSITIVE_FUNDING | TRADEABLE_FAST | 21 | 2h 66.7% | +0.340% | +0.151%/+0.900%/+1.311% | -0.722%/-0.339%/-0.127% | 57.1% (12/21) | 57.1% | best 2h win 66.7% avg +0.340% with acceptable 6h path |
| asset_dir_oi_funding:ETH|SHORT|FRESH_LONGS|BROAD_POSITIVE_FUNDING | WATCH_ONLY | 20 | 1h 57.9% | -0.027% | +0.220%/+0.515%/+0.977% | -1.422%/-0.817%/-0.260% | 45.0% (9/20) | 50.0% | edge incomplete or sample still building |
| asset_dir_oi_funding:SOL|LONG|NEUTRAL|BROAD_POSITIVE_FUNDING | TRADEABLE_1H_2H_ONLY | 20 | 3h 73.7% | +0.621% | +0.645%/+1.154%/+3.235% | -0.872%/-0.468%/-0.121% | 75.0% (15/20) | 40.0% | front-loaded edge: 1h win 70.0% avg +0.235%; do not overhold |
| asset_dir_flow:ETH|SHORT|SPOT_LED_ACCUMULATION | WATCH_ONLY | 19 | 1h 47.4% | +0.061% | +0.312%/+0.583%/+0.673% | -1.997%/-0.938%/-0.526% | 31.6% (6/19) | 57.9% | edge incomplete or sample still building |
| asset_dir_flow:SOL|LONG|STRUCTURAL_BUYING | WATCH_ONLY | 19 | 6h 66.7% | +1.220% | +0.536%/+0.894%/+2.386% | -1.199%/-0.629%/-0.129% | 52.6% (10/19) | 36.8% | edge incomplete or sample still building |
| asset_dir_oi_funding:ETH|LONG|NEUTRAL|BROAD_POSITIVE_FUNDING | TRADEABLE_1H_2H_ONLY | 19 | 4h 73.7% | +0.156% | +0.524%/+0.764%/+1.228% | -0.707%/-0.461%/-0.163% | 68.4% (13/19) | 31.6% | front-loaded edge: 1h win 63.2% avg +0.090%; do not overhold |
| asset_dir_oi_funding:SOL|LONG|SHORTS_COVERING|BROAD_POSITIVE_FUNDING | WATCH_ONLY | 19 | 4h 68.4% | +0.417% | +0.539%/+0.918%/+2.898% | -1.251%/-0.629%/-0.129% | 57.9% (11/19) | 36.8% | edge incomplete or sample still building |
| pattern:ETH_LONG_SHADOW_BLOCKED_INVERSE_SHORT | NO_TRADE_BAD_PATH | 19 | 5h 42.1% | -0.510% | +0.130%/+0.428%/+0.717% | -1.725%/-1.075%/-0.560% | 26.3% (5/19) | 47.4% | bad path/expectancy: best 5h win 42.1% avg -0.510%, med MAE6h -1.075% |
| pattern:SHORTS_COVERING_LONG_BEARISH | WATCH_ONLY | 19 | 6h 64.7% | +0.882% | +0.539%/+0.909%/+2.271% | -1.199%/-0.755%/-0.153% | 52.6% (10/19) | 36.8% | edge incomplete or sample still building |
| asset_dir_oi_funding:ETH|SHORT|LONGS_EXITING|BROAD_POSITIVE_FUNDING | WATCH_ONLY | 17 | 3h 50.0% | -0.270% | +0.163%/+0.360%/+0.921% | -1.807%/-0.535%/-0.303% | 41.2% (7/17) | 70.6% | edge incomplete or sample still building |
| asset_dir_oi_funding:ETH|SHORT|SHORTS_COVERING|BROAD_POSITIVE_FUNDING | TRADEABLE_1H_2H_ONLY | 17 | 5h 70.6% | -0.360% | +0.309%/+0.547%/+1.367% | -0.826%/-0.442%/-0.018% | 58.8% (10/17) | 41.2% | front-loaded edge: 1h win 64.7% avg +0.199%; do not overhold |
| asset_dir_oi_funding:SOL|LONG|FRESH_SHORTS|BROAD_POSITIVE_FUNDING | WATCH_ONLY | 17 | 6h 66.7% | +0.804% | +0.301%/+0.640%/+1.517% | -1.475%/-0.939%/-0.029% | 47.1% (8/17) | 41.2% | edge incomplete or sample still building |
| asset_dir_oi_funding:SOL|LONG|LONGS_EXITING|BROAD_POSITIVE_FUNDING | TRADEABLE_1H_2H_ONLY | 17 | 6h 81.3% | +1.187% | +0.837%/+1.651%/+3.207% | -0.750%/-0.445%/-0.006% | 82.4% (14/17) | 35.3% | front-loaded edge: 2h win 76.5% avg +0.635%; do not overhold |
| asset_dir_oi_funding:SOL|SHORT|FRESH_LONGS|BROAD_POSITIVE_FUNDING | NO_TRADE_BAD_PATH | 17 | 4h 37.5% | -0.845% | +0.179%/+0.473%/+1.100% | -2.006%/-1.091%/-0.387% | 29.4% (5/17) | 47.1% | bad path/expectancy: best 4h win 37.5% avg -0.845%, med MAE6h -1.091% |
| pattern:T1_FRESH_LONGS_LONG | NO_TRADE_BAD_PATH | 17 | 4h 37.5% | -0.845% | +0.179%/+0.473%/+1.100% | -2.006%/-1.091%/-0.387% | 29.4% (5/17) | 47.1% | bad path/expectancy: best 4h win 37.5% avg -0.845%, med MAE6h -1.091% |
| asset_dir_flow:BTC|LONG|STRUCTURAL_BUYING | NO_TRADE_BAD_PATH | 16 | 3h 40.0% | +0.210% | +0.069%/+0.357%/+0.903% | -0.996%/-0.754%/-0.412% | 31.3% (5/16) | 62.5% | bad path/expectancy: best 3h win 40.0% avg +0.210%, med MAE6h -0.754% |
| asset_type:SOL|LONG_CONFIRMED | NO_TRADE_BAD_PATH | 16 | 4h 53.3% | -0.006% | +0.239%/+0.592%/+0.945% | -1.833%/-1.130%/-0.386% | 25.0% (4/16) | 56.3% | bad path/expectancy: best 4h win 53.3% avg -0.006%, med MAE6h -1.130% |
| pattern:ETH_LONG_SETUP_STRUCTURAL_BUYING_INVERSE_SHORT | WATCH_ONLY | 16 | 5h 56.3% | -0.322% | +0.169%/+0.427%/+1.269% | -1.758%/-0.727%/-0.433% | 43.8% (7/16) | 56.3% | edge incomplete or sample still building |
| pattern:ETH_LONG_SHADOW_NO_SETUP_INVERSE_SHORT | NO_TRADE_BAD_PATH | 16 | 4h 46.7% | -0.381% | +0.190%/+0.423%/+0.793% | -1.866%/-0.798%/-0.615% | 37.5% (6/16) | 43.8% | bad path/expectancy: best 4h win 46.7% avg -0.381%, med MAE6h -0.798% |
| asset_dir_flow:BTC|SHORT|SPOT_LED_ACCUMULATION | TRADEABLE_1H_2H_ONLY | 15 | 3h 80.0% | +0.236% | +0.504%/+0.750%/+0.909% | -1.045%/-0.290%/-0.162% | 66.7% (10/15) | 53.3% | front-loaded edge: 2h win 60.0% avg +0.105%; do not overhold |
| asset_dir_oi_funding:SOL|LONG|FRESH_LONGS|BROAD_POSITIVE_FUNDING | WATCH_ONLY | 15 | 6h 71.4% | +0.593% | +0.331%/+1.057%/+2.163% | -0.909%/-0.436%/-0.045% | 66.7% (10/15) | 33.3% | edge incomplete or sample still building |
| asset_type:ETH|RETEST_HELD | WATCH_ONLY | 15 | 1h 57.1% | -0.111% | +0.201%/+0.485%/+0.798% | -1.193%/-0.750%/-0.311% | 33.3% (5/15) | 40.0% | edge incomplete or sample still building |
| asset_dir_flow:SOL|SHORT|STRUCTURAL_BUYING | NO_TRADE_BAD_PATH | 14 | 1h 28.6% | -0.398% | +0.123%/+0.326%/+0.777% | -3.390%/-1.998%/-1.191% | 21.4% (3/14) | 57.1% | bad path/expectancy: best 1h win 28.6% avg -0.398%, med MAE6h -1.998% |
| asset_dir_oi_funding:BTC|LONG|FRESH_SHORTS|BROAD_POSITIVE_FUNDING | WATCH_ONLY | 14 | 6h 61.5% | +0.364% | +0.050%/+0.433%/+1.278% | -0.657%/-0.474%/-0.177% | 42.9% (6/14) | 50.0% | edge incomplete or sample still building |
| asset_dir_oi_funding:BTC|LONG|LONGS_EXITING|BROAD_POSITIVE_FUNDING | WATCH_ONLY | 14 | 3h 53.8% | -0.059% | +0.208%/+0.562%/+1.035% | -1.144%/-0.594%/-0.314% | 42.9% (6/14) | 35.7% | edge incomplete or sample still building |
| asset_type:SOL|RETEST_HELD | WATCH_ONLY | 14 | 5h 66.7% | +0.468% | +0.574%/+1.257%/+1.781% | -1.856%/-0.487%/+0.057% | 57.1% (8/14) | 35.7% | edge incomplete or sample still building |
| asset_dir_oi_funding:BTC|LONG|SHORTS_COVERING|BROAD_POSITIVE_FUNDING | WATCH_ONLY | 13 | 1h 53.8% | -0.144% | +0.118%/+0.390%/+0.835% | -1.007%/-0.582%/-0.442% | 30.8% (4/13) | 69.2% | edge incomplete or sample still building |
| pattern:FADE_SHORT_POSITIVE_FUNDING | TRADEABLE_1H_2H_ONLY | 13 | 5h 75.0% | +1.726% | +0.601%/+0.918%/+3.207% | -0.594%/-0.358%/+0.039% | 69.2% (9/13) | 23.1% | front-loaded edge: 1h win 69.2% avg +0.475%; do not overhold |
| asset_dir_flow:SOL|SHORT|SPOT_LED_ACCUMULATION | WATCH_ONLY | 12 | 2h 63.6% | +0.085% | +0.196%/+0.249%/+0.996% | -2.849%/-0.800%/-0.235% | 33.3% (4/12) | 41.7% | edge incomplete or sample still building |
| asset_dir_oi_funding:ETH|LONG|LONGS_EXITING|BROAD_POSITIVE_FUNDING | TRADEABLE_1H_4H | 12 | 4h 83.3% | +0.182% | +0.417%/+0.603%/+1.316% | -0.693%/-0.295%/-0.141% | 58.3% (7/12) | 58.3% | best 4h win 83.3% avg +0.182% with acceptable 6h path |
| asset_type:BTC|RETEST_HELD | NO_TRADE_BAD_PATH | 12 | 2h 41.7% | +0.146% | +0.083%/+0.396%/+0.662% | -0.889%/-0.667%/-0.524% | 25.0% (3/12) | 83.3% | bad path/expectancy: best 2h win 41.7% avg +0.146%, med MAE6h -0.667% |
| asset_dir_oi_funding:BTC|SHORT|LONGS_EXITING|BROAD_POSITIVE_FUNDING | WATCH_ONLY | 11 | 6h 60.0% | -0.680% | +0.320%/+0.475%/+0.843% | -0.546%/-0.307%/-0.226% | 63.6% (7/11) | 45.5% | edge incomplete or sample still building |
| asset_dir_oi_funding:ETH|LONG|FRESH_LONGS|BROAD_POSITIVE_FUNDING | WATCH_ONLY | 11 | 5h 72.7% | +1.368% | +0.419%/+1.010%/+1.983% | -0.526%/-0.326%/-0.000% | 72.7% (8/11) | 27.3% | edge incomplete or sample still building |
| asset_type:BTC|LONG_CONFIRMED | NO_TRADE_BAD_PATH | 11 | 4h 36.4% | +0.117% | +0.043%/+0.098%/+0.480% | -0.905%/-0.688%/-0.613% | 18.2% (2/11) | 54.5% | bad path/expectancy: best 4h win 36.4% avg +0.117%, med MAE6h -0.688% |
| asset_type:SOL|SHORT_CONFIRMED | WATCH_ONLY | 11 | 6h 70.0% | +1.267% | +0.755%/+1.233%/+2.334% | -1.199%/-0.369%/-0.010% | 72.7% (8/11) | 36.4% | edge incomplete or sample still building |
| asset_dir_flow:ETH|SHORT|LEVERAGED_CHASE | WATCH_ONLY | 10 | 4h 66.7% | -0.053% | +0.243%/+0.361%/+0.622% | -0.945%/-0.719%/-0.428% | 40.0% (4/10) | 50.0% | edge incomplete or sample still building |
| asset_dir_oi_funding:BTC|SHORT|FRESH_LONGS|BROAD_POSITIVE_FUNDING | WATCH_ONLY | 10 | 6h 70.0% | -0.887% | +0.256%/+0.638%/+0.863% | -1.339%/-0.250%/-0.014% | 60.0% (6/10) | 50.0% | edge incomplete or sample still building |
| asset_dir_oi_funding:ETH|SHORT|FRESH_SHORTS|BROAD_POSITIVE_FUNDING | WATCH_ONLY | 10 | 3h 70.0% | -0.004% | +0.339%/+0.650%/+1.105% | -0.693%/-0.445%/-0.085% | 60.0% (6/10) | 80.0% | edge incomplete or sample still building |
| asset_type:ETH|SHORT_CONFIRMED | WATCH_ONLY | 10 | 1h 80.0% | +0.156% | +0.492%/+0.621%/+0.838% | -0.960%/-0.556%/-0.368% | 50.0% (5/10) | 70.0% | edge incomplete or sample still building |
| asset_dir_flow:BTC|LONG|SELL_PRESSURE | WATCH_ONLY | 9 | 3h 62.5% | +1.030% | +0.136%/+0.216%/+1.423% | -0.549%/-0.338%/-0.063% | 33.3% (3/9) | 44.4% | edge incomplete or sample still building |
| asset_dir_flow:SOL|LONG|SELL_PRESSURE | WATCH_ONLY | 9 | 6h 100.0% | +2.023% | +0.918%/+1.517%/+2.746% | -0.644%/-0.132%/-0.029% | 88.9% (8/9) | 0.0% | edge incomplete or sample still building |
| asset_dir_oi_funding:BTC|LONG|FRESH_LONGS|BROAD_POSITIVE_FUNDING | WATCH_ONLY | 9 | 4h 55.6% | +0.991% | +0.074%/+1.164%/+1.473% | -0.668%/-0.610%/-0.217% | 55.6% (5/9) | 55.6% | edge incomplete or sample still building |
| asset_type:BTC|RETEST_FAILED | WATCH_ONLY | 9 | 2h 50.0% | -0.327% | +0.000%/+0.210%/+0.316% | -0.734%/-0.549%/-0.440% | 33.3% (3/9) | 66.7% | edge incomplete or sample still building |
| asset_type:ETH|LONG_CONFIRMED | WATCH_ONLY | 9 | 5h 77.8% | +0.401% | +0.308%/+0.676%/+1.431% | -1.139%/-0.346%/-0.115% | 55.6% (5/9) | 44.4% | edge incomplete or sample still building |
| asset_type:SOL|RETEST_FAILED | WATCH_ONLY | 9 | 2h 77.8% | +0.071% | +0.408%/+1.358%/+2.209% | -1.584%/-0.443%/-0.343% | 66.7% (6/9) | 22.2% | edge incomplete or sample still building |
| pattern:SHORT_BELOW_GATE | WATCH_ONLY | 9 | 4h 55.6% | +0.031% | +0.215%/+0.293%/+0.595% | -0.863%/-0.609%/-0.409% | 22.2% (2/9) | 44.4% | edge incomplete or sample still building |
| asset_dir_flow:BTC|LONG|SPOT_LED_ACCUMULATION | NO_TRADE_BAD_PATH | 8 | 3h 37.5% | +0.153% | +0.083%/+0.186%/+0.644% | -0.851%/-0.650%/-0.472% | 25.0% (2/8) | 62.5% | bad path/expectancy: best 3h win 37.5% avg +0.153%, med MAE6h -0.650% |
| asset_dir_flow:ETH|LONG|SELL_PRESSURE | WATCH_ONLY | 8 | 1h 87.5% | +0.090% | +0.388%/+0.621%/+0.788% | -0.833%/-0.493%/-0.312% | 50.0% (4/8) | 75.0% | edge incomplete or sample still building |
| asset_dir_flow:SOL|SHORT|SELL_PRESSURE | NO_TRADE_BAD_PATH | 8 | 1h 50.0% | -0.275% | +0.042%/+0.240%/+0.513% | -1.717%/-1.221%/-0.747% | 25.0% (2/8) | 87.5% | bad path/expectancy: best 1h win 50.0% avg -0.275%, med MAE6h -1.221% |
| asset_dir_oi_funding:ETH|LONG|SHORTS_COVERING|BROAD_POSITIVE_FUNDING | n/a | 8 | n/a n/a | n/a | -0.202%/+0.333%/+1.006% | -1.554%/-0.705%/-0.169% | 37.5% (3/8) | 75.0% |  |
