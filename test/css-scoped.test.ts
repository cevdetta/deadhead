import assert from "node:assert/strict";
import test from "node:test";

import { scoped } from "../scripts/build-css.ts";

test("scope becomes the CSS ancestor", () => {
  assert.equal(scoped({ scope: "head", selector: "meta[charset]" }), "head meta[charset]");
  assert.equal(scoped({ scope: "body", selector: "font[color]" }), "body font[color]");
  assert.equal(scoped({ scope: "any", selector: "meta[charset]" }), "meta[charset]");
});

test("the scope prefix distributes over every comma branch", () => {
  assert.equal(
    scoped({ scope: "head", selector: "meta[name], meta[property]" }),
    "head meta[name],\nhead meta[property]",
  );
  assert.equal(
    scoped({ scope: "any", selector: "meta[name], meta[property]" }),
    "meta[name],\nmeta[property]",
  );
});

test("no branch emits empty", () => {
  for (const selector of ["meta[name], meta[property]", "link[rel~=icon]", "title"]) {
    for (const scope of ["head", "body", "any"] as const) {
      const branches = scoped({ scope, selector }).split(",\n");
      assert.equal(branches.length, selector.split(",").length, `${scope} ${selector}`);
      for (const branch of branches) {
        assert.ok(branch.trim().length > 0, `empty branch in ${scope} ${selector}`);
      }
    }
  }
});
