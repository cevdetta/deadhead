---
ruleId: "element/menuitem"
title: "menuitem element"
description: "`menuitem` is entirely obsolete: the popup-menu command element from the HTML context-menu feature that only Firefox shipped. Firefox removed it in version 103; handling the `contextmenu` event with script does the same job in every engine."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "body"
selector: 'menuitem'
fix: { op: "none" }
replacement: "Handle the `contextmenu` event with script and build the menu from standard elements."
tags: ["legacy"]
impacts: ["interop", "maintainability"]
related: []
---

`menuitem` was the command inside a popup menu — the item a user could
invoke through a `<menu type="context">` context menu or a menu button.
It belonged to the HTML context-menu feature, which paired `menu`,
`menuitem`, and the `contextmenu` attribute into a declarative way to add
commands to the right-click menu.

Only Firefox ever shipped the feature, and Firefox removed it in version
103. The HTML Standard lists the element as entirely obsolete: a custom
context menu is implemented with script handling the `contextmenu` event.

## Why avoid

It is entirely obsolete by spec. The HTML Standard's Non-conforming
features list says `menuitem` "must not be used by authors": a custom
context menu is implemented with script handling the `contextmenu` event.

Only Firefox ever shipped it, and Firefox removed it. Bug 1372276 removed
`<menu>`/`<menuitem>` context-menu support including
`HTMLMenuItemElement` (RESOLVED FIXED, milestone 103 Branch); the Firefox
103 developer release notes list the support removal with the
`dom.menuitem.enabled` preference.

It never became interoperable. The WHATWG removal discussion records
Chrome WONTFIXing its context-menu implementation and removing the
related code, leaving Firefox as the sole implementer — the feature was
cut from the standard for lack of multi-implementer interest.

Today it does nothing. With the feature and its interface gone, `menuitem`
parses as an unknown element with no menu behavior in any engine; keeping
it only misleads the next reader into thinking a popup command is wired
up.

## Use instead

Intercept the `contextmenu` event and show your own menu built from
standard interactive elements:

```html
<p id="target">Right-click me for a custom menu.</p>
<ul id="context-menu" role="menu" hidden>
  <li role="menuitem"><button>Copy</button></li>
</ul>
<script>
  const target = document.getElementById("target");
  const menu = document.getElementById("context-menu");
  target.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    menu.hidden = false;
    menu.style.left = `${e.pageX}px`;
    menu.style.top = `${e.pageY}px`;
  });
  document.addEventListener("click", () => { menu.hidden = true; });
</script>
```

## Detectability

Fully detectable. The selector is the bare element name `menuitem`, with
no logic module — every instance is the obsolete command element.

There is no autofix. `menuitem` carries the intended command (label, icon,
action wiring), so removing the element would delete the command itself;
rebuilding it as a script-driven menu is a manual edit.

## Resources

- [HTML Standard — Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features) — lists `menuitem` as entirely obsolete, with the script-handling-`contextmenu` replacement wording.
- [Bug 1372276 — Remove HTML context menu (`<menu>` and `<menuitem>` tag) support](https://bugzilla.mozilla.org/show_bug.cgi?id=1372276) — RESOLVED FIXED against the 103 Branch; removed `HTMLMenuItemElement`, the menu builder, and related tests.
- [MDN — Firefox 103 release notes for developers](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/103) — documents removal of `<menuitem>` support with the `dom.menuitem.enabled` preference, pointing at Bug 1372276.
- [MDN — HTML elements reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements) — lists `<menuitem>` under obsolete and deprecated elements ("a command that a user is able to invoke through a popup menu").
