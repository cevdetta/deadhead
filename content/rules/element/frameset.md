---
ruleId: "element/frameset"
title: "frameset, frame and noframes"
description: "frameset, frame and noframes are obsolete. A frameset is separate documents in one window. Use one document with iframe."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "any"
selector: "frameset, frame, noframes"
fix: { op: "none" }
replacement: "Build one document per page. Use iframe with CSS to embed a separate document, or server-side includes for shared parts like navigation."
tags: ["legacy"]
impacts: ["maintainability"]
related: ["element/plugin-embed"]
---

A frameset puts separate documents in one window. A frameset page has no `<body>`. In
its place, `<frameset cols="200,*">` splits the window into
panes, each `<frame src="…">` loads a separate HTML document into one of them, and `<noframes>`
holds content for browsers that don't do frames. The markup still turns up in old documentation
and intranet pages.

## Why avoid

It is obsolete. The HTML Standard lists `frame`, `frameset` and `noframes` among the elements
that "are entirely obsolete, and must not be used by authors", and gives two replacements:
"Either use `iframe` and CSS instead, or use server-side includes to generate complete pages with
the various invariant parts merged in."

Browsers do still render it, and that is the problem. The spec keeps the machinery: "The
`frameset` element acts as the `body` element in documents that use frames", and inserting a
`frame` creates "a new child navigable", "similar to the `iframe` element". So a frameset page
isn't one document. It is a frame document plus one full document per pane, each with its own
history. Following a link inside a pane loads a new document into that pane only. The window's
URL stays the frameset's, so the address bar, a bookmark or a shared link can't say which page
the reader was on.

The layout is fixed, too. The rendering section draws a frameset "as a box with the height and
width of the viewport" and divides it by the `cols` and `rows` attributes. Pane sizes are set in
markup, per page, rather than in a stylesheet that can adapt.

## Use instead

Build each page as one complete document, and share the parts that repeat, such as navigation,
through a server-side include, a template or a static site generator:

```html
<body>
  <nav aria-label="Documentation">
    <a href="/guide/">Guide</a>
    <a href="/api/">API reference</a>
  </nav>
  <main>
    <h1>Getting started</h1>
  </main>
</body>
```

Keep the navigation on screen with CSS, for example `position: sticky` or a grid layout, instead
of a separate pane.

If a piece of content is a separate document, embed it with an `iframe` and give it a
title:

```html
<iframe src="https://maps.example/embed" title="Office location map" width="600" height="400"></iframe>
```

## Detectability

Fully detectable by tag name. The rule's scope is the whole document: a `frameset` sits beside
`<head>` rather than inside `<body>`, and `noframes` may appear in either.

The bookmarklet reports these findings but can't show them on a frameset page. It adds its panel
to `document.body`, which on such a page is the `frameset`, and the spec lays out only `frame`
and `frameset` children there.

There is no autofix: removing a `frameset` would leave a page with no content, and `noframes` holds
the only content some readers get.

## Resources

- [HTML Standard: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): `frame`, `frameset` and `noframes` are entirely obsolete; use `iframe` and CSS or server-side includes instead.
- [HTML Standard: Frames](https://html.spec.whatwg.org/multipage/obsolete.html#frames): `frameset` acts as the body, and each `frame` creates a child navigable, like an `iframe`.
- [HTML Standard: Rendering: frames and framesets](https://html.spec.whatwg.org/multipage/rendering.html#frames-and-framesets): a frameset is a viewport-sized box divided by `cols` and `rows`, laying out only `frame` and `frameset` children.
