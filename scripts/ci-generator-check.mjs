#!/usr/bin/env node
// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// CI guard for the generator path. Runs the orchestrator with the REAL generator
// (no forced fallback) into a temp dir and FAILS if it fell back or the gate did
// not pass. This is what would have caught the Windows npx-spawn (EINVAL) bug:
// without it, the rulesync emit could break and silently degrade to the floor on
// a whole platform. Requires network (npx fetches rulesync), which CI has.
// Run: node scripts/ci-generator-check.mjs   (it respawns with strip-types).

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const impl = join(here, "ci-generator-check.impl.ts");
const res = spawnSync(process.execPath, ["--experimental-strip-types", impl, ...process.argv.slice(2)], {
  stdio: "inherit",
});
if (res.signal) process.kill(process.pid, res.signal);
process.exit(res.status ?? 1);
