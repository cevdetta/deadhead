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
import { makeDoctypePort, withPortCache } from "../core/port.ts";
import { type Compound, leadingTag, matches, parseSelector } from "../core/selector.ts";
import type { DoctypePort, DocumentPort, ElementPort, Parsed, Range } from "../core/types.ts";

type P5Element = DefaultTreeAdapterTypes.Element;
type P5Node = DefaultTreeAdapterTypes.ChildNode;
type P5Parent = DefaultTreeAdapterTypes.ParentNode;
type P5Doctype = DefaultTreeAdapterTypes.DocumentType;

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
  // An explicit stack: markup nested thousands deep is legal HTML, and a
  // recursive walk dies on it. Children are pushed in reverse so they pop in
  // document order.
  const stack: P5Node[] = [...node.childNodes].reverse();
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (isElement(current)) {
      for (let i = current.childNodes.length - 1; i >= 0; i--) stack.push(current.childNodes[i]!);
    } else if (current.nodeName === "#text") {
      // `Element.nodeName` is typed as `string`, so it cannot discriminate the
      // union on its own — the element case has to be ruled out first.
      out += (current as DefaultTreeAdapterTypes.TextNode).value;
    }
  }
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
function makePorts(
  parents: WeakMap<P5Element, P5Element>,
  elementChildren: WeakMap<P5Element, P5Element[]>,
): (node: P5Element) => ElementPort {
  // Ports of each node's element children, materialised on first use. The
  // engine walk calls children() once per visited element, so sharing one
  // array per node removes the filter().map() allocation that used to show
  // up once per node. Shared by reference: rules must not mutate it.
  const childPorts = new WeakMap<P5Element, ElementPort[]>();

  return withPortCache<P5Element>((node, portFor) => {
    // parse5 lowercases HTML tag names and attribute names during parsing, so
    // the port's "lowercase" guarantee costs nothing here. Foreign attributes
    // keep their prefix apart from their name (`xlink:href` arrives as prefix
    // `xlink`, name `href`), so the map key rejoins them: the DOM and ESLint
    // adapters both report the qualified name, and the three must agree.
    const attrs = new Map<string, string>();
    for (const attr of node.attrs) {
      const prefix = attr.prefix ?? "";
      const qualified = prefix === "" ? attr.name : `${prefix}:${attr.name}`;
      attrs.set(qualified.toLowerCase(), attr.value);
    }

    const port: ElementPort = {
      tag: node.tagName.toLowerCase(),
      attr: (name) => attrs.get(name.toLowerCase()),
      hasAttr: (name) => attrs.has(name.toLowerCase()),
      attrNames: () => [...attrs.keys()],
      attrRange: (name): Range | null => {
        // parse5 keys attribute locations by the lowercased name, the same way
        // it lowercases the attributes themselves — qualified where the
        // attribute carries a prefix (`xlink:href`, never bare `href`).
        const at = node.sourceCodeLocation?.attrs?.[name.toLowerCase()];
        return at ? [at.startOffset, at.endOffset] : null;
      },
      text: () => textOf(node),
      parent: () => {
        const parent = parents.get(node);
        return parent === undefined ? null : portFor(parent);
      },
      children: () => {
        let ports = childPorts.get(node);
        if (ports === undefined) {
          ports = (elementChildren.get(node) ?? []).map(portFor);
          childPorts.set(node, ports);
        }
        return ports;
      },
      index: () => {
        const parent = parents.get(node);
        if (parent === undefined) return 0;
        return (elementChildren.get(parent) ?? []).indexOf(node);
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

    return port;
  });
}

/**
 * parse5 already applies the tree builder's rules: it keeps only a doctype
 * that arrives before any text or element, lowercases its name, and reports
 * missing identifiers as empty strings. The port only has to carry that over.
 */
function doctypeOf(document: DefaultTreeAdapterTypes.Document): DoctypePort | null {
  const node = document.childNodes.find((child): child is P5Doctype => child.nodeName === "#documentType");
  if (node === undefined) return null;
  return makeDoctypePort({
    name: node.name ?? "",
    publicId: node.publicId ?? "",
    systemId: node.systemId ?? "",
    range: (): Range | null => {
      const loc = node.sourceCodeLocation;
      return loc ? [loc.startOffset, loc.endOffset] : null;
    },
    loc: () => {
      const loc = node.sourceCodeLocation;
      return loc ? { line: loc.startLine, col: loc.startCol } : null;
    },
  });
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
  // Element children per node, recorded in the same pass. The engine walk
  // calls children() on every visited element, so deriving them here fuses
  // the parse-time collect with the walk: no per-node filter().map() later.
  // Template content children are recorded under the <template> element —
  // collect recurses into the fragment with the template as parent — which
  // is what keeps parent() and index() honest across that boundary.
  const elementChildren = new WeakMap<P5Element, P5Element[]>();
  // Tag buckets for document queries, built in the same pass. Every document
  // rule scans for its own selectors, so without dispatch the elements array
  // is walked once per query; bucketing reuses the engine's dispatch idea and
  // each query scans only its leading-tag bucket, in document order.
  const byTag = new Map<string, P5Element[]>();
  // An explicit stack: markup nested thousands deep is legal HTML, and a
  // recursive walk dies on it. Children are pushed in reverse so they pop in
  // document order.
  const stack: [P5Node | P5Parent, P5Element | null][] = [[document, null]];
  while (stack.length > 0) {
    const [node, parent] = stack.pop()!;
    const element = isElement(node) ? node : null;
    if (element !== null) {
      elements.push(element);
      const tag = element.tagName.toLowerCase();
      const bucket = byTag.get(tag);
      if (bucket === undefined) byTag.set(tag, [element]);
      else bucket.push(element);
      if (parent !== null) {
        parents.set(element, parent);
        const siblings = elementChildren.get(parent);
        if (siblings === undefined) elementChildren.set(parent, [element]);
        else siblings.push(element);
      }
    }
    const children = childrenOf(node);
    for (let i = children.length - 1; i >= 0; i--) stack.push([children[i]!, element ?? parent]);
  }

  const portFor = makePorts(parents, elementChildren);

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

  const doctype = doctypeOf(document);

  /**
   * The nodes a document query must test, in document order. A selector whose
   * every alternative leads with the same tag can only match that tag's
   * bucket; anything else scans everything, exactly as before.
   */
  const candidates = (selector: string): { ast: Compound[]; nodes: P5Element[] } => {
    const ast = astFor(selector);
    const tag = leadingTag(ast);
    return { ast, nodes: tag === null ? elements : (byTag.get(tag) ?? []) };
  };

  const doc: DocumentPort = {
    doctype: () => doctype,
    querySelectorAll(selector) {
      const { ast, nodes } = candidates(selector);
      const found: ElementPort[] = [];
      for (const node of nodes) {
        const port = portFor(node);
        if (matches(port, ast)) found.push(port);
      }
      return found;
    },
    querySelector(selector) {
      const { ast, nodes } = candidates(selector);
      for (const node of nodes) {
        const port = portFor(node);
        if (matches(port, ast)) return port;
      }
      return null;
    },
  };

  return { root: root === undefined ? null : portFor(root), doc, source };
}
