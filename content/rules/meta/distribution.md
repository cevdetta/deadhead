---
ruleId: "meta/distribution"
title: "meta name=\"distribution\""
description: "A distribution-scope hint (global, local, IU) that no search crawler reads; scope comes from targeting tools, not markup."
pubDate: "2026-09-19"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[name="distribution" i]'
fix: { op: "remove-element" }
replacement: "Delete the element. Reach comes from Search Console targeting and hreflang, not from markup."
tags: ["head", "meta", "seo"]
impacts: ["seo", "maintainability"]
related: ["meta/keywords", "meta/revisit-after"]
---

`<meta name="distribution">` marks a page `global`, `local`, or `IU` for crawlers. No crawler reads the mark: Google leaves the name off its supported list and the extension registry holds no row for it.

## Why avoid

Google names the tags its crawler supports and leaves `distribution` off the list. Google states that it ignores tags outside the list, so the element adds bytes crawlers skip.

The WHATWG wiki MetaExtensions table holds rows for standard crawler names with no row for `distribution`. I searched the table with a case-insensitive query and found nothing, so the name sits outside the registry.

MDN lists standard names plus common extension names for `meta` name with no `distribution`. The name appears in no standard and in no documented extension set.

The hint duplicates a channel crawlers check: Search Console targeting and hreflang set reach per URL. A hint they skip duplicates a setting they read elsewhere, and the two drift apart with no warning.

## Use instead

Delete the element. Set regional reach with hreflang and Search Console targeting:

```html
<link rel="alternate" hreflang="de" href="https://example.com/de/guide">
```

## Detectability

Detectable with one selector. The rule matches `meta` elements whose `name` is `distribution`, with the `i` flag for case variants. `=` fits because `name` holds a single value, not a token set.

## Resources

- [Google Search Central: Meta tags and attributes that Google supports](https://developers.google.com/search/docs/crawling-indexing/special-tags): Google lists supported `meta` tags with no `distribution` and states it ignores tags outside the list.
- [WHATWG Wiki: MetaExtensions](https://wiki.whatwg.org/wiki/MetaExtensions): the extension registry with no row for `distribution`.
- [MDN: meta name](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name): standard names plus common extension names with no `distribution`.
