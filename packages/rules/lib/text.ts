/** ASCII whitespace, as the HTML Standard defines it: not `String#trim`, which also strips Unicode spaces. */
export const stripAsciiWhitespace = (value: string): string =>
  value.replace(/^[\t\n\f\r ]+/, "").replace(/[\t\n\f\r ]+$/, "");

/** ASCII lowercase, as "ASCII case-insensitive" compares: not `String#toLowerCase`, which folds non-ASCII letters too. */
export const asciiLowercase = (value: string): string =>
  value.replace(/[A-Z]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 32));
