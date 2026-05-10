#!/usr/bin/env python3
"""
Market Intelligence Signal Synthesizer
Combines analyst outputs, applies confluence adjustments, validates, and generates alerts.
"""

import json
import sys
from datetime import datetime
from typing import Dict, List, Any

# Analyst outputs (from process logs)
CRYPTO_DATA = [
    {
        "asset": "BTC",
        "signal": "WATCH",
        "strength": 0.62,
        "whale_activity": "UNAVAILABLE",
        "whale_adjustment": -0.03,
        "funding_rate": -0.0054,
        "funding_adjustment": 0.05,
        "reasoning": "BTC consolidating at $70,396 after recovering from extreme fear (18 → 56 F&G). Price holding above psychological $70K support level with resilience despite RISK_OFF macro (Iran war). Funding rate -0.0054% (shorts paying longs, +0.05 boost). Whale data unavailable - API limited to 1h history (-0.03 penalty). News reports 'most frustrating phase' per CryptoQuant but price action stable. Confluence: neutral technicals + recovering sentiment + slight funding edge - whale uncertainty - macro headwind = WATCH (0.62). Needs breakout catalyst or deeper pullback for entry.",
        "price_current": 70396,
        "price_24h_change": None
    },
    {
        "asset": "ETH",
        "signal": "WATCH",
        "strength": 0.55,
        "whale_activity": "UNAVAILABLE",
        "whale_adjustment": -0.03,
        "funding_rate": -0.00006811,
        "funding_adjustment": 0.05,
        "reasoning": "ETH at $2,069 holding above $2K psychological support. Following BTC sentiment recovery (F&G 56). Funding rate -0.0068% (shorts paying longs, +0.05 boost). Whale data unavailable (-0.03 penalty). RISK_OFF macro creates headwind but price stability suggests underlying demand. Confluence: neutral technicals + recovering sentiment + funding edge - whale uncertainty - macro pressure = WATCH (0.55). Following BTC lead, no independent catalyst yet.",
        "price_current": 2069.11,
        "price_24h_change": None
    }
]

GOLD_DATA = {
    "asset": "GOLD_FUTURES",
    "signal": "WATCH",
    "strength": 0.42,
    "reasoning": "Gold at $5,179.10 (-1.2% in 24h) facing dollar pressure as DXY rebounds to 99.20 and real yields remain positive (~1.7%). CPI data matched expectations at 0.3% MoM, keeping Fed rate cuts uncertain. Iran conflict headlines provided brief safe-haven support but dollar strength is dominating. ⚠️ HEADLINE VOLATILITY: 1.2% move in 24h on geopolitical news (Iran conflict). Price action shows safe-haven premium being sold as dollar attracts defensive flows. Technical outlook mixed - awaiting clearer directional catalyst. Consider scaling into positions on pullback below $5,150 or breakout above $5,220.",
    "price_current": 5179.10,
    "price_24h_change": -1.2,
    "macro_context": {
        "dxy": 99.20,
        "real_yield_est": 1.75,
        "vix_est": 16.5
    }
}

MACRO_DATA = {
    "summary": "Fed holds rates at 3.64% ahead of March 17-18 FOMC meeting. Iran war escalation driving oil price shock, complicating Fed's path to rate cuts. Inflation had been stabilizing before conflict. Labor market softening but energy cost spike creates policy bind. VIX elevated on geopolitical uncertainty.",
    "risk_sentiment": "RISK_OFF",
    "key_events": [
        {"event": "FOMC meeting March 17-18 approaching", "impact": "Rate cut outlook uncertain due to Iran oil shock", "confidence": 0.85},
        {"event": "Iran war escalation driving oil prices higher", "impact": "Negative for risk assets, positive for gold safe-haven", "confidence": 0.90},
        {"event": "Fed Funds at 3.64%, gradual easing from 5.33% peak", "impact": "Dovish trajectory but energy shock may pause cuts", "confidence": 0.80},
        {"event": "Tariff price pressures from China imports persisting", "impact": "Inflationary headwind limiting Fed flexibility", "confidence": 0.75}
    ]
}

SENTIMENT_DATA = {
    "crypto_sentiment": {
        "fear_greed": 57,
        "label": "GREED",
        "funding_rate": 0.005,
        "interpretation": "Greed level (57) indicates moderately bullish sentiment. Market psychology shifted from extreme fear (18) seen earlier to cautious optimism. Funding rates neutral/slightly positive suggesting balanced leverage. No extreme positioning detected. Room for upside but approaching caution zone.",
        "signal_bias": "NEUTRAL_BULLISH",
        "strength": 0.56
    },
    "gold_sentiment": {
        "etf_flows": "positive",
        "cot_positioning": "bullish",
        "interpretation": "Continued ETF accumulation throughout 2026. Strong institutional flows persist with YTD +21%, 1-year +75%. IAU showing lower expense ratio (0.25%) vs GLD, attracting new capital. No signs of extreme positioning despite strong rally. Steady accumulation phase continues.",
        "signal_bias": "BUY",
        "strength": 0.73
    }
}

# Validation ranges
PRICE_RANGES = {
    "BTC": {"min": 40000, "max": 200000, "max_change_pct": 25},
    "ETH": {"min": 1000, "max": 15000, "max_change_pct": 25},
    "GOLD_FUTURES": {"min": 3000, "max": 10000, "max_change_pct": 25}
}

# Alert thresholds
THRESHOLD_IMMEDIATE = 0.7
THRESHOLD_DIGEST = 0.5


def validate_prices() -> tuple[bool, str]:
    """Validate all prices against sanity ranges."""
    issues = []
    
    # Check crypto
    for crypto in CRYPTO_DATA:
        asset = crypto["asset"]
        price = crypto["price_current"]
        ranges = PRICE_RANGES.get(asset)
        
        if not ranges:
            issues.append(f"{asset}: No validation range defined")
            continue
            
        if price < ranges["min"] or price > ranges["max"]:
            issues.append(f"{asset}: Price ${price:,.2f} outside range ${ranges['min']:,}-${ranges['max']:,}")
        
        if crypto["price_24h_change"] is not None:
            change_pct = abs(crypto["price_24h_change"])
            if change_pct > ranges["max_change_pct"]:
                issues.append(f"{asset}: 24h change {change_pct:.1f}% exceeds {ranges['max_change_pct']}% threshold")
    
    # Check gold
    gold_price = GOLD_DATA["price_current"]
    gold_ranges = PRICE_RANGES["GOLD_FUTURES"]
    
    if gold_price < gold_ranges["min"] or gold_price > gold_ranges["max"]:
        issues.append(f"GOLD: Price ${gold_price:,.2f} outside range ${gold_ranges['min']:,}-${gold_ranges['max']:,}")
    
    if GOLD_DATA["price_24h_change"] is not None:
        change_pct = abs(GOLD_DATA["price_24h_change"])
        if change_pct > gold_ranges["max_change_pct"]:
            issues.append(f"GOLD: 24h change {change_pct:.1f}% exceeds {gold_ranges['max_change_pct']}% threshold")
    
    if issues:
        return False, "; ".join(issues)
    return True, "All prices validated"


def apply_confluence_adjustments(signals: List[Dict]) -> List[Dict]:
    """Apply confluence adjustments based on macro and sentiment context."""
    adjusted = []
    risk_sentiment = MACRO_DATA["risk_sentiment"]
    fear_greed = SENTIMENT_DATA["crypto_sentiment"]["fear_greed"]
    
    for sig in signals:
        asset = sig["asset"]
        original_strength = sig["strength"]
        adjustment = 0.0
        adjustments_applied = []
        
        # RISK_OFF + Gold BUY
        if risk_sentiment == "RISK_OFF" and asset == "GOLD_FUTURES" and sig["signal"] in ["BUY", "WATCH"]:
            adjustment += 0.05
            adjustments_applied.append("RISK_OFF+Gold(+0.05)")
        
        # RISK_ON + Crypto BUY
        if risk_sentiment == "RISK_ON" and asset in ["BTC", "ETH"] and sig["signal"] == "BUY":
            adjustment += 0.05
            adjustments_applied.append("RISK_ON+Crypto(+0.05)")
        
        # Extreme Fear + Crypto (contrarian)
        if fear_greed < 20 and asset in ["BTC", "ETH"]:
            adjustment += 0.05
            adjustments_applied.append(f"ExtremeFear({fear_greed})+Crypto(+0.05)")
        
        # Whale ACCUMULATION + BUY (already embedded in analyst signals, but document)
        if "whale_activity" in sig and sig["whale_activity"] == "ACCUMULATION" and sig["signal"] == "BUY":
            # Already counted in analyst's strength, but note it
            adjustments_applied.append("WhaleAccumulation(embedded)")
        
        new_strength = min(1.0, original_strength + adjustment)
        
        adjusted.append({
            **sig,
            "strength_original": original_strength,
            "strength_adjusted": new_strength,
            "confluence_adjustment": adjustment,
            "confluence_factors": adjustments_applied
        })
    
    return adjusted


def categorize_alerts(signals: List[Dict]) -> Dict[str, List[Dict]]:
    """Categorize signals into immediate/digest/log tiers."""
    immediate = []
    digest = []
    log_only = []
    
    for sig in signals:
        strength = sig.get("strength_adjusted", sig["strength"])
        
        if strength >= THRESHOLD_IMMEDIATE:
            immediate.append(sig)
        elif strength >= THRESHOLD_DIGEST:
            digest.append(sig)
        else:
            log_only.append(sig)
    
    return {
        "immediate": immediate,
        "digest": digest,
        "log_only": log_only
    }


def format_telegram_alert(category: str, signals: List[Dict]) -> str:
    """Format signals for Telegram delivery."""
    if not signals:
        return None
    
    if category == "immediate":
        header = "🚨 **IMMEDIATE MARKET SIGNALS** 🚨"
    elif category == "digest":
        header = "📊 **Market Digest** (Moderate Signals)"
    else:
        return None  # Don't send log_only to Telegram
    
    lines = [header, ""]
    
    for sig in signals:
        asset = sig["asset"]
        signal = sig["signal"]
        strength = sig.get("strength_adjusted", sig["strength"])
        price = sig.get("price_current")
        
        emoji = "🟢" if signal == "BUY" else "🔴" if signal == "SELL" else "⚪"
        
        lines.append(f"{emoji} **{asset}**: {signal} ({strength:.2f})")
        if price:
            lines.append(f"   Price: ${price:,.2f}")
        
        # Show reasoning snippet
        reasoning = sig.get("reasoning", "")
        if reasoning:
            snippet = reasoning[:150] + "..." if len(reasoning) > 150 else reasoning
            lines.append(f"   _{snippet}_")
        
        # Show confluence adjustments if any
        if "confluence_factors" in sig and sig["confluence_factors"]:
            lines.append(f"   Confluence: {', '.join(sig['confluence_factors'])}")
        
        lines.append("")
    
    # Add macro context
    lines.append("**Macro Context:**")
    lines.append(f"Risk: {MACRO_DATA['risk_sentiment']}")
    lines.append(f"F&G: {SENTIMENT_DATA['crypto_sentiment']['fear_greed']} ({SENTIMENT_DATA['crypto_sentiment']['label']})")
    lines.append("")
    lines.append(f"_Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}_")
    
    return "\\n".join(lines)


def main():
    """Main orchestration logic."""
    print("🔄 Market Intelligence Orchestrator")
    print("=" * 60)
    
    # Step 1: Validate prices
    print("\\n[1/5] Validating prices...")
    valid, msg = validate_prices()
    print(f"   {msg}")
    
    if not valid:
        print("\\n❌ ABORT: Price validation failed")
        sys.exit(1)
    
    # Step 2: Compile all signals
    print("\\n[2/5] Compiling signals...")
    all_signals = CRYPTO_DATA + [GOLD_DATA]
    print(f"   {len(all_signals)} signals collected")
    
    # Step 3: Apply confluence adjustments
    print("\\n[3/5] Applying confluence adjustments...")
    adjusted_signals = apply_confluence_adjustments(all_signals)
    
    for sig in adjusted_signals:
        if sig.get("confluence_adjustment", 0) > 0:
            print(f"   {sig['asset']}: {sig['strength_original']:.2f} → {sig['strength_adjusted']:.2f} ({sig['confluence_factors']})")
    
    # Step 4: Categorize by threshold
    print("\\n[4/5] Categorizing alerts...")
    categorized = categorize_alerts(adjusted_signals)
    print(f"   Immediate: {len(categorized['immediate'])}")
    print(f"   Digest: {len(categorized['digest'])}")
    print(f"   Log only: {len(categorized['log_only'])}")
    
    # Step 5: Generate outputs
    print("\\n[5/5] Generating outputs...")
    
    # Save full results to JSON
    output_data = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "macro": MACRO_DATA,
        "sentiment": SENTIMENT_DATA,
        "signals": adjusted_signals,
        "categorized": categorized
    }
    
    with open("market-intel/data/signals.json", "w") as f:
        json.dump(output_data, f, indent=2)
    print(f"   Saved: market-intel/data/signals.json")
    
    # Generate Telegram alerts
    telegram_messages = []
    
    if categorized["immediate"]:
        msg = format_telegram_alert("immediate", categorized["immediate"])
        if msg:
            telegram_messages.append(("immediate", msg))
    
    if categorized["digest"]:
        msg = format_telegram_alert("digest", categorized["digest"])
        if msg:
            telegram_messages.append(("digest", msg))
    
    # Output Telegram commands
    if telegram_messages:
        print("\\n📤 Telegram Alerts:")
        for tier, msg in telegram_messages:
            print(f"\\n--- {tier.upper()} ---")
            print(msg)
            print(f"\\n--- END {tier.upper()} ---")
    else:
        print("\\n   No alerts meet threshold criteria")
    
    print("\\n✅ Orchestration complete!")
    
    # Return alert data for caller
    return telegram_messages


if __name__ == "__main__":
    alerts = main()
    
    # Output JSON for programmatic access
    print("\\n" + "="*60)
    print("JSON_OUTPUT_START")
    print(json.dumps({"alerts": [{"tier": t, "message": m} for t, m in alerts]}, indent=2))
    print("JSON_OUTPUT_END")
