#!/usr/bin/env node
/**
 * Store market intelligence signals to ADAS-ready history file
 * Extracts critical fields, appends to signals-history.jsonl
 * Format: One JSON per line (JSONL) for easy streaming/filtering
 */

const fs = require('fs');
const path = require('path');

const SIGNALS_FILE = path.join(__dirname, '../data/signals.json');
const HISTORY_FILE = path.join(__dirname, '../data/signals-history.jsonl');

/**
 * Extract ADAS-ready signal data
 * Minimal but complete - includes all factors needed for optimization
 */
function extractADASSignal(signal, macro, sentiment, timestamp, runId) {
  // Generate unique signal ID
  const asset = signal.asset.toLowerCase().replace('_', '');
  const dateStr = timestamp.split('T')[0].replace(/-/g, '');
  const timeStr = timestamp.split('T')[1].split(':')[0] + timestamp.split('T')[1].split(':')[1];
  const id = `${asset}-${dateStr}-${timeStr}`;
  
  // Extract adjustment breakdown
  const adjustments = {
    fear: signal.adjustments?.fear_boost || 0,
    whale: signal.adjustments?.whale_unavailable || signal.adjustments?.whale || 0,
    funding: signal.adjustments?.funding || 0,
    macro: signal.adjustments?.macro_vix || signal.adjustments?.macro_gradient_vix27 || 0,
    divergence: signal.adjustments?.divergence || 0,
    sentiment: signal.adjustments?.sentiment_confluence || 0,
    news: signal.adjustments?.news_momentum || 0,
    btc_momentum: signal.adjustments?.btc_momentum || 0,
    altcoin_momentum: signal.adjustments?.altcoin_momentum || 0,
    total: signal.adjustments?.total || 0
  };
  
  // Macro context
  const macroContext = {
    vix: macro.vix,
    regime: macro.risk_sentiment,
    fed_funds: macro.fed_funds,
    dxy: macro.dxy || null,
    yield10y: macro.us10y_yield || null,
    geopolitical_event: macro.key_events?.some(e => 
      e.event.toLowerCase().includes('war') || 
      e.event.toLowerCase().includes('conflict') ||
      e.event.toLowerCase().includes('geopolitical')
    ) || false,
    event_type: macro.key_events?.length > 0 ? extractEventType(macro.key_events[0].event) : null
  };
  
  // Sentiment context
  const sentimentContext = {
    fear_greed: sentiment.crypto_sentiment?.fear_greed || null,
    fear_duration_days: sentiment.crypto_sentiment?.fear_duration_days || 0,
    funding_rate: signal.funding_rate || 0,
    funding_interp: signal.funding_interpretation || 'NEUTRAL',
    crypto_bias: sentiment.crypto_sentiment?.signal_bias || 'NEUTRAL',
    gold_bias: sentiment.gold_sentiment?.signal_bias || 'NEUTRAL',
    gold_etf_ytd: parseFloat(sentiment.gold_sentiment?.etf_flows_ytd) || 0,
    gold_etf_1y: parseFloat(sentiment.gold_sentiment?.etf_flows_1year) || 0,
    gold_positioning: sentiment.gold_sentiment?.positioning || 'NEUTRAL'
  };
  
  // Whale context (crypto only)
  const whaleContext = signal.asset !== 'GOLD_FUTURES' ? {
    status: signal.whale_activity || 'UNAVAILABLE',
    flow_24h: signal.whale_net_flow_24h || null,
    flow_7d: signal.whale_net_flow_7d || null,
    trend_aligned: signal.whale_activity === 'ACCUMULATION' && signal.signal === 'BUY' ||
                    signal.whale_activity === 'DISTRIBUTION' && signal.signal === 'SELL',
    confidence: signal.whale_activity === 'UNAVAILABLE' ? 0.0 : 0.7,
    divergence_type: extractDivergenceType(signal)
  } : null;
  
  // Build ADAS-ready signal
  return {
    id,
    ts: timestamp,
    run_id: runId,
    asset: signal.asset,
    signal: signal.signal,
    strength_original: signal.strength_original,
    strength_final: signal.strength_adjusted,
    
    // Price levels (null for HOLD/WATCH signals)
    price: signal.price_current,
    entry: signal.entry?.optimal || null,
    stop: signal.stop_loss?.price || null,
    tp1: signal.take_profit?.tp1?.price || null,
    tp2: signal.take_profit?.tp2?.price || null,
    tp3: signal.take_profit?.tp3?.price || null,
    
    // Adjustments breakdown
    adjustments,
    
    // Context
    macro: macroContext,
    sentiment: sentimentContext,
    whale: whaleContext,
    
    // Reasoning (abbreviated for ADAS)
    reasoning_short: signal.reasoning?.split('.').slice(0, 2).join('.') + '.' || '',
    
    // Outcome placeholders (to be filled by outcome tracker)
    outcome: {
      price_4h: null,
      price_24h: null,
      price_48h: null,
      result: 'PENDING',
      hit_tp1: false,
      hit_tp2: false,
      hit_tp3: false,
      hit_stop: false,
      max_gain_pct: null,
      max_loss_pct: null,
      final_pnl_pct: null
    }
  };
}

function extractEventType(eventString) {
  const lower = eventString.toLowerCase();
  if (lower.includes('war') || lower.includes('conflict')) return 'war';
  if (lower.includes('fed') || lower.includes('rate')) return 'monetary_policy';
  if (lower.includes('inflation') || lower.includes('cpi')) return 'inflation';
  if (lower.includes('oil') || lower.includes('energy')) return 'energy';
  return 'other';
}

function extractDivergenceType(signal) {
  const reasoning = signal.reasoning?.toLowerCase() || '';
  if (reasoning.includes('bullish divergence')) return 'bullish';
  if (reasoning.includes('bearish divergence')) return 'bearish';
  if (reasoning.includes('hidden divergence')) return 'hidden';
  return null;
}

/**
 * Main execution
 */
try {
  console.log('[History] Reading signals from:', SIGNALS_FILE);
  
  if (!fs.existsSync(SIGNALS_FILE)) {
    console.error('[History] ERROR: signals.json not found');
    process.exit(1);
  }
  
  const data = JSON.parse(fs.readFileSync(SIGNALS_FILE, 'utf8'));
  const { timestamp, run_id, macro, sentiment, signals } = data;
  
  if (!signals || signals.length === 0) {
    console.log('[History] No signals to store');
    process.exit(0);
  }
  
  console.log(`[History] Processing ${signals.length} signals from run ${run_id}`);
  
  // Extract ADAS-ready signals
  const adasSignals = signals.map(s => 
    extractADASSignal(s, macro, sentiment, timestamp, run_id)
  );
  
  // Append to history file (JSONL format - one JSON per line)
  const historyLines = adasSignals.map(s => JSON.stringify(s)).join('\n') + '\n';
  
  fs.appendFileSync(HISTORY_FILE, historyLines, 'utf8');
  
  console.log(`[History] ✅ Stored ${adasSignals.length} signals to ${HISTORY_FILE}`);
  
  // Show storage stats
  if (fs.existsSync(HISTORY_FILE)) {
    const stats = fs.statSync(HISTORY_FILE);
    const lines = fs.readFileSync(HISTORY_FILE, 'utf8').split('\n').filter(l => l.trim()).length;
    console.log(`[History] Total signals in history: ${lines} (${(stats.size / 1024).toFixed(1)} KB)`);
  }
  
  process.exit(0);
} catch (error) {
  console.error('[History] ERROR:', error.message);
  process.exit(1);
}
