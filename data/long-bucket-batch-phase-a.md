# Phase A Remaining LONG Bucket Batch

Generated: 2026-06-06T17:49:39.154Z

Trigger rules: investigate only if confirmed-alert 4h win rate >55%, old-memory delta >10pp, confirmed-alert vs episode materially disagree, or full/postMay21 reverse.

## Summary table

| Asset | OI bucket | Full confirmed n | Full 4h | Full 4h avg | Full 24h | PostMay21 confirmed n | PostMay21 4h | Trigger |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| BTC | FRESH_LONGS | 4 | 75.0% | +0.471% | 25.0% | 0 | — | full_confirmed_4h_gt_55, full_confirmed_episode_disagree_gt15pp |
| BTC | SHORTS_COVERING | 2 | 0.0% | -0.328% | 50.0% | 0 | — | none |
| BTC | LONGS_EXITING | 4 | 100.0% | +0.491% | 75.0% | 0 | — | full_confirmed_4h_gt_55 |
| BTC | NEUTRAL | 14 | 42.9% | +0.038% | 64.3% | 1 | 0.0% | full_postMay21_4h_avg_reversal |
| ETH | FRESH_LONGS | 8 | 75.0% | +0.336% | 12.5% | 1 | 100.0% | full_confirmed_4h_gt_55, postMay21_confirmed_4h_gt_55 |
| ETH | SHORTS_COVERING | 3 | 33.3% | +0.019% | 0.0% | 1 | 100.0% | postMay21_confirmed_4h_gt_55, full_confirmed_episode_disagree_gt15pp |
| ETH | LONGS_EXITING | 2 | 50.0% | +0.015% | 50.0% | 0 | — | full_confirmed_episode_disagree_gt15pp |
| ETH | NEUTRAL | 9 | 33.3% | -0.436% | 11.1% | 0 | — | full_confirmed_episode_disagree_gt15pp |
| SOL | FRESH_LONGS | 7 | 14.3% | -0.974% | 0.0% | 0 | — | none |
| SOL | SHORTS_COVERING | 11 | 45.5% | +0.166% | 45.5% | 2 | 100.0% | postMay21_confirmed_4h_gt_55, full_confirmed_episode_disagree_gt15pp |
| SOL | LONGS_EXITING | 1 | 0.0% | -0.275% | 0.0% | 0 | — | none |
| SOL | NEUTRAL | 11 | 36.4% | -0.259% | 72.7% | 1 | 100.0% | postMay21_confirmed_4h_gt_55, full_postMay21_4h_avg_reversal |

## Triggered buckets detail

### BTC LONG + FRESH_LONGS

Triggers: full_confirmed_4h_gt_55, full_confirmed_episode_disagree_gt15pp

```json
{
  "full": {
    "confirmed-alert": {
      "n": 4,
      "h4_n": 4,
      "h4_wr": 0.75,
      "h4_avg": 0.470928270006348,
      "h24_n": 4,
      "h24_wr": 0.25,
      "h24_avg": -0.5969259251194339,
      "shadow_states": {
        "SHADOW_SETUP_FORMING": 3,
        "SHADOW_CONFIRMED": 1
      },
      "btc_gates": {
        "MISSING": 4
      }
    },
    "episode": {
      "n": 2,
      "h4_n": 2,
      "h4_wr": 1,
      "h4_avg": 1.265341068258796,
      "h24_n": 2,
      "h24_wr": 0.5,
      "h24_avg": 1.5051055723688866,
      "shadow_states": {
        "SHADOW_SETUP_FORMING": 2
      },
      "btc_gates": {
        "MISSING": 2
      }
    }
  },
  "postMay21": {
    "confirmed-alert": {
      "n": 0,
      "h4_n": 0,
      "h4_wr": null,
      "h4_avg": null,
      "h24_n": 0,
      "h24_wr": null,
      "h24_avg": null,
      "shadow_states": {},
      "btc_gates": {}
    },
    "episode": {
      "n": 0,
      "h4_n": 0,
      "h4_wr": null,
      "h4_avg": null,
      "h24_n": 0,
      "h24_wr": null,
      "h24_avg": null,
      "shadow_states": {},
      "btc_gates": {}
    }
  },
  "preMay21": {
    "confirmed-alert": {
      "n": 4,
      "h4_n": 4,
      "h4_wr": 0.75,
      "h4_avg": 0.470928270006348,
      "h24_n": 4,
      "h24_wr": 0.25,
      "h24_avg": -0.5969259251194339,
      "shadow_states": {
        "SHADOW_SETUP_FORMING": 3,
        "SHADOW_CONFIRMED": 1
      },
      "btc_gates": {
        "MISSING": 4
      }
    },
    "episode": {
      "n": 2,
      "h4_n": 2,
      "h4_wr": 1,
      "h4_avg": 1.265341068258796,
      "h24_n": 2,
      "h24_wr": 0.5,
      "h24_avg": 1.5051055723688866,
      "shadow_states": {
        "SHADOW_SETUP_FORMING": 2
      },
      "btc_gates": {
        "MISSING": 2
      }
    }
  },
  "triggers": [
    "full_confirmed_4h_gt_55",
    "full_confirmed_episode_disagree_gt15pp"
  ]
}
```

### BTC LONG + LONGS_EXITING

Triggers: full_confirmed_4h_gt_55

```json
{
  "full": {
    "confirmed-alert": {
      "n": 4,
      "h4_n": 4,
      "h4_wr": 1,
      "h4_avg": 0.4909459861410727,
      "h24_n": 4,
      "h24_wr": 0.75,
      "h24_avg": 0.5625987677326167,
      "shadow_states": {
        "SHADOW_NO_SETUP": 3,
        "SHADOW_SETUP_FORMING": 1
      },
      "btc_gates": {
        "MISSING": 4
      }
    },
    "episode": {
      "n": 2,
      "h4_n": 2,
      "h4_wr": 1,
      "h4_avg": 0.5489310038146491,
      "h24_n": 2,
      "h24_wr": 0.5,
      "h24_avg": 0.562464981786216,
      "shadow_states": {
        "SHADOW_NO_SETUP": 2
      },
      "btc_gates": {
        "MISSING": 2
      }
    }
  },
  "postMay21": {
    "confirmed-alert": {
      "n": 0,
      "h4_n": 0,
      "h4_wr": null,
      "h4_avg": null,
      "h24_n": 0,
      "h24_wr": null,
      "h24_avg": null,
      "shadow_states": {},
      "btc_gates": {}
    },
    "episode": {
      "n": 0,
      "h4_n": 0,
      "h4_wr": null,
      "h4_avg": null,
      "h24_n": 0,
      "h24_wr": null,
      "h24_avg": null,
      "shadow_states": {},
      "btc_gates": {}
    }
  },
  "preMay21": {
    "confirmed-alert": {
      "n": 4,
      "h4_n": 4,
      "h4_wr": 1,
      "h4_avg": 0.4909459861410727,
      "h24_n": 4,
      "h24_wr": 0.75,
      "h24_avg": 0.5625987677326167,
      "shadow_states": {
        "SHADOW_NO_SETUP": 3,
        "SHADOW_SETUP_FORMING": 1
      },
      "btc_gates": {
        "MISSING": 4
      }
    },
    "episode": {
      "n": 2,
      "h4_n": 2,
      "h4_wr": 1,
      "h4_avg": 0.5489310038146491,
      "h24_n": 2,
      "h24_wr": 0.5,
      "h24_avg": 0.562464981786216,
      "shadow_states": {
        "SHADOW_NO_SETUP": 2
      },
      "btc_gates": {
        "MISSING": 2
      }
    }
  },
  "triggers": [
    "full_confirmed_4h_gt_55"
  ]
}
```

### BTC LONG + NEUTRAL

Triggers: full_postMay21_4h_avg_reversal

```json
{
  "full": {
    "confirmed-alert": {
      "n": 14,
      "h4_n": 14,
      "h4_wr": 0.42857142857142855,
      "h4_avg": 0.03831229887573084,
      "h24_n": 14,
      "h24_wr": 0.6428571428571429,
      "h24_avg": -0.08484769038555671,
      "shadow_states": {
        "SHADOW_SETUP_FORMING": 13,
        "SHADOW_NO_SETUP": 1
      },
      "btc_gates": {
        "MISSING": 14
      }
    },
    "episode": {
      "n": 10,
      "h4_n": 10,
      "h4_wr": 0.4,
      "h4_avg": 0.0037945478364798772,
      "h24_n": 10,
      "h24_wr": 0.7,
      "h24_avg": -0.08167837735518675,
      "shadow_states": {
        "SHADOW_SETUP_FORMING": 9,
        "SHADOW_NO_SETUP": 1
      },
      "btc_gates": {
        "MISSING": 10
      }
    }
  },
  "postMay21": {
    "confirmed-alert": {
      "n": 1,
      "h4_n": 1,
      "h4_wr": 0,
      "h4_avg": -0.0546495202446441,
      "h24_n": 1,
      "h24_wr": 1,
      "h24_avg": 0.12764520208977312,
      "shadow_states": {
        "SHADOW_NO_SETUP": 1
      },
      "btc_gates": {
        "MISSING": 1
      }
    },
    "episode": {
      "n": 1,
      "h4_n": 1,
      "h4_wr": 0,
      "h4_avg": -0.0546495202446441,
      "h24_n": 1,
      "h24_wr": 1,
      "h24_avg": 0.12764520208977312,
      "shadow_states": {
        "SHADOW_NO_SETUP": 1
      },
      "btc_gates": {
        "MISSING": 1
      }
    }
  },
  "preMay21": {
    "confirmed-alert": {
      "n": 13,
      "h4_n": 13,
      "h4_wr": 0.46153846153846156,
      "h4_avg": 0.0454632080388366,
      "h24_n": 13,
      "h24_wr": 0.6153846153846154,
      "h24_avg": -0.10119329749904363,
      "shadow_states": {
        "SHADOW_SETUP_FORMING": 13
      },
      "btc_gates": {
        "MISSING": 13
      }
    },
    "episode": {
      "n": 9,
      "h4_n": 9,
      "h4_wr": 0.4444444444444444,
      "h4_avg": 0.010288333178826985,
      "h24_n": 9,
      "h24_wr": 0.6666666666666666,
      "h24_avg": -0.10493655284907118,
      "shadow_states": {
        "SHADOW_SETUP_FORMING": 9
      },
      "btc_gates": {
        "MISSING": 9
      }
    }
  },
  "triggers": [
    "full_postMay21_4h_avg_reversal"
  ]
}
```

### ETH LONG + FRESH_LONGS

Triggers: full_confirmed_4h_gt_55, postMay21_confirmed_4h_gt_55

```json
{
  "full": {
    "confirmed-alert": {
      "n": 8,
      "h4_n": 8,
      "h4_wr": 0.75,
      "h4_avg": 0.3357515335512837,
      "h24_n": 8,
      "h24_wr": 0.125,
      "h24_avg": -1.2873316198413178,
      "shadow_states": {
        "SHADOW_SETUP_FORMING": 8
      },
      "btc_gates": {
        "BTC_CONFIRMS_ALT_LONG_CONTEXT": 4,
        "NEUTRAL": 3,
        "BTC_PERMITS_ALT_LONG_OBSERVATION": 1
      }
    },
    "episode": {
      "n": 3,
      "h4_n": 3,
      "h4_wr": 0.6666666666666666,
      "h4_avg": 0.14721294802837778,
      "h24_n": 3,
      "h24_wr": 0.3333333333333333,
      "h24_avg": -1.771603440586647,
      "shadow_states": {
        "SHADOW_SETUP_FORMING": 3
      },
      "btc_gates": {
        "BTC_CONFIRMS_ALT_LONG_CONTEXT": 1,
        "NEUTRAL": 1,
        "BTC_PERMITS_ALT_LONG_OBSERVATION": 1
      }
    }
  },
  "postMay21": {
    "confirmed-alert": {
      "n": 1,
      "h4_n": 1,
      "h4_wr": 1,
      "h4_avg": 0.33831042273522044,
      "h24_n": 1,
      "h24_wr": 0,
      "h24_avg": -4.718713338928729,
      "shadow_states": {
        "SHADOW_SETUP_FORMING": 1
      },
      "btc_gates": {
        "BTC_PERMITS_ALT_LONG_OBSERVATION": 1
      }
    },
    "episode": {
      "n": 1,
      "h4_n": 1,
      "h4_wr": 1,
      "h4_avg": 0.33831042273522044,
      "h24_n": 1,
      "h24_wr": 0,
      "h24_avg": -4.718713338928729,
      "shadow_states": {
        "SHADOW_SETUP_FORMING": 1
      },
      "btc_gates": {
        "BTC_PERMITS_ALT_LONG_OBSERVATION": 1
      }
    }
  },
  "preMay21": {
    "confirmed-alert": {
      "n": 7,
      "h4_n": 7,
      "h4_wr": 0.7142857142857143,
      "h4_avg": 0.33538597795357844,
      "h24_n": 7,
      "h24_wr": 0.14285714285714285,
      "h24_avg": -0.7971342314002593,
      "shadow_states": {
        "SHADOW_SETUP_FORMING": 7
      },
      "btc_gates": {
        "BTC_CONFIRMS_ALT_LONG_CONTEXT": 4,
        "NEUTRAL": 3
      }
    },
    "episode": {
      "n": 2,
      "h4_n": 2,
      "h4_wr": 0.5,
      "h4_avg": 0.05166421067495647,
      "h24_n": 2,
      "h24_wr": 0.5,
      "h24_avg": -0.2980484914156063,
      "shadow_states": {
        "SHADOW_SETUP_FORMING": 2
      },
      "btc_gates": {
        "BTC_CONFIRMS_ALT_LONG_CONTEXT": 1,
        "NEUTRAL": 1
      }
    }
  },
  "triggers": [
    "full_confirmed_4h_gt_55",
    "postMay21_confirmed_4h_gt_55"
  ]
}
```

### ETH LONG + SHORTS_COVERING

Triggers: postMay21_confirmed_4h_gt_55, full_confirmed_episode_disagree_gt15pp

```json
{
  "full": {
    "confirmed-alert": {
      "n": 3,
      "h4_n": 3,
      "h4_wr": 0.3333333333333333,
      "h4_avg": 0.018704540454322793,
      "h24_n": 3,
      "h24_wr": 0,
      "h24_avg": -0.9222490545942823,
      "shadow_states": {
        "SHADOW_BLOCKED": 1,
        "SHADOW_SETUP_FORMING": 2
      },
      "btc_gates": {
        "BTC_WEAK_VETO_ALT_LONGS": 1,
        "BTC_CONFIRMS_ALT_LONG_CONTEXT": 1,
        "NEUTRAL": 1
      }
    },
    "episode": {
      "n": 1,
      "h4_n": 1,
      "h4_wr": 0,
      "h4_avg": -0.19745764498380966,
      "h24_n": 1,
      "h24_wr": 0,
      "h24_avg": -1.5344543680769829,
      "shadow_states": {
        "SHADOW_BLOCKED": 1
      },
      "btc_gates": {
        "BTC_WEAK_VETO_ALT_LONGS": 1
      }
    }
  },
  "postMay21": {
    "confirmed-alert": {
      "n": 1,
      "h4_n": 1,
      "h4_wr": 1,
      "h4_avg": 0.4146479242992027,
      "h24_n": 1,
      "h24_wr": 0,
      "h24_avg": -0.17181284822575307,
      "shadow_states": {
        "SHADOW_SETUP_FORMING": 1
      },
      "btc_gates": {
        "NEUTRAL": 1
      }
    },
    "episode": {
      "n": 1,
      "h4_n": 1,
      "h4_wr": 1,
      "h4_avg": 0.4146479242992027,
      "h24_n": 1,
      "h24_wr": 0,
      "h24_avg": -0.17181284822575307,
      "shadow_states": {
        "SHADOW_SETUP_FORMING": 1
      },
      "btc_gates": {
        "NEUTRAL": 1
      }
    }
  },
  "preMay21": {
    "confirmed-alert": {
      "n": 2,
      "h4_n": 2,
      "h4_wr": 0,
      "h4_avg": -0.17926715146811717,
      "h24_n": 2,
      "h24_wr": 0,
      "h24_avg": -1.2974671577785468,
      "shadow_states": {
        "SHADOW_BLOCKED": 1,
        "SHADOW_SETUP_FORMING": 1
      },
      "btc_gates": {
        "BTC_WEAK_VETO_ALT_LONGS": 1,
        "BTC_CONFIRMS_ALT_LONG_CONTEXT": 1
      }
    },
    "episode": {
      "n": 1,
      "h4_n": 1,
      "h4_wr": 0,
      "h4_avg": -0.19745764498380966,
      "h24_n": 1,
      "h24_wr": 0,
      "h24_avg": -1.5344543680769829,
      "shadow_states": {
        "SHADOW_BLOCKED": 1
      },
      "btc_gates": {
        "BTC_WEAK_VETO_ALT_LONGS": 1
      }
    }
  },
  "triggers": [
    "postMay21_confirmed_4h_gt_55",
    "full_confirmed_episode_disagree_gt15pp"
  ]
}
```

### ETH LONG + LONGS_EXITING

Triggers: full_confirmed_episode_disagree_gt15pp

```json
{
  "full": {
    "confirmed-alert": {
      "n": 2,
      "h4_n": 2,
      "h4_wr": 0.5,
      "h4_avg": 0.01519805261250724,
      "h24_n": 2,
      "h24_wr": 0.5,
      "h24_avg": -0.22109696454657632,
      "shadow_states": {
        "SHADOW_SETUP_FORMING": 1,
        "SHADOW_NO_SETUP": 1
      },
      "btc_gates": {
        "BTC_CONFIRMS_ALT_LONG_CONTEXT": 1,
        "BTC_PERMITS_ALT_LONG_OBSERVATION": 1
      }
    },
    "episode": {
      "n": 1,
      "h4_n": 1,
      "h4_wr": 0,
      "h4_avg": -0.05421809757848107,
      "h24_n": 1,
      "h24_wr": 0,
      "h24_avg": -0.7409806669060646,
      "shadow_states": {
        "SHADOW_NO_SETUP": 1
      },
      "btc_gates": {
        "BTC_PERMITS_ALT_LONG_OBSERVATION": 1
      }
    }
  },
  "postMay21": {
    "confirmed-alert": {
      "n": 0,
      "h4_n": 0,
      "h4_wr": null,
      "h4_avg": null,
      "h24_n": 0,
      "h24_wr": null,
      "h24_avg": null,
      "shadow_states": {},
      "btc_gates": {}
    },
    "episode": {
      "n": 0,
      "h4_n": 0,
      "h4_wr": null,
      "h4_avg": null,
      "h24_n": 0,
      "h24_wr": null,
      "h24_avg": null,
      "shadow_states": {},
      "btc_gates": {}
    }
  },
  "preMay21": {
    "confirmed-alert": {
      "n": 2,
      "h4_n": 2,
      "h4_wr": 0.5,
      "h4_avg": 0.01519805261250724,
      "h24_n": 2,
      "h24_wr": 0.5,
      "h24_avg": -0.22109696454657632,
      "shadow_states": {
        "SHADOW_SETUP_FORMING": 1,
        "SHADOW_NO_SETUP": 1
      },
      "btc_gates": {
        "BTC_CONFIRMS_ALT_LONG_CONTEXT": 1,
        "BTC_PERMITS_ALT_LONG_OBSERVATION": 1
      }
    },
    "episode": {
      "n": 1,
      "h4_n": 1,
      "h4_wr": 0,
      "h4_avg": -0.05421809757848107,
      "h24_n": 1,
      "h24_wr": 0,
      "h24_avg": -0.7409806669060646,
      "shadow_states": {
        "SHADOW_NO_SETUP": 1
      },
      "btc_gates": {
        "BTC_PERMITS_ALT_LONG_OBSERVATION": 1
      }
    }
  },
  "triggers": [
    "full_confirmed_episode_disagree_gt15pp"
  ]
}
```

### ETH LONG + NEUTRAL

Triggers: full_confirmed_episode_disagree_gt15pp

```json
{
  "full": {
    "confirmed-alert": {
      "n": 9,
      "h4_n": 9,
      "h4_wr": 0.3333333333333333,
      "h4_avg": -0.4363651027079725,
      "h24_n": 9,
      "h24_wr": 0.1111111111111111,
      "h24_avg": -2.128285854652123,
      "shadow_states": {
        "SHADOW_SETUP_FORMING": 7,
        "SHADOW_BLOCKED": 2
      },
      "btc_gates": {
        "BTC_CONFIRMS_ALT_LONG_CONTEXT": 5,
        "BTC_WEAK_PENALIZE_ALT_LONGS": 3,
        "NEUTRAL": 1
      }
    },
    "episode": {
      "n": 6,
      "h4_n": 6,
      "h4_wr": 0.5,
      "h4_avg": -0.042538533369459675,
      "h24_n": 6,
      "h24_wr": 0.16666666666666666,
      "h24_avg": -1.7732398687084006,
      "shadow_states": {
        "SHADOW_SETUP_FORMING": 5,
        "SHADOW_BLOCKED": 1
      },
      "btc_gates": {
        "BTC_CONFIRMS_ALT_LONG_CONTEXT": 4,
        "BTC_WEAK_PENALIZE_ALT_LONGS": 2
      }
    }
  },
  "postMay21": {
    "confirmed-alert": {
      "n": 0,
      "h4_n": 0,
      "h4_wr": null,
      "h4_avg": null,
      "h24_n": 0,
      "h24_wr": null,
      "h24_avg": null,
      "shadow_states": {},
      "btc_gates": {}
    },
    "episode": {
      "n": 0,
      "h4_n": 0,
      "h4_wr": null,
      "h4_avg": null,
      "h24_n": 0,
      "h24_wr": null,
      "h24_avg": null,
      "shadow_states": {},
      "btc_gates": {}
    }
  },
  "preMay21": {
    "confirmed-alert": {
      "n": 9,
      "h4_n": 9,
      "h4_wr": 0.3333333333333333,
      "h4_avg": -0.4363651027079725,
      "h24_n": 9,
      "h24_wr": 0.1111111111111111,
      "h24_avg": -2.128285854652123,
      "shadow_states": {
        "SHADOW_SETUP_FORMING": 7,
        "SHADOW_BLOCKED": 2
      },
      "btc_gates": {
        "BTC_CONFIRMS_ALT_LONG_CONTEXT": 5,
        "BTC_WEAK_PENALIZE_ALT_LONGS": 3,
        "NEUTRAL": 1
      }
    },
    "episode": {
      "n": 6,
      "h4_n": 6,
      "h4_wr": 0.5,
      "h4_avg": -0.042538533369459675,
      "h24_n": 6,
      "h24_wr": 0.16666666666666666,
      "h24_avg": -1.7732398687084006,
      "shadow_states": {
        "SHADOW_SETUP_FORMING": 5,
        "SHADOW_BLOCKED": 1
      },
      "btc_gates": {
        "BTC_CONFIRMS_ALT_LONG_CONTEXT": 4,
        "BTC_WEAK_PENALIZE_ALT_LONGS": 2
      }
    }
  },
  "triggers": [
    "full_confirmed_episode_disagree_gt15pp"
  ]
}
```

### SOL LONG + SHORTS_COVERING

Triggers: postMay21_confirmed_4h_gt_55, full_confirmed_episode_disagree_gt15pp

```json
{
  "full": {
    "confirmed-alert": {
      "n": 11,
      "h4_n": 11,
      "h4_wr": 0.45454545454545453,
      "h4_avg": 0.16618775979913594,
      "h24_n": 11,
      "h24_wr": 0.45454545454545453,
      "h24_avg": -0.3258605133794396,
      "shadow_states": {
        "SHADOW_BLOCKED": 1,
        "SHADOW_CONFIRMED": 5,
        "SHADOW_SETUP_FORMING": 5
      },
      "btc_gates": {
        "NEUTRAL": 3,
        "BTC_CONFIRMS_ALT_LONG_CONTEXT": 7,
        "BTC_PERMITS_ALT_LONG_OBSERVATION": 1
      }
    },
    "episode": {
      "n": 6,
      "h4_n": 6,
      "h4_wr": 0.8333333333333334,
      "h4_avg": 0.9696670195393984,
      "h24_n": 6,
      "h24_wr": 0.8333333333333334,
      "h24_avg": 0.7891518216678951,
      "shadow_states": {
        "SHADOW_BLOCKED": 1,
        "SHADOW_CONFIRMED": 2,
        "SHADOW_SETUP_FORMING": 3
      },
      "btc_gates": {
        "NEUTRAL": 3,
        "BTC_CONFIRMS_ALT_LONG_CONTEXT": 2,
        "BTC_PERMITS_ALT_LONG_OBSERVATION": 1
      }
    }
  },
  "postMay21": {
    "confirmed-alert": {
      "n": 2,
      "h4_n": 2,
      "h4_wr": 1,
      "h4_avg": 0.6599245218913293,
      "h24_n": 2,
      "h24_wr": 0.5,
      "h24_avg": -1.1345261050430078,
      "shadow_states": {
        "SHADOW_SETUP_FORMING": 2
      },
      "btc_gates": {
        "NEUTRAL": 1,
        "BTC_PERMITS_ALT_LONG_OBSERVATION": 1
      }
    },
    "episode": {
      "n": 2,
      "h4_n": 2,
      "h4_wr": 1,
      "h4_avg": 0.6599245218913293,
      "h24_n": 2,
      "h24_wr": 0.5,
      "h24_avg": -1.1345261050430078,
      "shadow_states": {
        "SHADOW_SETUP_FORMING": 2
      },
      "btc_gates": {
        "NEUTRAL": 1,
        "BTC_PERMITS_ALT_LONG_OBSERVATION": 1
      }
    }
  },
  "preMay21": {
    "confirmed-alert": {
      "n": 9,
      "h4_n": 9,
      "h4_wr": 0.3333333333333333,
      "h4_avg": 0.0564684793342041,
      "h24_n": 9,
      "h24_wr": 0.4444444444444444,
      "h24_avg": -0.14615704856531334,
      "shadow_states": {
        "SHADOW_BLOCKED": 1,
        "SHADOW_CONFIRMED": 5,
        "SHADOW_SETUP_FORMING": 3
      },
      "btc_gates": {
        "NEUTRAL": 2,
        "BTC_CONFIRMS_ALT_LONG_CONTEXT": 7
      }
    },
    "episode": {
      "n": 4,
      "h4_n": 4,
      "h4_wr": 0.75,
      "h4_avg": 1.124538268363433,
      "h24_n": 4,
      "h24_wr": 1,
      "h24_avg": 1.7509907850233466,
      "shadow_states": {
        "SHADOW_BLOCKED": 1,
        "SHADOW_CONFIRMED": 2,
        "SHADOW_SETUP_FORMING": 1
      },
      "btc_gates": {
        "NEUTRAL": 2,
        "BTC_CONFIRMS_ALT_LONG_CONTEXT": 2
      }
    }
  },
  "triggers": [
    "postMay21_confirmed_4h_gt_55",
    "full_confirmed_episode_disagree_gt15pp"
  ]
}
```

### SOL LONG + NEUTRAL

Triggers: postMay21_confirmed_4h_gt_55, full_postMay21_4h_avg_reversal

```json
{
  "full": {
    "confirmed-alert": {
      "n": 11,
      "h4_n": 11,
      "h4_wr": 0.36363636363636365,
      "h4_avg": -0.2590768236856556,
      "h24_n": 11,
      "h24_wr": 0.7272727272727273,
      "h24_avg": 0.282549632202813,
      "shadow_states": {
        "SHADOW_BLOCKED": 3,
        "SHADOW_SETUP_FORMING": 8
      },
      "btc_gates": {
        "BTC_WEAK_PENALIZE_ALT_LONGS": 3,
        "BTC_CONFIRMS_ALT_LONG_CONTEXT": 5,
        "NEUTRAL": 3
      }
    },
    "episode": {
      "n": 7,
      "h4_n": 7,
      "h4_wr": 0.42857142857142855,
      "h4_avg": 0.02363465957700314,
      "h24_n": 7,
      "h24_wr": 0.7142857142857143,
      "h24_avg": 0.11983587769504399,
      "shadow_states": {
        "SHADOW_BLOCKED": 3,
        "SHADOW_SETUP_FORMING": 4
      },
      "btc_gates": {
        "BTC_WEAK_PENALIZE_ALT_LONGS": 3,
        "BTC_CONFIRMS_ALT_LONG_CONTEXT": 3,
        "NEUTRAL": 1
      }
    }
  },
  "postMay21": {
    "confirmed-alert": {
      "n": 1,
      "h4_n": 1,
      "h4_wr": 1,
      "h4_avg": 0.7013273053961676,
      "h24_n": 1,
      "h24_wr": 1,
      "h24_avg": 0.8404335477887838,
      "shadow_states": {
        "SHADOW_SETUP_FORMING": 1
      },
      "btc_gates": {
        "NEUTRAL": 1
      }
    },
    "episode": {
      "n": 1,
      "h4_n": 1,
      "h4_wr": 1,
      "h4_avg": 0.7013273053961676,
      "h24_n": 1,
      "h24_wr": 1,
      "h24_avg": 0.8404335477887838,
      "shadow_states": {
        "SHADOW_SETUP_FORMING": 1
      },
      "btc_gates": {
        "NEUTRAL": 1
      }
    }
  },
  "preMay21": {
    "confirmed-alert": {
      "n": 10,
      "h4_n": 10,
      "h4_wr": 0.3,
      "h4_avg": -0.3551172365938379,
      "h24_n": 10,
      "h24_wr": 0.7,
      "h24_avg": 0.22676124064421593,
      "shadow_states": {
        "SHADOW_BLOCKED": 3,
        "SHADOW_SETUP_FORMING": 7
      },
      "btc_gates": {
        "BTC_WEAK_PENALIZE_ALT_LONGS": 3,
        "BTC_CONFIRMS_ALT_LONG_CONTEXT": 5,
        "NEUTRAL": 2
      }
    },
    "episode": {
      "n": 6,
      "h4_n": 6,
      "h4_wr": 0.3333333333333333,
      "h4_avg": -0.08931411472619094,
      "h24_n": 6,
      "h24_wr": 0.6666666666666666,
      "h24_avg": -0.0002637339872459769,
      "shadow_states": {
        "SHADOW_BLOCKED": 3,
        "SHADOW_SETUP_FORMING": 3
      },
      "btc_gates": {
        "BTC_WEAK_PENALIZE_ALT_LONGS": 3,
        "BTC_CONFIRMS_ALT_LONG_CONTEXT": 3
      }
    }
  },
  "triggers": [
    "postMay21_confirmed_4h_gt_55",
    "full_postMay21_4h_avg_reversal"
  ]
}
```
