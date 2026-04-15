# Ocasonal Analysis & Performance Tracking - April 8, 2026

## Purpose
Track ALL assets (BTC, ETH, GOLD) over time with:
- Signal outcomes (correct/incorrect/pending)
- Rolling accuracy metrics
- Ocasonal analysis to identify what works and what doesn't
- Parameter optimization recommendations

## Data Structure Updates

### Extended signal-history.json
```json
{
  "signals": [
    {
      "run_id": "0001",
      "timestamp": "2026-04-08T08:48:00Z",
      "signals": [
        {
          "asset": "BTC",
          "signal": "BUY",
          "strength": 0.94,
          "outcome": "PENDING",
          "outcome_timestamp": null,
          "actual_change": null,
          "signal_id": "btc_0001"
        }
      ]
    }
  ],
  "metadata": {
    "last_updated": "2026-04-08T09:30:00Z",
    "total_signals": 45,
    "assets_tracked": ["BTC", "ETH", "GOLD_FUTURES"],
    "metrics_summary": {
      "btc_accuracy_7d": 0.45,
      "eth_accuracy_7d": 0.00,
      "gold_accuracy_7d": 0.25
    }
  }
}
```

### Extended backtest-results.json
```json
{
  "runs": [...],
  "summary": {
    "period_start": "2026-04-01T00:00:00Z",
    "period_end": "2026-04-08T00:00:00Z",
    "total_runs": 90,
    "overall_improvement": "TBD",
    "best_performing_asset": "GOLD",
    "worst_performing_asset": "ETH",
    "ocasonal_analysis": {
      "best_adjustments": {
        "BTC": "Lower BUY threshold (0.65), Fear duration boost (+0.20)",
        "ETH": "TBD - needs validation",
        "GOLD": "Geopolitical volatility cap (+0.03)"
      },
      "worst_adjustments": {
        "BTC": "None identified yet",
        "ETH": "Conservative base (0.80x), Wider stops (2.0x)",
        "GOLD": "None identified yet"
      }
    },
    "ocasonal_recommendations": [
      "For ETH: Disable BUY signals until accuracy >30%",
      "For GOLD: Keep volatility cap for headline-driven moves",
      "For BTC: Lower BUY threshold to 0.60 to capture more opportunities"
    ]
  }
}
```

## Implementation Plan

### Phase 1: Extend Tracking Functions

**Files to modify:**
1. `orchestrator.js` — Add ocasonal analysis functions
2. Existing tracking to be extended (signal-history, backtest-results)

**New functions needed:**
```javascript
// Track signal outcomes for ALL assets
function trackSignalOutcome(asset, signalId, outcome, actualChange, winThreshold = 0.02) {
    const history = loadSignalHistory();
    
    // Find the signal and update outcome
    for (const run of history.signals) {
        for (const sig of run.signals) {
            if (sig.asset === asset && sig.signal_id === signalId) {
                // Update signal with outcome
                if (sig.outcome === 'PENDING' || !sig.outcome) {
                    sig.outcome = outcome;
                    sig.outcome_timestamp = new Date().toISOString();
                    sig.actual_change = actualChange;
                    sig.win_threshold = winThreshold;
                    
                    // Add to reasoning
                    if (sig.adjusting_reason) {
                        sig.adjusting_reason += `, Outcome: ${outcome}`;
                    } else {
                        sig.adjusting_reason = `Outcome: ${outcome}`;
                    }
                }
            }
        }
    }
    
    saveSignalHistory();
}

// Calculate rolling accuracy for ALL assets
function calculateRollingAccuracy(asset, days = 7, timeframe = '24h') {
    const history = loadSignalHistory();
    const assetSignals = history.signals.filter(s => s.signals.some(sig => sig.asset === asset));
    
    // Filter completed signals only (outcome !== 'PENDING')
    const completedSignals = assetSignals.filter(s => s.outcome !== 'PENDING');
    
    if (completedSignals.length < 5) return 0; // Not enough data
    
    const buySignals = completedSignals.filter(s => s.signals.some(sig => sig.signal === 'BUY'));
    const correctBuys = buySignals.filter(s => s.outcome === 'correct');
    
    return buySignals.length > 0 ? (correctBuys.length / buySignals.length) : 0;
}

// Generate ocasonal analysis report
function generateOcasonalReport() {
    const history = loadSignalHistory();
    
    // Calculate metrics by asset
    const btcMetrics = analyzeAssetPerformance('BTC', history.signals);
    const ethMetrics = analyzeAssetPerformance('ETH', history.signals);
    const goldMetrics = analyzeAssetPerformance('GOLD_FUTURES', history.signals);
    
    // Identify best/worst adjustments
    const bestAdjustments = {
        BTC: identifyBestAdjustments('BTC', btcMetrics),
        ETH: identifyBestAdjustments('ETH', ethMetrics),
        GOLD: identifyBestAdjustments('GOLD_FUTURES', goldMetrics)
    };
    
    const worstAdjustments = {
        BTC: identifyWorstAdjustments('BTC', btcMetrics),
        ETH: identifyWorstAdjustments('ETH', ethMetrics),
        GOLD: identifyWorstAdjustments('GOLD_FUTURES', goldMetrics)
    };
    
    // Generate recommendations
    const recommendations = [];
    
    // ETH recommendations (high priority)
    if (ethMetrics.accuracy_7d < 0.30) {
        recommendations.push({
            asset: 'ETH',
            action: 'DISABLE_BUY',
            reason: 'ETH accuracy < 30% over 7 days - disable BUY signals, use SELL/HOLD only',
            priority: 'CRITICAL'
        });
    } else if (ethMetrics.accuracy_7d > 0.50) {
        recommendations.push({
            asset: 'ETH',
            action: 'KEEP_CONFIGURATION',
            reason: 'ETH accuracy > 50% - current ETH-specific adjustments working well',
            priority: 'MAINTAIN'
        });
    }
    
    // BTC recommendations
    if (btcMetrics.accuracy_7d < 0.35) {
        recommendations.push({
            asset: 'BTC',
            action: 'LOWER_THRESHOLD',
            reason: 'BTC accuracy < 35% - consider lowering BUY threshold from 0.65 to 0.60',
            priority: 'HIGH'
        });
    }
    
    // GOLD recommendations
    if (goldMetrics.accuracy_7d < 0.20) {
        recommendations.push({
            asset: 'GOLD',
            action: 'STRENGTHEN_VOLATILITY_CAP',
            reason: 'GOLD accuracy < 20% - geopolitical cap may be insufficient, consider increasing penalty',
            priority: 'HIGH'
        });
    }
    
    return {
        generated_at: new Date().toISOString(),
        metrics: {
            overall: {
                btc_accuracy_7d: btcMetrics.accuracy_7d,
                eth_accuracy_7d: ethMetrics.accuracy_7d,
                gold_accuracy_7d: goldMetrics.accuracy_7d
            },
            by_asset: {
                BTC: btcMetrics,
                ETH: ethMetrics,
                GOLD_FUTURES: goldMetrics
            }
        },
        best_adjustments: bestAdjustments,
        worst_adjustments: worstAdjustments,
        recommendations: recommendations
    };
}

// Helper: Analyze single asset's performance
function analyzeAssetPerformance(asset, signals) {
    const assetSignals = signals.filter(s => s.signals.some(sig => sig.asset === asset));
    
    // Filter completed signals
    const completed = assetSignals.filter(s => s.outcome !== 'PENDING' && s.outcome);
    
    // Calculate accuracy
    const buySignals = completed.filter(s => s.signals.some(sig => sig.signal === 'BUY'));
    const correctBuys = buySignals.filter(s => s.outcome === 'correct');
    
    const accuracy = buySignals.length > 0 ? (correctBuys.length / buySignals.length) : 0;
    
    // Analyze which adjustments work
    const adjustmentsThatWork = [];
    const adjustmentsThatFail = [];
    
    for (const sig of completed) {
        const hasFearBoost = sig.reasoning?.includes('fear') || sig.reasoning?.includes('contrarian');
        const hasWhaleAdjust = sig.reasoning?.includes('whale') || sig.reasoning?.includes('accumulation');
        const hasMacroAdj = sig.reasoning?.includes('macro') || sig.reasoning?.includes('VIX');
        const hasVolatilityCap = sig.reasoning?.includes('cap') || sig.reasoning?.includes('geopolitical');
        
        if (sig.outcome === 'correct') {
            if (hasFearBoost) adjustmentsThatWork.push('Fear duration boost');
            if (hasWhaleAdjust) adjustmentsThatWork.push('Whale flow adjustment');
            if (hasMacroAdj) adjustmentsThatWork.push('Macro regime adjustment');
            if (hasVolatilityCap) adjustmentsThatWork.push('Geopolitical volatility cap');
        } else {
            if (hasFearBoost) adjustmentsThatFail.push('Fear duration boost');
            if (hasWhaleBoost) adjustmentsThatFail.push('Whale flow adjustment');
            if (hasMacroAdj) adjustmentsThatFail.push('Macro regime adjustment');
            if (hasVolatilityCap) adjustmentsThatFail.push('Geopolitical volatility cap');
        }
    }
    
    return {
        asset,
        total_signals: completed.length,
        buy_signals: buySignals.length,
        correct_buys: correctBuys.length,
        accuracy: accuracy.toFixed(2),
        working_adjustments: {
            fear_boost: completed.filter(s => s.reasoning?.includes('fear')).length / completed.length,
            whale_adjustment: completed.filter(s => s.reasoning?.includes('whale')).length / completed.length,
            macro_adjustment: completed.filter(s => s.reasoning?.includes('macro')).length / completed.length,
            volatility_cap: completed.filter(s => s.reasoning?.includes('cap')).length / completed.length
        },
        adjustment_effectiveness: {
            fear_boost: completed.filter(s => s.reasoning?.includes('fear') && s.outcome === 'correct').length / completed.filter(s => s.reasoning?.includes('fear')).length,
            whale_adjustment: completed.filter(s => s.reasoning?.includes('whale') && s.outcome === 'correct').length / completed.filter(s => s.reasoning?.includes('whale')).length,
            macro_adjustment: completed.filter(s => s.reasoning?.includes('macro') && s.outcome === 'correct').length / completed.filter(s => s.reasoning?.includes('macro')).length,
            volatility_cap: completed.filter(s => s.reasoning?.includes('cap') && s.outcome === 'correct').length / completed.length
        }
    };
}
```

### Phase 2: Update Orchestrator

**Changes to orchestrator.js:**

1. Add `trackSignalOutcome()` function
2. Add `calculateRollingAccuracy(asset, days)` function  
3. Add `generateOcasonalReport()` function
4. Update `storeSignals()` to save outcomes for all assets
5. Add periodic ocasonal analysis trigger (every 30 days or on --report)
6. Add `--analyze` CLI command to show performance report

### Phase 3: Update Signal History

**Changes needed:**
- Extend `loadSignalHistory()` to load ALL asset histories (not just ETH confirmation)
- Extend `saveSignalHistory()` to store outcomes for all assets
- Add metadata tracking by asset (last signal per asset, outcome counts)

### Phase 4: CLI Commands

**New commands:**
```bash
node orchestrator.js --report              # Generate performance report
node orchestrator.js --analyze           # Generate ocasonal analysis
node orchestrator.js --optimize          # Show optimization recommendations
node orchestrator.js --init-history       # Clear signal history
node orchestrator.js --export-data       # Export all signal data
```

## Key Features

1. **Per-Asset Tracking** — Separate signal histories for BTC, ETH, GOLD
2. **Outcome Tracking** — Mark signals as CORRECT/INCORRECT/PENDING with actual changes
3. **Rolling Accuracy** — 7/30/90 day accuracy by asset
4. **Adjustment Effectiveness** — Identify which features actually improve outcomes
5. **Ocasonal Analysis** — Generate data-driven optimization recommendations
6. **Recommendation Engine** — Auto-generate actionable improvements based on data

## Success Criteria

### Immediate
- All functions defined and documented
- System ready to track outcomes for BTC, ETH, GOLD
- Can generate ocasonal analysis reports

### Validation
- After 30 signals per asset (~1-2 weeks), generate first ocasonal report
- ETH accuracy target: >30% (currently 0%)
- BTC accuracy target: >40% (currently 37.5%)
- GOLD accuracy target: >30% (currently 25%)

### Long-term (3 months)
- Comprehensive understanding of what works for each asset
- Clear identification of best/worst performing adjustments
- Data-backed parameter optimization recommendations

## Notes

- This extends the ETH fix by adding ocasonal analysis for ALL assets
- Not just fixing ETH — understanding what works system-wide
- Will drive continuous improvement through data, not guesses
- System becomes self-optimizing over time
- Recommendations can be automatically generated from performance data

## Implementation Checklist

- [ ] Add trackSignalOutcome() to orchestrator.js
- [ ] Add calculateRollingAccuracy() to orchestrator.js
- [ ] Add generateOcasonalReport() to orchestrator.js
- [ ] Extend storeSignals() to save outcomes
- [ ] Extend loadSignalHistory/saveSignalHistory for all assets
- [ ] Add --report CLI command
- [ ] Add --analyze CLI command
- [ ] Add --optimize CLI command
- [ ] Add --init-history CLI command
- [ ] Add --export-data CLI command
- [ ] Test ocasonal analysis with sample data
- [ ] Validate rolling accuracy calculations
- [ ] Document all new functions

## Usage Examples

```bash
# Run normal analysis (signals archived automatically)
node orchestrator.js

# Generate performance report
node orchestrator.js --report

# Generate ocasonal analysis
node orchestrator.js --analyze

# Clear history
node orchestrator.js --init-history

# Export data for external analysis
node orchestrator.js --export-data
```

## Risk Management

**If ocasonal analysis reveals:**
- ETH adjustments make accuracy worse → Revert changes, return to baseline
- BTC/GOLD working well → Keep current configuration
- Specific adjustment consistently fails → Remove or reduce impact

**Rollback Plan:**
1. Keep ETH-FIX.md as documentation
2. Keep current signal-history.json as backup
3. If new ocasonal code has bugs, use --init-history
4. Implement changes incrementally (test small changes first)
