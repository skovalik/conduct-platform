// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// The dependency manifest (plan section 8, scope section 11). Three install kinds:
// A = configure directly (MCP servers, own installers, package-manager installs);
// B = canonical source emitted by the generator; C = deep-research subagents.
// Entries carry generic placeholders only (no captured host, path, or arg values)
// and an honest confidence stamp. Per-OS prerequisites are generic runtime and
// package-manager names; the installer probes for them (see detect.ts).

export type DepKind = "A-configure" | "B-generator" | "C-subagent";
export type DepTier = "core" | "recommended" | "optional";
export type Confidence = "runtime-verified" | "docs-verified" | "floor-only";
export type Os = "win32" | "darwin" | "linux";

export interface DepEntry {
  name: string;
  kind: DepKind;
  tier: DepTier;
  summary: string;
  prereq: string[]; // generic runtime / package-manager names probed before install
  confidence: Confidence; // honest verification state on the home harness
  mcp?: { command: string; args: string[] }; // generic MCP wiring for A entries
}

export const MANIFEST: DepEntry[] = [
  // Core (shipped).
  {
    name: "operating-rules",
    kind: "B-generator",
    tier: "core",
    summary: "The operating rules and memory protocol, emitted per harness.",
    prereq: ["node"],
    confidence: "runtime-verified",
  },
  {
    name: "memory-scaffold",
    kind: "B-generator",
    tier: "core",
    summary: "The layered memory structure plus name-free exemplars.",
    prereq: [],
    confidence: "runtime-verified",
  },
  {
    name: "recall",
    kind: "A-configure",
    tier: "core",
    summary: "Cross-session memory MCP server (local, SQLite FTS; no API keys).",
    prereq: ["python"],
    confidence: "runtime-verified",
    mcp: { command: "recall", args: [] },
  },
  {
    name: "beads",
    kind: "A-configure",
    tier: "core",
    summary: "Issue tracker CLI (git-committed JSONL; cross-platform binaries).",
    prereq: ["beads-binary"],
    confidence: "docs-verified",
  },
  {
    name: "loop",
    kind: "B-generator",
    tier: "core",
    summary: "Recurring-task loop tool (native where present, else a wrapper).",
    prereq: [],
    confidence: "docs-verified",
  },
  {
    name: "prose-scrub",
    kind: "A-configure",
    tier: "core",
    summary: "Prose-scrub tool for cleaning copy before publishing.",
    prereq: ["python"],
    confidence: "docs-verified",
  },
  // Recommended (offered, introduced progressively).
  {
    name: "deep-research",
    kind: "C-subagent",
    tier: "recommended",
    summary: "Fan-out research via native subagents; single-agent fallback.",
    prereq: [],
    confidence: "runtime-verified",
  },
  {
    name: "serena",
    kind: "A-configure",
    tier: "recommended",
    summary: "Symbolic code-navigation MCP server.",
    prereq: ["uvx"],
    confidence: "docs-verified",
    mcp: { command: "uvx", args: ["--from", "git+serena", "serena", "start-mcp-server"] },
  },
  {
    name: "context7",
    kind: "A-configure",
    tier: "recommended",
    summary: "Up-to-date library docs MCP server.",
    prereq: ["npx"],
    confidence: "runtime-verified",
    mcp: { command: "npx", args: ["-y", "@upstash/context7-mcp"] },
  },
  {
    name: "code-review",
    kind: "B-generator",
    tier: "recommended",
    summary: "Parallel code-review subagents (cloud variant is home-only).",
    prereq: [],
    confidence: "docs-verified",
  },
  {
    name: "pfd",
    kind: "B-generator",
    tier: "recommended",
    summary: "Perception-First Design skill set.",
    prereq: [],
    confidence: "docs-verified",
  },
  {
    name: "superpowers",
    kind: "B-generator",
    tier: "recommended",
    summary: "Workflow skill pack (TDD, debugging, planning).",
    prereq: [],
    confidence: "docs-verified",
  },
  {
    name: "feature-dev",
    kind: "B-generator",
    tier: "recommended",
    summary: "Feature-development subagents and command.",
    prereq: [],
    confidence: "docs-verified",
  },
  {
    name: "impeccable",
    kind: "A-configure",
    tier: "recommended",
    summary: "Frontend-design skill (own installer).",
    prereq: ["npx"],
    confidence: "docs-verified",
  },
  // Optional.
  {
    name: "voice",
    kind: "A-configure",
    tier: "optional",
    summary: "Writing-voice MCP server (optional).",
    prereq: ["python"],
    confidence: "docs-verified",
    mcp: { command: "voice", args: [] },
  },
];

export function byTier(tier: DepTier): DepEntry[] {
  return MANIFEST.filter((e) => e.tier === tier);
}

export function byKind(kind: DepKind): DepEntry[] {
  return MANIFEST.filter((e) => e.kind === kind);
}

export function allPrereqs(entries: DepEntry[] = MANIFEST): string[] {
  return [...new Set(entries.flatMap((e) => e.prereq))];
}
