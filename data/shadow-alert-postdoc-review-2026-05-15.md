# Shadow Alert Assumption Review — Post-Document Data

Generated: 2026-05-15T11:25Z

Source files:
- `data/shadow-alert-price-patterns.json` regenerated at 2026-05-15T11:25:56Z
- `data/phase1d-alerts.jsonl`
- `data/readiness-shadow.jsonl`
- `data/autoresearch/price-15m.jsonl`

Comparison window: alerts after the prior document generation timestamp `2026-05-14T08:29:06Z`.

## Data added after prior document

- Post-document directional confirmed alerts: **18**
- 1h outcomes available: **18 / 18**
- 4h outcomes available: **15 / 18**
- Full refreshed dataset now has **92** directional confirmed alerts, **87** with matched shadow rows.

## Post-document summary

| slice | n | 1h n | 1h hit | 1h adverse | 1h avg | 4h n | 4h hit | 4h avg | avg MAE 4h |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| ALL post-doc | 18 | 18 | 44.4% | 55.6% | -0.084% | 15 | 53.3% | 0.021% | -0.527% |
| LONG score>=70 | 4 | 4 | 0.0% | 100.0% | -0.542% | 4 | 25.0% | 0.078% | -0.727% |
| LONG score<70 | 8 | 8 | 25.0% | 75.0% | -0.243% | 5 | 40.0% | -0.073% | -0.613% |
| LONG 50-69 | 8 | 8 | 25.0% | 75.0% | -0.243% | 5 | 40.0% | -0.073% | -0.613% |
| SHORT score<70 | 6 | 6 | 100.0% | 0.0% | 0.433% | 6 | 83.3% | 0.062% | -0.279% |
| SHORT score<50 | 2 | 2 | 100.0% | 0.0% | 0.665% | 2 | 100.0% | 0.420% | -0.082% |
| SHORT 50-69 | 4 | 4 | 100.0% | 0.0% | 0.318% | 4 | 75.0% | -0.117% | -0.377% |
| LONG<70 late after high | 2 | 2 | 0.0% | 100.0% | -0.200% | 1 | 0.0% | -0.698% | -0.491% |
| LONG<70 + BTC_WEAK | 2 | 2 | 0.0% | 100.0% | -0.751% | 2 | 0.0% | -0.771% | -1.356% |
| LONG<70 + broad positive funding | 6 | 6 | 33.3% | 66.7% | -0.232% | 5 | 40.0% | -0.073% | -0.695% |
| SHORT 50-69 + broad positive funding | 3 | 3 | 100.0% | 0.0% | 0.322% | 3 | 66.7% | -0.292% | -0.536% |

## Assumption review

### 1. `shadow score >=70` as high-conviction gate

**Status: invalidated for LONG timing in the new sample.**

The previous document treated score >=70 as a high-conviction gate candidate. The new rows are not supportive for longs:

- Post-doc `LONG score>=70`: n=4, 1h hit **0%**, avg 1h **-0.542%**.
- 4h was mixed: 1/4 hit, but avg 4h was slightly positive only because one SOL alert ran +2.498% after first going adverse.
- Practical read: `score>=70` may identify eventual structural participation, but it is **not enough for immediate long entry timing**.

Important cases:

| time | asset | score | 1h | 4h | note |
|---|---|---:|---:|---:|---|
| 2026-05-14T12:45Z | SOL LONG | 90 | -0.346% | +2.498% | good 4h, bad early timing |
| 2026-05-14T16:15Z | SOL LONG | 77 | -1.193% | -0.850% | failed |
| 2026-05-14T18:15Z | SOL LONG | 77 | -0.391% | -0.595% | failed |
| 2026-05-15T00:45Z | BTC LONG | 75 | -0.237% | -0.740% | failed |

### 2. `score <50` as no-trade/caution

**Status: validated for longs historically, not validated for shorts.**

No post-doc long rows had score <50, so there is no new long evidence.

But post-doc short rows with score <50 worked well:

- `SHORT score<50`: n=2, 1h hit **100%**, avg 1h **+0.665%**, 4h hit **100%**, avg 4h **+0.420%**.

This suggests the shadow threshold is asymmetric: low score is not automatically bearish for short alerts. In this regime, low-score shorts still captured downside well.

### 3. `score 50–69 requires extra filters`

**Status: validated, especially for longs.**

Post-doc `LONG 50-69` was weak:

- n=8, 1h adverse **75%**, avg 1h **-0.243%**.
- 4h complete sample n=5, hit **40%**, avg 4h **-0.073%**.

Post-doc `SHORT 50-69` was much stronger:

- n=4, 1h hit **100%**, avg 1h **+0.318%**.
- 4h hit **75%**, though avg 4h was slightly negative because one ETH short reversed hard.

Takeaway: the 50-69 bucket should not be treated uniformly. For longs, keep as caution / filtered only. For shorts, the bucket can be tradable when broader context favors downside.

### 4. Fade under-70 alerts when late after local extreme

**Status: still promising for longs, no new short-late cases.**

Post-doc fade results:

| fade condition | n | 1h hit | 1h avg | 4h hit | 4h avg |
|---|---:|---:|---:|---:|---:|
| fade LONG<70 late after high | 2 | 100.0% | +0.200% | 100.0% | +0.698% |
| fade LONG<70 + BTC_WEAK | 2 | 100.0% | +0.751% | 100.0% | +0.771% |
| fade LONG<70 + broad positive funding | 6 | 66.7% | +0.232% | 60.0% | +0.073% |

The strongest new confirmation is the BTC weak gate:

- ETH LONG 2026-05-14T22:45Z, score 62, `BTC_WEAK_PENALIZE_ALT_LONGS`, 1h -0.742%, 4h -1.020%.
- SOL LONG 2026-05-14T22:45Z, score 60, `BTC_WEAK_PENALIZE_ALT_LONGS`, 1h -0.759%, 4h -0.522%.

Both would have been profitable fades.

## New pattern candidates

### A. High-score LONG + BROAD_SHORT_PRESSURE is dangerous for immediate entry

All post-doc high-score long rows had `BROAD_SHORT_PRESSURE`. Results were poor in the first hour:

- SOL LONG score 90: 1h -0.346%, later recovered strongly by 4h.
- SOL LONG score 77: 1h -1.193%, 4h -0.850%.
- SOL LONG score 77: 1h -0.391%, 4h -0.595%.
- BTC LONG score 75: 1h -0.237%, 4h -0.740%.

Candidate rule: if `LONG` and `score>=70` but funding classification is `BROAD_SHORT_PRESSURE`, do not market-enter immediately. Require either retest confirmation or wait 30-60m for drawdown stabilization. This may convert structural signal into better timed entry.

### B. BTC_WEAK alt longs remain strong fade candidates

Post-doc sample is small but clean:

- `LONG<70 + BTC_WEAK_PENALIZE_ALT_LONGS`: n=2, 1h adverse 100%, avg 1h -0.751%, 4h adverse 100%, avg 4h -0.771%.

Candidate rule: if ETH/SOL long alert has score <70 and `BTC_WEAK_PENALIZE_ALT_LONGS`, suppress long and optionally create a short/fade candidate after spread confirmation.

### C. Under-70 shorts are working even without confirmed shadow

Post-doc:

- `SHORT score<70`: n=6, 1h hit 100%, avg 1h +0.433%.
- `SHORT score<50`: n=2, 4h hit 100%, avg 4h +0.420%.

Candidate interpretation: the shadow engine is currently better at filtering longs than shorts, or the broader regime has shifted short-favorable. Short alerts should not require the same >=70 confirmation threshold.

## Practical recommendation

1. Split shadow thresholds by direction.
   - LONG: keep conservative; score <70 is weak unless there is clear recovery/retest confirmation.
   - SHORT: do not block solely because score <70; use other filters.

2. Add a long timing gate:
   - If `LONG` + `score>=70` + `BROAD_SHORT_PRESSURE`, delay entry or require a 30-60m retest. The signal may be structurally right but badly timed.

3. Promote BTC weak alt-long fade rule to stronger candidate status:
   - `LONG` + ETH/SOL + score <70 + `BTC_WEAK_PENALIZE_ALT_LONGS` => no long; consider opposite/fade watch.

4. Keep collecting; do not production-automate the fade rule until at least n>=20 per condition. Current post-doc evidence is useful but still small.
