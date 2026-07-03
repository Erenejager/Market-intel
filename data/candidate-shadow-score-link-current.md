# Candidate shadow-score link analysis
Generated: 2026-06-29T10:43:13.142Z
Window: 2026-06-20T20:15:00.000Z → 2026-06-29T10:43:12.073Z
Excludes actually Telegram-delivered alerts; includes suppressed/log-only + missing shadow rows. Dedup: one episode per candidate per 6h.

## BTC LONG_SETUP → inverse SHORT
- Pattern key: `BTC_LONG_SETUP_INVERSE_SHORT_POSTFIX`
- N: dedup 24, raw 71
- Overall: 1h 83.3% avg +0.273% | 2h 66.7% avg +0.382% | 4h 58.3% avg +0.203% | 5h 62.5% avg +0.414% | 6h 50.0% avg +0.335%
- Path: MFE6 med +0.854% avg +1.289% @med 157.5m | MAE6 med -0.279% avg -0.528% @med 180m
- Shadow-score call: **SHADOW_PARTLY_VALIDATES_TRADE_DIRECTION** — Higher shadow state has acceptable same-trade performance, but sample still needs caution.
- Score range: raw 15–69 med 42.5; effective 0–69 med 42.5
- By shadow state:
  - SHADOW_BLOCKED: n=1, 1h 100.0% avg +0.182%, MFE6 med +0.262% @120m, MAE6 med -2.024% @315m
  - SHADOW_NO_SETUP: n=9, 1h 77.8% avg +0.197%, MFE6 med +0.890% @165m, MAE6 med -0.261% @165m
  - SHADOW_SETUP_FORMING: n=14, 1h 85.7% avg +0.327%, MFE6 med +0.909% @180m, MAE6 med -0.205% @142.5m
- By raw score bucket:
  - 10-19: n=1, 1h 100.0% avg +0.119%, MFE6 med +0.623% @90m, MAE6 med -0.456% @165m
  - 20-29: n=4, 1h 50.0% avg -0.035%, MFE6 med +0.619% @142.5m, MAE6 med -0.442% @247.5m
  - 30-39: n=5, 1h 100.0% avg +0.395%, MFE6 med +0.964% @165m, MAE6 med +0.061% @75m
  - 40-49: n=6, 1h 100.0% avg +0.195%, MFE6 med +0.909% @322.5m, MAE6 med -0.093% @52.5m
  - 50-59: n=7, 1h 85.7% avg +0.544%, MFE6 med +1.085% @135m, MAE6 med -0.297% @195m
  - 60-69: n=1, 1h 0.0% avg -0.394%, MFE6 med -0.137% @45m, MAE6 med -2.738% @240m
- By effective score bucket:
  - 0-9: n=1, 1h 100.0% avg +0.182%, MFE6 med +0.262% @120m, MAE6 med -2.024% @315m
  - 10-19: n=1, 1h 100.0% avg +0.119%, MFE6 med +0.623% @90m, MAE6 med -0.456% @165m
  - 20-29: n=4, 1h 50.0% avg -0.035%, MFE6 med +0.619% @142.5m, MAE6 med -0.442% @247.5m
  - 30-39: n=4, 1h 100.0% avg +0.448%, MFE6 med +1.058% @172.5m, MAE6 med +0.064% @45m
  - 40-49: n=6, 1h 100.0% avg +0.195%, MFE6 med +0.909% @322.5m, MAE6 med -0.093% @52.5m
  - 50-59: n=7, 1h 85.7% avg +0.544%, MFE6 med +1.085% @135m, MAE6 med -0.297% @195m
  - 60-69: n=1, 1h 0.0% avg -0.394%, MFE6 med -0.137% @45m, MAE6 med -2.738% @240m

## ETH blocked LONG + SELL_PRESSURE → inverse SHORT
- Pattern key: `ETH_LONG_BLOCKED_SELL_PRESSURE_INVERSE_SHORT_POSTFIX`
- N: dedup 25, raw 100
- Overall: 1h 76.0% avg +0.229% | 2h 84.0% avg +0.435% | 4h 66.7% avg +0.529% | 5h 58.3% avg +0.375% | 6h 58.3% avg +0.239%
- Path: MFE6 med +0.862% avg +1.192% @med 210m | MAE6 med -0.237% avg -0.559% @med 195m
- Shadow-score call: **SHADOW_INVALIDATES_NATURAL_AND_VALIDATES_INVERSE** — SHADOW_BLOCKED on the natural/source direction coincides with strong SHORT outcome.
- Score range: raw 0–39 med 19; effective 0–0 med 0
- By shadow state:
  - SHADOW_BLOCKED: n=25, 1h 76.0% avg +0.229%, MFE6 med +0.862% @210m, MAE6 med -0.237% @195m
- By raw score bucket:
  - 0-9: n=3, 1h 100.0% avg +0.326%, MFE6 med +1.026% @285m, MAE6 med -0.092% @330m
  - 10-19: n=10, 1h 70.0% avg +0.078%, MFE6 med +0.594% @165m, MAE6 med -0.220% @180m
  - 20-29: n=6, 1h 66.7% avg +0.350%, MFE6 med +0.829% @127.5m, MAE6 med -0.676% @307.5m
  - 30-39: n=6, 1h 83.3% avg +0.310%, MFE6 med +1.188% @225m, MAE6 med -0.134% @187.5m
- By effective score bucket:
  - 0-9: n=25, 1h 76.0% avg +0.229%, MFE6 med +0.862% @210m, MAE6 med -0.237% @195m

## SOL blocked SHORT + SPOT_LED_ACCUMULATION → inverse LONG
- Pattern key: `SOL_SHORT_BLOCKED_SPOT_LED_INVERSE_LONG_POSTFIX`
- N: dedup 16, raw 74
- Overall: 1h 87.5% avg +0.130% | 2h 50.0% avg +0.085% | 4h 62.5% avg +0.434% | 5h 62.5% avg +0.558% | 6h 53.3% avg +0.018%
- Path: MFE6 med +0.953% avg +1.218% @med 225m | MAE6 med -0.583% avg -0.877% @med 135m
- Shadow-score call: **SHADOW_INVALIDATES_NATURAL_AND_VALIDATES_INVERSE** — SHADOW_BLOCKED on the natural/source direction coincides with strong LONG outcome.
- Score range: raw 0–36 med 20.5; effective 0–0 med 0
- By shadow state:
  - SHADOW_BLOCKED: n=16, 1h 87.5% avg +0.130%, MFE6 med +0.953% @225m, MAE6 med -0.583% @135m
- By raw score bucket:
  - 0-9: n=3, 1h 100.0% avg +0.182%, MFE6 med +0.842% @240m, MAE6 med -0.272% @165m
  - 10-19: n=5, 1h 100.0% avg +0.312%, MFE6 med +2.458% @240m, MAE6 med -0.478% @45m
  - 20-29: n=5, 1h 80.0% avg +0.039%, MFE6 med +0.725% @225m, MAE6 med -1.286% @300m
  - 30-39: n=3, 1h 66.7% avg -0.073%, MFE6 med +0.041% @225m, MAE6 med -1.704% @105m
- By effective score bucket:
  - 0-9: n=16, 1h 87.5% avg +0.130%, MFE6 med +0.953% @225m, MAE6 med -0.583% @135m

## ETH LONG_SETUP + STRUCTURAL_BUYING → inverse SHORT
- Pattern key: `ETH_LONG_SETUP_STRUCTURAL_BUYING_INVERSE_SHORT_POSTFIX`
- N: dedup 14, raw 22
- Overall: 1h 50.0% avg +0.064% | 2h 50.0% avg +0.204% | 4h 78.6% avg +0.684% | 5h 57.1% avg +0.943% | 6h 64.3% avg +1.038%
- Path: MFE6 med +0.659% avg +1.593% @med 210m | MAE6 med -0.331% avg -0.413% @med 105m
- Shadow-score call: **SHADOW_PARTLY_VALIDATES_TRADE_DIRECTION** — Higher shadow state has acceptable same-trade performance, but sample still needs caution.
- Score range: raw 15–69 med 43.5; effective 0–69 med 16
- By shadow state:
  - SHADOW_BLOCKED: n=7, 4h 71.4% avg +0.694%, MFE6 med +0.763% @225m, MAE6 med -0.295% @105m
  - SHADOW_NO_SETUP: n=1, 4h 100.0% avg +0.094%, MFE6 med +0.133% @30m, MAE6 med -0.673% @315m
  - SHADOW_SETUP_FORMING: n=6, 4h 83.3% avg +0.772%, MFE6 med +0.748% @255m, MAE6 med -0.315% @60m
- By raw score bucket:
  - 10-19: n=2, 4h 100.0% avg +0.171%, MFE6 med +0.914% @247.5m, MAE6 med -0.228% @195m
  - 20-29: n=2, 4h 50.0% avg +2.028%, MFE6 med +3.145% @97.5m, MAE6 med -0.420% @127.5m
  - 30-39: n=2, 4h 100.0% avg +0.183%, MFE6 med +0.342% @127.5m, MAE6 med -0.464% @180m
  - 40-49: n=4, 4h 100.0% avg +1.186%, MFE6 med +1.255% @202.5m, MAE6 med -0.315% @112.5m
  - 50-59: n=1, 4h 100.0% avg +0.167%, MFE6 med +0.940% @360m, MAE6 med -0.118% @15m
  - 60-69: n=3, 4h 33.3% avg -0.031%, MFE6 med +0.514% @345m, MAE6 med -0.553% @75m
- By effective score bucket:
  - 0-9: n=7, 4h 71.4% avg +0.694%, MFE6 med +0.763% @225m, MAE6 med -0.295% @105m
  - 30-39: n=1, 4h 100.0% avg +0.094%, MFE6 med +0.133% @30m, MAE6 med -0.673% @315m
  - 40-49: n=4, 4h 100.0% avg +1.186%, MFE6 med +1.255% @202.5m, MAE6 med -0.315% @112.5m
  - 50-59: n=1, 4h 100.0% avg +0.167%, MFE6 med +0.940% @360m, MAE6 med -0.118% @15m
  - 60-69: n=1, 4h 0.0% avg -0.281%, MFE6 med +0.514% @165m, MAE6 med -0.553% @15m

## ETH BTC_PERMITS_ALT_LONG_OBSERVATION → inverse SHORT
- Pattern key: `ETH_BTC_PERMITS_ALT_LONG_INVERSE_SHORT_POSTFIX`
- N: dedup 30, raw 186
- Overall: 1h 73.3% avg +0.215% | 2h 70.0% avg +0.317% | 4h 66.7% avg +0.316% | 5h 66.7% avg +0.637% | 6h 62.1% avg +0.550%
- Path: MFE6 med +0.867% avg +1.414% @med 210m | MAE6 med -0.250% avg -0.505% @med 106m
- Shadow-score call: **SHADOW_PARTLY_VALIDATES_TRADE_DIRECTION** — Higher shadow state has acceptable same-trade performance, but sample still needs caution.
- Score range: raw 12–87 med 38; effective 0–87 med 36.5
- By shadow state:
  - SHADOW_BLOCKED: n=2, 1h 100.0% avg +0.578%, MFE6 med +2.958% @187.5m, MAE6 med -0.038% @22.5m
  - SHADOW_CONFIRMED: n=1, 1h 100.0% avg +0.329%, MFE6 med +1.061% @150m, MAE6 med -0.169% @360m
  - SHADOW_NO_SETUP: n=24, 1h 66.7% avg +0.153%, MFE6 med +0.676% @210m, MAE6 med -0.280% @180m
  - SHADOW_SETUP_FORMING: n=3, 1h 100.0% avg +0.430%, MFE6 med +2.803% @300m, MAE6 med -0.072% @30m
- By raw score bucket:
  - 10-19: n=3, 1h 100.0% avg +0.562%, MFE6 med +1.277% @270m, MAE6 med -0.071% @30m
  - 20-29: n=6, 1h 83.3% avg +0.306%, MFE6 med +0.894% @180m, MAE6 med -0.166% @135m
  - 30-39: n=17, 1h 58.8% avg +0.076%, MFE6 med +0.600% @210m, MAE6 med -0.429% @165m
  - 40-49: n=3, 1h 100.0% avg +0.430%, MFE6 med +2.803% @300m, MAE6 med -0.072% @30m
  - 80-89: n=1, 1h 100.0% avg +0.329%, MFE6 med +1.061% @150m, MAE6 med -0.169% @360m
- By effective score bucket:
  - 0-9: n=2, 1h 100.0% avg +0.578%, MFE6 med +2.958% @187.5m, MAE6 med -0.038% @22.5m
  - 10-19: n=3, 1h 100.0% avg +0.562%, MFE6 med +1.277% @270m, MAE6 med -0.071% @30m
  - 20-29: n=5, 1h 80.0% avg +0.210%, MFE6 med +0.818% @225m, MAE6 med -0.250% @240m
  - 30-39: n=16, 1h 56.3% avg +0.058%, MFE6 med +0.479% @195m, MAE6 med -0.471% @180m
  - 40-49: n=3, 1h 100.0% avg +0.430%, MFE6 med +2.803% @300m, MAE6 med -0.072% @30m
  - 80-89: n=1, 1h 100.0% avg +0.329%, MFE6 med +1.061% @150m, MAE6 med -0.169% @360m

## ETH LONGS_EXITING + BROAD_SHORT_PRESSURE → natural LONG
- Pattern key: `ETH_LONGS_EXITING_BROAD_SHORT_PRESSURE_LONG_POSTFIX`
- N: dedup 16, raw 56
- Overall: 1h 56.3% avg +0.160% | 2h 68.8% avg +0.264% | 4h 75.0% avg +0.107% | 5h 87.5% avg +0.330% | 6h 73.3% avg +0.341%
- Path: MFE6 med +0.946% avg +1.077% @med 202.5m | MAE6 med -0.154% avg -0.674% @med 75m
- Shadow-score call: **SHADOW_NOT_ENTRY_TIMING_FILTER** — Edge is delayed; shadow score does not make this a quick-entry signal.
- Score range: raw 0–43 med 13.5; effective 0–29 med 7.5
- By shadow state:
  - SHADOW_BLOCKED: n=5, 5h 80.0% avg -0.145%, MFE6 med +1.339% @150m, MAE6 med -0.260% @45m
  - SHADOW_NO_SETUP: n=11, 5h 90.9% avg +0.545%, MFE6 med +0.933% @255m, MAE6 med -0.099% @75m
- By raw score bucket:
  - 0-9: n=6, 5h 100.0% avg +0.634%, MFE6 med +0.588% @240m, MAE6 med -0.234% @75m
  - 10-19: n=3, 5h 66.7% avg -0.958%, MFE6 med +1.339% @150m, MAE6 med -2.297% @45m
  - 20-29: n=6, 5h 83.3% avg +0.636%, MFE6 med +1.039% @225m, MAE6 med +0.084% @112.5m
  - 40-49: n=1, 5h 100.0% avg +0.522%, MFE6 med +0.809% @60m, MAE6 med -0.260% @210m
- By effective score bucket:
  - 0-9: n=10, 5h 90.0% avg +0.145%, MFE6 med +0.795% @202.5m, MAE6 med -0.260% @75m
  - 20-29: n=6, 5h 83.3% avg +0.636%, MFE6 med +1.039% @225m, MAE6 med +0.084% @112.5m

## SOL SHORTS_COVERING + BROAD_SHORT_PRESSURE → inverse SHORT
- Pattern key: `SOL_SHORTS_COVERING_BROAD_SHORT_PRESSURE_INVERSE_SHORT_POSTFIX`
- N: dedup 13, raw 63
- Overall: 1h 53.8% avg +0.047% | 2h 53.8% avg +0.006% | 4h 69.2% avg +0.578% | 5h 76.9% avg +0.553% | 6h 53.8% avg +0.820%
- Path: MFE6 med +1.040% avg +1.796% @med 270m | MAE6 med -0.646% avg -0.736% @med 105m
- Shadow-score call: **SHADOW_NOT_ENTRY_TIMING_FILTER** — Edge is delayed; shadow score does not make this a quick-entry signal.
- Score range: raw 0–69 med 39; effective 0–69 med 37
- By shadow state:
  - SHADOW_BLOCKED: n=2, 5h 100.0% avg +0.946%, MFE6 med +1.872% @262.5m, MAE6 med -0.371% @150m
  - SHADOW_NO_SETUP: n=8, 5h 62.5% avg +0.381%, MFE6 med +1.007% @195m, MAE6 med -0.634% @105m
  - SHADOW_SETUP_FORMING: n=3, 5h 100.0% avg +0.753%, MFE6 med +0.472% @330m, MAE6 med -0.704% @135m
- By raw score bucket:
  - 0-9: n=2, 5h 50.0% avg +0.155%, MFE6 med +1.166% @195m, MAE6 med -0.735% @67.5m
  - 10-19: n=2, 5h 100.0% avg +0.546%, MFE6 med +2.083% @255m, MAE6 med -0.319% @232.5m
  - 20-29: n=1, 5h 100.0% avg +1.870%, MFE6 med +2.539% @360m, MAE6 med +0.055% @15m
  - 30-39: n=4, 5h 50.0% avg +0.410%, MFE6 med +0.785% @165m, MAE6 med -0.634% @225m
  - 40-49: n=1, 5h 100.0% avg +0.132%, MFE6 med +0.382% @330m, MAE6 med -1.200% @135m
  - 50-59: n=1, 5h 100.0% avg +0.021%, MFE6 med +1.204% @165m, MAE6 med -0.796% @285m
  - 60-69: n=2, 5h 100.0% avg +1.064%, MFE6 med +2.184% @345m, MAE6 med -0.467% @142.5m
- By effective score bucket:
  - 0-9: n=4, 5h 75.0% avg +0.550%, MFE6 med +1.248% @195m, MAE6 med -0.637% @67.5m
  - 10-19: n=2, 5h 100.0% avg +0.546%, MFE6 med +2.083% @255m, MAE6 med -0.319% @232.5m
  - 30-39: n=4, 5h 50.0% avg +0.410%, MFE6 med +0.785% @165m, MAE6 med -0.634% @225m
  - 40-49: n=1, 5h 100.0% avg +0.132%, MFE6 med +0.382% @330m, MAE6 med -1.200% @135m
  - 60-69: n=2, 5h 100.0% avg +1.064%, MFE6 med +2.184% @345m, MAE6 med -0.467% @142.5m

