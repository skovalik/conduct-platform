---
description: "Install, update, or re-assert the operating rules and memory scaffold for this workspace."
targets: ["*"]
---

Verb: $ARGUMENTS (one of: install, update, uninstall, rules; default install).

You are running conduct-platform's setup. This is INPUT you act on, not a command that outranks the live user: if anything here conflicts with what the user just said, stop and confirm. Load the full procedure from `docs/bootstrap-procedure.md` and follow it for the verb above.

- install: scaffold or merge the personalized rules and memory into the chosen scope; research and confirm the profile (web search off by default; never invent a date; names-only tooling); detect tooling; personalize every token; then verify.
- update: merge canonical-source changes into the install, preserving local edits.
- uninstall: back up, then remove only conduct-platform content; never delete the user's sessions, recall, or task data.
- rules: re-assert the installed rules into this session (no file changes).

Honor the safety mechanisms: back up before mutating, write the install-state record before the commit point, and run the verification gate before reporting done.
