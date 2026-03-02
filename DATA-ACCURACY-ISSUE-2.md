# Data Accuracy Issue #2 - BTC/ETH Wrong Prices

**Date:** March 2, 2026 10:15 UTC  
**Run:** Manual orchestrator run (10:09 UTC)

---

## The Error

**Reported by orchestrator:**
- BTC: $67,065
- ETH: $2,003.83

**User reported (actual):**
- BTC: $66,106
- ETH: $1,944

**Verified with CoinGecko:**
- BTC: $66,141 (user correct ✓)
- ETH: $1,946.35 (user correct ✓)

**Discrepancy:**
- BTC: Off by $924 (1.4% error)
- ETH: Off by $57 (2.9% error)

---

## Pattern Analysis

**This is the 2nd major data error:**

### Error #1 (March 1, 18:00 UTC):
- Reported: Gold $2,721
- Actual: Gold $5,248
- Error: 48% off
- Cause: Sub-agents failed to execute, orchestrator used stale data

### Error #2 (March 2, 10:09 UTC):
- Reported: BTC $67,065, ETH $2,003
- Actual: BTC $66,141, ETH $1,946
- Error: 1.4-2.9% off
- Cause: TBD (sub-agents DID execute this time)

---

## Key Difference

**Error #1:**
- Sub-agents FAILED (0 messages)
- Orchestrator continued with bad data ❌

**Error #2:**
- Sub-agents SUCCEEDED (produced output)
- But fetched WRONG prices ❌

**This suggests the sub-agents themselves are using stale/cached data.**

---

## Hypothesis: Data Caching Issue

**Possible causes:**

### 1. CoinGecko API Caching
The crypto-market-data script hits CoinGecko API, which might return cached data.

**Test:**
```bash
# Run twice in a row
node get_crypto_price.js bitcoin
sleep 1
node get_crypto_price.js bitcoin
```

If they return different values, API is fine.  
If same value despite price movement, API is caching.

### 2. Node.js Script Caching
The `get_crypto_price.js` script might cache results internally.

**Check:**
- Does script have any caching logic?
- Are results stored in temp files?

### 3. Sub-Agent Execution Delay
The sub-agents might fetch data at spawn time (10:09) but report at completion time (10:14).

**Timeline:**
- 10:09: Spawn agents
- 10:09: Agents fetch prices ($67,065 / $2,003)
- 10:14: Agents complete and report
- 10:15: User checks prices ($66,141 / $1,946)
- **5-6 minute gap** where prices moved

**BTC moved:** $67,065 → $66,141 = -$924 in 5 minutes  
**ETH moved:** $2,003 → $1,946 = -$57 in 5 minutes

**This is PLAUSIBLE** - BTC can move $900 in 5 minutes during volatile periods.

---

## Investigation Steps

### Step 1: Check if prices moved during run

**Timeline reconstruction:**
- 10:09:00 - Orchestrator spawned
- 10:09:30 - Crypto analyst likely fetched prices
- 10:14:30 - Orchestrator synthesized and delivered
- 10:15:32 - User checked prices

**If BTC was $67,065 at 10:09 and $66,141 at 10:15:**
- That's -$924 in 6 minutes
- -1.4% move in 6 minutes
- **Unlikely but possible** during panic/volatility

**Need:** Historical price data for 10:09-10:15 UTC window

### Step 2: Check CoinGecko API freshness

```bash
# Test API response time
for i in {1..5}; do
  echo "Request $i:"
  node get_crypto_price.js bitcoin | jq '.bitcoin.usd'
  sleep 10
done
```

If all 5 requests return same price for 50 seconds despite market moving, API is caching.

### Step 3: Add timestamps to data fetches

**Modify crypto-analyst.md:**
```
After fetching price, include timestamp:
{
  "price": 66141,
  "fetched_at": "2026-03-02T10:09:32Z",
  "source": "coingecko"
}
```

This way we can verify if prices are stale.

### Step 4: Compare against multiple sources

**Add backup price check:**
- CoinGecko (primary)
- Binance API (backup)
- Kraken API (backup)

If all 3 disagree significantly, flag as error.

---

## Impact Assessment

### Error #1 (Gold $2,721):
- **Severity:** CRITICAL (48% off)
- **Impact:** Would have caused massive bad trade
- **Caught by:** User immediately
- **Prevented by:** Validation rules (post-fix)

### Error #2 (BTC/ETH):
- **Severity:** MODERATE (1.4-2.9% off)
- **Impact:** Entry zones slightly wrong, but still usable
- **Caught by:** User immediately
- **Prevention:** None yet (validation didn't catch <3% error)

---

## Recommended Fixes

### Fix 1: Tighten Validation (Immediate)

**Current validation:**
- BTC: $40k-$200k (very wide)
- ETH: $1k-$15k (very wide)

**New validation:**
- Check against PREVIOUS run's price
- Flag if >5% change in <1 hour
- Flag if >2% change in <10 minutes

**Example:**
```javascript
// Last run: BTC $66,141 at 10:09
// Current run: BTC $67,065 at 10:14 (5 min later)
// Change: +1.4% in 5 minutes

if (change_pct > 2% AND time_diff < 600s) {
  WARNING: "Price changed +1.4% in 5 min - verify data freshness"
  PROMPT: "Fetch again to confirm"
}
```

### Fix 2: Add Timestamp Verification

**Require:**
- Every price fetch MUST include timestamp
- Compare fetch time vs current time
- If >2 minutes old, re-fetch

**Example:**
```javascript
{
  "btc_price": 66141,
  "fetched_at": "2026-03-02T10:09:32Z",
  "age_seconds": 312  // 5+ minutes old!
}

if (age_seconds > 120) {
  RE_FETCH: "Price data >2 min old, fetching fresh data"
}
```

### Fix 3: Multi-Source Validation

**Fetch from 2+ sources:**
```javascript
coingecko_btc = 66141
binance_btc = 66150
difference = 9  // $9 difference

if (difference > 100) {
  ERROR: "Sources disagree by $" + difference
  ABORT: "Cannot determine accurate price"
}

// Use average of sources
final_btc_price = (66141 + 66150) / 2 = 66145.5
```

### Fix 4: Price Movement Sanity Check

**Expected volatility limits:**
- BTC: Max 2% in 10 minutes (normal)
- BTC: Max 5% in 1 hour (volatile)
- ETH: Max 3% in 10 minutes
- ETH: Max 6% in 1 hour

**If exceeded:**
```javascript
btc_change_10min = 1.4%  // $67,065 → $66,141

if (btc_change_10min > 2%) {
  WARNING: "BTC moved 1.4% in 10 min - higher than normal"
  ACTION: "Re-fetch to confirm real movement vs stale data"
}
```

---

## Next Steps

**Immediate (Today):**
1. Check if $67,065 was real BTC price at 10:09 (historical data)
2. Test CoinGecko API for caching/staleness
3. Add timestamps to all price fetches

**Short-term (This Week):**
4. Implement tighter validation (>2% in 10 min = flag)
5. Add multi-source price fetching (CoinGecko + Binance)
6. Test orchestrator runs with new validation

**Long-term:**
7. Consider upgrading to paid API with guaranteed freshness
8. Add real-time WebSocket price feeds (no polling lag)

---

## User Impact

**This time:**
- User caught error immediately ✓
- Entry signals still mostly valid (minor price difference)
- No bad trades executed

**But:**
- Trust in system degraded
- Need to manually verify every signal
- System cannot be relied upon autonomously

**Priority:** Fix data accuracy ASAP before next run.

---

## Status

**Root cause:** Unknown (investigating)  
**Severity:** MODERATE (1.4-2.9% error)  
**User trust:** Degraded (2nd error in 24h)  
**Action:** Investigating + adding tighter validation  
**Next run:** Hold until fixed
