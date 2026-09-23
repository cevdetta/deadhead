---
ruleId: "meta/msapplication"
title: "meta name=\"msapplication-*\""
description: "Internet Explorer pinned-site and Start-tile metadata; nothing that still ships reads it."
pubDate: "2026-09-13"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[name^="msapplication-" i]'
fix: { op: "remove-element" }
replacement: "Delete every msapplication-* tag, and any browserconfig.xml it points to. Put app name, colours and icons in the web app manifest."
tags: ["icons", "microsoft", "web-app"]
impacts: ["maintainability"]
related: ["meta/http-equiv-x-ua-compatible", "meta/application-name"]
---

Nothing reads `msapplication-*` tags anymore. Internet Explorer 9 let a user pin a site
to the Windows taskbar, and Internet Explorer 11
extended that to live tiles on the Windows 8 and 10 Start screen. A site described its tile
with a family of Microsoft-only `<meta>` names for tile colour and tile images, and a
`browserconfig.xml` referenced from `msapplication-config`. Favicon generators still emit
the whole set, with a `browserconfig.xml` alongside.

## Why avoid

Nothing that still ships reads them. The metadata belonged to IE11's pinned-sites feature,
and Microsoft's own documentation for it now lives under *previous versions*, marked
archived. The Internet Explorer 11 desktop application went out of support on June 15,
2022 and has since been permanently disabled on Windows 10; the EdgeHTML-based Edge went out
of support on March 9, 2021. Edge's IE mode renders legacy pages inside Edge and does not
offer Start-screen pinning, so it gives the tags no reader either.

The surface they configured is gone too. Windows 11 dropped live tiles outright ("Live
Tiles are no longer available"), so a tile colour, a 310×150 logo and a notification polling
URI describe something the operating system no longer draws.

The only remaining consumer is the IE11 desktop app on long-term-servicing Windows 10,
Windows Server and Embedded installs, pinning to a Windows 10 Start menu. No supported
consumer browser reads them. For everyone else the block is dead weight in every page's `<head>`, and
`msapplication-config` keeps a second file, `browserconfig.xml`, alive for nobody. The tags
were never standardised, so there is no spec that will revive them.

## Use instead

A web app manifest. Browsers that install or pin sites read the name, colours and icons
from it:

```html
<link rel="manifest" href="/app.webmanifest">
```

```json
{
  "name": "Example",
  "short_name": "Example",
  "theme_color": "#cc241d",
  "background_color": "#ffffff",
  "icons": [{ "src": "/icon-192.png", "type": "image/png", "sizes": "192x192" }]
}
```

Delete `browserconfig.xml` along with the tags.

## Detectability

Fully detectable. `<meta name>` holds a single value rather than a token set, so the
rule matches the `msapplication-` prefix case-insensitively. The documented names mix
case freely (`msapplication-TileColor`). It deliberately leaves `application-name` alone:
IE used it for the pinned-site title, but it is a standard HTML metadata name with its own
meaning, and `meta/application-name` covers it.

The fix removes each element. That includes `msapplication-config` with `content="none"`,
which only ever told IE11 not to request `/browserconfig.xml` when a site was pinned;
without IE11 there is no request to suppress.

## Resources

- [Microsoft Learn: Pinned Sites (Internet Explorer), archived](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/hh772707(v=vs.85)): defines the msapplication-* metadata, browserconfig.xml and `msapplication-config` as IE11 pinned-site features.
- [Microsoft Lifecycle FAQ: Internet Explorer and Microsoft Edge](https://learn.microsoft.com/en-us/lifecycle/faq/internet-explorer-microsoft-edge): IE11 desktop app out of support June 15, 2022 and disabled on Windows 10; legacy Edge out of support March 9, 2021; where IE11 remains supported.
- [Microsoft: Windows 11 specifications, feature deprecations](https://www.microsoft.com/en-us/windows/windows-11-specifications): "Live Tiles are no longer available."
- [W3C: Web Application Manifest](https://www.w3.org/TR/appmanifest/): the cross-browser home for app name, colours and icons.
