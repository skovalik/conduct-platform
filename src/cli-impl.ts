// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// The CLI entry (run via bin/cli.mjs, which adds --experimental-strip-types). It is
// non-interactive by design: the agent gathers the token map and per-tool consent
// interactively per the bootstrap procedure, then passes them as a JSON input, and
// this applies the deterministic install. Exit 1 if the verification gate fails.

import { readFileSync } from "node:fs";
import { runVerb, type SetupVerb, type SetupInput } from "./setup/orchestrate.ts";

const VERBS = new Set(["install", "update", "uninstall", "resume", "rollback", "rules"]);

function usage(): never {
  console.error(
    "usage: conduct-platform <install|update|uninstall|resume|rollback|rules> --input <input.json>",
  );
  process.exit(2);
}

const argv = process.argv.slice(2);
const verb = argv[0] ?? "";
if (!VERBS.has(verb)) usage();

const iIdx = argv.indexOf("--input");
if (iIdx < 0 || !argv[iIdx + 1]) usage();

let input: SetupInput;
try {
  input = JSON.parse(readFileSync(argv[iIdx + 1]!, "utf8")) as SetupInput;
} catch (e) {
  console.error("could not read --input JSON: " + (e as Error).message);
  process.exit(2);
}

if (!input.committedAt) {
  console.error(
    "input.committedAt is required: the agent supplies the confirmed date; it is never invented here.",
  );
  process.exit(2);
}

const report = runVerb(verb as SetupVerb, input);
console.log(JSON.stringify(report, null, 2));
process.exit(report.verify && !report.verify.allPass ? 1 : 0);
