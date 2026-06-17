// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// Marker-free owned-region merge for markdown. The install-state record holds the
// exact last-written text of our region; we find-and-replace it. Divergence (the
// recorded text is no longer present verbatim) means the user edited our region,
// which is a conflict the caller must resolve. No in-file comment sentinels are
// used, so this does not depend on any harness's comment-stripping behavior.

export type RegionStatus =
  | "inserted"
  | "replaced"
  | "removed"
  | "unchanged"
  | "conflict";

export interface RegionResult {
  merged: string;
  status: RegionStatus;
}

// Insert (fresh) or update (recordedText present) our region.
export function upsertMarkdownRegion(
  existing: string,
  recordedText: string,
  newText: string,
): RegionResult {
  const block = newText.trimEnd();
  if (recordedText === "") {
    if (existing.includes(block)) return { merged: existing, status: "unchanged" };
    const sep = existing.trim().length ? "\n\n" : "";
    return {
      merged: existing.replace(/\s+$/, "") + sep + block + "\n",
      status: "inserted",
    };
  }
  const idx = existing.indexOf(recordedText);
  if (idx === -1) return { merged: existing, status: "conflict" };
  if (recordedText === newText) return { merged: existing, status: "unchanged" };
  return {
    merged: existing.slice(0, idx) + newText + existing.slice(idx + recordedText.length),
    status: "replaced",
  };
}

export function removeMarkdownRegion(
  existing: string,
  recordedText: string,
): RegionResult {
  const idx = existing.indexOf(recordedText);
  if (idx === -1) return { merged: existing, status: "conflict" };
  const merged = (
    existing.slice(0, idx) + existing.slice(idx + recordedText.length)
  ).replace(/\n{3,}/g, "\n\n");
  return { merged, status: "removed" };
}
