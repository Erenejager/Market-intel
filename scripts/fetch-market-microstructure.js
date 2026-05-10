#!/usr/bin/env node
/**
 * Market Microstructure Collector — Phase 1 / display-only
 *
 * Backpack is execution truth. Binance/Bybit/OKX are context-only.
 *
 * Outputs:
 * - market-intel/data/microstructure-context.json
 * - market-intel/data/microstructure-history.jsonl
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_PATH = path.join(ROOT, 'data', 'microstructure-context.json');
const HISTORY_PATH = path.join(ROOT, 'data', 'microstructure-history.jsonl');
const STATUS_PATH = path.join(ROOT, 'data', 'signal-outcome-status.json');
const BINANCE_CONTEXT_PATH = path.join(ROOT, 'data', 'binance-context.json');
const BACKPACK_FULL_PATH = path.join(ROOT, 'data', 'backpack-snapshot.json');
const BACKPACK_LITE_PATH = path.join(ROOT, 'data', 'backpack-snapshot-lite.json');
const DIAGNOSTICS_STATE_PATH = path.join(ROOT, 'data', 'phase1b-diagnostics-state.json');

const BACKPACK_BASE = 'https://api.backpack.exchange/api/v1';
const BINANCE_SPOT = 'https://api.binance.com';
const BINANCE_FAPI = 'https://fapi.binance.com';
const BYBIT_BASE = 'https://api.bybit.com';
const OKX_BASE = 'https://www.okx.com';

const MARKETS = {
  BTC: { backpack: 'BTC_USDC_PERP', binance: 'BTCUSDT', bybit: 'BTCUSDT', okx: 'BTC-USDT-SWAP' },
  ETH: { backpack: 'ETH_USDC_PERP', binance: 'ETHUSDT', bybit: 'ETHUSDT', okx: 'ETH-USDT-SWAP', rel: 'ETHBTC' },
  SOL: { backpack: 'SOL_USDC_PERP', binance: 'SOLUSDT', bybit: 'SOLUSDT', okx: 'SOL-USDT-SWAP', rel: 'SOLBTC' },
  PAXG: { backpack: 'PAXG_USDC_PERP', binance: 'PAXGUSDT' },
};

const BANDS_BPS = [10, 25, 50, 100];
const TIMEOUT_MS = 12000;

function nowIso() { return new Date().toISOString(); }
function toNum(x) { const n = Number(x); return Number.isFinite(n) ? n : null; }
function round(x, d = 6) { return Number.isFinite(x) ? Number(x.toFixed(d)) : null; }
function pct(n) { return Number.isFinite(n) ? round(n * 100, 4) : null; }

async function jget(base, pathname, params = {}) {
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const url = new URL(String(pathname).replace(/^\/+/, ''), normalizedBase);
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'user-agent': 'openclaw-market-intel/1.0', 'accept': 'application/json,text/plain,*/*' },
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${text.slice(0, 180)}`);
    try { return JSON.parse(text); } catch { return text; }
  } finally {
    clearTimeout(t);
  }
}

function readJson(file, fallback = null) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

const MAX_BACKPACK_SNAPSHOT_AGE_MS = 20 * 60 * 1000;

// Matches orchestrator.js's readFreshJson guard: a snapshot stale past its
// expected refresh cadence is treated as missing rather than silently fed in
// as current (backpack-snapshot-lite.json went 11 days unrefreshed before
// this check existed, feeding a frozen candle into oi_price_regime scoring).
function readFreshJson(file, maxAgeMs = MAX_BACKPACK_SNAPSHOT_AGE_MS) {
  const json = readJson(file, null);
  if (!json) return { value: null, stale: false, reason: 'missing or unparsable' };
  const tsMs = Date.parse(json.timestamp_utc || json.timestamp || json.updated_at || '');
  if (!Number.isFinite(tsMs)) return { value: json, stale: false, reason: 'no timestamp' };
  const ageMs = Date.now() - tsMs;
  if (ageMs > maxAgeMs) return { value: null, stale: true, reason: `stale ${Math.round(ageMs / 60000)}m` };
  return { value: json, stale: false, reason: null };
}

function readJsonlTail(file, limit = 20) {
  try {
    return fs.readFileSync(file, 'utf8')
      .trim()
      .split('\n')
      .filter(Boolean)
      .slice(-limit)
      .map(line => JSON.parse(line));
  } catch {
    return [];
  }
}

function parseBookSide(rows) {
  return (rows || []).map(([p, q]) => ({ price: toNum(p), qty: toNum(q), notional: toNum(p) * toNum(q) }))
    .filter(r => Number.isFinite(r.price) && Number.isFinite(r.qty));
}

function summarizeBook(depth, triggerPrice = null, direction = null) {
  const bids = parseBookSide(depth?.bids).sort((a, b) => b.price - a.price);
  const asks = parseBookSide(depth?.asks).sort((a, b) => a.price - b.price);
  const bestBid = bids[0]?.price ?? null;
  const bestAsk = asks[0]?.price ?? null;
  const mid = Number.isFinite(bestBid) && Number.isFinite(bestAsk) ? (bestBid + bestAsk) / 2 : null;
  const spread = Number.isFinite(bestBid) && Number.isFinite(bestAsk) ? bestAsk - bestBid : null;
  const bands = {};

  for (const bps of BANDS_BPS) {
    if (!Number.isFinite(mid)) {
      bands[`${bps}bps`] = null;
      continue;
    }
    const bidFloor = mid * (1 - bps / 10000);
    const askCeil = mid * (1 + bps / 10000);
    const bidNotional = bids.filter(r => r.price >= bidFloor).reduce((s, r) => s + r.notional, 0);
    const askNotional = asks.filter(r => r.price <= askCeil).reduce((s, r) => s + r.notional, 0);
    bands[`${bps}bps`] = {
      bid_notional: round(bidNotional, 2),
      ask_notional: round(askNotional, 2),
      imbalance: bidNotional + askNotional > 0 ? round((bidNotional - askNotional) / (bidNotional + askNotional), 4) : null,
    };
  }

  let triggerZone = null;
  if (Number.isFinite(mid) && Number.isFinite(triggerPrice) && ['BUY', 'SELL'].includes(direction)) {
    if (direction === 'BUY') {
      const between = asks.filter(r => r.price >= Math.min(mid, triggerPrice) && r.price <= triggerPrice);
      const above = asks.filter(r => r.price > triggerPrice && r.price <= triggerPrice * 1.005);
      triggerZone = {
        direction,
        trigger_price: triggerPrice,
        distance_bps: round((triggerPrice / mid - 1) * 10000, 2),
        ask_notional_to_trigger: round(between.reduce((s, r) => s + r.notional, 0), 2),
        ask_notional_50bps_above_trigger: round(above.reduce((s, r) => s + r.notional, 0), 2),
      };
    } else {
      const between = bids.filter(r => r.price <= Math.max(mid, triggerPrice) && r.price >= triggerPrice);
      const below = bids.filter(r => r.price < triggerPrice && r.price >= triggerPrice * 0.995);
      triggerZone = {
        direction,
        trigger_price: triggerPrice,
        distance_bps: round((triggerPrice / mid - 1) * 10000, 2),
        bid_notional_to_trigger: round(between.reduce((s, r) => s + r.notional, 0), 2),
        bid_notional_50bps_below_trigger: round(below.reduce((s, r) => s + r.notional, 0), 2),
      };
    }
  }

  return {
    best_bid: bestBid,
    best_ask: bestAsk,
    mid: round(mid, 8),
    spread: round(spread, 8),
    spread_bps: Number.isFinite(spread) && Number.isFinite(mid) ? round(spread / mid * 10000, 3) : null,
    depth_bands: bands,
    trigger_zone: triggerZone,
  };
}

function pendingTriggerFor(asset) {
  const status = readJson(STATUS_PATH, { events: {} });
  const rows = Object.values(status.events || {})
    .filter(e => e?.asset === asset && ['PENDING_TRIGGER', 'ACTIVE'].includes(e.status))
    .sort((a, b) => Date.parse(b.latest_sample_at || b.filled_at || 0) - Date.parse(a.latest_sample_at || a.filled_at || 0));
  const e = rows[0];
  return e ? { direction: e.direction, trigger_price: toNum(e.trigger_price), status: e.status, event_id: e.id || e.event_id } : null;
}

async function fetchBackpackExecution(asset, cfg) {
  const trigger = pendingTriggerFor(asset);
  const depth = await jget(BACKPACK_BASE, '/depth', { symbol: cfg.backpack });
  return {
    role: 'execution_truth',
    venue: 'backpack',
    symbol: cfg.backpack,
    pending_trigger: trigger,
    order_book: summarizeBook(depth, trigger?.trigger_price, trigger?.direction),
    raw_levels: { bids: depth.bids?.length || 0, asks: depth.asks?.length || 0 },
  };
}

function cvdFromAggTrades(rows) {
  let buyQty = 0, sellQty = 0, buyNotional = 0, sellNotional = 0;
  for (const r of rows || []) {
    const price = toNum(r.p);
    const qty = toNum(r.q);
    if (!Number.isFinite(price) || !Number.isFinite(qty)) continue;
    // Binance aggTrades: m=true means buyer is maker, so taker side is SELL.
    if (r.m === true) { sellQty += qty; sellNotional += price * qty; }
    else { buyQty += qty; buyNotional += price * qty; }
  }
  const total = buyNotional + sellNotional;
  return {
    samples: Array.isArray(rows) ? rows.length : 0,
    taker_buy_notional: round(buyNotional, 2),
    taker_sell_notional: round(sellNotional, 2),
    cvd_notional: round(buyNotional - sellNotional, 2),
    taker_buy_share: total > 0 ? round(buyNotional / total, 4) : null,
  };
}

async function fetchBinanceContext(asset, cfg) {
  const out = { role: 'context_only', venue: 'binance', symbol: cfg.binance, errors: [] };
  try { out.spot_cvd_recent = cvdFromAggTrades(await jget(BINANCE_SPOT, '/api/v3/aggTrades', { symbol: cfg.binance, limit: 1000 })); }
  catch (e) { out.errors.push(`spot_cvd: ${e.message}`); }
  try { out.futures_cvd_recent = cvdFromAggTrades(await jget(BINANCE_FAPI, '/fapi/v1/aggTrades', { symbol: cfg.binance, limit: 1000 })); }
  catch (e) { out.errors.push(`futures_cvd: ${e.message}`); }
  try {
    const oi = await jget(BINANCE_FAPI, '/fapi/v1/openInterest', { symbol: cfg.binance });
    out.open_interest = { value: toNum(oi.openInterest), timestamp_utc: oi.time ? new Date(Number(oi.time)).toISOString() : null };
  } catch (e) { out.errors.push(`open_interest: ${e.message}`); }
  try {
    const premium = await jget(BINANCE_FAPI, '/fapi/v1/premiumIndex', { symbol: cfg.binance });
    out.funding = { rate: toNum(premium.lastFundingRate), mark_price: toNum(premium.markPrice), index_price: toNum(premium.indexPrice), next_funding_time: toNum(premium.nextFundingTime) };
  } catch (e) { out.errors.push(`funding: ${e.message}`); }
  if (cfg.rel) {
    try {
      const rel = await jget(BINANCE_SPOT, '/api/v3/ticker/24hr', { symbol: cfg.rel });
      out.relative_strength = { pair: cfg.rel, last: toNum(rel.lastPrice), change_24h_pct: toNum(rel.priceChangePercent) };
    } catch (e) { out.errors.push(`relative_strength: ${e.message}`); }
  }
  out.data_quality = out.errors.length === 0 ? 'OK' : out.errors.length >= 3 ? 'DEGRADED' : 'PARTIAL';
  return out;
}

async function fetchBybitContext(asset, cfg) {
  if (!cfg.bybit) return null;
  const out = { role: 'context_only', venue: 'bybit', symbol: cfg.bybit, errors: [] };
  try {
    const j = await jget(BYBIT_BASE, '/v5/market/funding/history', { category: 'linear', symbol: cfg.bybit, limit: 1 });
    const row = j?.result?.list?.[0];
    out.funding = { rate: toNum(row?.fundingRate), funding_rate_timestamp: toNum(row?.fundingRateTimestamp) };
  } catch (e) { out.errors.push(`funding: ${e.message}`); }
  try {
    const j = await jget(BYBIT_BASE, '/v5/market/open-interest', { category: 'linear', symbol: cfg.bybit, intervalTime: '5min', limit: 2 });
    const rows = j?.result?.list || [];
    out.open_interest = { latest: toNum(rows[0]?.openInterest), previous: toNum(rows[1]?.openInterest), timestamp: toNum(rows[0]?.timestamp) };
    if (Number.isFinite(out.open_interest.latest) && Number.isFinite(out.open_interest.previous) && out.open_interest.previous !== 0) {
      out.open_interest.change_latest = round((out.open_interest.latest - out.open_interest.previous) / out.open_interest.previous, 6);
    }
  } catch (e) { out.errors.push(`open_interest: ${e.message}`); }
  out.data_quality = out.errors.length === 0 ? 'OK' : out.errors.length >= 2 ? 'DEGRADED' : 'PARTIAL';
  return out;
}

async function fetchOkxContext(asset, cfg) {
  if (!cfg.okx) return null;
  const out = { role: 'context_only', venue: 'okx', symbol: cfg.okx, errors: [] };
  try {
    const j = await jget(OKX_BASE, '/api/v5/public/funding-rate', { instId: cfg.okx });
    const row = j?.data?.[0];
    out.funding = { rate: toNum(row?.fundingRate), next_funding_rate: toNum(row?.nextFundingRate), funding_time: toNum(row?.fundingTime) };
  } catch (e) { out.errors.push(`funding: ${e.message}`); }
  try {
    const j = await jget(OKX_BASE, '/api/v5/public/open-interest', { instType: 'SWAP', instId: cfg.okx });
    const row = j?.data?.[0];
    out.open_interest = { oi: toNum(row?.oi), oi_ccy: toNum(row?.oiCcy), oi_usd: toNum(row?.oiUsd), timestamp: toNum(row?.ts) };
  } catch (e) { out.errors.push(`open_interest: ${e.message}`); }
  out.data_quality = out.errors.length === 0 ? 'OK' : out.errors.length >= 2 ? 'DEGRADED' : 'PARTIAL';
  return out;
}

function classifyCrossExchange(market) {
  const venues = [market.binance, market.bybit, market.okx].filter(Boolean);
  const rates = venues.map(v => ({ venue: v.venue, rate: toNum(v.funding?.rate), quality: v.data_quality }))
    .filter(v => Number.isFinite(v.rate) && v.quality !== 'DEGRADED');
  if (rates.length < 2) return { classification: 'INSUFFICIENT_FRESH_VENUES', fresh_venues: rates.length, rates };
  const pos = rates.filter(r => r.rate > 0).length;
  const neg = rates.filter(r => r.rate < 0).length;
  let classification = 'MIXED';
  if (pos === rates.length) classification = 'BROAD_POSITIVE_FUNDING';
  if (neg === rates.length) classification = 'BROAD_NEGATIVE_FUNDING';
  return { classification, fresh_venues: rates.length, rates };
}

function classifyFlowQuality(market) {
  const spotShare = toNum(market.binance?.spot_cvd_recent?.taker_buy_share);
  const futuresShare = toNum(market.binance?.futures_cvd_recent?.taker_buy_share);
  const spotCvd = toNum(market.binance?.spot_cvd_recent?.cvd_notional);
  const futuresCvd = toNum(market.binance?.futures_cvd_recent?.cvd_notional);

  const threshold = 0.03;
  const spotBias = Number.isFinite(spotShare)
    ? spotShare >= 0.5 + threshold ? 'BUYERS_DOMINANT'
      : spotShare <= 0.5 - threshold ? 'SELLERS_DOMINANT'
        : 'NEUTRAL'
    : 'UNKNOWN';
  const futuresBias = Number.isFinite(futuresShare)
    ? futuresShare >= 0.5 + threshold ? 'BUYERS_DOMINANT'
      : futuresShare <= 0.5 - threshold ? 'SELLERS_DOMINANT'
        : 'NEUTRAL'
    : 'UNKNOWN';

  let classification = 'UNKNOWN';
  let rationale = 'Insufficient fresh Binance spot/futures CVD proxy data.';

  if (spotBias === 'BUYERS_DOMINANT' && futuresBias === 'BUYERS_DOMINANT') {
    classification = 'STRUCTURAL_BUYING';
    rationale = 'Spot and futures taker flow both show buyer dominance.';
  } else if (spotBias === 'SELLERS_DOMINANT' && futuresBias === 'SELLERS_DOMINANT') {
    classification = 'SELL_PRESSURE';
    rationale = 'Spot and futures taker flow both show seller dominance.';
  } else if (futuresBias === 'BUYERS_DOMINANT' && spotBias !== 'BUYERS_DOMINANT') {
    classification = 'LEVERAGED_CHASE';
    rationale = 'Futures buyers are active without spot confirmation.';
  } else if (spotBias === 'SELLERS_DOMINANT' && futuresBias !== 'SELLERS_DOMINANT') {
    classification = 'DISTRIBUTION';
    rationale = 'Spot selling dominates while futures do not show matching sell pressure.';
  } else if (spotBias === 'BUYERS_DOMINANT' && futuresBias !== 'BUYERS_DOMINANT') {
    classification = 'SPOT_LED_ACCUMULATION';
    rationale = 'Spot buying dominates without futures chase confirmation.';
  } else if (spotBias !== 'UNKNOWN' && futuresBias !== 'UNKNOWN') {
    classification = 'MIXED_OR_NEUTRAL';
    rationale = 'Spot/futures flow is mixed or near neutral.';
  }

  return {
    classification,
    role: 'display_only_phase1_no_scoring',
    spot_bias: spotBias,
    futures_bias: futuresBias,
    spot_taker_buy_share: spotShare,
    futures_taker_buy_share: futuresShare,
    spot_cvd_notional: spotCvd,
    futures_cvd_notional: futuresCvd,
    threshold_buy_share_delta: threshold,
    rationale,
  };
}

function flowConsensus(asset, currentClassification, historyRows, samples = 4) {
  const prior = historyRows
    .map(r => ({ timestamp_utc: r.timestamp_utc, classification: r.markets?.[asset]?.flow_quality?.classification }))
    .filter(r => r.classification && r.classification !== 'UNKNOWN')
    .slice(-(samples - 1));
  const rows = [...prior, { timestamp_utc: nowIso(), classification: currentClassification }].slice(-samples);
  const classifications = rows.map(r => r.classification);
  const counts = classifications.reduce((acc, c) => { acc[c] = (acc[c] || 0) + 1; return acc; }, {});
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || currentClassification || 'UNKNOWN';
  let streak = 0;
  for (let i = classifications.length - 1; i >= 0; i -= 1) {
    if (classifications[i] !== currentClassification) break;
    streak += 1;
  }
  return {
    role: 'display_only_phase1b_no_scoring',
    samples_checked: rows.length,
    dominant,
    dominant_count: counts[dominant] || 0,
    current: currentClassification,
    current_streak: streak,
    confirmed: streak >= 3 || (counts[dominant] >= 3 && dominant === currentClassification),
    history: classifications,
    rule: 'confirmed only when current classification has a 3-sample streak or dominates at least 3 of last 4 samples',
  };
}

function computeLongHorizonRegime(asset, backpackSnapshot) {
  const s = backpackSnapshot?.markets?.[asset];
  const tickerPrice = toNum(s?.ticker?.lastPrice);
  const last4hClose = toNum(s?.last_4h_candle?.close);
  const priceNow = Number.isFinite(tickerPrice) ? tickerPrice : last4hClose;
  const closes4h = Array.isArray(s?.klines_4h) ? s.klines_4h.map(c => toNum(c.close)).filter(Number.isFinite) : [];
  const priceBack = (barsBack) => {
    if (!Number.isFinite(priceNow) || closes4h.length < barsBack + 1) return null;
    const p = closes4h[closes4h.length - 1 - barsBack];
    return Number.isFinite(p) && p !== 0 ? round(((priceNow - p) / p) * 100, 3) : null;
  };
  const ref = (bars) => {
    if (!Number.isFinite(priceNow) || closes4h.length < bars) return { price: null, distance_pct: null };
    const slice = closes4h.slice(-bars);
    const avg = slice.reduce((sum, v) => sum + v, 0) / slice.length;
    return { price: round(avg, 6), distance_pct: avg !== 0 ? round(((priceNow - avg) / avg) * 100, 3) : null };
  };
  const ref5d = ref(30); // 30 x 4h bars
  const ref7d = ref(42); // 42 x 4h bars
  return {
    role: 'readiness_shadow_v1_instrumentation_only_no_scoring',
    version: 'v1-fields-only',
    source: 'backpack_4h_klines',
    price: round(priceNow, 6),
    return_3d_pct: priceBack(18),
    return_7d_pct: priceBack(42),
    reference_5d_sma: ref5d.price,
    distance_from_5d_sma_pct: ref5d.distance_pct,
    reference_7d_sma: ref7d.price,
    distance_from_7d_sma_pct: ref7d.distance_pct,
    trend_4h: s?.derived?.trend_4h || null,
    note: 'Instrumentation only. These fields do not change v0 readiness score, alerts, Telegram, or active contexts.',
  };
}

function classifyOiPriceRegime(asset, binanceSnapshot, backpackSnapshot) {
  const b = binanceSnapshot?.markets?.[asset];
  const s = backpackSnapshot?.markets?.[asset];
  const oi30 = toNum(b?.open_interest?.change_30m);
  const oi4h = toNum(b?.open_interest?.change_4h);
  const candle = s?.last_1h_candle || s?.last_4h_candle || {};
  const open = toNum(candle.open);
  const close = toNum(candle.close ?? s?.ticker?.lastPrice);
  const priceChange = Number.isFinite(open) && Number.isFinite(close) && open !== 0 ? (close - open) / open : null;
  const oi = Number.isFinite(oi30) ? oi30 : oi4h;
  const epsPrice = 0.0005;
  const epsOi = 0.0005;
  let classification = 'INSUFFICIENT_DATA';
  let interpretation = 'Missing fresh OI or candle price context.';
  if (Number.isFinite(oi) && Number.isFinite(priceChange)) {
    const priceUp = priceChange > epsPrice;
    const priceDown = priceChange < -epsPrice;
    const oiUp = oi > epsOi;
    const oiDown = oi < -epsOi;
    if (priceUp && oiUp) { classification = 'FRESH_LONGS'; interpretation = 'Price rising with OI expansion; fresh long positioning likely supporting the move.'; }
    else if (priceUp && oiDown) { classification = 'SHORTS_COVERING'; interpretation = 'Price rising while OI contracts; move may be driven by position closing/short covering.'; }
    else if (priceDown && oiUp) { classification = 'FRESH_SHORTS'; interpretation = 'Price falling with OI expansion; fresh shorts likely pressing the move.'; }
    else if (priceDown && oiDown) { classification = 'LONGS_EXITING'; interpretation = 'Price falling while OI contracts; longs likely reducing exposure.'; }
    else { classification = 'NEUTRAL'; interpretation = 'Price/OI changes are too small or mixed to classify confidently.'; }
  }
  return {
    role: 'display_only_phase1b_no_scoring',
    classification,
    oi_change_30m: round(oi30, 6),
    oi_change_4h: round(oi4h, 6),
    price_change_from_1h_open: round(priceChange, 6),
    interpretation,
  };
}

function classifyCvdDivergence(flowQuality) {
  const spot = toNum(flowQuality?.spot_cvd_notional);
  const futures = toNum(flowQuality?.futures_cvd_notional);
  let type = 'NONE';
  let detected = false;
  let interpretation = 'Spot and futures CVD signs are aligned or too small to classify.';
  if (Number.isFinite(spot) && Number.isFinite(futures)) {
    if (spot > 0 && futures < 0) {
      detected = true;
      type = 'SPOT_POSITIVE_FUTURES_NEGATIVE';
      interpretation = 'Spot buyers are present but futures flow is selling; breakout follow-through can be fragile.';
    } else if (spot < 0 && futures > 0) {
      detected = true;
      type = 'SPOT_NEGATIVE_FUTURES_POSITIVE';
      interpretation = 'Futures buyers are chasing while spot does not confirm; risk of leveraged chase/absorption.';
    }
  }
  return { role: 'display_only_phase1b_no_scoring', detected, type, interpretation };
}

function nearestResistance(snapshotMarket) {
  const price = toNum(snapshotMarket?.ticker?.lastPrice ?? snapshotMarket?.last_1h_candle?.close);
  const levels = snapshotMarket?.derived?.levels_1h?.resistance || [];
  const above = levels.map(toNum).filter(v => Number.isFinite(v) && (!Number.isFinite(price) || v >= price * 0.995)).sort((a, b) => a - b);
  return above[0] ?? levels.map(toNum).filter(Number.isFinite).sort((a, b) => a - b)[0] ?? null;
}

function updateFailedBreakoutCounter(asset, snapshotMarket, state) {
  const candle = snapshotMarket?.last_1h_candle || (snapshotMarket?.klines_1h || []).slice(-1)[0] || {};
  const high = toNum(candle.high);
  const low = toNum(candle.low);
  const close = toNum(candle.close);
  const currentPrice = toNum(snapshotMarket?.ticker?.lastPrice ?? close);
  const atr = toNum(snapshotMarket?.derived?.atr_14_1h);
  const level = nearestResistance(snapshotMarket);
  if (!Number.isFinite(high) || !Number.isFinite(close) || !Number.isFinite(level)) {
    return { role: 'display_only_phase1b_no_scoring', tracked: false, reason: 'missing candle or resistance level' };
  }
  const tolerance = Number.isFinite(atr) ? atr * 0.05 : level * 0.001;
  const tested = high >= level - tolerance;
  const closedAbove = close >= level + tolerance;
  const touchedFromAbove = Number.isFinite(low) && low <= level + tolerance;
  const closedBelow = close <= level - tolerance;
  const rejected = tested && !closedAbove;
  const key = `${asset}:BUY:${round(level, 4)}`;
  const row = state[key] || { asset, direction: 'BUY', trigger_price: round(level, 4), lifetime_failed_attempts: 0, failed_attempts: 0, tested_candles: [] };
  const nowMs = Date.now();
  const activeWindowHours = 48;
  const activeCutoffMs = nowMs - activeWindowHours * 60 * 60 * 1000;
  const deactivatedAfterMs = Number.isFinite(Date.parse(row.deactivated_at || '')) ? Date.parse(row.deactivated_at) : null;
  const activeStartMs = Number.isFinite(deactivatedAfterMs) ? Math.max(activeCutoffMs, deactivatedAfterMs) : activeCutoffMs;
  row.tested_candles = (row.tested_candles || [])
    .map(v => (typeof v === 'string' ? { start: v } : v))
    .filter(v => {
      if (!v?.start) return false;
      const startMs = Date.parse(v.start);
      return !Number.isFinite(startMs) || startMs >= activeStartMs;
    })
    .slice(-40);

  // Backfill recent failed attempts from stored Backpack 1h candles so this
  // diagnostic is useful immediately after deployment instead of starting cold.
  // This is intentionally shallow and display-only: it tracks wicks/tests of the
  // current nearest resistance that failed to close cleanly above it.
  for (const c of (snapshotMarket?.klines_1h || []).slice(-activeWindowHours)) {
    const cHigh = toNum(c.high);
    const cClose = toNum(c.close);
    const cStartMs = Date.parse(c.start || '');
    if (!c.start || (Number.isFinite(cStartMs) && cStartMs < activeStartMs) || row.tested_candles.some(v => v.start === c.start)) continue;
    const cTested = Number.isFinite(cHigh) && cHigh >= level - tolerance;
    const cClosedAbove = Number.isFinite(cClose) && cClose >= level + tolerance;
    if (cTested && !cClosedAbove) {
      row.lifetime_failed_attempts = (row.lifetime_failed_attempts || row.failed_attempts || 0) + 1;
      row.last_failed_candle_start = c.start;
      row.tested_candles = [...row.tested_candles, { start: c.start, recorded_at: nowIso() }].slice(-40);
    }
  }

  if (rejected && candle.start && !row.tested_candles.some(v => v.start === candle.start)) {
    row.lifetime_failed_attempts = (row.lifetime_failed_attempts || row.failed_attempts || 0) + 1;
    row.last_failed_at = nowIso();
    row.last_failed_candle_start = candle.start;
    row.tested_candles = [...row.tested_candles, { start: candle.start, recorded_at: nowIso() }].slice(-40);
  }

  let activeCandles = row.tested_candles.filter(v => !Number.isFinite(Date.parse(v.start)) || Date.parse(v.start) >= activeStartMs);
  let latestActive = activeCandles
    .map(v => v.start)
    .filter(Boolean)
    .sort((a, b) => Date.parse(a) - Date.parse(b))
    .slice(-1)[0] || null;
  let activeAttempts = activeCandles.length;

  const cleanClearanceThreshold = Number.isFinite(atr) && atr > 0 ? level + atr : null;
  const cleanClearance = activeAttempts >= 2 && Number.isFinite(cleanClearanceThreshold) && Number.isFinite(currentPrice) && currentPrice > cleanClearanceThreshold;
  row.clean_clearance_streak = cleanClearance ? (Number(row.clean_clearance_streak || 0) + 1) : 0;
  let deactivationEvent = null;
  if (row.clean_clearance_streak >= 2) {
    deactivationEvent = 'CLEAN_CLEARANCE_RESET';
    row.deactivated_at = nowIso();
    row.deactivated_candle_start = candle.start || null;
    row.deactivation_reason = 'price > failed level + 1 ATR for 2 consecutive samples';
    row.last_deactivated_trigger_price = round(level, 4);
    row.tested_candles = [];
    row.failed_attempts = 0;
    row.last_failed_candle_start = null;
    row.clean_clearance_streak = 0;
    activeCandles = [];
    latestActive = null;
    activeAttempts = 0;
  } else {
    row.failed_attempts = activeAttempts;
    row.last_failed_candle_start = latestActive;
  }
  state[key] = row;
  const distanceAbs = Number.isFinite(currentPrice) ? Math.abs(level - currentPrice) : null;
  const distanceAtr = Number.isFinite(distanceAbs) && Number.isFinite(atr) && atr > 0 ? distanceAbs / atr : null;
  const distanceBps = Number.isFinite(currentPrice) && currentPrice !== 0 ? (level / currentPrice - 1) * 10000 : null;
  const nearFailedLevel = Number.isFinite(distanceAtr) ? distanceAtr <= 1.5 : Number.isFinite(distanceBps) ? Math.abs(distanceBps) <= 75 : false;
  const previousReclaimState = row.reclaim_state || null;
  let reclaimState = previousReclaimState || 'NOT_RECLAIMED';
  let reclaimEvent = null;
  if (activeAttempts < 2) {
    reclaimState = 'NO_FAILED_LEVEL';
  } else if (closedAbove) {
    if (previousReclaimState !== 'RECLAIMED_FAILED_LEVEL' && previousReclaimState !== 'RETESTING_RECLAIMED_LEVEL' && previousReclaimState !== 'RETEST_HELD') {
      row.reclaimed_at = row.reclaimed_at || nowIso();
      row.reclaimed_candle_start = candle.start || row.reclaimed_candle_start || null;
      reclaimEvent = 'RECLAIMED_FAILED_LEVEL';
    }
    reclaimState = touchedFromAbove ? 'RETEST_HELD' : 'RECLAIMED_FAILED_LEVEL';
    if (touchedFromAbove) {
      row.last_retest_at = nowIso();
      row.last_retest_candle_start = candle.start || row.last_retest_candle_start || null;
      row.last_retest_verdict = 'HELD';
      reclaimEvent = reclaimEvent || 'RETEST_HELD';
    }
  } else if (['RECLAIMED_FAILED_LEVEL', 'RETESTING_RECLAIMED_LEVEL', 'RETEST_HELD'].includes(previousReclaimState) && nearFailedLevel && !closedBelow) {
    reclaimState = 'RETESTING_RECLAIMED_LEVEL';
    row.last_retest_at = nowIso();
    row.last_retest_candle_start = candle.start || row.last_retest_candle_start || null;
    row.last_retest_verdict = 'IN_PROGRESS';
    reclaimEvent = 'RETESTING_RECLAIMED_LEVEL';
  } else if (['RECLAIMED_FAILED_LEVEL', 'RETESTING_RECLAIMED_LEVEL', 'RETEST_HELD'].includes(previousReclaimState) && closedBelow) {
    reclaimState = 'RETEST_FAILED';
    row.last_retest_at = nowIso();
    row.last_retest_candle_start = candle.start || row.last_retest_candle_start || null;
    row.last_retest_verdict = 'FAILED';
    reclaimEvent = 'RETEST_FAILED';
  } else {
    reclaimState = 'NOT_RECLAIMED';
  }
  row.reclaim_state = reclaimState;
  const reclaimed = ['RECLAIMED_FAILED_LEVEL', 'RETESTING_RECLAIMED_LEVEL', 'RETEST_HELD'].includes(reclaimState);
  const penaltyActive = activeAttempts >= 2 && nearFailedLevel && !reclaimed;
  return {
    role: 'display_only_phase1b_no_scoring',
    tracked: true,
    trigger_price: round(level, 4),
    tested,
    closed_above: closedAbove,
    verdict: rejected ? 'WICK_REJECTION_OR_FAILED_CLOSE' : closedAbove ? 'CLOSE_CONFIRMED_ABOVE_LEVEL' : 'NOT_TESTED',
    active_failed_attempts: activeAttempts,
    lifetime_failed_attempts: row.lifetime_failed_attempts || activeAttempts,
    active_window_hours: activeWindowHours,
    last_failed_candle_start: latestActive,
    distance_to_level_abs: round(distanceAbs, 6),
    distance_to_level_atr: round(distanceAtr, 4),
    distance_to_level_bps: round(distanceBps, 2),
    near_failed_level: nearFailedLevel,
    near_failed_level_rule: 'abs(price - trigger_price) <= 1.5 x ATR(1h), fallback <=75bps when ATR unavailable',
    penalty_active: penaltyActive,
    penalty_inactive_reason: penaltyActive ? null : deactivationEvent ? 'clean_clearance_reset' : reclaimed ? 'level_reclaimed_or_retest_holding' : !nearFailedLevel ? 'price_not_near_failed_level' : activeAttempts < 2 ? 'insufficient_active_failed_attempts' : null,
    reclaim_retest_state: reclaimState,
    reclaim_retest_event: reclaimEvent,
    deactivation_event: deactivationEvent,
    clean_clearance_streak: row.clean_clearance_streak || 0,
    clean_clearance_rule: 'price > failed level + 1 ATR for 2 consecutive samples resets failed-breakout penalty',
    reclaimed_at: row.reclaimed_at || null,
    reclaimed_candle_start: row.reclaimed_candle_start || null,
    last_retest_at: row.last_retest_at || null,
    last_retest_candle_start: row.last_retest_candle_start || null,
    last_retest_verdict: row.last_retest_verdict || null,
    resistance_strength: activeAttempts >= 3 ? 'VERY_STRONG' : activeAttempts >= 2 ? 'STRONG' : activeAttempts >= 1 ? 'WATCH' : 'UNPROVEN',
    rule: 'after 2+ active failed attempts in the rolling window, require deeper reset before treating same level as clean trigger',
  };
}

function btcAltGate(asset, market, btcMarket) {
  if (asset === 'BTC' || !btcMarket) return null;
  const btcFlow = btcMarket.flow_quality?.classification;
  const altFlow = market.flow_quality?.classification;
  let modifier = 0;
  let classification = 'NEUTRAL';
  let reason = 'BTC context does not materially change alt conviction.';
  if (['SELL_PRESSURE', 'DISTRIBUTION'].includes(btcFlow)) {
    modifier = -0.2;
    classification = 'BTC_WEAK_VETO_ALT_LONGS';
    reason = 'BTC flow is weak; alt-long regime is invalid regardless of local setup score.';
  } else if (
    ['STRUCTURAL_BUYING', 'SPOT_LED_ACCUMULATION'].includes(btcFlow)
    && (
      altFlow === 'LEVERAGED_CHASE'
      || market.cvd_divergence?.type === 'SPOT_NEGATIVE_FUTURES_POSITIVE'
      || toNum(market.flow_quality?.spot_cvd_notional) < 0
      || !['STRUCTURAL_BUYING', 'SPOT_LED_ACCUMULATION'].includes(altFlow)
    )
  ) {
    modifier = -0.12;
    classification = 'BTC_STRONG_ALT_NOT_FOLLOWING';
    reason = 'BTC flow is constructive but the alt is not independently confirming; leveraged chase, negative spot CVD, or weak alt flow reduces long conviction.';
  } else if (['STRUCTURAL_BUYING', 'SPOT_LED_ACCUMULATION'].includes(btcFlow) && ['STRUCTURAL_BUYING', 'SPOT_LED_ACCUMULATION'].includes(altFlow)) {
    modifier = 0.08;
    classification = 'BTC_CONFIRMS_ALT_LONG_CONTEXT';
    reason = 'BTC and alt flow are aligned to the upside.';
  }
  return { role: 'display_only_phase1b_no_scoring', classification, alt_long_conviction_modifier: modifier, btc_flow: btcFlow, alt_flow: altFlow, reason };
}

async function main() {
  const historyRows = readJsonlTail(HISTORY_PATH, 12);
  const binanceFresh = readFreshJson(BINANCE_CONTEXT_PATH);
  const binanceSnapshot = binanceFresh.value;
  const backpackFullFresh = readFreshJson(BACKPACK_FULL_PATH);
  const backpackLiteFresh = readFreshJson(BACKPACK_LITE_PATH);
  const backpackFullSnapshot = backpackFullFresh.value;
  const backpackSnapshot = backpackLiteFresh.value;
  const diagnosticsState = readJson(DIAGNOSTICS_STATE_PATH, {});
  const backpackStaleReasons = [
    ...[backpackFullFresh, backpackLiteFresh].filter(r => r.stale).map(r => `backpack snapshot ${r.reason}`),
    ...(binanceFresh.stale ? [`binance context ${binanceFresh.reason}`] : []),
  ];
  const context = {
    timestamp_utc: nowIso(),
    phase: 'phase1_display_only_no_scoring',
    execution_truth: 'backpack',
    context_sources: ['binance', 'bybit', 'okx'],
    data_quality: backpackStaleReasons.length ? 'PARTIAL' : 'OK',
    degraded_reasons: [...backpackStaleReasons],
    markets: {},
    notes: [
      'Backpack order book is the execution source of truth.',
      'Binance/Bybit/OKX are context-only and must not override Backpack execution evidence.',
      'Options are intentionally excluded until explicit action rules exist.',
      'Phase 1b diagnostics are display-only and do not affect scores or alerts yet.',
    ],
  };

  for (const [asset, cfg] of Object.entries(MARKETS)) {
    const market = { asset, errors: [] };
    try { market.backpack = await fetchBackpackExecution(asset, cfg); }
    catch (e) { market.errors.push(`backpack: ${e.message}`); market.backpack = { role: 'execution_truth', venue: 'backpack', symbol: cfg.backpack, data_quality: 'DEGRADED', errors: [e.message] }; }
    market.binance = await fetchBinanceContext(asset, cfg).catch(e => ({ role: 'context_only', venue: 'binance', symbol: cfg.binance, data_quality: 'DEGRADED', errors: [e.message] }));
    market.bybit = await fetchBybitContext(asset, cfg).catch(e => ({ role: 'context_only', venue: 'bybit', symbol: cfg.bybit, data_quality: 'DEGRADED', errors: [e.message] }));
    market.okx = await fetchOkxContext(asset, cfg).catch(e => ({ role: 'context_only', venue: 'okx', symbol: cfg.okx, data_quality: 'DEGRADED', errors: [e.message] }));
    market.cross_exchange_positioning = classifyCrossExchange(market);
    market.flow_quality = classifyFlowQuality(market);
    market.flow_consensus = flowConsensus(asset, market.flow_quality.classification, historyRows, 4);
    market.oi_price_regime = classifyOiPriceRegime(asset, binanceSnapshot, backpackSnapshot);
    market.cvd_divergence = classifyCvdDivergence(market.flow_quality);
    market.failed_breakout_counter = updateFailedBreakoutCounter(asset, backpackFullSnapshot?.markets?.[asset] || backpackSnapshot?.markets?.[asset], diagnosticsState);
    market.long_horizon_regime = computeLongHorizonRegime(asset, backpackFullSnapshot || backpackSnapshot);
    market.data_quality = [market.backpack, market.binance, market.bybit, market.okx].filter(Boolean).some(v => v.data_quality === 'DEGRADED') ? 'PARTIAL' : 'OK';
    context.markets[asset] = market;
  }

  for (const [asset, market] of Object.entries(context.markets)) {
    market.btc_flow_gate = btcAltGate(asset, market, context.markets.BTC);
  }

  const degraded = [];
  for (const [asset, m] of Object.entries(context.markets)) {
    for (const v of [m.backpack, m.binance, m.bybit, m.okx].filter(Boolean)) {
      if (v.data_quality === 'DEGRADED') degraded.push(`${asset}/${v.venue}: ${(v.errors || []).join('; ')}`);
    }
  }
  if (degraded.length) {
    context.data_quality = 'PARTIAL';
    context.degraded_reasons = [...context.degraded_reasons, ...degraded];
  }

  for (const market of Object.values(context.markets)) {
    market.context_data_quality = context.data_quality;
    market.context_degraded_reasons = [...(context.degraded_reasons || [])];
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(DIAGNOSTICS_STATE_PATH, JSON.stringify(diagnosticsState, null, 2) + '\n');
  fs.writeFileSync(OUT_PATH, JSON.stringify(context, null, 2) + '\n');
  fs.appendFileSync(HISTORY_PATH, JSON.stringify(context) + '\n');

  process.stdout.write(JSON.stringify({ ok: true, timestamp_utc: context.timestamp_utc, data_quality: context.data_quality, markets: Object.keys(context.markets), out: path.relative(process.cwd(), OUT_PATH), history: path.relative(process.cwd(), HISTORY_PATH), degraded_reasons: context.degraded_reasons.slice(0, 5) }));
}

main().catch(e => {
  console.error(e?.stack || e?.message || String(e));
  process.exit(1);
});
