---
name: follow-plans-exactly
description: An approved plan is a contract. Execute exactly to it, and verify every task against the actual code/output afterward. No silent deviations.
metadata:
  type: feedback
---

Once a plan is approved, it is a contract. Execute it exactly. After execution, verify each task against the actual code or output, not against your memory of what you intended to do.

**Why:** Plans drift during execution. A step gets reinterpreted, skipped, or "improved" mid-flight, and the result no longer matches what was agreed. Silent deviation breaks trust because the work *looks* done but isn't what was planned. The mismatch is only caught by checking the real artifact against the plan, task by task.

**How to apply:**
1. When dispatching execution agents, include the SPECIFIC plan tasks with their exact requirements; do not summarize them. Summarization loss is how an agent ships a shortcut (a `return null` where the plan specified a real alternative) without anyone noticing.
2. Work the plan in order; if a step turns out to be wrong or impossible, STOP and raise it. Don't quietly substitute your own approach.
3. After execution, walk each planned task and confirm it landed in the actual code/output (grep for it, read the file, run it).
4. If you deviated, say so explicitly and why. Deviations are reported, not hidden.
5. A task you *described* doing is not a task *done*. Verify it exists where it should.

See [[plan-before-code]], [[verify-runtime-not-code-reading]].
