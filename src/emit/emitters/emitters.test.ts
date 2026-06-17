// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// Owned-emitter tests. Run: node --experimental-strip-types --test src/emit/emitters/emitters.test.ts
// The shapes are asserted to match the rulesync-emitted Codex artifacts from the
// Phase-0 spike. Runtime consumption by Codex/Antigravity is the first user's.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parse as parseToml } from "smol-toml";
import { readCanonical, type Canonical } from "./canonical.ts";
import { emitCodex } from "./codex.ts";
import { emitAntigravity } from "./antigravity.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const RULESYNC = join(HERE, "..", "..", "..", ".rulesync");

const synthetic: Canonical = {
  rules: [{ name: "operating-rules", body: "# Rules\n\nPlan before code." }],
  mcpServers: { recall: { type: "stdio", command: "recall", args: [] } },
  subagents: [{ name: "deep-research", description: "research", body: "Gather and verify." }],
};

test("codex emitter matches the proven shape (AGENTS.md + mcp_servers toml + agent toml)", () => {
  const out = emitCodex(synthetic);
  assert.ok(out.get("AGENTS.md")!.includes("Plan before code"));
  const cfg = parseToml(out.get(".codex/config.toml")!) as {
    mcp_servers: Record<string, { command: string }>;
  };
  assert.equal(cfg.mcp_servers.recall!.command, "recall");
  const agent = parseToml(out.get(".codex/agents/deep-research.toml")!) as {
    name: string;
    developer_instructions: string;
  };
  assert.equal(agent.name, "deep-research");
  assert.ok(agent.developer_instructions.includes("Gather and verify"));
});

test("antigravity emitter is floor-only with an UNVERIFIED note", () => {
  const e = emitAntigravity(synthetic);
  assert.ok(e.files.get("AGENTS.md")!.includes("Plan before code"));
  assert.equal(e.confidence, "floor-only");
  assert.equal(e.files.has(".codex/config.toml"), false);
  assert.ok(e.notes.some((n) => n.toUpperCase().includes("UNVERIFIED")));
});

test("readCanonical reads the real .rulesync, frontmatter stripped", () => {
  const c = readCanonical(RULESYNC);
  const r = c.rules.find((x) => x.name === "operating-rules");
  assert.ok(r, "operating-rules present");
  assert.ok(!r!.body.startsWith("---"), "frontmatter stripped");
  assert.ok(c.mcpServers.recall, "mcp servers read");
  assert.ok(c.subagents.some((s) => s.name === "deep-research"), "subagent read");
});
