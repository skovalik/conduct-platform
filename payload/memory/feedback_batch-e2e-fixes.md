---
name: batch-e2e-fixes
description: For any expensive verification loop (E2E suites, long builds, deploy cycles): read ALL failures from one run, batch ALL fixes, re-run once. Never fix-run-fix-run. Max 2 runs.
metadata:
  type: feedback
---

When a verification step is expensive (an end-to-end test suite, a long build, a deploy cycle), batch every fix from one run before triggering the next. Never iterate one failure at a time.

**Why:** An E2E suite that launches an app instance per test costs minutes and resources per run. Five fix-run cycles multiply that into twenty-plus minutes of wall time and an enormous waste of compute for what one batched pass would have caught. The one-at-a-time loop feels productive and is the most expensive possible way to use an expensive check.

**How to apply:**
1. After the first run, read ALL the failure output (every error, every artifact or screenshot), not just the first failure.
2. Diagnose every failure, make every fix, in one batch.
3. Re-run once to verify. If failures remain, batch again.
4. Maximum 2 runs per fix cycle. A third run means the diagnosis was wrong; stop and investigate instead ([[reset-after-flailing]]).

See [[verify-runtime-not-code-reading]], [[reset-after-flailing]], [[execution-discipline]].
