<!-- conduct-platform, authored by Stefan Kovalik <stefan@aurochs.agency>. https://github.com/skovalik/conduct-platform. MIT License (see LICENSE). -->

# Maintaining conduct-platform

This file is for the maintainer. Users run setup; the maintainer edits the canonical source and ships releases.

## The model

- The **source of truth is the maintainer's live workspace**. conduct-platform is a tokenized, name-free projection of it.
- The **rules payload** (operating rules plus the memory corpus) flows one way: **your machine to the repo** (promote). You improve your real setup, then promote the generic changes up to the repo. There is no flow back to your machine.
- A user's **install** consumes a release through the lifecycle update merge (their side, not yours), preserving their local edits. That is how others get changes; it pushes nothing to you.

## Contributions

- **Engine and tooling** (`src/`, docs, CI): normal open source. Contributors open PRs directly to the repo. The promote sync never touches `src/`, so contributed code is never overwritten.
- **Rules and memory corpus** (`.rulesync/`, `payload/memory/`): the source of truth is your workspace. A rule contribution routes through you: adopt it into your own setup, then promote. The promote is a three-way merge, so a rule added on the repo side surfaces as a conflict to resolve, never a silent clobber.

## Shipping a change

1. Edit the canonical source or `src/`. House style: no em-dashes or en-dashes; keep list items on single lines.
2. Add a `## <next version>` section to `CHANGELOG.md`. The release script refuses a version with no changelog section.
3. Commit (single-author, no AI co-author trailer).
4. Run the release helper: `node scripts/release.mjs [patch|minor|major]`. It bumps `package.json`, checks the changelog, runs the tests and typecheck, commits the bump, and tags. `--dry-run` previews.
5. Push (`git push --follow-tags`). CI runs the cross-OS matrix.

Push is the irreversible moment: before it, make sure only generic, tokenized structure and name-free exemplars go up, never real names, secrets, or real content.

## Gotchas

- **Hook scripts must stay LF.** `payload/hooks/*` are run by bash, which breaks on CRLF; `.gitattributes` enforces LF.
- **Credit is the one allowed person reference.** The author name, email, and repo URL are the only person reference that ships; anything else is a mistake.
- **Runtime proof is partial.** Only Claude Code is runtime-verified locally. Keep the section-5 coverage matrix honest; do not promote a docs-level row without a real run.
