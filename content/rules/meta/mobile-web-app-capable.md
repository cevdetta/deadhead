---
ruleId: "meta/mobile-web-app-capable"
title: "<meta name=\"mobile-web-app-capable\">"
description: "Chrome's pre-manifest switch for launching a home screen shortcut as an app; the manifest's display member replaced it."
pubDate: "2026-09-13"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[name="mobile-web-app-capable" i]'
fix: { op: "remove-element" }
replacement: "Delete it and declare \"display\": \"standalone\" in a web app manifest linked with <link rel=\"manifest\">."
tags: ["web-app"]
impacts: ["maintainability"]
related: ["meta/apple-mobile-web-app-capable", "meta/application-name"]
---

The manifest replaced `mobile-web-app-capable`. `<meta name="mobile-web-app-capable" content="yes">`
is Chrome for Android's answer to
Apple's `apple-mobile-web-app-capable`: the same switch without the vendor prefix. Chrome 31
introduced it in 2013 so that "Add to Home screen" could make a shortcut that launches like
an app. It has a second life, because Chrome's console suggests it as the
replacement for the Apple tag, and frameworks took the hint.

## Why avoid

It is the mechanism the manifest replaced. From Chrome 39, Chrome's own documentation
recommended the W3C web app manifest and described this tag as only for Chrome before M39.
Mozilla quoted exactly that when it declined to implement the tag in Firefox for Android.
The WHATWG registry of meta names never got further than listing it as a "Proposal",
specified by a Google help page, "though a WHATWG or W3C spec would be preferred". The
standard that did arrive is the manifest's `display` member.

Chrome still reads it, so this isn't a dead tag, and the rule doesn't pretend otherwise.
Chromium extracts it into page metadata. When someone adds a page to the home screen,
Chrome for Android checks for a manifest first. Only when there isn't one does the meta
flag decide whether the shortcut is treated as an app (this tag, or the Apple spelling) or
a plain bookmark. On a page with a manifest, the tag changes nothing.

So the console advice solves the wrong problem. Swapping `apple-mobile-web-app-capable`
for `mobile-web-app-capable` trades one vendor switch for another. A page with both tags
and a manifest declares its launch mode three times, and the manifest is the one that
counts.

## Use instead

```html
<link rel="manifest" href="/app.webmanifest">
```

```json
{
  "name": "Example",
  "start_url": "/",
  "scope": "/",
  "display": "standalone"
}
```

## Detectability

Fully detectable. `<meta name>` holds a single value, so the rule matches with `=`
and the `i` flag.

The fix removes the element unconditionally. With a manifest in place that is inert,
because Chrome consults the manifest first. Without one, Chrome for Android falls back
to the meta flag: the tag makes an app shortcut, its absence a plain bookmark shortcut.
Add the manifest and its
`display` member before applying the fix.

## Resources

- [Mozilla Bugzilla 1114631: Detect "web app capable" sites using meta mobile-web-app-capable](https://bugzilla.mozilla.org/show_bug.cgi?id=1114631): Firefox declined, quoting Chrome's docs: "only recommended for Chrome prior to version M39, from M39 the new W3C web app manifest is the recommended way".
- [WHATWG wiki: MetaExtensions](https://wiki.whatwg.org/wiki/MetaExtensions): `mobile-web-app-capable` registered as a "Proposal", with `apple-mobile-web-app-capable` as its vendor synonym.
- [Chromium: `components/webapps/browser/android/add_to_homescreen_data_fetcher.cc`](https://github.com/chromium/chromium/blob/main/components/webapps/browser/android/add_to_homescreen_data_fetcher.cc): a manifest short-circuits; without one, the meta flag separates app shortcuts from bookmarks.
- [Chromium: `components/webapps/renderer/web_page_metadata_extraction.cc`](https://github.com/chromium/chromium/blob/main/components/webapps/renderer/web_page_metadata_extraction.cc): the renderer still extracts `mobile-web-app-capable`.
- [W3C: Web Application Manifest: display member](https://www.w3.org/TR/appmanifest/#display-member): the standard replacement.
