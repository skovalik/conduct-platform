---
name: no-invented-copy
description: Never invent user-facing copy, labels, specs, prices, or tier details. Search the user's existing assets first; if it does not exist, present 2-3 options to pick from.
metadata:
  type: feedback
---

Before writing ANY user-facing text (copy, labels, descriptions, error messages, specs, naming, pricing, tier details), check {{USER_NAME}}'s existing assets first: the deployed properties, then the source files. If the text does not exist anywhere, present 2 or 3 options for {{USER_NAME}} to choose from. Never invent user-facing content and write it straight into the artifact.

**Why:** Invented copy ships wrong facts with confident wording: a tier description for the wrong product, clinical labels where the site uses friendly ones, plan limits that match no real spec, and marketing phrases that read as generic filler. Each invention becomes a correction round. The rule is universal; every product has canonical copy somewhere, and the job is to find it, not to improvise it.

**How to apply:**
1. Search the deployed assets for the string or its canonical form.
2. Search the source files.
3. If it genuinely does not exist, present 2 or 3 candidate options and let {{USER_NAME}} pick. Do not write your own choice directly into code or content.

See [[extract-before-approximate]], [[house-copy-style]], [[opus48-planning-regression]].
