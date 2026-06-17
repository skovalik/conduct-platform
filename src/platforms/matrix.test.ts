// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// Coverage-matrix honesty tests. Run: node --experimental-strip-types --test src/platforms/matrix.test.ts
// These guard against overclaiming: only Claude Code may be runtime-verified.

import { test } from "node:test";
import assert from "node:assert/strict";
import { COVERAGE, runtimeVerified, renderMatrix } from "./matrix.ts";

test("only Claude Code is runtime-verified (no overclaiming)", () => {
  const rv = runtimeVerified();
  assert.equal(rv.length, 1);
  assert.equal(rv[0]!.harness, "Claude Code");
});

test("Codex and Antigravity are docs-verified, runtime pending (not faked)", () => {
  const codex = COVERAGE.find((r) => r.harness === "Codex CLI")!;
  const antigravity = COVERAGE.find((r) => r.harness === "Antigravity CLI")!;
  assert.equal(codex.verification, "docs-verified-runtime-pending");
  assert.equal(antigravity.verification, "docs-verified-runtime-pending");
});

test("every flagship has a harness and a path; nothing is excluded", () => {
  assert.ok(COVERAGE.length >= 9);
  for (const r of COVERAGE) {
    assert.ok(r.flagship && r.harness && r.path, "row complete");
  }
  assert.ok(renderMatrix().includes("Verification (honest, today)"));
});
