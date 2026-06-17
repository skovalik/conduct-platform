---
name: opus48-planning-regression
description: "Opus 4.8 planning failure family: assert-before-verify, re-inventing instead of reading existing work, skipping the rigor pipeline, and jumping the plan-before-build gate. Sibling to opus46-instruction-regression. Corrective protocol + provenance tagging below."
metadata:
  type: feedback
---

## The pattern
On Opus 4.8, planning sessions tend to break the rails that earlier models held. Watch for:

- **Assert-before-verify / fabrication.** Confident claims presented as fact without grounding each in a read source. (Worst form: fabricated evidence, see [[opus48-fabricated-verification]].)
- **Carrying unverified prior-session claims as load-bearing.** Repeating "we established X last session" without re-checking it against a primary source. Old notes are starting points, not facts ([[question-assumptions-not-surface]]).
- **Re-inventing instead of reading existing work.** Asked to plan something, producing a from-scratch skeleton WITHOUT first reading the existing plan/spec that already contains the map, the positioning, the templates, the measurement table, and the kill criteria. This is the deepest miss ([[deep-dive-before-iterating]]).
- **Gate-jumping.** Announcing drafting/building/deploying before any approved plan exists. Violates Golden Rules 5 & 6 and [[plan-before-code]].
- **Skipping the rigor pipeline.** Presenting a vibes-grade skeleton: zero review passes, no QA, no Verified Foundation section, no kill criteria.
- **Outsourcing decisions, then over-asking.** Opening with an A/B/C/D menu instead of thinking deeply and recommending. Think first; ask only genuine unknowns, framed with a recommended default ([[dont-outsource-continuation-decisions]]).
- **Unverified option premises.** Every option in a presented menu is a load-bearing claim. An option resting on an unchecked assumption (a terms-of-service guess, an "X already exists" relay) ships that assumption to the user as if it were vetted. Verify each option's premise before offering it.

Same family as [[opus46-instruction-regression]] (executes instead of planning), now with an added verification/quality dimension.

## The planning process these rails protect
1. **Brainstorm / deep-dive FIRST. No building.** ([[plan-before-code]])
2. **Verify the foundation BEFORE designing.** Read existing plans/specs/canonical artifacts exhaustively. Write a **Verified Foundation** section: confirmed facts WITH citations; assumptions LABELED unverified. A wrong assumption baked into line 1 is exactly what later review *cannot* catch. It gets polished, not caught.
3. **Write the plan as a doc** in your plans directory (`YYYY-MM-DD-topic.md`). Format bar: goal + trigger, the map, numbered steps with honest effort ranges, copy-paste templates, pre-empted critiques, a measurement table with kill-triggers, failure modes, and a minimum-viable tier.
4. **Multi-pass review.** Iterate the plan through distinct lenses (accuracy → completeness → sharpness → sequencing → falsifiability → adversarial → effort-honesty). Run a fabricated-number sweep **every pass**.
5. **Independent QA pass.** Fresh-context adversarial lenses catch what self-review structurally misses ([[independent-qa-pass]]).
6. **Confidence gate.** Aggregate confidence high AND all BLOCKERs cleared BEFORE execution. The multi-agent QA *is* the review.
7. **Execute** exactly to plan; verify at RUNTIME not by reading ([[verify-runtime-not-code-reading]]); present changes before anything live; save real artifacts.

## Corrective protocol (apply every planning session)
- Before any new plan: search for and read existing plans/specs on the topic. Open the work with a Verified Foundation section. No design content until it exists.
- Treat every prior-session claim as unverified until re-checked against a primary source. Label inference. Never state an unverified number or fact.
- Stay in brainstorm/plan mode until {{USER_NAME}} explicitly says execute. No drafting, building, or deploying before that.
- Build to the doc-format bar; run multi-pass review → independent QA → confidence gate → present → only then execute.
- No invented user-facing copy ([[no-invented-copy]]). No reflexive agreement ([[no-reflexive-agreement]]). Don't re-ask decisions already directed; ask only genuine unknowns.

## Added rail: provenance tagging
In any plan/report, every load-bearing claim carries its source class:
- `[read: file:line]`: you read it yourself.
- `[agent: name]`: a subagent read it; **unverified by you**.
- `[assume]`: no read.

Load-bearing `[agent]`/`[assume]` claims must be promoted to `[read]` before the plan builds on them. A subagent's read (or a prior-session note) is an unverified claim until confirmed against the primary source. This makes the costume-of-verification visible instead of hidden by fluency.
