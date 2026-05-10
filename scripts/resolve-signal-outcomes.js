#!/usr/bin/env node
/**
 * Resolve Market Intel semantic-gate counterfactual outcomes.
 *
 * Reads:
 * - data/signal-outcome-events.jsonl
 * - data/autoresearch/price-15m.jsonl
 *
 * Writes:
 * - data/signal-outcome-status.json
 * - data/signal-outcome-resolutions.jsonl (terminal outcomes only, once)
 *
 * Counterfactuals are measured from trigger price, not signal price.
 * With 15m samples this is conservative/low-resolution: intrabar TP/SL ordering is unknown.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const EVENTS_PATH = path.join(ROOT, 'data', 'signal-outcome-events.jsonl');
const PRICES_PATH = path.join(ROOT, 'data', 'autoresearch', 'price-15m.jsonl');
const STATUS_PATH = path.join(ROOT, 'data', 'signal-outcome-status.json');
const RESOLUTIONS_PATH = path.join(ROOT, 'data', 'signal-outcome-resolutions.jsonl');
const DEFAULT_EXPIRY_MS = 24 * 60 * 60 * 1000;

function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
    .map((line, i) => {
      try { return JSON.parse(line); }
      catch (e) { return { __parse_error: String(e.message || e), __line: i + 1, raw: line }; }
    });
}

function toNum(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

function eventId(event) {
  if (event.id) return event.id;
  return crypto.createHash('sha256')
    .update(JSON.stringify({ timestamp: event.timestamp, type: event.type, asset: event.asset, blocked_signal: event.blocked_signal, trigger_price: event.trigger_price }))
    .digest('hex')
    .slice(0, 16);
}

function priceFor(sample, asset) {
  return toNum(sample?.prices?.[asset]?.lastPrice);
}

function reached(price, level, direction, kind) {
  if (!Number.isFinite(price) || !Number.isFinite(level)) return false;
  if (direction === 'BUY') return kind === 'target' ? price >= level : price <= level;
  if (direction === 'SELL') return kind === 'target' ? price <= level : price >= level;
  return false;
}

function rRealized(outcome) {
  if (outcome === 'TP1_HIT') return 1;
  if (outcome === 'STOP_HIT') return -1;
  return 0;
}

function resolveEvent(event, samples, nowMs) {
  const id = eventId(event);
  const direction = event.blocked_signal;
  const asset = event.asset;
  const trigger = toNum(event.trigger_price);
  const stop = toNum(event.stop);
  const targets = Array.isArray(event.targets) ? event.targets.map(toNum).filter(Number.isFinite) : [];
  const tp1 = targets[0];
  const eventMs = Date.parse(event.timestamp);

  if (!Number.isFinite(eventMs) || !['BUY', 'SELL'].includes(direction) || !Number.isFinite(trigger)) {
    return { id, event_id: id, status: 'UNRESOLVABLE', reason: 'missing timestamp/direction/trigger', event };
  }

  const after = samples
    .map(s => ({ ...s, ts_ms: Date.parse(s.timestamp_utc), price: priceFor(s, asset) }))
    .filter(s => Number.isFinite(s.ts_ms) && s.ts_ms >= eventMs && Number.isFinite(s.price))
    .sort((a, b) => a.ts_ms - b.ts_ms);

  let filled = false;
  let fillSample = null;
  let maxFavorable = 0;
  let maxAdverse = 0;

  for (const s of after) {
    const px = s.price;
    if (!filled) {
      if (reached(px, trigger, direction, 'target')) {
        filled = true;
        fillSample = s;
      } else {
        continue;
      }
    }

    const move = direction === 'BUY' ? px - trigger : trigger - px;
    maxFavorable = Math.max(maxFavorable, move);
    maxAdverse = Math.min(maxAdverse, move);

    const stopHit = Number.isFinite(stop) && reached(px, stop, direction, 'stop');
    const tpHit = Number.isFinite(tp1) && reached(px, tp1, direction, 'target');

    // If both appear in same low-resolution sample, mark ambiguous rather than invent ordering.
    if (stopHit && tpHit) {
      return terminal(event, id, 'AMBIGUOUS_TP_STOP', s, fillSample, trigger, stop, tp1, maxFavorable, maxAdverse);
    }
    if (stopHit) return terminal(event, id, 'STOP_HIT', s, fillSample, trigger, stop, tp1, maxFavorable, maxAdverse);
    if (tpHit) return terminal(event, id, 'TP1_HIT', s, fillSample, trigger, stop, tp1, maxFavorable, maxAdverse);
  }

  if (nowMs - eventMs >= DEFAULT_EXPIRY_MS) {
    return terminal(event, id, 'EXPIRED', after.at(-1) || null, fillSample, trigger, stop, tp1, maxFavorable, maxAdverse);
  }

  return {
    id,
    event_id: id,
    status: filled ? 'ACTIVE' : 'PENDING_TRIGGER',
    asset,
    direction,
    trigger_price: trigger,
    stop,
    tp1,
    filled_at: fillSample?.timestamp_utc || null,
    fill_price_sampled: fillSample?.price ?? null,
    latest_sample_at: after.at(-1)?.timestamp_utc || null,
    latest_price: after.at(-1)?.price ?? null,
    max_favorable_points: maxFavorable,
    max_adverse_points: maxAdverse,
    method: '15m_last_price_sampling'
  };
}

function terminal(event, id, outcome, sample, fillSample, trigger, stop, tp1, maxFavorable, maxAdverse) {
  const status = {
    id,
    event_id: id,
    status: outcome,
    terminal: true,
    asset: event.asset,
    direction: event.blocked_signal,
    trigger_price: trigger,
    stop,
    tp1,
    filled_at: fillSample?.timestamp_utc || null,
    fill_price_sampled: fillSample?.price ?? null,
    resolved_at: new Date().toISOString(),
    outcome_at: sample?.timestamp_utc || null,
    outcome_price: sample?.price ?? null,
    r_realized: rRealized(outcome),
    max_favorable_points: maxFavorable,
    max_adverse_points: maxAdverse,
    method: '15m_last_price_sampling',
    blocked_reason: event.blocked_reason,
    original_event: event
  };
  return status;
}

function appendJsonl(file, rows) {
  if (!rows.length) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, rows.map(r => JSON.stringify(r)).join('\n') + '\n');
}

function main() {
  const events = readJsonl(EVENTS_PATH).filter(e => !e.__parse_error);
  const samples = readJsonl(PRICES_PATH).filter(s => !s.__parse_error && s.ok !== false);
  const oldStatus = fs.existsSync(STATUS_PATH) ? JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8')) : { events: {} };
  const oldEvents = oldStatus.events || {};
  const alreadyResolved = new Set(Object.values(oldEvents).filter(s => s.terminal).map(s => s.id || s.event_id));
  const nowMs = Date.now();
  const statuses = {};
  const newTerminal = [];

  for (const event of events) {
    const id = eventId(event);
    const resolved = resolveEvent({ id, ...event }, samples, nowMs);
    statuses[id] = resolved;
    if (resolved.terminal && !alreadyResolved.has(id)) newTerminal.push(resolved);
  }

  const out = {
    timestamp_utc: new Date().toISOString(),
    source_events: path.relative(process.cwd(), EVENTS_PATH),
    source_prices: path.relative(process.cwd(), PRICES_PATH),
    counts: {
      events: events.length,
      price_samples: samples.length,
      terminal_total: Object.values(statuses).filter(s => s.terminal).length,
      terminal_new: newTerminal.length,
      pending: Object.values(statuses).filter(s => !s.terminal).length
    },
    events: statuses
  };

  fs.mkdirSync(path.dirname(STATUS_PATH), { recursive: true });
  fs.writeFileSync(STATUS_PATH, JSON.stringify(out, null, 2));
  appendJsonl(RESOLUTIONS_PATH, newTerminal);
  process.stdout.write(JSON.stringify({ ok: true, ...out.counts, status: path.relative(process.cwd(), STATUS_PATH), resolutions: path.relative(process.cwd(), RESOLUTIONS_PATH) }));
}

main();
