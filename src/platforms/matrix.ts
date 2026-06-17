// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// The flagship-LLM coverage matrix (plan section 5). Every flagship is in scope,
// reached through whatever harness drives it; the only differentiation is the
// path and an HONEST verification stamp. This is the current state, not a target:
// only Claude Code is runtime-verified here (the one harness installed locally).
// Codex and Antigravity are docs-verified pending the first user; the smaller
// flagships are docs-only, single-source. Nothing claims more than it has earned.

export type VerificationState =
  | "runtime-verified"
  | "docs-verified-runtime-pending"
  | "docs-only-not-run"
  | "floor-only-not-run";

export type CoveragePath =
  | "home-native"
  | "native-priority"
  | "floor-plus-generator"
  | "floor-only";

export interface FlagshipRow {
  flagship: string;
  harness: string;
  path: CoveragePath;
  verification: VerificationState;
}

export const COVERAGE: FlagshipRow[] = [
  { flagship: "Anthropic Claude", harness: "Claude Code", path: "home-native", verification: "runtime-verified" },
  { flagship: "OpenAI GPT", harness: "Codex CLI", path: "native-priority", verification: "docs-verified-runtime-pending" },
  { flagship: "Google Gemini", harness: "Antigravity CLI", path: "native-priority", verification: "docs-verified-runtime-pending" },
  { flagship: "xAI Grok", harness: "Grok CLI", path: "floor-plus-generator", verification: "docs-only-not-run" },
  { flagship: "Mistral", harness: "Mistral Vibe", path: "floor-plus-generator", verification: "docs-only-not-run" },
  { flagship: "Alibaba Qwen", harness: "Qwen Code", path: "floor-plus-generator", verification: "docs-only-not-run" },
  { flagship: "Moonshot Kimi", harness: "Kimi Code", path: "floor-plus-generator", verification: "docs-only-not-run" },
  { flagship: "DeepSeek", harness: "Cursor / Cline / opencode", path: "floor-only", verification: "floor-only-not-run" },
  { flagship: "Meta Llama and local models", harness: "Cline / opencode / Continue on Ollama, LM Studio, llama.cpp", path: "floor-only", verification: "floor-only-not-run" },
];

export function runtimeVerified(): FlagshipRow[] {
  return COVERAGE.filter((r) => r.verification === "runtime-verified");
}

export function renderMatrix(): string {
  const out = ["| Flagship | Harness | Path | Verification (honest, today) |", "|---|---|---|---|"];
  for (const r of COVERAGE) out.push(`| ${r.flagship} | ${r.harness} | ${r.path} | ${r.verification} |`);
  return out.join("\n") + "\n";
}
