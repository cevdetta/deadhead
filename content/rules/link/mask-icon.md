---
ruleId: "link/mask-icon"
title: "link rel=\"mask-icon\""
description: "A Safari-only monochrome pinned-tab icon that was never a link type; it should not be used."
pubDate: "2026-09-13"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'link[rel~="mask-icon" i]'
fix: { op: "none" }
replacement: "Serve a regular favicon instead: <link rel=\"icon\" href=\"/icon.svg\" type=\"image/svg+xml\">, then delete the mask icon and its SVG."
tags: ["apple", "icons"]
impacts: ["maintainability"]
related: ["link/shortcut-icon", "link/apple-touch-icon"]
---

`<link rel="mask-icon">` serves one retired surface: Safari pinned tabs. Safari 9 on OS X
El Capitan introduced pinned tabs, and with them a new kind of icon:
`<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#cc241d">`. The SVG had to be
a single layer of 100% black on transparent, drawn on a 16×16 viewBox, and Safari tinted
it with the `color` attribute. Favicon generators still emit it, along with a
`safari-pinned-tab.svg` nobody remembers asking for.

## Why avoid

It was only ever for one surface. Apple defined `mask-icon` in its Safari Web Content
Guide, and nowhere else. That guide now sits in Apple's documentation archive, last
updated in 2016. No other browser reads the element.

It never became a link type. The rel registry the HTML Standard defers to for extensions
lists `mask-icon` as `proposed`, with a specification column that reads "probably
redundant with rel-icon". WebKit's own link-relation parser doesn't know it either: the
icon relations it recognises are `icon`, `shortcut icon`, `apple-touch-icon` and
`apple-touch-icon-precomposed`. Only the Safari app reads `mask-icon`, outside the engine.

The markup isn't valid HTML. `<link>` has no `color` attribute, so validators flag it,
and the site's brand colour ends up duplicated in an attribute nobody maintains.

The reason it existed is gone. Safari 12 started showing website icons in tabs, and it
uses the ordinary favicon for a pinned tab when no mask icon is present. So a site
carrying `mask-icon` is maintaining a second icon asset, in a constrained format, only to
override an icon Safari would already show. That override is also why the tag isn't
inert: while it's present, Safari still prefers it.

## Use instead

The regular favicon, which every browser uses, Safari's tabs included:

```html
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="32x32">
```

Then delete the `<link rel="mask-icon">` and `safari-pinned-tab.svg`.

## Detectability

Fully detectable. The rule matches with `~=` because `rel` is a space-separated token set,
the same reasoning as `link/shortcut-icon`.

There is no autofix. Safari still picks the mask icon over the favicon when both are
present, so deleting the element changes what a pinned tab looks like, and a fix must
never change behaviour. The site owner should remove it on purpose, with a favicon that
works as a pinned-tab icon.
That preference is known only from user reports, not from Apple documentation.

## Resources

- [Apple Developer: Creating Pinned Tab Icons (Safari Web Content Guide, archived)](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/pinnedTabs/pinnedTabs.html): the only definition of `mask-icon` and its `color` attribute; a Documentation Archive page last updated 2016-12-12.
- [microformats: existing rel values](https://microformats.org/wiki/existing-rel-values): the registry named by the HTML Standard; lists `mask-icon` as `proposed`, "probably redundant with rel-icon".
- [WebKit: `Source/WebCore/html/LinkRelAttribute.cpp`](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/html/LinkRelAttribute.cpp): the engine's rel parser recognises `icon`, `shortcut icon` and the `apple-touch-icon` pair, and not `mask-icon`.
- [HTML Standard: link types](https://html.spec.whatwg.org/multipage/links.html#linkTypes): `mask-icon` is not a defined keyword, and `<link>` defines no `color` attribute.
- [Apple Developer: Safari 12 Release Notes](https://developer.apple.com/documentation/safari-release-notes/safari-12-release-notes): "Icons in Tabs. Show website icons in tabs."
- [gethomepage/homepage#2323: "The safari-pinned-tab mask-icon overrides custom favicon"](https://github.com/gethomepage/homepage/issues/2323): a user report that Safari still prefers the mask icon when present; the reason the fix is `none`.
