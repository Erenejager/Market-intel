# Orchestrator Data Storage - April 8, 2026

## Purpose
Store all market intelligence signals with timestamps for:
1. **Backtesting** — Evaluate signal accuracy over time
2. **Performance Tracking** — Track win rates, improvements
3. **Parameter Optimization** — Compare different configurations

## Data Structure

### signals.json (Current - Live Signals)
```json
{
  "timestamp": "2026-04-08T08:48:00Z",
  "signals": [...]
}
```

### signal-history.json (NEW - Historical Archive)
```json
{
  "signals": [
    {
      "run_id": "0001",
      "timestamp": "2026-04-08T08:48:00Z",
      "signals": [...]
    }
  ],
  "metadata": {
    "last_updated": "2026-04-08T08:48:00Z",
    "total_signals": 1,
    "assets_tracked": ["BTC", "ETH", "GOLD_FUTURES"]
  }
}
```

### backtest-results.json (NEW - Historical Performance)
```json
{
  "runs": [
    {
      "run_id": "bt1",
      "timestamp": "2026-04-08T08:48:00Z",
      "config_snapshot": {...},
      "metrics": {
        "overall": {
          "accuracy": 0.42,
          "win_rate": 0.55,
          "total_signals": 10,
          "correct_signals": 4
        },
        "by_asset": {
          "BTC": {
            "accuracy": 0.50,
            "total_signals": 4,
            "correct_signals": 2
          },
          "ETH": {
            "accuracy": 0.25,
            "total_signals": 4,
            "correct_signals": 1
          }
        },
        "evaluations": [...]
    }
  ],
  "summary": {
    "period_start": "2026-04-01T00:00:00Z",
    "period_end": "2026-04-08T00:00:00Z",
    "total_runs": 30,
    "overall_improvement": "+12.5%",
    "best_performing_asset": "GOLD",
    "worst_performing_asset": "ETH"
  }
}
```

## Implementation Plan

### Phase 1: Add Storage Functions
```javascript
// Add to orchestrator.js

const SIGNAL_HISTORY_PATH = path.join(__dirname, 'data', 'signal-history.json');
const BACKTEST_RESULTS_PATH = path.join(__dirname, 'data', 'backtest-results.json');

// Initialize signal history on first run
function initializeSignalHistory() {
    if (!fs.existsSync(SIGNAL_HISTORY_PATH)) {
        fs.writeFileSync(SIGNAL_HISTORY_PATH, JSON.stringify({
            "signals": [],
            "metadata": {
                "last_updated": new Date().toISOString(),
                "total_signals": 0,
                "assets_tracked": ["BTC", "ETH", "GOLD_FUTURES"]
            }
        }, null, 2));
        console.log('✅ Signal history initialized');
    }
}

// Archive current signals to history
function archiveSignals(currentSignals, runId) {
    const history = JSON.parse(fs.readFileSync(SIGNAL_HISTORY_PATH));
    
    const archiveEntry = {
        run_id: runId,
        timestamp: new Date().toISOString(),
        signals: currentSignals
    };
    
    history.signals.push(archiveEntry);
    
    // Update metadata
    history.metadata.last_updated = new Date().toISOString();
    history.metadata.total_signals = history.metadata.total_signals + currentSignals.length;
    
    fs.writeFileSync(SIGNAL_HISTORY_PATH, JSON.stringify(history, null, 2));
}

// Append to backtest results
function recordBacktestRun(configSnapshot, metrics, evaluations, summary) {
    const resultsPath = BACKTEST_RESULTS_PATH;
    let results = [];
    
    if (fs.existsSync(resultsPath)) {
        results = JSON.parse(fs.readFileSync(resultsPath));
    }
    
    const runEntry = {
        run_id: `run_${Date.now()}`,
        timestamp: new Date().toISOString(),
        config_snapshot: configSnapshot,
        metrics: metrics,
        evaluations: evaluations,
        summary: summary
    };
    
    results.push(runEntry);
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
}
```

### Phase 2: Modify Synthesis Logic
```javascript
// In synthesize(), add backtest context checking
async function synthesizeWithHistoryCheck() {
    // Load signal history for context
    const history = loadSignalHistory();
    const recentRuns = history.signals.slice(-7); // Last 7 runs
    
    // Check ETH performance specifically
    const ethRecentAccuracy = calculateAssetAccuracy('ETH', recentRuns);
    
    // Adjust synthesis based on historical performance
    if (ethRecentAccuracy < 0.30) {
        console.log('⚠️ ETH accuracy low (<30%), applying conservative adjustments');
    }
    
    // Continue with normal synthesis...
    const agentsResults = await spawnAllAgents(...);
    return generateFinalSignals(agentsResults);
}
```

### Phase 3: Add Performance Tracking
```javascript
// Calculate rolling accuracy metrics
function calculateRollingAccuracy(asset, days = 30) {
    const history = loadSignalHistory();
    const assetSignals = history.signals.filter(s => s.signals.some(sig => sig.asset === asset));
    
    const buySignals = assetSignals.filter(s => s.signal === 'BUY');
    const correctBuys = buySignals.filter(s => s.outcome === 'correct');
    
    return buySignals.length > 0 ? (correctBuys.length / buySignals.length) : 0;
}

// Generate performance report
function generatePerformanceReport() {
    const history = loadSignalHistory();
    
    const report = {
        generated_at: new Date().toISOString(),
        metrics: {
            overall_accuracy: calculateOverallAccuracy(history.signals),
            btc_accuracy: calculateAssetAccuracy('BTC', history.signals),
            eth_accuracy: calculateAssetAccuracy('ETH', history.signals),
            gold_accuracy: calculateAssetAccuracy('GOLD_FUTURES', history.signals)
        },
        improvement_trends: [
            // Track ETH accuracy over time
            // Track signal quality trends
            // Identify which adjustments improve accuracy
        ]
    };
    
    return report;
}

// Helper functions
function loadSignalHistory() {
    try {
        return JSON.parse(fs.readFileSync(SIGNAL_HISTORY_PATH));
    } catch (e) {
        return { signals: [], metadata: {} };
    }
}

function calculateAssetAccuracy(asset, signals) {
    const assetSignals = signals.filter(s => s.asset === asset);
    if (assetSignals.length === 0) return 0;
    
    const correct = assetSignals.filter(s => s.outcome === 'correct').length;
    return correct / assetSignals.length;
}

function calculateOverallAccuracy(signals) {
    if (signals.length === 0) return 0;
    const correct = signals.filter(s => s.outcome === 'correct').length;
    return correct / signals.length;
}

function evaluateOutcome(signal, actualChange, winThreshold = 0.02) {
    if (signal.signal === 'BUY' && actualChange >= winThreshold) {
        return 'correct';
    } else if (signal.signal === 'SELL' && actualChange <= -winThreshold) {
        return 'correct';
    } else {
        return 'incorrect';
    }
}
```

### Phase 4: Integration Points
```javascript
// Update orchestrator.js to use new functions

// 1. In main orchestrator logic, add:
initializeSignalHistory();  // First run
archiveSignals(currentSignals, runId);  // After each run

// 2. In synthesize(), add:
const history = loadSignalHistory();  // Load context
// Use history for performance-based adjustments if needed

// 3. In test mode, use:
recordBacktestRun(configSnapshot, metrics, evaluations, summary);
// to backtest against historical data

// 4. Add CLI command to generate performance report:
// node orchestrator.js --report (generates readable summary)
// node orchestrator.js --export (exports data for analysis)
```

## Storage Locations

- `/home/clawdbot/.openclaw/workspace/market-intel/data/signal-history.json` — All signals with timestamps
- `/home/clawdbot/.openclaw/workspace/market-intel/data/backtest-results.json` — Performance metrics
- `/home/clawdbot/.openclaw/workspace/market-intel/data/performance-report.json` — Generated reports

## Data Schema

### signal-history.json
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
          "price_current": 71597,
          "outcome": "PENDING"
        },
        {
          "asset": "ETH",
          "signal": "BUY",
          "strength": 0.91,
          "price_current": 2251,
          "outcome": "PENDING"
        }
      ]
    }
  ],
  "metadata": {
    "last_updated": "2026-04-08T09:30:00Z",
    "total_signals": 45,
    "assets_tracked": ["BTC", "ETH", "GOLD_FUTURES"],
    "metrics_summary": {
      "btc_accuracy_last_7d": 0.41,
      "eth_accuracy_last_7d": 0.35,
      "best_asset": "BTC"
    }
}
```

## Key Features

1. **Temporal Storage** — All signals archived with timestamps
2. **Performance Tracking** — Rolling accuracy by asset
3. **Outcome Tracking** — Mark signals as CORRECT/INCORRECT/PENDING
4. **Backtest Integration** — Store results for comparison
5. **Report Generation** — CLI commands for analysis

## Usage Examples

```bash
# Run normal analysis (archives signals automatically)
node orchestrator.js

# Run test mode with specific config
node orchestrator.js --test crypto --date-range=2026-04-01:2026-04-08

# Generate performance report
node orchestrator.js --report

# Export data for external analysis
node orchestrator.js --export
```

## Notes

- Signals stored after each orchestrator run (not overwrite existing)
- History grows indefinitely — implement cleanup/rotation if needed
- Backtest results stored in separate file with run_id references
- Performance metrics calculated on-demand from signal history

## Implementation Checklist

- [ ] Create signal-history.json template
- [ ] Add storage functions to orchestrator.js
- [ ] Implement archiveSignals() function
- [ ] Implement recordBacktestRun() function
- [ ] Add outcome tracking (correct/incorrect/pending)
- [ ] Implement accuracy calculation helpers
- [ ] Add performance report generation
- [ ] Add CLI commands (--report, --export)
- [ ] Test with live data (dry run)
- [ ] Validate data storage and retrieval
