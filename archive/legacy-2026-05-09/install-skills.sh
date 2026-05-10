#!/bin/bash
# Install required skills for Market Intelligence Hub

echo "📦 Installing market intelligence skills..."

# Core market data
clawhub install crypto-market-data
clawhub install gold-trading-skill

# Sentiment
clawhub install fear-greed
clawhub install social-sentiment

# News
clawhub install news-summary

# Macro
clawhub install market-environment-analysis

echo "✅ Skills installed! Check ~/.openclaw/workspace/skills/"
