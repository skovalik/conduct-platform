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
  readFileSync,
  existsSync,
  readdirSync,
  statSync,
  mkdirSync,
  copyFileSync,
  chmodSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, dirname } from "node:path";
import { emitReal } from "../emit/emit-real.ts";
import { emitHook, AGENTS_BANNER } from "../emit/hooks.ts";
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
import { MANIFEST, type DepTier } from "../manifest/manifest.ts";
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
    const emit = emitReal(staging, input.harness, { runner: input.emitRunner });
    notes.push(...emit.notes);

    // Honesty: a non-Codex fallback is the AGENTS.md floor only, so any accepted
    // MCP tools were written to the staged mcp.json but not emitted. Say so.
    if (emit.usedFallback && input.harness !== "codex") {
      const mcpAccepted = accepted.filter((n) =>
        MANIFEST.some((e) => e.name === n && e.install.method === "mcp"),
      );
      if (mcpAccepted.length) {
        notes.push(
          `accepted MCP tool(s) not wired in the ${input.harness} fallback (the floor has no MCP; rich emission needs the generator): ${mcpAccepted.join(", ")}`,
        );
      }
    }

    // 3b. SessionStart hook (opt-in). Hook-capable harnesses get the native config
    // with the launcher installed to a conduct-owned dir and referenced by absolute
    // path; everyone else gets the AGENTS.md banner. The orchestrator owns this
    // because it knows the destination path the launcher command needs. The native
    // config is written into staging so it flows through substitution and merge
    // (so it never clobbers, e.g., a Gemini settings.json that also holds MCP).
    if (input.hook) {
      const klass = emitHook(input.harness);
      if (klass.supportsHooks && klass.configPath) {
        const launcherDir = join(dest, ".conduct-platform", "hooks");
        mkdirSync(launcherDir, { recursive: true });
        let copied = 0;
        for (const f of ["run-hook.cmd", "session-start"]) {
          const src = join(pkg, "payload", "hooks", f);
          if (existsSync(src)) {
            copyFileSync(src, join(launcherDir, f));
            if (process.platform !== "win32") chmodSync(join(launcherDir, f), 0o755);
            copied++;
          }
        }
        if (copied > 0) {
          const launcherCmd = `"${join(launcherDir, "run-hook.cmd")}" session-start`;
          const cfg = emitHook(input.harness, launcherCmd).config as Record<string, unknown>;
          const stagedCfg = join(staging, klass.configPath);
          mkdirSync(dirname(stagedCfg), { recursive: true });
          let existingCfg: Record<string, unknown> = {};
          if (existsSync(stagedCfg)) {
            try {
              existingCfg = JSON.parse(readFileSync(stagedCfg, "utf8")) as Record<string, unknown>;
            } catch {
              existingCfg = {};
            }
          }
          writeFileSync(stagedCfg, JSON.stringify({ ...existingCfg, ...cfg }, null, 2) + "\n", "utf8");
          if (!emit.files.includes(stagedCfg)) emit.files.push(stagedCfg);
          notes.push(
            `hook: native SessionStart wired (${input.harness} -> ${klass.configPath}); launcher at .conduct-platform/hooks (${klass.confidence}).`,
          );
        } else {
          notes.push("hook: requested, but the launcher scripts were not found in payload/hooks.");
        }
      } else {
        const agents = join(staging, "AGENTS.md");
        if (existsSync(agents)) {
          const cur = readFileSync(agents, "utf8");
          if (!cur.includes(AGENTS_BANNER)) writeFileSync(agents, AGENTS_BANNER + "\n\n" + cur, "utf8");
          notes.push(`hook: AGENTS.md banner reminder applied (${input.harness} has no startup hook).`);
        }
      }
    }

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
      // Remove the conduct-owned hook launcher (copied directly, not a lifecycle
      // artifact). Best-effort; absent is fine.
      try {
        rmSync(join(input.root, ".conduct-platform", "hooks"), { recursive: true, force: true });
      } catch {
        // nothing to remove
      }
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
