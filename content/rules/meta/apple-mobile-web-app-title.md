---
ruleId: "meta/apple-mobile-web-app-title"
title: "meta name=\"apple-mobile-web-app-title\""
description: "Apple's Home Screen launch-icon label; <title> already supplies the default and the manifest short_name carries the short form."
pubDate: "2026-09-19"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[name="apple-mobile-web-app-title" i]'
fix: { op: "remove-element" }
replacement: "Delete it. Name an installable app with name and short_name in a web app manifest; a plain page needs no label past <title>."
tags: ["head", "meta", "mobile"]
impacts: ["maintainability"]
related: ["meta/apple-mobile-web-app-capable", "meta/application-name", "meta/mobile-web-app-capable"]
---

`<meta name="apple-mobile-web-app-title">` sets the label iOS puts under a Home Screen
launch icon. Apple documents it in the Safari Web Content Guide as an iOS tweak: absent
the tag, iOS uses `<title>`. The tag travels with `apple-mobile-web-app-capable` for
standalone launch and `apple-mobile-web-app-status-bar-style` for the status bar, a trio
from years before the web had a standard file for install metadata.

## Why avoid

The standard file now holds that label. The Web Application Manifest defines `name` as
the name shown with an icon and `short_name` for tight space. A Home Screen icon is the
tight-space case the member exists to serve. A page that ships both states one label
twice, in markup and in JSON, and the two drift.

No engine past Apple's reads it. The Apple guide calls these settings out as iOS tweaks
that stranger platforms skip. A tag that speaks to one OS adds weight for each reader
that skips it.

Deletion restores the default. iOS falls back to `<title>` where the tag is absent, per
the Apple guide, so removal hands the label back to the document title. Ship
`short_name` in the manifest for the short form.

## Use instead

Delete the element. Name the app once in the manifest and link the manifest from `head`:

```html
<link rel="manifest" href="/app.webmanifest">
```

```json
{
  "name": "Example",
  "short_name": "Ex"
}
```

## Detectability

Detectable with one selector. The rule matches `meta` elements whose `name` is
`apple-mobile-web-app-title`, with the `i` flag for case variants. `=` fits because
`name` holds a single value, not a token set; `rel` uses `~=` for the opposite reason,
as `link/image-src` records.

The fix removes the element outright. iOS then labels the icon with `<title>`, the
documented default, so nothing on the Home Screen goes blank.

## Resources

- [Apple: Configuring Web Applications (Safari Web Content Guide, archived)](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html): the "Adding a Launch Icon Title" part defines the tag and its `<title>` default.
- [W3C: Web Application Manifest: name member](https://www.w3.org/TR/appmanifest/#name-member): defines `name` as the name shown with an icon and the accessible name of an installed app.
- [W3C: Web Application Manifest: short_name member](https://www.w3.org/TR/appmanifest/#short_name-member): defines `short_name` as the short form for tight space.
- [Apple: Safari HTML Reference: Supported Meta Tags (archived)](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html): lists Apple-specific meta keys as Apple extension entries for iOS.
