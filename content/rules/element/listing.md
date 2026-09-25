---
ruleId: "element/listing"
title: "<listing>"
description: "listing is obsolete; it renders like `pre` but carries no code semantics, so use `pre` and `code` instead."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "body"
selector: 'listing'
fix: { op: "none" }
replacement: "Mark up code listings with `<pre><code>`."
tags: ["text"]
impacts: ["maintainability"]
related: ["element/xmp", "element/plaintext"]
---

`<listing>` is `<pre>` without the meaning. `<listing>` is an early-HTML element for
computer listings that browsers render
like `<pre>`: a block of monospace, preformatted text. The HTML Standard lists
it under non-conforming features with the direction "Use `pre` and `code`
instead", and W3C's HTML5 author guidance says the same.

## Why avoid

It is entirely obsolete and must not be used by authors. Both the WHATWG HTML
Standard and the W3C HTML5 edition place `listing` on their obsolete-element
lists with `pre` and `code` as the replacement.

What is left in browsers is rendering without meaning. User agents must treat
`listing` equivalent to `pre` in semantics and for purposes of rendering, so it
looks like a code block without saying the content is code. `<code>` does say
that, and assistive technology exposes it through the ARIA `code` role.

It does not even buy the raw-text convenience of its cousin `xmp`. `xmp` uses
the generic raw text parsing algorithm, so markup inside it stays literal;
`listing` content is still parsed as markup and handled like `pre`, including
dropping a leading newline. There is no case where `listing` does something
`pre` cannot do more clearly.

## Use instead

A preformatted code block, with markup escaped so it stays literal:

```html
<pre><code>git status --short</code></pre>
```

## Detectability

Fully detectable. The rule matches the bare element name `listing`; no logic
module is needed, and all three adapters agree on it.

There is no autofix. Removing the element deletes its content, and rewriting it
as `pre` plus `code` is a rename rather than a subtraction, so the fix op is
`none`.

## Resources

- [HTML Standard: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): `listing` is entirely obsolete; `pre` and `code` instead.
- [HTML Standard: Other elements, attributes and APIs](https://html.spec.whatwg.org/multipage/obsolete.html#other-elements,-attributes-and-apis): user agents must treat `listing` equivalent to `pre` in semantics and rendering.
- [W3C HTML5: Edition for Web Authors: Obsolete features](https://www.w3.org/TR/2011/WD-html5-author-20110809/obsolete.html): independent W3C list with the same verdict and replacement.
