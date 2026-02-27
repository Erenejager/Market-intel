# Trade Entry Quick Reference

## Signal Interpretation

| Strength | Signal | Action | Entry Specs |
|----------|--------|--------|-------------|
| 0.7-1.0 | STRONG BUY/SELL | Execute now | ✅ Full specs |
| 0.5-0.7 | WATCH | Monitor / Small position | ✅ Full specs |
| 0.0-0.5 | HOLD | Wait | ❌ No entry |

---

## Entry Specification Checklist

```json
{
  "entry": {
    "optimal": 65200,        // Target entry price
    "range": [65000, 65400], // Entry zone (±0.3%)
    "order_type": "LIMIT",   // LIMIT or MARKET
    "timeframe": "4H"        // Chart timeframe
  },
  
  "stop_loss": {
    "price": 64000,          // Stop price
    "percent": -1.84,        // % risk from entry
    "reasoning": "..."       // Why this level
  },
  
  "take_profit": {
    "tp1": {                 // 30% position
      "price": 67500,
      "percent": 3.5,
      "r_to_r": 1.9          // Risk:reward ratio
    },
    "tp2": { ... },          // 50% position
    "tp3": { ... }           // 20% position
  },
  
  "position_sizing": {
    "risk_percent": 2,       // % of account risked
    "account_size": 10000,   // Total capital
    "position_value": 1090,  // $ value of position
    "units": 0.0167          // Asset units to buy
  }
}
```

---

## Quick Formulas

### Stop Loss
```
Stop = Entry - (1.5 × ATR)
```

### Position Size
```
Risk $ = Account × 2%
Position $ = Risk $ / Stop %
Units = Position $ / Entry Price
```

### Risk:Reward
```
R:R = (TP - Entry) / (Entry - Stop)
```

Minimum R:R = 2:1

---

## Example Trade

**BTC BUY Signal (0.82 strength)**

| Parameter | Value |
|-----------|-------|
| **Entry** | $65,200 (LIMIT $65,000-$65,400) |
| **Stop** | $64,000 (-1.84%) |
| **TP1** | $67,500 (+3.5%, R:R 1.9:1) |
| **TP2** | $69,000 (+5.8%, R:R 3.2:1) |
| **TP3** | $71,000 (+8.9%, R:R 4.8:1) |
| **Risk** | 2% of $10,000 = $200 |
| **Position** | 0.167 BTC ($10,870) |

**Execution:**
1. Set LIMIT buy at $65,200
2. Set STOP at $64,000
3. Set TAKE PROFIT orders:
   - Sell 30% at $67,500
   - Sell 50% at $69,000  
   - Sell 20% at $71,000

**Risk:** $200 (2% of account)  
**Potential Profit:** $580 (TP1), $967 (TP2), $1,187 (TP3)

---

## Position Scaling

| Exit | % Position | Price | Profit | Purpose |
|------|-----------|-------|--------|---------|
| TP1 | 30% | $67,500 | +$383 | Lock profit |
| TP2 | 50% | $69,000 | +$634 | Main target |
| TP3 | 20% | $71,000 | +$237 | Extended run |

**Total potential:** $1,254 (12.5% ROI) risking $200 (2%)

---

## Asset-Specific Notes

### Crypto (BTC/ETH)
- **Volatility**: High
- **Entry buffer**: ±0.3%
- **Timeframe**: 4H (swing), 1H (day)
- **ATR**: Typically $500-$1,500 for BTC

### Gold
- **Volatility**: Moderate  
- **Entry buffer**: ±0.2%
- **Timeframe**: DAILY
- **ATR**: Typically $15-$30
- **Units**: Troy ounces (1 lot = 100 oz)

---

## Risk Management

✅ **Do:**
- Risk 1-2% per trade (conservative)
- Use stop losses ALWAYS
- Scale out at TP levels
- Keep R:R above 2:1

❌ **Don't:**
- Risk >5% per trade
- Move stops against you
- Take full position off at TP1
- Ignore low R:R setups (<1.5:1)

---

## Order Placement Template

### Limit Order Entry
```
BUY 0.167 BTC @ $65,200
STOP LOSS @ $64,000
TAKE PROFIT 1 @ $67,500 (sell 30%)
TAKE PROFIT 2 @ $69,000 (sell 50%)
TAKE PROFIT 3 @ $71,000 (sell 20%)
```

### Market Order Entry
```
BUY 0.167 BTC @ MARKET
STOP LOSS @ $64,000 (immediately after fill)
TAKE PROFIT 1 @ $67,500 (30%)
TAKE PROFIT 2 @ $69,000 (50%)
TAKE PROFIT 3 @ $71,000 (20%)
```

---

**Remember:** These are algorithmic signals. Always validate with your own analysis and risk tolerance.
