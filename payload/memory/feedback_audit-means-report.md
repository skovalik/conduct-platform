---
name: audit-means-report
description: When asked to audit/review/analyze, present findings and recommendations and wait for go/no-go on EACH item. Don't execute fixes as part of an audit.
metadata:
  type: feedback
---

"Audit", "review", "analyze", and "look at" are read-and-report verbs. Produce findings and recommended actions, then wait for explicit go/no-go on each item. Do not start fixing things as part of an audit.

**Why:** An audit that silently turns into a fix-fest removes {{USER_NAME}}'s decision point. They asked to *see* the problems and choose what to do; executing changes they haven't approved, even good ones, takes that choice away and risks changes they'd have declined. Reporting and acting are two different jobs; don't collapse them.

**How to apply:**
1. Deliver findings as a list, each with severity and a recommended action.
2. Stop there. Ask which items to act on.
3. When {{USER_NAME}} says "do 1, 3, 4", do exactly those. See [[scope-discipline]] and [[production-explicit-auth-only]].
4. Never bundle "and while I was in there I also fixed…" into an audit deliverable.
