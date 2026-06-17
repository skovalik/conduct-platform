// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// Emission tests: tokenize-last over emitted files, and hook degradation.
// Run: node --experimental-strip-types --test src/emit/emit.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  writeFileSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { substituteEmitted, formatFor } from "./generate.ts";
import { emitHook, HOOK_CAPABLE_HARNESSES } from "./hooks.ts";

test("formatFor maps extensions to emit formats", () => {
  assert.equal(formatFor("AGENTS.md"), "markdown");
  assert.equal(formatFor(".gemini/settings.json"), "json");
  assert.equal(formatFor(".codex/config.toml"), "toml");
  assert.equal(formatFor("notes.txt"), null);
});

test("substituteEmitted fills tokens per format across emitted files", () => {
  const dir = mkdtempSync(join(tmpdir(), "cp-emit-"));
  const md = join(dir, "AGENTS.md");
  const json = join(dir, "settings.json");
  writeFileSync(md, "Operator: {{USER_NAME}}", "utf8");
  writeFileSync(json, '{ "root": "{{WORKSPACE_ROOT}}" }', "utf8");
  const res = substituteEmitted([md, json], {
    USER_NAME: "Example",
    WORKSPACE_ROOT: "C:\\Users\\Example",
  });
  assert.equal(readFileSync(md, "utf8"), "Operator: Example");
  const parsed = JSON.parse(readFileSync(json, "utf8")) as { root: string };
  assert.equal(parsed.root, "C:\\Users\\Example", "json path round-trips");
  assert.ok(res.find((r) => r.path === md)!.substituted.includes("USER_NAME"));
  rmSync(dir, { recursive: true, force: true });
});

test("hook degradation: hook-capable harnesses get a SessionStart config", () => {
  for (const h of ["claude", "codex", "gemini"]) {
    const e = emitHook(h);
    assert.ok(e.supportsHooks, `${h} supports hooks`);
    assert.ok(e.config, `${h} has a hook config`);
    assert.ok(HOOK_CAPABLE_HARNESSES.has(h));
  }
});

test("hook degradation: other harnesses degrade to an AGENTS.md banner", () => {
  const e = emitHook("aider");
  assert.equal(e.supportsHooks, false);
  assert.equal(e.bannerOnly, true);
  assert.ok(e.banner && e.banner.length > 0);
});

test("only Claude Code's hook shape is runtime-verified; others are docs-level", () => {
  assert.equal(emitHook("claude").confidence, "runtime-verified");
  assert.equal(emitHook("codex").confidence, "docs-level");
  assert.equal(emitHook("gemini").confidence, "docs-level");
});
