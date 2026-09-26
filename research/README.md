# Research

Backtests behind `scripts/strategy-book.js`. Code lives here so any rule change can be re-tested
on the full history before it touches the live book.

```bash
python3 research/download_history.py   # ~1 min, writes research/cache/universe.pkl (gitignored)
python3 research/backtest.py           # sleeves, book, 2021-23 vs 2024+ split, regimes, leverage
```

Requires Python 3 with pandas and numpy.

## Rules for adding a strategy

1. Write down the hypothesis, its economic reason and the exact rule **before** running it.
2. Use standard parameters (e.g. 50/200-day averages). Do not grid-search for the best one.
3. It must be positive after 0.06%/side costs and funding, with t ≥ 3, and positive in both
   2021–23 and 2024+.
4. Count every idea you try in `docs/STRATEGY_BOOK.md` (tested / failed list); the more ideas
   tried, the more likely a "winner" is luck.
5. Only then port it to `scripts/strategy-book.js` and check a `--replay-from` run matches.

The 15-minute microstructure data in `data/microstructure-history.jsonl` is kept for future
research; as of 2026-09 it showed no edge at 2–6h horizons (see `docs/STRATEGY_BOOK.md`).
