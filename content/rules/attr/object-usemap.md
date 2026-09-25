---
ruleId: "attr/object-usemap"
title: "<object usemap>"
description: "usemap on object is obsolete; img carries client maps, so move the map there."
pubDate: "2026-09-19"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "body"
selector: "object[usemap]"
fix: { op: "remove-attribute", attr: "usemap" }
replacement: "Delete the attribute and move the map to img: <img src=\"shapes.png\" usemap=\"#shapes\" alt=\"Shapes\">."
tags: ["embedding", "media"]
impacts: ["maintainability"]
related: ["attr/input-ismap-usemap"]
---

`usemap` on `object` points at a map no engine consults. WHATWG lists the attribute as obsolete with one replacement, the `img` element, and engines deleted the `object` map path outright, so the pointer is dead weight on every object that carries it.

## Why avoid

WHATWG lists it as obsolete with one replacement. Section 16.2 names `usemap` on `object` elements as obsolete: use the `img` element for image maps. The attribute survived from an era when `object` could embed images; client maps now belong to `img`, whose map path every browser implements.

Engines deleted it outright. MDN badges `HTMLObjectElement.useMap` Deprecated. Chrome and Safari skip `object` maps, Firefox removed support for `object` and `input` maps, and the web-platform tests deleted the `object` map cases. A `usemap` value on `object` points at a map no engine consults, while the object itself renders or falls back as it would without it.

## Use instead

Move the map to `img`, where the map path works:

```html
<img src="shapes.png" usemap="#shapes" alt="Shapes">
<map name="shapes">
  <area shape="rect" coords="25,25,125,125" href="red.html" alt="Red box">
</map>
```

## Detectability

Complete detection. The rule matches `object[usemap]`: presence of the attribute is the whole verdict, so no logic module exists. The selector names the fix attribute itself, so the single `remove-attribute` fix covers every finding with no remainder.

## Resources

- [WHATWG: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html): `usemap` on `object` is obsolete: use the `img` element for image maps.
- [MDN: `HTMLObjectElement.useMap`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLObjectElement/useMap): badges the member Deprecated.
- [Mozilla bug 392994](https://bugzilla.mozilla.org/show_bug.cgi?id=392994): removed support for `usemap` on `object` and `input` elements.
