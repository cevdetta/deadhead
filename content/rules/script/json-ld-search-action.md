---
ruleId: "script/json-ld-search-action"
title: "<script type=\"application/ld+json\">, microdata SearchAction"
description: "Google removed the sitelinks search box in November 2024; the SearchAction that fed it drives nothing now."
pubDate: "2026-09-23"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "any"
selector: 'script[type="application/ld+json" i], [itemtype$="schema.org/SearchAction" i][itemprop~="potentialAction" i]'
match: "logic"
fix: { op: "none" }
replacement: "Delete the potentialAction member (or the microdata item) and keep the rest of the WebSite block: Google's site-name feature still reads it."
tags: ["search", "structured-data"]
impacts: ["seo", "maintainability"]
related: ["script/json-ld-syntax", "attr/data-vocabulary"]
---

A `SearchAction` in a `WebSite` node's `potentialAction` told Google how to draw a search
box under the site's result. Google stopped drawing that box in November 2024. The markup
still ships on more than a quarter of home pages, as a URL template for a search box no
engine renders.

## Why avoid

Google announced the removal on 2024-10-21: "we'll be removing this visual element starting
on November 21, 2024", in every language and country, with the Search Console report and
the Rich Results Test highlighting gone after it. The Search Central changelog of
2024-11-29 records the documentation removed: "The sitelinks search box feature is no
longer available in Google Search results."

The markup breaks nothing. Google's notice says unsupported structured data "won't cause
issues in Search, and won't trigger errors in Search Console reports", which is why the
severity is `unnecessary`. Google adds that "there's no need" to remove it. This rule
flags it anyway, on the same line as `attr/data-vocabulary`: a block that looks live and
feeds nothing costs bytes on every page and misleads the next person who edits it.

The markup outlived the feature by a wide margin. The 2025 Web Almanac, crawled eight
months after the removal, finds `schema.org/SearchAction` on 28% of desktop and mobile
home pages and 16–17% of inner pages. The 2024 edition showed the same 28% on mobile. SEO
plugins emit the block by default, so the number tracks plugin settings, not intent.

## Use instead

Keep the `WebSite` node and drop its `potentialAction`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Example Books",
  "url": "https://example.com/"
}
</script>
```

Google's site-name feature reads `name`, `alternateName` and `url` from this node, so the
node stays. In an SEO plugin, turn off the sitelinks search box output where the plugin
offers the switch.

## Detectability

Detectable with a selector plus logic. The selector pre-filters two forms. A microdata item
typed `schema.org/SearchAction` in a `potentialAction` slot is decided there. A JSON-LD
block goes to `packages/rules/logic/script/json-ld-search-action.ts`, which parses it and
walks every object and array, `@graph` included. It reports the script when a
`potentialAction` value holds a node whose `@type` is, or lists, `SearchAction`: bare,
`schema:SearchAction`, or the full schema.org IRI. The CLI, the bookmarklet and the ESLint
plugin all report; none skips, since the logic reads the script text and no source offset.

schema.org still defines `SearchAction` with no deprecation mark, so the rule targets the
Google pattern and not the type. A `SearchAction` outside `potentialAction` describes a
search and stays quiet. A block that fails `JSON.parse` is `script/json-ld-syntax`'s
finding, never this one's. RDFa (`typeof="SearchAction"` under a schema.org `vocab`) goes
unreported.

There is no autofix. The same block carries the `WebSite` data Google still reads, so
removing the element drops live data, and deleting one `potentialAction` member is a JSON
edit no fix op expresses.

## Resources

- [Google Search Central Blog: Farewell, Sitelinks Search Box](https://developers.google.com/search/blog/2024/10/sitelinks-search-box): John Mueller, 2024-10-21; removal from 2024-11-21, the markup "won't cause issues", and site names still read `WebSite` structured data.
- [Google Search Central: Latest documentation updates](https://developers.google.com/search/updates): 2024-11-29, "Removed the sitelinks search box documentation"; the feature "is no longer available in Google Search results".
- [schema.org: SearchAction](https://schema.org/SearchAction): defines the type under `Action`, with the `WebSite` and `potentialAction` example, and no deprecation mark.
- [Web Almanac 2025: SEO](https://almanac.httparchive.org/en/2025/seo): July 2025 crawl; `schema.org/SearchAction` on 28% of desktop and mobile home pages.
- [Google Search Central: Site names](https://developers.google.com/search/docs/appearance/site-names): the live feature that reads the `WebSite` node, and the reason the fix keeps it.
