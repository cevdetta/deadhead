/**
 * The closed vocabularies a rule is written against, and the metadata shape
 * they add up to.
 *
 * This lives in core rather than in the build scripts because both sides need
 * it and they must not drift: `scripts/schema.ts` validates markdown against
 * these lists, and the engine dispatches on the values that survive. One list,
 * two readers.
 */

export const STATUS = ["avoid", "recommended", "situational"] as const;
export const SEVERITY = ["harmful", "deprecated", "unnecessary"] as const;
export const STANDARDS_BASIS = [
  "spec",
  "spec-obsolete",
  "browser-convention",
  "vendor",
  "community",
] as const;
export const DETECTABILITY = ["yes", "partial", "no"] as const;
export const KIND = ["element", "document"] as const;
export const SCOPE = ["head", "body", "any"] as const;
export const FIX_OP = ["remove-element", "remove-attribute", "none"] as const;
export const IMPACTS = [
  "performance",
  "interop",
  "a11y",
  "seo",
  "security",
  "maintainability",
] as const;

/**
 * Tags are for browsing the rule index, not for driving behaviour. Kept
 * deliberately coarse: a tag that applies to exactly one rule is a title, not
 * a tag.
 */
export const TAGS = [
  "a11y",
  "attr",
  "body",
  "charset",
  "favicon",
  "head",
  "i18n",
  "ie",
  "legacy",
  "link",
  "meta",
  "mobile",
  "performance",
  "script",
  "security",
  "seo",
  "social",
  "style",
  "title",
  "viewport",
] as const;

export type Status = (typeof STATUS)[number];
export type Severity = (typeof SEVERITY)[number];
export type StandardsBasis = (typeof STANDARDS_BASIS)[number];
export type Detectability = (typeof DETECTABILITY)[number];
export type Kind = (typeof KIND)[number];
export type Scope = (typeof SCOPE)[number];
export type FixOp = (typeof FIX_OP)[number];
export type Impact = (typeof IMPACTS)[number];
export type Tag = (typeof TAGS)[number];

/**
 * How bad is bad. `--fail-on` compares against this: a threshold of
 * `deprecated` also fails on `harmful`, because harmful is worse.
 */
export const SEVERITY_RANK: Readonly<Record<Severity, number>> = {
  harmful: 3,
  deprecated: 2,
  unnecessary: 1,
};

/**
 * One rule's metadata, exactly as it appears in `rules.json`. Optional
 * frontmatter fields are widened to `null`/`[]` by the build so consumers
 * never branch on key presence.
 */
export type RuleMeta = {
  ruleId: string;
  title: string;
  description: string;
  pubDate: string;
  status: Status;
  severity: Severity;
  standardsBasis: StandardsBasis;
  detectability: Detectability;
  kind: Kind;
  scope: Scope;
  selector: string | null;
  match: "logic" | null;
  /**
   * `attr` names the attribute a `remove-attribute` fix deletes, and is `null`
   * for every other op. Without it the op is not actionable: knowing a rule
   * removes *an* attribute says nothing about which one.
   */
  fix: { op: FixOp; attr: string | null };
  replacement: string;
  tags: Tag[];
  impacts: Impact[];
  related: string[];
};

/** Where a finding's explanation lives. */
export const ruleUrl = (ruleId: string): string => `https://deadhead.dev/rules/${ruleId}`;
