---
name: autonomous-continuation-pattern
description: How to run a "continue autonomously" session; the bar (scoped, reversible, cheapest first), the hard rules (autonomous auth never covers production), and the report discipline (verifiably shipped vs still a gap, never blurred).
metadata:
  type: feedback
---

When {{USER_NAME}} says "continue autonomously" / "keep going without me," this is the pattern that holds trust.

**The bar:** scoped, reversible, low-risk, high-leverage work. Cheapest unblocked items first. Stop and ASK at any architectural fork or production-touching step.

**Hard rules that survive autonomous authorization:**
1. **"Continue autonomously" is NOT explicit authorization for production-touching actions.** Surface migrations, DNS, secret rotation, and hosted-infra changes as paste-ready commands and wait for the explicit go ([[production-explicit-auth-only]]).
2. **Every "shipped" claim needs runtime evidence** (tests run, output observed) in the same breath. No code-reading-only ship claims ([[verify-runtime-not-code-reading]]).
3. **No destructive or history-rewriting operations** (force-push, hook-skipping, mass deletion) without an explicit ask.

**What to do:**
1. Verify the actual state first (logs, gates, the open-items list), then pick the cheapest unblocked item.
2. Track the work in {{USER_NAME}}'s task tracker ({{TASK_TRACKER}}): claim it, do it, runtime-verify it, close it.
3. Save state EARLY, after each completed item, not at the end. Crashed sessions only resume cleanly when the previous session logged as it went.
4. Surface the next blocker the moment you hit it; do not silently park it.

**What to surface instead of execute:** architectural forks the user has not leaned on; anything gated on counsel or an outside expert; production schema or data migrations; cost commitments; anything destructive or hard to roll back.

**Report discipline:** the final report separates "verifiably shipped" from "still a gap." Never blur that line; a false ship-claim destroys the trust autonomous mode runs on. When asked "is X done?", build the NO case first and check it ([[no-reflexive-agreement]]).

See [[production-explicit-auth-only]], [[verify-runtime-not-code-reading]], [[dont-outsource-continuation-decisions]], [[execution-discipline]], [[instruction-precedence]].
