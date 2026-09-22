---
ruleId: "link/rel-dead-vendor"
title: "link rel with a dead vendor token"
description: "Eight retired product tokens no engine honors as link types."
pubDate: "2026-09-22"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'link[rel~="apple-touch-startup-image" i], link[rel~="component" i], link[rel~="entry-content" i], link[rel~="openid.delegate" i], link[rel~="openid.server" i], link[rel~="openid2.provider" i], link[rel~="openid2.local_id" i], link[rel~="pavatar" i]'
fix: { op: "remove-element" }
replacement: "Delete the tag. Ship splash screens through the Web App Manifest, components through ES modules, and sign-in through OpenID Connect Discovery."
tags: ["head", "link"]
impacts: ["maintainability"]
related: ["link/obsolete-rel", "link/rel-import", "link/rel-sidebar", "meta/apple-mobile-web-app-capable"]
---

Eight `link` tokens promise work no HTML5 engine performs. The set spans an iOS launch image and a Web Components v0 import, an IE Web Slice source and an OpenID discovery endpoint, plus a rejected avatar hook. The living link table defines none of them, so the element fetches nothing and navigates nowhere.

## Why avoid

A `rel` keyword outside the living table creates no link. The HTML Standard builds links per defined keyword and discards the rest. Its table holds 27 types, from `alternate` to `prev`, and names none of the eight.

Apple archives the launch-image doc under Documentation Archive. Chrome 80 removed Web Components v0 with HTML Imports named in the removal list. Web Slices died with IE. OpenID 2.0 defines HTML discovery around `openid2.provider`, with `openid2.local_id` beside it, while the 1.x names persist in compat text. Pavatar never left the proposal stage: the rejected-formats page records its rejection.

One exception stays live: Safari on iOS still honors the startup image, and current PWA guides document it. The rule removes it regardless and names the cost: deletion falls back to a screenshot of the last launch. Elsewhere the cost is bytes and review time. A tag promising splash, component, or discovery delivery where the standard defines none misleads the next reader.

## Use instead

Delete the tag. Ship splash screens through the Web App Manifest, components through ES modules with custom elements v1, and sign-in discovery through OpenID Connect Discovery.

```html
<script type="module" src="/components/my-el.js"></script>
```

## Detectability

Detectable with the selector alone. Each branch pins one dead token with `~=`, and the `i` flag folds case.

The fix removes the element. For seven tokens the removal takes nothing working with it: no defined link type sits behind the token, so the element does nothing. The eighth, the startup image, loses its launch image on Home-screen launch. The fallback is a screenshot of the last launch, as stated above.

## Resources

- [WHATWG HTML: links](https://html.spec.whatwg.org/multipage/links.html): the living link-types table and the per-keyword link creation rule; fetched 2026-09-22.
- [Apple: Configuring Web Applications](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html): Documentation Archive, updated 2016-12-12; names the startup-image tag with the exact markup.
- [Chrome: Deprecations and removals in Chrome 80](https://developer.chrome.com/blog/chrome-80-deps-rems): Web Components v0 removed with HTML Imports named.
- [OpenID Authentication 2.0](https://openid.net/specs/openid-authentication-2_0.html): section 7.3.3, HTML-Based Discovery, mandates `openid2.provider` with `openid2.local_id` beside it.
- [Microsoft: Web Slice Format Specification 0.9](https://learn.microsoft.com/en-us/previous-versions/windows/desktop/cc304073(v=vs.85)): archived previous-versions doc; names `rel="entry-content"` as the alternative display source.
- [Microformats: existing rel values](https://microformats.org/wiki/existing-rel-values): extension rows for the vendor tokens and the pavatar rejection.
