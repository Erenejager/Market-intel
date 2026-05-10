# Hypothesis Tracker Design — Pattern-Derived Alert Layer

Date: 2026-05-15
Status: Spec / not implemented
Owner context: Az + OpenClaw market-intel system

## 1. Purpose

Add a lightweight research/trade-consideration layer on top of Phase 1d alerts.

The goal is **not** to silently change production trading logic. The goal is to:

1. Track newly observed pattern hypotheses in structured data.
2. Surface manual-consideration alerts only when a hypothesis condition becomes actionable.
3. Annotate existing production alerts when a pattern changes trade management.
4. Preserve every trigger/resolution in append-only files so hypotheses can later be promoted, rejected, or revised with evidence.

This layer exists because the May 13–15 out-of-sample review showed several useful but under-sampled patterns:

- LONG + FRESH_LONGS OI is destructive for long entries and may become a SHORT watch, but should not be blindly faded without a SHORT confirmation.
- Under-threshold SHORTs can work during selloff regimes and need structured tracking.
- FRESH_SHORTS + LONG appears to be a valid squeeze-long context but changes stop/hold management rather than creating a new trade.
- BTC_WEAK invalidates alt longs but does not by itself create a clean alt-short signal.

## 2. Non-goals / safety constraints

Do **not** use this layer to:

- Auto-enter trades.
- Change production alert severity silently.
- Lower the canonical shadow threshold globally.
- Promote a hypothesis to a hard production rule before its promotion criteria are met.
- Send multiple pings for the same convergent hypothesis event.

All hypothesis trade messages must be explicitly marked as **manual consideration / unvalidated**, not production signals.

## 3. Recommended architecture

Use a new module required by `scripts/phase1d-alerts.js`:

- New module: `scripts/hypothesis-tracker.js`
- New analysis script: `scripts/analyze-hypotheses.js`
- Mutable state: `data/hypothesis-watch.json`
- Append-only event log: `data/hypothesis-events.jsonl`

`phase1d-alerts.js` calls the tracker once near the end of each run, after alerts and blocked candidates are known.

Preferred interface:

```js
hypothesisTracker.process({
  emittedAlerts,      // alerts actually emitted this run
  blockedAlerts,      // alert candidates blocked/suppressed by gate logic
  microstructure,     // current microstructure snapshot if already loaded
  prices,             // current price snapshot / latest price map
  now,                // current timestamp
  sendTelegram,       // existing Telegram send helper, if available
});
```

The tracker performs three operations:

1. Detect new hypothesis triggers.
2. Resolve active watch windows.
3. Emit at most one hypothesis message per actionable event.

## 4. Data files

### 4.1 `data/hypothesis-watch.json`

Mutable state for active watch windows.

Shape:

```json
{
  "H-T1-SHORT-WATCH": {
    "SOL": {
      "id": "H-T1:SOL:2026-05-13T13:21:10.479Z",
      "asset": "SOL",
      "opened_at": "2026-05-13T13:21:10.479Z",
      "expires_at": "2026-05-13T13:51:10.479Z",
      "trigger_price": 93.295,
      "trigger_score": 80,
      "trigger_direction": "LONG",
      "oi_regime": "FRESH_LONGS",
      "btc_gate": "BTC_WEAK_VETO_ALT_LONGS",
      "source_alert_type": "LONG_CONFIRMED",
      "source_alert_id": "optional-if-available"
    }
  }
}
```

Rules:

- One active watch per `hypothesis + asset` unless future evidence requires stacking.
- If a duplicate trigger occurs while an active watch is open, append an `UPDATED` or `DUPLICATE_IGNORED` event, but do not spam Telegram.
- Close watches on resolution or expiry.

### 4.2 `data/hypothesis-events.jsonl`

Append-only event log. One JSON object per line.

Required common fields:

```json
{
  "id": "H-T1:SOL:2026-05-13T13:21:10.479Z",
  "hypotheses": ["H-T1-SHORT-WATCH"],
  "event": "TRIGGERED",
  "asset": "SOL",
  "timestamp_utc": "2026-05-13T13:21:10.479Z",
  "direction": "SHORT_WATCH",
  "source": "phase1d-alerts",
  "unvalidated": true,
  "payload": {}
}
```

Use `hypotheses` array, not a single `hypothesis` string, because H-T1 and H-N1 can converge into one actionable message.

Event types:

- `TRIGGERED`
- `CONSIDER_ALERT_SENT`
- `RESOLVED_CONFIRMED`
- `RESOLVED_EXPIRED`
- `RESOLVED_PRICE_OUTCOME`
- `ANNOTATED_PRODUCTION_ALERT`
- `DUPLICATE_IGNORED`
- `ERROR`

## 5. Hypothesis definitions

### 5.1 H-T1-SHORT-WATCH

**Idea:** LONG + FRESH_LONGS is a confirmed bad long context, but not an automatic short. It becomes a SHORT watch. If a SHORT confirmation fires soon after, the short has T1 backing.

Trigger watch:

- Alert/candidate direction: `LONG`
- OI regime: `FRESH_LONGS`
- Any score, but especially relevant when shadow/alert score is high enough to otherwise tempt entry

Watch window:

- 30 minutes from trigger

Manual-consider alert fires when:

- A `SHORT_CONFIRMED` for the same asset fires within the 30m T1 watch window
- Short score is 50–65, i.e. below the canonical production gate but structurally backed by T1

If the short is production-grade already, do not send a separate ⚠️; annotate the production short with T1 backing instead.

Resolution:

- `RESOLVED_CONFIRMED` if SHORT_CONFIRMED occurs in window
- `RESOLVED_EXPIRED` if no SHORT_CONFIRMED by expiry
- Track price outcomes at 30m/1h/4h from the T1 trigger and from the short entry if available

Promotion criteria:

- n >= 10 T1-backed short confirmations across different market regimes
- Positive expectancy after fees/slippage
- No catastrophic adverse behavior in uptrend regimes

### 5.2 H-N1-BLOCKED-SHORT

**Idea:** During selloff regimes, the gate may block useful SHORTs in the 50–65 score range. These should be tracked and sometimes surfaced as manual-consider shorts.

Trigger:

- Direction: `SHORT`
- Candidate was blocked/suppressed because score is below production threshold
- Score range: 50–65

Manual-consider alert fires when:

- Score >= 55
- AND broad short pressure / sell pressure context is present, e.g. one or more of:
  - cross-exchange positioning = `BROAD_SHORT_PRESSURE`
  - flow = `SELL_PRESSURE` or `DISTRIBUTION`
  - other existing diagnostic explicitly indicates confirmed short pressure

Resolution:

- Always track 30m/1h/4h directional outcomes from the blocked short trigger price
- `RESOLVED_PRICE_OUTCOME` once 4h outcome is known

Promotion criteria:

- n >= 15 blocked-short outcomes
- Average 4h directional return > +0.8%
- Hit rate and MAE acceptable enough to justify changing short gate behavior or adding a dedicated research alert

### 5.3 H-T1 + H-N1 convergence

H-T1 and H-N1 can co-occur on the same SHORT event:

- A T1 SHORT watch is active for the asset
- A blocked/under-threshold SHORT fires at score 50–65
- H-N1 conditions are also met

This is the highest-conviction hypothesis signal.

Required behavior:

- Send **one** Telegram message, not two.
- Label it with both codes:

```text
⚠️ [H-T1 + H-N1] CONSIDER SHORT — SOL [UNVALIDATED]
```

- Store one event with `hypotheses: ["H-T1-SHORT-WATCH", "H-N1-BLOCKED-SHORT"]`.
- Mention convergence explicitly in the explanation:

```text
Convergence: T1 says the prior long was structurally weak; H-N1 says the under-threshold short has selloff-regime backing.
```

### 5.4 H-C3-BTC-WEAK-PRICE

**Idea:** BTC_WEAK invalidates alt longs, but does not automatically create a clean alt-short signal.

Trigger:

- Asset: ETH or SOL or other alt
- Direction: `LONG`
- btc_gate: `BTC_WEAK_VETO_ALT_LONGS`

Alert behavior:

- No manual-consider trade alert for now.
- If it appears on a production/blocking decision, annotate as a hard block / no-long context.

Resolution:

- Track 30m/1h/4h raw and directional outcomes to determine whether BTC_WEAK alt-long failures are good enough to become an alt-short hypothesis later.

Promotion criteria:

- n >= 10 BTC_WEAK alt-long cases
- Evidence that alt underperforms enough to justify an explicit short, not merely “avoid long”

### 5.5 H-N2-FRESH-SHORTS-LONG

**Idea:** LONG + FRESH_SHORTS / short squeeze context may be structurally valid, but early adverse movement is likely. This changes management, not entry.

Trigger:

- Production `LONG_CONFIRMED`
- Shadow score >= 70 or production-grade long context
- OI regime: `FRESH_SHORTS` or closely equivalent squeeze/short-covering regime

Alert behavior:

- Do **not** send a separate ⚠️ message.
- Add inline annotation to the existing production LONG alert.

Example annotation:

```text
Pattern: H-N2 FRESH_SHORTS LONG squeeze
→ Structural long context, but sample shows 1h adverse can occur before 4h follow-through.
Management: avoid tight stop; prefer wider stop / 4h hold logic if taking trade.
Status: tentative, n=1+; not a separate signal.
```

Resolution:

- Append `ANNOTATED_PRODUCTION_ALERT` event.
- Track MFE/MAE and 30m/1h/4h outcomes.
- Explicitly store `one_hour_adverse: true/false`.

Promotion criteria:

- n >= 10 FRESH_SHORTS LONG cases
- Evidence supports a defined stop/hold policy rather than just narrative annotation

## 6. Alert messaging rules

### 6.1 Prefixes

- `⚗️` = research/watch/update; not a trade consideration
- `⚠️` = manual-consider trade alert; unvalidated, user discretion required
- Existing production alert prefixes remain unchanged

### 6.2 H-T1 watch open

```text
⚗️ [H-T1] SHORT WATCH OPEN — SOL
LONG context flagged by FRESH_LONGS OI. Watch 30m for SHORT_CONFIRMED.
Price: 93.295 | Long score: 80 | OI: FRESH_LONGS | BTC: BTC_WEAK
Expires: 13:51 UTC
Research only — not a trade signal.
```

### 6.3 H-T1 manual-consider short

```text
⚠️ [H-T1] CONSIDER SHORT — SOL [UNVALIDATED]
SHORT_CONFIRMED fired 12m after FRESH_LONGS long trap.
Short score: 58 — below production gate, T1-backed.

Entry: ~93.10
Failed long level: 93.30 | ATR: ~0.80
Stop idea: above 93.90 (+0.85%)
TP idea: 92.30 (-0.85%)

Pattern basis: FRESH_LONGS + LONG has been destructive in recent sample; this short waits for actual short confirmation instead of blindly fading.
Track outcome manually.
```

### 6.4 H-N1 manual-consider short

```text
⚠️ [H-N1] CONSIDER SHORT — ETH [UNVALIDATED]
Blocked SHORT score 58 with broad short pressure active.
Gate blocked because score <70, but recent selloff data shows under-threshold shorts can work.

Entry: ~2282.70
Stop idea: above failed level / ATR band
TP idea: 1R then reassess at 1h/4h

Pattern basis: H-N1 blocked-short hypothesis. Track outcome manually.
```

### 6.5 Combined H-T1 + H-N1 manual-consider short

```text
⚠️ [H-T1 + H-N1] CONSIDER SHORT — SOL [UNVALIDATED, CONVERGENCE]
Under-threshold SHORT fired inside active T1 watch and broad short pressure is active.

Entry: ~93.10
Short score: 58 | Prior long score: 80
OI: FRESH_LONGS | Funding/flow: BROAD_SHORT_PRESSURE / SELL_PRESSURE
Stop idea: above failed long level or ATR band
TP idea: 1R partial, reassess by 1h/4h

Pattern basis:
- H-T1: prior LONG + FRESH_LONGS is structurally weak; wait for short confirmation.
- H-N1: blocked 50–65 shorts can work in selloff regimes when pressure is broad.
This is the highest-conviction hypothesis setup, but still not production-validated.
```

### 6.6 H-N2 inline production annotation

Inside the normal LONG alert only:

```text
Pattern note: H-N2 FRESH_SHORTS LONG squeeze
→ Valid structural long candidate, but early drawdown is expected.
Management: wider stop / 4h hold logic; do not treat 1h adverse alone as invalidation.
Status: tentative, not a separate signal.
```

## 7. De-duplication rules

1. One actionable message per alert/candidate.
2. If H-T1 and H-N1 both match, send combined `[H-T1 + H-N1]` message only.
3. If a production alert already fires, do not send a duplicate hypothesis consider alert for the same direction/asset/timestamp; annotate production alert instead.
4. Do not reopen the same watch for the same asset if an unexpired watch exists; update/ignore duplicate and log it.
5. H-C3 does not send manual-consider alerts.
6. H-N2 never sends a separate alert.

## 8. Outcome tracking

For each hypothesis trigger, store:

- trigger price
- current price when resolved
- directional returns at 30m, 1h, 4h where available
- MFE/MAE over 4h if price series available
- whether production alert followed
- whether manual-consider alert was sent
- market regime tags available at trigger time

For short hypotheses, directional return is positive when price falls.

## 9. Analysis script

Add `scripts/analyze-hypotheses.js`.

Basic usage:

```bash
node scripts/analyze-hypotheses.js
node scripts/analyze-hypotheses.js --hypothesis H-T1-SHORT-WATCH
node scripts/analyze-hypotheses.js --since 2026-05-15
node scripts/analyze-hypotheses.js --json
```

Output should include:

- trigger count
- consider-alert count
- resolution breakdown
- 30m/1h/4h hit rate and average directional return
- MAE/MFE summary if available
- counts by market regime / BTC gate / OI regime
- promotion status against criteria

## 10. Implementation steps

1. Add `scripts/hypothesis-tracker.js` with pure condition classifiers and state/event helpers.
2. Add `scripts/analyze-hypotheses.js` for retrieval and promotion checks.
3. Wire tracker call into `scripts/phase1d-alerts.js` after emitted/blocked alert candidates are known.
4. Add pattern annotation support to production alert payloads/messages.
5. Add H-N2 inline annotation to production LONG alerts.
6. Add H-T1/H-N1 watch and consider-alert messages, including combined convergence behavior.
7. Add outcome resolution for active watches using existing price data.
8. Run a dry run/backfill against recent data without Telegram send enabled.
9. Verify files written:
   - `data/hypothesis-watch.json`
   - `data/hypothesis-events.jsonl`
10. Then enable live Telegram hypothesis messages.

## 11. Testing plan

Minimum checks:

- Unit-like dry-run for classifier cases:
  - H-T1 only
  - H-N1 only
  - H-T1 + H-N1 combined
  - H-C3 no-alert tracking
  - H-N2 inline annotation only
- No duplicate Telegram messages for combined H-T1 + H-N1.
- Existing production alert output unchanged except for allowed pattern annotation sections.
- Existing Phase 1d state files remain compatible.
- Analyze script can read event log and produce counts.

## 12. Open questions before coding

1. Where exactly in `phase1d-alerts.js` are blocked candidates available? If not currently preserved, add a small `blockedAlerts` array rather than reconstructing from logs.
2. Should live hypothesis alerts be behind an env/config flag for the first day? Recommended: yes, e.g. `ENABLE_HYPOTHESIS_ALERTS=true`.
3. Should ⚗️ watch-open messages be sent for every H-T1 trigger, or only when score >= 70? Recommended initial setting: send only for high-signal triggers or aggregate quietly if noisy.

## 13. Recommended initial live behavior

Start conservative:

- Enable event logging for all four hypotheses.
- Enable Telegram ⚠️ only for:
  - H-T1 + H-N1 convergence
  - H-T1 consider short where short score >=55
  - H-N1 consider short where score >=55 and pressure context is strong
- Enable H-N2 inline annotation on production LONG alerts.
- Keep H-C3 as tracking/block annotation only.

This gives Az clear manual-consider trade surfaces without turning every rejected long into a short signal.
