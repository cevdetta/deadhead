import type { MatchFn } from "../../types.ts";
import { hasDirective } from "../../lib/csp.ts";

/**
 * The obsolete mixed-content directive, inside a meta policy. Only a directive
 * name counts: the first token of a `;` part, compared whole, so the string
 * inside a source value (a URL path, say) never matches. Its replacement,
 * `upgrade-insecure-requests`, is a separate directive the rule leaves alone.
 */
export const match: MatchFn = (element) => hasDirective(element, "block-all-mixed-content");
