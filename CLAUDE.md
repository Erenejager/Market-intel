# Market Intel — Claude Context

Automated crypto/gold trading signal system (OpenClaw). Node.js, runs on cron.

## Current phase

**Phase 1/1b/1d burn-in + Phase 2 shadow collection (as of 2026-05-10)**

Shadow gate is a **production guardrail, not validated alpha**. n≥10 shadow-gated contexts required before treating it as evidence-backed. Do not activate readiness gating, change alert severity, or modify orchestrator cadence until Phase 3 evaluation supports it.

## Hard constraints — do not violate without explicit user go-ahead

- Do not tune readiness scoring weights on the current validation sample — future formulas must be versioned separately
- Do not raise or lower the 70-score threshold without n≥50 in the ≥70 bucket
- Scores are only comparable inside a valid regime. Evaluate alerts in order: regime → mechanism → empirical pattern history → score.
- BTC_WEAK_VETO_ALT_LONGS is an absolute hard block regardless of numeric score (score 80+ still blocked — confirmed empirically). It means local setup present / regime invalid, not a penalty.
- **Inverse-signal rule:** when a setup bucket has a high historical error rate / adverse follow-through, treat that as positive directional information for the opposite side, not just “bad data.” Flag it centrally, surface it prominently, and never let a high readiness score override an adverse empirical bucket without explicitly calling out why. Current example: `SHORTS_COVERING+LONG` history `UP 0/4 @1h/4h` means long alert should be treated as bearish/inverse information until disproven.
- Do not add flow-based gates — flow type at alert time has near-zero discriminating power (C2)
- Do not fire or suppress Telegram alerts based on readiness score yet
- Do not create active contexts from MEDIUM alerts (RETEST_HELD etc.) — only from HIGH LONG_CONFIRMED / SHORT_CONFIRMED

## Canonical docs

- `PHASE_STATUS.md` — current implementation state, what's done, what's next
- `docs/READINESS_ENGINE_SPEC.md` — frozen readiness_shadow_v0 scoring formula
- `docs/MICROSTRUCTURE_CONFIRMATION_ENGINE.md` — canonical semantic gate spec
- Memory files — validated signal patterns with confidence tiers (CONFIRMED/TENTATIVE/RETRACTED)

## Key files

- `orchestrator.js` — main cron runner, all Phase 1 gates
- `scripts/phase1d-alerts.js` — Phase 1d transition alerts + Phase 2 shadow scoring
- `scripts/fetch-market-microstructure.js` — 15m microstructure collector
- `data/readiness-shadow.jsonl` — unconditional 15m per-asset snapshots (burn-in data)
- `data/phase1d-alert-state.json` — active context state
- `data/trigger-state.json` — persistent trigger/cooldown state

Before implementing anything, confirm the current state in PHASE_STATUS.md first.
