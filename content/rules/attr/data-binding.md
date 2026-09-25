---
ruleId: "attr/data-binding"
title: "IE data binding attributes"
description: "datasrc, datafld and dataformatas are obsolete IE data hooks; populate the page with script instead."
pubDate: "2026-09-21"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "any"
selector: "a[datasrc], button[datasrc], div[datasrc], frame[datasrc], iframe[datasrc], img[datasrc], input[datasrc], label[datasrc], legend[datasrc], marquee[datasrc], object[datasrc], option[datasrc], select[datasrc], span[datasrc], table[datasrc], textarea[datasrc], a[datafld], button[datafld], div[datafld], fieldset[datafld], frame[datafld], iframe[datafld], img[datafld], input[datafld], label[datafld], legend[datafld], marquee[datafld], object[datafld], select[datafld], span[datafld], textarea[datafld], button[dataformatas], div[dataformatas], input[dataformatas], label[dataformatas], legend[dataformatas], marquee[dataformatas], object[dataformatas], option[dataformatas], select[dataformatas], span[dataformatas], table[dataformatas]"
fix: { op: "remove-attributes" }
replacement: "Populate the page with script and XHR, then delete the hooks: <span id=\"name\"></span>."
tags: ["microsoft", "scripting"]
impacts: ["maintainability"]
related: []
---

`datasrc`, `datafld` and `dataformatas` bind nothing. WHATWG lists all three as obsolete with one replacement, script plus `XHR`, since no current engine ships the recordset machinery they were written for.

## Why avoid

WHATWG lists all three as obsolete with one replacement. Section 16.2 names `datasrc`, `datafld` and `dataformatas` across their elements as obsolete: use script and a mechanism such as `XHR` to populate the page. The hooks bound page elements to external recordsets in an engine that no longer ships that machinery; no current engine reads them, and no IDL member backs them.

The W3C Recommendation prints the same verdict. Its obsolete-features chapter names the same three attributes with the same direction, script plus `XHR`, though its 2014 element lists still include `applet` and, for `datafld`, `param`: both elements left HTML since. Two publications, one direction: the attributes are dead weight on every element that carries them today.

## Use instead

Populate the page with script and fetch the data where it lives:

```html
<span id="name"></span>
<script>fetch("/user.json").then(r => r.json()).then(u => { document.getElementById("name").textContent = u.name; });</script>
```

## Detectability

Complete detection. The rule matches `datasrc`, `datafld` or `dataformatas` on the elements HTML §16.2 lists for each attribute: presence of any of the three on its owning element is the whole verdict, so no logic module exists. Every alternative names a tag, so the rule dispatches by element rather than landing in the wildcard bucket. The autofix removes every attribute the rule names that is present on the element, and leaves every other attribute as written.

## Resources

- [WHATWG: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): `datasrc`, `datafld` and `dataformatas` are obsolete: script plus `XHR` replaces them.
- [W3C: HTML5 Obsolete features](https://www.w3.org/TR/2014/REC-html5-20141028/obsolete.html#non-conforming-features): the same three attributes with the same script direction.
