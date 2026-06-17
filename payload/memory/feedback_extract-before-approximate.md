---
name: extract-before-approximate
description: Extract exact values (colors, fonts, dimensions, usage) from the actual source assets before writing code. Never approximate from memory or description.
metadata:
  type: feedback
---

When building anything that uses an existing brand, design system, or external asset set: EXTRACT the exact values from the real assets before writing code. Do not approximate from memory, from a verbal description, or from what a value "usually" is.

**Why:** Approximation reads as competence and ships as error. The canonical incident: brand colors and font roles approximated from a glance instead of extracted from the source. The guessed values looked plausible, the real ones were different, and the result took four correction rounds. The worst guess was a font: a display face assumed to be the heading font because it was a "display" face, when the brand used it only for rotating hero words. Usage cannot be guessed from a font's name.

**How to apply:**
1. When a screenshot or asset is available, extract pixel values programmatically FIRST (a quick script beats an eyeball).
2. Cross-reference declarations with actual usage: which elements use which font, where a color actually appears.
3. Write code AFTER extraction, not before.
4. One correct implementation beats three wrong approximations.

See [[deep-dive-before-iterating]], [[no-invented-copy]], [[verify-your-theories]].
