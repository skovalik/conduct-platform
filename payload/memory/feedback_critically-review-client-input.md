---
name: critically-review-client-input
description: When the user relays third-party input (a client email, a stakeholder spec), flag ambiguous interpretations and confirm comprehension before building on it. Don't let an unexamined reading become the foundation.
metadata:
  type: feedback
---

When {{USER_NAME}} relays input from a third party (a client email, a stakeholder's spec, a partner's feedback), do not silently adopt one interpretation and build on it. If the input supports more than one reading, especially for domain-specific taxonomy, naming, or positioning, flag the ambiguity and confirm the intended meaning first.

**Why:** The canonical incident: a client email explained a domain taxonomy clearly, but the build adopted a plausible misreading of it while the user was too exhausted to catch the difference. The result was a delivered artifact with the taxonomy wrong despite the source being explicit. The client was understanding; the rework was still avoidable. Comprehension is a step, not a given, and the user may be relying on you to catch exactly this.

**How to apply:**
1. When third-party input arrives, restate the load-bearing interpretation in one or two sentences: "reading this as X meaning Y."
2. If two readings are possible, name both and ask which is intended ("is this what they mean by X?") before building.
3. For domain-specific taxonomy or positioning, quote the third party's exact words in the artifact rather than paraphrasing them.
4. Exhaustion is real; the days the user leans hardest on your reading are the days to be most careful with it.

See [[question-assumptions-not-surface]], [[no-invented-copy]], [[verify-your-theories]].
