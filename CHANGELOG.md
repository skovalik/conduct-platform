<!-- conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE). -->

# Changelog

All notable changes to conduct-platform. The release helper (`scripts/release.mjs`) refuses to ship a version that has no section here.

## Unreleased

- The integration layer: an orchestrator (`src/setup/orchestrate.ts`) and CLI (`bin/cli.mjs`) that compose detection, emission (rulesync with the owned Codex + AGENTS.md-floor fallback), tokenize-last across the emitted files plus corpus and scaffold, a staging-to-destination lifecycle merge that never clobbers, and a verification gate scoped to only the installed files; verb dispatch (install / update / uninstall / resume / rollback / rules).
- Companion-tool offer (`buildToolOffers` + `effectiveMcpServers`): per-tool install metadata and a progressive, tiered offer; accepted MCP tools are wired into the harness MCP config.
- Native SessionStart hook for hook-capable harnesses (launcher installed to a conduct-owned dir, referenced by absolute path, merged into the harness config), with the AGENTS.md banner for the rest.
- CI generator guard (`scripts/ci-generator-check.mjs`): a required step that runs the real generator and fails if it falls back, so a broken primary path cannot silently degrade.
- Fixed a Windows generator bug: `npx` (a `.cmd` shim) was spawned without a shell and always threw EINVAL, so the emit silently fell back on Windows; the real path is now runtime-verified for Claude and Codex.
- CLI input-schema doc (`docs/cli.md`).
- README rewritten in the author's voice; the maintainer PII scrub is no longer described anywhere in the public repo.
- Bootstrap and lifecycle procedure doc (the interactive, provenance-checked install brain).
- Post-install verification gate (no leftover tokens, no residual markers, links resolve, no secret-shaped values).
- The SessionStart hook script and cross-OS polyglot launcher.
- MAINTAINING.md (the one-way promote model, the contributor model, the release process) and DESIGN.md.
- Full conduct rule corpus seeded into `payload/memory/`; operating-rules expanded to the full always-loaded payload.
- Fixed the serena MCP launch command to `uvx --from serena-agent` (the shipped `git+serena` is not a parseable requirement and could never start; found by the first user install).
- Fixed the recall MCP wiring in the manifest and the canonical `mcp.json`: launch via the `recall-mcp` console script (shipped by recall 0.2.0 and newer). The bare `recall` command defaults to its `search` subcommand and never serves MCP.
- CLI doc corrected: `scope` is recorded but does not change emitted paths; project scope is the supported path, and a harness-config-dir root emits a layout Claude Code does not read.

## 0.0.0

- Initial foundation: the lifecycle and state engine (out-of-band record, marker-free regions, per-format merge), the emission layer (AGENTS.md floor plus rulesync, tokenize-last), the dependency manifest with per-OS detection and the installer, the owned Codex and Antigravity emitters, the transfer and onboarding layer, the honest coverage matrix, and the cross-OS CI workflow.
