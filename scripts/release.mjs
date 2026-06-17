// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// Release helper. Bumps package.json, checks the changelog, runs tests and the
// typecheck, commits the bump, and tags. Cross-OS (Node only, no shell strings).
// Usage: node scripts/release.mjs [patch|minor|major] [--dry-run]
// Prereqs: a clean working tree (commit your edits first) and a CHANGELOG.md
// section for the new version.

import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const bump = process.argv.find((a) => ["patch", "minor", "major"].includes(a)) ?? "patch";
const dryRun = process.argv.includes("--dry-run");

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}
function run(cmd, args) {
  execFileSync(cmd, args, { stdio: "inherit" });
}

// 1. Clean tree (the release commit must contain only the version bump).
if (git(["status", "--porcelain"]).length > 0) {
  console.error("Working tree is dirty. Commit your edits first; release makes its own bump commit.");
  process.exit(1);
}

// 2. Compute the new version.
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(pkg.version);
if (!m) {
  console.error("Unparseable version in package.json: " + pkg.version);
  process.exit(1);
}
let [maj, min, pat] = [Number(m[1]), Number(m[2]), Number(m[3])];
if (bump === "major") { maj++; min = 0; pat = 0; }
else if (bump === "minor") { min++; pat = 0; }
else pat++;
const next = `${maj}.${min}.${pat}`;
console.log(`Version: ${pkg.version} -> ${next}`);

// 3. Changelog gate.
const changelog = readFileSync("CHANGELOG.md", "utf8");
if (!new RegExp("^## " + next.replace(/\./g, "\\.") + "\\b", "m").test(changelog)) {
  console.error(`CHANGELOG.md has no '## ${next}' section. Add one, commit it, then re-run.`);
  process.exit(1);
}

if (dryRun) {
  console.log(`Dry run: would bump to ${next}, run tests and typecheck, commit, and tag v${next}.`);
  process.exit(0);
}

// 4. Verify before shipping.
run("npm", ["test"]);
run("npm", ["run", "typecheck"]);

// 5. Bump, commit, tag.
pkg.version = next;
writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n", "utf8");
git(["add", "package.json"]);
git(["commit", "-m", `Release v${next}`]);
git(["tag", `v${next}`]);

console.log(`Released v${next}. Push with: git push --follow-tags`);
