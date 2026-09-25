---
ruleId: "link/microsummary"
title: "<link rel=\"microsummary\">"
description: "A live-bookmark generator hook whose single consumer dropped it in Firefox 6."
pubDate: "2026-09-21"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'link[rel~="microsummary" i]'
fix: { op: "remove-tokens", attr: "rel" }
replacement: "Delete the tag, or only the keyword when rel also holds live ones. Live bookmark titles no longer exist anywhere to point at."
tags: ["mozilla"]
impacts: ["maintainability"]
related: ["link/subresource"]
---

A `link rel=microsummary` names a generator for live bookmark titles. Firefox dropped the feature in version 6 as seldom used, undiscoverable and unmaintained; no other engine ever carried it.

## Why avoid

Bugzilla 524091 removed microsummary support, verified fixed for Firefox 6. The feature sat seldom used, undiscoverable and unmaintained.

Bugzilla 745410 then swept the remaining microsummary support from bookmarks, resolved fixed years later. The leftovers are gone too.

It never entered any standard. The WHATWG supported-tokens list for `link` holds a dozen relations with no `microsummary` among them.

A tag naming a generator that no longer exists is worse than absent. The live titles never update, and the reader assumes the hook story is handled.

## Use instead

Delete the tag. There is no successor hook: live bookmark titles exist in no current engine.

## Detectability

Detectable with the selector alone. `rel` matches with `~=` because it is a space-separated token set, and the `i` flag folds case. No engine ships support for the token, so every match trips the rule.

## Resources

- [Bugzilla: remove microsummaries support](https://bugzilla.mozilla.org/show_bug.cgi?id=524091): seldom used, undiscoverable and unmaintained, verified fixed for Firefox 6.
- [Bugzilla: remove remaining microsummary support from bookmarks](https://bugzilla.mozilla.org/show_bug.cgi?id=745410): resolved fixed, sweeping the leftovers.
- [WHATWG HTML: the link element](https://html.spec.whatwg.org/multipage/semantics.html#the-link-element): the supported-tokens list names a dozen relations with no `microsummary` among them.
