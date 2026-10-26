import type MiniSearch from "minisearch";
import type { SearchOptions } from "minisearch";
import { SEARCH_INDEX_PATH, type SearchSection } from "./types";

// MAX_RESULTS limits how many results one query returns.
const MAX_RESULTS = 20;

// EXACT_MATCH_BOOST multiplies the score of sections whose title or VT
// sequence matches the whole query, e.g. typing a full config key.
const EXACT_MATCH_BOOST = 10;

// INDEXED_FIELDS are the section fields MiniSearch tokenizes. breadcrumbPath
// is derived from breadcrumb so the docs location is searchable too.
const INDEXED_FIELDS = ["title", "keywords", "breadcrumbPath", "text"];

// FIELD_BOOSTS weight matches by where they occur; unlisted fields weigh 1.
const FIELD_BOOSTS = { title: 4, keywords: 3, breadcrumbPath: 1.5 };

// SearchResult is a matched section plus the indexed terms it matched on.
export type SearchResult = SearchSection & { terms: string[] };

// DocsSearchEngine wraps MiniSearch with the docs index and ranking rules.
export class DocsSearchEngine {
  // loading caches the in-flight or finished load so it happens once per page.
  private static loading: Promise<DocsSearchEngine> | null = null;

  private constructor(
    private readonly index: MiniSearch<SearchSection>,
    private readonly sections: Map<string, SearchSection>,
  ) {}

  // load fetches the static index and MiniSearch on first use and builds the engine.
  static load(): Promise<DocsSearchEngine> {
    if (!DocsSearchEngine.loading) {
      DocsSearchEngine.loading = DocsSearchEngine.create().catch((err) => {
        // Allow a retry on the next call instead of caching the failure.
        DocsSearchEngine.loading = null;
        throw err;
      });
    }
    return DocsSearchEngine.loading;
  }

  // create downloads the index and the MiniSearch module in parallel.
  private static async create(): Promise<DocsSearchEngine> {
    const [{ default: MiniSearchEngine }, sections] = await Promise.all([
      import("minisearch"),
      fetchSections(),
    ]);
    const index = new MiniSearchEngine<SearchSection>({
      fields: INDEXED_FIELDS,
      extractField: (section, field) =>
        field === "breadcrumbPath"
          ? section.breadcrumb.join(" ")
          : String(section[field as keyof SearchSection] ?? ""),
    });
    index.addAll(sections);
    return new DocsSearchEngine(
      index,
      new Map(sections.map((section) => [section.id, section])),
    );
  }

  // search returns the best sections for a query. Results must match every
  // term; if nothing does, it falls back to matching any term.
  search(query: string): SearchResult[] {
    if (!query.trim()) {
      return [];
    }
    const options = this.searchOptions(query);
    let hits = this.index.search(query, { ...options, combineWith: "AND" });
    if (hits.length === 0) {
      hits = this.index.search(query, { ...options, combineWith: "OR" });
    }
    return hits.slice(0, MAX_RESULTS).flatMap((hit) => {
      const section = this.sections.get(String(hit.id));
      return section ? [{ ...section, terms: hit.terms }] : [];
    });
  }

  // searchOptions builds the MiniSearch ranking options for one query.
  private searchOptions(query: string): SearchOptions {
    const identifier = normalizeIdentifier(query);
    const sequence = normalizeSequence(query);
    return {
      prefix: true,
      // Short terms like "csi" would fuzzy-match too many unrelated words.
      fuzzy: (term) => (term.length > 4 ? 0.2 : false),
      boost: FIELD_BOOSTS,
      boostDocument: (id) => {
        const section = this.sections.get(String(id));
        const isExact =
          section !== undefined &&
          (normalizeIdentifier(section.title) === identifier ||
            (section.keywords !== "" &&
              normalizeSequence(section.keywords) === sequence));
        return isExact ? EXACT_MATCH_BOOST : 1;
      },
    };
  }
}

// fetchSections downloads the static search index.
async function fetchSections(): Promise<SearchSection[]> {
  const res = await fetch(SEARCH_INDEX_PATH);
  if (!res.ok) {
    throw new Error(`Failed to load search index: ${res.status}`);
  }
  return res.json();
}

// normalizeIdentifier makes "font family", "font-family" and "font_family" compare equal.
function normalizeIdentifier(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "-");
}

// normalizeSequence reduces a VT sequence to its fixed bytes, dropping
// parameter placeholders, so "CSI H" matches "CSI Py ; Px H".
function normalizeSequence(text: string): string {
  return text
    .replace(/\bP[a-z]\b/g, "")
    .replace(/[\s;]+/g, "")
    .toLowerCase();
}
