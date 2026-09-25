---
ruleId: "link/vendor-keywords"
title: "<link rel> vendor keywords"
description: "Link types one product or tool defined: HTML gives none of them a processing model. Safari on iOS still reads one, the startup image."
pubDate: "2026-09-24"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'link[rel~="apple-touch-startup-image" i], link[rel~="component" i], link[rel~="entry-content" i], link[rel~="openid.delegate" i], link[rel~="openid.server" i], link[rel~="openid2.provider" i], link[rel~="openid2.local_id" i], link[rel~="pavatar" i], link[rel~="fluid-icon" i], link[rel~="edituri" i], link[rel~="p3pv1" i], link[rel~="publisher" i], link[rel~="original-source" i], link[rel~="chrome-webstore-item" i]'
match: "logic"
fix: { op: "remove-tokens", attr: "rel" }
replacement: "Delete the tag, or the keyword alone when rel also holds live ones. Keep edituri while WordPress apps use the XML-RPC endpoint. Ship splash screens through the Web App Manifest and components through ES modules."
tags: ["hyperlinks"]
impacts: ["maintainability"]
related: ["link/navigation-keywords", "link/document-info-keywords", "link/wlwmanifest", "link/import", "link/sidebar", "meta/apple-mobile-web-app-capable"]
---

Fourteen `link` tokens were defined by one product or tool, not by HTML. The set spans an
iOS launch image and a Web Components v0 import, an IE Web Slice source and OpenID
discovery endpoints, a rejected avatar hook, a P3P privacy policy, a Google+ publisher
profile, Chrome Web Store installs and WordPress's XML-RPC discovery. The living link
table defines none of them, and HTML gives none a processing model a browser could
implement. Safari on iOS reads the startup image anyway.

## Why avoid

None of the fourteen is in the living link table, which holds 27 types from `alternate`
to `prev`. The microformats registry lists eleven of them as extensions, but the `<link>`
element section's "possible supported tokens", the keywords a browser can implement,
run from `alternate` to `stylesheet` and include none of the fourteen. A `<link>` whose
keywords are neither in the table nor allowed by the registry "does not create any
links".

Apple archives the launch-image doc under Documentation Archive. Chrome 80 removed Web
Components v0 with HTML Imports named in the removal list. Web Slices died with IE, and
Microsoft keeps the Web Slice format that names `entry-content` under previous versions.
OpenID 2.0 defines HTML discovery around `openid2.provider`, with `openid2.local_id`
beside it, while the 1.x names `openid.server` and `openid.delegate` persist in compat
text. Pavatar never left the proposal stage: the rejected-formats page records its
rejection.

The microformats registry lists `p3pv1`, `publisher` and `chrome-webstore-item` as
proposed extensions, each tied to one product: `p3pv1` "references a machine-readable
privacy policy description in the P3P format", `publisher` points at "a Google+ profile"
or similar, and `chrome-webstore-item` declares "inline installations hosted in the
Chrome Web Store". None of the three left proposal status. `fluid-icon` and
`original-source` appear nowhere in the living table.

`edituri` still has a reader outside the browser. WordPress prints
`<link rel="EditURI" type="application/rsd+xml">` on every page by default, and the
official WordPress iOS and Android apps regex-match that exact tag to find a self-hosted
site's XML-RPC endpoint when the default path fails. Deleting the token breaks that
reader, even though no browser creates a link from it.

One exception stays live in a browser. web.dev's PWA course, updated 2024-09-20, tells
authors to set iOS and iPadOS splash screens with `apple-touch-startup-image` links,
because those systems build no splash screen from the Web App Manifest. The rule removes
the link regardless and names the cost. Apple's archived guide, updated 2016-12-12, gives
the default launch image as "a screenshot of the web application the last time it was
launched"; web.dev says that without a startup image "a white screen will appear instead
in the opening animation". Elsewhere the cost is bytes and review time. A tag promising
splash, component, or discovery delivery where the standard defines none misleads the
next reader.

## Use instead

Delete the tag. Ship splash screens through the Web App Manifest, which Android builds one
from and iOS does not, components through ES modules with custom elements v1, and sign-in
discovery through OpenID Connect Discovery.
Keep `edituri` if the site still serves the XML-RPC endpoint WordPress apps discover
through it; once XML-RPC is off, the `EditURI` link points at a dead endpoint and can go.

```html
<script type="module" src="/components/my-el.js"></script>
```

## Detectability

Detectable with the selector alone. Each branch pins one vendor token with `~=`, and the
`i` flag folds case. Anything unlisted stays quiet by construction. A logic module
decides whether the autofix runs; the selector alone decides the finding.

The autofix deletes every listed keyword, and the tag once no live keyword is left, on a
link whose `rel` does not hold `edituri`. A link holding `edituri` carries no fix: the
fixer deletes every keyword the selector tests, and deleting `edituri` breaks the
WordPress apps' XML-RPC endpoint discovery. A person has to check whether the endpoint
still serves them before removing it.

For twelve of the other thirteen tokens the removal takes nothing working with it: HTML
gives the token no processing model, so the element does nothing in a browser. Deleting the
startup image takes the launch image from a Home-screen launch on iOS and iPadOS; the
white screen or last-launch screenshot described above shows instead.

## Resources

- [WHATWG HTML: links](https://html.spec.whatwg.org/multipage/links.html): the living link-types table and the per-keyword link creation rule; fetched 2026-09-22.
- [HTML Standard §4.2.4: The link element](https://html.spec.whatwg.org/multipage/semantics.html#the-link-element): a `<link>` with no allowed keyword "does not create any links"; the "possible supported tokens" run from `alternate` to `stylesheet` and include none of the fourteen.
- [Apple: Configuring Web Applications](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html): Documentation Archive, updated 2016-12-12; names the startup-image tag with the exact markup; "By default, a screenshot of the web application the last time it was launched is used."
- [web.dev: Learn PWA, Enhancements](https://web.dev/learn/pwa/enhancements): updated 2024-09-20; iOS and iPadOS take splash screens from `apple-touch-startup-image` links, not the manifest, and without one "a white screen will appear instead in the opening animation".
- [Chrome: Deprecations and removals in Chrome 80](https://developer.chrome.com/blog/chrome-80-deps-rems): Web Components v0 removed with HTML Imports named.
- [OpenID Authentication 2.0](https://openid.net/specs/openid-authentication-2_0.html): section 7.3.3, HTML-Based Discovery, mandates `openid2.provider` with `openid2.local_id` beside it.
- [Microsoft: Web Slice Format Specification 0.9](https://learn.microsoft.com/en-us/previous-versions/windows/desktop/cc304073(v=vs.85)): archived previous-versions doc; names `rel="entry-content"` as the alternative display source.
- [Microformats: existing rel values](https://microformats.org/wiki/existing-rel-values): extension rows for the vendor tokens, with `p3pv1`, `publisher` and `chrome-webstore-item` at proposed status, and the pavatar rejection.
- [WordPress Developer Reference: `rsd_link()`](https://developer.wordpress.org/reference/functions/rsd_link/): WordPress core prints the `EditURI` link on every page by default.
- [WordPress for iOS: `WordPressOrgXMLRPCValidator.swift`](https://github.com/wordpress-mobile/WordPress-iOS/blob/trunk/Modules/Sources/WordPressKit/WordPressOrgXMLRPCValidator.swift): `extractRSDURLFromHTML` pulls the RSD link out of the page when the default XML-RPC path fails.
- [WordPress for Android: `SelfHostedEndpointFinder.java`](https://github.com/wordpress-mobile/WordPress-Android/blob/trunk/libs/fluxc/src/main/java/org/wordpress/android/fluxc/network/discovery/SelfHostedEndpointFinder.java): `RSD_LINK` regex-matches `<link rel="EditURI" type="application/rsd+xml" title="RSD">` during endpoint discovery.
