#!/usr/bin/env node
/**
 * Calculate MACD (Moving Average Convergence Divergence) for a coin
 * Uses CoinGecko OHLC endpoint: /crypto/coins/{id}/ohlc?vs_currency=usd&days=30
 * Returns 4h candles → ~180 data points, enough for 12/26/9 EMA
 *
 * MACD(12,26,9):
 *   MACD line = EMA12(close) - EMA26(close)
 *   Signal line = EMA9(MACD)
 *   Histogram = MACD - Signal
 *
 * Usage: node get_coin_macd.js bitcoin [--currency=usd] [--days=30]
 */

const apiClient = require('./api_client');

async function getCoinOhlc(coinId, vsCurrency = 'usd', days = '30') {
  const params = { vs_currency: vsCurrency, days };
  return apiClient.get(`/crypto/coins/${coinId}/ohlc`, params);
}

function calculateEMA(prices, period) {
  if (prices.length < period) return null;
  const multiplier = 2 / (period + 1);
  // Start with SMA for first EMA value
  let ema = prices.slice(0, period).reduce((sum, p) => sum + p, 0) / period;
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  return ema;
}

function calculateMACD(closes) {
  if (closes.length < 35) {
    return { error: `Need at least 35 candles for MACD(12,26,9), got ${closes.length}` };
  }

  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const macdLine = ema12 - ema26;

  // Build MACD series for signal line
  const macdSeries = [];
  for (let i = 25; i < closes.length; i++) {
    const e12 = calculateEMA(closes.slice(0, i + 1), 12);
    const e26 = calculateEMA(closes.slice(0, i + 1), 26);
    if (e12 !== null && e26 !== null) {
      macdSeries.push(e12 - e26);
    }
  }

  const signalLine = calculateEMA(macdSeries, 9);
  const histogram = macdLine - signalLine;

  // Current values
  const latestClose = closes[closes.length - 1];
  const prevClose = closes[closes.length - 2];
  const macdCurrent = macdLine;
  const signalCurrent = signalLine;

  // Determine crossover
  const prevMacd = macdSeries[macdSeries.length - 2] || macdLine;
  const prevSignal = signalLine; // simplified

  // Check recent histogram trend (last 4 values)
  const histSeries = macdSeries.map((m, i) => {
    const sig = calculateEMA(macdSeries.slice(0, i + 1), 9);
    return m - sig;
  });
  const recentHists = histSeries.slice(-4);
  const histTrending = recentHists.every((h, i) => i === 0 || h >= recentHists[i - 1]);

  return {
    macd: parseFloat(macdCurrent.toFixed(2)),
    signal: parseFloat(signalCurrent.toFixed(2)),
    histogram: parseFloat(histogram.toFixed(2)),
    // Crossover detection
    crossover: (prevMacd < prevSignal && macdCurrent > signalCurrent) ? 'BULLISH' :
               (prevMacd > prevSignal && macdCurrent < signalCurrent) ? 'BEARISH' : 'NONE',
    // Histogram trend
    histogram_trending: histTrending ? 'UP' : 'DOWN',
    // Distance from signal (momentum strength)
    macd_distance_percent: signalCurrent !== 0 ? parseFloat(((macdCurrent - signalCurrent) / Math.abs(signalCurrent) * 100).toFixed(2)) : 0,
    // Latest close
    latest_close: latestClose,
    // EMA values
    ema12: parseFloat(ema12.toFixed(2)),
    ema26: parseFloat(ema26.toFixed(2)),
    // Signal interpretation
    interpretation: histogram > 0 ? 'BULLISH' : histogram < 0 ? 'BEARISH' : 'NEUTRAL',
  };
}

function calculateRSI(closes, period = 14) {
  if (closes.length < period + 1) return null;
  
  let gains = 0, losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gains += diff;
    else losses += Math.abs(diff);
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return parseFloat((100 - (100 / (1 + rs))).toFixed(2));
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log(JSON.stringify({
      usage: 'node get_coin_macd.js <coin_id> [--currency=usd] [--days=30]',
      example: 'node get_coin_macd.js bitcoin --currency=usd --days=30',
      description: 'Calculates MACD(12,26,9) from CoinGecko OHLC data'
    }, null, 2));
    process.exit(1);
  }

  const coinId = args[0];
  let vsCurrency = 'usd';
  let days = '30';

  for (const arg of args.slice(1)) {
    if (arg.startsWith('--currency=')) vsCurrency = arg.split('=')[1];
    else if (arg.startsWith('--days=')) days = arg.split('=')[1];
  }

  const ohlcData = await getCoinOhlc(coinId, vsCurrency, days);
  
  // CoinGecko returns [timestamp_ms, open, high, low, close]
  // The API returns the array directly (not wrapped in {data: ...})
  const rawData = Array.isArray(ohlcData) ? ohlcData : (ohlcData.data || []);
  if (rawData.length === 0) {
    console.log(JSON.stringify({ error: 'No OHLC data returned' }, null, 2));
    process.exit(1);
  }
  const sorted = rawData.sort((a, b) => a[0] - b[0]);
  const closes = sorted.map(c => c[4]); // close prices
  const timestamps = sorted.map(c => c[0]);

  const macd = calculateMACD(closes);
  const rsi = calculateRSI(closes, 14);

  const result = {
    coin: coinId,
    currency: vsCurrency,
    days: parseInt(days),
    candles_count: closes.length,
    oldest_candle: new Date(timestamps[0]).toISOString(),
    newest_candle: new Date(timestamps[timestamps.length - 1]).toISOString(),
    macd,
    rsi,
    // Price data
    latest_close: closes[closes.length - 1],
    price_change_7d: closes.length >= 169 ? parseFloat(((closes[closes.length - 1] - closes[closes.length - 169]) / closes[closes.length - 169] * 100).toFixed(2)) : null,
    // BB for reference (calculated but MACD is main)
    bb: null, // placeholder for BB integration
  };

  console.log(JSON.stringify(result, null, 2));
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
