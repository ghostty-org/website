// SNIPPET_CONTEXT_BEFORE/AFTER control how much text surrounds the first match.
const SNIPPET_CONTEXT_BEFORE = 40;
const SNIPPET_CONTEXT_AFTER = 120;

// snippet returns the slice of text around the first matched term.
export function snippet(text: string, terms: string[]): string {
  const lowerText = text.toLowerCase();
  const positions = terms
    .map((term) => lowerText.indexOf(term.toLowerCase()))
    .filter((pos) => pos >= 0);
  const first = positions.length > 0 ? Math.min(...positions) : 0;
  const start = Math.max(0, first - SNIPPET_CONTEXT_BEFORE);
  const end = Math.min(text.length, first + SNIPPET_CONTEXT_AFTER);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return `${prefix}${text.slice(start, end)}${suffix}`;
}

// termsPattern returns a case-insensitive RegExp that captures any of the terms.
// Longest terms come first so "fonts" wins over "font" in the alternation.
export function termsPattern(terms: string[]): RegExp {
  const alternation = terms
    .slice()
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|");
  return new RegExp(`(${alternation})`, "gi");
}

// escapeRegExp escapes a string for literal use inside a RegExp.
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
