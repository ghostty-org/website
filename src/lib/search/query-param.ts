// SEARCH_QUERY_PARAM is the URL query parameter that holds the search query,
// e.g. `/docs?q=font-family` opens search prefilled.
export const SEARCH_QUERY_PARAM = "q";

// writeSearchQueryParam mirrors the query into the current URL, or removes it
// when empty. It uses replaceState so typing neither adds history entries nor
// triggers a Next.js navigation; the path and #anchor are preserved.
export function writeSearchQueryParam(query: string): void {
  const url = new URL(window.location.href);
  if ((url.searchParams.get(SEARCH_QUERY_PARAM) ?? "") === query) {
    return;
  }
  if (query) {
    url.searchParams.set(SEARCH_QUERY_PARAM, query);
  } else {
    url.searchParams.delete(SEARCH_QUERY_PARAM);
  }
  // Keep the existing history state, which Next.js uses for its router.
  window.history.replaceState(window.history.state, "", url);
}
