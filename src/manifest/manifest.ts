// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// The dependency manifest (plan section 8, scope section 11). Three install kinds:
// A = configure directly (MCP servers, own installers, package-manager installs);
// B = canonical source emitted by the generator; C = deep-research subagents.
// Entries carry generic placeholders only (no captured host, path, or arg values)
// and an honest confidence stamp. Per-OS prerequisites are generic runtime and
// package-manager names; the installer probes for them (see detect.ts). Each entry
// also carries an `install` spec describing HOW setup offers it to the user
// (method + a name-free hint), which buildToolOffers (installer.ts) turns into the
// per-tool install-with-consent or skip-with-instructions offer.

export type DepKind = "A-configure" | "B-generator" | "C-subagent";
export type DepTier = "core" | "recommended" | "optional";
export type Confidence = "runtime-verified" | "docs-verified" | "floor-only";
export type Os = "win32" | "darwin" | "linux";

// How setup helps the user add a companion tool. `builtin` ships with
// conduct-platform; `mcp` is wired into the harness MCP config on consent; the
// rest are external and are offered with an honest, name-free hint (setup never
// auto-installs an external tool: the user runs the command, or skips).
export type InstallMethod = "builtin" | "mcp" | "package" | "plugin" | "subagent";

export interface InstallSpec {
  method: InstallMethod;
  hint: string; // generic, name-free; never a fabricated command
  perOs?: Partial<Record<Os, string>>; // OS-specific note, only where genuinely known
}

export interface DepEntry {
  name: string;
  kind: DepKind;
  tier: DepTier;
  summary: string;
  prereq: string[]; // generic runtime / package-manager names probed before install
  confidence: Confidence; // honest verification state on the home harness
  install: InstallSpec; // how setup offers it
  mcp?: { command: string; args: string[] }; // generic MCP wiring for mcp-method entries
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
    install: { method: "builtin", hint: "Installed directly as part of conduct-platform; nothing separate to add." },
  },
  {
    name: "memory-scaffold",
    kind: "B-generator",
    tier: "core",
    summary: "The layered memory structure plus name-free exemplars.",
    prereq: [],
    confidence: "runtime-verified",
    install: { method: "builtin", hint: "Installed directly as part of conduct-platform; nothing separate to add." },
  },
  {
    name: "recall",
    kind: "A-configure",
    tier: "core",
    summary: "Cross-session memory MCP server (local, SQLite FTS; no API keys).",
    prereq: ["python"],
    confidence: "runtime-verified",
    install: { method: "mcp", hint: "MCP server (needs Python). Added to your harness's MCP config when you accept." },
    mcp: { command: "recall", args: [] },
  },
  {
    name: "beads",
    kind: "A-configure",
    tier: "core",
    summary: "Issue tracker CLI (git-committed JSONL; cross-platform binaries).",
    prereq: ["beads-binary"],
    confidence: "docs-verified",
    install: { method: "package", hint: "A CLI tool (the `bd` binary). Install it for your OS from its own releases; setup detects it once present." },
  },
  {
    name: "loop",
    kind: "B-generator",
    tier: "core",
    summary: "Recurring-task loop tool (native where present, else a wrapper).",
    prereq: [],
    confidence: "docs-verified",
    install: { method: "plugin", hint: "A skill/plugin. Install it through your harness's plugin manager; otherwise a wrapper covers it." },
  },
  {
    name: "prose-scrub",
    kind: "A-configure",
    tier: "core",
    summary: "Prose-scrub tool for cleaning copy before publishing.",
    prereq: ["python"],
    confidence: "docs-verified",
    install: { method: "package", hint: "A CLI tool (needs Python). Install it per its own instructions; setup detects it once present." },
  },
  // Recommended (offered, introduced progressively).
  {
    name: "deep-research",
    kind: "C-subagent",
    tier: "recommended",
    summary: "Fan-out research via native subagents; single-agent fallback.",
    prereq: [],
    confidence: "runtime-verified",
    install: { method: "subagent", hint: "Runs as a subagent where your harness supports them; degrades to a single-agent fallback otherwise." },
  },
  {
    name: "serena",
    kind: "A-configure",
    tier: "recommended",
    summary: "Symbolic code-navigation MCP server.",
    prereq: ["uvx"],
    confidence: "docs-verified",
    install: { method: "mcp", hint: "MCP server (needs uvx). Added to your harness's MCP config when you accept." },
    mcp: { command: "uvx", args: ["--from", "git+serena", "serena", "start-mcp-server"] },
  },
  {
    name: "context7",
    kind: "A-configure",
    tier: "recommended",
    summary: "Up-to-date library docs MCP server.",
    prereq: ["npx"],
    confidence: "runtime-verified",
    install: { method: "mcp", hint: "MCP server (runs via npx). Added to your harness's MCP config when you accept." },
    mcp: { command: "npx", args: ["-y", "@upstash/context7-mcp"] },
  },
  {
    name: "code-review",
    kind: "B-generator",
    tier: "recommended",
    summary: "Parallel code-review subagents (cloud variant is home-only).",
    prereq: [],
    confidence: "docs-verified",
    install: { method: "plugin", hint: "A skill/plugin. Install it through your harness's plugin manager." },
  },
  {
    name: "pfd",
    kind: "B-generator",
    tier: "recommended",
    summary: "Perception-First Design skill set.",
    prereq: [],
    confidence: "docs-verified",
    install: { method: "plugin", hint: "A skill/plugin. Install it through your harness's plugin manager." },
  },
  {
    name: "superpowers",
    kind: "B-generator",
    tier: "recommended",
    summary: "Workflow skill pack (TDD, debugging, planning).",
    prereq: [],
    confidence: "docs-verified",
    install: { method: "plugin", hint: "A skill/plugin. Install it through your harness's plugin manager." },
  },
  {
    name: "feature-dev",
    kind: "B-generator",
    tier: "recommended",
    summary: "Feature-development subagents and command.",
    prereq: [],
    confidence: "docs-verified",
    install: { method: "plugin", hint: "A skill/plugin. Install it through your harness's plugin manager." },
  },
  {
    name: "impeccable",
    kind: "A-configure",
    tier: "recommended",
    summary: "Frontend-design skill (own installer).",
    prereq: ["npx"],
    confidence: "docs-verified",
    install: { method: "package", hint: "Has its own installer (runs via npx). Install it per its own instructions." },
  },
  // Optional.
  {
    name: "voice",
    kind: "A-configure",
    tier: "optional",
    summary: "Writing-voice MCP server (optional).",
    prereq: ["python"],
    confidence: "docs-verified",
    install: { method: "mcp", hint: "MCP server (needs Python). Added to your harness's MCP config when you accept." },
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
