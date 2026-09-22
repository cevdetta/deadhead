---
ruleId: "link/rel-sidebar"
title: "link rel=sidebar"
description: "A Firefox-alone sidebar hint dropped in Firefox 63; other engines always treated it as a plain link."
pubDate: "2026-09-21"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'link[rel~="sidebar" i]'
fix: { op: "remove-element" }
replacement: "Delete the tag. Link the destination as a plain link instead: <a href=\"/help\">Help</a>."
tags: ["head", "link"]
impacts: ["maintainability"]
related: ["link/rel-subresource"]
---

A `link rel=sidebar` promises sidebar delivery and delivers a plain link at best. Firefox removed the feature in version 63; no other engine ever implemented it.

## Why avoid

WHATWG issue 582 records the state of play: Firefox alone implemented `rel="sidebar"`, and every other engine treated such links as plain links.

Bugzilla 1452645 then removed the feature itself, verified fixed for Firefox 63, on the grounds that it sat unloved, buggy and complex.

It never entered any standard. The WHATWG supported-tokens list for `link` holds a dozen relations with no `sidebar` among them.

A tag promising panel delivery while delivering a plain link at best is worse than absent. The sidebar behavior the author wanted never happens anywhere.

## Use instead

A plain link to the destination:

```html
<a href="/help">Help</a>
```

## Detectability

Detectable with the selector alone. `rel` matches with `~=` because it is a space-separated token set, and the `i` flag folds case. No engine ships support for the token, so every match trips the rule.

## Resources

- [Bugzilla: remove "Open in Sidebar" feature](https://bugzilla.mozilla.org/show_bug.cgi?id=1452645): verified fixed for Firefox 63, with the unloved-and-complex rationale.
- [WHATWG HTML issue 582](https://github.com/whatwg/html/issues/582): Firefox alone implemented it while all others treated it as a plain link.
- [WHATWG HTML: the link element](https://html.spec.whatwg.org/multipage/semantics.html#the-link-element): the supported-tokens list names a dozen relations with no `sidebar` among them.
