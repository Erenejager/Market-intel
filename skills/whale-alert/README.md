# Whale Alert Integration - Setup Guide

## Quick Start

### 1. Get API Key (Free)

1. Visit https://whale-alert.io
2. Sign up for free account
3. Get your API key from dashboard
4. Free tier: 10 req/min, 1,000 req/day (plenty for our needs)

### 2. Store API Key

```bash
# Create secrets directory if it doesn't exist
mkdir -p ~/.openclaw/secrets

# Save your API key
echo "YOUR_API_KEY_HERE" > ~/.openclaw/secrets/whale-alert-key.txt

# Secure it
chmod 600 ~/.openclaw/secrets/whale-alert-key.txt
```

### 3. Test It Works

```bash
cd /home/clawdbot/.openclaw/workspace/skills/whale-alert/scripts

# Test BTC whale activity (last 24h)
./whale-net-flow.sh 24 bitcoin

# Test ETH whale activity (last 12h)
./whale-net-flow.sh 12 ethereum
```

**Expected output:**
```
🐋 Fetching whale transactions for bitcoin (last 24h, min $5M)...

📊 WHALE ACTIVITY SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Blockchain: BITCOIN
Timeframe: Last 24h
Total large txs: 45
Exchange txs: 23

💰 EXCHANGE FLOWS
Deposits (to exchanges): 1234 BTC
Withdrawals (from exchanges): 3456 BTC
Net Flow: 2222 BTC

📈 SIGNAL: 🟢 STRONG_ACCUMULATION

💡 INTERPRETATION
✅ Whales are removing coins from exchanges (bullish)
   → Accumulation phase, supply shock building
```

---

## Integration with Market Intel

### Update Crypto Analyst

Add to `market-intel/agents/crypto-analyst.md` after price fetching:

```markdown
### Step 3: Fetch Whale Activity

**Run whale flow analysis:**
```bash
cd /home/clawdbot/.openclaw/workspace/skills/whale-alert/scripts
./whale-net-flow.sh 24 bitcoin
```

**Parse the output:**
- Look for "Net Flow" value
- Look for "SIGNAL" (ACCUMULATION/DISTRIBUTION/NEUTRAL)

**Add to JSON:**
```json
{
  "asset": "BTC",
  "whale_signal": "ACCUMULATION",
  "net_flow_btc": 2222,
  "confidence_boost": 0.10
}
```

**Confidence adjustments:**
- STRONG_ACCUMULATION: +0.15
- ACCUMULATION: +0.10
- NEUTRAL: +0.00
- DISTRIBUTION: -0.10
- STRONG_DISTRIBUTION: -0.15
```

---

## Usage Examples

### Get BTC whale data (last 24h)
```bash
./whale-net-flow.sh 24 bitcoin
```

### Get ETH whale data (last 12h)
```bash
./whale-net-flow.sh 12 ethereum
```

### Get SOL whale data (custom min value)
```bash
./whale-net-flow.sh 24 solana 1000000  # $1M minimum
```

---

## Interpreting Signals

### 🟢 ACCUMULATION (Bullish)

**Net flow negative** (withdrawals > deposits)
- Whales moving coins OFF exchanges
- Going to cold storage (holding)
- Reduces supply available for selling
- **Signal:** Building position, supply shock coming

**Action:** Boost buy signal confidence

---

### 🔴 DISTRIBUTION (Bearish)

**Net flow positive** (deposits > withdrawals)
- Whales moving coins TO exchanges
- Preparing to sell
- Increases available supply
- **Signal:** Dumping position, sell pressure

**Action:** Reduce buy signal confidence or AVOID

---

### 🟡 NEUTRAL

**Net flow near zero**
- No significant whale activity
- Normal trading flow
- No supply shock signal

**Action:** No confidence adjustment

---

## Troubleshooting

### Error: API key file not found
```bash
mkdir -p ~/.openclaw/secrets
echo "YOUR_API_KEY" > ~/.openclaw/secrets/whale-alert-key.txt
```

### Error: 401 Unauthorized
- Check API key is correct
- Verify at https://whale-alert.io/account

### Error: 429 Too Many Requests
- You hit the rate limit (10/min free tier)
- Wait 1 minute and try again
- Or upgrade to paid tier ($100/year)

### No transactions returned
- Try lower min_value: `./whale-net-flow.sh 24 bitcoin 1000000`
- Or longer timeframe: `./whale-net-flow.sh 48 bitcoin`

---

## Next Steps

1. ✅ Set up API key
2. ✅ Test scripts work
3. Update crypto-analyst.md to call whale script
4. Test on next market intel run
5. Measure confidence improvement
6. After 1 week, evaluate Phase 2 (CryptoQuant)

---

## Cost

**Free tier:** $0
- 10 requests/minute
- 1,000 requests/day
- Perfect for 4x daily market intel runs

**Paid tier:** $100/year (optional)
- 100 requests/minute
- Unlimited daily requests
- Only needed if scaling up

---

## Resources

- API Docs: https://docs.whale-alert.io
- Twitter: https://twitter.com/whale_alert
- Telegram: https://t.me/whale_alert_io

**Status:** ✅ Ready to use  
**Setup time:** 5 minutes  
**Integration time:** 1-2 hours  
**Expected value:** +10-15% confidence boost
