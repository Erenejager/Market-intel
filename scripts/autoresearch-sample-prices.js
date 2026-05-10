#!/usr/bin/env node
/**
 * Autoresearch price sampler (15m recommended)
 *
 * Fetches last prices from Backpack public REST and appends a JSONL line.
 * This is used to evaluate episodes (TP/SL hits) later.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const OUT_PATH = path.join(__dirname, '..', 'data', 'autoresearch', 'price-15m.jsonl');

const BACKPACK_BASE = 'https://api.backpack.exchange/api/v1';

const SYMBOLS = {
  BTC: 'BTC_USDC_PERP',
  ETH: 'ETH_USDC_PERP',
  SOL: 'SOL_USDC_PERP',
  PAXG: 'PAXG_USDC_PERP',
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
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function toNum(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

async function main() {
  // Backpack /time returns ms as text/plain
  const nowMsRaw = await jget(`${BACKPACK_BASE}/time`);
  const nowMs = typeof nowMsRaw === 'string' ? Number(nowMsRaw) : Number(nowMsRaw);
  const timestamp_utc = new Date(nowMs).toISOString();

  const prices = {};
  const errors = {};

  await Promise.all(Object.entries(SYMBOLS).map(async ([asset, symbol]) => {
    try {
      const t = await jget(`${BACKPACK_BASE}/ticker?symbol=${encodeURIComponent(symbol)}`);
      prices[asset] = {
        symbol,
        lastPrice: toNum(t?.lastPrice),
      };
    } catch (e) {
      errors[asset] = String(e?.message || e);
    }
  }));

  const line = {
    timestamp_utc,
    source: 'backpack',
    prices,
    errors,
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.appendFileSync(OUT_PATH, JSON.stringify(line) + '\n');

  let resolver = null;
  try {
    const resolverOut = execFileSync('node', [path.join(__dirname, 'resolve-signal-outcomes.js')], {
      cwd: path.join(__dirname, '..', '..'),
      encoding: 'utf8',
      timeout: 30000,
      maxBuffer: 1024 * 1024
    });
    resolver = JSON.parse(resolverOut);
  } catch (e) {
    resolver = { ok: false, error: String(e?.message || e) };
  }

  process.stdout.write(JSON.stringify({ ok: true, timestamp_utc, out: path.relative(process.cwd(), OUT_PATH), resolver }));
}

main().catch(err => {
  const out = { ok: false, timestamp_utc: new Date().toISOString(), error: String(err?.message || err) };
  try {
    fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
    fs.appendFileSync(OUT_PATH, JSON.stringify(out) + '\n');
  } catch {}
  process.stdout.write(JSON.stringify(out));
  process.exit(1);
});
