// SITE_URL is the canonical origin that the production site is served from.
// Metadata, the sitemap and robots.txt all derive their absolute URLs from
// this one constant so that the three can never disagree about what the
// canonical host is.
export const SITE_URL = "https://ghostty.org";

// IS_PRODUCTION_DEPLOYMENT reports whether this build is the production
// deployment rather than a preview or a local `next dev`. Preview builds
// already serve `X-Robots-Tag: noindex` (see `next.config.mjs`); robots.txt
// mirrors that so that a preview deployment is neither crawled nor listed.
export const IS_PRODUCTION_DEPLOYMENT = process.env.VERCEL_ENV === "production";
