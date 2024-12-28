import { NavTreeNode } from "@/components/nav-tree";
import { H1, P } from "@/components/text";
import NavFooterLayout from "@/layouts/nav-footer-layout";
import { DOCS_DIRECTORY } from "../docs/[...path]";
import { loadDocsNavTreeData } from "@/lib/fetch-nav";
import SectionWrapper from "@/components/section-wrapper";
import s from "./ShowcasePage.module.css";
import ListItem from "./components/list-item/list-item";
import { useRouter } from "next/router";
import { useEffect } from "react";

interface ShowcasePageProps {
  docsNavTree: NavTreeNode[];
  isDevelopment: boolean;
}

export async function getStaticProps(): Promise<{ props: ShowcasePageProps }> {
  return {
    props: {
      isDevelopment: process.env.NODE_ENV === "development",
      docsNavTree: await loadDocsNavTreeData(DOCS_DIRECTORY, ""),
    },
  };
}

export default function Showcase({
  docsNavTree,
  isDevelopment,
}: ShowcasePageProps) {
  const router = useRouter();

  //TODO: This is gross, there's probably a better way to hide this route from prod
  useEffect(() => {
    if (!isDevelopment) {
      router.push("/");
    }
  });

  return (
    <NavFooterLayout
      docsNavTree={docsNavTree}
      meta={{
        title: "Ghostty config showcase",
        description: "A curated list of Ghostty configs from our comminuty",
      }}
    >
      <SectionWrapper className={s.showcasePage}>
        <header className={s.header}>
          <H1>Showcase</H1>
          <P>A curated list of Ghostty configs from our comminuty</P>
        </header>
        <ul className={s.list}>
          {Array.from(Array(12).keys(), (_, index) => (
            <ListItem key={index} />
          ))}
        </ul>
      </SectionWrapper>
    </NavFooterLayout>
  );
}
