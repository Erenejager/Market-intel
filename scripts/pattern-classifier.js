const PATTERN_STATS = {
  T1_FRESH_LONGS_LONG: '📊 SOL FRESH_LONGS+LONG: quarantine / avoid-original context only. Pre-2026-06-20 stats are intentionally hidden; current post-fix evidence does not justify a Telegram trade edge. Treat as no-chase LONG; require separate SHORT confirmation before any fade idea.',
  SHORTS_COVERING_LONG_BEARISH: '📊 SOL SHORTS_COVERING+LONG: quarantine / avoid-chase context only. Pre-2026-06-20 stats are intentionally hidden; current post-fix evidence is mixed and does not justify a clean inverse trade. Watch only.',
  FRESH_SHORTS_LONG: '📊 FRESH_SHORTS+LONG: blocked / observation-only. Pre-2026-06-20 stats and invalidated old claims are intentionally hidden; current post-fix evidence does not justify promotion. Do not use as a LONG entry without fresh confirmed-entry validation.',
  NEUTRAL_OI_LONG: '📊 NEUTRAL+LONG: observation-only. Current evidence is not strong enough for promotion; do not show old/pre-fix win-rate claims.',
  C1_SHORT_MAX: '📊 C1 SHORT: context label only. Pre-2026-06-20 stats are hidden; current post-fix sample is too small for a Telegram confidence claim.',
  N1_GATE_COST: '📊 N1-GATE-COST: research/regime-gated context only. Pre-2026-06-20 win rates are hidden; require current post-fix validation before any confidence claim.',
  FADE_SHORT_POSITIVE_FUNDING: '📊 SHORT below gate + broad positive funding: caution only. Pre-2026-06-20 stats are hidden; current post-fix evidence does not support automatic opposite-LONG fade.',
  FADE_SHORT_LATE_AFTER_LOW: '📊 Late SHORT below gate: high-risk caution only. Pre-2026-06-20 / low-N stats are hidden; do not treat as automatic opposite-LONG.',
  FADE_LONG_BTC_WEAK: '📊 BTC_WEAK + ALT LONG: no-long / inverse-risk context only. Pre-2026-06-20/all-data stats are hidden; use as tactical caution, not automatic SHORT.',
  SOL_SHORT_BELOW_GATE: '📊 SOL SHORT below gate: log-only / no Telegram confidence. Pre-2026-06-20 stats are hidden; current post-fix evidence does not justify same-direction promotion.',
  SOL_SHORT_50_59: '📊 SOL SHORT score 50–59: log-only. Pre-2026-06-20 stats are hidden; current post-fix sample is too small/weak for Telegram confidence.',
  SOL_SHORT_SHORTS_COVERING: '📊 SOL SHORT + SHORTS_COVERING: log-only. Pre-2026-06-20 stats are hidden; current post-fix evidence does not justify same-direction promotion.',
  SOL_LONG_WATCH_ONLY: '📊 SOL LONG: watch-only / no active context. Pre-2026-06-20 stats are hidden; current post-fix evidence is not strong enough for promotion. Wait for regime shift and fresh validation.',
  BTC_LONG_SHADOW_SETUP_FORMING: '📊 BTC LONG + SHADOW_SETUP_FORMING: old pre-fix bounce stats are hidden. Current post-fix review did not replicate the long edge; log-only unless separately revalidated.',
  BTC_LONG_SETUP_SPOT_LED_ACCUMULATION: '📊 BTC LONG_SETUP + SPOT_LED_ACCUMULATION: old pre-fix LONG stats are hidden. Current post-fix review conflicts with the old long-watch idea; do not promote as LONG.',
  ETH_LONG_CONFIRMED_INVERSE_SHORT: '📊 ETH LONG_CONFIRMED inverse SHORT: legacy/pre-fix stats are hidden. Current post-fix sample is below confidence threshold; log-only until N rebuilds. If shown, treat as low-confidence fade watch, not an allowed edge.',
  ETH_LONG_CONFIRMED_SPOT_LED_INVERSE_SHORT: '📊 ETH LONG_CONFIRMED + SPOT_LED_ACCUMULATION inverse SHORT: legacy/pre-fix stats are hidden. Current post-fix N is too small; log-only until revalidated.',
  ETH_LONG_SETUP_STRUCTURAL_BUYING_INVERSE_SHORT: '📊 POST-FIX scan: ETH LONG_SETUP + STRUCTURAL_BUYING inverse SHORT. Since 2026-06-20T20:15Z: dedup N=14 (raw 22); best 4h 78.6% avg +0.684%; 1h only 50.0% avg +0.064%; median MFE6 +0.659% / avg MFE6 +1.593%, median time-to-MFE 210m; median MAE6 -0.331%, median time-to-MAE 105m. Shadow link: source LONG shadow is mixed — SHADOW_SETUP_FORMING 4h 83.3%, SHADOW_BLOCKED 4h 71.4%; this validates setup maturity/fade potential, not immediate SHORT entry. Wait for exhaustion/failure.',
  ETH_LONG_SHADOW_BLOCKED_INVERSE_SHORT: '📊 ETH LONG + SHADOW_BLOCKED inverse SHORT: broad bucket no longer has enough post-fix edge for promotion. Use only narrower validated contexts such as blocked LONG + SELL_PRESSURE; otherwise log-only.',
  ETH_LONG_SHADOW_NO_SETUP_INVERSE_SHORT: '📊 ETH LONG + SHADOW_NO_SETUP inverse SHORT: broad bucket is not strong enough post-fix for promotion. Log-only unless a narrower validated context is present.',
  ETH_LONG_SHADOW_SETUP_FORMING_INVERSE_SHORT: '📊 POST-FIX scan: ETH source LONG + SHADOW_SETUP_FORMING inverse SHORT remains a delayed fade watch. Since 2026-06-20T20:15Z: dedup N=18 (raw 45); best 4h 72.2% avg +0.375%; 1h only 55.6% avg +0.040%; median MFE6 +0.796% @300m; median MAE6 -0.467% @112m. Source shadow is for the LONG setup; use it as maturity/failure context, not instant SHORT entry.',
  SOL_LONG_CONFIRMED_STRUCTURAL_BUYING_INVERSE_SHORT: '📊 SOL LONG_CONFIRMED + STRUCTURAL_BUYING inverse SHORT: legacy/pre-fix stats are hidden. Current post-fix N is too small for Telegram confidence; log-only until revalidated.',
  SOL_LONG_SHADOW_CONFIRMED_INVERSE_SHORT: '📊 SOL LONG + SHADOW_CONFIRMED inverse SHORT: legacy/pre-fix stats are hidden. Current post-fix N is too small for Telegram confidence; log-only until revalidated.'
  ,BTC_LONG_SETUP_INVERSE_SHORT_POSTFIX: '📊 POST-FIX non-Telegram scan: BTC LONG_SETUP behaved better as inverse SHORT. Since 2026-06-20T20:15Z: dedup N=24 (raw 71); inverse SHORT 1h 83.3% avg +0.273%; median MFE6 +0.854% / avg MFE6 +1.289%, median time-to-MFE 158m; median MAE6 -0.279%, median time-to-MAE 180m. Shadow link: not linear, but SHADOW_SETUP_FORMING source LONG still faded well (n=14, 1h 85.7%); SHADOW_NO_SETUP also faded (n=9, 1h 77.8%). Treat source shadow as setup-maturity/context, not LONG validation. Natural LONG 1h only 16.7%. Enter inverse only after failed continuation/rejection.',
  ETH_LONG_BLOCKED_SELL_PRESSURE_INVERSE_SHORT_POSTFIX: '📊 POST-FIX missing-shadow scan: ETH blocked LONG + SELL_PRESSURE behaved as inverse SHORT. Since 2026-06-20T20:15Z: dedup N=25 (raw 99/100 current); inverse SHORT 1h 76.0% avg +0.229%, 2h 84.0% avg +0.435%; median MFE6 +0.862% / avg MFE6 +1.192%, median time-to-MFE 210m; median MAE6 -0.237%, median time-to-MAE 195m. Shadow link: SHADOW_BLOCKED source LONG validates the inverse/fade thesis; effective score was 0 for all N, raw score 0-39. Natural LONG 1h only 24.0%. Best entry is after sell-pressure persists or bounce fails.',
  SOL_SHORT_BLOCKED_SPOT_LED_INVERSE_LONG_POSTFIX: '📊 POST-FIX missing-shadow scan: SOL blocked SHORT + SPOT_LED_ACCUMULATION behaved as inverse LONG. Since 2026-06-20T20:15Z: dedup N=16 (raw 73/74 current); inverse LONG 1h 87.5% avg +0.130%; median MFE6 +0.953% / avg MFE6 +1.218%, median time-to-MFE 225m; median MAE6 -0.583%, median time-to-MAE 135m. Shadow link: SHADOW_BLOCKED source SHORT validates the inverse/bounce thesis; effective score 0 for all N, raw score 0-36. Natural SHORT 1h only 12.5%. Bounce is frequent but MAE is wide; smaller size + require spot bid/failed breakdown.',
  ETH_BTC_PERMITS_ALT_LONG_INVERSE_SHORT_POSTFIX: '📊 POST-FIX missing-shadow scan: ETH BTC_PERMITS_ALT_LONG_OBSERVATION behaved better as inverse SHORT than natural LONG. Since 2026-06-20T20:15Z: dedup N=30 (raw 408 in opportunity scan); inverse SHORT 1h 73.3% avg +0.215%; median MFE6 +0.867% / avg MFE6 +1.414%, median time-to-MFE 210m; median MAE6 -0.250%, median time-to-MAE 106m. Shadow link: score is not a clean linear filter; SHADOW_NO_SETUP still faded 1h 66.7%, SETUP_FORMING/CONFIRMED small-n 100%. BTC permits observation, not LONG validation — fade only if ETH cannot lead.',
  ETH_LONGS_EXITING_BROAD_SHORT_PRESSURE_LONG_POSTFIX: '📊 POST-FIX scan: ETH LONGS_EXITING + BROAD_SHORT_PRESSURE natural LONG reversal watch. Since 2026-06-20T20:15Z: dedup N=16 (raw 112 in opportunity scan); 5h 86.7% avg +0.289%; 1h 56.3% avg +0.160%; median MFE6 +0.946% / avg MFE6 +1.077%, median time-to-MFE 203m; median MAE6 -0.154%, median time-to-MAE 75m. Shadow link: not an entry-timing validator; SHADOW_NO_SETUP did best at 5h, so wait for seller exhaustion/absorption, not immediate entry while cascade accelerates.',
  SOL_SHORTS_COVERING_BROAD_SHORT_PRESSURE_INVERSE_SHORT_POSTFIX: '📊 POST-FIX scan: SOL SHORTS_COVERING + BROAD_SHORT_PRESSURE behaved as inverse SHORT. Since 2026-06-20T20:15Z: dedup N=13 (raw 126 in opportunity scan); 5h 76.9% avg +0.553%; 1h 53.8% avg +0.047%; median MFE6 +1.040% / avg MFE6 +1.796%, median time-to-MFE 270m; median MAE6 -0.646%, median time-to-MAE 105m. Shadow link: not a quick-entry validator; SETUP_FORMING/BLOCKED were small-n strong, but edge is delayed. Wait for failed squeeze/rollover.'
};

const SHORT_SHADOW_GATE_CONTEXT = {
  shadow_gate_applicable: false,
  shadow_gate_reason: 'readiness_shadow_v0_structural_SHORT_cap_postMay21_zero_SHADOW_CONFIRMED',
  empirical_entry_gate: 'production_SHORT_CONFIRMED',
  max_class_until_validation: 'WATCH',
};

const BTC_WEAK_LEGACY_GATE = 'BTC_WEAK_PENALIZE_ALT_LONGS';
const BTC_WEAK_VETO_GATE = 'BTC_WEAK_VETO_ALT_LONGS';
const BTC_CONFIRMS_LEGACY_GATE = 'BTC_CONFIRMS_ALT_LONG_CONTEXT';
const BTC_PERMITS_GATE = 'BTC_PERMITS_ALT_LONG_OBSERVATION';
function normalizeBtcGate(gate) {
  if (gate === BTC_WEAK_LEGACY_GATE) return BTC_WEAK_VETO_GATE;
  if (gate === BTC_CONFIRMS_LEGACY_GATE) return BTC_PERMITS_GATE;
  return gate;
}
function isBtcWeakVeto(gate) { return normalizeBtcGate(gate) === BTC_WEAK_VETO_GATE; }

function buildRegimeFields({ alert, readiness, btc4hChange }) {
  const sm = readiness?.source_metrics || {};
  const gate = normalizeBtcGate(sm.btc_gate || alert.diagnostics?.btc_gate || null);
  let label = 'NEUTRAL';
  if (isBtcWeakVeto(gate)) label = 'BEARISH';
  else if (gate === BTC_PERMITS_GATE) label = 'PERMITS_OBSERVATION';
  else if (gate === 'NEUTRAL') label = 'NEUTRAL';
  else if (btc4hChange !== null && btc4hChange <= -1) label = 'BEARISH_SIDEWAYS';
  else if (btc4hChange !== null && btc4hChange >= 1) label = 'RECOVERING';
  else label = 'RANGING';
  return {
    label,
    btc_4h_pct_change: btc4hChange,
    btc_gate: gate,
    funding: sm.cross_exchange_positioning?.classification || null,
  };
}

function shouldMarkN1GateCost({ alert, readiness, btc4hChange }) {
  if (alert.type !== 'SHORT_CONFIRMED') return false;
  const score = Number(readiness?.effective_score ?? readiness?.score);
  const gate = normalizeBtcGate(readiness?.source_metrics?.btc_gate || alert.diagnostics?.btc_gate || null);
  const oi = readiness?.source_metrics?.oi_price_regime || null;
  const bearishRegime = isBtcWeakVeto(gate) || (btc4hChange !== null && btc4hChange < -1);
  const bearishOiMechanism = oi === 'LONGS_EXITING';
  return score >= 50 && score <= 69 && bearishRegime && bearishOiMechanism;
}

function scopedDeduction(text) {
  return `Deduction: ${text} (current downtrend-heavy dataset; diagnostic only)`;
}

function classifyAlertPattern({ alert, directionFromAlertForReadiness }) {
  const r = alert.readiness_shadow || {};
  const sm = r.source_metrics || {};
  const direction = r.direction || directionFromAlertForReadiness(alert);
  const score = Number(r.effective_score ?? r.score ?? alert.active_context_blocked?.actual_score);
  const state = r.state || alert.active_context_blocked?.actual_state || null;
  const oi = sm.oi_price_regime || null;
  const regime = r.regime?.label || alert.regime?.label || 'UNKNOWN';
  const setupWatchOnly = state === 'SHADOW_SETUP_FORMING' || (Number.isFinite(score) && score < 70);

  if (alert.research_note?.type === 'N1_GATE_COST') {
    return { key: 'N1_GATE_COST', verdict: 'fade_candidate', line: `📋 N1-GATE-COST — SHORT below production gate (${score})`, stat: PATTERN_STATS.N1_GATE_COST };
  }
  if (direction === 'LONG' && alert.asset === 'BTC' && alert.type === 'LONG_SETUP') {
    return {
      key: 'BTC_LONG_SETUP_INVERSE_SHORT_POSTFIX',
      verdict: 'fade_candidate',
      alert_class: 'WATCH_INVERSE_SHORT_1H_FAST',
      active_context: false,
      line: '🔁 BTC LONG_SETUP — promoted inverse SHORT watch. Expected behavior: natural LONG often fails quickly; inverse edge is strongest at 1h, with larger MFE often around 2–3h.',
      stat: PATTERN_STATS.BTC_LONG_SETUP_INVERSE_SHORT_POSTFIX,
      deduction: scopedDeduction('do not chase the LONG_SETUP as a long; treat as SHORT fade candidate if reclaim/continuation fails and sell pressure appears'),
    };
  }
  if (alert.research_note?.type === 'NONTELEGRAM_OPPORTUNITY') {
    const key = alert.research_note.pattern_key;
    return {
      key,
      verdict: alert.research_note.verdict || 'fade_candidate',
      alert_class: alert.research_note.alert_class || 'WATCH_ONLY_OPPORTUNITY',
      active_context: false,
      line: alert.research_note.line,
      stat: PATTERN_STATS[key] || null,
      deduction: alert.research_note.deduction || scopedDeduction('promoted from post-fix non-Telegram/missing-shadow scan; watch-only, no active context and no auto-entry'),
    };
  }
  if (direction === 'LONG' && alert.asset === 'BTC' && alert.type === 'LONG_SETUP' && alert.diagnostics?.flow === 'SPOT_LED_ACCUMULATION') {
    return {
      key: 'BTC_LONG_SETUP_SPOT_LED_ACCUMULATION',
      verdict: 'direction_supported',
      alert_class: 'WATCH_2H_4H_SPOT_LED_LONG',
      active_context: false,
      line: '✅ BTC LONG_SETUP + SPOT_LED_ACCUMULATION — enabled Telegram watch: 2–4h long candidate',
      stat: PATTERN_STATS.BTC_LONG_SETUP_SPOT_LED_ACCUMULATION,
      deduction: scopedDeduction('enabled because max validated 1–6h win rate exceeds 70%; Telegram watch only, no active context'),
    };
  }
  if (direction === 'LONG' && alert.asset === 'ETH' && alert.type === 'LONG_CONFIRMED' && alert.diagnostics?.flow === 'SPOT_LED_ACCUMULATION') {
    return {
      key: 'ETH_LONG_CONFIRMED_SPOT_LED_INVERSE_SHORT',
      verdict: 'fade_candidate',
      alert_class: 'WATCH_INVERSE_SHORT',
      active_context: false,
      line: '🔁 ETH LONG_CONFIRMED + SPOT_LED_ACCUMULATION — enabled inverse SHORT watch, not original long',
      stat: PATTERN_STATS.ETH_LONG_CONFIRMED_SPOT_LED_INVERSE_SHORT,
      deduction: scopedDeduction('historically this long alert behaved better as a SHORT fade in the current bearish phase'),
    };
  }
  if (direction === 'LONG' && alert.asset === 'ETH' && alert.type === 'LONG_CONFIRMED') {
    return {
      key: 'ETH_LONG_CONFIRMED_INVERSE_SHORT',
      verdict: 'fade_candidate',
      alert_class: 'WATCH_INVERSE_SHORT_1H_SCALP_ONLY',
      active_context: false,
      line: '🔁 ETH LONG_CONFIRMED — enabled inverse SHORT watch, 1h scalp only. Expected path: often fades in SHORT direction first, but older sample often had a small squeeze first; do not chase late.',
      stat: PATTERN_STATS.ETH_LONG_CONFIRMED_INVERSE_SHORT,
      deduction: scopedDeduction('re-validated with independent episodes: edge clears 70% only at 1h; 6h path still has favorable MFE > MAE, but treat as scalp/fade watch, not a hold'),
    };
  }
  if (direction === 'LONG' && alert.asset === 'ETH' && alert.type === 'LONG_SETUP' && alert.diagnostics?.flow === 'STRUCTURAL_BUYING') {
    return {
      key: 'ETH_LONG_SETUP_STRUCTURAL_BUYING_INVERSE_SHORT',
      verdict: 'fade_candidate',
      alert_class: 'WATCH_INVERSE_SHORT',
      active_context: false,
      line: '🔁 ETH LONG_SETUP + STRUCTURAL_BUYING — enabled inverse SHORT watch. Expected path: usually pops/squeezes first, then fades; better to wait for exhaustion than short the first print.',
      stat: PATTERN_STATS.ETH_LONG_SETUP_STRUCTURAL_BUYING_INVERSE_SHORT,
      deduction: scopedDeduction('6h path review: inverse SHORT MFE stayed larger than MAE in old and forward samples; Telegram watch only, no active context'),
    };
  }
  if (direction === 'LONG' && alert.asset === 'ETH' && state === 'SHADOW_BLOCKED') {
    return {
      key: 'ETH_LONG_SHADOW_BLOCKED_INVERSE_SHORT',
      verdict: 'fade_candidate',
      alert_class: 'WATCH_INVERSE_SHORT',
      active_context: false,
      line: '🔁 ETH LONG + SHADOW_BLOCKED — enabled inverse SHORT watch',
      stat: PATTERN_STATS.ETH_LONG_SHADOW_BLOCKED_INVERSE_SHORT,
      deduction: scopedDeduction('blocked ETH long rows showed >70% inverse follow-through at 2h'),
    };
  }
  if (direction === 'LONG' && alert.asset === 'ETH' && state === 'SHADOW_NO_SETUP') {
    return {
      key: 'ETH_LONG_SHADOW_NO_SETUP_INVERSE_SHORT',
      verdict: 'fade_candidate',
      alert_class: 'WATCH_INVERSE_SHORT_HIGHER_PATH_RISK',
      active_context: false,
      line: '🔁 ETH LONG + SHADOW_NO_SETUP — enabled inverse SHORT watch, higher path risk',
      stat: PATTERN_STATS.ETH_LONG_SHADOW_NO_SETUP_INVERSE_SHORT,
      deduction: scopedDeduction('4h inverse win exceeded 70%, but adverse path is deeper; watch only'),
    };
  }
  if (direction === 'LONG' && alert.asset === 'ETH' && state === 'SHADOW_SETUP_FORMING') {
    return {
      key: 'ETH_LONG_SHADOW_SETUP_FORMING_INVERSE_SHORT',
      verdict: 'fade_candidate',
      alert_class: 'WATCH_INVERSE_SHORT_4H_5H',
      active_context: false,
      line: '🔁 ETH LONG + SHADOW_SETUP_FORMING — enabled inverse SHORT watch. Expected path: often pushes up first, then rolls over; wait for fade confirmation.',
      stat: PATTERN_STATS.ETH_LONG_SHADOW_SETUP_FORMING_INVERSE_SHORT,
      deduction: scopedDeduction('6h path review: inverse SHORT MFE remains stronger than MAE, but forward n is small; Telegram watch only, no active context'),
    };
  }
  if (direction === 'LONG' && alert.asset === 'SOL' && alert.type === 'LONG_CONFIRMED' && alert.diagnostics?.flow === 'STRUCTURAL_BUYING') {
    return {
      key: 'SOL_LONG_CONFIRMED_STRUCTURAL_BUYING_INVERSE_SHORT',
      verdict: 'fade_candidate',
      alert_class: 'WATCH_INVERSE_SHORT_SMALL_N',
      active_context: false,
      line: '🔁 SOL LONG_CONFIRMED + STRUCTURAL_BUYING — enabled inverse SHORT watch, small-n. Expected path: commonly squeezes up first, then fades; entry timing risk is high.',
      stat: PATTERN_STATS.SOL_LONG_CONFIRMED_STRUCTURAL_BUYING_INVERSE_SHORT,
      deduction: scopedDeduction('6h path review: inverse SHORT MFE > MAE, but post-fix cases were adverse-first; wait for exhaustion/rollover, Telegram watch only'),
    };
  }
  if (direction === 'LONG' && alert.asset === 'SOL' && state === 'SHADOW_CONFIRMED') {
    return {
      key: 'SOL_LONG_SHADOW_CONFIRMED_INVERSE_SHORT',
      verdict: 'fade_candidate',
      alert_class: 'WATCH_INVERSE_SHORT_SMALL_N',
      active_context: false,
      line: '🔁 SOL LONG + SHADOW_CONFIRMED — enabled inverse SHORT watch, small-n',
      stat: PATTERN_STATS.SOL_LONG_SHADOW_CONFIRMED_INVERSE_SHORT,
      deduction: scopedDeduction('small-n but high inverse follow-through; Telegram watch only'),
    };
  }
  if (direction === 'LONG' && oi === 'FRESH_LONGS') {
    if (alert.asset === 'SOL') {
      return {
        key: 'T1_FRESH_LONGS_LONG',
        verdict: 'avoid_original_short_primed',
        alert_class: 'BLOCKED_CURRENT_REGIME',
        active_context: false,
        opposite_watch: {
          direction: 'SHORT',
          trigger: 'SHORT_CONFIRMED',
          bucket: 'C1_SHORT_MAX',
          required_oi_context: 'FRESH_LONGS',
          inverse_class: 'FADE1_INVERSE_SHORT_CANDIDATE',
          evidence_scope: 'SOL_FRESH_LONGS_LONG_SHADOW_CONFIRMED_EPISODE_PATH_CHECK',
          expiry_minutes: 120,
          auto_trade: false,
        },
        line: '⚠️ T1: SOL FRESH_LONGS+LONG — failed LONG / SHORT-primed fade-risk bucket',
        stat: PATTERN_STATS.T1_FRESH_LONGS_LONG,
        deduction: scopedDeduction('suppress/avoid the LONG; OI is SHORT-primed C1 territory if SHORT_CONFIRMED follows'),
      };
    }
    return { key: 'FRESH_LONGS_LONG_UNVALIDATED', verdict: 'watch_only', alert_class: 'QUARANTINED_OBSERVATION_ONLY', active_context: false, line: `⚠️ FRESH_LONGS+LONG — SOL is historically weak, but ${alert.asset} lacks enough asset-specific validation; observation-only until locked-definition evidence exists`, stat: null };
  }
  if (direction === 'LONG' && alert.asset === 'BTC' && state === 'SHADOW_SETUP_FORMING') {
    return {
      key: 'BTC_LONG_SHADOW_SETUP_FORMING',
      verdict: 'direction_supported',
      alert_class: 'WATCH_2H_4H_COUNTERTREND_BOUNCE',
      active_context: false,
      line: '✅ BTC LONG + SHADOW_SETUP_FORMING — enabled watch: 2–4h countertrend-bounce candidate',
      stat: PATTERN_STATS.BTC_LONG_SHADOW_SETUP_FORMING,
      deduction: scopedDeduction('enabled for Telegram/watch because max validated 1–6h win rate exceeds 70%; still no active context because readiness is setup-forming, not confirmed'),
    };
  }
  if (direction === 'LONG' && oi === 'SHORTS_COVERING') {
    if (alert.asset === 'SOL') {
      return {
        key: 'SHORTS_COVERING_LONG_BEARISH',
        verdict: 'weak_original',
        alert_class: 'BLOCKED_CURRENT_REGIME',
        active_context: false,
        line: `🔄 SOL SHORTS_COVERING+LONG — weak/inverse in ${regime}; watch-only / no active context`,
        stat: `${PATTERN_STATS.SHORTS_COVERING_LONG_BEARISH} | ${PATTERN_STATS.SOL_LONG_WATCH_ONLY}`,
        deduction: scopedDeduction('avoid chasing the LONG; watch-only/no active context because SOL LONGs remain weak across current OI contexts'),
      };
    }
    return { key: 'SHORTS_COVERING_LONG_UNVALIDATED', verdict: 'watch_only', alert_class: 'QUARANTINED_OBSERVATION_ONLY', active_context: false, line: `🔄 SHORTS_COVERING+LONG — SOL is weak/inverse, but ${alert.asset} lacks enough asset-specific validation; observation-only until locked-definition evidence exists`, stat: null };
  }
  if (direction === 'LONG' && alert.asset === 'SOL') {
    return {
      key: 'SOL_LONG_WATCH_ONLY',
      verdict: 'watch_only',
      alert_class: 'BLOCKED_CURRENT_REGIME',
      active_context: false,
      line: `⚠️ SOL LONG — watch-only / no active context while current SOL LONG evidence remains weak`,
      stat: PATTERN_STATS.SOL_LONG_WATCH_ONLY,
      deduction: scopedDeduction('deliver/log as watch-only if alert is otherwise eligible, but do not create an active trade context until regime shifts and non-DOWN SOL samples accumulate'),
    };
  }
  if (direction === 'LONG' && oi === 'FRESH_SHORTS') {
    const btcBlocked = isBtcWeakVeto(sm.btc_gate || alert.diagnostics?.btc_gate || null);
    const line = btcBlocked
      ? '🚫 FRESH_SHORTS+LONG — blocked in current bearish/sideways regime and invalid under BTC_WEAK_VETO'
      : '🚫 FRESH_SHORTS+LONG — blocked/observation-only in current bearish/sideways regime; other regimes unvalidated';
    return {
      key: 'FRESH_SHORTS_LONG',
      verdict: 'watch_only',
      alert_class: 'BLOCKED_CURRENT_REGIME',
      active_context: false,
      line,
      stat: PATTERN_STATS.FRESH_SHORTS_LONG,
      deduction: btcBlocked
        ? scopedDeduction('no LONG while BTC_WEAK_VETO is active; score does not override regime block')
        : scopedDeduction('do not promote this LONG in the current bearish/sideways validation regime; in other regimes quarantine as observation-only until confirmed-entry data exists'),
    };
  }
  if (direction === 'LONG' && oi === 'NEUTRAL') {
    return { key: 'NEUTRAL_OI_LONG', verdict: 'watch_only', alert_class: 'QUARANTINED_OBSERVATION_ONLY', active_context: false, line: '⚠️ NEUTRAL OI LONG — no locked confirmed-entry evidence; observation-only until validated', stat: PATTERN_STATS.NEUTRAL_OI_LONG };
  }
  if (direction === 'LONG' && oi === 'LONGS_EXITING') {
    return { key: 'LONGS_EXITING_LONG_UNVALIDATED', verdict: 'watch_only', alert_class: 'QUARANTINED_OBSERVATION_ONLY', active_context: false, line: '⚠️ LONGS_EXITING+LONG — setup-stage pocket was not confirmed-entry evidence; observation-only until locked-definition matrix validates it', stat: null };
  }
  // SHORTs intentionally do not use readiness_shadow_v0 SHADOW_CONFIRMED as a hard empirical gate.
  // Post-May21 audit found zero SHADOW_CONFIRMED SHORT rows across BTC/ETH/SOL while production
  // SHORT_CONFIRMED continued firing; v0 is structurally capped/misweighted for SHORT confirmation.
  // Use production SHORT_CONFIRMED as the empirical entry gate and shadow state as context only.
  if (direction === 'SHORT' && score >= 70 && oi === 'FRESH_LONGS') {
    return { key: 'C1_SHORT_MAX', verdict: 'direction_supported', alert_class: 'WATCH', ...SHORT_SHADOW_GATE_CONTEXT, line: '✅ C1-SHORT: max conviction setup', stat: PATTERN_STATS.C1_SHORT_MAX };
  }
  if (direction === 'LONG' && score < 70 && isBtcWeakVeto(sm.btc_gate || alert.diagnostics?.btc_gate || null)) {
    return {
      key: 'FADE_LONG_BTC_WEAK',
      verdict: 'avoid_original',
      line: `🔁 FADE CANDIDATE — LONG below gate (${score}) under BTC_WEAK; opposite SHORT risk elevated`,
      stat: PATTERN_STATS.FADE_LONG_BTC_WEAK,
      deduction: scopedDeduction('no LONG; tactical fade context only, not automatic SHORT'),
    };
  }
  if (direction === 'SHORT' && score < 70) {
    const funding = sm.cross_exchange_positioning?.classification || null;
    const lateLag = Number(alert.diagnostics?.late_lag_min ?? 0);
    if (score >= 50 && funding === 'BROAD_POSITIVE_FUNDING') {
      return {
        key: 'FADE_SHORT_POSITIVE_FUNDING',
        verdict: 'fade_candidate',
        alert_class: 'WATCH',
        ...SHORT_SHADOW_GATE_CONTEXT,
        line: `🔁 FADE CANDIDATE — SHORT below gate (${score}) + broad positive funding; opposite LONG risk elevated`,
        stat: PATTERN_STATS.FADE_SHORT_POSITIVE_FUNDING,
      };
    }
    if (lateLag >= 15) {
      return {
        key: 'FADE_SHORT_LATE_AFTER_LOW',
        verdict: 'fade_candidate',
        alert_class: 'WATCH',
        ...SHORT_SHADOW_GATE_CONTEXT,
        line: `🔁 FADE CANDIDATE — SHORT below gate (${score}) late +${lateLag}m after local low; opposite LONG risk elevated`,
        stat: PATTERN_STATS.FADE_SHORT_LATE_AFTER_LOW,
      };
    }
    if (alert.asset === 'SOL') {
      if (oi === 'SHORTS_COVERING') {
        return {
          key: 'SOL_SHORT_SHORTS_COVERING_WATCH',
          verdict: 'direction_watch',
          alert_class: 'WATCH',
          ...SHORT_SHADOW_GATE_CONTEXT,
          line: `📈 SAME-DIRECTION WATCH — SOL SHORT below gate (${score}) + SHORTS_COVERING OI`,
          stat: PATTERN_STATS.SOL_SHORT_SHORTS_COVERING,
          deduction: scopedDeduction('front-loaded SOL SHORT edge; alert/log outcome, but do not create active context until production promotion'),
        };
      }
      if (score >= 50 && score <= 59) {
        return {
          key: 'SOL_SHORT_50_59_WATCH',
          verdict: 'direction_watch',
          alert_class: 'WATCH',
          ...SHORT_SHADOW_GATE_CONTEXT,
          line: `📈 SAME-DIRECTION WATCH — SOL SHORT score ${score} below gate`,
          stat: PATTERN_STATS.SOL_SHORT_50_59,
          deduction: scopedDeduction('promising SOL SHORT below-gate slice; track as research/watch, not automatic active context'),
        };
      }
      return {
        key: 'SOL_SHORT_BELOW_GATE_WATCH',
        verdict: 'direction_watch',
        alert_class: 'WATCH',
        ...SHORT_SHADOW_GATE_CONTEXT,
        line: `📈 SAME-DIRECTION WATCH — SOL SHORT below production gate (${score})`,
        stat: PATTERN_STATS.SOL_SHORT_BELOW_GATE,
        deduction: scopedDeduction('front-loaded SOL SHORT follow-through; track outcome, but keep active-context gate strict'),
      };
    }
    const oiNote = oi && oi !== 'LONGS_EXITING' ? ` | OI ${oi}: not N1-qualified` : '';
    return { key: 'SHORT_BELOW_GATE', verdict: 'weak_original', alert_class: 'OBSERVATION_ONLY', ...SHORT_SHADOW_GATE_CONTEXT, line: `📋 SHORT below production gate (${score}) — not N1-qualified${oiNote}`, stat: null };
  }
  return null;
}

function formatRegimeHeader(alert) {
  const regime = alert.regime || alert.readiness_shadow?.regime || null;
  if (!regime) return null;
  const parts = [`🧭 Regime: ${regime.label}`];
  if (regime.btc_4h_pct_change !== null && regime.btc_4h_pct_change !== undefined) parts.push(`BTC 4h ${regime.btc_4h_pct_change}%`);
  if (regime.funding) parts.push(`Funding: ${regime.funding}`);
  if (regime.btc_gate) parts.push(`BTC gate: ${regime.btc_gate}`);
  return parts.join(' | ');
}

function formatResearchTelegramAlert(alert, { activeContextShadowMinScore }) {
  const d = alert.diagnostics || {};
  const score = alert.readiness_shadow?.effective_score ?? alert.readiness_shadow?.score ?? alert.active_context_blocked?.actual_score ?? 'n/a';
  const lines = [];
  lines.push(`⚠️ RESEARCH NOTE — ${alert.asset} N1 GATE COST`);
  const regime = formatRegimeHeader(alert);
  if (regime) lines.push(regime);
  const oi = alert.readiness_shadow?.source_metrics?.oi_price_regime || 'UNKNOWN';
  lines.push(`SHORT below prior >=${activeContextShadowMinScore} shadow-confirmed tier (score: ${score}); context is now monitored if delivered, but tier remains diagnostic.`);
  lines.push(`OI mechanism: ${oi}`);
  lines.push(PATTERN_STATS.N1_GATE_COST);
  if (d.price !== undefined) lines.push(`Price: ${d.price}`);
  if (d.flow) lines.push(`Flow: ${d.flow} / streak ${d.flow_streak ?? 'UNKNOWN'}`);
  lines.push('Not a production signal — tracking gate cost only');
  lines.push(`Time: ${alert.timestamp_utc}`);
  lines.push('Source: phase1d-alerts.jsonl');
  return lines.join('\n');
}

module.exports = {
  PATTERN_STATS,
  buildRegimeFields,
  shouldMarkN1GateCost,
  classifyAlertPattern,
  formatRegimeHeader,
  formatResearchTelegramAlert,
};
