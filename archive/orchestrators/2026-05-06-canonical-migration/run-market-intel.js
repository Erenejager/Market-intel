#!/usr/bin/env node
/**
 * Market Intelligence Orchestrator - Follows orchestrator-agent.md
 * Spawns 4 analysts, synthesizes signals, delivers to Telegram
 */

const fs = require('fs');
const path = require('path');

// Paths
const WORKSPACE = '/home/clawdbot/.openclaw/workspace';
const AGENTS_DIR = path.join(WORKSPACE, 'market-intel', 'agents');
const SIGNALS_PATH = path.join(WORKSPACE, 'market-intel', 'data', 'signals.json');
const SKILLS_DIR = path.join(WORKSPACE, 'skills');

// Telegram config
const TELEGRAM_CHAT_ID = 'YOUR_TELEGRAM_CHAT_ID';

// Price validation bounds
const PRICE_BOUNDS = {
  BTC: { min: 40000, max: 200000 },
  ETH: { min: 1000, max: 15000 },
  SOL: { min: 20, max: 500 },
  GOLD: { min: 3000, max: 10000 }
};

/**
 * Main orchestration function
 */
async function runMarketIntel() {
  console.log('🤖 Market Intelligence Orchestrator');
  console.log(`Time: ${new Date().toISOString()}\n`);

  const timestamp = new Date().toISOString();

  // Check if sessions_spawn is available
  const sessionsSpawn = global.sessions_spawn || global.sessions_spawn_internal || null;
  if (!sessionsSpawn) {
    throw new Error('sessions_spawn not available - must run in OpenClaw environment');
  }

  // Step 1: Spawn Wave 1 (3 agents in parallel)
  console.log('🚀 Step 1: Spawning Wave 1 agents (parallel)...\n');

  const wave1Tasks = [
    {
      label: 'crypto-analyst',
      file: 'crypto-analyst.md',
      taskSuffix: 'Analyze BTC, ETH, and SOL. Use crypto-market-data and fear-greed skills. Return ONLY valid JSON array, one object per asset. No markdown, no explanation.'
    },
    {
      label: 'gold-analyst',
      file: 'gold-analyst.md',
      taskSuffix: 'Analyze gold futures (GC=F). Use gold-trading-skill and yahoo-finance-forex skills. Return ONLY valid JSON object. No markdown, no explanation.'
    },
    {
      label: 'macro-scout',
      file: 'macro-scout.md',
      taskSuffix: 'Scan the macro landscape. Use market-environment-analysis and web_search for latest economic news. Return ONLY valid JSON object with summary, risk_sentiment, vix, key_events. No markdown, no explanation.'
    }
  ];

  const wave1Results = await spawnAgents(wave1Tasks, sessionsSpawn);

  // Step 2: Validate prices
  console.log('\n🔍 Step 2: Validating prices...\n');

  if (wave1Results.crypto_analyst) {
    const cryptoData = Array.isArray(wave1Results.crypto_analyst) ? wave1Results.crypto_analyst : [wave1Results.crypto_analyst];
    for (const asset of cryptoData) {
      if (!validatePrice(asset.asset, asset.price_current)) {
        const bounds = PRICE_BOUNDS[asset.asset];
        const errorMsg = `⚠️ Market Intel — Validation Failed\n${timestamp}\n\nFailed: ${asset.asset} at $${asset.price_current} (expected $${bounds.min.toLocaleString()}–$${bounds.max.toLocaleString()})\nRun aborted. No signals delivered.`;
        await sendTelegram(errorMsg);
        console.log(errorMsg);
        process.exit(1);
      }
    }
  }

  if (wave1Results.gold_analyst && wave1Results.gold_analyst.price_current) {
    if (!validatePrice('GOLD', wave1Results.gold_analyst.price_current)) {
      const bounds = PRICE_BOUNDS.GOLD;
      const errorMsg = `⚠️ Market Intel — Validation Failed\n${timestamp}\n\nFailed: GOLD at $${wave1Results.gold_analyst.price_current} (expected $${bounds.min.toLocaleString()}–$${bounds.max.toLocaleString()})\nRun aborted. No signals delivered.`;
      await sendTelegram(errorMsg);
      console.log(errorMsg);
      process.exit(1);
    }
  }

  console.log('✅ All prices within bounds\n');

  // Step 3: Spawn Wave 2 (sentiment-radar depends on Wave 1)
  console.log('🚀 Step 3: Spawning Wave 2 (sentiment-radar)...\n');

  const wave2Task = {
    label: 'sentiment-radar',
    file: 'sentiment-radar.md',
    taskPrefix: `Read and follow market-intel/agents/sentiment-radar.md.\n\nCrypto analyst output (current run):\n${JSON.stringify(wave1Results.crypto_analyst || {}, null, 2)}\n\nMacro scout output (current run):\n${JSON.stringify(wave1Results.macro_scout || {}, null, 2)}\n\nSynthesize sentiment using the above data. Return ONLY valid JSON object. No markdown, no explanation.`
  };

  const wave2Results = await spawnAgents([wave2Task], sessionsSpawn);
  const wave2Output = wave2Results['sentiment-radar'];

  // Step 4: Synthesize signals
  console.log('\n📊 Step 4: Synthesizing signals...\n');

  const synthesized = synthesizeSignals(wave1Results, wave2Output, timestamp);

  // Step 5: Store results
  console.log('💾 Step 5: Storing results in signals.json...\n');
  storeResults(synthesized, SIGNALS_PATH);
  console.log('✅ Results stored\n');

  // Step 6: Deliver to Telegram
  console.log('📱 Step 6: Delivering to Telegram...\n');
  const telegramMessage = formatTelegramMessage(synthesized);
  await sendTelegram(telegramMessage);
  console.log('✅ Telegram message sent\n');

  console.log('✅ Run complete!');
  return synthesized;
}

/**
 * Spawn multiple agents
 */
async function spawnAgents(tasks, sessionsSpawn) {
  const results = {};

  const promises = tasks.map(async (task) => {
    const instructionPath = path.join(AGENTS_DIR, task.file);
    const instructions = fs.readFileSync(instructionPath, 'utf8');

    let fullTask;
    if (task.taskPrefix) {
      fullTask = task.taskPrefix;
    } else {
      fullTask = `${instructions}\n\n---\n\n${task.taskSuffix}\n\nCRITICAL: Return ONLY valid JSON. No markdown code blocks, no preamble, no explanations. Start your response with { or [ and end with } or ].`;
    }

    console.log(`  Spawning ${task.label}...`);

    const spawnResult = await sessionsSpawn({
      task: fullTask,
      label: task.label,
      cleanup: 'delete',
      runTimeoutSeconds: 420
    });

    const responseText = spawnResult.response || spawnResult.message || '';
    let jsonText = responseText.trim();

    // Remove markdown code blocks
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
      console.log(`  ✅ ${task.label} completed\n`);
      return { label: task.label, data: parsed };
    } catch (parseError) {
      console.error(`  ❌ ${task.label} failed to parse JSON: ${parseError.message}`);
      console.error(`     Response: ${jsonText.substring(0, 200)}...\n`);
      return { label: task.label, data: null, error: parseError.message };
    }
  });

  const spawnResults = await Promise.all(promises);

  for (const result of spawnResults) {
    results[result.label] = result.data;
  }

  return results;
}

/**
 * Validate price is within bounds
 */
function validatePrice(asset, price) {
  const bounds = PRICE_BOUNDS[asset];
  if (!bounds) return true; // Skip validation for unknown assets
  return price >= bounds.min && price <= bounds.max;
}

/**
 * Synthesize signals with cross-agent confluence
 */
function synthesizeSignals(wave1, wave2, timestamp) {
  const crypto = wave1.crypto_analyst || [];
  const gold = wave1.gold_analyst || {};
  const macro = wave1.macro_scout || {};
  const sentiment = wave2 || {};

  const cryptoArray = Array.isArray(crypto) ? crypto : [crypto];

  const signals = [];
  let eventOverrideActive = false;

  // Check for high-impact events
  if (macro.key_events && Array.isArray(macro.key_events)) {
    const highImpactEvents = macro.key_events.filter(e => e.confidence >= 0.8);
    if (highImpactEvents.length > 0) {
      eventOverrideActive = true;
    }
  }

  // Process crypto signals
  for (const asset of cryptoArray) {
    let strength = asset.strength || 0;
    const adjustments = {
      event_override: 0.00,
      sentiment_confirmation: 0.00,
      divergence_penalty: 0.00,
      net: 0.00
    };

    let confluenceCount = 0;

    // 4a. Event override
    if (eventOverrideActive) {
      strength -= 0.15;
      adjustments.event_override = -0.15;
      asset.reasoning = `⚠️ High-impact event risk. ${asset.reasoning || ''}`;
    }

    // 4b. Sentiment confirmation
    if (sentiment.crypto_sentiment && sentiment.crypto_sentiment.signal_bias) {
      const bias = sentiment.crypto_sentiment.signal_bias;
      const signalDirection = asset.signal;

      if ((bias === 'BUY' && signalDirection === 'BUY') ||
          (bias === 'SELL' && signalDirection === 'SELL')) {
        strength += 0.05;
        adjustments.sentiment_confirmation = 0.05;
        confluenceCount++;
      } else if ((bias === 'BUY' && signalDirection === 'SELL') ||
                 (bias === 'SELL' && signalDirection === 'BUY')) {
        strength -= 0.05;
        adjustments.sentiment_confirmation = -0.05;
      }
    }

    // Check confluence factors
    if (asset.technical_support) confluenceCount++;
    if (asset.whale_activity && asset.whale_activity.includes('BUY')) confluenceCount++;
    if (!eventOverrideActive) confluenceCount++;

    // Cap strength
    strength = Math.max(0, Math.min(1, strength));
    adjustments.net = strength - (asset.strength || 0);

    signals.push({
      asset: asset.asset,
      signal: asset.signal,
      strength: strength,
      strength_pre_synthesis: asset.strength || 0,
      adjustments: adjustments,
      confluence_factors: confluenceCount,
      reasoning: asset.reasoning,
      entry: asset.entry || 0,
      stop: asset.stop || 0,
      tp1: asset.tp1 || 0,
      tp2: asset.tp2 || 0,
      tp3: asset.tp3 || 0,
      price_current: asset.price_current || 0,
      price_24h_change: asset.price_24h_change || 0
    });
  }

  // Process gold signal
  if (gold.asset) {
    let strength = gold.strength || 0;
    const adjustments = {
      event_override: 0.00,
      sentiment_confirmation: 0.00,
      divergence_penalty: 0.00,
      net: 0.00
    };

    let confluenceCount = 0;

    // 4a. Event override
    if (eventOverrideActive) {
      strength -= 0.15;
      adjustments.event_override = -0.15;
      gold.reasoning = `⚠️ High-impact event risk. ${gold.reasoning || ''}`;
    }

    // 4b. Sentiment confirmation
    if (sentiment.gold_sentiment && sentiment.gold_sentiment.signal_bias) {
      const bias = sentiment.gold_sentiment.signal_bias;
      const signalDirection = gold.signal;

      if ((bias === 'BUY' && signalDirection === 'BUY') ||
          (bias === 'SELL' && signalDirection === 'SELL')) {
        strength += 0.03;
        adjustments.sentiment_confirmation = 0.03;
        confluenceCount++;
      } else if ((bias === 'BUY' && signalDirection === 'SELL') ||
                 (bias === 'SELL' && signalDirection === 'BUY')) {
        strength -= 0.03;
        adjustments.sentiment_confirmation = -0.03;
      }
    }

    // Check confluence factors
    if (gold.technical_support) confluenceCount++;
    if (!eventOverrideActive) confluenceCount++;

    // Cap strength
    strength = Math.max(0, Math.min(1, strength));
    adjustments.net = strength - (gold.strength || 0);

    signals.push({
      asset: gold.asset,
      signal: gold.signal,
      strength: strength,
      strength_pre_synthesis: gold.strength || 0,
      adjustments: adjustments,
      confluence_factors: confluenceCount,
      reasoning: gold.reasoning,
      entry: gold.entry || 0,
      stop: gold.stop || 0,
      tp1: gold.tp1 || 0,
      tp2: gold.tp2 || 0,
      tp3: gold.tp3 || 0,
      price_current: gold.price_current || 0,
      price_24h_change: gold.price_24h_change || 0
    });
  }

  // 4c. BTC/ETH divergence check
  const btcSignal = signals.find(s => s.asset === 'BTC');
  const ethSignal = signals.find(s => s.asset === 'ETH');

  if (btcSignal && ethSignal &&
      ((btcSignal.signal === 'BUY' && ethSignal.signal === 'SELL') ||
       (btcSignal.signal === 'SELL' && ethSignal.signal === 'BUY'))) {
    btcSignal.strength = Math.max(0, btcSignal.strength - 0.05);
    ethSignal.strength = Math.max(0, ethSignal.strength - 0.05);
    btcSignal.adjustments.divergence_penalty = -0.05;
    ethSignal.adjustments.divergence_penalty = -0.05;
    btcSignal.adjustments.net = btcSignal.strength - btcSignal.strength_pre_synthesis;
    ethSignal.adjustments.net = ethSignal.strength - ethSignal.strength_pre_synthesis;
  }

  // 4d. Apply thresholds and 4e. Confluence minimum
  const finalSignals = signals.map(sig => {
    // Downgrade to WATCH if confluence < 2
    if ((sig.signal === 'BUY' || sig.signal === 'SELL') && sig.confluence_factors < 2) {
      sig.signal = 'WATCH';
    }

    return sig;
  }).filter(sig => sig.strength >= 0.50); // Only include signals >= 0.50

  // Sort by strength descending
  finalSignals.sort((a, b) => b.strength - a.strength);

  return {
    timestamp: timestamp,
    signals: finalSignals,
    macro: {
      risk_sentiment: macro.risk_sentiment || 'NEUTRAL',
      vix: macro.vix || 0,
      summary: macro.summary || ''
    },
    sentiment: {
      fear_greed: sentiment.crypto_sentiment?.fear_greed || 0,
      label: sentiment.crypto_sentiment?.label || 'NEUTRAL',
      crypto_signal_bias: sentiment.crypto_sentiment?.signal_bias || 'HOLD',
      gold_signal_bias: sentiment.gold_sentiment?.signal_bias || 'HOLD',
      funding_btc: sentiment.crypto_sentiment?.funding_rate || 'N/A',
      gold_etf: sentiment.gold_sentiment?.etf_flows || 'N/A'
    },
    delivered: true,
    agents_used: ['crypto-analyst', 'gold-analyst', 'macro-scout', 'sentiment-radar']
  };
}

/**
 * Store results in signals.json
 */
function storeResults(synthesized, filePath) {
  const dataDir = path.dirname(filePath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  let allSignals = [];
  if (fs.existsSync(filePath)) {
    try {
      const existing = fs.readFileSync(filePath, 'utf8');
      allSignals = JSON.parse(existing);
    } catch (e) {
      console.warn('Warning: Could not parse existing signals.json, starting fresh');
      allSignals = [];
    }
  }

  allSignals.push(synthesized);

  // Keep last 100 entries
  if (allSignals.length > 100) {
    allSignals = allSignals.slice(-100);
  }

  fs.writeFileSync(filePath, JSON.stringify(allSignals, null, 2));
}

/**
 * Format Telegram message
 */
function formatTelegramMessage(synthesized) {
  const date = new Date(synthesized.timestamp);
  const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' UTC';

  let message = `📊 **Market Intel** — ${dateStr} ${timeStr}\n\n`;

  // Signals section
  if (synthesized.signals.length > 0) {
    message += `## Signals\n\n`;

    for (const sig of synthesized.signals) {
      const emoji = getSignalEmoji(sig.signal, sig.strength);
      const strengthPct = Math.round(sig.strength * 100);

      message += `**${sig.asset} ${emoji}** ${sig.signal} | **${strengthPct}%**\n`;
      message += `$${sig.price_current.toLocaleString()} (${sig.price_24h_change >= 0 ? '+' : ''}${sig.price_24h_change}%)`;

      if (sig.entry > 0) {
        message += ` → Entry $${sig.entry.toLocaleString()} | Stop $${sig.stop.toLocaleString()} | TP $${sig.tp1?.toLocaleString() || 'N/A'}/$${sig.tp2?.toLocaleString() || 'N/A'}/$${sig.tp3?.toLocaleString() || 'N/A'}`;
      }

      message += `\n${sig.reasoning}\n\n`;
    }
  }

  message += `---\n\n## Macro\n\n`;

  const regimeEmoji = getRegimeEmoji(synthesized.macro.risk_sentiment);
  message += `${regimeEmoji} **${synthesized.macro.risk_sentiment}**\n`;
  message += `• VIX: ${synthesized.macro.vix || 'N/A'}\n`;
  message += `• Fed: ${extractFedInfo(synthesized.macro.summary)}\n`;
  message += `• Key: ${extractKeyMacro(synthesized.macro.summary)}\n\n`;

  message += `## Sentiment\n\n`;
  message += `• F&G: **${synthesized.sentiment.fear_greed}** (${synthesized.sentiment.label})\n`;
  message += `• Funding BTC: ${synthesized.sentiment.funding_btc} (${interpretFunding(synthesized.sentiment.funding_btc)})\n`;
  message += `• Gold ETF: ${synthesized.sentiment.gold_etf}\n\n`;

  message += `**Bottom line:** ${getBottomLine(synthesized)}`;

  return message;
}

/**
 * Get signal emoji
 */
function getSignalEmoji(signal, strength) {
  if (signal === 'BUY') {
    return strength >= 0.65 ? '⬆️' : '🔼';
  } else if (signal === 'SELL') {
    return strength >= 0.65 ? '⬇️' : '🔽';
  } else if (signal === 'WATCH') {
    return '👀';
  }
  return '⏸️';
}

/**
 * Get regime emoji
 */
function getRegimeEmoji(regime) {
  if (regime === 'RISK_ON') return '🟢';
  if (regime === 'RISK_OFF') return '🔴';
  return '🟡';
}

/**
 * Extract Fed info from summary
 */
function extractFedInfo(summary) {
  if (!summary) return 'N/A';
  if (summary.toLowerCase().includes('fed')) {
    const parts = summary.split('.');
    for (const part of parts) {
      if (part.toLowerCase().includes('fed') || part.toLowerCase().includes('rate')) {
        return part.trim().substring(0, 80);
      }
    }
  }
  return 'No major Fed updates';
}

/**
 * Extract key macro factor
 */
function extractKeyMacro(summary) {
  if (!summary) return 'No key factors';
  const sentences = summary.split('.');
  for (const sent of sentences) {
    const lower = sent.toLowerCase();
    if (lower.includes('war') || lower.includes('conflict') ||
        lower.includes('inflation') || lower.includes('cpi') ||
        lower.includes('fed') || lower.includes('rate')) {
      return sent.trim().substring(0, 80);
    }
  }
  return summary.substring(0, 80);
}

/**
 * Interpret funding rate
 */
function interpretFunding(funding) {
  if (!funding || funding === 'N/A') return 'N/A';
  const num = parseFloat(funding);
  if (isNaN(num)) return funding;
  if (num > 0.01) return 'bullish (longs pay shorts)';
  if (num < -0.01) return 'bearish (shorts pay longs)';
  return 'neutral';
}

/**
 * Get bottom line summary
 */
function getBottomLine(synthesized) {
  if (synthesized.signals.length === 0) {
    return 'No clear signals - waiting for better setup or confluence.';
  }

  const strongBuy = synthesized.signals.filter(s => s.signal === 'BUY' && s.strength >= 0.65);
  const strongSell = synthesized.signals.filter(s => s.signal === 'SELL' && s.strength >= 0.65);

  if (strongBuy.length > 0) {
    const asset = strongBuy[0].asset;
    return `Strong BUY on ${asset} with ${(strongBuy[0].strength * 100).toFixed(0)}% conviction - consider entry.`;
  }
  if (strongSell.length > 0) {
    const asset = strongSell[0].asset;
    return `Strong SELL on ${asset} with ${(strongSell[0].strength * 100).toFixed(0)}% conviction - reduce exposure.`;
  }

  const moderate = synthesized.signals.filter(s => s.strength >= 0.50 && s.strength < 0.65);
  if (moderate.length > 0) {
    return `Monitoring ${moderate[0].asset} for confirmation before acting.`;
  }

  return 'Mixed signals - wait for better confluence.';
}

/**
 * Send Telegram message
 */
async function sendTelegram(message) {
  // Use the message tool if available, otherwise log
  const msgFunc = global.message_send || null;
  if (msgFunc) {
    try {
      await msgFunc({
        action: 'send',
        channel: 'telegram',
        target: TELEGRAM_CHAT_ID,
        message: message
      });
      console.log('✅ Telegram sent via message tool\n');
    } catch (e) {
      console.warn(`⚠️  Failed to send Telegram: ${e.message}\n`);
      console.log('Message content:\n', message.substring(0, 500), '...\n');
    }
  } else {
    console.log('📨 Telegram message (would send):');
    console.log(message.substring(0, 1000));
    console.log('...\n');
  }
}

// Run if executed directly
if (require.main === module) {
  runMarketIntel()
    .then(() => {
      console.log('\n✅ Run complete!');
      process.exit(0);
    })
    .catch(err => {
      console.error('\n❌ Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { runMarketIntel };
