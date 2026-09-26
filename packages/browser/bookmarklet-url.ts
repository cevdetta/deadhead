/**
 * The `javascript:` URL wrapping the built bookmarklet. Kept import-free on
 * purpose: the install page computes the drag-to-bookmarks link from this at
 * site build time, and any import here would ride into the site's graph.
 */

/** Firefox and Safari cap a `javascript:` URL at this many bytes. */
export const MAX_URL_BYTES = 65_536;

/** A javascript: URL escaping only what a bookmark would mangle, not all of encodeURIComponent's set. */
export const bookmarkletUrl = (bundle: string): string =>
  `javascript:${bundle.replace(/[%#\r\n\t ]/g, (c) => encodeURIComponent(c))}`;
