// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// The one-screen discoverability sheet (plan section 10): "what you now have and
// when to reach for each", generated from the dependency manifest (otherwise read
// only by the installer). The minimal start-here set (rules, memory, recall,
// beads) is highlighted; heavier tools are introduced as the user hits the need.

import { MANIFEST, byTier, type DepTier } from "../manifest/manifest.ts";

export const START_HERE = ["operating-rules", "memory-scaffold", "recall", "beads"];

const REACH_FOR: Record<string, string> = {
  "operating-rules": "always on: how the agent plans, verifies, and communicates",
  "memory-scaffold": "always on: where session state and compounding knowledge live",
  recall: "when you ask 'have we done this before?' or 'what did we decide about X?'",
  beads: "when you need to track ready / in-progress work across sessions",
  "deep-research": "when a question needs multi-source, fact-checked research",
  serena: "when navigating a large codebase by symbol instead of raw file reads",
  context7: "when you need current library or framework docs",
  "code-review": "before merging: parallel review of the diff",
  pfd: "when designing or evaluating a UI, page, or piece of copy",
  superpowers: "for disciplined TDD, debugging, and planning workflows",
  "feature-dev": "when building a feature with architecture focus",
  impeccable: "for distinctive frontend design",
  "loop": "when running a task or check on a recurring interval",
  "prose-scrub": "before publishing copy, to strip LLM tells",
  voice: "when drafting in your established writing voice",
};

export function discoverabilitySheet(): string {
  const out: string[] = ["# What you now have, and when to reach for each", ""];
  const tiers: DepTier[] = ["core", "recommended", "optional"];
  for (const tier of tiers) {
    const entries = byTier(tier);
    if (!entries.length) continue;
    out.push(`## ${tier[0]!.toUpperCase() + tier.slice(1)}`);
    for (const e of entries) {
      const star = START_HERE.includes(e.name) ? " (start here)" : "";
      out.push(`- ${e.name}${star}: ${REACH_FOR[e.name] ?? e.summary}`);
    }
    out.push("");
  }
  out.push(
    "Start with the four marked (start here). The rest are introduced as you hit the need, not all at once.",
  );
  out.push("");
  out.push("## Built-in commands");
  for (const c of BUILTIN_COMMANDS) out.push(`- ${c.name}: ${c.when}`);
  return out.join("\n") + "\n";
}

// conduct-platform's own slash commands (not external dependencies, so not in
// the manifest). Surfaced here so close-out is discoverable, not just documented.
// deep-research is a subagent, not a command, and is already listed via the
// manifest, so it is intentionally not here.
export const BUILTIN_COMMANDS = [
  { name: "setup", when: "to install, update, or re-assert the rules and memory scaffold" },
  {
    name: "close-out",
    when: "at session end (or 'save' / 'done' / 'goodnight'): run the full save sweep so nothing is lost",
  },
];

export function manifestToolNames(): string[] {
  return MANIFEST.map((e) => e.name);
}
