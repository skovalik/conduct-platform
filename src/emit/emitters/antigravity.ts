// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// Owned Antigravity emitter. FLOOR-ONLY by decision 13.12: until the first user
// installs `agy` and its real layout plus MCP config are observed at runtime,
// Antigravity gets the AGENTS.md rules floor and nothing native. The MCP wiring
// (likely ~/.gemini/config/mcp_config.json per research) and commands are NOT
// emitted; they are UNVERIFIED until that runtime observation promotes the target.

import type { Canonical } from "./canonical.ts";

export interface AntigravityEmit {
  files: Map<string, string>;
  confidence: "floor-only";
  notes: string[];
}

export function emitAntigravity(c: Canonical): AntigravityEmit {
  const files = new Map<string, string>();
  files.set("AGENTS.md", c.rules.map((r) => r.body.trimEnd()).join("\n\n") + "\n");
  const notes = [
    "Antigravity is FLOOR-ONLY (AGENTS.md) until the first user installs agy and its real layout plus MCP config are observed at runtime (decision 13.12).",
    "MCP wiring (likely ~/.gemini/config/mcp_config.json) and commands are NOT emitted natively yet: UNVERIFIED.",
  ];
  return { files, confidence: "floor-only", notes };
}
