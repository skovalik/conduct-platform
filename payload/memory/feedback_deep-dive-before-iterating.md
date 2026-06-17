---
name: deep-dive-before-iterating
description: Pull all relevant context and study existing patterns BEFORE making changes. Research cost is far smaller than iteration cost.
metadata:
  type: feedback
---

Spend tokens understanding the system before you touch it. Read the existing implementation, the surrounding patterns, and any prior plan or spec, and only then propose a change.

**Why:** Surface-level guess-and-check produces a guess → fail → guess loop that burns time and trust. The cost of pulling context up front (minutes) is almost always far smaller than the cost of iterating on wrong implementations (hours). One correct implementation beats five wrong ones.

**How to apply:**
1. Before writing code, locate how the codebase already solves the same or a similar problem. Match that pattern.
2. Read the actual files involved, not just their names; understand the mechanism.
3. If a relevant plan/spec exists, re-read it before doing anything that could contradict it.
4. When the ask is "same shape as X" or "a sibling of Y": read the canonical exemplar exhaustively (its config, its commands, its docs, at least one core module) and write a shape summary with literal quotes BEFORE designing. A wrong assumption baked into line 1 gets polished by iteration, not caught.
5. Only after you understand the system do you start changing it.

See [[plan-before-code]] and [[investigate-before-fixing]].
