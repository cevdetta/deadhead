# Contributing

The unit of work here is **one rule**: one issue, one pull request.

## Setup

Node `>=24` is required and enforced at install time (see `engines` in
[`package.json`](package.json) and `engine-strict=true` in [`.npmrc`](.npmrc)).

```bash
npm install -g pnpm  # skip if you already have any pnpm
pnpm install
pnpm test
```

Any pnpm bootstraps itself to the version pinned in the `packageManager`
field of [`package.json`](package.json), so every contributor runs the same
tool.

## Adding a rule

1. Open a **New rule** issue. The form mirrors the rule's frontmatter field for field,
   so filling it in *is* the research. If you cannot produce two independent sources,
   the rule is not ready, and finding that out costs you ten minutes instead of a
   review cycle.
2. Add `content/rules/<namespace>/<name>.md`, plus fixtures at
   `test/fixtures/<ruleId>/invalid.html` and `valid.html`.
3. Most rules need no code. If the selector subset cannot express the match, add
   `packages/rules/logic/<ruleId>.ts`.
4. `pnpm validate:rules && pnpm test`.

The pull request template carries the full definition of done.

### Rule checklist

- [ ] Frontmatter validates (`pnpm validate:rules`), and `ruleId` matches the file path
- [ ] At least two independent sources under `## Resources` (spec text, browser bug
      tracker, vendor documentation, or a well-argued primary post)
- [ ] `## Why avoid` (or `## Why use`) states the concrete consequence, not just
      "it's old"
- [ ] `## Use instead` has runnable markup, or explicitly says "delete it"
- [ ] `severity` is justified: `harmful` breaks something for users; `deprecated` is
      formally obsolete but inert; `unnecessary` works but is dead weight

### Rules never touch a parser

Rule logic only sees the element port (`tag`, `attr`, `hasAttr`, `attrNames`,
`text`, `parent`, `children`, `index`, `range`, `loc`). No `parse5` types, no DOM
`Element`, no ESLint AST. If a rule needs something the port lacks, extend the port
for all three adapters at once.

### Fixtures must be well-formed HTML

The conformance suite runs every fixture through every adapter and asserts identical
findings, but the DOM parser used in tests is not spec-compliant for tree
construction the way `parse5` is. Keep conformance fixtures well-formed; test
malformed input (implicit `<head>`, misnested tags, stray `</p>`) against the parse5
adapter only, in its own suite. Fixtures are byte-offset-sensitive: do not reformat
them, and leave trailing whitespace and final newlines alone (enforced by
[`.editorconfig`](.editorconfig) and [`.gitattributes`](.gitattributes)).

## Disagreeing with a rule

Please do. Every rendered rule page links back to its source file. Open a discussion
or a pull request against the markdown. A rule that turns out to be wrong, or that
stopped being true because browsers changed, is the most useful issue you can file.

## Code conventions

- ESM only. Relative imports carry the `.ts` extension (Node requires it at runtime).
- Source is real `.ts` run directly by Node's type stripping. Keep it erasable:
  no enums, namespaces, or parameter properties (`erasableSyntaxOnly` enforces this).
- `packages/core` and `packages/rules` have zero runtime dependencies. `parse5`
  belongs to the CLI adapter alone.
- Run `pnpm typecheck` before pushing.

## Architecture

Keep the three runtimes (CLI, bookmarklet, ESLint plugin) from drifting into
three separate projects: extend shared contracts (the element port, rule
schemas) for all adapters at once, and propose design changes via an issue
before opening a PR.
