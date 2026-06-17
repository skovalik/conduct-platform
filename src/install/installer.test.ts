// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// Installer tests. Run: node --experimental-strip-types --test src/install/installer.test.ts
// The emit function is stubbed, so this exercises prereq filtering + the
// emitted-to-payload conversion + the real lifecycle engine, without rulesync.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { planInstall, payloadFromEmitted, runInstall, corpusArtifacts, type InstallPlan } from "./installer.ts";
import { detect } from "../manifest/detect.ts";

test("detect finds node and git on this machine (runtime)", () => {
  const d = detect(["node", "git"]);
  assert.equal(d.present["node"], true);
  assert.equal(d.present["git"], true);
});

test("planInstall keeps entries whose prereqs are present, skips the rest", () => {
  const plan: InstallPlan = {
    root: "/tmp/x",
    scope: "project",
    harness: "claude",
    tiers: ["core"],
    tokenMap: {},
    committedAt: "2026-06-16",
  };
  const r = planInstall(plan);
  // memory-scaffold has no prereqs, so it is always installable.
  assert.ok(r.install.some((e) => e.name === "memory-scaffold"));
});

test("payloadFromEmitted maps markdown to a region and json to owned key paths", () => {
  const dir = mkdtempSync(join(tmpdir(), "cp-emit2-"));
  const md = join(dir, "AGENTS.md");
  const js = join(dir, ".mcp.json");
  writeFileSync(md, "# rules", "utf8");
  writeFileSync(js, '{"mcpServers":{"recall":{"command":"recall"}}}', "utf8");
  const arts = payloadFromEmitted([md, js]);
  const mdArt = arts.find((a) => a.path === md)!;
  const jsArt = arts.find((a) => a.path === js)!;
  assert.equal(mdArt.format, "markdown");
  assert.equal(mdArt.markdownRegion, "# rules");
  assert.equal(jsArt.format, "json");
  assert.ok(jsArt.jsonKeyPaths!.includes("mcpServers.recall.command"));
  rmSync(dir, { recursive: true, force: true });
});

test("runInstall emits, builds a payload, and installs via the lifecycle engine", () => {
  const dir = mkdtempSync(join(tmpdir(), "cp-install-"));
  // Stub emit: write an AGENTS.md + .mcp.json into root, return their paths.
  const emit = (root: string): string[] => {
    const md = join(root, "AGENTS.md");
    const js = join(root, ".mcp.json");
    writeFileSync(md, "# Operating Rules\n\nPlan before code.", "utf8");
    writeFileSync(js, '{"mcpServers":{"recall":{"command":"recall"}}}', "utf8");
    return [md, js];
  };
  const plan: InstallPlan = {
    root: dir,
    scope: "project",
    harness: "claude",
    tiers: ["core"],
    tokenMap: { USER_NAME: "Example" },
    committedAt: "2026-06-16",
  };
  const report = runInstall(plan, emit);
  assert.ok(report.op?.record?.commitPoint, "install committed");
  assert.ok(readFileSync(join(dir, "AGENTS.md"), "utf8").includes("Plan before code"));
  const mcp = JSON.parse(readFileSync(join(dir, ".mcp.json"), "utf8"));
  assert.ok(mcp.mcpServers.recall);
  rmSync(dir, { recursive: true, force: true });
});

test("corpusArtifacts maps a memory corpus dir to memory/ markdown artifacts", () => {
  const corpus = mkdtempSync(join(tmpdir(), "cp-corpus-"));
  writeFileSync(join(corpus, "feedback_x.md"), "rule x", "utf8");
  writeFileSync(join(corpus, "MEMORY.md"), "index", "utf8");
  const arts = corpusArtifacts(corpus, join(corpus, "memory"));
  assert.equal(arts.length, 2);
  assert.ok(arts.every((a) => a.format === "markdown"));
  assert.ok(arts.some((a) => a.path.endsWith("feedback_x.md")));
  rmSync(corpus, { recursive: true, force: true });
});
