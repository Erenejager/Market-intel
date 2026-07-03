# Telegram Pattern Gate — Autonomous Demote/Promote Loops

Date: 2026-07-01
Status: Spec / not implemented
Owner context: Az + OpenClaw market-intel system

## 1. Purpose

Two of the "exempt" opportunity/fade patterns (`ETH_LONG_BLOCKED_SELL_PRESSURE_INVERSE_SHORT_POSTFIX`,
`SOL_SHORT_BLOCKED_SPOT_LED_INVERSE_LONG_POSTFIX`, plus two more found during this review) were shipping
to Telegram despite failing a real 6h MFE-vs-MAE distribution check, because the enable/disable lists in
`scripts/phase1d-alerts.js` were hand-maintained `Set`s that went stale. Getting these numbers right
required fixing two real bugs in `scripts/build-trade-quality-report.js` first:

1. Opportunity alerts (`type: OPPORTUNITY_*`) were silently dropped from the MFE/MAE report because
   direction was derived only from a `LONG`/`SHORT` prefix on `type`.
2. Older fade-candidate alerts (`type: LONG_SETUP` etc. with `pattern.verdict: 'fade_candidate'`) were
   measured on their *natural* direction instead of the inverted trade direction actually being alerted.

Both are now fixed (`tradeDirectionForAlert()` in `build-trade-quality-report.js`), and the report now
carries a real per-episode distribution (`path6h.episodes_mfe_beats_mae_pct` and friends), not just a
median.

This spec covers automating the maintenance of the enable/disable decision itself, so it doesn't go
stale again, without requiring a human to re-run this manual review every time.

## 2. Non-goals / safety constraints

- Do **not** discover brand-new, never-labeled pattern combinations. Loop 2 only re-evaluates pattern
  keys that already exist with a human-assigned trade direction (`pattern.verdict` / `research_note`).
  Direction is undefined for a never-labeled combination, and searching that space multiplies false
  positives (see §7).
- Do **not** promote a pattern to full-volume Telegram delivery on day one. New promotions ship capped.
- Do **not** make any decision when the underlying report or its upstream price/alert feeds are stale
  (see §4's two-tier staleness check — 36h for the report, 2h for upstream feeds). No data, no decision.
- Do **not** flip a promotion on a single day's numbers. Requires 2 consecutive qualifying daily runs.

## 3. Architecture

```
price/alert data (unchanged)
  -> build-trade-quality-report.js (unchanged, now also run daily)
  -> data/trade-quality-report.json
  -> scripts/maintain-telegram-pattern-gate.js   (NEW — daily decision layer)
       reads: trade-quality-report.json, data/telegram-pattern-gate-history.json
       writes: data/telegram-pattern-gate.json, data/telegram-pattern-gate-history.json,
               data/telegram-pattern-gate-decisions.jsonl (audit log)
       side effect: Telegram digest, only if something changed status
  -> scripts/phase1d-alerts.js reads data/telegram-pattern-gate.json at runtime
     (replaces hardcoded ENABLED_WIN_RATE_EXEMPT_PATTERN_KEYS / DISABLED_TELEGRAM_WATCH_PATTERN_KEYS)
```

`build-trade-quality-report.js` stays a pure stats-computation script — no policy or notification logic
in it. `maintain-telegram-pattern-gate.js` owns all decision-making, hysteresis, and notification. This
keeps the two responsibilities independently testable: stats correctness vs. decision-policy correctness.

### 3.1 `data/telegram-pattern-gate.json`

```json
{
  "generated_at": "2026-07-02T03:10:00Z",
  "patterns": {
    "ETH_BTC_PERMITS_ALT_LONG_INVERSE_SHORT_POSTFIX": {
      "status": "enabled",
      "since": "2026-07-01",
      "reason": "n=6 mfe_beats_mae=83.3%",
      "telegram_cap": { "cap": 2, "window_ms": 21600000 }
    },
    "BTC_LONG_SETUP_INVERSE_SHORT_POSTFIX": {
      "status": "enabled",
      "since": "2026-07-01",
      "reason": "n=6 mfe_beats_mae=83.3%",
      "telegram_cap": { "cap": 2, "window_ms": 21600000 }
    },
    "ETH_LONG_BLOCKED_SELL_PRESSURE_INVERSE_SHORT_POSTFIX": {
      "status": "disabled",
      "since": "2026-07-01",
      "reason": "n=7 mfe_beats_mae=42.9%"
    }
  }
}
```

`phase1d-alerts.js` loads this once per run (same caching pattern as `tradeQualityReport()`). If the file
doesn't exist yet, it falls back to the current hardcoded `Set`s as a seed — no behavior change on
rollout day.

`telegram_cap`, when set, is read by `applyTelegramBucketCaps()` to add/override an entry in
`TELEGRAM_BUCKET_CAPS` for that pattern's delivery bucket — same shape already used for
`ETH_INVERSE_SHORT_OPPORTUNITY` / `SOL_INVERSE_LONG_OPPORTUNITY`. **Every** `enabled` pattern gets a cap,
including the two seeded ones: n=6 is not enough evidence to justify uncapped delivery just because it
predates this system, and an uncapped enabled pattern (e.g. `BTC_LONG_SETUP_INVERSE_SHORT_POSTFIX`, which
had no bucket cap at all before this design) is exactly the kind of gap that let noise back in previously.
Default cap for any `enabled` pattern is `{ cap: 2, window_ms: 21600000 }` (2 per 6h) unless a future
review deliberately raises it.

### 3.2 `data/telegram-pattern-gate-history.json`

Per-pattern-key hysteresis state, keyed by pattern key:

```json
{
  "SOME_DISABLED_PATTERN_KEY": {
    "consecutive_qualifying_runs": 1,
    "last_checked": "2026-07-01",
    "last_n": 21,
    "last_mfe_beats_mae_pct": 76.2
  }
}
```

Reset `consecutive_qualifying_runs` to 0 any day the pattern fails to qualify. Only promote once it
reaches 2.

### 3.3 `data/telegram-pattern-gate-decisions.jsonl`

Append-only audit log, one row per decision-relevant evaluation (not just changes), so we can later ask
"did this pattern only look good because BTC was trending the whole eval window":

```json
{
  "timestamp_utc": "2026-07-02T03:10:00Z",
  "pattern_key": "ETH_LONG_BLOCKED_SELL_PRESSURE_INVERSE_SHORT_POSTFIX",
  "action": "demote",
  "n": 7,
  "mfe_beats_mae_pct": 42.9,
  "mae_p25": -1.21,
  "mae_min": -2.743,
  "mfe_p25": 0.12,
  "btc_gate": "BTC_WEAK_VETO_ALT_LONGS",
  "btc_4h_trend": "DOWN",
  "funding": "BROAD_POSITIVE_FUNDING",
  "oi_data_quarantined": false,
  "regime_counts": {
    "btc_gate": { "BTC_WEAK_VETO_ALT_LONGS": 4, "NEUTRAL": 2 },
    "funding": { "BROAD_POSITIVE_FUNDING": 6 }
  }
}
```

The `btc_gate`/`btc_4h_trend`/`funding` fields here are `latest_regime` (a single point-in-time snapshot,
kept for quick eyeballing); `regime_counts` is the full distribution across the episodes behind this
decision. Both come straight from `patternSummary(key)` — see §3.1 note below.

`btc_gate` / `btc_4h_trend` / `funding` come from `alert.regime` (`{ label, btc_4h_pct_change, btc_gate,
funding }`), which is already attached to every alert object in `phase1d-alerts.jsonl`
(`applyPatternVerdicts` sets it via `patternClassifier.buildRegimeFields`). **`trade-quality-report.json`
does not currently carry this** — its per-episode `row` objects (built in `build-trade-quality-report.js`)
only keep `flow`/`oi`/`funding`, not the full regime snapshot, and `examples` only keeps
`timestamp_utc`/`asset`/`type`/`price`/`pattern`.

Chosen fix: extend `build-trade-quality-report.js` to carry `regime: alert.regime || null` on each row,
and add two fields to each pattern's `summary` object, alongside the existing `path6h`:

- `latest_regime`: the most recent row's `regime`, by `timestamp_utc` (for the audit log, §3.3).
- `regime_counts`: a tally over the same deduped rows used for `path6h`, one count-map per dimension
  (`btc_gate`, `funding`) — e.g. `{ "btc_gate": { "BTC_WEAK_VETO_ALT_LONGS": 4, "NEUTRAL": 2 },
  "funding": { "BROAD_POSITIVE_FUNDING": 6 } }`. Included in v1: it's a tally over rows already in memory
  (no extra pass over `phase1d-alerts.jsonl`), and it upgrades the §7 "correlated episodes" blind spot
  from "not measurable without re-deriving history" to "visible in every summary." A pattern whose
  `regime_counts` shows all 6 episodes under one `btc_gate` value is one untested regime shift away from
  its win rate falling apart — `latest_regime` alone can't distinguish that from a pattern tested across
  several distinct regimes. This doesn't change v1's decision rules (§4 doesn't gate on it), it's
  visibility only — a natural next tightening once there's enough history to set a sane threshold (e.g.
  "no single regime value may account for >80% of episodes") without it just meaning "reject everything,
  n is too small."

`maintain-telegram-pattern-gate.js` reads `patternSummary(key).latest_regime` and `.regime_counts`
directly — no need to re-read the 14k+ row `phase1d-alerts.jsonl` during the daily maintenance run. This
keeps the stats/decision separation from §3 intact: regime snapshotting is a stats-layer concern (it's
just more fields on the row/summary), not a decision-layer one.

## 4. Decision rules

Evaluated once daily, per `pattern:<key>` bucket in `trade-quality-report.json`, using
`tradeQuality.patternSummary(key)` — never the broader `asset_type:*` / `asset_dir_oi_funding:*` buckets,
which mix unrelated setups together and would dilute the pattern-specific evidence.

**Demote (fast, single-run):**
Currently `enabled`, and `n >= 5` and `episodes_mfe_beats_mae_pct < 70` → flip to `disabled` immediately.

**Promote (slow, requires ALL of):**
- `n >= 20`
- `episodes_mfe_beats_mae_pct >= 75`
- `oi_data_quarantined === false`
- Passes tail-risk check (fails if ANY of):
  - `mae_distribution.p25 <= -1.25`
  - `mae_distribution.min <= -3.0`
  - `abs(mae_distribution.min) > 3 * max(abs(mae_distribution.median), 0.35)`
  - `mfe_distribution.p25 < 0.25`
- Qualifies on this exact rule set on 2 consecutive daily runs (tracked via
  `telegram-pattern-gate-history.json`)

On promotion, `telegram_cap` is set to `{ cap: 2, window_ms: 21600000 }` in the gate JSON.

**No data / stale data — two-tier check**, since this loop runs daily and a >3-day tolerance (the
threshold used for the human-facing `_stale` flag elsewhere in `phase1d-alerts.js`) is too loose for an
autonomous decision-maker:

- **Soft skip (report age):** if `trade-quality-report.json.generated_at` is more than 36h old, skip all
  decisions for that run (no demotions, no promotions, no history updates). Log
  `"action": "skipped_stale_report"`.
- **Hard skip (upstream feed staleness):** independent of report age, check the last row's
  `timestamp_utc` in `data/autoresearch/price-15m.jsonl` and in `data/phase1d-alerts.jsonl`. If either
  is more than 2h old (expected cadence is 15m), hard-skip regardless of report age and log
  `"action": "skipped_stale_upstream_feed"` with which feed and its age. This is the same failure class
  as the `oi_price_regime` freeze that went unnoticed for 11 days (see §1) — a fresh-looking report built
  on a stalled upstream feed is worse than an obviously-stale one, because it looks trustworthy. This
  check should also be loud: a hard skip is a pipeline-health problem, not routine, so it's always
  included in the daily digest even though no pattern status changed (distinct from §5's "silent on no
  change" rule for ordinary runs).

## 5. Notification

If any pattern's status changed this run, send one Telegram digest message (not one per pattern):

```
🚦 Pattern gate update (2026-07-02)
⬇️ Demoted: ETH_LONG_BLOCKED_SELL_PRESSURE_INVERSE_SHORT_POSTFIX
   n=7, MFE>|MAE| 42.9% (was enabled)
⬆️ Promoted (capped 2/6h): SOME_PATTERN_KEY
   n=22, MFE>|MAE| 76.2%, 2/2 consecutive passes
```

No message is sent on a day with zero status changes and a healthy data pipeline. A hard-skip
(upstream feed staleness, §4) always sends a digest regardless of whether any pattern changed, since
that condition itself needs attention.

## 6. Cron wiring

New daily crontab line, off-peak:

```
10 3 * * * cd /home/clawdbot/.openclaw/workspace/market-intel && { node scripts/build-trade-quality-report.js --days 30 && node scripts/maintain-telegram-pattern-gate.js; } >> data/autoresearch/logs/telegram-pattern-gate-cron.out 2>> data/autoresearch/logs/telegram-pattern-gate-cron.err
```

(The brace grouping matters: without it, only `maintain-telegram-pattern-gate.js`'s stdout/stderr would
be redirected, and `build-trade-quality-report.js`'s output — including any errors — would leak to cron's
default mail-to-user delivery instead of the log file.)

## 7. Blind spots carried forward (not solved by this design, tracked for later)

- **Correlated episodes across patterns.** Multiple patterns riding the same macro move can look
  simultaneously good/bad without independent edge. Not addressed here; the regime fields recorded in
  §3.3 are the first step toward being able to check this later.
- **MFE/MAE assumes a perfect exit.** It's a screening signal (best point vs. worst point in the window),
  not a simulated trade with a real entry/exit rule. A pattern clearing this bar is a candidate for
  further scrutiny, not a validated strategy.
- **No brand-new pattern discovery.** By design (§2), this only maintains patterns a human already
  labeled with a direction. Finding genuinely novel setups is out of scope for these loops.

## 8. Testing plan

- Unit-test `maintain-telegram-pattern-gate.js`'s decision function against fixture
  `trade-quality-report.json` snapshots covering: clean demote, clean promote (2nd consecutive pass),
  promote blocked by each individual tail-risk condition, promote blocked by only 1/2 consecutive passes,
  soft-skip (report age 36h-72h), hard-skip (upstream feed stale but report itself looks fresh — the
  specific failure mode this tier exists to catch). Full test cases to be enumerated in the
  implementation plan.
- Unit-test that `build-trade-quality-report.js` populates `regime` on rows and `latest_regime` /
  `regime_counts` on summaries, and that it's `null`/empty (not a crash) for alerts predating regime
  instrumentation.
- Seeding note: `telegram-pattern-gate.json` is seeded once from today's manually-verified lists
  (`ETH_BTC_PERMITS_ALT_LONG_INVERSE_SHORT_POSTFIX` and `BTC_LONG_SETUP_INVERSE_SHORT_POSTFIX` start
  `enabled`, both capped 2/6h; the four demoted patterns start `disabled`). The promotion bar (`n>=20`)
  only applies to patterns attempting to move from `disabled` to `enabled` — it does not re-litigate the
  two already-seeded `enabled` patterns, which stay enabled (and capped) unless the demote rule (`n>=5`,
  `<70%`) fires on them. This is by design: demotion and promotion are intentionally asymmetric in both
  bar height and in which direction a pattern must be moving to be subject to each rule.
- Manual dry run against the current `trade-quality-report.json` (already regenerated with the bugfixes
  from this session) should therefore be a no-op on pattern *status* on day one: no pattern currently
  meets the demote condition (the two enabled patterns are at 83.3%), and no currently-disabled pattern
  has n>=20 yet, so nothing crosses the promotion bar either. The two seeded patterns' `telegram_cap`
  going from "uncapped in source" to "capped in the gate JSON" is itself a real, immediate behavior
  change on rollout — confirm `applyTelegramBucketCaps()` picks it up.
- Confirm `phase1d-alerts.js` behavior is unchanged when `telegram-pattern-gate.json` is absent (fallback
  to hardcoded seed sets).
