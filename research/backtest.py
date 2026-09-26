#!/usr/bin/env python3
"""Backtest of the strategy-book sleeves on daily Binance data (run download_history.py first).

Mirrors scripts/strategy-book.js: positions decided at the daily close, held to the next close,
0.06% per side on turnover, longs pay / shorts receive funding. Reports each sleeve, the book,
the 2021-23 vs 2024+ split, bull/bear regimes and leverage.

    python3 research/backtest.py
"""
import os

import numpy as np
import pandas as pd

FEE = 0.0006
START = pd.Timestamp('2021-01-01', tz='UTC')
SPLIT = pd.Timestamp('2024-01-01', tz='UTC')

closes, fund = pd.read_pickle(os.path.join(os.path.dirname(__file__), 'cache', 'universe.pkl'))
C = pd.DataFrame({k: v.c for k, v in closes.items()}).sort_index()
C = C[C.index < C.index.max()]  # drop the still-open candle
R = C.pct_change()
F = pd.DataFrame({k: v.resample('1D').sum() for k, v in fund.items()}).reindex(C.index).fillna(0)
vol = R.rolling(30).std() * np.sqrt(365)
avail = C.notna() & vol.notna()
invvol = (0.4 / vol).clip(upper=2)


def gross1(w):
    return w.div(w.abs().sum(1).replace(0, np.nan), axis=0).fillna(0)


def equal_risk(signal):
    return (signal * invvol).where(avail, 0) / avail.sum(1).values[:, None]


def pnl(weights, carry_only=False):
    w = weights.reindex(C.index).fillna(0)
    held = w.shift(1).fillna(0)
    ret = (held * F).sum(1) if carry_only else (held * R.fillna(0)).sum(1) - (held * F).sum(1)
    turnover = w.diff().abs().sum(1).shift(1).fillna(0)
    return (ret - turnover * FEE * (2 if carry_only else 1))[lambda s: s.index >= START]


def stats(p):
    eq = (1 + p).cumprod()
    sharpe = lambda x: x.mean() / x.std() * np.sqrt(365) if x.std() > 0 else 0.0
    return {
        'ann_%': p.mean() * 365 * 100,
        'sharpe': sharpe(p),
        't': p.mean() / p.std() * np.sqrt(len(p)),
        'max_dd_%': (eq / eq.cummax() - 1).min() * 100,
        'sharpe_2021_23': sharpe(p[p.index < SPLIT]),
        'sharpe_2024+': sharpe(p[p.index >= SPLIT]),
    }


# --- sleeves (same rules as scripts/strategy-book.js)
btc_bull = C.BTC > C.BTC.rolling(200).mean()
trend = pnl(equal_risk((C > C.rolling(50).mean()).mul(btc_bull, axis=0)))

f7 = F.rolling(7).mean().where(avail)
rank = f7.rank(1)
n = avail.sum(1)
side = (rank <= 4).astype(float) - (rank > n.values[:, None] - 4).astype(float)
side = side[side.index.dayofweek == 0].reindex(C.index).ffill()
xs_carry = pnl(gross1(side * invvol))

f3 = F.rolling(3).mean()[['BTC', 'ETH']]
cash_carry = pnl(gross1(((f3 > 0) & avail[['BTC', 'ETH']]).astype(float)), carry_only=True)

book = (trend + xs_carry + cash_carry) / 3
buy_hold_btc = R.BTC[R.index >= START]

rows = {'trend': trend, 'xs_carry': xs_carry, 'cash_carry': cash_carry, 'BOOK (1/3 each)': book, 'buy&hold BTC': buy_hold_btc}
print(pd.DataFrame({k: stats(v) for k, v in rows.items()}).T.round(2).to_string())

print('\nCalendar-year returns (%):')
print(pd.DataFrame({k: v.groupby(v.index.year).apply(lambda x: ((1 + x).prod() - 1) * 100) for k, v in rows.items()}).round(0).to_string())

regime = pd.Series(np.where(btc_bull, 'bull', 'bear'), index=C.index)
print('\nAnnualised return by BTC regime (BTC vs its 200d SMA), %:')
print(pd.DataFrame({k: v.groupby(regime.reindex(v.index)).mean() * 365 * 100 for k, v in rows.items()}).round(1).to_string())

print('\nLeverage on the book:')
for lev in (1, 1.5, 2, 3):
    s = stats(book * lev)
    print(f"  {lev}x: ann {s['ann_%']:.1f}%  max drawdown {s['max_dd_%']:.1f}%")
