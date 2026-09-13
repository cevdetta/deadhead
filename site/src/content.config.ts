import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

import {
  DETECTABILITY,
  FIX_OP,
  IMPACTS,
  KIND,
  RULE_ID,
  SCOPE,
  SEVERITY,
  STANDARDS_BASIS,
  STATUS,
  TAGS,
} from "../../packages/core/vocabulary.ts";

/**
 * The site renders `content/rules/**\/*.md` — the same files the linter is
 * built from, read in place rather than copied. There is no second corpus to
 * keep in sync, and no build step between the markdown and the page: invariant
 * 1 of the project ("markdown is the only source of truth") applies to the
 * documentation site as much as to `rules.json`.
 *
 * The enums come from `packages/core/vocabulary.ts` for the same reason
 * `scripts/schema.ts` imports them. A site that accepted a `severity` the
 * engine rejects would publish a rule page for a rule that cannot run.
 */
const enumOf = <T extends string>(values: readonly T[]) =>
  z.enum(values as unknown as [T, ...T[]]);

const rules = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "../content/rules",
    // Ids are ruleIds, verbatim. Astro's default would slugify, which is
    // lossless for the ids we allow but would silently diverge the day one
    // is not — and the id is what `/rules/<ruleId>` is built from.
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),
  schema: z
    .object({
      ruleId: z.string().regex(RULE_ID),
      title: z.string().min(1),
      description: z.string().min(1),
      pubDate: z.coerce.date(),
      status: enumOf(STATUS),
      severity: enumOf(SEVERITY),
      standardsBasis: enumOf(STANDARDS_BASIS),
      detectability: enumOf(DETECTABILITY),
      kind: enumOf(KIND),
      scope: enumOf(SCOPE),
      selector: z.string().optional(),
      match: z.literal("logic").optional(),
      fix: z.object({
        op: enumOf(FIX_OP),
        attr: z.string().optional(),
        token: z.string().optional(),
      }),
      replacement: z.string().min(1),
      tags: z.array(enumOf(TAGS)).default([]),
      impacts: z.array(enumOf(IMPACTS)).default([]),
      related: z.array(z.string().regex(RULE_ID)).default([]),
    })
    .strict(),
});

export const collections = { rules };
