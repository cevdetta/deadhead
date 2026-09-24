import type { MatchFn } from "../../types.ts";
import { hasDirective } from "../../lib/csp.ts";

/**
 * The deprecated CSP reporting directive, inside a meta policy. `report-to`
 * is its replacement and a distinct name, so only an exact directive name
 * counts, never a prefix.
 */
export const match: MatchFn = (element) => hasDirective(element, "report-uri");
