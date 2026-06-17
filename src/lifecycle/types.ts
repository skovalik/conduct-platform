// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// Lifecycle and state engine: shared types. The install-state record is the
// out-of-band source of truth for what was installed, where, and in what form.
// There are NO in-band markers: block boundaries live here, by content, not as
// in-file comment sentinels (which some harnesses strip and others do not).

export type Scope = "project" | "global";
export type ArtifactFormat = "markdown" | "json" | "toml";

// How an emit target's file relates to conduct-platform when we go to write it.
export type CollisionState =
  | "absent" // no file at the path
  | "user-owned" // a file we have never touched
  | "prior-conduct"; // a file carrying a prior conduct-platform install (per the record)

// A region of a file that conduct-platform owns. Located by its exact recorded
// text (content-addressed), never by an in-file marker.
export interface OwnedRegion {
  format: ArtifactFormat;
  // markdown: the exact last-written region text. json/toml: the dotted key paths we own.
  recordedText?: string;
  keyPaths?: string[];
  hash: string; // sha256 of the canonical owned content, for divergence detection
}

export interface Artifact {
  path: string; // absolute path written
  format: ArtifactFormat;
  sha256: string; // hash of the full file content as we last wrote it (canonical)
  region: OwnedRegion;
  writtenAndVerified: boolean;
}

export interface InstallRecord {
  id: string;
  scope: Scope;
  harness: string; // "claude" | "codex" | "gemini" | ...
  root: string; // the install root directory
  formatVersion: string; // canonical-source version installed
  tokenMap: Record<string, string>;
  committedAt: string; // ISO date the user confirmed; never invented
  artifacts: Artifact[];
  commitPoint: boolean; // true only once the whole install completed
}

export interface InstallState {
  schemaVersion: number;
  selfFingerprint: string; // sha256 of this object with the field blanked
  installs: InstallRecord[];
}
