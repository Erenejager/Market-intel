# BTC Entry Monitor - Active

**Status:** ✅ ACTIVE  
**Frequency:** Every 2 hours  
**Created:** 2026-02-28 23:02 UTC

## Monitoring For:

### 🟢 Entry Condition 1: DIP to $65k-$66k
**Trigger:** BTC price enters $65,000-$66,000 range  
**Alert:** "🟢 BTC DIP ENTRY at $[price]"  
**Action:** Consider entering with stop at $63k, targets $68k/$70k/$73k

### 🚀 Entry Condition 2: BREAKOUT above $68.5k
**Trigger:** BTC price breaks above $68,500  
**Alert:** "🚀 BTC BREAKOUT at $[price]"  
**Action:** Wait for pullback to $68k, then enter with stop at $66.5k, targets $70k/$73k/$80k

### ⚠️ Danger Condition: BREAKDOWN below $63k
**Trigger:** BTC price breaks below $63,000  
**Alert:** "⚠️ BTC BREAKDOWN at $[price] - DO NOT ENTER"  
**Action:** Wait for price to stabilize at $58k-$60k before considering entry

### 😴 No Alert Zone: $66k-$68.5k
**Trigger:** BTC price between $66,001-$68,499  
**Action:** No alert (waiting for clear setup)

## Current Plan Reference

See full analysis: `/home/clawdbot/.openclaw/workspace/market-intel/BTC-TRADING-PLAN-20260228.md`

**Recommended:** Wait for dip to $65k-$66k OR breakout above $68.5k  
**Avoid:** Buying now at $67k (worse R:R, wider stop needed)

## Cron Schedule

**Expression:** `0 */2 * * *` (every 2 hours, on the hour)  
**Next runs:** 00:00, 02:00, 04:00, 06:00, 08:00, 10:00... UTC

**Delivery:** Telegram chat ID YOUR_TELEGRAM_CHAT_ID

## How to Stop

If you want to disable this monitoring:
```
cron action=list (find the job ID)
cron action=update jobId=[id] patch='{"enabled":false}'
```

Or just tell me "stop BTC monitoring" and I'll disable it.
