// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// Install helpers consumed by the orchestrator (setup/orchestrate.ts): turn
// emitted, corpus, and scaffold files into lifecycle payload artifacts; build the
// per-tool companion offer; and compute the effective MCP set. Each stays small and
// individually testable; the orchestrator composes them into a full install.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { parse as parseToml } from "smol-toml";
import { detect, detectPackageManagers } from "../manifest/detect.ts";
import { MANIFEST, type DepTier, type InstallMethod } from "../manifest/manifest.ts";
import { formatFor } from "../emit/generate.ts";
import type { PayloadArtifact } from "../lifecycle/lifecycle.ts";
import type { Json } from "../lifecycle/merge/deep-merge.ts";

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
  const walkMd = (dir: string, rel: string): void => {
    for (const e of readdirSync(dir)) {
      const abs = join(dir, e);
      const r = rel ? rel + "/" + e : e;
      if (statSync(abs).isDirectory()) walkMd(abs, r);
      else if (e.toLowerCase().endsWith(".md")) {
        arts.push({ path: join(destMemoryDir, r), format: "markdown", markdownRegion: readFileSync(abs, "utf8") });
      }
    }
  };
  walkMd(corpusDir, "");
  return arts;
}

// Lay the name-free scaffold exemplars (an example session and wiki page) under
// the install's memory/ directory. The scaffold's own MEMORY.md is skipped: the
// corpus MEMORY.md is the authoritative index. Recurses, so sessions/ and wiki/
// land at the same relative paths under memory/.
export function scaffoldArtifacts(
  scaffoldDir: string,
  destMemoryDir: string,
  skip: string[] = ["MEMORY.md"],
): PayloadArtifact[] {
  const arts: PayloadArtifact[] = [];
  if (!existsSync(scaffoldDir)) return arts;
  const walkMd = (dir: string, rel: string): void => {
    for (const e of readdirSync(dir)) {
      const abs = join(dir, e);
      const r = rel ? rel + "/" + e : e;
      if (statSync(abs).isDirectory()) {
        walkMd(abs, r);
      } else if (e.toLowerCase().endsWith(".md") && !(rel === "" && skip.includes(e))) {
        arts.push({ path: join(destMemoryDir, r), format: "markdown", markdownRegion: readFileSync(abs, "utf8") });
      }
    }
  };
  walkMd(scaffoldDir, "");
  return arts;
}

export interface ToolOffer {
  name: string;
  tier: DepTier;
  method: InstallMethod;
  summary: string;
  hint: string;
  detected: boolean; // all prereqs present
  missingPrereqs: string[];
  action: "builtin" | "wire" | "offer-install";
  packageManagers?: string[]; // package/plugin methods: what is available on this OS
}

// The per-tool offer setup presents. For each manifest entry in the chosen tiers:
// its detected state and the action. builtin = ships with conduct-platform; wire =
// an MCP tool whose prereqs are present (added to the harness MCP config on
// consent); offer-install = external, shown with an honest hint to
// install-with-consent or skip-with-instructions. Setup never auto-installs an
// external tool. Pure over detect(), so it is testable without side effects.
export function buildToolOffers(tiers: DepTier[]): ToolOffer[] {
  const pms = detectPackageManagers().available;
  const offers: ToolOffer[] = [];
  for (const e of MANIFEST) {
    if (!tiers.includes(e.tier)) continue;
    const d = detect(e.prereq);
    const detected = d.missing.length === 0;
    let action: ToolOffer["action"];
    if (e.install.method === "builtin") action = "builtin";
    else if (e.install.method === "mcp" && detected) action = "wire";
    else action = "offer-install";
    const offer: ToolOffer = {
      name: e.name,
      tier: e.tier,
      method: e.install.method,
      summary: e.summary,
      hint: e.install.hint,
      detected,
      missingPrereqs: d.missing,
      action,
    };
    if (e.install.method === "package" || e.install.method === "plugin") {
      offer.packageManagers = pms;
    }
    offers.push(offer);
  }
  return offers;
}

export interface McpServerConfig {
  type: string;
  command: string;
  args: string[];
  env: Record<string, string>;
}

// The effective MCP server set to emit: the always-core servers (from the
// canonical mcp.json) plus any accepted optional MCP-method tools, pulled from
// their manifest `mcp` field. The orchestrator writes this into the staged
// mcp.json before emission, so accepted servers flow through the normal
// per-harness emission path (no second MCP code path).
export function effectiveMcpServers(
  core: Record<string, { type?: string; command: string; args?: string[]; env?: Record<string, string> }>,
  acceptedMcpTools: string[],
): Record<string, McpServerConfig> {
  const out: Record<string, McpServerConfig> = {};
  for (const [name, s] of Object.entries(core)) {
    out[name] = { type: s.type ?? "stdio", command: s.command, args: s.args ?? [], env: s.env ?? {} };
  }
  for (const e of MANIFEST) {
    if (e.install.method !== "mcp" || !e.mcp) continue;
    if (!acceptedMcpTools.includes(e.name)) continue;
    out[e.name] = { type: "stdio", command: e.mcp.command, args: e.mcp.args, env: {} };
  }
  return out;
}
