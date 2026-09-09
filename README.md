# deadhead

Deadheading is cutting the spent growth off a plant so the rest keeps blooming.
This does that to your `<head>`.

It finds HTML that is **harmful**, **deprecated** or **unnecessary**, and for every
finding it links to a written explanation of why, with sources.

```
$ npx deadhead dist

dist/index.html
  5:5  unnecessary  meta/http-equiv-x-ua-compatible
       X-UA-Compatible only ever controlled Internet Explorer document modes, and no
       shipping browser reads it.
       -> Delete it. Internet Explorer and legacy Edge modes no longer exist.
       https://deadhead.dev/rules/meta/http-equiv-x-ua-compatible

x 1 finding (1 unnecessary)
```

Severity is `harmful`, `deprecated` or `unnecessary` -- what the finding costs you,
not how loudly the tool wants to say it.

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

`deadhead` takes files, directories, or globs -- it expands globs itself, so they
behave the same in every shell:

```bash
deadhead dist                        # walk a directory for .html and .htm
deadhead "src/**/*.html"             # quote it; the CLI does the expanding
deadhead --format=sarif dist         # stylish (default), json, sarif
deadhead --fail-on=harmful dist      # exit 1 only on harmful findings
deadhead --skip-templates dist       # leave <template> contents alone
```

```bash
deadhead --fix dist                   # rewrite files, then report what is left
```

Exit codes are the CI contract: **0** nothing at or above the `--fail-on` threshold,
**1** threshold met, **2** usage, config or I/O error. A broken invocation never looks
like a clean run.

### Fixes are text edits, never re-serialised markup

`--fix` splices byte ranges out of the original file. It never parses your document and
prints it back, because that rewrites quote style, attribute order, whitespace and
character references across the whole file — turning a one-line fix into a thousand-line
diff. The same property is what makes ESLint autofix free, and the conformance suite
asserts the two produce byte-identical output.

Two things are never fixed automatically: a rule that declares `fix: { op: "none" }`, and
any rule whose `detectability` is `partial` — if the rule is not certain, it does not get
to edit your file. Overlapping fixes are skipped rather than merged, and a second pass
picks them up.

### Configuration

`deadhead.config.ts`, optional, read from the project directory. Every flag beats it.

```ts
export default {
  include: ["dist/**/*.html"],
  ignore: ["**/vendor/**"],
  rules: {
    "meta/http-equiv-x-ua-compatible": "off",
    "script/type-javascript-mime": "harmful",   // or re-severity it
  },
  failOn: "deprecated",
  baseline: ".deadhead-baseline.json",
};
```

Once the packages are published, wrapping the object in `defineConfig` from
`@deadhead/cli` gets you completion and type checking; a plain object works either way.

A typo in a rule id is an error rather than a setting that silently does nothing — the
failure it prevents is a rule you thought you had disabled still being on.

### Baseline

Adopt deadhead on an existing site without fixing the backlog first:

```bash
deadhead --baseline .deadhead-baseline.json --update-baseline dist   # accept today
deadhead --baseline .deadhead-baseline.json dist                     # fail only on new
```

The baseline records a **count per file per rule**, not line numbers or source hashes.
Those rot: reindent a file, or add an element above, and every entry below it would go
stale and light up CI with findings nobody introduced. The honest cost is that an
allowance of 3 will absorb a *different* third finding of the same rule in the same file.
When the backlog shrinks, deadhead says so and suggests pruning.

Silence a finding in the markup itself:

```html
<!-- deadhead-disable-next-line meta/http-equiv-x-ua-compatible -->
<meta http-equiv="X-UA-Compatible" content="IE=edge">
```

`<!-- deadhead-disable -->` (optionally with rule ids) turns findings off until
`<!-- deadhead-enable -->`. Contents of `<pre>`, `<code>`, `<textarea>`, `<samp>` and
`<kbd>` are never linted -- documenting bad markup is not writing it.

Other commands:

```bash
pnpm validate:rules   # frontmatter and rule docs fail fast, before the suite
pnpm test             # full test suite (node:test)
pnpm test:conformance # every fixture through every adapter
pnpm typecheck        # strict typecheck (core, rules, cli, scripts, tests)
pnpm check:self       # run the linter over its own clean fixtures
pnpm lint:deps        # dependency hygiene check
```

## Three ways to run it

- **CLI** for CI and pre-commit: `npx deadhead dist`
- **Bookmarklet** to inspect any page you are looking at, including pages you did not
  build. It reads the rendered DOM, which is the ground truth for what shipped.
- **ESLint plugin** for editor feedback while you type. A convenience, not the
  foundation: for framework users the head tags often live in JSX, Vue or Svelte where
  an HTML parser never sees them.

All three run the same rule set and are tested against each other, so they cannot
disagree. `pnpm test:conformance` runs every fixture through every adapter and fails
if they diverge — including the built bookmarklet, executed as a bundle.

### Browser artifacts

```bash
pnpm build && pnpm build:bookmarklet && pnpm build:css
```

`packages/browser/bookmarklet.js` is one self-contained IIFE with the rules inlined and
no network access at all, so a strict Content-Security-Policy cannot block it — which
matters, because a locked-down page is often the one worth inspecting. The same file is
the devtools snippet: paste it into **Sources → Snippets** and run.

`packages/browser/deadhead.css` outlines offenders in place, in the
[ct.css](https://csswizardry.com/ct/) spirit, using `head, head * { display: block }` to
give head elements a box to draw. Only selector-backed rules can appear in it: a
`kind: "document"` rule asks something CSS cannot ask, and a rule refined by code is
included but drawn with a dashed outline and labelled `(approximate)`, because the
stylesheet cannot run the refinement.

### ESLint

```js
// eslint.config.js
import htmlParser from "@html-eslint/parser";
import deadhead from "eslint-plugin-deadhead";

export default [
  {
    files: ["**/*.html"],
    languageOptions: { parser: htmlParser },
    plugins: { deadhead },
    rules: deadhead.configs.recommended.rules,
  },
];
```

Rule names are the `ruleId` verbatim — `deadhead/meta/http-equiv-x-ua-compatible` —
because ESLint splits an unscoped rule id on its first slash. The ESLint config, the CLI
output, your suppression comments and the markdown all say the same permanent string.

`configs.recommended` enables everything above `unnecessary`; `configs.all` enables every
rule. Severity stays yours to set.

### What the DOM cannot see

A rendered document has no source text, so `range()` and `loc()` are `null` in the
browser, fixes are unavailable, and suppression comments are not read. A rule whose
verdict depends on byte offsets — `head/charset-position` asks whether a declaration
lands inside the first 1024 bytes — simply does not fire there. That asymmetry is
declared in the conformance suite and asserted in both directions, so it cannot quietly
become drift.

## Status

Early in development. All three runtimes work and are checked against each other; the
rule set is deliberately small while the foundations settle. Autofix, a config file and
a baseline file are the next milestone. Progress is tracked per milestone in the issue
tracker.

## Contributing

One rule per issue, one rule per pull request. Open a **New rule** issue; the form is
the research checklist. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT License](LICENSE)
