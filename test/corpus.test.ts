import assert from "node:assert/strict";
import test from "node:test";

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
