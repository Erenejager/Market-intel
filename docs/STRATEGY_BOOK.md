# Strategy Book (Phase S1)

Started 2026-09-26. The v2 rules, which add the BTC 200-day filter on trend, applied from day 0. The book is paper only; no orders are placed.

## Why this exists

An audit on 2026-09-26 tested the Phase 1d alert engine against later prices (data from 2026-06-20 on, 0.12% round-trip cost):

- The alerts sent to Telegram won 50.3% at 2h and averaged -0.13% per trade after costs. That is the same as a random entry.
- Trade-quality labels (`TRADEABLE_*` vs `NO_TRADE_BAD_PATH`) did not separate winners from losers.
- A search of about 111k single and paired conditions over the 15m microstructure data found none with >75% wins at 2h, 4h and 6h after costs.
- The best candidate, buying dips, won 75–80% in the 4-month sample. Over 2021–2026 it won 48–51%.
- Win rate alone does not show edge. Random BTC entries with a +0.3% target and a -2% stop win 75% of trades but lose -0.11% per trade.

Because of this, the goal changed from "win rate > 75% at 2–6h" to **positive expectancy after costs that holds out-of-sample**. The Phase 1d alert engine was deleted on 2026-09-26. It is still in git history.

## Backtest (2021-01 → 2026-09, 19 Binance USD-M perps, daily)

| Strategy | Ann. return | Sharpe (2021–23 / 2024–26) | Max DD |
|---|---|---|---|
| Buy & hold BTC | 35% | 0.61 (0.52 / 0.76) | -77% |
| Trend: close > SMA50, long/flat, only while BTC > its 200-day SMA | 23% | 1.23 (1.43 / 1.02) | -23% |
| Cross-sectional funding carry | 26% | 1.17 (0.71 / 2.00) | -36% |
| BTC/ETH cash-and-carry (funding only) | 8% | 5.5 (overstated: basis not modelled) | -5% |
| **Book: 1/3 each** | **19%** | **1.93 (1.74 / 2.21)** | **-16%** |

Returns by BTC regime: the book made +34%/yr while BTC was above its 200-day SMA, and about 0%/yr below it. Buy & hold BTC made +121% and -70%.

Book returns under leverage:

| Leverage | Return/yr | Max drawdown |
|---|---|---|
| 1x | 19% | -16% |
| 1.5x | 28% | -23% |
| 2x | 38% | -29% |
| 3x | 57% | -41% |

Leverage risks:
- Single coins fell more than 33% in one day 10 times while held.
- Carry shorts moved up to 57% against us in a single day.

Reproduce these numbers with `research/backtest.py`.

Tested and **failed** (same test, costs included):
- cross-sectional momentum
- 1-day reversal
- extreme-funding contrarian
- 2–6h dip buying
- blended SMA 20/50/100
- BTC/altcoin rotation
- ETH/BTC mean reversion
- day-of-week effects
- Binance–Bybit funding arbitrage
- buying BTC after a -8% day
- volatility targeting of the book

Tested and **adopted**: the BTC 200-day filter on trend. It took 2022 from -20% to 0% and the book's max drawdown from -21% to -16%.

Trend trades win only 18–37% of the time. They make money because the winners are large: average win about +30–65%, average loss about -5–10%, profit factor about 2.3–2.8.

Caveats:
- The universe was chosen in 2026, so the backtest has survivorship bias.
- A large share of trend returns comes from 2021.
- Cash-and-carry models funding only. Moves in the basis are ignored.

## Rules (`scripts/strategy-book.js`)

Rebalance at the Binance daily close (00:00 UTC). The cron job runs at 00:10 UTC. Each sleeve gets 1/3 of capital.

1. **trend**
   - Only while BTC's daily close is above its 200-day SMA. Otherwise the whole sleeve is flat.
   - For each coin: long while the daily close is above its SMA50, otherwise flat.
   - Size = min(40% / 30-day annualised vol, 2) / N coins.
2. **xs_carry**
   - Rebalance on the candle that opens on Monday.
   - Rank coins by their 7-day average funding.
   - Short the 4 highest and long the 4 lowest, with inverse-vol weights normalised to gross 1.
3. **cash_carry**
   - BTC and ETH: long spot and short perp while the 3-day average funding is above 0, equal weight.
   - Only funding is earned.
   - Fees are charged on both legs.

Costs:
- 0.06% per side on every unit of turnover.
- Longs pay funding and shorts receive it, per funding event, over the exact holding window.

Validation: a replay from 2021-01-01 with the v2 rules gives Sharpe 2.02 and max drawdown -14%, vs 1.93 and -16% in `research/backtest.py`. Per sleeve, from the 2024 replay:
- trend: daily correlation 1.000.
- xs_carry: 32% vs 34% a year.
- cash_carry: 3.4% vs 3.7% a year.
- The carry gaps come from funding-window alignment. The Node accounting counts the exact holding window and is the more precise of the two.

## Files

- `data/strategy-book/state.json`: positions, equity per sleeve, and the last processed close.
- `data/strategy-book/ledger.jsonl`: one row per daily close (returns, fees, changes, positions).
- `data/strategy-book/latest.json` and `latest.md`: current summary. `latest.md` is also the Telegram message.
- `data/strategy-book/replay/`: output of `--replay-from`. It is separate from the live book.
- `data/logs/strategy-book.out|.err`: output of the cron runs.

## Paper-trading pass bar (fixed in advance)

The paper period runs for 56 days, starting 2026-09-26.

Eight weeks cannot prove the edge statistically. The expected return is about +2.5% with a standard deviation of about ±6%. So this period tests the **implementation**, not the edge. The book passes if all of these hold:

1. No missed or double-processed closes. The ledger has one row per day.
2. Positions match a `--replay-from` run over the same dates.
3. Drawdown never goes below -15%. This is the kill switch. The Telegram summary flags it.
4. Actual spreads and funding on Backpack, the execution venue, are within the modelled 0.06% per side.

A decision on real money needs this pass plus the backtest evidence. Start with small size. Per the sizing papers, use half-Kelly or less.
