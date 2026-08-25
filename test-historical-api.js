#!/usr/bin/env node
/**
 * Test Real Historical API Integration
 * Verifies CoinGecko and Yahoo Finance APIs work correctly
 */

const { execSync } = require('child_process');

/**
 * Test CoinGecko API with known historical date
 */
async function testCoinGecko() {
  console.log('🧪 Testing CoinGecko API...\n');
  
  const testDates = [
    { date: '01-03-2026', label: 'March 1, 2026 (2 days ago)' },
    { date: '28-02-2026', label: 'February 28, 2026 (3 days ago)' },
    { date: '01-02-2026', label: 'February 1, 2026 (1 month ago)' }
  ];
  
  for (const test of testDates) {
    try {
      console.log(`📊 Fetching BTC price for ${test.label}...`);
      const url = `https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${test.date}&localization=false`;
      const response = execSync(`curl -s "${url}"`, { encoding: 'utf8', timeout: 10000 });
      
      const data = JSON.parse(response);
      
      if (data.market_data?.current_price?.usd) {
        const price = data.market_data.current_price.usd;
        const marketCap = data.market_data.market_cap?.usd || 0;
        const volume = data.market_data.total_volume?.usd || 0;
        
        console.log(`  ✅ BTC: $${price.toLocaleString()}`);
        console.log(`  📈 Market Cap: $${(marketCap / 1e9).toFixed(2)}B`);
        console.log(`  💰 Volume: $${(volume / 1e9).toFixed(2)}B\n`);
      } else if (data.error) {
        console.log(`  ❌ API Error: ${data.error}\n`);
      } else {
        console.log(`  ⚠️  No price data available\n`);
      }
      
      // Rate limit delay
      await sleep(2000);
    } catch (error) {
      console.log(`  ❌ Request failed: ${error.message}\n`);
    }
  }
}

/**
 * Test Yahoo Finance API with known historical date
 */
async function testYahooFinance() {
  console.log('🧪 Testing Yahoo Finance API...\n');
  
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const period1 = Math.floor(weekAgo.getTime() / 1000);
  const period2 = Math.floor(yesterday.getTime() / 1000);
  
  const symbols = [
    { symbol: 'GC=F', name: 'Gold Futures' },
    { symbol: 'SPY', name: 'S&P 500 ETF' },
    { symbol: 'DX-Y.NYB', name: 'US Dollar Index' }
  ];
  
  for (const test of symbols) {
    try {
      console.log(`📊 Fetching ${test.name} (${test.symbol}) for last 7 days...`);
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${test.symbol}?period1=${period1}&period2=${period2}&interval=1d`;
      const response = execSync(`curl -s "${url}"`, { encoding: 'utf8', timeout: 10000 });
      
      const data = JSON.parse(response);
      
      if (data.chart?.result?.[0]?.indicators?.quote?.[0]?.close) {
        const closes = data.chart.result[0].indicators.quote[0].close.filter(c => c !== null);
        const timestamps = data.chart.result[0].timestamp;
        
        if (closes.length > 0) {
          const latestPrice = closes[closes.length - 1];
          const oldestPrice = closes[0];
          const change = ((latestPrice - oldestPrice) / oldestPrice * 100).toFixed(2);
          
          console.log(`  ✅ Latest: $${latestPrice.toFixed(2)}`);
          console.log(`  📈 7-day change: ${change > 0 ? '+' : ''}${change}%`);
          console.log(`  📅 Data points: ${closes.length}\n`);
        } else {
          console.log(`  ⚠️  No price data available\n`);
        }
      } else {
        console.log(`  ⚠️  No price data in response\n`);
      }
      
      // Rate limit delay
      await sleep(2000);
    } catch (error) {
      console.log(`  ❌ Request failed: ${error.message}\n`);
    }
  }
}

/**
 * Test percentage change calculation
 */
async function testChangeCalculation() {
  console.log('🧪 Testing Change Calculation...\n');
  
  console.log('Fetching BTC price 7 days ago and today...\n');
  
  try {
    // Get date 7 days ago
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const day = String(weekAgo.getDate()).padStart(2, '0');
    const month = String(weekAgo.getMonth() + 1).padStart(2, '0');
    const year = weekAgo.getFullYear();
    const dateStr = `${day}-${month}-${year}`;
    
    console.log(`📅 7 days ago: ${dateStr}`);
    
    const url = `https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${dateStr}&localization=false`;
    const response = execSync(`curl -s "${url}"`, { encoding: 'utf8', timeout: 10000 });
    const data = JSON.parse(response);
    
    if (data.market_data?.current_price?.usd) {
      const oldPrice = data.market_data.current_price.usd;
      console.log(`  Old Price: $${oldPrice.toLocaleString()}\n`);
      
      await sleep(2000);
      
      // Get current price
      const currentUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';
      const currentResponse = execSync(`curl -s "${currentUrl}"`, { encoding: 'utf8', timeout: 10000 });
      const currentData = JSON.parse(currentResponse);
      
      if (currentData.bitcoin?.usd) {
        const newPrice = currentData.bitcoin.usd;
        const change = ((newPrice - oldPrice) / oldPrice * 100).toFixed(2);
        
        console.log(`📅 Today:`);
        console.log(`  Current Price: $${newPrice.toLocaleString()}`);
        console.log(`  7-day Change: ${change > 0 ? '+' : ''}${change}%\n`);
        
        // Test threshold logic
        console.log('📊 Signal Evaluation Test:');
        const threshold = 2.0; // 2% threshold
        if (parseFloat(change) >= threshold) {
          console.log(`  ✅ BUY signal would be CORRECT (change ${change}% >= ${threshold}%)`);
        } else if (parseFloat(change) <= -threshold) {
          console.log(`  ✅ SELL signal would be CORRECT (change ${change}% <= -${threshold}%)`);
        } else {
          console.log(`  ❌ BUY/SELL signals would be INCORRECT (change ${change}% within ±${threshold}%)`);
          console.log(`  ✅ HOLD signal would be CORRECT`);
        }
      }
    } else {
      console.log('  ⚠️  Could not fetch historical price\n');
    }
  } catch (error) {
    console.log(`  ❌ Test failed: ${error.message}\n`);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('═'.repeat(60));
  console.log('📊 Historical API Integration Test');
  console.log('═'.repeat(60) + '\n');
  
  await testCoinGecko();
  await testYahooFinance();
  await testChangeCalculation();
  
  console.log('═'.repeat(60));
  console.log('✅ Tests Complete!');
  console.log('═'.repeat(60));
}

if (require.main === module) {
  runTests().catch(console.error);
}
