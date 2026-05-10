# Market Intelligence Data Schema

Complete reference for the JSON format pushed to GitHub every 6 hours.

## File: `data/latest.json`

Updated every 6 hours (00:00, 06:00, 12:00, 18:00 UTC).

---

## Root Structure

```typescript
interface MarketIntelligence {
  metadata: Metadata;
  macro_analysis: MacroAnalysis;
  sentiment: Sentiment;
  signals: Signal[];
  market_trends: MarketTrends;
  strategy_summary: string;
}
```

---

## 1. Metadata

```typescript
interface Metadata {
  timestamp: string;        // ISO 8601 UTC: "2026-03-17T00:00:00Z"
  run_id: string;           // Format: "20260317-0000"
  next_run: string;         // ISO 8601 UTC of next scheduled run
}
```

**Example:**
```json
{
  "timestamp": "2026-03-17T00:00:00Z",
  "run_id": "20260317-0000",
  "next_run": "2026-03-17T06:00:00Z"
}
```

---

## 2. Macro Analysis

```typescript
interface MacroAnalysis {
  regime: "RISK_ON" | "RISK_OFF" | "NEUTRAL";
  regime_description: string;
  vix: number;              // Volatility Index
  dxy: number;              // Dollar Index
  fed_funds_rate: number;   // Current Fed Funds rate (%)
  key_events: string[];     // Array of major market events
  market_summary: string;   // Executive summary
}
```

**Example:**
```json
{
  "regime": "RISK_OFF",
  "regime_description": "VIX elevated at 25-27, geopolitical tensions (Iran-Israel), Fed delaying cuts",
  "vix": 25.74,
  "dxy": 100.5,
  "fed_funds_rate": 4.5,
  "key_events": [
    "Fed Meeting March 17-18",
    "Kevin Warsh nomination shock",
    "Strait of Hormuz crisis ongoing"
  ],
  "market_summary": "Crypto showing unusual strength during RISK_OFF environment. Traditional correlations breaking down."
}
```

---

## 3. Sentiment

```typescript
interface Sentiment {
  fear_greed_index: number;           // 0-100 scale
  fear_greed_label: string;           // "EXTREME_FEAR" | "FEAR" | "NEUTRAL" | "GREED" | "EXTREME_GREED"
  interpretation: string;
  crypto_funding_btc: number;         // Funding rate (decimal, e.g., 0.0025 = 0.25%)
  crypto_funding_eth: number;
  gold_etf_flows_ytd: number;        // Year-to-date % change
  gold_etf_flows_1y: number;         // 1-year % change
  positioning_summary: string;
}
```

**Example:**
```json
{
  "fear_greed_index": 28,
  "fear_greed_label": "FEAR",
  "interpretation": "Extreme fear contrarian opportunity - improved from 23 but still pessimistic",
  "crypto_funding_btc": 0.0025,
  "crypto_funding_eth": 0.0076,
  "gold_etf_flows_ytd": 21,
  "gold_etf_flows_1y": 75,
  "positioning_summary": "Neutral funding (no overleveraged positions). Gold institutional accumulation strong."
}
```

---

## 4. Signals (Array)

Each run produces 4 signals: BTC, ETH, SOL, GOLD.

```typescript
interface Signal {
  asset: "BTC" | "ETH" | "SOL" | "GOLD";
  signal_type: "BUY" | "SELL" | "HOLD" | "WATCH";
  strength: number;                    // 0.0-1.0 scale
  priority: "IMMEDIATE" | "DIGEST" | "LOG_ONLY";
  
  price_data: PriceData;
  trade_setup: TradeSetup;
  analysis: Analysis;
}

interface PriceData {
  current_price: number;
  change_6h: number;                   // Percentage change
  change_24h: number;
}

interface TradeSetup {
  entry_zone: {
    min: number;
    max: number;
    optimal: number;
  };
  stop_loss: number;
  risk_percent: number;                // Percentage risk (e.g., 3.24)
  targets: Target[];
}

interface Target {
  level: "TP1" | "TP2" | "TP3";
  price: number;
  rr_ratio: number;                    // Risk-to-reward ratio
}

interface Analysis {
  thesis: string;                      // Main trade reasoning
  confluence_factors: string[];        // Array of supporting factors
  catalysts: string[];                 // Bullish/bearish drivers
  risks: string[];                     // Potential invalidations
}
```

**Example Signal (BTC):**
```json
{
  "asset": "BTC",
  "signal_type": "BUY",
  "strength": 0.81,
  "priority": "IMMEDIATE",
  
  "price_data": {
    "current_price": 74505,
    "change_6h": 1.0,
    "change_24h": 3.2
  },
  
  "trade_setup": {
    "entry_zone": {
      "min": 73900,
      "max": 74500,
      "optimal": 74200
    },
    "stop_loss": 71800,
    "risk_percent": 3.24,
    "targets": [
      {"level": "TP1", "price": 77000, "rr_ratio": 1.3},
      {"level": "TP2", "price": 79800, "rr_ratio": 2.7},
      {"level": "TP3", "price": 83000, "rr_ratio": 4.6}
    ]
  },
  
  "analysis": {
    "thesis": "BTC broke $74K resistance despite RISK_OFF macro. Extreme fear (28) + institutional buying creating contrarian setup.",
    "confluence_factors": [
      "Fear contrarian signal +0.10",
      "Breakout momentum +0.05",
      "Macro headwind -0.03"
    ],
    "catalysts": [
      "BlackRock $600M BTC accumulation",
      "$300M short liquidations",
      "Crypto decoupling from traditional risk assets"
    ],
    "risks": [
      "Fed meeting volatility (March 17-18)",
      "$74K resistance test",
      "VIX still elevated (RISK_OFF environment)"
    ]
  }
}
```

---

## 5. Market Trends

```typescript
interface MarketTrends {
  dominant_theme: string;
  key_observations: string[];
  contrarian_opportunities: string[];
  risks_to_monitor: string[];
}
```

**Example:**
```json
{
  "dominant_theme": "Crypto decoupling from traditional risk-off correlations",
  "key_observations": [
    "All 3 crypto assets hit immediate alert threshold (≥0.7) - rare alignment",
    "Crypto rallying 'as crisis sparks price shock' (Forbes paradox)",
    "Fear moderating from severe capitulation (15) to extreme fear (28)",
    "BTC approaching $74K resistance despite geopolitical stress"
  ],
  "contrarian_opportunities": [
    "Extreme fear (28) + resilient price action = high-conviction BUY setup",
    "Each geopolitical escalation causing smaller crypto drawdowns (market adaptation)",
    "Short squeeze ($300M liq) + institutional buying overwhelming fear"
  ],
  "risks_to_monitor": [
    "Fed meeting March 17-18 (volatility risk)",
    "VIX still elevated at 25-27 (RISK_OFF persists)",
    "DXY strength pressuring commodities"
  ]
}
```

---

## 6. Strategy Summary

```typescript
strategy_summary: string;  // 1-2 sentence actionable takeaway
```

**Example:**
```json
{
  "strategy_summary": "Crypto presenting high-conviction contrarian opportunity. All 3 crypto assets showing unusual strength during RISK_OFF environment. Extreme fear + breakout setup + crisis rally paradox = rare alignment. Gold in wait-and-see mode until DXY weakens or price reclaims $5,100."
}
```

---

## Complete Example Response

```json
{
  "metadata": {
    "timestamp": "2026-03-17T00:00:00Z",
    "run_id": "20260317-0000",
    "next_run": "2026-03-17T06:00:00Z"
  },
  
  "macro_analysis": {
    "regime": "RISK_OFF",
    "regime_description": "VIX elevated at 25-27, geopolitical tensions (Iran-Israel), Fed delaying cuts",
    "vix": 25.74,
    "dxy": 100.5,
    "fed_funds_rate": 4.5,
    "key_events": [
      "Fed Meeting March 17-18",
      "Kevin Warsh nomination shock",
      "Strait of Hormuz crisis ongoing"
    ],
    "market_summary": "Crypto showing unusual strength during RISK_OFF environment. Traditional correlations breaking down."
  },
  
  "sentiment": {
    "fear_greed_index": 28,
    "fear_greed_label": "FEAR",
    "interpretation": "Extreme fear contrarian opportunity - improved from 23 but still pessimistic",
    "crypto_funding_btc": 0.0025,
    "crypto_funding_eth": 0.0076,
    "gold_etf_flows_ytd": 21,
    "gold_etf_flows_1y": 75,
    "positioning_summary": "Neutral funding (no overleveraged positions). Gold institutional accumulation strong."
  },
  
  "signals": [
    {
      "asset": "BTC",
      "signal_type": "BUY",
      "strength": 0.81,
      "priority": "IMMEDIATE",
      "price_data": {
        "current_price": 74505,
        "change_6h": 1.0,
        "change_24h": 3.2
      },
      "trade_setup": {
        "entry_zone": {"min": 73900, "max": 74500, "optimal": 74200},
        "stop_loss": 71800,
        "risk_percent": 3.24,
        "targets": [
          {"level": "TP1", "price": 77000, "rr_ratio": 1.3},
          {"level": "TP2", "price": 79800, "rr_ratio": 2.7},
          {"level": "TP3", "price": 83000, "rr_ratio": 4.6}
        ]
      },
      "analysis": {
        "thesis": "BTC broke $74K resistance despite RISK_OFF macro. Extreme fear (28) + institutional buying creating contrarian setup.",
        "confluence_factors": [
          "Fear contrarian signal +0.10",
          "Breakout momentum +0.05",
          "Macro headwind -0.03"
        ],
        "catalysts": [
          "BlackRock $600M BTC accumulation",
          "$300M short liquidations",
          "Crypto decoupling from traditional risk assets"
        ],
        "risks": [
          "Fed meeting volatility (March 17-18)",
          "$74K resistance test",
          "VIX still elevated (RISK_OFF environment)"
        ]
      }
    }
    // ... ETH, SOL, GOLD signals (same structure)
  ],
  
  "market_trends": {
    "dominant_theme": "Crypto decoupling from traditional risk-off correlations",
    "key_observations": [
      "All 3 crypto assets hit immediate alert threshold (≥0.7) - rare alignment",
      "Crypto rallying 'as crisis sparks price shock' (Forbes paradox)"
    ],
    "contrarian_opportunities": [
      "Extreme fear (28) + resilient price action = high-conviction BUY setup"
    ],
    "risks_to_monitor": [
      "Fed meeting March 17-18 (volatility risk)",
      "VIX still elevated at 25-27 (RISK_OFF persists)"
    ]
  },
  
  "strategy_summary": "Crypto presenting high-conviction contrarian opportunity. All 3 crypto assets showing unusual strength during RISK_OFF environment."
}
```

---

## Priority Levels

Signals are categorized by strength:

| Priority | Strength Range | Telegram Alert | Display Recommendation |
|----------|---------------|----------------|----------------------|
| **IMMEDIATE** | ≥ 0.70 | ✅ Yes (urgent) | Highlight prominently |
| **DIGEST** | 0.50 - 0.69 | ✅ Yes (context) | Secondary section |
| **LOG_ONLY** | < 0.50 | ❌ No | Optional/hidden |

---

## Update Frequency

- **Production schedule:** Every 6 hours (00:00, 06:00, 12:00, 18:00 UTC)
- **Expected latency:** Data available on GitHub within 30-60 seconds of run completion
- **Cache recommendation:** Refresh website every 5 minutes (or poll `metadata.json` for changes)

---

## File Locations

| File | URL | Purpose |
|------|-----|---------|
| `data/latest.json` | `https://raw.githubusercontent.com/YOUR_USERNAME/market-intel-public/main/data/latest.json` | Current market intelligence |
| `data/metadata.json` | `https://raw.githubusercontent.com/YOUR_USERNAME/market-intel-public/main/data/metadata.json` | Last update timestamp |

---

## Error States

If orchestrator fails, `latest.json` will contain previous run data. Check `metadata.timestamp` against current time:

```javascript
const data = await fetch(DATA_URL).then(r => r.json());
const ageHours = (Date.now() - new Date(data.metadata.timestamp)) / 3600000;

if (ageHours > 7) {
  console.warn('Data stale: last update', data.metadata.timestamp);
  // Display warning banner on website
}
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-17 | Initial schema |

Schema is considered **stable** - breaking changes will increment major version.
