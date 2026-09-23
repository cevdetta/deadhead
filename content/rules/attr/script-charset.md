---
ruleId: "attr/script-charset"
title: "script charset"
description: "charset on script is obsolete; documents and scripts use UTF-8, so delete the attribute."
pubDate: "2026-09-21"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "any"
selector: "script[charset]"
fix: { op: "remove-attribute", attr: "charset" }
replacement: "Delete the attribute: <script src=\"app.js\"></script>. Scripts inherit UTF-8 from the document."
tags: ["charset", "scripting"]
impacts: ["maintainability"]
related: ["attr/script-language"]
---

`charset` on `script` selects nothing. WHATWG lists the attribute as obsolete with one replacement, omission, since documents and scripts require UTF-8 and the script inherits its encoding from the document.

## Why avoid

WHATWG lists it as obsolete with one replacement. Section 16.2 names `charset` on `script` as obsolete: omit the attribute, since both documents and scripts are required to use UTF-8 and the script inherits its encoding from the document. The attribute named the encoding of an external file in an era of competing encodings; with UTF-8 required on both sides, the label restates the default, and no fetch consults it.

MDN says the same from the attribute side. Its `script` page files `charset` under deprecated attributes: where present its value must be an ASCII case-insensitive match for `utf-8`, and the attribute is unnecessary since documents must use UTF-8 and the element inherits its encoding from the document. A `charset="utf-8"` that restates the default and a `charset="iso-8859-1"` that names a superseded encoding both ask the browser for selection it never performs.

## Use instead

Drop the hint and let the document declare the encoding once:

```html
<meta charset="utf-8">
<script src="app.js"></script>
```

## Detectability

Complete detection. The rule matches `script[charset]`: presence of the attribute is the whole verdict, so no logic module exists. The selector names the fix attribute itself, so the single `remove-attribute` fix covers every finding with no remainder.

## Resources

- [WHATWG: Obsolete but conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#obsolete-but-conforming-features): authors should not specify `charset` on `script`; where present it must be an ASCII case-insensitive match for `utf-8`.
- [WHATWG: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): `charset` on `script` is obsolete: omit it, since both sides require UTF-8 and the script inherits from the document.
- [MDN: `<script>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script): `charset` sits under deprecated attributes as unnecessary, since documents must use UTF-8 and the element inherits from the document.
