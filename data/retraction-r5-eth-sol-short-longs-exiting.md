# R5 Retraction — ETH/SOL SHORT + LONGS_EXITING

Generated: 2026-06-06

## Claim retracted

Old remembered stats claimed:

- ETH `SHORT + LONGS_EXITING`: ~64.9%
- SOL `SHORT + LONGS_EXITING`: ~79.2%

These stats do **not** survive locked-definition source tracing.

## Acceptance checklist result

| Check | ETH | SOL |
|---|---|---|
| Confirmed-alert mode | n=4; 4h 50.0%, avg -0.274%; 24h 25.0%, avg -0.232% | n=2; 4h 100%, avg +0.606%; 24h 100%, avg +1.108% |
| Episode mode | n=2; 4h 50.0%, avg +0.040%; 24h 0%, avg -0.471% | n=2; same tiny pocket |
| Post-2026-05-21 | n=0 | n=0 |
| Shadow state | 4/4 `SHADOW_SETUP_FORMING`; 0 `SHADOW_CONFIRMED` | 2/2 `SHADOW_SETUP_FORMING`; 0 `SHADOW_CONFIRMED` |
| Window quality | ETH 24h inverts/adverse | n too small; no current-regime data |
| OI source/schema | Locked decomposition uses direct ±16m `readiness-shadow.jsonl` join via `source_metrics.oi_price_regime`; old remembered number provenance did not survive this source gate | Same |

## Verdict

Retracted as confirmed-entry evidence.

The old ETH/SOL `SHORT+LONGS_EXITING` memories were likely produced by old all-data/episode/setup-stage methodology or legacy grouping/schema attachment, similar to R4. Under locked definitions, ETH is weak/noisy and SOL is only a tiny pre-May21 pocket with no current-regime rows.

Classification impact:

```text
ETH SHORT + LONGS_EXITING: OBSERVATION_ONLY / RETRACTED_OLD_STAT
SOL SHORT + LONGS_EXITING: OBSERVATION_ONLY / RETRACTED_OLD_STAT
```

No ETH/SOL `SHORT+LONGS_EXITING` bucket is promotable to WATCH from Phase A.
