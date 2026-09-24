---
ruleId: "attr/object-plugin"
title: "object legacy attributes"
description: "seven plugin-era attributes on object are obsolete; data and type invoke resources now."
pubDate: "2026-09-19"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "body"
selector: "object[archive], object[code], object[codebase], object[codetype], object[declare], object[standby], object[typemustmatch]"
fix: { op: "remove-attributes" }
replacement: "Delete the attributes. Invoke resources with data and type: <object data=\"clip.mp4\" type=\"video/mp4\">."
tags: ["embedding"]
impacts: ["maintainability"]
related: ["attr/contextmenu-onshow", "element/object-embed-plugin"]
---

Seven plugin-era attributes on `object` invoke nothing. WHATWG lists each as obsolete with a replacement, `data` and `type` for invocation plus plain markup for the rest, since browsers run no plug-ins and the object renders or falls back without them.

## Why avoid

WHATWG lists all seven as obsolete with a replacement each. Section 16.2 sends the invocation attributes `archive`, `code`, `codebase` and `codetype` to the `data` and `type` attributes, with `param` elements for same-named parameters; it gives `classid` the same direction, but `element/object-embed-plugin` owns that attribute, since removing it changes how `object` chooses its fallback. It tells authors to repeat the `object` element instead of declaring it (`declare`), to optimize the resource instead of messaging about it (`standby`), and to avoid untrusted resources instead of type-checking them (`typemustmatch`). The plugin era these attributes configured is over; browsers run no plug-ins.

MDN documents the live pair that remains. Its `object` page requires at least one of `data` and `type` to be defined, with `data` as the resource address and `type` as its content type. Every job the seven attributes once split across invocations, declarations and loading messages now reduces to that pair plus plain markup.

## Use instead

Invoke the resource with the live pair and repeat markup where reuse is meant:

```html
<object data="clip.mp4" type="video/mp4" width="640" height="360">
  <a href="clip.mp4">Download the clip (MP4)</a>
</object>
```

## Detectability

Complete detection. The rule matches any of the seven spellings: presence of any one is the whole verdict, so no logic module exists. The autofix removes every attribute the rule names that is present on the element, and leaves every other attribute as written. `classid` is left to `element/object-embed-plugin`: removing it changes how `<object>` chooses its fallback.

## Resources

- [WHATWG: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html): all seven attributes obsolete with a replacement each.
- [MDN: `<object>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/object): at least one of `data` and `type` must be defined.
