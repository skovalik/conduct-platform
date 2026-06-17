// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// Shared structured-merge primitives for JSON and TOML. Add-only semantics: ADD
// our keys, recurse into shared objects, and NEVER clobber a user's existing leaf
// value (report it as a collision instead). Used by both merge/json.ts and
// merge/toml.ts so the two formats share one tested implementation.

export type Json = Record<string, unknown>;

export function isPlainObject(v: unknown): v is Json {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

export function deepMergeAddOnly(
  target: Json,
  source: Json,
  prefix: string,
  added: string[],
  collisions: string[],
): void {
  for (const k of Object.keys(source)) {
    const path = prefix ? prefix + "." + k : k;
    const sv = source[k];
    const tv = target[k];
    if (isPlainObject(sv) && isPlainObject(tv)) {
      deepMergeAddOnly(tv, sv, path, added, collisions);
    } else if (k in target) {
      if (JSON.stringify(tv) !== JSON.stringify(sv)) collisions.push(path);
      // identical or colliding: preserve the user's value
    } else {
      target[k] = sv;
      added.push(path);
    }
  }
}

export function deletePath(obj: Json, parts: string[]): void {
  const [head, ...rest] = parts;
  if (head === undefined) return;
  if (rest.length === 0) {
    delete obj[head];
    return;
  }
  const child = obj[head];
  if (isPlainObject(child)) {
    deletePath(child, rest);
    if (Object.keys(child).length === 0) delete obj[head];
  }
}
