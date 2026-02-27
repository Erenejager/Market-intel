# Test Trade Entry Specifications

Quick test to verify agents generate proper trade entries.

## Test Prompt

**Copy this into OpenClaw:**

```
Spawn a crypto analyst agent:

Task: Read and follow market-intel/agents/crypto-analyst.md.

Analyze BTC. Use crypto-market-data skill for current price.

IMPORTANT: Since this is a BUY signal test, ensure you include COMPLETE trade entry specifications:
- entry (optimal, range, order_type, timeframe)
- stop_loss (price, percent, reasoning) using 1.5x ATR
- take_profit (tp1, tp2, tp3 with prices, %, and R:R)
- position_sizing (risk 2% of $10,000 account)
- technical_levels (3 support, 3 resistance)

Return ONLY valid JSON. No markdown, no explanations.

Label: crypto-test-entries
Timeout: 300 seconds
Cleanup: keep
```

---

## Expected Output

The agent should return JSON like:

```json
{
  "asset": "BTC",
  "signal": "BUY",
  "strength": 0.75,
  "reasoning": "...",
  "price_current": 65764,
  "price_24h_change": -2.05,
  
  "entry": {
    "optimal": 65500,
    "range": [65300, 65700],
    "order_type": "LIMIT",
    "timeframe": "4H"
  },
  
  "stop_loss": {
    "price": 64300,
    "percent": -1.83,
    "reasoning": "Below $64k support and 1.5x ATR ($800)"
  },
  
  "take_profit": {
    "tp1": { 
      "price": 67200, 
      "percent": 2.6, 
      "r_to_r": 1.4 
    },
    "tp2": { 
      "price": 68500, 
      "percent": 4.6, 
      "r_to_r": 2.5 
    },
    "tp3": { 
      "price": 70200, 
      "percent": 7.2, 
      "r_to_r": 3.9 
    }
  },
  
  "position_sizing": {
    "risk_percent": 2,
    "account_size": 10000,
    "position_value": 10930,
    "units": 0.167
  },
  
  "technical_levels": {
    "support": [64300, 62500, 60000],
    "resistance": [67200, 68500, 70200]
  },
  
  "sources": [...]
}
```

---

## Validation Checklist

### ✅ Entry Zone
- [ ] `optimal` is a reasonable price (within ±2% of current)
- [ ] `range` is ±0.3% from optimal
- [ ] `order_type` is either "LIMIT" or "MARKET"
- [ ] `timeframe` is "4H" or "1H"

### ✅ Stop Loss
- [ ] `price` is below entry for BUY (above for SELL)
- [ ] `percent` is negative (loss) and between -1% to -3%
- [ ] `reasoning` mentions ATR or key support level
- [ ] Stop is below lowest support level

### ✅ Take Profit
- [ ] All 3 targets (tp1, tp2, tp3) present
- [ ] Prices are ascending: tp1 < tp2 < tp3
- [ ] All `percent` values are positive (profit)
- [ ] R:R ratios increase: tp1 < tp2 < tp3
- [ ] Minimum R:R: tp1 ≥ 1.5, tp2 ≥ 2.5, tp3 ≥ 4.0
- [ ] TP levels align with resistance levels

### ✅ Position Sizing
- [ ] `risk_percent` = 2
- [ ] `account_size` = 10000
- [ ] `position_value` ≈ (200 / stop_loss_percent)
- [ ] `units` = position_value / entry_price
- [ ] Calculations are mathematically correct

### ✅ Technical Levels
- [ ] 3 support levels listed (ascending)
- [ ] 3 resistance levels listed (ascending)
- [ ] Support levels < entry < resistance levels
- [ ] Levels are reasonable (not random numbers)

---

## Manual Validation

### Check Stop Loss Calculation

```
Entry: $65,500
ATR(14): ~$800 (check with crypto-market-data)
Stop = Entry - (1.5 × ATR)
Stop = $65,500 - (1.5 × $800) = $64,300 ✅

Risk % = (Entry - Stop) / Entry × 100
Risk % = ($65,500 - $64,300) / $65,500 × 100 = 1.83% ✅
```

### Check Position Sizing

```
Account: $10,000
Risk: 2% = $200
Stop loss: 1.83%

Position value = Risk $ / Stop %
Position value = $200 / 0.0183 = $10,929 ✅

Units = Position value / Entry
Units = $10,929 / $65,500 = 0.1669 BTC ✅
```

### Check R:R Ratios

```
Entry: $65,500
Stop: $64,300
Risk per unit: $1,200

TP1: $67,200
Reward = $67,200 - $65,500 = $1,700
R:R = $1,700 / $1,200 = 1.42 ✅ (≥ 1.5 target, close)

TP2: $68,500
Reward = $68,500 - $65,500 = $3,000
R:R = $3,000 / $1,200 = 2.5 ✅

TP3: $70,200
Reward = $70,200 - $65,500 = $4,700
R:R = $4,700 / $1,200 = 3.92 ✅
```

---

## Common Issues

### ❌ Missing entry/stop/TP fields
**Fix:** Agent didn't read instructions properly. Emphasize "COMPLETE trade entry specifications" in prompt.

### ❌ R:R ratios too low
**Fix:** TP targets too conservative. Agent should use Fibonacci extensions or wider targets.

### ❌ Stop loss too tight (<1%)
**Fix:** ATR calculation may be wrong. Verify 1.5x ATR multiplier is used.

### ❌ Position sizing incorrect
**Fix:** Check formula: `Position $ = Risk $ / Stop %`

### ❌ Technical levels don't make sense
**Fix:** Agent should identify actual swing highs/lows, not arbitrary numbers.

---

## Gold Test

**Prompt:**

```
Spawn a gold analyst agent:

Task: Read and follow market-intel/agents/gold-analyst.md.

Analyze gold. Use gold-trading-skill and yahoo-finance-forex.

Include COMPLETE trade entry specifications per instructions.
Return ONLY valid JSON.

Label: gold-test-entries
Timeout: 180 seconds
```

**Expected:** Same structure as BTC, but:
- Entry buffer: ±0.2% (less volatile)
- Timeframe: "DAILY"
- Position units in troy ounces
- Support/resistance at round numbers ($2,700, $2,750, etc.)

---

## Success Criteria

✅ All fields present and properly formatted  
✅ Calculations are mathematically correct  
✅ R:R ratios meet minimums (1.5, 2.5, 4.0)  
✅ Stop loss uses 1.5x ATR  
✅ Position sizing uses 2% risk  
✅ Technical levels are realistic  

**If all checks pass → System ready for production trade signals!**
