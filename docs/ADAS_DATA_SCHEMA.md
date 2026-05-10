# ADAS Historical Data Schema

Complete reference for `signals-history.jsonl` - the ADAS-ready training dataset.

## Overview

- **File:** `market-intel/data/signals-history.jsonl`
- **Format:** JSONL (one JSON object per line)
- **Purpose:** Store every signal with complete context for future ADAS optimization
- **Appended:** Every 6 hours (4x daily)
- **Size:** ~950 bytes per signal (~3.8 KB per run × 4 signals)

---

## Why JSONL?

**Benefits:**
- ✅ Stream-friendly (process line-by-line without loading entire file)
- ✅ Append-only (no file corruption risk)
- ✅ Easy filtering: `grep`, `jq`, `awk` work out of the box
- ✅ Language-agnostic (Python, Node.js, shell scripts can all read it)

**Example queries:**
```bash
# Count BTC signals
grep '"asset":"BTC"' signals-history.jsonl | wc -l

# Get all BUY signals
jq 'select(.signal == "BUY")' signals-history.jsonl

# Filter by date range
jq 'select(.ts >= "2026-03-01" and .ts < "2026-04-01")' signals-history.jsonl
```

---

## Schema (TypeScript)

```typescript
interface ADASignal {
  // Metadata
  id: string;              // "btc-20260317-1800"
  ts: string;              // ISO 8601 UTC: "2026-03-17T18:00:00Z"
  run_id: string;          // "1800"
  asset: "BTC" | "ETH" | "SOL" | "GOLD_FUTURES";
  
  // Signal
  signal: "BUY" | "SELL" | "HOLD" | "WATCH";
  strength_original: number;    // 0.0-1.0 (before adjustments)
  strength_final: number;       // 0.0-1.0 (after adjustments)
  
  // Price Levels
  price: number;           // Current market price
  entry: number;           // Optimal entry price
  stop: number;            // Stop loss price
  tp1: number;             // Take profit 1
  tp2: number;             // Take profit 2
  tp3: number;             // Take profit 3
  
  // Adjustments Breakdown (critical for ADAS optimization)
  adjustments: {
    fear: number;          // Fear & Greed contrarian boost
    whale: number;         // Whale activity adjustment
    funding: number;       // Funding rate adjustment
    macro: number;         // VIX/regime adjustment
    divergence: number;    // Whale-price divergence
    sentiment: number;     // Sentiment confluence
    news: number;          // Breaking news momentum
    btc_momentum: number;  // BTC spillover (for ETH/SOL)
    altcoin_momentum: number; // Altcoin rotation
    total: number;         // Sum of all adjustments
  };
  
  // Macro Context
  macro: {
    vix: number;                     // Volatility Index
    regime: "RISK_ON" | "RISK_OFF" | "NEUTRAL";
    fed_funds: number;               // Fed Funds rate
    dxy: number | null;              // Dollar Index (if available)
    yield10y: number | null;         // 10Y Treasury yield (if available)
    geopolitical_event: boolean;     // War/crisis active?
    event_type: "war" | "monetary_policy" | "inflation" | "energy" | "other" | null;
  };
  
  // Sentiment Context
  sentiment: {
    fear_greed: number | null;       // 0-100 (crypto only)
    fear_duration_days: number;      // Days in extreme fear
    funding_rate: number;            // Current funding rate
    funding_interp: "HIGHLY_NEGATIVE" | "NEGATIVE" | "NEUTRAL" | "POSITIVE" | "HIGHLY_POSITIVE";
    crypto_bias: "BUY" | "SELL" | "NEUTRAL";
    gold_bias: "BUY" | "SELL" | "NEUTRAL";
    gold_etf_ytd: number;            // YTD ETF flows %
    gold_etf_1y: number;             // 1-year ETF flows %
    gold_positioning: "ACCUMULATION" | "NEUTRAL" | "DISTRIBUTION";
  };
  
  // Whale Context (crypto only, null for gold)
  whale: {
    status: "ACCUMULATION" | "DISTRIBUTION" | "NEUTRAL" | "UNAVAILABLE";
    flow_24h: number | null;         // Net flow last 24h
    flow_7d: number | null;          // Net flow last 7d
    trend_aligned: boolean;          // Whale flow matches signal direction
    confidence: number;              // 0.0-1.0 (0 if unavailable)
    divergence_type: "bullish" | "bearish" | "hidden" | null;
  } | null;
  
  // Reasoning (abbreviated)
  reasoning_short: string;           // First 2 sentences
  
  // Outcome (filled by outcome tracker)
  outcome: {
    price_4h: number | null;         // Price 4 hours later
    price_24h: number | null;        // Price 24 hours later
    price_48h: number | null;        // Price 48 hours later
    result: "PENDING" | "WIN" | "LOSS" | "BREAKEVEN";
    hit_tp1: boolean;                // TP1 reached?
    hit_tp2: boolean;                // TP2 reached?
    hit_tp3: boolean;                // TP3 reached?
    hit_stop: boolean;               // Stop hit?
    max_gain_pct: number | null;     // Best gain within 48h
    max_loss_pct: number | null;     // Worst loss within 48h
    final_pnl_pct: number | null;    // Final P&L at 48h or exit
  };
}
```

---

## Example Record (Formatted)

```json
{
  "id": "btc-20260317-1800",
  "ts": "2026-03-17T18:00:00Z",
  "run_id": "1800",
  "asset": "BTC",
  "signal": "WATCH",
  "strength_original": 0.67,
  "strength_final": 0.64,
  
  "price": 74245,
  "entry": 73800,
  "stop": 71500,
  "tp1": 76500,
  "tp2": 79000,
  "tp3": 82000,
  
  "adjustments": {
    "fear": 0.05,
    "whale": -0.03,
    "funding": 0.00,
    "macro": 0.00,
    "divergence": 0.00,
    "sentiment": 0.00,
    "news": 0.00,
    "btc_momentum": 0.00,
    "altcoin_momentum": 0.00,
    "total": -0.01
  },
  
  "macro": {
    "vix": 27.28,
    "regime": "RISK_OFF",
    "fed_funds": 4.5,
    "dxy": null,
    "yield10y": null,
    "geopolitical_event": true,
    "event_type": "war"
  },
  
  "sentiment": {
    "fear_greed": 28,
    "fear_duration_days": 0,
    "funding_rate": -0.0000126,
    "funding_interp": "NEUTRAL",
    "crypto_bias": "NEUTRAL",
    "gold_bias": "BUY",
    "gold_etf_ytd": 21,
    "gold_etf_1y": 75,
    "gold_positioning": "ACCUMULATION"
  },
  
  "whale": {
    "status": "UNAVAILABLE",
    "flow_24h": null,
    "flow_7d": null,
    "trend_aligned": false,
    "confidence": 0.0,
    "divergence_type": null
  },
  
  "reasoning_short": "BTC climbing wall of worry at $74K despite Iran war RISK_OFF environment. Fear & Greed 28 (Fear) but price holding above $70K = sentiment-price disconnect.",
  
  "outcome": {
    "price_4h": null,
    "price_24h": null,
    "price_48h": null,
    "result": "PENDING",
    "hit_tp1": false,
    "hit_tp2": false,
    "hit_tp3": false,
    "hit_stop": false,
    "max_gain_pct": null,
    "max_loss_pct": null,
    "final_pnl_pct": null
  }
}
```

---

## ADAS Use Cases

When you build ADAS, this data enables:

### 1. **Adjustment Optimization**
```python
# Find optimal fear_boost value
signals = load_signals(asset='BTC', signal='BUY')
for fear_boost in [0.05, 0.10, 0.15, 0.20]:
    # Recalculate strength_final with new boost
    # Measure correlation with outcome.final_pnl_pct
    # Pick boost that maximizes win rate
```

### 2. **Regime-Based Learning**
```python
# Does "fear + RISK_OFF + BUY" work?
risk_off_signals = load_signals(macro__regime='RISK_OFF', signal='BUY')
win_rate = risk_off_signals.filter(outcome__result='WIN').count() / len(risk_off_signals)

# If win_rate < 50%, reduce strength in RISK_OFF environments
```

### 3. **Whale Divergence Patterns**
```python
# When whale data unavailable, what's the penalty?
whale_unavailable = load_signals(whale__status='UNAVAILABLE')
whale_available = load_signals(whale__status__in=['ACCUMULATION', 'DISTRIBUTION'])

# Compare win rates → optimize whale penalty (-0.03 vs -0.05 vs -0.10)
```

### 4. **Asset-Specific Behavior**
```python
# BTC vs ETH vs Gold - different optimal thresholds?
for asset in ['BTC', 'ETH', 'GOLD_FUTURES']:
    signals = load_signals(asset=asset)
    optimal_threshold = find_threshold_with_best_sharpe(signals)
    # BTC might be 0.70, ETH 0.75, Gold 0.65
```

### 5. **Signal Strength Calibration**
```python
# Does strength_final predict outcome?
import numpy as np
signals = load_signals(outcome__result__in=['WIN', 'LOSS'])

strengths = [s.strength_final for s in signals]
outcomes = [1 if s.outcome.result == 'WIN' else 0 for s in signals]

correlation = np.corrcoef(strengths, outcomes)[0,1]
# If low correlation, recalibrate adjustment weights
```

---

## Storage Estimates

**Current rate:** 4 signals × 4 runs/day = 16 signals/day

| Period | Signals | Storage | Comments |
|--------|---------|---------|----------|
| 1 week | 112 | ~110 KB | Initial testing |
| 1 month | 480 | ~470 KB | Minimal ADAS dataset |
| 3 months | 1,440 | ~1.4 MB | Recommended minimum |
| 1 year | 5,840 | ~5.7 MB | Multiple market regimes |
| 5 years | 29,200 | ~28 MB | Full market cycles |

**Conclusion:** Storage is negligible. Keep everything forever.

---

## Outcome Tracker (Future Work)

**Script:** `market-intel/scripts/update-outcomes.js` (to be created)

**Logic:**
1. Every 6 hours, scan `signals-history.jsonl`
2. Find signals where `outcome.result === "PENDING"`
3. Check if 4h/24h/48h have passed since `ts`
4. Fetch current price, update `outcome.price_4h/24h/48h`
5. Determine if TP1/2/3 or stop hit
6. Calculate `result` (WIN/LOSS/BREAKEVEN)
7. Rewrite line with updated outcome

**Challenges:**
- JSONL is append-only (can't edit lines in-place)
- Need to rebuild file with updated outcomes
- Or: store outcomes in separate file (`outcomes.jsonl`) and join when analyzing

**Recommendation:** Build outcome tracker once you have 100+ signals and want to start analyzing.

---

## Data Quality

**Critical fields (must never be null):**
- `id`, `ts`, `asset`, `signal`, `price`, `entry`, `stop`, `tp1/tp2/tp3`
- `macro.vix`, `macro.regime`, `macro.fed_funds`
- `sentiment.fear_greed` (crypto only)
- `adjustments.*` (can be 0.0 but not missing)

**Optional fields (can be null):**
- `macro.dxy`, `macro.yield10y` (if data unavailable)
- `whale.*` (for gold, or when crypto whale API fails)
- `outcome.*` (null until tracker runs)

**Validation:** Run periodic checks:
```bash
# Check for malformed JSON
jq empty signals-history.jsonl || echo "JSON errors found"

# Count null prices (should be 0)
jq 'select(.price == null)' signals-history.jsonl | wc -l
```

---

## Migration from Old Format

If you have old `signals.json` runs without ADAS format:

```bash
# Manually convert and append (one-time)
node market-intel/scripts/migrate-old-signals.js
```

(Script not yet created - only if you have historical data to import)

---

## Summary

**What you have now:**
- ✅ ADAS-ready storage format
- ✅ Automatic appending every 6h
- ✅ Complete context (macro, sentiment, whale, adjustments)
- ✅ Outcome placeholders for future tracking
- ✅ Minimal storage footprint (~1 KB per signal)

**What's missing (future work):**
- Outcome tracker (fills `outcome.*` fields)
- ADAS optimization engine (uses history to tune adjustments)
- Performance dashboard (visualize signal accuracy over time)

**Current status:** Collecting data. ADAS can be built anytime after reaching 100+ signals (~1 week at 4x daily).
