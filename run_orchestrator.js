const { execSync } = require('child_process');
const fs = require('fs');

const cryptoOutput = `[
  {
    "asset": "BTC",
    "signal": "BUY",
    "strength": 0.85,
    "whale_activity": "STRONG_ACCUMULATION",
    "whale_net_flow_24h": -1834,
    "whale_net_flow_7d": -8200,
    "whale_trend_aligned": true,
    "whale_confidence": 1.0,
    "whale_adjustment": 0.12,
    "divergence_type": "BULLISH_DIVERGENCE",
    "divergence_bonus": 0.03,
    "funding_rate": -0.00015,
    "funding_interpretation": "HIGHLY_NEGATIVE",
    "funding_adjustment": 0.1,
    "reasoning": "BTC breaking out. Whale flows: -1,834 BTC (24h) / -8,200 BTC (7d) -> strong accumulation trend. Trends aligned, confidence HIGH (1.0). Bullish divergence: price dropped yet whales accumulating heavily (+0.15 total whale boost). Funding rate -0.015% (shorts paying heavily, +0.10 boost). Combined confluence = HIGH-CONVICTION BUY (0.85).",
    "price_current": 72741,
    "price_24h_change": 1.2,
    "entry": {
      "optimal": 72500,
      "range": [72000, 72800],
      "order_type": "LIMIT",
      "timeframe": "4H"
    },
    "stop_loss": {
      "price": 70000,
      "percent": -3.44,
      "reasoning": "Below key support and 1.5x ATR"
    },
    "take_profit": {
      "tp1": { "price": 75000, "percent": 3.1, "r_to_r": 1.5 },
      "tp2": { "price": 78000, "percent": 7.2, "r_to_r": 2.5 },
      "tp3": { "price": 82000, "percent": 12.7, "r_to_r": 4.0 }
    },
    "position_sizing": {
      "risk_percent": 2,
      "account_size": 10000,
      "position_value": 581,
      "units": 0.008
    },
    "technical_levels": {
      "support": [70000, 68000, 65000],
      "resistance": [75000, 78000, 82000]
    },
    "sources": [
      "https://glassnode.com/btc"
    ]
  },
  {
    "asset": "ETH",
    "signal": "HOLD",
    "strength": 0.45,
    "whale_activity": "NEUTRAL",
    "whale_net_flow_24h": -200,
    "whale_net_flow_7d": 1500,
    "whale_trend_aligned": false,
    "whale_confidence": 0.5,
    "whale_adjustment": 0.0,
    "divergence_type": "NONE",
    "divergence_bonus": 0.0,
    "funding_rate": 0.0001,
    "funding_interpretation": "NEUTRAL",
    "funding_adjustment": 0.0,
    "reasoning": "ETH consolidating. Mixed whale flows and neutral funding. ETH volatility requires wider stops and longer horizons. ETH/BTC ratio neutral.",
    "price_current": 2233.4,
    "price_24h_change": -0.5,
    "technical_levels": {
      "support": [2180, 2100, 2000],
      "resistance": [2330, 2400, 2500]
    },
    "sources": [
      "https://glassnode.com/eth"
    ]
  },
  {
    "asset": "SOL",
    "signal": "WATCH",
    "strength": 0.60,
    "whale_activity": "ACCUMULATION",
    "whale_net_flow_24h": -35000,
    "whale_net_flow_7d": -150000,
    "whale_trend_aligned": true,
    "whale_confidence": 0.8,
    "whale_adjustment": 0.06,
    "divergence_type": "ALIGNMENT",
    "divergence_bonus": 0.02,
    "funding_rate": -0.00005,
    "funding_interpretation": "NEGATIVE",
    "funding_adjustment": 0.05,
    "reasoning": "SOL showing relative strength. Accumulation ongoing but approaching resistance. Monitor for breakout.",
    "price_current": 84.37,
    "price_24h_change": 2.1,
    "technical_levels": {
      "support": [80, 75, 70],
      "resistance": [90, 100, 110]
    },
    "sources": [
      "https://glassnode.com/sol"
    ]
  }
]`;

const macroOutput = `{
  "summary": "Geopolitical tensions and a Middle East energy shock have driven up oil prices, stalling inflation at 2.4%. Consequently, Fed officials have raised their 2026 inflation outlook and are showing growing openness to rate hikes instead of cuts, shifting the narrative toward a 'no-landing' scenario.",
  "risk_sentiment": "RISK_OFF",
  "vix": "Elevated (approx. 20-25)",
  "key_events": [
    {
      "event": "Fed signals potential rate hikes",
      "impact": "Negative for risk assets, rising yields",
      "confidence": 0.85
    },
    {
      "event": "Middle East energy shock stalls inflation at 2.4%",
      "impact": "Increases inflation expectations and geopolitical risk premium",
      "confidence": 0.9
    }
  ]
}`;

const cmd = \`openclaw agent --session-id sentiment-radar --message "Read and follow market-intel/agents/sentiment-radar.md.\\n\\nCrypto analyst output (current run):\\n\${cryptoOutput.replace(/"/g, '\\\\"')}\\n\\nMacro scout output (current run):\\n\${macroOutput.replace(/"/g, '\\\\"')}\\n\\nSynthesize sentiment using the above data. Return ONLY valid JSON object. No markdown, no explanation." --json\`;

fs.writeFileSync('run_sentiment.sh', cmd);
execSync('chmod +x run_sentiment.sh');
console.log("Written run_sentiment.sh");
