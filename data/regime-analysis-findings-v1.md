# BTC Regime Analysis — Findings v1

Generated: 2026-06-07  
Regime basis: `manual_btc_price_regime_v1` — **BTC_PRICE_ONLY**  
Scripts: `scripts/analyze-shorts-by-regime.js`, `data/regime-labels-manual-v1.json`

---

## ⚠ Diagnostic disclaimer

**This is not a validated regime engine.**

- Regime labels are manual, derived from BTC price-15m.jsonl visual inspection only.
- OI character, funding/crowding, and range-expansion factors are NOT included.
- All conclusions must be read as: *"under manual BTC price regime v1…"* — not as final production rules.
- Sample sizes in detailed regime windows are thin (some n=3–6). Parent-regime groupings are more reliable.
- FLUSH trap finding (n=6) is an explicit exclusion candidate, not a final rule.

---

## Key numbers (all assets combined, n=138)

### By parent_regime

| parent_regime   | n  | 30m   | 1h    | 2h    | 4h    | 24h   | 24h avg   |
|-----------------|----|-------|-------|-------|-------|-------|-----------|
| BEARISH_TREND   | 98 | 56.1% | 62.2% | 60.8% | 57.7% | 67.0% | +1.144%   |
| BEARISH_TREND (excl. FLUSH) | 92 | 55.4% | 61.1% | 62.0% | 61.0% | 71.4% | +1.340% |
| NEUTRAL         | 29 | 62.1% | 41.4% | 44.8% | 37.9% | 69.0% | +0.595%   |
| BULLISH_TREND   | 11 | 36.4% | 27.3% | 63.6% | 27.3% | 36.4% | −0.484%   |

### By momentum_type (all assets)

| momentum_type | n  | 30m   | 1h    | 4h    | 24h   | 24h avg   |
|---------------|----|-------|-------|-------|-------|-----------|
| ACCELERATION  | 25 | 64.0% | 64.0% | 72.0% | 80.0% | +2.390%   |
| CONTINUATION  | 21 | 52.4% | 66.7% | 61.9% | 76.2% | +1.492%   |
| GRIND (all)   | 46 | 52.2% | 58.7% | 53.3% | 64.4% | +0.686%   |
| FLUSH         |  6 | 66.7% | 66.7% | 16.7% |  0.0% | −1.826%   |
| SQUEEZE       | 11 | 36.4% | 27.3% | 27.3% | 36.4% | −0.484%   |

---

## Asset-specific conclusions

### BTC SHORT ✅ strongest

| group          | n  | 1h    | 2h     | 4h     | 24h   | 24h avg  |
|----------------|----|-------|--------|--------|-------|----------|
| BEARISH_TREND  | 36 | 66.7% | 75.0%  | 66.7%  | 80.6% | +1.610%  |
| ACCELERATION   |  9 | 88.9% | 100.0% | 100.0% | 88.9% | +3.049%  |
| GRIND          | 15 | 53.3% | 73.3%  | 66.7%  | 93.3% | +1.832%  |
| NEUTRAL        | 10 | 50.0% | 40.0%  | 30.0%  | 70.0% | +0.700%  |
| BULLISH_TREND  |  3 |  0.0% | 66.7%  |  0.0%  | 33.3% | −0.898%  |

**BTC SHORT in BEARISH_TREND non-FLUSH is the strongest validated signal.**
ACCELERATION shows early edge (89% at 1h). GRIND is a 24h-only signal (53% at 1h → 93% at 24h).

### ETH SHORT ⚠ moderate, regime separation not clean

| group         | n  | 24h   | 24h avg  |
|---------------|----|-------|----------|
| BEARISH_TREND | 27 | 70.4% | +1.168%  |
| NEUTRAL       | 14 | 71.4% | +0.702%  |
| BULLISH_TREND |  7 | 42.9% | −0.119%  |

BEARISH_TREND and NEUTRAL have near-identical 24h win rates (70.4% vs 71.4%). Separation exists only in avg return (+1.168% vs +0.702%). **The gate for ETH is "not BULLISH_TREND," not specifically "BEARISH_TREND."** This is a weaker finding than BTC.

### SOL SHORT ❌ weak, do not promote

| group         | n  | 24h   | 24h avg  |
|---------------|----|-------|----------|
| BEARISH_TREND | 35 | 50.0% | +0.633%  |
| GRIND         | 17 | 43.8% | +0.043%  |

SOL SHORT in bearish trend grind is effectively a coin flip at 24h. Consistent with prior analysis. **SOL SHORT is not promotable from this analysis.**

---

## Corrected conclusions (2026-06-07)

Under manual BTC price regime v1 (BTC_PRICE_ONLY, diagnostic only):

1. **BULLISH_SQUEEZE = hard block for all SHORTs.** 36.4% 24h, avg −0.484%. Clearest finding. Applicable to BTC, ETH, SOL.

2. **BEARISH_FLUSH = explicit exclusion candidate for 24h shorts.** 0% 24h win rate, avg −1.826% (n=6). Alert fires during the flush but the 24h captures the reversal. Low n — treat as candidate rule, not final law. Requires n≥15 to promote to hard exclusion.

3. **BTC SHORT is validated in BEARISH_TREND (excl. FLUSH).** 80.6% 24h. ACCELERATION gives edge earlier (89% at 1h). GRIND needs patience (93% at 24h, 53% at 1h). Signal is directionally right but horizon matters.

4. **ETH SHORT benefits from non-bullish BTC regime, but BEARISH vs NEUTRAL is not cleanly separable by win rate.** Gate for ETH is "avoid BULLISH_SQUEEZE," not "require BEARISH_TREND."

5. **SOL SHORT remains weak and path-dependent.** 50% 24h in BEARISH_TREND. No promotion.

---

## What this does NOT answer

- Whether OI character, funding, or range expansion would improve separation (not in this analysis)
- Whether regime transitions matter (e.g., GRIND transitioning to ACCELERATION mid-hold)
- Whether the FLUSH trap generalises beyond n=6
- Whether NEUTRAL windows with downward price drift (e.g., BEARISH_FADE) should be reclassified

---

## Next steps implied

1. Promote BULLISH_SQUEEZE hard block to regime engine spec — cleanest finding.
2. Flag BEARISH_FLUSH as watch-exclusion — monitor as n grows.
3. Define minimum regime engine rule: is BTC in BEARISH_TREND? If yes and not FLUSH, BTC SHORT is gated through.
4. ETH gate remains "not BULLISH_SQUEEZE" until bearish vs neutral separation improves.
5. Add OI character and funding to regime labeling for v2 — needed to improve ETH and SOL separation.
