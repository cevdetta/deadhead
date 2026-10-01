import assert from "node:assert/strict";
import test from "node:test";

import { bump, parseNameStatus } from "../scripts/release.ts";

test("bump follows semver", () => {
  assert.equal(bump("0.1.0", "patch"), "0.1.1");
  assert.equal(bump("0.1.9", "minor"), "0.2.0");
  assert.equal(bump("0.9.3", "major"), "1.0.0");
});

test("rule changes come from git's name-status for content/rules", () => {
  const out = "A\tcontent/rules/meta/new.md\nD\tcontent/rules/meta/gone.md\nR100\tcontent/rules/attr/a-obsolete.md\tcontent/rules/attr/a.md\nM\tcontent/rules/meta/x.md\n";
  assert.deepEqual(parseNameStatus(out), { added: ["meta/new"], removed: ["meta/gone"], renamed: [["attr/a-obsolete", "attr/a"]] });
});
