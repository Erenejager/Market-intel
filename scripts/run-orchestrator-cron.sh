#!/usr/bin/env bash
set -Eeuo pipefail

cd /home/clawdbot/.openclaw/workspace

OUT=/tmp/market-intel-scheduled.out
ERR=/tmp/market-intel-scheduled.err
rm -f "$OUT" "$ERR"

if node market-intel/orchestrator.js >"$OUT" 2>"$ERR"; then
  # Also capture a deterministic price/outcome sample after scheduled reports.
  # Keep this silent so Telegram delivery remains exactly the market brief.
  market-intel/scripts/run-price-sampler-cron.sh >/dev/null 2>>"$ERR" || true

  # The canonical artifact is cleaner than raw stdout because stderr may contain
  # harmless OpenClaw plugin warnings and stdout can include cached-correlation notes.
  cat market-intel/data/latest-market-brief.txt
else
  code=$?
  echo "Market Intel orchestrator failed with exit code $code"
  if [[ -s "$ERR" ]]; then
    echo
    echo "stderr:"
    tail -120 "$ERR"
  fi
  if [[ -s "$OUT" ]]; then
    echo
    echo "stdout:"
    tail -120 "$OUT"
  fi
  exit "$code"
fi
