import Breadcrumbs, { Breadcrumb } from "@/components/breadcrumbs";
import CustomMDX from "@/components/custom-mdx";
import NavTree, { NavTreeNode } from "@/components/nav-tree";
import ScrollToTopButton from "@/components/scroll-to-top";
import Sidecar from "@/components/sidecar";
import { H1, P } from "@/components/text";
import NavFooterLayout from "@/layouts/nav-footer-layout";
import {
  DocsPageData,
  loadAllDocsPageSlugs,
  loadDocsPage,
} from "@/lib/fetch-docs";
import { loadDocsNavTreeData } from "@/lib/fetch-nav";
import { navTreeToBreadcrumbs } from "@/lib/nav-tree-to-breadcrumbs";
import { Pencil } from "lucide-react";
import s from "./DocsPage.module.css";

// This is the location that we expect our docs mdx files to be located,
// relative to the root of the Next.js project.
export const DOCS_DIRECTORY = "./docs";
const GITHUB_REPO_URL = "https://github.com/ghostty-org/website";
// This is the URL path for all of our docs pages
export const DOCS_PAGES_ROOT_PATH = "/docs";

export async function getStaticPaths() {
  const docsPageSlugs = await loadAllDocsPageSlugs(DOCS_DIRECTORY);
  return {
    paths: docsPageSlugs.map((slug: string): StaticPropsParams => {
      return {
        params: {
          path: slug.split("/"),
        },
      };
    }),
    fallback: false,
  };
}

interface StaticPropsParams {
  params: {
    path: Array<string>;
  };
}

export async function getStaticProps({ params: { path } }: StaticPropsParams) {
  const activePageSlug = path.join("/");
  const navTreeData = await loadDocsNavTreeData(DOCS_DIRECTORY, activePageSlug);
  const docsPageData = await loadDocsPage(DOCS_DIRECTORY, activePageSlug);
  const breadcrumbs = navTreeToBreadcrumbs(
    "Ghostty Docs",
    DOCS_PAGES_ROOT_PATH,
    navTreeData,
    activePageSlug,
  );
  return {
    props: {
      navTreeData,
      docsPageData,
      breadcrumbs,
    },
  };
}

interface DocsPageProps {
  navTreeData: NavTreeNode[];
  docsPageData: DocsPageData;
  breadcrumbs: Breadcrumb[];
}

export default function DocsPage({
  navTreeData,
  docsPageData: {
    title,
    description,
    editOnGithubLink,
    content,
    relativeFilePath,
    pageHeaders,
    hideSidecar,
    alphabeticallySortedSidecar,
  },
  breadcrumbs,
}: DocsPageProps) {
  // Calculate the "Edit in Github" link. If it's not provided
  // in the frontmatter, point to the website repo mdx file.
  editOnGithubLink = editOnGithubLink
    ? editOnGithubLink
    : `${GITHUB_REPO_URL}/edit/main/${relativeFilePath}`;

  return (
    <NavFooterLayout
      docsNavTree={navTreeData}
      meta={{
        title:
          breadcrumbs.length > 1
            ? breadcrumbs
                .slice(1)
                .reverse()
                .slice(0, 2)
                .map((breadcrumb) => breadcrumb.text)
                .join(" - ")
            : breadcrumbs[0].text,
        description,
      }}
    >
      <div className={s.docsPage}>
        <div className={s.sidebar}>
          <div className={s.sidebarContentWrapper}>
            <NavTree
              nodeGroups={[
                {
                  rootPath: DOCS_PAGES_ROOT_PATH,
                  nodes: navTreeData,
                },
              ]}
              className={s.sidebarNavTree}
            />
          </div>
        </div>

        <main className={s.contentWrapper}>
          <ScrollToTopButton />

          <div className={s.docsContentWrapper}>
            <div className={s.breadcrumbsBar}>
              <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className={s.heading}>
              <H1>{title}</H1>
              <P className={s.description} weight="regular">
                {description}
              </P>
            </div>
            <CustomMDX content={content} />
            <br />
            <div className={s.editOnGithub}>
              <a href={editOnGithubLink}>
                Edit on GitHub <Pencil size={14} />
              </a>
            </div>
          </div>

          <Sidecar
            hidden={hideSidecar}
            className={s.sidecar}
            items={pageHeaders}
            alphabeticallySorted={alphabeticallySortedSidecar}
          />
        </main>
      </div>
    </NavFooterLayout>
  );
}
