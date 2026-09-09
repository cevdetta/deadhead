import assert from "node:assert/strict";
import test from "node:test";

import { type Region, walk } from "../packages/core/walker.ts";
import { parseHtml } from "../packages/cli/adapter.ts";

const visited = (html: string, options = {}): string[] => {
  const seen: string[] = [];
  walk(parseHtml(html).root, (element) => seen.push(element.tag), options);
  return seen;
};

const regions = (html: string): Record<string, Region> => {
  const out: Record<string, Region> = {};
  walk(parseHtml(html).root, (element, region) => {
    out[element.tag] ??= region;
  });
  return out;
};

test("the walk starts at <html> and covers both halves", () => {
  const seen = visited("<!doctype html><html><head><title>t</title></head><body><p>x</p></body></html>");
  assert.deepEqual(seen, ["html", "head", "title", "body", "p"]);
});

test("region tracks which half of the document a node is in", () => {
  const where = regions(
    "<!doctype html><html><head><title>t</title></head><body><p>x</p></body></html>",
  );
  assert.equal(where["html"], null, "<html> is in neither half");
  assert.equal(where["head"], "head");
  assert.equal(where["title"], "head");
  assert.equal(where["body"], "body");
  assert.equal(where["p"], "body");
});

test("visitBody: false stops at <body>, which is the scope performance lever", () => {
  const seen = visited(
    "<!doctype html><html><head><title>t</title></head><body><p>x</p></body></html>",
    { visitBody: false },
  );
  assert.deepEqual(seen, ["html", "head", "title"]);
});

test("descendants of opaque elements are content, not markup to lint", () => {
  for (const tag of ["pre", "code", "textarea", "samp", "kbd"]) {
    const seen = visited(
      `<!doctype html><html><head></head><body><${tag}><b>x</b></${tag}></body></html>`,
    );
    assert.ok(seen.includes(tag), `<${tag}> itself is still visited`);
    assert.ok(!seen.includes("b"), `contents of <${tag}> are skipped`);
  }
});

test("<template> is walked by default and skippable on request", () => {
  const html =
    "<!doctype html><html><head></head><body><template><span>x</span></template></body></html>";
  assert.ok(visited(html).includes("span"));
  const skipped = visited(html, { skipTemplates: true });
  assert.ok(!skipped.includes("template"));
  assert.ok(!skipped.includes("span"));
});

test("an empty document walks nothing rather than throwing", () => {
  assert.deepEqual(visited(""), ["html", "head", "body"], "parse5 implies the structure");
  const seen: string[] = [];
  walk(null, (element) => seen.push(element.tag));
  assert.deepEqual(seen, []);
});
