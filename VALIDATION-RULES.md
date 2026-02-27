# Market Intelligence Price Validation Rules

**Status:** ✅ ACTIVE (implemented in orchestrator-agent.md)  
**Last Updated:** 2026-03-01 18:45 UTC

## Purpose

Prevent delivery of obviously wrong price data to the user. After the $2,721 gold error (actual: $5,248), validation is mandatory.

---

## Validation Steps (Execute Before Synthesis)

### 1. Price Range Validation

**Gold (GC=F or PAXG):**
- Minimum: $3,000
- Maximum: $10,000
- Rationale: Realistic 2026 range given current ~$5,200 level

**Bitcoin (BTC):**
- Minimum: $40,000
- Maximum: $200,000
- Rationale: Covers bear to extreme bull scenarios

**Ethereum (ETH):**
- Minimum: $1,000
- Maximum: $15,000
- Rationale: Covers 80% crash to 5x rally

**Solana (SOL):**
- Minimum: $20
- Maximum: $500
- Rationale: Wide range for volatile alt

**Action if out of range:**
- ❌ ABORT synthesis
- ⚠️ Send validation error to Telegram
- 📝 Log to `market-intel/data/failures.json`
- ⛔ DO NOT deliver any signals

---

### 2. Change Detection (vs Previous Run)

Compare current prices against last successful run in `signals.json`:

**Thresholds:**
- BTC/ETH: >25% change in 6 hours = suspicious
- Gold: >20% change in 6 hours = suspicious
- SOL: >30% change in 6 hours = acceptable (more volatile)

**Known exceptions (bypass check):**
- Major news events: war, Fed emergency meeting, exchange hack
- Black swan events: COVID-level panic
- Flash crash recovery (check both directions)

**Action if threshold exceeded:**
- ⚠️ Flag for review
- 📢 Alert user: "Price changed [X]% - verify data source"
- ⏸️ Hold delivery pending confirmation
- 🔍 Prompt user: "Proceed with delivery? (y/n)"

---

### 3. Data Freshness Check

**Maximum age:**
- Crypto prices: 15 minutes
- Gold prices: 1 hour
- Macro data (VIX, Fed rates): 24 hours

**How to check:**
- Parse timestamp from data source
- Compare `now - data_timestamp`
- If age > threshold → re-fetch

**Action if stale:**
- 🔄 Attempt re-fetch (1 retry)
- ❌ If still stale after retry → ABORT
- ⚠️ Alert user: "Data fetch failed, run aborted"

---

### 4. Sub-Agent Execution Check

**Problem:** Sub-agents sometimes spawn but never execute (seen in 06:00 and 18:00 UTC runs).

**Detection:**
- After spawning, wait 2 minutes
- Check `sessions_history` for each agent
- If message count = 0 or no JSON output → failure

**Action if sub-agents fail:**
- ❌ ABORT immediately (do NOT use cached data)
- ⚠️ Send error to Telegram: "Analysts failed to execute"
- 📝 Log failure with session keys
- 🔄 Optionally: Fallback to sequential execution (future improvement)

---

## Validation Error Alert Format

Send to Telegram chat ID YOUR_TELEGRAM_CHAT_ID:

```
⚠️ **Market Intel Validation Failed**

**Run:** [timestamp]
**Issue:** [description]

**Failed checks:**
• Gold: $2,721 (expected: $3,000-$10,000) ❌
• BTC: $99,887 (expected: $40,000-$200,000) ❌

**Action:** Run aborted. No signals delivered.

**Logs:** market-intel/data/failures.json
**Next run:** [next scheduled time]

Manual run available: /run_market_intel
```

---

## Failure Log Format

Store in `market-intel/data/failures.json`:

```json
{
  "timestamp": "2026-03-01T18:00:00Z",
  "failure_type": "PRICE_VALIDATION_ERROR",
  "details": {
    "gold_price": 2721,
    "gold_expected_range": [3000, 10000],
    "btc_price": 99887,
    "btc_expected_range": [40000, 200000],
    "sub_agents_status": {
      "crypto_analyst": "no_output",
      "gold_analyst": "no_output",
      "macro_scout": "no_output",
      "sentiment_radar": "no_output"
    }
  },
  "action_taken": "ABORTED_DELIVERY",
  "next_run": "2026-03-02T00:00:00Z"
}
```

---

## Testing Checklist

Before next production run, verify:

- [ ] Price validation catches $2,721 gold (out of range)
- [ ] Change detection catches 50% swings
- [ ] Sub-agent failure detection works
- [ ] Error alerts deliver to Telegram correctly
- [ ] Failure log writes successfully
- [ ] System fails gracefully (no partial delivery)

---

## Override Procedure (Emergency)

If user confirms unusual price is real (e.g., flash crash, exchange issue):

1. User sends: "Override validation for [asset] at $[price]"
2. Orchestrator sets temporary flag: `validation_override = true`
3. Runs validation with override
4. Clears flag after delivery
5. Logs override event

**Use sparingly** - only for genuine market events.

---

## Success Criteria

✅ No wrong prices delivered  
✅ All validations pass before synthesis  
✅ Failures alert user immediately  
✅ System fails safe (no data > wrong data)

**Last known failure:** 2026-03-01 18:00 UTC ($2,721 gold error)  
**Next test:** 2026-03-02 00:00 UTC scheduled run
