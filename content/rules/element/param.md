---
ruleId: "element/param"
title: "<param>"
description: "A plug-in parameter element that is entirely obsolete and no longer read by anything."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "body"
selector: "param"
fix: { op: "none" }
replacement: "Set the resource directly on <object> with its data attribute: <object data=\"clip.mp4\" type=\"video/mp4\">."
tags: ["embedding"]
impacts: ["interop", "maintainability"]
related: ["element/applet", "element/object-embed-plugin"]
---

`<param>` feeds nothing. `<param>` passed name/value pairs to the plug-in loaded by
its parent `<object>`: which movie to play and whether fullscreen was allowed. Flash
variables rode along the same way. The
plug-ins it served are dead, and the element went with them: it is entirely
obsolete, still parsed as a void element, and read by nothing.

## Why avoid

It is obsolete by spec, not merely unfashionable. The HTML Standard's
non-conforming features list says `param` must not be used by authors, and its
only replacement advice is to set the URL of the external resource with the
`data` attribute of the `object` element instead.

It never represented anything on its own. Historically it existed solely to
initialise plug-ins invoked by `<object>`, and the current `object` section
defines a transparent content model with no `param` processing step. The
pipeline never consumes params. The rendering section hides it outright, in the same
unconditional list as `script`, `style` and `noembed`. What survives in the standard
is the obsolete listing plus a compatibility `HTMLParamElement` interface.

What is left is worse than inert, because it looks like configuration. A
`<param name="movie" value="show.swf">` suggests the page is setting up an
embedded runtime, but that runtime cannot load in any modern browser. The
markup is a silent no-op that hides a lost feature: whatever the parameters
tuned is gone for every visitor, with no warning in the markup.

## Use instead

There is no mechanical translation: plug-in parameters cannot become web
platform markup. Point `<object>` at the real resource with `data` and `type`,
keeping fallback content between the tags for readers the resource cannot reach:

```html
<object data="clip.mp4" type="video/mp4" width="640" height="360">
  <img src="poster.jpg" alt="A flower opening.">
</object>
```

For media, prefer the native element outright:

```html
<video controls width="640" height="360" preload="metadata">
  <source src="clip.mp4" type="video/mp4">
</video>
```

## Detectability

Fully detectable. The rule matches the tag outright: `param` is a void element that
only ever appears as a child
of `object`. There is no attribute form and no
modern element to confuse it with. No logic module is needed.

The fix is `none`. Removing the element would be safe, since a void
element with no rendering of its own takes nothing visible with it. Its
name/value pairs still cannot be mapped to anything that works, so deleting
the markup is left to the author rebuilding the feature.

## Resources

- [HTML Standard: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): lists `param` as entirely obsolete, with the `data`-attribute replacement wording.
- [HTML Standard: The `object` element](https://html.spec.whatwg.org/multipage/iframe-embed-object.html#the-object-element): content model is transparent with no `param` processing, so current object handling never consumes params.
- [HTML Standard: Rendering: hidden elements](https://html.spec.whatwg.org/multipage/rendering.html#hidden-elements): `param` is hidden unconditionally, alongside `script`, `style` and `noembed`.
- [MDN: `<param>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/param): marks the element Deprecated and void (no content, no ARIA role), pointing back at the spec's non-conforming-features section.
