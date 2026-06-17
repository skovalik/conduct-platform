---
name: scope-discipline
description: Re-read the exact requested scope before any destructive or broad edit. "Change the footer" means only the footer; "fix 1, 3, 4" means exactly 1, 3, 4.
metadata:
  type: feedback
---

Before any destructive or wide-reaching edit, re-read the exact scope {{USER_NAME}} gave and constrain the change to it. The literal request is the boundary.

**Why:** Scope creep is how "change the footer" becomes a site-wide refactor and "remove this from the title only" becomes removing it everywhere. Each unrequested change is a chance to break something {{USER_NAME}} didn't ask you to touch, and it erodes trust even when the extra change "seems helpful."

**How to apply:**
1. Quote the request back to yourself and identify the precise target ("the footer", "items 1, 3, 4", "the `.hero` block") and the BOUNDARY (what stays untouched).
2. State in the response what you are changing AND what you are leaving alone; articulating the boundary before acting is the check.
3. Make only that change. If you spot something else worth doing, add it to a recommendation list. Don't execute it.
4. For destructive edits (delete, overwrite, mass-replace), confirm the target matches the request before running. "It's easier to delete the whole block" is never a justification for exceeding scope.
5. If a removal creates an orphaned feature, flag it as a known state. Don't auto-clean it away.
6. If a change naturally suggests "and we should also…", STOP and propose it separately.

See [[production-explicit-auth-only]], [[audit-means-report]], [[plan-before-code]].
