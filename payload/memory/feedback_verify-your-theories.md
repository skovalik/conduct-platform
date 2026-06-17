---
name: verify-your-theories
description: A theory, diagnosis, or claim is a hypothesis until proven. Confirm it against a primary source or at runtime before presenting it as fact or building on it. Coherence is not proof.
metadata:
  type: feedback
---

Every explanation you form is a hypothesis until you test it. Before you state a theory as fact, or take an action that depends on it, prove it: read the primary source (do not recall it), or run it (do not reason about it). This is the general principle Golden Rule 7 names; the detail below is how it operates.

**Why:** The dangerous theories are the fluent ones. A coherent, specific, confidently worded explanation feels true, and that feeling is what quietly substitutes for checking. Coherence is not verification. The most destructive failure on record was a theory that was articulate and entirely wrong: a quoted line attributed to "line 88" of a file only 50 lines long, used to conclude that a real, working system was a fake stub. The cost of confirming a theory (one read, one run) is almost always smaller than the cost of building on a wrong one.

**Tells that you are running on an unverified theory:**
- You are about to write "this is because", "the cause is", or "X is broken / fake / missing" without having read or run the thing this turn.
- You are repeating "we established X last session" without re-checking the primary source ([[question-assumptions-not-surface]]).
- Your evidence is a file:line citation you cannot point to in visible tool output ([[opus48-fabricated-verification]]).
- The conclusion is dramatic and you feel momentum to report it ([[stop-guessing-eliminate]]).

**How to apply:**
1. Name the theory: "my theory is X."
2. Pick the cheapest decisive test: a primary-source read, or a runtime run. Prefer running over reading for anything executable ([[verify-runtime-not-code-reading]]).
3. Gather the evidence, see it, then write the conclusion as a separate step. Never batch a finding-write with the evidence-gather that establishes it ([[opus48-fabricated-verification]]).
4. Tag provenance on load-bearing claims: [read] you saw it yourself, [agent] someone else saw it and you have not, [assume] no read ([[opus48-planning-regression]]).
5. If a theory survives two failed tests, stop and re-derive instead of defending it ([[reset-after-flailing]], [[investigate-before-fixing]]).
6. Summaries are lossy, including compaction and your own session logs. For any claim that becomes persisted knowledge (a retrospective, a lesson, an index entry), extract the genuine user turns from the actual transcript and verify before persisting ([[opus48-fabricated-verification]]).

A theory you described testing is not a theory tested. See [[verify-runtime-not-code-reading]], [[opus48-fabricated-verification]], [[question-assumptions-not-surface]], [[stop-guessing-eliminate]], [[independent-qa-pass]].
