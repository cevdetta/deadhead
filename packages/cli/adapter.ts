/**
 * parse5 → element port.
 *
 * parse5 is load-bearing here, not a convenience: it is spec-compliant for
 * tree construction (implied `<head>`, misnested tags, stray `</p>`) and it
 * reports `sourceCodeLocationInfo`, which is the only reason range-based fixes
 * are possible at all.
 *
 * It must never leak past this file. Nothing downstream — no rule, no
 * reporter, no test helper — may import a parse5 type.
 */

import { type DefaultTreeAdapterTypes, parse } from "parse5";
import { type Compound, matches, parseSelector } from "../core/selector.ts";
import type { DocumentPort, ElementPort, Parsed, Range } from "../core/types.ts";

type P5Element = DefaultTreeAdapterTypes.Element;
type P5Node = DefaultTreeAdapterTypes.ChildNode;
type P5Parent = DefaultTreeAdapterTypes.ParentNode;

const isElement = (node: P5Node | P5Parent): node is P5Element =>
  "tagName" in node && typeof node.tagName === "string";

/**
 * parse5 parks a `<template>`'s parsed markup in a separate `content`
 * fragment, so its own `childNodes` is empty. Without this the walker would
 * step straight over every template, and `--skip-templates` would be a no-op
 * that looked like it worked.
 */
const childrenOf = (node: P5Node | P5Parent): P5Node[] => {
  if ("content" in node) return node.content.childNodes;
  return "childNodes" in node ? node.childNodes : [];
};

/** Concatenated text of every descendant, in document order. */
function textOf(node: P5Element): string {
  let out = "";
  const visit = (current: P5Node): void => {
    if (isElement(current)) {
      for (const child of current.childNodes) visit(child);
      return;
    }
    // `Element.nodeName` is typed as `string`, so it cannot discriminate the
    // union on its own — the element case has to be ruled out first.
    if (current.nodeName === "#text") out += current.value;
  };
  for (const child of node.childNodes) visit(child);
  return out;
}

/**
 * One port per parse5 node, so `parent()` and `children()` hand back the same
 * object every time and identity comparisons behave.
 *
 * `parents` is threaded in rather than read off `node.parentNode` because the
 * direct children of a `<template>` point at its content fragment, not at the
 * template element. Walking the tree once and recording the real element
 * parent keeps `parent()` and `index()` honest across that boundary.
 */
function makePorts(parents: WeakMap<P5Element, P5Element>): (node: P5Element) => ElementPort {
  const cache = new WeakMap<P5Element, ElementPort>();

  const portFor = (node: P5Element): ElementPort => {
    const cached = cache.get(node);
    if (cached) return cached;

    // parse5 lowercases HTML tag names and attribute names during parsing, so
    // the port's "lowercase" guarantee costs nothing here.
    const attrs = new Map<string, string>();
    for (const attr of node.attrs) attrs.set(attr.name.toLowerCase(), attr.value);

    const port: ElementPort = {
      tag: node.tagName.toLowerCase(),
      attr: (name) => attrs.get(name.toLowerCase()),
      hasAttr: (name) => attrs.has(name.toLowerCase()),
      attrNames: () => [...attrs.keys()],
      text: () => textOf(node),
      parent: () => {
        const parent = parents.get(node);
        return parent === undefined ? null : portFor(parent);
      },
      children: () => childrenOf(node).filter(isElement).map(portFor),
      index: () => {
        const parent = parents.get(node);
        if (parent === undefined) return 0;
        return childrenOf(parent).filter(isElement).indexOf(node);
      },
      range: (): Range | null => {
        const loc = node.sourceCodeLocation;
        return loc ? [loc.startOffset, loc.endOffset] : null;
      },
      loc: () => {
        const loc = node.sourceCodeLocation;
        return loc ? { line: loc.startLine, col: loc.startCol } : null;
      },
    };

    cache.set(node, port);
    return port;
  };

  return portFor;
}

/**
 * Parse HTML into what the engine consumes.
 *
 * `querySelector`/`querySelectorAll` are implemented with core's own matcher
 * rather than a CSS library, so a document rule and the engine agree by
 * construction about what the selector subset means.
 */
export function parseHtml(source: string): Parsed {
  const document = parse(source, { sourceCodeLocationInfo: true });

  const elements: P5Element[] = [];
  const parents = new WeakMap<P5Element, P5Element>();
  const collect = (node: P5Node | P5Parent, parent: P5Element | null): void => {
    const element = isElement(node) ? node : null;
    if (element !== null) {
      elements.push(element);
      if (parent !== null) parents.set(element, parent);
    }
    for (const child of childrenOf(node)) collect(child, element ?? parent);
  };
  collect(document, null);

  const portFor = makePorts(parents);

  const root = elements.find((node) => node.tagName.toLowerCase() === "html") ?? elements[0];

  const compiled = new Map<string, Compound[]>();
  const astFor = (selector: string): Compound[] => {
    const cached = compiled.get(selector);
    if (cached) return cached;
    const parsed = parseSelector(selector);
    if (!parsed.ok) {
      throw new Error(`unsupported selector ${JSON.stringify(selector)} — ${parsed.message}`);
    }
    compiled.set(selector, parsed.ast);
    return parsed.ast;
  };

  const doc: DocumentPort = {
    querySelectorAll(selector) {
      const ast = astFor(selector);
      const found: ElementPort[] = [];
      for (const node of elements) {
        const port = portFor(node);
        if (matches(port, ast)) found.push(port);
      }
      return found;
    },
    querySelector(selector) {
      const ast = astFor(selector);
      for (const node of elements) {
        const port = portFor(node);
        if (matches(port, ast)) return port;
      }
      return null;
    },
  };

  return { root: root === undefined ? null : portFor(root), doc, source };
}
