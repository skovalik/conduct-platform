---
name: claude-execution-hours-vs-human-hours
description: Plan hour estimates are human-engineer hours. Claude wall-clock for the same work is roughly 30x less. Never quote plan-hours as Claude time, and re-examine any deferral justified by calendar pressure.
metadata:
  type: feedback
---

Hour estimates in plans and effort tables are HUMAN-ENGINEER hours. Claude-execution wall-clock time for the same work is roughly 30x less. Never quote a plan's hour estimates as if they describe Claude's output rate.

**Why:** The calibration was measured, twice. A batch estimated at "5 to 6 hours Claude clock" completed in under 13 minutes end to end. An earlier correction had already moved the multiplier from 1x to 10x; the observed rate across autonomous batches settled near 30x. Quoting human-hours as Claude-hours distorts every scoping decision downstream, and "defer it, there is no time" decisions made on the inflated number are usually wrong.

**How to apply:**
1. When proposing scope, default to (human-engineer hours / 30) as the Claude-clock baseline, plus a few minutes per commit for test/verify/commit overhead (that fixed cost is where session time actually goes).
2. When {{USER_NAME}} says the estimates are wildly off, assume the error is in the magnitude of the discount; recalibrate down before re-quoting.
3. When a deferral is justified by "calendar pressure" or "scope this down for the deadline," re-examine it under the recalibrated rate; the justification usually evaporates. Bring the work back into scope unless a substantive (non-calendar) reason remains.
4. Plans' effort tables remain right for human planning. They are not the basis for "what Claude can ship this session."

See [[execution-discipline]], [[opus48-planning-regression]].
