---
ruleId: "meta/abstract"
title: "meta name=\"abstract\""
description: "A page-summary hint that no search crawler reads; description carries the summary, not this duplicate."
pubDate: "2026-09-19"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[name="abstract" i]'
fix: { op: "remove-element" }
replacement: "Delete the element. The summary belongs in meta name=description, not in this duplicate."
tags: ["head", "meta", "seo"]
impacts: ["seo", "maintainability"]
related: ["meta/coverage", "meta/distribution"]
---

`<meta name="abstract">` carries a page summary for crawlers. No crawler reads it: Google leaves the name off its supported list and the extension registry holds no row for the bare name.

## Why avoid

Google names the tags its crawler supports and leaves `abstract` off the list. Google states that it ignores tags outside the list, so the element adds bytes crawlers skip.

The WHATWG wiki MetaExtensions table holds rows for qualified Dublin Core names with no row for bare `abstract`. I searched the table with a case-insensitive query and found nothing, so the name sits outside the registry. `dcterms.abstract` holds a Proposal row with a schema link condition and names `description` as synonym, so the gap concerns the bare name alone.

DCMI defines `abstract` as summary of the resource, a subproperty of description. That definition describes catalog scope for libraries and archives, not a signal crawlers read.

The hint duplicates a tag crawlers check: `description` supplies the snippet in search results. A hint they skip duplicates a tag they read, and the two drift apart with no warning.

## Use instead

Delete the element. State the summary in `description`:

```html
<meta name="description" content="Field guide to head metadata and the tags crawlers read.">
```

## Detectability

Detectable with one selector. The rule matches `meta` elements whose `name` is `abstract`, with the `i` flag for case variants. `=` fits because `name` holds a single value, not a token set.

## Resources

- [Google Search Central: Meta tags and attributes that Google supports](https://developers.google.com/search/docs/crawling-indexing/special-tags): Google lists supported `meta` tags with no `abstract` and states it ignores tags outside the list.
- [WHATWG Wiki: MetaExtensions](https://wiki.whatwg.org/wiki/MetaExtensions): the extension registry with no row for bare `abstract`; `dcterms.abstract` holds a Proposal row with a schema link condition and names `description` as synonym.
- [DCMI: DCMI Metadata Terms, abstract](https://www.dublincore.org/specifications/dublin-core/dcmi-terms/terms/abstract/): defines `abstract` as summary of the resource, a subproperty of description.
