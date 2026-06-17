// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// Read the canonical .rulesync/ source into a structured shape the owned emitters
// (Codex, Antigravity) consume. These emitters are the always-owned fallback for
// the priority native targets if the generator (rulesync) changes or dies; they
// depend only on this reader, not on rulesync.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

export interface McpServer {
  type?: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
}
export interface RuleDoc {
  name: string;
  body: string;
}
export interface SubagentDoc {
  name: string;
  description: string;
  body: string;
}
export interface Canonical {
  rules: RuleDoc[];
  mcpServers: Record<string, McpServer>;
  subagents: SubagentDoc[];
}

export function stripFrontmatter(text: string): {
  fm: Record<string, string>;
  body: string;
} {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { fm: {}, body: text };
  const fm: Record<string, string> = {};
  for (const line of m[1]!.split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (kv) fm[kv[1]!] = kv[2]!.trim().replace(/^["']|["']$/g, "");
  }
  return { fm, body: m[2]!.replace(/^\s+/, "") };
}

export function readCanonical(rulesyncDir: string): Canonical {
  const rules: RuleDoc[] = [];
  const subagents: SubagentDoc[] = [];
  let mcpServers: Record<string, McpServer> = {};

  const rulesDir = join(rulesyncDir, "rules");
  if (existsSync(rulesDir)) {
    for (const f of readdirSync(rulesDir).filter((x) => x.endsWith(".md"))) {
      const { body } = stripFrontmatter(readFileSync(join(rulesDir, f), "utf8"));
      rules.push({ name: f.replace(/\.md$/, ""), body });
    }
  }

  const subDir = join(rulesyncDir, "subagents");
  if (existsSync(subDir)) {
    for (const f of readdirSync(subDir).filter((x) => x.endsWith(".md"))) {
      const { fm, body } = stripFrontmatter(readFileSync(join(subDir, f), "utf8"));
      subagents.push({
        name: fm.name ?? f.replace(/\.md$/, ""),
        description: fm.description ?? "",
        body,
      });
    }
  }

  const mcpFile = join(rulesyncDir, "mcp.json");
  if (existsSync(mcpFile)) {
    try {
      const j = JSON.parse(readFileSync(mcpFile, "utf8")) as {
        mcpServers?: Record<string, McpServer>;
      };
      mcpServers = j.mcpServers ?? {};
    } catch {
      mcpServers = {};
    }
  }

  return { rules, mcpServers, subagents };
}
