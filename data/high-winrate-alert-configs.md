# High Win-Rate Alert Configurations

Generated: 2026-06-01T08:04:32.592Z
Rows scored: 1129

Filter: n>=5 and at least one of 1h/4h/24h close hit-rate >=90% with positive avg, or 4h favorable-anytime >=90%.

Important: 4h favorable-anytime is path/trade-management information, not close-to-close win rate. Strong candidates need high close hit-rate too.

| Grouping | Config | n | 1h | 4h | 24h | 4h path |
|---|---|---:|---:|---:|---:|---:|
| asset+dir+shadow+pattern | BTC|SHORT|shadow=SHADOW_BLOCKED|pattern=NO_PATTERN | 24 | 24/66.7%/0.097% | 24/87.5%/0.324% | 24/95.8%/1.991% | 24/100.0%/0.432%/-0.100% |
| asset+dir+pattern+oi+funding | BTC|SHORT|pattern=NO_PATTERN|oi=FRESH_LONGS|funding=BROAD_POSITIVE_FUNDING | 20 | 20/70.0%/0.118% | 20/80.0%/0.288% | 20/95.0%/2.065% | 20/100.0%/0.515%/-0.114% |
| asset+dir+oi+funding+btc | BTC|SHORT|oi=FRESH_LONGS|funding=BROAD_POSITIVE_FUNDING|btc=NA | 20 | 20/70.0%/0.118% | 20/80.0%/0.288% | 20/95.0%/2.065% | 20/100.0%/0.515%/-0.114% |
| asset+dir+flow | BTC|LONG|flow=SPOT_LED_ACCUMULATION|conf=true|streak=3 | 16 | 16/50.0%/0.012% | 16/56.3%/-0.041% | 16/56.3%/-0.197% | 16/100.0%/0.360%/-0.336% |
| asset+dir+pattern+oi+funding | BTC|LONG|pattern=NO_PATTERN|oi=LONGS_EXITING|funding=BROAD_POSITIVE_FUNDING | 16 | 16/68.8%/0.112% | 16/81.3%/0.326% | 16/62.5%/0.296% | 16/100.0%/0.469%/-0.157% |
| asset+dir+oi+funding+btc | BTC|LONG|oi=LONGS_EXITING|funding=BROAD_POSITIVE_FUNDING|btc=NA | 16 | 16/68.8%/0.112% | 16/81.3%/0.326% | 16/62.5%/0.296% | 16/100.0%/0.469%/-0.157% |
| asset+dir+pattern+trend | ETH|SHORT|pattern=NO_PATTERN|trend4h=DOWN|btcTrend=DOWN | 16 | 16/62.5%/0.123% | 16/68.8%/0.322% | 16/100.0%/2.742% | 16/93.8%/0.474%/-0.284% |
| asset+dir+oi | ETH|LONG|oi=LONGS_EXITING | 13 | 13/69.2%/0.038% | 13/76.9%/0.339% | 13/61.5%/0.166% | 13/100.0%/0.491%/-0.300% |
| asset+dir+pattern+oi+funding | ETH|LONG|pattern=NO_PATTERN|oi=LONGS_EXITING|funding=BROAD_POSITIVE_FUNDING | 13 | 13/69.2%/0.038% | 13/76.9%/0.339% | 13/61.5%/0.166% | 13/100.0%/0.491%/-0.300% |
| asset+dir+oi+funding+btc | ETH|SHORT|oi=NEUTRAL|funding=BROAD_POSITIVE_FUNDING|btc=BTC_STRONG_ALT_NOT_FOLLOWING | 11 | 11/45.5%/0.011% | 11/54.5%/0.076% | 11/18.2%/-0.543% | 11/100.0%/0.268%/-0.096% |
| asset+dir+oi | BTC|SHORT|oi=SHORTS_COVERING | 9 | 9/66.7%/0.028% | 9/66.7%/0.069% | 9/100.0%/0.846% | 9/88.9%/0.348%/-0.309% |
| asset+dir+btc_gate | ETH|SHORT|btc=BTC_WEAK_VETO_ALT_LONGS | 9 | 9/66.7%/0.182% | 9/66.7%/0.499% | 8/75.0%/1.875% | 9/100.0%/0.806%/-0.350% |
| asset+dir+pattern+oi+funding | BTC|SHORT|pattern=NO_PATTERN|oi=SHORTS_COVERING|funding=BROAD_POSITIVE_FUNDING | 9 | 9/66.7%/0.028% | 9/66.7%/0.069% | 9/100.0%/0.846% | 9/88.9%/0.348%/-0.309% |
| asset+dir+oi+funding+btc | BTC|SHORT|oi=SHORTS_COVERING|funding=BROAD_POSITIVE_FUNDING|btc=NA | 9 | 9/66.7%/0.028% | 9/66.7%/0.069% | 9/100.0%/0.846% | 9/88.9%/0.348%/-0.309% |
| asset+dir+oi+funding+btc | SOL|LONG|oi=FRESH_SHORTS|funding=BROAD_SHORT_PRESSURE|btc=BTC_WEAK_VETO_ALT_LONGS | 9 | 9/44.4%/-0.007% | 9/88.9%/0.466% | 9/55.6%/-0.200% | 9/100.0%/0.716%/-0.850% |
| asset+dir+pattern+oi+funding | BTC|LONG|pattern=NO_PATTERN|oi=FRESH_SHORTS|funding=BROAD_SHORT_PRESSURE | 8 | 8/62.5%/-0.001% | 8/37.5%/-0.110% | 8/12.5%/-0.932% | 8/100.0%/0.199%/-0.454% |
| asset+dir+oi+funding+btc | SOL|LONG|oi=NEUTRAL|funding=BROAD_SHORT_PRESSURE|btc=NEUTRAL | 8 | 8/62.5%/-0.028% | 8/37.5%/-0.275% | 8/50.0%/0.049% | 8/100.0%/0.305%/-0.715% |
| asset+dir+oi+funding+btc | BTC|LONG|oi=FRESH_SHORTS|funding=BROAD_SHORT_PRESSURE|btc=NA | 8 | 8/62.5%/-0.001% | 8/37.5%/-0.110% | 8/12.5%/-0.932% | 8/100.0%/0.199%/-0.454% |
| asset+dir+oi+funding+btc | ETH|LONG|oi=LONGS_EXITING|funding=BROAD_POSITIVE_FUNDING|btc=BTC_CONFIRMS_ALT_LONG_CONTEXT | 8 | 8/62.5%/-0.121% | 8/87.5%/0.259% | 8/75.0%/0.339% | 8/100.0%/0.349%/-0.358% |
| asset+dir+oi | SOL|SHORT|oi=LONGS_EXITING | 7 | 7/42.9%/-0.021% | 7/100.0%/0.661% | 7/71.4%/0.814% | 7/100.0%/0.953%/-0.231% |
| asset+dir+oi+funding+btc | ETH|LONG|oi=FRESH_LONGS|funding=BROAD_POSITIVE_FUNDING|btc=BTC_CONFIRMS_ALT_LONG_CONTEXT | 7 | 7/57.1%/-0.070% | 7/57.1%/0.048% | 7/0.0%/-0.984% | 7/100.0%/0.564%/-0.815% |
| asset+dir+shadow+pattern | ETH|LONG|shadow=SHADOW_CONFIRMED|pattern=FRESH_SHORTS_LONG | 7 | 7/28.6%/-0.148% | 7/28.6%/-0.209% | 5/100.0%/0.624% | 7/85.7%/0.236%/-0.541% |
| asset+dir+oi | BTC|LONG|oi=NA | 6 | 6/66.7%/0.044% | 6/66.7%/0.281% | 6/100.0%/0.541% | 6/100.0%/0.452%/-0.072% |
| asset+dir+oi | ETH|SHORT|oi=LONGS_EXITING | 6 | 6/100.0%/0.223% | 6/66.7%/-0.154% | 6/50.0%/0.601% | 6/100.0%/0.344%/-0.311% |
| asset+dir+funding | BTC|LONG|funding=NA | 6 | 6/66.7%/0.044% | 6/66.7%/0.281% | 6/100.0%/0.541% | 6/100.0%/0.452%/-0.072% |
| asset+dir+pattern+oi+funding | BTC|LONG|pattern=NO_PATTERN|oi=NA|funding=NA | 6 | 6/66.7%/0.044% | 6/66.7%/0.281% | 6/100.0%/0.541% | 6/100.0%/0.452%/-0.072% |
| asset+dir+pattern+oi+funding | ETH|SHORT|pattern=NO_PATTERN|oi=LONGS_EXITING|funding=BROAD_POSITIVE_FUNDING | 6 | 6/100.0%/0.223% | 6/66.7%/-0.154% | 6/50.0%/0.601% | 6/100.0%/0.344%/-0.311% |
| asset+dir+pattern+oi+funding | SOL|LONG|pattern=NO_PATTERN|oi=LONGS_EXITING|funding=BROAD_SHORT_PRESSURE | 6 | 6/16.7%/-0.174% | 6/16.7%/-0.175% | 6/50.0%/0.135% | 6/100.0%/0.273%/-0.425% |
| asset+dir+pattern+btc | ETH|SHORT|pattern=NO_PATTERN|btc=BTC_WEAK_VETO_ALT_LONGS | 6 | 6/83.3%/0.215% | 6/66.7%/0.435% | 6/83.3%/1.846% | 6/100.0%/0.699%/-0.438% |
| asset+dir+oi+funding+btc | SOL|LONG|oi=NA|funding=NA|btc=NEUTRAL | 6 | 6/66.7%/0.335% | 6/66.7%/0.345% | 6/66.7%/0.231% | 6/100.0%/0.868%/-0.255% |
| asset+dir+oi+funding+btc | BTC|LONG|oi=NA|funding=NA|btc=NA | 6 | 6/66.7%/0.044% | 6/66.7%/0.281% | 6/100.0%/0.541% | 6/100.0%/0.452%/-0.072% |
| asset+dir+oi+funding+btc | ETH|SHORT|oi=FRESH_SHORTS|funding=BROAD_POSITIVE_FUNDING|btc=BTC_WEAK_PENALIZE_ALT_LONGS | 6 | 6/50.0%/0.094% | 6/100.0%/0.536% | 6/100.0%/1.393% | 6/100.0%/0.715%/-0.143% |
| asset+dir+shadow+pattern | BTC|LONG|shadow=NO_SHADOW|pattern=NO_PATTERN | 6 | 6/66.7%/0.044% | 6/66.7%/0.281% | 6/100.0%/0.541% | 6/100.0%/0.452%/-0.072% |
| asset+dir+shadow+pattern | ETH|LONG|shadow=SHADOW_CONFIRMED|pattern=NO_PATTERN | 6 | 6/50.0%/0.082% | 6/83.3%/0.408% | 6/50.0%/1.103% | 6/100.0%/0.557%/-0.262% |
| asset+dir+oi | BTC|SHORT|oi=LONGS_EXITING | 5 | 5/80.0%/0.192% | 5/60.0%/0.042% | 5/100.0%/0.555% | 5/100.0%/0.473%/-0.205% |
| asset+dir+oi | SOL|SHORT|oi=FRESH_LONGS | 5 | 5/40.0%/-0.032% | 5/60.0%/0.668% | 5/60.0%/1.555% | 5/100.0%/1.113%/-0.557% |
| asset+dir+flow | SOL|SHORT|flow=LEVERAGED_CHASE|conf=true|streak=1 | 5 | 5/40.0%/-0.076% | 5/40.0%/0.080% | 5/80.0%/0.706% | 5/100.0%/0.695%/-0.415% |
| asset+dir+flow | SOL|SHORT|flow=LEVERAGED_CHASE|conf=false|streak=2 | 5 | 5/60.0%/0.255% | 5/60.0%/-0.224% | 5/60.0%/-0.075% | 5/100.0%/0.839%/-0.513% |
| asset+dir+pattern+oi+funding | BTC|SHORT|pattern=NO_PATTERN|oi=FRESH_SHORTS|funding=BROAD_SHORT_PRESSURE | 5 | 5/80.0%/0.112% | 5/100.0%/0.356% | 5/80.0%/1.801% | 5/100.0%/0.563%/-0.149% |
| asset+dir+oi+funding+btc | SOL|SHORT|oi=NEUTRAL|funding=BROAD_POSITIVE_FUNDING|btc=BTC_STRONG_ALT_NOT_FOLLOWING | 5 | 5/60.0%/0.376% | 5/40.0%/-0.103% | 5/0.0%/-1.474% | 5/100.0%/0.839%/-0.273% |
| asset+dir+oi+funding+btc | ETH|SHORT|oi=FRESH_SHORTS|funding=BROAD_POSITIVE_FUNDING|btc=NEUTRAL | 5 | 5/0.0%/-0.111% | 5/60.0%/0.388% | 5/80.0%/0.241% | 5/100.0%/0.425%/-0.284% |
| asset+dir+oi+funding+btc | SOL|LONG|oi=FRESH_LONGS|funding=BROAD_POSITIVE_FUNDING|btc=NEUTRAL | 5 | 5/80.0%/0.133% | 5/60.0%/0.067% | 5/40.0%/-1.180% | 5/100.0%/0.769%/-0.479% |
| asset+dir+oi+funding+btc | SOL|LONG|oi=LONGS_EXITING|funding=BROAD_SHORT_PRESSURE|btc=BTC_CONFIRMS_ALT_LONG_CONTEXT | 5 | 5/20.0%/-0.203% | 5/20.0%/-0.199% | 5/60.0%/0.283% | 5/100.0%/0.289%/-0.498% |
| asset+dir+oi+funding+btc | BTC|SHORT|oi=FRESH_SHORTS|funding=BROAD_SHORT_PRESSURE|btc=NA | 5 | 5/80.0%/0.112% | 5/100.0%/0.356% | 5/80.0%/1.801% | 5/100.0%/0.563%/-0.149% |
| asset+dir+oi+funding+btc | SOL|LONG|oi=FRESH_SHORTS|funding=BROAD_POSITIVE_FUNDING|btc=BTC_CONFIRMS_ALT_LONG_CONTEXT | 5 | 5/40.0%/-0.042% | 5/100.0%/0.625% | 5/100.0%/1.143% | 5/100.0%/0.496%/-0.328% |
| asset+dir+oi+funding+btc | ETH|LONG|oi=NEUTRAL|funding=BROAD_POSITIVE_FUNDING|btc=BTC_WEAK_VETO_ALT_LONGS | 5 | 5/80.0%/0.240% | 5/80.0%/0.406% | 5/60.0%/0.418% | 5/100.0%/0.741%/-0.470% |
| asset+dir+oi+funding+btc | ETH|LONG|oi=FRESH_LONGS|funding=BROAD_POSITIVE_FUNDING|btc=BTC_WEAK_VETO_ALT_LONGS | 5 | 5/40.0%/0.047% | 5/60.0%/0.147% | 5/40.0%/-2.272% | 5/100.0%/0.436%/-0.226% |
| asset+dir+shadow+pattern | ETH|SHORT|shadow=SHADOW_BLOCKED|pattern=NO_PATTERN | 5 | 5/20.0%/0.100% | 5/100.0%/0.899% | 5/100.0%/0.323% | 5/100.0%/0.837%/-0.062% |
| asset+type | ETH|SHORT_SETUP | 29 | 29/51.7%/0.039% | 29/69.0%/0.239% | 29/96.6%/1.980% | 29/89.7%/0.425%/-0.306% |
| asset+dir+oi | BTC|SHORT|oi=FRESH_LONGS | 24 | 24/70.8%/0.111% | 24/79.2%/0.305% | 24/95.8%/2.099% | 24/95.8%/0.525%/-0.123% |
| asset+dir+pattern+oi+funding | ETH|SHORT|pattern=NO_PATTERN|oi=FRESH_SHORTS|funding=BROAD_POSITIVE_FUNDING | 22 | 22/36.4%/-0.004% | 22/72.7%/0.415% | 22/90.9%/0.954% | 22/95.5%/0.627%/-0.340% |
| asset+type | BTC|LONG_CONFIRMED | 51 | 51/45.1%/-0.033% | 51/52.9%/0.020% | 49/55.1%/-0.057% | 51/94.1%/0.364%/-0.339% |
| asset+dir+pattern+oi+funding | ETH|SHORT|pattern=NO_PATTERN|oi=NEUTRAL|funding=BROAD_POSITIVE_FUNDING | 34 | 34/47.1%/0.031% | 34/44.1%/0.051% | 34/32.4%/-0.023% | 34/94.1%/0.300%/-0.173% |
| asset+dir+pattern+btc | ETH|SHORT|pattern=NO_PATTERN|btc=BTC_STRONG_ALT_NOT_FOLLOWING | 32 | 32/56.3%/0.047% | 32/59.4%/0.104% | 32/59.4%/0.615% | 32/93.8%/0.389%/-0.280% |
| asset+dir+oi | BTC|LONG|oi=LONGS_EXITING | 18 | 18/61.1%/0.064% | 18/77.8%/0.203% | 18/55.6%/0.095% | 18/94.4%/0.435%/-0.260% |
| asset+dir+pattern+oi+funding | SOL|SHORT|pattern=NO_PATTERN|oi=SHORTS_COVERING|funding=BROAD_POSITIVE_FUNDING | 18 | 18/83.3%/0.023% | 18/72.2%/0.173% | 18/72.2%/1.854% | 18/94.4%/0.468%/-0.449% |
| asset+dir+oi | ETH|SHORT|oi=FRESH_SHORTS | 29 | 29/41.4%/-0.003% | 29/69.0%/0.376% | 26/84.6%/0.980% | 29/93.1%/0.630%/-0.354% |
| asset+type | BTC|SHORT_CONFIRMED | 41 | 41/56.1%/0.087% | 41/51.2%/0.138% | 39/69.2%/0.556% | 41/92.7%/0.454%/-0.245% |
| asset+dir+flow | ETH|SHORT|flow=SELL_PRESSURE|conf=true|streak=3 | 41 | 41/51.2%/0.058% | 41/48.8%/0.119% | 38/63.2%/0.768% | 41/92.7%/0.543%/-0.341% |
| asset+dir+flow | BTC|SHORT|flow=SELL_PRESSURE|conf=true|streak=3 | 41 | 41/56.1%/0.087% | 41/51.2%/0.138% | 39/69.2%/0.556% | 41/92.7%/0.454%/-0.245% |
| asset+dir+shadow+pattern | BTC|SHORT|shadow=SHADOW_SETUP_FORMING|pattern=NO_PATTERN | 28 | 28/53.6%/0.058% | 28/50.0%/0.090% | 28/64.3%/0.267% | 28/92.9%/0.430%/-0.290% |
| asset+dir+flow | ETH|LONG|flow=SPOT_LED_ACCUMULATION|conf=true|streak=3 | 16 | 16/43.8%/0.003% | 15/53.3%/0.148% | 14/42.9%/-0.182% | 16/93.8%/0.376%/-0.441% |
| asset+dir+pattern+oi+funding | SOL|SHORT|pattern=NO_PATTERN|oi=NEUTRAL|funding=BROAD_POSITIVE_FUNDING | 16 | 16/68.8%/0.251% | 16/37.5%/0.066% | 16/6.3%/-1.022% | 16/93.8%/0.803%/-0.378% |
| asset+dir+oi | ETH|LONG|oi=FRESH_LONGS | 27 | 27/51.9%/-0.079% | 27/59.3%/0.154% | 27/22.2%/-1.660% | 27/92.6%/0.501%/-0.558% |
| asset+dir+pattern+oi+funding | ETH|LONG|pattern=NO_PATTERN|oi=FRESH_LONGS|funding=BROAD_POSITIVE_FUNDING | 27 | 27/51.9%/-0.079% | 27/59.3%/0.154% | 27/22.2%/-1.660% | 27/92.6%/0.501%/-0.558% |
| asset+type | BTC|SHORT_SETUP | 50 | 50/66.0%/0.073% | 50/74.0%/0.252% | 50/82.0%/1.273% | 50/92.0%/0.463%/-0.206% |
| asset+dir+pattern+btc | SOL|SHORT|pattern=NO_PATTERN|btc=NEUTRAL | 37 | 37/67.6%/0.199% | 37/43.2%/0.127% | 37/56.8%/0.684% | 37/91.9%/0.737%/-0.445% |
| asset+dir+oi | ETH|SHORT|oi=NEUTRAL | 36 | 36/47.2%/0.021% | 36/44.4%/0.065% | 36/36.1%/0.118% | 36/91.7%/0.330%/-0.194% |
| asset+dir+pattern+btc | SOL|LONG|pattern=SOL_LONG_WATCH_ONLY|btc=BTC_PERMITS_ALT_LONG_OBSERVATION | 25 | 25/48.0%/0.015% | 25/60.0%/-0.016% | 21/66.7%/0.084% | 25/92.0%/0.452%/-0.449% |
| asset+dir+btc_gate | ETH|SHORT|btc=BTC_STRONG_ALT_NOT_FOLLOWING | 35 | 35/57.1%/0.020% | 35/57.1%/0.055% | 33/57.6%/0.551% | 35/91.4%/0.374%/-0.304% |
| asset+dir+flow | BTC|LONG|flow=STRUCTURAL_BUYING|conf=true|streak=3 | 35 | 35/42.9%/-0.054% | 35/51.4%/0.047% | 33/54.5%/0.011% | 35/91.4%/0.367%/-0.340% |
| asset+dir+funding | BTC|SHORT|funding=BROAD_SHORT_PRESSURE | 14 | 14/78.6%/0.092% | 14/85.7%/0.371% | 14/92.9%/1.795% | 14/92.9%/0.565%/-0.139% |
| asset+dir+btc_gate | SOL|SHORT|btc=NEUTRAL | 45 | 45/57.8%/0.121% | 45/42.2%/0.074% | 44/54.5%/0.616% | 45/91.1%/0.674%/-0.458% |
| asset+dir+oi | SOL|SHORT|oi=NEUTRAL | 24 | 24/66.7%/0.269% | 24/41.7%/0.057% | 24/12.5%/-0.951% | 24/91.7%/0.908%/-0.389% |
| asset+dir+shadow+pattern | ETH|SHORT|shadow=SHADOW_NO_SETUP|pattern=NO_PATTERN | 55 | 55/56.4%/0.021% | 55/63.6%/0.113% | 55/60.0%/0.951% | 55/90.9%/0.329%/-0.269% |
| asset+dir+funding | ETH|SHORT|funding=BROAD_POSITIVE_FUNDING | 98 | 98/51.0%/0.023% | 98/57.1%/0.079% | 95/61.1%/0.761% | 98/90.8%/0.390%/-0.302% |
| asset+dir+shadow+pattern | SOL|SHORT|shadow=SHADOW_NO_SETUP|pattern=NO_PATTERN | 108 | 108/54.6%/0.051% | 108/52.8%/0.108% | 108/55.6%/0.409% | 108/90.7%/0.676%/-0.481% |
| asset+dir+flow | BTC|LONG|flow=STRUCTURAL_BUYING|conf=true|streak=2 | 32 | 32/62.5%/-0.030% | 32/53.1%/-0.007% | 30/56.7%/0.021% | 32/90.6%/0.394%/-0.420% |
| asset+dir+pattern+oi+funding | SOL|LONG|pattern=NO_PATTERN|oi=FRESH_SHORTS|funding=BROAD_SHORT_PRESSURE | 32 | 32/46.9%/0.067% | 32/71.9%/0.308% | 32/46.9%/0.046% | 32/90.6%/0.871%/-0.636% |
| asset+dir+oi | SOL|SHORT|oi=SHORTS_COVERING | 23 | 23/73.9%/0.003% | 23/65.2%/0.097% | 23/60.9%/1.446% | 23/91.3%/0.415%/-0.438% |
| asset+dir+pattern+trend | SOL|SHORT|pattern=NO_PATTERN|trend4h=NA|btcTrend=NA | 63 | 63/60.3%/0.064% | 63/55.6%/0.187% | 63/34.9%/-0.090% | 63/90.5%/0.765%/-0.442% |
| asset+dir+funding | SOL|SHORT|funding=BROAD_POSITIVE_FUNDING | 111 | 111/58.6%/0.076% | 110/56.4%/0.169% | 106/50.9%/0.357% | 111/90.1%/0.670%/-0.420% |
| asset+type | ETH|SHORT_CAUTION | 30 | 30/53.3%/-0.014% | 30/56.7%/-0.039% | 30/23.3%/-0.401% | 30/90.0%/0.186%/-0.223% |
| asset+dir+flow | ETH|SHORT|flow=LEVERAGED_CHASE|conf=false|streak=1 | 50 | 50/54.0%/0.021% | 50/64.0%/0.123% | 50/62.0%/0.974% | 50/90.0%/0.329%/-0.261% |
| asset+dir+oi | SOL|LONG|oi=LONGS_EXITING | 12 | 12/33.3%/-0.163% | 12/16.7%/-0.280% | 12/25.0%/-0.839% | 12/91.7%/0.256%/-0.470% |
| asset+dir+oi+funding+btc | ETH|SHORT|oi=NEUTRAL|funding=BROAD_POSITIVE_FUNDING|btc=BTC_WEAK_PENALIZE_ALT_LONGS | 12 | 12/33.3%/-0.010% | 12/25.0%/-0.122% | 12/25.0%/-0.086% | 12/91.7%/0.178%/-0.268% |
| asset+dir+oi+funding+btc | SOL|SHORT|oi=FRESH_SHORTS|funding=BROAD_SHORT_PRESSURE|btc=NEUTRAL | 12 | 12/50.0%/0.071% | 12/58.3%/0.252% | 12/83.3%/1.492% | 12/91.7%/0.605%/-0.452% |
| asset+dir+pattern+btc | ETH|LONG|pattern=NO_PATTERN|btc=BTC_WEAK_VETO_ALT_LONGS | 21 | 21/61.9%/0.185% | 21/61.9%/0.373% | 21/47.6%/-0.738% | 21/90.5%/0.690%/-0.297% |
| asset+dir+oi+funding+btc | ETH|SHORT|oi=NEUTRAL|funding=BROAD_POSITIVE_FUNDING|btc=NEUTRAL | 11 | 11/63.6%/0.096% | 11/54.5%/0.215% | 11/54.5%/0.566% | 11/90.9%/0.464%/-0.146% |
| asset+dir+oi+funding+btc | SOL|LONG|oi=FRESH_SHORTS|funding=BROAD_SHORT_PRESSURE|btc=NEUTRAL | 11 | 11/54.5%/-0.015% | 11/54.5%/-0.094% | 11/27.3%/-0.940% | 11/90.9%/0.724%/-0.832% |
| asset+dir+oi | SOL|LONG|oi=NA | 10 | 10/60.0%/0.192% | 10/50.0%/0.155% | 10/50.0%/0.206% | 10/90.0%/0.656%/-0.443% |
| asset+dir+funding | SOL|LONG|funding=NA | 10 | 10/60.0%/0.192% | 10/50.0%/0.155% | 10/50.0%/0.206% | 10/90.0%/0.656%/-0.443% |
| asset+dir+pattern+oi+funding | SOL|LONG|pattern=NO_PATTERN|oi=NA|funding=NA | 10 | 10/60.0%/0.192% | 10/50.0%/0.155% | 10/50.0%/0.206% | 10/90.0%/0.656%/-0.443% |
| asset+dir+shadow+pattern | SOL|LONG|shadow=NO_SHADOW|pattern=NO_PATTERN | 10 | 10/60.0%/0.192% | 10/50.0%/0.155% | 10/50.0%/0.206% | 10/90.0%/0.656%/-0.443% |
