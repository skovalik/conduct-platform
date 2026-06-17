// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// The out-of-band install-state record: ~/.conduct-platform/install-state.json.
// This is the single source of truth for what conduct-platform installed and
// where. Writes are atomic (temp then rename). A self-fingerprint detects
// corruption or hand-edits; it is NOT a signature (single-user threat model).

import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  renameSync,
} from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { sha256 } from "./hash.ts";
import type { InstallState, InstallRecord } from "./types.ts";

export const SCHEMA_VERSION = 1;

export function stateDir(): string {
  return join(homedir(), ".conduct-platform");
}

export function statePath(): string {
  return join(stateDir(), "install-state.json");
}

function emptyState(): InstallState {
  return { schemaVersion: SCHEMA_VERSION, selfFingerprint: "", installs: [] };
}

function fingerprint(state: InstallState): string {
  return sha256(JSON.stringify({ ...state, selfFingerprint: "" }));
}

export interface ReadResult {
  state: InstallState;
  corrupt: boolean; // fingerprint mismatch or parse failure
}

export function readState(path: string = statePath()): ReadResult {
  if (!existsSync(path)) return { state: emptyState(), corrupt: false };
  try {
    const state = JSON.parse(readFileSync(path, "utf8")) as InstallState;
    const corrupt = fingerprint(state) !== state.selfFingerprint;
    return { state, corrupt };
  } catch {
    return { state: emptyState(), corrupt: true };
  }
}

export function writeState(state: InstallState, path: string = statePath()): void {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const out: InstallState = { ...state, selfFingerprint: "" };
  out.selfFingerprint = fingerprint(out);
  const tmp = path + ".tmp";
  writeFileSync(tmp, JSON.stringify(out, null, 2) + "\n", "utf8");
  renameSync(tmp, path);
}

export function findInstall(
  state: InstallState,
  root: string,
  harness: string,
): InstallRecord | undefined {
  return state.installs.find((i) => i.root === root && i.harness === harness);
}

export function upsertInstall(state: InstallState, rec: InstallRecord): void {
  const idx = state.installs.findIndex(
    (i) => i.root === rec.root && i.harness === rec.harness,
  );
  if (idx >= 0) state.installs[idx] = rec;
  else state.installs.push(rec);
}

export function removeInstall(
  state: InstallState,
  root: string,
  harness: string,
): void {
  state.installs = state.installs.filter(
    (i) => !(i.root === root && i.harness === harness),
  );
}
