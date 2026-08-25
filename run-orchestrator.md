# Run Market Intelligence Orchestrator

## Option 1: Manual Test (Recommended First)

Since we've already tested all 4 agents individually and they work, you can manually run a full analysis:

**Copy this prompt into OpenClaw:**

```
Run full market intelligence analysis:

1. Spawn crypto analyst:
   - Read market-intel/agents/crypto-analyst.md
   - Use crypto-market-data and fear-greed skills
   - Return JSON for BTC and ETH

2. Spawn gold analyst:
   - Read market-intel/agents/gold-analyst.md  
   - Use gold-trading-skill and yahoo-finance-forex
   - Return JSON for GOLD

3. Spawn macro scout:
   - Read market-intel/agents/macro-scout.md
   - Use market-environment-analysis and web_search
   - Return JSON with risk_sentiment

4. Spawn sentiment radar:
   - Read market-intel/agents/sentiment-radar.md
   - Use fear-greed and web_search
   - Return JSON with crypto/gold sentiment

5. Synthesize all results:
   - Cross-reference signals
   - Adjust strength based on macro + sentiment confluence
   - Filter by thresholds (0.7 immediate, 0.5 digest)
   - Format for Telegram delivery

6. If any signal ≥ 0.7: Send immediate alert to @your_telegram_handle
   If any signal ≥ 0.5: Include in digest

Label: market-intel-full-run
Timeout: 600 seconds
