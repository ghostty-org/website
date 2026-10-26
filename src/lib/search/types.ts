// SEARCH_INDEX_PATH is the URL of the statically generated docs search index.
export const SEARCH_INDEX_PATH = "/search-index.json";

// SearchSectionKind classifies a search result so the UI can label it.
export type SearchSectionKind =
  | "page"
  | "section"
  | "config-option"
  | "keybind-action"
  | "vt-sequence";

// SearchSection is one searchable unit: a page intro or the content under a heading.
export type SearchSection = {
  // id is the section URL, which is unique across the site.
  id: string;
  kind: SearchSectionKind;
  // title is the heading text, or the page title for a page intro.
  title: string;
  // breadcrumb is the human-readable location of the page in the docs nav.
  breadcrumb: string[];
  // keywords holds extra terms that are not visible as prose, e.g. VT sequences.
  keywords: string;
  text: string;
};
