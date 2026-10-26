import matter from "gray-matter";
import { promises as fs } from "node:fs";
import { createElement, type ComponentType, type ReactNode } from "react";
import type { Heading } from "mdast";
import { visit } from "unist-util-visit";
import { createHeadingIdResolver, headingText } from "./heading-ids.mjs";
import { parseMdx } from "./mdx";

const nodePath = require("node:path");

// MDX_EXTENSION is the file extension used for docs page source files.
const MDX_EXTENSION = ".mdx";

export type PageHeader = {
  id: string;
  title: string;
  depth: number;
};

export interface DocsPageData {
  slug: string;
  title: string;
  description: string;
  // There are scenarios in which the GitHub link should
  // not be the website source MDX file, due to the MDX being
  // generated from some upstream source. This is an optional
  // frontmatter that can override the link.
  editOnGithubLink: string | null;
  hideSidecar: boolean;
  content: ReactNode;
  relativeFilePath: string;
  pageHeaders: PageHeader[];
}

// loadDocsPage loads docs page data for a slug, checking direct and index MDX paths.
export async function loadDocsPage(
  docsDirectory: string,
  slug: string,
): Promise<DocsPageData> {
  return await loadDocsPageFromRelativeFilePath(
    await resolveDocsPageFilePath(docsDirectory, slug),
  );
}

// resolveDocsPageFilePath returns the MDX file path that backs a docs slug.
// A file with a given slug can be located in one of two places, and the
// non-index path wins: `/docs/foo.mdx` is tried before `/docs/foo/index.mdx`.
// When neither exists, the index path is returned so reading it fails with ENOENT.
export async function resolveDocsPageFilePath(
  docsDirectory: string,
  slug: string,
): Promise<string> {
  const directPath = nodePath.join(docsDirectory, slug + MDX_EXTENSION);
  try {
    await fs.access(directPath);
    return directPath;
  } catch (err) {
    if (!isErrorWithCode(err) || err.code !== "ENOENT") {
      throw err;
    }
  }
  return nodePath.join(docsDirectory, slug, `index${MDX_EXTENSION}`);
}

// loadDocsPageFromRelativeFilePath compiles one MDX file and extracts docs metadata.
async function loadDocsPageFromRelativeFilePath(
  relativeFilePath: string,
): Promise<DocsPageData> {
  const mdxFileContent = matter.read(relativeFilePath);
  const slug = slugFromRelativeFilePath(relativeFilePath);
  const pageHeaders = extractPageHeaders(mdxFileContent.content);
  const MdxContent = await loadMdxComponent(relativeFilePath);
  return {
    slug,
    relativeFilePath,
    title: mdxFileContent.data.title,
    description: mdxFileContent.data.description,
    editOnGithubLink: mdxFileContent.data.editOnGithubLink
      ? mdxFileContent.data.editOnGithubLink
      : null,
    hideSidecar: Object.hasOwn(mdxFileContent.data, "hideSidecar")
      ? mdxFileContent.data.hideSidecar
      : false,
    content: createElement(MdxContent),
    pageHeaders,
  };
}

// MdxModule is the expected shape of an imported MDX module.
type MdxModule = {
  default: ComponentType;
};

// loadMdxComponent loads the statically-compiled MDX React component for one docs file.
async function loadMdxComponent(
  relativeFilePath: string,
): Promise<ComponentType> {
  const normalizedRelativePath = relativeFilePath
    .replaceAll(nodePath.sep, "/")
    .replace(/^\.\//, "");
  const docsRelativePath = normalizedRelativePath.replace(/^docs\//, "");
  const importPath = `../../../docs/${docsRelativePath}`;
  const mdxModule = (await import(importPath)) as MdxModule;
  return mdxModule.default;
}

// extractPageHeaders parses MDX source and returns stable heading metadata.
// IDs come from the same resolver used by remark-heading-ids.mjs at render
// time, so sidecar links always point at existing anchors.
function extractPageHeaders(source: string): PageHeader[] {
  const pageHeaders: PageHeader[] = [];
  const resolveHeadingId = createHeadingIdResolver();
  visit(parseMdx(source), "heading", (heading: Heading) => {
    if (heading.children.length === 0) {
      return;
    }
    const title = headingText(heading);
    pageHeaders.push({
      depth: heading.depth,
      id: resolveHeadingId(title).id,
      title,
    });
  });
  return pageHeaders;
}

// loadAllDocsPageSlugs recursively discovers docs MDX files and returns their slugs.
export async function loadAllDocsPageSlugs(
  docsDirectory: string,
): Promise<Array<string>> {
  const allPaths = (await collectAllFilesRecursively(docsDirectory)).filter(
    (path) => path.endsWith(MDX_EXTENSION),
  );
  const docsPageSlugs: Set<string> = new Set();
  for (let i = 0; i < allPaths.length; i++) {
    const path = allPaths[i];
    const relativeFilePath = nodePath.relative(docsDirectory, path);
    const slug = slugFromRelativeFilePath(relativeFilePath);
    if (docsPageSlugs.has(slug)) {
      throw new Error(
        `There is a conflict in generating the ${docsDirectory}/${slug} page.

It is likely that both of these files exist:
  - ${docsDirectory}/${slug}.mdx
  - ${docsDirectory}/${slug}/index.mdx
Both of these files resolve to the same URL, and will cause an issue.

To fix this error, delete one of these files.`,
      );
    }
    docsPageSlugs.add(slug);
  }
  return Array.from(docsPageSlugs);
}

// isErrorWithCode narrows unknown values to filesystem-like errors with a code field.
const isErrorWithCode = (err: unknown): err is Error & { code: unknown } => {
  return err instanceof Error && typeof err === "object" && "code" in err;
};

// slugFromRelativeFilePath maps a docs MDX file path into a route slug.
function slugFromRelativeFilePath(relativeFilePath: string): string {
  return (
    relativeFilePath
      // Strip the `.mdx` extension from the filename
      .replaceAll(MDX_EXTENSION, "")
      // Include support for index files (`/docs/topic/index.mdx` -> `topic`)
      .replaceAll(/\/index$/gi, "")
  );
}

// collectAllFilesRecursively returns every file under the given root directory.
async function collectAllFilesRecursively(root: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(root, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = nodePath.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectAllFilesRecursively(fullPath)));
      continue;
    }
    files.push(fullPath);
  }

  return files;
}
