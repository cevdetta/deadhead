---
ruleId: "attr/data-binding"
title: "IE data binding attributes"
description: "datasrc, datafld and dataformatas are obsolete IE data hooks; populate the page with script instead."
pubDate: "2026-09-21"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "any"
selector: "[datasrc], [datafld], [dataformatas]"
fix: { op: "remove-attributes" }
replacement: "Populate the page with script and XHR, then delete the hooks: <span id=\"name\"></span>."
tags: ["microsoft", "scripting"]
impacts: ["maintainability"]
related: []
---

`datasrc`, `datafld` and `dataformatas` bind nothing. WHATWG lists all three as obsolete with one replacement, script plus `XHR`, since no current engine ships the recordset machinery they were written for.

## Why avoid

WHATWG lists all three as obsolete with one replacement. Section 16.2 names `datasrc`, `datafld` and `dataformatas` across their elements as obsolete: use script and a mechanism such as `XHR` to populate the page. The hooks bound page elements to external recordsets in an engine that no longer ships that machinery; no current engine reads them, and no IDL member backs them.

The W3C Recommendation prints the same lines. Its obsolete-features chapter names the same three attributes on the same elements with the same direction: script plus `XHR`. Two publications, one verdict: the attributes are dead weight on every element that carries them.

## Use instead

Populate the page with script and fetch the data where it lives:

```html
<span id="name"></span>
<script>fetch("/user.json").then(r => r.json()).then(u => { document.getElementById("name").textContent = u.name; });</script>
```

## Detectability

Complete detection. The rule matches `[datasrc]`, `[datafld]` or `[dataformatas]`: presence of any of the three is the whole verdict, so no logic module exists. No alternative names a tag, so the rule lands in the wildcard dispatch bucket. The autofix removes every attribute the rule names that is present on the element, and leaves every other attribute as written.

## Resources

- [WHATWG: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): `datasrc`, `datafld` and `dataformatas` are obsolete: script plus `XHR` replaces them.
- [W3C: HTML5 Obsolete features](https://www.w3.org/TR/2014/REC-html5-20141028/obsolete.html#non-conforming-features): the same three attributes with the same script direction.
