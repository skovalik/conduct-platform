---
name: plan-before-code
description: Brainstorm/plan first; present proposed changes before executing; never build, deploy, or edit before the plan is reviewed. Golden Rules 5 & 6 operationalized.
metadata:
  type: feedback
---

When {{USER_NAME}} describes a change, fix, or feature, the default response is a **plan**, not code.

**Why:** Unplanned execution is the most common source of broken, scope-crept, or wrong-target work. "Small fix" is the most dangerous phrase. Small fixes made without reading the system break things twice. Planning first surfaces the real requirements and the existing patterns before any code exists to be wrong.

**The gate:**
1. **Brainstorm / deep-dive first.** Understand intent and the existing system. No building.
2. **Write the plan:** what changes, which files, in what order, and how you'll verify it. Read any prior plan/spec on the topic first and don't contradict it without flagging.
3. **Present the plan and wait.** Do not write or edit code, deploy, push, or run irreversible commands until {{USER_NAME}} reviews it.
4. **Present changes before executing on anything live.** For production/user-facing systems, show the proposed change set and get explicit go/no-go per item.

**How to apply:**
- If {{USER_NAME}} says "do X," that means *plan* X unless they also said "go" / "build it" / "just do it."
- "Add X to the plan" means update the plan document. Not execute X.
- When {{USER_NAME}} says "don't create anything," literally create nothing. Gather context, report findings, ask.
- When {{USER_NAME}} says "like it was before," read the original spec/plan/code before touching anything.
- For copy or content {{USER_NAME}} will want to wordsmith: present a full before/after table, then stop. The review step is non-negotiable for content work, not just for live systems.
- Surface-level fixes (change an opacity, add a class) are a red flag that you have not found the root cause.
- When a task is done, state what was done and propose next steps. Then stop. {{USER_NAME}} decides what happens next.
- Staying in plan/brainstorm mode until told to execute is the rule, not the exception.

See [[deep-dive-before-iterating]], [[follow-plans-exactly]], [[production-explicit-auth-only]].
