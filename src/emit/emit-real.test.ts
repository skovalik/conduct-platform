// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// emitReal tests. Run: node --experimental-strip-types --test src/emit/emit-real.test.ts
// The generator is forced to fail (a nonexistent runner) so the OWNED FALLBACK is
// exercised deterministically, with no network. The rulesync success path is
// covered by the spike + the CI dry-emit, not here.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { emitReal } from "./emit-real.ts";

const FAIL_RUNNER = "cp-no-such-runner-xyz";

function stageRulesync(): string {
  const dir = mkdtempSync(join(tmpdir(), "cp-emitreal-"));
  mkdirSync(join(dir, ".rulesync", "rules"), { recursive: true });
  writeFileSync(
    join(dir, ".rulesync", "rules", "operating-rules.md"),
    "---\nroot: true\n---\n\n# Operating Rules\n\nPlan before code.\n",
    "utf8",
  );
  writeFileSync(
    join(dir, ".rulesync", "mcp.json"),
    JSON.stringify({ mcpServers: { recall: { type: "stdio", command: "recall", args: [] } } }),
    "utf8",
  );
  return dir;
}

test("emitReal falls back to the owned Codex emitter when the generator fails", () => {
  const dir = stageRulesync();
  const r = emitReal(dir, "codex", { runner: FAIL_RUNNER });
  assert.equal(r.usedFallback, true);
  assert.ok(existsSync(join(dir, "AGENTS.md")), "AGENTS.md floor written");
  assert.ok(existsSync(join(dir, ".codex", "config.toml")), "codex MCP config written");
  rmSync(dir, { recursive: true, force: true });
});

test("emitReal fallback gives the AGENTS.md floor for a non-Codex harness", () => {
  const dir = stageRulesync();
  const r = emitReal(dir, "cursor", { runner: FAIL_RUNNER });
  assert.equal(r.usedFallback, true);
  assert.ok(existsSync(join(dir, "AGENTS.md")), "AGENTS.md floor written");
  assert.ok(r.files.some((f) => f.endsWith("AGENTS.md")));
  rmSync(dir, { recursive: true, force: true });
});

test("emitReal emits the SessionStart hook config when asked (Claude)", () => {
  const dir = stageRulesync();
  emitReal(dir, "claude", { runner: FAIL_RUNNER, hook: true });
  assert.ok(existsSync(join(dir, ".claude", "hooks", "hooks.json")), "claude hook config written");
  rmSync(dir, { recursive: true, force: true });
});
