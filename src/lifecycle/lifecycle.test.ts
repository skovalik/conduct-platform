// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// Lifecycle engine tests. Run: node --experimental-strip-types --test src/lifecycle/lifecycle.test.ts
// Each test works in an isolated temp dir with its own install-state path, so the
// real ~/.conduct-platform is never touched.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  writeFileSync,
  readFileSync,
  existsSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { install, uninstall, resume, type Payload } from "./lifecycle.ts";
import { readState } from "./install-state.ts";

const DATE = "2026-06-16";
const REGION = "## Operating Rules\n\nPlan before code. Verify your theories.";

function tmp(): { dir: string; statePath: string } {
  const dir = mkdtempSync(join(tmpdir(), "cp-lifecycle-"));
  return { dir, statePath: join(dir, "install-state.json") };
}

function payload(dir: string, region: string = REGION): Payload {
  return {
    harness: "claude",
    scope: "project",
    root: dir,
    formatVersion: "0.0.0",
    tokenMap: { USER_NAME: "Example" },
    artifacts: [
      { path: join(dir, "CLAUDE.md"), format: "markdown", markdownRegion: region },
      {
        path: join(dir, ".mcp.json"),
        format: "json",
        json: { mcpServers: { recall: { command: "recall", args: [] } } },
        jsonKeyPaths: ["mcpServers.recall"],
      },
    ],
  };
}

test("install into absent files writes region + json and records the commit point", () => {
  const { dir, statePath } = tmp();
  const r = install(payload(dir), DATE, statePath);
  assert.equal(r.conflicts.length, 0);
  assert.ok(readFileSync(join(dir, "CLAUDE.md"), "utf8").includes("Plan before code"));
  const mcp = JSON.parse(readFileSync(join(dir, ".mcp.json"), "utf8"));
  assert.ok(mcp.mcpServers.recall);
  const { state } = readState(statePath);
  assert.equal(state.installs.length, 1);
  assert.equal(state.installs[0]!.commitPoint, true);
  assert.ok(state.installs[0]!.artifacts.every((a) => a.writtenAndVerified));
  rmSync(dir, { recursive: true, force: true });
});

test("install into a user-owned CLAUDE.md preserves the user's content", () => {
  const { dir, statePath } = tmp();
  writeFileSync(join(dir, "CLAUDE.md"), "# My own notes\n\nKeep me.\n", "utf8");
  install(payload(dir), DATE, statePath);
  const md = readFileSync(join(dir, "CLAUDE.md"), "utf8");
  assert.ok(md.includes("Keep me."), "user content preserved");
  assert.ok(md.includes("Plan before code"), "our region added");
  rmSync(dir, { recursive: true, force: true });
});

test("json merge never clobbers the user's existing servers", () => {
  const { dir, statePath } = tmp();
  writeFileSync(
    join(dir, ".mcp.json"),
    JSON.stringify({ mcpServers: { mine: { command: "x" } } }),
    "utf8",
  );
  install(payload(dir), DATE, statePath);
  const mcp = JSON.parse(readFileSync(join(dir, ".mcp.json"), "utf8"));
  assert.ok(mcp.mcpServers.mine, "user server preserved");
  assert.ok(mcp.mcpServers.recall, "our server added");
  rmSync(dir, { recursive: true, force: true });
});

test("re-install (update) replaces our region in place, no duplication", () => {
  const { dir, statePath } = tmp();
  install(payload(dir), DATE, statePath);
  install(payload(dir, "## Operating Rules\n\nUpdated: verify at runtime."), DATE, statePath);
  const md = readFileSync(join(dir, "CLAUDE.md"), "utf8");
  assert.ok(md.includes("Updated: verify at runtime."));
  assert.ok(
    !md.includes("Plan before code. Verify your theories."),
    "old region replaced, not duplicated",
  );
  rmSync(dir, { recursive: true, force: true });
});

test("uninstall removes our region + keys and preserves the user's", () => {
  const { dir, statePath } = tmp();
  writeFileSync(join(dir, "CLAUDE.md"), "# Mine\n\nKeep me.\n", "utf8");
  writeFileSync(
    join(dir, ".mcp.json"),
    JSON.stringify({ mcpServers: { mine: { command: "x" } } }),
    "utf8",
  );
  install(payload(dir), DATE, statePath);
  const u = uninstall(dir, "claude", {}, statePath);
  assert.equal(u.conflicts.length, 0);
  const md = readFileSync(join(dir, "CLAUDE.md"), "utf8");
  assert.ok(md.includes("Keep me."), "user content kept");
  assert.ok(!md.includes("Plan before code"), "our region gone");
  const mcp = JSON.parse(readFileSync(join(dir, ".mcp.json"), "utf8"));
  assert.ok(mcp.mcpServers.mine, "user server kept");
  assert.ok(!mcp.mcpServers.recall, "our server gone");
  assert.equal(readState(statePath).state.installs.length, 0, "record removed");
  rmSync(dir, { recursive: true, force: true });
});

test("a user edit inside our region is detected as a conflict on update", () => {
  const { dir, statePath } = tmp();
  install(payload(dir), DATE, statePath);
  const edited = readFileSync(join(dir, "CLAUDE.md"), "utf8").replace(
    "Plan before code",
    "Plan BEFORE code (my edit)",
  );
  writeFileSync(join(dir, "CLAUDE.md"), edited, "utf8");
  const r = install(payload(dir, "## Operating Rules\n\nNew text."), DATE, statePath);
  assert.ok(r.conflicts.includes(join(dir, "CLAUDE.md")), "edited region flagged");
  rmSync(dir, { recursive: true, force: true });
});

test("resume completes after a simulated crash (commitPoint false)", () => {
  const { dir, statePath } = tmp();
  install(payload(dir), DATE, statePath);
  const raw = JSON.parse(readFileSync(statePath, "utf8"));
  raw.installs[0].commitPoint = false; // pretend the commit-point write never happened
  writeFileSync(statePath, JSON.stringify(raw), "utf8");
  resume(payload(dir), DATE, statePath);
  assert.equal(
    readState(statePath).state.installs[0]!.commitPoint,
    true,
    "resume flipped the commit point",
  );
  rmSync(dir, { recursive: true, force: true });
});

test("uninstall honors an explicit preserve-list", () => {
  const { dir, statePath } = tmp();
  install(payload(dir), DATE, statePath);
  uninstall(dir, "claude", { preserve: [join(dir, ".mcp.json")] }, statePath);
  const mcp = JSON.parse(readFileSync(join(dir, ".mcp.json"), "utf8"));
  assert.ok(mcp.mcpServers.recall, "preserved file left untouched");
  rmSync(dir, { recursive: true, force: true });
});
