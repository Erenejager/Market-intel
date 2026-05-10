#!/usr/bin/env node
/*
  Review when currently Telegram-allowed alert candidates worked historically,
  by calendar window and simple BTC price-derived regime.

  Important caveat: OI-dependent buckets before 2026-06-20T20:15Z may be affected
  by the known Jun09-Jun20 stale OI issue; the report flags that window.
*/
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const OUT_JSON = path.join(DATA, 'allowed-alert-regime-history-current.json');
const OUT_MD = path.join(DATA, 'allowed-alert-regime-history-current.md');
const ASSETS = ['BTC', 'ETH', 'SOL'];
const HORIZONS = [1, 2, 3, 4, 5, 6];
const DEDUP_MS = 6 * 60 * 60 * 1000;
const OI_FIX_TS = Date.parse('2026-06-20T20:15:00Z');
const OI_STALE_START = Date.parse('2026-06-09T00:00:00Z');

function readJsonl(file) { try { return fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)); } catch { return []; } }
function readJson(file, fallback = null) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } }
function ts(row) { return Date.parse(row?.timestamp_utc || row?.timestamp || row?.generated_at || ''); }
function num(x) { const n = Number(x); return Number.isFinite(n) ? n : null; }
function avg(a) { const v = a.filter(Number.isFinite); return v.length ? v.reduce((x, y) => x + y, 0) / v.length : null; }
function median(a) { const v = a.filter(Number.isFinite).sort((x, y) => x - y); if (!v.length) return null; const m = Math.floor(v.length / 2); return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; }
function pct(x, d = 1) { return Number.isFinite(x) ? `${x.toFixed(d)}%` : 'n/a'; }
function spct(x, d = 3) { return Number.isFinite(x) ? `${x >= 0 ? '+' : ''}${x.toFixed(d)}%` : 'n/a'; }
function inv(d) { return d === 'LONG' ? 'SHORT' : d === 'SHORT' ? 'LONG' : null; }
function retPct(dir, entry, future) { if (!Number.isFinite(entry) || !Number.isFinite(future)) return null; const raw = (future - entry) / entry * 100; return dir === 'SHORT' ? -raw : raw; }
function dirFromType(type) { if (String(type || '').startsWith('LONG')) return 'LONG'; if (String(type || '').startsWith('SHORT')) return 'SHORT'; return null; }
function normBtcGate(g) { return g === 'BTC_CONFIRMS_ALT_LONG_CONTEXT' ? 'BTC_PERMITS_ALT_LONG_OBSERVATION' : (g || 'NONE'); }
function flowOf(a) { return a?.diagnostics?.flow || a?.readiness_shadow?.source_metrics?.flow || a?.source_metrics?.flow || 'NONE'; }
function oiOf(x) { return x?.readiness_shadow?.source_metrics?.oi_price_regime || x?.source_metrics?.oi_price_regime || 'NONE'; }
function fundingOf(x) { return x?.readiness_shadow?.source_metrics?.cross_exchange_positioning?.classification || x?.source_metrics?.cross_exchange_positioning?.classification || 'NONE'; }
function btcGateOf(x) { return normBtcGate(x?.diagnostics?.btc_gate || x?.readiness_shadow?.source_metrics?.btc_gate || x?.source_metrics?.btc_gate || 'NONE'); }
function priceAlert(a) { return num(a?.diagnostics?.price ?? a?.readiness_shadow?.source_metrics?.long_horizon_regime?.price); }
function priceShadow(s) { return num(s?.source_metrics?.long_horizon_regime?.price); }

const priceRows = readJsonl(path.join(DATA, 'autoresearch', 'price-15m.jsonl'));
const priceIndex = Object.fromEntries(ASSETS.map(a => [a, []]));
for (const r of priceRows) {
  const t = ts(r); if (!Number.isFinite(t)) continue;
  for (const asset of ASSETS) {
    const p = num(r.prices?.[asset]?.lastPrice);
    if (Number.isFinite(p)) priceIndex[asset].push({ t, p });
  }
}
for (const rows of Object.values(priceIndex)) rows.sort((a, b) => a.t - b.t);
function atOrAfter(asset, target, maxLagMs = 25 * 60 * 1000) {
  const rows = priceIndex[asset] || []; let lo = 0, hi = rows.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (rows[m].t < target) lo = m + 1; else hi = m; }
  const r = rows[lo]; return r && r.t - target <= maxLagMs ? r : null;
}
function atOrBefore(asset, target, maxLagMs = 120 * 60 * 1000) {
  const rows = priceIndex[asset] || []; let lo = 0, hi = rows.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (rows[m].t <= target) lo = m + 1; else hi = m; }
  const r = rows[lo - 1]; return r && target - r.t <= maxLagMs ? r : null;
}
function between(asset, start, end) { return (priceIndex[asset] || []).filter(r => r.t >= start && r.t <= end); }
function evalEvent(asset, t, entry, dir) {
  const horizons = {};
  for (const h of HORIZONS) {
    const r = atOrAfter(asset, t + h * 3600000);
    horizons[`${h}h`] = r ? retPct(dir, entry, r.p) : null;
  }
  let mfe = -Infinity, mae = Infinity, mfeMin = null, maeMin = null;
  for (const r of between(asset, t, t + 6 * 3600000)) {
    const v = retPct(dir, entry, r.p); if (!Number.isFinite(v)) continue;
    if (v > mfe) { mfe = v; mfeMin = Math.round((r.t - t) / 60000); }
    if (v < mae) { mae = v; maeMin = Math.round((r.t - t) / 60000); }
  }
  return { horizons, mfe6: Number.isFinite(mfe) ? mfe : null, mae6: Number.isFinite(mae) ? mae : null, mfeMin, maeMin };
}
function btcRegimeAt(t) {
  const now = atOrBefore('BTC', t);
  const d1 = atOrBefore('BTC', t - 24 * 3600000, 6 * 3600000);
  const d3 = atOrBefore('BTC', t - 3 * 24 * 3600000, 6 * 3600000);
  const d7 = atOrBefore('BTC', t - 7 * 24 * 3600000, 12 * 3600000);
  if (!now || !d7) return { label: 'UNKNOWN', btc_ret_7d_pct: null, btc_ret_3d_pct: d3 ? (now.p - d3.p) / d3.p * 100 : null, btc_ret_24h_pct: d1 ? (now.p - d1.p) / d1.p * 100 : null };
  const r7 = (now.p - d7.p) / d7.p * 100;
  const r3 = d3 ? (now.p - d3.p) / d3.p * 100 : null;
  const r1 = d1 ? (now.p - d1.p) / d1.p * 100 : null;
  let label = 'RANGE';
  if (r7 <= -5) label = 'BEARISH_TREND';
  else if (r7 <= -1 && (r3 === null || r3 <= 1)) label = 'BEARISH_DRIFT';
  else if (r7 >= 5) label = 'BULLISH_TREND';
  else if (r7 >= 1 && (r3 === null || r3 >= -1)) label = 'BULLISH_DRIFT';
  return { label, btc_ret_7d_pct: r7, btc_ret_3d_pct: r3, btc_ret_24h_pct: r1 };
}

const state = readJson(path.join(DATA, 'phase1d-alert-state.json'), {});
const telegram = state.telegram_delivery || {};
function delivered(id) { const d = telegram[id]; return d && d.ok === true && !d.skipped; }
const alerts = readJsonl(path.join(DATA, 'phase1d-alerts.jsonl')).filter(a => !delivered(a.id));
const emittedKeys = new Set(alerts.map(a => `${a.timestamp_utc}|${a.asset}|${dirFromType(a.type) || ''}`));
const shadows = readJsonl(path.join(DATA, 'readiness-shadow.jsonl'));
const events = [];
for (const a of alerts) {
  const t = ts(a); const nd = dirFromType(a.type); const entry = priceAlert(a);
  if (!Number.isFinite(t) || !nd || !Number.isFinite(entry)) continue;
  const regime = btcRegimeAt(t);
  const base = {
    source: 'emitted_nontelegram', id: a.id, timestamp_utc: a.timestamp_utc, t, asset: a.asset, type: a.type,
    natural_direction: nd, flow: flowOf(a), oi: oiOf(a), funding: fundingOf(a), btc_gate: btcGateOf(a),
    state: a.readiness_shadow?.state || 'NONE', score: num(a.readiness_shadow?.score), eff: num(a.readiness_shadow?.effective_score),
    entry, regime: regime.label, btc_ret_7d_pct: regime.btc_ret_7d_pct, btc_ret_3d_pct: regime.btc_ret_3d_pct, btc_ret_24h_pct: regime.btc_ret_24h_pct,
    oi_stale_risk: t >= OI_STALE_START && t < OI_FIX_TS,
    post_fix: t >= OI_FIX_TS,
  };
  for (const mode of ['natural', 'inverse']) {
    const direction = mode === 'natural' ? nd : inv(nd);
    events.push({ ...base, mode, direction, ...evalEvent(a.asset, t, entry, direction) });
  }
}
for (const s of shadows) {
  const t = ts(s); const key = `${s.timestamp_utc}|${s.asset}|${s.direction || ''}`; const entry = priceShadow(s);
  if (!Number.isFinite(t) || emittedKeys.has(key) || !s.direction || !Number.isFinite(entry)) continue;
  const regime = btcRegimeAt(t);
  const base = {
    source: 'missing_shadow_no_alert', id: `shadow:${s.timestamp_utc}:${s.asset}:${s.direction}:${s.state}`,
    timestamp_utc: s.timestamp_utc, t, asset: s.asset, type: `SHADOW_${s.direction}`, natural_direction: s.direction,
    flow: flowOf(s), oi: oiOf(s), funding: fundingOf(s), btc_gate: btcGateOf(s), state: s.state || 'NONE',
    score: num(s.score), eff: num(s.effective_score), entry, regime: regime.label,
    btc_ret_7d_pct: regime.btc_ret_7d_pct, btc_ret_3d_pct: regime.btc_ret_3d_pct, btc_ret_24h_pct: regime.btc_ret_24h_pct,
    oi_stale_risk: t >= OI_STALE_START && t < OI_FIX_TS,
    post_fix: t >= OI_FIX_TS,
  };
  for (const mode of ['natural', 'inverse']) {
    const direction = mode === 'natural' ? s.direction : inv(s.direction);
    events.push({ ...base, mode, direction, ...evalEvent(s.asset, t, entry, direction) });
  }
}
function dedup(rows) {
  rows = rows.slice().sort((a, b) => a.t - b.t);
  const out = []; let last = -Infinity;
  for (const r of rows) { if (r.t - last >= DEDUP_MS) { out.push(r); last = r.t; } }
  return out;
}
function summarize(rows) {
  rows = dedup(rows);
  const horizons = {};
  for (const h of HORIZONS) {
    const vals = rows.map(r => r.horizons?.[`${h}h`]).filter(Number.isFinite);
    horizons[`${h}h`] = { n: vals.length, win: vals.length ? vals.filter(v => v > 0).length / vals.length * 100 : null, avg: avg(vals), med: median(vals) };
  }
  const ranked = Object.entries(horizons).filter(([_, v]) => v.n >= Math.min(rows.length, 5) && Number.isFinite(v.win)).sort((a, b) => b[1].win - a[1].win || b[1].avg - a[1].avg);
  const first = rows[0], last = rows[rows.length - 1];
  return {
    n: rows.length,
    raw_n: rows.raw_n || null,
    first_seen: first?.timestamp_utc || null,
    last_seen: last?.timestamp_utc || null,
    best_horizon: ranked[0]?.[0] || null,
    best_win: ranked[0]?.[1]?.win ?? null,
    best_avg: ranked[0]?.[1]?.avg ?? null,
    one_h_win: horizons['1h']?.win ?? null,
    one_h_avg: horizons['1h']?.avg ?? null,
    horizons,
    med_mfe6: median(rows.map(r => r.mfe6)),
    avg_mfe6: avg(rows.map(r => r.mfe6)),
    med_mae6: median(rows.map(r => r.mae6)),
    avg_mae6: avg(rows.map(r => r.mae6)),
    med_mfe_min: median(rows.map(r => r.mfeMin)),
    med_mae_min: median(rows.map(r => r.maeMin)),
    regimes: Object.fromEntries([...new Set(rows.map(r => r.regime))].map(k => [k, rows.filter(r => r.regime === k).length])),
    stale_oi_rows: rows.filter(r => r.oi_stale_risk).length,
    post_fix_rows: rows.filter(r => r.post_fix).length,
    avg_btc_7d: avg(rows.map(r => r.btc_ret_7d_pct)),
  };
}
function fmtSummary(s) { return `n=${s.n}; best ${s.best_horizon || 'n/a'} ${pct(s.best_win)} avg ${spct(s.best_avg)}; 1h ${pct(s.one_h_win)} avg ${spct(s.one_h_avg)}; MFE6 med ${spct(s.med_mfe6)} @${s.med_mfe_min ?? 'n/a'}m; MAE6 med ${spct(s.med_mae6)} @${s.med_mae_min ?? 'n/a'}m`; }
const windows = [
  { key: 'may_early', label: 'May 08–20', start: Date.parse('2026-05-08T00:00:00Z'), end: Date.parse('2026-05-21T00:00:00Z') },
  { key: 'may_late', label: 'May 21–31', start: Date.parse('2026-05-21T00:00:00Z'), end: Date.parse('2026-06-01T00:00:00Z') },
  { key: 'jun_early', label: 'Jun 01–08', start: Date.parse('2026-06-01T00:00:00Z'), end: Date.parse('2026-06-09T00:00:00Z') },
  { key: 'jun_stale_oi', label: 'Jun 09–20 pre-fix / OI stale risk', start: Date.parse('2026-06-09T00:00:00Z'), end: OI_FIX_TS },
  { key: 'post_fix', label: 'Post-fix Jun 20 20:15+', start: OI_FIX_TS, end: Date.now() },
];
const allowed = [
  { id: 'ETH_LONG_SETUP_STRUCTURAL_BUYING_INVERSE_SHORT', label: 'ETH LONG_SETUP + STRUCTURAL_BUYING → inverse SHORT', mode: 'inverse', direction: 'SHORT', oiDependent: false, match: e => e.source === 'emitted_nontelegram' && e.asset === 'ETH' && e.type === 'LONG_SETUP' && e.flow === 'STRUCTURAL_BUYING' },
  { id: 'ETH_LONG_SHADOW_SETUP_FORMING_INVERSE_SHORT', label: 'ETH source LONG + SHADOW_SETUP_FORMING → inverse SHORT', mode: 'inverse', direction: 'SHORT', oiDependent: false, match: e => e.asset === 'ETH' && e.natural_direction === 'LONG' && e.state === 'SHADOW_SETUP_FORMING' },
  { id: 'BTC_LONG_SETUP_INVERSE_SHORT_POSTFIX', label: 'BTC LONG_SETUP → inverse SHORT', mode: 'inverse', direction: 'SHORT', oiDependent: false, match: e => e.source === 'emitted_nontelegram' && e.asset === 'BTC' && e.type === 'LONG_SETUP' },
  { id: 'ETH_LONG_BLOCKED_SELL_PRESSURE_INVERSE_SHORT_POSTFIX', label: 'ETH blocked LONG + SELL_PRESSURE → inverse SHORT', mode: 'inverse', direction: 'SHORT', oiDependent: false, match: e => e.source === 'missing_shadow_no_alert' && e.asset === 'ETH' && e.natural_direction === 'LONG' && e.state === 'SHADOW_BLOCKED' && e.flow === 'SELL_PRESSURE' },
  { id: 'SOL_SHORT_BLOCKED_SPOT_LED_INVERSE_LONG_POSTFIX', label: 'SOL blocked SHORT + SPOT_LED_ACCUMULATION → inverse LONG', mode: 'inverse', direction: 'LONG', oiDependent: false, match: e => e.source === 'missing_shadow_no_alert' && e.asset === 'SOL' && e.natural_direction === 'SHORT' && e.state === 'SHADOW_BLOCKED' && e.flow === 'SPOT_LED_ACCUMULATION' },
  { id: 'ETH_BTC_PERMITS_ALT_LONG_INVERSE_SHORT_POSTFIX', label: 'ETH BTC_PERMITS_ALT_LONG_OBSERVATION → inverse SHORT', mode: 'inverse', direction: 'SHORT', oiDependent: false, match: e => e.source === 'missing_shadow_no_alert' && e.asset === 'ETH' && e.natural_direction === 'LONG' && e.btc_gate === 'BTC_PERMITS_ALT_LONG_OBSERVATION' },
  { id: 'ETH_LONGS_EXITING_BROAD_SHORT_PRESSURE_LONG_POSTFIX', label: 'ETH LONGS_EXITING + BROAD_SHORT_PRESSURE → natural LONG', mode: 'natural', direction: 'LONG', oiDependent: true, match: e => e.asset === 'ETH' && e.natural_direction === 'LONG' && e.oi === 'LONGS_EXITING' && e.funding === 'BROAD_SHORT_PRESSURE' },
  { id: 'SOL_SHORTS_COVERING_BROAD_SHORT_PRESSURE_INVERSE_SHORT_POSTFIX', label: 'SOL SHORTS_COVERING + BROAD_SHORT_PRESSURE → inverse SHORT', mode: 'inverse', direction: 'SHORT', oiDependent: true, match: e => e.asset === 'SOL' && e.natural_direction === 'LONG' && e.oi === 'SHORTS_COVERING' && e.funding === 'BROAD_SHORT_PRESSURE' },
];
function qualifying(s) { return s.n >= 8 && Number.isFinite(s.best_win) && s.best_win >= 70 && Number.isFinite(s.best_avg) && s.best_avg > 0; }
const results = [];
for (const c of allowed) {
  const raw = events.filter(e => e.mode === c.mode && e.direction === c.direction && c.match(e));
  const allS = summarize(raw); allS.raw_n = raw.length;
  const byWindow = windows.map(w => {
    const rs = raw.filter(e => e.t >= w.start && e.t < w.end);
    const s = summarize(rs); s.raw_n = rs.length; return { key: w.key, label: w.label, start: new Date(w.start).toISOString(), end: new Date(w.end).toISOString(), ...s, qualifies: qualifying(s) };
  });
  const byRegime = [...new Set(raw.map(e => e.regime))].map(regime => {
    const rs = raw.filter(e => e.regime === regime);
    const s = summarize(rs); s.raw_n = rs.length; return { regime, ...s, qualifies: qualifying(s) };
  }).sort((a, b) => b.n - a.n);
  const firstEffective = byWindow.find(w => w.qualifies && !(c.oiDependent && w.key === 'jun_stale_oi')) || null;
  const preFixQual = byWindow.filter(w => w.key !== 'post_fix' && w.qualifies);
  const postFix = byWindow.find(w => w.key === 'post_fix');
  let regimeCall = 'UNCLEAR';
  if (postFix?.qualifies && preFixQual.length === 0) regimeCall = 'POST_FIX_ONLY_OR_NEW_REGIME_EDGE';
  else if (postFix?.qualifies && preFixQual.length) regimeCall = 'PERSISTENT_EDGE_ACROSS_WINDOWS';
  else if (!postFix?.qualifies && preFixQual.length) regimeCall = 'OLD_EDGE_DID_NOT_PERSIST_POST_FIX';
  else if (allS.n < 8) regimeCall = 'LOW_N';
  results.push({ ...c, raw_n: raw.length, overall: allS, byWindow, byRegime, firstEffectiveWindow: firstEffective?.label || null, regimeCall });
}

const md = [];
md.push('# Allowed alert regime-history review');
md.push(`Generated: ${new Date().toISOString()}`);
md.push('Method: reconstruct currently allowed candidate events from `phase1d-alerts.jsonl` + `readiness-shadow.jsonl`, exclude actually Telegram-delivered rows, dedup one episode per candidate per 6h, test selected trade direction over 1h–6h.');
md.push('Regime: price-derived BTC regime for full history because formal `regime-history.jsonl` starts Jun 7; BEARISH_TREND <= -5% BTC 7d, BEARISH_DRIFT <= -1%, BULLISH_TREND >= +5%, BULLISH_DRIFT >= +1%, else RANGE.');
md.push('Caveat: Jun 09 → Jun 20 20:15 has known OI stale risk; OI-dependent findings in that window are not trusted for promotion.');
md.push('');
for (const r of results) {
  md.push(`## ${r.label}`);
  md.push(`- Key: \`${r.id}\``);
  md.push(`- Overall: ${fmtSummary(r.overall)} | raw=${r.raw_n} | regimes=${JSON.stringify(r.overall.regimes)}`);
  md.push(`- First non-stale effective window: **${r.firstEffectiveWindow || 'none'}**`);
  md.push(`- Regime call: **${r.regimeCall}**`);
  md.push('- By window:');
  for (const w of r.byWindow) {
    const stale = w.stale_oi_rows ? ` | stale-OI rows=${w.stale_oi_rows}` : '';
    md.push(`  - ${w.label}: ${fmtSummary(w)} | raw=${w.raw_n} | qualifies=${w.qualifies}${stale}`);
  }
  md.push('- By BTC price regime:');
  for (const g of r.byRegime) md.push(`  - ${g.regime}: ${fmtSummary(g)} | raw=${g.raw_n} | qualifies=${g.qualifies} | avg BTC 7d ${spct(g.avg_btc_7d)}`);
  md.push('');
}
fs.writeFileSync(OUT_JSON, JSON.stringify({ generated_at: new Date().toISOString(), method: { dedup_hours: 6, oi_fix: '2026-06-20T20:15:00Z', oi_stale_start: '2026-06-09T00:00:00Z' }, windows, results }, null, 2));
fs.writeFileSync(OUT_MD, md.join('\n') + '\n');
console.log(JSON.stringify({ ok: true, outJson: path.relative(ROOT, OUT_JSON), outMd: path.relative(ROOT, OUT_MD), candidates: results.map(r => ({ id: r.id, n: r.overall.n, firstEffectiveWindow: r.firstEffectiveWindow, regimeCall: r.regimeCall })) }, null, 2));
