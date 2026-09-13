import type { CheckFn } from "../../types.ts";

/**
 * No selector can count, which is what makes this a document rule.
 *
 * Every canonical is reported once there are two, not only the "extra" one:
 * Google ignores all of them, and which one should survive is the author's
 * call. Identical duplicates count too — the problem is the number of
 * declarations, not whether they disagree — and so does a canonical in
 * `<body>`, which Google would not accept on its own but is still a second
 * declaration in the markup.
 */
export const check: CheckFn = (doc, ctx) => {
  const canonicals = doc.querySelectorAll('link[rel~="canonical" i]');
  if (canonicals.length < 2) return [];
  return canonicals.map((element) =>
    ctx.report(element, { detail: `${canonicals.length} canonical links on this page` }),
  );
};
