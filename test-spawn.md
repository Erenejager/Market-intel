# Test Agent Spawning

This guide shows how to manually test spawning a single agent to verify the workflow before running the full orchestrator.

## Test Crypto Analyst

**Prompt to send in OpenClaw:**

```
Spawn a crypto analyst agent:

Task: Read and follow the instructions in market-intel/agents/crypto-analyst.md. Analyze BTC and ETH markets. Use the crypto-market-data and fear-greed skills. Return ONLY valid JSON with your analysis.

Label: crypto-analyst-test
Timeout: 300 seconds
Cleanup: delete
```

**Expected result:**

The agent should:
1. Read `market-intel/agents/crypto-analyst.md`
2. Read skill files: `~/.openclaw/workspace/skills/crypto-market-data/SKILL.md`, `~/.openclaw/workspace/skills/fear-greed/SKILL.md`
3. Fetch BTC and ETH price data
4. Get Fear & Greed index
5. Perform analysis
6. Return JSON like:

```json
{
  "asset": "BTC",
  "signal": "HOLD",
  "strength": 0.55,
  "reasoning": "BTC at $67,565 holding above $65k support. Fear & Greed at 45 (Fear) suggests room for upside but no extreme buying opportunity. Volume moderate. Waiting for breakout above $68k.",
  "price_current": 67565,
  "price_24h_change": 1.2,
  "sources": ["crypto-market-data skill", "fear-greed skill"]
}
```

---

## Test Gold Analyst

**Prompt:**

```
Spawn a gold analyst agent:

Task: Read and follow the instructions in market-intel/agents/gold-analyst.md. Analyze the gold market. Use the gold-trading-skill and yahoo-finance-forex skills. Return ONLY valid JSON.

Label: gold-analyst-test
Timeout: 180 seconds
Cleanup: delete
```

---

## Test Macro Scout

**Prompt:**

```
Spawn a macro scout agent:

Task: Read and follow the instructions in market-intel/agents/macro-scout.md. Scan the macro landscape. Use market-environment-analysis and web_search for latest economic news. Return ONLY valid JSON.

Label: macro-scout-test
Timeout: 240 seconds
Cleanup: delete
```

---

## Test Sentiment Radar

**Prompt:**

```
Spawn a sentiment radar agent:

Task: Read and follow the instructions in market-intel/agents/sentiment-radar.md. Gauge market sentiment. Use the fear-greed skill and web_search for sentiment data. Return ONLY valid JSON.

Label: sentiment-radar-test
Timeout: 180 seconds
Cleanup: delete
```

---

## Checking Results

After spawning an agent:

1. **List sessions:**
   ```
   sessions_list({ kinds: ['isolated'] })
   ```

2. **Check agent history:**
   ```
   sessions_history({ label: 'crypto-analyst-test' })
   ```

3. **Parse the JSON:**
   - Look for the last message in the session
   - Extract the JSON object
   - Verify format matches expected schema

---

## Common Issues

**Agent returns text instead of JSON:**
- Update the agent instruction file to emphasize JSON-only output
- Add examples of the exact JSON format

**Agent times out:**
- Increase timeout in config.json
- Simplify the task (fewer data sources)

**Agent can't find skills:**
- Verify skill is installed: `ls ~/.openclaw/workspace/skills/`
- Check SKILL.md exists in the skill directory

**JSON parsing fails:**
- Agent may include markdown code blocks - strip them
- Agent may add explanatory text before/after JSON - extract only { ... }

---

## Next Steps

Once you've verified a single agent works:

1. Test all 4 agents manually
2. Verify JSON format from each
3. Update orchestrator.js to use real `sessions_spawn()`
4. Test orchestrator with `--test all` flag
5. Set up cron job for twice-daily runs
