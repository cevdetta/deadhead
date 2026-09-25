---
ruleId: "attr/dropzone"
title: "dropzone"
description: "dropzone is obsolete; handle dragenter and dragover in script instead."
pubDate: "2026-09-21"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "any"
selector: "[dropzone]"
fix: { op: "remove-attribute", attr: "dropzone" }
replacement: "Handle dragenter and dragover in script, then delete the hook: <div id=\"target\"></div>."
tags: ["scripting"]
impacts: ["maintainability"]
related: []
---

`dropzone` binds nothing. WHATWG lists the attribute as obsolete with one replacement, script handling of `dragenter` and `dragover`, since no current engine honors the hint and the drop target answers through its handlers.

## Why avoid

WHATWG lists it as obsolete with one replacement. Section 16.2 names `dropzone` on all elements as obsolete: use script to handle the `dragenter` and `dragover` events instead. The attribute declared copy, move or link intent on a drop target in an era when the drag model needed author hints; the current model lets handlers report acceptance and feedback per drag.

No engine honors it. MDN badges the attribute Deprecated with the direction to avoid it and update existing code, and its compatibility table records no support in any current engine. A `dropzone="copy"` that states copy intent and a `dropzone="move"` that states move intent both ask the browser for behavior it never performs: the drop target answers through its handlers with or without the label.

## Use instead

Handle the events in script and drop the hook:

```html
<div id="target"></div>
<script>const t = document.getElementById("target"); t.addEventListener("dragover", e => e.preventDefault());</script>
```

## Detectability

Complete detection. The rule matches `[dropzone]`: presence of the attribute is the whole verdict, so no logic module exists. The selector names the fix attribute itself, so the single `remove-attribute` fix covers every finding with no remainder. The alternative names no tag, so the rule lands in the wildcard dispatch bucket.

## Resources

- [WHATWG: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): `dropzone` on all elements is obsolete: script `dragenter` and `dragover` handling replaces it.
- [MDN: `dropzone`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/dropzone): badges the attribute Deprecated with no support in any current engine.
- [W3C: HTML5 Drag and drop](https://dev.w3.org/html5/spec-LC/dnd.html): a drop target can handle `dragenter` and `dragover` instead of using the attribute.
