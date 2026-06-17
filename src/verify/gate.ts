// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// The post-install verification gate (conduct's Phase-5 gate, adapted). After an
// install personalizes the files, this runs before the install is marked complete
// (the lifecycle commit point). On any failure the install stays incomplete. This
// gate checks install COMPLETENESS plus secret-shaped values; proper-noun and PII
// checks are out of its scope.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { TOKEN_NAMES } from "../emit/substitute.ts";

export interface Check {
  name: string;
  pass: boolean;
  detail: string;
}
export interface VerifyResult {
  checks: Check[];
  allPass: boolean;
}

const SECRET_RES: RegExp[] = [
  /\bsk-[A-Za-z0-9_-]{20,}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bAIza[0-9A-Za-z_-]{35}\b/,
  /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/,
];

// Residual in-band markers that must not survive into a finished install:
// conduct's KIT_STATUS / BOOTSTRAP_STATUS, a literal plugin-path var, or any
// unresolved shell-style ${...}.
const MARKER_RES: RegExp[] = [
  /KIT_STATUS/,
  /BOOTSTRAP_STATUS/,
  /CLAUDE_PLUGIN_ROOT/,
  /\$\{[A-Za-z_]/,
];

const TEXT_EXT = [".md", ".json", ".toml", ".txt", ".yml", ".yaml"];

function walk(root: string, acc: string[]): string[] {
  let entries: string[];
  try {
    entries = readdirSync(root);
  } catch {
    return acc;
  }
  for (const e of entries) {
    if (e === "node_modules" || e === ".git") continue;
    const p = join(root, e);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(p, acc);
    else if (TEXT_EXT.some((x) => e.toLowerCase().endsWith(x))) acc.push(p);
  }
  return acc;
}

function existsFile(p: string): boolean {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
}

export function verifyInstall(
  root: string,
  opts: { seededTokens?: string[]; files?: string[] } = {},
): VerifyResult {
  // With an explicit file list (the install record's artifacts) scan ONLY those,
  // so the gate never reads or false-fails on the user's unrelated files. Without
  // it, walk(root) keeps the simple whole-tree mode (used by the unit tests).
  const files = opts.files
    ? opts.files.filter((f) => TEXT_EXT.some((x) => f.toLowerCase().endsWith(x)) && existsFile(f))
    : walk(root, []);
  const seeded = new Set(opts.seededTokens ?? ["CONTINUE_HERE"]);
  const checks: Check[] = [];

  // 1. No leftover tokens (an unfilled {{TOKEN}} means a partial install).
  const tokenHits: string[] = [];
  for (const f of files) {
    const t = readFileSync(f, "utf8");
    for (const name of TOKEN_NAMES) {
      if (seeded.has(name)) continue;
      if (t.includes("{{" + name + "}}")) tokenHits.push(`${relative(root, f)} {{${name}}}`);
    }
  }
  checks.push({
    name: "no-leftover-tokens",
    pass: tokenHits.length === 0,
    detail: tokenHits.slice(0, 5).join("; ") || "no unfilled tokens",
  });

  // 2. No residual markers or plugin-path literals.
  const markerHits: string[] = [];
  for (const f of files) {
    const t = readFileSync(f, "utf8");
    if (MARKER_RES.some((re) => re.test(t))) markerHits.push(relative(root, f));
  }
  checks.push({
    name: "no-residual-markers",
    pass: markerHits.length === 0,
    detail: [...new Set(markerHits)].slice(0, 5).join("; ") || "no markers or plugin-path literals",
  });

  // 3. Relative markdown links resolve (the memory index points to real files).
  const broken: string[] = [];
  for (const f of files.filter((x) => x.toLowerCase().endsWith(".md"))) {
    const t = readFileSync(f, "utf8");
    const linkRe = /\]\(([^)]+\.md)\)/g;
    let m: RegExpExecArray | null;
    while ((m = linkRe.exec(t)) !== null) {
      const target = m[1]!;
      if (/^[a-z]+:/i.test(target)) continue; // skip URLs
      try {
        statSync(join(dirname(f), target));
      } catch {
        broken.push(`${relative(root, f)} -> ${target}`);
      }
    }
  }
  checks.push({
    name: "links-resolve",
    pass: broken.length === 0,
    detail: broken.slice(0, 5).join("; ") || "all relative links resolve",
  });

  // 4. No secret-shaped values.
  const secretHits: string[] = [];
  for (const f of files) {
    const t = readFileSync(f, "utf8");
    if (SECRET_RES.some((re) => re.test(t))) secretHits.push(relative(root, f));
  }
  checks.push({
    name: "no-secrets",
    pass: secretHits.length === 0,
    detail: [...new Set(secretHits)].slice(0, 5).join("; ") || "no secret-shaped values",
  });

  return { checks, allPass: checks.every((c) => c.pass) };
}
