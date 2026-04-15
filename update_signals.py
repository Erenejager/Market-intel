import json
import os
from datetime import datetime

file_path = 'market-intel/data/signals.json'

data = []
if os.path.exists(file_path):
    with open(file_path, 'r') as f:
        try:
            data = json.load(f)
        except:
            data = []

new_entry = {
  "timestamp": datetime.utcnow().isoformat() + "Z",
  "signals": [
    {
      "asset": "BTC",
      "signal": "SELL",
      "strength": 0.60,
      "strength_pre_synthesis": 0.70,
      "adjustments": {
        "event_override": -0.15,
        "sentiment_confirmation": 0.05,
        "divergence_penalty": 0.00,
        "net": -0.10
      },
      "confluence_factors": 2,
      "reasoning": "Failed to break resistance; macro event override applied.",
      "entry": 71000,
      "stop": 73000,
      "tp1": 68000,
      "tp2": 65000,
      "tp3": 60000,
      "price_current": 71184,
      "price_24h_change": -0.71
    },
    {
      "asset": "ETH",
      "signal": "SELL",
      "strength": 0.55,
      "strength_pre_synthesis": 0.65,
      "adjustments": {
        "event_override": -0.15,
        "sentiment_confirmation": 0.05,
        "divergence_penalty": 0.00,
        "net": -0.10
      },
      "confluence_factors": 2,
      "reasoning": "Following BTC weakness; macro event override applied.",
      "entry": 2200,
      "stop": 2350,
      "tp1": 2000,
      "tp2": 1800,
      "tp3": 1500,
      "price_current": 2180,
      "price_24h_change": -2.97
    },
    {
      "asset": "SOL",
      "signal": "SELL",
      "strength": 0.50,
      "strength_pre_synthesis": 0.60,
      "adjustments": {
        "event_override": -0.15,
        "sentiment_confirmation": 0.05,
        "divergence_penalty": 0.00,
        "net": -0.10
      },
      "confluence_factors": 2,
      "reasoning": "Following broad market downtrend; macro event override applied.",
      "entry": 83,
      "stop": 88,
      "tp1": 75,
      "tp2": 70,
      "tp3": 60,
      "price_current": 82.27,
      "price_24h_change": -2.60
    }
  ],
  "macro": {
    "risk_sentiment": "RISK_OFF",
    "vix": 22.5,
    "summary": "Rates hold steady, inflation concerns persist."
  },
  "sentiment": {
    "fear_greed": 25,
    "label": "FEAR",
    "crypto_signal_bias": "SELL",
    "gold_signal_bias": "HOLD"
  },
  "delivered": True,
  "agents_used": ["crypto-analyst", "gold-analyst", "macro-scout", "sentiment-radar"]
}

data.append(new_entry)
if len(data) > 100:
    data = data[-100:]

with open(file_path, 'w') as f:
    json.dump(data, f, indent=2)

print("done")
