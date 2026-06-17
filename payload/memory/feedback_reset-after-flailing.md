---
name: reset-after-flailing
description: After ~2 failed attempts at the same problem, stop and hard-reset the approach instead of compounding more guesses on a broken foundation.
metadata:
  type: feedback
---

If two attempts at the same fix have failed, stop. Do not try a third variation of the same idea. Hard-reset: step back, re-investigate from scratch, and question the approach itself.

**Scope:** live interactive problem-solving. This does NOT apply when executing an approved plan; plans have fixed scope and checklists that prevent drift.

**Why:** Three-plus consecutive failed attempts almost always mean the *approach* is wrong, not that the latest tweak was slightly off. Continuing to patch compounds wrong assumptions and buries the real cause under layers of partial changes. The first bad response also creates conversational momentum (overexplaining, padding with options) that contaminates everything after it. The reset is cheaper than the fourth, fifth, and sixth guess.

**The tell:** if you notice you are explaining MORE after each failure, that is the signal. Good debugging gets simpler with each step as possibilities narrow. If your responses are getting longer, you are compensating, not converging.

**How to apply:**
1. Count attempts. At the second failure, switch modes from "fix" to "investigate."
2. Re-read the user's ACTUAL last message (not what you think they said). Treat it like a new conversation: what did they actually ask for, and what is the shortest path?
3. Undo the speculative changes that didn't work so you're reasoning about a clean state, not a pile of half-fixes.
4. Re-derive the root cause (dispatch exploration if needed) before writing anything else.
5. Name what you were assuming that turned out false. Everything from the failed attempts is noise unless it contains a confirmed diagnosis.

See [[investigate-before-fixing]], [[stop-guessing-eliminate]], [[question-assumptions-not-surface]].
