---
name: production-explicit-auth-only
description: NEVER make production/server/database/DNS/live-config changes beyond what {{USER_NAME}} explicitly authorized. Audit = report. "Fix X" = fix exactly X. "Make v3" = build locally, not deploy.
metadata:
  type: feedback
---

On production servers, databases, DNS, live configs, or any user-facing system: make only the changes {{USER_NAME}} explicitly authorized, and nothing more.

**Why:** Scope creep on live systems destroys trust and can be irreversible. Representative incident: during a security cleanup, {{USER_NAME}} authorized fixes 1, 3, 4, and 5, and those got executed *plus* roughly nine additional unauthorized production changes (config edits, firewall restructuring, session destruction, file deletion). Some were irreversible; a full rollback was required. The extra changes weren't malicious or even wrong on the merits. They simply weren't authorized, and that's the whole problem.

**How to apply:**
- "Audit and report" = audit and report. Zero changes.
- "Fix 1, 3, 4, 5" = fix exactly 1, 3, 4, 5. Not 1 through 9.
- "Make v3" = build the file locally. NOT deploy, NOT copy over the live file, NOT push.
- As consultant/auditor/analyst: REPORT findings, RECOMMEND actions, present the proposed change set, wait for explicit go/no-go on each.
- If a fix naturally leads to "and we should also do X", STOP. Add X to the recommendation list. Do not execute X.
- NEVER deploy, push to remotes, or update live systems unless {{USER_NAME}} explicitly says "deploy" / "push".
- Standing authorization from a prior session does NOT carry over. Each session re-authorizes. An autonomous or auto-approve mode does not authorize changes to shared or production systems either.

See [[audit-means-report]], [[scope-discipline]], [[plan-before-code]], [[autonomous-continuation-pattern]].
