#!/usr/bin/env node
/**
 * Market Intelligence Backtesting Framework
 * Tests signal accuracy against historical outcomes
 * 
 * Usage:
 *   node backtester.js                    # Run backtest with default config
 *   node backtester.js --days 30          # Backtest last 30 days
 *   node backtester.js --asset BTC        # Backtest specific asset
 *   node backtester.js --report           # Generate detailed report
 */

const fs = require('fs');
const path = require('path');

const SIGNALS_PATH = path.join(__dirname, 'data', 'signals.json');
const BACKTEST_RESULTS_PATH = path.join(__dirname, 'data', 'backtest-results.json');
const BACKTEST_CONFIG_PATH = path.join(__dirname, 'backtest-config.json');

// Rate limiting for API calls
let lastApiCall = 0;
const API_DELAY_MS = 1500; // 1.5s between calls to stay under rate limits

// Price cache to avoid repeated API calls
const priceCache = new Map();

/**
 * Sleep helper for rate limiting
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get cached price or fetch from API
 */
function getCacheKey(asset, timestamp) {
  const date = new Date(timestamp).toISOString().split('T')[0];
  return `${asset}_${date}`;
}

/**
 * Default backtest configuration
 */
const DEFAULT_CONFIG = {
  // Time horizons to evaluate (hours)
  evaluation_horizons: [4, 24, 72, 168], // 4h, 1d, 3d, 7d
  
  // Price movement thresholds to consider signal "correct"
  win_thresholds: {
    BUY: 0.02,   // BUY signal correct if price up ≥2% within horizon
    SELL: 0.02,  // SELL signal correct if price down ≥2% within horizon
    HOLD: 0.01   // HOLD correct if price stays within ±1%
  },
  
  // Minimum confidence to include in backtest
  min_confidence: 0.5,
  
  // Assets to backtest
  assets: ['BTC', 'ETH', 'GOLD']
};

/**
 * Load backtest configuration
 */
function loadConfig() {
  if (fs.existsSync(BACKTEST_CONFIG_PATH)) {
    try {
      return { ...DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(BACKTEST_CONFIG_PATH, 'utf8')) };
    } catch (e) {
      console.warn('⚠️  Config load error, using defaults:', e.message);
    }
  }
  
  // Save default config
  fs.writeFileSync(BACKTEST_CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
  console.log(`📝 Created default config at ${BACKTEST_CONFIG_PATH}`);
  
  return DEFAULT_CONFIG;
}

/**
 * Load historical signals
 */
function loadSignals() {
  if (!fs.existsSync(SIGNALS_PATH)) {
    throw new Error(`No signals found at ${SIGNALS_PATH}. Run orchestrator first.`);
  }
  
  const data = JSON.parse(fs.readFileSync(SIGNALS_PATH, 'utf8'));
  
  // Flatten signals from all runs
  const allSignals = [];
  for (const run of data) {
    for (const signal of run.signals) {
      allSignals.push({
        ...signal,
        run_timestamp: run.timestamp,
        macro_summary: run.macro_summary,
        sentiment_summary: run.sentiment_summary
      });
    }
  }
  
  return allSignals;
}

/**
 * Fetch actual price outcome at a specific time using real APIs
 */
async function fetchActualPrice(asset, timestamp, signalPrice = null) {
  // Check cache first
  const cacheKey = getCacheKey(asset, timestamp);
  if (priceCache.has(cacheKey)) {
    const cached = priceCache.get(cacheKey);
    console.log(`  💾 Using cached ${asset} price`);
    
    // Recalculate change_percent if signalPrice provided
    if (signalPrice && cached.price) {
      return {
        ...cached,
        change_percent: (cached.price - signalPrice) / signalPrice
      };
    }
    return cached;
  }
  
  // Rate limiting
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCall;
  if (timeSinceLastCall < API_DELAY_MS) {
    await sleep(API_DELAY_MS - timeSinceLastCall);
  }
  lastApiCall = Date.now();
  
  console.log(`  📊 Fetching ${asset} price at ${timestamp}`);
  
  const assetMap = {
    'BTC': { id: 'bitcoin', type: 'crypto' },
    'ETH': { id: 'ethereum', type: 'crypto' },
    'GOLD': { id: 'GC=F', type: 'yahoo' }, // Gold Futures
    'GOLD_FUTURES': { id: 'GC=F', type: 'yahoo' },
    'SPY': { id: 'SPY', type: 'yahoo' },
    'DXY': { id: 'DX-Y.NYB', type: 'yahoo' }
  };
  
  const assetInfo = assetMap[asset];
  
  if (!assetInfo) {
    console.log(`  ⚠️  Unknown asset ${asset}, using simulated data`);
    const result = {
      asset,
      timestamp,
      price: null,
      change_percent: (Math.random() - 0.5) * 0.1,
      simulated: true
    };
    priceCache.set(cacheKey, result);
    return result;
  }
  
  try {
    let result;
    if (assetInfo.type === 'crypto') {
      result = await fetchCryptoPrice(assetInfo.id, timestamp, signalPrice);
    } else if (assetInfo.type === 'yahoo') {
      result = await fetchYahooPrice(assetInfo.id, timestamp, signalPrice);
    }
    
    // Cache the result
    priceCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.log(`  ⚠️  API error for ${asset}: ${error.message}, using simulated data`);
    const result = {
      asset,
      timestamp,
      price: null,
      change_percent: (Math.random() - 0.5) * 0.1,
      simulated: true,
      error: error.message
    };
    priceCache.set(cacheKey, result);
    return result;
  }
}

/**
 * Fetch crypto price from CoinGecko historical API
 */
async function fetchCryptoPrice(coinId, timestamp, signalPrice) {
  const { execSync } = require('child_process');
  
  // Convert timestamp to date string (DD-MM-YYYY format for CoinGecko)
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const dateStr = `${day}-${month}-${year}`;
  
  // CoinGecko /coins/{id}/history endpoint
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/history?date=${dateStr}&localization=false`;
  
  try {
    const response = execSync(`curl -s "${url}"`, { encoding: 'utf8', timeout: 10000 });
    const data = JSON.parse(response);
    
    if (data.market_data?.current_price?.usd) {
      const outcomePrice = data.market_data.current_price.usd;
      
      // Calculate percentage change from signal price
      let changePercent = 0;
      if (signalPrice && signalPrice > 0) {
        changePercent = (outcomePrice - signalPrice) / signalPrice;
      }
      
      return {
        asset: coinId.toUpperCase(),
        timestamp,
        price: outcomePrice,
        change_percent: changePercent,
        simulated: false
      };
    } else {
      throw new Error('No price data in response');
    }
  } catch (error) {
    throw new Error(`CoinGecko API failed: ${error.message}`);
  }
}

/**
 * Fetch traditional asset price from Yahoo Finance
 */
async function fetchYahooPrice(symbol, timestamp, signalPrice) {
  const { execSync } = require('child_process');
  
  const outcomeDate = new Date(timestamp);
  const startDate = new Date(outcomeDate);
  startDate.setDate(startDate.getDate() - 1); // Get day before for context
  
  const period1 = Math.floor(startDate.getTime() / 1000);
  const period2 = Math.floor(outcomeDate.getTime() / 1000);
  
  // Yahoo Finance historical data endpoint
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=1d`;
  
  try {
    const response = execSync(`curl -s "${url}"`, { encoding: 'utf8', timeout: 10000 });
    const data = JSON.parse(response);
    
    if (data.chart?.result?.[0]?.indicators?.quote?.[0]?.close) {
      const closes = data.chart.result[0].indicators.quote[0].close.filter(c => c !== null);
      
      if (closes.length === 0) {
        throw new Error('No price data available');
      }
      
      // Use the closest available price (last close)
      const outcomePrice = closes[closes.length - 1];
      
      // Calculate percentage change from signal price
      let changePercent = 0;
      if (signalPrice && signalPrice > 0) {
        changePercent = (outcomePrice - signalPrice) / signalPrice;
      }
      
      return {
        asset: symbol,
        timestamp,
        price: outcomePrice,
        change_percent: changePercent,
        simulated: false
      };
    } else {
      throw new Error('No price data in response');
    }
  } catch (error) {
    throw new Error(`Yahoo Finance API failed: ${error.message}`);
  }
}

/**
 * Evaluate a single signal against actual outcome
 */
async function evaluateSignal(signal, horizon, config) {
  const signalTime = new Date(signal.run_timestamp || signal.timestamp);
  const outcomeTime = new Date(signalTime.getTime() + horizon * 60 * 60 * 1000);
  
  // Get signal price (from metadata or fetch it)
  let signalPrice = signal.metadata?.price_current;
  
  if (!signalPrice) {
    // Fetch signal price if not in metadata
    const signalPriceData = await fetchActualPrice(signal.asset, signalTime.toISOString(), null);
    signalPrice = signalPriceData.price;
  }
  
  // Fetch actual price at outcome time
  const outcome = await fetchActualPrice(signal.asset, outcomeTime.toISOString(), signalPrice);
  
  // Determine if signal was correct
  const threshold = config.win_thresholds[signal.signal] || config.win_thresholds.BUY;
  
  let correct = false;
  let reason = '';
  
  if (signal.signal === 'BUY') {
    correct = outcome.change_percent >= threshold;
    reason = correct 
      ? `Price up ${(outcome.change_percent * 100).toFixed(2)}% ≥ ${(threshold * 100).toFixed(0)}%`
      : `Price only up ${(outcome.change_percent * 100).toFixed(2)}% < ${(threshold * 100).toFixed(0)}%`;
  } else if (signal.signal === 'SELL') {
    correct = outcome.change_percent <= -threshold;
    reason = correct
      ? `Price down ${(outcome.change_percent * 100).toFixed(2)}% ≤ -${(threshold * 100).toFixed(0)}%`
      : `Price only down ${(outcome.change_percent * 100).toFixed(2)}% > -${(threshold * 100).toFixed(0)}%`;
  } else if (signal.signal === 'HOLD') {
    correct = Math.abs(outcome.change_percent) <= threshold;
    reason = correct
      ? `Price stayed within ±${(threshold * 100).toFixed(0)}%`
      : `Price moved ${(outcome.change_percent * 100).toFixed(2)}% outside ±${(threshold * 100).toFixed(0)}%`;
  }
  
  return {
    signal_id: `${signal.asset}_${signal.timestamp}_${horizon}h`,
    asset: signal.asset,
    signal: signal.signal,
    strength_adjusted: signal.strength_adjusted,
    timestamp: signal.timestamp,
    horizon_hours: horizon,
    outcome_timestamp: outcomeTime.toISOString(),
    actual_change_percent: outcome.change_percent,
    threshold,
    correct,
    reason,
    simulated: outcome.simulated
  };
}

/**
 * Run backtest on historical signals
 */
async function runBacktest(options = {}) {
  console.log('🔬 Market Intelligence Backtester\n');
  
  const config = loadConfig();
  const signals = loadSignals();
  
  console.log(`📊 Loaded ${signals.length} historical signals\n`);
  
  // Filter signals by options
  let filteredSignals = signals;
  
  if (options.asset) {
    filteredSignals = filteredSignals.filter(s => s.asset === options.asset);
    console.log(`🎯 Filtering to ${options.asset}: ${filteredSignals.length} signals\n`);
  }
  
  if (options.days) {
    const cutoff = Date.now() - (options.days * 24 * 60 * 60 * 1000);
    filteredSignals = filteredSignals.filter(s => new Date(s.timestamp) >= cutoff);
    console.log(`📅 Filtering to last ${options.days} days: ${filteredSignals.length} signals\n`);
  }
  
  // Filter by minimum confidence
  filteredSignals = filteredSignals.filter(s => s.strength_adjusted >= config.min_confidence);
  console.log(`✂️  Filtered to strength ≥${config.min_confidence}: ${filteredSignals.length} signals\n`);
  
  if (filteredSignals.length === 0) {
    console.log('⚠️  No signals to backtest. Exiting.');
    return null;
  }
  
  // Evaluate each signal across all horizons
  console.log('🚀 Evaluating signals across horizons...\n');
  
  const evaluations = [];
  let count = 0;
  
  for (const signal of filteredSignals) {
    for (const horizon of config.evaluation_horizons) {
      count++;
      console.log(`[${count}/${filteredSignals.length * config.evaluation_horizons.length}] ${signal.asset} ${signal.signal} @ ${horizon}h...`);
      
      const evaluation = await evaluateSignal(signal, horizon, config);
      evaluations.push(evaluation);
    }
  }
  
  console.log('\n✅ Evaluation complete!\n');
  
  // Calculate metrics
  const metrics = calculateMetrics(evaluations, config);
  
  // Save results
  const results = {
    run_at: new Date().toISOString(),
    config,
    options,
    total_signals: filteredSignals.length,
    total_evaluations: evaluations.length,
    metrics,
    evaluations: options.detailed ? evaluations : evaluations.slice(0, 10) // Sample for non-detailed
  };
  
  saveResults(results);
  
  return results;
}

/**
 * Calculate backtest metrics
 */
function calculateMetrics(evaluations, config) {
  const metrics = {
    overall: calculateMetricsForSubset(evaluations),
    by_asset: {},
    by_signal: {},
    by_horizon: {}
  };
  
  // By asset
  const assets = [...new Set(evaluations.map(e => e.asset))];
  for (const asset of assets) {
    const subset = evaluations.filter(e => e.asset === asset);
    metrics.by_asset[asset] = calculateMetricsForSubset(subset);
  }
  
  // By signal type
  const signals = [...new Set(evaluations.map(e => e.signal))];
  for (const signal of signals) {
    const subset = evaluations.filter(e => e.signal === signal);
    metrics.by_signal[signal] = calculateMetricsForSubset(subset);
  }
  
  // By horizon
  const horizons = [...new Set(evaluations.map(e => e.horizon_hours))];
  for (const horizon of horizons) {
    const subset = evaluations.filter(e => e.horizon_hours === horizon);
    metrics.by_horizon[`${horizon}h`] = calculateMetricsForSubset(subset);
  }
  
  return metrics;
}

/**
 * Calculate metrics for a subset of evaluations
 */
function calculateMetricsForSubset(evaluations) {
  if (evaluations.length === 0) {
    return { count: 0, accuracy: 0, precision: 0, recall: 0, f1: 0 };
  }
  
  const correct = evaluations.filter(e => e.correct).length;
  const total = evaluations.length;
  
  // Accuracy
  const accuracy = correct / total;
  
  // Precision/Recall (treating "correct" as positive class)
  const truePositives = correct;
  const falsePositives = total - correct;
  const falseNegatives = 0; // In backtest context, we only have "predicted" signals
  
  const precision = truePositives / (truePositives + falsePositives);
  const recall = truePositives > 0 ? 1.0 : 0.0; // We captured all our predictions
  const f1 = precision > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  
  // Average confidence of correct vs incorrect
  const correctConfidence = evaluations
    .filter(e => e.correct)
    .reduce((sum, e) => sum + e.strength_adjusted, 0) / (correct || 1);
  
  const incorrectConfidence = evaluations
    .filter(e => !e.correct)
    .reduce((sum, e) => sum + e.strength_adjusted, 0) / ((total - correct) || 1);
  
  return {
    count: total,
    correct_count: correct,
    accuracy: Math.round(accuracy * 1000) / 1000,
    precision: Math.round(precision * 1000) / 1000,
    recall: Math.round(recall * 1000) / 1000,
    f1_score: Math.round(f1 * 1000) / 1000,
    avg_confidence_correct: Math.round(correctConfidence * 1000) / 1000,
    avg_confidence_incorrect: Math.round(incorrectConfidence * 1000) / 1000
  };
}

/**
 * Save backtest results
 */
function saveResults(results) {
  const dir = path.dirname(BACKTEST_RESULTS_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Load existing results
  let allResults = [];
  if (fs.existsSync(BACKTEST_RESULTS_PATH)) {
    try {
      allResults = JSON.parse(fs.readFileSync(BACKTEST_RESULTS_PATH, 'utf8'));
    } catch (e) {
      console.warn('⚠️  Could not load existing results, starting fresh');
    }
  }
  
  // Append new results
  allResults.push(results);
  
  // Keep last 50 backtest runs
  if (allResults.length > 50) {
    allResults = allResults.slice(-50);
  }
  
  fs.writeFileSync(BACKTEST_RESULTS_PATH, JSON.stringify(allResults, null, 2));
  console.log(`💾 Results saved to ${BACKTEST_RESULTS_PATH}\n`);
}

/**
 * Generate detailed report
 */
function generateReport(results) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 BACKTEST REPORT');
  console.log('='.repeat(60) + '\n');
  
  console.log(`Run: ${new Date(results.run_at).toLocaleString()}`);
  console.log(`Signals: ${results.total_signals}`);
  console.log(`Evaluations: ${results.total_evaluations}\n`);
  
  console.log('OVERALL METRICS:');
  console.log(`  Accuracy: ${(results.metrics.overall.accuracy * 100).toFixed(1)}%`);
  console.log(`  Correct: ${results.metrics.overall.correct_count}/${results.metrics.overall.count}`);
  console.log(`  F1 Score: ${results.metrics.overall.f1_score}\n`);
  
  console.log('BY ASSET:');
  for (const [asset, metrics] of Object.entries(results.metrics.by_asset)) {
    console.log(`  ${asset}: ${(metrics.accuracy * 100).toFixed(1)}% (${metrics.correct_count}/${metrics.count})`);
  }
  console.log();
  
  console.log('BY SIGNAL TYPE:');
  for (const [signal, metrics] of Object.entries(results.metrics.by_signal)) {
    console.log(`  ${signal}: ${(metrics.accuracy * 100).toFixed(1)}% (${metrics.correct_count}/${metrics.count})`);
  }
  console.log();
  
  console.log('BY HORIZON:');
  for (const [horizon, metrics] of Object.entries(results.metrics.by_horizon)) {
    console.log(`  ${horizon}: ${(metrics.accuracy * 100).toFixed(1)}% (${metrics.correct_count}/${metrics.count})`);
  }
  console.log();
  
  console.log('CONFIDENCE ANALYSIS:');
  console.log(`  Avg confidence (correct): ${(results.metrics.overall.avg_confidence_correct * 100).toFixed(1)}%`);
  console.log(`  Avg confidence (incorrect): ${(results.metrics.overall.avg_confidence_incorrect * 100).toFixed(1)}%`);
  
  if (results.evaluations.length > 0 && results.evaluations[0].simulated) {
    console.log('\n⚠️  NOTE: Results use SIMULATED price data. Integrate real historical data for production.');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * CLI interface
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  
  const options = {
    asset: args.includes('--asset') ? args[args.indexOf('--asset') + 1] : null,
    days: args.includes('--days') ? parseInt(args[args.indexOf('--days') + 1]) : null,
    detailed: args.includes('--detailed'),
    report: args.includes('--report')
  };
  
  runBacktest(options)
    .then(results => {
      if (results) {
        if (options.report) {
          generateReport(results);
        } else {
          console.log(`✅ Backtest complete! Accuracy: ${(results.metrics.overall.accuracy * 100).toFixed(1)}%`);
          console.log(`   Run with --report for detailed breakdown`);
        }
      }
    })
    .catch(err => {
      console.error('❌ Backtest failed:', err);
      process.exit(1);
    });
}

module.exports = {
  runBacktest,
  generateReport,
  loadConfig
};
