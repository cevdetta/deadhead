---
ruleId: "meta/application-name"
title: "meta name=\"application-name\""
description: "A standard metadata name for the web app's name, superseded in practice by the manifest's name and short_name."
pubDate: "2026-09-13"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[name="application-name" i]'
fix: { op: "remove-element" }
replacement: "Delete it. Name an installable app with name and short_name in the web app manifest; a page that isn't an app is already named by <title>."
tags: ["web-app"]
impacts: ["maintainability"]
related: ["meta/msapplication-names", "link/apple-touch-icon-precomposed"]
---

Most pages carrying `application-name` are not applications. `<meta name="application-name" content="Example Mail">`
names the web application a page
belongs to, as opposed to the page itself. It is not a vendor invention or a relic: it is a
current standard metadata name in the HTML Standard. Internet Explorer 11 made it popular
as the name on a pinned-site tile, and favicon generators have emitted it on every page
ever since.

## Why avoid

This rule is about redundancy, not validity. The HTML Standard defines the value as "a
short free-form string giving the name of the web application that the page represents",
and lets user agents show it "in preference to the page's title", since a title can carry
transient status like an unread count.

The standard also scopes it narrowly: "If the page is not a web application, the
application-name metadata name must not be used." Most pages carrying it are ordinary
documents, blog posts and marketing pages, where a generator put it. For them the tag is
non-conforming as used.

For pages that are applications, the web app manifest has taken the job. Its
`name` and `short_name` members name the installed app in every browser that installs web
apps, and `short_name` gives the space-constrained form that a single `content` string
can't. A site that ships both states the app's name twice, in two files, and the two
drift.

Who still reads it: Chromium's renderer extracts `application-name` into page metadata,
alongside `description` and `mobile-web-app-capable`, which the browser can draw on when a
page is installed or saved as a shortcut without a manifest. Internet Explorer 11 used it
for pinned-site tiles, a feature with no reader left (see `meta/msapplication-names`). Nothing
else was found.

It isn't the same thing as `application-title`, a newer Chromium and Edge metadata name
that sets the title-bar text of an installed app. This rule doesn't touch that one, and
neither replaces the other.

## Use instead

For an installable app, the manifest:

```html
<link rel="manifest" href="/app.webmanifest">
```

```json
{ "name": "Example Mail", "short_name": "Mail" }
```

For a page that isn't an app, nothing: `<title>` already names it.

## Detectability

Fully detectable. `<meta name>` holds a single value, not a token set, so the rule
matches with `=` and the `i` flag. The standard compares the name ASCII case-insensitively.
A page carries one per language via `lang`, and the rule reports each.

The fix removes the element unconditionally. On a page with a manifest `name`, that
changes nothing. On a page with no manifest, Chromium's install or shortcut flow may now
propose the page's `<title>` where it would have used this name. That is the manifest's
job to settle, so add one rather than keep the tag.

## Resources

- [HTML Standard: standard metadata names: application-name](https://html.spec.whatwg.org/multipage/semantics.html#meta-application-name): the definition, the "must not be used" rule for pages that aren't web applications, and the allowance to prefer it over `<title>`.
- [W3C: Web Application Manifest: name member](https://www.w3.org/TR/appmanifest/#name-member): the standard home for an installable application's name, with `short_name` alongside it.
- [Chromium: `components/webapps/renderer/web_page_metadata_extraction.cc`](https://github.com/chromium/chromium/blob/main/components/webapps/renderer/web_page_metadata_extraction.cc): reads `application-name` into the page metadata Chromium's web app code consumes.
- [Microsoft Learn: Pinned Sites (Internet Explorer), archived](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/hh772707(v=vs.85)): `application-name` as the IE11 pinned-site name, the other historical reader.
