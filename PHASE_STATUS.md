# Market Intel Phase Status

Last updated: 2026-09-26 UTC

## Now: Phase S1 — paper strategy book (2026-09-26 → about 2026-11-21)

- `scripts/strategy-book.js` v2 runs daily at 00:10 UTC. It has three sleeves:
  - SMA50 trend, active only while BTC is above its 200-day SMA,
  - weekly funding carry,
  - BTC/ETH cash-and-carry.
- Paper equity is 10,000 USDT, with a daily Telegram summary and a -15% kill switch.
- Replay 2021+ with the v2 rules: Sharpe 2.0, max drawdown -14%. The Python backtest (`research/backtest.py`) gives Sharpe 1.93 and max drawdown -16%.
- The 15-minute collector keeps storing research data. `write-health.js` pings Telegram on stale data.

## Open items

- [ ] Check that all 19 coins trade on Backpack (the execution venue), with their minimum order sizes and real spreads.
- [ ] Review the paper book weekly against the pass bar in `docs/STRATEGY_BOOK.md`.
- [ ] Before real money: decide the capital and position sizing, and how to handle the cash-and-carry margin buffer.

## History

- **2026-09-26: rebuilt around the strategy book.**
  - The edge audit found that Phase 1d alerts performed like random entries after costs. The Telegram alerts actually sent won 50.3% at 2h, with an average of -0.13%.
  - Deleted: the Phase 1d alert engine, readiness scoring, pattern gates, the trade-quality reports, the agent orchestrator, about 45 analysis scripts, about 65 old docs, and about 400 MB of alert and score history.
  - Kept: the order book, Binance context and microstructure collectors, and their history.
  - Also fixed: node PATH problems in cron (Telegram sends had failed since 2026-07-20, and the daily job had not run since 2026-07-02). A single failed step used to stop the whole pipeline without warning.
- **2026-02 → 2026-09: Phase 0–1d.** This was a multi-agent market-analysis system followed by a 15-minute microstructure alert engine. The code is still in git history, in the commits before the 2026-09-26 rebuild.
