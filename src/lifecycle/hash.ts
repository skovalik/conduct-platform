// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// Content hashing and canonicalization for the lifecycle engine. node:crypto
// only, no dependencies.

import { createHash } from "node:crypto";

export function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

// Canonicalize text before hashing so cosmetic differences (CRLF vs LF, trailing
// whitespace) do not register as a divergence.
export function canonicalText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .trimEnd();
}

export function hashCanonical(text: string): string {
  return sha256(canonicalText(text));
}
