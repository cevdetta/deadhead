---
ruleId: "link/href-missing"
title: "link with neither href nor imagesrcset"
description: "A link with no href, no imagesrcset and no itemprop defines no link."
pubDate: "2026-09-21"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'link:not([href]):not([imagesrcset]):not([itemprop])'
fix: { op: "remove-element" }
replacement: "Delete the element. If a resource was meant, name it: <link rel=\"stylesheet\" href=\"main.css\">."
tags: ["hyperlinks"]
impacts: ["maintainability"]
related: ["link/preload-as-missing"]
---

A `link` with no `href`, no `imagesrcset` and no `itemprop` defines no link. The element fetches nothing and navigates nowhere.

## Why avoid

WHATWG demands `href` or `imagesrcset`, and states that absent both, the element defines no link.

Dead links of this shape come from edits that delete a URL but spare the tag. They sit in `head` unread, costing bytes and review time.

Microdata is no excuse here. A `link` carrying `itemprop` answers to a different model and never trips this rule.

## Use instead

Delete the tag. If the page needs the resource, give its address:

```html
<link rel="stylesheet" href="main.css">
```

## Detectability

Detectable with the selector alone. Each `:not` pins one address attribute absent, so the rule trips when all three are gone; any one present keeps it quiet. Microdata links stay quiet through the `itemprop` guard.

## Resources

- [WHATWG HTML: the link element](https://html.spec.whatwg.org/multipage/semantics.html#the-link-element): `href` or `imagesrcset` has to be present, and absent both the element defines no link.
- [MDN: `<link>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/link): the implicit ARIA role is a link with an `href` attribute, and every example carries one.
