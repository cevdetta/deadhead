import assert from "node:assert/strict";
import test from "node:test";

import { classifyRaw, duplicateRanks, isBlocked, type RawFacts } from "../corpus/classify.ts";
import { parseList } from "../corpus/list.ts";
import { disallowsRoot, TOKEN } from "../corpus/robots.ts";
import { wilson } from "../corpus/stats.ts";

const round4 = ([lo, hi]: [number, number]): [number, number] => [Math.round(lo * 1e4) / 1e4, Math.round(hi * 1e4) / 1e4];

test("wilson: 95% intervals at the edges and for rare rates", () => {
  assert.deepEqual(round4(wilson(0, 100)), [0, 0.037]);
  assert.deepEqual(round4(wilson(100, 100)), [0.963, 1]);
  assert.deepEqual(round4(wilson(1, 1000)), [0.0002, 0.0056]);
  assert.deepEqual(round4(wilson(70, 7000)), [0.0079, 0.0126]);
  assert.deepEqual(wilson(0, 0), [0, 0]);
});

test("robots: the * group decides when no group names the token", () => {
  assert.equal(disallowsRoot("User-agent: *\nDisallow: /"), true);
  assert.equal(disallowsRoot("User-agent: *\nDisallow: /private"), false);
  assert.equal(disallowsRoot("User-agent: *\nDisallow:"), false);
  assert.equal(disallowsRoot("User-agent: *\r\nDisallow: /*\r\n"), true);
  assert.equal(disallowsRoot("# none\nUser-agent: *  # all\nDisallow: /  # everything"), true);
  assert.equal(disallowsRoot(""), false);
});

test("robots: a group naming the token wins over *", () => {
  assert.equal(disallowsRoot(`User-agent: *\nDisallow: /\n\nUser-agent: ${TOKEN}\nAllow: /`), false);
  assert.equal(disallowsRoot(`User-agent: *\nAllow: /\n\nUser-agent: DeadHead-Research\nDisallow: /`), true);
  assert.equal(disallowsRoot("User-agent: Googlebot\nDisallow: /\n\nUser-agent: *\nAllow: /"), false);
});

test("robots: an equal Allow beats Disallow, and agents in one group share its rules", () => {
  assert.equal(disallowsRoot("User-agent: *\nDisallow: /\nAllow: /"), false);
  assert.equal(disallowsRoot("User-agent: Googlebot\nUser-agent: *\nDisallow: /"), true);
});

const facts = (overrides: Partial<RawFacts>): RawFacts => ({
  robots: "allowed",
  error: null,
  status: 200,
  contentType: "text/html; charset=utf-8",
  bytes: 200_000,
  head: "<!doctype html><title>Home</title>",
  ...overrides,
});

test("classify: each outcome from its facts", () => {
  assert.equal(classifyRaw(facts({})), "linted");
  assert.equal(classifyRaw(facts({ robots: "disallowed" })), "skipped");
  assert.equal(classifyRaw(facts({ error: "dns", status: null })), "no-site");
  assert.equal(classifyRaw(facts({ error: "connect", status: null })), "no-site");
  assert.equal(classifyRaw(facts({ error: "tls", status: null })), "no-site");
  assert.equal(classifyRaw(facts({ error: "timeout", status: null })), "failed");
  assert.equal(classifyRaw(facts({ status: 503 })), "failed");
  assert.equal(classifyRaw(facts({ contentType: "application/json" })), "failed");
  assert.equal(classifyRaw(facts({ contentType: null })), "failed");
});

test("classify: both blocked thresholds", () => {
  assert.equal(isBlocked(9_999, "<html>"), true, "under 10 kB");
  assert.equal(isBlocked(50_000, "<title>Just a moment...</title>"), true, "challenge marker under 60 kB");
  assert.equal(isBlocked(50_000, "<title>Home</title>"), false);
  assert.equal(isBlocked(80_000, "<title>Just a moment...</title>"), false, "60 kB and up is a page that mentions it");
  assert.equal(classifyRaw(facts({ bytes: 4_000 })), "blocked");
});

test("classify: a final origin counts once, at the best rank", () => {
  const dup = duplicateRanks([
    { rank: 5, finalOrigin: "https://aws.amazon.com" },
    { rank: 2, finalOrigin: "https://aws.amazon.com" },
    { rank: 3, finalOrigin: null },
    { rank: 4, finalOrigin: null },
    { rank: 1, finalOrigin: "https://www.google.com" },
  ]);
  assert.deepEqual([...dup], [5]);
});

test("list: Tranco CSV rows, CRLF and blank lines tolerated", () => {
  assert.deepEqual(parseList("1,google.com\r\n2,cloudflare.com\r\n\r\n"), [
    { rank: 1, domain: "google.com" },
    { rank: 2, domain: "cloudflare.com" },
  ]);
  assert.deepEqual(parseList("rank,domain\nx,broken\n3,example.org"), [{ rank: 3, domain: "example.org" }]);
});
