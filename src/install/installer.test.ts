// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// Installer-helper tests. Run: node --experimental-strip-types --test src/install/installer.test.ts
// Cover the emitted-to-payload conversion, the companion-tool offer, the effective
// MCP set, and the corpus artifact mapping. The full install path is covered by
// the orchestrator integration test (src/setup/orchestrate.test.ts).

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { payloadFromEmitted, corpusArtifacts, buildToolOffers, effectiveMcpServers } from "./installer.ts";
import { detect } from "../manifest/detect.ts";
import { MANIFEST } from "../manifest/manifest.ts";

test("detect finds node and git on this machine (runtime)", () => {
  const d = detect(["node", "git"]);
  assert.equal(d.present["node"], true);
  assert.equal(d.present["git"], true);
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

test("every manifest entry has a valid install spec", () => {
  const methods = new Set(["builtin", "mcp", "package", "plugin", "subagent"]);
  for (const e of MANIFEST) {
    assert.ok(methods.has(e.install.method), `${e.name} method valid`);
    assert.ok(e.install.hint.length > 0, `${e.name} has a hint`);
    if (e.install.method === "mcp") assert.ok(e.mcp, `${e.name} (mcp) has mcp wiring`);
  }
});

test("buildToolOffers classifies builtin/wire/offer-install and reflects detect()", () => {
  const offers = buildToolOffers(["core"]);
  const byName = Object.fromEntries(offers.map((o) => [o.name, o]));
  // operating-rules ships with conduct-platform.
  assert.equal(byName["operating-rules"]!.action, "builtin");
  // recall is an MCP tool: wired if its prereq is present, else offered.
  const recall = byName["recall"]!;
  assert.equal(recall.method, "mcp");
  assert.equal(recall.action, recall.detected ? "wire" : "offer-install");
  // beads is a package tool: always offer-install, with the OS package managers attached.
  const beads = byName["beads"]!;
  assert.equal(beads.method, "package");
  assert.equal(beads.action, "offer-install");
  assert.ok(Array.isArray(beads.packageManagers));
});

test("effectiveMcpServers keeps core servers and adds only accepted optional ones", () => {
  const core = { recall: { command: "recall" }, context7: { command: "npx", args: ["-y", "x"] } };
  const eff = effectiveMcpServers(core, ["serena"]);
  assert.ok(eff["recall"], "core recall kept");
  assert.ok(eff["context7"], "core context7 kept");
  assert.ok(eff["serena"], "accepted serena added");
  assert.equal(eff["voice"], undefined, "non-accepted voice excluded");
  assert.equal(eff["recall"]!.type, "stdio");
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
