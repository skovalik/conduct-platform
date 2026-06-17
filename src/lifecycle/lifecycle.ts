// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// The lifecycle verbs: install, uninstall, resume, rollback. They operate on a
// generic Payload (the artifacts to write), so the actual content can come from
// any source (the emission layer plugs in later). Ordered writes: each artifact
// is written, verified, and ledgered; the commit point is the LAST write, so a
// crash before it leaves a resumable partial install.

import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  renameSync,
  copyFileSync,
} from "node:fs";
import { dirname, join, basename } from "node:path";
import { randomUUID } from "node:crypto";
import type { Scope, ArtifactFormat, Artifact, InstallRecord } from "./types.ts";
import { hashCanonical } from "./hash.ts";
import {
  readState,
  writeState,
  findInstall,
  upsertInstall,
  removeInstall,
} from "./install-state.ts";
import { collisionState } from "./collision.ts";
import { upsertMarkdownRegion, removeMarkdownRegion } from "./merge/markdown.ts";
import { mergeJsonAddOnly, removeJsonKeys, type Json } from "./merge/json.ts";
import { mergeTomlAddOnly, removeTomlKeys } from "./merge/toml.ts";

export interface PayloadArtifact {
  path: string;
  format: ArtifactFormat;
  markdownRegion?: string; // markdown: the region text to insert or replace
  json?: Json; // json: the object to merge in
  jsonKeyPaths?: string[]; // json: the dotted paths we own (for uninstall)
}

export interface Payload {
  harness: string;
  scope: Scope;
  root: string;
  formatVersion: string;
  tokenMap: Record<string, string>;
  artifacts: PayloadArtifact[];
}

export interface OpResult {
  record?: InstallRecord;
  conflicts: string[]; // paths where our region diverged (user edited it)
  collisions: string[]; // json leaf paths where the user's value was preserved
  notes: string[];
}

function readFileOr(path: string, fallback: string): string {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return fallback;
  }
}

function writeAtomic(path: string, content: string): void {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const tmp = path + ".tmp";
  writeFileSync(tmp, content, "utf8");
  renameSync(tmp, path);
}

function priorRegionText(
  prior: InstallRecord | undefined,
  path: string,
): string {
  const a = prior?.artifacts.find((x) => x.path === path);
  return a?.region.recordedText ?? "";
}

// install also serves as update: when a prior record exists, the recorded region
// text drives a replace rather than an insert.
export function install(
  payload: Payload,
  committedAt: string,
  statePath?: string,
): OpResult {
  const { state } = readState(statePath);
  const prior = findInstall(state, payload.root, payload.harness);
  const conflicts: string[] = [];
  const collisions: string[] = [];
  const notes: string[] = [];

  const rec: InstallRecord = {
    id: prior?.id ?? randomUUID(),
    scope: payload.scope,
    harness: payload.harness,
    root: payload.root,
    formatVersion: payload.formatVersion,
    tokenMap: payload.tokenMap,
    committedAt,
    artifacts: [],
    commitPoint: false,
  };
  upsertInstall(state, rec);
  writeState(state, statePath); // open the ledger (commitPoint still false)

  for (const pa of payload.artifacts) {
    const existing = readFileOr(pa.path, "");
    const cs = collisionState(pa.path, prior);
    let merged: string;
    let region: Artifact["region"];

    if (pa.format === "markdown") {
      const recordedText = priorRegionText(prior, pa.path);
      const r = upsertMarkdownRegion(existing, recordedText, pa.markdownRegion ?? "");
      if (r.status === "conflict") {
        conflicts.push(pa.path);
        notes.push(`conflict: ${pa.path} (our markdown region was edited)`);
        continue;
      }
      merged = r.merged;
      region = {
        format: "markdown",
        recordedText: (pa.markdownRegion ?? "").trimEnd(),
        hash: hashCanonical(pa.markdownRegion ?? ""),
      };
      notes.push(`${cs}: ${r.status} markdown region in ${pa.path}`);
    } else if (pa.format === "json") {
      const r = mergeJsonAddOnly(existing, pa.json ?? {});
      merged = r.merged;
      collisions.push(...r.collisions);
      region = {
        format: "json",
        keyPaths: pa.jsonKeyPaths ?? [],
        hash: hashCanonical(JSON.stringify(pa.json ?? {})),
      };
      notes.push(`${cs}: merged ${r.addedKeys.length} json key(s) into ${pa.path}`);
    } else if (pa.format === "toml") {
      const r = mergeTomlAddOnly(existing, pa.json ?? {});
      merged = r.merged;
      collisions.push(...r.collisions);
      region = {
        format: "toml",
        keyPaths: pa.jsonKeyPaths ?? [],
        hash: hashCanonical(JSON.stringify(pa.json ?? {})),
      };
      notes.push(`${cs}: merged ${r.addedKeys.length} toml key(s) into ${pa.path}`);
    } else {
      notes.push(`skipped ${pa.path}: unknown format ${pa.format}`);
      continue;
    }

    writeAtomic(pa.path, merged);
    const verify = readFileOr(pa.path, "");
    const writtenAndVerified = hashCanonical(verify) === hashCanonical(merged);
    rec.artifacts.push({
      path: pa.path,
      format: pa.format,
      sha256: hashCanonical(verify),
      region,
      writtenAndVerified,
    });
    upsertInstall(state, rec);
    writeState(state, statePath); // ledger after each artifact (crash-safe)
  }

  rec.commitPoint = true;
  upsertInstall(state, rec);
  writeState(state, statePath); // the COMMIT POINT (last write)
  return { record: rec, conflicts, collisions, notes };
}

export interface UninstallOptions {
  // Paths under the install root that must never be deleted (recall, beads,
  // sessions). conduct-platform only removes its own regions/keys, so whole-file
  // user data is preserved by construction; this is a defensive backstop.
  preserve?: string[];
  backupDir?: string;
}

export function uninstall(
  root: string,
  harness: string,
  opts: UninstallOptions = {},
  statePath?: string,
): OpResult {
  const { state } = readState(statePath);
  const rec = findInstall(state, root, harness);
  const conflicts: string[] = [];
  const collisions: string[] = [];
  const notes: string[] = [];
  if (!rec) {
    notes.push("nothing to uninstall (no install record)");
    return { conflicts, collisions, notes };
  }

  const preserve = new Set(opts.preserve ?? []);
  for (const a of rec.artifacts) {
    if (preserve.has(a.path)) {
      notes.push(`preserved (never delete): ${a.path}`);
      continue;
    }
    const existing = readFileOr(a.path, "");
    if (existing === "") {
      notes.push(`missing, skipping: ${a.path}`);
      continue;
    }
    if (opts.backupDir) {
      if (!existsSync(opts.backupDir)) mkdirSync(opts.backupDir, { recursive: true });
      try {
        copyFileSync(a.path, join(opts.backupDir, basename(a.path)));
      } catch {
        // best-effort backup
      }
    }
    if (a.format === "markdown") {
      const r = removeMarkdownRegion(existing, a.region.recordedText ?? "");
      if (r.status === "conflict") {
        conflicts.push(a.path);
        notes.push(`conflict: ${a.path} (our region was edited; left in place)`);
        continue;
      }
      writeAtomic(a.path, r.merged);
      notes.push(`removed our region from ${a.path}`);
    } else if (a.format === "json") {
      writeAtomic(a.path, removeJsonKeys(existing, a.region.keyPaths ?? []));
      notes.push(`removed our keys from ${a.path}`);
    } else if (a.format === "toml") {
      writeAtomic(a.path, removeTomlKeys(existing, a.region.keyPaths ?? []));
      notes.push(`removed our keys from ${a.path}`);
    }
  }

  removeInstall(state, root, harness);
  writeState(state, statePath); // record removed last
  return { conflicts, collisions, notes };
}

// Resume a crashed install (commitPoint === false). Re-running install is
// idempotent for already-written regions (recordedText drives an unchanged
// no-op), so it completes the remaining artifacts and flips the commit point.
export function resume(
  payload: Payload,
  committedAt: string,
  statePath?: string,
): OpResult {
  const { state } = readState(statePath);
  const rec = findInstall(state, payload.root, payload.harness);
  if (rec && rec.commitPoint) {
    return { record: rec, conflicts: [], collisions: [], notes: ["already complete"] };
  }
  return install(payload, committedAt, statePath);
}

// Roll back a partial (or any) install: remove our content and drop the record.
export function rollback(
  root: string,
  harness: string,
  statePath?: string,
): OpResult {
  return uninstall(root, harness, {}, statePath);
}
