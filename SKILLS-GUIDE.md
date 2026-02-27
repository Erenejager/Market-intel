# Market Intelligence Skills Guide

## ✅ Working Skills (Verified)

**Crypto Analysis:**
- ✅ `crypto-market-data` - BTC/ETH prices (no API key)
- ✅ `fear-greed` - Crypto Fear & Greed Index (no API key)

**Gold/Forex Analysis:**
- ✅ `gold-trading-skill` - Gold spot prices
- ✅ `yahoo-finance-forex` - Live forex rates + USD sentiment (no API key)

**Macro/Market Analysis:**
- ✅ `market-environment-analysis` - Risk-on/risk-off regime
- ✅ `macro-monitor` - Free macro data scraping (Trading Economics, FRED)

**Alternatives (if needed):**
- ⏳ `social-sentiment` - Retry later (rate limited)
- 🔍 Use `web_search` + `web_fetch` for news/events

---

## Installation

Already installed. To add more skills:
```bash
cd ~/.openclaw/workspace
clawhub install <skill-name>
```

---

## How Agents Use Skills

Each agent should read the relevant skill's `SKILL.md` file at the start of their task.

### Crypto Analyst Agent

**Skills to use:**
- `crypto-market-data` - Get BTC/ETH prices, market cap, volume
- `fear-greed` - Crypto Fear & Greed Index

**Alternative data sources:**
- `web_search` - Search for breaking crypto news
- `web_fetch` - Scrape CoinGecko/CoinMarketCap if needed

**Usage pattern:**
```markdown
1. Read ~/.openclaw/workspace/skills/crypto-market-data/SKILL.md
2. Get BTC/ETH price data using the scripts
3. Read ~/.openclaw/workspace/skills/fear-greed/SKILL.md
4. Get current Fear & Greed value
5. Use web_search for breaking news: "bitcoin news today"
6. Combine data + return JSON
```

### Gold Analyst Agent

**Skills to use:**
- `gold-trading-skill` - Gold spot price, trends
- `yahoo-finance-forex` - USD strength via forex pairs (GBP/USD, EUR/USD, DXY proxy)

**Alternative data sources:**
- `web_search` - Search for gold market news, central bank news
- `crypto-market-data` - Can also get DXY if available

**Usage pattern:**
```markdown
1. Read ~/.openclaw/workspace/skills/gold-trading-skill/SKILL.md
2. Get gold price data
3. Read ~/.openclaw/workspace/skills/yahoo-finance-forex/SKILL.md
4. Get EUR/USD, GBP/USD rates to assess USD strength
5. Use web_search: "gold market news today"
6. Return JSON with gold signal + USD context
```

### Macro Scout Agent

**Skills to use:**
- `market-environment-analysis` - Economic regime detection
- `macro-monitor` - Scrapes Trading Economics, FRED, central bank sites
- `yahoo-finance-forex` - Forex market sentiment

**Alternative data sources:**
- `web_search` - Search for: "FOMC decision", "CPI data today", "Fed speech"
- `web_fetch` - Scrape specific economic calendars

**Usage pattern:**
```markdown
1. Read ~/.openclaw/workspace/skills/market-environment-analysis/SKILL.md
2. Get macro regime (risk-on/risk-off)
3. Read ~/.openclaw/workspace/skills/macro-monitor/SKILL.md
4. Check recent economic data releases (last 24h)
5. Use web_search for upcoming events: "economic calendar this week"
6. Return JSON summary of macro environment
```

### Sentiment Radar Agent

**Skills to use:**
- `fear-greed` - Fear & Greed index (primary)

**Alternative data sources:**
- `web_search` - Search: "crypto sentiment", "market sentiment today"
- `web_fetch` - Scrape sentiment aggregators (Alternative.me, LunarCrush)

**Usage pattern:**
```markdown
1. Read ~/.openclaw/workspace/skills/fear-greed/SKILL.md
2. Get current Fear & Greed index
3. Use web_search: "crypto sentiment reddit" or "bitcoin twitter sentiment"
4. Use web_fetch to scrape: https://alternative.me/crypto/fear-and-greed-index/ (if skill fails)
5. Return JSON with sentiment scores
```

## Built-in Tools (No Skill Required)

Your agents also have access to:
- `web_search` - Search the web (Brave API)
- `web_fetch` - Fetch page content
- `Read` - Read any file
- `exec` - Run shell commands

## Skill Location

All installed skills are in:
```
~/.openclaw/workspace/skills/
├── crypto-market-data/
│   └── SKILL.md
├── fear-greed/
│   └── SKILL.md
├── gold-trading-skill/
│   └── SKILL.md
└── ...
```

## Example Agent Task (for orchestrator)

```javascript
// Crypto analyst task
const task = `
You are a crypto market analyst. Your mission:

1. Read the crypto-market-data skill:
   ~/.openclaw/workspace/skills/crypto-market-data/SKILL.md

2. Get current BTC and ETH data:
   - Price
   - 24h change
   - Market cap
   - Volume

3. Read the fear-greed skill:
   ~/.openclaw/workspace/skills/fear-greed/SKILL.md

4. Get current Fear & Greed index value

5. Return ONLY valid JSON:
{
  "asset": "BTC",
  "signal": "BUY|SELL|HOLD|WATCH",
  "strength": 0.75,
  "reasoning": "...",
  "price_current": 65000,
  "fear_greed": 72,
  "sources": ["..."]
}
`;

sessions_spawn({
  task,
  label: "crypto-analyst",
  cleanup: "delete"
});
```

## Next Steps

1. **Install skills:** `./install-skills.sh`
2. **Test a single skill manually:** Read its SKILL.md and try the commands
3. **Update agent .md files** to reference the skills they should use
4. **Test with a single agent spawn** before running all 4 in parallel
