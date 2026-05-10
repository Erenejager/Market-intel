#!/bin/bash
# Market Intelligence → GitHub Publisher
# Pushes latest signals to GitHub repo for website consumption

set -e

# Configuration
REPO_PATH="$HOME/.openclaw/workspace/market-intel-public"
DATA_SOURCE="$HOME/.openclaw/workspace/market-intel/data/signals.json"
LOG_FILE="$HOME/.openclaw/workspace/market-intel/logs/github-push.log"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# Logging function
log() {
    echo "[$(date -u +"%Y-%m-%d %H:%M:%S UTC")] $1" | tee -a "$LOG_FILE"
}

log "=== Starting GitHub publish ==="

# Validate source file exists
if [ ! -f "$DATA_SOURCE" ]; then
    log "ERROR: Source file not found: $DATA_SOURCE"
    exit 1
fi

# Validate repo exists
if [ ! -d "$REPO_PATH/.git" ]; then
    log "ERROR: Git repo not initialized at $REPO_PATH"
    log "Please run: git clone <your-repo-url> $REPO_PATH"
    exit 1
fi

cd "$REPO_PATH"

# Ensure data directory exists
mkdir -p data

# Transform data for website
log "Transforming data for website format..."
node "$HOME/.openclaw/workspace/market-intel/scripts/transform-for-website.js"

if [ $? -ne 0 ]; then
    log "ERROR: Data transformation failed"
    exit 1
fi

# Copy transformed data (or fallback to raw if transform failed)
if [ -f "$HOME/.openclaw/workspace/market-intel/data/website-data.json" ]; then
    cp "$HOME/.openclaw/workspace/market-intel/data/website-data.json" data/latest.json
    log "Copied transformed website-data.json to data/latest.json"
else
    log "WARNING: Transform output not found, using raw signals.json"
    cp "$DATA_SOURCE" data/latest.json
fi

# Update metadata
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
NEXT_RUN=$(date -u -d '+6 hours' +"%Y-%m-%dT%H:%M:%SZ")

cat > data/metadata.json <<EOF
{
  "last_update": "$TIMESTAMP",
  "next_run": "$NEXT_RUN",
  "status": "operational",
  "version": "1.0.0"
}
EOF
log "Updated metadata.json"

# Git operations
git add data/
COMMIT_MSG="📊 Market Intel: $TIMESTAMP"

if git diff --cached --quiet; then
    log "No changes to commit (signals unchanged)"
else
    git commit -m "$COMMIT_MSG"
    log "Committed changes: $COMMIT_MSG"
    
    # Push with retry logic
    MAX_RETRIES=3
    RETRY_COUNT=0
    
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if git push origin main 2>&1 | tee -a "$LOG_FILE"; then
            log "✅ Successfully pushed to GitHub"
            exit 0
        else
            RETRY_COUNT=$((RETRY_COUNT + 1))
            log "⚠️ Push failed (attempt $RETRY_COUNT/$MAX_RETRIES)"
            
            if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
                log "Retrying in 5 seconds..."
                sleep 5
            fi
        fi
    done
    
    log "❌ Failed to push after $MAX_RETRIES attempts"
    exit 1
fi
