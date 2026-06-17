// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// Emission: run the generator (rulesync) to emit per-harness native artifacts
// from the canonical .rulesync/ source, then apply tokenize-LAST substitution
// into the emitted files (plan sections 4-5). rulesync is a swappable backend;
// the AGENTS.md floor and conduct-platform's own Codex/Antigravity emitters are
// the always-owned fallback (Phase 4), so this wrapper isolates the dependency.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { extname } from "node:path";
import { substitute, type EmitFormat } from "./substitute.ts";

export interface GenerateOptions {
  root: string; // directory containing .rulesync/
  targets: string[]; // e.g. ["claudecode", "codexcli", "geminicli", "agentsmd"]
  features: string[]; // e.g. ["rules", "mcp", "commands", "subagents"]
  runner?: string; // override the rulesync runner (default: npx)
}

// Run rulesync. Returns its stdout. Cross-OS npx resolution (npx.cmd on Windows).
// Throws on failure; the caller falls back to the owned emitters.
export function runRulesync(opts: GenerateOptions): string {
  const isWin = process.platform === "win32";
  // npx is a .cmd shim on Windows, and Node refuses to execFile a .cmd without a
  // shell (EINVAL). So run through the shell on Windows and quote the one path
  // argument (the input root, which may contain spaces). On POSIX, no shell.
  const runner = opts.runner ?? "npx";
  const inputRoot = isWin ? `"${opts.root}"` : opts.root;
  const args = [
    "-y",
    "rulesync@latest",
    "generate",
    "-t",
    opts.targets.join(","),
    "-f",
    opts.features.join(","),
    "--input-root",
    inputRoot,
  ];
  return execFileSync(runner, args, {
    cwd: opts.root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    shell: isWin,
  });
}

export function formatFor(path: string): EmitFormat | null {
  const e = extname(path).toLowerCase();
  if (e === ".md") return "markdown";
  if (e === ".json") return "json";
  if (e === ".toml") return "toml";
  return null;
}

export interface SubstitutedFile {
  path: string;
  substituted: string[];
  missing: string[];
}

// Tokenize-last: walk the emitted files and substitute token values into each,
// escaped for that file's format. Files of unknown format are skipped.
export function substituteEmitted(
  files: string[],
  tokenMap: Record<string, string>,
): SubstitutedFile[] {
  const results: SubstitutedFile[] = [];
  for (const file of files) {
    const fmt = formatFor(file);
    if (!fmt) continue;
    const r = substitute(readFileSync(file, "utf8"), fmt, tokenMap);
    if (r.substituted.length > 0) writeFileSync(file, r.output, "utf8");
    results.push({ path: file, substituted: r.substituted, missing: r.missing });
  }
  return results;
}
