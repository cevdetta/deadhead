import type { FixableFn } from "../../types.ts";

/**
 * `a[name]` is the fallback in HTML "find a potential indicated element", and
 * `embed[name]` and `img[name]` are named elements for named access on
 * `Window` and `Document`. `option` is in none of those lists. An `a` whose
 * `id` is identical to its `name` is found by the `id` step, which runs before
 * the `name` fallback, and `a` is not a named element, so its `name` does
 * nothing either.
 * https://html.spec.whatwg.org/multipage/browsing-the-web.html#find-a-potential-indicated-element
 * https://html.spec.whatwg.org/multipage/nav-history-apis.html#named-access-on-the-window-object
 */
export const fixable: FixableFn = (element) =>
  element.tag === "option" || (element.tag === "a" && element.attr("id") === element.attr("name"));
