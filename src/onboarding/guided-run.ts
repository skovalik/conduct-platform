// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// The guided first-run (plan section 10). It walks the user through one real
// research -> plan -> implement loop, where PLAN is validated by three loops:
// ralph ("will this work"), PFD ("will this make sense"), and the QA pipeline
// ("will this build"). It ends by writing the user's first session snapshot and
// first wiki page WITH them, so the system is demonstrated once, not just present.

export interface GuidedStep {
  n: number;
  title: string;
  intent: string;
  prompt: string;
}

export const GUIDED_RUN: GuidedStep[] = [
  {
    n: 1,
    title: "Research",
    intent: "Gather context before deciding anything.",
    prompt:
      "Pick one real task you have right now. Research it: read the relevant code/docs, pull prior context from recall, and note what you do and do not yet know.",
  },
  {
    n: 2,
    title: "Plan, validated by the ralph loop (will this work)",
    intent: "Stress-test feasibility before committing.",
    prompt:
      "Draft the plan. Run it through the ralph loop: will this actually work? Surface the riskiest assumption and how you would prove it.",
  },
  {
    n: 3,
    title: "Plan, validated by PFD (will this make sense)",
    intent: "Check it lands for the human it is for.",
    prompt:
      "Run the plan through Perception-First Design: will this make sense to the person who has to read, use, or maintain it? Adjust for cognitive load and clarity.",
  },
  {
    n: 4,
    title: "Plan, validated by the QA pipeline (will this build)",
    intent: "Check it survives execution.",
    prompt:
      "Run the plan through the QA pipeline: will this build and pass? Identify the verification each step needs before it can be called done.",
  },
  {
    n: 5,
    title: "Implement",
    intent: "Execute the validated plan, verifying as you go.",
    prompt:
      "Implement the plan. Verify each step at runtime, not by reasoning. Record deviations as you make them.",
  },
  {
    n: 6,
    title: "Write your first session snapshot",
    intent: "Make context loss cheap.",
    prompt:
      "Write a snapshot of what you did, what is unfinished, and the next step, into your sessions area. This is the habit that survives a crash.",
  },
  {
    n: 7,
    title: "Create your first wiki page",
    intent: "Turn a one-off into compounding knowledge.",
    prompt:
      "Capture one durable lesson from this loop as a wiki page, and link it from your memory index.",
  },
  {
    n: 8,
    title: "Close out (run the full save sweep)",
    intent: "Make the whole save sweep one motion, not six things to remember.",
    prompt:
      "End the session with the close-out sweep: snapshot, refresh the memory index's CONTINUE HERE, capture durable lessons as wiki entries, append a log line, refresh the searchable store, and flush the task tracker. The `close-out` command runs all six; 'save', 'done', and 'goodnight' trigger the same sweep. Steps 6 and 7 were two pieces of this; now do the whole thing once, so close-out becomes the motion you reach for at every session end.",
  },
];

export function renderGuidedRun(): string {
  const out: string[] = ["# Guided first run: one real plan-research-implement loop", ""];
  for (const s of GUIDED_RUN) {
    out.push(`## ${s.n}. ${s.title}`);
    out.push(`_${s.intent}_`);
    out.push(s.prompt);
    out.push("");
  }
  out.push(
    "Acceptance: you complete this loop unaided, keep one snapshot plus one wiki page, and run the close-out sweep at the end. That, not 'it installed', is the success criterion.",
  );
  return out.join("\n") + "\n";
}
