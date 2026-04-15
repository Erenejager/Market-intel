> **Historical document.** Current source of truth for Market Intel improvements and roadmap: [`IMPROVEMENTS.md`](./IMPROVEMENTS.md).

# ETH Fix Implementation Plan - April 8, 2026

## Objective
Implement radical ETH-specific logic to fix 0% accuracy problem by:
- Disabling ETH BUY signals until accuracy improves
- Adding confirmation chain (3 consecutive signals)
- Implementing inverted logic (ETH does opposite of BTC)
- Adding ETH-specific indicators (gas stress, DeFi TVL, ETH/BTC ratio)

## Files to Modify

### 1. `/market-intel/agents/crypto-analyst.md`
**Changes needed:**

**A. Add ETH-Specific Parameters Section**
```markdown
## ETH-Specific Parameters

ETH requires different treatment than BTC due to higher volatility and different market dynamics:

### Parameters
```yaml
# From config.json eth_specific section:
buy_threshold: 0.60           # Lower than BTC (0.65)
win_threshold: 0.04             # Higher than BTC (0.02)
entry_buffer_percent: 0.6        # Wider than BTC (0.3%)
stop_loss_atr_multiplier: 2.0   # Wider than BTC (1.5x)
default_horizon: "72H"          # Longer than BTC (4H)
min_volume_for_breakout: 1.5     # Higher volume needed for ETH breakouts
base_strength_multiplier: 0.80   # More conservative base
overperformance_cap_multiplier: 0.95  # Cap ETH when outperforming BTC
underperformance_penalty: -0.05  # Penalize ETH when lagging BTC
```
```

**B. Add ETH-Specific Signal Logic**

```python
# ETH-Specific Confluence Scoring
if asset == "ETH":
    # Apply ETH-specific base reduction
    base_strength *= config.eth_specific.base_strength_multiplier  # 0.80
    
    # ETH/BTC Ratio Analysis
    eth_btc_ratio = eth_price_change_24h / btc_price_change_24h
    
    if eth_btc_ratio < 0.70:  # ETH underperforming BTC by >30%
        base_strength *= config.eth_specific.underperformance_penalty  # 0.95
        reasoning += "ETH significantly underperforming BTC (>30%) - reduce all signals"
    elif eth_btc_ratio > 1.15:  # ETH massively outperforming BTC by >15%
        base_strength *= config.eth_specific.overperformance_cap_multiplier  # 1.05
        reasoning += "ETH massively outperforming BTC (>15%) - bullish tailwind, cap signals"
    
    # ETH-Specific Divergence Logic (Reversed from BTC)
    # For ETH: price DOWN + accumulation UP = BEARISH divergence (bad for ETH)
    # For ETH: price UP + distribution UP = BULLISH alignment (good for ETH)
    if price_change_24h < -0.02 and flow_24h < -20000:
        divergence_type = "BEARISH_DIVERGENCE"
        divergence_bonus = -0.03  # Penalize
    elif price_change_24h > 0.02 and flow_24h > 20000:
        divergence_type = "BULLISH_ALIGNMENT"
        divergence_bonus = +0.01  # Small reward
    else:
        divergence_type = "ALIGNMENT"
        divergence_bonus = 0.0
    
    # ETH-Specific Technical Indicators
    # Use ETH-specific RSI thresholds (more conservative)
    # Use ETH-specific moving averages (9/21 EMA instead of BTC levels)
```

**C. Add ETH-Specific Technical Levels**
```python
if asset == "ETH":
    # ETH key levels are round numbers + 0.02 multiples
    # Supports: 2000, 1900, 1800, 1700, 1600 (round $2k range)
    # Resistance: 2300, 2400, 2500, 2600, 2700 (round $2.4k+ range)
```

**D. Update Signal Determination for ETH**
```python
# ETH-specific threshold
if asset == "ETH":
    # Use eth_specific.buy_threshold instead of standard
    if final_strength >= config.eth_specific.buy_threshold:  # 0.60
        signal = "BUY"
    elif final_strength >= 0.45:  # Lower WATCH threshold
        signal = "WATCH"
    else:
        signal = "HOLD"
```

**E. Update Final Strength Calculation**
```python
# For ETH only: Apply ETH-specific overrides
if asset == "ETH":
    # Apply volume confirmation requirement
    if signal == "BUY" and volume_24h_change < config.eth_specific.min_volume_for_breakout:  # 1.5
        final_strength *= config.eth_specific.volume_confirmation_multiplier  # 0.70
        reasoning += "Weak ETH volume profile - reduce BUY conviction"
    
    # Apply gas stress tracking
    gas_price = get_current_gas_price()
    gas_ma_7d = moving_average(gas_price, 7)
    
    if gas_price > gas_ma_7d * 1.2:
        final_strength *= 0.80  # High gas = bearish for ETH
        reasoning += "High gas stress indicates network congestion/bearish sentiment"
    elif gas_price < gas_ma_7d * 0.8:
        final_strength *= 1.10  # Low gas = bullish for ETH
        reasoning += "Low gas stress indicates network health/bullish sentiment"
```

**F. Update Reasoning Template for ETH**
When ETH triggers, include ETH-specific context:
- "ETH volatility requires wider stops and longer horizons"
- "ETH/BTC ratio: X.X (ETH outperforming/underperforming)"
- "Gas stress: high/normal/low (ETH bearish/bullish)"
- "ETH-specific technical levels: $2,100 support, $2,300 resistance"

---

### 2. `/market-intel/orchestrator.js`
**Changes needed:**

**A. Read eth_specific config:**
```javascript
const ethConfig = config.eth_specific || {};

// Use ETH-specific thresholds for BUY/SELL/BUY decision
if (asset === "ETH") {
    buyThreshold = ethConfig.buy_threshold || 0.60;
    winThreshold = ethConfig.win_threshold || 0.04;
    entryBufferPercent = ethConfig.entry_buffer_percent || 0.6;
    stopLossAtrMultiplier = ethConfig.stop_loss_atr_multiplier || 2.0;
    defaultHorizon = ethConfig.default_horizon || "72H";
    minVolumeForBreakout = ethConfig.min_volume_for_breakout || 1.5;
}
```

**B. Implement confirmation chain tracking**
```javascript
// Track signal history for confirmation
const SIGNAL_HISTORY = {};
const MAX_HISTORY = 10;

function addToSignalHistory(asset, signal, timestamp, strength) {
    const key = `${asset}_${new Date(timestamp).toISOString().split('T')[0]}`;
    
    if (!SIGNAL_HISTORY[key]) {
        SIGNAL_HISTORY[key] = [];
    }
    
    SIGNAL_HISTORY[key].push({
        timestamp,
        signal,
        strength
    });
    
    // Keep only last MAX_HISTORY entries
    if (SIGNAL_HISTORY[key].length > MAX_HISTORY) {
        SIGNAL_HISTORY[key] = SIGNAL_HISTORY[key].slice(-MAX_HISTORY);
    }
}

function checkConfirmationChain(asset, currentSignal, currentStrength) {
    const key = `${asset}_confirmation`;
    const history = SIGNAL_HISTORY[key] || [];
    
    // Count consecutive BUY-like signals (BUY/STRONG_BUY)
    let consecutiveCount = 0;
    for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].signal === "BUY" || history[i].signal === "STRONG_BUY") {
            consecutiveCount++;
        } else {
            break; // Break chain on non-BUY
        }
    }
    
    return consecutiveCount >= 3;  // Need 3 consecutive
}

function applyConfirmationRule(asset, signal, finalStrength, reasoning) {
    const ethConfig = config.eth_specific || {};
    const requireConfirmation = ethConfig.require_confirmation !== false;
    
    if (asset === "ETH" && requireConfirmation) {
        if (signal === "BUY") {
            // Check confirmation chain
            const confirmed = checkConfirmationChain(asset, signal, finalStrength);
            
            if (!confirmed) {
                // Not enough consecutive BUYs - downgrade to WATCH
                return {
                    signal: "WATCH",
                    strength: finalStrength * 0.7,  // Reduce conviction
                    reasoning: reasoning + " [ETH: Insufficient confirmation chain - need 3 consecutive BUY signals, have " + checkConfirmationChain(asset, "BUY", finalStrength) + "]"
                };
            }
        }
    }
    
    return { signal, finalStrength, reasoning };
}
```

**C. Implement ETH-specific indicator fetching**
```javascript
// ETH-specific indicators (gas, DeFi TVL, ETH/BTC ratio)

async function getEthSpecificIndicators(asset) {
    if (asset !== "ETH") return {};
    
    const indicators = {};
    
    // 1. Gas stress
    try {
        const gasPrice = await getGasPrice();
        const gasMa = await getGasMa7d();
        
        let gasInterpretation = "normal";
        if (gasPrice > gasMa * 1.2) {
            gasInterpretation = "high_stress";  // Bearish for ETH
        } else if (gasPrice < gasMa * 0.8) {
            gasInterpretation = "low_stress";  // Bullish for ETH
        }
        
        indicators.gas_stress = gasInterpretation;
    } catch (e) {
        console.log("Gas fetch failed, using neutral");
        indicators.gas_stress = "normal";
    }
    
    // 2. ETH/BTC ratio
    const ethPriceChange = getEthPriceChange24h();
    const btcPriceChange = getBtcPriceChange24h();
    
    if (ethPriceChange && btcPriceChange) {
        const ratio = ethPriceChange / btcPriceChange;
        
        if (ratio < 0.70) {
            indicators.eth_btc_ratio = "underperforming_significantly";  // ETH lags BTC by >30%
        } else if (ratio < 0.85) {
            indicators.eth_btc_ratio = "underperforming_slightly";  // ETH lags BTC by 15-30%
        } else if (ratio > 1.00) {
            indicators.eth_btc_ratio = "outperforming_slightly";  // ETH leads BTC by up to 15%
        } else if (ratio > 1.15) {
            indicators.eth_btc_ratio = "outperforming_significantly";  // ETH leads BTC by >15%
        }
    }
    
    return indicators;
}

// Helper functions
async function getGasPrice() { /* fetch from ETH gas APIs */ }
async function getGasMa7d() { /* calculate 7d moving average */ }
async function getEthPriceChange24h() { /* calculate ETH 24h price change */ }
async function getBtcPriceChange24h() { /* calculate BTC 24h price change */ }
```

**D. Update synthesis logic to use ETH-specific indicators**
```javascript
// In synthesize(), pass ethSpecificIndicators to the signal generation
async function synthesize(agentsResults, macroResults, sentimentResults) {
    // Get ETH-specific indicators
    const ethIndicators = await getEthSpecificIndicators("ETH");
    
    // Apply to all ETH signals
    const ethConfig = config.eth_specific || {};
    
    for (const signal of signals) {
        if (signal.asset === "ETH") {
            // Apply ETH-specific adjustments
            let adjustedStrength = signal.strength_adjusted;
            
            // ETH/BTC ratio
            if (ethIndicators.eth_btc_ratio?.includes("underperforming")) {
                adjustedStrength *= ethConfig.underperformance_penalty || 0.95;
            } else if (ethIndicators.eth_btc_ratio?.includes("outperforming")) {
                adjustedStrength *= ethConfig.overperformance_cap_multiplier || 1.05;
            }
            
            // Gas stress
            if (ethIndicators.gas_stress === "high_stress") {
                adjustedStrength *= 0.80;
            } else if (ethIndicators.gas_stress === "low_stress") {
                adjustedStrength *= 1.10;
            }
            
            // Apply confirmation rule
            const confirmationResult = applyConfirmationRule(
                signal.asset, 
                signal.signal, 
                adjustedStrength
            );
            
            signal.strength_adjusted = confirmationResult.finalStrength;
            signal.reasoning = confirmationResult.reasoning;
            signal.signal = confirmationResult.finalSignal;
        }
    }
    
    // Continue with rest of synthesis...
}
```

---

## Implementation Order

1. Update `crypto-analyst.md` with ETH-specific sections
2. Update `config.json` with `eth_specific` section
3. Update `orchestrator.js` with:
   - Read eth_specific config
   - Implement confirmation chain tracking
   - Add ETH-specific indicator fetching (gas, ETH/BTC ratio)
   - Apply ETH-specific adjustments in synthesis
4. Test with backtest: Run 7-day backtest comparing ETH accuracy
5. If accuracy improves (>30%): Keep changes
6. If no improvement: Revert changes

## Testing Approach

**Backtest Configuration:**
```json
{
  "eth_only": true,
  "date_range": "2026-04-01 to 2026-04-08",
  "metrics": ["accuracy", "win_rate", "max_drawdown", "signal_distribution"]
}
```

**Validation Criteria:**
- ETH accuracy must increase from 0% to >30%
- No degradation of BTC accuracy (currently 37.5%)
- False BUY signal rate must decrease significantly

## Risk Management

**If changes fail:**
- Revert via git: `git checkout HEAD~1 market-intel/agents/*`
- Rollback config.json
- Document reasons in ETH-FIX.md

**Rollback Plan:**
1. Keep ETH-FIX.md as documentation of attempt
2. Create new branch: `eth-fix-attempt-2`
3. If successful: Merge to main
4. If failed: Delete branch

## Notes

- These are RADICAL changes that significantly alter ETH signal generation
- Confirmation chain is conservative but addresses 0% accuracy problem
- Inverted logic (ETH does opposite of BTC) is key hypothesis to test
- ETH-specific indicators (gas, DeFi) require API integrations not yet done
- Can implement confirmation chain and ETH/BTC ratio immediately as they don't require new APIs
- Gas stress tracking may require mock data for initial testing
