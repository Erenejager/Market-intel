#!/usr/bin/env python3
"""Download daily Binance USD-M klines and funding history for the strategy-book universe.

Writes research/cache/universe.pkl as (closes: dict[coin -> DataFrame], funding: dict[coin -> Series]).
Public endpoints only; takes about a minute.
"""
import json
import os
import time
import urllib.request

import pandas as pd

UNIVERSE = 'BTC ETH SOL BNB XRP ADA DOGE AVAX LINK DOT LTC TRX BCH ATOM NEAR UNI FIL ETC XLM'.split()
START = int(pd.Timestamp('2020-01-01', tz='UTC').timestamp() * 1000)
CACHE = os.path.join(os.path.dirname(__file__), 'cache')


def get(url):
    for attempt in range(6):
        try:
            return json.loads(urllib.request.urlopen(url, timeout=30).read())
        except Exception:
            time.sleep(3 * (attempt + 1))
    raise RuntimeError(f'failed: {url}')


def klines(symbol):
    rows, t = [], START
    while True:
        d = get(f'https://fapi.binance.com/fapi/v1/klines?symbol={symbol}&interval=1d&limit=1500&startTime={t}')
        rows += d
        if len(d) < 1500:
            break
        t = d[-1][0] + 1
    k = pd.DataFrame(rows).iloc[:, [0, 1, 2, 3, 4, 7]]
    k.columns = ['t', 'o', 'h', 'l', 'c', 'qv']
    k = k.astype(float)
    k.index = pd.to_datetime(k.t, unit='ms', utc=True)  # index = candle OPEN time
    return k


def funding(symbol):
    rows, t = [], START
    while True:
        d = get(f'https://fapi.binance.com/fapi/v1/fundingRate?symbol={symbol}&limit=1000&startTime={t}')
        rows += d
        if len(d) < 1000:
            break
        t = d[-1]['fundingTime'] + 1
        time.sleep(0.2)
    f = pd.DataFrame(rows)
    f.index = pd.to_datetime(f.fundingTime, unit='ms', utc=True)
    return f.fundingRate.astype(float)


def main():
    os.makedirs(CACHE, exist_ok=True)
    closes, fund = {}, {}
    for coin in UNIVERSE:
        closes[coin] = klines(coin + 'USDT')
        fund[coin] = funding(coin + 'USDT')
        print(coin, len(closes[coin]), closes[coin].index.min().date(), len(fund[coin]))
    pd.to_pickle((closes, fund), os.path.join(CACHE, 'universe.pkl'))


if __name__ == '__main__':
    main()
