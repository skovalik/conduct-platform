// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// The wired emission entry point: try the generator (rulesync), and on any failure
// fall back to conduct-platform's own owned emitters so the core never depends on
// the generator (plan section 5). This is what composes runRulesync + the owned
// Codex/Antigravity emitters + the AGENTS.md floor + the hand-emitted hook into one
// call the orchestrator uses. It operates on a STAGING dir (which already holds a
// `.rulesync/`), never the destination, so an existing user file is never touched
// here; the lifecycle merges staging into the destination later.
//
// Honest fallback coverage: the owned fallback emits Codex natively (rules + MCP +
// agents) and the AGENTS.md floor for every other harness. Antigravity is
// floor-only by decision 13.12. Gemini-and-beyond RICH components depend on the
// generator; if it dies, those harnesses get the AGENTS.md floor.

import { writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { runRulesync } from "./generate.ts";
import { readCanonical, type Canonical } from "./emitters/canonical.ts";
import { emitCodex } from "./emitters/codex.ts";
import { emitAntigravity } from "./emitters/antigravity.ts";
import { emitHook } from "./hooks.ts";

export interface EmitRealOptions {
  hook?: boolean; // emit the SessionStart hook config for this harness
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

// The native output paths rulesync writes per harness (canonical-source-schema.md
// emission map). rulesync returns stdout, not a file list, so we discover what it
// wrote by scanning these known single files and component directories.
const OUTPUT_MAP: Record<string, { files: string[]; dirs: { dir: string; ext: string }[] }> = {
  claude: {
    files: ["CLAUDE.md", "AGENTS.md", ".mcp.json"],
    dirs: [{ dir: ".claude/commands", ext: ".md" }, { dir: ".claude/agents", ext: ".md" }],
  },
  codex: {
    files: ["AGENTS.md", ".codex/config.toml"],
    dirs: [{ dir: ".codex/agents", ext: ".toml" }],
  },
  gemini: {
    files: ["GEMINI.md", "AGENTS.md", ".gemini/settings.json"],
    dirs: [{ dir: ".gemini/commands", ext: ".toml" }, { dir: ".gemini/agents", ext: ".md" }],
  },
};

function discoverEmitted(root: string, harness: string): string[] {
  const map = OUTPUT_MAP[harness] ?? { files: ["AGENTS.md"], dirs: [] };
  const found: string[] = [];
  for (const f of map.files) {
    const p = join(root, f);
    if (existsSync(p)) found.push(p);
  }
  for (const d of map.dirs) {
    const dir = join(root, d.dir);
    try {
      for (const e of readdirSync(dir)) {
        if (e.toLowerCase().endsWith(d.ext)) found.push(join(dir, e));
      }
    } catch {
      // dir absent: nothing emitted for this component
    }
  }
  return [...new Set(found)];
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

// Emit the SessionStart hook config into staging (where the harness supports
// hooks). The launcher script install is the orchestrator's job (a destination
// action). Banner-only harnesses prepend a notice to AGENTS.md instead.
function emitHookConfig(root: string, harness: string): { files: string[]; notes: string[] } {
  const h = emitHook(harness);
  const files: string[] = [];
  const notes: string[] = [];
  if (h.supportsHooks && h.configPath && h.config !== undefined) {
    writeAtomic(join(root, h.configPath), JSON.stringify(h.config, null, 2) + "\n");
    files.push(join(root, h.configPath));
    notes.push(`hook: ${harness} SessionStart config emitted (${h.confidence}).`);
  } else if (h.bannerOnly && h.banner) {
    notes.push(`hook: ${harness} has no startup hook; the AGENTS.md banner is the degradation (applied at install).`);
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
    files = discoverEmitted(stagingRoot, harness);
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

  if (opts.hook) {
    const hk = emitHookConfig(stagingRoot, harness);
    files.push(...hk.files);
    notes.push(...hk.notes);
  }

  return { files: [...new Set(files)], usedFallback, notes };
}
