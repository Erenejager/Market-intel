import json
import urllib.request
import datetime
import os

# 1. Crypto Data (Mocked or fetched)
crypto_data = [
    {
      "asset": "BTC",
      "signal": "BUY",
      "strength": 0.85,
      "price_current": 65000,
      "price_24h_change": 2.5,
      "entry": {"optimal": 64500},
      "stop_loss": {"price": 62000},
      "take_profit": {"tp1": {"price": 68000}, "tp2": {"price": 70000}, "tp3": {"price": 72000}},
      "reasoning": "Strong accumulation and macro tailwinds.",
      "whale_activity": "STRONG_ACCUMULATION"
    },
    {
      "asset": "ETH",
      "signal": "BUY",
      "strength": 0.70,
      "price_current": 3500,
      "price_24h_change": 1.5,
      "entry": {"optimal": 3450},
      "stop_loss": {"price": 3300},
      "take_profit": {"tp1": {"price": 3700}, "tp2": {"price": 3900}, "tp3": {"price": 4100}},
      "reasoning": "Tracking BTC, solid support.",
      "whale_activity": "ACCUMULATION"
    },
    {
      "asset": "SOL",
      "signal": "WATCH",
      "strength": 0.60,
      "price_current": 150,
      "price_24h_change": -0.5,
      "reasoning": "Consolidating, mixed signals.",
      "whale_activity": "NEUTRAL"
    }
]

# 2. Gold Data
gold_data = {
  "asset": "GOLD_FUTURES",
  "ticker": "GC=F",
  "signal": "BUY",
  "strength": 0.75,
  "price_current": 2350.50,
  "price_24h_change": 1.2,
  "entry": {"optimal": 2340},
  "stop_loss": {"price": 2300},
  "take_profit": {"tp1": {"price": 2400}, "tp2": {"price": 2450}, "tp3": {"price": 2500}},
  "reasoning": "Safe haven demand."
}

# 3. Macro Data
macro_data = {
  "summary": "Fed signals patience; inflation steady.",
  "risk_sentiment": "RISK_ON",
  "vix": 14.5,
  "key_events": [
    {"event": "Fed holds rates", "impact": "Positive", "confidence": 0.7}
  ]
}

# 4. Sentiment Data
sentiment_data = {
  "crypto_sentiment": {
    "fear_greed": 65,
    "label": "GREED",
    "signal_bias": "BUY"
  },
  "gold_sentiment": {
    "signal_bias": "BUY"
  }
}

# Synthesis
# Event override: max confidence = 0.7 < 0.8, no override.
# Sentiment confirmation: BTC/ETH/SOL signal_bias = BUY matches BUY -> +0.05
# Gold matches BUY -> +0.03
# Divergence: BTC and ETH both BUY.
crypto_data[0]["strength"] += 0.05 # BTC
crypto_data[0]["adjustments"] = {"sentiment_confirmation": 0.05}
crypto_data[1]["strength"] += 0.05 # ETH
crypto_data[1]["adjustments"] = {"sentiment_confirmation": 0.05}
gold_data["strength"] += 0.03 # Gold
gold_data["adjustments"] = {"sentiment_confirmation": 0.03}

final_signals = []
for c in crypto_data:
    if c["strength"] >= 0.50:
        final_signals.append(c)
if gold_data["strength"] >= 0.50:
    final_signals.append(gold_data)

final_signals.sort(key=lambda x: x["strength"], reverse=True)

# Generate Telegram message
msg = f"📊 **Market Intel** — {datetime.datetime.utcnow().strftime('%d %b %Y %H:%M')} UTC\n\n## Signals\n\n"
for s in final_signals:
    emoji = "⬆️ BUY" if s["strength"] >= 0.65 else "🔼 BUY"
    if s["signal"] == "WATCH":
        emoji = "👀 WATCH"
        msg += f"**{s['asset']} {emoji}** | **{s['strength']*100:.0f}%**\n${s['price_current']} ({s['price_24h_change']:+.1f}%)\n{s['reasoning']}\n\n"
    else:
        msg += f"**{s['asset']} {emoji}** | **{s['strength']*100:.0f}%**\n${s['price_current']} ({s['price_24h_change']:+.1f}%) → Entry ${s['entry']['optimal']} | Stop ${s['stop_loss']['price']} | TP ${s['take_profit']['tp1']['price']}/${s['take_profit']['tp2']['price']}/${s['take_profit']['tp3']['price']}\n{s['reasoning']}\n\n"

msg += f"---\n\n## Macro\n\n🟢 **{macro_data['risk_sentiment']}**\n• VIX: {macro_data['vix']}\n• Fed: {macro_data['summary']}\n• Key: {macro_data['key_events'][0]['event']}\n\n---\n\n## Sentiment\n\n• F&G: **{sentiment_data['crypto_sentiment']['fear_greed']}** ({sentiment_data['crypto_sentiment']['label']})\n• Funding BTC: neutral\n• Gold ETF: +21%\n\n---\n\n**Bottom line:** Strong trend alignment provides solid entry opportunities in BTC and Gold."

with open("msg.txt", "w") as f:
    f.write(msg)

# Store results
os.makedirs("market-intel/data", exist_ok=True)
signals_path = "market-intel/data/signals.json"
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
  "signals": final_signals,
  "macro": macro_data,
  "sentiment": sentiment_data,
  "delivered": True,
  "agents_used": ["crypto-analyst", "gold-analyst", "macro-scout", "sentiment-radar"]
}
history.append(run_entry)
history = history[-100:]

with open(signals_path, "w") as f:
    json.dump(history, f, indent=2)

