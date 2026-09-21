---
ruleId: "attr/script-language"
title: "script language"
description: "language on script is obsolete; omit it for JavaScript and use type for data blocks."
pubDate: "2026-09-21"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "any"
selector: "script[language]"
fix: { op: "remove-attribute", attr: "language" }
replacement: "Delete the attribute: <script src=\"app.js\"></script>. For data blocks use type: <script type=\"application/json\">."
tags: ["attr", "script", "legacy"]
impacts: ["maintainability"]
related: ["attr/script-event-for"]
---

`language` on `script` selects nothing. WHATWG lists the attribute as obsolete with a split replacement, omission for JavaScript and `type` for data blocks, since its values were never standardized and no engine honored them alike.

## Why avoid

WHATWG lists it as obsolete with a split replacement. Section 16.2 names `language` on `script` as obsolete: omit the attribute for JavaScript, and use `type` for data blocks. The attribute named the scripting language in an era of competing languages; with one language left, the label restates the default, and its values were never standardized, so no engine honored them alike.

MDN says the same from the attribute side. Its `script` page files `language` under deprecated attributes: it identifies the scripting language as `type` does; its values were never standardized, so `type` should be used instead. A `language="javascript"` that restates the default and a `language="vbscript"` that names a dead engine both ask the browser for selection it never performs.

## Use instead

Omit the label for JavaScript:

```html
<script src="app.js"></script>
```

Use `type` for data blocks:

```html
<script type="application/json" id="state">{ "user": null }</script>
```

## Detectability

Complete detection. The rule matches `script[language]`: presence of the attribute is the whole verdict, so no logic module exists. The selector names the fix attribute itself, so the single `remove-attribute` fix covers every finding with no remainder.

## Resources

- [WHATWG: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html): `language` on `script` is obsolete: omit for JavaScript, `type` for data blocks.
- [MDN: `<script>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script): `language` values were never standardized, so `type` should be used instead.
