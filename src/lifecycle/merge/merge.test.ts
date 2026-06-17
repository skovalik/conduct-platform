// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// JSON and TOML merge tests. Run: node --experimental-strip-types --test src/lifecycle/merge/merge.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { parse as parseToml } from "smol-toml";
import { mergeJsonAddOnly, removeJsonKeys } from "./json.ts";
import { mergeTomlAddOnly, removeTomlKeys } from "./toml.ts";

interface McpJson {
  mcpServers?: Record<string, unknown>;
}
interface CodexToml {
  mcp_servers?: Record<string, unknown>;
}

test("json merge adds ours, preserves theirs, reports the added path", () => {
  const r = mergeJsonAddOnly('{"mcpServers":{"mine":{"command":"x"}}}', {
    mcpServers: { recall: { command: "recall" } },
  });
  const o = JSON.parse(r.merged) as McpJson;
  assert.ok(o.mcpServers!.mine && o.mcpServers!.recall);
  assert.deepEqual(r.addedKeys, ["mcpServers.recall"]);
});

test("json merge reports a leaf collision and preserves the user's value", () => {
  const r = mergeJsonAddOnly('{"x":1}', { x: 2 });
  assert.deepEqual(r.collisions, ["x"]);
  assert.equal((JSON.parse(r.merged) as { x: number }).x, 1);
});

test("toml merge adds our [mcp_servers.x] without clobbering theirs", () => {
  const existing = '[mcp_servers.mine]\ncommand = "x"\n';
  const r = mergeTomlAddOnly(existing, {
    mcp_servers: { recall: { command: "recall", args: [] } },
  });
  const o = parseToml(r.merged) as CodexToml;
  assert.ok(o.mcp_servers!.mine, "user server preserved");
  assert.ok(o.mcp_servers!.recall, "our server added");
});

test("toml remove drops our keys, keeps theirs", () => {
  const existing =
    '[mcp_servers.mine]\ncommand = "x"\n\n[mcp_servers.recall]\ncommand = "recall"\n';
  const o = parseToml(removeTomlKeys(existing, ["mcp_servers.recall"])) as CodexToml;
  assert.ok(o.mcp_servers!.mine);
  assert.ok(!o.mcp_servers!.recall);
});

test("json remove prunes now-empty parents", () => {
  const o = JSON.parse(
    removeJsonKeys('{"mcpServers":{"recall":{"command":"recall"}}}', ["mcpServers.recall"]),
  ) as McpJson;
  assert.ok(!o.mcpServers, "empty mcpServers pruned");
});
