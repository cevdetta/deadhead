import assert from "node:assert/strict";
import test from "node:test";

import { bump, groupCommits, parseNameStatus, renderSection } from "../scripts/release.ts";

test("bump follows semver", () => {
  assert.equal(bump("0.1.0", "patch"), "0.1.1");
  assert.equal(bump("0.1.9", "minor"), "0.2.0");
  assert.equal(bump("0.9.3", "major"), "1.0.0");
});

test("rule changes come from git's name-status for content/rules", () => {
  const out = "A\tcontent/rules/meta/new.md\nD\tcontent/rules/meta/gone.md\nR100\tcontent/rules/attr/a-obsolete.md\tcontent/rules/attr/a.md\nM\tcontent/rules/meta/x.md\n";
  assert.deepEqual(parseNameStatus(out), { added: ["meta/new"], removed: ["meta/gone"], renamed: [["attr/a-obsolete", "attr/a"]] });
});


const SUBJECTS = [
  "feat(rule): meta/og-fb-pages (#411)",
  "fix(rule): meta/google-value reports the notranslate forms Chrome skips (#401)",
  "fix: lint partials and components for what they hold (#418)",
  "feat(cli)!: --fail-on defaults to deprecated (#420)",
  "perf(core): one dispatch table per run (#421)",
  "site: SEO gate, structured data (#416)",
  "chore(deps): bump parse5",
  "docs: changelog",
];

test("commits group by what they change for users; site, chore and docs stay out", () => {
  assert.deepEqual(groupCommits(SUBJECTS), {
    rules: [{ text: "meta/og-fb-pages", pr: "411" }],
    ruleFixes: [{ text: "meta/google-value reports the notranslate forms Chrome skips", pr: "401" }],
    features: [{ text: "**Breaking:** --fail-on defaults to deprecated", pr: "420" }],
    fixes: [{ text: "lint partials and components for what they hold", pr: "418" }],
    performance: [{ text: "one dispatch table per run", pr: "421" }],
  });
});

test("a section lists rule changes first, links PRs and the full diff", () => {
  const section = renderSection("0.2.0", "2026-10-15", "v0.1.0", groupCommits(SUBJECTS), {
    added: ["meta/og-fb-pages", "meta/new-without-pr"],
    removed: ["meta/gone"],
    renamed: [["attr/a-obsolete", "attr/a"]],
  });
  assert.equal(
    section,
    [
      "## 0.2.0 - 2026-10-15",
      "",
      "### New rules",
      "",
      "- `meta/og-fb-pages` ([#411](https://github.com/cevdetta/deadhead/pull/411))",
      "- `meta/new-without-pr`",
      "",
      "### Renamed",
      "",
      "- `attr/a-obsolete` → `attr/a`",
      "",
      "### Removed",
      "",
      "- `meta/gone`",
      "",
      "### Rule fixes",
      "",
      "- meta/google-value reports the notranslate forms Chrome skips ([#401](https://github.com/cevdetta/deadhead/pull/401))",
      "",
      "### Features",
      "",
      "- **Breaking:** --fail-on defaults to deprecated ([#420](https://github.com/cevdetta/deadhead/pull/420))",
      "",
      "### Fixes",
      "",
      "- lint partials and components for what they hold ([#418](https://github.com/cevdetta/deadhead/pull/418))",
      "",
      "### Performance",
      "",
      "- one dispatch table per run ([#421](https://github.com/cevdetta/deadhead/pull/421))",
      "",
      "[Full diff](https://github.com/cevdetta/deadhead/compare/v0.1.0...v0.2.0)",
      "",
    ].join("\n"),
  );
});
