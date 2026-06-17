<!-- conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE). -->

# Canonical source schema and emission

Status: Phase 0 specification. The backend choice below is LOCKED on spike
evidence (this document, "The spike"). The source tree is SPECIFIED here; it is
populated and refreshed by the sync pipeline (it is derived from the author's
live workspace, not authored from scratch), which lands in a later phase.

## Decision: rulesync is the emission backend

The emission backend is [rulesync](https://github.com/dyoshikawa/rulesync)
(`.rulesync/` source tree), with two always-owned fallbacks so the core never
depends on the generator to function:

1. The **AGENTS.md floor** (owned): the rules payload as `AGENTS.md`, read natively or by one-line config across the landscape.
2. conduct-platform's **own minimal Codex and Antigravity emitters** (owned): used if rulesync changes or dies. The generator buys breadth; it is not load-bearing for the two priority native targets.

rulesync is a swappable backend. The source schema below is close to rulesync's
native layout precisely so a swap stays cheap.

## The spike (Phase 0, run 2026-06-16; artifacts under `spikes/` which is gitignored)

The same sample source (one rule carrying a `{{USER_NAME}}` token, one command,
one MCP server, one subagent) was emitted through both rulesync 8.29.0 and
ai-rulez 4.4.1, targeting Codex and Gemini.

| Axis | rulesync 8.29 | ai-rulez 4.4 |
|---|---|---|
| `{{token}}` passthrough (tokenize-last viability) | survives verbatim | survives verbatim |
| Codex rules | `AGENTS.md` (native read) | `AGENTS.md` |
| Codex MCP wiring | `.codex/config.toml` (`[mcp_servers.x]`) | not emitted (skills only) |
| Codex subagents | `.codex/agents/*.toml` | not emitted in this run |
| Codex commands | simulated-only (skipped without `--simulate-commands`) | not emitted |
| Gemini rules | `GEMINI.md` | `GEMINI.md` |
| Gemini MCP wiring | `.gemini/settings.json` (stdio) | `.gemini/settings.json` (stdio) |
| Gemini commands | `.gemini/commands/*.toml` (native) | not emitted |
| Gemini subagents | `.gemini/agents/*.md` | not emitted in this run |
| Output cleanliness | 2-line header prepended | ~50-line boilerplate injected into every rules file; injects its own MCP server; restructures rule prose |
| Source shape | file-per-component (rules/commands/subagents/skills/mcp.json/hooks.json) | central `config.toml` + dirs |
| Stated coverage | ~28 tools incl Antigravity | ~19 tools |

Decisive factors for rulesync: it wires Codex MCP (a priority native target that
ai-rulez left without MCP), it keeps the emitted rules payload clean (ai-rulez
injects a large boilerplate header the model would have to read every session),
and its file-per-component source maps almost one-to-one onto conduct's existing
per-rule-file layout. Both generators preserve `{{token}}`, which is what makes
the substitution rule below safe.

Honest caveats: the spike ran on the author's machine, which has neither Codex
nor Gemini installed, so the EMITTED FILES are verified for shape and fidelity,
not for being consumed correctly by those harnesses at runtime. That runtime
proof is the first user's (plan section 5 and decision 13.10). ai-rulez was
tested with a rules+skills+MCP sample; it may emit Codex MCP under a custom
output target not exercised here. The choice is made on the native, out-of-the
box behavior that matters for the priority targets.

## The source tree

```
.rulesync/
  rules/*.md            front-matter (root, targets, description, globs) + body
  commands/*.md         front-matter (description, targets) + body ($ARGUMENTS)
  subagents/*.md        agent definitions
  skills/<name>/SKILL.md
  mcp.json              { "mcpServers": { "<name>": { "type": "stdio", "command", "args", "env" } } }
  hooks.json            hook definitions (see "Hooks" below)
  .aiignore             ignore patterns
rulesync.jsonc          { targets[], features[], outputRoots[], ... }
```

Plus a thin conduct-platform source for what the generator does not model (kept
OUTSIDE `.rulesync/` so it is never fed to the generator):

```
payload/memory/   the on-demand rule corpus (consumed from conduct) plus MEMORY.md
scaffold/         name-free exemplars: an example session, wiki page, and MEMORY index
src/              the owned engine: lifecycle, emit, manifest, install, onboarding, platforms
```

## The token set

Carried from conduct, unchanged in meaning (filled per user, never assumed):

`{{USER_NAME}}` · `{{ROLE_BACKGROUND}}` · `{{USER_FOCUS}}` · `{{NEUROTYPE}}` ·
`{{OS}}` · `{{SHELL}}` · `{{WORKSPACE_ROOT}}` · `{{MEMORY_PATH}}` ·
`{{TASK_TRACKER}}` · `{{REFERENCE_FILES}}` · `{{COMMIT_ATTRIBUTION}}` ·
`{{SCREENSHOT_PATH}}` · `{{DETECTED_TOOLING}}` · `{{CONTINUE_HERE}}` (seeded, not
filled).

The token set is a FIXED allowlist. The substitution step touches only these
names, so it never collides with a generator's own placeholders (rulesync, for
example, rewrites a command's `$ARGUMENTS` to the target-native `{{args}}`, which
is left untouched because it is not in the set).

The one allowed person reference is the authorship credit (author name plus the
repo URL, never an agency email). Everything else about a person is a token.

## The substitution rule: tokenize LAST

The spike proved `{{token}}` survives generator emission, so the order is:

1. Keep `{{token}}` form in `.rulesync/` source.
2. Run rulesync to emit native artifacts (AGENTS.md, `.codex/config.toml`, `.gemini/settings.json`, GEMINI.md, command TOML, agent files).
3. **Then** substitute the token VALUES into the already-emitted native files, with a PER-FORMAT escaper.

Why last, not in the source: substituting first would force the generator to
re-quote already-escaped values, and a value can contain characters that are
special in the target format. Tokenize-last lets each emitted file be escaped
for its own format exactly once.

### Per-format escaper (required)

- **Markdown / AGENTS.md / GEMINI.md / CLAUDE.md**: raw text substitution; no escaping (Markdown has no string-quoting of values).
- **JSON** (`.gemini/settings.json`, `.mcp.json`): escape the value as a JSON string (`JSON.stringify` of the value, minus the outer quotes), so a Windows path like `C:\Users\name` becomes `C:\\Users\\name`.
- **TOML** (`.codex/config.toml`, Gemini command TOML): escape per TOML basic string rules (backslash and double-quote), or emit a literal string where the value has no quotes.

The substitution is implemented in TypeScript with these escapers, NOT in a
shell. This is deliberate.

### Named test case: the bash patsub gotcha (carried from conduct)

conduct documented that the common pure-bash escaper `${var//pat/repl}` is
silently broken under bash 5.2 (`patsub_replacement` mangles backslashes in the
replacement string). conduct sidestepped it by emitting a fixed JSON-safe
constant instead of running a runtime escaper.

conduct-platform carries this forward as a REQUIRED round-trip test:

> Substitute a token whose value is a Windows path (`C:\Users\Example\ws`) into
> each emitted format. For JSON and TOML, parse the result and assert the parsed
> value equals the original path. A bash `${//}` escaper fails this; the
> TypeScript per-format escaper must pass it. No shell escaper ships.

This test must exist and pass before any emitter is marked done.

## Emission targets (Phase 0 map; runtime confidence per plan section 5)

| Target | Rules | MCP | Commands | Subagents |
|---|---|---|---|---|
| Codex | `AGENTS.md` | `.codex/config.toml` | simulated (degrade) | `.codex/agents/*.toml` |
| Gemini | `GEMINI.md` | `.gemini/settings.json` | `.gemini/commands/*.toml` | `.gemini/agents/*.md` |
| AGENTS.md floor | `AGENTS.md` | none (floor is rules-only) | simulated (degrade) | simulated (degrade) |
| Claude (home) | `CLAUDE.md` | `.mcp.json` | `.claude/commands/*.md` | `.claude/agents/*.md` |

## Hooks (hand-emitted, not via the generator)

The plan (section 5) treats hooks as the degradation exception, and that is what
shipped: the orchestrator hand-emits the SessionStart reminder rather than relying
on rulesync's hooks feature. A hook-capable harness (Claude, Codex, Gemini) gets a
native hook config whose command is the installed launcher (`run-hook.cmd` +
`session-start`, copied to a conduct-owned dir and referenced by absolute path),
merged into the harness hook config so it never clobbers a file that also holds
other settings. Every other harness gets the AGENTS.md banner. The launcher's
reminder logic is runtime-verified (it fires only when a rules file still has an
unfilled token); the actual per-harness SessionStart firing past Claude is
docs-level until the first user runs it.
