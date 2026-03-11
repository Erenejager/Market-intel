# 🚀 IMMEDIATE DEPLOYMENT GUIDE
**Context-Aware Decision System**  
**Fixes:** Rigid thresholds + Volatility blindness  
**Expected Impact:** +7% on 3.5-day backtest (~60% annualized)

---

## ⚡ PHASE 1: TONIGHT (2 hours)

### Step 1: Test the New System (5 minutes)

```bash
cd /home/clawdbot/.openclaw/workspace/market-intel/lib
python3 context_aware_decision.py
```

**Expected output:**
```
BTC March 9 Test:
Signal: BUY (should be BUY)  ✅
Strength: 0.72
Threshold: 0.57

Gold March 10 Test:
Signal: WATCH (should be WATCH)  ✅
Veto: True (should be True)
Strength: 0.55
Threshold: 0.70
```

If tests pass → proceed. If fail → debug first.

---

### Step 2: Update Crypto Analyst (30 minutes)

**File:** `market-intel/agents/crypto-analyst.md`

**FIND THIS SECTION (line ~450):**
```markdown
## Confluence Adjustment Logic (Tier 2 Enhanced)

**Apply adjustments AFTER calculating base signal strength:**
```

**ADD THIS NEW SECTION BEFORE IT:**

````markdown
## PHASE 1: CONTEXT-AWARE DECISION (NEW)

**This system replaces the fixed 0.70 threshold with adaptive thresholds.**

### Quick Integration:

```python
# At the end of your analysis, instead of:
# final_strength = base_strength + adjustments
# if final_strength >= 0.70: signal = "BUY"

# Use this:
from context_aware_decision import ContextAwareDecisionEngine

engine = ContextAwareDecisionEngine()
decision = engine.make_decision(
    asset='BTC',  # or 'ETH'
    base_strength=base_strength,  # Your calculated strength
    market_data={
        'price': price_current,
        'fear_greed': fear_greed_value,
        'vix': vix_current,
        'price_history': {
            '24h_ago': price_24h_ago,
            '24h_avg_move': 0.025  # 2.5% typical for crypto
        },
        'whale_data': whale_net_flow_24h if available else None,
        'funding_rate': funding_rate_value
    },
    news_data={
        'titles': recent_news_headlines  # List of strings
    }
)

# Use the decision:
signal = decision['signal']  # BUY/WATCH/HOLD
final_strength = decision['adjusted_strength']
dynamic_threshold = decision['dynamic_threshold']
reasoning_to_include = decision['final_reasoning']

# decision['metadata'] has full context if needed
```

### What This Does:

1. **Dynamic Threshold:** Lowers from 0.70 to 0.60 during EXTREME_FEAR
2. **Volatility Detection:** Penalizes large moves (>5% in 24h)
3. **Headline Scanning:** Detects war/peace news, applies veto if needed
4. **Veto Power:** Can downgrade BUY → WATCH if buying a spike

### Integration Points:

**After calculating base_strength**, call the engine:

```python
# Example integration
base_strength = 0.67  # From your current logic

# Add context-aware layer
decision = engine.make_decision(
    asset='BTC',
    base_strength=base_strength,
    market_data={...},  # See above
    news_data={...}
)

# Override your signal with context-aware decision
signal = decision['signal']
strength = decision['adjusted_strength']

# Append reasoning
reasoning += "\n\n" + decision['final_reasoning']
```

**Fallback:** If the engine fails for any reason, use old logic:
```python
try:
    decision = engine.make_decision(...)
    signal = decision['signal']
except Exception as e:
    print(f"Context engine failed: {e}, using fallback")
    signal = "BUY" if base_strength >= 0.70 else "WATCH"
```
````

---

### Step 3: Update Gold Analyst (30 minutes)

**File:** `market-intel/agents/gold-analyst.md`

**FIND THIS SECTION (line ~100):**
```markdown
## Output Format

Return a JSON array with one object for each asset
```

**ADD BEFORE THE "Output Format" SECTION:**

````markdown
## PHASE 1: CONTEXT-AWARE DECISION (NEW)

**Same as crypto, but for Gold:**

```python
from context_aware_decision import ContextAwareDecisionEngine

engine = ContextAwareDecisionEngine()
decision = engine.make_decision(
    asset='GOLD',  # Important: use 'GOLD' not 'GC=F'
    base_strength=base_strength,
    market_data={
        'price': gold_futures_price,
        'fear_greed': None,  # Gold doesn't use crypto F&G
        'vix': vix_current,
        'price_history': {
            '6h_ago': price_6h_ago,
            '24h_ago': price_24h_ago,
            '6h_avg_move': 0.008,  # 0.8% typical for gold 6h
            '24h_avg_move': 0.015  # 1.5% typical for gold 24h
        },
        'technical_rating': tradingview_rating,  # 'STRONG_BUY' etc.
        'whale_data': None  # Gold doesn't use whale tracking
    },
    news_data={
        'titles': recent_headlines  # CRITICAL for gold (war news)
    }
)

signal = decision['signal']
final_strength = decision['adjusted_strength']
reasoning += "\n\n" + decision['final_reasoning']
```

### Gold-Specific Features:

1. **Headline Veto:** If gold spikes >5% on war news, veto BUY signal
2. **Higher Base Threshold:** 0.70 (vs 0.65 for crypto) - gold is less volatile
3. **VIX-Adjusted:** RISK_OFF boosts gold, RISK_ON penalizes

### Critical: Always Pass News Headlines

Gold is highly sensitive to geopolitical headlines. The volatility engine NEEDS recent news titles to detect:
- War escalation vs de-escalation
- Peace deals
- Fed policy shifts

**Minimum:** Pass last 3-5 headlines from web_search results.
````

---

### Step 4: Update Orchestrator (20 minutes)

**File:** `market-intel/agents/orchestrator.md`

**FIND THIS SECTION:**
```markdown
## Decision Matrix

| Confidence | Agreeing Signals | Action |
```

**ADD THIS BEFORE IT:**

````markdown
## PHASE 1: CONTEXT-AWARE THRESHOLDS (NEW)

**Before using the decision matrix, apply context-aware logic:**

### For Each Asset:

```python
from context_aware_decision import ContextAwareDecisionEngine

engine = ContextAwareDecisionEngine()

# For BTC/ETH
btc_decision = engine.make_decision(
    asset='BTC',
    base_strength=btc_base_strength,  # From crypto analyst
    market_data={...},  # From macro scout
    news_data={...}  # From web_search
)

# For Gold
gold_decision = engine.make_decision(
    asset='GOLD',
    base_strength=gold_base_strength,  # From gold analyst
    market_data={...},
    news_data={...}
)

# Use these adjusted signals instead of raw analyst outputs
final_signals = {
    'BTC': {
        'signal': btc_decision['signal'],
        'strength': btc_decision['adjusted_strength'],
        'threshold': btc_decision['dynamic_threshold'],
        'veto': btc_decision['volatility_veto']
    },
    'GOLD': {...},
}
```

### Alert Thresholds (Updated):

- **Immediate Alert:** strength >= 0.75 (raised from 0.70)
- **Digest:** strength >= 0.50
- **Logged Only:** strength < 0.50

**Why raised:** The context engine already lowers thresholds during extreme fear. By the time a signal reaches 0.75 after all adjustments, it's very high conviction.
````

---

### Step 5: Create Test Script (15 minutes)

**File:** `market-intel/test_context_engine.sh`

```bash
#!/bin/bash
# Test context-aware decision engine on historical data

cd /home/clawdbot/.openclaw/workspace/market-intel/lib

echo "=== Testing Context-Aware Decision Engine ==="
echo ""

echo "Test 1: BTC March 9, 00:00 (should BUY)"
echo "Expected: Signal=BUY, Threshold~0.57"
python3 -c "
from context_aware_decision import ContextAwareDecisionEngine

engine = ContextAwareDecisionEngine()
decision = engine.make_decision(
    asset='BTC',
    base_strength=0.67,
    market_data={
        'price': 65973,
        'fear_greed': 8,
        'vix': 28,
        'price_history': {'24h_ago': 67842, '24h_avg_move': 0.025},
        'whale_data': None,
        'funding_rate': -0.00045
    },
    news_data={'titles': []}
)
print(f\"Signal: {decision['signal']} | Strength: {decision['adjusted_strength']:.2f} | Threshold: {decision['dynamic_threshold']:.2f}\")
print(f\"Veto: {decision['volatility_veto']}\")
assert decision['signal'] == 'BUY', 'FAILED: Should be BUY'
print('✅ PASSED')
"
echo ""

echo "Test 2: Gold March 10, 06:00 (should WATCH/veto)"
echo "Expected: Signal=WATCH, Veto=True"
python3 -c "
from context_aware_decision import ContextAwareDecisionEngine

engine = ContextAwareDecisionEngine()
decision = engine.make_decision(
    asset='GOLD',
    base_strength=0.75,
    market_data={
        'price': 5457,
        'fear_greed': 59,
        'vix': 25,
        'price_history': {'6h_ago': 5132, '6h_avg_move': 0.008},
        'technical_rating': 'STRONG_BUY'
    },
    news_data={'titles': [
        \"Trump says Iran war could end 'pretty quickly'\",
        \"Gold steadies after Trump signals war may be nearing end\"
    ]}
)
print(f\"Signal: {decision['signal']} | Strength: {decision['adjusted_strength']:.2f} | Threshold: {decision['dynamic_threshold']:.2f}\")
print(f\"Veto: {decision['volatility_veto']}\")
assert decision['signal'] == 'WATCH', 'FAILED: Should be WATCH'
assert decision['volatility_veto'] == True, 'FAILED: Should veto'
print('✅ PASSED')
"
echo ""

echo "Test 3: BTC during normal conditions (baseline)"
python3 -c "
from context_aware_decision import ContextAwareDecisionEngine

engine = ContextAwareDecisionEngine()
decision = engine.make_decision(
    asset='BTC',
    base_strength=0.68,
    market_data={
        'price': 70000,
        'fear_greed': 55,
        'vix': 18,
        'price_history': {'24h_ago': 69500, '24h_avg_move': 0.025},
        'whale_data': -500,
        'funding_rate': 0.0001
    },
    news_data={'titles': []}
)
print(f\"Signal: {decision['signal']} | Strength: {decision['adjusted_strength']:.2f} | Threshold: {decision['dynamic_threshold']:.2f}\")
print(f\"Veto: {decision['volatility_veto']}\")
print('✅ Baseline test complete')
"

echo ""
echo "=== All Tests Complete ==="
```

**Make executable:**
```bash
chmod +x market-intel/test_context_engine.sh
```

**Run tests:**
```bash
./market-intel/test_context_engine.sh
```

If all tests pass → deploy to agents!

---

## 📋 DEPLOYMENT CHECKLIST

Before going live:

- [ ] Tests pass (test_context_engine.sh)
- [ ] crypto-analyst.md updated with integration code
- [ ] gold-analyst.md updated with integration code
- [ ] orchestrator.md updated with new thresholds
- [ ] Agents can import context_aware_decision.py (check Python path)
- [ ] Backup old agent files: `cp market-intel/agents/*.md market-intel/agents/backup/`

---

## 🔄 ROLLBACK PLAN

If something breaks:

```bash
# Restore old agents
cp market-intel/agents/backup/*.md market-intel/agents/

# Or just comment out the new code:
# In each agent file, wrap the context engine calls with:
# try:
#     # New code
# except:
#     # Old code (fallback)
```

---

## 📊 MEASURING SUCCESS

**After 24 hours (March 11, 23:59):**

Compare new signals vs what old system would've given:

```bash
# Check signals.json
cat market-intel/data/signals.json | jq '.[] | select(.timestamp > "2026-03-11") | {asset: .signals[0].asset, signal: .signals[0].signal, strength: .signals[0].strength_adjusted}'
```

**Expected improvements:**
- BTC signals during extreme fear → Should trigger BUY (not WATCH)
- Gold signals on headline spikes → Should WATCH or veto (not BUY)
- Win rate: >60% (up from 22% for gold)
- Avg P&L: >+1.5% per signal

---

## ⏭️ NEXT PHASES

**Phase 2 (Tomorrow):** Enhance fear duration tracking
**Phase 3 (This Week):** Add multi-timeframe confirmation
**Phase 4 (Next Week):** ML-based threshold optimization

---

## 🆘 TROUBLESHOOTING

**Import error:**
```python
ModuleNotFoundError: No module named 'context_aware_decision'
```
**Fix:** Add to agent files:
```python
import sys
sys.path.append('/home/clawdbot/.openclaw/workspace/market-intel/lib')
from context_aware_decision import ContextAwareDecisionEngine
```

**Engine returns HOLD when should BUY:**
- Check base_strength value (is it actually high enough?)
- Check context (extreme greed raises threshold)
- Check volatility (big spike applies penalty)

**Veto triggering too often:**
- Review news_titles (are they being passed correctly?)
- Check move_ratio calculation (is 24h_avg_move accurate?)

---

## 🎯 EXPECTED RESULTS

**Tonight's Run (March 11, 00:00):**

If BTC is still around $69k-$70k with F&G 50-60:
- Old system: WATCH (strength ~0.68)
- New system: BUY or strong WATCH (threshold ~0.65)

If Gold is stable around $5,100-$5,200:
- Old system: BUY (strength ~0.72)
- New system: WATCH or BUY at 0.70-0.75 (depends on news)

**Key Difference:** New system will be MORE AGGRESSIVE during fear, MORE CAUTIOUS during spikes.

---

Ready to deploy? 🚀

Run the tests, update the files, and let's see if we can catch that next +6% move!
