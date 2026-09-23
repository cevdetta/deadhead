/** ASCII whitespace, as the HTML Standard defines it: not `String#trim`, which also strips Unicode spaces. */
export const stripAsciiWhitespace = (value: string): string =>
  value.replace(/^[\t\n\f\r ]+/, "").replace(/[\t\n\f\r ]+$/, "");
