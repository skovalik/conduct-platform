// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// The installer: orchestrates prerequisite detection (per OS), emission, and the
// lifecycle engine. It selects manifest entries by tier, probes their prereqs
// (install-with-consent or skip-with-instructions is the caller's choice), emits
// the canonical source, turns the emitted files into a lifecycle Payload, and
// installs them (merging into any user-owned config, never clobbering). The emit
// function is injected so this is testable without invoking the generator.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parse as parseToml } from "smol-toml";
import { detect } from "../manifest/detect.ts";
import { MANIFEST, type DepEntry, type DepTier } from "../manifest/manifest.ts";
import { formatFor } from "../emit/generate.ts";
import {
  install as lifecycleInstall,
  type Payload,
  type PayloadArtifact,
  type OpResult,
} from "../lifecycle/lifecycle.ts";
import type { Json } from "../lifecycle/merge/deep-merge.ts";

export interface InstallPlan {
  root: string;
  scope: "project" | "global";
  harness: string;
  tiers: DepTier[]; // e.g. ["core"] for the minimal start (plan section 10)
  tokenMap: Record<string, string>;
  committedAt: string; // never invented; supplied by the caller
  corpusDir?: string; // optional: the memory rule corpus (payload/memory) to lay down
}

// Returns the absolute paths of the files it emitted into `root`.
export type EmitFn = (root: string) => string[];

export interface PlanResult {
  install: DepEntry[];
  skippedMissingPrereq: { tool: string; missing: string[] }[];
}

// Select manifest entries for the chosen tiers and split by prereq availability.
export function planInstall(plan: InstallPlan): PlanResult {
  const selected = MANIFEST.filter((e) => plan.tiers.includes(e.tier));
  const install: DepEntry[] = [];
  const skipped: { tool: string; missing: string[] }[] = [];
  for (const e of selected) {
    const d = detect(e.prereq);
    if (d.missing.length > 0) skipped.push({ tool: e.name, missing: d.missing });
    else install.push(e);
  }
  return { install, skippedMissingPrereq: skipped };
}

function leafPaths(obj: Json, prefix: string, out: string[]): void {
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    const p = prefix ? prefix + "." + k : k;
    if (v && typeof v === "object" && !Array.isArray(v)) leafPaths(v as Json, p, out);
    else out.push(p);
  }
}

// Convert emitted files into lifecycle payload artifacts. Markdown files install
// as a whole owned region; JSON/TOML install as owned key paths (so a user's
// existing config is merged into, never overwritten).
export function payloadFromEmitted(files: string[]): PayloadArtifact[] {
  const artifacts: PayloadArtifact[] = [];
  for (const path of files) {
    const fmt = formatFor(path);
    if (fmt === "markdown") {
      artifacts.push({ path, format: "markdown", markdownRegion: readFileSync(path, "utf8") });
    } else if (fmt === "json" || fmt === "toml") {
      const raw = readFileSync(path, "utf8");
      let obj: Json = {};
      try {
        obj = (fmt === "json" ? JSON.parse(raw) : parseToml(raw)) as Json;
      } catch {
        obj = {};
      }
      const keyPaths: string[] = [];
      leafPaths(obj, "", keyPaths);
      artifacts.push({ path, format: fmt, json: obj, jsonKeyPaths: keyPaths });
    }
  }
  return artifacts;
}

// Lay the on-demand memory rule corpus (conduct's payload) down as whole owned
// markdown files under the install's memory/ directory.
export function corpusArtifacts(corpusDir: string, destMemoryDir: string): PayloadArtifact[] {
  const arts: PayloadArtifact[] = [];
  if (!existsSync(corpusDir)) return arts;
  for (const f of readdirSync(corpusDir).filter((x) => x.endsWith(".md"))) {
    arts.push({
      path: join(destMemoryDir, f),
      format: "markdown",
      markdownRegion: readFileSync(join(corpusDir, f), "utf8"),
    });
  }
  return arts;
}

export interface InstallReport {
  op?: OpResult;
  installedTools: string[];
  skippedMissingPrereq: { tool: string; missing: string[] }[];
  notes: string[];
}

export function runInstall(plan: InstallPlan, emit: EmitFn): InstallReport {
  const { install, skippedMissingPrereq } = planInstall(plan);
  const notes: string[] = [];
  for (const s of skippedMissingPrereq) {
    notes.push(`skipped ${s.tool}: missing prerequisite(s) ${s.missing.join(", ")}`);
  }

  const emitted = emit(plan.root);
  const artifacts = payloadFromEmitted(emitted);
  if (plan.corpusDir) {
    artifacts.push(...corpusArtifacts(plan.corpusDir, join(plan.root, "memory")));
  }

  const payload: Payload = {
    harness: plan.harness,
    scope: plan.scope,
    root: plan.root,
    formatVersion: "0.0.0",
    tokenMap: plan.tokenMap,
    artifacts,
  };
  const op = lifecycleInstall(payload, plan.committedAt);
  notes.push(...op.notes);

  return {
    op,
    installedTools: install.map((e) => e.name),
    skippedMissingPrereq,
    notes,
  };
}
