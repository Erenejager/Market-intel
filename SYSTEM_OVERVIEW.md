# Market Intelligence System - Complete Overview (v2.0)

**Status:** LIVE | **Version:** 2.0 | **Deployed:** March 11, 2026

---

## 🎯 **What This System Does**

**The orchestrator runs 4 specialized AI agents every 6 hours to analyze global markets and generate high-conviction trading signals for BTC, ETH, and Gold.**

**Input:** Real-time market data, sentiment indicators, whale flows, macro conditions  
**Output:** BUY/SELL/WATCH/HOLD signals with complete trade specifications (entry, stop-loss, take-profit)  
**Goal:** 50%+ win rate, +0.8% average P&L per trade (Phase 2 target)

---

## 🏗️ **System Architecture**

### Orchestrator (`orchestrator.js`)

**Role:** Mission control - coordinates all agents, validates outputs, synthesizes final signals

**What it does:**
1. Triggers 4 agents in parallel (async execution)
2. Collects raw JSON outputs from each agent
3. Validates data quality (price accuracy, schema compliance)
4. Synthesizes signals using **confluence scoring**
5. Logs everything to `data/signals.json` and timestamped files
6. Generates human-readable markdown reports

**Runs:** 4x per day (00:00, 06:00, 12:00, 18:00 UTC)  
**Runtime:** ~2-3 minutes per full orchestration

---

## 🤖 **The Four Agents**

### 1️⃣ **Sentiment Radar** (`sentiment-radar.md`)

**Mission:** Track crowd psychology and fear/greed cycles

**Data Sources:**
- Crypto Fear & Greed Index (0-100 scale, API)
- Extreme fear duration tracking (fear-history.json)
- Historical sentiment patterns

**What it analyzes:**
- Current fear/greed level (0-100)
- Fear duration (how many consecutive runs <15)
- Sentiment reversals (fear → greed shifts)
- Contrarian opportunities

**Key v2.0 Enhancement:**
- **Duration-based boosts:**
  - 1 day <15: +0.10 adjustment
  - 2 days <15: +0.12
  - 3 days <15: +0.15
  - 4+ days <15: +0.20 (severe capitulation = strong buy signal)

**Output Example:**
```json
{
  "fear_greed_index": 13,
  "classification": "EXTREME_FEAR",
  "fear_duration_days": 4,
  "contrarian_signal": "STRONG_BUY",
  "adjustment": 0.20,
  "reasoning": "Day 4 of extreme fear (<15) indicates severe capitulation. Historical data shows 85% recovery rate within 7 days."
}
```

---

### 2️⃣ **Macro Scout** (`macro-scout.md`)

**Mission:** Monitor global risk conditions and macroeconomic regime

**Data Sources:**
- VIX (Volatility Index) - via FRED API
- Federal Funds Rate - via FRED API
- Global news headlines (war, policy, central banks)
- DXY (US Dollar Index)

**What it analyzes:**
- Risk regime (RISK_ON vs RISK_OFF)
- VIX levels and trends
- Interest rate policy
- Dollar strength (inverse to risk assets)
- Geopolitical events

**Key v2.0 Enhancement:**
- **Gradient VIX adjustments** (replaced binary ±0.05):
  
  **For Crypto (BTC, ETH):**
  - VIX >35: -0.08 (EXTREME_RISK_OFF = bad for crypto)
  - VIX 25-35: -0.03 (RISK_OFF)
  - VIX 15-25: 0.00 (NEUTRAL)
  - VIX 12-15: +0.05 (RISK_ON)
  - VIX <12: +0.08 (EXTREME_RISK_ON = best for crypto)

  **For Gold:**
  - VIX >35: +0.08 (safe haven benefit)
  - VIX 25-35: +0.03
  - VIX 15-25: 0.00
  - VIX 12-15: -0.03 (risk assets preferred)
  - VIX <12: -0.05

**Output Example:**
```json
{
  "vix": 28.5,
  "regime": "RISK_OFF",
  "fed_funds_rate": 5.50,
  "dxy": 104.2,
  "crypto_adjustment": -0.03,
  "gold_adjustment": 0.03,
  "reasoning": "VIX elevated at 28.5 signals risk-off environment. Negative for crypto (-0.03), positive for gold safe-haven bid (+0.03)."
}
```

---

### 3️⃣ **Crypto Analyst** (`crypto-analyst.md`)

**Mission:** Generate actionable signals for BTC, ETH, SOL with complete trade specs

**Data Sources:**
- Real-time prices (CoinGecko API via crypto-market-data skill)
- Whale net flows (24h + 7d multi-timeframe via whale-alert skill)
- Funding rates (Binance perpetual futures)
- Technical levels (support/resistance)
- Fear & Greed + Macro data (from other agents)

**What it analyzes:**
- Price action and trend strength (0-1.0 base score)
- Whale accumulation/distribution patterns
- Funding rate (overleveraged longs/shorts)
- Divergences (price vs whale activity)
- Multi-timeframe confirmation (24h + 7d trends)

**Key v2.0 Enhancements:**

1. **Lower BUY Threshold:** 0.70 → **0.65**
   - Catches opportunities 5% earlier in the move
   - Would've triggered March 9 rally (missed at 0.72 strength)

2. **Enhanced Fear Boost:**
   - 4+ days extreme fear: +0.20 adjustment (vs old +0.05)
   - Stronger contrarian signals at bottoms

3. **Gradient Macro:**
   - VIX-based adjustments (-0.08 to +0.08)
   - Captures risk regime intensity

4. **Reduced Missing Data Penalty:**
   - Whale data unavailable: -0.03 (was -0.10)
   - "No data" ≠ negative signal

**Trade Entry Specs:**
- **Entry zone:** Optimal price ± 0.3% (LIMIT or MARKET)
- **Stop-loss:** 1.5x ATR below entry (~1.5-2.5% risk)
- **Take-profit:** 3 levels (TP1: 30% position, TP2: 50%, TP3: 20%)
- **Position sizing:** 2% account risk per trade

**Output Example:**
```json
{
  "asset": "BTC",
  "signal": "BUY",
  "strength": 0.82,
  "price_current": 69850,
  "entry": {
    "optimal": 69850,
    "range": [69640, 70060],
    "order_type": "LIMIT"
  },
  "stop_loss": {
    "price": 68500,
    "percent": -1.93,
    "reasoning": "Below breakout level, 1.5x ATR"
  },
  "take_profit": {
    "tp1": {"price": 71200, "percent": 1.93, "r_to_r": 1.0},
    "tp2": {"price": 73500, "percent": 5.23, "r_to_r": 2.7},
    "tp3": {"price": 76000, "percent": 8.81, "r_to_r": 4.6}
  },
  "whale_activity": "STRONG_ACCUMULATION",
  "whale_net_flow_24h": -1834,
  "whale_trend_aligned": true,
  "funding_rate": -0.00015,
  "funding_interpretation": "HIGHLY_NEGATIVE",
  "reasoning": "BTC breaking $70k resistance with volume. Whale flows: -1,834 BTC (24h) showing strong accumulation. Funding -0.015% = shorts overleveraged, squeeze setup. Day 4 extreme fear (+0.20 boost) = high-conviction bottom. Combined strength: 0.82 → BUY."
}
```

---

### 4️⃣ **Gold Analyst** (`gold-analyst.md`)

**Mission:** Analyze gold futures (GC=F) with geopolitical context

**Data Sources:**
- Gold futures price (TradingView - COMEX GC=F)
- DXY Dollar Index (FRED API)
- US 10Y Treasury yield (FRED API)
- Real yields (10Y - inflation)
- Geopolitical news headlines
- Fear & Greed + Macro data (from other agents)

**What it analyzes:**
- Gold futures trend and breakouts
- Dollar strength (inverse correlation)
- Real yields (gold's true competitor)
- Safe-haven flows during crises
- War premium spikes (temporary vs sustained)

**Key v2.0 Enhancements:**

1. **Headline Volatility Protection:**
   - Detects 24h moves >5% + geopolitical keywords
   - **Caps strength at 0.75** during spikes
   - Prevents buying war premium peaks
   - **Example:** March 10 - Trump "Iran war ending" caused +6.8% spike
     - Old system: BUY at 0.80 (would've lost -5.79%)
     - New system: CAP at 0.75, requires 2 confirmations

2. **Gradient Macro (Gold-Specific):**
   - VIX >35: +0.08 (safe haven = bullish)
   - VIX <12: -0.05 (risk-on = bearish for gold)

3. **Geopolitical Keywords:**
   - Monitors: war, conflict, strike, attack, peace, deal, ceasefire, Trump, Iran, Israel
   - Flags headline-driven volatility

**Trade Entry Specs:**
- **Entry zone:** ± 0.2% from optimal (gold less volatile than crypto)
- **Stop-loss:** 1.5x ATR (~1.0-1.5% risk)
- **Take-profit:** 3 levels (smaller targets, gold moves slower)
- **Position sizing:** 2% account risk

**Output Example:**
```json
{
  "asset": "GOLD_FUTURES",
  "ticker": "GC=F",
  "signal": "WATCH",
  "strength": 0.55,
  "price_current": 5141,
  "price_24h_change": -6.1,
  "headline_volatility_detected": true,
  "volatility_cap_applied": true,
  "reasoning": "⚠️ HEADLINE VOLATILITY: 24h move -6.1% on 'Trump Iran peace deal' reversal. War premium unwinding. Strength capped at 0.75 (was 0.82) - wait for confirmation. DXY weak + real yields negative = medium-term bullish, but short-term headline-driven."
}
```

---

## 🔄 **Orchestration Flow**

### Step-by-Step Process

```
1. TRIGGER (4x/day: 00:00, 06:00, 12:00, 18:00 UTC)
   ↓
2. PARALLEL AGENT EXECUTION (async)
   ├── Sentiment Radar → fear-greed data
   ├── Macro Scout → VIX, Fed Funds, regime
   ├── Crypto Analyst → BTC, ETH, SOL signals
   └── Gold Analyst → GOLD signal
   ↓
3. COLLECT OUTPUTS (JSON files in /tmp/)
   ├── /tmp/sentiment-result.json
   ├── /tmp/macro-result.json
   ├── /tmp/crypto-result.json
   └── /tmp/gold-result.json
   ↓
4. VALIDATE DATA
   ├── Check price accuracy (compare sources)
   ├── Verify schema compliance
   ├── Flag missing/stale data
   └── Log validation errors
   ↓
5. SYNTHESIZE SIGNALS
   ├── Combine agent outputs
   ├── Apply confluence scoring
   ├── Cross-check macro + sentiment alignment
   └── Generate final recommendations
   ↓
6. LOG & REPORT
   ├── Save to data/signals-YYYY-MM-DD-HH-MM.json
   ├── Update data/signals.json (latest)
   ├── Generate markdown summary
   └── Update fear-history.json (fear streak tracking)
   ↓
7. OUTPUT DELIVERY
   ├── Console summary (run logs)
   ├── File outputs (signals.json)
   └── Ready for user review
```

**Total Runtime:** ~2-3 minutes per orchestration

---

## 📊 **Confluence Scoring Logic**

### How Final Signal Strength is Calculated

**For Crypto (BTC, ETH):**

```python
# Start with base technical strength (0-1.0)
final_strength = base_technical_strength

# 1. Add extreme fear duration boost
if fear_greed < 15:
    if fear_duration >= 4:
        final_strength += 0.20  # Severe capitulation
    elif fear_duration >= 3:
        final_strength += 0.15
    elif fear_duration >= 2:
        final_strength += 0.12
    else:
        final_strength += 0.10

# 2. Add whale flow adjustment (gradient)
if whale_data_available:
    # -0.12 to +0.12 based on accumulation/distribution intensity
    final_strength += whale_adjustment
else:
    final_strength -= 0.03  # Reduced uncertainty penalty

# 3. Add funding rate adjustment
if funding_rate < -0.01:  # Shorts overleveraged
    final_strength += 0.10
elif funding_rate > 0.05:  # Longs overleveraged
    final_strength -= 0.10

# 4. Add gradient macro adjustment (VIX-based)
if vix > 35:
    final_strength -= 0.08  # EXTREME_RISK_OFF
elif vix > 25:
    final_strength -= 0.03  # RISK_OFF
elif vix > 15:
    final_strength += 0.00  # NEUTRAL
elif vix > 12:
    final_strength += 0.05  # RISK_ON
else:
    final_strength += 0.08  # EXTREME_RISK_ON

# 5. Cap at 95% (never 100% certainty)
final_strength = min(0.95, final_strength)

# 6. Determine signal
if final_strength >= 0.65:  # LOWERED from 0.70
    signal = "BUY"
elif final_strength >= 0.50:
    signal = "WATCH"
else:
    signal = "HOLD"
```

**For Gold:**

```python
# Similar flow but:
# - Macro adjustment INVERTED (VIX >35 = +0.08 for safe haven)
# - Headline volatility cap (max 0.75 during 5%+ moves)
# - Threshold stays at 0.70 (gold less volatile)

if headline_volatility_detected:
    final_strength = min(final_strength, 0.75)
    require_2_confirmations = True
```

---

## 📁 **Output Files**

### Real-Time Outputs

**`data/signals-YYYY-MM-DD-HH-MM.json`**
- Timestamped snapshot of every orchestration run
- Contains all 4 agent outputs + synthesis
- Permanent record (not overwritten)

**`data/signals.json`**
- Latest orchestration results
- Always current (overwritten each run)
- Quick reference file

**`data/fear-history.json`**
- Tracks fear/greed over time
- Calculates fear duration streaks
- Used for duration-based boosts

**`data/signal-performance.json`**
- Logs all actual trades taken
- Tracks win rate, P&L, performance metrics
- Updated when trades are closed

### Example Output Structure

```json
{
  "timestamp": "2026-03-11T06:00:00Z",
  "orchestrator_version": "2.0",
  "sentiment": {
    "fear_greed_index": 13,
    "fear_duration_days": 4,
    "adjustment": 0.20
  },
  "macro": {
    "vix": 25.5,
    "regime": "RISK_OFF",
    "crypto_adjustment": -0.03,
    "gold_adjustment": 0.03
  },
  "signals": {
    "BTC": {
      "signal": "BUY",
      "strength": 0.82,
      "price": 69850,
      "entry": {...},
      "stop_loss": {...},
      "take_profit": {...}
    },
    "ETH": {
      "signal": "WATCH",
      "strength": 0.62,
      ...
    },
    "GOLD": {
      "signal": "WATCH",
      "strength": 0.55,
      "headline_volatility_detected": true,
      ...
    }
  },
  "synthesis": {
    "top_opportunity": "BTC",
    "portfolio_allocation": "70% BTC, 30% cash (wait on ETH/Gold)",
    "risk_level": "MEDIUM",
    "confluence_notes": "Strong contrarian setup: Day 4 extreme fear + whale accumulation + funding squeeze. Risk-off macro limits upside but fear capitulation outweighs."
  }
}
```

---

## 🎯 **Success Metrics (Phase 2)**

**Trial Period:** March 11-17, 2026 (7 days)

**Targets:**
- ✅ Win rate: >50% (up from 22% baseline)
- ✅ Avg P&L: >+0.8% per trade (turning negative to positive)
- ✅ Max loss: <2.5% per trade
- ✅ Risk:Reward: >1.2:1 (ensure positive expected value)
- ✅ Opportunity cost: <2% (don't miss obvious trades)

**Expected Value:**
```
EV = (50% × AvgWin) + (50% × AvgLoss)
If avg P&L = +0.8% across all trades
Then EV = +0.8% per signal ✅ POSITIVE
```

---

## 🔧 **Deployment Details**

**Version:** 2.0  
**Deployed:** March 11, 2026, 00:19 UTC  
**Status:** LIVE ✅

**Schedule:**
- **Frequency:** 4x per day (every 6 hours)
- **Run times:** 00:00, 06:00, 12:00, 18:00 UTC
- **Execution:** Automated via cron

**Key Changes from v1.0:**
1. ✅ Lowered BTC/ETH threshold: 0.70 → 0.65
2. ✅ Enhanced extreme fear boost: +0.05 → +0.20 (duration-based)
3. ✅ Gradient macro adjustments: Binary ±0.05 → Gradient -0.08 to +0.08
4. ✅ Gold volatility caps: Max 0.75 during headline spikes
5. ✅ Reduced whale unavailable penalty: -0.10 → -0.03
6. ✅ Multi-timeframe whale confirmation (24h + 7d trends)

**Projected Improvement:**
- Based on 7-day backtest: +7.46% over 3.5 days
- Annualized projection: ~60% (if sustained)
- Would've avoided 7/9 losing gold trades
- Would've captured 3/10 missed BTC opportunities

---

## 📚 **Key Files**

### Agent Definitions
- `agents/sentiment-radar.md` - Fear/greed tracking
- `agents/macro-scout.md` - VIX, Fed Funds, regime
- `agents/crypto-analyst.md` - BTC, ETH, SOL signals
- `agents/gold-analyst.md` - Gold futures signals

### Orchestration
- `orchestrator.js` - Main coordination script
- `config.json` - Agent paths, timeouts, settings

### Data & Logs
- `data/signals.json` - Latest signals
- `data/signals-*.json` - Historical snapshots
- `data/fear-history.json` - Fear streak tracking
- `data/signal-performance.json` - Trade performance log

### Documentation
- `SYSTEM_OVERVIEW.md` - This file (complete overview)
- `DEPLOYMENT_LOG.md` - v2.0 deployment details
- `ORCHESTRATION_SCHEDULE.md` - Frequency rationale
- `agents/PARAMETER_UPDATES.md` - Implementation guide

---

## 🚀 **Next Steps**

1. ✅ **March 11, 00:00 UTC** - First v2.0 run (DONE)
2. **March 11, 06:00 UTC** - Second run, verify fear tracking updates
3. **March 13** - 2-day checkpoint, review first signals
4. **March 17** - Full 7-day performance review
5. **Decision:** Keep v2.0 params if metrics hit, else revert to v1.0

---

**System Status:** 🟢 LIVE | **Next Run:** Within 6 hours | **Performance:** TBD (trial in progress)
