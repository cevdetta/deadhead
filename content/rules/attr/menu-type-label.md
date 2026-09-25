---
ruleId: "attr/menu-type-label"
title: "menu type and label"
description: "type and label on menu are obsolete; script contextmenu handling covers custom menus, toolbars drop them."
pubDate: "2026-09-19"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "body"
selector: "menu[type], menu[label]"
fix: { op: "remove-attributes" }
replacement: "Delete the attributes. For custom menus handle contextmenu in script; for toolbars drop the attributes."
tags: ["scripting"]
impacts: ["maintainability"]
related: ["attr/contextmenu-onshow"]
---

`type` and `label` on `menu` select nothing. WHATWG lists both as obsolete with one replacement, script contextmenu handling for custom menus and bare lists for toolbars, so the pair is dead weight on every menu that carries it.

## Why avoid

WHATWG lists both as obsolete with one replacement. Section 16.2 names `type` on `menu` as obsolete: script contextmenu handling replaces custom menus, and toolbar menus drop the attribute. It groups `label` on `menu` with the same direction. The context-menu feature left the specification for lack of implementer interest, and toolbar meaning needs no label: the list of commands renders the same without either attribute.

MDN agrees on what remains. Its `menu` page calls the element a semantic alternative to `ul` for toolbars of commands, and notes the context-menu use case is considered obsolete and is not in the specification. Mozilla removed the menu type and label attributes outright. A `type="toolbar"` that restates the default and a `type="context"` that names a removed feature both ask the browser for behavior it never performs.

## Use instead

A toolbar needs no attributes at all:

```html
<menu>
  <li><button>Copy</button></li>
</menu>
```

A custom menu runs on the contextmenu event:

```js
target.addEventListener("contextmenu", (event) => showMenu(event));
```

## Detectability

Complete detection. The rule matches `menu[type]` or `menu[label]`: presence of either attribute is the whole verdict, so no logic module exists. The autofix removes every attribute the rule names that is present on the element, and leaves every other attribute as written.

## Resources

- [WHATWG: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html): `type` and `label` on `menu` are obsolete: script contextmenu handling or bare toolbars.
- [MDN: `<menu>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/menu): the context-menu use is obsolete and out of the specification; the element is a toolbar of commands.
