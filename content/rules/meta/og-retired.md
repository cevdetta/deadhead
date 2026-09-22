---
ruleId: "meta/og-retired"
title: "retired Open Graph properties"
description: "Eleven retired properties absent from the protocol; no parser reads them."
pubDate: "2026-09-21"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[property="og:email" i], meta[property="og:phone_number" i], meta[property="og:fax_number" i], meta[property="og:latitude" i], meta[property="og:longitude" i], meta[property="og:street-address" i], meta[property="og:locality" i], meta[property="og:region" i], meta[property="og:postal-code" i], meta[property="og:country-name" i], meta[property="fb:page_id" i]'
fix: { op: "remove-element" }
replacement: "Delete the tag."
tags: ["head", "meta", "social"]
impacts: ["seo"]
related: ["meta/og-name-misuse"]
---

A `property` from the retired Open Graph set feeds no parser. Eleven such properties trip this rule; live properties stay quiet.

## Why avoid

The current protocol omits all eleven. Each was checked against the fetched ogp.me text with zero hits: no email, no phone numbers, no coordinates, no address parts, no page id.

The registry pattern agrees. `fb:page_id` sits as an incomplete proposal, and the geo/contact generation left with the old protocol drafts.

A retired property feeds no parser, so contact and location details written this way reach nobody. Authors believing otherwise skip working alternatives.

Dead properties cost bytes and review time, and address parts cost trust too. A card showing no location reads as a business with no address.

## Use instead

Delete the tag. There is no protocol successor for these fields; publish location and contact details in page content and structured data instead.

## Detectability

Detectable with the selector alone. Each branch pins one retired value with `=`, and the `i` flag folds case. Anything unlisted stays quiet by construction.

## Resources

- [ogp.me: the Open Graph protocol](https://ogp.me/): the current property list, checked name by name with zero hits for all eleven.
- [WHATWG Wiki: MetaExtensions](https://wiki.whatwg.org/wiki/MetaExtensions): the incomplete-proposal pattern for retired social vocabularies.
