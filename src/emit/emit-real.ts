// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// The wired emission entry point: try the generator (rulesync), and on any failure
// fall back to conduct-platform's own owned emitters so the core never depends on
// the generator (plan section 5). This composes runRulesync + the owned Codex and
// Antigravity emitters + the AGENTS.md floor into one call the orchestrator uses.
// It operates on a STAGING dir (which already holds a `.rulesync/`), never the
// destination, so an existing user file is never touched here; the lifecycle
// merges staging into the destination later. (The SessionStart hook and banner are
// handled by the orchestrator, which knows the destination path the launcher needs.)
//
// Honest fallback coverage: the owned fallback emits Codex natively (rules + MCP +
// agents) and the AGENTS.md floor for every other harness. Antigravity is
// floor-only by decision 13.12. Gemini-and-beyond RICH components depend on the
// generator; if it dies, those harnesses get the AGENTS.md floor.

import { writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { runRulesync } from "./generate.ts";
import { readCanonical, type Canonical } from "./emitters/canonical.ts";
import { emitCodex } from "./emitters/codex.ts";
import { emitAntigravity } from "./emitters/antigravity.ts";

export interface EmitRealOptions {
  runner?: string; // override the rulesync runner (tests force a failure to exercise the fallback)
}

export interface EmitRealResult {
  files: string[]; // absolute staging paths that were emitted
  usedFallback: boolean;
  notes: string[];
}

// rulesync targets per harness, always including the AGENTS.md floor.
function targetsFor(harness: string): string[] {
  if (harness === "claude") return ["claudecode", "agentsmd"];
  if (harness === "codex") return ["codexcli", "agentsmd"];
  if (harness === "gemini") return ["geminicli", "agentsmd"];
  return ["agentsmd"];
}

// Discover what the generator emitted: scan staging for text files, excluding the
// `.rulesync/` source. rulesync returns stdout (not a file list), and its output
// paths vary by harness and version, so a content scan is more robust than a fixed
// path map: it never misses a new output file. (The fallback returns its own list,
// so this runs only after a successful generator pass.)
function discoverEmitted(root: string): string[] {
  const found: string[] = [];
  const walk = (dir: string): void => {
    for (const e of readdirSync(dir)) {
      if (e === ".rulesync") continue; // the input, not output
      const p = join(dir, e);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(md|json|toml)$/i.test(e)) found.push(p);
    }
  };
  walk(root);
  return found;
}

function writeAtomic(path: string, content: string): void {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(path, content, "utf8");
}

function agentsFloor(c: Canonical): string {
  return c.rules.map((r) => r.body.trimEnd()).join("\n\n") + "\n";
}

// Owned fallback: Codex gets the full native shape; Antigravity is floor-only;
// every other harness gets the AGENTS.md floor (rich components need the generator).
function ownedFallback(root: string, harness: string, c: Canonical): { files: string[]; notes: string[] } {
  const files: string[] = [];
  const notes: string[] = [];
  if (harness === "codex") {
    for (const [rel, content] of emitCodex(c)) {
      writeAtomic(join(root, rel), content);
      files.push(join(root, rel));
    }
    notes.push("owned Codex fallback: rules + MCP + agents emitted natively.");
  } else if (harness === "antigravity") {
    const agy = emitAntigravity(c);
    for (const [rel, content] of agy.files) {
      writeAtomic(join(root, rel), content);
      files.push(join(root, rel));
    }
    notes.push(...agy.notes);
  } else {
    writeAtomic(join(root, "AGENTS.md"), agentsFloor(c));
    files.push(join(root, "AGENTS.md"));
    notes.push(`owned fallback for ${harness}: AGENTS.md floor only (rich components need the generator).`);
  }
  return { files, notes };
}

export function emitReal(stagingRoot: string, harness: string, opts: EmitRealOptions = {}): EmitRealResult {
  const targets = targetsFor(harness);
  const features = ["rules", "mcp", "commands", "subagents"];
  let files: string[] = [];
  let usedFallback = false;
  const notes: string[] = [];

  try {
    runRulesync({ root: stagingRoot, targets, features, runner: opts.runner });
    files = discoverEmitted(stagingRoot);
    if (files.length === 0) throw new Error("generator produced no discoverable output");
    notes.push(`generator emitted ${files.length} file(s) for ${harness}.`);
  } catch (err) {
    usedFallback = true;
    notes.push(`generator unavailable (${(err as Error).message}); using the owned fallback.`);
    const canonical = readCanonical(join(stagingRoot, ".rulesync"));
    const fb = ownedFallback(stagingRoot, harness, canonical);
    files = fb.files;
    notes.push(...fb.notes);
  }

  return { files: [...new Set(files)], usedFallback, notes };
}
