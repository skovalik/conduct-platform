// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// Orchestrator integration tests. Run: node --experimental-strip-types --test src/setup/orchestrate.test.ts
// These exercise the WHOLE composed pipeline against the real package (.rulesync +
// payload + scaffold), with the generator forced to its owned fallback (no network),
// into a temp destination with an isolated state path.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runSetup, runVerb } from "./orchestrate.ts";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FAIL_RUNNER = "cp-no-such-runner-xyz"; // forces the owned fallback (deterministic, offline)

const TOKENS: Record<string, string> = {
  USER_NAME: "Example",
  ROLE_BACKGROUND: "full-stack developer",
  USER_FOCUS: "building things",
  NEUROTYPE: "neutral",
  OS: "linux",
  SHELL: "bash",
  WORKSPACE_ROOT: "/home/example/ws",
  MEMORY_PATH: "/home/example/ws/memory",
  TASK_TRACKER: "beads",
  REFERENCE_FILES: "none",
  COMMIT_ATTRIBUTION: "single-author, no AI co-author trailer",
  SCREENSHOT_PATH: "/tmp/shots",
  DETECTED_TOOLING: "recall, beads",
};

function destDir(): string {
  return mkdtempSync(join(tmpdir(), "cp-dest-"));
}

test("runSetup composes the pipeline, substitutes tokens, lays corpus+scaffold, gate passes", () => {
  const dest = destDir();
  const statePath = join(dest, "_state.json");
  const report = runSetup({
    root: dest,
    scope: "project",
    harness: "claude",
    tokenMap: TOKENS,
    tiers: ["core"],
    acceptedTools: [],
    committedAt: "2026-06-16",
    packageRoot: REPO,
    statePath,
    emitRunner: FAIL_RUNNER,
  });

  assert.ok(report.op?.record?.commitPoint, "install committed");
  assert.equal(report.usedFallback, true, "used the owned fallback");
  assert.ok(existsSync(join(dest, "AGENTS.md")), "rules floor written to destination");
  assert.ok(existsSync(join(dest, "memory", "MEMORY.md")), "corpus index laid");
  assert.ok(existsSync(join(dest, "memory", "feedback_plan-before-code.md")), "corpus rule laid");
  assert.ok(existsSync(join(dest, "memory", "sessions")), "scaffold sessions laid");

  const mem = readFileSync(join(dest, "memory", "MEMORY.md"), "utf8");
  assert.ok(!mem.includes("{{USER_NAME}}"), "tokens substituted in the corpus");
  assert.ok(mem.includes("Example"), "token value present");
  assert.ok(mem.includes("{{CONTINUE_HERE}}"), "seeded token preserved");

  assert.ok(report.verify?.allPass, "gate passes: " + JSON.stringify(report.verify?.checks));
  assert.ok(report.onboarding.discoverability.length > 0, "onboarding surfaced");
  rmSync(dest, { recursive: true, force: true });
});

test("runSetup merges into a pre-existing user file without clobbering it (P1)", () => {
  const dest = destDir();
  const statePath = join(dest, "_state.json");
  const userMarker = "MY OWN RULES, DO NOT LOSE";
  writeFileSync(join(dest, "AGENTS.md"), `# My rules\n\n${userMarker}\n`, "utf8");

  runSetup({
    root: dest,
    scope: "project",
    harness: "codex",
    tokenMap: TOKENS,
    tiers: ["core"],
    committedAt: "2026-06-16",
    packageRoot: REPO,
    statePath,
    emitRunner: FAIL_RUNNER,
  });

  const after = readFileSync(join(dest, "AGENTS.md"), "utf8");
  assert.ok(after.includes(userMarker), "the user's content survived the merge");
  rmSync(dest, { recursive: true, force: true });
});

test("uninstall removes our content and the record", () => {
  const dest = destDir();
  const statePath = join(dest, "_state.json");
  const base = {
    root: dest,
    scope: "project" as const,
    harness: "claude",
    tokenMap: TOKENS,
    tiers: ["core" as const],
    committedAt: "2026-06-16",
    packageRoot: REPO,
    statePath,
    emitRunner: FAIL_RUNNER,
  };
  runVerb("install", base);
  const un = runVerb("uninstall", base);
  assert.ok(un.op, "uninstall ran");
  assert.ok(un.notes.some((n) => /removed/.test(n)), "removed our content");
  rmSync(dest, { recursive: true, force: true });
});

test("hook: native SessionStart wired with the launcher installed (claude)", () => {
  const dest = destDir();
  const report = runSetup({
    root: dest, scope: "project", harness: "claude", tokenMap: TOKENS,
    tiers: ["core"], committedAt: "2026-06-16", packageRoot: REPO,
    statePath: join(dest, "_state.json"), emitRunner: FAIL_RUNNER, hook: true,
  });
  assert.ok(existsSync(join(dest, ".conduct-platform", "hooks", "run-hook.cmd")), "launcher installed");
  assert.ok(existsSync(join(dest, ".conduct-platform", "hooks", "session-start")), "session-start installed");
  const cfg = readFileSync(join(dest, ".claude", "hooks", "hooks.json"), "utf8");
  assert.ok(cfg.includes("run-hook.cmd"), "hook config references the installed launcher");
  assert.ok(report.verify?.allPass, "gate passes with the hook: " + JSON.stringify(report.verify?.checks));
  rmSync(dest, { recursive: true, force: true });
});

test("hook: a non-hook-capable harness gets the AGENTS.md banner", () => {
  const dest = destDir();
  runSetup({
    root: dest, scope: "project", harness: "cursor", tokenMap: TOKENS,
    tiers: ["core"], committedAt: "2026-06-16", packageRoot: REPO,
    statePath: join(dest, "_state.json"), emitRunner: FAIL_RUNNER, hook: true,
  });
  const agents = readFileSync(join(dest, "AGENTS.md"), "utf8");
  assert.ok(agents.includes("run the setup command"), "banner applied for a non-hook harness");
  rmSync(dest, { recursive: true, force: true });
});
