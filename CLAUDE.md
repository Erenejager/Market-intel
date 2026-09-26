# Market Intel — Claude Context

Market Intel is a daily paper strategy book for crypto perps, plus a 15-minute research data collector. It is written in Node.js and runs from the user crontab. Read `README.md` for the layout and `docs/STRATEGY_BOOK.md` for the rules and evidence.

## Current phase

**Phase S1: paper trading, 2026-09-26 → about 2026-11-21 (56 days).** The pass bar is in `docs/STRATEGY_BOOK.md`.

## Hard rules

- **Goal:** positive expectancy after costs, out-of-sample. A high win rate is not the goal. Random entries can reach a 75% win rate and still lose money.
- **Changing strategy rules:** test in `research/backtest.py` on 2021+ data first. Use standard parameters with no grid search. The result needs t ≥ 3 and must be positive in both 2021–23 and 2024+. Then port the change to `scripts/strategy-book.js` and confirm that `--replay-from` matches the backtest.
- **During the paper period:** do not change rules in response to live results. If a rule changes, bump `version` in the state and restart the book.
- **The 15-minute collector is data-only:**
  - Do not build 2–6h signals from it without a written hypothesis and a multi-year-style test.
  - The 2026-09 audit tested about 111k conditions and none worked.
  - The old Phase 1d alert engine was deleted for that reason.
- **Leverage:** none during paper trading. Recommended maximum afterwards is 1.5× on the whole book.
- **Cron:** every cron line must set PATH to node v24.18.0. openclaw needs node ≥24.15.

## Key files

- `scripts/strategy-book.js`: rules, accounting and Telegram summary. State and ledger are in `data/strategy-book/`.
- `scripts/run-collector-cron.sh`: runs the collectors, then `scripts/write-health.js`.
- `data/microstructure-history.jsonl` and `data/binance-context-history.jsonl`: the research history. Do not delete.
