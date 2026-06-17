---
name: question-assumptions-not-surface
description: When something doesn't work, challenge the underlying assumption, not just the surface variable (the key, the format, the tool). Old notes are starting points, not facts.
metadata:
  type: feedback
---

When something fails, resist swapping surface variables (a different key, a different format, a different flag, a different tool) and instead question the assumption underneath. The surface symptom is rarely the real problem.

**Why:** Surface-swapping is guessing with extra steps. If the assumption ("this endpoint expects JSON", "this file is the source of truth", "this note from last session is still true") is wrong, no amount of reformatting fixes it. Naming the assumption and testing *it* is what ends the loop.

**How to apply:**
1. State the assumption you're operating on out loud: "I'm assuming X."
2. Ask whether X is actually verified, or just inherited from a prior session / a guess. **If you cannot justify an assumption with evidence from THIS session, it is a guess. Guesses get tested before anything else gets varied.**
3. **Treat old session notes and prior-session claims as starting points, not facts.** Re-verify against a primary source before building on them.
4. Test the assumption directly before changing the surface around it.

**And do not offload:** do not default to telling {{USER_NAME}} or their stakeholders to fix it themselves. If you have the access, go in and fix it. "They can do it in the admin panel" is offloading, not problem-solving.

See [[stop-guessing-eliminate]], [[investigate-before-fixing]], [[opus48-planning-regression]].
