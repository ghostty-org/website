import type { MetadataRoute } from "next";
import { IS_PRODUCTION_DEPLOYMENT, SITE_URL } from "@/lib/site";

// robots emits `/robots.txt`.
//
// Without this file the site answers 404 for `/robots.txt`, which crawlers
// tolerate but which also means there is nowhere to advertise the sitemap.
// Production allows everything and points at the sitemap; anything else
// disallows everything, so that a preview deployment's `*.vercel.app` URL
// cannot be indexed and compete with ghostty.org for the same content. That
// matches the `X-Robots-Tag: noindex` header already set for non-production
// builds in `next.config.mjs`.
export default function robots(): MetadataRoute.Robots {
  if (!IS_PRODUCTION_DEPLOYMENT) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
