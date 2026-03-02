# Gold Price Error - Postmortem (March 1, 2026 18:00 UTC)

## The Error

**Reported:** Gold at $2,721  
**Actual:** Gold Futures at $5,247.90 / PAXG at $5,405.24  
**Error:** -$2,526 (-48% wrong!)

## Timeline

**12:00 UTC Run:** ✅ Correct - $5,330  
**18:00 UTC Run:** ❌ WRONG - $2,721 (catastrophic failure)

## Root Cause

From the 18:04 UTC system message:

```
⚠️ **Issue: Sub-agent spawning appears to be failing**

I've spawned all 4 market analysts, but after 10+ minutes, none have produced any output:
• Crypto Analyst → No messages
• Gold Analyst → No messages  
• Macro Scout → No messages
• Sentiment Radar → No messages
```

**What happened:**
1. Orchestrator spawned 4 sub-agent sessions via `sessions_spawn`
2. All 4 sessions created but **never executed** (stuck in initialization)
3. Orchestrator waited 10+ minutes, no output received
4. Orchestrator continued anyway with **stale/cached/wrong data**
5. Delivered digest with completely incorrect prices

## Why Sub-Agents Failed

**Hypothesis:**
- Cron-triggered isolated sessions may have a spawning issue
- Gateway may have hit resource limits (22 active sessions at the time)
- Possible bug in how cron jobs spawn sub-agents
- Sessions created but never received their initial prompt

**Evidence:**
- 06:00 UTC run also had the same failure pattern
- Manual runs (08:13 UTC) worked fine
- Only cron-scheduled runs are failing to spawn sub-agents

## Impact

**User Impact:**
- Received completely wrong gold price ($2,721 vs $5,247)
- Could have made trading decisions based on bad data
- Lost trust in system accuracy

**System Impact:**
- Orchestrator logic needs fallback/validation
- No price sanity checks in place
- Failed silently (delivered bad data instead of failing loudly)

## Fixes Needed

### Immediate (Critical):

1. **Add price sanity checks:**
```javascript
if (gold_price < 3000 || gold_price > 10000) {
  ERROR: "Gold price out of realistic range, data fetch failed"
  ABORT delivery
}
```

2. **Detect sub-agent spawn failures:**
```javascript
if (all analysts return no output after 2 minutes) {
  ERROR: "Sub-agents failed to spawn"
  Fallback: Run analysis in main session instead
}
```

3. **Stop cron orchestrator from using stale data:**
```javascript
if (data_age > 10 minutes || data_source === "cached") {
  ERROR: "Stale data detected"
  ABORT delivery
}
```

### Short-term:

4. **Fix sub-agent spawning in cron context:**
- Debug why cron jobs can't successfully spawn isolated sub-agents
- Test if issue is resource limits, permissions, or bug
- Implement retry logic or fallback to sequential execution

5. **Add validation layer:**
- Compare fetched prices against previous runs
- Flag if price changes >20% without clear catalyst
- Require human confirmation for anomalous data

6. **Improve error reporting:**
- If sub-agents fail, send error alert instead of digest
- Don't deliver results when data fetch fails
- Log failures to debug file

### Long-term:

7. **Rewrite orchestrator to fail-safe:**
- If sub-agents don't work, run analysis sequentially in main session
- Option A vs Option B logic (as mentioned in 18:04 message)
- Never deliver analysis with missing/stale data

8. **Add monitoring:**
- Track sub-agent success rate
- Alert when spawning fails repeatedly
- Dashboard of data freshness

## What Should Have Happened

**When sub-agents failed at 18:00 UTC:**

❌ **What it did:**
- Continued with stale/wrong data
- Delivered digest with $2,721 gold price
- No error alert

✅ **What it should have done:**
- Detect all 4 analysts returned no output
- Send error message: "Market intel run failed - sub-agents didn't execute"
- Either retry OR run analysis directly in main session
- **Never deliver results with failed data fetch**

## Validation Rules to Implement

**Gold Price Validation:**
```
MIN: $3,000 (realistic floor for 2026)
MAX: $10,000 (realistic ceiling for 2026)
MAX_CHANGE: 20% from previous run (without major news)

if price outside range OR change >20%:
  → Require manual confirmation
  → Flag as potential data error
```

**BTC Price Validation:**
```
MIN: $40,000
MAX: $200,000
MAX_CHANGE: 15% in 6 hours (without known catalyst)
```

**Data Freshness:**
```
MAX_AGE: 15 minutes for crypto
MAX_AGE: 1 hour for gold/macro
if data_age > threshold:
  → Re-fetch
  → Don't use cached
```

## Lessons Learned

1. **Never deliver results when data fetch fails**  
   Silence > wrong information

2. **Validate all external data**  
   $2,721 gold should have triggered alarms

3. **Sub-agent spawning is unreliable in cron context**  
   Need fallback to direct execution

4. **Fail loudly, not silently**  
   Better to send "analysis failed" than wrong prices

5. **Compare against previous runs**  
   50% price change in 6 hours → something is wrong

## Action Items

- [ ] Implement price sanity checks (today)
- [ ] Add sub-agent spawn failure detection (today)
- [ ] Fix cron orchestrator to fail-safe (this week)
- [ ] Add data validation layer (this week)
- [ ] Debug why sub-agents fail in cron (investigate)
- [ ] Add monitoring dashboard (later)

## Status

**Fixed:** ❌ Not yet  
**Workaround:** Manual runs work, avoid cron until fixed  
**User notified:** ✅ Yes (admitted error, provided correct prices)

---

**Conclusion:** Critical data validation failure. System delivered completely wrong gold price ($2,721 vs $5,247) because sub-agents failed to execute and orchestrator continued with bad data. Must implement validation and fail-safe logic before next cron run.
