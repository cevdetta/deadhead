import type { MatchFn } from "../../types.ts";
import { hasDirective } from "../../lib/csp.ts";

/** A meta policy that names the `reflected-xss` directive. */
export const match: MatchFn = (element) => hasDirective(element, "reflected-xss");
