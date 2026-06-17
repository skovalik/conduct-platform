// conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE).
// Collision detection: how does a target path relate to conduct-platform when we
// go to write it. The common case is "user-owned" (a file we must merge into,
// never overwrite). Plan section 6.

import { existsSync } from "node:fs";
import type { CollisionState, InstallRecord } from "./types.ts";

export function collisionState(
  path: string,
  prior: InstallRecord | undefined,
): CollisionState {
  if (!existsSync(path)) return "absent";
  if (prior && prior.artifacts.some((a) => a.path === path)) return "prior-conduct";
  return "user-owned";
}
