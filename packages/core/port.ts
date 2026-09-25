/**
 * Shared port scaffolding for the three adapters.
 *
 * Three things live here, all of which drifted once.
 *
 * - `withPortCache`: every adapter needs one port per node so `parent()` and
 *   `children()` hand back the same object. Written three times, it drifted.
 * - `makeDoctypePort`: every adapter lowercases the doctype name its own way.
 *   Written three times, linkedom's case leaked through once.
 * - `makeDocumentQueries`: every source adapter needs cached document queries
 *   with leading-tag narrowing. Written twice, it drifted.
 *
 * Everything else stays in the adapters. Attribute maps, `parent()`,
 * `children()` and `index()` are one-liners over data only that adapter owns;
 * routing them through core helpers adds a call on a hot path and a name to
 * learn for no drift prevented. Tag and attribute names use `toLowerCase()`
 * inline: HTML names are ASCII, so it agrees with the tokenizer, and it is
 * the fastest spelling of it.
 *
 * Zero runtime dependencies, like the rest of core: this is inlined into the
 * bookmarklet.
 */

import type { DocumentPort, DoctypePort, ElementPort, Loc, Range } from "./types.ts";
import { type Compound, leadingTag, matches, parseSelector } from "./selector.ts";

/**
 * One port per node, so `parent()` and `children()` hand back the same object
 * every time and identity comparisons behave. The factory closes over the
 * recursive `portFor`, so adapters describe one node without managing a cache.
 */
export function withPortCache<N extends object>(
  create: (node: N, portFor: (node: N) => ElementPort) => ElementPort,
): (node: N) => ElementPort {
  const cache = new WeakMap<N, ElementPort>();
  const portFor = (node: N): ElementPort => {
    const cached = cache.get(node);
    if (cached !== undefined) return cached;
    const port = create(node, portFor);
    cache.set(node, port);
    return port;
  };
  return portFor;
}

/**
 * The document's DOCTYPE as the port reports it. The name is lowercased here
 * so every adapter honours the tokenizer's case rule in one place; parse5
 * already lowercases, linkedom and @html-eslint keep the author's case.
 */
export function makeDoctypePort(options: {
  name: string;
  publicId: string;
  systemId: string;
  range: () => Range | null;
  loc: () => Loc | null;
}): DoctypePort {
  return {
    tag: "!doctype",
    name: options.name.toLowerCase(),
    publicId: options.publicId,
    systemId: options.systemId,
    range: options.range,
    loc: options.loc,
  };
}

/**
 * `querySelector`/`querySelectorAll` over a node list, with core's own
 * matcher, so a document rule and the engine agree by construction on what
 * the selector subset means. Selectors are parsed once per document; a
 * selector whose alternatives all lead with one tag scans only that tag.
 */
export function makeDocumentQueries<N extends object>(
  nodes: N[],
  byTag: Map<string, N[]>,
  portFor: (node: N) => ElementPort,
): Pick<DocumentPort, "querySelector" | "querySelectorAll"> {
  const compiled = new Map<string, { ast: Compound[]; tag: string | null }>();
  const candidates = (selector: string): { ast: Compound[]; list: N[] } => {
    let entry = compiled.get(selector);
    if (entry === undefined) {
      const parsed = parseSelector(selector);
      if (!parsed.ok) throw new Error(`unsupported selector ${JSON.stringify(selector)} — ${parsed.message}`);
      entry = { ast: parsed.ast, tag: leadingTag(parsed.ast) };
      compiled.set(selector, entry);
    }
    return { ast: entry.ast, list: entry.tag === null ? nodes : (byTag.get(entry.tag) ?? []) };
  };
  return {
    querySelectorAll(selector) {
      const { ast, list } = candidates(selector);
      const found: ElementPort[] = [];
      for (const node of list) {
        const port = portFor(node);
        if (matches(port, ast)) found.push(port);
      }
      return found;
    },
    querySelector(selector) {
      const { ast, list } = candidates(selector);
      for (const node of list) {
        const port = portFor(node);
        if (matches(port, ast)) return port;
      }
      return null;
    },
  };
}
