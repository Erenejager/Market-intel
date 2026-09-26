#!/usr/bin/env bash
set -Euo pipefail

# 15-minute research data collector. Stores Backpack order book, Binance context and cross-venue
# microstructure snapshots for future research; no signals or alerts are produced here.
# openclaw (Telegram, used by the health writer) requires Node >=24.15.
export PATH="/home/clawdbot/.nvm/versions/node/v24.18.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

cd /home/clawdbot/.openclaw/workspace/market-intel

LOG_DIR="data/logs"
mkdir -p "$LOG_DIR"

failed_steps=()

# run_step <name> <log-prefix> <script>: a failing step is logged and the run continues,
# so the health writer always reports it.
run_step() {
  local name="$1" prefix="$2" script="$3"
  local out="$LOG_DIR/$prefix.out" err="$LOG_DIR/$prefix.err"
  if node "$script" >>"$out" 2>>"$err"; then
    printf '\n' >>"$out"
  else
    local code=$?
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $name failed with exit code $code" >>"$err"
    failed_steps+=("$name")
  fi
}

# The microstructure collector reads the two snapshots below, so they run first.
run_step "backpack snapshot fetch" backpack-snapshot scripts/fetch-backpack-snapshot.js
run_step "binance context fetch" binance-context scripts/fetch-binance-context.js
run_step "microstructure collector" microstructure scripts/fetch-market-microstructure.js
run_step "health writer" health scripts/write-health.js

if [ ${#failed_steps[@]} -gt 0 ]; then
  exit 1
fi
