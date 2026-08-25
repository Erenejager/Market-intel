#!/usr/bin/env node
/**
 * Market Intelligence Orchestrator
 * Canonical deterministic runner for Market Intel.
 *
 * Responsibilities:
 * - refresh/load deterministic Backpack + Binance context
 * - inject that context into analysts so they do not silently fallback
 * - synthesize/validate signals consistently
 * - store one canonical run record
 * - print one clean final summary for cron/manual delivery
 *
 * Usage:
 *   node market-intel/orchestrator.js              # production run
 *   node market-intel/orchestrator.js --test all   # run without cooldown/delivery side effects
 *   node market-intel/orchestrator.js --test crypto_analyst
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { getCorrelationMatrix } = require('./correlation-matrix');

const ROOT = '/home/clawdbot/.openclaw/workspace/market-intel';
const DATA_DIR = path.join(ROOT, 'data');
const CONFIG_PATH = path.join(ROOT, 'config.json');
const SIGNALS_PATH = path.join(DATA_DIR, 'signals.json');
const TRIGGER_STATE_PATH = path.join(DATA_DIR, 'trigger-state.json');
const OUTCOME_EVENTS_PATH = path.join(DATA_DIR, 'signal-outcome-events.jsonl');
const AGENTS_DIR = path.join(ROOT, 'agents');
const MAX_CONTEXT_AGE_MS = 45 * 60 * 1000;

const args = process.argv.slice(2);
const testMode = args.includes('--test');
const testArg = args.includes('--test') ? args[args.indexOf('--test') + 1] : 'all';
const skipRefresh = args.includes('--skip-refresh');
const alertOnly = args.includes('--alert-only');

let config;
try {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
} catch (e) {
  console.error(`Failed to load config: ${e.message}`);
  process.exit(1);
}

const AGENTS = {
  crypto_analyst: {
    label: 'Crypto Analyst',
    instructionFile: 'crypto-analyst.md',
    timeout: config.agents?.crypto_analyst?.timeout_seconds || 420,
    enabled: config.agents?.crypto_analyst?.enabled !== false,
    buildTaskSuffix: (ctx) => `
Analyze BTC, ETH, and SOL perp markets on Backpack.

Use Backpack as venue truth for price, candles, levels, ATR, entries, stops, targets, and venue execution context.
Use Binance USD-M as the primary market-wide derivatives context for funding/crowding, OI change, taker buy/sell flow, basis, and funding streak.

${ctx.backpackSnapshot ? `BACKPACK_SNAPSHOT:\n${JSON.stringify(ctx.backpackSnapshot)}` : 'BACKPACK_SNAPSHOT: unavailable or stale; use Backpack public fallback and reduce conviction.'}

${ctx.binanceContext ? `BINANCE_CONTEXT:\n${JSON.stringify(ctx.binanceContext)}` : 'BINANCE_CONTEXT: unavailable or stale; set market-wide funding/OI/taker-flow interpretation to UNKNOWN and do not assume NEUTRAL.'}

Return ONLY valid JSON array with exactly BTC, ETH, and SOL objects. No markdown, no explanations.`
  },
  gold_analyst: {
    label: 'Gold Analyst',
    instructionFile: 'gold-analyst.md',
    timeout: config.agents?.gold_analyst?.timeout_seconds || 180,
    enabled: config.agents?.gold_analyst?.enabled !== false,
    buildTaskSuffix: (ctx) => `
Analyze PAXG/GOLD perp market on Backpack.

Use Backpack as venue truth for executable price, candles, levels, ATR, entries, stops, and targets.
Use Binance PAXGUSDT only as secondary market-wide derivatives context.

${ctx.backpackSnapshot ? `BACKPACK_SNAPSHOT:\n${JSON.stringify(ctx.backpackSnapshot)}` : 'BACKPACK_SNAPSHOT: unavailable or stale; use fallback and reduce conviction.'}

${ctx.binanceContext ? `BINANCE_CONTEXT:\n${JSON.stringify(ctx.binanceContext)}` : 'BINANCE_CONTEXT: unavailable or stale; ignore Binance boosts.'}

Return ONLY valid JSON object. No markdown, no explanations.`
  },
  macro_scout: {
    label: 'Macro Scout',
    instructionFile: 'macro-scout.md',
    timeout: config.agents?.macro_scout?.timeout_seconds || 240,
    enabled: config.agents?.macro_scout?.enabled !== false,
    buildTaskSuffix: (ctx) => `
Scan the macro landscape. Use market-environment-analysis and web_search.

If available, use these cached extras as context:
${ctx.extras?.usdIndex ? `USD_INDEX_CACHE:\n${JSON.stringify(ctx.extras.usdIndex)}` : 'USD_INDEX_CACHE: unavailable.'}
${ctx.extras?.yields ? `YIELDS_CACHE:\n${JSON.stringify(ctx.extras.yields)}` : 'YIELDS_CACHE: unavailable.'}
${ctx.extras?.vix ? `VIX_CACHE:\n${JSON.stringify(ctx.extras.vix)}` : 'VIX_CACHE: unavailable.'}

Return ONLY valid JSON object with summary, risk_sentiment, risk_off_driver, vix, usd_pressure, yield_pressure, key_events. No markdown, no explanations.`
  },
  sentiment_radar: {
    label: 'Sentiment Radar',
    instructionFile: 'sentiment-radar.md',
    timeout: config.agents?.sentiment_radar?.timeout_seconds || 180,
    enabled: config.agents?.sentiment_radar?.enabled !== false,
    buildTaskSuffix: (ctx) => `
Gauge market sentiment. Use fear-greed and web_search.

If available, use this cached Fear & Greed data:
${ctx.extras?.fearGreed ? `CRYPTO_FEAR_GREED_CACHE:\n${JSON.stringify(ctx.extras.fearGreed)}` : 'CRYPTO_FEAR_GREED_CACHE: unavailable.'}

Return ONLY valid JSON object with crypto_sentiment and gold_sentiment. No markdown, no explanations.`
  }
};

function refreshDeterministicData() {
  if (skipRefresh) return;
  const scripts = [
    'fetch-backpack-snapshot.js',
    'fetch-extras-cache.js',
    'fetch-binance-context.js',
    'fetch-market-microstructure.js'
  ];

  for (const script of scripts) {
    try {
      execFileSync('node', [path.join(ROOT, 'scripts', script)], {
        cwd: path.dirname(ROOT),
        stdio: testMode ? 'inherit' : 'pipe',
        timeout: 120000
      });
    } catch (e) {
      // Fail soft: stale/missing context will be detected and conviction reduced.
      console.warn(`Context refresh warning (${script}): ${e.message}`);
    }
  }
}

function readFreshJson(relativePath, maxAgeMs = MAX_CONTEXT_AGE_MS) {
  const fullPath = path.join(ROOT, relativePath);
  try {
    const json = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const ts = Date.parse(json.timestamp_utc || json.timestamp || json.updated_at || '');
    if (!Number.isFinite(ts)) return { value: json, stale: false, reason: 'no timestamp' };
    const ageMs = Date.now() - ts;
    if (ageMs > maxAgeMs) return { value: null, stale: true, reason: `stale ${Math.round(ageMs / 60000)}m` };
    return { value: json, stale: false, reason: null };
  } catch (e) {
    return { value: null, stale: false, reason: e.message };
  }
}

function loadPreFetchedContext() {
  const backpack = readFreshJson('data/backpack-snapshot-lite.json');
  const binance = readFreshJson('data/binance-context.json');
  const fearGreed = readFreshJson('data/extras/crypto-fear-greed.json', 24 * 60 * 60 * 1000);
  const usdIndex = readFreshJson('data/extras/usd-index.json', 24 * 60 * 60 * 1000);
  const yields = readFreshJson('data/extras/yields.json', 24 * 60 * 60 * 1000);
  const vix = readFreshJson('data/extras/vix.json', 24 * 60 * 60 * 1000);
  const microstructure = readFreshJson('data/microstructure-context.json');

  return {
    backpackSnapshot: backpack.value,
    binanceContext: binance.value,
    microstructureContext: microstructure.value,
    extras: {
      fearGreed: fearGreed.value,
      usdIndex: usdIndex.value,
      yields: yields.value,
      vix: vix.value
    },
    contextStatus: {
      backpack: backpack.value ? 'OK' : `MISSING_OR_STALE: ${backpack.reason}`,
      binance: binance.value ? 'OK' : `MISSING_OR_STALE: ${binance.reason}`,
      microstructure: microstructure.value ? 'OK' : `MISSING_OR_STALE: ${microstructure.reason}`,
      fearGreed: fearGreed.value ? 'OK' : `MISSING_OR_STALE: ${fearGreed.reason}`,
      usdIndex: usdIndex.value ? 'OK' : `MISSING_OR_STALE: ${usdIndex.reason}`,
      yields: yields.value ? 'OK' : `MISSING_OR_STALE: ${yields.reason}`,
      vix: vix.value ? 'OK' : `MISSING_OR_STALE: ${vix.reason}`
    }
  };
}

async function orchestrate() {
  if (testMode) {
    console.log('Market Intelligence Orchestrator');
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Mode: TEST (${testArg || 'all'})`);
  }

  refreshDeterministicData();
  const ctx = loadPreFetchedContext();

  const results = {};
  const errors = [];
  const agentsToRun = testMode && testArg && testArg !== 'all'
    ? { [testArg]: AGENTS[testArg] }
    : Object.fromEntries(Object.entries(AGENTS).filter(([, cfg]) => cfg.enabled));

  for (const [agentId, agentConfig] of Object.entries(agentsToRun)) {
    if (!agentConfig) {
      errors.push({ agentId, error: 'unknown agent' });
      continue;
    }
  }

  const spawnPromises = Object.entries(agentsToRun)
    .filter(([, agentConfig]) => agentConfig)
    .map(([agentId, agentConfig]) => spawnAgent(agentId, agentConfig, ctx)
      .then(result => ({ agentId, result, success: true }))
      .catch(error => ({ agentId, error, success: false }))
    );

  const spawnResults = await Promise.all(spawnPromises);
  for (const item of spawnResults) {
    if (item.success) results[item.agentId] = item.result;
    else errors.push({ agentId: item.agentId, error: item.error.message });
  }

  let correlationMatrix = null;
  try {
    correlationMatrix = await getCorrelationMatrix(false);
  } catch (err) {
    errors.push({ agentId: 'correlation_matrix', warning: err.message });
  }

  const synthesized = synthesizeSignals(results, ctx, correlationMatrix, errors);
  validateSynthesizedSignals(synthesized);
  applyConfluence(synthesized);
  applySemanticTriggerGates(synthesized, { dryRun: testMode });
  applyPhase1bShadowScoring(synthesized);
  synthesized.delivery = evaluateDelivery(synthesized, testMode);

  const summary = formatMarketBrief(synthesized);
  synthesized.summary_artifact = writeSummaryArtifacts(synthesized, summary);
  storeSignals(synthesized);

  const output = alertOnly && !shouldAnnounceAlertOnly(synthesized) ? 'NO_REPLY' : summary;
  console.log(output);
  return { success: errors.filter(e => e.error).length === 0, results, errors, synthesized, summary: output };
}

async function spawnAgent(agentId, agentConfig, ctx) {
  const instructionPath = path.join(AGENTS_DIR, agentConfig.instructionFile);
  const instructions = fs.readFileSync(instructionPath, 'utf8');
  const task = `${instructions}\n\n---\n\n${agentConfig.buildTaskSuffix(ctx)}\n\nCRITICAL: Return ONLY valid JSON. No markdown code blocks, no preamble, no explanations. Start your response with { or [ and end with } or ]`;

  const sessions = global.sessions_spawn || global.sessions_spawn_internal || null;
  if (sessions) {
    const spawnResult = await sessions({
      task,
      label: `${agentId}-run`,
      cleanup: 'delete',
      runTimeoutSeconds: agentConfig.timeout,
      timeoutSeconds: agentConfig.timeout
    });
    return parseAgentJson(agentId, spawnResult.response || spawnResult.message || '');
  }

  // Fallback for direct Node execution outside OpenClaw's JS runtime.
  // This keeps orchestrator.js usable from cron/manual shell paths.
  const out = execFileSync('openclaw', [
    'agent',
    '--agent', 'main',
    '--session-id', `${agentId}-${Date.now()}`,
    '--message', task,
    '--timeout', String(agentConfig.timeout)
  ], {
    cwd: path.dirname(ROOT),
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
    timeout: (agentConfig.timeout + 30) * 1000
  });
  return parseAgentJson(agentId, out);
}

function parseAgentJson(agentId, responseText) {
  let jsonText = String(responseText || '').trim();
  const fenced = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) jsonText = fenced[1].trim();

  const firstObj = jsonText.search(/[\[{]/);
  const lastObj = Math.max(jsonText.lastIndexOf('}'), jsonText.lastIndexOf(']'));
  if (firstObj >= 0 && lastObj > firstObj) jsonText = jsonText.slice(firstObj, lastObj + 1);

  try {
    return JSON.parse(jsonText);
  } catch (parseError) {
    throw new Error(`JSON parse error in ${agentId}: ${parseError.message}; sample=${jsonText.slice(0, 300)}`);
  }
}

function synthesizeSignals(results, ctx, correlationMatrix = null, errors = []) {
  const timestamp = new Date().toISOString();
  const signals = [];

  const macro = results.macro_scout || {};
  const sentiment = results.sentiment_radar || {};

  if (results.crypto_analyst) {
    const cryptoSignals = Array.isArray(results.crypto_analyst) ? results.crypto_analyst : [results.crypto_analyst];
    for (const sig of cryptoSignals) signals.push(normalizeSignal(sig, 'crypto_analyst', timestamp));
  }

  if (results.gold_analyst) signals.push(normalizeSignal(results.gold_analyst, 'gold_analyst', timestamp));

  const macroStructured = buildMacroStructure(macro, ctx);

  return {
    timestamp,
    mode: testMode ? 'test' : 'production',
    context_status: ctx.contextStatus,
    macro_summary: macro.summary || macro.macro_summary || macro.risk_sentiment || null,
    macro_risk_sentiment: macroStructured.risk_regime,
    macro_structured: macroStructured,
    macro_vix: macroStructured.vix,
    macro_key_events: Array.isArray(macro.key_events) ? macro.key_events : [],
    sentiment_summary: sentiment.summary || sentiment.interpretation || sentiment.crypto_sentiment?.interpretation || null,
    sentiment_bias: sentiment.crypto_sentiment?.signal_bias || sentiment.signal_bias || null,
    sentiment_fear_greed: firstFinite(sentiment.crypto_sentiment?.fear_greed, sentiment.crypto_sentiment?.fear_greed_value, ctx.extras?.fearGreed?.fear_greed?.value),
    signals,
    errors,
    execution_context: buildExecutionContext(ctx.backpackSnapshot),
    microstructure_context: ctx.microstructureContext,
    cross_asset_context: buildCrossAssetContext(signals, correlationMatrix),
    correlation_warnings: correlationMatrix?.warnings || [],
    delivery_threshold: config.thresholds?.immediate_alert || 0.70,
    include_threshold: config.thresholds?.include_in_digest || 0.50
  };
}

function buildMacroStructure(macro, ctx) {
  const vix = firstFinite(
    macro?.vix,
    macro?.vix?.value,
    ctx?.extras?.vix?.vix?.value,
    extractVix(macro)
  );
  const usd = firstFinite(ctx?.extras?.usdIndex?.usd_index?.value, macro?.usd_index, macro?.usd?.value);
  const dgs10 = firstFinite(ctx?.extras?.yields?.yields?.dgs10?.value, macro?.dgs10, macro?.ten_year_yield);
  const breakeven10y = firstFinite(ctx?.extras?.yields?.yields?.t10yie?.value, macro?.t10yie, macro?.inflation_expectations);
  const realYieldProxy = Number.isFinite(dgs10) && Number.isFinite(breakeven10y) ? +(dgs10 - breakeven10y).toFixed(2) : null;
  const text = `${macro?.summary || ''} ${macro?.risk_sentiment || macro?.risk || ''} ${macro?.risk_off_driver || ''}`.toLowerCase();
  const riskRegime = normalizeRiskRegime(macro?.risk_sentiment || macro?.risk, vix, text);
  return {
    risk_regime: riskRegime,
    risk_off_driver: macro?.risk_off_driver || inferRiskOffDriver(text),
    vix: Number.isFinite(vix) ? vix : null,
    vix_tier: vixTier(vix),
    usd_index: Number.isFinite(usd) ? usd : null,
    usd_pressure: macro?.usd_pressure || inferUsdPressure(usd, text),
    ten_year_yield: Number.isFinite(dgs10) ? dgs10 : null,
    ten_year_breakeven: Number.isFinite(breakeven10y) ? breakeven10y : null,
    real_yield_proxy: realYieldProxy,
    yield_pressure: macro?.yield_pressure || inferYieldPressure(dgs10, realYieldProxy, text)
  };
}

function firstFinite(...values) {
  for (const value of values) {
    if (value === null || value === undefined || value === '') continue;
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function normalizeRiskRegime(raw, vix, text) {
  const s = String(raw || '').toUpperCase();
  if (s.includes('RISK_OFF') || s.includes('RISK-OFF')) return 'RISK_OFF';
  if (s.includes('RISK_ON') || s.includes('RISK-ON')) return Number.isFinite(vix) && vix >= 20 ? 'NEUTRAL' : 'RISK_ON';
  if (Number.isFinite(vix) && vix >= 30) return 'RISK_OFF';
  if (Number.isFinite(vix) && vix >= 20) return 'NEUTRAL';
  if (text.includes('risk-off') || text.includes('risk off')) return 'RISK_OFF';
  if (text.includes('risk-on') || text.includes('risk on')) return 'RISK_ON';
  return 'NEUTRAL';
}

function vixTier(vix) {
  if (!Number.isFinite(vix)) return 'UNKNOWN';
  if (vix < 20) return 'MILD';
  if (vix < 30) return 'ELEVATED';
  return 'SEVERE';
}

function inferRiskOffDriver(text) {
  if (/war|geopolit|sanction|oil shock|safe[- ]haven|middle east/.test(text)) return 'GEOPOLITICAL';
  if (/yield|hawkish|fed|rates?|inflation|usd|dollar/.test(text)) return 'RATES_USD';
  if (/growth|recession|unemployment|jobs|credit|bank/.test(text)) return 'GROWTH_CREDIT';
  return 'MIXED_OR_UNKNOWN';
}

function inferUsdPressure(usd, text) {
  if (/strong usd|strong dollar|firm usd|firm dollar/.test(text)) return 'HIGH';
  if (/weak usd|weak dollar|soft usd|soft dollar/.test(text)) return 'LOW';
  if (Number.isFinite(usd) && usd >= 115) return 'HIGH';
  if (Number.isFinite(usd) && usd <= 105) return 'LOW';
  return 'NEUTRAL_OR_UNKNOWN';
}

function inferYieldPressure(dgs10, realYieldProxy, text) {
  if (/high yield|higher yield|restrictive|hawkish/.test(text)) return 'HIGH';
  if (/falling yield|lower yield|dovish/.test(text)) return 'LOW';
  if (Number.isFinite(realYieldProxy) && realYieldProxy >= 1.5) return 'HIGH';
  if (Number.isFinite(dgs10) && dgs10 >= 4.25) return 'HIGH';
  if (Number.isFinite(dgs10) && dgs10 <= 3.5) return 'LOW';
  return 'NEUTRAL_OR_UNKNOWN';
}

function normalizeSignal(sig, source, timestamp) {
  const asset = sig.asset || (source === 'gold_analyst' ? 'PAXG' : 'UNKNOWN');
  const strength = clampNumber(sig.strength ?? sig.strength_adjusted ?? 0, 0, 0.95);
  return {
    timestamp,
    source,
    asset,
    signal: sig.signal || 'WATCH',
    strength_original: strength,
    strength,
    reasoning: sig.reasoning || sig.thesis || sig.interpretation || '',
    playbooks: sig.timeframes || sig.playbooks || null,
    metadata: {
      price_current: toNum(sig.price_current),
      price_24h_change: toNum(sig.price_24h_change),
      venue_funding_backpack: toNum(sig.venue_funding_backpack ?? sig.backpack_funding_rate),
      market_funding_binance: toNum(sig.market_funding_binance ?? sig.binance_context?.last_funding_rate ?? sig.binance_context?.funding_rate),
      funding_rate_reported: toNum(sig.funding_rate),
      funding_interpretation: sig.funding_interpretation,
      open_interest: toNum(sig.open_interest),
      oi_change_bias: sig.oi_change_bias,
      whale_activity: sig.whale_activity || sig.whale_bias || null,
      binance_context: sig.binance_context || null,
      sources: sig.sources || []
    }
  };
}

function buildExecutionContext(backpackSnapshot) {
  const markets = backpackSnapshot?.markets || backpackSnapshot;
  if (!markets || typeof markets !== 'object') return { source: 'backpack', markets: {} };
  const out = {};
  for (const [asset, market] of Object.entries(markets)) {
    if (!market || typeof market !== 'object') continue;
    const key = market.asset || asset;
    out[key] = {
      symbol: market.symbol || null,
      price: toNum(market.ticker?.lastPrice),
      price_24h_change: toNum(market.ticker?.priceChangePercent),
      atr_1h: toNum(market.derived?.atr_14_1h),
      atr_4h: toNum(market.derived?.atr_14_4h),
      trend_4h: market.derived?.trend_4h || null,
      levels_1h: market.derived?.levels_1h || null,
      last_1h_candle: normalizeCandle(market.last_1h_candle),
      last_4h_candle: normalizeCandle(market.last_4h_candle)
    };
  }
  return {
    source: 'backpack',
    timestamp_utc: backpackSnapshot?.timestamp_utc || null,
    markets: out
  };
}

function normalizeCandle(candle) {
  if (!candle || typeof candle !== 'object') return null;
  return {
    start: candle.start || null,
    end: candle.end || null,
    open: toNum(candle.open),
    high: toNum(candle.high),
    low: toNum(candle.low),
    close: toNum(candle.close),
    volume: toNum(candle.volume),
    trades: toNum(candle.trades)
  };
}

function buildCrossAssetContext(signals, correlationMatrix) {
  const byAsset = Object.fromEntries(signals.map(s => [s.asset, s]));
  const pair = correlationMatrix?.correlations?.find(c => c.pair === 'BTC-ETH' || c.pair === 'ETH-BTC') || null;
  const metrics = {};
  for (const asset of ['BTC', 'ETH', 'SOL']) {
    const sig = byAsset[asset];
    const bn = sig?.metadata?.binance_context || {};
    metrics[asset] = {
      signal: sig?.signal || 'UNKNOWN',
      strength: sig?.strength ?? null,
      price_24h_change: sig?.metadata?.price_24h_change ?? null,
      oi_change_4h: toNum(bn.oi_change_4h),
      taker_buy_share_4h: toNum(bn.taker_buy_share_4h),
      funding_streak_sign: String(bn.funding_streak_sign || bn.funding_streak?.sign || '').toUpperCase() || 'UNKNOWN',
      funding_streak_hours: toNum(bn.funding_streak_hours ?? bn.funding_streak?.estimated_hours)
    };
  }
  return {
    btc_eth_correlation: pair ? pair.correlation : null,
    btc_eth_correlation_days: pair ? pair.days : null,
    metrics
  };
}

function validateSynthesizedSignals(synthesized) {
  const ranges = {
    BTC: [40000, 200000],
    ETH: [1000, 15000],
    SOL: [20, 500],
    PAXG: [3000, 10000],
    GOLD: [3000, 10000],
    GOLD_FUTURES: [3000, 10000]
  };
  const failures = [];
  for (const sig of synthesized.signals) {
    const price = sig.metadata?.price_current;
    const range = ranges[sig.asset];
    if (range && Number.isFinite(price) && (price < range[0] || price > range[1])) {
      failures.push(`${sig.asset} price ${price} outside ${range[0]}-${range[1]}`);
    }
  }
  if (failures.length) {
    synthesized.validation_failed = true;
    synthesized.errors.push({ agentId: 'validation', error: failures.join('; ') });
    synthesized.signals = synthesized.signals.map(s => ({ ...s, signal: 'HOLD', strength: 0, reasoning: `Validation failed: ${failures.join('; ')}` }));
  }
}

function applyConfluence(synthesized) {
  const macro = String(synthesized.macro_risk_sentiment || synthesized.macro_summary || '').toUpperCase();
  const sentimentBias = String(synthesized.sentiment_bias || '').toUpperCase();
  synthesized.event_timing = assessEventTiming(synthesized.macro_key_events || []);

  for (const sig of synthesized.signals) {
    const adjustments = [];
    let delta = 0;

    if ((macro.includes('RISK_OFF') || macro.includes('RISK-OFF')) && isCrypto(sig.asset) && sig.signal === 'BUY') {
      const macroPenalty = macroCryptoRiskAdjustment(synthesized.macro_vix);
      if (macroPenalty !== 0) { delta += macroPenalty; adjustments.push(`macro risk-off/VIX ${synthesized.macro_vix ?? 'unknown'} weighs on crypto ${formatSigned(macroPenalty)}`); }
    }
    if ((macro.includes('RISK_ON') || macro.includes('RISK-ON')) && isCrypto(sig.asset) && sig.signal === 'BUY') {
      const macroBoost = macroCryptoRiskOnAdjustment(synthesized.macro_vix);
      if (macroBoost !== 0) { delta += macroBoost; adjustments.push(`macro risk-on/VIX ${synthesized.macro_vix ?? 'unknown'} supports crypto ${formatSigned(macroBoost)}`); }
    }
    if (isGold(sig.asset) && sig.signal === 'BUY') {
      const goldMacro = goldMacroAdjustment(synthesized);
      if (goldMacro.delta !== 0) { delta += goldMacro.delta; adjustments.push(`${goldMacro.reason} ${formatSigned(goldMacro.delta)}`); }
    }
    if (isCrypto(sig.asset) && sig.signal === 'BUY' && hasExtremeFearContrarianSignal(synthesized.sentiment_summary, synthesized.sentiment_fear_greed)) {
      delta += 0.05; adjustments.push('extreme fear contrarian crypto boost +0.05');
    }
    if (sentimentBias && ['BUY', 'SELL'].includes(sig.signal)) {
      if (sentimentBias === sig.signal) { delta += 0.05; adjustments.push('sentiment confirms direction +0.05'); }
      else if (['BUY', 'SELL'].includes(sentimentBias)) { delta -= 0.05; adjustments.push('sentiment conflicts with direction -0.05'); }
    }

    const whale = String(sig.metadata?.whale_activity || '').toUpperCase();
    if (whale.includes('STRONG_ACCUMULATION')) {
      if (sig.signal === 'BUY') { delta += 0.10; adjustments.push('strong whale accumulation confirms BUY +0.10'); }
      if (sig.signal === 'SELL') { delta -= 0.10; adjustments.push('strong whale accumulation conflicts with SELL -0.10'); }
    } else if (whale.includes('ACCUMULATION')) {
      if (sig.signal === 'BUY') { delta += 0.05; adjustments.push('whale accumulation confirms BUY +0.05'); }
      if (sig.signal === 'SELL') { delta -= 0.05; adjustments.push('whale accumulation conflicts with SELL -0.05'); }
    } else if (whale.includes('STRONG_DISTRIBUTION')) {
      if (sig.signal === 'BUY') { delta -= 0.10; adjustments.push('strong whale distribution conflicts with BUY -0.10'); }
      if (sig.signal === 'SELL') { delta += 0.10; adjustments.push('strong whale distribution confirms SELL +0.10'); }
    } else if (whale.includes('DISTRIBUTION')) {
      if (sig.signal === 'BUY') { delta -= 0.05; adjustments.push('whale distribution conflicts with BUY -0.05'); }
      if (sig.signal === 'SELL') { delta += 0.05; adjustments.push('whale distribution confirms SELL +0.05'); }
    }

    const bn = sig.metadata?.binance_context || {};
    const fundingSign = String(bn.funding_streak_sign || bn.funding_streak?.sign || '').toUpperCase();
    const fundingHours = toNum(bn.funding_streak_hours ?? bn.funding_streak?.estimated_hours);
    if (sig.signal === 'BUY' && fundingSign === 'POSITIVE' && fundingHours >= 48) {
      delta -= 0.05; adjustments.push('Binance positive funding streak >=48h crowded-long caution -0.05');
    }
    if (sig.signal === 'BUY' && fundingSign === 'NEGATIVE' && fundingHours >= 24 && isCrypto(sig.asset)) {
      const state = classifyOiTakerFundingState(bn);
      if (state === 'SQUEEZE_CONFIRMED') {
        delta += 0.03; adjustments.push('Binance negative funding streak with OI/taker confirmation squeeze support +0.03');
      } else {
        adjustments.push(`Binance negative funding streak = ${state}; no squeeze boost without OI/taker confirmation`);
      }
    }

    sig.strength = clampNumber(sig.strength + delta, 0, 0.95);
    sig.confluence_adjustments = adjustments;
  }

  applyOiFlowGuard(synthesized);
  applyCrossAssetDivergence(synthesized);
  synthesized.signals.sort((a, b) => b.strength - a.strength);
}

function applySemanticTriggerGates(synthesized, { dryRun = false } = {}) {
  const now = Date.now();
  const state = readJsonFile(TRIGGER_STATE_PATH, {});
  const events = [];

  for (const sig of synthesized.signals) {
    if (!['BUY', 'SELL'].includes(sig.signal)) continue;
    const gate = assessTriggerGate(sig, synthesized.execution_context, state, now);
    sig.trigger_gate = gate;

    const key = `${sig.asset}:${sig.signal}`;
    const previous = state[key] || {};
    const nextState = {
      ...previous,
      asset: sig.asset,
      signal: sig.signal,
      trigger: gate.trigger,
      state: gate.state,
      last_price: gate.price,
      last_checked_at: synthesized.timestamp
    };

    if (gate.state === 'TRIGGER_CONFIRMED') {
      nextState.confirmed_at = synthesized.timestamp;
      nextState.cooldown_until_ms = null;
    } else if (gate.state === 'TRIGGER_TESTED_FAILED') {
      nextState.failed_at = synthesized.timestamp;
      nextState.failed_price = gate.price;
      nextState.failed_trigger = gate.trigger;
      nextState.cooldown_until_ms = now + triggerCooldownMs(sig);
    }
    state[key] = nextState;

    if (gate.blockBuy) {
      const originalSignal = sig.signal;
      const originalStrength = sig.strength;
      sig.signal = 'WATCH';
      sig.strength = Math.min(sig.strength, gate.capStrength);
      applySignalAdjustment(sig, 0, gate.reason);
      events.push(buildOutcomeEvent(synthesized, sig, {
        key,
        blocked_signal: originalSignal,
        blocked_strength: originalStrength,
        gate
      }));
    }
  }

  if (!dryRun) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(TRIGGER_STATE_PATH, JSON.stringify(state, null, 2));
    appendJsonl(OUTCOME_EVENTS_PATH, events);
  }
  synthesized.trigger_gate_summary = Object.fromEntries(synthesized.signals
    .filter(s => s.trigger_gate)
    .map(s => [s.asset, s.trigger_gate]));
  synthesized.signals.sort((a, b) => b.strength - a.strength);
}

function assessTriggerGate(sig, executionContext = {}, state = {}, now = Date.now()) {
  const direction = sig.signal;
  const assetCtx = executionContext?.markets?.[sig.asset] || {};
  const price = firstFinite(assetCtx.price, sig.metadata?.price_current);
  const candle = assetCtx.last_1h_candle || {};
  const trigger = deriveTriggerPrice(sig, direction);
  const key = `${sig.asset}:${direction}`;
  const previous = state[key] || {};
  const cooldownActive = Number(previous.cooldown_until_ms) > now;

  if (!Number.isFinite(trigger) || !Number.isFinite(price)) {
    return {
      state: 'UNKNOWN',
      pass: false,
      blockBuy: true,
      capStrength: 0.60,
      trigger: Number.isFinite(trigger) ? trigger : null,
      price: Number.isFinite(price) ? price : null,
      reason: 'semantic trigger gate: trigger/price unavailable → capped at WATCH until explicit confirmation exists'
    };
  }

  const tolerance = trigger * 0.001; // 0.10% trigger-test tolerance.
  const high = toNum(candle.high);
  const low = toNum(candle.low);
  const close = firstFinite(candle.close, price);

  const confirmed = direction === 'BUY' ? price >= trigger : price <= trigger;
  const tested = direction === 'BUY'
    ? Number.isFinite(high) && high >= trigger - tolerance
    : Number.isFinite(low) && low <= trigger + tolerance;
  const failed = tested && (direction === 'BUY' ? close < trigger : close > trigger);

  if (cooldownActive) {
    return {
      state: 'RESET_REQUIRED',
      pass: false,
      blockBuy: true,
      capStrength: 0.58,
      trigger,
      price,
      cooldown_until_ms: previous.cooldown_until_ms,
      reason: `semantic trigger gate: prior ${direction} trigger test failed; cooldown/reset required before BUY can reassert`
    };
  }

  if (confirmed) {
    return { state: 'TRIGGER_CONFIRMED', pass: true, blockBuy: false, capStrength: sig.strength, trigger, price, reason: `trigger confirmed at ${trigger}` };
  }
  if (failed) {
    return {
      state: 'TRIGGER_TESTED_FAILED',
      pass: false,
      blockBuy: true,
      capStrength: 0.58,
      trigger,
      price,
      reason: `semantic trigger gate: ${direction} trigger ${formatPrice(trigger)} tested but not held → WATCH + cooldown`
    };
  }
  return {
    state: 'TRIGGER_PENDING',
    pass: false,
    blockBuy: true,
    capStrength: 0.62,
    trigger,
    price,
    reason: `semantic trigger gate: ${direction} trigger ${formatPrice(trigger)} not fired → max WATCH`
  };
}

function deriveTriggerPrice(sig, direction) {
  const intraday = sig.playbooks?.intraday_1h || sig.playbooks?.intraday || sig.playbooks?.['1h'] || null;
  const entry = intraday?.entry || null;
  const explicit = firstFinite(intraday?.breakout_trigger, intraday?.trigger, sig.metadata?.trigger_price);
  if (Number.isFinite(explicit)) return explicit;
  const fromOrderType = parseTriggerFromOrderType(entry?.order_type, direction);
  if (Number.isFinite(fromOrderType)) return fromOrderType;
  const range = Array.isArray(entry?.range) ? entry.range.map(toNum).filter(Number.isFinite) : [];
  if (range.length) return direction === 'BUY' ? Math.max(...range) : Math.min(...range);
  const optimal = toNum(entry?.optimal ?? intraday?.preferred_entry ?? intraday?.preferred_entry_zone?.[0]);
  if (Number.isFinite(optimal)) return optimal;
  return null;
}

function parseTriggerFromOrderType(orderType, direction) {
  const text = String(orderType || '').toLowerCase();
  if (!text) return null;
  const patterns = direction === 'BUY'
    ? [/(?:above|reclaim|breakout[_ -]?stop[_ -]?above)[_ -]*(\d+(?:\.\d+)?)/i]
    : [/(?:below|breakdown[_ -]?below)[_ -]*(\d+(?:\.\d+)?)/i];
  for (const pattern of patterns) {
    const m = text.match(pattern);
    if (m) return toNum(m[1]);
  }
  return null;
}

function triggerCooldownMs(sig) {
  // Phase 1 intraday default: 1 hour. Swing cooldown can be extended later when state horizon is explicit.
  return 60 * 60 * 1000;
}

function buildOutcomeEvent(synthesized, sig, details) {
  const gate = details.gate || {};
  const base = {
    timestamp: synthesized.timestamp,
    type: 'semantic_gate_block',
    asset: sig.asset,
    blocked_signal: details.blocked_signal,
    blocked_strength: details.blocked_strength,
    final_signal: sig.signal,
    final_strength: sig.strength,
    gate_state: gate.state,
    blocked_reason: gate.reason,
    counterfactual_anchor: 'trigger_price',
    trigger_price: gate.trigger,
    price_at_signal: gate.price,
    stop: extractStop(sig),
    targets: extractTargets(sig),
    outcome_status: 'pending'
  };
  return { id: stableEventId(base), ...base };
}

function stableEventId(event) {
  return crypto.createHash('sha256')
    .update(JSON.stringify({ timestamp: event.timestamp, type: event.type, asset: event.asset, blocked_signal: event.blocked_signal, trigger_price: event.trigger_price }))
    .digest('hex')
    .slice(0, 16);
}

function extractStop(sig) {
  const stop = sig.playbooks?.intraday_1h?.stop_loss?.price ?? sig.playbooks?.intraday_1h?.stop ?? null;
  return toNum(stop);
}

function extractTargets(sig) {
  const tp = sig.playbooks?.intraday_1h?.take_profit || sig.playbooks?.intraday_1h?.targets || null;
  if (Array.isArray(tp)) return tp.map(toNum).filter(Number.isFinite);
  if (tp && typeof tp === 'object') return Object.values(tp).map(v => toNum(v?.price ?? v)).filter(Number.isFinite);
  return [];
}

function readJsonFile(filePath, fallback) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return fallback; }
}

function appendJsonl(filePath, rows) {
  if (!rows?.length) return;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, rows.map(row => JSON.stringify(row)).join('\n') + '\n');
}

function formatPrice(value) {
  return Number.isFinite(value) ? Number(value.toFixed(value >= 1000 ? 2 : 4)).toString() : 'unknown';
}

function applyOiFlowGuard(synthesized) {
  for (const sig of synthesized.signals) {
    if (!isCrypto(sig.asset) || sig.signal !== 'BUY') continue;
    const bn = sig.metadata?.binance_context || {};
    const state = classifyOiTakerFundingState(bn);
    if (state === 'FLUSH_DELEVERAGING') {
      sig.signal = 'WATCH';
      sig.strength = Math.min(sig.strength, 0.55);
      applySignalAdjustment(sig, 0, 'OI contracting + taker flow weak on 4h and 30m → BUY downgraded to WATCH; negative funding treated as deleveraging, not squeeze fuel');
    } else if (state === 'POST_FLUSH_RECOVERY') {
      applySignalAdjustment(sig, -0.06, '4h OI/taker weak but 30m recovery visible → cautious post-flush BUY penalty -0.06');
    } else if (state === 'SQUEEZE_POTENTIAL') {
      sig.strength = Math.min(sig.strength, 0.60);
      applySignalAdjustment(sig, 0, 'negative funding without full OI/taker confirmation → strength capped at 60%');
    }
  }
}

function classifyOiTakerFundingState(bn = {}) {
  const oi4h = toNum(bn.oi_change_4h ?? bn.open_interest?.change_4h);
  const oi30m = toNum(bn.oi_change_30m ?? bn.open_interest?.change_30m);
  const taker4h = toNum(bn.taker_buy_share_4h ?? bn.taker_flow?.window_4h?.buy_share);
  const taker30m = toNum(bn.taker_buy_share_30m ?? bn.taker_flow?.window_30m?.buy_share);

  if ([oi4h, oi30m, taker4h, taker30m].every(v => Number.isFinite(v))) {
    if (oi4h < 0 && taker4h < 0.50 && oi30m < 0 && taker30m < 0.50) return 'FLUSH_DELEVERAGING';
    if (oi4h < 0 && taker4h < 0.50 && oi30m > 0 && taker30m > 0.52) return 'POST_FLUSH_RECOVERY';
  }

  const oiConfirm = Number.isFinite(oi4h) && oi4h >= 0 || Number.isFinite(oi30m) && oi30m > 0;
  const takerConfirm = Number.isFinite(taker4h) && taker4h >= 0.50 || Number.isFinite(taker30m) && taker30m > 0.52;
  if (oiConfirm && takerConfirm) return 'SQUEEZE_CONFIRMED';
  return 'SQUEEZE_POTENTIAL';
}

function applyCrossAssetDivergence(synthesized) {
  const byAsset = Object.fromEntries(synthesized.signals.map(s => [s.asset, s]));
  const ctx = synthesized.cross_asset_context || {};
  const metrics = ctx.metrics || {};
  const btc = byAsset.BTC;
  const eth = byAsset.ETH;
  const sol = byAsset.SOL;

  // 1) Correlated signal direction conflict: only penalize if high-correlation assets oppose
  // and neither side has clear OI + taker-flow leadership evidence.
  if (btc && eth && Number(ctx.btc_eth_correlation) > 0.85 && signalsOppose(btc.signal, eth.signal)) {
    const btcLead = hasOiTakerLeadership(metrics.BTC, metrics.ETH, btc.signal);
    const ethLead = hasOiTakerLeadership(metrics.ETH, metrics.BTC, eth.signal);
    if (!btcLead && !ethLead) {
      applySignalAdjustment(btc, -0.04, `BTC/ETH high-correlation signal conflict without clear leadership -0.04`);
      applySignalAdjustment(eth, -0.04, `BTC/ETH high-correlation signal conflict without clear leadership -0.04`);
    }
  }

  // 2) SOL crowded alt caution: positive funding streak without stronger taker leadership than BTC.
  if (sol && sol.signal === 'BUY') {
    const solM = metrics.SOL || {};
    const btcM = metrics.BTC || {};
    if (solM.funding_streak_sign === 'POSITIVE' && Number(solM.funding_streak_hours) >= 48 &&
        Number.isFinite(solM.taker_buy_share_4h) && Number.isFinite(btcM.taker_buy_share_4h) &&
        solM.taker_buy_share_4h < btcM.taker_buy_share_4h) {
      applySignalAdjustment(sol, -0.03, 'SOL crowded alt caution: positive funding streak and weaker taker flow than BTC -0.03');
    }
  }

  // 3) ETH leadership confirmation: negative funding squeeze + expanding OI + stronger taker flow than BTC.
  if (eth && eth.signal === 'BUY') {
    const ethM = metrics.ETH || {};
    const btcM = metrics.BTC || {};
    if (ethM.funding_streak_sign === 'NEGATIVE' && Number(ethM.funding_streak_hours) >= 24 &&
        Number(ethM.oi_change_4h) > 0 && Number.isFinite(ethM.taker_buy_share_4h) && Number.isFinite(btcM.taker_buy_share_4h) &&
        ethM.taker_buy_share_4h > btcM.taker_buy_share_4h) {
      applySignalAdjustment(eth, 0.02, 'ETH leadership: negative funding, expanding OI, stronger taker flow than BTC +0.02');
    }
  }
}

function applyPhase1bShadowScoring(synthesized) {
  const micro = synthesized.microstructure_context?.markets || {};
  for (const sig of synthesized.signals) {
    const asset = microAssetKey(sig.asset);
    const m = micro[asset];
    const signal = String(sig.signal || '').toUpperCase();
    const direction = signal === 'BUY' ? 'BUY' : signal === 'SELL' ? 'SELL' : 'WATCH';
    const penalties = [];

    if (!m) {
      sig.phase1b_shadow = {
        role: 'display_only_shadow_no_alert_impact',
        base_strength: sig.strength,
        adjusted_strength: sig.strength,
        net_penalty_points: 0,
        penalties: [],
        note: 'No fresh microstructure diagnostics available.'
      };
      sig.phase1b_adjusted_score = sig.strength;
      continue;
    }

    if (!['BUY', 'SELL'].includes(direction)) {
      sig.phase1b_adjusted_score = sig.strength;
      sig.phase1b_shadow = {
        role: 'display_only_shadow_no_alert_impact',
        base_strength: sig.strength,
        adjusted_strength: sig.strength,
        net_penalty_points: 0,
        direction_assumed: direction,
        penalties: [],
        diagnostics: {
          flow_consensus: m.flow_consensus || null,
          failed_breakout_counter: m.failed_breakout_counter || null,
          btc_flow_gate: m.btc_flow_gate || null,
          cvd_divergence: m.cvd_divergence || null,
          oi_price_regime: m.oi_price_regime || null,
        },
        note: 'Shadow-only. No directional penalties applied to WATCH/HOLD rows.'
      };
      continue;
    }

    const consensus = m.flow_consensus || {};
    const streak = Number(consensus.current_streak || 0);
    if (consensus.confirmed === false && streak < 2) penalties.push({ condition: 'flow_consensus.confirmed=false, streak<2', points: -5 });
    else if (consensus.confirmed === false && streak === 2) penalties.push({ condition: 'flow_consensus.confirmed=false, streak=2', points: -2 });

    const failedAttempts = Number(m.failed_breakout_counter?.active_failed_attempts ?? m.failed_breakout_counter?.failed_attempts ?? 0);
    const rangeContext = phase1bRangeContext(m, direction);
    const levelContext = rangeContext.near_relevant_level;
    const failedPenaltyActive = m.failed_breakout_counter?.penalty_active !== false;
    if (direction === 'BUY' && levelContext && failedPenaltyActive) {
      if (failedAttempts >= 5) penalties.push({ condition: 'failed_breakout_counter>=5', points: -12 });
      else if (failedAttempts >= 2) penalties.push({ condition: 'failed_breakout_counter>=2', points: -8 });
    }

    const btcGate = m.btc_flow_gate?.classification;
    if (direction === 'BUY' && btcGate === 'BTC_WEAK_PENALIZE_ALT_LONGS' && levelContext) penalties.push({ condition: 'BTC gate=BTC_WEAK_PENALIZE_ALT_LONGS near level', points: -8 });

    const divType = m.cvd_divergence?.type;
    const divAgainst = direction === 'BUY'
      ? divType === 'SPOT_NEGATIVE_FUTURES_POSITIVE'
      : divType === 'SPOT_POSITIVE_FUTURES_NEGATIVE';
    if (divAgainst && levelContext) penalties.push({ condition: 'CVD divergence against direction near level', points: -5 });

    const oiRegime = m.oi_price_regime?.classification;
    // OI regime remains display-only. Early replay showed it was noisy at current
    // sensitivity, so it should not alter shadow score until validated.

    const netPoints = penalties.reduce((sum, p) => sum + p.points, 0);
    const adjusted = clampNumber(sig.strength + netPoints / 100, 0, 0.95);
    sig.phase1b_adjusted_score = adjusted;
    sig.phase1b_shadow = {
      role: 'display_only_shadow_no_alert_impact',
      base_strength: sig.strength,
      adjusted_strength: adjusted,
      net_penalty_points: netPoints,
      direction_assumed: direction,
      penalties,
      diagnostics: {
        flow_consensus: consensus,
        failed_breakout_counter: m.failed_breakout_counter || null,
        range_context: rangeContext,
        btc_flow_gate: m.btc_flow_gate || null,
        cvd_divergence: m.cvd_divergence || null,
        oi_price_regime: m.oi_price_regime || null,
      },
      note: 'Shadow-only. Does not affect signal, strength, ranking, delivery, or cooldown.'
    };
  }
}

function phase1bRangeContext(m, direction) {
  const ob = m?.backpack?.order_book || {};
  const price = toNum(ob.mid);
  const triggerPrice = toNum(ob.trigger_zone?.trigger_price ?? m?.failed_breakout_counter?.trigger_price);
  const distanceBps = toNum(ob.trigger_zone?.distance_bps ?? m?.failed_breakout_counter?.distance_to_level_bps);
  const distanceAtr = toNum(m?.failed_breakout_counter?.distance_to_level_atr);
    const nearByAtr = Number.isFinite(distanceAtr) && distanceAtr <= 1.5;
    const nearByBps = Number.isFinite(distanceBps) && Math.abs(distanceBps) <= 75;
    const nearByFailedLevel = m?.failed_breakout_counter?.near_failed_level === true;
  return {
    trigger_price: Number.isFinite(triggerPrice) ? triggerPrice : null,
    distance_bps: Number.isFinite(distanceBps) ? distanceBps : null,
    distance_atr: Number.isFinite(distanceAtr) ? distanceAtr : null,
    near_relevant_level: nearByAtr || nearByBps || nearByFailedLevel,
    failed_breakout_penalty_active: m?.failed_breakout_counter?.penalty_active,
    failed_breakout_inactive_reason: m?.failed_breakout_counter?.penalty_inactive_reason || null,
    rule: direction === 'SELL' ? 'near support for short-risk penalties' : 'near resistance/trigger for long-risk penalties',
  };
}

function phase1bOiOpposesDirection(oiRegime, direction) {
  if (direction === 'BUY') return ['LONGS_EXITING', 'FRESH_SHORTS'].includes(String(oiRegime || '').toUpperCase());
  if (direction === 'SELL') return ['SHORTS_COVERING', 'FRESH_LONGS'].includes(String(oiRegime || '').toUpperCase());
  return false;
}

function signalsOppose(a, b) {
  return (a === 'BUY' && b === 'SELL') || (a === 'SELL' && b === 'BUY');
}

function hasOiTakerLeadership(assetM = {}, otherM = {}, signal) {
  if (!['BUY', 'SELL'].includes(signal)) return false;
  const oi = Number(assetM.oi_change_4h);
  const otherOi = Number(otherM.oi_change_4h);
  const taker = Number(assetM.taker_buy_share_4h);
  const otherTaker = Number(otherM.taker_buy_share_4h);
  if (![oi, otherOi, taker, otherTaker].every(Number.isFinite)) return false;
  if (signal === 'BUY') return oi > 0 && oi > otherOi && taker > otherTaker + 0.02;
  return oi > 0 && oi > otherOi && taker < otherTaker - 0.02;
}

function applySignalAdjustment(sig, delta, reason) {
  sig.strength = clampNumber(sig.strength + delta, 0, 0.95);
  if (!Array.isArray(sig.confluence_adjustments)) sig.confluence_adjustments = [];
  sig.confluence_adjustments.push(reason);
}

function evaluateDelivery(synthesized, dryRun) {
  const threshold = synthesized.delivery_threshold;
  const qualifying = synthesized.signals.filter(s => s.strength >= threshold && ['BUY', 'SELL'].includes(s.signal));
  const cooldown = config.alert_cooldown || {};
  const statePath = path.join(path.dirname(ROOT), cooldown.state_file || 'market-intel/data/alert-cooldown-state.json');
  const now = Date.now();
  const cooldownMs = (cooldown.cooldown_hours || 2) * 60 * 60 * 1000;
  let state = {};

  if (cooldown.enabled && fs.existsSync(statePath)) {
    try { state = JSON.parse(fs.readFileSync(statePath, 'utf8')); } catch { state = {}; }
  }

  const alerts = [];
  const suppressed = [];
  for (const sig of qualifying) {
    const key = `${sig.asset}:${sig.signal}`;
    const last = state[key]?.last_sent_ms || 0;
    if (synthesized.event_timing?.status === 'HOLD_FOR_EVENT') {
      suppressed.push({ asset: sig.asset, signal: sig.signal, reason: 'hold_for_event', event: synthesized.event_timing.reason });
    } else if (cooldown.enabled && now - last < cooldownMs) {
      suppressed.push({ asset: sig.asset, signal: sig.signal, reason: 'cooldown' });
    } else {
      alerts.push(sig);
      if (!dryRun && cooldown.enabled) state[key] = { last_sent_ms: now, last_strength: sig.strength, timestamp: synthesized.timestamp };
    }
  }

  if (!dryRun && cooldown.enabled) {
    fs.mkdirSync(path.dirname(statePath), { recursive: true });
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  }

  return { alerts, suppressed, channel: config.telegram?.channel || 'telegram', to: config.telegram?.to || 'YOUR_TELEGRAM_CHAT_ID' };
}

function storeSignals(synthesized) {
  fs.mkdirSync(path.dirname(SIGNALS_PATH), { recursive: true });
  let allRuns = [];
  if (fs.existsSync(SIGNALS_PATH)) {
    try { allRuns = JSON.parse(fs.readFileSync(SIGNALS_PATH, 'utf8')); }
    catch { allRuns = []; }
  }
  if (!Array.isArray(allRuns)) allRuns = [allRuns].filter(Boolean);
  allRuns.push(synthesized);
  if (allRuns.length > 100) allRuns = allRuns.slice(-100);
  fs.writeFileSync(SIGNALS_PATH, JSON.stringify(allRuns, null, 2));
}

function writeSummaryArtifacts(synthesized, summary) {
  const latestTxt = path.join(DATA_DIR, 'latest-market-brief.txt');
  const latestJson = path.join(DATA_DIR, 'latest-market-run.json');
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(latestTxt, summary);
  fs.writeFileSync(latestJson, JSON.stringify({ ...synthesized, rendered_summary: summary }, null, 2));
  return { latest_summary: latestTxt, latest_run: latestJson };
}

function shouldAnnounceAlertOnly(synthesized) {
  if (synthesized.delivery?.alerts?.length) return true;
  return (synthesized.delivery?.suppressed || []).some(x => x.reason === 'hold_for_event');
}

function formatMarketBrief(s) {
  const actionable = s.delivery.alerts || [];
  const watch = s.signals.filter(sig => sig.strength >= s.include_threshold && !actionable.includes(sig)).slice(0, 6);
  const top = s.signals[0];
  const lines = [];
  lines.push(`📊 MARKET INTEL — ${new Date(s.timestamp).toISOString().replace('T', ' ').slice(0, 16)} UTC`);
  lines.push(`Status: ${actionable.length ? 'ACTIONABLE ALERT' : 'No alert — best setups only'}`);
  if (top) lines.push(`Top setup: ${top.asset} ${top.signal} ${Math.round(top.strength * 100)}%`);
  lines.push(`Data: Backpack ${s.context_status.backpack}; Binance ${s.context_status.binance}; Microstructure ${s.context_status.microstructure}; VIX ${s.context_status.vix || 'UNKNOWN'}`);

  const m = s.macro_structured || {};
  lines.push('\nMARKET REGIME');
  lines.push(`• Risk: ${m.risk_regime || s.macro_risk_sentiment || 'UNKNOWN'}${m.risk_off_driver ? ` (${m.risk_off_driver})` : ''}`);
  if (m.vix !== undefined || m.usd_pressure || m.yield_pressure) {
    lines.push(`• VIX: ${m.vix ?? s.macro_vix ?? 'UNKNOWN'}${m.vix_tier ? ` / ${m.vix_tier}` : ''}`);
    lines.push(`• USD pressure: ${m.usd_pressure || 'UNKNOWN'}${m.usd_index ? ` (${m.usd_index})` : ''}`);
    lines.push(`• Yield pressure: ${m.yield_pressure || 'UNKNOWN'}${m.ten_year_yield ? ` (10Y ${m.ten_year_yield}%)` : ''}`);
  }
  if (s.sentiment_summary) lines.push(`• Sentiment: ${oneLine(s.sentiment_summary, 160)}`);
  if (s.event_timing?.status && s.event_timing.status !== 'CLEAR') lines.push(`• Event timing: ${s.event_timing.status} — ${oneLine(s.event_timing.reason, 160)}`);

  if (s.validation_failed) {
    lines.push('\n⚠️ VALIDATION FAILED — no trade signals delivered.');
    lines.push(oneLine(s.errors.map(e => e.error || e.warning).filter(Boolean).join('; '), 300));
    return lines.join('\n');
  }

  if (actionable.length) {
    lines.push('\n🚨 ACTIONABLE SIGNALS');
    for (const sig of actionable) lines.push(formatSignalBlock(sig, true, s.microstructure_context));
  } else {
    lines.push('\nACTION');
    lines.push(`• No signal above alert threshold ${Math.round(s.delivery_threshold * 100)}% after cooldown/validation.`);
  }

  if (watch.length) {
    lines.push('\nWATCHLIST / BEST SETUPS');
    for (const sig of watch) lines.push(formatSignalBlock(sig, false, s.microstructure_context));
  }

  if (s.delivery.suppressed?.length) lines.push(`\nSuppressed: ${s.delivery.suppressed.map(x => `${x.asset} ${x.signal} (${x.reason})`).join(', ')}`);

  lines.push('\nBOTTOM LINE');
  lines.push('• Signal strength = setup quality. Event timing = whether to act now or wait.');
  lines.push('• Backpack = execution levels. Binance = broader perp crowding/momentum context.');
  lines.push('• Microstructure block is Phase 1 display-only; it does not change scoring yet.');
  return lines.join('\n');
}

function formatSignalBlock(sig, actionable, microstructureContext = null) {
  const pct = Math.round(sig.strength * 100);
  const shadowPct = Number.isFinite(Number(sig.phase1b_adjusted_score)) ? Math.round(Number(sig.phase1b_adjusted_score) * 100) : null;
  const price = Number.isFinite(sig.metadata?.price_current) ? sig.metadata.price_current : 'n/a';
  const lines = [];
  lines.push(`\n${actionable ? '🚨' : '•'} ${sig.asset} — ${sig.signal} ${pct}%${shadowPct !== null && shadowPct !== pct ? ` (Phase1b shadow ${shadowPct}%)` : ''}`);
  lines.push(`  Current: ${price}`);
  const plan = extractTradePlan(sig);
  if (plan) {
    lines.push(`  Entry: ${plan.entry || 'n/a'}${plan.orderType ? ` (${plan.orderType})` : ''}`);
    lines.push(`  Stop: ${plan.stop || 'n/a'}`);
    if (plan.tps.length) lines.push(`  Targets: ${plan.tps.join(' / ')}`);
  } else if (['BUY', 'SELL'].includes(String(sig.signal || '').toUpperCase())) {
    lines.push('  Trade plan: not provided by analyst — wait for clearer levels.');
  }
  lines.push(`  Why: ${oneLine(sig.reasoning || 'No reasoning provided.', 210)}`);
  const bn = sig.metadata?.binance_context;
  if (bn) lines.push(`  Binance: OI 30m ${fmtPct(bn.oi_change_30m)}, OI 4h ${fmtPct(bn.oi_change_4h)}, taker buy 4h ${fmtPct(bn.taker_buy_share_4h)}, funding ${bn.funding_streak_sign || 'UNKNOWN'} ${bn.funding_streak_hours ?? '?'}h`);
  const micro = formatMicrostructureLine(sig, microstructureContext);
  if (micro) lines.push(`  Microstructure: ${micro}`);
  if (sig.phase1b_shadow?.penalties?.length) lines.push(`  Phase1b shadow: ${sig.phase1b_shadow.net_penalty_points}pts — ${sig.phase1b_shadow.penalties.map(p => p.condition).join('; ')} (no alert impact)`);
  if (sig.confluence_adjustments?.length) lines.push(`  Adjustments: ${sig.confluence_adjustments.join('; ')}`);
  return lines.join('\n');
}

function formatMicrostructureLine(sig, microstructureContext) {
  const asset = microAssetKey(sig.asset);
  const m = microstructureContext?.markets?.[asset];
  if (!m) return null;
  const ob = m.backpack?.order_book || {};
  const flow = m.flow_quality || {};
  const cross = m.cross_exchange_positioning || {};
  const bits = [];
  if (Number.isFinite(Number(ob.spread_bps))) bits.push(`Backpack spread ${Number(ob.spread_bps).toFixed(3)}bps`);
  const band = ob.depth_bands?.['50bps'] || ob.depth_bands?.['25bps'] || null;
  if (band && Number.isFinite(Number(band.imbalance))) bits.push(`50bps imbalance ${Number(band.imbalance).toFixed(3)}`);
  const trigger = ob.trigger_zone;
  if (trigger) {
    if (Number.isFinite(Number(trigger.ask_notional_to_trigger))) bits.push(`asks-to-trigger $${formatCompactUsd(trigger.ask_notional_to_trigger)}`);
    else if (Number.isFinite(Number(trigger.bid_notional_to_trigger))) bits.push(`bids-to-trigger $${formatCompactUsd(trigger.bid_notional_to_trigger)}`);
    if (Number.isFinite(Number(trigger.distance_bps))) bits.push(`trigger ${Number(trigger.distance_bps).toFixed(1)}bps away`);
  }
  if (flow.classification) bits.push(`flow ${flow.classification}`);
  if (cross.classification) bits.push(`funding ${cross.classification}`);
  const rel = m.binance?.relative_strength;
  if (rel?.pair && Number.isFinite(Number(rel.change_24h_pct))) bits.push(`${rel.pair} 24h ${Number(rel.change_24h_pct).toFixed(2)}%`);
  if (!bits.length) return null;
  return `${bits.join('; ')} (display-only)`;
}

function microAssetKey(asset) {
  return String(asset || '').toUpperCase().replace(/_?PERP$/, '').replace(/^GOLD$/, 'PAXG');
}

function formatCompactUsd(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 'UNKNOWN';
  if (Math.abs(x) >= 1_000_000) return `${(x / 1_000_000).toFixed(2)}M`;
  if (Math.abs(x) >= 1_000) return `${(x / 1_000).toFixed(0)}K`;
  return x.toFixed(0);
}

function extractTradePlan(sig) {
  if (!['BUY', 'SELL'].includes(String(sig.signal || '').toUpperCase())) return null;
  const p = sig.playbooks?.intraday_1h || sig.playbooks?.swing_2_5d || sig.playbooks?.default || null;
  if (!p) return null;
  const entry = p.entry?.range?.length ? `${p.entry.range[0]}–${p.entry.range[1]}` : p.entry?.optimal;
  const stop = p.stop_loss?.price;
  const tp = p.take_profit || {};
  const tps = [tp.tp1?.price, tp.tp2?.price, tp.tp3?.price].filter(x => x !== undefined && x !== null).map(String);
  return { entry: entry === undefined || entry === null ? null : String(entry), orderType: p.entry?.order_type || null, stop: stop === undefined || stop === null ? null : String(stop), tps };
}

function fmtPct(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 'UNKNOWN';
  return `${(x * 100).toFixed(1)}%`;
}

function extractVix(macro) {
  const direct = Number(macro?.vix ?? macro?.vix_current);
  if (Number.isFinite(direct)) return direct;
  const text = [macro?.summary, ...(Array.isArray(macro?.key_events) ? macro.key_events.map(e => `${e.event || ''} ${e.impact || ''}`) : [])].join(' ');
  const match = text.match(/\bVIX\D{0,60}(\d{1,2}(?:\.\d+)?)/i);
  return match ? Number(match[1]) : null;
}

function macroCryptoRiskAdjustment(vix) {
  if (!Number.isFinite(Number(vix))) return -0.05;
  const n = Number(vix);
  if (n < 20) return -0.03;
  if (n < 30) return -0.05;
  return -0.08;
}

function macroCryptoRiskOnAdjustment(vix) {
  if (!Number.isFinite(Number(vix))) return 0.03;
  const n = Number(vix);
  if (n < 12) return 0.08;
  if (n < 15) return 0.05;
  if (n < 20) return 0.03;
  return 0;
}

function goldMacroAdjustment(synthesized) {
  const text = `${synthesized.macro_summary || ''} ${(synthesized.macro_key_events || []).map(e => `${e.event || ''} ${e.impact || ''}`).join(' ')}`.toLowerCase();
  const safeHaven = ['war', 'geopolit', 'sanction', 'oil shock', 'bank fail', 'flight to quality', 'safe-haven', 'safe haven'].some(x => text.includes(x));
  const yieldUsdHeadwind = ['strong usd', 'firm usd', 'usd index', 'strong dollar', 'firm dollar', 'high yield', 'higher yield', '10y yield', 'real yield', 'hawkish'].some(x => text.includes(x));
  if (safeHaven && !yieldUsdHeadwind) return { delta: 0.05, reason: 'macro safe-haven stress supports gold' };
  if (yieldUsdHeadwind && !safeHaven) return { delta: -0.03, reason: 'firm USD/high yields weigh on gold' };
  return { delta: 0, reason: 'mixed gold macro' };
}

function formatSigned(n) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}`;
}

function assessEventTiming(events) {
  const discreteEventTerms = [
    'cpi', 'pce', 'nfp', 'nonfarm', 'payroll', 'jobs report', 'fomc', 'fed decision',
    'rate decision', 'powell', 'ecb', 'boe', 'boj', 'inflation report', 'gdp', 'pmi',
    'war escalation', 'sanction', 'oil shock', 'exchange hack', 'exchange breach',
    'liquidation cascade', 'emergency', 'bank fail', 'circuit breaker'
  ];
  const holdTimingTerms = ['within 1h', 'within 2h', 'within 3h', 'within 4h', 'within 5h', 'within 6h', 'in 1h', 'in 2h', 'in 3h', 'in 4h', 'in 5h', 'in 6h', 'today', 'this morning', 'this afternoon'];
  const cautionTimingTerms = ['within 12h', 'within 24h', 'in 12h', 'in 24h', 'tomorrow', 'this week', 'upcoming'];

  let caution = null;
  for (const event of events || []) {
    const confidence = Number(event.confidence || event.impact_score || 0);
    if (confidence < 0.7) continue;
    const text = String(event.event || event.title || event.description || event.impact || '').toLowerCase();
    const isDiscrete = discreteEventTerms.some(term => text.includes(term));
    if (!isDiscrete) continue;
    const label = event.event || event.title || event.description || text;
    if (holdTimingTerms.some(term => text.includes(term))) return { status: 'HOLD_FOR_EVENT', reason: label };
    if (cautionTimingTerms.some(term => text.includes(term))) caution = { status: 'CAUTION', reason: label };
  }
  return caution || { status: 'CLEAR', reason: 'No timed high-impact event detected' };
}

function hasExtremeFearContrarianSignal(summary, fearGreedValue = null) {
  const n = Number(fearGreedValue);
  if (Number.isFinite(n)) return n <= 25;
  const text = String(summary || '').toLowerCase();
  if (!text) return false;
  if (/\b(no|not|without|far from|above)\b.{0,60}\bextreme fear\b/.test(text)) return false;
  if (/\bextreme fear\b/.test(text) && !/\b(not|no|without|far from|above)\b.{0,60}\bextreme fear\b/.test(text)) return true;
  const fg = text.match(/(?:fear\s*&\s*greed|f&g|fear and greed)\D{0,40}(\d{1,3})/i);
  return fg ? Number(fg[1]) <= 25 : false;
}

function toNum(v) { const n = Number(v); return Number.isFinite(n) ? n : null; }
function clampNumber(v, min, max) { const n = Number(v); return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : min; }
function isCrypto(asset) { return ['BTC', 'ETH', 'SOL'].includes(asset); }
function isGold(asset) { return ['PAXG', 'GOLD', 'GOLD_FUTURES', 'PAXG_PERP'].includes(asset); }
function oneLine(v, max) { return String(v || '').replace(/\s+/g, ' ').trim().slice(0, max); }

if (require.main === module) {
  orchestrate()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(`Fatal error: ${err.stack || err.message}`);
      process.exit(1);
    });
}

module.exports = { orchestrate, AGENTS, loadPreFetchedContext, synthesizeSignals, formatMarketBrief };
