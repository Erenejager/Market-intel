#!/usr/bin/env node
/**
 * Autoresearch episode evaluator
 *
 * Reads episodes.jsonl and price-15m.jsonl, resolves episodes:
 * - fill when price first touches entry_zone
 * - outcome: TP1_HIT if tp1 reached after fill before stop
 * - STOP_HIT if stop reached after fill before tp1
 * - EXPIRED if past expires_at and no tp1/stop hit
 * - Leaves state unchanged if still pending/active and not resolvable yet
 *
 * Writes append-only updates to episodes-updates.jsonl and scores.jsonl.
 */

const fs = require('fs');
const path = require('path');

const WORKDIR = path.join(__dirname, '..');
const EPISODES_PATH = path.join(WORKDIR, 'data', 'autoresearch', 'episodes.jsonl');
const PRICE_PATH = path.join(WORKDIR, 'data', 'autoresearch', 'price-15m.jsonl');

const UPDATES_PATH = path.join(WORKDIR, 'data', 'autoresearch', 'episodes-updates.jsonl');
const SCORES_PATH = path.join(WORKDIR, 'data', 'autoresearch', 'scores.jsonl');

function readJsonl(p) {
  if (!fs.existsSync(p)) return [];
  const lines = fs.readFileSync(p, 'utf8').trim().split('\n').filter(Boolean);
  const out = [];
  for (const ln of lines) {
    try { out.push(JSON.parse(ln)); } catch {}
  }
  return out;
}

function lastByEpisodeId(items) {
  const m = new Map();
  for (const it of items) {
    const id = it.episode_id;
    if (!id) continue;
    // last write wins (file order)
    m.set(id, it);
  }
  return m;
}

function toNum(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

function inZone(px, zone) {
  if (!zone || zone.length !== 2) return false;
  const [a,b] = zone;
  return px >= Math.min(a,b) && px <= Math.max(a,b);
}

function reached(px, level, dir) {
  if (!Number.isFinite(level)) return false;
  if (dir === 'BUY') return px >= level;
  if (dir === 'SELL') return px <= level;
  return false;
}

function stopHit(px, stop, dir) {
  if (!Number.isFinite(stop)) return false;
  if (dir === 'BUY') return px <= stop;
  if (dir === 'SELL') return px >= stop;
  return false;
}

function rRealized(outcome, expiryScoreR = 0) {
  if (outcome === 'TP1_HIT') return 1.0;
  if (outcome === 'STOP_HIT') return -1.0;
  if (outcome === 'EXPIRED') return expiryScoreR;
  return null;
}

function main() {
  const episodes = readJsonl(EPISODES_PATH);
  const updates = readJsonl(UPDATES_PATH);
  const merged = lastByEpisodeId([...episodes, ...updates]);

  const prices = readJsonl(PRICE_PATH)
    .filter(l => l && l.timestamp_utc && l.prices)
    .map(l => ({
      t: new Date(l.timestamp_utc).getTime(),
      timestamp_utc: l.timestamp_utc,
      prices: l.prices,
    }))
    .sort((a,b)=>a.t-b.t);

  const nowMs = Date.now();

  const newUpdates = [];
  const newScores = [];

  for (const ep of merged.values()) {
    if (!ep || !ep.episode_id || !ep.asset) continue;
    if (['TP1_HIT','STOP_HIT','EXPIRED','INVALIDATED','CANCELLED'].includes(ep.state)) continue;

    const dir = ep.signal?.direction;
    const zone = ep.signal?.entry_zone;
    const stop = toNum(ep.signal?.stop);
    const tp1 = toNum(ep.signal?.tp1);

    const issuedMs = new Date(ep.issued_at).getTime();
    const expiresMs = new Date(ep.expires_at).getTime();

    // walk forward through price samples after issuance
    let filledAt = ep.resolution?.filled_at ? new Date(ep.resolution.filled_at).getTime() : null;
    let filled = Boolean(ep.resolution?.filled);

    let outcome = null;
    let resolvedAt = null;

    for (const s of prices) {
      if (s.t < issuedMs) continue;
      const px = toNum(s.prices?.[ep.asset]?.lastPrice);
      if (!Number.isFinite(px)) continue;

      if (!filled) {
        if (inZone(px, zone)) {
          filled = true;
          filledAt = s.t;
          // continue scanning for outcome after fill
        }
        continue;
      }

      // after filled
      if (stopHit(px, stop, dir)) {
        outcome = 'STOP_HIT';
        resolvedAt = s.t;
        break;
      }
      if (reached(px, tp1, dir)) {
        outcome = 'TP1_HIT';
        resolvedAt = s.t;
        break;
      }
    }

    // expiry if past expires and no outcome
    if (!outcome && nowMs >= expiresMs) {
      outcome = 'EXPIRED';
      resolvedAt = expiresMs;
    }

    // write update if anything changed
    const stateNew = outcome ? outcome : (filled ? 'ACTIVE' : 'PENDING');
    const changed = (
      stateNew !== ep.state ||
      filled !== Boolean(ep.resolution?.filled) ||
      (filledAt && !ep.resolution?.filled_at)
    );

    if (!changed) continue;

    const upd = JSON.parse(JSON.stringify(ep));
    upd.state = stateNew;
    upd.resolution = upd.resolution || {};
    upd.resolution.filled = filled;
    upd.resolution.filled_at = filledAt ? new Date(filledAt).toISOString() : null;

    if (outcome) {
      upd.resolution.resolved_at = new Date(resolvedAt).toISOString();
      upd.resolution.outcome = outcome;
      upd.resolution.r_realized = rRealized(outcome, 0);
    }

    newUpdates.push(upd);

    if (outcome) {
      newScores.push({
        episode_id: ep.episode_id,
        asset: ep.asset,
        track: ep.track,
        config_version: ep.config_version,
        issued_at: ep.issued_at,
        expires_at: ep.expires_at,
        resolved_at: upd.resolution.resolved_at,
        outcome,
        r_realized: upd.resolution.r_realized,
        regime: ep.regime,
      });
    }
  }

  fs.mkdirSync(path.dirname(UPDATES_PATH), { recursive: true });
  for (const u of newUpdates) fs.appendFileSync(UPDATES_PATH, JSON.stringify(u) + '\n');
  for (const s of newScores) fs.appendFileSync(SCORES_PATH, JSON.stringify(s) + '\n');

  process.stdout.write(JSON.stringify({ ok: true, updates: newUpdates.length, scored: newScores.length }));
}

main();
