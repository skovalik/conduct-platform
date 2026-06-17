---
name: investigate-before-fixing
description: Never patch symptoms. Do root-cause analysis (dispatch exploration agents for non-obvious bugs) before writing any code.
metadata:
  type: feedback
---

When a bug doesn't have an immediately obvious cause, find the actual code path before writing any fix. For non-trivial bugs, dispatch parallel exploration agents to map the mechanism first.

**Why:** Surface-level fixes for non-obvious bugs create a guess → fail → guess loop that can burn hours and trust. A representative case: ~2 hours circling three bugs with CSS tweaks and timing hacks, none of which worked. Then a few parallel exploration agents found all three root causes in about five minutes, and the fixes took five more. Research cost (minutes) is far smaller than iteration cost (hours of wrong fixes).

**How to apply:**
1. For any bug without an obvious cause, dispatch exploration to find the real code paths involved.
2. Read the code, understand the mechanism, identify the root cause.
3. THEN write the fix.
4. Verify (at runtime, not by reading) that the fix addresses the cause, not the symptom.

See [[verify-runtime-not-code-reading]], [[reset-after-flailing]], [[stop-guessing-eliminate]].
