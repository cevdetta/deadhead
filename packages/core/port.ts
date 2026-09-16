/**
 * Shared port scaffolding for the three adapters.
 *
 * Only two things live here: the ones that already drifted once.
 *
 * - `withPortCache`: every adapter needs one port per node so `parent()` and
 *   `children()` hand back the same object. Written three times, it drifted.
 * - `makeDoctypePort`: every adapter lowercases the doctype name its own way.
 *   Written three times, linkedom's case leaked through once.
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

import type { DoctypePort, ElementPort, Loc, Range } from "./types.ts";

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
