---
ruleId: "attr/script-charset"
title: "script charset"
description: "charset on script is obsolete; save the script in the document's encoding, UTF-8, then delete the attribute."
pubDate: "2026-09-21"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "any"
selector: "script[charset]"
match: "logic"
fix: { op: "remove-attribute", attr: "charset" }
replacement: "Save the script file as UTF-8 to match the document, then delete the attribute: <script src=\"app.js\"></script>."
tags: ["charset", "scripting"]
impacts: ["maintainability"]
related: ["attr/script-language"]
---

`charset` on `script` still selects the decode encoding for an external classic script. WHATWG lists the attribute as obsolete with one replacement, omission, since documents and scripts should use UTF-8, but the "prepare the script element" algorithm still reads `charset` first when it is present.

## Why avoid

WHATWG lists it as obsolete with one replacement. Section 16.2 names `charset` on `script` as obsolete: omit the attribute, since both documents and scripts are required to use UTF-8 and the script inherits its encoding from the document. The attribute named the encoding of an external file in an era of competing encodings, and the "prepare the script element" algorithm still consults it first: "If el has a charset attribute, then let encoding be the result of getting an encoding from the value of the charset attribute" before falling back to the document's own encoding. Chromium's `ScriptLoader` implements that step. A `charset` naming a superseded encoding, such as `iso-8859-1`, still changes which bytes decode to which characters in the fetched file.

MDN says the same from the attribute side. Its `script` page files `charset` under deprecated attributes: where present its value must be an ASCII case-insensitive match for `utf-8`, and the attribute is unnecessary since documents must use UTF-8 and the element inherits its encoding from the document. That holds only while `charset` matches the document's encoding. A `charset="utf-8"` restates the default and changes nothing; a `charset` naming any other encoding still picks the decode encoding the fetch uses.

## Use instead

Drop the hint and let the document declare the encoding once:

```html
<meta charset="utf-8">
<script src="app.js"></script>
```

## Detectability

Complete detection. The rule matches `script[charset]`: presence of the attribute is the whole verdict. A logic module decides only whether the autofix runs. It deletes `charset` where nothing reads it: an inline script, which is part of the document, and any script that is not a classic script, such as a module, whose fetch decodes the body as UTF-8 whatever `charset` says, an import map, speculation rules or a data block. On an external classic script the value picks the decode encoding, and deleting a value that differs from the document's encoding changes which bytes decode to which characters in the fetched file. That finding carries no fix; a person has to confirm the two encodings already match before removing the attribute.

## Resources

- [WHATWG: Obsolete but conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#obsolete-but-conforming-features): authors should not specify `charset` on `script`; where present it must be an ASCII case-insensitive match for `utf-8`.
- [WHATWG: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): `charset` on `script` is obsolete: omit it, since both sides require UTF-8 and the script inherits from the document.
- [MDN: `<script>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script): `charset` sits under deprecated attributes as unnecessary, since documents must use UTF-8 and the element inherits from the document.
- [HTML Standard: prepare the script element](https://html.spec.whatwg.org/multipage/scripting.html#prepare-the-script-element): reads `charset` to pick the decode encoding for an external classic script before falling back to the document's encoding.
- [HTML Standard: fetch a single module script](https://html.spec.whatwg.org/multipage/webappapis.html#fetch-a-single-module-script): "Let sourceText be the result of UTF-8 decoding bodyBytes", with no step that reads `charset`.
- [Chromium: `script_loader.cc`](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/core/script/script_loader.cc): the classic-script branch decodes with `CharsetAttributeValue()` whenever it is non-empty and falls back to the document's encoding otherwise.
