import type { MetadataRoute } from "next";
import { DOCS_DIRECTORY, DOCS_PAGES_ROOT_PATH } from "@/lib/docs/config";
import { loadAllDocsPageSlugs } from "@/lib/docs/page";
import {
  type LastModifiedByPath,
  loadGitLastModified,
} from "@/lib/git-last-modified";
import { SITE_URL } from "@/lib/site";

// DOCS_INDEX_SLUG is the slug that `docs/index.mdx` resolves to. It is served
// at `/docs` rather than `/docs/index`, so it is handled separately from the
// nested pages, exactly as `generateStaticParams` does in the docs route.
const DOCS_INDEX_SLUG = "index";

// DOCS_REPOSITORY_PATH is `DOCS_DIRECTORY` as git spells it: repository
// relative, with no leading `./`.
const DOCS_REPOSITORY_PATH = DOCS_DIRECTORY.replace(/^\.\//, "");

// SitemapRoute is one page, the source it is built from, and how central it is
// to the site. `sourcePaths` are repository-relative files or directories; a
// route is dated from the most recent commit to touch any of them.
interface SitemapRoute {
  path: string;
  priority: number;
  sourcePaths: string[];
}

// STATIC_ROUTES are the pages that exist as their own route rather than as a
// docs MDX file. Add to this list whenever a top-level route is added under
// `src/app`; `/docs` itself comes from the docs loader below.
//
// These name the sources that carry the page's content, and deliberately not
// its stylesheets: `<lastmod>` is meant to report when what the page says
// changed, so restyling it should not claim that it did.
const STATIC_ROUTES: SitemapRoute[] = [
  {
    path: "/",
    priority: 1.0,
    sourcePaths: [
      "src/app/page.tsx",
      "src/app/HomeContent.tsx",
      "src/app/terminal-data.tsx",
    ],
  },
  {
    path: "/download",
    priority: 0.9,
    sourcePaths: ["src/app/download"],
  },
];

// LONG_TAIL_SLUG_PREFIXES are the docs subtrees that exist as exhaustive
// reference material rather than as pages a reader arrives at. The
// per-sequence VT pages and the per-release notes together are roughly half of
// every docs page, so without a hint they read as being as central as the
// install and help pages.
const LONG_TAIL_SLUG_PREFIXES = [
  "install/release-notes/",
  "vt/concepts/",
  "vt/control/",
  "vt/csi/",
  "vt/esc/",
  "vt/osc/",
];

// docsPriority ranks a docs page relative to the rest of this sitemap.
//
// Priority is a hint and nothing more: Google ignores it outright, and other
// consumers read it only as a statement of relative importance within a single
// sitemap. It is cheap to state correctly, so we state it.
function docsPriority(slug: string): number {
  const isLongTail = LONG_TAIL_SLUG_PREFIXES.some((prefix) =>
    slug.startsWith(prefix),
  );
  return isLongTail ? 0.5 : 0.8;
}

// docsSourcePaths returns the two places a docs slug's MDX file may live. Only
// one of them exists, and `loadDocsPage` resolves them in this same order.
function docsSourcePaths(slug: string): string[] {
  return [
    `${DOCS_REPOSITORY_PATH}/${slug}.mdx`,
    `${DOCS_REPOSITORY_PATH}/${slug}/index.mdx`,
  ];
}

// newestCommitDate returns the most recent commit date across the given source
// paths, or undefined if git knows nothing about any of them. A source path
// matches either a file exactly or every file beneath it as a directory.
function newestCommitDate(
  lastModifiedByPath: LastModifiedByPath,
  sourcePaths: string[],
): Date | undefined {
  let newest: Date | undefined;
  for (const [path, commitDate] of lastModifiedByPath) {
    const isMatch = sourcePaths.some(
      (sourcePath) => path === sourcePath || path.startsWith(`${sourcePath}/`),
    );
    if (!isMatch) continue;
    if (newest === undefined || commitDate > newest) newest = commitDate;
  }
  return newest;
}

// sitemap emits `/sitemap.xml`, listing the home page, the download page and
// every statically generated docs page.
//
// The docs pages are otherwise reachable only by following links out of a
// client-rendered navigation sidebar, which is the slowest and least reliable
// way for a crawler to find them. Enumerating them here is what makes a page
// such as `/docs/help/terminfo` discoverable directly, rather than only to a
// reader who already knows the docs tree well enough to navigate to it.
//
// Each entry is dated from git rather than from the filesystem, because a
// fresh CI checkout gives every file the same mtime. When git cannot answer --
// a shallow clone, a source tarball -- `lastModified` is left off entirely
// rather than guessed at; see `loadGitLastModified`.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModifiedByPath = loadGitLastModified();
  const docsPageSlugs = await loadAllDocsPageSlugs(DOCS_DIRECTORY);

  const docsRoutes: SitemapRoute[] = docsPageSlugs.map((slug) =>
    slug === DOCS_INDEX_SLUG
      ? {
          path: DOCS_PAGES_ROOT_PATH,
          priority: 0.9,
          sourcePaths: docsSourcePaths(slug),
        }
      : {
          path: `${DOCS_PAGES_ROOT_PATH}/${slug}`,
          priority: docsPriority(slug),
          sourcePaths: docsSourcePaths(slug),
        },
  );

  return [...STATIC_ROUTES, ...docsRoutes]
    .sort((a, b) => a.path.localeCompare(b.path))
    .map(({ path, priority, sourcePaths }) => ({
      url: new URL(path, SITE_URL).toString(),
      lastModified: newestCommitDate(lastModifiedByPath, sourcePaths),
      priority,
    }));
}
