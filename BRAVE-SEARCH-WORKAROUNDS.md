# Brave Search API Workarounds

## Current Limitations

**Free Plan:**
- Rate: 1 request/second
- Quota: 2,000 searches/month
- Current usage: ~1,134/2,000 (57%)

**Impact:**
- Orchestrator hit 8 rate limit errors in last run
- Some searches failed, incomplete data collected
- Close to monthly quota with 4x daily runs

## Solution 1: Use Direct APIs (Eliminate 50% of searches)

### Replace Search with API Calls

| Data Needed | Current (Search) | Better (API/Script) | Quota Saved |
|-------------|------------------|---------------------|-------------|
| BTC/ETH/SOL prices | `web_search("BTC price")` | `exec("node get_crypto_price.js bitcoin")` | ✅ 3/run |
| Fear & Greed | `web_search("fear greed")` | `web_fetch("https://api.alternative.me/fng/")` | ✅ 1/run |
| Gold futures | `web_search("gold GC=F")` | `web_fetch("https://www.tradingview.com/symbols/COMEX-GC1!/")` | ✅ 1/run |
| VIX index | `web_search("VIX")` | `web_fetch("https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX")` | ✅ 1/run |
| Fed rates | Search ✅ | Keep search (no free API) | - |
| Crypto news | Search ✅ | Keep search (no free API) | - |
| DXY dollar | `web_search("DXY")` | `web_fetch` from Yahoo Finance | ✅ 1/run |

**Savings:** ~7 searches per run × 4 runs/day = **28 searches/day saved** (840/month)

### Implementation

**Update crypto-analyst.md:**
```markdown
## Step 1: Prices (NO SEARCH)
exec("cd skills/crypto-market-data/scripts && node get_crypto_price.js bitcoin ethereum solana")

## Step 2: Sentiment (NO SEARCH)  
web_fetch("https://api.alternative.me/fng/?limit=1")

## Step 3: News (USE SEARCH - no alternative)
web_search("Bitcoin crypto news today", freshness="pd", count=3)
```

**Update macro-scout.md:**
```markdown
## Step 1: VIX (NO SEARCH)
web_fetch("https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX?interval=1d&range=1d")

## Step 2: Fed Policy (USE SEARCH)
web_search("Federal Reserve policy news", freshness="pw", count=3)

## Step 3: Geopolitical (USE SEARCH)
web_search("geopolitical risk news", freshness="pd", count=2)
```

## Solution 2: Sequential Search with Delays

Add 1.5 second delays between searches to respect rate limits.

**Update orchestrator-agent.md:**

```markdown
When gathering data for analysts, if using web_search:

1. Never call web_search in parallel (causes 429 errors)
2. Add 1.5 second delay between searches:
   - Search 1 → sleep 1.5s → Search 2 → sleep 1.5s → etc.
3. Limit to 5 searches per analyst max

Example:
```javascript
web_search("Fed policy news")
exec("sleep 1.5")  // Respect rate limit
web_search("VIX volatility")
exec("sleep 1.5")
web_search("geopolitical news")
```

**Impact:** Adds ~7 seconds to orchestrator run, but prevents failures
```

## Solution 3: Batch & Prioritize Searches

**Only search for what you can't get elsewhere:**

**Priority 1 (Must search):**
- Breaking crypto news (no free API)
- Fed policy updates (no free API)
- Geopolitical events (no free API)

**Priority 2 (Can use APIs):**
- Prices (CoinGecko, Yahoo Finance)
- Volatility indices (Yahoo Finance)
- Sentiment (Alternative.me)

**New orchestrator logic:**
```
1. Fetch all API data first (prices, sentiment, VIX) ← 0 searches
2. Search only for news/events (3-5 searches max) ← Rate-limit friendly
3. Synthesize signals
```

**Quota usage:** 
- Before: ~10 searches/run × 4 runs = 40/day = 1,200/month
- After: ~3 searches/run × 4 runs = 12/day = 360/month ✅

## Solution 4: Upgrade Brave Plan (If Needed)

**Free Plan:** 2,000 searches/month, 1/second
**Pro Plan ($5/month):** 20,000 searches/month, 10/second

**When to upgrade:**
- If hitting quota limit regularly
- If need faster parallel searches
- Current usage: 1,134/2,000 (57%) → safe for now

**Recommendation:** Implement Solutions 1-3 first (free). Only upgrade if still hitting limits.

## Solution 5: Cache News Results

For less time-sensitive data (macro trends, not breaking news):

```javascript
// Check if we searched in last hour
if (cached_macro_news && age < 1_hour) {
  use_cache()
} else {
  web_search("Fed policy")
  save_to_cache()
}
```

**Impact:** Reduces duplicate searches for same info across runs

## Recommended Implementation Order

1. ✅ **Use crypto-market-data scripts** (already done)
2. ✅ **Use Alternative.me API** for Fear & Greed (already done)
3. 🔄 **Add Yahoo Finance API** for VIX, DXY, yields (do next)
4. 🔄 **Add sequential delays** between searches (prevent 429s)
5. 🔄 **Limit searches** to news only (3-5 per run)
6. ⏳ **Monitor quota** - upgrade if needed

## Expected Impact

**Current:**
- 10 searches/run, hit rate limits, incomplete data
- 1,200 searches/month (60% of quota)

**After fixes:**
- 3-5 searches/run, no rate limits, complete data
- 360-600 searches/month (18-30% of quota)
- Faster runs (no retry delays)

---

**Status:** Solutions 1 & 2 ready to implement
**Priority:** HIGH - improves reliability and speed
**Effort:** Low (just update analyst instructions)
