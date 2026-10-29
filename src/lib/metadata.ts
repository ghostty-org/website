import type { Metadata } from "next";

// SOCIAL_SHARE_CARD is the preview image every page shares.
const SOCIAL_SHARE_CARD = {
  url: "/social-share-card.jpg",
  width: 1800,
  height: 3200,
};

// OPEN_GRAPH_DEFAULTS are the Open Graph fields that are the same on every
// page.
//
// They live here rather than only in the root layout because Next.js does not
// deep-merge `openGraph`: a segment that declares one replaces its parent's
// entirely rather than adding to it. Every page has to declare `openGraph` in
// order to state its own `url`, so every page also has to restate these, and a
// page that forgot would quietly lose its preview image.
const OPEN_GRAPH_DEFAULTS = {
  type: "website",
  siteName: "Ghostty",
  images: [SOCIAL_SHARE_CARD],
} as const satisfies Metadata["openGraph"];

// canonicalMetadata returns the metadata that only the page itself can supply:
// its canonical URL, as both `<link rel="canonical">` and `og:url`.
//
// Both are resolved against `metadataBase` from the root layout, so `path` is
// given site-relative -- "/docs/help/terminfo", not the full URL.
//
// Every route that renders a page is expected to spread this into its
// metadata. A page that does not gets no `og:url` and no canonical link at
// all, which is the right failure: a missing canonical URL leaves a crawler to
// work it out, whereas a wrong one actively tells it that this page is a
// duplicate of somewhere else.
export function canonicalMetadata(path: string): Metadata {
  return {
    alternates: { canonical: path },
    openGraph: { ...OPEN_GRAPH_DEFAULTS, url: path },
  };
}

// siteOpenGraph is the root layout's fallback Open Graph object. It names no
// `url`, because the only honest URL for "some page that did not say" is none.
export const siteOpenGraph: Metadata["openGraph"] = { ...OPEN_GRAPH_DEFAULTS };
