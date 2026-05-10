#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EVENTS_PATH = path.join(ROOT, 'data', 'hypothesis-events.jsonl');

function readJsonl(file) {
  try { return fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(line => JSON.parse(line)); } catch { return []; }
}
function arg(name) {
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : null;
}
function has(name) { return process.argv.includes(name); }
function pct(x) { return Number.isFinite(x) ? `${(x * 100).toFixed(1)}%` : 'n/a'; }
function avg(vals) { return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null; }

const hypothesis = arg('--hypothesis');
const since = arg('--since');
const jsonOut = has('--json');
let rows = readJsonl(EVENTS_PATH);
if (hypothesis) rows = rows.filter(r => (r.hypotheses || []).includes(hypothesis) || r.hypothesis === hypothesis);
if (since) {
  const sinceMs = Date.parse(since);
  rows = rows.filter(r => Date.parse(r.timestamp_utc || '') >= sinceMs);
}

const byEvent = new Map();
const byHyp = new Map();
for (const r of rows) {
  byEvent.set(r.event, (byEvent.get(r.event) || 0) + 1);
  for (const h of r.hypotheses || (r.hypothesis ? [r.hypothesis] : ['UNKNOWN'])) {
    byHyp.set(h, (byHyp.get(h) || 0) + 1);
  }
}

const directional = rows.map(r => r.payload || {}).flatMap(p => [p.return_30m, p.return_1h, p.return_4h]).filter(Number.isFinite);
const summary = {
  source: EVENTS_PATH,
  filters: { hypothesis, since },
  total_events: rows.length,
  by_event: Object.fromEntries([...byEvent.entries()].sort()),
  by_hypothesis: Object.fromEntries([...byHyp.entries()].sort()),
  directional_return_observations: directional.length,
  avg_directional_return: avg(directional),
};

if (jsonOut) {
  console.log(JSON.stringify({ summary, rows }, null, 2));
  process.exit(0);
}

console.log('# Hypothesis Event Analysis');
console.log(`Source: ${EVENTS_PATH}`);
if (hypothesis) console.log(`Hypothesis filter: ${hypothesis}`);
if (since) console.log(`Since: ${since}`);
console.log('');
console.log(`Total events: ${summary.total_events}`);
console.log('');
console.log('## By event');
for (const [k, v] of Object.entries(summary.by_event)) console.log(`- ${k}: ${v}`);
console.log('');
console.log('## By hypothesis');
for (const [k, v] of Object.entries(summary.by_hypothesis)) console.log(`- ${k}: ${v}`);
if (directional.length) {
  console.log('');
  console.log(`Avg directional return observations: ${summary.avg_directional_return?.toFixed(3)}% over ${directional.length} values`);
}
console.log('');
console.log('## Recent events');
for (const r of rows.slice(-20)) {
  console.log(`- ${r.timestamp_utc} ${r.event} ${(r.hypotheses || []).join('+')} ${r.asset || ''}`);
}
