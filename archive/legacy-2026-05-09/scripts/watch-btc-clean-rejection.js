#!/usr/bin/env node
/*
  BTC clean rejection watcher (Backpack snapshot-lite)

  Goal: notify when BTC makes a push above R2 and then falls back below R1
  within a short window (default 30 min), which is a reasonable proxy for
  "clean rejection" using only snapshot lastPrice.

  Usage:
    node market-intel/scripts/watch-btc-clean-rejection.js [--windowMin=30]

  Exit codes:
    0 = no alert
    2 = alert (prints ALERT: ... to stdout)
*/

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const windowMinArg = args.find(a => a.startsWith('--windowMin='));
const windowMin = windowMinArg ? Number(windowMinArg.split('=')[1]) : 30;
const windowMs = windowMin * 60 * 1000;

const SNAP_PATH = path.resolve(__dirname, '..', 'data', 'backpack-snapshot-lite.json');
const STATE_DIR = path.resolve(__dirname, '..', 'data', 'watch');
const STATE_PATH = path.join(STATE_DIR, 'btc-clean-rejection-state.json');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function nowMs() {
  return Date.now();
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function main() {
  const snap = readJson(SNAP_PATH);
  if (!snap || snap.data_quality !== 'OK' || !snap.markets || !snap.markets.BTC) {
    process.exit(0);
  }

  const btc = snap.markets.BTC;
  const lastPrice = Number(btc.ticker.lastPrice);
  const r = btc.derived?.levels_1h?.resistance;
  if (!Array.isArray(r) || r.length < 2) process.exit(0);

  const R1 = Number(r[0]);
  const R2 = Number(r[1]);

  ensureDir(STATE_DIR);

  let state = { lastAboveR2AtMs: null, lastAlertAtMs: null, lastSeenPrice: null, lastSeenAtMs: null, R1, R2 };
  if (fs.existsSync(STATE_PATH)) {
    try {
      state = { ...state, ...readJson(STATE_PATH) };
    } catch {}
  }

  const t = nowMs();

  // Track when we were last above R2.
  if (lastPrice >= R2) {
    state.lastAboveR2AtMs = t;
  }

  const recentlyAboveR2 = state.lastAboveR2AtMs && (t - state.lastAboveR2AtMs) <= windowMs;

  // Alert condition: recently above R2, now below R1.
  // Also rate-limit alerts to at most 1 per 60 minutes.
  const cooldownMs = 60 * 60 * 1000;
  const cooledDown = !state.lastAlertAtMs || (t - state.lastAlertAtMs) > cooldownMs;

  let alert = null;
  if (recentlyAboveR2 && lastPrice < R1 && cooledDown) {
    alert = {
      kind: 'BTC_CLEAN_REJECTION',
      price: lastPrice,
      R1,
      R2,
      windowMin,
      snapshot_timestamp_utc: snap.timestamp_utc,
    };
    state.lastAlertAtMs = t;
  }

  state.lastSeenPrice = lastPrice;
  state.lastSeenAtMs = t;
  state.R1 = R1;
  state.R2 = R2;

  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));

  if (alert) {
    const msg = `ALERT: BTC clean rejection detected. Price ${alert.price} back below R1 ${alert.R1} after pushing above R2 ${alert.R2} (window ${alert.windowMin}m). Snapshot ${alert.snapshot_timestamp_utc}.`;
    process.stdout.write(msg + '\n');
    process.exit(2);
  }

  process.exit(0);
}

main();
