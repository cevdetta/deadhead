import assert from "node:assert/strict";
import test from "node:test";

import {
  type Issue,
  splitFrontmatter,
  validateFrontmatter,
  validateProse,
} from "../scripts/schema.ts";

// --- frontmatter fence ------------------------------------------------------

test("splitFrontmatter separates the fence from the body", () => {
  const source = "---\nruleId: a/b\n---\nIntro.\n";
  const split = splitFrontmatter(source);
  assert.ok(split.ok);
  assert.equal(split.frontmatter, "ruleId: a/b\n");
  assert.equal(split.frontmatterStart, 4);
  assert.equal(split.body, "Intro.\n");
  assert.equal(source.slice(split.bodyStart), "Intro.\n");
});

test("splitFrontmatter tolerates a `---` inside the body", () => {
  const split = splitFrontmatter("---\nruleId: a/b\n---\nIntro.\n\n---\n\nMore.\n");
  assert.ok(split.ok);
  assert.equal(split.frontmatter, "ruleId: a/b\n");
  assert.match(split.body, /^Intro\./);
});

test("splitFrontmatter rejects a missing fence", () => {
  const split = splitFrontmatter("# Not a rule\n");
  assert.ok(!split.ok);
  assert.match(split.message, /must start with a `---`/);
});

test("splitFrontmatter rejects an unterminated fence", () => {
  const split = splitFrontmatter("---\nruleId: a/b\nstill frontmatter\n");
  assert.ok(!split.ok);
  assert.match(split.message, /never closed/);
});

// --- frontmatter ------------------------------------------------------------

const base = (): Record<string, unknown> => ({
  ruleId: "meta/example",
  title: "Example",
  description: "One-line summary.",
  pubDate: "2026-01-02",
  status: "avoid",
  severity: "unnecessary",
  standardsBasis: "spec",
  detectability: "yes",
  kind: "element",
  scope: "head",
  selector: "meta[name=example]",
  fix: { op: "remove-element" },
  replacement: "Delete it.",
});

const messages = (patch: Record<string, unknown>): string[] => {
  const result = validateFrontmatter({ ...base(), ...patch });
  return result.ok ? [] : result.issues.map((i) => i.message);
};

const paths = (patch: Record<string, unknown>): string[] => {
  const result = validateFrontmatter({ ...base(), ...patch });
  return result.ok ? [] : result.issues.map((i) => (i.kind === "field" ? i.path.join(".") : "prose"));
};

test("a minimal rule validates and optional fields widen to null/[]", () => {
  const result = validateFrontmatter(base());
  assert.ok(result.ok, JSON.stringify(messages({})));
  assert.equal(result.meta.match, null);
  assert.deepEqual(result.meta.tags, []);
  assert.deepEqual(result.meta.impacts, []);
  assert.deepEqual(result.meta.related, []);
  assert.deepEqual(result.meta.fix, { op: "remove-element", attr: null });
});

test("unknown frontmatter fields are rejected", () => {
  assert.match(messages({ sevrity: "harmful" }).join("\n"), /unknown frontmatter field `sevrity`/);
});

const ENUM_CASES: [string, Record<string, unknown>, string][] = [
  ["status", { status: "bad" }, "status"],
  ["severity", { severity: "warning" }, "severity"],
  ["standardsBasis", { standardsBasis: "blog" }, "standardsBasis"],
  ["detectability", { detectability: "maybe" }, "detectability"],
  ["kind", { kind: "attribute" }, "kind"],
  ["scope", { scope: "footer" }, "scope"],
  ["fix.op", { fix: { op: "rewrite" } }, "fix.op"],
  ["tags", { tags: ["head", "nonsense"] }, "tags.1"],
  ["impacts", { impacts: ["vibes"] }, "impacts.0"],
];

for (const [name, patch, path] of ENUM_CASES) {
  test(`unknown ${name} value is rejected and located`, () => {
    assert.match(messages(patch).join("\n"), /unknown value/);
    assert.ok(paths(patch).includes(path), `expected an issue at ${path}`);
  });
}

test("every required field is reported exactly once when absent", () => {
  const result = validateFrontmatter({});
  assert.ok(!result.ok);
  const required = result.issues.filter((i) => i.message === "is required");
  assert.equal(required.length, 12);
  // Absent fields must not also produce a "must be a string" from the same check.
  assert.equal(result.issues.filter((i) => i.message === "must be a string").length, 0);
});

test("ruleId must be lowercase namespace/name", () => {
  for (const ruleId of ["Meta/Example", "example", "meta/", "meta/a/b", "meta/-x"]) {
    assert.match(messages({ ruleId }).join("\n"), /not a valid ruleId/, ruleId);
  }
  assert.deepEqual(messages({ ruleId: "meta/http-equiv-x-ua-compatible" }), []);
});

test("pubDate must be a real ISO calendar date", () => {
  assert.match(messages({ pubDate: "12/07/2026" }).join("\n"), /not an ISO date/);
  assert.match(messages({ pubDate: "2026-02-30" }).join("\n"), /not a real calendar date/);
  assert.match(messages({ pubDate: "2026-13-01" }).join("\n"), /not a real calendar date/);
  assert.match(messages({ pubDate: 20260102 }).join("\n"), /quoted ISO date/);
});

test("an unsupported selector fails the rule, with the offset of the offending token", () => {
  const result = validateFrontmatter({ ...base(), selector: "head > meta" });
  assert.ok(!result.ok);
  const issue = result.issues.find((i) => i.kind === "field" && i.path[0] === "selector");
  assert.ok(issue);
  assert.match(issue.message, /unsupported selector at offset 5: combinators/);
});

test("kind: element needs a selector; kind: document needs logic", () => {
  const withoutSelector = base();
  delete withoutSelector["selector"];
  assert.match(
    messages({ ...withoutSelector, selector: undefined }).join("\n"),
    /required for `kind: "element"`/,
  );
  assert.match(
    messages({ ...withoutSelector, selector: undefined, kind: "document" }).join("\n"),
    /decided by code; set `match: "logic"`/,
  );
  const doc = validateFrontmatter({ ...withoutSelector, kind: "document", match: "logic" });
  assert.ok(doc.ok);
  assert.equal(doc.meta.selector, null);
});

test("remove-attribute must name the attribute it removes", () => {
  // The op alone is not actionable: knowing a rule removes *an* attribute says
  // nothing about which one, and the fixer would have to guess.
  assert.match(
    messages({ fix: { op: "remove-attribute" } }).join("\n"),
    /required for `remove-attribute`/,
  );
  assert.match(
    messages({ fix: { op: "remove-attribute", attr: "TYPE" } }).join("\n"),
    /required for `remove-attribute`/,
  );
  const ok = validateFrontmatter({ ...base(), fix: { op: "remove-attribute", attr: "type" } });
  assert.ok(ok.ok);
  assert.deepEqual(ok.meta.fix, { op: "remove-attribute", attr: "type" });
});

test("only remove-attribute takes an attr", () => {
  assert.match(
    messages({ fix: { op: "remove-element", attr: "type" } }).join("\n"),
    /only `remove-attribute` takes an `attr`/,
  );
  assert.match(
    messages({ fix: { op: "none", attr: "type" } }).join("\n"),
    /only `remove-attribute` takes an `attr`/,
  );
});

test("match only accepts \"logic\"", () => {
  assert.match(messages({ match: "regex" }).join("\n"), /only supported value is "logic"/);
});

test("related is checked for shape but not for existence", () => {
  assert.match(messages({ related: ["Meta/Nope"] }).join("\n"), /not a valid ruleId/);
  const result = validateFrontmatter({ ...base(), related: ["meta/does-not-exist-yet"] });
  assert.ok(result.ok);
  assert.deepEqual(result.meta.related, ["meta/does-not-exist-yet"]);
});

// --- prose ------------------------------------------------------------------

const body = ({
  intro = "What it is and where it came from.",
  why = "Why avoid",
  sections = ["Use instead", "Detectability", "Resources"],
  resources = ["- https://example.com/one\n", "- https://example.com/two\n"],
} = {}): string => {
  let out = intro === "" ? "" : `\n${intro}\n\n`;
  for (const heading of [why, ...sections]) {
    out += `## ${heading}\n\n`;
    out += heading === "Resources" ? resources.join("") : "Prose.\n";
    out += "\n";
  }
  return out;
};

const prose = (b: string, status: Parameters<typeof validateProse>[2] = "avoid"): string[] =>
  validateProse(b, 0, status).map((i: Issue) => i.message);

test("a well-formed rule doc has no prose issues", () => {
  assert.deepEqual(prose(body()), []);
});

test("the intro paragraph is required", () => {
  assert.match(prose(body({ intro: "" })).join("\n"), /needs an intro paragraph/);
});

test("status picks the Why heading", () => {
  assert.match(prose(body({ why: "Why use" })).join("\n"), /expected `## Why avoid`/);
  assert.match(
    prose(body({ why: "Why avoid" }), "recommended").join("\n"),
    /expected `## Why use`/,
  );
  // situational rules may frame it either way
  assert.deepEqual(prose(body({ why: "Why use" }), "situational"), []);
  assert.deepEqual(prose(body({ why: "Why avoid" }), "situational"), []);
});

test("sections must appear in order, with none missing or extra", () => {
  assert.match(
    prose(body({ sections: ["Detectability", "Use instead", "Resources"] })).join("\n"),
    /expected `## Use instead` here, found `## Detectability`/,
  );
  assert.match(
    prose(body({ sections: ["Use instead", "Resources"] })).join("\n"),
    /missing `## Resources` section/,
  );
  assert.match(
    prose(body({ sections: ["Use instead", "Detectability", "Resources", "Notes"] })).join("\n"),
    /unexpected `## Notes` section/,
  );
});

test("Resources needs at least two entries", () => {
  assert.match(
    prose(body({ resources: ["- https://example.com/only\n"] })).join("\n"),
    /at least two independent sources, found 1/,
  );
  assert.deepEqual(
    prose(body({ resources: ["1. https://example.com/one\n", "2. https://example.com/two\n"] })),
    [],
  );
  // A nested item is a detail of its parent, not a second source.
  assert.match(
    prose(body({ resources: ["- https://example.com/one\n", "    - a note about it\n"] })).join("\n"),
    /found 1/,
  );
});

test("headings inside fenced code blocks are not sections", () => {
  const withFence = body({ intro: "Intro.\n\n```html\n<!-- ## Resources -->\n```" });
  assert.deepEqual(prose(withFence), []);
});

test("prose offsets are absolute, so a caller can map them to file:line", () => {
  const issues = validateProse(body({ intro: "" }), 500, "avoid");
  assert.ok(issues.length > 0);
  const first = issues[0];
  assert.ok(first && first.kind === "prose");
  assert.equal(first.offset, 500);
});
