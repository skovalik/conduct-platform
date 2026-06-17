// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// Onboarding tests. Run: node --experimental-strip-types --test src/onboarding/onboarding.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { universalCore, offered, renderOffer } from "./rule-split.ts";
import { discoverabilitySheet, START_HERE, BUILTIN_COMMANDS } from "./discoverability.ts";
import { GUIDED_RUN, renderGuidedRun } from "./guided-run.ts";

test("rule split: golden rules are core; memory/neurotype/anti-sycophancy are offered+explained", () => {
  assert.ok(universalCore().some((g) => g.id === "golden-rules"));
  const off = offered();
  assert.ok(off.some((g) => g.id === "session-memory"));
  assert.ok(off.some((g) => g.id === "neurotype"));
  assert.ok(off.some((g) => g.id === "anti-sycophancy"));
  assert.ok(off.every((g) => !!g.why), "every offered group explains why");
  assert.ok(renderOffer().includes("keep, adjust, or drop"));
});

test("discoverability sheet highlights the start-here four and lists tools", () => {
  const sheet = discoverabilitySheet();
  for (const t of START_HERE) assert.ok(sheet.includes(t), `${t} listed`);
  assert.ok(sheet.includes("(start here)"));
});

test("discoverability sheet surfaces built-in commands incl. close-out", () => {
  const sheet = discoverabilitySheet();
  assert.ok(sheet.includes("Built-in commands"));
  assert.ok(BUILTIN_COMMANDS.some((c) => c.name === "close-out"));
  assert.ok(sheet.includes("close-out"));
});

test("guided run teaches research -> plan via ralph/PFD/QA -> implement -> snapshot -> wiki -> close-out", () => {
  const titles = GUIDED_RUN.map((s) => s.title.toLowerCase()).join(" ");
  assert.ok(titles.includes("research"));
  assert.ok(titles.includes("ralph"));
  assert.ok(titles.includes("pfd"));
  assert.ok(titles.includes("qa pipeline"));
  assert.ok(titles.includes("implement"));
  assert.ok(titles.includes("close out"));
  const rendered = renderGuidedRun();
  assert.ok(rendered.includes("snapshot"));
  assert.ok(rendered.includes("wiki page"));
  assert.ok(rendered.includes("close-out"));
});
