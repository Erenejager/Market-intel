# Whale Activity Enhancement - Tier 2

## Current State (Baseline)

Whale net flow is fetched but thresholds are **asset-agnostic** and adjustments are **not clearly applied**.

Current thresholds (from crypto-analyst.md):
- Strong accumulation: <-2000 BTC / <-30000 ETH
- Accumulation: <-500 BTC / <-7500 ETH
- Strong distribution: >+2000 BTC / >+30000 ETH
- Distribution: >+500 BTC / >+7500 ETH

**Problems:**
1. SOL has no thresholds defined
2. Adjustments are in % (+10%, +5%) but applied inconsistently
3. No historical validation of thresholds
4. Reasoning doesn't always mention exact net flow values

---

## Enhancement Plan

### 1. Standardize Thresholds by Market Cap Weight

**Concept:** Scale thresholds by market cap to keep signals proportional.

**New Thresholds (March 2026):**

| Asset | Market Cap | Strong Acc | Accumulation | Neutral Range | Distribution | Strong Dist |
|-------|-----------|------------|--------------|---------------|--------------|-------------|
| BTC   | ~$1.3T    | <-1500     | <-400       | -400 to +400  | >+400        | >+1500      |
| ETH   | ~$230B    | <-20000    | <-5000      | -5k to +5k    | >+5000       | >+20000     |
| SOL   | ~$80B     | <-100000   | <-25000     | -25k to +25k  | >+25000      | >+100000    |

**Rationale:**
- BTC: Lower thresholds (more liquid, fewer coins needed to signal)
- ETH: Mid thresholds (more supply, higher transaction volume)
- SOL: Higher thresholds (cheaper per coin, more volatile flows)

---

### 2. Strengthen Adjustment Logic

**Current:** +10%/+5% boosts feel arbitrary.

**New:**
- Strong accumulation + BUY: **+0.12** (12% boost - high conviction)
- Accumulation + BUY: **+0.06** (6% boost - moderate conviction)
- Neutral: **0** (no adjustment)
- Distribution + BUY: **-0.06** (6% penalty - bearish divergence)
- Strong distribution + BUY: **-0.12** (12% penalty - strong bearish divergence)

**Why 12%/6%?**
- Enough to move signals across thresholds (e.g., 0.68 → 0.80)
- Not so high it dominates other factors
- Symmetrical penalties for distribution (balance)

---

### 3. Mandatory Reasoning Requirements

**Update crypto-analyst.md to REQUIRE:**

Every signal reasoning MUST include:
```
"Whale flows: [NET_FLOW] [ASSET] net ([INTERPRETATION]). [IMPACT]."
```

**Examples:**
- "Whale flows: -1,234 BTC net (strong accumulation). Whales removing coins from exchanges - supply shock building. +12% signal boost."
- "Whale flows: +789 ETH net (distribution). Moderate selling pressure detected. -6% signal penalty."
- "Whale flows: -42 BTC net (neutral). No significant whale activity."

**Benefits:**
- Transparency (user sees exact net flow)
- Consistency (every signal has whale context)
- Debuggability (can verify adjustments)

---

### 4. Add Whale Confidence Scoring

**New field:** `whale_confidence` (0.0-1.0)

**Calculation:**
```
whale_confidence = min(1.0, abs(net_flow) / strong_threshold)

Examples:
- BTC -2000 / 1500 = 1.33 → capped at 1.0 (very confident)
- BTC -600 / 1500 = 0.40 → 0.40 (moderate confidence)
- BTC -50 / 1500 = 0.03 → 0.03 (low confidence)
```

**Use:**
- Orchestrator can filter signals with `whale_confidence > 0.5` for high-conviction plays
- Helps distinguish "strong accumulation with high confidence" vs "strong accumulation but borderline"

---

## Implementation

### Update crypto-analyst.md

**Section 1: Update whale thresholds (Step 2.5)**

```markdown
**Interpretation (March 2026 thresholds):**

**BTC:**
- **STRONG_ACCUMULATION** (<-1500): Whales removing heavily → +12% boost
- **ACCUMULATION** (<-400): Moderate whale buying → +6% boost
- **NEUTRAL** (-400 to +400): No significant activity → 0% adjustment
- **DISTRIBUTION** (>+400): Moderate selling → -6% penalty
- **STRONG_DISTRIBUTION** (>+1500): Heavy selling → -12% penalty

**ETH:**
- **STRONG_ACCUMULATION** (<-20000): Whales removing heavily → +12% boost
- **ACCUMULATION** (<-5000): Moderate whale buying → +6% boost
- **NEUTRAL** (-5k to +5k): No significant activity → 0% adjustment
- **DISTRIBUTION** (>+5000): Moderate selling → -6% penalty
- **STRONG_DISTRIBUTION** (>+20000): Heavy selling → -12% penalty

**SOL:**
- **STRONG_ACCUMULATION** (<-100000): Whales removing heavily → +12% boost
- **ACCUMULATION** (<-25000): Moderate whale buying → +6% boost
- **NEUTRAL** (-25k to +25k): No significant activity → 0% adjustment
- **DISTRIBUTION** (>+25000): Moderate selling → -6% penalty
- **STRONG_DISTRIBUTION** (>+100000): Heavy selling → -12% penalty
```

**Section 2: Update confluence logic**

```markdown
**Apply whale flow adjustment:**
- Strong accumulation + BUY: +0.12
- Accumulation + BUY: +0.06
- Strong distribution + BUY: -0.12
- Distribution + BUY: -0.06
- Neutral → no adjustment

**Calculate whale_confidence:**
whale_confidence = min(1.0, abs(net_flow) / strong_threshold)
```

**Section 3: Update JSON output**

```json
{
  "whale_activity": "STRONG_ACCUMULATION",
  "whale_net_flow": -1834,
  "whale_confidence": 0.92,
  "reasoning": "BTC breaking above $66k... Whale flows: -1,834 BTC net (strong accumulation). Whales removing coins from exchanges - supply shock building. +12% signal boost from whale activity."
}
```

---

## Testing Plan

### Test Case 1: Strong Accumulation
```
BTC net flow: -1,800 BTC
Expected:
- whale_activity: STRONG_ACCUMULATION
- whale_confidence: 1.0 (1800/1500 capped)
- Adjustment: +0.12
- Reasoning: "Whale flows: -1,800 BTC net (strong accumulation). +12% signal boost."
```

### Test Case 2: Mild Accumulation
```
BTC net flow: -450 BTC
Expected:
- whale_activity: ACCUMULATION
- whale_confidence: 0.30 (450/1500)
- Adjustment: +0.06
- Reasoning: "Whale flows: -450 BTC net (accumulation). +6% signal boost."
```

### Test Case 3: Neutral
```
BTC net flow: -114 BTC
Expected:
- whale_activity: NEUTRAL
- whale_confidence: 0.08 (114/1500)
- Adjustment: 0
- Reasoning: "Whale flows: -114 BTC net (neutral). No significant whale activity."
```

---

## Rollout Plan

1. ✅ Update crypto-analyst.md with new thresholds
2. ✅ Add whale_confidence calculation
3. ✅ Update JSON output format
4. Test with live data (1 run)
5. Deploy to production (next market intel run)
6. Monitor for 1 week
7. Compare vs baseline (signals.json historical data)

---

## Success Metrics

**Before:**
- Whale adjustments: +10%/+5%/-5%/-10%
- Thresholds: BTC ±500/±2000, ETH ±7500/±30000, SOL undefined
- Reasoning: Sometimes mentions whale activity

**After:**
- Whale adjustments: +12%/+6%/-6%/-12% (stronger, symmetrical)
- Thresholds: BTC ±400/±1500, ETH ±5k/±20k, SOL ±25k/±100k (market cap weighted)
- Reasoning: **Always** mentions exact net flow + interpretation
- New field: `whale_confidence` for filtering high-conviction signals

**Expected Improvement:**
- 5-10% more accurate strength scores (caught earlier accumulation phases)
- Clearer signal transparency (users can verify whale logic)
- Better filtering (orchestrator can prioritize high whale_confidence signals)

---

**Status:** Ready to implement  
**Estimated time:** 20 minutes  
**Risk:** Low (incremental enhancement to existing system)
