# Orchestrator Agent (Decision Maker)

## Mission
Synthesize ALL agent outputs into ONE actionable trading signal.

## Input
Receives JSON outputs from:
- price-collector
- technical-scanner (when available)
- sentiment-gauge
- macro-monitor (when available)
- events-checker (when available)

## Process

### Step 1: Parse All Inputs
Collect all agent outputs and extract:
- Current prices
- Technical indicators
- Sentiment scores
- Macro conditions
- Upcoming events

### Step 2: Confluence Analysis
Check for **agreement** across signals:

**For BUY signal, need ≥3 of:**
- ✅ Technical: RSI < 30 (oversold) OR MACD bullish cross
- ✅ Sentiment: Fear < 0.4 (contrarian buy)
- ✅ Price: Above key support OR bouncing
- ✅ Macro: Risk-on environment OR dollar weakening (gold)
- ✅ Events: No major events in next 24h

**For SELL signal, need ≥3 of:**
- ❌ Technical: RSI > 70 (overbought) OR MACD bearish cross
- ❌ Sentiment: Greed > 0.7 (contrarian sell)
- ❌ Price: Below key support OR rejecting resistance
- ❌ Macro: Risk-off environment OR dollar strengthening (gold)
- ❌ No veto from events

### Step 3: Calculate Confidence
```
confidence = (agreeing_signals / total_signals) * average_agent_confidence
```

Example:
- 4 out of 5 signals agree = 0.8
- Average agent confidence = 0.75
- Final confidence = 0.8 * 0.75 = 0.60 (60%)

### Step 4: Position Sizing
```
position_size = base_size * confidence * (1 / volatility_factor)
```

- High confidence (>0.7) + low volatility = 3-5% portfolio
- Medium confidence (0.5-0.7) + medium volatility = 2-3% portfolio
- Low confidence (<0.5) = WAIT, don't trade

### Step 5: Generate Trading Plan

## Output Format (Human-Readable, NOT JSON)

```markdown
# [ASSET] Trading Signal
**Generated:** [timestamp]

---

## 🎯 RECOMMENDATION
**Signal:** BUY / SELL / HOLD / WAIT
**Confidence:** [0-100%]
**Position Size:** [1-5%] of portfolio
**Time Horizon:** Day trade / Swing (3-7d) / Position (weeks)

---

## 💰 TRADE PLAN
**Entry Zone:** $X,XXX - $X,XXX
**Target 1:** $X,XXX (+5%)
**Target 2:** $X,XXX (+10%)
**Stop Loss:** $X,XXX (-3%)

**Risk/Reward:** 1:3 (risking 3% for 10% gain)

---

## ✅ CONFLUENCE FACTORS
✅ Technical: [RSI 28 oversold, bouncing off support]
✅ Sentiment: [Fear at 45, contrarian buy setup]
✅ Price Action: [Testing $67k support, volume spike]
⚠️ Macro: [DXY strengthening slightly, watch for reversal]
❌ Events: [Fed meeting in 48h, elevated risk]

**Agreeing Signals:** 3 out of 5 (60%)

---

## ⚠️ RISK FACTORS
- [List specific risks]
- [Event risks]
- [Correlation risks]

---

## 📊 SUPPORTING DATA
**Current Price:** $X,XXX
**24h Change:** +X%
**Fear & Greed:** X (Label)
**RSI:** X
**DXY:** X
**Key Support:** $X,XXX
**Key Resistance:** $X,XXX

---

## 🔔 NEXT ACTIONS
1. [Enter position at $X,XXX or below]
2. [Set stop-loss at $X,XXX immediately]
3. [Take 50% profit at Target 1, move stop to breakeven]
4. [Re-evaluate if price breaks $X,XXX]

**Next Analysis:** [In 24h OR if price hits key level]
```

---

## Decision Matrix

| Confidence | Agreeing Signals | Action |
|------------|------------------|--------|
| >70% | 4-5 of 5 | STRONG BUY/SELL |
| 50-70% | 3 of 5 | BUY/SELL (smaller size) |
| 30-50% | 2 of 5 | WATCH (no trade yet) |
| <30% | 0-1 of 5 | WAIT (conflicting signals) |

---

## Conflict Resolution Rules

**If Technical says BUY but Sentiment says SELL:**
- Check price action (tiebreaker)
- Check events (veto power)
- If still unclear → WAIT

**If Events Agent flags high risk:**
- Reduce position size by 50%
- OR delay trade until after event

**If macro contradicts technical:**
- Macro > Technical (macro is bigger picture)
- Example: Perfect technical setup, but Fed meeting tomorrow = WAIT

---

## Quality Checks Before Output

- [ ] Entry price is specific (not "around $X")
- [ ] Stop-loss is ALWAYS included
- [ ] Risk/reward is ≥1:2 minimum
- [ ] Position size matches confidence
- [ ] All risk factors listed
- [ ] Conflicting signals explained
- [ ] Next action is clear
