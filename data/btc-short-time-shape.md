# BTC SHORT Time-Shape Analysis

Generated: 2026-06-06T18:27:10.669Z
Window: since 2026-05-25T00:00:00Z

## Methodology

- Entry: `SHORT_CONFIRMED` HIGH alert timestamp and price.
- OI bucket: nearest `readiness-shadow.jsonl` row (same asset/direction) within ±16m.
  Rows with no join within tolerance are labelled `NO_JOIN`.
- Win: price moved in SHORT direction (return > 0) at the given horizon.
- Price lookup tolerance: ±20m from target time.

## BTC SHORT (all OI buckets)

### BTC SHORT (all OI buckets) (n=16)

| win | n | win rate | avg return | median return |
| --- | --: | ------: | ---------: | ------------: |
| 30m  |  16 |  56.3% |   +0.089% |   +0.035% |
| 1h   |  16 |  56.3% |   +0.080% |   +0.110% |
| 2h   |  16 |  75.0% |   +0.311% |   +0.241% |
| 3h   |  16 |  68.8% |   +0.554% |   +0.297% |
| 4h   |  16 |  62.5% |   +0.367% |   +0.134% |
| 24h  |  16 | 100.0% |   +3.054% |   +3.165% |

### OI bucket breakdown

| OI bucket | n | 1h win | 2h win | 3h win | 4h win | 24h win |
| --- | --: | -----: | -----: | -----: | -----: | ------: |
| FRESH_SHORTS | 16 | 56.3% | 75.0% | 68.8% | 62.5% | 100.0% |

## BTC SHORT + FRESH_SHORTS

### BTC SHORT + FRESH_SHORTS (n=16)

| win | n | win rate | avg return | median return |
| --- | --: | ------: | ---------: | ------------: |
| 30m  |  16 |  56.3% |   +0.089% |   +0.035% |
| 1h   |  16 |  56.3% |   +0.080% |   +0.110% |
| 2h   |  16 |  75.0% |   +0.311% |   +0.241% |
| 3h   |  16 |  68.8% |   +0.554% |   +0.297% |
| 4h   |  16 |  62.5% |   +0.367% |   +0.134% |
| 24h  |  16 | 100.0% |   +3.054% |   +3.165% |

## Raw rows

| timestamp | entry price | OI bucket | shadow state | 30m | 1h | 2h | 3h | 4h | 24h |
| --- | ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 2026-05-25T04:00:02.340Z | 76934.75 | FRESH_SHORTS | SHADOW_SETUP_FORMING | -0.260% | -0.509% | -0.402% | -0.378% | -0.366% | +0.457% |
| 2026-05-25T15:45:02.183Z | 77589.45 | FRESH_SHORTS | SHADOW_SETUP_FORMING | +0.089% | -0.099% | +0.122% | +0.141% | +0.267% | +1.479% |
| 2026-05-26T02:45:02.748Z | 76517.65 | FRESH_SHORTS | SHADOW_SETUP_FORMING | +0.077% | -0.095% | -0.217% | -0.396% | -0.404% | +1.042% |
| 2026-05-26T11:45:02.737Z | 77142.05 | FRESH_SHORTS | SHADOW_SETUP_FORMING | +0.283% | +0.116% | -0.056% | +0.379% | +0.944% | +1.918% |
| 2026-05-27T04:30:02.423Z | 75400.05 | FRESH_SHORTS | SHADOW_SETUP_FORMING | -0.146% | -0.162% | -0.382% | -0.502% | -0.603% | +3.036% |
| 2026-05-28T13:15:02.583Z | 73238.35 | FRESH_SHORTS | SHADOW_SETUP_FORMING | +0.428% | +0.532% | +0.511% | +0.216% | -0.100% | +0.364% |
| 2026-05-31T15:00:02.707Z | 73518.55 | FRESH_SHORTS | SHADOW_SETUP_FORMING | -0.038% | -0.033% | +0.122% | -0.089% | +0.005% | +2.831% |
| 2026-06-01T03:45:02.904Z | 73773.85 | FRESH_SHORTS | SHADOW_SETUP_FORMING | +0.613% | +0.422% | +0.688% | +0.974% | +1.402% | +3.917% |
| 2026-06-01T23:00:02.474Z | 71341.75 | FRESH_SHORTS | SHADOW_SETUP_FORMING | -0.142% | +0.199% | +0.045% | +1.575% | +0.715% | +6.647% |
| 2026-06-02T06:00:02.900Z | 70194.65 | FRESH_SHORTS | SHADOW_SETUP_FORMING | -0.013% | +0.305% | +0.292% | +0.991% | +0.873% | +4.440% |
| 2026-06-03T00:45:02.616Z | 66989.85 | FRESH_SHORTS | SHADOW_SETUP_FORMING | +0.045% | +0.200% | +0.635% | +1.821% | +0.905% | +5.523% |
| 2026-06-03T07:30:02.876Z | 67115.65 | FRESH_SHORTS | SHADOW_SETUP_FORMING | +0.182% | +0.132% | +0.680% | -0.059% | +0.015% | +4.798% |
| 2026-06-03T20:15:02.142Z | 65427.15 | FRESH_SHORTS | SHADOW_SETUP_FORMING | +0.734% | -0.077% | +0.242% | +1.502% | +3.125% | +3.295% |
| 2026-06-04T14:45:02.492Z | 63961.35 | FRESH_SHORTS | SHADOW_NO_SETUP | +0.026% | +0.105% | +0.691% | +0.718% | +0.252% | +4.875% |
| 2026-06-04T20:15:02.805Z | 63462.15 | FRESH_SHORTS | SHADOW_SETUP_FORMING | -0.209% | -0.004% | +0.240% | +0.063% | -0.547% | +4.002% |
| 2026-06-05T16:30:02.550Z | 60879.45 | FRESH_SHORTS | SHADOW_SETUP_FORMING | -0.250% | +0.248% | +1.759% | +1.901% | -0.610% | +0.242% |
