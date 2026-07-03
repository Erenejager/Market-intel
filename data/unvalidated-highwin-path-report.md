# Unvalidated high-win bucket path report
Generated: 2026-06-20T17:07:00.221833Z
Window: 2026-06-09T17:00:00+00:00 → latest complete samples
Dedup: first alert per bucket, then 90-minute cooldown. MAE is adverse move in alert direction terms; negative = opposite direction. Times are median minutes after alert.

## BTC LONG all unvalidated
Raw rows: 468; dedup episodes: 132
| horizon | n | win | avg return | med return | med MFE | med time to MFE | med MAE/opposite depth | med time to MAE |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1h | 131 | 53.4% | -0.020% | +0.046% | +0.129% | 45m | -0.099% | 30m |
| 2h | 131 | 52.7% | +0.020% | +0.049% | +0.205% | 60m | -0.174% | 60m |
| 3h | 130 | 54.6% | +0.051% | +0.090% | +0.294% | 90m | -0.265% | 75m |
| 4h | 129 | 52.7% | +0.053% | +0.028% | +0.397% | 135m | -0.292% | 90m |
| 5h | 129 | 54.3% | +0.053% | +0.056% | +0.449% | 180m | -0.408% | 120m |
| 6h | 128 | 56.2% | +0.108% | +0.113% | +0.500% | 195m | -0.423% | 150m |

## BTC LONG + SPOT_LED_ACCUMULATION
Raw rows: 213; dedup episodes: 98
| horizon | n | win | avg return | med return | med MFE | med time to MFE | med MAE/opposite depth | med time to MAE |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1h | 98 | 52.0% | -0.001% | +0.055% | +0.140% | 30m | -0.108% | 30m |
| 2h | 98 | 57.1% | +0.028% | +0.081% | +0.246% | 60m | -0.189% | 60m |
| 3h | 98 | 59.2% | +0.076% | +0.128% | +0.372% | 97m | -0.232% | 75m |
| 4h | 97 | 55.7% | +0.092% | +0.057% | +0.420% | 150m | -0.265% | 90m |
| 5h | 97 | 59.8% | +0.104% | +0.088% | +0.487% | 180m | -0.280% | 105m |
| 6h | 96 | 62.5% | +0.153% | +0.159% | +0.532% | 225m | -0.297% | 135m |

## BTC LONG_SETUP unvalidated
Raw rows: 86; dedup episodes: 64
| horizon | n | win | avg return | med return | med MFE | med time to MFE | med MAE/opposite depth | med time to MAE |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1h | 63 | 55.6% | +0.059% | +0.043% | +0.150% | 30m | -0.137% | 45m |
| 2h | 62 | 62.9% | +0.157% | +0.162% | +0.272% | 67m | -0.171% | 45m |
| 3h | 61 | 52.5% | +0.152% | +0.084% | +0.381% | 90m | -0.217% | 60m |
| 4h | 61 | 59.0% | +0.133% | +0.113% | +0.441% | 120m | -0.271% | 75m |
| 5h | 60 | 53.3% | +0.131% | +0.088% | +0.471% | 142m | -0.328% | 135m |
| 6h | 60 | 48.3% | +0.131% | -0.021% | +0.552% | 195m | -0.393% | 180m |

## BTC LONGS_EXITING + BROAD_POSITIVE_FUNDING
Raw rows: 72; dedup episodes: 43
| horizon | n | win | avg return | med return | med MFE | med time to MFE | med MAE/opposite depth | med time to MAE |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1h | 42 | 54.8% | +0.093% | +0.038% | +0.154% | 37m | -0.137% | 45m |
| 2h | 41 | 61.0% | +0.139% | +0.092% | +0.292% | 60m | -0.212% | 60m |
| 3h | 40 | 50.0% | +0.178% | +0.004% | +0.384% | 90m | -0.214% | 75m |
| 4h | 40 | 57.5% | +0.096% | +0.092% | +0.471% | 105m | -0.258% | 135m |
| 5h | 39 | 56.4% | +0.206% | +0.110% | +0.514% | 150m | -0.332% | 150m |
| 6h | 39 | 48.7% | +0.150% | -0.041% | +0.563% | 210m | -0.417% | 195m |

## BTC LONG + SHADOW_SETUP_FORMING
Raw rows: 22; dedup episodes: 17
| horizon | n | win | avg return | med return | med MFE | med time to MFE | med MAE/opposite depth | med time to MAE |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1h | 17 | 64.7% | +0.174% | +0.237% | +0.196% | 45m | -0.127% | 30m |
| 2h | 17 | 76.5% | +0.337% | +0.344% | +0.431% | 75m | -0.137% | 30m |
| 3h | 17 | 82.4% | +0.459% | +0.480% | +0.609% | 105m | -0.137% | 30m |
| 4h | 17 | 82.4% | +0.424% | +0.445% | +0.762% | 165m | -0.137% | 30m |
| 5h | 17 | 64.7% | +0.267% | +0.421% | +0.925% | 195m | -0.152% | 45m |
| 6h | 17 | 58.8% | +0.303% | +0.360% | +0.925% | 225m | -0.174% | 60m |

## ETH LONG NEUTRAL + BROAD_SHORT_PRESSURE
Raw rows: 39; dedup episodes: 28
| horizon | n | win | avg return | med return | med MFE | med time to MFE | med MAE/opposite depth | med time to MAE |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1h | 28 | 46.4% | -0.046% | -0.068% | +0.091% | 30m | -0.165% | 45m |
| 2h | 28 | 32.1% | -0.046% | -0.161% | +0.155% | 52m | -0.289% | 90m |
| 3h | 28 | 35.7% | -0.087% | -0.048% | +0.199% | 60m | -0.400% | 105m |
| 4h | 28 | 39.3% | -0.134% | -0.161% | +0.264% | 67m | -0.484% | 150m |
| 5h | 28 | 39.3% | -0.016% | -0.199% | +0.292% | 75m | -0.610% | 157m |
| 6h | 28 | 50.0% | +0.144% | +0.015% | +0.400% | 135m | -0.688% | 232m |

## SOL LONG_CONFIRMED unvalidated
Raw rows: 15; dedup episodes: 14
| horizon | n | win | avg return | med return | med MFE | med time to MFE | med MAE/opposite depth | med time to MAE |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1h | 14 | 57.1% | +0.203% | +0.293% | +0.252% | 37m | -0.150% | 30m |
| 2h | 14 | 64.3% | +0.278% | +0.124% | +0.392% | 67m | -0.215% | 30m |
| 3h | 14 | 42.9% | +0.059% | -0.162% | +0.542% | 75m | -0.560% | 105m |
| 4h | 14 | 71.4% | +0.160% | +0.240% | +0.542% | 75m | -0.622% | 105m |
| 5h | 14 | 42.9% | +0.023% | -0.098% | +0.731% | 112m | -0.622% | 150m |
| 6h | 14 | 57.1% | +0.172% | +0.127% | +0.731% | 142m | -0.667% | 172m |

## BTC LONGS_EXITING + BROAD_SHORT_PRESSURE
Raw rows: 37; dedup episodes: 25
| horizon | n | win | avg return | med return | med MFE | med time to MFE | med MAE/opposite depth | med time to MAE |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1h | 25 | 64.0% | +0.090% | +0.093% | +0.155% | 45m | -0.128% | 45m |
| 2h | 25 | 68.0% | +0.215% | +0.289% | +0.265% | 90m | -0.137% | 45m |
| 3h | 25 | 60.0% | +0.176% | +0.268% | +0.428% | 90m | -0.199% | 60m |
| 4h | 25 | 64.0% | +0.235% | +0.143% | +0.429% | 135m | -0.229% | 60m |
| 5h | 25 | 48.0% | +0.024% | -0.053% | +0.437% | 135m | -0.310% | 75m |
| 6h | 25 | 48.0% | +0.086% | -0.001% | +0.474% | 165m | -0.310% | 150m |
