# GitHub Data Pipeline Setup

This guide walks through setting up the GitHub repository to publish market intelligence data for your website.

## Overview

Every 6 hours, the orchestrator:
1. Runs market analysis
2. Sends Telegram alerts
3. Publishes data to GitHub
4. Your website fetches from GitHub and displays

---

## Step 1: Create GitHub Repository

### Option A: New Repository

```bash
# On GitHub.com
1. Go to https://github.com/new
2. Repository name: "market-intel-public"
3. Visibility: Public (or Private if you prefer)
4. Initialize: Check "Add README"
5. Click "Create repository"
```

### Option B: Use Existing Repository

If you already have a repo, just add a `data/` folder to it.

---

## Step 2: Clone Repository Locally

```bash
cd ~/.openclaw/workspace

# Clone your repo
git clone https://github.com/YOUR_USERNAME/market-intel-public.git

# Verify
cd market-intel-public
ls -la  # Should see .git directory
```

---

## Step 3: Initialize Data Structure

```bash
cd ~/.openclaw/workspace/market-intel-public

# Create data directory
mkdir -p data

# Create initial placeholder files
cat > data/latest.json <<'EOF'
{
  "metadata": {
    "timestamp": "2026-03-17T00:00:00Z",
    "run_id": "initial",
    "next_run": "2026-03-17T06:00:00Z"
  },
  "message": "Waiting for first market intelligence run..."
}
EOF

cat > data/metadata.json <<'EOF'
{
  "last_update": "2026-03-17T00:00:00Z",
  "next_run": "2026-03-17T06:00:00Z",
  "status": "initializing",
  "version": "1.0.0"
}
EOF

# Commit initial structure
git add data/
git commit -m "Initialize data structure"
git push origin main
```

---

## Step 4: Configure Git Credentials

Ensure OpenClaw can push without password prompts:

### Option A: SSH (Recommended)

```bash
# Generate SSH key if you don't have one
ssh-keygen -t ed25519 -C "openclaw@yourdomain.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub:
# 1. Go to https://github.com/settings/keys
# 2. Click "New SSH key"
# 3. Paste your public key
# 4. Save

# Update remote to use SSH
cd ~/.openclaw/workspace/market-intel-public
git remote set-url origin git@github.com:YOUR_USERNAME/market-intel-public.git
```

### Option B: HTTPS with Token

```bash
# Create GitHub Personal Access Token:
# 1. Go to https://github.com/settings/tokens
# 2. Generate new token (classic)
# 3. Scopes: repo (full control)
# 4. Copy token

# Configure git credential storage
git config --global credential.helper store

# Push once (will prompt for credentials)
cd ~/.openclaw/workspace/market-intel-public
git push origin main
# Username: YOUR_USERNAME
# Password: [paste your token]

# Future pushes will use stored credentials
```

---

## Step 5: Test Manual Push

```bash
# Run the publish script manually
bash ~/.openclaw/workspace/market-intel/scripts/publish-to-github.sh

# Expected output:
# [2026-03-17 00:00:00 UTC] === Starting GitHub publish ===
# [2026-03-17 00:00:00 UTC] Copied signals.json to data/latest.json
# [2026-03-17 00:00:00 UTC] Updated metadata.json
# [2026-03-17 00:00:00 UTC] Committed changes: 📊 Market Intel: 2026-03-17T00:00:00Z
# [2026-03-17 00:00:00 UTC] ✅ Successfully pushed to GitHub
```

**Verify on GitHub:**
1. Go to https://github.com/YOUR_USERNAME/market-intel-public
2. Check `data/latest.json` exists
3. Verify commit shows up in history

---

## Step 6: Verify Next Orchestrator Run

The script is now integrated into the orchestrator. Next scheduled run will automatically push to GitHub.

**Check cron schedule:**
```bash
# Via OpenClaw
openclaw cron list

# Should show: "Market Intelligence Orchestrator (4x Daily)"
# Schedule: 00:00, 06:00, 12:00, 18:00 UTC
```

**Monitor next run:**
```bash
# Watch logs
tail -f ~/.openclaw/workspace/market-intel/logs/github-push.log
```

---

## Data Format for Your Website

### Accessing the Data

**Raw GitHub URLs:**
```
https://raw.githubusercontent.com/YOUR_USERNAME/market-intel-public/main/data/latest.json
https://raw.githubusercontent.com/YOUR_USERNAME/market-intel-public/main/data/metadata.json
```

**In your website JavaScript:**
```javascript
const DATA_URL = 'https://raw.githubusercontent.com/YOUR_USERNAME/market-intel-public/main/data/latest.json';

async function loadMarketData() {
  const response = await fetch(DATA_URL);
  const data = await response.json();
  
  // data.metadata.timestamp
  // data.macro_analysis.regime
  // data.signals[] - array of signal objects
  // etc.
}
```

### JSON Schema Reference

See the detailed schema in the main plan above. Key fields:

```javascript
{
  metadata: { timestamp, run_id, next_run },
  macro_analysis: { regime, vix, dxy, key_events, market_summary },
  sentiment: { fear_greed_index, funding rates, etf flows },
  signals: [
    {
      asset: "BTC",
      signal_type: "BUY",
      strength: 0.81,
      price_data: { current_price, change_6h, change_24h },
      trade_setup: {
        entry_zone: { min, max, optimal },
        stop_loss,
        targets: [{ level, price, rr_ratio }]
      },
      analysis: {
        thesis,
        confluence_factors,
        catalysts,
        risks
      }
    }
  ],
  market_trends: { dominant_theme, key_observations, risks },
  strategy_summary: "..."
}
```

---

## Troubleshooting

### "Git repo not initialized" Error

**Cause:** Repository not cloned to expected path.

**Fix:**
```bash
cd ~/.openclaw/workspace
git clone https://github.com/YOUR_USERNAME/market-intel-public.git
```

### "Permission denied (publickey)" Error

**Cause:** SSH key not configured.

**Fix:** Follow Step 4 Option A again, ensure SSH key added to GitHub.

### "No changes to commit" Every Run

**Cause:** `signals.json` unchanged (unlikely unless orchestrator failed).

**Check:**
```bash
cat ~/.openclaw/workspace/market-intel/data/signals.json
# Verify timestamp is updating
```

### Push Fails After 3 Retries

**Check logs:**
```bash
cat ~/.openclaw/workspace/market-intel/logs/github-push.log
```

**Common causes:**
- Network connectivity issues
- GitHub API rate limits (rare)
- Repository permissions changed

**Manual recovery:**
```bash
cd ~/.openclaw/workspace/market-intel-public
git status
git pull origin main
# Resolve any conflicts
git push origin main
```

---

## Maintenance

### Viewing Push History

```bash
cd ~/.openclaw/workspace/market-intel-public
git log --oneline -20

# Expected output:
# 📊 Market Intel: 2026-03-17T18:00:00Z
# 📊 Market Intel: 2026-03-17T12:00:00Z
# 📊 Market Intel: 2026-03-17T06:00:00Z
```

### Cleaning Old Commits (Optional)

If repo gets too large (after thousands of runs):

```bash
# Squash old commits (keep last 100)
git rebase -i HEAD~100

# Force push (WARNING: destructive)
git push origin main --force
```

**Note:** GitHub has 1GB soft limit per repo. At ~4KB per commit, you can store ~250,000 runs before hitting limits (years of data).

---

## Next Steps

1. ✅ Repository created
2. ✅ Cloned locally
3. ✅ Git credentials configured
4. ✅ Test push successful
5. **→ Build your website** to fetch from `data/latest.json`

Your website will always have the latest market intelligence within ~30 seconds of each orchestrator run.
