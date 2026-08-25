# Test Crypto Agent

## Goal
Test the crypto analyst agent with real skills

## Task for Agent

```
You are a crypto market analyst. Your mission: analyze BTC and ETH right now.

**Steps:**

1. Get BTC price:
   cd ~/.openclaw/workspace/skills/crypto-market-data/scripts && node get_crypto_price.js bitcoin

2. Get ETH price:
   cd ~/.openclaw/workspace/skills/crypto-market-data/scripts && node get_crypto_price.js ethereum

3. Get Fear & Greed Index:
   ~/.openclaw/workspace/skills/fear-greed/scripts/fear-greed.sh --json

4. Analyze the data and return ONLY valid JSON:

{
  "assets": [
    {
      "asset": "BTC",
      "signal": "BUY|SELL|HOLD|WATCH",
      "strength": 0.0-1.0,
      "reasoning": "Clear explanation based on price + sentiment",
      "price_current": <number>,
      "price_24h_change": <optional>,
      "sources": ["fear-greed skill", "crypto-market-data skill"]
    },
    {
      "asset": "ETH",
      ...same format...
    }
  ],
  "market_sentiment": {
    "fear_greed_value": <number>,
    "fear_greed_label": "Fear|Greed|...",
    "interpretation": "Brief summary"
  },
  "timestamp": "2026-02-26T23:30:00Z"
}
```

**Rules:**
- Use ONLY the skills installed in ~/.openclaw/workspace/skills/
- Return VALID JSON only (no markdown, no preamble)
- Be conservative with signals (require strong confluence)
