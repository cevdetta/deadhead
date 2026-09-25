---
ruleId: "link/wlwmanifest"
title: "<link rel=\"wlwmanifest\">"
description: "A manifest pointer for a writer discontinued in 2017 and dropped from WordPress 6.3."
pubDate: "2026-09-21"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'link[rel~="wlwmanifest" i]'
fix: { op: "remove-tokens", attr: "rel" }
replacement: "Delete the tag, or only the keyword when rel also holds live ones."
tags: ["microsoft"]
impacts: ["maintainability"]
related: ["link/subresource"]
---

A `link rel=wlwmanifest` points an editor integration at a manifest file that no longer ships. Windows Live Writer is discontinued, and WordPress 6.3 removed the file with all references.

## Why avoid

Microsoft discontinued Windows Live Writer in January 2017 and pulled the download, ending the single consumer of the manifest.

WordPress 6.3 removed `wlwmanifest.xml` from core with all references, deprecating `wlwmanifest_link()`. Modern installs no longer ship the file the tag points at.

It never entered any standard. The WHATWG supported-tokens list for `link` holds a dozen relations with no `wlwmanifest` among them.

A tag pointing at a missing file is worse than absent. It advertises an integration that 404s.

## Use instead

Delete the tag. There is no successor integration to point at: modern editors connect through the application itself, not through head markup.

## Detectability

Detectable with the selector alone. `rel` matches with `~=` because it is a space-separated token set, and the `i` flag folds case. No maintained consumer reads the token, so every match trips the rule.

## Resources

- [WordPress PR 4276: remove wlwmanifest.xml from core](https://github.com/WordPress/wordpress-develop/pull/4276): removes the manifest, the hook output and the references, merged for 6.3 with the function deprecated.
- [WHATWG HTML: the link element](https://html.spec.whatwg.org/multipage/semantics.html#the-link-element): the supported-tokens list names a dozen relations with no `wlwmanifest` among them.
- [Microsoft: support for Windows Essentials apps](https://support.microsoft.com/en-gb/windows/support-for-windows-essentials-apps-364adece-b947-43cb-68ce-8f4a6b2c22fd): Essentials 2012, Writer included, lost support on January 10 2017 and left download.
