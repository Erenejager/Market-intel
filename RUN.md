# How to Run Market Intelligence

## 🚀 Quick Start (Recommended)

**Copy this into OpenClaw:**

```
Read and follow market-intel/agents/orchestrator-agent.md.

Coordinate all 4 market intelligence analysts (crypto, gold, macro, sentiment).
Spawn them in parallel, collect results, synthesize signals, and deliver to Telegram.

Config: market-intel/config.json
Thresholds: 0.7 immediate alert, 0.5 digest

Label: market-intel-run
Timeout: 600 seconds
```

This spawns an orchestrator agent that:
1. ✅ Launches all 4 analysts in parallel (crypto, gold, macro, sentiment)
2. ✅ Waits for completion & collects JSON results
3. ✅ Cross-references signals with confluence adjustments
4. ✅ Filters by thresholds (0.7 immediate, 0.5 digest)
5. ✅ Delivers to Telegram (@your_telegram_handle)
6. ✅ Stores in `data/signals.json`

---

## ⏰ Setting Up Cron (4x Daily)

Once tested and working, automate with cron:

**Use OpenClaw's cron tool:**

```javascript
cron({
  action: 'add',
  job: {
    name: 'market-intel-4x-daily',
    schedule: {
      kind: 'cron',
      expr: '0 0,6,12,18 * * *',
      tz: 'UTC'
    },
    payload: {
      kind: 'agentTurn',
      message: 'Read and follow market-intel/agents/orchestrator-agent.md. Coordinate all 4 analysts, synthesize signals, deliver to Telegram.'
    },
    sessionTarget: 'isolated',
    enabled: true
  }
})
```

**Schedule:**
- 00:00 UTC - Asia session
- 06:00 UTC - Europe open  
- 12:00 UTC - NY premarket
- 18:00 UTC - NY close

---

## 📊 Expected Output

### Immediate Alerts (≥ 0.7)

Sent to Telegram when signal strength ≥ 0.7:

```
🟢 GOLD BUY (82%)

Gold surging +2.32% to $5,296 as USD weakens (DXY -0.15%) 
and yields fall to 3.96%. Disinflation continuing (CPI 2.4%). 
Fed rate cut expectations building. Technical breakout above 
$5,200 confirms momentum.

Context:
• Macro: RISK_OFF (VIX 19, trade war escalating)
• Sentiment: Positive ETF flows (+1.31%)
• Adjustment: RISK_OFF macro boost (+0.05)

Market Intel @ 2026-02-27 18:00 UTC
```

### Digest (0.5-0.7)

Sent for moderate-strength signals:

```
📊 Market Intel Digest

• **BTC**: WATCH (62%) - Consolidation in $64k-$68k range, 
  waiting for clearer direction
• **ETH**: WATCH (58%) - Following BTC weakness, low conviction

**Macro:** RISK_OFF environment - VIX elevated at 19, US-China 
trade war (145%/125% tariffs), Fed holding rates on inflation

**Sentiment:** Crypto EXTREME_FEAR (13) = contrarian buy opportunity

2026-02-27 18:00 UTC
```

---

## 🔍 Monitoring & Debugging

**Check orchestrator status:**
```javascript
sessions_list({ limit: 5 })
```

**View orchestrator output:**
```javascript
sessions_history({ label: 'market-intel-run' })
```

**Check stored signals:**
```bash
cat market-intel/data/signals.json | jq '.[0]'
```

---

## 📝 Files Generated

After each run:
- `market-intel/data/signals.json` - Last 100 signal runs (historical)
- Telegram messages sent to @your_telegram_handle (immediate + digest)

---

## ⚙️ Customization

**Change thresholds:**
Edit `market-intel/config.json`:
```json
{
  "thresholds": {
    "immediate_alert": 0.75,  // More selective
    "include_in_digest": 0.6   // Higher bar
  }
}
```

**Change frequency:**
Modify cron schedule:
- 2x daily: `0 6,18 * * *`
- 6x daily: `0 */4 * * *`
- 1x daily: `0 18 * * *`

**Disable agents:**
Edit `config.json`:
```json
{
  "agents": {
    "sentiment_radar": {
      "enabled": false  // Skip this agent
    }
  }
}
```

---

**Ready to run?** Use the Quick Start prompt above! 🚀
