# Telegram Routing Review — 2026-06-20

## Rule now in force

- Alerts remain logged/tracked.
- Telegram/watch delivery is enabled only for explicit validated candidate keys, or ordinary HIGH alerts whose matched trade-quality bucket is not dynamically suppressed.
- Dynamic suppression: if matched trade-quality bucket has max 1–6h win rate <= 70%, Telegram is suppressed and active-context creation is blocked.
- Explicit enabled candidate keys are exempt from this suppression.

## Added / enabled Telegram-watch candidates

These were added to the explicit enabled set and can trigger Telegram messages even when the original event is MEDIUM/LOW or inverse/watch-only:

| key | Telegram meaning |
| --- | --- |
| BTC_LONG_SETUP_SPOT_LED_ACCUMULATION | BTC spot-led LONG_SETUP; 2–4h long watch |
| BTC_LONG_SHADOW_SETUP_FORMING | BTC setup-forming long; 2–4h countertrend-bounce watch |
| ETH_LONG_CONFIRMED_INVERSE_SHORT | ETH LONG_CONFIRMED as inverse SHORT/fade watch |
| ETH_LONG_CONFIRMED_SPOT_LED_INVERSE_SHORT | ETH LONG_CONFIRMED + spot-led as inverse SHORT watch |
| ETH_LONG_SETUP_STRUCTURAL_BUYING_INVERSE_SHORT | ETH LONG_SETUP + structural buying as inverse SHORT watch |
| ETH_LONG_SHADOW_BLOCKED_INVERSE_SHORT | ETH blocked long as inverse SHORT watch |
| ETH_LONG_SHADOW_NO_SETUP_INVERSE_SHORT | ETH no-setup long as inverse SHORT watch, higher path risk |
| ETH_LONG_SHADOW_SETUP_FORMING_INVERSE_SHORT | ETH setup-forming long as inverse SHORT watch |
| SOL_LONG_CONFIRMED_STRUCTURAL_BUYING_INVERSE_SHORT | SOL LONG_CONFIRMED + structural buying as inverse SHORT watch, small-n |
| SOL_LONG_SHADOW_CONFIRMED_INVERSE_SHORT | SOL shadow-confirmed long as inverse SHORT watch, small-n |

## Removed / suppressed from Telegram prospect

### Static suppress list

These are explicitly configured as Telegram-suppress/log-only:

| key | reason |
| --- | --- |
| FADE_SHORT_LATE_AFTER_LOW | noisy/negative locked cohort; keep logs only unless revalidated |
| FADE_SHORT_POSITIVE_FUNDING | underperformed; log-only |
| FRESH_LONGS_LONG_UNVALIDATED | unvalidated fresh-longs long bucket; log-only |
| NEUTRAL_OI_LONG | poor current locked outcomes; log-only |
| SHORTS_COVERING_LONG_UNVALIDATED | unvalidated shorts-covering long bucket; log-only |
| SOL_LONG_WATCH_ONLY | weak/noisy SOL long watch-only; log-only until revalidated |

### Dynamically suppressed by 70% max-win gate

These may have older static labels like KEEP_TRACKING/HOLD_REVIEW, but current trade-quality max 1–6h win rate does not exceed 70%, so they are suppressed unless a more specific enabled candidate key matches first:

| key / bucket | current max 1–6h win | current class | status |
| --- | ---: | --- | --- |
| pattern:LONGS_EXITING_LONG_UNVALIDATED | 59.2% | WATCH_ONLY | dynamically suppressed unless a more specific enabled key matches |
| asset_dir:BTC\|LONG | 59.2% | WATCH_ONLY | dynamically suppressed unless specific enabled BTC candidate matches |
| asset_type:BTC\|LONG_SETUP | 62.7% | TRADEABLE_1H_2H_ONLY | dynamically suppressed unless `BTC_LONG_SETUP_SPOT_LED_ACCUMULATION` or `BTC_LONG_SHADOW_SETUP_FORMING` matches |
| BTC LONGS_EXITING + BROAD_POSITIVE_FUNDING | 58.3% | WATCH_ONLY | dynamically suppressed |
| asset_type:ETH\|LONG_CONFIRMED original long | 36.0% | NO_TRADE_BAD_PATH | original long suppressed; inverse SHORT candidates enabled separately |
| asset_type:SOL\|LONG_CONFIRMED original long | 52.2% | WATCH_ONLY | original long suppressed; inverse SHORT candidates enabled separately |
| pattern:FADE_SHORT_LATE_AFTER_LOW | 55.6% | WATCH_ONLY | suppressed |
| pattern:FADE_SHORT_POSITIVE_FUNDING | 61.5% | WATCH_ONLY | suppressed |
| pattern:NEUTRAL_OI_LONG | 44.8% | NO_TRADE_BAD_PATH | suppressed |
| pattern:SOL_LONG_WATCH_ONLY | 56.1% | WATCH_ONLY | suppressed |

## Still delivered / reviewed but not newly enabled

These static actions remain in the file, but dynamic trade-quality suppression may still apply if a matching quality bucket is <=70% and no enabled candidate key overrides it:

| key | static action |
| --- | --- |
| FRESH_SHORTS_LONG | HOLD_REVIEW |
| LONGS_EXITING_LONG_UNVALIDATED | KEEP_TRACKING, but currently dynamically suppressed by <=70% max-win rule |
| SOL_SHORT_BELOW_GATE_WATCH | DOWNRANK_WORDING |
| SOL_SHORT_SHORTS_COVERING_WATCH | HOLD_REVIEW |

## Why the enabled candidates were not previously sent

1. Many were MEDIUM/LOW setup alerts, while Telegram routing previously focused on HIGH severity.
2. Several are inverse interpretations of LONG alerts, and the classifier had no explicit inverse candidate labels.
3. Some were swallowed by generic watch-only/quarantine buckets.
4. The old trade-quality report only evaluated 1–4h; current policy evaluates 1–6h.
