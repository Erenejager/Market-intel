# PARAMETER UPDATES - IMMEDIATE IMPLEMENTATION
**Date:** March 10, 2026  
**Based on:** 7-day backtest analysis (Mar 7-10)  
**Status:** READY FOR DEPLOYMENT

---

## 1. UPDATE THRESHOLDS

### File: `market-intel/agents/crypto-analyst.md`

**FIND:**
```markdown
**Signal guidelines:**
- **BUY** (0.7-1.0): Strong technical breakout + on-chain accumulation + macro tailwinds
- **SELL** (0.7-1.0): Breakdown of key support + distribution signals + macro headwinds
- **WATCH** (0.5-0.7): Mixed signals, could go either way, monitor closely
- **HOLD** (0.0-0.5): No clear edge, stay patient
```

**REPLACE WITH:**
```markdown
**Signal guidelines:**
- **BUY** (0.65-1.0): Strong technical breakout + on-chain accumulation + macro tailwinds
- **SELL** (0.65-1.0): Breakdown of key support + distribution signals + macro headwinds
- **WATCH** (0.5-0.65): Mixed signals, could go either way, monitor closely
- **HOLD** (0.0-0.5): No clear edge, stay patient

**LOWERED THRESHOLD:** BUY/SELL moved from 0.70 → 0.65 to capture opportunities during extreme fear
```

---

### File: `market-intel/agents/gold-analyst.md`

**ADD AFTER SIGNAL GUIDELINES:**
```markdown
**Geopolitical Volatility Protection:**
- IF 24h price move > 5% AND geopolitical event active (war/conflict keywords in news):
  - Cap maximum strength at 0.75 (prevents buying peaks)
  - Require 2 consecutive runs with BUY signal before alerting
  - Add reasoning: "Geopolitical premium may be temporary"

**Examples of geopolitical keywords:** war, conflict, strike, attack, invasion, sanctions
```

---

## 2. UPDATE EXTREME FEAR LOGIC

### File: `market-intel/agents/crypto-analyst.md`

**FIND:**
```python
# Extreme fear contrarian
if fear_greed <= 20:
    contrarian_adjustment = +0.05
```

**REPLACE WITH:**
```python
# Extreme fear contrarian (enhanced with duration tracking)
if fear_greed < 15:
    # Check fear duration from previous runs
    if fear_duration >= 4:
        contrarian_adjustment = +0.20  # Severe capitulation
    elif fear_duration >= 3:
        contrarian_adjustment = +0.15  # Strong capitulation
    elif fear_duration >= 2:
        contrarian_adjustment = +0.12
    else:
        contrarian_adjustment = +0.10
elif fear_greed <= 20:
    contrarian_adjustment = +0.05  # Mild fear
```

**ADD NEW SECTION:**
```markdown
## Fear Duration Tracking

Create file: `market-intel/data/fear-history.json`
```json
{
  "current_fear_streak": 0,
  "last_updated": "2026-03-10T23:50:00Z",
  "history": [
    {"timestamp": "2026-03-10T12:00:00Z", "value": 13},
    {"timestamp": "2026-03-10T00:00:00Z", "value": 8},
    {"timestamp": "2026-03-09T12:00:00Z", "value": 12}
  ]
}
```

**Logic:**
- Read fear-history.json at start of each run
- If current fear < 15 and previous fear < 15: increment streak
- Else: reset streak to 1
- Use streak count for duration-based boost
```

---

## 3. UPDATE WHALE DATA PENALTY

### File: `market-intel/agents/crypto-analyst.md`

**FIND:**
```markdown
**Use in confluence scoring:**
- Strong accumulation + trend aligned + bullish divergence → +12-15% boost
- Accumulation + trend aligned → +6-9% boost
- Distribution (conflicting trends) → -3-6% penalty (reduced confidence)
- Strong distribution + trend aligned → -12-15% penalty
- Neutral → 0% adjustment
```

**ADD:**
```markdown
**UNAVAILABLE DATA HANDLING:**
- Whale data unavailable: -0.03 adjustment (down from -0.10)
- Reasoning: Lack of data ≠ negative signal, just uncertainty
- Note in reasoning: "Whale data unavailable - reduced conviction"
```

---

## 4. UPDATE MACRO CONFLUENCE

### File: `market-intel/agents/crypto-analyst.md` AND `gold-analyst.md`

**FIND:**
```python
# Macro adjustments
if macro_regime == "RISK_OFF":
    adjustment = -0.05
elif macro_regime == "RISK_ON":
    adjustment = +0.05
```

**REPLACE WITH:**
```python
# Gradient macro adjustments (asset-specific)
if asset in ["BTC", "ETH"]:
    macro_adjustments = {
        "EXTREME_RISK_OFF": -0.08,  # VIX > 35
        "RISK_OFF": -0.03,           # VIX 25-35
        "NEUTRAL": 0.00,             # VIX 15-25
        "RISK_ON": +0.05,            # VIX < 15
        "EXTREME_RISK_ON": +0.08     # VIX < 12
    }
elif asset == "GOLD":
    macro_adjustments = {
        "EXTREME_RISK_OFF": +0.08,  # Safe haven benefit
        "RISK_OFF": +0.03,
        "NEUTRAL": 0.00,
        "RISK_ON": -0.03,           # Risk assets preferred
        "EXTREME_RISK_ON": -0.05
    }

# Determine regime from VIX
if vix > 35:
    regime = "EXTREME_RISK_OFF"
elif vix > 25:
    regime = "RISK_OFF"
elif vix > 15:
    regime = "NEUTRAL"
elif vix > 12:
    regime = "RISK_ON"
else:
    regime = "EXTREME_RISK_ON"

adjustment = macro_adjustments[regime]
```

---

## 5. ADD HEADLINE VOLATILITY DETECTION

### NEW SECTION in `gold-analyst.md`:

```markdown
## Headline-Driven Volatility Detection

**Purpose:** Prevent buying tops during headline-driven spikes

**Implementation:**
1. Check 24h price change: `abs((current_price - price_24h_ago) / price_24h_ago)`
2. If > 5%: Flag as "headline-driven volatility"
3. Scan news titles for keywords: ["Trump", "war", "peace", "deal", "strike", "attack", "agreement"]
4. If keywords found + price spike: Apply volatility penalty

**Penalty:**
```python
if headline_volatility_detected:
    # Cap strength at 75%
    final_strength = min(final_strength, 0.75)
    
    # Add reasoning note
    reasoning += " ⚠️ HEADLINE-DRIVEN VOLATILITY: 24h move >5% on geopolitical news. Capping signal strength at 75% - wait for confirmation before entering."
```

**Example:**
- Price: $5,107 → $5,457 (+6.8% in 6 hours)
- News: "Trump says Iran war ending soon"
- Action: Cap BUY signal at 75%, require 2 consecutive confirmations
```

---

## 6. UPDATE FINAL STRENGTH CALCULATION

### File: `market-intel/agents/crypto-analyst.md`

**ADD AT END OF CONFLUENCE SECTION:**

```markdown
## Final Strength Calculation (Updated Formula)

```python
# Start with base strength
final_strength = base_strength

# 1. Extreme fear duration boost
if fear_greed < 15:
    if fear_streak >= 4:
        final_strength += 0.20
    elif fear_streak >= 3:
        final_strength += 0.15
    elif fear_streak >= 2:
        final_strength += 0.12
    else:
        final_strength += 0.10

# 2. Whale flow adjustment (if available)
if whale_data_available:
    final_strength += whale_adjustment  # -0.12 to +0.12
else:
    final_strength -= 0.03  # Reduced uncertainty penalty

# 3. Funding rate adjustment
final_strength += funding_adjustment  # -0.10 to +0.10

# 4. Macro regime adjustment (gradient)
final_strength += macro_adjustment  # -0.08 to +0.08 (asset-specific)

# 5. Cap at 95% (never 100% confidence)
final_strength = min(0.95, final_strength)

# 6. Signal determination (UPDATED THRESHOLD)
if final_strength >= 0.65:  # LOWERED from 0.70
    signal = "BUY"
elif final_strength >= 0.50:
    signal = "WATCH"
else:
    signal = "HOLD"
```
```

---

### File: `market-intel/agents/gold-analyst.md`

**ADD SIMILAR SECTION:**

```markdown
## Final Strength Calculation (Gold-Specific)

```python
# Start with base strength
final_strength = base_strength

# 1. Headline volatility check (NEW)
price_change_24h = abs((current_price - price_24h_ago) / price_24h_ago)
if price_change_24h > 0.05 and geopolitical_keywords_in_news:
    final_strength = min(final_strength, 0.75)  # Cap at 75%
    require_confirmation = True  # Need 2 consecutive BUYs

# 2. Macro regime adjustment (gradient, gold-specific)
final_strength += macro_adjustment  # +0.03 to +0.08 for RISK_OFF

# 3. Sentiment adjustment
if etf_flows == "STRONG_POSITIVE":
    final_strength += 0.05
if central_bank_buying == "ACTIVE":
    final_strength += 0.03

# 4. Cap at 95%
final_strength = min(0.95, final_strength)

# 5. Signal determination (KEEP threshold at 0.70)
if final_strength >= 0.70 and (not require_confirmation or confirmed):
    signal = "BUY"
elif final_strength >= 0.50:
    signal = "WATCH"
else:
    signal = "HOLD"
```
```

---

## 7. CREATE TRACKING FILES

### New file: `market-intel/data/fear-history.json`
```json
{
  "current_streak": 0,
  "last_fear_value": 64,
  "last_updated": "2026-03-10T23:50:00Z",
  "history": []
}
```

### New file: `market-intel/data/signal-performance.json`
```json
{
  "last_updated": "2026-03-10T23:50:00Z",
  "trades": [],
  "summary": {
    "total_trades": 0,
    "winning_trades": 0,
    "losing_trades": 0,
    "win_rate": 0.0,
    "average_pnl": 0.0,
    "total_pnl": 0.0
  }
}
```

---

## TESTING CHECKLIST

Before deploying to production:

- [ ] Update all 4 agent files with new thresholds
- [ ] Create fear-history.json tracking file
- [ ] Create signal-performance.json tracking file
- [ ] Test new parameters on last 3 historical runs
- [ ] Verify gradient macro adjustments work
- [ ] Test headline volatility detection
- [ ] Run full orchestration with new params
- [ ] Compare old vs new signal outputs
- [ ] Document any edge cases discovered

---

## ROLLBACK PLAN

If new parameters perform worse:

1. Revert agent files from git: `git checkout HEAD~1 market-intel/agents/*.md`
2. Delete tracking files
3. Resume with old parameters
4. Document why changes failed
5. Re-analyze with longer timeframe

---

## SUCCESS METRICS (7-Day Trial)

**Target Performance (March 11-17):**
- Win rate: > 55% (up from 22% for gold)
- Average P&L per BUY signal: > +1.5%
- Max single trade loss: < 3%
- Opportunity cost (WATCH signals that should've been BUY): < 2%

**If achieved:** Keep new parameters, continue optimizing
**If not achieved:** Revert and re-analyze

---

## DEPLOYMENT TIMELINE

**March 10, 23:50:** Complete backtest analysis ✅  
**March 11, 00:00:** Update agent parameter files  
**March 11, 06:00:** First run with new parameters  
**March 11, 12:00:** Review first results  
**March 14, 00:00:** 3-day checkpoint review  
**March 17, 18:00:** Full 7-day performance review  

---

## NOTES

- These changes are DATA-DRIVEN from actual trade performance
- Conservative approach: Only fix clear errors (gold volatility, crypto thresholds)
- Larger changes (ML-based optimization) postponed until more data
- Focus on preventing known mistakes (buying war premium peaks, missing extreme fear bottoms)
