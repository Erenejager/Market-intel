# Market Intel

Author: Aziz.

Market Intel is a daily, rules-based crypto strategy book. It is currently in paper trading.
It is research software, not financial advice.

## What it does

Once a day, after the Binance daily close (00:00 UTC), `scripts/strategy-book.js`:

1. Downloads daily prices and funding rates for 19 large Binance USD-M perpetuals.
2. Decides the positions for three strategies. Each strategy gets one third of the capital.
3. Marks the previous positions to market, including fees and funding.
4. Sends a Telegram summary: equity, entries and exits, exit levels, and drawdown.

| Strategy | Rule | Direction | Typical hold |
|---|---|---|---|
| Trend | Hold a coin while its daily close is above its 50-day average. Active only while BTC is above its 200-day average. Size = 40% ÷ volatility ÷ 19. | Long only | Median 4 days; winners 1–3+ months |
| Funding carry | Every Monday, long the 4 coins with the lowest 7-day funding and short the 4 with the highest. | Long and short | 1–3 weeks |
| Cash-and-carry | While BTC/ETH 3-day funding is positive: buy spot, short the same amount of perp, and collect funding. | Market-neutral | Days to months |

Backtest, 2021-01 to 2026-09, after costs:

| | Result |
|---|---|
| Annual return | about 19% |
| Sharpe | 1.9 |
| Max drawdown | -16% |
| Bull markets (BTC above its 200-day average) | +34%/yr |
| Bear markets (BTC below it) | about 0%/yr |

The evidence, rules, costs, caveats and the paper-trading pass bar are in [`docs/STRATEGY_BOOK.md`](docs/STRATEGY_BOOK.md).

## Research data collector

Every 15 minutes, `scripts/run-collector-cron.sh` stores:
- the Backpack order book,
- the Binance derivatives context (open interest, taker flow, basis, funding),
- cross-venue microstructure (Binance, Bybit, OKX).

This data is for future research only. It produces no signals. An audit in 2026-09 found no tradable edge in it at 2–6h horizons. It is kept because this data cannot be downloaded again later.

`scripts/write-health.js` runs at the end of each collector run. It pings Telegram when the collector or the strategy book goes stale.

## Layout

```text
scripts/
  strategy-book.js             daily paper book (cron 00:10 UTC); --replay-from YYYY-MM-DD for history
  run-collector-cron.sh        15-minute collector (cron */15)
  fetch-backpack-snapshot.js   Backpack order book / klines snapshot
  fetch-binance-context.js     Binance OI, taker flow, basis, funding
  fetch-market-microstructure.js  cross-venue microstructure snapshot + history
  write-health.js              freshness checks + Telegram transition pings
research/
  download_history.py          daily klines + funding for the universe
  backtest.py                  backtest of the book (sleeves, regimes, leverage)
docs/STRATEGY_BOOK.md          strategy spec, evidence, pass bar
data/                          runtime data (not committed)
config.json                    Telegram target (not committed)
```

## Commands

```bash
node scripts/strategy-book.js                                         # process new daily closes (sends Telegram)
STRATEGY_BOOK_DISABLE_TELEGRAM=1 node scripts/strategy-book.js        # same, no Telegram
node scripts/strategy-book.js --replay-from 2024-01-01                # rebuild data/strategy-book/replay/
python3 research/download_history.py && python3 research/backtest.py  # re-run the backtest
```

## Configuration

`config.json` (not committed):

```json
{ "telegram": { "channel": "telegram", "to": "<chat id>" } }
```

Telegram is sent through the `openclaw` CLI. It needs Node 24.15 or later; cron uses `~/.nvm/versions/node/v24.18.0`.
