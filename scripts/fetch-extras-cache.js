#!/usr/bin/env node
/*
  fetch-extras-cache.js
  Purpose: Fetch small, non-Backpack “extras” that the pipeline uses (sentiment + macro proxies)
  and store them as cached JSON files.

  Design goals:
  - Deterministic, tiny outputs (token-friendly downstream)
  - Fail-soft: write PARTIAL with degraded_reasons, never crash the whole pipeline
  - No API keys required

  Outputs:
  - market-intel/data/extras/crypto-fear-greed.json      (Alternative.me)
  - market-intel/data/extras/usd-index.json              (FRED DTWEXBGS)
  - market-intel/data/extras/yields.json                 (FRED DGS10 + T10YIE)
  - market-intel/data/extras/vix.json                    (FRED VIXCLS)
*/

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'data', 'extras');
const OUT_FNG = path.join(OUT_DIR, 'crypto-fear-greed.json');
const OUT_USD = path.join(OUT_DIR, 'usd-index.json');
const OUT_YIELDS = path.join(OUT_DIR, 'yields.json');
const OUT_VIX = path.join(OUT_DIR, 'vix.json');

function nowUtcIso() {
  return new Date().toISOString();
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      'user-agent': 'market-intel/1.0 (+openclaw)'
    }
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} for ${url}${body ? `: ${body.slice(0, 200)}` : ''}`);
  }
  return await res.text();
}

function parseFredCsvLatest(csvText) {
  // FRED CSV is like:
  // DATE,VALUE
  // 2026-04-16,17.94
  // ... possibly '.' for missing
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return null;
  for (let i = lines.length - 1; i >= 1; i--) {
    const [date, valueStr] = lines[i].split(',');
    if (!date || !valueStr) continue;
    if (valueStr === '.' || valueStr === '') continue;
    const value = Number(valueStr);
    if (Number.isFinite(value)) {
      return { date, value };
    }
  }
  return null;
}

function safeWriteJson(outPath, obj) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(obj, null, 2) + '\n');
}

async function fetchFearGreed() {
  const degraded = [];
  const url = 'https://api.alternative.me/fng/?limit=1&format=json';
  try {
    const txt = await fetchText(url);
    const j = JSON.parse(txt);
    const row = j && j.data && j.data[0];
    if (!row) throw new Error('Missing data[0]');
    const value = Number(row.value);
    const ts = row.timestamp ? Number(row.timestamp) : null;
    const classification = row.value_classification || null;
    if (!Number.isFinite(value)) throw new Error('Non-numeric value');

    const out = {
      timestamp_utc: nowUtcIso(),
      data_quality: 'OK',
      degraded_reasons: [],
      fear_greed: {
        value,
        value_classification: classification,
        // Alternative.me timestamp is unix seconds
        observation_timestamp_utc: ts ? new Date(ts * 1000).toISOString() : null,
        source: 'https://alternative.me/crypto/fear-and-greed-index/'
      }
    };
    safeWriteJson(OUT_FNG, out);
    return out;
  } catch (e) {
    degraded.push(String(e && e.message ? e.message : e));
    const out = {
      timestamp_utc: nowUtcIso(),
      data_quality: 'DEGRADED',
      degraded_reasons: degraded,
      fear_greed: {
        value: null,
        value_classification: null,
        observation_timestamp_utc: null,
        source: 'https://alternative.me/crypto/fear-and-greed-index/'
      }
    };
    safeWriteJson(OUT_FNG, out);
    return out;
  }
}

async function fetchUsdIndex() {
  // Use DTWEXBGS as a trade-weighted USD index proxy.
  const degraded = [];
  const url = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=DTWEXBGS';
  try {
    const txt = await fetchText(url);
    const latest = parseFredCsvLatest(txt);
    if (!latest) throw new Error('No latest value parsed');
    const out = {
      timestamp_utc: nowUtcIso(),
      data_quality: 'OK',
      degraded_reasons: [],
      usd_index: {
        series: 'DTWEXBGS',
        date: latest.date,
        value: latest.value,
        interpretation_hint: 'Higher = stronger USD (often headwind for gold/crypto); lower = weaker USD (tailwind).',
        source: url
      }
    };
    safeWriteJson(OUT_USD, out);
    return out;
  } catch (e) {
    degraded.push(String(e && e.message ? e.message : e));
    const out = {
      timestamp_utc: nowUtcIso(),
      data_quality: 'DEGRADED',
      degraded_reasons: degraded,
      usd_index: {
        series: 'DTWEXBGS',
        date: null,
        value: null,
        interpretation_hint: 'Higher = stronger USD (often headwind for gold/crypto); lower = weaker USD (tailwind).',
        source: url
      }
    };
    safeWriteJson(OUT_USD, out);
    return out;
  }
}

async function fetchVix() {
  const degraded = [];
  const url = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=VIXCLS';
  try {
    const txt = await fetchText(url);
    const latest = parseFredCsvLatest(txt);
    if (!latest) throw new Error('No latest value parsed');
    const out = {
      timestamp_utc: nowUtcIso(),
      data_quality: 'OK',
      degraded_reasons: [],
      vix: {
        series: 'VIXCLS',
        date: latest.date,
        value: latest.value,
        interpretation_hint: 'VIX <20 = mild/normal volatility; 20-30 = elevated caution; >30 = severe risk-off/liquidity stress.',
        source: url
      }
    };
    safeWriteJson(OUT_VIX, out);
    return out;
  } catch (e) {
    degraded.push(String(e && e.message ? e.message : e));
    const out = {
      timestamp_utc: nowUtcIso(),
      data_quality: 'DEGRADED',
      degraded_reasons: degraded,
      vix: {
        series: 'VIXCLS',
        date: null,
        value: null,
        interpretation_hint: 'VIX <20 = mild/normal volatility; 20-30 = elevated caution; >30 = severe risk-off/liquidity stress.',
        source: url
      }
    };
    safeWriteJson(OUT_VIX, out);
    return out;
  }
}

async function fetchYields() {
  const degraded = [];
  const url10y = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=DGS10';
  const url10ybe = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=T10YIE';
  try {
    const [t10y, t10ybe] = await Promise.all([
      fetchText(url10y).then(parseFredCsvLatest),
      fetchText(url10ybe).then(parseFredCsvLatest)
    ]);

    const out = {
      timestamp_utc: nowUtcIso(),
      data_quality: (t10y && t10ybe) ? 'OK' : 'PARTIAL',
      degraded_reasons: [],
      yields: {
        dgs10: t10y ? { date: t10y.date, value: t10y.value, source: url10y } : { date: null, value: null, source: url10y },
        t10yie: t10ybe ? { date: t10ybe.date, value: t10ybe.value, source: url10ybe } : { date: null, value: null, source: url10ybe },
        interpretation_hint: 'Rising yields (esp real yields) can pressure gold/crypto; falling yields can support.'
      }
    };

    if (!t10y) degraded.push('Failed to parse DGS10 latest');
    if (!t10ybe) degraded.push('Failed to parse T10YIE latest');
    out.degraded_reasons = degraded;
    safeWriteJson(OUT_YIELDS, out);
    return out;
  } catch (e) {
    degraded.push(String(e && e.message ? e.message : e));
    const out = {
      timestamp_utc: nowUtcIso(),
      data_quality: 'DEGRADED',
      degraded_reasons: degraded,
      yields: {
        dgs10: { date: null, value: null, source: url10y },
        t10yie: { date: null, value: null, source: url10ybe },
        interpretation_hint: 'Rising yields (esp real yields) can pressure gold/crypto; falling yields can support.'
      }
    };
    safeWriteJson(OUT_YIELDS, out);
    return out;
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const results = {
    timestamp_utc: nowUtcIso(),
    outputs: {
      fear_greed: path.relative(process.cwd(), OUT_FNG),
      usd_index: path.relative(process.cwd(), OUT_USD),
      yields: path.relative(process.cwd(), OUT_YIELDS),
      vix: path.relative(process.cwd(), OUT_VIX)
    }
  };

  await fetchFearGreed();
  await fetchUsdIndex();
  await fetchYields();
  await fetchVix();

  // lightweight run marker
  safeWriteJson(path.join(OUT_DIR, 'extras-index.json'), results);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
