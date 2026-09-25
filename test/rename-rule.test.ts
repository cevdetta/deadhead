import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { renameRule } from "../scripts/rename-rule.ts";

test("renameRule moves every file and rewrites every reference", async () => {
  const root = await mkdtemp(join(tmpdir(), "dh-rename-"));
  try {
    await cp(new URL("fixtures-rename/", import.meta.url), root, { recursive: true });
    const changed = await renameRule(root, "attr/foo-obsolete", "attr/foo");
    assert.ok(changed.length > 0);
    const md = await readFile(join(root, "content/rules/attr/foo.md"), "utf8");
    assert.match(md, /^ruleId: "attr\/foo"$/m);
    await stat(join(root, "test/fixtures/attr/foo/invalid.html"));
    await stat(join(root, "packages/rules/logic/attr/foo.ts"));
    const other = await readFile(join(root, "content/rules/attr/bar.md"), "utf8");
    assert.match(other, /related: \["attr\/foo"\]/);
    // Verify logic module path was rewritten per R4
    assert.match(other, /packages\/rules\/logic\/attr\/foo\.ts/);
    // Verify that attr/foo-obsolete-extra is NOT changed
    assert.match(other, /attr\/foo-obsolete-extra/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
