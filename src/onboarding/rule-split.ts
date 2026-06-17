// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// Universal-core vs author-personal rule split (plan section 10). The golden rules
// and the thinking/verification discipline are universal core (installed). The
// memory cadence, the neurotype tuning, and the anti-sycophancy style are OFFERED
// and EXPLAINED ("the author runs this because X; keep, adjust, or drop"), never
// silently installed as law.

export type RuleClass = "universal-core" | "offered-explained";

export interface RuleGroup {
  id: string;
  title: string;
  ruleClass: RuleClass;
  why?: string; // for offered groups: why the author runs it, so the user can choose
}

export const RULE_SPLIT: RuleGroup[] = [
  { id: "golden-rules", title: "The 8 Golden Rules", ruleClass: "universal-core" },
  {
    id: "thinking-verifying",
    title: "Thinking, planning, and verification discipline",
    ruleClass: "universal-core",
  },
  {
    id: "session-memory",
    title: "Session Memory Protocol (continuous-snapshot cadence)",
    ruleClass: "offered-explained",
    why: "The author runs continuous snapshots because context loss between sessions is costly for an ADHD-pattern workflow. It benefits everyone; keep it, tune the cadence, or drop it.",
  },
  {
    id: "neurotype",
    title: "Neurotype tuning",
    ruleClass: "offered-explained",
    why: "The protocol was shaped by an ADHD/autistic workflow. The {{NEUROTYPE}} token tunes tone only; the protocol stays regardless. Set it to your own neurotype or leave it neutral.",
  },
  {
    id: "anti-sycophancy",
    title: "Anti-Sycophancy Protocol",
    ruleClass: "offered-explained",
    why: "The author wants an honest working partner over a validator. Keep it, soften it, or drop it to taste.",
  },
];

export function universalCore(): RuleGroup[] {
  return RULE_SPLIT.filter((g) => g.ruleClass === "universal-core");
}

export function offered(): RuleGroup[] {
  return RULE_SPLIT.filter((g) => g.ruleClass === "offered-explained");
}

// The offer text the bootstrap presents: each offered group with its rationale
// and a keep/adjust/drop choice. Never silently installed.
export function renderOffer(): string {
  const lines = ["These parts are OFFERED, not installed as law. For each: keep, adjust, or drop.\n"];
  for (const g of offered()) {
    lines.push(`- ${g.title}`);
    lines.push(`    Why the author runs it: ${g.why}`);
  }
  return lines.join("\n") + "\n";
}
