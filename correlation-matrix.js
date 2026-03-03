#!/usr/bin/env node
/**
 * Correlation Matrix Calculator
 * Calculates and caches daily correlations between assets
 * Used for cross-asset validation in market intelligence
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CACHE_PATH = path.join(__dirname, 'data', 'correlations.json');
const CACHE_TTL_HOURS = 24; // Refresh daily

/**
 * Asset pairs to calculate correlations for
 */
const ASSET_PAIRS = [
  { from: 'BTC', to: 'ETH', name: 'BTC-ETH' },
  { from: 'BTC', to: 'GOLD', name: 'BTC-GOLD' },
  { from: 'BTC', to: 'SPY', name: 'BTC-SPY' },
  { from: 'BTC', to: 'DXY', name: 'BTC-DXY' },
  { from: 'ETH', to: 'GOLD', name: 'ETH-GOLD' },
  { from: 'ETH', to: 'SPY', name: 'ETH-SPY' },
  { from: 'GOLD', to: 'SPY', name: 'GOLD-SPY' },
  { from: 'GOLD', to: 'DXY', name: 'GOLD-DXY' }
];

/**
 * Fetch historical price data using crypto-market-data skill
 */
async function fetchPriceHistory(asset, days = 90) {
  console.log(`📊 Fetching ${days}d history for ${asset}...`);
  
  try {
    // Map assets to their data source identifiers
    const assetMap = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'GOLD': 'XAU', // Gold spot (will use alternative source)
      'SPY': 'SPY',  // S&P 500 ETF
      'DXY': 'DXY'   // US Dollar Index
    };
    
    const identifier = assetMap[asset];
    
    if (asset === 'BTC' || asset === 'ETH') {
      // Use CoinGecko API via crypto-market-data skill
      const cmd = `curl -s "https://api.coingecko.com/api/v3/coins/${identifier}/market_chart?vs_currency=usd&days=${days}&interval=daily"`;
      const output = execSync(cmd, { encoding: 'utf8' });
      const data = JSON.parse(output);
      
      // Extract daily close prices
      return data.prices.map(([timestamp, price]) => ({
        date: new Date(timestamp).toISOString().split('T')[0],
        price
      }));
    } else if (asset === 'GOLD') {
      // Use metals-api.com (free tier) or alternative
      // For now, using placeholder - in production would use Yahoo Finance or similar
      console.log(`⚠️  ${asset} historical data requires external API - using placeholder`);
      return generatePlaceholderData(days, 2000); // Gold ~$2000
    } else if (asset === 'SPY' || asset === 'DXY') {
      // Use Yahoo Finance API (free)
      const endDate = Math.floor(Date.now() / 1000);
      const startDate = endDate - (days * 24 * 60 * 60);
      const cmd = `curl -s "https://query1.finance.yahoo.com/v8/finance/chart/${identifier}?period1=${startDate}&period2=${endDate}&interval=1d"`;
      
      try {
        const output = execSync(cmd, { encoding: 'utf8' });
        const data = JSON.parse(output);
        
        if (data.chart?.result?.[0]?.timestamp && data.chart?.result?.[0]?.indicators?.quote?.[0]?.close) {
          const timestamps = data.chart.result[0].timestamp;
          const closes = data.chart.result[0].indicators.quote[0].close;
          
          return timestamps.map((ts, i) => ({
            date: new Date(ts * 1000).toISOString().split('T')[0],
            price: closes[i]
          })).filter(d => d.price !== null);
        }
      } catch (e) {
        console.log(`⚠️  ${asset} fetch failed, using placeholder: ${e.message}`);
      }
      
      return generatePlaceholderData(days, asset === 'SPY' ? 450 : 105);
    }
  } catch (error) {
    console.error(`❌ Error fetching ${asset}:`, error.message);
    return generatePlaceholderData(days, 1000);
  }
}

/**
 * Generate placeholder data for testing (random walk)
 */
function generatePlaceholderData(days, startPrice) {
  const data = [];
  let price = startPrice;
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Random walk ±2%
    const change = (Math.random() - 0.5) * 0.04;
    price = price * (1 + change);
    
    data.push({
      date: date.toISOString().split('T')[0],
      price
    });
  }
  
  return data;
}

/**
 * Calculate Pearson correlation coefficient between two price series
 */
function calculateCorrelation(series1, series2) {
  if (series1.length !== series2.length || series1.length === 0) {
    throw new Error('Series must have same length and be non-empty');
  }
  
  const n = series1.length;
  
  // Calculate means
  const mean1 = series1.reduce((sum, val) => sum + val, 0) / n;
  const mean2 = series2.reduce((sum, val) => sum + val, 0) / n;
  
  // Calculate covariance and standard deviations
  let covariance = 0;
  let variance1 = 0;
  let variance2 = 0;
  
  for (let i = 0; i < n; i++) {
    const diff1 = series1[i] - mean1;
    const diff2 = series2[i] - mean2;
    
    covariance += diff1 * diff2;
    variance1 += diff1 * diff1;
    variance2 += diff2 * diff2;
  }
  
  const stdDev1 = Math.sqrt(variance1 / n);
  const stdDev2 = Math.sqrt(variance2 / n);
  
  if (stdDev1 === 0 || stdDev2 === 0) {
    return 0;
  }
  
  return covariance / (n * stdDev1 * stdDev2);
}

/**
 * Calculate percentage returns from price series
 */
function calculateReturns(prices) {
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  return returns;
}

/**
 * Align two price series by date (inner join)
 */
function alignSeries(series1, series2) {
  const map1 = new Map(series1.map(d => [d.date, d.price]));
  const map2 = new Map(series2.map(d => [d.date, d.price]));
  
  const commonDates = [...map1.keys()].filter(date => map2.has(date)).sort();
  
  return {
    dates: commonDates,
    prices1: commonDates.map(date => map1.get(date)),
    prices2: commonDates.map(date => map2.get(date))
  };
}

/**
 * Calculate correlation matrix for all asset pairs
 */
async function calculateCorrelationMatrix(days = 90) {
  console.log(`\n🔬 Calculating ${days}-day correlation matrix...\n`);
  
  // Fetch all asset price histories
  const priceData = {};
  const assets = [...new Set(ASSET_PAIRS.flatMap(p => [p.from, p.to]))];
  
  for (const asset of assets) {
    priceData[asset] = await fetchPriceHistory(asset, days);
  }
  
  // Calculate correlations for each pair
  const correlations = [];
  
  for (const pair of ASSET_PAIRS) {
    const { dates, prices1, prices2 } = alignSeries(
      priceData[pair.from],
      priceData[pair.to]
    );
    
    if (dates.length < 30) {
      console.log(`⚠️  Insufficient data for ${pair.name} (${dates.length} days)`);
      continue;
    }
    
    // Calculate returns-based correlation
    const returns1 = calculateReturns(prices1);
    const returns2 = calculateReturns(prices2);
    const correlation = calculateCorrelation(returns1, returns2);
    
    correlations.push({
      pair: pair.name,
      from: pair.from,
      to: pair.to,
      correlation: Math.round(correlation * 1000) / 1000, // 3 decimal places
      days: dates.length,
      interpretation: interpretCorrelation(correlation)
    });
    
    console.log(`✓ ${pair.name}: ${(correlation * 100).toFixed(1)}% (${pair.interpretation || interpretCorrelation(correlation)})`);
  }
  
  return {
    calculated_at: new Date().toISOString(),
    days,
    correlations,
    assets_included: assets
  };
}

/**
 * Interpret correlation strength
 */
function interpretCorrelation(corr) {
  const abs = Math.abs(corr);
  if (abs > 0.8) return 'VERY_STRONG';
  if (abs > 0.6) return 'STRONG';
  if (abs > 0.4) return 'MODERATE';
  if (abs > 0.2) return 'WEAK';
  return 'NONE';
}

/**
 * Load cached correlations if fresh enough
 */
function loadCachedCorrelations() {
  if (!fs.existsSync(CACHE_PATH)) {
    return null;
  }
  
  try {
    const cached = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
    const age = Date.now() - new Date(cached.calculated_at).getTime();
    const maxAge = CACHE_TTL_HOURS * 60 * 60 * 1000;
    
    if (age < maxAge) {
      const hoursOld = Math.round(age / (60 * 60 * 1000) * 10) / 10;
      console.log(`\n✓ Using cached correlations (${hoursOld}h old)\n`);
      return cached;
    }
  } catch (e) {
    console.log(`⚠️  Cache read error: ${e.message}`);
  }
  
  return null;
}

/**
 * Save correlations to cache
 */
function saveCachedCorrelations(data) {
  const dir = path.dirname(CACHE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2));
  console.log(`\n💾 Correlations cached to ${CACHE_PATH}\n`);
}

/**
 * Get correlation matrix (cached or fresh)
 */
async function getCorrelationMatrix(forceRefresh = false) {
  if (!forceRefresh) {
    const cached = loadCachedCorrelations();
    if (cached) return cached;
  }
  
  const matrix = await calculateCorrelationMatrix();
  saveCachedCorrelations(matrix);
  return matrix;
}

/**
 * Check for correlation divergence between two assets
 * Returns warning if signals diverge from typical correlation
 */
function checkCorrelationDivergence(asset1, asset2, signal1, signal2, matrix) {
  const pairName1 = `${asset1}-${asset2}`;
  const pairName2 = `${asset2}-${asset1}`;
  
  const corr = matrix.correlations.find(
    c => c.pair === pairName1 || c.pair === pairName2
  );
  
  if (!corr) {
    return null; // No correlation data
  }
  
  // Check for divergence
  const correlation = corr.correlation;
  const signalsSame = signal1 === signal2;
  
  if (Math.abs(correlation) > 0.6) {
    // Strong correlation expected
    if (!signalsSame) {
      return {
        warning: true,
        message: `${asset1} and ${asset2} typically ${correlation > 0 ? 'move together' : 'move opposite'} (corr: ${(correlation * 100).toFixed(0)}%), but signals diverge`,
        severity: 'HIGH',
        adjustment: -0.10 // Reduce both signals by 10%
      };
    }
  } else if (correlation < -0.6) {
    // Strong negative correlation expected
    if (signalsSame) {
      return {
        warning: true,
        message: `${asset1} and ${asset2} typically move opposite (corr: ${(correlation * 100).toFixed(0)}%), but signals agree`,
        severity: 'MODERATE',
        adjustment: -0.05
      };
    }
  }
  
  return {
    warning: false,
    message: `Signals align with ${asset1}-${asset2} correlation (${(correlation * 100).toFixed(0)}%)`,
    severity: 'NONE',
    adjustment: 0
  };
}

/**
 * CLI interface
 */
if (require.main === module) {
  const forceRefresh = process.argv.includes('--refresh');
  
  getCorrelationMatrix(forceRefresh)
    .then(matrix => {
      console.log('\n📊 Correlation Matrix Summary:\n');
      console.log(`Calculated: ${new Date(matrix.calculated_at).toLocaleString()}`);
      console.log(`Period: ${matrix.days} days\n`);
      
      console.log('Strong Correlations (|r| > 0.6):\n');
      const strong = matrix.correlations.filter(c => Math.abs(c.correlation) > 0.6);
      strong.forEach(c => {
        console.log(`  ${c.pair}: ${(c.correlation * 100).toFixed(1)}% (${c.interpretation})`);
      });
      
      console.log('\n✅ Done!');
    })
    .catch(err => {
      console.error('❌ Error:', err);
      process.exit(1);
    });
}

module.exports = {
  getCorrelationMatrix,
  checkCorrelationDivergence,
  calculateCorrelationMatrix
};
