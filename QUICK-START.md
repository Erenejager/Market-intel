# 🚀 Quick Start: Tier 3 & Tier 5

**TL;DR:** You now have correlation-based signal validation and a backtesting framework. Here's how to use them:

---

## ⚡ 30-Second Setup

```bash
cd market-intel

# 1. Calculate initial correlations (takes ~15 seconds)
node correlation-matrix.js --refresh

# 2. Run orchestrator with correlation checks
node orchestrator.js --test all

# 3. Backtest the signals
node backtester.js --report
```

**Done!** You now have:
- ✅ Correlation matrix cached (refreshes daily)
- ✅ Signals validated against cross-asset correlations
- ✅ Historical accuracy metrics

---

## 🎯 What You Got

### Tier 3: Correlation Matrix

**Prevents contradictory signals** like:
- ❌ BTC BUY + ETH SELL (they move together 92% of the time!)
- ❌ GOLD BUY + DXY BUY (they move opposite 68% of the time!)

**How it works:**
- Calculates 90-day correlations between BTC, ETH, GOLD, SPY, DXY
- Checks signals for divergence
- Applies -5% to -10% penalty to contradictory signals
- Adds warnings to output

**Example output:**
```
🔍 Checking correlation divergences...
⚠️  BTC and ETH typically move together (corr: 92%), but signals diverge
    BTC BUY 0.80 → 0.70 (-10% correlation divergence)
    ETH SELL 0.65 → 0.55 (-10% correlation divergence)
```

### Tier 5: Backtesting Framework

**Measures your signal accuracy** across 4 time horizons:
- 4 hours (day trading)
- 24 hours (swing trading)
- 72 hours (short-term positioning)
- 168 hours / 7 days (medium-term)

**Example output:**
```
OVERALL METRICS:
  Accuracy: 72.5%
  Correct: 58/80

BY ASSET:
  BTC: 75.0% (30/40)
  ETH: 70.0% (28/40)

BY HORIZON:
  4h: 58.3%  ← Too noisy
  24h: 72.5% ← Sweet spot
  72h: 78.2% ← Best accuracy
  168h: 71.4%
```

---

## 📋 Daily Commands

### Run Market Intel (with correlation validation)

```bash
node orchestrator.js
```

Automatically:
- Loads correlation matrix (cached, <1s)
- Runs 4 agents
- Checks for signal divergences
- Applies penalties if needed
- Stores signals

### Check Correlations

```bash
# View cached correlations
node correlation-matrix.js

# Force refresh (once daily is enough)
node correlation-matrix.js --refresh
```

### Run Backtest

```bash
# Quick backtest
node backtester.js

# Detailed report
node backtester.js --report

# Filter to specific asset
node backtester.js --asset BTC --report

# Last 7 days only
node backtester.js --days 7 --report
```

---

## 🔧 Configuration

### Correlation Settings

**Edit:** `correlation-matrix.js` (lines 15-30)

```javascript
// Which asset pairs to track
const ASSET_PAIRS = [
  { from: 'BTC', to: 'ETH', name: 'BTC-ETH' },
  // ... add more pairs
];

// Cache duration
const CACHE_TTL_HOURS = 24; // Refresh daily
```

### Backtest Settings

**Edit:** `backtest-config.json`

```json
{
  "evaluation_horizons": [4, 24, 72, 168],
  
  "win_thresholds": {
    "BUY": 0.02,   // Signal correct if +2% within horizon
    "SELL": 0.02,  // Signal correct if -2% within horizon
    "HOLD": 0.01   // Signal correct if ±1% within horizon
  },
  
  "min_confidence": 0.5  // Only backtest signals ≥50%
}
```

---

## 🐛 Troubleshooting

### "No signals to backtest"

**Fix:** Run orchestrator first to generate signals
```bash
node orchestrator.js --test all
node backtester.js --report
```

### "Correlation matrix unavailable"

**Fix:** Calculate initial matrix
```bash
node correlation-matrix.js --refresh
```

### Low backtest accuracy with recent signals

**Expected** - Need historical signals (at least 24h old) for real outcomes!

**Fix:** Wait 1-7 days after generating signals, then backtest
```bash
# Day 1: Generate signals
node orchestrator.js

# Day 2+: Run backtest with real outcomes
node backtester.js --report
```

### API errors

**Fix:** Test API connectivity
```bash
node test-historical-api.js
```

See `REAL-API-INTEGRATION.md` for troubleshooting

---

## 📊 Example Workflow

### Monday Morning Routine

```bash
# 1. Run weekly backtest to check accuracy
node backtester.js --days 7 --report

# 2. If accuracy dropped, investigate
cat data/backtest-results.json | jq '.[0].metrics'

# 3. Refresh correlations (once per week)
node correlation-matrix.js --refresh

# 4. Run market intel
node orchestrator.js
```

### Daily Quick Check

```bash
# Just run orchestrator (correlations auto-load from cache)
node orchestrator.js
```

---

## 🎓 Learning More

- **Full documentation:** `TIER3-TIER5-README.md` (comprehensive guide)
- **Implementation details:** `IMPLEMENTATION-SUMMARY.md` (technical summary)
- **Code:** `correlation-matrix.js` and `backtester.js` (well-commented)

---

## ✅ Quick Checklist

- [ ] Ran `node correlation-matrix.js --refresh` (initial setup)
- [ ] Ran `node orchestrator.js --test all` (verify integration)
- [ ] Ran `node backtester.js --report` (verify backtesting)
- [ ] Reviewed `TIER3-TIER5-README.md` (understand features)
- [ ] Configured `backtest-config.json` (tune thresholds)
- [ ] (Optional) Integrated real historical APIs for production backtesting

---

**Ready to use!** 🚀

Questions? See `TIER3-TIER5-README.md` or check the inline code comments.
