---
ruleId: "attr/form-accept"
title: "form accept"
description: "accept on form is obsolete; the file inputs carry it now, so delete it from the form."
pubDate: "2026-09-19"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "body"
selector: "form[accept]"
fix: { op: "remove-attribute", attr: "accept" }
replacement: "Delete the attribute and put accept on each file input: <input type=\"file\" accept=\"image/*\">."
tags: ["forms"]
impacts: ["maintainability"]
related: ["attr/rev-urn"]
---

`accept` on `form` filters nothing. WHATWG lists the attribute as obsolete on forms with one replacement, the same attribute on the `input` elements, so the form-level hint is dead weight on every form that carries it.

## Why avoid

WHATWG lists it as obsolete with one replacement. Section 16.2 names `accept` on `form` elements as obsolete: "use the accept attribute directly on the input elements instead". The form-level hint never reached the file picker; the input's own value filters the dialog, and even that is a hint the user can override instead of a validation.

MDN records the removal. Its `accept` page states the attribute belongs to the file `input` type, was supported on `form` before its removal in favor of file. The spec table behind the page lists `accept` as valid for the file input type alone. A form-level value restates nothing and constrains nothing; it survives as copied boilerplate.

## Use instead

Put the filter where the picker reads it:

```html
<form method="post" enctype="multipart/form-data">
  <label for="shot">Choose a shot</label>
  <input type="file" id="shot" name="shot" accept="image/*">
  <button>Submit</button>
</form>
```

## Detectability

Complete detection. The rule matches `form[accept]`: presence of the attribute is the whole verdict, so no logic module exists. The selector names the fix attribute itself, so the single `remove-attribute` fix covers every finding with no remainder.

## Resources

- [WHATWG: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html): `accept` on `form` elements is obsolete: use the attribute on the `input` elements instead.
- [MDN: `accept`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/accept): the attribute belongs to file `input`, supported on `form` before removal in favor of file.
