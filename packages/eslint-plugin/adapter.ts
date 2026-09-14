/**
 * `@html-eslint/parser` AST → element port.
 *
 * Four things about this AST differ from the other two adapters, and each one
 * would be a silent drift bug if missed. The conformance suite is what turns
 * them from "silently reports nothing" into a failing test.
 *
 * - `<script>` and `<style>` are not `Tag` nodes. They are `ScriptTag` and
 *   `StyleTag`, and they carry no `name`, so their tag has to be synthesised.
 *   Miss this and every `script/*` rule quietly stops existing in ESLint.
 * - Tag names are lowercased by the parser but **attribute names are not**, so
 *   `HTTP-EQUIV` arrives verbatim. The port promises lowercase.
 * - `loc.column` is 0-based, per ESLint convention. The port promises 1-based,
 *   matching parse5.
 * - A `Doctype` node is raw tokens (`html`, `PUBLIC`, the identifiers), kept in
 *   the author's case and wherever it appeared. The tree builder's rules for
 *   which doctype counts have to be applied here.
 *
 * The AST types are described structurally here rather than imported from
 * `@html-eslint/types`, which is a transitive dependency of the parser and not
 * one this package declares.
 */

import { type Compound, matches, parseSelector } from "../core/selector.ts";
import type { DoctypePort, DocumentPort, ElementPort, Parsed, Range } from "../core/types.ts";

type Node = {
  type: string;
  range?: [number, number];
  loc?: { start: { line: number; column: number } };
  name?: string;
  /** A string on `Text`; a `ScriptTagContent`/`StyleTagContent` node on `ScriptTag`/`StyleTag`. */
  value?: string | Node;
  attributes?: { key: { value: string }; value?: { value: string }; range?: [number, number] }[];
  children?: Node[];
  body?: Node[];
};

/** The node types that stand for an element, and the tag each one means. */
const ELEMENT_TAG = (node: Node): string | null => {
  if (node.type === "Tag") return (node.name ?? "").toLowerCase();
  if (node.type === "ScriptTag") return "script";
  if (node.type === "StyleTag") return "style";
  return null;
};

const childrenOf = (node: Node): Node[] => node.children ?? node.body ?? [];

/**
 * Concatenated text of every descendant, in document order.
 *
 * `<script>` and `<style>` have no `Text` children: their contents hang off
 * `value` as a single `ScriptTagContent`/`StyleTagContent` node, so without
 * this they read as empty and a JSON-LD block could never parse.
 */
function textOf(node: Node): string {
  if (typeof node.value === "object") return typeof node.value.value === "string" ? node.value.value : "";
  let out = "";
  for (const child of childrenOf(node)) {
    if (child.type === "Text") out += typeof child.value === "string" ? child.value : "";
    else out += textOf(child);
  }
  return out;
}

function makePorts(parents: WeakMap<Node, Node>): (node: Node) => ElementPort {
  const cache = new WeakMap<Node, ElementPort>();

  const elementChildren = (node: Node): Node[] =>
    childrenOf(node).filter((child) => ELEMENT_TAG(child) !== null);

  const portFor = (node: Node): ElementPort => {
    const cached = cache.get(node);
    if (cached) return cached;

    const attrs = new Map<string, string>();
    const attrRanges = new Map<string, Range>();
    for (const attr of node.attributes ?? []) {
      const name = attr.key.value.toLowerCase();
      // A valueless attribute (`<script defer>`) is the empty string, which is
      // what both `getAttribute` and parse5 report.
      attrs.set(name, attr.value?.value ?? "");
      if (attr.range) attrRanges.set(name, [attr.range[0], attr.range[1]]);
    }

    const port: ElementPort = {
      tag: ELEMENT_TAG(node) ?? "",
      attr: (name) => attrs.get(name.toLowerCase()),
      hasAttr: (name) => attrs.has(name.toLowerCase()),
      attrNames: () => [...attrs.keys()],
      attrRange: (name) => attrRanges.get(name.toLowerCase()) ?? null,
      text: () => textOf(node),
      parent: () => {
        const parent = parents.get(node);
        return parent === undefined ? null : portFor(parent);
      },
      children: () => elementChildren(node).map(portFor),
      index: () => {
        const parent = parents.get(node);
        return parent === undefined ? 0 : elementChildren(parent).indexOf(node);
      },
      range: (): Range | null => (node.range ? [node.range[0], node.range[1]] : null),
      // ESLint columns are 0-based; the port and parse5 are 1-based.
      loc: () => (node.loc ? { line: node.loc.start.line, col: node.loc.start.column + 1 } : null),
    };

    cache.set(node, port);
    return port;
  };

  return portFor;
}

/** HTML's ASCII whitespace: what the "initial" insertion mode skips. */
const ASCII_WHITESPACE = /^[\t\n\f\r ]*$/;

/**
 * The doctype the tree builder would honour: the first `Doctype` at the top of
 * the document with nothing but comments and whitespace before it. After any
 * text or element, a browser has already left the "initial" insertion mode and
 * ignores the doctype, so the port reports none, exactly as parse5 does.
 */
function doctypeOf(program: Node): DoctypePort | null {
  const document = childrenOf(program).find((child) => child.type === "Document") ?? program;
  let node: Node | undefined;
  for (const child of childrenOf(document)) {
    if (child.type === "Doctype") {
      node = child;
      break;
    }
    if (child.type === "Comment") continue;
    if (child.type === "Text" && typeof child.value === "string" && ASCII_WHITESPACE.test(child.value)) continue;
    return null;
  }
  if (node === undefined) return null;

  // `<!DOCTYPE html PUBLIC "pub" "sys">` arrives as the tokens
  // `html`, `PUBLIC`, `pub`, `sys`, with the quotes already stripped.
  const tokens = ((node as { attributes?: { value?: { value?: string } }[] }).attributes ?? []).map(
    (token) => token.value?.value ?? "",
  );
  const [name = "", keyword = "", first = "", second = ""] = tokens;
  const kind = keyword.toLowerCase();
  const range = node.range;
  const loc = node.loc;

  return {
    tag: "!doctype",
    name: name.replace(/[A-Z]+/g, (upper) => upper.toLowerCase()),
    publicId: kind === "public" ? first : "",
    systemId: kind === "public" ? second : kind === "system" ? first : "",
    range: (): Range | null => (range ? [range[0], range[1]] : null),
    // ESLint columns are 0-based; the port and parse5 are 1-based.
    loc: () => (loc ? { line: loc.start.line, col: loc.start.column + 1 } : null),
  };
}

/**
 * Wrap a parsed program.
 *
 * `source` is passed through so suppression comments and source-backed
 * findings work exactly as they do in the CLI — unlike the DOM adapter, an
 * ESLint run always has the text in hand.
 */
export function fromProgram(program: unknown, source: string): Parsed {
  const elements: Node[] = [];
  const parents = new WeakMap<Node, Node>();

  const collect = (node: Node, parent: Node | null): void => {
    const isElement = ELEMENT_TAG(node) !== null;
    if (isElement) {
      elements.push(node);
      if (parent !== null) parents.set(node, parent);
    }
    for (const child of childrenOf(node)) collect(child, isElement ? node : parent);
  };
  collect(program as Node, null);

  const portFor = makePorts(parents);
  const root = elements.find((node) => ELEMENT_TAG(node) === "html") ?? elements[0];

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

  const doctype = doctypeOf(program as Node);

  const doc: DocumentPort = {
    doctype: () => doctype,
    querySelectorAll(selector) {
      const ast = astFor(selector);
      return elements.map(portFor).filter((port) => matches(port, ast));
    },
    querySelector(selector) {
      const ast = astFor(selector);
      return elements.map(portFor).find((port) => matches(port, ast)) ?? null;
    },
  };

  return { root: root === undefined ? null : portFor(root), doc, source };
}
