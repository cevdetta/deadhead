import assert from "node:assert/strict";
import test from "node:test";

import { parseHtml } from "../packages/cli/adapter.ts";
import type { ElementPort, RuleContext } from "../packages/core/types.ts";

/** The first element matching `selector` in a parsed page. */
export const portOf = (html: string, selector: string): ElementPort => {
  const port = parseHtml(html).doc.querySelector(selector);
  assert.ok(port, `no element matches ${selector}`);
  return port;
};

/** Logic modules only read ctx.ruleId; report() is never called by match(). */
const ctx = { ruleId: "test", report: () => { throw new Error("unused"); } } as unknown as RuleContext;

const robots = async (content: string): Promise<boolean> => {
  const { match } = await import("../packages/rules/logic/meta/robots-directives.ts");
  return match(portOf(`<meta name="robots" content="${content}">`, "meta"), ctx);
};

test("robots: Google's spaced name: value form is valid", async () => {
  assert.equal(await robots("max-snippet: 50"), false);
  assert.equal(await robots("noindex, max-image-preview: large"), false);
  assert.equal(await robots("unavailable_after: 2026-09-21"), false);
  assert.equal(await robots("unavailable_after: 25 Jun 2010 15:00:00 PST"), false);
});

test("robots: RFC 822 and RFC 850 dates keep their comma", async () => {
  assert.equal(await robots("unavailable_after: Sat, 25 Jun 2010 15:00:00 GMT"), false);
  assert.equal(await robots("unavailable_after: Saturday, 25-Jun-10 15:00:00 GMT"), false);
  assert.equal(await robots("noindex, unavailable_after: Sat, 25 Jun 2010 15:00:00 GMT, nofollow"), false);
  // The date fold stops at the next known name, so a bad value after the date still trips.
  assert.equal(await robots("unavailable_after: Sat, 25 Jun 2010 15:00:00 GMT, max-snippet: lots"), true);
});

test("robots: unknown names and bad values still trip", async () => {
  assert.equal(await robots("noarchive"), true);
  assert.equal(await robots("max-snippet: lots"), true);
  assert.equal(await robots("max-snippet"), true);
  assert.equal(await robots("noindex nofollow"), false);
});
