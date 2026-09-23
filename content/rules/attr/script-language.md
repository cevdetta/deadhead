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
fix: { op: "none" }
replacement: "Where language names JavaScript, delete it: <script src=\"app.js\"></script>. Any other value keeps the block from running, so delete the block or mark data with type: <script type=\"application/json\">."
tags: ["scripting"]
impacts: ["maintainability"]
related: ["attr/script-event-for"]
---

`language` on `script` still decides whether a script with no `type` attribute runs. WHATWG lists the attribute as obsolete with a split replacement, omission for JavaScript and `type` for data blocks, but the "prepare the script element" algorithm still reads it when `type` is absent, and a non-JavaScript value keeps the block from executing.

## Why avoid

WHATWG lists it as obsolete with a split replacement. Section 16.2 names `language` on `script` as obsolete: omit the attribute for JavaScript, and use `type` for data blocks. The "prepare the script element" algorithm still builds a type string from it when `type` is absent: "if el has a non-empty language attribute, let the script block's type string be the concatenation of `text/` and the value of el's language attribute." Chromium's `IsValidClassicScriptTypeAndLanguage` checks that string against the JavaScript MIME list. `language="vbscript"` produces `text/vbscript`, not a JavaScript MIME essence, so the block stays inert only while the attribute is there; deleting it with no `type` present defaults the type string to `text/javascript` and starts the block running.

MDN says the same from the attribute side. Its `script` page files `language` under deprecated attributes: it identifies the scripting language as `type` does; its values were never standardized, so `type` should be used instead. `language="javascript"` restates the default and changes nothing if deleted; a non-JavaScript value such as `language="vbscript"` is the only thing keeping that script block from running.

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

Complete detection. The rule matches `script[language]`: presence of the attribute is the whole verdict, so no logic module exists. There is no autofix. With no `type` attribute present, deleting a non-JavaScript `language` value starts a previously inert script block running, the same bug class as `attr/script-event-for`; a person has to check for `type` and the attribute's value before removing it.

## Resources

- [WHATWG: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html): `language` on `script` is obsolete: omit for JavaScript, `type` for data blocks.
- [MDN: `<script>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script): `language` values were never standardized, so `type` should be used instead.
- [HTML Standard: prepare the script element](https://html.spec.whatwg.org/multipage/scripting.html#prepare-the-script-element): builds the type string from `language` when `type` is absent, using `text/` plus the value.
- [Chromium: `script_loader.cc`](https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/core/script/script_loader.cc): `IsValidClassicScriptTypeAndLanguage` runs a script with no `type` only when `text/` plus the `language` value is a supported JavaScript MIME type.
