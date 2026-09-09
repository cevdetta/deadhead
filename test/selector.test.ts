import assert from "node:assert/strict";
import test from "node:test";

import { leadingTag, matches, parseSelector } from "../packages/core/selector.ts";
import type { Compound } from "../packages/core/selector.ts";
import type { ElementPort } from "../packages/core/types.ts";

// --- selector subset --------------------------------------------------------

const ACCEPTED = [
  "meta",
  "meta[charset]",
  'meta[http-equiv="X-UA-Compatible" i]',
  "script[type]",
  "link[rel~=icon]",
  'script[src^="http://"]',
  'link[href$=".css"]',
  "a[href*=example]",
  "meta:not([charset])",
  "script:not([type])[src]",
  "meta[name], meta[property]",
  "  link[rel] ,  meta[name]  ",
  "meta[ name = viewport  i ]",
];

for (const selector of ACCEPTED) {
  test(`selector accepted: ${selector}`, () => {
    const parsed = parseSelector(selector);
    assert.ok(parsed.ok, `expected accept, got: ${parsed.ok ? "" : parsed.message}`);
  });
}

const REJECTED: [string, RegExp][] = [
  ["head > meta", /combinators are not supported/],
  ["head meta", /descendant space/],
  ["meta + link", /combinators are not supported/],
  ["meta ~ link", /combinators are not supported/],
  ["*", /universal selector/],
  ["*[charset]", /universal selector/],
  ["meta[charset]*", /universal selector/],
  ["meta[charset] link", /descendant space/],
  ["[lang|=en]", /`\|=`/],
  ["meta:first-child", /pseudo-class `:first-child`/],
  ["meta::before", /pseudo-class/],
  [".legacy", /`\.` selectors are not supported/],
  ["#main", /`#` selectors are not supported/],
  ["META[charset]", /must be lowercase/],
  ["[a=b s]", /only the `i` flag/],
  ["meta:not(:not([charset]))", /cannot be nested/],
  ["meta:not([a], [b])", /does not take a selector list/],
  ["meta[", /expected an attribute name/],
  ["meta[charset", /expected `\]`/],
  ['meta[name="unterminated]', /unterminated quoted/],
  ["", /selector is empty/],
  ["meta,", /trailing `,`/],
];

for (const [selector, expected] of REJECTED) {
  test(`selector rejected: ${JSON.stringify(selector)}`, () => {
    const parsed = parseSelector(selector);
    assert.ok(!parsed.ok, "expected reject");
    assert.match(parsed.message, expected);
    assert.ok(parsed.index >= 0);
  });
}

test("a parsed selector keeps enough structure to bucket by leading tag", () => {
  const parsed = parseSelector('meta[http-equiv="X-UA-Compatible" i]');
  assert.ok(parsed.ok);
  assert.deepEqual(parsed.ast, [
    [
      { type: "tag", name: "meta" },
      {
        type: "attr",
        name: "http-equiv",
        op: "=",
        value: "X-UA-Compatible",
        insensitive: true,
      },
    ],
  ]);
});

// --- matching ---------------------------------------------------------------

const el = (tag: string, attrs: Record<string, string> = {}): ElementPort => ({
  tag,
  attr: (name) => attrs[name.toLowerCase()],
  hasAttr: (name) => name.toLowerCase() in attrs,
  attrNames: () => Object.keys(attrs),
  text: () => "",
  parent: () => null,
  children: () => [],
  index: () => 0,
  range: () => null,
  loc: () => null,
});

const ast = (selector: string): Compound[] => {
  const parsed = parseSelector(selector);
  if (!parsed.ok) throw new Error(`${selector}: ${parsed.message}`);
  return parsed.ast;
};

const hits = (selector: string, element: ElementPort): boolean => matches(element, ast(selector));

test("tag selectors compare the lowercase tag name", () => {
  assert.equal(hits("meta", el("meta")), true);
  assert.equal(hits("meta", el("link")), false);
});

test("[attr] tests presence, whatever the value", () => {
  assert.equal(hits("meta[charset]", el("meta", { charset: "utf-8" })), true);
  assert.equal(hits("meta[charset]", el("meta", { charset: "" })), true);
  assert.equal(hits("meta[charset]", el("meta", {})), false);
});

test("[attr=v] is case-sensitive until the i flag says otherwise", () => {
  const element = el("meta", { "http-equiv": "X-UA-Compatible" });
  assert.equal(hits('meta[http-equiv="X-UA-Compatible"]', element), true);
  assert.equal(hits('meta[http-equiv="x-ua-compatible"]', element), false);
  assert.equal(hits('meta[http-equiv="x-ua-compatible" i]', element), true);
  assert.equal(hits('meta[http-equiv="X-UA-COMPATIBLE" i]', element), true);
});

test("~= matches one whitespace-separated word", () => {
  const element = el("link", { rel: "shortcut icon" });
  assert.equal(hits("link[rel~=icon]", element), true);
  assert.equal(hits("link[rel~=shortcut]", element), true);
  assert.equal(hits("link[rel~=ico]", element), false);
  // A value that is empty or itself contains whitespace can never match.
  assert.equal(hits('link[rel~=""]', element), false);
  assert.equal(hits('link[rel~="shortcut icon"]', element), false);
});

test("^= $= *= anchor, and an empty value never matches", () => {
  const element = el("script", { src: "https://cdn.example.com/app.min.js" });
  assert.equal(hits('script[src^="https://"]', element), true);
  assert.equal(hits('script[src^="http://"]', element), false);
  assert.equal(hits('script[src$=".js"]', element), true);
  assert.equal(hits('script[src$=".css"]', element), false);
  assert.equal(hits("script[src*=cdn]", element), true);
  assert.equal(hits("script[src*=nope]", element), false);
  for (const op of ["^", "$", "*"]) {
    assert.equal(hits(`script[src${op}=""]`, element), false, `${op}= with an empty value`);
  }
});

test("a compound requires every part to match", () => {
  assert.equal(hits("script[type][src]", el("script", { type: "module", src: "/a.js" })), true);
  assert.equal(hits("script[type][src]", el("script", { type: "module" })), false);
});

test(":not negates the compound inside it, not each part", () => {
  // :not(a[b]) means "not (tag a AND attr b)", so a bare <a> still matches.
  assert.equal(hits(":not(script[src])", el("script", { src: "/a.js" })), false);
  assert.equal(hits(":not(script[src])", el("script", {})), true);
  assert.equal(hits(":not(script[src])", el("link", { src: "/a.js" })), true);
  assert.equal(hits("script:not([type])", el("script", {})), true);
  assert.equal(hits("script:not([type])", el("script", { type: "module" })), false);
});

test("a comma list matches if any alternative does", () => {
  const selector = "meta[name], meta[property]";
  assert.equal(hits(selector, el("meta", { name: "viewport" })), true);
  assert.equal(hits(selector, el("meta", { property: "og:title" })), true);
  assert.equal(hits(selector, el("meta", { charset: "utf-8" })), false);
});

test("attribute names are matched case-insensitively by the port", () => {
  assert.equal(hits("meta[charset]", el("meta", { charset: "utf-8" })), true);
  assert.equal(hits("meta[CHARSET]", el("meta", { charset: "utf-8" })), true);
});

test("leadingTag picks the dispatch bucket, or null for the wildcard one", () => {
  assert.equal(leadingTag(ast("meta[charset]")), "meta");
  assert.equal(leadingTag(ast("meta[name], meta[property]")), "meta");
  assert.equal(leadingTag(ast("script")), "script");
  // Mixed tags and tagless compounds cannot be bucketed.
  assert.equal(leadingTag(ast("link[rel], meta[name]")), null);
  assert.equal(leadingTag(ast("[charset]")), null);
  assert.equal(leadingTag(ast(":not([charset])")), null);
});
