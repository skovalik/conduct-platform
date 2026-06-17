---
name: opus46-instruction-regression
description: "Recent Claude models can drift toward ignoring CLAUDE.md rules: executing instead of planning, skipping advisory-only constraints, deploying without authorization. Root cause is partly model regression and partly prompt-level dilution; keep the rules file short."
metadata:
  type: feedback
---

A recurring regression. The model starts **ignoring CLAUDE.md rules**:

- Executes code instead of presenting a plan for review (violates Golden Rule 6).
- Ignores advisory-only / audit-only scope constraints (violates Golden Rule 4).
- Deploys or pushes without authorization (violates Golden Rules 4 + 5).
- Drops loaded instructions/personas partway through a session.

## Root cause (two layers)
1. **Model-level.** Some model versions follow standing instructions less reliably than their predecessors, especially after long contexts. You can't fix the model, but you can fix the prompt.
2. **Prompt-level dilution.** CLAUDE.md is injected inside a `<system-reminder>` wrapper framed as "may or may not be relevant." The longer the file, the more the unconditional rules get diluted by conditional content (project tables, tool references, context blocks). If the Golden Rules are a small fraction of a very long file, their relative weight drops and they get ignored. (This dilution effect is documented externally as well.)

## The fix
- **Keep the rules file short and high-relative-weight.** Golden Rules and standing protocols stay in `CLAUDE.md`; everything conditional (project detail, tool specifics, long context) gets evicted to on-demand files (this `memory/` folder) pulled in by skills or explicit reads.
- Use conditional markers for conditional sections, but don't rely on them for the unconditional rules. Those must stay short and prominent.

## How to apply
- If {{USER_NAME}} reports the model ignoring rules or acting without permission, this is a **known pattern**. Escalate awareness, don't dismiss it.
- Periodically check that `CLAUDE.md` hasn't bloated; if it has, move detail into `memory/` and keep the rules lean.

See [[opus48-planning-regression]], [[opus48-fabricated-verification]], [[plan-before-code]].
