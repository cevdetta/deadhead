# deadhead

Deadheading is cutting the spent growth off a plant so the rest keeps blooming.
This does that to your `<head>`.

It finds HTML that is **harmful**, **deprecated** or **unnecessary**, and for every
finding it links to a written explanation of why, with sources.

```
$ npx deadhead dist

dist/index.html
  warning  meta/http-equiv-x-ua-compatible  <meta http-equiv="X-UA-Compatible" content="IE=edge">
           use: delete it  (https://deadhead.dev/rules/meta/http-equiv-x-ua-compatible)
```

## Why another linter

Most tools tell you *that* something is wrong. The interesting question with head
markup is *why*, and whether the advice you read in 2014 still holds. Every rule here
is a markdown document with at least two independent sources, and the linter is
generated from those documents. If a rule cannot be explained, it does not ship.

## Requirements

- Node `>=24.0.0` (enforced at install time via `engine-strict=true` in [`.npmrc`](.npmrc))
- pnpm (version pinned in the `packageManager` field of [`package.json`](package.json))

## Install

```bash
pnpm install
```

## Usage

Build the rule set from the markdown source of truth, then run the CLI:

```bash
pnpm build
pnpm check -- path/to/your/html
```

Other commands:

```bash
pnpm validate:rules   # frontmatter and rule docs fail fast, before the suite
pnpm test             # full test suite (node:test)
pnpm test:conformance # every fixture through every adapter
pnpm typecheck        # strict typecheck (core/rules/scripts/test + browser)
pnpm check:self       # run the linter over its own fixtures
pnpm lint:deps        # dependency hygiene check
```

## Three ways to run it

- **CLI** for CI and pre-commit: `npx deadhead dist`
- **Bookmarklet** to inspect any page you are looking at, including pages you did not
  build. It reads the rendered DOM, which is the ground truth for what shipped.
- **ESLint plugin** for editor feedback while you type.

All three run the same rule set and are tested against each other, so they cannot
disagree.

## Status

Early in development. Progress is tracked per milestone in the issue tracker.

## Contributing

One rule per issue, one rule per pull request. Open a **New rule** issue; the form is
the research checklist. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT License](LICENSE)
