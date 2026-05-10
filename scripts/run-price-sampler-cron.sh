#!/usr/bin/env bash
set -Eeuo pipefail

export PATH="/home/clawdbot/.nvm/versions/node/v24.13.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

cd /home/clawdbot/.openclaw/workspace

LOG_DIR="market-intel/data/autoresearch/logs"
mkdir -p "$LOG_DIR"

OUT="$LOG_DIR/price-sampler-cron.out"
ERR="$LOG_DIR/price-sampler-cron.err"
REGIME_OUT="$LOG_DIR/regime-shadow-cron.out"
REGIME_ERR="$LOG_DIR/regime-shadow-cron.err"
BACKPACK_OUT="$LOG_DIR/backpack-snapshot-cron.out"
BACKPACK_ERR="$LOG_DIR/backpack-snapshot-cron.err"
BINANCE_OUT="$LOG_DIR/binance-context-cron.out"
BINANCE_ERR="$LOG_DIR/binance-context-cron.err"
MICRO_OUT="$LOG_DIR/microstructure-cron.out"
MICRO_ERR="$LOG_DIR/microstructure-cron.err"
TRADE_QUALITY_OUT="$LOG_DIR/trade-quality-cron.out"
TRADE_QUALITY_ERR="$LOG_DIR/trade-quality-cron.err"
ALERT_OUT="$LOG_DIR/phase1d-alerts-cron.out"
ALERT_ERR="$LOG_DIR/phase1d-alerts-cron.err"
HEALTH_OUT="$LOG_DIR/pipeline-health-cron.out"
HEALTH_ERR="$LOG_DIR/pipeline-health-cron.err"

if node market-intel/scripts/autoresearch-sample-prices.js >>"$OUT" 2>>"$ERR"; then
  printf '\n' >>"$OUT"
else
  code=$?
  {
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] price sampler failed with exit code $code"
  } >>"$ERR"
  exit "$code"
fi

if node market-intel/scripts/write-regime-shadow-v1.js >>"$REGIME_OUT" 2>>"$REGIME_ERR"; then
  printf '\n' >>"$REGIME_OUT"
else
  code=$?
  {
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] regime shadow writer failed with exit code $code"
  } >>"$REGIME_ERR"
  exit "$code"
fi

if node market-intel/scripts/fetch-backpack-snapshot.js >>"$BACKPACK_OUT" 2>>"$BACKPACK_ERR"; then
  printf '\n' >>"$BACKPACK_OUT"
else
  code=$?
  {
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] backpack snapshot fetch failed with exit code $code"
  } >>"$BACKPACK_ERR"
  exit "$code"
fi

if node market-intel/scripts/fetch-binance-context.js >>"$BINANCE_OUT" 2>>"$BINANCE_ERR"; then
  printf '\n' >>"$BINANCE_OUT"
else
  code=$?
  {
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] binance context fetch failed with exit code $code"
  } >>"$BINANCE_ERR"
  exit "$code"
fi

if node market-intel/scripts/fetch-market-microstructure.js >>"$MICRO_OUT" 2>>"$MICRO_ERR"; then
  printf '\n' >>"$MICRO_OUT"
else
  code=$?
  {
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] microstructure collector failed with exit code $code"
  } >>"$MICRO_ERR"
  exit "$code"
fi

if node market-intel/scripts/build-trade-quality-report.js >>"$TRADE_QUALITY_OUT" 2>>"$TRADE_QUALITY_ERR"; then
  printf '\n' >>"$TRADE_QUALITY_OUT"
else
  code=$?
  {
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] trade quality report build failed with exit code $code"
  } >>"$TRADE_QUALITY_ERR"
  exit "$code"
fi

if node market-intel/scripts/phase1d-alerts.js >>"$ALERT_OUT" 2>>"$ALERT_ERR"; then
  printf '\n' >>"$ALERT_OUT"
else
  code=$?
  {
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] phase1d alert script failed with exit code $code"
  } >>"$ALERT_ERR"
  exit "$code"
fi

if node market-intel/scripts/write-pipeline-health.js >>"$HEALTH_OUT" 2>>"$HEALTH_ERR"; then
  printf '\n' >>"$HEALTH_OUT"
else
  code=$?
  {
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] pipeline health writer failed with exit code $code"
  } >>"$HEALTH_ERR"
  exit "$code"
fi
