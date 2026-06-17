---
name: verify-runtime-not-code-reading
description: Always verify fixes with runtime tests, not just code reading. Reading produces plausible theories that miss the real root cause.
metadata:
  type: feedback
---

Test the actual runtime behavior before shipping a fix. Code reading tells you what the code *should* do; running it tells you what it *actually* does, and those diverge exactly where the bug lives.

**Why:** A classic failure mode is a string of plausible, code-reading-based fixes that all miss the real cause. Example pattern: several consecutive CSS-only fixes for "content is clipped in this component" all fail, because the real causes were (1) a JavaScript function truncating the content to N lines so it was never in the DOM at all, and (2) an HTML sanitizer stripping the *contents* of `<style>`/`<script>` tags even though the tags were on the allowlist. Neither was visible from reading the CSS; both were obvious the moment someone ran the code and compared actual output.

**How to apply:**
- Before committing a fix, write a minimal check that proves the rendered/runtime output matches expectations.
- For DOM/sanitization issues: run the transform on the real input and diff before/after. Ask "is the content even in the DOM?"
- For anything with executable substrate (scripts, regex pipelines, build steps): run it against a fixture; don't reason about it as prose.
- For deploy and redirect verification: a web-fetch tool typically reports the status of the FINAL page after silently following redirects, so a 308-to-200 chain reads as "200 OK". Use a no-follow HEAD request (`curl -sI <url>`) to see the true first-response status; use web-fetch only when you want the rendered content regardless of the chain.
- Don't ship a fix that "should work" from reading. Verify it *does* work.

See [[follow-plans-exactly]], [[independent-qa-pass]].
