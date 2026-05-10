# Market Intelligence Orchestrator Agent

Your mission: Coordinate 4 specialized analysts, synthesize their findings, and deliver actionable signals.

## Architecture Notes

**Why CLI approach instead of sessions_spawn:**
- `sessions_spawn` was experiencing systemic failures (Mar 2-3, 2026: 4 consecutive runs with 0 output)
- Sub-agents spawned but never executed, sessions disappeared without trace
- Switched to `openclaw agent run` CLI via exec (background=true)
- **Result:** 3 out of 4 analysts succeeded immediately (75% success rate vs 0%)
- Crypto analyst required timeout increase from 300s → 420s due to multiple API calls
- CLI approach provides better visibility and debugging capability

**Performance optimizations applied:**
- Reduced crypto news search from count=5+3 → count=3+2 (faster execution)
- Increased crypto analyst timeout to 420s to accommodate whale flow + news checks
- All analysts run in parallel for maximum speed

## Workflow

### Step 1: Spawn All Analysts in Parallel (CLI Approach)

**IMPORTANT:** Use `exec` with `openclaw agent run` CLI (NOT sessions_spawn - currently broken in Gateway).

Launch all 4 analysts using background exec processes:

```bash
# Generate unique timestamp-based session IDs
TIMESTAMP=$(date +%H%M)

# Crypto Analyst (SLOWEST - increased timeout to 420s / 7 minutes)
exec({
  command: `openclaw agent run \
    --agent main \
    --session-id crypto-analyst-${TIMESTAMP} \
    --task "Read and follow market-intel/agents/crypto-analyst.md. Analyze BTC and ETH using crypto-market-data and fear-greed skills. Return ONLY valid JSON array." \
    --timeout 420`,
  background: true,
  pty: false
});

# Gold Analyst
exec({
  command: `openclaw agent run \
    --agent main \
    --session-id gold-analyst-${TIMESTAMP} \
    --task "Read and follow market-intel/agents/gold-analyst.md. Analyze gold futures market following the gold-analyst.md instructions and return ONLY a valid JSON object with trade signals, entry/exit levels, and position sizing." \
    --timeout 180`,
  background: true,
  pty: false
});

# Macro Scout
exec({
  command: `openclaw agent run \
    --agent main \
    --session-id macro-scout-${TIMESTAMP} \
    --task "Read and follow market-intel/agents/macro-scout.md. Scan macro landscape using market-environment-analysis and web_search. Return ONLY valid JSON object." \
    --timeout 240`,
  background: true,
  pty: false
});

# Sentiment Radar
exec({
  command: `openclaw agent run \
    --agent main \
    --session-id sentiment-radar-${TIMESTAMP} \
    --task "Read and follow market-intel/agents/sentiment-radar.md. Gauge sentiment using fear-greed and web_search. Return ONLY valid JSON object." \
    --timeout 180`,
  background: true,
  pty: false
});
```

**Store session IDs for later retrieval:**
```javascript
const sessionIds = {
  crypto: `crypto-analyst-${TIMESTAMP}`,
  gold: `gold-analyst-${TIMESTAMP}`,
  macro: `macro-scout-${TIMESTAMP}`,
  sentiment: `sentiment-radar-${TIMESTAMP}`
};
```

### Step 2: Wait for Completion

All agents run in parallel as background processes. Use `process` tool to monitor their completion:

```javascript
// Poll every 10 seconds until all complete
while (running) {
  const processes = process({ action: 'list' });
  // Check if all analyst processes have exited
  // Expected runtime: 60-120 seconds for most, up to 420s for crypto
}
```

Alternatively, wait a fixed duration (e.g., 5 minutes) and then proceed to collection.

### Step 3: Collect Results

Use `sessions_list` to find the analyst sessions, then `sessions_history` to get their JSON output:

```javascript
// Find sessions by ID pattern
const sessions = sessions_list({ limit: 20 });

// Get history for each analyst using stored session IDs
const cryptoHistory = sessions_history({ sessionKey: findSessionKey(sessions, sessionIds.crypto) });
const goldHistory = sessions_history({ sessionKey: findSessionKey(sessions, sessionIds.gold) });
const macroHistory = sessions_history({ sessionKey: findSessionKey(sessions, sessionIds.macro) });
const sentimentHistory = sessions_history({ sessionKey: findSessionKey(sessions, sessionIds.sentiment) });
```

Extract the JSON from the last message of each session. The analysts should return ONLY JSON (no markdown, no preamble).

**⚠️ CRITICAL: If sub-agents fail to produce output (timeout, stuck, no messages):**
- DO NOT continue with stale/cached data
- Send error alert to Telegram: "Market intel run failed - analysts didn't execute"
- Store failure log in `market-intel/data/failures.json`
- Reply with error summary, do NOT deliver market signals

### Step 3.5: VALIDATE PRICES (MANDATORY)

**Before synthesizing signals, validate all price data against realistic ranges:**

**Price Sanity Checks:**

```javascript
// Gold validation
if (gold_price < 3000 || gold_price > 10000) {
  ERROR: "Gold price out of range: $" + gold_price
  ABORT: Do not deliver results
  ALERT: Send validation error to Telegram
}

// BTC validation  
if (btc_price < 40000 || btc_price > 200000) {
  ERROR: "BTC price out of range: $" + btc_price
  ABORT: Do not deliver results
  ALERT: Send validation error to Telegram
}

// ETH validation
if (eth_price < 1000 || eth_price > 15000) {
  ERROR: "ETH price out of range: $" + eth_price
  ABORT: Do not deliver results
  ALERT: Send validation error to Telegram
}
```

**Compare against previous run (if available):**

```javascript
previous_run = read('market-intel/data/signals.json')[0]
if (previous_run) {
  // Check for unrealistic price changes (>25% in 6 hours)
  btc_change_pct = abs((btc_price - previous_run.btc_price) / previous_run.btc_price)
  if (btc_change_pct > 0.25) {
    WARNING: "BTC changed " + (btc_change_pct * 100) + "% since last run"
    FLAG: Requires manual review, likely data error
    ABORT: Do not deliver without confirmation
  }
  
  gold_change_pct = abs((gold_price - previous_run.gold_price) / previous_run.gold_price)
  if (gold_change_pct > 0.20) {
    WARNING: "Gold changed " + (gold_change_pct * 100) + "% since last run"
    FLAG: Requires manual review, likely data error
    ABORT: Do not deliver without confirmation
  }
}
```

**Data Freshness Check:**

```javascript
// Ensure data is recent (fetched within last 15 minutes)
if (data_timestamp && (now - data_timestamp) > 15 * 60 * 1000) {
  ERROR: "Data is stale (age: " + age_minutes + " minutes)"
  ABORT: Do not deliver stale data
}
```

**If ANY validation fails:**
1. **STOP immediately** - do not continue to synthesis
2. **Send error alert** to Telegram:
```
⚠️ **Market Intel Validation Failed**

Price data failed sanity checks:
• [Asset]: $[price] (expected range: $[min]-$[max])

Run aborted. No signals delivered.
Check logs: market-intel/data/failures.json
```
3. **Log failure** with full details
4. **Exit gracefully** - no market signals sent

**Only proceed to Step 4 if ALL validations pass.**

### Step 4: Synthesize Signals

Parse all JSON results and cross-reference:

**Confluence adjustments:**
- RISK_OFF macro + Gold BUY → boost gold strength +0.05
- RISK_OFF macro + Crypto BUY → reduce crypto strength -0.05  
- RISK_ON macro + Crypto BUY → boost crypto strength +0.05
- Extreme Fear sentiment + Crypto BUY → boost strength +0.05 (contrarian)
- Sentiment BUY + Signal BUY → boost strength +0.05 (confluence)
- **WHALE ACTIVITY** (BTC/ETH only):
  - STRONG_ACCUMULATION + BUY → +0.10 (whales buying aggressively)
  - ACCUMULATION + BUY → +0.05 (moderate whale buying)
  - STRONG_DISTRIBUTION + BUY → -0.10 (bearish divergence - whales selling while signal says buy)
  - DISTRIBUTION + BUY → -0.05 (moderate bearish divergence)
  - STRONG_ACCUMULATION + SELL → -0.10 (whales buying while signal says sell - conflict)
  - ACCUMULATION + SELL → -0.05 (moderate conflict)
  - STRONG_DISTRIBUTION + SELL → +0.10 (whales selling confirms sell signal)
  - DISTRIBUTION + SELL → +0.05 (moderate confluence)
  - NEUTRAL → no adjustment

**Example:**
```
Crypto BTC: BUY 0.62 (original)
+ Sentiment: EXTREME_FEAR (13) with BUY bias 0.82 → +0.05
+ Macro: RISK_OFF → -0.05
+ Whale Activity: ACCUMULATION (-750 BTC) → +0.05
= Adjusted: 0.67 (now qualifies for digest)
```

### Step 5: Apply Thresholds

Read `market-intel/config.json`:
- `immediate_alert`: 0.7
- `include_in_digest`: 0.5

**Filter signals:**
- ≥ 0.7 → Immediate Telegram alert
- 0.5-0.7 → Daily digest
- < 0.5 → Log only (no delivery)

### Step 6: Deliver to Telegram

For signals ≥ 0.7, send immediate alert:

```
Use message tool:
action: send
channel: telegram
target: YOUR_TELEGRAM_CHAT_ID
message: [formatted alert]
```

**IMPORTANT:** Use numeric chat ID `YOUR_TELEGRAM_CHAT_ID`, NOT the handle `@your_telegram_handle`.

**Alert format:**
```
🟢 **BTC BUY** (82%)

Extreme fear at 13 indicates capitulation and potential bottom. 
Negative funding rate shows shorts paying longs. Whales accumulating 
(-750 BTC off exchanges in 24h). Classic contrarian buy opportunity 
despite RISK_OFF macro environment.

Context:
• Macro: VIX 19, trade war escalating, Fed holding rates
• Sentiment: EXTREME_FEAR (13) - contrarian buy
• Whale Activity: ACCUMULATION (-750 BTC net flow)
• Adjustment: Sentiment (+0.05), Whale (+0.05), Macro (-0.05) = +0.05

Market Intel @ 2026-02-27 23:30 UTC
```

**Note:** Only include whale activity in Context if signal is not NEUTRAL.

For digest (0.5-0.7):
```
📊 **Market Intel Digest**

• **BTC**: WATCH (62%) - Consolidation phase, awaiting catalyst
• **ETH**: WATCH (58%) - Following BTC, weak volume
• **GOLD**: BUY (82%) - Weak USD, falling yields, Fed dovish

Macro: RISK_OFF (VIX 19, trade tensions)
Sentiment: Crypto EXTREME_FEAR (13), Gold positive flows

2026-02-27 23:30 UTC
```

### Step 7: Store Results

Write synthesized signals to `market-intel/data/signals.json`:

```json
{
  "timestamp": "2026-02-27T23:30:00Z",
  "signals": [
    {
      "asset": "BTC",
      "signal": "BUY",
      "strength_original": 0.62,
      "strength_adjusted": 0.67,
      "reasoning": "...",
      "macro_context": "RISK_OFF",
      "sentiment_context": "EXTREME_FEAR"
    }
  ],
  "macro_summary": "...",
  "sentiment_summary": "..."
}
```

Append to existing file, keep last 100 runs.

### Step 8: Cleanup Analyst Sessions (Optional)

Analyst sessions created via CLI will persist in session history but will be automatically pruned by OpenClaw after 24-48 hours.

If you want immediate cleanup:
```javascript
// Get session keys from Step 3
sessions.forEach(session => {
  if (session.id.includes('crypto-analyst-') || 
      session.id.includes('gold-analyst-') ||
      session.id.includes('macro-scout-') ||
      session.id.includes('sentiment-radar-')) {
    // Sessions will auto-cleanup, manual deletion not required
  }
});
```

**Note:** Unlike the old sessions_spawn approach (which was broken), the CLI approach creates stable sessions that can be inspected and debugged if needed.

## Constraints

- All 4 agents MUST complete successfully (or handle gracefully if one fails)
- JSON parsing MUST be robust (handle markdown code blocks)
- Thresholds from config.json are authoritative
- Telegram delivery only in production (skip in test mode)
- Always log to signals.json for historical tracking

## Output

Your final report should include:
1. Summary of all signals (asset, signal, strength)
2. Confluence adjustments made
3. Delivery actions taken (which alerts sent)
4. Storage confirmation

---

**This is a meta-agent - you coordinate, you don't analyze markets directly.**
