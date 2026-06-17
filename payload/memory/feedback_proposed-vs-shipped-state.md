---
name: proposed-vs-shipped-state
description: When claiming a fix or describing a defect, name the state precisely. Shipped-on-production, proposed-in-a-draft, or theoretical risk. Verify shipped state by reading the deployed artifact.
metadata:
  type: feedback
---

When proposing a fix or describing a problem, name the actual state involved: "currently shipped on production surface X" versus "proposed in plan or draft Y" versus "forward-looking risk if we do Z." Never conflate them in the language of the fix.

**Why:** "Fixed: the README leaked client names" reads as a retrospective patch of a live defect. If the leak only ever existed in a draft plan, the claim misdescribes reality, and a precise reader will ask "where is that on the live site?" and find nothing. Sloppy state references make real fixes look fabricated and train the reader to distrust every claim.

**How to apply:**
1. Before writing "Fix N: surface X had problem Y," verify whether X is actually shipped or only proposed in a draft, plan, or spec.
2. Use precise tense and surface labels: "the PROPOSED list in the plan," "when step 1 ships," "the current production state," "a theoretical risk if we add Z."
3. For iterations on a planning document, all fixes are forward-looking by default. Do not present them as retrospective patches unless you verified the defect exists on a shipped surface.
4. To verify shipped state, read the deployed artifact (grep the live file, fetch the page). Memory of "I added it in pass 6" is not the same as "it is deployed."

See [[verify-your-theories]], [[opus48-fabricated-verification]], [[verify-runtime-not-code-reading]].
