#!/usr/bin/env node
/**
 * Calculate Bollinger Bands for a coin
 * Uses CoinGecko OHLC endpoint: /crypto/coins/{id}/ohlc?vs_currency=usd&days=30
 * Returns 4h candles → ~180 data points, enough for BB(20,2)
 *
 * Bollinger Bands(20,2):
 *   Middle = SMA20(close)
 *   Upper = Middle + 2*StdDev
 *   Lower = Middle - 2*StdDev
 *
 * Usage: node get_coin_bollinger.js bitcoin [--currency=usd] [--days=30] [--period=20] [--stddev=2]
 */

const apiClient = require('./api_client');

async function getCoinOhlc(coinId, vsCurrency = 'usd', days = '30') {
  const params = { vs_currency: vsCurrency, days };
  return apiClient.get(`/crypto/coins/${coinId}/ohlc`, params);
}

function calculateStdDev(values, mean) {
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
  return Math.sqrt(avgSquaredDiff);
}

function calculateBollingerBands(closes, period = 20, stdDevMultiplier = 2) {
  if (closes.length < period) {
    return { error: `Need at least ${period} candles for Bollinger Bands, got ${closes.length}` };
  }

  const latestCloses = closes.slice(-period);
  const sma = latestCloses.reduce((sum, v) => sum + v, 0) / period;
  const stdDev = calculateStdDev(latestCloses, sma);

  const middle = sma;
  const upper = sma + (stdDevMultiplier * stdDev);
  const lower = sma - (stdDevMultiplier * stdDev);

  // Calculate %B (position of current price within bands)
  const latestClose = closes[closes.length - 1];
  const percentB = ((latestClose - lower) / (upper - lower)) * 100;

  // Calculate BandWidth (volatility measure)
  const bandwidth = ((upper - lower) / middle) * 100;

  // Detect squeeze (low bandwidth = potential breakout)
  // Compare current bandwidth to 6-month average of bandwidths
  const allBandwidths = [];
  for (let i = period; i <= closes.length; i++) {
    const window = closes.slice(i - period, i);
    const wSma = window.reduce((s, v) => s + v, 0) / period;
    const wStdDev = calculateStdDev(window, wSma);
    allBandwidths.push(((wSma + 2 * wStdDev) - (wSma - 2 * wStdDev)) / wSma * 100);
  }
  const recentBandwidth = allBandwidths[allBandwidths.length - 1];
  const avgBandwidth = allBandwidths.reduce((s, v) => s + v, 0) / allBandwidths.length;
  const squeeze = recentBandwidth < avgBandwidth * 0.9; // 10% below average = squeeze

  // Detect touches
  const touches = {
    upper_touch: latestClose >= upper,
    lower_touch: latestClose <= lower,
    middle_touch: Math.abs(latestClose - middle) < (upper - lower) * 0.05,
  };

  // Trend direction based on slope of middle band
  const prevCloses = closes.slice(-(period * 2), -period);
  const prevSma = prevCloses.reduce((s, v) => s + v, 0) / prevCloses.length;
  const trend = middle > prevSma ? 'BULLISH' : middle < prevSma ? 'BEARISH' : 'NEUTRAL';

  return {
    period,
    stddev_multiplier: stdDevMultiplier,
    upper: parseFloat(upper.toFixed(2)),
    middle: parseFloat(middle.toFixed(2)),
    lower: parseFloat(lower.toFixed(2)),
    latest_close: latestClose,
    // Position analysis
    percent_b: parseFloat(percentB.toFixed(2)),
    bandwidth: parseFloat(bandwidth.toFixed(2)),
    bandwidth_avg: parseFloat(avgBandwidth.toFixed(2)),
    squeeze,
    squeeze_percent: parseFloat(((avgBandwidth - recentBandwidth) / avgBandwidth * 100).toFixed(1)),
    // Touch detection
    touches,
    // Trend
    trend,
    // Signal interpretation
    interpretation: touches.lower_touch ? 'OVERSOLD (at lower band)' :
                   touches.upper_touch ? 'OVERBOUGHT (at upper band)' :
                   squeeze ? 'SQUEEZE (breakout imminent)' :
                   percentB > 70 ? 'NEAR UPPER BAND' :
                   percentB < 30 ? 'NEAR LOWER BAND' :
                   'MIDDLE_RANGE',
  };
}

function calculateSMA(prices, period) {
  if (prices.length < period) return null;
  return prices.slice(-period).reduce((s, v) => s + v, 0) / period;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log(JSON.stringify({
      usage: 'node get_coin_bollinger.js <coin_id> [--currency=usd] [--days=30] [--period=20] [--stddev=2]',
      example: 'node get_coin_bollinger.js bitcoin --currency=usd --days=30 --period=20 --stddev=2',
      description: 'Calculates Bollinger Bands(20,2) from CoinGecko OHLC data'
    }, null, 2));
    process.exit(1);
  }

  const coinId = args[0];
  let vsCurrency = 'usd';
  let days = '30';
  let period = 20;
  let stdDevMultiplier = 2;

  for (const arg of args.slice(1)) {
    if (arg.startsWith('--currency=')) vsCurrency = arg.split('=')[1];
    else if (arg.startsWith('--days=')) days = arg.split('=')[1];
    else if (arg.startsWith('--period=')) period = parseInt(arg.split('=')[1]);
    else if (arg.startsWith('--stddev=')) stdDevMultiplier = parseInt(arg.split('=')[1]);
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
  const closes = sorted.map(c => c[4]);
  const timestamps = sorted.map(c => c[0]);

  const bb = calculateBollingerBands(closes, period, stdDevMultiplier);

  // Also calculate SMA 50 and 200 for trend context
  const sma50 = calculateSMA(closes, 50);
  const sma200 = calculateSMA(closes, 200);

  const result = {
    coin: coinId,
    currency: vsCurrency,
    days: parseInt(days),
    candles_count: closes.length,
    oldest_candle: new Date(timestamps[0]).toISOString(),
    newest_candle: new Date(timestamps[timestamps.length - 1]).toISOString(),
    bollinger_bands: bb,
    // Additional context
    context: {
      sma50: sma50 ? parseFloat(sma50.toFixed(2)) : null,
      sma200: sma200 ? parseFloat(sma200.toFixed(2)) : null,
      current_vs_sma50: sma50 ? parseFloat(((closes[closes.length - 1] - sma50) / sma50 * 100).toFixed(2)) : null,
      current_vs_sma200: sma200 ? parseFloat(((closes[closes.length - 1] - sma200) / sma200 * 100).toFixed(2)) : null,
    },
    latest_close: closes[closes.length - 1],
  };

  console.log(JSON.stringify(result, null, 2));
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
