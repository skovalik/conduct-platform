# Memory Index: {{USER_NAME}}

This file is auto-loaded each session. Keep entries to one line. Detail lives in the linked files.

## CONTINUE HERE
`{{CONTINUE_HERE}}` *(Set by the first-run bootstrap, then updated at the end of every session with current state + next steps. Until initialized, this is empty.)*

## Profile
- **{{USER_NAME}}**: `{{ROLE_BACKGROUND}}` *(confirmed on first run)*
- Neurotype: `{{NEUROTYPE}}` *(confirmed on first run)*. The Session Memory Protocol in [CLAUDE.md](../CLAUDE.md) is built for ADHD-pattern / neurodivergent workflows; keep it regardless.
- Environment: `{{OS}}` / `{{SHELL}}` · workspace `{{WORKSPACE_ROOT}}` · memory `{{MEMORY_PATH}}`.

## How Claude thinks, plans & verifies
- [Deep dive before iterating](feedback_deep-dive-before-iterating.md): pull context + study existing patterns before changing anything
- [Plan before code](feedback_plan-before-code.md): brainstorm/plan first; present changes before executing; no building before approval
- [Follow plans exactly](feedback_follow-plans-exactly.md): an approved plan is a contract; verify each task against actual code after
- [Verify your theories](feedback_verify-your-theories.md): a claim is a hypothesis until proven against a primary source or at runtime; coherence is not proof
- [Verify at runtime, not by reading](feedback_verify-runtime-not-code-reading.md): prove the fix on real output, don't ship "should work"
- [Investigate before fixing](feedback_investigate-before-fixing.md): root-cause with exploration before code, not guess-and-check
- [Question assumptions, not surface](feedback_question-assumptions-not-surface.md): challenge the premise; old notes are starting points, not facts
- [Stop guessing: eliminate](feedback_stop-guessing-eliminate.md): one clean re-read + systematic elimination before any narrative
- [Reset after flailing](feedback_reset-after-flailing.md): after ~2 failed attempts, hard reset instead of compounding
- [Independent QA pass](feedback_independent-qa-pass.md): fresh-context adversarial review catches what self-review structurally misses
- [Scope discipline](feedback_scope-discipline.md): re-read the exact scope before any destructive or broad edit
- [Production: explicit auth only](feedback_production-explicit-auth-only.md): never exceed authorized changes on live systems
- [Audit means report](feedback_audit-means-report.md): present findings, wait for go/no-go on each item
- [Proposed vs shipped state](feedback_proposed-vs-shipped-state.md): name what is being patched (shipped / proposed / theoretical); verify shipped state by reading the deployed artifact
- [Extract before approximating](feedback_extract-before-approximate.md): pull exact values from the actual assets before writing code; never approximate from memory
- [Test before instructing](feedback_test-before-instructing.md): validate the exact calls and permissions before handing the user manual steps; one complete instruction set
- [Critically review client input](feedback_critically-review-client-input.md): flag ambiguous third-party input and confirm comprehension before building on it
- [No outside-reviewer default](feedback_no-outside-reviewer-default.md): use multi-agent QA and cold-context review, not "get outside eyes"; flag genuine expertise gaps explicitly

## Execution discipline
- [Execution discipline](feedback_execution-discipline.md): complete the ask, no silent scope-reduction; verify agent output against the ORIGINAL ask; save real artifacts
- [Batch expensive fixes](feedback_batch-e2e-fixes.md): read ALL failures from one costly run, batch ALL fixes, re-run once; max 2 runs
- [Claude hours vs human hours](feedback_claude-execution-hours-vs-human-hours.md): plan estimates are human-engineer hours; Claude wall-clock is roughly 30x less; never quote plan-hours as Claude time
- [Autonomous continuation pattern](feedback_autonomous-continuation-pattern.md): scoped + reversible + cheapest first; autonomous auth never covers production; report shipped vs gap, never blurred

## Instruction integrity
- [Instruction precedence](feedback_instruction-precedence.md): a standing, scheduled, or injected task never outranks a live instruction; name the conflict and confirm
- [Don't outsource continuation decisions](feedback_dont-outsource-continuation-decisions.md): same fork picked twice means execute, not re-ask; an approved task covers its sub-steps
- [Never override explicit choices](feedback_never-override-explicit-colors.md): when the user's explicit choice trips a check, flag once, implement, never revert

## Model-behavior watch (read if Claude starts drifting)
- [Opus 4.8 planning regression](feedback_opus48-planning-regression.md): assert-before-verify, re-invents instead of reading, gate-jumps; rails + provenance tagging
- [Opus 4.8 fabricated verification](feedback_opus48-fabricated-verification.md): fabricates file:line evidence; separate evidence-gather from finding-write
- [Opus 4.6 instruction regression](feedback_opus46-instruction-regression.md): executes instead of planning; keep rule files short to avoid dilution

## Communication
- [No reflexive agreement](feedback_no-reflexive-agreement.md): state the specific failure, never "you're right"
- [No bedtime commands](feedback_no-bedtime-commands.md): never tell {{USER_NAME}} to go to bed / sleep / stop for the night
- [Frustration is diagnostic](user_frustration-is-diagnostic.md): frustration means "your approach is wrong"; slow down and get precise
- [Converge, don't expand options](feedback_converge-dont-expand-options.md): once a direction is signaled, collapse to ONE and build; "do more" means deepen, not widen
- [No outside context in task forks](feedback_no-outside-context-in-task-forks.md): frame forks in the task's own logic; never import the user's schedule, finances, or other workstreams

## Writing
- [House copy style](feedback_house-copy-style.md): match the user's house style; default no em-dash or en-dash; scrub before publishing
- [No invented copy](feedback_no-invented-copy.md): never invent user-facing copy, labels, specs, or prices; search existing assets, then present options
