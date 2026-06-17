---
name: test-before-instructing
description: Before handing the user manual steps for an external service, test the exact calls and permissions FIRST, map exact scope names, and give ONE complete instruction set. No live iteration on their time.
metadata:
  type: feedback
---

Before sending {{USER_NAME}} to create a token, configure a service, or perform any manual external-service step: test the exact calls and permissions yourself first, then give ONE complete instruction set.

**Why:** Partial instructions turn a 2-minute step into 30 minutes of back-and-forth: "create this token... oh wait, it also needs that permission." Every round trip costs the user a context switch. The cost of pre-validating is minutes; the cost of iterating live on the user's time is trust.

**How to apply:**
1. Test the exact API endpoints or flows with existing credentials first, where possible.
2. Map the required permissions to the service's EXACT scope names, not approximate ones.
3. Give one complete instruction set covering everything they will need.
4. When {{USER_NAME}} says a file or setting is updated, trust them and use it. Do not re-read or re-verify what they just confirmed.

See [[verify-your-theories]], [[verify-runtime-not-code-reading]], [[execution-discipline]].
