---
ruleId: "element/isindex"
title: "isindex element"
description: "isindex is obsolete, and browsers dropped its search-form behaviour in 2016–17 over XSS concerns; it now renders nothing useful. Use a form with a text input."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "body"
selector: "isindex"
fix: { op: "none" }
replacement: "Write the search form explicitly: <form action=\"/search\"><label>Search <input type=\"search\" name=\"q\"></label></form>."
tags: ["legacy", "security"]
impacts: ["maintainability", "security"]
related: ["element/bgsound", "element/blink"]
---

`<isindex prompt="Search this site:">` was the web's first search box, older than forms. The parser
treated it as a macro: one tag expanded into a small form with a rule, a label and a text field,
and pressing Enter sent the words back to the page's own URL as a query. It survived in the parser
for twenty years after forms made it pointless.

## Why avoid

It is obsolete and non-conforming. The HTML Standard lists `isindex` among the elements that "are
entirely obsolete, and must not be used by authors": "Use an explicit form and text control
combination instead."

And it no longer does anything. The WHATWG took the macro out of the HTML parser in 2016, and the
reason is in the commit: "The `<isindex>` parser macro is a potential XSS problem and browsers have
therefore started removing support. It is no longer supported by Chrome and Edge." Firefox removed
it in version 56. Today the Standard's parser has no special case for it, and the element maps to
`HTMLUnknownElement`, the interface for tags the browser doesn't recognise.

So a page that still relies on it has quietly lost its search box. There is no form, no text
field and nothing to submit, just an unknown element, and no error to say what happened.

## Use instead

An explicit form, which is what `<isindex>` used to expand into, with a proper label:

```html
<form action="/search" role="search">
  <label>Search <input type="search" name="q"></label>
  <button>Go</button>
</form>
```

The same 2016 change also dropped the special handling of an `<input name="isindex">` inside a
form, so give search fields an ordinary name like `q`.

## Detectability

Fully detectable by tag name. There is no autofix: the replacement is a form with a field, a label
and a submit button, not something a removal can produce.

## Resources

- [HTML Standard — Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features) — `isindex` is entirely obsolete: "Use an explicit form and text control combination instead."
- [whatwg/html — Remove `<isindex>` and `<input name=isindex>`](https://github.com/whatwg/html/commit/5c44abc734eb483f9a7ec79da5844d2fe63d9c3b) — the parser macro was "a potential XSS problem"; Chrome and Edge had already removed it.
- [Mozilla Bugzilla 1266495 — removing `<isindex>` from the parser and form submission](https://bugzilla.mozilla.org/show_bug.cgi?id=1266495) — fixed for Firefox 56.
- [HTML Standard — Elements in the DOM](https://html.spec.whatwg.org/multipage/dom.html#elements-in-the-dom) — `isindex` maps to `HTMLUnknownElement`.
