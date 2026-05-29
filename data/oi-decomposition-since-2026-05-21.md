# OI Alert Decomposition

Generated: 2026-06-06T15:15:52.878Z
Window: 2026-05-21T00:00:00Z → +∞

Definitions:
- Confirmed-alert mode: one row per `LONG_CONFIRMED` / `SHORT_CONFIRMED` HIGH alert, entry at alert timestamp.
- Episode mode: one row per unique active context episode, entry at first confirmed alert; later same asset/direction confirmations are deduped until same-direction invalidation, opposite confirmed alert, or 24h open-context fallback.
- OI bucket/state join: nearest same asset/direction `readiness-shadow.jsonl` row within ±16 minutes.

## confirmed-alert

Rows: 148; joined to shadow: 148

| direction | asset | OI bucket | shadow | BTC gate | n | 1h win/avg | 4h win/avg | 24h win/avg | med MFE4h | med MAE4h | first4h fav/adverse | med MFE24h | med MAE24h | first24h fav/adverse |
| --- | --- | --- | --- | --- | ---: | --- | --- | --- | ---: | ---: | --- | ---: | ---: | --- |
| SHORT | BTC | FRESH_SHORTS | SHADOW_SETUP_FORMING | NONE | 18 | 61.1%/0.073% | 50.0%/0.226% | 82.4%/2.287% | 0.680% | -0.222% | 9/9 | 2.886% | -0.547% | 6/12 |
| LONG | BTC | FRESH_SHORTS | SHADOW_CONFIRMED | NONE | 17 | 41.2%/-0.070% | 41.2%/-0.099% | 23.5%/-1.183% | 0.199% | -0.255% | 8/9 | 0.621% | -1.540% | 11/6 |
| LONG | BTC | FRESH_SHORTS | SHADOW_SETUP_FORMING | NONE | 16 | 43.8%/-0.210% | 43.8%/-0.337% | 50.0%/-1.094% | 0.290% | -0.319% | 7/9 | 0.726% | -1.231% | 9/7 |
| LONG | ETH | FRESH_SHORTS | SHADOW_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 15 | 26.7%/-0.196% | 42.9%/-0.186% | 50.0%/-1.028% | 0.388% | -0.433% | 8/7 | 0.835% | -1.399% | 8/7 |
| LONG | SOL | FRESH_SHORTS | SHADOW_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 9 | 33.3%/-0.231% | 33.3%/-0.780% | 25.0%/-2.113% | 0.068% | -1.381% | 7/2 | 0.636% | -3.097% | 7/2 |
| LONG | SOL | FRESH_SHORTS | SHADOW_BLOCKED | BTC_WEAK_VETO_ALT_LONGS | 7 | 71.4%/0.141% | 28.6%/-0.541% | 42.9%/-0.178% | 0.236% | -0.708% | 4/3 | 0.465% | -2.398% | 2/5 |
| SHORT | SOL | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_STRONG_ALT_NOT_FOLLOWING | 7 | 42.9%/-0.085% | 42.9%/-0.249% | 33.3%/-0.338% | 0.736% | -0.963% | 3/4 | 1.245% | -2.115% | 4/3 |
| SHORT | ETH | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_STRONG_ALT_NOT_FOLLOWING | 6 | 66.7%/-0.280% | 50.0%/-0.295% | 83.3%/1.454% | 0.492% | -0.227% | 3/3 | 2.243% | -0.726% | 1/5 |
| SHORT | SOL | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_WEAK_VETO_ALT_LONGS | 6 | 33.3%/0.182% | 50.0%/0.254% | 83.3%/1.561% | 0.874% | -0.270% | 4/2 | 2.811% | -0.722% | 2/4 |
| LONG | SOL | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_PERMITS_ALT_LONG_OBSERVATION | 5 | 40.0%/0.002% | 20.0%/-0.429% | 40.0%/-1.577% | 0.213% | -0.353% | 3/2 | 0.600% | -1.732% | 3/2 |
| SHORT | ETH | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_WEAK_VETO_ALT_LONGS | 5 | 20.0%/-0.104% | 80.0%/0.776% | 80.0%/2.108% | 1.299% | -0.563% | 1/4 | 4.387% | -0.563% | 1/4 |
| LONG | ETH | FRESH_SHORTS | SHADOW_SETUP_FORMING | NEUTRAL | 4 | 75.0%/0.131% | 50.0%/0.384% | 25.0%/-0.624% | 0.576% | -0.120% | 2/2 | 1.439% | -0.897% | 2/2 |
| SHORT | BTC | FRESH_LONGS | SHADOW_BLOCKED | NONE | 4 | 75.0%/0.143% | 75.0%/0.251% | 100.0%/2.120% | 0.515% | -0.054% | 2/2 | 3.061% | -0.139% | 0/4 |
| LONG | ETH | FRESH_SHORTS | SHADOW_BLOCKED | BTC_WEAK_VETO_ALT_LONGS | 3 | 66.7%/0.072% | 33.3%/-0.268% | 0.0%/-2.104% | 0.268% | -0.549% | 2/1 | 0.960% | -2.173% | 3/0 |
| LONG | ETH | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_PERMITS_ALT_LONG_OBSERVATION | 3 | 33.3%/-0.404% | 33.3%/-0.055% | 0.0%/-1.337% | -0.186% | -0.836% | 2/1 | 0.781% | -1.625% | 1/2 |
| LONG | SOL | FRESH_SHORTS | SHADOW_SETUP_FORMING | NEUTRAL | 2 | 0.0%/-0.357% | 0.0%/-0.715% | 0.0%/-1.207% | 0.018% | -0.537% | 1/1 | 0.783% | -2.240% | 1/1 |
| SHORT | ETH | FRESH_SHORTS | SHADOW_NO_SETUP | BTC_WEAK_VETO_ALT_LONGS | 2 | 50.0%/-0.016% | 50.0%/0.309% | 100.0%/2.065% | 0.775% | -0.574% | 1/1 | 3.006% | -0.574% | 1/1 |
| SHORT | SOL | FRESH_SHORTS | SHADOW_NO_SETUP | NEUTRAL | 2 | 50.0%/-0.219% | 0.0%/-0.985% | 100.0%/4.230% | 2.079% | -0.225% | 0/2 | 7.195% | -1.923% | 0/2 |
| LONG | BTC | NEUTRAL | SHADOW_NO_SETUP | NONE | 1 | 0.0%/-0.026% | 0.0%/-0.055% | 100.0%/0.128% | 0.180% | -0.551% | 1/0 | 1.006% | -0.551% | 0/1 |
| LONG | ETH | FRESH_LONGS | SHADOW_SETUP_FORMING | BTC_PERMITS_ALT_LONG_OBSERVATION | 1 | 0.0%/-0.367% | 100.0%/0.338% | 0.0%/-4.719% | 0.121% | -0.367% | 1/0 | 0.338% | -4.732% | 1/0 |
| LONG | ETH | FRESH_SHORTS | SHADOW_CONFIRMED | NEUTRAL | 1 | 100.0%/0.332% | 0.0%/-0.885% | 0.0%/-1.848% | 0.332% | -0.876% | 1/0 | 1.491% | -1.997% | 1/0 |
| LONG | ETH | SHORTS_COVERING | SHADOW_SETUP_FORMING | NEUTRAL | 1 | 100.0%/0.333% | 100.0%/0.415% | 0.0%/-0.172% | 0.561% | 0.070% | 0/1 | 0.619% | -1.324% | 0/1 |
| LONG | SOL | NEUTRAL | SHADOW_SETUP_FORMING | NEUTRAL | 1 | 100.0%/0.214% | 100.0%/0.701% | 100.0%/0.840% | 0.655% | -0.110% | 0/1 | 1.745% | -1.130% | 0/1 |
| LONG | SOL | SHORTS_COVERING | SHADOW_SETUP_FORMING | BTC_PERMITS_ALT_LONG_OBSERVATION | 1 | 100.0%/0.409% | 100.0%/0.121% | 0.0%/-2.622% | 0.490% | 0.075% | 1/0 | 0.974% | -3.083% | 1/0 |
| LONG | SOL | SHORTS_COVERING | SHADOW_SETUP_FORMING | NEUTRAL | 1 | 0.0%/-0.087% | 100.0%/1.199% | 100.0%/0.353% | 1.651% | -0.330% | 0/1 | 1.662% | -0.330% | 0/1 |
| SHORT | BTC | FRESH_SHORTS | SHADOW_NO_SETUP | NONE | 1 | 100.0%/0.105% | 100.0%/0.252% | 100.0%/4.875% | 1.525% | -0.491% | 0/1 | 5.641% | -0.491% | 0/1 |
| SHORT | ETH | FRESH_LONGS | SHADOW_SETUP_FORMING | BTC_WEAK_VETO_ALT_LONGS | 1 | 100.0%/0.112% | 100.0%/0.295% | 100.0%/1.505% | 0.619% | -0.144% | 1/0 | 1.116% | -0.144% | 0/1 |
| SHORT | ETH | FRESH_SHORTS | SHADOW_SETUP_FORMING | NEUTRAL | 1 | 0.0%/-0.111% | 0.0%/-0.069% | 100.0%/0.494% | 0.278% | -0.388% | 1/0 | 2.439% | -0.388% | 0/1 |
| SHORT | ETH | SHORTS_COVERING | SHADOW_NO_SETUP | BTC_WEAK_VETO_ALT_LONGS | 1 | 100.0%/0.343% | 100.0%/0.196% | 100.0%/0.349% | 0.759% | -0.193% | 1/0 | 1.650% | -0.286% | 1/0 |
| SHORT | SOL | FRESH_SHORTS | SHADOW_NO_SETUP | BTC_WEAK_VETO_ALT_LONGS | 1 | 0.0%/-1.656% | 0.0%/-3.306% | 100.0%/1.821% | 0.199% | -3.361% | 1/0 | 6.303% | -3.787% | 0/1 |
| SHORT | SOL | FRESH_SHORTS | SHADOW_SETUP_FORMING | NEUTRAL | 1 | 0.0%/-3.698% | 0.0%/-4.060% | n/a/n/a% | 0.239% | -4.356% | 1/0 | 0.239% | -4.587% | 1/0 |
| SHORT | SOL | SHORTS_COVERING | SHADOW_NO_SETUP | NEUTRAL | 1 | 100.0%/0.291% | 100.0%/0.714% | 100.0%/2.931% | 0.840% | 0.029% | 0/1 | 3.777% | -0.109% | 0/1 |
| SHORT | SOL | SHORTS_COVERING | SHADOW_SETUP_FORMING | BTC_STRONG_ALT_NOT_FOLLOWING | 1 | 100.0%/0.304% | 100.0%/0.304% | 100.0%/2.710% | 0.579% | -0.040% | 0/1 | 3.501% | -0.395% | 0/1 |
| SHORT | SOL | SHORTS_COVERING | SHADOW_SETUP_FORMING | BTC_WEAK_VETO_ALT_LONGS | 1 | 100.0%/0.364% | 100.0%/0.156% | 0.0%/-0.352% | 0.375% | -0.549% | 1/0 | 1.461% | -1.404% | 1/0 |
| SHORT | SOL | SHORTS_COVERING | SHADOW_SETUP_FORMING | NEUTRAL | 1 | 100.0%/0.075% | 0.0%/-0.375% | 100.0%/2.762% | 0.317% | -0.698% | 1/0 | 3.039% | -1.021% | 0/1 |

## episode

Rows: 90; joined to shadow: 90

| direction | asset | OI bucket | shadow | BTC gate | n | 1h win/avg | 4h win/avg | 24h win/avg | med MFE4h | med MAE4h | first4h fav/adverse | med MFE24h | med MAE24h | first24h fav/adverse |
| --- | --- | --- | --- | --- | ---: | --- | --- | --- | ---: | ---: | --- | ---: | ---: | --- |
| SHORT | BTC | FRESH_SHORTS | SHADOW_SETUP_FORMING | NONE | 12 | 75.0%/0.123% | 58.3%/0.247% | 81.8%/2.172% | 0.907% | -0.183% | 4/8 | 2.510% | -0.482% | 5/7 |
| LONG | BTC | FRESH_SHORTS | SHADOW_SETUP_FORMING | NONE | 10 | 30.0%/-0.371% | 30.0%/-0.592% | 40.0%/-1.776% | 0.290% | -0.466% | 5/5 | 0.582% | -1.237% | 8/2 |
| LONG | ETH | FRESH_SHORTS | SHADOW_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 10 | 30.0%/-0.215% | 44.4%/-0.338% | 55.6%/-1.715% | 0.514% | -0.395% | 5/5 | 1.473% | -1.158% | 5/5 |
| LONG | SOL | FRESH_SHORTS | SHADOW_CONFIRMED | BTC_PERMITS_ALT_LONG_OBSERVATION | 8 | 37.5%/-0.124% | 37.5%/-0.696% | 28.6%/-1.955% | 0.332% | -0.549% | 6/2 | 1.123% | -3.076% | 6/2 |
| LONG | BTC | FRESH_SHORTS | SHADOW_CONFIRMED | NONE | 7 | 57.1%/-0.253% | 57.1%/0.056% | 28.6%/-0.796% | 0.242% | -0.116% | 3/4 | 0.497% | -1.620% | 5/2 |
| SHORT | SOL | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_STRONG_ALT_NOT_FOLLOWING | 6 | 50.0%/0.098% | 33.3%/-0.362% | 33.3%/-0.338% | 0.736% | -0.803% | 3/3 | 2.469% | -1.809% | 4/2 |
| LONG | SOL | FRESH_SHORTS | SHADOW_BLOCKED | BTC_WEAK_VETO_ALT_LONGS | 4 | 50.0%/-0.065% | 25.0%/-0.714% | 50.0%/0.126% | 0.175% | -0.672% | 2/2 | 1.498% | -2.398% | 0/4 |
| SHORT | ETH | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_WEAK_VETO_ALT_LONGS | 4 | 0.0%/-0.277% | 75.0%/0.520% | 75.0%/2.515% | 1.299% | -0.563% | 1/3 | 4.601% | -0.563% | 1/3 |
| SHORT | ETH | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_STRONG_ALT_NOT_FOLLOWING | 3 | 33.3%/-0.660% | 33.3%/-0.949% | 66.7%/1.608% | 0.418% | -1.504% | 2/1 | 2.243% | -2.028% | 1/2 |
| SHORT | SOL | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_WEAK_VETO_ALT_LONGS | 3 | 33.3%/0.284% | 100.0%/0.993% | 100.0%/2.778% | 0.874% | -0.066% | 1/2 | 4.217% | -0.270% | 1/2 |
| LONG | ETH | FRESH_SHORTS | SHADOW_SETUP_FORMING | NEUTRAL | 2 | 50.0%/-0.149% | 0.0%/-0.727% | 0.0%/-2.150% | 0.187% | -0.170% | 2/0 | 0.747% | -0.999% | 2/0 |
| LONG | SOL | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_PERMITS_ALT_LONG_OBSERVATION | 2 | 100.0%/0.286% | 0.0%/-0.283% | 50.0%/-2.031% | 0.534% | -0.018% | 1/1 | 1.297% | -1.732% | 1/1 |
| SHORT | ETH | FRESH_SHORTS | SHADOW_NO_SETUP | BTC_WEAK_VETO_ALT_LONGS | 2 | 50.0%/-0.016% | 50.0%/0.309% | 100.0%/2.065% | 0.775% | -0.574% | 1/1 | 3.006% | -0.574% | 1/1 |
| LONG | BTC | NEUTRAL | SHADOW_NO_SETUP | NONE | 1 | 0.0%/-0.026% | 0.0%/-0.055% | 100.0%/0.128% | 0.180% | -0.551% | 1/0 | 1.006% | -0.551% | 0/1 |
| LONG | ETH | FRESH_LONGS | SHADOW_SETUP_FORMING | BTC_PERMITS_ALT_LONG_OBSERVATION | 1 | 0.0%/-0.367% | 100.0%/0.338% | 0.0%/-4.719% | 0.121% | -0.367% | 1/0 | 0.338% | -4.732% | 1/0 |
| LONG | ETH | FRESH_SHORTS | SHADOW_BLOCKED | BTC_WEAK_VETO_ALT_LONGS | 1 | 100.0%/0.281% | 0.0%/-0.437% | 0.0%/-1.778% | 0.281% | -0.604% | 1/0 | 1.414% | -2.071% | 1/0 |
| LONG | ETH | FRESH_SHORTS | SHADOW_SETUP_FORMING | BTC_PERMITS_ALT_LONG_OBSERVATION | 1 | 0.0%/-0.335% | 0.0%/-0.454% | 0.0%/-0.388% | -0.186% | -0.836% | 1/0 | 0.781% | -1.539% | 0/1 |
| LONG | ETH | SHORTS_COVERING | SHADOW_SETUP_FORMING | NEUTRAL | 1 | 100.0%/0.333% | 100.0%/0.415% | 0.0%/-0.172% | 0.561% | 0.070% | 0/1 | 0.619% | -1.324% | 0/1 |
| LONG | SOL | NEUTRAL | SHADOW_SETUP_FORMING | NEUTRAL | 1 | 100.0%/0.214% | 100.0%/0.701% | 100.0%/0.840% | 0.655% | -0.110% | 0/1 | 1.745% | -1.130% | 0/1 |
| LONG | SOL | SHORTS_COVERING | SHADOW_SETUP_FORMING | BTC_PERMITS_ALT_LONG_OBSERVATION | 1 | 100.0%/0.409% | 100.0%/0.121% | 0.0%/-2.622% | 0.490% | 0.075% | 1/0 | 0.974% | -3.083% | 1/0 |
| LONG | SOL | SHORTS_COVERING | SHADOW_SETUP_FORMING | NEUTRAL | 1 | 0.0%/-0.087% | 100.0%/1.199% | 100.0%/0.353% | 1.651% | -0.330% | 0/1 | 1.662% | -0.330% | 0/1 |
| SHORT | BTC | FRESH_LONGS | SHADOW_BLOCKED | NONE | 1 | 100.0%/0.147% | 100.0%/0.139% | 100.0%/1.505% | 0.515% | -0.054% | 1/0 | 1.361% | -0.139% | 0/1 |
| SHORT | ETH | FRESH_SHORTS | SHADOW_SETUP_FORMING | NEUTRAL | 1 | 0.0%/-0.111% | 0.0%/-0.069% | 100.0%/0.494% | 0.278% | -0.388% | 1/0 | 2.439% | -0.388% | 0/1 |
| SHORT | ETH | SHORTS_COVERING | SHADOW_NO_SETUP | BTC_WEAK_VETO_ALT_LONGS | 1 | 100.0%/0.343% | 100.0%/0.196% | 100.0%/0.349% | 0.759% | -0.193% | 1/0 | 1.650% | -0.286% | 1/0 |
| SHORT | SOL | FRESH_SHORTS | SHADOW_NO_SETUP | BTC_WEAK_VETO_ALT_LONGS | 1 | 0.0%/-1.656% | 0.0%/-3.306% | 100.0%/1.821% | 0.199% | -3.361% | 1/0 | 6.303% | -3.787% | 0/1 |
| SHORT | SOL | FRESH_SHORTS | SHADOW_NO_SETUP | NEUTRAL | 1 | 100.0%/1.470% | 0.0%/-0.398% | 100.0%/5.281% | 2.079% | -0.225% | 0/1 | 7.092% | -2.093% | 0/1 |
| SHORT | SOL | FRESH_SHORTS | SHADOW_SETUP_FORMING | NEUTRAL | 1 | 0.0%/-3.698% | 0.0%/-4.060% | n/a/n/a% | 0.239% | -4.356% | 1/0 | 0.239% | -4.587% | 1/0 |
| SHORT | SOL | SHORTS_COVERING | SHADOW_NO_SETUP | NEUTRAL | 1 | 100.0%/0.291% | 100.0%/0.714% | 100.0%/2.931% | 0.840% | 0.029% | 0/1 | 3.777% | -0.109% | 0/1 |
| SHORT | SOL | SHORTS_COVERING | SHADOW_SETUP_FORMING | BTC_WEAK_VETO_ALT_LONGS | 1 | 100.0%/0.364% | 100.0%/0.156% | 0.0%/-0.352% | 0.375% | -0.549% | 1/0 | 1.461% | -1.404% | 1/0 |
| SHORT | SOL | SHORTS_COVERING | SHADOW_SETUP_FORMING | NEUTRAL | 1 | 100.0%/0.075% | 0.0%/-0.375% | 100.0%/2.762% | 0.317% | -0.698% | 1/0 | 3.039% | -1.021% | 0/1 |

