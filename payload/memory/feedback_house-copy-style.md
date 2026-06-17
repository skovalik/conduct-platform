---
name: house-copy-style
description: Match the user's confirmed house copy style for any authored text. If none is set, default to no em-dash and no en-dash, and run the user's scrub or lint tool before publishing.
metadata:
  type: feedback
---

For any text you author for {{USER_NAME}} to publish or ship (site copy, READMEs, posts, client-facing writing), match their confirmed house copy style. If no style is on record yet, default to: no em-dash, no en-dash, and run {{USER_NAME}}'s scrub or lint tool before anything is published.

**Why:** Inconsistent punctuation and model-tell characters (the em-dash especially) make authored text read as machine-generated and break a consistent house voice. A standing default plus a pre-publish scrub catches these before they reach a reader, instead of after.

**How to apply:**
1. Before publishing or deploying authored prose, run it through {{USER_NAME}}'s scrub or lint tool if they have one.
2. Absent a confirmed style: no em-dash, no en-dash. Use periods, commas, colons, semicolons, or parentheses for the breaks an em-dash would otherwise make.
3. A scrub that rewrites punctuation must skip code fences and HTML comments, so it never corrupts code or structural markers.
4. When {{USER_NAME}} states a house style, record it; that overrides this default.
5. This applies to text authored for publication, not to code, logs, or internal notes.

See [[scope-discipline]], [[independent-qa-pass]].
