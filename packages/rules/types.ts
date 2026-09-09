/**
 * Re-export of the contracts rule logic is written against.
 *
 * The declarations live in `@deadhead/core`, which owns the port; this file
 * exists so a logic module imports from its own package and never reaches
 * across into core's internals. Both packages have zero runtime dependencies,
 * and these are type-only exports, so nothing is emitted either way.
 */

export type {
  CheckFn,
  DocumentPort,
  ElementPort,
  Finding,
  Loc,
  MatchFn,
  Range,
  RuleContext,
} from "../core/types.ts";
export type { Severity } from "../core/vocabulary.ts";
