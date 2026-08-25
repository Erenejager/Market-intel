# Run Market Intelligence Orchestrator — Clean Manual Path

⚠️ IMPORTANT LEAKAGE WARNING

Do not run this workflow directly from a user-facing chat if zero progress/tiding messages are required. OpenClaw may surface tool activity such as `exec node ...`, `yield`, or "orchestrator is running" even if the final assistant text is clean.

For truly clean manual Telegram/webchat output, use a deterministic non-agent runner/renderer that writes a final artifact, then send only that artifact's rendered summary.

# Clean Telegram Orchestrator Run

Use this for Telegram/manual runs.

Goal: produce one human-readable Market Intel summary. No raw JSON, no child-agent progress, no code blocks.

Rules:

1. Do not expose internal analyst outputs.
2. Do not run the agent workflow directly from a Telegram/webchat-facing session when zero tidings are required. Use deterministic runner/renderer instead. Do not spawn child agents.
3. First refresh deterministic data:
   - `node market-intel/scripts/fetch-backpack-snapshot.js`
   - `node market-intel/scripts/fetch-extras-cache.js`
   - `node market-intel/scripts/fetch-binance-context.js`
4. Read:
   - `market-intel/data/backpack-snapshot-lite.json`
   - `market-intel/data/binance-context.json`
   - `market-intel/data/extras/crypto-fear-greed.json`
   - `market-intel/data/extras/usd-index.json`
   - `market-intel/data/extras/yields.json`
5. Analyze BTC/ETH/SOL/PAXG directly from those files.
6. Store the run in `market-intel/data/signals.json`.
7. User-facing output must be one clean summary:
   - market state
   - strongest signals sorted by strength
   - entry/stop/targets if available
   - Backpack funding/OI
   - Binance context summary
   - macro/sentiment
   - bottom line
8. If no actionable entry exists, say clearly what confirmation is needed.
9. Never paste raw JSON into Telegram.
