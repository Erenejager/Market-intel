# Clean-candidate redo (type+flow only, frozen-data bug excluded) — 2026-06-20

Source: data/phase1d-alerts.jsonl matched against data/autoresearch/price-15m.jsonl.
Dedup: per-bucket cooldown 6h (>= longest horizon measured), so episodes do not share outcome windows.

## BTC_LONG_SETUP_SPOT_LED_ACCUMULATION
Matched raw alerts: 136. Independent (>=6h-spaced) episodes: 78.

| horizon | n | win % | avg return | median return | mean MFE | mean time-to-MFE | mean MAE (opposite) | mean time-to-MAE |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1h | 78 | 50.0% | +0.074% | +0.005% | +0.152% | 28m | -0.124% | 34m |
| 2h | 78 | 52.6% | +0.063% | +0.014% | +0.454% | 59m | -0.220% | 44m |
| 3h | 78 | 53.8% | +0.063% | +0.082% | +0.440% | 81m | -0.360% | 90m |
| 4h | 78 | 61.5% | +0.054% | +0.113% | +0.567% | 123m | -0.482% | 107m |
| 5h | 77 | 49.4% | -0.001% | -0.005% | +0.589% | 151m | -0.554% | 138m |
| 6h | 78 | 50.0% | -0.022% | +0.014% | +0.645% | 184m | -0.607% | 189m |

(0 of 78 episodes have not yet reached the full 6h window; their later horizons are excluded from those rows' stats via per-horizon n.)

## ETH_LONG_CONFIRMED_SPOT_LED_INVERSE_SHORT
Matched raw alerts: 35. Independent (>=6h-spaced) episodes: 27.

| horizon | n | win % | avg return | median return | mean MFE | mean time-to-MFE | mean MAE (opposite) | mean time-to-MAE |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1h | 27 | 55.6% | +0.061% | +0.030% | +0.273% | 23m | -0.142% | 38m |
| 2h | 27 | 63.0% | +0.183% | +0.103% | +0.326% | 56m | -0.227% | 59m |
| 3h | 27 | 63.0% | +0.214% | +0.200% | +0.438% | 110m | -0.246% | 71m |
| 4h | 27 | 66.7% | +0.281% | +0.300% | +0.601% | 123m | -0.247% | 79m |
| 5h | 27 | 59.3% | +0.372% | +0.306% | +0.696% | 176m | -0.312% | 117m |
| 6h | 27 | 66.7% | +0.424% | +0.262% | +0.919% | 224m | -0.417% | 166m |

(0 of 27 episodes have not yet reached the full 6h window; their later horizons are excluded from those rows' stats via per-horizon n.)

## ETH_LONG_CONFIRMED_INVERSE_SHORT
Matched raw alerts: 53. Independent (>=6h-spaced) episodes: 37.

| horizon | n | win % | avg return | median return | mean MFE | mean time-to-MFE | mean MAE (opposite) | mean time-to-MAE |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1h | 37 | 73.0% | +0.168% | +0.170% | +0.009% | 34m | -0.149% | 29m |
| 2h | 37 | 64.9% | +0.149% | +0.115% | +0.116% | 62m | -0.198% | 49m |
| 3h | 37 | 62.2% | +0.002% | +0.082% | +0.540% | 106m | -0.395% | 81m |
| 4h | 37 | 64.9% | +0.230% | +0.157% | +0.635% | 150m | -0.436% | 97m |
| 5h | 37 | 67.6% | +0.127% | +0.212% | +0.799% | 175m | -0.529% | 115m |
| 6h | 37 | 67.6% | +0.207% | +0.291% | +0.854% | 224m | -0.595% | 153m |

(0 of 37 episodes have not yet reached the full 6h window; their later horizons are excluded from those rows' stats via per-horizon n.)

## ETH_LONG_SETUP_STRUCTURAL_BUYING_INVERSE_SHORT
Matched raw alerts: 190. Independent (>=6h-spaced) episodes: 89.

| horizon | n | win % | avg return | median return | mean MFE | mean time-to-MFE | mean MAE (opposite) | mean time-to-MAE |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1h | 89 | 57.3% | +0.111% | +0.065% | +0.376% | 33m | -0.058% | 25m |
| 2h | 89 | 59.6% | +0.151% | +0.178% | +0.450% | 55m | -0.250% | 46m |
| 3h | 89 | 58.4% | +0.147% | +0.118% | +0.508% | 88m | -0.324% | 67m |
| 4h | 89 | 64.0% | +0.271% | +0.204% | +0.533% | 107m | -0.433% | 95m |
| 5h | 88 | 62.5% | +0.343% | +0.171% | +0.756% | 152m | -0.450% | 105m |
| 6h | 88 | 54.5% | +0.179% | +0.159% | +0.946% | 211m | -0.597% | 146m |

(1 of 89 episodes have not yet reached the full 6h window; their later horizons are excluded from those rows' stats via per-horizon n.)

## SOL_LONG_CONFIRMED_STRUCTURAL_BUYING_INVERSE_SHORT
Matched raw alerts: 47. Independent (>=6h-spaced) episodes: 34.

| horizon | n | win % | avg return | median return | mean MFE | mean time-to-MFE | mean MAE (opposite) | mean time-to-MAE |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1h | 34 | 52.9% | +0.115% | +0.048% | +0.420% | 28m | -0.165% | 24m |
| 2h | 34 | 44.1% | -0.060% | -0.024% | +0.390% | 41m | -0.160% | 56m |
| 3h | 34 | 50.0% | +0.054% | -0.009% | +0.744% | 81m | -0.318% | 76m |
| 4h | 34 | 52.9% | +0.219% | +0.112% | +0.744% | 81m | -0.356% | 101m |
| 5h | 34 | 67.6% | +0.377% | +0.309% | +1.013% | 129m | -0.620% | 136m |
| 6h | 34 | 58.8% | +0.423% | +0.372% | +1.224% | 210m | -0.754% | 154m |

(0 of 34 episodes have not yet reached the full 6h window; their later horizons are excluded from those rows' stats via per-horizon n.)
