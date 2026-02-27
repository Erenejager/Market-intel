# Market Intelligence Hub

Multi-agent system for crypto, gold, and macro market analysis with automated signal generation and Telegram delivery.

## Architecture

**Orchestrator** (orchestrator.js):
- Spawns 4 specialized sub-agents in parallel
- Collects JSON results from each agent
- Cross-references signals (crypto + gold + macro + sentiment)
- Synthesizes actionable recommendations
- Delivers to Telegram based on signal strength thresholds

**Sub-Agents:**
1. **📈 Crypto Analyst** - BTC/ETH price action, on-chain metrics, Fear & Greed
2. **🥇 Gold Analyst** - Gold price, USD correlation, DXY, inflation signals
3. **🌍 Macro Scout** - Fed policy, economic data, VIX, geopolitical events
4. **📡 Sentiment Radar** - Fear/Greed index, social sentiment, funding rates

Each agent is an isolated OpenClaw session that:
- Reads its instruction file (`agents/*.md`)
- Uses installed skills for data (see `SKILLS-GUIDE.md`)
- Returns pure JSON output (no markdown, no explanation)
- Auto-deletes after completion

---

## Signal Format

Each agent returns JSON with **complete trade entry specifications**:

```json
{
  "asset": "BTC|ETH|GOLD",
  "signal": "BUY|SELL|HOLD|WATCH",
  "strength": 0.75,
  "reasoning": "Concise explanation citing technical, on-chain, and macro factors",
  "price_current": 67565,
  "price_24h_change": 1.2,
  
  "entry": {
    "optimal": 65200,
    "range": [65000, 65400],
    "order_type": "LIMIT",
    "timeframe": "4H"
  },
  
  "stop_loss": {
    "price": 64000,
    "percent": -1.84,
    "reasoning": "Below key support and 1.5x ATR"
  },
  
  "take_profit": {
    "tp1": { "price": 67500, "percent": 3.5, "r_to_r": 1.9 },
    "tp2": { "price": 69000, "percent": 5.8, "r_to_r": 3.2 },
    "tp3": { "price": 71000, "percent": 8.9, "r_to_r": 4.8 }
  },
  
  "position_sizing": {
    "risk_percent": 2,
    "account_size": 10000,
    "position_value": 1090,
    "units": 0.0167
  },
  
  "technical_levels": {
    "support": [64000, 62500, 60000],
    "resistance": [67500, 69000, 71000]
  },
  
  "sources": ["https://...", "skill: crypto-market-data"]
}
```

**Signal strength:**
- `0.7-1.0` → Strong conviction (immediate Telegram alert) + **Full trade specs**
- `0.5-0.7` → Moderate (include in daily digest) + **Full trade specs**
- `0.0-0.5` → Weak/neutral (log only, no delivery, no trade specs)

**See:** `TRADE-ENTRIES.md` for calculation methodology and `QUICK-REFERENCE.md` for cheat sheet.

---

## Delivery Rules

**Immediate Alerts (≥ 0.7):**
```
🟢 BTC BUY (75%)

BTC broke above $65k resistance with strong volume. 
On-chain metrics show whale accumulation. Fear & Greed 
at 45 (Fear) = contrarian opportunity. Fed rate cut 
expectations building.

Context:
• Macro: Dovish Fed, falling yields
• Sentiment: Fear (45) - room to run

Market Intel @ 2026-02-27 18:00 UTC
```

**Daily Digest (≥ 0.5, < 0.7):**
```
📊 Market Intel Digest

• BTC: WATCH (60%) - Holding $65k support, awaiting macro catalyst
• GOLD: BUY (65%) - DXY weakening, real yields negative
• ETH: HOLD (55%) - Consolidation phase, low conviction

Macro: Fed signals patience on cuts. CPI at 3.2% (above target).

2026-02-27 18:00 UTC
```

---

## Files

```
market-intel/
├── orchestrator.js          # Main coordinator (spawns agents, synthesizes signals)
├── config.json              # Thresholds, schedules, Telegram settings
├── agents/
│   ├── crypto-analyst.md    # Crypto agent instructions
│   ├── gold-analyst.md      # Gold agent instructions
│   ├── macro-scout.md       # Macro agent instructions
│   └── sentiment-radar.md   # Sentiment agent instructions
├── data/
│   └── signals.json         # Historical signals (last 100 runs)
├── SKILLS-GUIDE.md          # Skill usage patterns for each agent
├── FINAL-SKILL-STACK.md     # Installed skills + test results
├── test-spawn.md            # Manual testing guide
└── README.md                # This file
```

---

## Current Status

✅ **Completed:**
- [x] Project structure created
- [x] Agent instruction files written (4 agents)
- [x] Config file with thresholds and schedules
- [x] Skill stack finalized (8 skills installed & verified)
- [x] Orchestrator implemented (simulation mode)
- [x] Test guide created

⏭️ **Next Steps:**
1. **Test single agent spawn** - Use `test-spawn.md` to manually spawn crypto analyst
2. **Verify JSON output** - Ensure agent returns valid, parseable JSON
3. **Update orchestrator** - Replace simulation code with real `sessions_spawn()`
4. **Test full orchestration** - Run all 4 agents in parallel with `--test all`
5. **Set up cron job** - Automate twice-daily runs (6 AM, 6 PM UTC)
6. **Monitor and iterate** - Tune thresholds, improve agent prompts based on real signals

---

## Testing

### Manual Agent Spawn (Recommended First Step)

Copy this prompt into OpenClaw:

```
Spawn a crypto analyst agent:

Task: Read and follow the instructions in market-intel/agents/crypto-analyst.md. 
Analyze BTC and ETH markets using the crypto-market-data and fear-greed skills. 
Return ONLY valid JSON with your analysis. No markdown code blocks.

Label: crypto-analyst-test
Timeout: 300 seconds
Cleanup: delete
```

Then check the result:
```javascript
sessions_history({ label: 'crypto-analyst-test' })
```

Expected output: Valid JSON matching the signal format above.

See `test-spawn.md` for testing all 4 agents.

### Orchestrator Simulation

```bash
cd market-intel
node orchestrator.js --test all
```

This runs in simulation mode:
- Shows what would happen
- Doesn't spawn real agents
- Doesn't send Telegram messages
- Useful for checking workflow logic

### Full Production Run

```bash
cd market-intel
node orchestrator.js
```

Spawns all enabled agents, synthesizes signals, delivers to Telegram.

---

## Configuration

See `config.json`:

```json
{
  "schedule": {
    "analysis_cron": "0 6,18 * * *",  // 6 AM and 6 PM UTC
  },
  "thresholds": {
    "immediate_alert": 0.7,            // Send alert now
    "include_in_digest": 0.5           // Include in summary
  },
  "telegram": {
    "channel": "telegram",
    "to": "@your_telegram_handle"
  }
}
```

---

## Cron Setup (Future)

Once tested and working, create a cron job:

```json
{
  "name": "market-intel-analysis",
  "schedule": {
    "kind": "cron",
    "expr": "0 6,18 * * *",
    "tz": "UTC"
  },
  "payload": {
    "kind": "agentTurn",
    "message": "Run market intelligence analysis: cd market-intel && node orchestrator.js"
  },
  "sessionTarget": "isolated",
  "enabled": true
}
```

---

## Skills Used

See `FINAL-SKILL-STACK.md` for complete inventory.

**Key skills:**
- `crypto-market-data` - BTC/ETH prices (no API key)
- `fear-greed` - Sentiment index (no API key)
- `gold-trading-skill` - Gold spot prices
- `yahoo-finance-forex` - Forex rates + USD sentiment
- `market-environment-analysis` - Macro regime detection
- `macro-monitor` - Free economic data scraping

**Fallback:** Built-in `web_search` and `web_fetch` for news/events

---

## Workflow Diagram

```
Cron Trigger (6 AM / 6 PM UTC)
    ↓
Orchestrator starts
    ↓
Spawn 4 agents in parallel
    ├─ Crypto Analyst → JSON
    ├─ Gold Analyst → JSON
    ├─ Macro Scout → JSON
    └─ Sentiment Radar → JSON
    ↓
Wait for all (with timeout)
    ↓
Parse JSON from each agent
    ↓
Synthesize signals
    ├─ Cross-reference (crypto + macro + sentiment)
    ├─ Adjust strength based on confluence
    └─ Generate recommendations
    ↓
Store to data/signals.json
    ↓
Check thresholds
    ├─ ≥ 0.7 → Immediate Telegram alert
    ├─ ≥ 0.5 → Add to digest
    └─ < 0.5 → Log only
    ↓
Deliver to Telegram
    ↓
Done ✅
```

---

**Status:** 🏗️ Ready for Testing (Feb 27, 2026)

Next: Test crypto analyst spawn manually → Verify JSON output → Implement real orchestrator
