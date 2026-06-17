---
name: independent-qa-pass
description: After any self-converged work (an iterated plan, spec, or audit), run a fresh-context multi-agent QA pass before trusting its confidence claim. Self-review has a structural blindspot.
metadata:
  type: feedback
---

After Claude iterates on a plan/spec/audit to "convergence" and reports high confidence, run an **independent QA pass** (several fresh-context agents, each with a distinct adversarial lens) before accepting that confidence. Self-review structurally cannot catch some classes of defect.

**Why:** Iterative self-review measures internal consistency and completeness well, but it has a blindspot for its own errors. In practice, work that self-review rated ~90%+ has repeatedly had multiple build-blocking defects surfaced on the *first* round of fresh-eye review: missing imports, regex edge cases, version incompatibilities, path/security issues, and "documentation-code drift" (the fix-log claims something was wired that wasn't). Fresh context with a different lens sees what the author-context normalized away.

**How to apply:**
1. Spawn N parallel agents (typically ~5), each reading the artifact in fresh context with one lens. Pick lenses to fit the artifact, e.g.:
   - Code correctness (bugs, types, imports, off-by-one, regex edges)
   - Integration/contract consistency (signatures, config keys, file paths, schemas across boundaries)
   - Adversarial security (what the existing safety primitives *don't* catch)
   - Failure modes & edge cases (imperfect inputs, partial writes, concurrency, resource exhaustion)
   - Production readiness (observability, recovery, deploy/upgrade path)
2. **Write each lens prompt as a structured taxonomy** (30 or more lines: lens scope, non-scope, specific failure-mode classes, output format). Vibes-grade prompts (a few comma-separated topics) produce vibes-grade findings.
3. Use a 3-tier severity ladder: **BLOCKER / MAJOR / MINOR**. If undecided between MAJOR and BLOCKER, call it BLOCKER and let {{USER_NAME}} demote.
4. Don't trust any single agent's self-reported confidence. Cross-lens dispersion is the real signal. A lone agent reporting 99% (or 0%) is an outlier, not ground truth. As a quantitative gate: breach when the minimum coverage falls more than 25 points below the median, or the cross-lens range exceeds 25 points; a breach means re-dispatch, not accept.
5. On Round 2 and later, give the agents the prior rounds' findings so they dedup instead of rediscovering.
6. **Stop criterion (saturation):** when a round yields fewer than ~2 genuinely-new findings and all remaining are below BLOCKER. Better ROI after saturation: execute a thin slice of the plan against real code; runtime catches what static review cannot.
7. **When the artifact IS code** (shell/script/regex interop), this pattern doesn't converge by re-reading. Build the substrate, run it against fixtures, and fix by re-running (Golden Rule 7).

**What self-review misses specifically:** code-as-written correctness; drift introduced *during* the loop; adversarial edge cases the plan never considered; "vapor landing" (a function body shipped without wiring its callers/CLI/tests); "meta-vapor" (the iteration log claims a fix that silently failed; verify with grep, not with the log).

**Vapor-landing check (every fix round):** for each added symbol, verify it is called from where it should be called (grep the call sites), wired into the CLI or dispatch if relevant, exposed in the user-facing surface if relevant, and exercised by at least one test.

See [[verify-runtime-not-code-reading]], [[opus48-planning-regression]].
