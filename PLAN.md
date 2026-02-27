> **Historical document.** Current source of truth for Market Intel improvements and roadmap: [`IMPROVEMENTS.md`](./IMPROVEMENTS.md).

# 🎯 Market Intelligence System - Master Plan

**Goal:** Provide actionable short-term trading signals for BTC, ETH, and Gold with specific entry/exit/stop-loss levels.

---

## 📊 Current State vs. Target

### What We Have Now (70% Data, 30% Analysis)
- ✅ Basic crypto prices
- ✅ Fear & Greed sentiment
- ✅ Macro regime detection
- ⚠️ No technical indicators
- ⚠️ No on-chain data
- ⚠️ No event calendar
- ⚠️ No specific trade levels

**Output:** "Gold looks bullish at $5,184" (vague)

### What We're Building (100% Actionable)
- ✅ Real-time prices + volume
- ✅ RSI, MACD, support/resistance levels
- ✅ Whale tracking, exchange flows
- ✅ Economic calendar (Fed, CPI, NFP)
- ✅ DXY, yields correlation
- ✅ Multi-agent synthesis

**Output:** "BUY Gold at $5,050, stop $4,990, target $5,200 (+3% gain, -1.2% risk)"

---

## 🚧 Critical Missing Skills (Install Priority)

### 1. Technical Analysis ⭐⭐⭐⭐⭐ (MUST HAVE)
**Why:** Without TA, we can't identify entry/exit points.

**What It Provides:**
- RSI (overbought/oversold)
- MACD (momentum)
- Moving averages (trend)
- Support/resistance (key levels)
- Volume analysis

**Impact:** Turns "bullish" into "buy at $X with stop at $Y"

**Search:**
```bash
clawhub search "technical analysis"
clawhub search "trading indicators"
```

---

### 2. On-Chain Metrics ⭐⭐⭐⭐⭐ (CRYPTO CRITICAL)
**Why:** Shows what smart money is doing BEFORE price moves.

**What It Provides:**
- Exchange flows (accumulation/distribution)
- Whale wallet tracking
- Funding rates (overleveraged positions)
- Network activity

**Impact:** If whales are selling while you're buying, you're wrong.

**Search:**
```bash
clawhub search "on-chain"
clawhub search "whale tracker"
clawhub search "funding rates"
```

---

### 3. Economic Calendar ⭐⭐⭐⭐ (RISK MANAGEMENT)
**Why:** Don't trade before Fed meetings or NFP. You'll get crushed.

**What It Provides:**
- Fed meeting schedules
- CPI, PCE (inflation data)
- NFP (jobs report)
- GDP, PMI releases

**Impact:** "Don't buy gold today, Fed speaks in 3 hours" = disaster avoided.

**Search:**
```bash
clawhub search "economic calendar"
clawhub search "forex calendar"
```

---

### 4. Gold/Commodities API ⭐⭐⭐⭐ (GOLD CRITICAL)
**Why:** Current skill is just a guide, not real data.

**What It Provides:**
- Real-time spot price
- Futures price
- Volume
- Gold/Silver ratio

**Search:**
```bash
clawhub search "gold price api"
clawhub search "commodities data"
```

---

### 5. DXY / Treasury Yields ⭐⭐⭐⭐ (MACRO CRITICAL)
**Why:** Gold's #1 inverse correlation. Predict moves before they happen.

**What It Provides:**
- DXY (dollar index) real-time
- US 10-year yield
- Inflation expectations

**Impact:** If DXY breaks support, buy gold before the crowd.

**Search:**
```bash
clawhub search "treasury yields"
clawhub search "dollar index"
clawhub search "DXY"
```

---

## 🏗️ New Agent Architecture (3 Layers)

### Current: 1 Agent Does Everything (Slow, Shallow)
```
User → Gold Agent → Web Search Everything → Vague Output
        (90 seconds, limited depth)
```

### New: Multi-Layer Pipeline (Fast, Deep)
```
User Request
    ↓
┌─────────────────────────────┐
│ Layer 1: Data Collection    │ ← 6 agents run in PARALLEL
│ (30 seconds)                │
├─────────────────────────────┤
│ • Price Agent    → prices   │
│ • Technical      → RSI/MACD │
│ • On-Chain       → whales   │
│ • Macro          → DXY/Fed  │
│ • Sentiment      → F&G      │
│ • Events         → calendar │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ Layer 2: Domain Analysis    │ ← Crypto OR Gold analyst
│ (20 seconds)                │
├─────────────────────────────┤
│ Crypto Analyst:             │
│ • Combines technical + on-  │
│   chain + sentiment         │
│ • Returns BUY/SELL + conf.  │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ Layer 3: Orchestrator       │ ← Final decision
│ (10 seconds)                │
├─────────────────────────────┤
│ • Weighs all signals        │
│ • Resolves conflicts        │
│ • Calculates position size  │
│ • Generates trade plan      │
└─────────────────────────────┘
    ↓
Trading Signal with Levels
```

**Total Time:** ~70 seconds (vs 90s before, but WAY more depth)

---

## 🎯 Why This Design Wins

### 1. Separation of Concerns
Each agent has ONE job:
- Price agent = collect prices (no opinions)
- Technical agent = calculate indicators (no bias)
- Orchestrator = make final call (synthesizes all)

**Benefit:** Easy to debug, test, and improve each piece.

### 2. Parallel Execution
6 data agents run **simultaneously** → 30s total
vs. One agent searching sequentially → 3+ minutes

**Benefit:** 4x faster.

### 3. Confidence Weighting
Each agent returns confidence score:
```json
{
  "signal": "BUY",
  "confidence": 0.75
}
```

Orchestrator weighs them:
```
final_confidence = (tech_0.8 + onchain_0.6 + sent_0.5) / 3 = 0.63
```

**Benefit:** Quantified certainty, not gut feel.

### 4. Conflict Resolution
If Technical says BUY but On-chain says SELL:
- Orchestrator checks confidence scores
- Checks events agent (veto power)
- If unclear → "WAIT - Conflicting Signals"

**Benefit:** No blind trades.

### 5. Scalability
Want to add Ethereum? Just tell Crypto Analyst to include it.
Want to add Silver? Create Silver Analyst using same data agents.

**Benefit:** Build once, scale forever.

---

## 📋 Implementation Roadmap

### Phase 1: Fill Skill Gaps (TODAY)
**Action:**
```bash
cd market-intel
chmod +x install-priority-skills.sh
./install-priority-skills.sh
```

Review output, install manually:
```bash
clawhub install <best-technical-analysis-skill>
clawhub install <best-onchain-skill>
clawhub install <economic-calendar-skill>
```

**Goal:** Get 3 critical skills installed.

---

### Phase 2: Test Data Layer (TOMORROW)
**Action:** Test each data agent independently.

Example:
```javascript
sessions_spawn({
  task: "Collect BTC price. Read agents/price-collector.md",
  label: "test-price",
  cleanup: "delete"
});
```

**Goal:** Verify each data agent returns valid JSON.

---

### Phase 3: Test Analysis Layer (DAY 3)
**Action:** Test crypto-analyst with real data.

```javascript
sessions_spawn({
  task: "Analyze BTC using all available data. Read agents/crypto-analyst.md",
  label: "test-crypto",
  cleanup: "delete"
});
```

**Goal:** Verify analyst can synthesize data into signal.

---

### Phase 4: Test Orchestrator (DAY 4)
**Action:** Run full pipeline end-to-end.

```javascript
// This will be the main entry point eventually
sessions_spawn({
  task: "Generate BTC trading signal. Orchestrate all layers. Read agents/orchestrator.md",
  label: "full-btc-analysis",
  cleanup: "delete"
});
```

**Goal:** Get first actionable signal with entry/stop/targets.

---

### Phase 5: Production (DAY 5)
**Action:** Set up cron job for automated analysis.

```javascript
cron.add({
  name: "Market Intel - BTC",
  schedule: { 
    kind: "cron", 
    expr: "0 9,15,21 * * *"  // 9 AM, 3 PM, 9 PM UTC
  },
  payload: {
    kind: "agentTurn",
    message: "Run full BTC analysis and deliver signal to Telegram"
  },
  sessionTarget: "isolated"
});
```

**Goal:** Automated 3x daily signals.

---

## 📊 Success Metrics

### Quality Metrics
- ✅ Every signal has entry, stop-loss, target
- ✅ Risk/reward ≥1:2 minimum
- ✅ Confidence score 0-100%
- ✅ Position size recommendation
- ✅ All risk factors listed

### Performance Metrics
- ⏱️ Analysis time <90 seconds
- 🎯 Win rate >70% on signals with confidence >70%
- 📈 Average R:R 1:3 or better

### Coverage Metrics
- 🪙 BTC, ETH, Gold (minimum)
- 📅 3x daily analysis
- 🔔 Telegram delivery

---

## 🚀 Long-Term Vision

### Month 1: Foundation
- 3 assets (BTC, ETH, Gold)
- 3x daily analysis
- Manual review of all signals

### Month 2: Expansion
- Add: SOL, LINK, Silver
- 6x daily analysis (every 4 hours)
- Position tracking (remember open trades)

### Month 3: Advanced
- Multi-timeframe (day trade vs swing)
- Portfolio mode (correlation analysis)
- Backtesting on historical data
- Auto-execution via exchange API (risky!)

---

## 🎓 Key Learnings from Gold Analysis

**What Worked:**
- ✅ Multi-source data gathering
- ✅ Macro context (DXY, yields)
- ✅ Human-readable output
- ✅ Specific price ($5,184)

**What Was Missing:**
- ❌ No specific entry level
- ❌ No stop-loss
- ❌ No position size
- ❌ No technical levels (RSI, support)
- ❌ No on-chain data (can't apply to gold, but needed for crypto)

**The Fix:** Multi-layer architecture with specialized agents.

---

## 💡 Bottom Line

**Current System:** 70% there, but not tradeable.

**New System:** 100% actionable with specific levels.

**Effort Required:**
- Install 3-5 critical skills (1 hour)
- Test agent layers (2-3 days)
- Deploy to production (1 day)

**ROI:** Actionable trading signals 3x daily instead of vague analysis.

**Next Step:** Run `./install-priority-skills.sh` and install top 3 skills.
