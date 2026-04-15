import json
import os
import datetime

# Market data
btc_price = 72741
eth_price = 2233.4
sol_price = 84.37
gold_price = 4818.00

signals = [
  {
    "asset": "BTC",
    "signal": "BUY",
    "strength": 0.75,
    "strength_pre_synthesis": 0.85,
    "adjustments": {
      "event_override": -0.15,
      "sentiment_confirmation": 0.05,
      "divergence_penalty": 0.0,
      "net": -0.10
    },
    "confluence_factors": 3,
    "reasoning": "Strong accumulation. ⚠️ High-impact event risk",
    "entry": 72500,
    "stop": 70000,
    "tp1": 75000,
    "tp2": 78000,
    "tp3": 82000,
    "price_current": btc_price,
    "price_24h_change": 1.2
  },
  {
    "asset": "GOLD_FUTURES",
    "signal": "WATCH",
    "strength": 0.57,
    "strength_pre_synthesis": 0.75,
    "adjustments": {
      "event_override": -0.15,
      "sentiment_confirmation": -0.03,
      "divergence_penalty": 0.0,
      "net": -0.18
    },
    "confluence_factors": 1,
    "reasoning": "Safe haven demand. Downgraded to WATCH due to lack of confluence. ⚠️ High-impact event risk",
    "entry": 4800.0,
    "stop": 4700.0,
    "tp1": 4900.0,
    "tp2": 5000.0,
    "tp3": 5100.0,
    "price_current": gold_price,
    "price_24h_change": 0.6
  }
]

macro_data = {
  "risk_sentiment": "RISK_OFF",
  "vix": 22.5,
  "summary": "Fed signals potential rate hikes; inflation stalls.",
  "key_events": [
    {"event": "Fed signals potential rate hikes", "impact": "Negative", "confidence": 0.85}
  ]
}

sentiment_data = {
  "fear_greed": 25,
  "label": "FEAR",
  "crypto_signal_bias": "BUY",
  "gold_signal_bias": "HOLD"
}

# Message Gen
msg = f"📊 **Market Intel** — {datetime.datetime.utcnow().strftime('%d %b %Y %H:%M')} UTC\n\n## Signals\n\n"
msg += f"**BTC ⬆️ BUY** | **75%**\n${btc_price} (+1.2%) → Entry $72500 | Stop $70000 | TP $75000/$78000/$82000\nStrong accumulation. ⚠️ High-impact event risk\n\n"
msg += f"**GOLD_FUTURES 👀 WATCH** | **57%**\n${gold_price} (+0.6%) → Entry $4800.0 | Stop $4700.0 | TP $4900.0/$5000.0/$5100.0\nSafe haven demand. Downgraded to WATCH due to lack of confluence. ⚠️ High-impact event risk\n\n"
msg += f"---\n\n## Macro\n\n🔴 **RISK_OFF**\n• VIX: {macro_data['vix']}\n• Fed: {macro_data['summary']}\n• Key: {macro_data['key_events'][0]['event']}\n\n---\n\n## Sentiment\n\n• F&G: **{sentiment_data['fear_greed']}** ({sentiment_data['label']})\n• Funding BTC: highly negative (-0.015%)\n• Gold ETF: +12%\n\n---\n\n**Bottom line:** Exercise caution amidst high-impact macro risks despite strong BTC technicals."

with open("msg.txt", "w") as f:
    f.write(msg)

signals_path = "market-intel/data/signals.json"
os.makedirs(os.path.dirname(signals_path), exist_ok=True)
if os.path.exists(signals_path):
    with open(signals_path, "r") as f:
        try:
            history = json.load(f)
        except:
            history = []
else:
    history = []

run_entry = {
  "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
  "signals": signals,
  "macro": macro_data,
  "sentiment": sentiment_data,
  "delivered": True,
  "agents_used": ["crypto-analyst", "gold-analyst", "macro-scout", "sentiment-radar"]
}
history.append(run_entry)
history = history[-100:]

with open(signals_path, "w") as f:
    json.dump(history, f, indent=2)

print("Done")
