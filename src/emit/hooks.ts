// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// Hook degradation (plan section 5). Generators do not universally emit hooks, so
// conduct-platform hand-emits a SessionStart reminder where the harness has hooks
// (Claude Code, Codex, Gemini) and degrades to an AGENTS.md banner everywhere
// else. The reminder fires only when installed-but-uninitialized (mirroring
// conduct's self-silencing hook); that gating lives in the emitted script. The
// orchestrator installs the launcher and passes its command in here.
//
// Honesty: only the Claude Code shape is runtime-verifiable on this machine. The
// Codex and Gemini hook shapes are docs-level until the first user runs them
// (plan section 5 matrix); they are marked accordingly in the confidence stamp.

export const HOOK_CAPABLE_HARNESSES = new Set(["claude", "codex", "gemini"]);

export const REMINDER =
  "conduct-platform is installed but not initialized here. Run the setup command to finish.";

// The banner for harnesses with no startup hook: prepended to AGENTS.md. It must
// not contain a literal double-brace token, or tokenize-last would rewrite it and
// the verification gate would flag it.
export const AGENTS_BANNER =
  "> conduct-platform: if these rules still show unfilled double-brace placeholders, run the setup command to personalize them.";

export type HookConfidence = "runtime-verified" | "docs-level";

export interface HookEmit {
  harness: string;
  supportsHooks: boolean;
  confidence: HookConfidence;
  configPath?: string; // where the hook config is written
  config?: unknown; // the hook config object (shape is harness-specific)
  bannerOnly?: boolean; // true when degrading to the AGENTS.md banner
  banner?: string;
}

// Claude Code: hooks.json with a SessionStart matcher invoking the launcher.
function claudeHook(command: string): HookEmit {
  return {
    harness: "claude",
    supportsHooks: true,
    confidence: "runtime-verified",
    configPath: ".claude/hooks/hooks.json",
    config: {
      hooks: {
        SessionStart: [
          { matcher: "startup|clear|compact", hooks: [{ type: "command", command, async: false }] },
        ],
      },
    },
  };
}

// Codex: a separate hooks.json (not config.toml, so it never collides with the
// MCP config). Docs-level until the first user runs it.
function codexHook(command: string): HookEmit {
  return {
    harness: "codex",
    supportsHooks: true,
    confidence: "docs-level",
    configPath: ".codex/hooks.json",
    config: { hooks: { SessionStart: [{ command }] } },
  };
}

// Gemini: hooks live in settings.json (which also holds MCP), so the orchestrator
// MERGES this in rather than overwriting. Docs-level here.
function geminiHook(command: string): HookEmit {
  return {
    harness: "gemini",
    supportsHooks: true,
    confidence: "docs-level",
    configPath: ".gemini/settings.json",
    config: { hooks: { SessionStart: [{ matcher: "startup|resume|clear", command }] } },
  };
}

// Build the hook emission for a harness. `command` is what the SessionStart hook
// runs (the orchestrator passes the absolute launcher invocation); it defaults to
// a bare name for callers that only need the shape/classification.
export function emitHook(harness: string, command: string = "conduct-platform-session-start"): HookEmit {
  switch (harness) {
    case "claude":
      return claudeHook(command);
    case "codex":
      return codexHook(command);
    case "gemini":
      return geminiHook(command);
    default:
      return {
        harness,
        supportsHooks: false,
        confidence: "docs-level",
        bannerOnly: true,
        banner: AGENTS_BANNER,
      };
  }
}
