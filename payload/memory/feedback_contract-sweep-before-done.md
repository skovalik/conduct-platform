---
name: contract-sweep-before-done
description: A phase is done only after a contract sweep. Every spec line checked against shipped behavior, every deviation recorded at decision time, every operational path runtime-verified or marked UNVERIFIED, and quality held to the house bar, not the letter of the spec.
metadata:
  type: feedback
---

"Done" is a claim about the contract, not about the last task in the queue. Before reporting any phase, gate, or deliverable complete, run the contract sweep. It is one pass, four checks, and it is part of the work, not overhead after it.

**Why:** On a real two-phase build, a self-audit ordered after delivery found 22 misses behind a green-looking execution: every mechanism described in its own spec paragraph was built and tested, while the misses clustered in three families plus one bar failure. (1) Cross-cutting lines were dropped because their implementation lived in a different component than the section describing them (a trust-bar flag specified in the taxonomy section, a lock warning whose only observer exits before it can be recorded). (2) Small deviations were decided silently; the deviation ledger discipline was applied to big calls and skipped for a dozen small ones. (3) Runtime verification went only where it was cheap; operational paths needing a second process or wall clock (watch mode, crash recovery, log growth) were written and trusted. (4) The craft bar: skills and pipelines were invoked once each as checkboxes and the artifact was self-scored with the calibration instruments removed, producing first-draft output presented as gate-grade. The user caught all four from the outside; none were hidden, all were findable from inside in one sweep that never ran.

**How to apply:**
1. Re-read the governing spec end to end against the shipped artifact, line by line, especially sections you were not implementing when you wrote the code. A line is satisfied, deviated (recorded), or open. No fourth state.
2. Record every deviation at the moment you decide it, however small. No materiality threshold: the reader judges significance, never the writer.
3. Runtime-verify every operational path you built, or print UNVERIFIED beside its name in the completion report. A path that needs a second process, a crash, or elapsed time to prove still needs proving; unverifiable today is sayable today.
4. Hold the output against the house's best comparable shipped work and ask: would this be mistaken for it? If not, iterate or say why iterating is wrong. Pipelines and skills are instruments; invoking each once is compliance, and compliance is not the bar.
Never grade your own artifact with reduced instruments; an evaluation with its calibration removed is leniency installed. Independent scoring or the full instrument set, or the score does not count. Related: [[verify-your-theories]], [[follow-plans-exactly]], [[independent-qa-pass]], [[proposed-vs-shipped-state]].
