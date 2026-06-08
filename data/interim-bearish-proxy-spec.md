# Interim Bearish Regime Proxy Spec

Generated: 2026-06-06

Purpose: provide a predeclared, low-cost operational proxy for regime-specific SHORT `WATCH` evaluation before the full regime engine is live.

This is **not** the regime engine and must be deprecated once the full regime engine exists.

## Canonical rule

`interim_bearish_proxy = true` when all conditions pass:

1. **BTC 4h weakness:** BTC 4h return is `< -0.5%` on at least 2 of the last 3 rolling 4h windows.
2. **BTC gate not bullish-following:** latest available BTC gate is not `BTC_STRONG_ALT_FOLLOWING`.
3. **No recent bullish squeeze:** no bullish squeeze indicator in the last 8h.

## Bullish squeeze indicator

For this proxy, `bullish_squeeze = true` if, within the last 8h, at least 2 of `BTC`, `ETH`, `SOL` simultaneously have:

- `readiness-shadow.source_metrics.oi_price_regime == SHORTS_COVERING`, and
- asset 4h price return `> +1.0%`.

If price or OI data is missing for the squeeze check, the proxy should fail closed (`interim_bearish_proxy = false`) unless manually overridden in research notes.

## Data sources

- BTC/asset prices: `market-intel/data/autoresearch/price-15m.jsonl`
- OI buckets and BTC gate context: `market-intel/data/readiness-shadow.jsonl`
- Optional context cross-check: `market-intel/data/binance-context.json` and `market-intel/data/microstructure-history.jsonl`

## Usage

This proxy may only raise a SHORT bucket from generic `OBSERVATION_ONLY` to `WATCH_REGIME_SPECIFIC_*` after independent production-alert validation. It is not sufficient for production `TRADABLE` by itself.

For `BTC|FRESH_SHORTS|SHADOW_SETUP_FORMING|NONE`, applicable condition is:

```text
applicable_when: interim_bearish_proxy == true OR full_regime_engine == BEARISH_SIDEWAYS
max_class_until_independent_validation: WATCH
```

## Same-regime backtest note — sanity check only

Backtest artifact: `market-intel/data/interim-bearish-proxy-backtest-btc-short.json`.

Against post-May21 `BTC|FRESH_SHORTS|SHADOW_SETUP_FORMING|NONE` production `SHORT_CONFIRMED` rows, proxy-pass cases showed stronger 24h continuation in-sample, but n is too small to treat this as evidence of discriminating power.

Important caveats:

- Proxy-pass sample is only n=6 total / n=5 complete at 24h. Do **not** quote the apparent perfect hit rate as a validated win rate; at this sample size, confidence intervals are too wide to distinguish predictive signal from chance.
- The proxy was defined after inspecting the same post-May21 regime data, so this is circular/in-sample validation. It shows the proxy is not obviously broken, not that it predicts future cases.
- Proxy-fail cases were also strongly positive at 24h, so this proxy is filtering inside an already high-base-rate regime window rather than proving independent discrimination.

Operational interpretation: the proxy is a fail-closed safety gate for `WATCH_REGIME_SPECIFIC_24H_CONTINUATION`. It does not upgrade the bucket beyond WATCH and must not be used to justify `TRADABLE` without future independent sample.
