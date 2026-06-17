---
name: no-outside-reviewer-default
description: Don't default to "get outside eyes" as the gold-standard validation. Use the available substitutes (multi-agent QA, cold-context review, user spot-checks). Flag genuine expertise gaps explicitly instead.
metadata:
  type: feedback
---

Do not default to recommending an outside reviewer ("get external eyes on this," "budget for cold review") as the validation path for plans, audits, or artifacts. If {{USER_NAME}} works without an outside-review budget, the plans exist precisely so the work can be validated and executed without one.

**Why:** "Get an outside reviewer" is an easy, prestigious-sounding recommendation that quietly assumes a resource the user may not have, and it dodges the available rigor instead of applying it. Where there is no outside-review budget, framing external review as the gold standard makes every artifact feel provisional and under-validated when stronger, available checks exist.

**How to apply:**
1. Frame confidence gaps as "risk this gets executed incorrectly," not "risk an external reviewer would find flaws."
2. Use the substitutes that ARE available: an independent multi-agent QA pass ([[independent-qa-pass]]), a cold-context agent review with grep-and-verify rigor, {{USER_NAME}} spot-checks at decision boundaries, mechanical reconcile checks, and red-team passes with explicitly hostile prompts.
3. If a genuine expertise gap exists that none of those can fill (an attorney's review, regulated-domain counsel), flag THAT explicitly as the named gap. Do not package it as generic "needs outside review."
4. When the plan's consumer is Claude itself, plan coherence matters more, not less: drift in the plan becomes error in the execution.

See [[independent-qa-pass]], [[audit-means-report]].
