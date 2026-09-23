import type { CollectionEntry } from "astro:content";
import { severityOrder } from "../vocabulary.ts";

type Rule = CollectionEntry<"rules">;

/** Worst first, then by id: the order every rule listing on the site uses. */
export const byWorstFirst = (a: Rule, b: Rule): number =>
  severityOrder[a.data.severity] - severityOrder[b.data.severity] ||
  a.data.ruleId.localeCompare(b.data.ruleId);

/**
 * Bucket rules under every key they carry: a rule with two tags lands in both
 * buckets. Keys come back alphabetical, each bucket worst-first.
 */
export function groupRules<K extends string>(
  rules: Rule[],
  keys: (rule: Rule) => readonly K[],
): Map<K, Rule[]> {
  const out = new Map<K, Rule[]>();
  for (const rule of rules) {
    for (const key of keys(rule)) {
      const bucket = out.get(key) ?? [];
      bucket.push(rule);
      out.set(key, bucket);
    }
  }
  for (const bucket of out.values()) bucket.sort(byWorstFirst);
  return new Map([...out].sort(([a], [b]) => a.localeCompare(b)));
}
