// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// Owned Codex emitter (the always-owned fallback for a priority native target).
// Produces the same native shapes rulesync does (verified against the Phase-0
// spike artifacts): AGENTS.md for rules, .codex/config.toml with [mcp_servers.*]
// (Codex snake_case), and .codex/agents/<name>.toml. Codex native commands are
// simulated-only, so they are intentionally not emitted here (they degrade to the
// AGENTS.md floor), matching rulesync's native behavior.
//
// Honesty: the emitted-file SHAPE is verified on this machine; that Codex
// CONSUMES them correctly is the first user's runtime proof (decision 13.10).

import { stringify } from "smol-toml";
import type { Canonical, McpServer } from "./canonical.ts";

function cleanServer(s: McpServer): Record<string, unknown> {
  const o: Record<string, unknown> = { type: s.type ?? "stdio", command: s.command };
  o.args = s.args ?? [];
  if (s.env && Object.keys(s.env).length > 0) o.env = s.env;
  return o;
}

export function emitCodex(c: Canonical): Map<string, string> {
  const out = new Map<string, string>();

  out.set("AGENTS.md", c.rules.map((r) => r.body.trimEnd()).join("\n\n") + "\n");

  const mcp: Record<string, Record<string, unknown>> = {};
  for (const [name, s] of Object.entries(c.mcpServers)) mcp[name] = cleanServer(s);
  if (Object.keys(mcp).length > 0) {
    out.set(".codex/config.toml", stringify({ mcp_servers: mcp }) + "\n");
  }

  for (const a of c.subagents) {
    out.set(
      `.codex/agents/${a.name}.toml`,
      stringify({
        name: a.name,
        description: a.description,
        developer_instructions: a.body.trimEnd(),
      }) + "\n",
    );
  }

  return out;
}
