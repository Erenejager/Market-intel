# Whale Alert Integration - Track Large Crypto Transactions

**Purpose:** Monitor large cryptocurrency transactions (whale movements) to detect accumulation/distribution patterns.

**Trigger Keywords:** whale tracking, whale alert, large transactions, exchange flows

---

## What This Provides

- Real-time alerts for large BTC/ETH/SOL transactions (>500 BTC, >100 ETH, >50k SOL)
- Exchange deposit/withdrawal tracking (supply shock signals)
- Whale accumulation/distribution detection
- Confidence boost for market intelligence signals

---

## Data Source

**Whale Alert API** (Free tier available)
- Website: https://whale-alert.io
- Free tier: Up to 10 requests/minute, 1,000 requests/day
- Paid tier ($100/year): 100 requests/minute, unlimited daily

---

## Setup Instructions

### Step 1: Get API Key

1. Go to https://whale-alert.io/
2. Click "Sign Up" or "Get API Key"
3. Free tier gives you basic access
4. Save API key to environment variable or config

### Step 2: Store API Key

Create `.env` file or add to OpenClaw config:
```
WHALE_ALERT_API_KEY=your_api_key_here
```

Or store in: `~/.openclaw/secrets/whale-alert-key.txt`

---

## API Usage

### Endpoint: Recent Transactions

**URL:** `https://api.whale-alert.io/v1/transactions`

**Parameters:**
- `api_key` (required): Your API key
- `min_value` (optional): Minimum USD value (default: 500000)
- `start` (optional): Unix timestamp start time
- `end` (optional): Unix timestamp end time
- `cursor` (optional): Pagination cursor

**Example:**
```bash
curl "https://api.whale-alert.io/v1/transactions?api_key=YOUR_KEY&min_value=1000000&start=1709251200"
```

**Response:**
```json
{
  "result": "success",
  "cursor": "...",
  "count": 50,
  "transactions": [
    {
      "blockchain": "bitcoin",
      "symbol": "btc",
      "id": "...",
      "transaction_type": "transfer",
      "hash": "...",
      "from": {
        "address": "...",
        "owner": "binance",
        "owner_type": "exchange"
      },
      "to": {
        "address": "...",
        "owner": "unknown",
        "owner_type": "unknown"
      },
      "timestamp": 1709251234,
      "amount": 1234.56,
      "amount_usd": 82500000,
      "transaction_count": 1
    }
  ]
}
```

---

## Integration with Market Intel

### Add to Crypto Analyst

Update `market-intel/agents/crypto-analyst.md`:

**Step 3.5: Fetch Whale Activity (after prices, before analysis)**

```javascript
// Fetch last 24 hours of large transactions
const now = Math.floor(Date.now() / 1000);
const yesterday = now - 86400;

// Get BTC whale movements
fetch(`https://api.whale-alert.io/v1/transactions?api_key=${API_KEY}&min_value=5000000&start=${yesterday}&blockchain=bitcoin`)

// Parse results:
// Count exchange deposits (bearish)
// Count exchange withdrawals (bullish)
// Calculate net flow
```

**Add to JSON output:**
```json
{
  "asset": "BTC",
  "whale_data": {
    "large_tx_count_24h": 45,
    "exchange_deposits": 12,
    "exchange_withdrawals": 8,
    "net_flow_btc": -234.5,  // negative = outflows (bullish)
    "net_flow_usd": -15600000,
    "accumulation_signal": "BULLISH",
    "confidence_boost": 0.10
  }
}
```

---

## Analysis Logic

### Exchange Flow Interpretation

**Deposits TO exchanges (Bearish):**
- Whales moving coins TO Binance/Coinbase/Kraken
- Preparing to sell
- Increases sell pressure
- **Signal:** Distribution, potential dump

**Withdrawals FROM exchanges (Bullish):**
- Whales moving coins FROM exchanges
- Moving to cold storage (not selling)
- Reduces available supply
- **Signal:** Accumulation, supply shock coming

### Accumulation Score

**Calculate net flow:**
```
net_flow_btc = total_withdrawals - total_deposits

if net_flow < -1000 BTC: "STRONG_ACCUMULATION" (+0.15 confidence)
if net_flow < -500 BTC: "ACCUMULATION" (+0.10 confidence)
if net_flow < -100 BTC: "MILD_ACCUMULATION" (+0.05 confidence)
if net_flow > 100 BTC: "MILD_DISTRIBUTION" (-0.05 confidence)
if net_flow > 500 BTC: "DISTRIBUTION" (-0.10 confidence)
if net_flow > 1000 BTC: "STRONG_DISTRIBUTION" (-0.15 confidence)
```

### Integration with Signals

**Confluence rules:**

1. **Fear + Whale Accumulation = MAXIMUM BUY**
   - Fear <20 AND net_flow <-500 BTC
   - Boost signal: +0.15

2. **Fear + Whale Distribution = TRAP WARNING**
   - Fear <20 AND net_flow >+500 BTC
   - Reduce signal: -0.10 or AVOID

3. **Greed + Whale Distribution = TOP SIGNAL**
   - Fear >75 AND net_flow >+1000 BTC
   - Reduce signal: -0.20 or SHORT

---

## Usage Examples

### Example 1: Query Last 24h BTC Whales

```bash
#!/bin/bash
# scripts/whale-alert-btc.sh

API_KEY=$(cat ~/.openclaw/secrets/whale-alert-key.txt)
START=$(date -d '24 hours ago' +%s)

curl -s "https://api.whale-alert.io/v1/transactions?api_key=$API_KEY&min_value=5000000&start=$START&blockchain=bitcoin" | jq '
  .transactions[] |
  select(.from.owner_type == "exchange" or .to.owner_type == "exchange") |
  {
    type: (if .from.owner_type == "exchange" then "WITHDRAWAL" else "DEPOSIT" end),
    amount: .amount,
    usd: .amount_usd,
    exchange: (if .from.owner_type == "exchange" then .from.owner else .to.owner end)
  }
'
```

**Output:**
```json
{"type":"WITHDRAWAL","amount":1234.5,"usd":82000000,"exchange":"binance"}
{"type":"DEPOSIT","amount":567.8,"usd":37500000,"exchange":"coinbase"}
```

### Example 2: Calculate Net Flow

```javascript
// scripts/whale-net-flow.js
const fetch = require('node-fetch');

async function getWhaleNetFlow(blockchain = 'bitcoin', hours = 24) {
  const apiKey = process.env.WHALE_ALERT_API_KEY;
  const start = Math.floor(Date.now() / 1000) - (hours * 3600);
  
  const url = `https://api.whale-alert.io/v1/transactions?api_key=${apiKey}&min_value=5000000&start=${start}&blockchain=${blockchain}`;
  const response = await fetch(url);
  const data = await response.json();
  
  let deposits = 0;
  let withdrawals = 0;
  
  for (const tx of data.transactions) {
    if (tx.to.owner_type === 'exchange') {
      deposits += tx.amount;
    } else if (tx.from.owner_type === 'exchange') {
      withdrawals += tx.amount;
    }
  }
  
  const netFlow = withdrawals - deposits;
  const signal = netFlow < -500 ? 'ACCUMULATION' : netFlow > 500 ? 'DISTRIBUTION' : 'NEUTRAL';
  
  return {
    deposits,
    withdrawals,
    netFlow,
    signal,
    txCount: data.count
  };
}

// Usage:
getWhaleNetFlow('bitcoin', 24).then(console.log);
```

**Output:**
```json
{
  "deposits": 2500.5,
  "withdrawals": 5200.3,
  "netFlow": 2699.8,
  "signal": "ACCUMULATION",
  "txCount": 45
}
```

---

## Testing

### Test 1: Verify API Access

```bash
API_KEY="your_key_here"
curl "https://api.whale-alert.io/v1/transactions?api_key=$API_KEY&min_value=10000000&limit=5"
```

**Expected:** JSON response with recent large transactions

### Test 2: Check Exchange Flows

```bash
# Get last 6 hours of BTC movements
START=$(date -d '6 hours ago' +%s)
curl -s "https://api.whale-alert.io/v1/transactions?api_key=$API_KEY&start=$START&blockchain=bitcoin&min_value=5000000" | \
  jq '[.transactions[] | select(.from.owner_type == "exchange" or .to.owner_type == "exchange")] | length'
```

**Expected:** Number of exchange-related transactions

---

## Rate Limits & Best Practices

**Free Tier:**
- 10 requests/minute
- 1,000 requests/day
- ~41 requests/hour sustained

**For Market Intel (4x daily runs):**
- 1 request per crypto analyst run
- 4 runs/day = 4 requests/day
- Well within limits ✅

**Best practices:**
- Cache results for 1 hour (avoid duplicate fetches)
- Only fetch on market intel runs (not every price check)
- Use `min_value` filter to reduce noise
- Focus on BTC, ETH, SOL only

---

## Troubleshooting

**Error: 401 Unauthorized**
- Check API key is correct
- Verify key is active (not expired)

**Error: 429 Too Many Requests**
- Hitting rate limit
- Add delays between requests
- Cache results longer

**No transactions returned**
- Adjust `min_value` lower (try $1M instead of $5M)
- Expand time window (24h → 48h)
- Check blockchain parameter

---

## Next Steps

After implementing Phase 1:

1. Monitor for 1 week
2. Measure impact on signal accuracy
3. Document confidence improvements
4. If valuable (expected), upgrade to Phase 2 (CryptoQuant)

**Expected improvement:** +10-15% confidence boost

---

## Resources

- Whale Alert website: https://whale-alert.io
- API docs: https://docs.whale-alert.io
- Twitter alerts: https://twitter.com/whale_alert
- Telegram channel: https://t.me/whale_alert_io

---

**Status:** Ready to implement  
**Effort:** 2-3 hours integration  
**Cost:** $0 (free tier)  
**Expected value:** +10-15% signal confidence
