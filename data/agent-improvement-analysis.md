# Market Intelligence Agent Improvement Analysis

**Date:** April 9, 2026
**Based on:** March 7-10 7-day Backtest Data and Signal Performance Metrics
**Focus:** Crypto Analyst, Gold Analyst, Macro Scout, Sentiment Radar

---

## 1. Executive Summary
A comprehensive review of the 4 Market Intelligence agents' logic and historical data (`signal-performance.json`, `backtest-results.json`, `7-day-backtest-2026-03-10.md`) reveals structural inefficiencies in confluence thresholds, macro-adjustment handling, and volatility scaling. While directional accuracy remains decent (agents understand the trend well), rigid parameters caused missed opportunities in Crypto and overexposure in Gold during recent volatility. 

Projected improvements from the recommended changes show a potential **+7.46% P&L swing** over a similar 3.5-day window.

---

## 2. Agent-Specific Observations vs Outcomes

### A. Gold Analyst
* **Performance:** 22% win rate (2 wins, 7 losses). Total P&L of -15.54 (avg -1.73%).
* **Observation:** The agent fell into the "war premium trap." It provided high conviction (78-90% strength) BUY signals directly at local price peaks ($5,428, $5,457).
* **Issue:** The agent correctly identifies underlying fundamentals (e.g., central bank buying), but fails to account for rapid de-escalation narratives or apply proper volatility caps. High `RISK_OFF` modifiers combined with extreme news sentiment created dangerously high strength scores.

### B. Crypto Analyst (BTC & ETH)
* **Performance:** 0% win rate. 10 consecutive missed opportunities for BTC (Avg opportunity cost: 3.07% missed gains) and ETH.
* **Observation:** The agent correctly leaned bullish (WATCH signals), but its BUY threshold was too high (70%). 
* **Issue:** Conservative signal gating (62-75% strength scores consistently outputted WATCH instead of BUY). Furthermore, a missing whale data penalty heavily punished confidence scores. The model ignored a textbook "Extreme Fear" contrarian bottom (Fear index around 13 for days) due to rigid modifier logic. ETH correctly showed less conviction than BTC, acting appropriately cautious.

### C. Macro Scout & Sentiment Radar (Confluence Providers)
* **Observation:** The macro and sentiment inputs use binary or very heavy-handed fixed adjustments (e.g., ±0.05 for `RISK_OFF`).
* **Issue:** In high volatility regimes, adding a flat +0.05 to gold and -0.05 to crypto caused wild misalignments. The lack of gradient adjustment creates an over-correction problem.

---

## 3. Structural Methodological Improvements Needed

### Threshold Calibration
The threshold for crypto BUY signals is currently set identically to Gold (0.70). Crypto exhibits completely different volatility and requires a slightly lower action gating:
* **Crypto BUY Threshold:** Lower from 0.70 to **0.65**.

### Geopolitical Volatility Caps
Gold needs a safeguard to prevent buying local tops during extreme news events.
* Cap the maximum strength score at `0.75` when geopolitical events are actively causing >5% 24h volatility.
* Require 2 consecutive runs confirming the trend before issuing a BUY.

### Gradient Macro Adjustments
Move away from binary modifiers for Macro adjustments:
* `EXTREME_RISK_OFF`: Gold +0.08, Crypto -0.08
* `RISK_OFF`: Gold +0.03, Crypto -0.03
* `NEUTRAL`: 0.00
* `RISK_ON`: Gold -0.03, Crypto +0.05

### Enhanced Contrarian Rules (Extreme Fear Override)
Crypto should heavily weigh sustained extreme fear.
* If Fear & Greed < 15 for 3+ days, boost the contrarian signal from +0.05 to +0.15.
* Reduce missing data penalty (Whale Data unavailable) from -0.10 to -0.03.

---

## 4. Proposed Backtest Parameters

To test these improvements, the following parameters should be used in the next backtest simulation:

```yaml
# Agent Thresholds
thresholds:
  immediate_alert: 0.75
  crypto_buy: 0.65
  gold_buy: 0.70
  watch: 0.50

# Extreme Sentiment Override
extreme_fear_boost:
  base: 0.10
  duration_multiplier:
    1_day: 0.10
    2_days: 0.12
    3_days: 0.15
    4_days: 0.20 # Capitulation

# Geopolitical Safeguards
geopolitical_volatility_cap:
  enabled: true
  max_strength: 0.75
  trigger_keywords: ["war", "conflict", "strike", "attack"]
  confirmation_runs_required: 2
  volatility_threshold: 0.05

# Gradient Macro Scoring
risk_sentiment_adjustment:
  gradient: true
  gold:
    EXTREME_RISK_OFF: +0.08
    RISK_OFF: +0.03
    NEUTRAL: 0.00
    RISK_ON: -0.03
  crypto:
    EXTREME_RISK_OFF: -0.08
    RISK_OFF: -0.03
    NEUTRAL: 0.00
    RISK_ON: +0.05

# Data Penalties
whale_unavailable_penalty: -0.03
```

## 5. Conclusion
By calibrating to gradient adjustments, implementing volatility caps on safe-havens, and lowering gating thresholds for risk assets in capitulation phases, the agents will filter out noise while executing at historically reliable entry points. The proposed parameters should be rigorously evaluated via historical data covering both trend and range-bound environments.
