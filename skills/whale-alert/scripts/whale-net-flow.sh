#!/bin/bash
# Whale Alert - Net Flow Calculator
# Calculates BTC/ETH exchange deposits vs withdrawals

set -e

# Configuration
API_KEY_FILE="$HOME/.openclaw/secrets/whale-alert-key.txt"
HOURS_BACK=${1:-24}  # Default: last 24 hours
BLOCKCHAIN=${2:-bitcoin}  # Default: bitcoin
MIN_VALUE=${3:-5000000}  # Default: $5M minimum

# Check if API key exists
if [ ! -f "$API_KEY_FILE" ]; then
  echo "❌ Error: API key file not found at $API_KEY_FILE"
  echo "Create it with: echo 'YOUR_API_KEY' > $API_KEY_FILE"
  exit 1
fi

API_KEY=$(cat "$API_KEY_FILE")

# Calculate start timestamp
START_TIME=$(date -d "$HOURS_BACK hours ago" +%s 2>/dev/null || date -v-${HOURS_BACK}H +%s)

# Fetch transactions
URL="https://api.whale-alert.io/v1/transactions?api_key=$API_KEY&min_value=$MIN_VALUE&start=$START_TIME&blockchain=$BLOCKCHAIN"

echo "🐋 Fetching whale transactions for $BLOCKCHAIN (last ${HOURS_BACK}h, min \$$(($MIN_VALUE / 1000000))M)..."
echo ""

RESPONSE=$(curl -s "$URL")

# Check for errors
if echo "$RESPONSE" | jq -e '.result == "error"' > /dev/null 2>&1; then
  echo "❌ API Error:"
  echo "$RESPONSE" | jq -r '.message'
  exit 1
fi

# Parse and calculate
RESULT=$(echo "$RESPONSE" | jq -r '
  # Conversion factors (API returns native blockchain units)
  (if $blockchain == "bitcoin" then 100000000
   elif $blockchain == "ethereum" then 1000000000000000000
   else 1
   end) as $divisor |
  
  # Filter exchange-related transactions
  [.transactions[] | select(.from.owner_type == "exchange" or .to.owner_type == "exchange")] as $exchange_txs |
  
  # Calculate deposits (TO exchanges)
  ($exchange_txs | map(select(.to.owner_type == "exchange")) | map(.amount) | add // 0) as $deposits_raw |
  ($deposits_raw / $divisor) as $deposits |
  
  # Calculate withdrawals (FROM exchanges)
  ($exchange_txs | map(select(.from.owner_type == "exchange")) | map(.amount) | add // 0) as $withdrawals_raw |
  ($withdrawals_raw / $divisor) as $withdrawals |
  
  # Calculate net flow (withdrawals - deposits)
  ($withdrawals - $deposits) as $net_flow |
  
  # Determine signal
  (if $net_flow < -500 then "🟢 STRONG_ACCUMULATION"
   elif $net_flow < -100 then "🟢 ACCUMULATION"
   elif $net_flow > 500 then "🔴 STRONG_DISTRIBUTION"
   elif $net_flow > 100 then "🔴 DISTRIBUTION"
   else "🟡 NEUTRAL"
   end) as $signal |
  
  # Count transactions
  ($exchange_txs | length) as $tx_count |
  (.transactions | length) as $total_txs |
  
  # Format output
  "📊 WHALE ACTIVITY SUMMARY\n" +
  "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
  "Blockchain: \($blockchain | ascii_upcase)\n" +
  "Timeframe: Last \($hours)h\n" +
  "Total large txs: \($total_txs)\n" +
  "Exchange txs: \($tx_count)\n" +
  "\n" +
  "💰 EXCHANGE FLOWS\n" +
  "Deposits (to exchanges): \($deposits | tonumber | floor) \($blockchain | ascii_upcase)\n" +
  "Withdrawals (from exchanges): \($withdrawals | tonumber | floor) \($blockchain | ascii_upcase)\n" +
  "Net Flow: \($net_flow | tonumber | floor) \($blockchain | ascii_upcase)\n" +
  "\n" +
  "📈 SIGNAL: \($signal)\n" +
  "\n" +
  "💡 INTERPRETATION\n" +
  (if $net_flow < -100 then "✅ Whales are removing coins from exchanges (bullish)\n   → Accumulation phase, supply shock building"
   elif $net_flow > 100 then "⚠️ Whales are depositing to exchanges (bearish)\n   → Distribution phase, potential selling pressure"
   else "➖ Neutral flow, no strong whale activity"
   end)
' --arg blockchain "$BLOCKCHAIN" --arg hours "$HOURS_BACK"
)

echo "$RESULT"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🕐 Updated: $(date)"
