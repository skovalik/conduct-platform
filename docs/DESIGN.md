<!-- conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE). -->

# conduct-platform: design

conduct-platform clones one opinionated context-engineering workspace onto any agent harness, on any OS, privately, and teaches the user to work it. It is the cross-platform successor to conduct (Claude Code only). This document states what it is and the properties it is built to demonstrate.

## Thesis

A reviewer reading this file, the README, and the source should be able to cite evidence for four properties:

1. **Honest.** conduct-platform never fabricates a fact about the user. The bootstrap researches with web search off by default, confirms every fact, never invents a date, and inventories tooling names-only. The coverage matrix carries an honest verification stamp per harness; only Claude Code is runtime-verified locally, and nothing claims more than it has earned.
2. **Verifiable.** Claims are runtime-proven, not asserted. The engine is unit-tested and the suite runs cross-OS in CI. The install ends in a verification gate that must pass before the install is marked complete.
3. **Reusable.** One canonical source serves every harness. The AGENTS.md floor plus a generator emit per harness; the owned engine (lifecycle, manifest, onboarding) is platform-agnostic.
4. **Private.** conduct-platform is a tokenized, name-free projection of the author's live workspace. No private name or secret reaches the public repo: personal facts are tokens, and only generic structure and name-free exemplars ship.

## Architecture (three layers)

1. **Canonical source.** Tokenized, generic rules, commands, hooks, skills, subagents, MCP config, the memory scaffold, and name-free exemplars. Personal facts are tokens, filled per user.
2. **Emission.** The AGENTS.md floor reaches every AGENTS.md-reading harness; a generator (rulesync) emits the richer components per harness; conduct-platform owns minimal Codex and Antigravity emitters as a fallback so the core never depends on the generator. Substitution is tokenize-last with a per-format escaper.
3. **The engine.** The interactive bootstrap, the lifecycle and state engine, the dependency manifest with per-OS detection, the memory scaffold with exemplars, and the transfer and onboarding layer.

## Derivation

conduct-platform is not authored separately from the author's real setup; it is a tokenized, name-free projection of it, refreshed by a one-way promote sync (your machine to the repo). The rules, the protocol, the tool manifest, and the structure sync; the content (real sessions, wiki, recall, tasks, and any client or project name) never does.

## Two lessons baked in

- **Marker-free, out-of-band state.** conduct's whole lifecycle hung on `KIT_STATUS` and `conduct:block` HTML-comment markers, which the Claude Code harness strips and other harnesses do not. That does not generalize. conduct-platform moves all state to an out-of-band install record and locates owned regions by recorded content, so merge and uninstall depend on no harness comment behavior.
- **Tokenize-last with a per-format escaper.** Substituting token values into already-emitted native artifacts, escaped per format, sidesteps the bash `${var//pat/repl}` escaper that silently mangles backslashes in a Windows path under bash 5.2. The escaper is TypeScript, not a shell, and a round-trip test guards it.

## Provenance

conduct-platform was authored by Stefan Kovalik and generalized from his own working setup. The author credit is contact attribution, not product branding; conduct-platform is community-generic and MIT-licensed.
