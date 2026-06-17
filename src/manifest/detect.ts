// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// Per-OS prerequisite and package-manager detection (plan section 8). Probes for
// each generic runtime/tool by trying a version command. The installer uses this
// to install-with-consent or skip-with-instructions, per OS. Read-only.

import { execFileSync } from "node:child_process";
import type { Os } from "./manifest.ts";

export function currentOs(): Os {
  const p = process.platform;
  if (p === "win32") return "win32";
  if (p === "darwin") return "darwin";
  return "linux";
}

// Probe a command by running a version flag. shell:true on Windows so .cmd/.bat
// shims (npm, npx) resolve. Any throw means absent.
export function isPresent(cmd: string, versionArg: string = "--version"): boolean {
  try {
    if (process.platform === "win32") {
      // npm/npx/etc. are .cmd shims; Node refuses to execFile a .cmd without a
      // shell. Pass ONE command string (cmd is a known tool name, not user input)
      // rather than an args array with shell:true (Node DEP0190).
      execFileSync(`${cmd} ${versionArg}`, { stdio: "ignore", shell: true, timeout: 15000 });
    } else {
      execFileSync(cmd, [versionArg], { stdio: "ignore", timeout: 15000 });
    }
    return true;
  } catch {
    return false;
  }
}

// Map a generic prereq name to the command(s) that satisfy it.
const PREREQ_COMMANDS: Record<string, string[]> = {
  node: ["node"],
  npx: ["npx"],
  npm: ["npm"],
  git: ["git"],
  python: ["python", "python3"],
  uvx: ["uvx"],
  "beads-binary": ["bd", "beads"],
};

export function prereqPresent(prereq: string): boolean {
  const cmds = PREREQ_COMMANDS[prereq] ?? [prereq];
  return cmds.some((c) => isPresent(c));
}

export interface DetectResult {
  os: Os;
  present: Record<string, boolean>;
  missing: string[];
}

export function detect(prereqs: string[]): DetectResult {
  const present: Record<string, boolean> = {};
  const missing: string[] = [];
  for (const p of prereqs) {
    const ok = prereqPresent(p);
    present[p] = ok;
    if (!ok) missing.push(p);
  }
  return { os: currentOs(), present, missing };
}

// The package managers worth probing per OS, in preference order.
export function packageManagersForOs(os: Os): string[] {
  if (os === "win32") return ["winget", "scoop", "choco"];
  if (os === "darwin") return ["brew"];
  return ["apt", "dnf", "pacman", "zypper"];
}

export function detectPackageManagers(): { os: Os; available: string[] } {
  const os = currentOs();
  const available = packageManagersForOs(os).filter((m) =>
    isPresent(m, m === "apt" ? "--version" : "--version"),
  );
  return { os, available };
}
