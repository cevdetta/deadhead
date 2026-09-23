---
ruleId: "attr/script-event-for"
title: "script event and for"
description: "event and for on script are obsolete; register listeners with addEventListener instead."
pubDate: "2026-09-21"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "any"
selector: "script[event], script[for]"
fix: { op: "remove-attribute", attr: "event" }
replacement: "Delete the attributes. Register the handler in script: target.addEventListener(\"click\", run)."
tags: ["microsoft", "scripting"]
impacts: ["maintainability"]
related: ["attr/global-contextmenu"]
---

`event` and `for` on `script` bind nothing. WHATWG lists both as obsolete with one replacement, DOM event registration, after engines standardized on `addEventListener`, so the pair is dead weight on every script that carries it.

## Why avoid

WHATWG lists both as obsolete with one replacement. Section 16.2 names `event` and `for` on `script` elements as obsolete: use DOM event registration instead. The pair once bound a script block to an element event IE-style; no engine wires handlers that way now, so the attributes decorate a script that runs on load regardless.

MDN names the live mechanism. Its `addEventListener` page calls the method the recommended way to register a listener, working on any event target with capture and once semantics the attributes never had. The old spelling cannot express either; the new one can, which is why migration changes capabilities instead of restating them.

## Use instead

Register the handler where handlers live:

```js
target.addEventListener("click", run);
```

## Detectability

Complete detection. The rule matches `script[event]` or `script[for]`: presence of either attribute is the whole verdict, so no logic module exists. Autofix drops `event`; a lone `for` or the remainder of a pair needs a hand edit, since one rule carries one fix attribute.

## Resources

- [WHATWG: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html): `event` and `for` on `script` are obsolete: DOM event registration.
- [MDN: `addEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener): the recommended way to register a listener on any event target.
