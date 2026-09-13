import type {
  Detectability,
  FixOp,
  Impact,
  Kind,
  Scope,
  Severity,
  StandardsBasis,
  Status,
} from "../../packages/core/vocabulary.ts";

/**
 * Display strings for the closed vocabularies in `packages/core`.
 *
 * These live here, not in core, on purpose: core is loaded by the bookmarklet
 * and must stay free of anything only a web page needs. The enum *values* are
 * shared; the prose describing them is presentation.
 *
 * Each map is keyed by the union type, so adding a value to a vocabulary in
 * core turns into a type error here rather than an unlabelled badge.
 */

export const statusLabels: Record<Status, string> = {
  avoid: "Avoid",
  recommended: "Recommended",
  situational: "Situational",
};

export const severityLabels: Record<Severity, string> = {
  harmful: "Harmful",
  deprecated: "Deprecated",
  unnecessary: "Unnecessary",
};

export const severityBlurbs: Record<Severity, string> = {
  harmful: "Actively breaks something for users.",
  deprecated: "Formally obsolete, but inert.",
  unnecessary: "Works, but is dead weight.",
};

export const basisLabels: Record<StandardsBasis, string> = {
  spec: "Specified",
  "spec-obsolete": "Obsoleted by the spec",
  "browser-convention": "Browser convention",
  vendor: "Vendor documentation",
  community: "Community convention",
};

export const basisBlurbs: Record<StandardsBasis, string> = {
  spec: "The evidence is in a current standard.",
  "spec-obsolete": "A standard defined it, then removed it.",
  "browser-convention": "Every engine agrees, but nothing normative says so.",
  vendor: "One vendor's documentation is the source.",
  community: "Convention only. The evidence is thin, and says so.",
};

export const detectLabels: Record<Detectability, string> = {
  yes: "Yes",
  partial: "Partial",
  no: "No",
};

export const detectBlurbs: Record<Detectability, string> = {
  yes: "Matched exactly. Autofixable when the rule carries a fix.",
  partial: "Reported as possible, and never autofixed.",
  no: "Needs human review.",
};

export const kindLabels: Record<Kind, string> = {
  element: "Element",
  document: "Document",
};

export const scopeLabels: Record<Scope, string> = {
  head: "inside <head>",
  body: "inside <body>",
  any: "anywhere in the document",
};

export const fixLabels: Record<FixOp, string> = {
  "remove-element": "Removes the element",
  "remove-attribute": "Removes the attribute",
  "remove-token": "Removes the keyword",
  none: "None — reports only",
};

export const impactLabels: Record<Impact, string> = {
  performance: "Performance",
  interop: "Interoperability",
  a11y: "Accessibility",
  seo: "SEO",
  security: "Security",
  maintainability: "Maintainability",
};

/** Order rule listings by how bad the thing is, worst first. */
export const severityOrder: Record<Severity, number> = {
  harmful: 0,
  deprecated: 1,
  unnecessary: 2,
};

export const namespaceBlurbs: Record<string, string> = {
  attr: "Attributes that outlived what they configured.",
  head: "The shape of the head itself — order, position, what must come first.",
  link: "<link> relations that no longer have a reader.",
  meta: "<meta> names and pragmas.",
  script: "<script> attributes and their defaults.",
};

/** "a, b and c" — the facts table reads as prose, not as a CSV. */
export const toSentence = (parts: string[]): string =>
  parts.length < 2 ? (parts[0] ?? "") : `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`;
