# Alert knowledge-line review excluding newly promoted candidates
Generated: 2026-06-29T11:35:31.191Z
Window: 2026-06-20T20:15:00.000Z → 2026-06-29T11:35:30.051Z
Excludes alerts actually delivered to Telegram; includes suppressed/log-only + missing shadow rows. Dedup: 6h per reviewed bucket.

## T1_FRESH_LONGS_LONG
- Meaning: SOL FRESH_LONGS + source LONG
- Intended trade/read: avoid original LONG / possible SHORT only after confirmation
- Current post-fix evidence: n=26 raw=159; best 5h 53.8% avg +0.114%; 1h 53.8% avg -0.273%; MFE6 med +0.533% @97.5m; MAE6 med -1.008% @180m
- States: {"SHADOW_NO_SETUP":14,"SHADOW_SETUP_FORMING":4,"SHADOW_BLOCKED":8}
- Recommendation: **KEEP_AS_QUARANTINE_OR_REMOVE_STATS** — Current post-fix data does not justify strong trade wording; keep only decision/risk guidance.

## SHORTS_COVERING_LONG_BEARISH
- Meaning: SOL SHORTS_COVERING + source LONG
- Intended trade/read: avoid original LONG
- Current post-fix evidence: n=25 raw=133; best 2h 56.0% avg +0.138%; 1h 52.0% avg +0.127%; MFE6 med +0.729% @105m; MAE6 med -0.769% @180m
- States: {"SHADOW_BLOCKED":9,"SHADOW_SETUP_FORMING":3,"SHADOW_NO_SETUP":13}
- Recommendation: **KEEP_AS_QUARANTINE_OR_REMOVE_STATS** — Current post-fix data does not justify strong trade wording; keep only decision/risk guidance.

## FRESH_SHORTS_LONG
- Meaning: FRESH_SHORTS + source LONG all assets
- Intended trade/read: quarantine/block source LONG
- Current post-fix evidence: n=31 raw=397; best 5h 50.0% avg -0.352%; 1h 41.9% avg -0.052%; MFE6 med +0.403% @165m; MAE6 med -0.598% @180m
- States: {"SHADOW_NO_SETUP":14,"SHADOW_BLOCKED":14,"SHADOW_SETUP_FORMING":3}
- Recommendation: **KEEP_AS_QUARANTINE_OR_REMOVE_STATS** — Current post-fix data does not justify strong trade wording; keep only decision/risk guidance.

## NEUTRAL_OI_LONG
- Meaning: NEUTRAL OI + source LONG all assets
- Intended trade/read: observation-only source LONG
- Current post-fix evidence: n=33 raw=932; best 2h 69.7% avg +0.226%; 1h 54.5% avg +0.034%; MFE6 med +0.475% @150m; MAE6 med -0.494% @105m
- States: {"SHADOW_NO_SETUP":23,"SHADOW_BLOCKED":8,"SHADOW_SETUP_FORMING":2}
- Recommendation: **KEEP_AS_QUARANTINE_OR_REMOVE_STATS** — Current post-fix data does not justify strong trade wording; keep only decision/risk guidance.

## BTC_LONG_SHADOW_SETUP_FORMING
- Meaning: BTC source LONG + SHADOW_SETUP_FORMING
- Intended trade/read: old natural LONG watch
- Current post-fix evidence: n=19 raw=51; best 3h 42.1% avg -0.391%; 1h 31.6% avg -0.290%; MFE6 med +0.297% @90m; MAE6 med -0.819% @210m
- States: {"SHADOW_SETUP_FORMING":19}
- Recommendation: **REMOVE_PROMOTION** — Post-fix BTC SHADOW_SETUP_FORMING no longer clears old 2–4h bounce edge; keep only if explicitly labelled stale/pre-fix.

## BTC_LONG_SETUP_SPOT_LED_ACCUMULATION
- Meaning: BTC LONG_SETUP + SPOT_LED_ACCUMULATION
- Intended trade/read: old natural LONG watch
- Current post-fix evidence: n=17 raw=36; best 6h 58.8% avg +0.328%; 1h 29.4% avg -0.093%; MFE6 med +0.297% @240m; MAE6 med -0.731% @120m
- States: {"SHADOW_SETUP_FORMING":9,"SHADOW_BLOCKED":1,"SHADOW_NO_SETUP":7}
- Recommendation: **REMOVE_OR_INVERT** — Conflicts with new BTC LONG_SETUP inverse-short evidence; old natural LONG watch is misleading post-fix.

## ETH_LONG_CONFIRMED_INVERSE_SHORT
- Meaning: ETH LONG_CONFIRMED → inverse SHORT
- Intended trade/read: inverse SHORT
- Current post-fix evidence: n=5 raw=6; best 6h 80.0% avg +2.012%; 1h 80.0% avg +0.211%; MFE6 med +1.608% @210m; MAE6 med -0.096% @150m
- States: {"SHADOW_BLOCKED":2,"SHADOW_SETUP_FORMING":3}
- Recommendation: **REMOVE_STATS_OR_MARK_LOW_N** — Post-fix N is below 8 or absent; do not show historical numeric confidence as if current.

## ETH_LONG_CONFIRMED_SPOT_LED_INVERSE_SHORT
- Meaning: ETH LONG_CONFIRMED + SPOT_LED_ACCUMULATION → inverse SHORT
- Intended trade/read: inverse SHORT
- Current post-fix evidence: n=3 raw=3; best 6h 66.7% avg +0.619%; 1h 66.7% avg +0.042%; MFE6 med +0.834% @195m; MAE6 med -0.667% @150m
- States: {"SHADOW_SETUP_FORMING":3}
- Recommendation: **REMOVE_STATS_OR_MARK_LOW_N** — Post-fix N is below 8 or absent; do not show historical numeric confidence as if current.

## ETH_LONG_SHADOW_BLOCKED_INVERSE_SHORT
- Meaning: ETH source LONG + SHADOW_BLOCKED → inverse SHORT
- Intended trade/read: inverse SHORT
- Current post-fix evidence: n=32 raw=310; best 5h 61.3% avg +0.446%; 1h 53.1% avg +0.033%; MFE6 med +0.628% @187.5m; MAE6 med -0.440% @187.5m
- States: {"SHADOW_BLOCKED":32}
- Recommendation: **DOWNGRADE_TO_OBSERVATION** — Update N/MFE/MAE/timing from post-fix data; clarify source shadow is original LONG, trade is inverse SHORT.

## ETH_LONG_SHADOW_NO_SETUP_INVERSE_SHORT
- Meaning: ETH source LONG + SHADOW_NO_SETUP → inverse SHORT
- Intended trade/read: inverse SHORT
- Current post-fix evidence: n=32 raw=479; best 5h 51.6% avg +0.307%; 1h 50.0% avg +0.087%; MFE6 med +0.537% @172.5m; MAE6 med -0.532% @187.5m
- States: {"SHADOW_NO_SETUP":32}
- Recommendation: **DOWNGRADE_TO_OBSERVATION** — Update N/MFE/MAE/timing from post-fix data; clarify source shadow is original LONG, trade is inverse SHORT.

## ETH_LONG_SHADOW_SETUP_FORMING_INVERSE_SHORT
- Meaning: ETH source LONG + SHADOW_SETUP_FORMING → inverse SHORT
- Intended trade/read: inverse SHORT
- Current post-fix evidence: n=18 raw=45; best 4h 72.2% avg +0.375%; 1h 55.6% avg +0.040%; MFE6 med +0.796% @300m; MAE6 med -0.467% @112.5m
- States: {"SHADOW_SETUP_FORMING":18}
- Recommendation: **KEEP_WITH_UPDATED_POSTFIX_STATS** — Update N/MFE/MAE/timing from post-fix data; clarify source shadow is original LONG, trade is inverse SHORT.

## SOL_LONG_CONFIRMED_STRUCTURAL_BUYING_INVERSE_SHORT
- Meaning: SOL LONG_CONFIRMED + STRUCTURAL_BUYING → inverse SHORT
- Intended trade/read: inverse SHORT
- Current post-fix evidence: n=4 raw=4; best 3h 100.0% avg +0.543%; 1h 50.0% avg +0.322%; MFE6 med +1.055% @142.5m; MAE6 med -0.054% @67.5m
- States: {"SHADOW_SETUP_FORMING":2,"SHADOW_CONFIRMED":1,"SHADOW_BLOCKED":1}
- Recommendation: **REMOVE_STATS_OR_MARK_LOW_N** — Post-fix N is below 8 or absent; do not show historical numeric confidence as if current.

## SOL_LONG_SHADOW_CONFIRMED_INVERSE_SHORT
- Meaning: SOL source LONG + SHADOW_CONFIRMED → inverse SHORT
- Intended trade/read: inverse SHORT
- Current post-fix evidence: n=2 raw=3; best 5h 100.0% avg +0.604%; 1h 50.0% avg +0.006%; MFE6 med +0.663% @255m; MAE6 med -0.374% @187.5m
- States: {"SHADOW_CONFIRMED":2}
- Recommendation: **REMOVE_STATS_OR_MARK_LOW_N** — Post-fix N is below 8 or absent; do not show historical numeric confidence as if current.

## SOL_LONG_WATCH_ONLY
- Meaning: SOL source LONG generic
- Intended trade/read: watch-only / no active context
- Current post-fix evidence: n=34 raw=836; best 2h 67.6% avg +0.379%; 1h 52.9% avg +0.041%; MFE6 med +0.863% @135m; MAE6 med -0.474% @180m
- States: {"SHADOW_BLOCKED":17,"SHADOW_NO_SETUP":16,"SHADOW_SETUP_FORMING":1}
- Recommendation: **KEEP_AS_QUARANTINE_OR_REMOVE_STATS** — Current post-fix data does not justify strong trade wording; keep only decision/risk guidance.

## C1_SHORT_MAX
- Meaning: SHORT score>=70 + FRESH_LONGS
- Intended trade/read: same-direction SHORT
- Current post-fix evidence: n=2 raw=2; best n/a n/a avg n/a; 1h 100.0% avg +0.072%; MFE6 med +0.832% @82.5m; MAE6 med +0.326% @22.5m
- States: {"SHADOW_CONFIRMED":1,"SHADOW_BLOCKED":1}
- Recommendation: **REMOVE_STATS_OR_MARK_LOW_N** — Post-fix N is below 8 or absent; do not show historical numeric confidence as if current.

## FADE_LONG_BTC_WEAK
- Meaning: source LONG below gate under BTC_WEAK
- Intended trade/read: avoid LONG / tactical SHORT fade context
- Current post-fix evidence: n=31 raw=520; best 2h 58.1% avg -0.064%; 1h 45.2% avg -0.040%; MFE6 med +0.627% @210m; MAE6 med -0.512% @180m
- States: {"SHADOW_BLOCKED":31}
- Recommendation: **KEEP_NO_STATS** — Useful as no-long/tactical fade context; avoid automatic SHORT claim.

## FADE_SHORT_POSITIVE_FUNDING
- Meaning: SHORT below gate 50-69 + broad positive funding
- Intended trade/read: old opposite LONG fade caution
- Current post-fix evidence: n=17 raw=50; best 5h 56.3% avg -0.048%; 1h 43.8% avg -0.102%; MFE6 med +0.641% @75m; MAE6 med -0.888% @135m
- States: {"SHADOW_SETUP_FORMING":15,"SHADOW_BLOCKED":2}
- Recommendation: **REMOVE_NUMERIC_EDGE** — Do not imply automatic opposite LONG; show only as caution unless current post-fix inverse clears threshold.

## FADE_SHORT_LATE_AFTER_LOW
- Meaning: SHORT below gate late after low
- Intended trade/read: opposite LONG caution
- Current post-fix evidence: n=0 raw=0; best n/a n/a avg n/a; 1h n/a avg n/a; MFE6 med n/a @n/am; MAE6 med n/a @n/am
- States: {}
- Recommendation: **REMOVE_STATS_OR_MARK_LOW_N** — Post-fix N is below 8 or absent; do not show historical numeric confidence as if current.

## SOL_SHORT_BELOW_GATE
- Meaning: SOL source SHORT below gate
- Intended trade/read: same-direction SHORT watch
- Current post-fix evidence: n=34 raw=832; best 6h 48.5% avg -0.074%; 1h 44.1% avg -0.041%; MFE6 med +0.474% @180m; MAE6 med -0.868% @135m
- States: {"SHADOW_NO_SETUP":27,"SHADOW_BLOCKED":5,"SHADOW_SETUP_FORMING":2}
- Recommendation: **DOWNGRADE_NO_TELEGRAM** — Show as same-direction SHORT only if 1h/front-loaded edge is clear; include MAE because path is volatile.

## SOL_SHORT_50_59
- Meaning: SOL source SHORT score 50-59
- Intended trade/read: same-direction SHORT watch
- Current post-fix evidence: n=6 raw=9; best 1h 16.7% avg -0.405%; 1h 16.7% avg -0.405%; MFE6 med +0.339% @172.5m; MAE6 med -0.995% @112m
- States: {"SHADOW_SETUP_FORMING":3,"SHADOW_BLOCKED":3}
- Recommendation: **REMOVE_STATS_OR_MARK_LOW_N** — Post-fix N is below 8 or absent; do not show historical numeric confidence as if current.

## SOL_SHORT_SHORTS_COVERING
- Meaning: SOL source SHORT + SHORTS_COVERING
- Intended trade/read: same-direction SHORT watch
- Current post-fix evidence: n=25 raw=133; best 5h 52.0% avg -0.109%; 1h 48.0% avg -0.126%; MFE6 med +0.769% @180m; MAE6 med -0.800% @105m
- States: {"SHADOW_NO_SETUP":22,"SHADOW_BLOCKED":3}
- Recommendation: **DOWNGRADE_NO_TELEGRAM** — Show as same-direction SHORT only if 1h/front-loaded edge is clear; include MAE because path is volatile.
