#!/usr/bin/env node
/**
 * Market Intelligence Orchestrator (Simple Version)
 * Tests if system is working
 */

const fs = require('fs');
const path = require('path');

async function simpleOrchestrate() {
  console.log('Market Intelligence Orchestrator');
  console.log('Mode: PRODUCTION\n');
  
  try {
    // Simple test: Read crypto analyst instructions
    const cryptoPath = path.join(__dirname, 'agents', 'crypto-analyst.md');
    const cryptoInstructions = fs.readFileSync(cryptoPath, 'utf8');
    
    // Try to get price using crypto-market-data skill
    const priceScript = path.join(__dirname, '..', 'skills', 'crypto-market-data', 'scripts', 'get_crypto_price.js');
    const priceResult = require('child_process').spawnSync('node', ['bitcoin', 'ethereum'], { cwd: path.join(__dirname, '..', 'skills', 'crypto-market-data', 'scripts') });
    
    console.log('Crypto Prices:');
    console.log(priceResult.stdout);
    
    // Simple signal generation (just for testing)
    const signals = [
      {
        asset: 'BTC',
        signal: 'BUY',
        strength: 0.80,
        reasoning: 'Test signal - simplified orchestrator',
        timestamp: new Date().toISOString()
      }
    ];
    
    // Store to signal-history.json
    const historyPath = path.join(__dirname, 'data', 'signal-history.json');
    const dataDir = path.dirname(historyPath);
    
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    let history = [];
    if (fs.existsSync(historyPath)) {
      try {
        history = JSON.parse(fs.readFileSync(historyPath));
      } catch (e) {
        history = [];
      }
    }
    
    const entry = {
      timestamp: new Date().toISOString(),
      signals: signals,
      metadata: {
        last_updated: new Date().toISOString(),
        total_signals: 1
      }
    };
    
    history.push(entry);
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
    
    console.log('Signal archived to', historyPath);
    console.log('✅ Simple orchestration complete!');
    
    return { success: true, signals };
    
  } catch (error) {
    console.error('Fatal error:', error.message);
    return { success: false, error: error.message };
  }
}

if (require.main === module) {
  simpleOrchestrate()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}
