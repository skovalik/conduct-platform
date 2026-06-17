<!-- conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE). -->

# The conduct-platform CLI

The CLI is the deterministic applier. It is **non-interactive by design**: the
agent runs the interactive parts (confirm scope, research and confirm the
profile, inventory tooling, present the companion-tool offers and collect
consent) per [bootstrap-procedure.md](bootstrap-procedure.md), then assembles the
input below and invokes the CLI to apply it. The CLI never auto-installs an
external tool; consented external installs are the agent's to run.

## Usage

```
conduct-platform <verb> --input <input.json>
```

Run via the bin (`bin/cli.mjs`, which adds `--experimental-strip-types`), or
directly: `node --experimental-strip-types src/cli-impl.ts <verb> --input <f>`.

Verbs: `install` (default), `update` (re-applies; replaces our recorded regions
in place), `uninstall` (removes only our content), `resume` (completes a crashed
install), `rollback` (removes a partial), `rules` (re-asserts, no file changes).

Exit code: `0` on success, `1` if the verification gate failed (and the install
was rolled back), `2` on a usage or input error.

## The input JSON

| Field | Type | Required | Meaning |
|---|---|---|---|
| `root` | string | yes | The destination: the project root (project scope) or the harness config dir (global scope). |
| `scope` | `"project"` \| `"global"` | yes | Where the rules live. |
| `harness` | string | yes | The target harness: `claude`, `codex`, `gemini`, `antigravity`, or another name (others get the AGENTS.md floor). |
| `tokenMap` | object | yes | The confirmed token values (see below). Fill every token you confirmed; omit `CONTINUE_HERE` (it is seeded, not filled). |
| `tiers` | string[] | yes | Which companion tiers to consider: `core`, `recommended`, `optional`. |
| `acceptedTools` | string[] | no | Tool names the user consented to. Accepted MCP tools are wired into the harness MCP config. |
| `hook` | boolean | no | Apply the SessionStart reminder (project scope, explicit yes). |
| `committedAt` | string | yes | The install date you confirmed. Required; the CLI never invents it. |
| `packageRoot` | string | no | Where `.rulesync/`, `payload/`, and `scaffold/` live. Defaults to the current working directory. |
| `statePath` | string | no | Override the install-state path (default `~/.conduct-platform/install-state.json`). |
| `emitRunner` | string | no | Test seam only: a runner name that fails forces the owned fallback. Leave unset in real installs. |

### Token names

Fill the ones you confirmed; never fabricate a value:

`USER_NAME` · `ROLE_BACKGROUND` · `USER_FOCUS` · `NEUROTYPE` · `OS` · `SHELL` ·
`WORKSPACE_ROOT` · `MEMORY_PATH` · `TASK_TRACKER` · `REFERENCE_FILES` ·
`COMMIT_ATTRIBUTION` · `SCREENSHOT_PATH` · `DETECTED_TOOLING`. `CONTINUE_HERE` is
seeded (left as a placeholder), so do not put it in `tokenMap`.

## Example

```json
{
  "root": "/home/you/project",
  "scope": "project",
  "harness": "claude",
  "tokenMap": {
    "USER_NAME": "Your Name",
    "ROLE_BACKGROUND": "full-stack developer",
    "USER_FOCUS": "a web app",
    "NEUROTYPE": "neutral",
    "OS": "linux",
    "SHELL": "bash",
    "WORKSPACE_ROOT": "/home/you/project",
    "MEMORY_PATH": "/home/you/project/memory",
    "TASK_TRACKER": "beads",
    "REFERENCE_FILES": "none",
    "COMMIT_ATTRIBUTION": "single-author, no AI co-author trailer",
    "SCREENSHOT_PATH": "/tmp/shots",
    "DETECTED_TOOLING": "recall, beads"
  },
  "tiers": ["core"],
  "acceptedTools": ["recall", "beads"],
  "hook": false,
  "committedAt": "2026-06-16"
}
```

The CLI prints a JSON report: the lifecycle result, the verification gate
outcome, the companion-tool offers, whether the owned fallback was used, the
onboarding sheet, and notes. The agent surfaces those to the user (progressively,
not all at once).
