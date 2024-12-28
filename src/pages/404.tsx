import s from "./404Page.module.css";
import NavFooterLayout from "@/layouts/nav-footer-layout";
import { loadDocsNavTreeData } from "@/lib/fetch-nav";
import { DOCS_DIRECTORY } from "./docs/[...path]";
import { NavTreeNode } from "@/components/nav-tree";
import { H2, P } from "@/components/text";
import Image from "next/image";

export async function getStaticProps() {
  return {
    props: {
      docsNavTree: await loadDocsNavTreeData(DOCS_DIRECTORY, ""),
    },
  };
}

interface NotFoundProps {
  docsNavTree: NavTreeNode[];
}

export default function NotFound({ docsNavTree }: NotFoundProps) {
  return (
    <NavFooterLayout
      docsNavTree={docsNavTree}
      meta={{
        title: "Page not found | Ghostty",
        description:
          "Oops! We couldn’t find what you were looking for. Try browsing our docs or visit our download page.",
      }}
    >
      <main className={s.notFoundPage}>
        <header className={s.header}>
          <H2>This page could not be found.</H2>
        </header>
        <section>
          <Image
            className={s.image}
            src="/ghostty-404.png"
            alt="Ghostty 404 image - CC BY 4.0 (c) @qwerasd205"
            width={425}
            height={500}
          />
          <P className={s.imageCopyright}>CC BY 4.0 (&#169;) Qwerasd</P>
        </section>
      </main>
    </NavFooterLayout>
  );
}
