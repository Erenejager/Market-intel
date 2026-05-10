# GitHub Data Publishing - Quick Start

> **Goal:** Automatically publish market intelligence to GitHub every 6 hours for your website to consume.

---

## ✅ What's Already Done

1. **Publish script created:** `market-intel/scripts/publish-to-github.sh`
2. **Data transformation:** `market-intel/scripts/transform-for-website.js`
3. **Orchestrator integration:** Step 9.5 added to orchestrator workflow
4. **Documentation:**
   - `GITHUB_SETUP.md` - Full setup guide
   - `DATA_SCHEMA.md` - Complete JSON schema reference

---

## 🚀 Setup (5 minutes)

### Step 1: Create GitHub Repository

```bash
# On GitHub.com:
# 1. Go to https://github.com/new
# 2. Name: "market-intel-public" (or your choice)
# 3. Visibility: Public (recommended) or Private
# 4. Check "Add README"
# 5. Create repository
```

### Step 2: Clone & Initialize

```bash
cd ~/.openclaw/workspace

# Clone your repo (replace YOUR_USERNAME)
git clone https://github.com/YOUR_USERNAME/market-intel-public.git

cd market-intel-public

# Create data structure
mkdir -p data

cat > data/latest.json <<'EOF'
{
  "metadata": {
    "timestamp": "2026-03-17T00:00:00Z",
    "message": "Waiting for first run..."
  }
}
EOF

cat > data/metadata.json <<'EOF'
{
  "last_update": "2026-03-17T00:00:00Z",
  "status": "initializing",
  "version": "1.0.0"
}
EOF

# Commit
git add data/
git commit -m "Initialize data structure"
git push origin main
```

### Step 3: Configure Git Authentication

**Option A: SSH (Recommended)**

```bash
# Generate key if needed
ssh-keygen -t ed25519 -C "openclaw@yourdomain.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub: https://github.com/settings/keys

# Update remote
cd ~/.openclaw/workspace/market-intel-public
git remote set-url origin git@github.com:YOUR_USERNAME/market-intel-public.git
```

**Option B: HTTPS Token**

```bash
# Create token: https://github.com/settings/tokens
# Scope: repo (full control)

# Configure credential storage
git config --global credential.helper store

# Push once (will prompt)
cd ~/.openclaw/workspace/market-intel-public
git push origin main
# Enter username + token as password
```

### Step 4: Test Manual Push

```bash
bash ~/.openclaw/workspace/market-intel/scripts/publish-to-github.sh
```

**Expected output:**
```
[2026-03-17 00:00:00 UTC] === Starting GitHub publish ===
[2026-03-17 00:00:00 UTC] Transforming data for website format...
[Transform] Reading input: ...
[Transform] ✅ Success! Website data ready.
[2026-03-17 00:00:00 UTC] Copied transformed website-data.json to data/latest.json
[2026-03-17 00:00:00 UTC] Updated metadata.json
[2026-03-17 00:00:00 UTC] Committed changes: 📊 Market Intel: 2026-03-17T00:00:00Z
[2026-03-17 00:00:00 UTC] ✅ Successfully pushed to GitHub
```

**Verify:** Check https://github.com/YOUR_USERNAME/market-intel-public/blob/main/data/latest.json

---

## 🔗 Website Integration

Your website can fetch data from:

```
https://raw.githubusercontent.com/YOUR_USERNAME/market-intel-public/main/data/latest.json
```

### Example JavaScript

```javascript
const DATA_URL = 'https://raw.githubusercontent.com/YOUR_USERNAME/market-intel-public/main/data/latest.json';

async function loadMarketIntel() {
  const response = await fetch(DATA_URL);
  const data = await response.json();
  
  console.log('Last update:', data.metadata.timestamp);
  console.log('Regime:', data.macro_analysis.regime);
  console.log('Signals:', data.signals);
  
  // Display on your website
  renderSignals(data.signals);
  renderMacro(data.macro_analysis);
  renderSentiment(data.sentiment);
}

loadMarketIntel();
```

### Data Refresh

- **Updates every:** 6 hours (00:00, 06:00, 12:00, 18:00 UTC)
- **Latency:** ~30-60 seconds after orchestrator run
- **Recommendation:** Poll every 5 minutes or use `metadata.timestamp` to detect changes

---

## 📊 JSON Schema Overview

```typescript
{
  metadata: {
    timestamp: string,          // "2026-03-17T00:00:00Z"
    run_id: string,             // "20260317-0000"
    next_run: string            // "2026-03-17T06:00:00Z"
  },
  
  macro_analysis: {
    regime: "RISK_ON" | "RISK_OFF" | "NEUTRAL",
    vix: number,
    dxy: number,
    fed_funds_rate: number,
    key_events: string[],
    market_summary: string
  },
  
  sentiment: {
    fear_greed_index: number,   // 0-100
    fear_greed_label: string,
    crypto_funding_btc: number,
    gold_etf_flows_ytd: number,
    // ...
  },
  
  signals: [
    {
      asset: "BTC" | "ETH" | "SOL" | "GOLD",
      signal_type: "BUY" | "SELL" | "HOLD" | "WATCH",
      strength: number,         // 0.0-1.0
      priority: "IMMEDIATE" | "DIGEST" | "LOG_ONLY",
      
      price_data: { current_price, change_6h, change_24h },
      
      trade_setup: {
        entry_zone: { min, max, optimal },
        stop_loss: number,
        risk_percent: number,
        targets: [
          { level: "TP1", price, rr_ratio },
          { level: "TP2", price, rr_ratio },
          { level: "TP3", price, rr_ratio }
        ]
      },
      
      analysis: {
        thesis: string,
        confluence_factors: string[],
        catalysts: string[],
        risks: string[]
      }
    }
  ],
  
  market_trends: {
    dominant_theme: string,
    key_observations: string[],
    contrarian_opportunities: string[],
    risks_to_monitor: string[]
  },
  
  strategy_summary: string
}
```

**Full schema:** See `market-intel/docs/DATA_SCHEMA.md`

---

## ✅ Verification

### Check Next Auto-Run

```bash
# Verify cron schedule
openclaw cron list | grep -A 5 "Market Intelligence"

# Should show: "Market Intelligence Orchestrator (4x Daily)"
# Next run: [timestamp]
```

### Monitor Logs

```bash
# Watch GitHub push logs
tail -f ~/.openclaw/workspace/market-intel/logs/github-push.log

# Watch orchestrator (after next run)
ls -lh ~/.openclaw/workspace/market-intel/data/
```

### Verify GitHub Commits

```bash
cd ~/.openclaw/workspace/market-intel-public
git log --oneline -5

# Expected:
# 📊 Market Intel: 2026-03-17T18:00:00Z
# 📊 Market Intel: 2026-03-17T12:00:00Z
# ...
```

---

## 🛠️ Troubleshooting

### "Git repo not initialized"

```bash
cd ~/.openclaw/workspace
git clone https://github.com/YOUR_USERNAME/market-intel-public.git
```

### "Permission denied (publickey)"

Re-run Step 3 (SSH setup) and ensure key is added to GitHub.

### "Transform failed"

```bash
# Test transform manually
node ~/.openclaw/workspace/market-intel/scripts/transform-for-website.js

# Check output
cat ~/.openclaw/workspace/market-intel/data/website-data.json
```

### "No changes to commit"

Normal if `signals.json` hasn't updated. Wait for next orchestrator run.

---

## 📁 Files Created

```
market-intel/
├── scripts/
│   ├── publish-to-github.sh         # Main publish script
│   └── transform-for-website.js     # Data transformer
├── docs/
│   ├── GITHUB_SETUP.md              # Detailed setup guide
│   ├── DATA_SCHEMA.md               # Full JSON schema
│   └── QUICKSTART_GITHUB.md         # This file
├── data/
│   ├── signals.json                 # Raw orchestrator output
│   └── website-data.json            # Transformed for website (auto-generated)
└── logs/
    └── github-push.log              # Publish logs

market-intel-public/ (GitHub repo)
└── data/
    ├── latest.json                  # Public data (auto-updated)
    └── metadata.json                # Timestamps
```

---

## 🎯 Next Steps

1. ✅ Complete setup (Steps 1-4 above)
2. ✅ Verify test push works
3. **→ Build your website** to consume `data/latest.json`
4. Deploy website (Vercel, Netlify, etc.)
5. Monitor first auto-run (next 00:00/06:00/12:00/18:00 UTC)

---

## 💡 Tips

- **Caching:** GitHub raw files have ~5min cache. Your website should poll every 5-10 minutes.
- **Staleness detection:** If `metadata.timestamp` is >7 hours old, show warning (orchestrator may have failed).
- **Error handling:** Always have fallback UI for fetch failures.
- **Mobile-first:** Most users will view on mobile - optimize for small screens.

---

**Questions?** See full docs in `market-intel/docs/GITHUB_SETUP.md` and `DATA_SCHEMA.md`.
