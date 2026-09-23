---
ruleId: "attr/longdesc-lowsrc"
title: "iframe and img longdesc, img lowsrc"
description: "longdesc and lowsrc are obsolete image hints; link to descriptions with a and serve progressive JPEG."
pubDate: "2026-09-19"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "body"
selector: "iframe[longdesc], img[longdesc], img[lowsrc]"
fix: { op: "remove-attribute", attr: "longdesc" }
replacement: "Delete the attributes. Link to descriptions with a, and serve a progressive JPEG in src."
tags: ["media"]
impacts: ["maintainability"]
related: ["attr/object-usemap"]
---

`longdesc` and `lowsrc` promise help no browser delivers. WHATWG lists both as obsolete with one replacement each, a regular `a` link for descriptions and a single progressive JPEG for loading, so the pair is dead weight on every frame and image that carries it.

## Why avoid

WHATWG lists all three as obsolete with one replacement each. Section 16.2 names `longdesc` on `iframe` and `img` as obsolete: use a regular `a` element to link to the description, or an image map for images. It names `lowsrc` on `img` as obsolete: serve a progressive JPEG in `src` instead of two separate images. Neither hint ever drove loading: `longdesc` exposed no discoverable link in browsers, and `lowsrc` duplicated what progressive encoding already does.

MDN converts the first one outright. Its `longDesc` page badges the member Deprecated, calls the attribute obsolete with an uncertain future, and rewrites an `img` with `longdesc` into an `a` wrapping the image. For the second, MDN calls the `lowSrc` property obsolete and points at progressive formats instead. Dead hints that two references rewrite the same way are safe to delete.

## Use instead

Link to the description with a plain anchor:

```html
<a href="taco.html">
  <img src="taco.jpg" alt="Taco Tuesday">
</a>
```

Serve one progressive image instead of two:

```html
<img src="photo-progressive.jpg" alt="Photo">
```

## Detectability

Complete detection. The rule matches `iframe[longdesc]`, `img[longdesc]` or `img[lowsrc]`: presence of either attribute is the whole verdict, so no logic module exists. Autofix drops `longdesc`; a lone `lowsrc` or the remainder of a pair needs a hand edit, since one rule carries one fix attribute.

## Resources

- [WHATWG: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html): `longdesc` wants a regular `a` link and `lowsrc` wants one progressive JPEG.
- [MDN: `HTMLImageElement.longDesc`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/longDesc): badges the member Deprecated and rewrites `longdesc` markup into an `a`-wrapped image.
