const fs = require('fs');

const file = 'market-intel/data/signals.json';
let data = [];
if (fs.existsSync(file)) {
  try {
    data = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {}
}

data.push({
  "timestamp": new Date().toISOString(),
  "signals": [
    {
      "asset": "BTC",
      "signal": "BUY",
      "strength": 0.75,
      "strength_pre_synthesis": 0.85,
      "adjustments": {
        "event_override": -0.15,
        "sentiment_confirmation": 0.05,
        "divergence_penalty": 0,
        "net": -0.10
      },
      "confluence_factors": 3,
      "reasoning": "BTC breaking out. Whale flows: -1,834 BTC (24h) / -8,200 BTC (7d) -> strong accumulation trend. Trends aligned, confidence HIGH (1.0). Bullish divergence: price dropped yet whales accumulating heavily (+0.15 total whale boost). Funding rate -0.015% (shorts paying heavily, +0.10 boost). Combined confluence = HIGH-CONVICTION BUY (0.85). ⚠️ High-impact event risk",
      "entry": 72500,
      "stop": 70000,
      "tp1": 75000,
      "tp2": 78000,
      "tp3": 82000,
      "price_current": 72741,
      "price_24h_change": 1.2
    },
    {
      "asset": "GOLD_FUTURES",
      "signal": "BUY",
      "strength": 0.70,
      "strength_pre_synthesis": 0.82,
      "adjustments": {
        "event_override": -0.15,
        "sentiment_confirmation": 0.03,
        "divergence_penalty": 0,
        "net": -0.12
      },
      "confluence_factors": 2,
      "reasoning": "Gold futures holding strong amidst geopolitical uncertainties and a steady DXY. Real yields remain supportive for safe-haven assets. Trend is upward with solid support at previous breakout levels. ⚠️ High-impact event risk",
      "entry": 2340,
      "stop": 2310,
      "tp1": 2375,
      "tp2": 2400,
      "tp3": 2450,
      "price_current": 2345.5,
      "price_24h_change": 0.8
    }
  ],
  "macro": {
    "risk_sentiment": "RISK_OFF",
    "vix": "Elevated (approx. 20-25)",
    "summary": "Geopolitical tensions and a Middle East energy shock have driven up oil prices, stalling inflation at 2.4%. Consequently, Fed officials have raised their 2026 inflation outlook and are showing growing openness to rate hikes instead of cuts, shifting the narrative toward a 'no-landing' scenario."
  },
  "sentiment": {
    "fear_greed": "FEAR",
    "label": "FEAR",
    "crypto_signal_bias": "BUY",
    "gold_signal_bias": "BUY"
  },
  "delivered": true,
  "agents_used": ["crypto-analyst", "gold-analyst", "macro-scout", "sentiment-radar"]
});

if (data.length > 100) {
  data = data.slice(-100);
}

fs.mkdirSync('market-intel/data', { recursive: true });
fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Updated signals.json');
