---
ruleId: "meta/coverage"
title: "meta name=\"coverage\""
description: "A geographic-scope hint (Worldwide, Global) that no search crawler reads; reach comes from targeting tools, not markup."
pubDate: "2026-09-19"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[name="coverage" i]'
fix: { op: "remove-element" }
replacement: "Delete the element. Reach comes from Search Console targeting and hreflang, not from markup."
tags: ["search"]
impacts: ["seo", "maintainability"]
related: ["meta/distribution", "meta/revisit-after"]
---

`<meta name="coverage">` marks a page `Worldwide` or `Global` for crawlers. No crawler reads the mark: Google leaves the name off its supported list and the extension registry holds no row for the bare name.

## Why avoid

Google names the tags its crawler supports and leaves `coverage` off the list. Google states that it ignores tags outside the list, so the element adds bytes crawlers skip.

The WHATWG wiki MetaExtensions table holds rows for qualified Dublin Core names with no row for bare `coverage`. I searched the table with a case-insensitive query and found nothing, so the name sits outside the registry. `dcterms.coverage` holds a Proposal row with a schema link condition, so the gap concerns the bare name alone.

DCMI defines `coverage` as spatial or temporal topic, spatial applicability, or jurisdiction, with a note to prefer Temporal Coverage and Spatial Coverage. That definition describes catalog scope for libraries and archives, not a signal crawlers read.

The hint duplicates a channel crawlers check: Search Console targeting and hreflang set reach per URL. A hint they skip duplicates a setting they read elsewhere, and the two drift apart with no warning.

## Use instead

Delete the element. Set regional reach with hreflang and Search Console targeting:

```html
<link rel="alternate" hreflang="de" href="https://example.com/de/guide">
```

## Detectability

Detectable with one selector. The rule matches `meta` elements whose `name` is `coverage`, with the `i` flag for case variants. `=` fits because `name` holds a single value, not a token set.

## Resources

- [Google Search Central: Meta tags and attributes that Google supports](https://developers.google.com/search/docs/crawling-indexing/special-tags): Google lists supported `meta` tags with no `coverage` and states it ignores tags outside the list.
- [WHATWG Wiki: MetaExtensions](https://wiki.whatwg.org/wiki/MetaExtensions): the extension registry with no row for bare `coverage`; `dcterms.coverage` holds a Proposal row with a schema link condition.
- [DCMI: DCMI Metadata Terms, coverage](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/#coverage): defines `coverage` as spatial or temporal topic, spatial applicability, or jurisdiction, with a note to prefer Temporal Coverage and Spatial Coverage.
