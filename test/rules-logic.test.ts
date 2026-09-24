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
  const { match } = await import("../packages/rules/logic/meta/robots-value.ts");
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

// --- fixable(): the autofix runs only where removal is inert -----------------

/** fixable() of `ruleId` on the first element matching `selector` in `html`. */
const fixableOn = async (ruleId: string, html: string, selector: string): Promise<boolean> => {
  const { fixable } = (await import(`../packages/rules/logic/${ruleId}.ts`)) as {
    fixable: (element: ElementPort) => boolean;
  };
  return fixable(portOf(html, selector));
};

test("script-event-for: fixable unless the pair keeps the script from running", async () => {
  const on = (attrs: string) => fixableOn("attr/script-event-for", `<script ${attrs}></script>`, "script");
  assert.equal(await on('event="onclick"'), true);
  assert.equal(await on('for="button"'), true);
  assert.equal(await on('for=" Window " event="onload()"'), true);
  assert.equal(await on('for="WINDOW" event="\tOnLoad "'), true);
  assert.equal(await on('for="window" event="onclick"'), false);
  assert.equal(await on('for="button" event="onload"'), false);
  assert.equal(await on('for="window" event="onload();"'), false);
  // The for/event step applies to classic scripts only.
  assert.equal(await on('type="module" for="button" event="onclick"'), true);
  assert.equal(await on('type="application/json" for="button" event="onclick"'), true);
});

test("script-language: fixable when type overrides it or it already names JavaScript", async () => {
  const on = (attrs: string) => fixableOn("attr/script-language", `<script ${attrs}></script>`, "script");
  assert.equal(await on('language="javascript"'), true);
  assert.equal(await on('language="JavaScript1.2"'), true);
  assert.equal(await on('language=""'), true);
  assert.equal(await on('type="module" language="vbscript"'), true);
  assert.equal(await on('type="" language="vbscript"'), true);
  assert.equal(await on('language="vbscript"'), false);
  // Not stripped: "text/ javascript" is no essence match, so the block is inert today.
  assert.equal(await on('language=" javascript"'), false);
});

test("script-charset: fixable unless it decodes an external classic script", async () => {
  const on = (attrs: string) => fixableOn("attr/script-charset", `<script charset="iso-8859-1" ${attrs}></script>`, "script");
  assert.equal(await on(""), true);
  assert.equal(await on('type="module" src="a.js"'), true);
  assert.equal(await on('type="application/json" src="a.json"'), true);
  assert.equal(await on('language="vbscript" src="a.vbs"'), true);
  assert.equal(await on('src="a.js"'), false);
  assert.equal(await on('type=" TEXT/JavaScript " src="a.js"'), false);
  assert.equal(await on('type="" src="a.js"'), false);
});

test("name-obsolete: fixable on option, and on an a whose id is its name", async () => {
  const on = (html: string, tag: string) => fixableOn("attr/name-obsolete", html, tag);
  assert.equal(await on('<select><option name="red">Red</option></select>', "option"), true);
  assert.equal(await on('<a href="#x" name="x">x</a>', "a"), false);
  // The id step of the fragment lookup runs before the name fallback.
  assert.equal(await on('<a href="#x" id="x" name="x">x</a>', "a"), true);
  assert.equal(await on('<a href="#x" id="y" name="x">x</a>', "a"), false);
  assert.equal(await on('<a href="#x" id="X" name="x">x</a>', "a"), false);
  assert.equal(await on('<embed src="c.mp4" name="c">', "embed"), false);
  assert.equal(await on('<img src="c.png" alt="" name="c">', "img"), false);
});

test("navigation-keywords: fixable unless rel holds previous", async () => {
  const on = (rel: string) => fixableOn("link/navigation-keywords", `<link rel="${rel}" href="/">`, "link");
  assert.equal(await on("archives"), true);
  assert.equal(await on("alternate first"), true);
  assert.equal(await on("self edituri"), true);
  assert.equal(await on("previous"), false);
  assert.equal(await on("archives PREVIOUS"), false);
  assert.equal(await on("index\tPrevious"), false);
});

test("vendor-keywords: fixable unless rel holds edituri", async () => {
  const on = (rel: string) => fixableOn("link/vendor-keywords", `<link rel="${rel}" href="/">`, "link");
  assert.equal(await on("pavatar"), true);
  assert.equal(await on("alternate publisher"), true);
  assert.equal(await on("self previous"), true);
  assert.equal(await on("EditURI"), false);
  assert.equal(await on("p3pv1 edituri"), false);
  assert.equal(await on("fluid-icon\nEDITURI"), false);
});

test("document-info-keywords: fixable unless rel holds self", async () => {
  const on = (rel: string) => fixableOn("link/document-info-keywords", `<link rel="${rel}" href="/">`, "link");
  assert.equal(await on("logo"), true);
  assert.equal(await on("alternate translation"), true);
  assert.equal(await on("edituri previous"), true);
  assert.equal(await on("self"), false);
  assert.equal(await on("hub\tSELF"), false);
  assert.equal(await on("profile self"), false);
});

test("obsolete-name: fixable unless the name is verify-v1", async () => {
  const on = (name: string) => fixableOn("meta/obsolete-name", `<meta name="${name}" content="x">`, "meta");
  assert.equal(await on("subject"), true);
  assert.equal(await on("ICBM"), true);
  assert.equal(await on("verify-v1"), false);
  assert.equal(await on("Verify-V1"), false);
});

test("apple-mobile-web-app-status-bar-style: fixable only for default or a missing content", async () => {
  const on = (attrs: string) =>
    fixableOn("meta/apple-mobile-web-app-status-bar-style", `<meta name="apple-mobile-web-app-status-bar-style"${attrs}>`, "meta");
  assert.equal(await on(""), true);
  assert.equal(await on(' content="default"'), true);
  assert.equal(await on(' content=" Default "'), true);
  assert.equal(await on(' content="black"'), false);
  assert.equal(await on(' content="black-translucent"'), false);
  assert.equal(await on(' content=""'), false);
});
