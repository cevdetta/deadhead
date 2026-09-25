---
ruleId: "attr/charset-obsolete"
title: "<a charset>, <link charset> and <script charset>"
description: "charset on a, link and script is obsolete. a ignores it; stylesheets and external classic scripts still decode by it. Use UTF-8."
pubDate: "2026-09-19"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "any"
selector: "a[charset], link[charset], script[charset]"
match: "logic"
fix: { op: "remove-attribute", attr: "charset" }
replacement: "Delete the attribute: <a href=\"page.html\">text</a>, <script src=\"app.js\"></script>. A linked resource declares its encoding in its own Content-Type header; save scripts and stylesheets as UTF-8 to match the document."
tags: ["charset", "hyperlinks", "scripting"]
impacts: ["maintainability"]
related: ["attr/a-coords-shape", "attr/script-language"]
---

`charset` on `a`, `link` and `script` names an encoding the page has no business naming. WHATWG lists the attribute as obsolete on all three elements. On `a` and `link` its replacement is an HTTP `Content-Type` header on the linked resource. On `a` nothing reads the hint. On a stylesheet `link`, Blink and Gecko still decode the sheet by it when the sheet declares no encoding of its own. On `script` its replacement is omission, since documents and scripts must use UTF-8, but the "prepare the script element" algorithm still reads `charset` first when an external classic script carries it.

## Why avoid

WHATWG lists all three as obsolete. Section 16.2 names `charset` on `a` elements and `charset` on `link` elements as obsolete: use an HTTP `Content-Type` header on the linked resource instead. The resource is the place to declare its encoding, through its own header or an in-file declaration, not the linking page guessing at it.

MDN repeats the call on both link elements. The `a` page puts `charset` under deprecated attributes: it hinted at the encoding of the linked URL, is deprecated, and should not be used by authors, with the HTTP `Content-Type` header on the linked URL as the replacement. The `link` page puts it under obsolete attributes with the same direction: use the `Content-Type` HTTP header on the linked resource. A `charset` value that disagrees with the resource header loses; one that agrees restates it. On `a`, and on a `link` that loads no stylesheet, the attribute decides nothing.

A stylesheet `link` is the exception. Blink's `LinkResource::GetCharset()` returns the encoding the `charset` attribute names, and `LinkStyle::Process()` passes it to `LoadStylesheetIfNeeded`. Gecko's CSS `Loader` takes its fallback encoding from `LinkStyle::GetCharset`, which `HTMLLinkElement` answers with the attribute, before trying the document's encoding. A stylesheet with no BOM, no `charset` parameter in its `Content-Type` and no `@charset` rule decodes by that value, so a `charset` naming anything but the document's encoding changes which characters a non-ASCII selector or `content` string holds.

On `script` Section 16.1 covers `charset="utf-8"` as obsolete but conforming, and Section 16.2 covers any other value as non-conforming: omit the attribute, since both documents and scripts are required to use UTF-8 and the script inherits its encoding from the document. The attribute named the encoding of an external file in an era of competing encodings, and the "prepare the script element" algorithm still consults it first: "If el has a charset attribute, then let encoding be the result of getting an encoding from the value of the charset attribute" before falling back to the document's own encoding. Chromium's `ScriptLoader` implements that step. A `charset` naming a superseded encoding, such as `iso-8859-1`, still changes which bytes decode to which characters in the fetched file.

MDN's `script` page files `charset` under deprecated attributes: where present its value must be an ASCII case-insensitive match for `utf-8`, and the attribute is unnecessary since documents must use UTF-8 and the element inherits its encoding from the document. That holds only while `charset` matches the document's encoding. A `charset="utf-8"` restates the default and changes nothing; a `charset` naming any other encoding still picks the decode encoding the fetch uses.

## Use instead

Drop the hint and let each resource speak for itself:

```html
<a href="page.html">text</a>
<link href="main.css" rel="stylesheet">
<script src="app.js"></script>
```

The page declares its own encoding once, in the usual place, and scripts are saved in that encoding:

```html
<meta charset="utf-8">
```

## Detectability

Complete detection. The rule matches `a[charset]`, `link[charset]` or `script[charset]`: presence of the attribute is the whole verdict. All three alternatives name the same attribute, so one `remove-attribute` fix covers them.

A logic module decides only whether the autofix runs. On `a` it always does. On `link` it deletes `charset` unless the element has an `href` and its `rel` holds `stylesheet`: that link loads a sheet the attribute can decode, so the finding carries no fix. On `script` it deletes `charset` where nothing reads it: an inline script, which is part of the document, and any script that is not a classic script, such as a module, whose fetch decodes the body as UTF-8 whatever `charset` says, an import map, speculation rules or a data block. On an external classic script the value picks the decode encoding, and deleting a value that differs from the document's encoding changes which bytes decode to which characters in the fetched file. That finding carries no fix either. For both vetoed cases a person has to confirm the resource's encoding already matches before removing the attribute.

## Resources

- [WHATWG: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): `charset` on `a` and `link` elements is obsolete: use an HTTP `Content-Type` header on the linked resource instead. `charset` on `script` is obsolete: omit it, since both sides require UTF-8 and the script inherits from the document.
- [WHATWG: Obsolete but conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#obsolete-but-conforming-features): authors should not specify `charset` on `script`; where present it must be an ASCII case-insensitive match for `utf-8`.
- [MDN: `<a>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a): `charset` sits under deprecated attributes with a note not to use it and to send the HTTP `Content-Type` header on the linked URL.
- [MDN: `<link>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/link): `charset` sits under obsolete attributes with the same header direction.
- [Chromium: `link_resource.cc`](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/core/html/link_resource.cc): `LinkResource::GetCharset()` builds the encoding from the `charset` attribute, falling back to the document's encoding only when the value is not a valid label.
- [Chromium: `link_style.cc`](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/core/html/link_style.cc): `LinkStyle::Process()` reads `GetCharset()` and passes it to `LoadStylesheetIfNeeded`.
- [Firefox: `Loader.cpp`](https://searchfox.org/mozilla-central/source/layout/style/Loader.cpp): `GetFallbackEncoding` tries "the charset on the `<link>`" through `LinkStyle::GetCharset` before the document's encoding; `HTMLLinkElement` returns the `charset` attribute.
- [MDN: `<script>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script): `charset` sits under deprecated attributes as unnecessary, since documents must use UTF-8 and the element inherits from the document.
- [HTML Standard: prepare the script element](https://html.spec.whatwg.org/multipage/scripting.html#prepare-the-script-element): reads `charset` to pick the decode encoding for an external classic script before falling back to the document's encoding.
- [HTML Standard: fetch a single module script](https://html.spec.whatwg.org/multipage/webappapis.html#fetch-a-single-module-script): "Let sourceText be the result of UTF-8 decoding bodyBytes", with no step that reads `charset`.
- [Chromium: `script_loader.cc`](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/core/script/script_loader.cc): the classic-script branch decodes with `CharsetAttributeValue()` whenever it is non-empty and falls back to the document's encoding otherwise.
