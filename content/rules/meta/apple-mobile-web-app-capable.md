---
ruleId: "meta/apple-mobile-web-app-capable"
title: "<meta name=\"apple-mobile-web-app-capable\">"
description: "Apple's pre-manifest switch for launching a Home Screen web app standalone; the manifest's display member replaces it."
pubDate: "2026-09-13"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[name="apple-mobile-web-app-capable" i]'
fix: { op: "remove-element" }
replacement: "Delete it and declare \"display\": \"standalone\" in a web app manifest linked with <link rel=\"manifest\">."
tags: ["apple", "web-app"]
impacts: ["maintainability"]
related: ["meta/mobile-web-app-capable", "link/apple-touch-icon-precomposed"]
---

The web app manifest replaces `<meta name="apple-mobile-web-app-capable">`. The tag told
iOS that a page saved to
the Home Screen should launch like an app, without Safari's address bar and toolbar. Apple
introduced it in the Safari Web Content Guide years before the web had a standard way to
say the same thing, and it travels with a family of `apple-` tags for status-bar style
and titles, plus startup images.

## Why avoid

The standard way exists and WebKit leads with it. The Web Application Manifest's `display`
member declares how an installed app launches. WebKit's own announcement of Home Screen
web apps on iOS and iPadOS 16.4 says a site whose manifest sets `display` to `standalone`
or `fullscreen` opens as a web app, and mentions the meta tag only in passing, as the other
way to mark a site.

It isn't Apple-only in practice either, which makes it worse rather than better. Chromium
parses `apple-mobile-web-app-capable` into its page metadata too, and Chrome logs a
console deprecation warning for it. A page carrying it gets a warning in the most-used
engine for a setting its manifest should already hold. A page carrying both states its
launch mode twice, in two formats, and only one of them is portable.

**Removing it is not free on iOS.** iOS still reads the
tag:

- **Without a manifest** that sets `display` to `standalone` or `fullscreen`, iOS 16.4 and
  later save the site as a Home Screen bookmark that opens in the default browser, rather
  than a standalone web app.
- **With a manifest**, the launch is standalone, but `apple-touch-startup-image` splash
  screens stop appearing and the app opens on a black screen. Next.js hit this when it
  swapped the tag out in version 15, and closed the report as not planned.

Delete it anyway. Put the launch mode in the manifest first, and treat custom iOS splash
images as the price of dropping a vendor switch.

## Use instead

```html
<link rel="manifest" href="/app.webmanifest">
```

```json
{
  "name": "Example",
  "start_url": "/",
  "display": "standalone"
}
```

Don't swap it for `mobile-web-app-capable`, which the Chrome console message suggests.
That is the same idea without the prefix, and the manifest replaces both.

## Detectability

Fully detectable. `<meta name>` holds a single value, so the rule matches with `=`
and the `i` flag.

The fix removes the element, and unlike most removals here it changes what iOS does, as
described above. Add the manifest and its `display` member before applying it.

## Resources

- [Apple Developer: Configuring Web Applications (Safari Web Content Guide, archived)](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html): where the tag and `apple-touch-startup-image` were defined; a Documentation Archive page.
- [WebKit: Web Push for Web Apps on iOS and iPadOS (February 2023)](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/): a manifest with `display` set to `standalone` or `fullscreen` makes a Home Screen web app; with neither that nor "a meta tag marking the site as web app capable", it is a bookmark opening in the default browser.
- [W3C: Web Application Manifest: display member](https://www.w3.org/TR/appmanifest/#display-member): the standard replacement.
- [Chromium: `components/webapps/renderer/web_page_metadata_extraction.cc`](https://github.com/chromium/chromium/blob/main/components/webapps/renderer/web_page_metadata_extraction.cc): Chromium reads `apple-mobile-web-app-capable` into page metadata as well.
- [vercel/next.js#74524: removal of apple-mobile-web-app-capable results in splash screens not working](https://github.com/vercel/next.js/issues/74524): the iOS startup-image consequence of removing the tag.
