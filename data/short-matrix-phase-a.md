# Phase A SHORT Matrix

Generated: 2026-06-06T15:56:33.623Z

## Schema/source checks

Sources: `market-intel/data/phase1d-alerts.jsonl`, `market-intel/data/readiness-shadow.jsonl`, `market-intel/data/autoresearch/price-15m.jsonl`
OI join: nearest same asset/direction readiness-shadow.jsonl row within ±16m

Readiness-shadow OI labels:
- FRESH_LONGS: 1286
- FRESH_SHORTS: 10324
- LONGS_EXITING: 1034
- NEUTRAL: 3120
- SHORTS_COVERING: 1060

Alert diagnostics/top-level OI labels:
- MISSING: 8158

Embedded alert `readiness_shadow.source_metrics.oi_price_regime` labels, when present:
- FRESH_LONGS: 155
- FRESH_SHORTS: 798
- LONGS_EXITING: 61
- MISSING: 6799
- NEUTRAL: 247
- SHORTS_COVERING: 98

## Preliminary SHORT candidates

| verdict | key | reason | full confirmed n/4h/24h | full episode n/4h/24h | post confirmed n/4h/24h | post episode n/4h/24h | med MAE24 fullC/recentC |
| --- | --- | --- | --- | --- | --- | --- | --- |
| WATCH_REGIME_SPECIFIC_24H_CONTINUATION | BTC|FRESH_SHORTS|SHADOW_SETUP_FORMING|NONE | post-May21-only 24h edge; pre-May21 reversal; regime engine required | 21; 52.4%/0.196%; 75.0%/1.892% | 15; 60.0%/0.201%; 71.4%/1.632% | 18; 50.0%/0.226%; 82.4%/2.287% | 12; 58.3%/0.247%; 81.8%/2.172% | -0.736/-0.547% |
| WATCH | BTC|NEUTRAL|SHADOW_SETUP_FORMING|NONE | positive but low/partial sample | 13; 46.2%/0.216%; 61.5%/0.301% | 7; 42.9%/-0.047%; 42.9%/-0.472% | missing | missing | -0.607/n/a% |



## Structural SHORT shadow-engine issue

Post-May21 SHORT shadow states show a systematic production/shadow mismatch:

| asset | SHORT shadow rows | SHADOW_CONFIRMED | SHADOW_SETUP_FORMING | SHADOW_BLOCKED | SHADOW_NO_SETUP | setup score median/max |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| BTC | 1612 | 0 | 67 | 136 | 1409 | 46 / 61 |
| ETH | 1612 | 0 | 55 | 55 | 1502 | 48 / 68 |
| SOL | 1612 | 0 | 40 | 341 | 1231 | 43 / 68 |

Implications:

- `confirmed-alert mode` means production `SHORT_CONFIRMED` alert rows, not shadow `SHADOW_CONFIRMED` rows.
- For post-May21 SHORTs, production and shadow confirmation layers are misaligned: production can fire `SHORT_CONFIRMED` while readiness shadow remains `SHADOW_SETUP_FORMING` or lower.
- Therefore every SHORT matrix stat must carry this warning: shadow state at alert time is often setup-stage, and the shadow engine does not confirm SHORT direction in this regime.
- No SHORT bucket may move beyond `WATCH` until the shadow scoring asymmetry is understood or bypassed with a separately validated production-alert classifier.

Component audit source: `market-intel/data/short-shadow-confirmation-audit.json`.

Likely blockers from setup rows:

- BTC `FRESH_SHORTS` SHORT setup rows: OI contributes only `+6`; median setup score `46`, max `61`; macro contributes `-5`; many rows include `flow streak cap applied: max 69`.
- ETH setup rows max at `68`; SOL setup rows max at `68`; both also fail to reach confirmation.
- This looks structural: threshold/cap/directional weighting issue, not a random absence of confirmations.

Operational condition before use:

```text
applicable_when: regime_engine_live_and_bearish_sideways_confirmed OR interim_bearish_proxy == true
max_class_until_independent_validation: WATCH
production_alert_confirmed != shadow_confirmed
```

Freeze/paradox note:

- Do not tune `readiness_shadow_v0` weights/thresholds on the current sample.
- A `readiness_shadow_v1` SHORT scoring fix can be built only as shadow/research and cannot be validated on the same sample that exposed the bug.
- Independent validation requires a future regime/sample window.
- Production-alert SHORT promotion does not strictly require the full regime engine if `interim_bearish_proxy == true` using the predeclared spec in `data/interim-bearish-proxy-spec.md`.

Viable path meanwhile:

Interim proxy backtest caveat:

- Same-regime backtest is a sanity check only, not validation. Proxy-pass n=6 / 24h-complete n=5 is too small to quote apparent perfect hit rate as a validated win rate. The proxy was defined after inspecting the same post-May21 regime data, so in-sample discrimination is circular and expected. Proxy-fail cases were also strongly positive, meaning this is a fail-closed safety gate inside a high-base-rate window, not proof of predictive power.

Interim bearish proxy is now concretely defined:

- Spec: `market-intel/data/interim-bearish-proxy-spec.md`
- Evaluator: `market-intel/scripts/evaluate-interim-bearish-proxy.js`
- Latest output: `market-intel/data/interim-bearish-proxy-latest.json`
- Rule: BTC 4h return `< -0.5%` on at least 2 of last 3 rolling 4h windows; latest BTC gate is not `BTC_STRONG_ALT_FOLLOWING`; no bullish squeeze in last 8h.


- SHORT classification uses production `SHORT_CONFIRMED` as entry gate.
- OI bucket, BTC gate, regime window, and path-risk metrics are discriminators.
- Shadow state is diagnostic context only for SHORT v0.
- Max class remains `WATCH` until independent validation exists and either the full regime engine or a predeclared interim bearish-regime proxy is available.

## Promotion caveats before classifier wiring

### BTC|FRESH_SHORTS|SHADOW_SETUP_FORMING|NONE

Current status: `WATCH_REGIME_SPECIFIC_24H_CONTINUATION`, not `TRADABLE_CANDIDATE` and not a generic tradable signal.

Required interpretation:

- `SHADOW_SETUP_FORMING` is not automatically confirmed-entry quality. The LONG-side `SHADOW_SETUP_FORMING` stat was rejected because it came from setup-stage rows that did not represent confirmed entries. For this BTC SHORT bucket, the tentative directional/regime-specific rationale is **not empirically confirmed**: post-May21 BTC SHORT `FRESH_SHORTS|SHADOW_SETUP_FORMING` has 67 shadow setup rows and zero transitions to `SHADOW_CONFIRMED` within 24h. Therefore there is no measured setup-entry advantage vs waiting for confirmation. The bucket may still describe a post-May21 bearish-regime 24h continuation condition, but it cannot be justified as “early before confirmation” yet.
- This is a 24h continuation candidate only. 4h stats are weak/marginal: full confirmed 52.4% avg +0.196%; post-May21 confirmed 50.0% avg +0.226%. Do not use it as a 4h exit/entry edge.
- Required metadata if wired later: `minimum_hold: 24h`, `target_horizon: 24h`, `edge_4h: weak`, `entry_for_24h_continuation_only: true`, `setup_stage_rationale_required: true`.
- Stability is not proven across independent regime windows. Full confirmed-alert n=21 and post-May21 n=18 differ by only 3 rows, so the full-window check is dominated by the recent period. Pre-May21 BTC `FRESH_SHORTS|SHADOW_SETUP_FORMING|NONE` is only n=3 and not supportive at 24h (33.3%, avg -0.348%, median MAE24 -1.456%).

Therefore: do not promote to production `TRADABLE` or `TRADABLE_CANDIDATE` yet. Keep as `WATCH_REGIME_SPECIFIC_24H_CONTINUATION` / observation-only until a live regime detector can enforce the post-May21 bearish/sideways regime and the setup-stage mechanism is separately validated.

Setup-to-confirm empirical check:

- Source: `market-intel/data/btc-short-setup-to-confirm-check.json`
- Post-May21 BTC SHORT `FRESH_SHORTS|SHADOW_SETUP_FORMING` shadow rows: 67
- Transitions to `SHADOW_CONFIRMED` within 24h: 0
- Average/median setup→confirm delta: n/a
- Price advantage of setup vs confirmation: n/a

Implication: the current evidence supports only “post-May21 regime-specific 24h continuation after setup-forming alert,” not “setup-forming gives better entry than confirmation.”


### Alt SHORT buckets

Current status: `OBSERVATION_ONLY`, mostly because locked confirmed-entry samples are too small or mixed/path-risky, not because all old alt-short memories were cleanly disproven.

Examples from locked definitions:

- ETH `LONGS_EXITING` SHORT: full confirmed rows are n=2 under NEUTRAL, plus isolated n=1 splits under BTC gates; not enough to confirm old `64.9%` memory.
- SOL `LONGS_EXITING` SHORT: full confirmed n=2 under `BTC_STRONG_ALT_NOT_FOLLOWING`; not enough to confirm old `79.2%` memory.
- ETH/SOL `FRESH_SHORTS` SHORT has some attractive 24h pockets post-May21, but split by BTC gate and episode mode remains low-n/mixed with path risk; classify as watch/observation, not promotion.

Old ETH/SOL SHORT + `LONGS_EXITING` memories still need source-tracing like the invalid `FRESH_SHORTS+LONG` stat before being trusted.

## full (2026-05-09T00:00:00Z → +∞)

### confirmed-alert — rolled asset × OI × BTC gate
Rows: 135; joined: 133; no_join: 2

| asset | OI bucket | BTC gate | n | class | 1h win/avg | 4h win/avg | 24h win/avg | med MFE4h | med MAE4h | first4h fav/adv | med MFE24h | med MAE24h | first24h fav/adv |
| --- | --- | --- | ---: | --- | --- | --- | --- | ---: | ---: | --- | ---: | ---: | --- |
| BTC | FRESH_SHORTS | NONE | 22 | TRADABLE_CANDIDATE_NEEDS_CROSS_WINDOW_CHECK | 68.2%/0.083% | 54.5%/0.199% | 76.2%/2.034% | 0.627% | -0.222% | 11/11 | 2.510% | -0.547% | 9/13 |
| BTC | NEUTRAL | NONE | 15 | WATCH_POSITIVE_LOW_OR_MEDIUM_N | 40.0%/0.021% | 46.7%/0.230% | 66.7%/0.477% | 0.441% | -0.136% | 5/10 | 0.927% | -0.585% | 5/10 |
| ETH | NEUTRAL | BTC_WEAK_PENALIZE_ALT_LONGS | 8 | BLOCKED_CURRENT_REGIME_CANDIDATE | 25.0%/-0.038% | 25.0%/-0.076% | 50.0%/0.564% | 0.270% | -0.123% | 6/2 | 0.834% | -2.189% | 4/4 |
| BTC | FRESH_LONGS | NONE | 7 | OBSERVATION_ONLY | 71.4%/0.192% | 85.7%/0.396% | 100.0%/1.615% | 0.515% | -0.054% | 2/5 | 2.369% | -0.139% | 0/7 |
| ETH | FRESH_SHORTS | BTC_WEAK_VETO_ALT_LONGS | 7 | OBSERVATION_ONLY | 28.6%/-0.079% | 71.4%/0.643% | 83.3%/2.101% | 0.775% | -0.564% | 2/5 | 3.006% | -0.574% | 2/5 |
| SOL | FRESH_SHORTS | BTC_STRONG_ALT_NOT_FOLLOWING | 7 | OBSERVATION_ONLY | 42.9%/-0.085% | 42.9%/-0.249% | 33.3%/-0.338% | 0.736% | -0.963% | 3/4 | 1.245% | -2.115% | 4/3 |
| SOL | FRESH_SHORTS | BTC_WEAK_VETO_ALT_LONGS | 7 | OBSERVATION_ONLY | 28.6%/-0.080% | 42.9%/-0.255% | 85.7%/1.598% | 0.507% | -0.529% | 5/2 | 2.811% | -1.036% | 2/5 |
| ETH | FRESH_SHORTS | BTC_STRONG_ALT_NOT_FOLLOWING | 6 | OBSERVATION_ONLY | 66.7%/-0.280% | 50.0%/-0.295% | 83.3%/1.454% | 0.492% | -0.227% | 3/3 | 2.243% | -0.726% | 1/5 |
| ETH | NEUTRAL | NEUTRAL | 5 | OBSERVATION_ONLY | 60.0%/0.089% | 40.0%/0.313% | 100.0%/2.232% | 0.416% | -0.370% | 2/3 | 3.353% | -0.649% | 1/4 |
| SOL | FRESH_SHORTS | NEUTRAL | 5 | OBSERVATION_ONLY | 60.0%/-0.766% | 0.0%/-1.307% | 50.0%/1.230% | 0.239% | -0.447% | 2/3 | 0.367% | -2.093% | 3/2 |
| ETH | FRESH_LONGS | NEUTRAL | 4 | OBSERVATION_ONLY | 25.0%/-0.297% | 25.0%/-0.445% | 75.0%/0.952% | 0.173% | -0.497% | 3/1 | 2.205% | -0.498% | 1/3 |
| SOL | SHORTS_COVERING | NEUTRAL | 4 | OBSERVATION_ONLY | 100.0%/0.306% | 50.0%/0.084% | 75.0%/2.033% | 0.762% | -0.243% | 3/1 | 3.039% | -0.389% | 1/3 |
| ETH | FRESH_SHORTS | NEUTRAL | 3 | OBSERVATION_ONLY | 0.0%/-0.056% | 33.3%/0.260% | 66.7%/-0.002% | 0.278% | -0.388% | 1/2 | 2.252% | -0.388% | 1/2 |
| SOL | NEUTRAL | NEUTRAL | 3 | OBSERVATION_ONLY | 100.0%/0.822% | 66.7%/0.760% | 66.7%/0.490% | 1.860% | -0.306% | 1/2 | 2.082% | -0.604% | 2/1 |
| BTC | LONGS_EXITING | NONE | 2 | OBSERVATION_ONLY | 100.0%/0.444% | 100.0%/0.329% | 100.0%/0.721% | 1.043% | 0.291% | 0/2 | 1.680% | -0.076% | 1/1 |
| ETH | FRESH_LONGS | BTC_STRONG_ALT_NOT_FOLLOWING | 2 | OBSERVATION_ONLY | 50.0%/0.175% | 100.0%/0.131% | 50.0%/0.813% | 0.377% | 0.196% | 2/0 | 3.519% | -0.028% | 1/1 |
| ETH | FRESH_LONGS | BTC_WEAK_VETO_ALT_LONGS | 2 | OBSERVATION_ONLY | 100.0%/0.192% | 50.0%/-0.120% | 50.0%/0.636% | 0.619% | -0.144% | 2/0 | 1.116% | -0.144% | 1/1 |
| ETH | FRESH_SHORTS | BTC_WEAK_PENALIZE_ALT_LONGS | 2 | OBSERVATION_ONLY | 50.0%/0.057% | 100.0%/0.581% | 100.0%/1.377% | 1.240% | -0.245% | 1/1 | 2.124% | -0.341% | 0/2 |
| ETH | LONGS_EXITING | NEUTRAL | 2 | OBSERVATION_ONLY | 100.0%/0.393% | 100.0%/0.272% | 50.0%/-0.008% | 0.984% | 0.349% | 1/1 | 2.355% | -0.747% | 1/1 |
| SOL | LONGS_EXITING | BTC_STRONG_ALT_NOT_FOLLOWING | 2 | OBSERVATION_ONLY | 100.0%/0.154% | 100.0%/0.606% | 100.0%/1.108% | 1.215% | -0.057% | 0/2 | 2.473% | -0.057% | 0/2 |
| SOL | NEUTRAL | BTC_STRONG_ALT_NOT_FOLLOWING | 2 | OBSERVATION_ONLY | 50.0%/0.087% | 100.0%/0.436% | 0.0%/-0.593% | 1.333% | 0.075% | 0/2 | 1.333% | -0.490% | 2/0 |
| SOL | NEUTRAL | BTC_WEAK_PENALIZE_ALT_LONGS | 2 | OBSERVATION_ONLY | 100.0%/0.771% | 100.0%/1.341% | 50.0%/1.933% | 2.680% | 0.455% | 1/1 | 6.155% | 0.455% | 1/1 |
| SOL | NEUTRAL | BTC_WEAK_VETO_ALT_LONGS | 2 | OBSERVATION_ONLY | 0.0%/-0.263% | 0.0%/-1.166% | 0.0%/-1.242% | 0.666% | -0.448% | 1/1 | 0.670% | -2.207% | 2/0 |
| SOL | SHORTS_COVERING | BTC_WEAK_VETO_ALT_LONGS | 2 | OBSERVATION_ONLY | 100.0%/0.409% | 100.0%/0.081% | 0.0%/-0.262% | 0.773% | -0.089% | 2/0 | 1.461% | -0.372% | 2/0 |
| BTC | NO_JOIN | NONE | 1 | OBSERVATION_ONLY | 0.0%/-0.088% | 0.0%/-0.081% | 0.0%/-0.646% | 0.063% | -0.181% | 1/0 | 0.063% | -0.977% | 1/0 |
| BTC | SHORTS_COVERING | NONE | 1 | OBSERVATION_ONLY | 100.0%/0.495% | 0.0%/-0.470% | 100.0%/0.704% | 0.520% | -0.631% | 1/0 | 0.798% | -0.954% | 0/1 |
| ETH | FRESH_LONGS | BTC_WEAK_PENALIZE_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/0.853% | 100.0%/0.057% | 100.0%/0.688% | 1.195% | -1.029% | 1/0 | 1.797% | -1.029% | 0/1 |
| ETH | LONGS_EXITING | BTC_STRONG_ALT_NOT_FOLLOWING | 1 | OBSERVATION_ONLY | 100.0%/0.236% | 0.0%/-0.332% | 0.0%/-0.852% | 0.344% | -0.457% | 1/0 | 0.411% | -1.144% | 1/0 |
| ETH | LONGS_EXITING | BTC_WEAK_PENALIZE_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/0.194% | 0.0%/-1.307% | 0.0%/-0.060% | 0.384% | -1.250% | 1/0 | 0.577% | -2.587% | 0/1 |
| ETH | NEUTRAL | BTC_STRONG_ALT_NOT_FOLLOWING | 1 | OBSERVATION_ONLY | 0.0%/-0.112% | 0.0%/-0.055% | 100.0%/0.883% | 0.361% | -0.163% | 0/1 | 2.029% | -1.663% | 0/1 |
| ETH | SHORTS_COVERING | BTC_WEAK_VETO_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/0.343% | 100.0%/0.196% | 100.0%/0.349% | 0.759% | -0.193% | 1/0 | 1.650% | -0.286% | 1/0 |
| ETH | SHORTS_COVERING | NEUTRAL | 1 | OBSERVATION_ONLY | 0.0%/-0.414% | 0.0%/-0.466% | 0.0%/-1.292% | -0.333% | -0.714% | 0/1 | 0.004% | -1.302% | 1/0 |
| SOL | FRESH_LONGS | BTC_WEAK_PENALIZE_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/0.512% | 100.0%/3.233% | 100.0%/3.982% | 3.149% | 0.026% | 0/1 | 5.153% | 0.026% | 0/1 |
| SOL | NO_JOIN | BTC_STRONG_ALT_NOT_FOLLOWING | 1 | OBSERVATION_ONLY | 0.0%/-1.033% | 0.0%/-1.076% | 0.0%/-0.168% | -0.687% | -1.606% | 0/1 | -0.081% | -1.606% | 0/1 |
| SOL | SHORTS_COVERING | BTC_STRONG_ALT_NOT_FOLLOWING | 1 | OBSERVATION_ONLY | 100.0%/0.304% | 100.0%/0.304% | 100.0%/2.710% | 0.579% | -0.040% | 0/1 | 3.501% | -0.395% | 0/1 |
| SOL | SHORTS_COVERING | BTC_WEAK_PENALIZE_ALT_LONGS | 1 | OBSERVATION_ONLY | 0.0%/-0.237% | 0.0%/-0.215% | 0.0%/-2.118% | 0.017% | -0.490% | 1/0 | 1.051% | -2.966% | 1/0 |

### confirmed-alert — asset × OI × shadow × BTC gate

| asset | OI bucket | shadow | BTC gate | n | class | 4h win/avg | 24h win/avg | med MAE24h |
| --- | --- | --- | --- | ---: | --- | --- | --- | ---: |
| BTC | FRESH_SHORTS | SHADOW_SETUP_FORMING | NONE | 21 | TRADABLE_CANDIDATE_NEEDS_CROSS_WINDOW_CHECK | 52.4%/0.196% | 75.0%/1.892% | -0.736% |
| BTC | NEUTRAL | SHADOW_SETUP_FORMING | NONE | 13 | WATCH_POSITIVE_LOW_OR_MEDIUM_N | 46.2%/0.216% | 61.5%/0.301% | -0.607% |
| ETH | NEUTRAL | SHADOW_SETUP_FORMING | BTC_WEAK_PENALIZE_ALT_LONGS | 7 | OBSERVATION_ONLY | 14.3%/-0.238% | 42.9%/0.148% | -2.202% |
| SOL | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_STRONG_ALT_NOT_FOLLOWING | 7 | OBSERVATION_ONLY | 42.9%/-0.249% | 33.3%/-0.338% | -2.115% |
| ETH | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_STRONG_ALT_NOT_FOLLOWING | 6 | OBSERVATION_ONLY | 50.0%/-0.295% | 83.3%/1.454% | -0.726% |
| SOL | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_WEAK_VETO_ALT_LONGS | 6 | OBSERVATION_ONLY | 50.0%/0.254% | 83.3%/1.561% | -0.722% |
| ETH | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_WEAK_VETO_ALT_LONGS | 5 | OBSERVATION_ONLY | 80.0%/0.776% | 80.0%/2.108% | -0.563% |
| BTC | FRESH_LONGS | SHADOW_BLOCKED | NONE | 4 | OBSERVATION_ONLY | 75.0%/0.251% | 100.0%/2.120% | -0.139% |
| ETH | FRESH_LONGS | SHADOW_SETUP_FORMING | NEUTRAL | 4 | OBSERVATION_ONLY | 25.0%/-0.445% | 75.0%/0.952% | -0.498% |
| ETH | NEUTRAL | SHADOW_SETUP_FORMING | NEUTRAL | 4 | OBSERVATION_ONLY | 50.0%/0.502% | 100.0%/2.397% | 0.220% |
| SOL | FRESH_SHORTS | SHADOW_SETUP_FORMING | NEUTRAL | 3 | OBSERVATION_ONLY | 0.0%/-1.521% | 0.0%/-1.770% | -3.389% |
| SOL | NEUTRAL | SHADOW_NO_SETUP | NEUTRAL | 3 | OBSERVATION_ONLY | 66.7%/0.760% | 66.7%/0.490% | -0.604% |
| BTC | FRESH_LONGS | SHADOW_SETUP_FORMING | NONE | 2 | OBSERVATION_ONLY | 100.0%/0.303% | 100.0%/1.210% | 0.099% |
| BTC | LONGS_EXITING | SHADOW_SETUP_FORMING | NONE | 2 | OBSERVATION_ONLY | 100.0%/0.329% | 100.0%/0.721% | -0.076% |
| ETH | FRESH_LONGS | SHADOW_CONFIRMED | BTC_STRONG_ALT_NOT_FOLLOWING | 2 | OBSERVATION_ONLY | 100.0%/0.131% | 50.0%/0.813% | -0.028% |
| ETH | FRESH_LONGS | SHADOW_SETUP_FORMING | BTC_WEAK_VETO_ALT_LONGS | 2 | OBSERVATION_ONLY | 50.0%/-0.120% | 50.0%/0.636% | -0.144% |
| ETH | FRESH_SHORTS | SHADOW_NO_SETUP | BTC_WEAK_VETO_ALT_LONGS | 2 | OBSERVATION_ONLY | 50.0%/0.309% | 100.0%/2.065% | -0.574% |
| ETH | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_WEAK_PENALIZE_ALT_LONGS | 2 | OBSERVATION_ONLY | 100.0%/0.581% | 100.0%/1.377% | -0.341% |
| ETH | FRESH_SHORTS | SHADOW_SETUP_FORMING | NEUTRAL | 2 | OBSERVATION_ONLY | 0.0%/-0.174% | 50.0%/-0.176% | -0.388% |
| ETH | LONGS_EXITING | SHADOW_SETUP_FORMING | NEUTRAL | 2 | OBSERVATION_ONLY | 100.0%/0.272% | 50.0%/-0.008% | -0.747% |
| SOL | FRESH_SHORTS | SHADOW_NO_SETUP | NEUTRAL | 2 | OBSERVATION_ONLY | 0.0%/-0.985% | 100.0%/4.230% | -1.923% |
| SOL | LONGS_EXITING | SHADOW_SETUP_FORMING | BTC_STRONG_ALT_NOT_FOLLOWING | 2 | OBSERVATION_ONLY | 100.0%/0.606% | 100.0%/1.108% | -0.057% |
| SOL | NEUTRAL | SHADOW_NO_SETUP | BTC_STRONG_ALT_NOT_FOLLOWING | 2 | OBSERVATION_ONLY | 100.0%/0.436% | 0.0%/-0.593% | -0.490% |
| SOL | NEUTRAL | SHADOW_SETUP_FORMING | BTC_WEAK_PENALIZE_ALT_LONGS | 2 | OBSERVATION_ONLY | 100.0%/1.341% | 50.0%/1.933% | 0.455% |
| SOL | SHORTS_COVERING | SHADOW_NO_SETUP | NEUTRAL | 2 | OBSERVATION_ONLY | 50.0%/0.325% | 50.0%/1.202% | -0.109% |
| SOL | SHORTS_COVERING | SHADOW_SETUP_FORMING | NEUTRAL | 2 | OBSERVATION_ONLY | 50.0%/-0.157% | 100.0%/2.864% | -0.389% |
| BTC | FRESH_LONGS | SHADOW_CONFIRMED | NONE | 1 | OBSERVATION_ONLY | 100.0%/1.164% | 100.0%/0.407% | 0.131% |
| BTC | FRESH_SHORTS | SHADOW_NO_SETUP | NONE | 1 | OBSERVATION_ONLY | 100.0%/0.252% | 100.0%/4.875% | -0.491% |
| BTC | NEUTRAL | SHADOW_BLOCKED | NONE | 1 | OBSERVATION_ONLY | 100.0%/0.728% | 100.0%/1.488% | 0.030% |
| BTC | NEUTRAL | SHADOW_NO_SETUP | NONE | 1 | OBSERVATION_ONLY | 0.0%/-0.087% | 100.0%/1.757% | -0.468% |
| BTC | NO_JOIN | NO_JOIN | NONE | 1 | OBSERVATION_ONLY | 0.0%/-0.081% | 0.0%/-0.646% | -0.977% |
| BTC | SHORTS_COVERING | SHADOW_SETUP_FORMING | NONE | 1 | OBSERVATION_ONLY | 0.0%/-0.470% | 100.0%/0.704% | -0.954% |
| ETH | FRESH_LONGS | SHADOW_CONFIRMED | BTC_WEAK_PENALIZE_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/0.057% | 100.0%/0.688% | -1.029% |
| ETH | FRESH_SHORTS | SHADOW_BLOCKED | NEUTRAL | 1 | OBSERVATION_ONLY | 100.0%/1.128% | 100.0%/0.348% | -0.085% |
| ETH | LONGS_EXITING | SHADOW_SETUP_FORMING | BTC_STRONG_ALT_NOT_FOLLOWING | 1 | OBSERVATION_ONLY | 0.0%/-0.332% | 0.0%/-0.852% | -1.144% |
| ETH | LONGS_EXITING | SHADOW_SETUP_FORMING | BTC_WEAK_PENALIZE_ALT_LONGS | 1 | OBSERVATION_ONLY | 0.0%/-1.307% | 0.0%/-0.060% | -2.587% |
| ETH | NEUTRAL | SHADOW_NO_SETUP | BTC_WEAK_PENALIZE_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/1.061% | 100.0%/3.477% | -0.302% |
| ETH | NEUTRAL | SHADOW_NO_SETUP | NEUTRAL | 1 | OBSERVATION_ONLY | 0.0%/-0.443% | 100.0%/1.570% | -0.803% |
| ETH | NEUTRAL | SHADOW_SETUP_FORMING | BTC_STRONG_ALT_NOT_FOLLOWING | 1 | OBSERVATION_ONLY | 0.0%/-0.055% | 100.0%/0.883% | -1.663% |
| ETH | SHORTS_COVERING | SHADOW_NO_SETUP | BTC_WEAK_VETO_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/0.196% | 100.0%/0.349% | -0.286% |
| ETH | SHORTS_COVERING | SHADOW_SETUP_FORMING | NEUTRAL | 1 | OBSERVATION_ONLY | 0.0%/-0.466% | 0.0%/-1.292% | -1.302% |
| SOL | FRESH_LONGS | SHADOW_SETUP_FORMING | BTC_WEAK_PENALIZE_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/3.233% | 100.0%/3.982% | 0.026% |
| SOL | FRESH_SHORTS | SHADOW_NO_SETUP | BTC_WEAK_VETO_ALT_LONGS | 1 | OBSERVATION_ONLY | 0.0%/-3.306% | 100.0%/1.821% | -3.787% |
| SOL | NEUTRAL | SHADOW_NO_SETUP | BTC_WEAK_VETO_ALT_LONGS | 1 | OBSERVATION_ONLY | 0.0%/-2.222% | 0.0%/-1.173% | -2.587% |
| SOL | NEUTRAL | SHADOW_SETUP_FORMING | BTC_WEAK_VETO_ALT_LONGS | 1 | OBSERVATION_ONLY | 0.0%/-0.111% | 0.0%/-1.310% | -2.207% |
| SOL | NO_JOIN | NO_JOIN | BTC_STRONG_ALT_NOT_FOLLOWING | 1 | OBSERVATION_ONLY | 0.0%/-1.076% | 0.0%/-0.168% | -1.606% |
| SOL | SHORTS_COVERING | SHADOW_NO_SETUP | BTC_WEAK_PENALIZE_ALT_LONGS | 1 | OBSERVATION_ONLY | 0.0%/-0.215% | 0.0%/-2.118% | -2.966% |
| SOL | SHORTS_COVERING | SHADOW_NO_SETUP | BTC_WEAK_VETO_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/0.006% | 0.0%/-0.171% | -0.372% |
| SOL | SHORTS_COVERING | SHADOW_SETUP_FORMING | BTC_STRONG_ALT_NOT_FOLLOWING | 1 | OBSERVATION_ONLY | 100.0%/0.304% | 100.0%/2.710% | -0.395% |
| SOL | SHORTS_COVERING | SHADOW_SETUP_FORMING | BTC_WEAK_VETO_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/0.156% | 0.0%/-0.352% | -1.404% |

### episode — rolled asset × OI × BTC gate
Rows: 81; joined: 79; no_join: 2

| asset | OI bucket | BTC gate | n | class | 1h win/avg | 4h win/avg | 24h win/avg | med MFE4h | med MAE4h | first4h fav/adv | med MFE24h | med MAE24h | first24h fav/adv |
| --- | --- | --- | ---: | --- | --- | --- | --- | ---: | ---: | --- | ---: | ---: | --- |
| BTC | FRESH_SHORTS | NONE | 15 | WATCH_POSITIVE_LOW_OR_MEDIUM_N | 80.0%/0.126% | 60.0%/0.201% | 71.4%/1.632% | 0.627% | -0.183% | 6/9 | 1.457% | -0.759% | 8/7 |
| BTC | NEUTRAL | NONE | 7 | OBSERVATION_ONLY | 14.3%/-0.065% | 42.9%/-0.047% | 42.9%/-0.472% | 0.454% | -0.136% | 3/4 | 0.457% | -1.064% | 5/2 |
| ETH | FRESH_SHORTS | BTC_WEAK_VETO_ALT_LONGS | 6 | OBSERVATION_ONLY | 16.7%/-0.190% | 66.7%/0.449% | 80.0%/2.425% | 0.775% | -0.564% | 2/4 | 4.387% | -0.574% | 2/4 |
| SOL | FRESH_SHORTS | BTC_STRONG_ALT_NOT_FOLLOWING | 6 | OBSERVATION_ONLY | 50.0%/0.098% | 33.3%/-0.362% | 33.3%/-0.338% | 0.736% | -0.803% | 3/3 | 2.469% | -1.809% | 4/2 |
| ETH | NEUTRAL | BTC_WEAK_PENALIZE_ALT_LONGS | 5 | OBSERVATION_ONLY | 20.0%/-0.069% | 40.0%/-0.090% | 80.0%/1.049% | 0.284% | -0.302% | 3/2 | 2.624% | -1.252% | 1/4 |
| SOL | FRESH_SHORTS | BTC_WEAK_VETO_ALT_LONGS | 4 | OBSERVATION_ONLY | 25.0%/-0.201% | 75.0%/-0.082% | 100.0%/2.539% | 0.874% | -0.066% | 2/2 | 6.303% | -0.270% | 1/3 |
| SOL | SHORTS_COVERING | NEUTRAL | 4 | OBSERVATION_ONLY | 100.0%/0.306% | 50.0%/0.084% | 75.0%/2.033% | 0.762% | -0.243% | 3/1 | 3.039% | -0.389% | 1/3 |
| BTC | FRESH_LONGS | NONE | 3 | OBSERVATION_ONLY | 66.7%/0.143% | 100.0%/0.248% | 100.0%/1.308% | 0.515% | -0.054% | 1/2 | 1.361% | -0.139% | 0/3 |
| ETH | FRESH_SHORTS | BTC_STRONG_ALT_NOT_FOLLOWING | 3 | OBSERVATION_ONLY | 33.3%/-0.660% | 33.3%/-0.949% | 66.7%/1.608% | 0.418% | -1.504% | 2/1 | 2.243% | -2.028% | 1/2 |
| SOL | FRESH_SHORTS | NEUTRAL | 3 | OBSERVATION_ONLY | 66.7%/-0.678% | 0.0%/-1.608% | 50.0%/2.195% | 0.367% | -0.413% | 2/1 | 0.367% | -2.093% | 2/1 |
| ETH | FRESH_LONGS | NEUTRAL | 2 | OBSERVATION_ONLY | 50.0%/-0.068% | 50.0%/-0.460% | 100.0%/1.146% | 0.753% | -0.221% | 2/0 | 2.205% | -0.221% | 0/2 |
| ETH | FRESH_SHORTS | NEUTRAL | 2 | OBSERVATION_ONLY | 0.0%/-0.062% | 50.0%/0.530% | 100.0%/0.421% | 1.151% | -0.085% | 1/1 | 2.439% | -0.085% | 0/2 |
| SOL | LONGS_EXITING | BTC_STRONG_ALT_NOT_FOLLOWING | 2 | OBSERVATION_ONLY | 100.0%/0.154% | 100.0%/0.606% | 100.0%/1.108% | 1.215% | -0.057% | 0/2 | 2.473% | -0.057% | 0/2 |
| BTC | LONGS_EXITING | NONE | 1 | OBSERVATION_ONLY | 100.0%/0.054% | 100.0%/0.019% | 100.0%/1.041% | 0.196% | -0.073% | 0/1 | 1.680% | -0.076% | 0/1 |
| BTC | NO_JOIN | NONE | 1 | OBSERVATION_ONLY | 0.0%/-0.088% | 0.0%/-0.081% | 0.0%/-0.646% | 0.063% | -0.181% | 1/0 | 0.063% | -0.977% | 1/0 |
| BTC | SHORTS_COVERING | NONE | 1 | OBSERVATION_ONLY | 100.0%/0.495% | 0.0%/-0.470% | 100.0%/0.704% | 0.520% | -0.631% | 1/0 | 0.798% | -0.954% | 0/1 |
| ETH | FRESH_LONGS | BTC_WEAK_PENALIZE_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/0.853% | 100.0%/0.057% | 100.0%/0.688% | 1.195% | -1.029% | 1/0 | 1.797% | -1.029% | 0/1 |
| ETH | FRESH_LONGS | BTC_WEAK_VETO_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/0.272% | 0.0%/-0.535% | 0.0%/-0.233% | 0.397% | -0.797% | 1/0 | 1.093% | -0.854% | 1/0 |
| ETH | FRESH_SHORTS | BTC_WEAK_PENALIZE_ALT_LONGS | 1 | OBSERVATION_ONLY | 0.0%/-0.341% | 100.0%/0.991% | 100.0%/0.852% | 1.240% | -0.341% | 0/1 | 1.778% | -0.341% | 0/1 |
| ETH | LONGS_EXITING | BTC_STRONG_ALT_NOT_FOLLOWING | 1 | OBSERVATION_ONLY | 100.0%/0.236% | 0.0%/-0.332% | 0.0%/-0.852% | 0.344% | -0.457% | 1/0 | 0.411% | -1.144% | 1/0 |
| ETH | LONGS_EXITING | NEUTRAL | 1 | OBSERVATION_ONLY | 100.0%/0.753% | 100.0%/0.412% | 0.0%/-0.090% | 0.984% | 0.349% | 1/0 | 2.355% | -1.127% | 0/1 |
| ETH | NEUTRAL | NEUTRAL | 1 | OBSERVATION_ONLY | 100.0%/0.592% | 100.0%/2.030% | 100.0%/2.197% | 2.238% | 0.220% | 0/1 | 3.354% | 0.220% | 0/1 |
| ETH | SHORTS_COVERING | BTC_WEAK_VETO_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/0.343% | 100.0%/0.196% | 100.0%/0.349% | 0.759% | -0.193% | 1/0 | 1.650% | -0.286% | 1/0 |
| ETH | SHORTS_COVERING | NEUTRAL | 1 | OBSERVATION_ONLY | 0.0%/-0.414% | 0.0%/-0.466% | 0.0%/-1.292% | -0.333% | -0.714% | 0/1 | 0.004% | -1.302% | 1/0 |
| SOL | FRESH_LONGS | BTC_WEAK_PENALIZE_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/0.512% | 100.0%/3.233% | 100.0%/3.982% | 3.149% | 0.026% | 0/1 | 5.153% | 0.026% | 0/1 |
| SOL | NEUTRAL | BTC_STRONG_ALT_NOT_FOLLOWING | 1 | OBSERVATION_ONLY | 100.0%/0.202% | 100.0%/0.548% | 0.0%/-0.029% | 0.767% | 0.075% | 0/1 | 1.206% | -0.490% | 1/0 |
| SOL | NEUTRAL | BTC_WEAK_PENALIZE_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/0.506% | 100.0%/0.112% | 0.0%/-1.797% | 0.581% | -0.069% | 1/0 | 0.581% | -3.172% | 1/0 |
| SOL | NEUTRAL | BTC_WEAK_VETO_ALT_LONGS | 1 | OBSERVATION_ONLY | 0.0%/-0.242% | 0.0%/-2.222% | 0.0%/-1.173% | 0.666% | -1.974% | 1/0 | 0.666% | -2.587% | 1/0 |
| SOL | NEUTRAL | NEUTRAL | 1 | OBSERVATION_ONLY | 100.0%/1.261% | 100.0%/0.991% | 100.0%/1.074% | 1.860% | 0.158% | 0/1 | 2.082% | -0.604% | 1/0 |
| SOL | NO_JOIN | BTC_STRONG_ALT_NOT_FOLLOWING | 1 | OBSERVATION_ONLY | 0.0%/-1.033% | 0.0%/-1.076% | 0.0%/-0.168% | -0.687% | -1.606% | 0/1 | -0.081% | -1.606% | 0/1 |
| SOL | SHORTS_COVERING | BTC_WEAK_PENALIZE_ALT_LONGS | 1 | OBSERVATION_ONLY | 0.0%/-0.237% | 0.0%/-0.215% | 0.0%/-2.118% | 0.017% | -0.490% | 1/0 | 1.051% | -2.966% | 1/0 |
| SOL | SHORTS_COVERING | BTC_WEAK_VETO_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/0.364% | 100.0%/0.156% | 0.0%/-0.352% | 0.375% | -0.549% | 1/0 | 1.461% | -1.404% | 1/0 |

### episode — asset × OI × shadow × BTC gate

| asset | OI bucket | shadow | BTC gate | n | class | 4h win/avg | 24h win/avg | med MAE24h |
| --- | --- | --- | --- | ---: | --- | --- | --- | ---: |
| BTC | FRESH_SHORTS | SHADOW_SETUP_FORMING | NONE | 15 | WATCH_POSITIVE_LOW_OR_MEDIUM_N | 60.0%/0.201% | 71.4%/1.632% | -0.759% |
| BTC | NEUTRAL | SHADOW_SETUP_FORMING | NONE | 7 | OBSERVATION_ONLY | 42.9%/-0.047% | 42.9%/-0.472% | -1.064% |
| SOL | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_STRONG_ALT_NOT_FOLLOWING | 6 | OBSERVATION_ONLY | 33.3%/-0.362% | 33.3%/-0.338% | -1.809% |
| ETH | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_WEAK_VETO_ALT_LONGS | 4 | OBSERVATION_ONLY | 75.0%/0.520% | 75.0%/2.515% | -0.563% |
| ETH | NEUTRAL | SHADOW_SETUP_FORMING | BTC_WEAK_PENALIZE_ALT_LONGS | 4 | OBSERVATION_ONLY | 25.0%/-0.377% | 75.0%/0.442% | -1.252% |
| ETH | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_STRONG_ALT_NOT_FOLLOWING | 3 | OBSERVATION_ONLY | 33.3%/-0.949% | 66.7%/1.608% | -2.028% |
| SOL | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_WEAK_VETO_ALT_LONGS | 3 | OBSERVATION_ONLY | 100.0%/0.993% | 100.0%/2.778% | -0.270% |
| BTC | FRESH_LONGS | SHADOW_SETUP_FORMING | NONE | 2 | OBSERVATION_ONLY | 100.0%/0.303% | 100.0%/1.210% | 0.099% |
| ETH | FRESH_LONGS | SHADOW_SETUP_FORMING | NEUTRAL | 2 | OBSERVATION_ONLY | 50.0%/-0.460% | 100.0%/1.146% | -0.221% |
| ETH | FRESH_SHORTS | SHADOW_NO_SETUP | BTC_WEAK_VETO_ALT_LONGS | 2 | OBSERVATION_ONLY | 50.0%/0.309% | 100.0%/2.065% | -0.574% |
| SOL | FRESH_SHORTS | SHADOW_SETUP_FORMING | NEUTRAL | 2 | OBSERVATION_ONLY | 0.0%/-2.213% | 0.0%/-0.890% | -1.274% |
| SOL | LONGS_EXITING | SHADOW_SETUP_FORMING | BTC_STRONG_ALT_NOT_FOLLOWING | 2 | OBSERVATION_ONLY | 100.0%/0.606% | 100.0%/1.108% | -0.057% |
| SOL | SHORTS_COVERING | SHADOW_NO_SETUP | NEUTRAL | 2 | OBSERVATION_ONLY | 50.0%/0.325% | 50.0%/1.202% | -0.109% |
| SOL | SHORTS_COVERING | SHADOW_SETUP_FORMING | NEUTRAL | 2 | OBSERVATION_ONLY | 50.0%/-0.157% | 100.0%/2.864% | -0.389% |
| BTC | FRESH_LONGS | SHADOW_BLOCKED | NONE | 1 | OBSERVATION_ONLY | 100.0%/0.139% | 100.0%/1.505% | -0.139% |
| BTC | LONGS_EXITING | SHADOW_SETUP_FORMING | NONE | 1 | OBSERVATION_ONLY | 100.0%/0.019% | 100.0%/1.041% | -0.076% |
| BTC | NO_JOIN | NO_JOIN | NONE | 1 | OBSERVATION_ONLY | 0.0%/-0.081% | 0.0%/-0.646% | -0.977% |
| BTC | SHORTS_COVERING | SHADOW_SETUP_FORMING | NONE | 1 | OBSERVATION_ONLY | 0.0%/-0.470% | 100.0%/0.704% | -0.954% |
| ETH | FRESH_LONGS | SHADOW_CONFIRMED | BTC_WEAK_PENALIZE_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/0.057% | 100.0%/0.688% | -1.029% |
| ETH | FRESH_LONGS | SHADOW_SETUP_FORMING | BTC_WEAK_VETO_ALT_LONGS | 1 | OBSERVATION_ONLY | 0.0%/-0.535% | 0.0%/-0.233% | -0.854% |
| ETH | FRESH_SHORTS | SHADOW_BLOCKED | NEUTRAL | 1 | OBSERVATION_ONLY | 100.0%/1.128% | 100.0%/0.348% | -0.085% |
| ETH | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_WEAK_PENALIZE_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/0.991% | 100.0%/0.852% | -0.341% |
| ETH | FRESH_SHORTS | SHADOW_SETUP_FORMING | NEUTRAL | 1 | OBSERVATION_ONLY | 0.0%/-0.069% | 100.0%/0.494% | -0.388% |
| ETH | LONGS_EXITING | SHADOW_SETUP_FORMING | BTC_STRONG_ALT_NOT_FOLLOWING | 1 | OBSERVATION_ONLY | 0.0%/-0.332% | 0.0%/-0.852% | -1.144% |
| ETH | LONGS_EXITING | SHADOW_SETUP_FORMING | NEUTRAL | 1 | OBSERVATION_ONLY | 100.0%/0.412% | 0.0%/-0.090% | -1.127% |
| ETH | NEUTRAL | SHADOW_NO_SETUP | BTC_WEAK_PENALIZE_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/1.061% | 100.0%/3.477% | -0.302% |
| ETH | NEUTRAL | SHADOW_SETUP_FORMING | NEUTRAL | 1 | OBSERVATION_ONLY | 100.0%/2.030% | 100.0%/2.197% | 0.220% |
| ETH | SHORTS_COVERING | SHADOW_NO_SETUP | BTC_WEAK_VETO_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/0.196% | 100.0%/0.349% | -0.286% |
| ETH | SHORTS_COVERING | SHADOW_SETUP_FORMING | NEUTRAL | 1 | OBSERVATION_ONLY | 0.0%/-0.466% | 0.0%/-1.292% | -1.302% |
| SOL | FRESH_LONGS | SHADOW_SETUP_FORMING | BTC_WEAK_PENALIZE_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/3.233% | 100.0%/3.982% | 0.026% |
| SOL | FRESH_SHORTS | SHADOW_NO_SETUP | BTC_WEAK_VETO_ALT_LONGS | 1 | OBSERVATION_ONLY | 0.0%/-3.306% | 100.0%/1.821% | -3.787% |
| SOL | FRESH_SHORTS | SHADOW_NO_SETUP | NEUTRAL | 1 | OBSERVATION_ONLY | 0.0%/-0.398% | 100.0%/5.281% | -2.093% |
| SOL | NEUTRAL | SHADOW_NO_SETUP | BTC_STRONG_ALT_NOT_FOLLOWING | 1 | OBSERVATION_ONLY | 100.0%/0.548% | 0.0%/-0.029% | -0.490% |
| SOL | NEUTRAL | SHADOW_NO_SETUP | BTC_WEAK_VETO_ALT_LONGS | 1 | OBSERVATION_ONLY | 0.0%/-2.222% | 0.0%/-1.173% | -2.587% |
| SOL | NEUTRAL | SHADOW_NO_SETUP | NEUTRAL | 1 | OBSERVATION_ONLY | 100.0%/0.991% | 100.0%/1.074% | -0.604% |
| SOL | NEUTRAL | SHADOW_SETUP_FORMING | BTC_WEAK_PENALIZE_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/0.112% | 0.0%/-1.797% | -3.172% |
| SOL | NO_JOIN | NO_JOIN | BTC_STRONG_ALT_NOT_FOLLOWING | 1 | OBSERVATION_ONLY | 0.0%/-1.076% | 0.0%/-0.168% | -1.606% |
| SOL | SHORTS_COVERING | SHADOW_NO_SETUP | BTC_WEAK_PENALIZE_ALT_LONGS | 1 | OBSERVATION_ONLY | 0.0%/-0.215% | 0.0%/-2.118% | -2.966% |
| SOL | SHORTS_COVERING | SHADOW_SETUP_FORMING | BTC_WEAK_VETO_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/0.156% | 0.0%/-0.352% | -1.404% |

## postMay21 (2026-05-21T00:00:00Z → +∞)

### confirmed-alert — rolled asset × OI × BTC gate
Rows: 60; joined: 60; no_join: 0

| asset | OI bucket | BTC gate | n | class | 1h win/avg | 4h win/avg | 24h win/avg | med MFE4h | med MAE4h | first4h fav/adv | med MFE24h | med MAE24h | first24h fav/adv |
| --- | --- | --- | ---: | --- | --- | --- | --- | ---: | ---: | --- | ---: | ---: | --- |
| BTC | FRESH_SHORTS | NONE | 19 | WATCH_POSITIVE_LOW_OR_MEDIUM_N | 63.2%/0.075% | 52.6%/0.228% | 83.3%/2.431% | 0.680% | -0.405% | 9/10 | 2.886% | -0.547% | 6/13 |
| ETH | FRESH_SHORTS | BTC_WEAK_VETO_ALT_LONGS | 7 | OBSERVATION_ONLY | 28.6%/-0.079% | 71.4%/0.643% | 83.3%/2.101% | 0.775% | -0.564% | 2/5 | 3.006% | -0.574% | 2/5 |
| SOL | FRESH_SHORTS | BTC_STRONG_ALT_NOT_FOLLOWING | 7 | OBSERVATION_ONLY | 42.9%/-0.085% | 42.9%/-0.249% | 33.3%/-0.338% | 0.736% | -0.963% | 3/4 | 1.245% | -2.115% | 4/3 |
| SOL | FRESH_SHORTS | BTC_WEAK_VETO_ALT_LONGS | 7 | OBSERVATION_ONLY | 28.6%/-0.080% | 42.9%/-0.255% | 85.7%/1.598% | 0.507% | -0.529% | 5/2 | 2.811% | -1.036% | 2/5 |
| ETH | FRESH_SHORTS | BTC_STRONG_ALT_NOT_FOLLOWING | 6 | OBSERVATION_ONLY | 66.7%/-0.280% | 50.0%/-0.295% | 83.3%/1.454% | 0.492% | -0.227% | 3/3 | 2.243% | -0.726% | 1/5 |
| BTC | FRESH_LONGS | NONE | 4 | OBSERVATION_ONLY | 75.0%/0.143% | 75.0%/0.251% | 100.0%/2.120% | 0.515% | -0.054% | 2/2 | 3.061% | -0.139% | 0/4 |
| SOL | FRESH_SHORTS | NEUTRAL | 3 | OBSERVATION_ONLY | 33.3%/-1.378% | 0.0%/-2.010% | 100.0%/4.230% | 0.239% | -1.923% | 1/2 | 7.092% | -2.093% | 1/2 |
| SOL | SHORTS_COVERING | NEUTRAL | 2 | OBSERVATION_ONLY | 100.0%/0.183% | 50.0%/0.170% | 100.0%/2.847% | 0.840% | 0.029% | 1/1 | 3.777% | -0.109% | 0/2 |
| ETH | FRESH_LONGS | BTC_WEAK_VETO_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/0.112% | 100.0%/0.295% | 100.0%/1.505% | 0.619% | -0.144% | 1/0 | 1.116% | -0.144% | 0/1 |
| ETH | FRESH_SHORTS | NEUTRAL | 1 | OBSERVATION_ONLY | 0.0%/-0.111% | 0.0%/-0.069% | 100.0%/0.494% | 0.278% | -0.388% | 1/0 | 2.439% | -0.388% | 0/1 |
| ETH | SHORTS_COVERING | BTC_WEAK_VETO_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/0.343% | 100.0%/0.196% | 100.0%/0.349% | 0.759% | -0.193% | 1/0 | 1.650% | -0.286% | 1/0 |
| SOL | SHORTS_COVERING | BTC_STRONG_ALT_NOT_FOLLOWING | 1 | OBSERVATION_ONLY | 100.0%/0.304% | 100.0%/0.304% | 100.0%/2.710% | 0.579% | -0.040% | 0/1 | 3.501% | -0.395% | 0/1 |
| SOL | SHORTS_COVERING | BTC_WEAK_VETO_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/0.364% | 100.0%/0.156% | 0.0%/-0.352% | 0.375% | -0.549% | 1/0 | 1.461% | -1.404% | 1/0 |

### confirmed-alert — asset × OI × shadow × BTC gate

| asset | OI bucket | shadow | BTC gate | n | class | 4h win/avg | 24h win/avg | med MAE24h |
| --- | --- | --- | --- | ---: | --- | --- | --- | ---: |
| BTC | FRESH_SHORTS | SHADOW_SETUP_FORMING | NONE | 18 | WATCH_POSITIVE_LOW_OR_MEDIUM_N | 50.0%/0.226% | 82.4%/2.287% | -0.547% |
| SOL | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_STRONG_ALT_NOT_FOLLOWING | 7 | OBSERVATION_ONLY | 42.9%/-0.249% | 33.3%/-0.338% | -2.115% |
| ETH | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_STRONG_ALT_NOT_FOLLOWING | 6 | OBSERVATION_ONLY | 50.0%/-0.295% | 83.3%/1.454% | -0.726% |
| SOL | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_WEAK_VETO_ALT_LONGS | 6 | OBSERVATION_ONLY | 50.0%/0.254% | 83.3%/1.561% | -0.722% |
| ETH | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_WEAK_VETO_ALT_LONGS | 5 | OBSERVATION_ONLY | 80.0%/0.776% | 80.0%/2.108% | -0.563% |
| BTC | FRESH_LONGS | SHADOW_BLOCKED | NONE | 4 | OBSERVATION_ONLY | 75.0%/0.251% | 100.0%/2.120% | -0.139% |
| ETH | FRESH_SHORTS | SHADOW_NO_SETUP | BTC_WEAK_VETO_ALT_LONGS | 2 | OBSERVATION_ONLY | 50.0%/0.309% | 100.0%/2.065% | -0.574% |
| SOL | FRESH_SHORTS | SHADOW_NO_SETUP | NEUTRAL | 2 | OBSERVATION_ONLY | 0.0%/-0.985% | 100.0%/4.230% | -1.923% |
| BTC | FRESH_SHORTS | SHADOW_NO_SETUP | NONE | 1 | OBSERVATION_ONLY | 100.0%/0.252% | 100.0%/4.875% | -0.491% |
| ETH | FRESH_LONGS | SHADOW_SETUP_FORMING | BTC_WEAK_VETO_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/0.295% | 100.0%/1.505% | -0.144% |
| ETH | FRESH_SHORTS | SHADOW_SETUP_FORMING | NEUTRAL | 1 | OBSERVATION_ONLY | 0.0%/-0.069% | 100.0%/0.494% | -0.388% |
| ETH | SHORTS_COVERING | SHADOW_NO_SETUP | BTC_WEAK_VETO_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/0.196% | 100.0%/0.349% | -0.286% |
| SOL | FRESH_SHORTS | SHADOW_NO_SETUP | BTC_WEAK_VETO_ALT_LONGS | 1 | OBSERVATION_ONLY | 0.0%/-3.306% | 100.0%/1.821% | -3.787% |
| SOL | FRESH_SHORTS | SHADOW_SETUP_FORMING | NEUTRAL | 1 | OBSERVATION_ONLY | 0.0%/-4.060% | n/a/n/a% | -4.587% |
| SOL | SHORTS_COVERING | SHADOW_NO_SETUP | NEUTRAL | 1 | OBSERVATION_ONLY | 100.0%/0.714% | 100.0%/2.931% | -0.109% |
| SOL | SHORTS_COVERING | SHADOW_SETUP_FORMING | BTC_STRONG_ALT_NOT_FOLLOWING | 1 | OBSERVATION_ONLY | 100.0%/0.304% | 100.0%/2.710% | -0.395% |
| SOL | SHORTS_COVERING | SHADOW_SETUP_FORMING | BTC_WEAK_VETO_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/0.156% | 0.0%/-0.352% | -1.404% |
| SOL | SHORTS_COVERING | SHADOW_SETUP_FORMING | NEUTRAL | 1 | OBSERVATION_ONLY | 0.0%/-0.375% | 100.0%/2.762% | -1.021% |

### episode — rolled asset × OI × BTC gate
Rows: 39; joined: 39; no_join: 0

| asset | OI bucket | BTC gate | n | class | 1h win/avg | 4h win/avg | 24h win/avg | med MFE4h | med MAE4h | first4h fav/adv | med MFE24h | med MAE24h | first24h fav/adv |
| --- | --- | --- | ---: | --- | --- | --- | --- | ---: | ---: | --- | ---: | ---: | --- |
| BTC | FRESH_SHORTS | NONE | 12 | WATCH_POSITIVE_LOW_OR_MEDIUM_N | 75.0%/0.123% | 58.3%/0.247% | 81.8%/2.172% | 0.907% | -0.183% | 4/8 | 2.510% | -0.482% | 5/7 |
| ETH | FRESH_SHORTS | BTC_WEAK_VETO_ALT_LONGS | 6 | OBSERVATION_ONLY | 16.7%/-0.190% | 66.7%/0.449% | 80.0%/2.425% | 0.775% | -0.564% | 2/4 | 4.387% | -0.574% | 2/4 |
| SOL | FRESH_SHORTS | BTC_STRONG_ALT_NOT_FOLLOWING | 6 | OBSERVATION_ONLY | 50.0%/0.098% | 33.3%/-0.362% | 33.3%/-0.338% | 0.736% | -0.803% | 3/3 | 2.469% | -1.809% | 4/2 |
| SOL | FRESH_SHORTS | BTC_WEAK_VETO_ALT_LONGS | 4 | OBSERVATION_ONLY | 25.0%/-0.201% | 75.0%/-0.082% | 100.0%/2.539% | 0.874% | -0.066% | 2/2 | 6.303% | -0.270% | 1/3 |
| ETH | FRESH_SHORTS | BTC_STRONG_ALT_NOT_FOLLOWING | 3 | OBSERVATION_ONLY | 33.3%/-0.660% | 33.3%/-0.949% | 66.7%/1.608% | 0.418% | -1.504% | 2/1 | 2.243% | -2.028% | 1/2 |
| SOL | FRESH_SHORTS | NEUTRAL | 2 | OBSERVATION_ONLY | 50.0%/-1.114% | 0.0%/-2.229% | 100.0%/5.281% | 2.079% | -0.225% | 1/1 | 7.092% | -2.093% | 1/1 |
| SOL | SHORTS_COVERING | NEUTRAL | 2 | OBSERVATION_ONLY | 100.0%/0.183% | 50.0%/0.170% | 100.0%/2.847% | 0.840% | 0.029% | 1/1 | 3.777% | -0.109% | 0/2 |
| BTC | FRESH_LONGS | NONE | 1 | OBSERVATION_ONLY | 100.0%/0.147% | 100.0%/0.139% | 100.0%/1.505% | 0.515% | -0.054% | 1/0 | 1.361% | -0.139% | 0/1 |
| ETH | FRESH_SHORTS | NEUTRAL | 1 | OBSERVATION_ONLY | 0.0%/-0.111% | 0.0%/-0.069% | 100.0%/0.494% | 0.278% | -0.388% | 1/0 | 2.439% | -0.388% | 0/1 |
| ETH | SHORTS_COVERING | BTC_WEAK_VETO_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/0.343% | 100.0%/0.196% | 100.0%/0.349% | 0.759% | -0.193% | 1/0 | 1.650% | -0.286% | 1/0 |
| SOL | SHORTS_COVERING | BTC_WEAK_VETO_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/0.364% | 100.0%/0.156% | 0.0%/-0.352% | 0.375% | -0.549% | 1/0 | 1.461% | -1.404% | 1/0 |

### episode — asset × OI × shadow × BTC gate

| asset | OI bucket | shadow | BTC gate | n | class | 4h win/avg | 24h win/avg | med MAE24h |
| --- | --- | --- | --- | ---: | --- | --- | --- | ---: |
| BTC | FRESH_SHORTS | SHADOW_SETUP_FORMING | NONE | 12 | WATCH_POSITIVE_LOW_OR_MEDIUM_N | 58.3%/0.247% | 81.8%/2.172% | -0.482% |
| SOL | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_STRONG_ALT_NOT_FOLLOWING | 6 | OBSERVATION_ONLY | 33.3%/-0.362% | 33.3%/-0.338% | -1.809% |
| ETH | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_WEAK_VETO_ALT_LONGS | 4 | OBSERVATION_ONLY | 75.0%/0.520% | 75.0%/2.515% | -0.563% |
| ETH | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_STRONG_ALT_NOT_FOLLOWING | 3 | OBSERVATION_ONLY | 33.3%/-0.949% | 66.7%/1.608% | -2.028% |
| SOL | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_WEAK_VETO_ALT_LONGS | 3 | OBSERVATION_ONLY | 100.0%/0.993% | 100.0%/2.778% | -0.270% |
| ETH | FRESH_SHORTS | SHADOW_NO_SETUP | BTC_WEAK_VETO_ALT_LONGS | 2 | OBSERVATION_ONLY | 50.0%/0.309% | 100.0%/2.065% | -0.574% |
| BTC | FRESH_LONGS | SHADOW_BLOCKED | NONE | 1 | OBSERVATION_ONLY | 100.0%/0.139% | 100.0%/1.505% | -0.139% |
| ETH | FRESH_SHORTS | SHADOW_SETUP_FORMING | NEUTRAL | 1 | OBSERVATION_ONLY | 0.0%/-0.069% | 100.0%/0.494% | -0.388% |
| ETH | SHORTS_COVERING | SHADOW_NO_SETUP | BTC_WEAK_VETO_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/0.196% | 100.0%/0.349% | -0.286% |
| SOL | FRESH_SHORTS | SHADOW_NO_SETUP | BTC_WEAK_VETO_ALT_LONGS | 1 | OBSERVATION_ONLY | 0.0%/-3.306% | 100.0%/1.821% | -3.787% |
| SOL | FRESH_SHORTS | SHADOW_NO_SETUP | NEUTRAL | 1 | OBSERVATION_ONLY | 0.0%/-0.398% | 100.0%/5.281% | -2.093% |
| SOL | FRESH_SHORTS | SHADOW_SETUP_FORMING | NEUTRAL | 1 | OBSERVATION_ONLY | 0.0%/-4.060% | n/a/n/a% | -4.587% |
| SOL | SHORTS_COVERING | SHADOW_NO_SETUP | NEUTRAL | 1 | OBSERVATION_ONLY | 100.0%/0.714% | 100.0%/2.931% | -0.109% |
| SOL | SHORTS_COVERING | SHADOW_SETUP_FORMING | BTC_WEAK_VETO_ALT_LONGS | 1 | OBSERVATION_ONLY | 100.0%/0.156% | 0.0%/-0.352% | -1.404% |
| SOL | SHORTS_COVERING | SHADOW_SETUP_FORMING | NEUTRAL | 1 | OBSERVATION_ONLY | 0.0%/-0.375% | 100.0%/2.762% | -1.021% |