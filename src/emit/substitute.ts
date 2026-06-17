// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// Tokenize-LAST substitution (plan section 4). Token VALUES are substituted into
// already-emitted native artifacts, with a PER-FORMAT escaper, so each emitted
// file is escaped for its own format exactly once. Only the fixed token set is
// substituted, so a generator's own placeholders (for example rulesync's
// {{args}}) are left untouched.

export type EmitFormat = "markdown" | "json" | "toml";

// The canonical token set, carried from conduct. Substitution touches ONLY these.
export const TOKEN_NAMES: string[] = [
  "USER_NAME",
  "ROLE_BACKGROUND",
  "USER_FOCUS",
  "NEUROTYPE",
  "OS",
  "SHELL",
  "WORKSPACE_ROOT",
  "MEMORY_PATH",
  "TASK_TRACKER",
  "REFERENCE_FILES",
  "COMMIT_ATTRIBUTION",
  "SCREENSHOT_PATH",
  "DETECTED_TOOLING",
  "CONTINUE_HERE",
];

// Escape a value for placement inside a string of the given format. Markdown has
// no value-quoting, so it is raw. JSON and TOML must escape backslashes and
// quotes; a Windows path (C:\Users\...) is the hazard the bash patsub escaper
// mangled (see substitute.test.ts, the named case).
export function escapeForFormat(value: string, format: EmitFormat): string {
  if (format === "markdown") return value;
  if (format === "json") {
    const s = JSON.stringify(value);
    return s.slice(1, s.length - 1);
  }
  // toml basic string
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

export interface SubstituteResult {
  output: string;
  substituted: string[]; // token names that were present and filled
  missing: string[]; // tokens present in the content but absent from the map
}

export function substitute(
  content: string,
  format: EmitFormat,
  tokenMap: Record<string, string>,
  tokenNames: string[] = TOKEN_NAMES,
): SubstituteResult {
  let output = content;
  const substituted: string[] = [];
  const missing: string[] = [];
  for (const name of tokenNames) {
    const token = "{{" + name + "}}";
    if (!output.includes(token)) continue;
    if (!(name in tokenMap)) {
      missing.push(name);
      continue;
    }
    output = output.split(token).join(escapeForFormat(tokenMap[name]!, format));
    substituted.push(name);
  }
  return { output, substituted, missing };
}
