---
ruleId: "meta/twitter"
title: "meta twitter:* card tags"
description: "Twitter Card metadata; X has removed its Cards documentation, and every other preview consumer reads Open Graph."
pubDate: "2026-09-13"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[name^="twitter:" i]:not([name="twitter:dnt" i]):not([name="twitter:widgets:autoload" i]):not([name="twitter:widgets:csp" i]):not([name="twitter:widgets:theme" i]), meta[property^="twitter:" i]:not([property="twitter:dnt" i]):not([property="twitter:widgets:autoload" i]):not([property="twitter:widgets:csp" i]):not([property="twitter:widgets:theme" i])'
fix: { op: "remove-element" }
replacement: "Delete every twitter:* card tag and describe the page once with Open Graph: og:title, og:description, og:image, og:url and og:type."
tags: ["head", "meta", "social", "seo"]
impacts: ["seo", "maintainability"]
related: ["link/image-src"]
---

Twitter card tags duplicate Open Graph. `<meta name="twitter:card" content="summary_large_image">`,
and the `twitter:title` and `twitter:description` that follow
it, were Twitter's card markup: its own copy of the preview metadata Open Graph already
carried. Generators and SEO plugins emit the whole block by default, so it sits next to
an identical set of `og:*` tags on most of the web.

## Why avoid

Remove them altogether. X no longer documents the format: the Cards markup reference on
developer.x.com now redirects to the docs.x.com overview, and docs.x.com has no pages on
Cards at all. Its "X for websites" section covers embedded posts, buttons and timelines.
What is left is undocumented vendor markup, maintained on every page for a platform that
no longer describes it.

**Removing them changes how links look on X, and the rule doesn't pretend otherwise.**
`twitter:card` picked the card type, and it has no Open Graph equivalent. X's last
published markup reference said that when `og:type`, `og:title` and `og:description` are
present but `twitter:card` is absent, "a summary card may be rendered". So a page that
relied on `summary_large_image` gets the small summary card instead, and loses the
`twitter:site` and `twitter:creator` attribution. That is the price, and it is accepted
here.

The one pair with a reader outside X doesn't change that. `twitter:label1` and
`twitter:data1` (and a second pair) show up as extra key/value rows when Slack unfurls a
link, and X itself never showed them. A reading time in a Slack preview isn't worth
keeping a vendor namespace alive. They go too.

Everything else in the block repeats Open Graph, which Facebook, LinkedIn, Slack, Discord
and X's own fallback all read. Two copies of the title, description and image drift apart,
and only one of them is the one people see.

## Use instead

One description of the page, in Open Graph:

```html
<meta property="og:type" content="article">
<meta property="og:url" content="https://example.com/post">
<meta property="og:title" content="A great post">
<meta property="og:description" content="Summary of the post.">
<meta property="og:image" content="https://example.com/cover.jpg">
```

## Detectability

Fully detectable. `<meta name>` holds a single value, so the rule matches the
`twitter:` prefix case-insensitively, for both `name` and `property`, which many
generators use interchangeably.

Four names are deliberately left alone: `twitter:dnt`, `twitter:widgets:autoload`,
`twitter:widgets:csp` and `twitter:widgets:theme`. They aren't card tags. X still
documents them as webpage properties for its embed widgets, and `twitter:dnt` opts
visitors out of X's personalisation. Removing that one would quietly turn tracking back
on.

## Resources

- [X Developer Platform: Cards markup (archived, 2024)](https://web.archive.org/web/2024/https://developer.x.com/en/docs/x-for-websites/cards/overview/markup): the last published tag reference: `twitter:card` sets "the card type"; without it, "a summary card may be rendered".
- [X Developer Platform: X for websites](https://docs.x.com/x-for-websites/overview): the current section, with no Cards documentation; the old markup URL redirects to docs.x.com.
- [X Developer Platform: Webpage properties](https://docs.x.com/x-for-websites/webpage-properties): `twitter:dnt` and `twitter:widgets:*`, the names this rule excludes.
- [The Open Graph protocol](https://ogp.me/): the replacement every link-preview consumer reads.
- [Matt Haughey (Slack): Everything you ever wanted to know about unfurling but were afraid to ask](https://a.wholelottanothing.org/everything-you-ever-wanted-to-know-about-unfurling-but-were-afraid-to-ask-or-how-to-make-your/): Slack's explanation of how its unfurler reads `twitter:label1` and `twitter:data1`.
