# False Price-Squeeze Microstructure Diagnostic

Generated: 2026-06-07T17:54:01.189Z

## Scope

- Diagnostic only; no alert/readiness/Telegram behavior changes.
- Uses representative top v1.3 price-only squeeze config: `dist5d_gt_0.25`, entry 3, exit 6, invalidator `dist5d_lt_0`.
- Joins active price-squeeze rows to nearest BTC microstructure row within 20 minutes.

## Coverage

```json
{
  "rows_total_labeled": 3061,
  "price_squeeze_active_rows": 665,
  "active_rows_missing_micro": 0,
  "real_squeeze_active_micro_rows": 142,
  "false_bearish_active_micro_rows": 147,
  "neutral_active_micro_rows": 376
}
```

## Real/manual BULLISH_SQUEEZE active rows

- rows: 142
- positioning: `{"MIXED":79,"BROAD_POSITIVE_FUNDING":63}`
- OI regime: `{"SHORTS_COVERING":2,"NEUTRAL":100,"FRESH_SHORTS":40}`
- flow: `{"STRUCTURAL_BUYING":41,"SELL_PRESSURE":38,"LEVERAGED_CHASE":24,"MIXED_OR_NEUTRAL":6,"DISTRIBUTION":8,"SPOT_LED_ACCUMULATION":25}`
- avg funding: 0.000031; median funding: 0.000028; positive share: 100.0%
- avg OI 4h: -0.000891; median OI 4h: 0.000801; OI4h positive share: 52.8%; negative share: 47.2%
- avg spot/futures buy share: 0.5086 / 0.4859

## False active rows inside manual BEARISH_TREND

- rows: 147
- positioning: `{"BROAD_POSITIVE_FUNDING":67,"MIXED":58,"BROAD_NEGATIVE_FUNDING":22}`
- OI regime: `{"NEUTRAL":22,"FRESH_LONGS":83,"FRESH_SHORTS":17,"SHORTS_COVERING":25}`
- flow: `{"STRUCTURAL_BUYING":33,"SELL_PRESSURE":47,"SPOT_LED_ACCUMULATION":22,"LEVERAGED_CHASE":27,"MIXED_OR_NEUTRAL":7,"DISTRIBUTION":11}`
- avg funding: 0.000012; median funding: 0.00002; positive share: 65.3%
- avg OI 4h: 0.000874; median OI 4h: -0.002425; OI4h positive share: 31.3%; negative share: 68.7%
- avg spot/futures buy share: 0.4696 / 0.4892

## Segment detail — real squeeze

| start | duration | labels | positioning | oi regime | flow | avg funding | avg OI 4h | OI4h+ | avg ret4h | avg dist5d |
| --- | ---: | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| 2026-05-09T20:00:01.348Z | 2040m | {"BULLISH_SQUEEZE":142} | {"MIXED":79,"BROAD_POSITIVE_FUNDING":63} | {"SHORTS_COVERING":2,"NEUTRAL":100,"FRESH_SHORTS":40} | {"STRUCTURAL_BUYING":41,"SELL_PRESSURE":38,"LEVERAGED_CHASE":24,"MIXED_OR_NEUTRAL":6,"DISTRIBUTION":8,"SPOT_LED_ACCUMULATION":25} | 0.000031 | -0.000891 | 52.8% | 0.035% | 0.859% |

## Segment detail — false bearish squeeze

| start | duration | labels | positioning | oi regime | flow | avg funding | avg OI 4h | OI4h+ | avg ret4h | avg dist5d |
| --- | ---: | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| 2026-05-13T09:00:02.217Z | 135m | {"BEARISH_ACCELERATION":9} | {"BROAD_POSITIVE_FUNDING":9} | {"NEUTRAL":9} | {"STRUCTURAL_BUYING":1,"SELL_PRESSURE":5,"SPOT_LED_ACCUMULATION":1,"LEVERAGED_CHASE":2} | 0.00005 | 0.003949 | 100.0% | 0.009% | 0.346% |
| 2026-05-14T15:30:01.399Z | 810m | {"BEARISH_ACCELERATION":35,"BEARISH_CONTINUATION":21} | {"BROAD_POSITIVE_FUNDING":2,"MIXED":32,"BROAD_NEGATIVE_FUNDING":22} | {"FRESH_LONGS":39,"FRESH_SHORTS":17} | {"SPOT_LED_ACCUMULATION":10,"MIXED_OR_NEUTRAL":3,"STRUCTURAL_BUYING":15,"SELL_PRESSURE":15,"DISTRIBUTION":5,"LEVERAGED_CHASE":8} | -0.00002 | 0.006877 | 66.1% | 0.477% | 0.772% |
| 2026-05-21T01:15:01.607Z | 555m | {"BEARISH_GRIND":38} | {"BROAD_POSITIVE_FUNDING":31,"MIXED":7} | {"SHORTS_COVERING":25,"NEUTRAL":13} | {"STRUCTURAL_BUYING":8,"SELL_PRESSURE":10,"SPOT_LED_ACCUMULATION":5,"LEVERAGED_CHASE":8,"MIXED_OR_NEUTRAL":3,"DISTRIBUTION":4} | 0.000025 | -0.004883 | 0.0% | 0.104% | 0.494% |
| 2026-05-21T18:00:01.701Z | 60m | {"BEARISH_GRIND":4} | {"BROAD_POSITIVE_FUNDING":4} | {"FRESH_LONGS":4} | {"SELL_PRESSURE":4} | 0.000061 | -0.002425 | 0.0% | 1.042% | 0.473% |
| 2026-05-21T20:15:02.144Z | 315m | {"BEARISH_GRIND":21} | {"BROAD_POSITIVE_FUNDING":5,"MIXED":16} | {"FRESH_LONGS":21} | {"SELL_PRESSURE":7,"SPOT_LED_ACCUMULATION":3,"LEVERAGED_CHASE":3,"MIXED_OR_NEUTRAL":1,"STRUCTURAL_BUYING":5,"DISTRIBUTION":2} | 0.000029 | -0.002425 | 0.0% | 0.040% | 0.325% |
| 2026-05-22T02:30:02.198Z | 285m | {"BEARISH_GRIND":19} | {"BROAD_POSITIVE_FUNDING":16,"MIXED":3} | {"FRESH_LONGS":19} | {"LEVERAGED_CHASE":6,"SELL_PRESSURE":6,"SPOT_LED_ACCUMULATION":3,"STRUCTURAL_BUYING":4} | 0.000032 | -0.002425 | 0.0% | 0.045% | 0.352% |

## Preliminary interpretation

- Real squeeze rows show OI4h negative share 47.2% and SHORTS_COVERING share 1.4%.
- False bearish squeeze rows show OI4h positive share 31.3% and FRESH_SHORTS share 11.6%.
- OI/funding separation is not clean enough in this sample. Keep squeeze as `UNKNOWN_SQUEEZE_RISK`; do not create a hard squeeze classifier from price-adjacent fields.

## Suggested next step

- If separation is clean: write a small preregistered microstructure squeeze proxy decision note before testing/wiring.
- If separation is not clean: leave `squeeze_risk: UNKNOWN_SQUEEZE_RISK` permanently for now and continue bearish-only shadow logging.

