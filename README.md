<!-- conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE). -->

# conduct-platform

**conduct-platform is my AI coding workspace, calibrated over six months across many projects.** It turns a tool that vibes and vapors into one that gives you the output you actually came for, through prompt engineering, context engineering, and orchestration (plan, QA, polish), wired into one setup and portable to any AI coding tool.

Under it: operating rules that make the model plan before it codes and verify before it claims done, and layered memory so context survives between sessions, generated into each tool's native format. You start from a calibrated workspace instead of a blank prompt.

Setup does more than drop files in. It ends with a guided first run through one real research, plan, and implement loop, so you can work this way from day one. Done means you can run it yourself, not that the files landed.

It is the cross-platform successor to [conduct](https://github.com/skovalik/conduct), which does the same for Claude Code alone.

## What you get

- **The operating rules**: conduct's 8 Golden Rules, the Anti-Sycophancy Protocol, and the Session Memory Protocol (the always-loaded payload).
- **The layered memory**: the on-demand "how the agent thinks and verifies" files, cross-linked and loaded only when referenced, plus a memory scaffold with name-free exemplars.
- **The guided first run**: a walkthrough of the loop once, with you, ending in your first session snapshot and wiki page.

## Companion tools (offered during setup, not bundled)

conduct-platform does not ship other people's tools. Setup detects what you already have and offers the ones that pair well, install-with-consent or skip-with-instructions, so you decide what to add:

- **Suggested first**: cross-session recall (a searchable memory of past work) and an issue tracker. These two make the memory protocol and the planning loop pay off.
- **Offered as you hit the need**: symbol-level code navigation, current library docs, fan-out research, parallel code review, a design-evaluation pass, and a TDD and debugging workflow pack, among others.

All optional, all external. conduct-platform wires up whatever you accept and points you to install steps for the rest. None of it is required to run the rules and memory.

## How it is shaped (three layers)

1. **Canonical source.** One tokenized, generic source: rules, commands, hooks, skills, subagents, MCP config, the memory scaffold, and name-free exemplars. Personal facts are tokens (`{{USER_NAME}}` and the like), filled per user, never assumed. It is a tokenized, name-free projection of the author's live workspace.
2. **Emission.** How the source reaches each harness. The **AGENTS.md floor** reaches every AGENTS.md-reading harness with zero per-tool work; a **generator** (rulesync) emits the richer components (rules, commands, subagents, MCP) into each harness's native layout (`.codex/`, `.gemini/`, `.claude/`). conduct-platform keeps its own minimal Codex and Antigravity emitters as a fallback, so the core never depends on the generator. Substitution is **tokenize-last**: emit the native artifacts first, then fill token values with a per-format escaper.
3. **The engine.** conduct-platform's own, platform-agnostic value: the interactive bootstrap, the lifecycle and state engine, the dependency manifest with per-OS detection (which powers the companion-tool offers), the memory scaffold with exemplars, and the onboarding layer.

## How it works (install flow)

1. You run setup on your harness. It detects your OS, your harness, and your installed tooling (names only, never secrets), and offers the companion tools that pair well.
2. It emits the rules payload per harness (the AGENTS.md floor plus the generator), then personalizes every token to you.
3. The **lifecycle engine** writes the artifacts, **merging into any files you already own** (an existing AGENTS.md, settings.json, or config.toml is merged, never overwritten), records everything in an out-of-band install-state record, and writes in a crash-safe order so an interrupted install is resumable or cleanly rolled back. Boundaries are tracked by content, not by in-file markers, so this does not depend on any harness's comment behavior.
4. A guided first run walks you through one real research, then plan, then implement loop. The plan is validated by three loops: ralph ("will this work"), PFD ("will this make sense"), and the QA pipeline ("will this build"). It ends by writing your first session snapshot and wiki page with you.

## Cross-platform support

Every flagship LLM is in scope, reached through whatever harness drives it (Claude Code, Codex, Antigravity, Cursor, Cline, opencode, and more, plus local models). The only per-platform variation is graceful feature degradation (a harness with no startup hook gets an AGENTS.md banner instead of a reminder) and an honest verification-confidence stamp per target. See `docs/` for the coverage matrix.

## Privacy

conduct-platform ships generic structure and name-free exemplars, never real content. Personal facts are tokens (`{{USER_NAME}}` and the like) that you fill at install; nothing about you is assumed or hard-coded. The example sessions, memory, and wiki entries are illustrative, not real data.

## Status

Pre-release. Built and verified cross-OS (Windows, macOS, Linux CI green): the lifecycle and state engine, the emission layer, the dependency manifest and installer, the owned Codex and Antigravity emitters, the full rule corpus from conduct, the onboarding layer, and the close-out protocol. Pending: non-Claude runtime verification by the first user, an automated one-way promote sync from the maintainer's workspace (the manual workflow is documented in [MAINTAINING.md](MAINTAINING.md)), and a single command that runs the whole install.

## License

MIT. See [LICENSE](LICENSE).
