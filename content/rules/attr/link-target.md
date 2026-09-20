---
ruleId: "attr/link-target"
title: "link target"
description: "target on link is unnecessary; links load in the current context by default, so delete it."
pubDate: "2026-09-19"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "head"
selector: "link[target]"
fix: { op: "remove-attribute", attr: "target" }
replacement: "Delete the attribute: <link href=\"main.css\" rel=\"stylesheet\">."
tags: ["attr", "legacy"]
impacts: ["maintainability"]
related: ["attr/longdesc-lowsrc"]
---

`target` on `link` selects nothing. WHATWG calls the attribute unnecessary with one direction, omit it altogether, since resource loads never consult a browsing-context name and the link resolves in place.

## Why avoid

WHATWG buries it in one line. Section 16.2 names `target` on `link` elements as unnecessary: omit it altogether. Unlike `target` on anchors, which selects a browsing context for navigation, the `link` spelling names a context for a resource load that never consults it; stylesheets, icons and preloads resolve in place.

The W3C reference says the same with a safety note: the attribute is obsolete and omission is safe. A `target` value that names the current context restates the default; one that names another context is ignored. Either way the attribute decides nothing.

## Use instead

Drop the attribute and let the resource load where it belongs:

```html
<link href="main.css" rel="stylesheet">
```

## Detectability

Complete detection. The rule matches `link[target]`: presence of the attribute is the whole verdict, so no logic module exists. The selector names the fix attribute itself, so the single `remove-attribute` fix covers every finding with no remainder. Anchors keep their live `target`; the rule never matches `a`.

## Resources

- [WHATWG: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html): `target` on `link` is unnecessary.
- [W3C: `link` reference](http://w3c.github.io/html-reference/link.html): the attribute is obsolete and omission is safe.
