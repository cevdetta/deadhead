import type { MatchFn } from "../../types.ts";
import { directiveNames, isCspMeta } from "../../lib/csp.ts";

/** A meta policy that names the `reflected-xss` directive; `directiveNames` reads names, never values. */
export const match: MatchFn = (el) =>
  isCspMeta(el) && (el.attr("content") ?? "") !== "" && directiveNames(el.attr("content")!).includes("reflected-xss");
