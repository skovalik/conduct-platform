#!/usr/bin/env node
// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// CLI launcher: respawn node with --experimental-strip-types so the TypeScript
// entry runs on every OS. npm's generated Windows .cmd shim invokes `node <bin>`
// without the flag, so a TypeScript bin would fail there; this .mjs shim carries
// the flag explicitly and forwards argv + exit code.

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const entry = join(here, "..", "src", "cli-impl.ts");
const res = spawnSync(process.execPath, ["--experimental-strip-types", entry, ...process.argv.slice(2)], {
  stdio: "inherit",
});
// Propagate a signal kill as a signal (so Ctrl+C and SIGTERM are not masked as a
// plain exit 1, which a caller could not distinguish from a gate failure).
if (res.signal) {
  process.kill(process.pid, res.signal);
}
process.exit(res.status ?? 1);
