#!/usr/bin/env node
/**
 * Transform market-intel/data/signals.json to website-friendly format
 * Converts internal analyst format to public API schema
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../data/signals.json');
const OUTPUT_FILE = path.join(__dirname, '../data/website-data.json');

function transformData(input) {
  // Calculate price changes from previous run
  const getPriceChange = (asset, currentPrice) => {
    if (!input.previous_run) return { change_6h: 0, change_24h: 0 };
    
    const prevPrice = input.previous_run[`${asset.toLowerCase()}_price`];
    if (!prevPrice) return { change_6h: 0, change_24h: 0 };
    
    const change_6h = ((currentPrice - prevPrice) / prevPrice) * 100;
    return {
      change_6h: parseFloat(change_6h.toFixed(2)),
      change_24h: 0 // TODO: track 24h changes separately
    };
  };

  // Transform signals
  const transformedSignals = input.signals.map(s => {
    const priceChanges = getPriceChange(s.asset, s.price_current);
    
    return {
      asset: s.asset,
      signal_type: s.signal,
      strength: s.strength_adjusted || s.strength_original,
      priority: s.strength_adjusted >= 0.7 ? 'IMMEDIATE' 
              : s.strength_adjusted >= 0.5 ? 'DIGEST' 
              : 'LOG_ONLY',
      
      price_data: {
        current_price: s.price_current,
        change_6h: priceChanges.change_6h,
        change_24h: s.price_24h_change || priceChanges.change_24h
      },
      
      trade_setup: {
        entry_zone: {
          min: s.entry.range[0],
          max: s.entry.range[1],
          optimal: s.entry.optimal
        },
        stop_loss: s.stop_loss.price,
        risk_percent: Math.abs(s.stop_loss.percent),
        targets: [
          { level: "TP1", price: s.take_profit.tp1.price, rr_ratio: s.take_profit.tp1.r_to_r },
          { level: "TP2", price: s.take_profit.tp2.price, rr_ratio: s.take_profit.tp2.r_to_r },
          { level: "TP3", price: s.take_profit.tp3.price, rr_ratio: s.take_profit.tp3.r_to_r }
        ]
      },
      
      analysis: {
        thesis: s.reasoning.split('.').slice(0, 2).join('.') + '.', // First 2 sentences
        confluence_factors: Object.entries(s.adjustments)
          .filter(([k, v]) => k !== 'total' && v !== 0)
          .map(([k, v]) => `${k.replace(/_/g, ' ')} ${v > 0 ? '+' : ''}${v.toFixed(2)}`),
        catalysts: extractCatalysts(s.reasoning),
        risks: extractRisks(s)
      }
    };
  });

  // Build output structure
  return {
    metadata: {
      timestamp: input.timestamp,
      run_id: input.run_id,
      next_run: calculateNextRun(input.timestamp)
    },
    
    macro_analysis: {
      regime: input.macro.risk_sentiment,
      regime_description: input.macro.summary.split('.')[0] + '.',
      vix: input.macro.vix,
      dxy: input.macro.dxy || null,
      fed_funds_rate: input.macro.fed_funds,
      key_events: input.macro.key_events.map(e => e.event),
      market_summary: input.sentiment.composite_sentiment.interpretation
    },
    
    sentiment: {
      fear_greed_index: input.sentiment.crypto_sentiment.fear_greed,
      fear_greed_label: input.sentiment.crypto_sentiment.label,
      interpretation: input.sentiment.crypto_sentiment.interpretation,
      crypto_funding_btc: input.signals.find(s => s.asset === 'BTC')?.funding_rate || 0,
      crypto_funding_eth: input.signals.find(s => s.asset === 'ETH')?.funding_rate || 0,
      gold_etf_flows_ytd: parseInt(input.sentiment.gold_sentiment.etf_flows_ytd),
      gold_etf_flows_1y: parseInt(input.sentiment.gold_sentiment.etf_flows_1year),
      positioning_summary: input.sentiment.gold_sentiment.interpretation
    },
    
    signals: transformedSignals,
    
    market_trends: {
      dominant_theme: input.sentiment.composite_sentiment.overall.replace(/_/g, ' '),
      key_observations: extractObservations(input),
      contrarian_opportunities: extractOpportunities(input),
      risks_to_monitor: input.macro.key_events
        .filter(e => e.impact.includes('negative') || e.impact.includes('risk'))
        .map(e => e.event)
    },
    
    strategy_summary: input.delivery_summary.notes || generateStrategySummary(input)
  };
}

function calculateNextRun(currentTimestamp) {
  const current = new Date(currentTimestamp);
  current.setHours(current.getHours() + 6);
  return current.toISOString();
}

function extractCatalysts(reasoning) {
  const catalysts = [];
  const patterns = [
    /News: ['"](.+?)['"]/g,
    /BlackRock \$[\d.]+[MB]/gi,
    /\$[\d.]+[MB] (short|liquidation|accumulation)/gi
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(reasoning)) !== null) {
      catalysts.push(match[0]);
    }
  });
  
  return catalysts.length > 0 ? catalysts : ['See full analysis'];
}

function extractRisks(signal) {
  const risks = [];
  
  if (signal.adjustments.macro_vix && signal.adjustments.macro_vix < 0) {
    risks.push('Elevated VIX (RISK_OFF headwind)');
  }
  
  if (signal.whale_activity === 'UNAVAILABLE') {
    risks.push('Whale data unavailable (reduced conviction)');
  }
  
  if (signal.stop_loss.percent < -5) {
    risks.push('Wide stop loss (higher volatility)');
  }
  
  return risks.length > 0 ? risks : ['Standard swing trade risks'];
}

function extractObservations(input) {
  const obs = [];
  
  const immediateCount = input.categorized.immediate.length;
  if (immediateCount >= 3) {
    obs.push(`${immediateCount} immediate signals (≥0.7) - rare alignment`);
  }
  
  if (input.sentiment.crypto_sentiment.fear_greed < 30) {
    obs.push(`Extreme fear at ${input.sentiment.crypto_sentiment.fear_greed}`);
  }
  
  if (input.macro.vix > 25) {
    obs.push(`VIX elevated at ${input.macro.vix} (RISK_OFF environment)`);
  }
  
  return obs.length > 0 ? obs : ['Normal market conditions'];
}

function extractOpportunities(input) {
  const opps = [];
  
  if (input.sentiment.crypto_sentiment.contrarian_signal === 'STRONG_BUY') {
    opps.push('Strong contrarian buy signal from extreme fear');
  }
  
  if (input.macro.risk_sentiment === 'RISK_OFF' && input.categorized.immediate.some(s => s.asset === 'BTC')) {
    opps.push('Crypto showing resilience during RISK_OFF (potential decoupling)');
  }
  
  return opps.length > 0 ? opps : ['Monitor for setups'];
}

function generateStrategySummary(input) {
  const immediate = input.categorized.immediate;
  if (immediate.length === 0) {
    return 'No immediate signals. Monitor digest tier for potential setups.';
  }
  
  const assets = immediate.map(s => s.asset).join(', ');
  const regime = input.macro.risk_sentiment;
  
  return `${assets} presenting ${immediate.length > 1 ? 'high-conviction opportunities' : 'opportunity'}. ${regime} macro environment. See individual signals for details.`;
}

// Main execution
try {
  console.log('[Transform] Reading input:', INPUT_FILE);
  const rawData = fs.readFileSync(INPUT_FILE, 'utf8');
  const input = JSON.parse(rawData);
  
  console.log('[Transform] Transforming data...');
  const output = transformData(input);
  
  console.log('[Transform] Writing output:', OUTPUT_FILE);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');
  
  console.log('[Transform] ✅ Success! Website data ready.');
  process.exit(0);
} catch (error) {
  console.error('[Transform] ❌ Error:', error.message);
  process.exit(1);
}
