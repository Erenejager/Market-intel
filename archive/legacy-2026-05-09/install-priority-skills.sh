#!/bin/bash
# Priority skills for trading intelligence

echo "🔍 Searching for critical skills..."

# Technical Analysis (HIGHEST PRIORITY)
clawhub search "technical analysis" | head -5
clawhub search "trading indicators" | head -5
clawhub search "RSI MACD" | head -5

# On-Chain Metrics
clawhub search "on-chain" | head -5
clawhub search "whale tracker" | head -5

# Gold/Commodities Data
clawhub search "gold price api" | head -5
clawhub search "commodities data" | head -5

# Macro Data
clawhub search "treasury yields" | head -5
clawhub search "dollar index" | head -5
clawhub search "DXY" | head -5

# Economic Calendar
clawhub search "economic calendar" | head -5
clawhub search "forex calendar" | head -5

echo ""
echo "📝 Review results above and install manually:"
echo "  clawhub install <skill-name>"
