# Funding Rate Integration Test

## Test Case 1: ETH with Negative Funding

**Scenario:**
- ETH base signal: BUY 0.70
- Funding rate: -0.00002809 (-0.002809%)
- Interpretation: NEGATIVE
- Adjustment: +5%

**Expected Output:**
```json
{
  "asset": "ETH",
  "signal": "BUY",
  "strength": 0.75,
  "funding_rate": -0.00002809,
  "funding_interpretation": "NEGATIVE",
  "reasoning": "ETH showing... Funding rate -0.0028% (shorts paying longs) adds slight bullish bias..."
}
```

**Adjusted Strength:** 0.70 + 0.05 = 0.75 ✅

---

## Test Case 2: BTC with Neutral Funding

**Scenario:**
- BTC base signal: BUY 0.78
- Funding rate: +0.00001437 (+0.001437%)
- Interpretation: NEUTRAL
- Adjustment: 0%

**Expected Output:**
```json
{
  "asset": "BTC",
  "signal": "BUY",
  "strength": 0.78,
  "funding_rate": 0.00001437,
  "funding_interpretation": "NEUTRAL",
  "reasoning": "BTC breaking above... Funding rate neutral (balanced positioning)..."
}
```

**Adjusted Strength:** 0.78 + 0.00 = 0.78 ✅

---

## Test Case 3: BTC with Highly Negative Funding (Short Squeeze Setup)

**Scenario:**
- BTC base signal: BUY 0.72
- Funding rate: -0.00015 (-0.015%)
- Interpretation: HIGHLY_NEGATIVE
- Adjustment: +10%

**Expected Output:**
```json
{
  "asset": "BTC",
  "signal": "BUY",
  "strength": 0.82,
  "funding_rate": -0.00015,
  "funding_interpretation": "HIGHLY_NEGATIVE",
  "reasoning": "BTC showing... Funding rate -0.015% (shorts paying 1.5% daily) signals short squeeze potential..."
}
```

**Adjusted Strength:** 0.72 + 0.10 = 0.82 ✅

---

## Real-World Example (March 3, 2026)

From live Binance data:
- BTC: +0.00001437 → NEUTRAL (no adjustment)
- ETH: -0.00002809 → NEGATIVE (+5% for BUY signals)

This means if crypto-analyst generates:
- ETH BUY 0.65 → becomes 0.70 (funding boost)
- BTC BUY 0.78 → stays 0.78 (neutral funding)
