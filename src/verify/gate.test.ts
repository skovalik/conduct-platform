// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// Verification-gate tests. Run: node --experimental-strip-types --test src/verify/gate.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { verifyInstall } from "./gate.ts";

function setup(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), "cp-verify-"));
  for (const [rel, content] of Object.entries(files)) {
    const p = join(dir, rel);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, content, "utf8");
  }
  return dir;
}

function check(r: ReturnType<typeof verifyInstall>, name: string): boolean {
  return r.checks.find((c) => c.name === name)!.pass;
}

test("a clean, fully-personalized install passes all checks", () => {
  const dir = setup({
    "CLAUDE.md": "# Rules\n\nPlan before code. See [x](memory/x.md).",
    "memory/x.md": "a rule",
  });
  const r = verifyInstall(dir);
  assert.ok(r.allPass, JSON.stringify(r.checks));
  rmSync(dir, { recursive: true, force: true });
});

test("a leftover token fails the gate", () => {
  const dir = setup({ "CLAUDE.md": "Operator: {{USER_NAME}}" });
  assert.equal(check(verifyInstall(dir), "no-leftover-tokens"), false);
  rmSync(dir, { recursive: true, force: true });
});

test("a residual marker fails the gate", () => {
  const dir = setup({ "CLAUDE.md": "<!-- KIT_STATUS: INITIALIZED -->" });
  assert.equal(check(verifyInstall(dir), "no-residual-markers"), false);
  rmSync(dir, { recursive: true, force: true });
});

test("a broken relative link fails the gate", () => {
  const dir = setup({ "CLAUDE.md": "See [x](memory/missing.md)." });
  assert.equal(check(verifyInstall(dir), "links-resolve"), false);
  rmSync(dir, { recursive: true, force: true });
});

test("a secret-shaped value fails the gate (built at runtime)", () => {
  const secret = "sk-" + "A".repeat(30);
  const dir = setup({ "CLAUDE.md": "key '" + secret + "'" });
  assert.equal(check(verifyInstall(dir), "no-secrets"), false);
  rmSync(dir, { recursive: true, force: true });
});

test("the seeded CONTINUE_HERE token does not fail the gate", () => {
  const dir = setup({ "MEMORY.md": "## CONTINUE HERE\n{{CONTINUE_HERE}}" });
  assert.ok(check(verifyInstall(dir), "no-leftover-tokens"));
  rmSync(dir, { recursive: true, force: true });
});
