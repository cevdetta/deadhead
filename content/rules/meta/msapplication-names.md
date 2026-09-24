---
ruleId: "meta/msapplication-names"
title: "meta name=\"msapplication-*\""
description: "Internet Explorer pinned-site and Start-tile metadata; IE11 on Windows 10 LTSC and Server still reads the taskbar names."
pubDate: "2026-09-13"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[name^="msapplication-" i]'
fix: { op: "none" }
replacement: "Delete the tile names unless Windows Server 2012 R2 ESU users, IE11's only remaining reader for them, matter. Keep the taskbar names (msapplication-task*, -starturl, -tooltip, -window, -navbutton-color, -allowDomain*) where IE11-on-Windows-10-LTSC/Server pinned-site users matter. Put app name, colours and icons in the web app manifest."
tags: ["icons", "microsoft", "web-app"]
impacts: ["maintainability"]
related: ["meta/http-equiv-x-ua-compatible", "meta/application-name"]
---

IE11 on Windows 10 LTSC and Server still reads part of the `msapplication-*` family.
Internet Explorer 9 let a user pin a site
to the Windows taskbar, and Internet Explorer 11
extended that to live tiles on the Windows 8 Start screen. A site described its tile
with a family of Microsoft-only `<meta>` names for tile colour and tile images, and a
`browserconfig.xml` referenced from `msapplication-config`. Favicon generators still emit
the whole set, with a `browserconfig.xml` alongside.

## Why avoid

Most of the surface is gone, but not all of it. The metadata belonged to IE11's pinned-sites
feature, and Microsoft's own documentation for it now lives under *previous versions*, marked
archived. The Internet Explorer 11 desktop application went out of support and was disabled
on mainstream Windows 10 and 11 on June 15, 2022; the EdgeHTML-based Edge went out
of support on March 9, 2021. Windows 10 Long-Term Servicing Channel (2019/2021) and Windows
Server 2016/2019/2022 are a separate case: Microsoft's lifecycle FAQ keeps IE11 supported
there. Edge's IE mode renders legacy pages inside Edge and does not
offer Start-screen pinning, so it gives the tags no reader either.

Windows 11 dropped live tiles outright ("Live
Tiles are no longer available"), so a tile colour, a 310×150 logo and a notification polling
URI describe something that operating system no longer draws. On Windows 10, the tile names
(`TileColor`, `TileImage`, the `*logo` sizes, `notification`) were read by legacy Edge, not
IE11, and legacy Edge is dead. IE11 itself still reads them, but only through the older
Windows 8.1-style Start screen, a model that survives only on Windows Server 2012 R2 under
Extended Security Updates.

The taskbar names are a separate, wider-supported case: `msapplication-task`,
`-task-separator`, `-tooltip`, `-window`, `-starturl`, `-navbutton-color` and `-allowDomain*`
are documented as "only supported in IE11 on Windows 10", and IE11 there still reads a pinned
site's jump list, tooltip, window size, start URL and button colour from them. IE11 on
Windows 10 LTSC and Windows Server is the only remaining consumer, and Microsoft's lifecycle
FAQ keeps it supported there for the lifecycle of the host Windows version. `msapplication-config` and the `browserconfig.xml`
it points to track the tile names, not the taskbar names: that request survives only on the
same Windows 8.1-style Start screen, Windows Server 2012 R2 under Extended Security Updates.
For everyone else the block is dead weight in every page's `<head>`. The tags were never
standardised, so there is no spec that will revive them.

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

There is no autofix. The taskbar names (`msapplication-task`, `-task-separator`,
`-tooltip`, `-window`, `-starturl`, `-navbutton-color`, `-allowDomain*`) still drive IE11's
pinned-site taskbar on Windows 10 LTSC and Windows Server; deleting them changes
that jump list, tooltip, window size, start URL and button colour for that population. The
tile names and `msapplication-config` are a narrower case: IE11 still reads them, but only
through the older Windows 8.1-style Start screen, which survives on Windows Server 2012 R2
under Extended Security Updates; deleting them there drops the tile colour and image and
stops the `browserconfig.xml` request. A person has to decide whether either population
matters before removing any of them.

## Resources

- [Microsoft Learn: Pinned Sites (Internet Explorer), archived](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/hh772707(v=vs.85)): defines the msapplication-* metadata, browserconfig.xml and `msapplication-config` as IE11 pinned-site features.
- [Microsoft Lifecycle FAQ: Internet Explorer and Microsoft Edge](https://learn.microsoft.com/en-us/lifecycle/faq/internet-explorer-microsoft-edge): IE11 desktop app out of support June 15, 2022 and disabled on Windows 10; legacy Edge out of support March 9, 2021; where IE11 remains supported.
- [Microsoft Learn: pinned-site metadata reference, archived](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/dn255024(v=vs.85)): marks the taskbar names "only supported in IE11 on Windows 10" and the tile names "only supported in Microsoft Edge on Windows 10".
- [Microsoft: Windows 11 specifications, feature deprecations](https://www.microsoft.com/en-us/windows/windows-11-specifications): "Live Tiles are no longer available."
- [W3C: Web Application Manifest](https://www.w3.org/TR/appmanifest/): the cross-browser home for app name, colours and icons.
