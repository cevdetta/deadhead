import type { MatchFn } from "../../types.ts";

/**
 * Any literal `<` counts. The sequences that break out of or overrun a script
 * element (`</script`, `<!--`, `<script`) all start with it, and a serializer
 * that passes one `<` through passes all of them. `>` and `&` are inert in
 * script data, and JSON reads `\u003c` as the same character, so escaping `<`
 * is the whole fix.
 *
 * No `JSON.parse`: a block already cut short by a `</script>` in a value is
 * `script/json-ld-syntax`'s finding, and this rule reports it too whenever the
 * truncated text still holds a `<`. The rule sees the serializer's output, not
 * the serializer, which is why its findings are "possible".
 */
export const match: MatchFn = (element) => element.text().includes("<");
