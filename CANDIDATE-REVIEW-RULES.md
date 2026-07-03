# Market Intel Candidate Review Rules

**Status:** ACTIVE  
**Last updated:** 2026-07-01 10:05 UTC

## Core rule

When reviewing any alert/candidate for Telegram promotion, scoring, or routing changes, **do not approve from mean return or fixed-horizon win rate alone**.

Candidate quality must be judged from independent episode path behavior:

1. Deduplicate into independent episodes, preferably >=6h spaced.
2. Measure in the **actual traded direction**:
   - `research_note.trade_direction` for `OPPORTUNITY_*` alerts.
   - invert natural/source direction for `fade_candidate`, `avoid_original`, and `avoid_original_short_primed` legacy alerts.
3. Use a full 6h path window unless a candidate has a preregistered shorter horizon.
4. Inspect MFE/MAE distribution, not only mean/median:
   - MFE p25 / median / p75
   - MAE p25 / median / p75
   - per-episode `MFE > |MAE|` count and percentage
   - favorable-first rate
   - near-zero MFE clusters
   - fat-tail MAE losses
5. Prefer exact `pattern:<key>` buckets for promotion/demotion decisions. Broad buckets like `asset_type:*`, `asset_dir:*`, or `asset_dir_flow:*` can mix unrelated setups and must not override exact pattern evidence.

## Default Telegram promotion gate

A watch/candidate should stay log-only unless it has enough independent post-fix 6h-path evidence and passes:

- `episodes_mfe_beats_mae_n >= 5`
- `episodes_mfe_beats_mae_pct >= 70`
- no obvious fat-tail MAE problem
- no large near-zero MFE cluster
- no data-quarantine issue

Mean return and median MFE/MAE are secondary diagnostics only. They can explain a candidate but should not be the main approval criterion.

## Current implementation

- `scripts/build-trade-quality-report.js` generates exact pattern `path6h` stats including MFE/MAE distributions and `episodes_mfe_beats_mae_pct`.
- `scripts/trade-quality.js` exposes `patternSummary(key)` for exact `pattern:<key>` lookup.
- `scripts/phase1d-alerts.js` uses `MIN_MFE_BEATS_MAE_PCT = 70` as a Telegram watch safety gate.

## Why this exists

Fixed-horizon win rate and mean return can hide bad path quality. A candidate can look profitable at exactly 1h/4h while frequently hitting unacceptable adverse excursion first, or can have a good mean because one outlier offsets many weak episodes. The user explicitly prefers MFE/MAE distribution and per-episode reward-vs-risk for candidate decisions.
