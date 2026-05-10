# Deprecated — Market Intel Prompt Orchestrator

Deprecated on 2026-05-06 during canonical runner migration.

Do **not** use this prompt orchestrator for scheduled or manual Market Intel runs. It was archived because it drifted from the deterministic runner and could leak child-agent/progress messages.

Canonical runner:

```bash
node market-intel/orchestrator.js
```

Scheduled alert-only mode:

```bash
node market-intel/orchestrator.js --alert-only
```

Clean artifacts written by the canonical runner:

- `market-intel/data/latest-market-brief.txt`
- `market-intel/data/latest-market-run.json`
- `market-intel/data/signals.json`

Archive copy:

- `market-intel/archive/orchestrators/2026-05-06-canonical-migration/orchestrator-agent.md`
