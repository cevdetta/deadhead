---
ruleId: "element/plaintext"
title: "plaintext element"
description: "plaintext never ends: all markup after it becomes text, including closing tags. Serve text/plain or escape content in pre."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "any"
selector: "plaintext"
fix: { op: "none" }
replacement: "Serve plain text as a text/plain file. To show it inside a page, use <pre><code> and escape < and & as &lt; and &amp;."
tags: ["legacy", "style"]
impacts: ["maintainability"]
related: ["element/xmp", "element/listing"]
---

Never use `<plaintext>`: everything after it becomes text. `<plaintext>` tells the
browser to stop reading HTML. Everything after the start tag is shown as
typed, in a monospace font, to the end of the file. MDN traces it to HTML 2.

## Why avoid

It is obsolete. The HTML Standard lists `plaintext` among the elements that "are entirely obsolete,
and must not be used by authors", with the instruction: "Use the "text/plain" MIME type instead."

Browsers still implement it, and it can't be undone. The parser handles the start tag by switching
"the tokenizer to the PLAINTEXT state", and the standard spells out what that means: "all remaining
tokens will be character tokens (and a final end-of-file token) because there is no way to switch
the tokenizer out of the PLAINTEXT state." The PLAINTEXT state has no case for `<` or `&`, so
nothing after the start tag is markup:

- **It has no end tag.** Writing `</plaintext>` shows the characters `</plaintext>`.
- **The rest of the page becomes text.** `</body>`, `</html>`, a footer or a script after it all
  appear on screen as source code instead of doing anything.
- **Character references aren't decoded.** `&amp;` stays five characters.

What it adds in return is appearance only. The rendering section styles it like `pre`: a block, in
a monospace font, with `white-space: pre`.

## Use instead

If the whole document is plain text, serve it as plain text. A `.txt` file with
`Content-Type: text/plain` is shown as typed, with no markup to escape.

To show text inside an HTML page, use `pre` and `code`, and escape `<` and `&`:

```html
<pre><code>Line one &lt;not a tag&gt; &amp; more</code></pre>
```

## Detectability

Fully detectable by tag name, anywhere in the document. The rule matches the tag
outright: a `<plaintext>` written in `<head>` is moved
into `<body>` by a browser but not by every parser the rule runs on, so the rule doesn't limit itself to
either. Nothing after the start tag is linted, because a browser reads it as text.

There is no autofix. Removing the start tag would turn the rest of the file back into markup, which
changes the page, and moving to `pre` and `code` means escaping the content.

## Resources

- [HTML Standard: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): `plaintext` is obsolete; use the `text/plain` MIME type instead.
- [HTML Standard: Parsing: the "in body" insertion mode](https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-inbody): the start tag switches the tokenizer to PLAINTEXT, with no way back.
- [HTML Standard: PLAINTEXT state](https://html.spec.whatwg.org/multipage/parsing.html#plaintext-state): every character, `<` and `&` included, is emitted as text.
- [HTML Standard: Rendering: flow content](https://html.spec.whatwg.org/multipage/rendering.html#flow-content-3): `plaintext` is displayed like `pre`.
- [MDN: `<plaintext>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/plaintext): obsolete; serve `text/plain`, or use `pre` or `code` with `<`, `>` and `&` escaped.
