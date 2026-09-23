---
ruleId: "meta/http-equiv-name-misuse"
title: "meta http-equiv with a metadata name"
description: "http-equiv values like keywords or author are not pragma directives and do nothing. Use name values or charset and lang."
pubDate: "2026-09-14"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "head"
selector: "meta[http-equiv]"
match: "logic"
fix: { op: "none" }
replacement: "Move each value where it belongs: <meta name=\"…\"> for theme-color, generator, author and the rest; <meta charset=\"utf-8\"> for charset/encoding; <html lang> for language/lang; delete the rest."
tags: ["http-equiv"]
impacts: ["maintainability", "interop"]
related: ["meta/http-equiv-robots", "meta/http-equiv-description", "meta/keywords", "head/charset-position", "meta/http-equiv-content-type", "meta/http-equiv-content-language"]
---

Metadata names in `http-equiv` do nothing. `http-equiv` turns a `<meta>` element
into a pragma directive: an instruction that
simulates an HTTP response header, like `refresh` or `content-security-policy`. It
is not a general metadata slot, but boilerplate keeps putting metadata names
there: `keywords` and `author`. Values the pragma table maps to no
state, where the browser ignores them. A crawl of the web finds
`http-equiv=keywords` alone over 30,000 times.

## Why avoid

It does nothing. Unrecognized pragma values are ignored, so the metadata never
reaches any consumer. No browser and no crawler sees it, and MDN warns this produces
inconsistent behavior across implementations.

What is left is worse than inert, because it hides real metadata. A `theme-color`
or `author` written as `http-equiv` never applies; the author believes it declared
and stops looking. Silent failure is exactly what a linter exists to catch.

It copies forward for the same reason. Nothing visibly breaks, so the spelling
survives: alongside `keywords`, the crawl finds `revisit-after`, `charset`,
`generator`, `lang` and `resource-type` as `http-equiv` values in the hundreds to
thousands.

The `charset`/`encoding`/`language`/`lang` variants are additionally wrong in the
way `meta/http-equiv-content-type` is: they duplicate declarations the spec wants
exactly once, in `<meta charset>` and `<html lang>`.

## Use instead

Move each value where it belongs:

```html
<meta name="theme-color" content="#3c790a">
<meta name="author" content="Ada Lovelace">
<meta charset="utf-8">
```

```html
<html lang="en">
```

`keywords` (see `meta/keywords`), `copyright`, `title`, `distribution`,
`classification` and `resource-type` have no home anywhere. Delete them.

## Detectability

Fully detectable, but the rule does not work by selector alone. `meta[http-equiv]` is only a
pre-filter: the verdict depends on whether the value is one of seventeen
misused names, matched ASCII case-insensitively, which the selector subset cannot
enumerate. The decision therefore lives in
`packages/rules/logic/meta/http-equiv-name-misuse.ts`.

Two exclusions are load-bearing: `robots` and `description` are *not* reported
here. Own rules (`meta/http-equiv-robots`, `meta/http-equiv-description`) cover
them, so the rule reports each element exactly once.

There is no autofix. Each hit needs a different repair, and no single text edit is
correct for all of them. A fixer that guessed would mangle metadata.

## Resources

- [HTML Standard: Pragma directives](https://html.spec.whatwg.org/multipage/semantics.html#pragma-directives): the table lists exactly seven keywords; every value in this rule maps to no state.
- [HTML Standard: Standard metadata names](https://html.spec.whatwg.org/multipage/semantics.html#standard-metadata-names): `author`, `generator`, `theme-color` and `keywords` are defined as `name` values, not pragmas.
- [MDN: `<meta http-equiv>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/http-equiv): only a subset of headers is supported as `http-equiv` values; unrecognized values are ignored, which leads to inconsistent behavior.
- [You probably don't need http-equiv meta tags](https://rviscomi.dev/2023/07/you-probably-dont-need-http-equiv-meta-tags/): crawl counts for `http-equiv=keywords` (30,526), `revisit-after`, `charset`, `generator`, `lang` and `resource-type`, all non-conforming.
- [WHATWG MetaExtensions](https://wiki.whatwg.org/wiki/MetaExtensions): `audience`, `revisit-after` and `apple-mobile-web-app-capable` are registered `name` extensions; `distribution`, `classification` and `resource-type` appear nowhere in it.
