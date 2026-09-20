---
ruleId: "attr/input-ismap-usemap"
title: "input ismap and usemap"
description: "ismap and usemap do nothing on inputs; image buttons already map server-side and img covers client maps."
pubDate: "2026-09-19"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "body"
selector: "input[ismap], input[usemap]"
fix: { op: "remove-attribute", attr: "ismap" }
replacement: "Delete the attributes. For a server-side map keep <input type=\"image\" src=\"go.png\" alt=\"Go\">; for a client-side map use img with usemap."
tags: ["attr", "legacy"]
impacts: ["maintainability"]
related: ["attr/html-version"]
---

`ismap` and `usemap` do nothing on `input`. WHATWG calls the first a restatement of the image-button default and moves the second to `img`, so the pair is dead weight on every image button that carries it.

## Why avoid

WHATWG buries both with a reason each. Section 16.2 names `ismap` on `input` elements as unnecessary with the explanation that all image-button inputs are processed as server-side image maps regardless; the attribute restates the default. It names `usemap` on `input` elements as obsolete with the direction to use `img` instead of `input` for image maps.

The W3C version says the same in the same words: `ismap` unnecessary since image-button inputs map server-side by default, and `img` instead of `input` for maps. An image button carrying `ismap` submits coordinates as it would without it; an `input` carrying `usemap` points at a map the image-button path never consults.

## Use instead

A server-side image button needs no hint:

```html
<input type="image" src="go.png" alt="Go">
```

A client-side map belongs on `img`:

```html
<img src="shapes.png" usemap="#shapes" alt="Shapes">
<map name="shapes">
  <area shape="rect" coords="25,25,125,125" href="red.html" alt="Red box">
</map>
```

## Detectability

Complete detection. The rule matches `input[ismap]` or `input[usemap]`: presence of either attribute is the whole verdict, so no logic module exists. Autofix drops `ismap`; a lone `usemap` or the remainder of a pair needs a hand edit, since one rule carries one fix attribute.

## Resources

- [WHATWG: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html): `ismap` restates the image-button default and `usemap` belongs on `img`.
- [W3C HTML5: Obsolete features](https://www.w3.org/TR/2014/REC-html5-20141028/obsolete.html): the same two lines with the same two directions.
