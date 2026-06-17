// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// Structured JSON merge (parse-merge-serialize). conduct-platform owns specific
// key paths (for example mcpServers.<our-server>). The merge ADDS our keys and
// never clobbers a value the user already set. See ./deep-merge.ts.

import { type Json, deepMergeAddOnly, deletePath } from "./deep-merge.ts";

export type { Json };

export interface JsonMergeResult {
  merged: string;
  addedKeys: string[];
  collisions: string[];
}

export function mergeJsonAddOnly(existing: string, ours: Json): JsonMergeResult {
  let base: Json = {};
  try {
    base = existing.trim() ? (JSON.parse(existing) as Json) : {};
  } catch {
    base = {};
  }
  const added: string[] = [];
  const collisions: string[] = [];
  deepMergeAddOnly(base, ours, "", added, collisions);
  return { merged: JSON.stringify(base, null, 2) + "\n", addedKeys: added, collisions };
}

export function removeJsonKeys(existing: string, keyPaths: string[]): string {
  let base: Json = {};
  try {
    base = existing.trim() ? (JSON.parse(existing) as Json) : {};
  } catch {
    return existing;
  }
  for (const p of keyPaths) deletePath(base, p.split("."));
  return JSON.stringify(base, null, 2) + "\n";
}
