---
ruleId: "element/noembed"
title: "noembed element"
description: "noembed is obsolete and its content is never displayed, not even when the embed fails; put fallback content inside an object element instead."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "body"
selector: "noembed"
fix: { op: "none" }
replacement: "Use <object data=\"…\" type=\"…\"> and put the fallback content between its tags; embed has no fallback at all."
tags: ["embedding"]
impacts: ["a11y", "maintainability"]
related: ["element/plugin-embed", "element/applet"]
---

`<noembed>` never displays its content. `<noembed>` was meant to sit next to an
`<embed>` and hold what to show instead when the embedded
content couldn't play: a link, a picture, a sentence explaining what was missing. It still turns up
beside old media and plug-in embeds.

## Why avoid

It is obsolete. The HTML Standard lists `noembed` among the elements that "are entirely obsolete,
and must not be used by authors", with the instruction: "Use `object` instead of `embed` when
fallback is necessary."

Nobody ever sees what's inside it. The rendering section hides it outright,
alongside `script`, `style` and `template`: `noembed { display: none; }`. There is no condition
attached, so it stays hidden whether the `embed` next to it works or not. Its content isn't even
markup: the parser reads it with "the generic raw text element parsing algorithm", so a link
written inside is plain text.

The `embed` it was paired with has no fallback either: "The `embed` element has no fallback content;
its descendants are ignored." When it fails, the reader gets nothing, and the fallback the author
wrote, the only accessible alternative to the embedded content, never reaches them.

## Use instead

Use `object`, which has real fallback content: "The `object` element represents the element's
children. This is the element's fallback content." Whatever you put between its tags is shown when
the resource can't be:

```html
<object data="chart.svg" type="image/svg+xml" width="600" height="400">
  <p><a href="chart.png">View the chart as an image</a></p>
</object>
```

## Detectability

Fully detectable by tag name. The rule matches the tag outright; it never lints the
content of a `noembed`, because a browser
reads it as text. There is no autofix. Deleting the element would change nothing on screen, since
it's hidden, but it would also delete the fallback text you still need to move into an `object`.

## Resources

- [HTML Standard: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): `noembed` is obsolete; use `object` when fallback is necessary.
- [HTML Standard: Rendering: hidden elements](https://html.spec.whatwg.org/multipage/rendering.html#hidden-elements): `noembed { display: none; }`, unconditionally.
- [HTML Standard: The embed element](https://html.spec.whatwg.org/multipage/iframe-embed-object.html#the-embed-element): `embed` has no fallback content.
- [HTML Standard: The object element](https://html.spec.whatwg.org/multipage/iframe-embed-object.html#the-object-element): an `object`'s children are its fallback content.
- [MDN: `<noembed>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/noembed): obsolete and non-standard; use `object` with fallback content between its tags.
