"""
Context-Aware Trading Decision Engine
Implements dynamic thresholds and volatility intelligence

Usage in agents:
    from context_aware_decision import ContextAwareDecisionEngine
    
    engine = ContextAwareDecisionEngine()
    decision = engine.make_decision(
        asset='BTC',
        base_strength=0.72,
        market_data={...},
        news_data={...}
    )
    
    print(decision['signal'])  # BUY/WATCH/HOLD
    print(decision['final_reasoning'])
"""

class DynamicThresholdCalculator:
    """Calculates context-aware thresholds instead of fixed 0.70"""
    
    BASE_THRESHOLDS = {
        'BTC': 0.65,
        'ETH': 0.65,
        'SOL': 0.65,
        'GOLD': 0.70,
        'STOCKS': 0.72,
    }
    
    def calculate_buy_threshold(self, asset, context):
        """
        Returns adaptive threshold based on market context
        
        Args:
            asset: 'BTC', 'ETH', 'GOLD', etc.
            context: dict with regime, volatility, data_quality
            
        Returns:
            dict with threshold, adjustments, reasoning
        """
        threshold = self.BASE_THRESHOLDS.get(asset, 0.70)
        adjustments = []
        
        # 1. REGIME ADJUSTMENT
        regime_mod = self._regime_modifier(context.get('regime', 'NEUTRAL'))
        threshold += regime_mod['value']
        adjustments.append(f"{regime_mod['reason']}: {regime_mod['value']:+.2f}")
        
        # 2. DATA QUALITY ADJUSTMENT
        data_quality = context.get('data_quality', 'MEDIUM')
        if data_quality == 'HIGH':
            threshold -= 0.03
            adjustments.append("Complete data available: -0.03")
        elif data_quality == 'LOW':
            threshold += 0.03
            adjustments.append("Limited data available: +0.03")
        
        # 3. VOLATILITY ADJUSTMENT
        vol_mod = self._volatility_modifier(context.get('volatility', 'NORMAL'))
        threshold += vol_mod
        adjustments.append(f"Volatility ({context.get('volatility')}): {vol_mod:+.2f}")
        
        # BOUNDS: 0.50 - 0.80
        final_threshold = max(0.50, min(0.80, threshold))
        
        return {
            'threshold': final_threshold,
            'adjustments': adjustments,
            'reasoning': f"Dynamic threshold {final_threshold:.2f} (base {self.BASE_THRESHOLDS.get(asset, 0.70):.2f})"
        }
    
    def _regime_modifier(self, regime):
        """Adjust threshold based on market regime"""
        modifiers = {
            'EXTREME_FEAR': {
                'value': -0.10,
                'reason': 'Extreme Fear capitulation'
            },
            'FEAR': {
                'value': -0.05,
                'reason': 'Fear regime (contrarian)'
            },
            'NEUTRAL': {
                'value': 0.00,
                'reason': 'Neutral regime'
            },
            'GREED': {
                'value': +0.05,
                'reason': 'Greed regime (raise bar)'
            },
            'EXTREME_GREED': {
                'value': +0.10,
                'reason': 'Extreme Greed (avoid FOMO)'
            }
        }
        return modifiers.get(regime, {'value': 0.00, 'reason': 'Unknown regime'})
    
    def _volatility_modifier(self, volatility):
        """Adjust threshold based on current volatility"""
        modifiers = {
            'EXTREME': +0.08,
            'VERY_HIGH': +0.06,
            'HIGH': +0.05,
            'ELEVATED': +0.02,
            'NORMAL': 0.00,
            'LOW': -0.03
        }
        return modifiers.get(volatility, 0.00)


class VolatilityIntelligence:
    """Detects abnormal price movements and headline-driven spikes"""
    
    HEADLINE_KEYWORDS = {
        # Geopolitical
        'geopolitical_negative': ['war', 'conflict', 'strike', 'attack', 'invasion', 'missile', 'bombing', 'tension', 'crisis', 'sanctions'],
        'geopolitical_positive': ['peace', 'deal', 'agreement', 'ceasefire', 'treaty', 'negotiate', 'talks', 'resolution', 'dialogue'],
        
        # Monetary Policy
        'policy_hawkish': ['hike', 'raise', 'taper', 'hawkish', 'tighten', 'inflation', 'restrictive'],
        'policy_dovish': ['cut', 'lower', 'dovish', 'ease', 'QE', 'stimulus', 'support', 'accommodative'],
        
        # Crypto-specific
        'crypto_negative': ['hack', 'crash', 'ban', 'regulation', 'SEC', 'lawsuit', 'fraud', 'collapse', 'scam', 'exploit'],
        'crypto_positive': ['adoption', 'ETF', 'approval', 'upgrade', 'partnership', 'institutional', 'launch', 'integrate'],
        
        # Market Dynamics
        'market_shock': ['crash', 'plunge', 'collapse', 'panic', 'surge', 'spike', 'soar', 'rally', 'volatile'],
        'uncertainty': ['uncertain', 'volatile', 'risk', 'concern', 'worry', 'fear', 'caution', 'unclear'],
        
        # Economic Events
        'economic_positive': ['growth', 'strong', 'beat', 'exceed', 'robust', 'boom', 'recovery'],
        'economic_negative': ['recession', 'weak', 'miss', 'decline', 'contraction', 'slowdown', 'crisis']
    }
    
    def analyze_price_action(self, asset, current_price, price_history, news_titles=None):
        """
        Comprehensive volatility and headline analysis
        
        Args:
            asset: Asset symbol
            current_price: Current price
            price_history: Dict with '6h_ago', '24h_ago', 'avg_move' etc.
            news_titles: List of news headline strings
            
        Returns:
            dict with volatility assessment and veto decision
        """
        
        # 1. ANALYZE MOVE SIZE
        move_analysis = self._analyze_move_size(current_price, price_history, asset)
        
        # 2. SCAN HEADLINES
        headline_analysis = self._scan_headlines(news_titles or [])
        
        # 3. ASSESS REVERSION RISK
        reversion_risk = self._calculate_reversion_risk(move_analysis, headline_analysis)
        
        # 4. DETERMINE VETO
        veto_decision = self._should_veto_signal(move_analysis, headline_analysis, reversion_risk)
        
        return {
            'move_analysis': move_analysis,
            'headline_analysis': headline_analysis,
            'reversion_risk': reversion_risk,
            'veto': veto_decision,
            'strength_penalty': veto_decision['penalty']
        }
    
    def _analyze_move_size(self, current_price, history, asset):
        """Calculate if price move is abnormal"""
        
        # Determine timeframe
        if '6h_ago' in history:
            timeframe = '6h'
            baseline = history['6h_ago']
            normal_move = history.get('6h_avg_move', 0.01)
        else:
            timeframe = '24h'
            baseline = history.get('24h_ago', current_price)
            normal_move = history.get('24h_avg_move', 0.02)
        
        # Calculate move
        if baseline and baseline > 0:
            actual_move_pct = abs((current_price - baseline) / baseline)
            move_ratio = actual_move_pct / normal_move if normal_move > 0 else 1.0
        else:
            actual_move_pct = 0.0
            move_ratio = 1.0
        
        # Classify
        if move_ratio > 5.0:
            level = 'EXTREME'
        elif move_ratio > 3.0:
            level = 'VERY_HIGH'
        elif move_ratio > 2.0:
            level = 'HIGH'
        elif move_ratio > 1.5:
            level = 'ELEVATED'
        else:
            level = 'NORMAL'
        
        return {
            'actual_move_pct': actual_move_pct,
            'normal_move_pct': normal_move,
            'move_ratio': move_ratio,
            'volatility_level': level,
            'timeframe': timeframe,
            'message': f"{actual_move_pct*100:.1f}% move in {timeframe} ({move_ratio:.1f}x normal)"
        }
    
    def _scan_headlines(self, news_titles):
        """Detect headline-driven catalysts"""
        
        if not news_titles:
            return {
                'headline_driven': False,
                'categories': [],
                'keywords': [],
                'narrative': None
            }
        
        found_keywords = []
        categories = []
        
        for title in news_titles:
            title_lower = title.lower()
            for category, keywords in self.HEADLINE_KEYWORDS.items():
                for keyword in keywords:
                    if keyword in title_lower:
                        found_keywords.append(keyword)
                        if category not in categories:
                            categories.append(category)
        
        # Determine narrative (prioritize by impact)
        if 'geopolitical_negative' in categories and 'geopolitical_positive' in categories:
            narrative = 'DE_ESCALATION'
        elif 'geopolitical_negative' in categories:
            narrative = 'GEOPOLITICAL_RISK'
        elif 'geopolitical_positive' in categories:
            narrative = 'GEOPOLITICAL_EASING'
        elif 'policy_hawkish' in categories:
            narrative = 'HAWKISH_POLICY'
        elif 'policy_dovish' in categories:
            narrative = 'DOVISH_POLICY'
        elif 'crypto_negative' in categories:
            narrative = 'CRYPTO_NEGATIVE'
        elif 'crypto_positive' in categories:
            narrative = 'CRYPTO_POSITIVE'
        elif 'market_shock' in categories:
            narrative = 'MARKET_SHOCK'
        elif 'economic_negative' in categories:
            narrative = 'ECONOMIC_WEAKNESS'
        elif 'economic_positive' in categories:
            narrative = 'ECONOMIC_STRENGTH'
        elif 'uncertainty' in categories:
            narrative = 'UNCERTAINTY'
        else:
            narrative = None
        
        return {
            'headline_driven': len(found_keywords) > 0,
            'categories': categories,
            'keywords': found_keywords,
            'narrative': narrative
        }
    
    def _calculate_reversion_risk(self, move_analysis, headline_analysis):
        """Estimate probability of mean reversion"""
        
        volatility_risk = {
            'EXTREME': 0.85,
            'VERY_HIGH': 0.70,
            'HIGH': 0.50,
            'ELEVATED': 0.30,
            'NORMAL': 0.10
        }
        
        base_risk = volatility_risk.get(move_analysis['volatility_level'], 0.10)
        
        # Adjust for headlines
        if headline_analysis['headline_driven']:
            # High reversion risk (temporary relief/panic)
            if headline_analysis['narrative'] in ['DE_ESCALATION', 'GEOPOLITICAL_EASING', 'DOVISH_POLICY']:
                multiplier = 1.3  # Relief rallies often reverse
            # Moderate-low reversion risk (sticky fear)
            elif headline_analysis['narrative'] in ['GEOPOLITICAL_RISK', 'HAWKISH_POLICY', 'ECONOMIC_WEAKNESS']:
                multiplier = 0.9  # Fear/hawkishness can persist
            # Asset-specific narratives
            elif headline_analysis['narrative'] in ['CRYPTO_NEGATIVE', 'CRYPTO_POSITIVE']:
                multiplier = 1.1  # Crypto news creates volatility
            # High volatility narratives  
            elif headline_analysis['narrative'] in ['MARKET_SHOCK', 'UNCERTAINTY']:
                multiplier = 1.4  # Extreme moves = high reversion
            else:
                multiplier = 1.2
            final_risk = min(0.95, base_risk * multiplier)
        else:
            final_risk = base_risk * 0.8  # Fundamental moves less likely to reverse
        
        # Classify
        if final_risk > 0.70:
            risk_level = 'HIGH'
        elif final_risk > 0.50:
            risk_level = 'MODERATE'
        elif final_risk > 0.30:
            risk_level = 'LOW'
        else:
            risk_level = 'MINIMAL'
        
        return {
            'probability': final_risk,
            'level': risk_level
        }
    
    def _should_veto_signal(self, move_analysis, headline_analysis, reversion_risk):
        """Decide if we should veto a BUY signal"""
        
        # VETO CONDITION 1: Extreme spike + headline
        if (move_analysis['volatility_level'] in ['EXTREME', 'VERY_HIGH'] and
            headline_analysis['headline_driven']):
            return {
                'veto': True,
                'action': 'DOWNGRADE_TO_WATCH',
                'penalty': -0.20,
                'reason': f"⛔ VETO: {move_analysis['message']} on headline catalyst [{', '.join(headline_analysis['keywords'][:3])}]. High reversion risk ({reversion_risk['probability']:.0%})."
            }
        
        # VETO CONDITION 2: High reversion risk + high volatility
        if (reversion_risk['level'] == 'HIGH' and
            move_analysis['volatility_level'] in ['HIGH', 'VERY_HIGH', 'EXTREME']):
            return {
                'veto': True,
                'action': 'DOWNGRADE_TO_WATCH',
                'penalty': -0.15,
                'reason': f"⚠️ VETO: Mean reversion risk {reversion_risk['probability']:.0%}. {move_analysis['message']}. Avoid buying peak."
            }
        
        # PENALTY (no veto): Moderate risk + de-escalation
        if (reversion_risk['level'] == 'MODERATE' and
            headline_analysis.get('narrative') == 'DE_ESCALATION'):
            return {
                'veto': False,
                'action': 'APPLY_PENALTY',
                'penalty': -0.10,
                'reason': f"⚠️ WARNING: {headline_analysis['narrative']} narrative. {move_analysis['message']}. Applying -0.10 penalty."
            }
        
        # All clear
        return {
            'veto': False,
            'action': 'PROCEED',
            'penalty': 0.00,
            'reason': f"✓ Volatility {move_analysis['volatility_level']}, no veto required."
        }


class ContextAwareDecisionEngine:
    """Integrates dynamic thresholds + volatility intelligence"""
    
    def __init__(self):
        self.threshold_calc = DynamicThresholdCalculator()
        self.volatility_engine = VolatilityIntelligence()
    
    def make_decision(self, asset, base_strength, market_data, news_data=None):
        """
        Final decision with all context layers
        
        Args:
            asset: 'BTC', 'ETH', 'GOLD'
            base_strength: Original strength score (0-1.0)
            market_data: Dict with price, fear_greed, vix, whale_data, etc.
            news_data: Dict with titles list
            
        Returns:
            dict with signal, final_strength, reasoning, metadata
        """
        
        # 1. BUILD CONTEXT
        context = self._build_context(asset, market_data)
        
        # 2. CALCULATE DYNAMIC THRESHOLD
        threshold_result = self.threshold_calc.calculate_buy_threshold(asset, context)
        dynamic_threshold = threshold_result['threshold']
        
        # 3. ANALYZE VOLATILITY
        volatility_result = self.volatility_engine.analyze_price_action(
            asset=asset,
            current_price=market_data.get('price', 0),
            price_history=market_data.get('price_history', {}),
            news_titles=news_data.get('titles', []) if news_data else []
        )
        
        # 4. APPLY PENALTY
        adjusted_strength = base_strength + volatility_result['strength_penalty']
        
        # 5. MAKE DECISION
        if volatility_result['veto']['veto']:
            # HARD VETO
            signal = 'WATCH'
            decision_reason = volatility_result['veto']['reason']
        elif adjusted_strength >= dynamic_threshold:
            signal = 'BUY'
            decision_reason = f"✓ Strength {adjusted_strength:.2f} >= Threshold {dynamic_threshold:.2f}"
        elif adjusted_strength >= 0.50:
            signal = 'WATCH'
            decision_reason = f"Strength {adjusted_strength:.2f} < Threshold {dynamic_threshold:.2f}"
        else:
            signal = 'HOLD'
            decision_reason = f"Strength {adjusted_strength:.2f} too low (< 0.50)"
        
        # 6. BUILD REASONING
        reasoning = self._build_reasoning(
            base_strength=base_strength,
            adjusted_strength=adjusted_strength,
            dynamic_threshold=dynamic_threshold,
            threshold_result=threshold_result,
            volatility_result=volatility_result,
            signal=signal,
            decision_reason=decision_reason,
            context=context
        )
        
        return {
            'signal': signal,
            'base_strength': base_strength,
            'adjusted_strength': adjusted_strength,
            'dynamic_threshold': dynamic_threshold,
            'volatility_veto': volatility_result['veto']['veto'],
            'final_reasoning': reasoning,
            'metadata': {
                'context': context,
                'threshold_adjustments': threshold_result['adjustments'],
                'volatility_analysis': volatility_result
            }
        }
    
    def _build_context(self, asset, market_data):
        """Extract context from market data"""
        
        # Regime from Fear & Greed
        fear_greed = market_data.get('fear_greed', 50)
        if fear_greed < 15:
            regime = 'EXTREME_FEAR'
        elif fear_greed < 35:
            regime = 'FEAR'
        elif fear_greed < 65:
            regime = 'NEUTRAL'
        elif fear_greed < 85:
            regime = 'GREED'
        else:
            regime = 'EXTREME_GREED'
        
        # Data quality
        has_whale = market_data.get('whale_data') is not None
        has_funding = market_data.get('funding_rate') is not None
        has_technical = market_data.get('technical_rating') is not None
        data_count = sum([has_whale, has_funding, has_technical])
        
        if data_count >= 2:
            data_quality = 'HIGH'
        elif data_count == 1:
            data_quality = 'MEDIUM'
        else:
            data_quality = 'LOW'
        
        # Volatility from VIX
        vix = market_data.get('vix', 20)
        if vix > 35:
            volatility = 'EXTREME'
        elif vix > 25:
            volatility = 'HIGH'
        elif vix > 18:
            volatility = 'ELEVATED'
        else:
            volatility = 'NORMAL'
        
        return {
            'regime': regime,
            'data_quality': data_quality,
            'volatility': volatility,
            'vix': vix,
            'fear_greed': fear_greed
        }
    
    def _build_reasoning(self, **kwargs):
        """Build human-readable reasoning"""
        
        vol_analysis = kwargs['volatility_result']
        
        reasoning = f"""**CONTEXT-AWARE DECISION ANALYSIS**

**Base Strength:** {kwargs['base_strength']:.2f}
**Dynamic Threshold:** {kwargs['dynamic_threshold']:.2f} (adaptive)
**Market Regime:** {kwargs['context']['regime']} (F&G: {kwargs['context']['fear_greed']})

**Threshold Adjustments:**
{chr(10).join('  • ' + adj for adj in kwargs['threshold_result']['adjustments'])}

**Volatility Intelligence:**
• Move: {vol_analysis['move_analysis']['message']}
• Headline-driven: {vol_analysis['headline_analysis']['headline_driven']}
{f"• Narrative: {vol_analysis['headline_analysis']['narrative']}" if vol_analysis['headline_analysis']['narrative'] else ''}
• Reversion risk: {vol_analysis['reversion_risk']['level']} ({vol_analysis['reversion_risk']['probability']:.0%})
• Penalty: {vol_analysis['strength_penalty']:+.2f}

**Adjusted Strength:** {kwargs['adjusted_strength']:.2f}

**FINAL DECISION:** {kwargs['signal']}
{kwargs['decision_reason']}

{vol_analysis['veto']['reason']}"""
        
        return reasoning.strip()


# Quick usage example
if __name__ == '__main__':
    engine = ContextAwareDecisionEngine()
    
    # Test case: BTC March 9 (should BUY)
    btc_decision = engine.make_decision(
        asset='BTC',
        base_strength=0.67,
        market_data={
            'price': 65973,
            'fear_greed': 8,
            'vix': 28,
            'price_history': {'24h_ago': 67842, '24h_avg_move': 0.025},
            'whale_data': None,
            'funding_rate': -0.00045
        },
        news_data={'titles': []}
    )
    
    print("BTC March 9 Test:")
    print(f"Signal: {btc_decision['signal']} (should be BUY)")
    print(f"Strength: {btc_decision['adjusted_strength']:.2f}")
    print(f"Threshold: {btc_decision['dynamic_threshold']:.2f}")
    print()
    
    # Test case: Gold March 10, 06:00 (should WATCH/veto)
    gold_decision = engine.make_decision(
        asset='GOLD',
        base_strength=0.75,
        market_data={
            'price': 5457,
            'fear_greed': 59,
            'vix': 25,
            'price_history': {'6h_ago': 5132, '6h_avg_move': 0.008},
            'technical_rating': 'STRONG_BUY'
        },
        news_data={'titles': [
            "Trump says Iran war could end 'pretty quickly'",
            "Gold steadies after Trump signals war may be nearing end"
        ]}
    )
    
    print("Gold March 10 Test:")
    print(f"Signal: {gold_decision['signal']} (should be WATCH)")
    print(f"Veto: {gold_decision['volatility_veto']} (should be True)")
    print(f"Strength: {gold_decision['adjusted_strength']:.2f}")
    print(f"Threshold: {gold_decision['dynamic_threshold']:.2f}")
