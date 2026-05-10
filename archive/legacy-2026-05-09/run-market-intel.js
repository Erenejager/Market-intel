#!/usr/bin/env node
/**
 * Deprecated Market Intel runner.
 *
 * Deprecated on 2026-05-06 during canonical runner migration.
 * Use ./orchestrator.js instead.
 */

console.error('Deprecated: use node market-intel/orchestrator.js instead.');
console.error('Scheduled alert-only mode: node market-intel/orchestrator.js --alert-only');
process.exit(1);
