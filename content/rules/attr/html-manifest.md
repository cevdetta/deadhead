---
ruleId: "attr/html-manifest"
title: "<html manifest>"
description: "manifest on html points at a removed offline cache; serve offline through a service worker instead."
pubDate: "2026-09-19"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "any"
selector: "html[manifest]"
fix: { op: "remove-attribute", attr: "manifest" }
replacement: "Delete the attribute: <html lang=\"en\">. Register a service worker to serve the page offline."
tags: ["caching"]
impacts: ["maintainability"]
related: ["attr/html-version"]
---

`manifest` on `html` enrolls the page in a cache that no longer exists. WHATWG calls the attribute obsolete with one replacement, service workers, and vendors deleted the application cache outright, so the pointer names a file nothing fetches.

## Why avoid

WHATWG buries it in one line. Section 16.2 names `manifest` on `html` elements as obsolete: use service workers instead. The attribute once enrolled the page in the application cache; that cache no longer exists in browsers, so the pointer names a file nothing fetches.

Vendor removal finished the job. Chrome removed AppCache by default in version 85 with complete removal around version 95, with service workers as the supported alternative for the offline experience. Firefox deprecated it in release 44 and removed it after, while Safari deprecated it in 2018. A `manifest` value that still names a cache file asks every current browser for a mechanism each one deleted.

## Use instead

Drop the attribute and register a worker:

```html
<html lang="en">
```

```js
navigator.serviceWorker.register("/worker.js");
```

## Detectability

Complete detection. The rule matches `html[manifest]`: presence of the attribute is the whole verdict, so no logic module exists. The selector names the fix attribute itself, so the single `remove-attribute` fix covers every finding with no remainder.

## Resources

- [WHATWG: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html): `manifest` on `html` is obsolete: use service workers instead.
- [web.dev: Preparing for AppCache removal](https://web.dev/articles/appcache-removal): Chrome removed AppCache by default in 85 with complete removal around 95, Firefox and Safari dates listed.
