import slugify from "slugify";

// headingText returns the plain text of a heading node from its literal children.
export function headingText(headingNode) {
  if (!Array.isArray(headingNode.children)) {
    return "";
  }
  return headingNode.children
    .map((child) => (typeof child.value === "string" ? child.value : ""))
    .join("");
}

// createHeadingIdResolver returns a function that maps heading text to a page-unique ID.
// Repeated headings get a numeric suffix, e.g. "foo", "foo-2", "foo-3".
// This must be shared by everything that links to headings (rendered
// pages, the sidecar, and the search index) so anchors stay in sync.
export function createHeadingIdResolver() {
  const encounteredIDs = new Map();

  return (text) => {
    const baseId = slugify(text.toLowerCase());
    const index = (encounteredIDs.get(baseId) || 0) + 1;
    encounteredIDs.set(baseId, index);
    return {
      id: index >= 2 ? `${baseId}-${index}` : baseId,
      index,
    };
  };
}
