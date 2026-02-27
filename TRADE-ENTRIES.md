# Trade Entry Specifications

## Overview

The market intelligence system now provides **complete trade entry specifications** for all actionable signals (strength ≥ 0.5), including:

✅ Entry zones (optimal price + range)  
✅ Stop loss levels (ATR-based)  
✅ Take profit targets (3 levels with R:R)  
✅ Position sizing (risk-based)  
✅ Technical support/resistance levels

---

## Signal Output Format

### Full Trade Specification (BUY signal ≥ 0.5)

```json
{
  "asset": "BTC",
  "signal": "BUY",
  "strength": 0.82,
  "reasoning": "Breakout above $65k with volume...",
  
  "price_current": 65432,
  "price_24h_change": 2.5,
  
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
    "tp1": { 
      "price": 67500, 
      "percent": 3.5, 
      "r_to_r": 1.9 
    },
    "tp2": { 
      "price": 69000, 
      "percent": 5.8, 
      "r_to_r": 3.2 
    },
    "tp3": { 
      "price": 71000, 
      "percent": 8.9, 
      "r_to_r": 4.8 
    }
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
  
  "sources": ["..."]
}
```

---

## Calculation Methodology

### 1. Entry Zone

**Optimal Entry:**
- Current price if breakout confirmed
- Nearest support/resistance for better R:R
- Adjusted for pullback opportunity

**Entry Range:**
- Crypto: ±0.3% (higher volatility)
- Gold: ±0.2% (lower volatility)
- Allows for slippage and limit order fills

**Order Type:**
- **LIMIT**: Waiting for pullback to support
- **MARKET**: Confirmed breakout with volume

**Timeframe:**
- Crypto: 4H (swing), 1H (day trading)
- Gold: DAILY (macro-driven)

---

### 2. Stop Loss

**Method:** 1.5x ATR (Average True Range, 14 periods)

**Formula:**
```
Long Stop = Entry - (1.5 × ATR)
Short Stop = Entry + (1.5 × ATR)
```

**Validation:**
- Must clear previous swing low (long) / high (short)
- Should not exceed max risk (typically 3-5%)
- Placed below/above key support/resistance

**Example (BTC Long):**
- Entry: $65,200
- ATR(14): $800
- Stop: $65,200 - (1.5 × $800) = $64,000
- Risk: -1.84%

**Why 1.5x ATR?**
- 1x ATR too tight (stops out on normal volatility)
- 2x ATR too loose (excessive risk)
- 1.5x ATR balances protection vs. room to breathe

---

### 3. Take Profit Targets

**Three-tier approach** (scale out as price moves up):

#### TP1 - Quick Profit (30% of position)
- **Target**: 1.618 Fibonacci extension or next resistance
- **R:R minimum**: 1.5:1
- **Purpose**: Lock in profits quickly, reduce risk

#### TP2 - Main Target (50% of position)
- **Target**: 2.618 Fib extension or major resistance
- **R:R minimum**: 2.5:1
- **Purpose**: Main profit zone

#### TP3 - Moon Shot (20% of position)
- **Target**: 4.236 Fib extension or psychological level
- **R:R minimum**: 4:1
- **Purpose**: Capture extended runs, lottery ticket

**Risk/Reward Calculation:**
```
R:R = (Take Profit - Entry) / (Entry - Stop Loss)
```

**Example:**
- Entry: $65,200
- Stop: $64,000 (risk = $1,200)
- TP1: $67,500 (reward = $2,300) → R:R = 1.9:1 ✅
- TP2: $69,000 (reward = $3,800) → R:R = 3.2:1 ✅
- TP3: $71,000 (reward = $5,800) → R:R = 4.8:1 ✅

All targets exceed minimum R:R thresholds from config.

---

### 4. Position Sizing

**Fixed Percentage Risk Method** (default: 2% from config)

**Formula:**
```
Risk Amount = Account Size × Risk %
Position Value = Risk Amount / Stop Loss %
Units to Buy = Position Value / Entry Price
```

**Example (BTC):**
- Account: $10,000
- Risk: 2% = $200
- Stop loss: 1.84% from entry
- Position value = $200 / 0.0184 = $10,870
- Entry price: $65,200
- **Units to buy: 0.1667 BTC**

**Position as % of Account:**
- Position value / Account = $10,870 / $10,000 = 108.7%
- **Use leverage if needed** (or reduce risk % to avoid leverage)

**No-Leverage Alternative:**
- Max position = Account size = $10,000
- Units = $10,000 / $65,200 = 0.1534 BTC
- Risk = 0.1534 × $1,200 = $184 (1.84% of account) ✅

**For Gold (CFDs/Futures):**
- 1 standard lot = 100 troy oz
- 1 micro lot = 10 troy oz
- Calculate ounces first, then convert to lots

---

### 5. Technical Levels

**Support Levels** (3 nearest below current price):
- Recent swing lows
- Previous breakout points (now support)
- Round numbers (psychological)
- Fibonacci retracement levels

**Resistance Levels** (3 nearest above current price):
- Recent swing highs
- Previous breakdown points (now resistance)
- Round numbers
- Fibonacci extension levels

**Purpose:**
- Validate stop loss placement
- Identify TP target zones
- Understand price structure

---

## Risk Management Rules (from config.json)

```json
{
  "risk_management": {
    "default_risk_percent": 2,
    "max_risk_percent": 5,
    "min_risk_reward": 2,
    "stop_loss_atr_multiplier": 1.5,
    "entry_buffer_percent": 0.3
  }
}
```

**Rules:**
1. **Risk per trade**: Default 2%, max 5% for very high conviction
2. **Minimum R:R**: 2:1 (risk $1 to make $2)
3. **Stop loss**: 1.5x ATR (not too tight, not too loose)
4. **Entry buffer**: ±0.3% for limit orders (slippage allowance)

---

## When Trade Entries Are Provided

**✅ BUY/SELL signals with strength ≥ 0.5:**
- Complete entry specifications
- All fields populated
- Ready to execute

**❌ WATCH signals (strength 0.5-0.7):**
- Entry specs included if strength ≥ 0.5
- Lower conviction = wider stops or skip entry

**❌ HOLD signals (strength < 0.5):**
- No entry specifications
- Not actionable yet
- Monitor only

---

## Example Use Cases

### High Conviction BUY (0.8+ strength)

**Gold BUY at 0.92:**
```
Entry: $2,710 (current price, breakout)
Stop: $2,680 (-1.1%)
TP1: $2,750 (+1.5%, R:R 3.6:1)
TP2: $2,800 (+3.3%, R:R 8.2:1)
TP3: $2,860 (+5.5%, R:R 13.6:1)

Position: Risk 2% = 7.4 oz gold
```

**Action**: Execute immediately, high confidence

---

### Moderate BUY (0.6 strength)

**BTC BUY at 0.65:**
```
Entry: $65,200 (wait for pullback to $65k support)
Stop: $64,000 (-1.84%)
TP1: $67,000 (+2.8%, R:R 1.5:1)
TP2: $68,500 (+5.1%, R:R 2.8:1)
TP3: $70,000 (+7.4%, R:R 4.0:1)

Position: Risk 2% = 0.167 BTC
```

**Action**: Use limit order, wait for better entry

---

### WATCH Signal (0.58 strength)

**ETH WATCH:**
- Entry specs may be included (if ≥ 0.5)
- Lower conviction = consider smaller position (1% risk)
- Or wait for strength to increase before entering

---

## Integration with Alerts

**Immediate Alerts (≥ 0.7):**
```
🟢 GOLD BUY (92%)

Entry: $2,710 (LIMIT $2,705-$2,715)
Stop: $2,680 (-1.1%)
TP: $2,750 / $2,800 / $2,860
R:R: 3.6:1 / 8.2:1 / 13.6:1

Risk 2% = 7.4 oz (~$20,150 position)

Gold surging on USD weakness + Fed dovish...
```

**Digest (0.5-0.7):**
- Entry specs included
- Lower urgency
- Monitor for strength increase

---

## Disclaimers

⚠️ **Not Financial Advice**
- These are algorithmic signals, not recommendations
- Always do your own analysis
- Past performance ≠ future results

⚠️ **Use Appropriate Risk**
- Default 2% is conservative
- Adjust based on your risk tolerance
- Never risk more than you can afford to lose

⚠️ **Market Conditions Change**
- Entries may be invalidated by news/events
- Stops can be hit (expect losses on some trades)
- Adjust position sizing in volatile markets

---

**Trade responsibly. Manage risk. Scale your positions.**
