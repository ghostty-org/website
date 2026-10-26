import matter from "gray-matter";
import type { NavTreeNode } from "@/components/nav-tree";
import { DOCS_PAGES_ROOT_PATH } from "@/lib/docs/config";
import {
  createHeadingIdResolver,
  headingText,
} from "@/lib/docs/heading-ids.mjs";
import { parseMdx } from "@/lib/docs/mdx";
import {
  loadDocsNavTreeData,
  navTreeToBreadcrumbs,
} from "@/lib/docs/navigation";
import { loadAllDocsPageSlugs, resolveDocsPageFilePath } from "@/lib/docs/page";
import type { SearchSection, SearchSectionKind } from "./types";

// MAX_SECTION_TEXT_LENGTH caps indexed text per section to keep the index small.
const MAX_SECTION_TEXT_LENGTH = 4000;

// SKIPPED_NODE_TYPES are MDX nodes whose contents are code, not readable prose.
const SKIPPED_NODE_TYPES = new Set([
  "mdxjsEsm",
  "mdxFlowExpression",
  "mdxTextExpression",
]);

// MdxNode is the structural subset of mdast and MDX JSX nodes the indexer reads.
type MdxNode = {
  type: string;
  value?: unknown;
  depth?: number;
  name?: string | null;
  attributes?: Array<{ name?: string; value?: unknown }>;
  children?: MdxNode[];
};

// DocsPageSource is the raw input needed to index one docs page.
type DocsPageSource = {
  slug: string;
  url: string;
  title: string;
  breadcrumb: string[];
  content: string;
};

// HeadingChunk is a heading (or the page intro, when null) plus the nodes under it.
type HeadingChunk = {
  heading: MdxNode | null;
  nodes: MdxNode[];
};

// buildDocsSearchIndex reads every docs page and splits it into heading-level sections.
export async function buildDocsSearchIndex(
  docsDirectory: string,
): Promise<SearchSection[]> {
  const navTree = await loadDocsNavTreeData(docsDirectory, "");
  const slugs = (await loadAllDocsPageSlugs(docsDirectory)).sort();
  const pages = await Promise.all(
    slugs.map((slug) => loadDocsPageSource(docsDirectory, navTree, slug)),
  );
  return pages.flatMap(pageToSections);
}

// loadDocsPageSource reads one page's frontmatter, body, and nav location.
async function loadDocsPageSource(
  docsDirectory: string,
  navTree: NavTreeNode[],
  slug: string,
): Promise<DocsPageSource> {
  const { data, content } = matter.read(
    await resolveDocsPageFilePath(docsDirectory, slug),
  );
  const title = String(data.title ?? slug);
  const breadcrumb = navTreeToBreadcrumbs(
    "Ghostty Docs",
    DOCS_PAGES_ROOT_PATH,
    navTree,
    slug,
  )
    .slice(1)
    .map((crumb) => crumb.text);

  return {
    slug,
    url:
      slug === "index"
        ? DOCS_PAGES_ROOT_PATH
        : `${DOCS_PAGES_ROOT_PATH}/${slug}`,
    title,
    breadcrumb: breadcrumb.length > 0 ? breadcrumb : [title],
    content,
  };
}

// pageToSections turns one page into a page-intro section plus one section per heading.
function pageToSections(page: DocsPageSource): SearchSection[] {
  const tree = parseMdx(page.content) as MdxNode;
  const resolveHeadingId = createHeadingIdResolver();

  const sections = chunkByHeading(tree).map(({ heading, nodes }) => {
    const title = heading ? headingText(heading) : page.title;
    return {
      id: heading ? `${page.url}#${resolveHeadingId(title).id}` : page.url,
      kind: sectionKind(page.slug, heading, tree),
      title,
      breadcrumb: page.breadcrumb,
      keywords: nodes.flatMap(extractVTSequences).join(" "),
      text: normalizeWhitespace(nodes.map(extractText).join(" ")).slice(
        0,
        MAX_SECTION_TEXT_LENGTH,
      ),
    };
  });

  return inheritSharedDescriptions(sections);
}

// chunkByHeading splits a page's top-level nodes at every non-empty heading.
// The first chunk is the page intro and has no heading.
function chunkByHeading(tree: MdxNode): HeadingChunk[] {
  const chunks: HeadingChunk[] = [{ heading: null, nodes: [] }];
  for (const node of tree.children ?? []) {
    if (node.type === "heading" && (node.children?.length ?? 0) > 0) {
      chunks.push({ heading: node, nodes: [] });
    } else {
      chunks[chunks.length - 1].nodes.push(node);
    }
  }
  return chunks;
}

// sectionKind classifies a section by the page it is on and its heading level.
function sectionKind(
  slug: string,
  heading: MdxNode | null,
  tree: MdxNode,
): SearchSectionKind {
  if (!heading) {
    return slug.startsWith("vt/") && extractVTSequences(tree).length > 0
      ? "vt-sequence"
      : "page";
  }
  if (heading.depth === 2 && slug === "config/reference") {
    return "config-option";
  }
  if (heading.depth === 2 && slug === "config/keybind/reference") {
    return "keybind-action";
  }
  return "section";
}

// inheritSharedDescriptions fills empty sections from the section that follows.
// Generated references list related headings back to back with one shared
// description under the last one (e.g. `font-family`, `font-family-bold`).
function inheritSharedDescriptions(sections: SearchSection[]): SearchSection[] {
  for (let i = sections.length - 2; i >= 1; i--) {
    if (!sections[i].text && sections[i].kind === sections[i + 1].kind) {
      sections[i].text = sections[i + 1].text;
    }
  }
  return sections;
}

// extractText returns the readable text of a node, including code and JSX children.
function extractText(node: MdxNode): string {
  if (SKIPPED_NODE_TYPES.has(node.type)) {
    return "";
  }
  if (typeof node.value === "string") {
    return node.value;
  }
  return (node.children ?? []).map(extractText).join(" ");
}

// extractVTSequences returns the parts of every VTSequence element in a node,
// e.g. `<VTSequence sequence={["CSI", "Py", ";", "Px", "H"]} />` becomes "CSI Py ; Px H".
function extractVTSequences(node: MdxNode): string[] {
  const nested = (node.children ?? []).flatMap(extractVTSequences);
  if (node.name !== "VTSequence") {
    return nested;
  }
  const attribute = node.attributes?.find((attr) => attr.name === "sequence");
  // The attribute is either a plain string or a JS expression like `["CSI", "H"]`.
  const raw =
    typeof attribute?.value === "string"
      ? attribute.value
      : (attribute?.value as { value?: unknown } | undefined)?.value;
  if (typeof raw !== "string") {
    return nested;
  }
  const parts = Array.from(raw.matchAll(/"([^"]*)"/g), (match) => match[1]);
  return [(parts.length > 0 ? parts : [raw]).join(" "), ...nested];
}

// normalizeWhitespace collapses runs of whitespace into single spaces.
function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
