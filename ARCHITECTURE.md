# Market Intelligence Architecture

## Overview
Multi-layer agent system for actionable crypto and gold trading signals.

---

## Architecture Layers

### Layer 1: Data Collection (Parallel Execution)
**Agents:** price-collector, technical-scanner, sentiment-gauge, macro-monitor, events-checker

**Purpose:** Gather raw data from skills/APIs

**Execution:** All spawn simultaneously using `sessions_spawn`

**Output:** Each returns JSON with their data slice

**Time:** ~30 seconds

---

### Layer 2: Domain Analysis (Synthesizers)
**Agents:** crypto-analyst, gold-analyst

**Purpose:** Combine Layer 1 data into domain-specific insights

**Execution:** Spawn after Layer 1 completes

**Output:** JSON with trade bias, confidence, reasoning

**Time:** ~20 seconds

---

### Layer 3: Orchestration (Decision Maker)
**Agent:** orchestrator

**Purpose:** Final trading signal with specific levels

**Execution:** Spawns after Layer 2 completes

**Output:** Human-readable trading plan

**Time:** ~10 seconds

---

## Data Flow

```
User Request: "Analyze BTC"
       ↓
┌──────────────────────────────┐
│ Layer 1: Data Collection     │
│ (All spawn in parallel)      │
├──────────────────────────────┤
│ • price-collector    → JSON  │
│ • technical-scanner  → JSON  │
│ • sentiment-gauge    → JSON  │
│ • macro-monitor      → JSON  │
│ • events-checker     → JSON  │
└──────────────────────────────┘
       ↓
┌──────────────────────────────┐
│ Layer 2: Domain Analysis     │
├──────────────────────────────┤
│ crypto-analyst               │
│ • Reads all Layer 1 outputs  │
│ • Synthesizes crypto view    │
│ • Returns signal + reasoning │
└──────────────────────────────┘
       ↓
┌──────────────────────────────┐
│ Layer 3: Orchestration       │
├──────────────────────────────┤
│ orchestrator                 │
│ • Weighs confidence          │
│ • Resolves conflicts         │
│ • Generates trade plan       │
│ • Formats human report       │
└──────────────────────────────┘
       ↓
  Trading Signal
  (Entry, SL, Targets)
```

---

## Execution Pattern

### Simple (One Asset)
```javascript
// Example: Analyze BTC
const analysis = await orchestrator.run({
  asset: "BTC",
  layers: ["data", "analysis", "orchestration"]
});
```

### Full Pipeline (Manual)
```javascript
// Phase 1: Spawn data collectors
const collectors = [
  'price-collector',
  'sentiment-gauge'
  // Add more when skills installed
];

for (const agent of collectors) {
  sessions_spawn({
    task: `Analyze BTC. Read agents/${agent}.md`,
    label: `${agent}-btc`,
    cleanup: "delete"
  });
}

// Wait for all to complete (OpenClaw handles this)

// Phase 2: Spawn crypto analyst
sessions_spawn({
  task: "Read all data agent outputs and analyze BTC. Read agents/crypto-analyst.md",
  label: "crypto-analyst-btc",
  cleanup: "delete"
});

// Phase 3: Spawn orchestrator
sessions_spawn({
  task: "Generate final BTC trading signal. Read agents/orchestrator.md",
  label: "orchestrator-btc",
  cleanup: "delete"
});
```

---

## Why This Design Works

### 1. Separation of Concerns
- Data agents = dumb collectors (no opinions)
- Analysis agents = domain experts (synthesis)
- Orchestrator = decision maker (final call)

**Benefit:** Each agent does ONE thing well.

### 2. Parallel Execution
- 5 data agents run simultaneously → 30s total
- vs. Sequential (one agent searches everything) → 2-3 minutes

**Benefit:** 4x faster analysis.

### 3. Scalability
- Add new asset? Just pass it to existing pipeline
- Add new data source? Create one new data agent
- No need to rewrite entire system

### 4. Testability
- Test each layer independently
- Mock data agent outputs to test orchestrator
- Easy to debug which layer failed

### 5. Confidence Weighting
Each agent returns confidence score:
```json
{
  "signal": "BUY",
  "confidence": 0.75,
  "reasoning": "..."
}
```

Orchestrator combines:
```
final_confidence = weighted_average(all_agent_confidences)
```

**Benefit:** Quantified certainty, not gut feel.

---

## Handling Edge Cases

### Conflicting Signals
**Example:** Technical says BUY, Sentiment says SELL

**Resolution:**
1. Check confidence scores (higher wins)
2. Check events agent (veto power if major event)
3. If still unclear → Output: "WAIT - Conflicting Signals"

### Missing Data
**Example:** On-chain agent fails (API down)

**Resolution:**
1. Orchestrator proceeds with available data
2. Reduces final confidence by 20%
3. Notes in output: "⚠️ On-chain data unavailable"

### High Risk Events
**Example:** Fed meeting in 2 hours

**Resolution:**
1. Events agent flags: `{"veto": true, "reason": "Fed meeting"}`
2. Orchestrator overrides all BUY/SELL signals
3. Output: "WAIT - Fed meeting in 2h (high volatility risk)"

---

## Output Quality Standards

Every trading signal MUST include:

- ✅ Specific entry price (or range)
- ✅ Stop-loss level
- ✅ At least one target
- ✅ Position size recommendation
- ✅ Risk/reward ratio
- ✅ List of supporting factors
- ✅ List of risk factors
- ✅ Next action/review timing

**Never:**
- ❌ Vague: "Buy around $67k"
- ❌ No stop-loss
- ❌ Just "BUY" with no plan

---

## Skill Dependencies

### Current (Working)
- ✅ crypto-market-data (prices)
- ✅ fear-greed (sentiment)
- ✅ market-environment-analysis (macro)
- ✅ web_search, web_fetch (research)

### Critical Gaps
- ❌ Technical analysis (RSI, MACD, support/resistance)
- ❌ On-chain metrics (whale tracking, exchange flows)
- ❌ Real-time gold API (current is just a guide)
- ❌ Economic calendar (Fed meetings, CPI, NFP)
- ❌ Treasury yields / DXY API

### Priority Install Order
1. Technical analysis skill ← HIGHEST PRIORITY
2. On-chain metrics skill
3. Economic calendar skill
4. Gold/commodities API
5. Treasury yields / DXY API

---

## Next Steps

### Phase 1: Fill Skill Gaps
```bash
cd market-intel
chmod +x install-priority-skills.sh
./install-priority-skills.sh
# Review output, manually install top skills
```

### Phase 2: Test Single Layer
Test price-collector agent independently:
```javascript
sessions_spawn({
  task: "Collect BTC and ETH prices. Read agents/price-collector.md",
  label: "test-price",
  cleanup: "delete"
});
```

### Phase 3: Build Up
1. Test each data agent independently
2. Test crypto-analyst with mock data
3. Test orchestrator with mock signals
4. Run full pipeline end-to-end

### Phase 4: Production
Set up cron job:
```javascript
cron.add({
  schedule: { kind: "cron", expr: "0 9,15,21 * * *" }, // 3x daily
  payload: {
    kind: "agentTurn",
    message: "Run full market analysis for BTC and Gold"
  },
  sessionTarget: "isolated"
});
```

---

## Performance Targets

- **Speed:** <90 seconds for full analysis (all layers)
- **Accuracy:** >70% win rate on signals with confidence >0.7
- **Coverage:** BTC, ETH, Gold minimum (expandable)
- **Uptime:** Handle API failures gracefully (degraded mode)

---

## Future Enhancements

1. **Position Tracking:** Remember open trades, track P&L
2. **Backtesting:** Test strategy on historical data
3. **Multi-Timeframe:** Day trade vs swing trade signals
4. **Portfolio Mode:** Correlation analysis across all positions
5. **Auto-Execution:** Integration with exchange APIs (risky!)
