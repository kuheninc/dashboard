/**
 * Capitalise the first letter of each word in a name.
 * e.g. "john doe" → "John Doe", "mary ann lee" → "Mary Ann Lee"
 */
export function titleCaseName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}
