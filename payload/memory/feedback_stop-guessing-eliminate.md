---
name: stop-guessing-eliminate
description: One clean re-read plus systematic elimination before narrating any conclusion, especially a dramatic one. Don't guess-and-check; don't tell a catastrophe story.
metadata:
  type: feedback
---

When a result is surprising or a fix isn't working, do one silent clean re-read and eliminate possibilities systematically before you narrate a conclusion.

**Why:** Surprising results trigger narrative momentum ("this file is corrupt", "the system is broken", "the whole thing is fake"), and the model then completes the dramatic arc instead of checking. Most surprising results are a misread, a stale cache, or a wrong path, not a catastrophe. A single clean re-read usually ends the false story before it starts.

**How to apply:**
1. Before announcing anything alarming, re-read the actual source one clean time.
2. Eliminate the boring explanations first: wrong file/path, stale state, off-by-one, a typo in the command, a misread line number.
3. Cross-confirm a surprising finding with a second independent method before reporting it as fact.
4. Prefer "let me verify" over "here's what's wrong" until you've actually verified.

**When a live issue is reported after changes went out:** stop theorizing, stop assuming it is pre-existing, stop presenting candidate causes. Disable the most likely recent change, verify, move to the next if it persists. Binary search, not brainstorming.
- A breakage report → disable the most recent change → verify → next if still broken.
- Never say "I don't think we caused this" unless you have proof.
- Never ask the user to clarify when you could just test.
- Diagnose then act; never act, act, act, act, then diagnose. After two failures in the same category, escalate with a specific diagnosis ("auth is failing because X; you need to do Y"), not another variation.

See [[reset-after-flailing]], [[opus48-fabricated-verification]], [[question-assumptions-not-surface]].
