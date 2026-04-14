export function normalizeFlavor(text: string): string {
  return text
    .replace(/\u00AD/g, '')              // soft hyphen
    .replace(/[\f\n\r\u00A0]/g, ' ')     // form feed, newlines, NBSP → space
    .replace(/\s+/g, ' ')                 // collapse whitespace
    .trim();
}
