// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// Structured TOML merge for harness configs that use TOML (Codex config.toml).
// Parse-merge-serialize via smol-toml, sharing the add-only deep-merge with JSON,
// so a user's existing [mcp_servers.*], hooks, and other tables are never
// clobbered.

import { parse, stringify } from "smol-toml";
import { type Json, deepMergeAddOnly, deletePath } from "./deep-merge.ts";

export interface TomlMergeResult {
  merged: string;
  addedKeys: string[];
  collisions: string[];
}

export function mergeTomlAddOnly(existing: string, ours: Json): TomlMergeResult {
  let base: Json = {};
  try {
    base = existing.trim() ? (parse(existing) as Json) : {};
  } catch {
    base = {};
  }
  const added: string[] = [];
  const collisions: string[] = [];
  deepMergeAddOnly(base, ours, "", added, collisions);
  return { merged: stringify(base) + "\n", addedKeys: added, collisions };
}

export function removeTomlKeys(existing: string, keyPaths: string[]): string {
  let base: Json = {};
  try {
    base = existing.trim() ? (parse(existing) as Json) : {};
  } catch {
    return existing;
  }
  for (const p of keyPaths) deletePath(base, p.split("."));
  return stringify(base) + "\n";
}
