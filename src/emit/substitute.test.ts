// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// Substitution tests, including the NAMED bash-patsub round-trip case (plan
// section 4). Run: node --experimental-strip-types --test src/emit/substitute.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { parse as parseToml } from "smol-toml";
import { substitute } from "./substitute.ts";

// A Windows path: the backslashes are exactly what a naive bash ${var//pat/repl}
// escaper mangles under bash 5.2 (conduct's documented gotcha). The per-format
// escaper must let the value survive a parse round-trip.
const WIN_PATH = "C:\\Users\\Example\\ws";
const MAP = { WORKSPACE_ROOT: WIN_PATH, USER_NAME: "Example" };

test("markdown substitution is raw (no escaping)", () => {
  const r = substitute("root: {{WORKSPACE_ROOT}}", "markdown", MAP);
  assert.equal(r.output, "root: " + WIN_PATH);
});

test("named case: JSON round-trips a Windows path (bash patsub would mangle it)", () => {
  const r = substitute('{ "root": "{{WORKSPACE_ROOT}}" }', "json", MAP);
  const parsed = JSON.parse(r.output) as { root: string };
  assert.equal(parsed.root, WIN_PATH);
});

test("named case: TOML round-trips a Windows path", () => {
  const r = substitute('root = "{{WORKSPACE_ROOT}}"', "toml", MAP);
  const parsed = parseToml(r.output) as { root: string };
  assert.equal(parsed.root, WIN_PATH);
});

test("only the fixed token set is touched; generator placeholders survive", () => {
  const r = substitute("{{args}} and {{USER_NAME}}", "markdown", MAP);
  assert.equal(r.output, "{{args}} and Example");
});

test("a token present but absent from the map is reported, not blanked", () => {
  const r = substitute("{{NEUROTYPE}}", "json", {});
  assert.ok(r.missing.includes("NEUROTYPE"));
  assert.ok(r.output.includes("{{NEUROTYPE}}"));
});
