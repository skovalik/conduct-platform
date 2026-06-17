// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// The orchestrator: the single entry point that composes the engine into a real
// install. It is the integration layer the engine was missing. Interaction stays
// with the agent (it gathers the token map + tool consent per the bootstrap
// procedure); this is the deterministic, testable half.
//
// Flow: stage the canonical source (never the destination) -> write the effective
// MCP set (core + accepted optional) -> emit (generator, else owned fallback) ->
// tokenize-last across emitted + corpus + scaffold -> remap staging paths to the
// destination -> lifecycle merge into the user's files (never clobbering) -> verify
// the gate scoped to ONLY our installed artifacts. Staging keeps an existing user
// file intact until the merge reads its original (fixes the emit-into-destination
// clobber); the gate scope keeps it from ever reading the user's unrelated files.

import {
  mkdtempSync,
  cpSync,
  writeFileSync,
  existsSync,
  readdirSync,
  statSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { emitReal } from "../emit/emit-real.ts";
import { formatFor, substituteEmitted } from "../emit/generate.ts";
import { readCanonical } from "../emit/emitters/canonical.ts";
import {
  buildToolOffers,
  effectiveMcpServers,
  payloadFromEmitted,
  corpusArtifacts,
  scaffoldArtifacts,
  type ToolOffer,
} from "../install/installer.ts";
import {
  install as lifecycleInstall,
  uninstall as lifecycleUninstall,
  type Payload,
  type PayloadArtifact,
  type OpResult,
} from "../lifecycle/lifecycle.ts";
import { verifyInstall, type VerifyResult } from "../verify/gate.ts";
import { discoverabilitySheet } from "../onboarding/discoverability.ts";
import { renderGuidedRun } from "../onboarding/guided-run.ts";
import { renderOffer } from "../onboarding/rule-split.ts";
import type { DepTier } from "../manifest/manifest.ts";
import type { Scope } from "../lifecycle/types.ts";

export type SetupVerb = "install" | "update" | "uninstall" | "resume" | "rollback" | "rules";

export interface SetupInput {
  root: string; // destination (project root or harness config dir)
  scope: Scope;
  harness: string;
  tokenMap: Record<string, string>;
  tiers: DepTier[];
  acceptedTools?: string[]; // names the user consented to (mcp tools get wired)
  hook?: boolean;
  committedAt: string; // supplied by the agent; never invented here
  packageRoot?: string; // where .rulesync/payload/scaffold live; default cwd
  statePath?: string; // override the install-state path (tests isolate it)
  emitRunner?: string; // test seam: a failing runner forces the owned fallback
}

export interface Onboarding {
  discoverability: string;
  guidedRun: string;
  ruleOffer: string;
}

export interface SetupReport {
  verb: SetupVerb;
  op?: OpResult;
  verify?: VerifyResult;
  offers: ToolOffer[];
  usedFallback: boolean;
  onboarding: Onboarding;
  notes: string[];
}

const SEEDED = new Set(["CONTINUE_HERE"]); // seeded, not filled at install

function listText(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) listText(p, acc);
    else if (formatFor(p)) acc.push(p);
  }
  return acc;
}

function onboarding(): Onboarding {
  return {
    discoverability: discoverabilitySheet(),
    guidedRun: renderGuidedRun(),
    ruleOffer: renderOffer(),
  };
}

// install (and update: the lifecycle replaces our recorded regions in place).
export function runSetup(input: SetupInput): SetupReport {
  const pkg = input.packageRoot ?? process.cwd();
  const accepted = input.acceptedTools ?? [];
  const dest = input.root;
  const notes: string[] = [];
  const offers = buildToolOffers(input.tiers);

  const staging = mkdtempSync(join(tmpdir(), "cp-staging-"));
  try {
    // 1. stage the canonical source (so emission never touches the destination)
    cpSync(join(pkg, ".rulesync"), join(staging, ".rulesync"), { recursive: true });

    // 2. effective MCP set (core + accepted optional) -> staged mcp.json
    const core = readCanonical(join(staging, ".rulesync")).mcpServers;
    const eff = effectiveMcpServers(core, accepted);
    writeFileSync(
      join(staging, ".rulesync", "mcp.json"),
      JSON.stringify({ mcpServers: eff }, null, 2) + "\n",
      "utf8",
    );

    // 3. emit into staging (generator, else the owned fallback)
    const emit = emitReal(staging, input.harness, { hook: input.hook, runner: input.emitRunner });
    notes.push(...emit.notes);

    // 4. stage the corpus + scaffold so they are substituted and laid down too
    const stagedMemory = join(staging, "memory");
    if (existsSync(join(pkg, "payload", "memory"))) {
      cpSync(join(pkg, "payload", "memory"), stagedMemory, { recursive: true });
    }
    const stagedScaffold = join(staging, "scaffold");
    if (existsSync(join(pkg, "scaffold"))) {
      cpSync(join(pkg, "scaffold"), stagedScaffold, { recursive: true });
    }

    // 5. tokenize-last across emitted + corpus + scaffold; seeded tokens stay
    const missing = new Set<string>();
    const toFill = [...emit.files, ...listText(stagedMemory), ...listText(stagedScaffold)];
    for (const s of substituteEmitted(toFill, input.tokenMap)) {
      for (const m of s.missing) if (!SEEDED.has(m)) missing.add(m);
    }
    if (missing.size) notes.push(`unfilled token value(s): ${[...missing].join(", ")}`);

    // 6. build artifacts with DESTINATION paths (content read from staging)
    const artifacts: PayloadArtifact[] = [];
    for (const a of payloadFromEmitted(emit.files)) {
      artifacts.push({ ...a, path: join(dest, relative(staging, a.path)) });
    }
    artifacts.push(...corpusArtifacts(stagedMemory, join(dest, "memory")));
    artifacts.push(...scaffoldArtifacts(stagedScaffold, join(dest, "memory")));

    // 7. merge into the destination (never clobbering the user's own content)
    const payload: Payload = {
      harness: input.harness,
      scope: input.scope,
      root: dest,
      formatVersion: "0.0.0",
      tokenMap: input.tokenMap,
      artifacts,
    };
    const op = lifecycleInstall(payload, input.committedAt, input.statePath);
    notes.push(...op.notes);

    // 8. verify, scoped to ONLY our installed artifacts (never the user's tree).
    // The lifecycle commits as its last write, so we gate after and roll back on
    // failure: a failed gate never leaves a verified-looking install behind.
    const installedPaths = op.record?.artifacts.map((a) => a.path) ?? [];
    const verify = verifyInstall(dest, { files: installedPaths });
    if (!verify.allPass) {
      const rb = lifecycleUninstall(dest, input.harness, {}, input.statePath);
      notes.push("verification gate failed; rolled back the install (nothing verified left behind).");
      notes.push(...rb.notes);
    }

    return {
      verb: "install",
      op,
      verify,
      offers,
      usedFallback: emit.usedFallback,
      onboarding: onboarding(),
      notes,
    };
  } finally {
    rmSync(staging, { recursive: true, force: true });
  }
}

// Verb dispatch. install/update/resume run the (idempotent) install; uninstall and
// rollback remove only our recorded content; rules re-asserts without file changes.
export function runVerb(verb: SetupVerb, input: SetupInput): SetupReport {
  switch (verb) {
    case "install":
    case "update":
    case "resume":
      return { ...runSetup(input), verb };
    case "uninstall":
    case "rollback": {
      const op = lifecycleUninstall(input.root, input.harness, {}, input.statePath);
      return { verb, op, offers: [], usedFallback: false, onboarding: onboarding(), notes: op.notes };
    }
    case "rules":
      return {
        verb,
        offers: buildToolOffers(input.tiers),
        usedFallback: false,
        onboarding: onboarding(),
        notes: ["rules re-asserted into the session (no file changes)"],
      };
  }
}
