#!/usr/bin/env node
/**
 * Backpack Snapshot Collector (Public REST)
 *
 * Collects deterministic market data for perps markets on Backpack:
 * - ticker (24h stats + last)
 * - openInterest
 * - fundingRates (most recent)
 * - klines 1h and 4h (OHLCV)
 *
 * Also computes simple derived metrics:
 * - ATR(14) on 1h and 4h
 * - MA20/MA50 trend on 4h
 * - naive support/resistance from recent highs/lows
 *
 * Fallback behavior:
 * - If Backpack ticker fails for an asset, try CoinGecko spot price as last-resort
 * - Mark snapshot.data_quality as PARTIAL/DEGRADED
 */

const fs = require('fs');
const path = require('path');

const OUT_PATH = path.join(__dirname, '..', 'data', 'backpack-snapshot.json');
const OUT_LITE_PATH = path.join(__dirname, '..', 'data', 'backpack-snapshot-lite.json');

const BACKPACK_BASE = 'https://api.backpack.exchange/api/v1';

const SYMBOLS = {
  BTC: 'BTC_USDC_PERP',
  ETH: 'ETH_USDC_PERP',
  SOL: 'SOL_USDC_PERP',
  PAXG: 'PAXG_USDC_PERP',
};

const COINGECKO_IDS = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  PAXG: 'pax-gold',
};

async function jget(url) {
  const res = await fetch(url, {
    headers: {
      'user-agent': 'openclaw-market-intel/1.0',
      'accept': 'application/json,text/plain,*/*',
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText} :: ${text.slice(0, 200)}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  // Backpack /time is text/plain
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function toNum(x) {
  if (x === null || x === undefined) return null;
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

function computeATR(candles, period = 14) {
  // candles: [{open,high,low,close,start,end,...}] numbers
  if (!candles || candles.length < period + 1) return null;
  const trs = [];
  for (let i = 1; i < candles.length; i++) {
    const c = candles[i];
    const p = candles[i - 1];
    const high = c.high;
    const low = c.low;
    const prevClose = p.close;
    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose),
    );
    trs.push(tr);
  }
  const recent = trs.slice(-period);
  const atr = recent.reduce((a, b) => a + b, 0) / recent.length;
  return atr;
}

function computeSMA(values, period) {
  if (values.length < period) return null;
  const slice = values.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

function pickLevels(values, count, mode) {
  // mode: 'support' => lowest values, 'resistance' => highest values
  const sorted = [...values].filter(v => Number.isFinite(v)).sort((a, b) => a - b);
  if (sorted.length === 0) return [];
  const picked = [];
  const step = Math.max(1, Math.floor(sorted.length / (count * 3)));

  if (mode === 'support') {
    for (let i = 0; i < sorted.length && picked.length < count; i += step) {
      const v = sorted[i];
      if (!picked.some(p => Math.abs(p - v) / v < 0.003)) picked.push(v);
    }
  } else {
    for (let i = sorted.length - 1; i >= 0 && picked.length < count; i -= step) {
      const v = sorted[i];
      if (!picked.some(p => Math.abs(p - v) / v < 0.003)) picked.push(v);
    }
    picked.sort((a, b) => a - b);
  }

  return picked;
}

function normalizeCandles(raw) {
  // raw candle fields are strings
  return raw.map(c => ({
    start: c.start,
    end: c.end,
    open: toNum(c.open),
    high: toNum(c.high),
    low: toNum(c.low),
    close: toNum(c.close),
    volume: toNum(c.volume),
    quoteVolume: toNum(c.quoteVolume ?? c.quote_volume),
    trades: toNum(c.trades),
  })).filter(c => c.open !== null && c.high !== null && c.low !== null && c.close !== null);
}

async function getBackpackKlines(symbol, interval, startTimeSeconds) {
  const url = `${BACKPACK_BASE}/klines?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&startTime=${startTimeSeconds}`;
  const raw = await jget(url);
  return normalizeCandles(raw);
}

async function getCoinGeckoPrice(ids) {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids.join(','))}&vs_currencies=usd`;
  const data = await jget(url);
  return data;
}

async function main() {
  const nowMsRaw = await jget(`${BACKPACK_BASE}/time`);
  const nowMs = typeof nowMsRaw === 'string' ? Number(nowMsRaw) : Number(nowMsRaw);
  const nowSec = Math.floor(nowMs / 1000);

  const snapshot = {
    timestamp_utc: new Date(nowMs).toISOString(),
    source: 'backpack',
    data_quality: 'OK',
    degraded_reasons: [],
    markets: {},
  };

  const cgFallbackNeeded = [];

  for (const [asset, symbol] of Object.entries(SYMBOLS)) {
    const entry = {
      asset,
      symbol,
      ticker: null,
      open_interest: null,
      funding: null,
      klines_1h: null,
      klines_4h: null,
      derived: {},
      errors: [],
    };

    // ticker
    try {
      entry.ticker = await jget(`${BACKPACK_BASE}/ticker?symbol=${encodeURIComponent(symbol)}`);
    } catch (e) {
      entry.errors.push(`ticker: ${e.message}`);
      snapshot.data_quality = snapshot.data_quality === 'OK' ? 'PARTIAL' : snapshot.data_quality;
      cgFallbackNeeded.push(asset);
    }

    // open interest
    try {
      const oi = await jget(`${BACKPACK_BASE}/openInterest?symbol=${encodeURIComponent(symbol)}`);
      entry.open_interest = Array.isArray(oi) ? oi[0] : oi;
    } catch (e) {
      entry.errors.push(`openInterest: ${e.message}`);
      snapshot.data_quality = snapshot.data_quality === 'OK' ? 'PARTIAL' : snapshot.data_quality;
    }

    // funding rates (take most recent)
    try {
      const fr = await jget(`${BACKPACK_BASE}/fundingRates?symbol=${encodeURIComponent(symbol)}`);
      entry.funding = Array.isArray(fr) ? fr[0] : fr;
    } catch (e) {
      entry.errors.push(`fundingRates: ${e.message}`);
      snapshot.data_quality = snapshot.data_quality === 'OK' ? 'PARTIAL' : snapshot.data_quality;
    }

    // klines
    try {
      const start1h = nowSec - 10 * 24 * 3600; // 10d
      const start4h = nowSec - 60 * 24 * 3600; // 60d
      entry.klines_1h = await getBackpackKlines(symbol, '1h', start1h);
      entry.klines_4h = await getBackpackKlines(symbol, '4h', start4h);

      const atr1h = computeATR(entry.klines_1h, 14);
      const atr4h = computeATR(entry.klines_4h, 14);

      const closes4h = entry.klines_4h.map(c => c.close);
      const ma20_4h = computeSMA(closes4h, 20);
      const ma50_4h = computeSMA(closes4h, 50);

      const lows1h = entry.klines_1h.slice(-120).map(c => c.low);
      const highs1h = entry.klines_1h.slice(-120).map(c => c.high);

      entry.derived = {
        atr_14_1h: atr1h,
        atr_14_4h: atr4h,
        ma20_4h,
        ma50_4h,
        trend_4h: (ma20_4h && ma50_4h) ? (ma20_4h > ma50_4h ? 'UP' : ma20_4h < ma50_4h ? 'DOWN' : 'FLAT') : null,
        levels_1h: {
          support: pickLevels(lows1h, 3, 'support'),
          resistance: pickLevels(highs1h, 3, 'resistance'),
        },
      };
    } catch (e) {
      entry.errors.push(`klines: ${e.message}`);
      snapshot.data_quality = 'DEGRADED';
      snapshot.degraded_reasons.push(`${asset}: klines unavailable`);
    }

    snapshot.markets[asset] = entry;
  }

  // CoinGecko fallback only for last price if ticker missing
  if (cgFallbackNeeded.length > 0) {
    try {
      const ids = cgFallbackNeeded.map(a => COINGECKO_IDS[a]).filter(Boolean);
      const cg = await getCoinGeckoPrice(ids);
      for (const asset of cgFallbackNeeded) {
        const id = COINGECKO_IDS[asset];
        const px = cg?.[id]?.usd;
        if (px && snapshot.markets[asset]) {
          snapshot.markets[asset].ticker = snapshot.markets[asset].ticker || {};
          snapshot.markets[asset].ticker.lastPrice = String(px);
          snapshot.markets[asset].errors.push('ticker_fallback: coingecko');
          snapshot.data_quality = snapshot.data_quality === 'OK' ? 'PARTIAL' : snapshot.data_quality;
        }
      }
      if (cgFallbackNeeded.length > 0) snapshot.degraded_reasons.push('Used CoinGecko fallback for missing tickers');
    } catch (e) {
      snapshot.data_quality = 'DEGRADED';
      snapshot.degraded_reasons.push(`CoinGecko fallback failed: ${e.message}`);
    }
  }

  // Build a lite snapshot to minimize downstream token usage
  const lite = {
    timestamp_utc: snapshot.timestamp_utc,
    source: snapshot.source,
    data_quality: snapshot.data_quality,
    degraded_reasons: snapshot.degraded_reasons,
    markets: {},
  };

  for (const [asset, m] of Object.entries(snapshot.markets)) {
    const t = m.ticker || {};
    const oi = m.open_interest || {};
    const fr = m.funding || {};
    const k1 = Array.isArray(m.klines_1h) && m.klines_1h.length ? m.klines_1h[m.klines_1h.length - 1] : null;
    const k4 = Array.isArray(m.klines_4h) && m.klines_4h.length ? m.klines_4h[m.klines_4h.length - 1] : null;

    lite.markets[asset] = {
      asset: m.asset,
      symbol: m.symbol,
      ticker: {
        lastPrice: t.lastPrice,
        priceChangePercent: t.priceChangePercent,
        high: t.high,
        low: t.low,
      },
      open_interest: {
        openInterest: oi.openInterest,
        timestamp: oi.timestamp,
      },
      funding: {
        fundingRate: fr.fundingRate,
        intervalEndTimestamp: fr.intervalEndTimestamp,
      },
      derived: m.derived || {},
      last_1h_candle: k1,
      last_4h_candle: k4,
      errors: m.errors || [],
    };
  }

  // ensure data dir exists
  const outDir = path.dirname(OUT_PATH);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(snapshot, null, 2));
  fs.writeFileSync(OUT_LITE_PATH, JSON.stringify(lite, null, 2));

  // Avoid printing the full snapshot by default (it can be huge and cause TPM/tool log blowups).
  // Opt-in via env:
  // - PRINT_SNAPSHOT=1 prints full snapshot JSON
  // - PRINT_LITE=1 prints lite snapshot JSON
  if (process.env.PRINT_SNAPSHOT === '1') {
    process.stdout.write(JSON.stringify(snapshot));
  } else if (process.env.PRINT_LITE === '1') {
    process.stdout.write(JSON.stringify(lite));
  } else {
    process.stdout.write(JSON.stringify({
      ok: true,
      timestamp_utc: snapshot.timestamp_utc,
      data_quality: snapshot.data_quality,
      out: {
        snapshot: path.relative(process.cwd(), OUT_PATH),
        lite: path.relative(process.cwd(), OUT_LITE_PATH),
      },
    }));
  }
}

main().catch(err => {
  const out = {
    timestamp_utc: new Date().toISOString(),
    source: 'backpack',
    data_quality: 'DEGRADED',
    degraded_reasons: [`collector_fatal: ${err.message}`],
  };
  try {
    fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
    fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
  } catch {}
  if (process.env.PRINT_SNAPSHOT === '1' || process.env.PRINT_LITE === '1') {
    process.stdout.write(JSON.stringify(out));
  } else {
    process.stdout.write(JSON.stringify({ ok: false, ...out }));
  }
  process.exit(1);
});
