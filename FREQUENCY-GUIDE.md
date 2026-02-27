# Market Intelligence Frequency Guide

## TL;DR

**For finding gold + crypto entries:** Run **4x per day** (every 6 hours)

```json
"analysis_cron": "0 0,6,12,18 * * *"
```

This balances opportunity detection with signal quality.

---

## Detailed Breakdown

### 🥇 Gold Trading Characteristics

**Move timeframe:** Days to weeks (macro asset)

**Key trading sessions:**
- London AM Fix: 10:30 GMT (10:30 UTC winter, 09:30 UTC summer)
- London PM Fix: 15:00 GMT  
- NY Session: 13:30 - 20:00 UTC (highest volume)

**Typical gold trade:**
- Entry develops over 12-24 hours
- Hold time: 3-14 days
- Not suited for scalping

**Optimal analysis frequency:** 2-3x per day

---

### 💎 Crypto Trading Characteristics

**Move timeframe:** Hours to days (high volatility)

**24/7 trading:** No daily close (continuous)

**High activity windows:**
- US session: 13:00 - 21:00 UTC
- Asia wakeup: 00:00 - 02:00 UTC  
- Weekend volatility: Often big moves

**Typical crypto swing trade:**
- Entry develops over 4-12 hours
- Hold time: 1-7 days
- Faster than gold

**Optimal analysis frequency:** 4-6x per day

---

## Recommended Schedules

### 🎯 Active Trading (Recommended)
**Frequency:** 4x per day  
**Schedule:** `0 0,6,12,18 * * *`

**Analysis times:**
- **00:00 UTC** (12 AM) → Asia session review
- **06:00 UTC** (6 AM) → Europe open, London AM
- **12:00 UTC** (12 PM) → London PM, NY premarket
- **18:00 UTC** (6 PM) → NY close, evening summary

**Pros:**
- ✅ Catches both crypto and gold opportunities
- ✅ Covers all major market sessions
- ✅ Good signal refresh rate
- ✅ Reasonable cost (4 runs × ~5 min = 20 min/day)

**Cons:**
- ⚠️ More API calls than 2x/day
- ⚠️ Some signals may repeat if market is slow

**Best for:** Traders wanting regular entry opportunities across crypto and gold

---

### 🏃 Aggressive (More Entries)
**Frequency:** 6x per day  
**Schedule:** `0 */4 * * *` (every 4 hours)

**Analysis times:**
- 00:00, 04:00, 08:00, 12:00, 16:00, 20:00 UTC

**Pros:**
- ✅ Maximum entry opportunities
- ✅ Catch fast-moving crypto breakouts
- ✅ Don't miss intraday gold setups

**Cons:**
- ⚠️ Higher cost (6 runs/day)
- ⚠️ More noise (weaker signals may trigger)
- ⚠️ Signal fatigue (too many alerts)

**Best for:** Day traders, active crypto traders

---

### 🧘 Conservative (Default)
**Frequency:** 2x per day  
**Schedule:** `0 6,18 * * *`

**Analysis times:**
- **06:00 UTC** (6 AM) → Europe open
- **18:00 UTC** (6 PM) → NY close

**Pros:**
- ✅ Low cost
- ✅ High signal quality (full 12h context)
- ✅ Avoids noise

**Cons:**
- ⚠️ May miss fast crypto moves
- ⚠️ Fewer entry opportunities

**Best for:** Swing traders, position traders, beginners

---

### 🐌 Ultra Conservative
**Frequency:** 1x per day  
**Schedule:** `0 18 * * *`

**Analysis time:**
- **18:00 UTC** (6 PM) → End of day review

**Pros:**
- ✅ Very low cost
- ✅ Maximum signal quality
- ✅ Full 24h context

**Cons:**
- ⚠️ Definitely will miss some crypto opportunities
- ⚠️ Infrequent updates

**Best for:** Long-term position traders, gold macro trades only

---

## Session Coverage by Frequency

| Time (UTC) | Market Activity | 1x | 2x | 4x | 6x |
|------------|----------------|----|----|----|----|
| 00:00 | Asia open | | | ✅ | ✅ |
| 04:00 | Asia mid | | | | ✅ |
| 06:00 | Europe open | | ✅ | ✅ | |
| 08:00 | London AM | | | | ✅ |
| 12:00 | London PM / NY pre | | | ✅ | ✅ |
| 16:00 | NY midday | | | | ✅ |
| 18:00 | NY close | ✅ | ✅ | ✅ | |
| 20:00 | Evening | | | | ✅ |

---

## Cost vs Opportunity Analysis

### Cost Factors
- **Agent runtime:** ~3-5 minutes per run (4 agents × ~60s each)
- **API calls per run:**
  - crypto-market-data: 2-4 calls (BTC, ETH)
  - fear-greed: 1 call
  - gold-trading-skill: 1-2 calls
  - yahoo-finance-forex: 2-3 calls
  - macro-monitor: 5-10 web scrapes (if used)
  - **Total:** ~15-25 API calls per run

### Daily Totals

| Frequency | Runs/Day | API Calls/Day | Agent Minutes/Day |
|-----------|----------|---------------|-------------------|
| 1x | 1 | ~20 | ~5 |
| 2x | 2 | ~40 | ~10 |
| 4x | 4 | ~80 | ~20 |
| 6x | 6 | ~120 | ~30 |

**Conclusion:** 4x/day is sweet spot (80 calls, 20 min runtime)

---

## Adjusting Based on Market Conditions

### High Volatility Period
When crypto is pumping or gold is breaking major levels:

**Increase to 6x/day temporarily:**
```json
"analysis_cron": "0 */4 * * *"
```

### Low Volatility / Consolidation
When markets are range-bound:

**Decrease to 2x/day:**
```json
"analysis_cron": "0 6,18 * * *"
```

### Manual Override
Run on-demand when you see price alerts:
```bash
cd market-intel && node orchestrator.js
```

---

## Anti-Patterns (Don't Do This)

### ❌ Running Every Hour
```json
"analysis_cron": "0 * * * *"  // DON'T
```
**Why not:**
- 24 runs/day = signal fatigue
- Most "signals" are noise
- High cost, low ROI
- Agents don't have time to see pattern development

### ❌ Running Once Per Week
```json
"analysis_cron": "0 18 * * 1"  // DON'T
```
**Why not:**
- Will miss most entry opportunities
- Crypto can 2x in a week
- Gold can make major moves
- System becomes useless

---

## Testing Different Frequencies

### Week 1: Conservative (2x/day)
```json
"analysis_cron": "0 6,18 * * *"
```
Monitor: How many strong signals (≥0.7) do you get?

### Week 2: Active (4x/day)
```json
"analysis_cron": "0 0,6,12,18 * * *"
```
Monitor: Do you get more quality signals, or just noise?

### Week 3: Aggressive (6x/day)
```json
"analysis_cron": "0 */4 * * *"
```
Monitor: Is the extra frequency worth the cost?

**Then pick what works best for your trading style.**

---

## My Recommendation

Start with **4x per day** (`0 0,6,12,18 * * *`):

1. ✅ Good balance for both crypto and gold
2. ✅ Covers all major sessions
3. ✅ Catches most opportunities
4. ✅ Not excessive

After 2 weeks, adjust based on:
- How many signals you actually traded
- Signal quality (false signals?)
- Your trading style (day trading vs swing trading)

---

## Quick Reference

```bash
# Edit config.json to change frequency
nano market-intel/config.json

# Find this line:
"analysis_cron": "0 0,6,12,18 * * *"

# Change to your preferred schedule
# Then save and restart cron job
```

**Cron format:** `minute hour day month weekday`
- `0 6,18 * * *` = 6 AM and 6 PM UTC daily
- `0 */4 * * *` = Every 4 hours
- `0 0,6,12,18 * * *` = 12 AM, 6 AM, 12 PM, 6 PM UTC

---

**Current config:** 4x per day (recommended for active gold + crypto trading)
