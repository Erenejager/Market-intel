#!/usr/bin/env node
/**
 * Autoresearch baseline episode issuer
 *
 * Creates at most 1 new episode per asset per 24h, per track.
 * For now, issuance is simple and deterministic:
 * - use Backpack snapshot-lite for current price/levels/ATR/trend/funding/OI
 * - emit a candidate "episode" with direction aligned to 4H trend
 * - entry zone is the nearest 1H support (for UP) or resistance (for DOWN)
 * - requires a reclaim trigger (15m reclaim + 1H confirm) conceptually; evaluator will enforce fills.
 *
 * NOTE: This is not meant to be a trading signal engine yet; it's a baseline generator
 * to start accumulating comparable episodes.
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'autoresearch-config.json');

const WORKDIR = path.join(__dirname, '..');
const SNAPSHOT_LITE = path.join(WORKDIR, 'data', 'backpack-snapshot-lite.json');

const EPISODES_PATH = path.join(WORKDIR, 'data', 'autoresearch', 'episodes.jsonl');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function sha256(str) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(str).digest('hex');
}

function toNum(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

function nowIso() {
  return new Date().toISOString();
}

function uuid() {
  // simple uuid v4 without deps
  const crypto = require('crypto');
  const b = crypto.randomBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const hex = b.toString('hex');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

function within24h(aIso, bIso) {
  const a = new Date(aIso).getTime();
  const b = new Date(bIso).getTime();
  return Math.abs(a - b) < 24 * 3600 * 1000;
}

function loadRecentEpisodes() {
  if (!fs.existsSync(EPISODES_PATH)) return [];
  const lines = fs.readFileSync(EPISODES_PATH, 'utf8').trim().split('\n').filter(Boolean);
  const episodes = [];
  for (const ln of lines.slice(-2000)) {
    try { episodes.push(JSON.parse(ln)); } catch {}
  }
  return episodes;
}

function lastIssuedByAsset(episodes) {
  const m = new Map();
  for (const e of episodes) {
    if (!e.asset || !e.issued_at) continue;
    const prev = m.get(e.asset);
    if (!prev || new Date(e.issued_at) > new Date(prev.issued_at)) m.set(e.asset, e);
  }
  return m;
}

function regimeTag({ trend4h, atr1h, price, levels }) {
  // Simple deterministic regime tagging placeholder.
  // TRENDING if trend4h != FLAT, else RANGING.
  if (trend4h === 'UP' || trend4h === 'DOWN') return 'TRENDING';
  return 'RANGING';
}

function buildEpisode({ asset, snapshot, configVersion, paramsHash }) {
  const m = snapshot.markets[asset];
  if (!m) return null;

  const px = toNum(m.ticker?.lastPrice);
  const chg = toNum(m.ticker?.priceChangePercent);
  const trend4h = m.derived?.trend_4h || null;
  const atr1h = toNum(m.derived?.atr_14_1h);
  const atr4h = toNum(m.derived?.atr_14_4h);
  const supports = (m.derived?.levels_1h?.support || []).map(toNum).filter(n => Number.isFinite(n));
  const resistances = (m.derived?.levels_1h?.resistance || []).map(toNum).filter(n => Number.isFinite(n));

  if (!Number.isFinite(px) || !trend4h) return null;

  let direction = 'NO_TRADE';
  if (trend4h === 'UP') direction = 'BUY';
  if (trend4h === 'DOWN') direction = 'SELL';

  // Pick nearest level by direction
  const entryZone = (() => {
    if (direction === 'BUY' && supports.length) {
      // nearest support below px, else closest
      const below = supports.filter(s => s <= px).sort((a,b) => b-a);
      const base = (below[0] ?? supports.sort((a,b)=>Math.abs(a-px)-Math.abs(b-px))[0]);
      const w = atr1h ? 0.25 * atr1h : 0;
      return [base - w, base + w];
    }
    if (direction === 'SELL' && resistances.length) {
      const above = resistances.filter(r => r >= px).sort((a,b) => a-b);
      const base = (above[0] ?? resistances.sort((a,b)=>Math.abs(a-px)-Math.abs(b-px))[0]);
      const w = atr1h ? 0.25 * atr1h : 0;
      return [base - w, base + w];
    }
    return null;
  })();

  const stop = (() => {
    if (!entryZone || !atr1h) return null;
    const stopMult = (asset === 'PAXG') ? 1.4 : 1.6; // baseline defaults
    if (direction === 'BUY') return Math.max(0, entryZone[0] - stopMult * atr1h);
    if (direction === 'SELL') return entryZone[1] + stopMult * atr1h;
    return null;
  })();

  const tp1 = (() => {
    if (!entryZone || !atr1h) return null;
    // Baseline: tp1 at +1R
    const entry = (entryZone[0] + entryZone[1]) / 2;
    const risk = (direction === 'BUY') ? (entry - stop) : (stop - entry);
    if (!Number.isFinite(risk) || risk <= 0) return null;
    if (direction === 'BUY') return entry + risk;
    if (direction === 'SELL') return entry - risk;
    return null;
  })();

  const issued_at = nowIso();
  const expires_at = new Date(Date.now() + 48 * 3600 * 1000).toISOString();

  const episode = {
    episode_id: uuid(),
    asset,
    track: asset === 'PAXG' ? 'gold' : 'crypto',
    horizon_hours: 48,
    config_version: configVersion,
    params_hash: paramsHash,
    issued_at,
    expires_at,
    regime: regimeTag({ trend4h, atr1h, price: px, levels: { supports, resistances } }),
    inputs: {
      snapshot_timestamp_utc: snapshot.timestamp_utc,
      data_quality: snapshot.data_quality,
      price: px,
      price_24h_change: chg,
      funding_rate: toNum(m.funding?.fundingRate),
      open_interest: toNum(m.open_interest?.openInterest),
      oi_bias: 'UNKNOWN'
    },
    signal: {
      direction,
      trigger_type: '15m_reclaim',
      confirm: '1h_close',
      entry_zone: entryZone,
      stop,
      tp1,
      // Leave tp2/tp3 out for baseline scoring; can be added later.
    },
    state: 'PENDING',
    resolution: {
      filled: false,
      filled_at: null,
      resolved_at: null,
      outcome: null,
      r_realized: null,
      mae_r: null,
      mfe_r: null
    }
  };

  return episode;
}

async function main() {
  if (!fs.existsSync(CONFIG_PATH)) throw new Error('missing autoresearch-config.json');
  if (!fs.existsSync(SNAPSHOT_LITE)) throw new Error('missing backpack-snapshot-lite.json; run snapshot collector first');

  const cfgRaw = fs.readFileSync(CONFIG_PATH, 'utf8');
  const cfg = JSON.parse(cfgRaw);
  const configVersion = cfg.version || 'baseline-v1.0';
  const paramsHash = sha256(cfgRaw);

  const snapshot = readJson(SNAPSHOT_LITE);
  const episodes = loadRecentEpisodes();
  const lastByAsset = lastIssuedByAsset(episodes);

  const assets = new Set([
    ...cfg.tracks.crypto.assets,
    ...cfg.tracks.gold.assets,
  ]);

  const created = [];
  for (const asset of assets) {
    const last = lastByAsset.get(asset);
    if (last && within24h(last.issued_at, nowIso())) continue;
    const ep = buildEpisode({ asset, snapshot, configVersion, paramsHash });
    if (!ep) continue;
    created.push(ep);
  }

  fs.mkdirSync(path.dirname(EPISODES_PATH), { recursive: true });
  for (const ep of created) {
    fs.appendFileSync(EPISODES_PATH, JSON.stringify(ep) + '\n');
  }

  process.stdout.write(JSON.stringify({ ok: true, created: created.map(e => ({ asset: e.asset, episode_id: e.episode_id })) }));
}

main().catch(err => {
  process.stdout.write(JSON.stringify({ ok: false, error: String(err?.message || err) }));
  process.exit(1);
});
