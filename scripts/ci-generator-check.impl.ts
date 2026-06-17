// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// The strip-types implementation behind ci-generator-check.mjs. Runs the real
// generator through the orchestrator and asserts it did NOT fall back and the gate
// passed. Exit 1 on any failure so CI goes red.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runSetup } from "../src/setup/orchestrate.ts";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const dest = mkdtempSync(join(tmpdir(), "cp-ci-gen-"));

try {
  const report = runSetup({
    root: dest,
    scope: "project",
    harness: "claude",
    tokenMap: {
      USER_NAME: "CI", ROLE_BACKGROUND: "ci", USER_FOCUS: "ci", NEUROTYPE: "neutral",
      OS: "linux", SHELL: "bash", WORKSPACE_ROOT: "/ci", MEMORY_PATH: "/ci/memory",
      TASK_TRACKER: "none", REFERENCE_FILES: "none", COMMIT_ATTRIBUTION: "single-author",
      SCREENSHOT_PATH: "/tmp", DETECTED_TOOLING: "none",
    },
    tiers: ["core"],
    acceptedTools: [],
    committedAt: "2026-01-01",
    packageRoot: REPO,
    statePath: join(dest, "state.json"),
  });

  const note = report.notes.find((n) => /generator/i.test(n)) ?? "(no generator note)";
  if (report.usedFallback) {
    console.error("FAIL: the generator fell back (rulesync did not run through the orchestrator).");
    console.error("  " + note);
    console.error("  This is the npx-spawn / generator-broken class of bug the guard exists to catch.");
    process.exit(1);
  }
  if (!report.verify || !report.verify.allPass) {
    console.error("FAIL: the verification gate did not pass after a real emit.");
    console.error("  " + JSON.stringify(report.verify?.checks));
    process.exit(1);
  }
  console.log("OK: real rulesync emitted through the orchestrator and the gate passed.");
  console.log("  " + note);
} finally {
  rmSync(dest, { recursive: true, force: true });
}
