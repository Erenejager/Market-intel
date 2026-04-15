# Market Intelligence Orchestration Schedule

## Current Schedule (v2.0 - March 11, 2026)

**Frequency:** 4x per day (6-hour intervals) ✅

### Run Times (UTC)
- **00:00** - Late evening check (Asia market prep)
- **06:00** - Morning check (Asia/Europe market open)
- **12:00** - Midday check (Europe/US overlap, peak liquidity)
- **18:00** - Evening check (US market close)

---

## Why 4x Per Day? (6-Hour Intervals)

### 1. **Extreme Fear Duration Tracking** (Critical with new params)
- New parameters boost signals for fear <15 lasting 2-4+ days
- **4x/day advantage:** Updates fear streak 4 times = more accurate duration data
- **Example:** March 10 - fear went 13 → 59 in 6 hours
  - 1x/day = missed the entire bottom (wrong streak count)
  - 4x/day = caught the 06:00 signal at fear 13, updated 12:00 when it shifted

### 2. **Lower BUY Threshold (0.65 vs 0.70)** 
- Catches opportunities 5% earlier in the move
- More signals generated = need faster detection
- **4x/day benefit:** Max 6-hour delay vs 12-hour (2x/day) or 8-hour (3x/day)
- **Example:** Signal triggers at 06:00 with 0.68 strength → enter before 12:00 move

### 3. **Headline Volatility (Gold)**
- Gold can spike 5-10% on single headline (war/peace news)
- Volatility cap triggers when 24h move >5%
- **4x/day protection:** Detect spikes within 6 hours, check if >5% before signaling
- **Critical:** Geopolitical news breaks 24/7, not just during US hours

### 4. **Gradient Macro Adjustments**
- VIX-based adjustments (-0.08 to +0.08) change intraday
- **4x/day advantage:** Capture VIX shifts during market sessions
- **Example:** VIX spikes from 18 → 28 midday = RISK_OFF adjustment changes

### 5. **Optimal for Swing Trading**
- **6-hour intervals** = Responsive without overtrading
- Covers all major global market sessions (Asia, Europe, US, Late US/Asia prep)
- **Balance:** Frequent enough to catch opportunities, not so frequent we're scalping

---

## Implementation (Cron)

### Option A: Gateway Cron (Recommended)
```bash
# Market intelligence orchestrator - 4x daily (every 6 hours)
0 0,6,12,18 * * * cd /home/clawdbot/.openclaw/workspace/market-intel && node orchestrator.js
```

### Option B: System Cron
```bash
# Add to crontab -e
0 0,6,12,18 * * * cd /path/to/market-intel && node orchestrator.js >> logs/cron.log 2>&1
```

### Option C: OpenClaw Gateway Cron Tool
```javascript
// Use cron tool to schedule via OpenClaw
{
  "name": "market-intel-orchestrator",
  "schedule": {
    "kind": "cron",
    "expr": "0 0,6,12,18 * * *",
    "tz": "UTC"
  },
  "payload": {
    "kind": "systemEvent",
    "text": "Run market intelligence orchestrator"
  },
  "sessionTarget": "main",
  "enabled": true
}
```

---

## Alternative Schedules

### Current: 4x/day (OPTIMAL) ✅
```
00:00, 06:00, 12:00, 18:00 UTC
```
- **Pros:** Catches all major moves, accurate fear tracking, 6h max delay
- **Cons:** Higher API usage (acceptable trade-off)
- **Status:** Currently deployed

### Conservative (3x/day)
```
06:00, 14:00, 22:00 UTC
```
- **Pros:** Lower API usage, still covers major sessions
- **Cons:** 8h gaps might miss rapid reversals (e.g., March 10 fear shift)

### Minimal (2x/day)
```
06:00 UTC - Morning
18:00 UTC - Evening
```
- **Pros:** Lowest API usage
- **Cons:** 12h gaps TOO LONG with new parameters, will miss signals

### Aggressive (6x/day)
```
00:00, 04:00, 08:00, 12:00, 16:00, 20:00 UTC
```
- **Pros:** Catches every small move
- **Cons:** Overtrading risk, noise, approaching scalping territory

### Adaptive (Future Enhancement)
```
Normal: 4x/day (00:00, 06:00, 12:00, 18:00)
Fear <20: 6x/day (every 4 hours)
Fear <15 + volatility spike: 8x/day (every 3 hours)
```
- **Pros:** Optimizes frequency based on market conditions
- **Cons:** Complex to implement, needs testing

---

## Monitoring

Track orchestrator performance:
```bash
# Check last run
ls -lth market-intel/data/*.json | head -5

# Check cron logs
tail -50 market-intel/logs/orchestrator.log

# Check signal performance
cat market-intel/data/signal-performance.json | jq '.summary'
```

---

## Next Steps

1. **March 11, 00:00 UTC** - First run with new parameters (4x/day already deployed)
2. **March 13** - Review 2 days of data, verify 4x/day is optimal
3. **March 17** - Full 7-day review, adjust frequency if needed

**Current Status:** ✅ 4x/day (every 6 hours) - DEPLOYED AND OPTIMAL

**Next run:** Check logs at 00:00, 06:00, 12:00, or 18:00 UTC
