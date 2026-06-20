# Non-Telegram MFE/MAE Candidate Review
Generated: 2026-07-01T10:07:34.930Z
Window: 2026-06-16T10:07:34.511Z → 2026-07-01T10:07:34.511Z
Scope: phase1d alerts not actually delivered to Telegram. Dry/skipped/suppressed/log-only rows included.
Rule: actual traded direction, 6h path, >=6h independent episode dedupe, min n=5, strong if MFE>|MAE| >= 70% plus distribution sanity.
Central rule: CANDIDATE-REVIEW-RULES.md
Events evaluated: 611; summaries: 116.

## Exact pattern buckets that pass path gate
- pattern SOL_SHORT_BELOW_GATE_WATCH | n=6 raw=10 postFix=6 | dir SHORT | MFE>|MAE| 83.3% (5/6) | MFE p25/med/p75 +1.140%/+1.552%/+1.837% | MAE p25/med/p75 -0.376%/-0.153%/-0.017% | fav-first 33.3% | best 6h 83.3% avg +0.852%
- pattern ETH_LONG_SHADOW_NO_SETUP_INVERSE_SHORT | n=6 raw=11 postFix=6 | dir SHORT | MFE>|MAE| 83.3% (5/6) | MFE p25/med/p75 +1.136%/+1.254%/+1.388% | MAE p25/med/p75 -0.324%/-0.164%/+0.024% | fav-first 16.7% | best 2h 100.0% avg +0.473%
- pattern ETH_LONG_CONFIRMED_INVERSE_SHORT | n=7 raw=7 postFix=7 | dir SHORT | MFE>|MAE| 71.4% (5/7) | MFE p25/med/p75 +0.694%/+1.776%/+4.757% | MAE p25/med/p75 -1.051%/-0.096%/+0.018% | fav-first 42.9% | best 6h 71.4% avg +1.861%

## Exact pattern buckets that pass path gate but are quarantined/low post-fix evidence

## Broad buckets that pass path gate (secondary only; require exact-pattern validation before Telegram)
- asset_type_flow SOL|RETEST_HELD|STRUCTURAL_BUYING|LONG | n=6 raw=7 postFix=6 | dir LONG | MFE>|MAE| 83.3% (5/6) | MFE p25/med/p75 +0.851%/+1.093%/+1.743% | MAE p25/med/p75 -0.349%/-0.216%/-0.122% | fav-first 16.7% | best 1h 83.3% avg +0.679%
- asset_type ETH|LONG_CONFIRMED|LONG | n=5 raw=12 postFix=0 | dir LONG | MFE>|MAE| 80.0% (4/5) | MFE p25/med/p75 +0.635%/+0.654%/+0.788% | MAE p25/med/p75 -0.466%/-0.206%/-0.080% | fav-first 40.0% | best 1h 100.0% avg +0.349%
- asset_type SOL|RETEST_HELD|SHORT | n=8 raw=14 postFix=8 | dir SHORT | MFE>|MAE| 75.0% (6/8) | MFE p25/med/p75 +0.573%/+1.339%/+1.528% | MAE p25/med/p75 -1.124%/-0.777%/-0.367% | fav-first 50.0% | best 6h 75.0% avg +0.511%
- asset_btcgate SOL|BTC_STRONG_ALT_NOT_FOLLOWING|SHORT | n=8 raw=10 postFix=8 | dir SHORT | MFE>|MAE| 75.0% (6/8) | MFE p25/med/p75 +0.552%/+1.257%/+1.644% | MAE p25/med/p75 -0.999%/-0.667%/-0.475% | fav-first 37.5% | best 2h 62.5% avg +0.478%
- asset_btcgate ETH|BTC_PERMITS_ALT_LONG_OBSERVATION|SHORT | n=14 raw=27 postFix=14 | dir SHORT | MFE>|MAE| 71.4% (10/14) | MFE p25/med/p75 +0.543%/+0.843%/+1.295% | MAE p25/med/p75 -0.767%/-0.169%/+0.004% | fav-first 35.7% | best 1h 78.6% avg +0.417%
- asset_type_flow ETH|LONG_CONFIRMED|STRUCTURAL_BUYING|SHORT | n=7 raw=7 postFix=7 | dir SHORT | MFE>|MAE| 71.4% (5/7) | MFE p25/med/p75 +0.694%/+1.776%/+4.757% | MAE p25/med/p75 -1.051%/-0.096%/+0.018% | fav-first 42.9% | best 6h 71.4% avg +1.861%
- asset_flow SOL|LEVERAGED_CHASE|SHORT | n=7 raw=12 postFix=7 | dir SHORT | MFE>|MAE| 71.4% (5/7) | MFE p25/med/p75 +0.896%/+1.461%/+1.844% | MAE p25/med/p75 -1.112%/-0.425%/-0.028% | fav-first 14.3% | best 1h 71.4% avg +0.197%
- asset_oi_funding ETH|LONGS_EXITING|BROAD_POSITIVE_FUNDING|SHORT | n=7 raw=12 postFix=7 | dir SHORT | MFE>|MAE| 71.4% (5/7) | MFE p25/med/p75 +0.788%/+1.335%/+1.881% | MAE p25/med/p75 -0.400%/-0.306%/-0.108% | fav-first 28.6% | best 3h 100.0% avg +1.162%
- asset_btcgate SOL|BTC_WEAK_VETO_ALT_LONGS|SHORT | n=7 raw=8 postFix=7 | dir SHORT | MFE>|MAE| 71.4% (5/7) | MFE p25/med/p75 +1.308%/+1.461%/+1.535% | MAE p25/med/p75 -1.131%/-0.061%/-0.021% | fav-first 42.9% | best 2h 85.7% avg +0.477%
- asset_oi_funding ETH|FRESH_LONGS|BROAD_POSITIVE_FUNDING|SHORT | n=10 raw=12 postFix=10 | dir SHORT | MFE>|MAE| 70.0% (7/10) | MFE p25/med/p75 +0.501%/+0.912%/+1.277% | MAE p25/med/p75 -0.467%/-0.180%/+0.003% | fav-first 10.0% | best 6h 80.0% avg +0.853%

## Exact pattern buckets with bad path (<50% MFE>|MAE|)
- pattern FRESH_LONGS_LONG_UNVALIDATED | n=9 raw=10 postFix=9 | dir LONG | MFE>|MAE| 22.2% (2/9) | MFE p25/med/p75 -0.106%/+0.408%/+0.574% | MAE p25/med/p75 -1.085%/-0.688%/-0.602% | fav-first 77.8% | best 1h 33.3% avg -0.148%
- pattern FADE_SHORT_POSITIVE_FUNDING | n=21 raw=27 postFix=15 | dir LONG | MFE>|MAE| 28.6% (6/21) | MFE p25/med/p75 +0.098%/+0.263%/+0.867% | MAE p25/med/p75 -1.007%/-0.822%/-0.463% | fav-first 57.1% | best 4h 40.0% avg -0.155%
- pattern LONGS_EXITING_LONG_UNVALIDATED | n=18 raw=43 postFix=5 QUARANTINED | dir LONG | MFE>|MAE| 33.3% (6/18) | MFE p25/med/p75 -0.039%/+0.282%/+0.771% | MAE p25/med/p75 -1.124%/-0.648%/-0.322% | fav-first 61.1% | best 2h 55.6% avg +0.068%
- pattern NEUTRAL_OI_LONG | n=23 raw=58 postFix=10 | dir LONG | MFE>|MAE| 34.8% (8/23) | MFE p25/med/p75 +0.104%/+0.368%/+0.780% | MAE p25/med/p75 -1.465%/-0.723%/-0.355% | fav-first 43.5% | best 1h 60.9% avg -0.066% | tail-risk
- pattern BTC_LONG_SETUP_SPOT_LED_ACCUMULATION | n=17 raw=36 postFix=17 | dir LONG | MFE>|MAE| 35.3% (6/17) | MFE p25/med/p75 +0.038%/+0.297%/+0.789% | MAE p25/med/p75 -0.964%/-0.731%/-0.262% | fav-first 41.2% | best 6h 58.8% avg +0.328%
- pattern FADE_SHORT_LATE_AFTER_LOW | n=45 raw=135 postFix=41 | dir LONG | MFE>|MAE| 35.6% (16/45) | MFE p25/med/p75 +0.175%/+0.374%/+1.281% | MAE p25/med/p75 -1.482%/-0.776%/-0.458% | fav-first 48.9% | best 6h 44.2% avg -0.219% | tail-risk
- pattern SOL_LONG_WATCH_ONLY | n=35 raw=111 postFix=23 | dir LONG | MFE>|MAE| 42.9% (15/35) | MFE p25/med/p75 +0.268%/+0.661%/+1.784% | MAE p25/med/p75 -1.365%/-0.926%/-0.333% | fav-first 45.7% | best 3h 54.3% avg +0.138% | tail-risk
- pattern ETH_LONG_SHADOW_BLOCKED_INVERSE_SHORT | n=9 raw=14 postFix=9 | dir SHORT | MFE>|MAE| 44.4% (4/9) | MFE p25/med/p75 +0.249%/+0.798%/+1.220% | MAE p25/med/p75 -0.845%/-0.809%/-0.306% | fav-first 22.2% | best 6h 55.6% avg +0.219%
- pattern BTC_LONG_SHADOW_SETUP_FORMING | n=13 raw=28 postFix=13 | dir LONG | MFE>|MAE| 46.2% (6/13) | MFE p25/med/p75 +0.082%/+0.360%/+1.426% | MAE p25/med/p75 -1.484%/-0.866%/-0.236% | fav-first 46.2% | best 3h 53.8% avg -0.067% | tail-risk
