# Market Intelligence - Quick Start

## 🚀 Test Your First Agent (5 minutes)

### Step 1: Spawn Crypto Analyst

Copy this into OpenClaw chat:

```
Spawn a crypto analyst agent:

Task: Read and follow the instructions in market-intel/agents/crypto-analyst.md. 
Analyze BTC and ETH markets. Use the crypto-market-data and fear-greed skills. 
Return ONLY valid JSON with your analysis. No markdown, no code blocks.

Label: crypto-analyst-test
Timeout: 300 seconds
Cleanup: delete
```

### Step 2: Wait for Completion

You'll see: "✅ Sub-agent crypto-analyst-test completed"

### Step 3: Check Results

```javascript
sessions_history({ label: 'crypto-analyst-test' })
```

### Step 4: Verify JSON

Look for JSON output like:

```json
{
  "asset": "BTC",
  "signal": "HOLD",
  "strength": 0.55,
  "reasoning": "...",
  "price_current": 67565,
  "sources": [...]
}
```

---

## ✅ If It Works

**Next steps:**
1. Test the other 3 agents (see `test-spawn.md`)
2. Update `orchestrator.js` to use real `sessions_spawn()`
3. Run full orchestration
4. Set up cron job

---

## ❌ If It Fails

**Common issues:**

**JSON not returned:**
- Check agent's last message in `sessions_history`
- Agent may have added text before/after JSON
- Update agent instructions to emphasize JSON-only

**Agent times out:**
- Skills may be slow (first API calls cache data)
- Increase timeout: `"timeout_seconds": 600` in `config.json`

**Skills not found:**
- Verify installed: `ls ~/.openclaw/workspace/skills/`
- Reinstall if needed: `cd ~/.openclaw/workspace && clawhub install <skill-name>`

**Agent returns error:**
- Read the error message in `sessions_history`
- Check skill SKILL.md for correct usage
- Test skill manually first

---

## 📚 Full Documentation

- `README.md` - Architecture and workflow
- `test-spawn.md` - Testing all 4 agents
- `SKILLS-GUIDE.md` - How agents use skills
- `FINAL-SKILL-STACK.md` - Installed skills inventory

---

## 🎯 Goal

Get one agent working → Test all four → Automate with orchestrator → Profit from signals 📈
