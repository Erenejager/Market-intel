#!/usr/bin/env node
/**
 * Full Integration Test
 * Simulates agent outputs to test correlation matrix integration
 */

const fs = require('fs');
const path = require('path');

// Load modules
const { getCorrelationMatrix, checkCorrelationDivergence } = require('./correlation-matrix');

console.log('═'.repeat(70));
console.log('🧪 Full Integration Test - Correlation Matrix + Signal Synthesis');
console.log('═'.repeat(70) + '\n');

/**
 * Simulate agent results (what orchestrator would receive)
 */
const mockAgentResults = {
  crypto_analyst: [
    {
      asset: 'BTC',
      signal: 'BUY',
      strength: 0.80,
      reasoning: 'Strong bullish momentum, funding rate neutral, whale accumulation detected',
      price_current: 67103,
      price_24h_change: 2.3,
      sources: ['CoinGecko', 'Binance', 'Whale Alert']
    },
    {
      asset: 'ETH',
      signal: 'SELL',
      strength: 0.65,
      reasoning: 'Bearish divergence on RSI, negative funding rate, whale distribution',
      price_current: 1965,
      price_24h_change: -1.8,
      sources: ['CoinGecko', 'Binance']
    }
  ],
  gold_analyst: {
    asset: 'GOLD',
    signal: 'BUY',
    strength: 0.90,
    reasoning: 'Geopolitical tensions driving safe-haven flows, strong technical support',
    price_current: 5285,
    price_24h_change: 1.5,
    sources: ['Yahoo Finance', 'TradingView']
  },
  macro_scout: {
    summary: 'Risk-off environment: Iran-Israel conflict escalating, Fed holding at 3.64%',
    risk_sentiment: 'RISK_OFF',
    key_events: [
      'Iran-Israel war Day 3+',
      'Strait of Hormuz shipping disrupted',
      'Trump warns 4+ week conflict'
    ]
  },
  sentiment_radar: {
    crypto_sentiment: {
      fear_greed: 10,
      label: 'Extreme Fear',
      signal_bias: 'BUY',
      reasoning: 'Extreme fear presents contrarian opportunity'
    },
    gold_sentiment: {
      etf_flows: 'Strong Inflows',
      signal_bias: 'BUY'
    }
  }
};

/**
 * Simulate signal synthesis (simplified version of orchestrator logic)
 */
async function testSignalSynthesis() {
  console.log('📊 Step 1: Load Correlation Matrix\n');
  
  const correlationMatrix = await getCorrelationMatrix(false);
  console.log(`✅ Loaded ${correlationMatrix.correlations.length} correlations\n`);
  
  // Show key correlations
  console.log('Key Correlations:');
  correlationMatrix.correlations
    .filter(c => Math.abs(c.correlation) > 0.6)
    .forEach(c => {
      console.log(`  ${c.pair}: ${(c.correlation * 100).toFixed(1)}% (${c.interpretation})`);
    });
  console.log();
  
  console.log('─'.repeat(70));
  console.log('📊 Step 2: Process Agent Signals\n');
  
  const signals = [];
  
  // Extract crypto signals
  if (mockAgentResults.crypto_analyst) {
    for (const sig of mockAgentResults.crypto_analyst) {
      signals.push({
        asset: sig.asset,
        signal: sig.signal,
        strength: sig.strength,
        reasoning: sig.reasoning,
        metadata: {
          price_current: sig.price_current,
          price_24h_change: sig.price_24h_change
        }
      });
      console.log(`${sig.asset}: ${sig.signal} ${(sig.strength * 100).toFixed(0)}%`);
      console.log(`  → ${sig.reasoning.substring(0, 60)}...`);
    }
  }
  
  // Extract gold signal
  if (mockAgentResults.gold_analyst) {
    const sig = mockAgentResults.gold_analyst;
    signals.push({
      asset: sig.asset,
      signal: sig.signal,
      strength: sig.strength,
      reasoning: sig.reasoning,
      metadata: {
        price_current: sig.price_current,
        price_24h_change: sig.price_24h_change
      }
    });
    console.log(`${sig.asset}: ${sig.signal} ${(sig.strength * 100).toFixed(0)}%`);
    console.log(`  → ${sig.reasoning.substring(0, 60)}...`);
  }
  
  console.log();
  console.log('─'.repeat(70));
  console.log('📊 Step 3: Apply Macro/Sentiment Confluence\n');
  
  const macro = mockAgentResults.macro_scout || {};
  const sentiment = mockAgentResults.sentiment_radar || {};
  
  console.log(`Macro: ${macro.risk_sentiment || 'UNKNOWN'}`);
  console.log(`Crypto Sentiment: ${sentiment.crypto_sentiment?.label || 'UNKNOWN'}\n`);
  
  // Apply macro adjustments
  const recommendations = signals.map(sig => {
    let adjustedStrength = sig.strength;
    let adjustmentReason = [];
    
    // Macro confluence
    if (macro.risk_sentiment === 'RISK_OFF') {
      if (sig.asset === 'GOLD' && sig.signal === 'BUY') {
        adjustedStrength = Math.min(1.0, adjustedStrength + 0.05);
        adjustmentReason.push('RISK_OFF boost');
      }
      if (['BTC', 'ETH'].includes(sig.asset) && sig.signal === 'BUY') {
        adjustedStrength = Math.max(0.0, adjustedStrength - 0.05);
        adjustmentReason.push('RISK_OFF drag');
      }
    }
    
    // Sentiment confluence
    if (sentiment.crypto_sentiment && ['BTC', 'ETH'].includes(sig.asset)) {
      const cryptoSent = sentiment.crypto_sentiment;
      if (cryptoSent.signal_bias === 'BUY' && sig.signal === 'BUY') {
        adjustedStrength = Math.min(1.0, adjustedStrength + 0.05);
        adjustmentReason.push('Sentiment confluence');
      }
    }
    
    return {
      ...sig,
      strength_original: sig.strength,
      strength_adjusted: adjustedStrength,
      adjustment_reason: adjustmentReason.join(', ') || 'none'
    };
  });
  
  console.log('After Macro/Sentiment Adjustments:');
  recommendations.forEach(sig => {
    const change = ((sig.strength_adjusted - sig.strength_original) * 100).toFixed(0);
    const sign = change > 0 ? '+' : '';
    console.log(`  ${sig.asset}: ${(sig.strength_original * 100).toFixed(0)}% → ${(sig.strength_adjusted * 100).toFixed(0)}% (${sign}${change}%)`);
    if (sig.adjustment_reason !== 'none') {
      console.log(`    Reason: ${sig.adjustment_reason}`);
    }
  });
  
  console.log();
  console.log('─'.repeat(70));
  console.log('🔍 Step 4: Check Correlation Divergences (TIER 3)\n');
  
  const correlationWarnings = [];
  
  for (let i = 0; i < recommendations.length; i++) {
    for (let j = i + 1; j < recommendations.length; j++) {
      const sig1 = recommendations[i];
      const sig2 = recommendations[j];
      
      const divergence = checkCorrelationDivergence(
        sig1.asset,
        sig2.asset,
        sig1.signal,
        sig2.signal,
        correlationMatrix
      );
      
      if (divergence) {
        if (divergence.warning) {
          console.log(`⚠️  ${divergence.message}`);
          console.log(`   Severity: ${divergence.severity}, Adjustment: ${(divergence.adjustment * 100).toFixed(0)}%`);
          
          correlationWarnings.push({
            assets: [sig1.asset, sig2.asset],
            message: divergence.message,
            severity: divergence.severity
          });
          
          // Apply penalty
          recommendations[i].strength_adjusted = Math.max(0, recommendations[i].strength_adjusted + divergence.adjustment);
          recommendations[j].strength_adjusted = Math.max(0, recommendations[j].strength_adjusted + divergence.adjustment);
          
          console.log(`   ${sig1.asset}: ${(sig1.strength_adjusted * 100).toFixed(0)}% → ${(recommendations[i].strength_adjusted * 100).toFixed(0)}%`);
          console.log(`   ${sig2.asset}: ${(sig2.strength_adjusted * 100).toFixed(0)}% → ${(recommendations[j].strength_adjusted * 100).toFixed(0)}%`);
        } else {
          console.log(`✓ ${divergence.message}`);
        }
        console.log();
      }
    }
  }
  
  if (correlationWarnings.length === 0) {
    console.log('✅ No correlation divergences detected\n');
  }
  
  console.log('─'.repeat(70));
  console.log('📊 Step 5: Final Signals\n');
  
  console.log('FINAL RECOMMENDATIONS:\n');
  recommendations.forEach(sig => {
    const emoji = sig.signal === 'BUY' ? '🟢' : sig.signal === 'SELL' ? '🔴' : '🟡';
    console.log(`${emoji} ${sig.asset} ${sig.signal} ${(sig.strength_adjusted * 100).toFixed(0)}%`);
    console.log(`   Original: ${(sig.strength_original * 100).toFixed(0)}%`);
    console.log(`   After Macro: ${(sig.strength_adjusted * 100).toFixed(0)}%`);
    console.log(`   Reasoning: ${sig.reasoning.substring(0, 70)}...`);
    console.log();
  });
  
  // Summary
  console.log('─'.repeat(70));
  console.log('📋 Summary\n');
  console.log(`Total Signals: ${recommendations.length}`);
  console.log(`Correlation Warnings: ${correlationWarnings.length}`);
  console.log(`Macro Context: ${macro.summary || 'N/A'}`);
  console.log(`High Confidence (≥70%): ${recommendations.filter(s => s.strength_adjusted >= 0.7).length}`);
  console.log(`Immediate Alerts (≥70%): ${recommendations.filter(s => s.strength_adjusted >= 0.7).map(s => `${s.asset} ${s.signal}`).join(', ') || 'None'}`);
  
  console.log();
  console.log('═'.repeat(70));
  console.log('✅ Integration Test Complete!');
  console.log('═'.repeat(70));
  
  return {
    signals: recommendations,
    correlationWarnings,
    correlationMatrix
  };
}

// Run test
if (require.main === module) {
  testSignalSynthesis()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ Test failed:', err);
      process.exit(1);
    });
}

module.exports = { testSignalSynthesis, mockAgentResults };
