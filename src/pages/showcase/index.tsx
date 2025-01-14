"use client";

import { NavTreeNode } from "@/components/nav-tree";
import { H1, P } from "@/components/text";
import NavFooterLayout from "@/layouts/nav-footer-layout";
import { DOCS_DIRECTORY } from "../docs/[...path]";
import { loadDocsNavTreeData } from "@/lib/fetch-nav";
import SectionWrapper from "@/components/section-wrapper";
import s from "./ShowcasePage.module.css";
import ListItem from "./components/list-item/list-item";
import { useState } from "react";
import Modal from "./components/modal";
import { ShowcaseContent } from "./types";
import { loadShowcaseContent } from "@/lib/fetch-showcase-content";

interface ShowcasePageProps {
  docsNavTree: NavTreeNode[];
  showcaseItems: ShowcaseContent[];
}

export async function getStaticProps(): Promise<{ props: ShowcasePageProps }> {
  return {
    props: {
      showcaseItems: await loadShowcaseContent(),
      docsNavTree: await loadDocsNavTreeData(DOCS_DIRECTORY, ""),
    },
  };
}

export default function Showcase({
  docsNavTree,
  showcaseItems,
}: ShowcasePageProps) {
  const [modalContent, setModalContent] = useState<null | ShowcaseContent>(
    null,
  );

  return (
    <>
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
            {showcaseItems.map((showcase) => (
              <ListItem
                key={showcase.id}
                title={showcase.title}
                description={showcase.description}
                image={{
                  src: showcase.images[0].src,
                  alt: showcase.images[0].altText,
                  width: 500,
                  height: 300,
                }}
                onClick={() => setModalContent(showcase)}
              />
            ))}
          </ul>
        </SectionWrapper>
      </NavFooterLayout>
      {modalContent !== null && (
        <Modal onClose={() => setModalContent(null)} content={modalContent} />
      )}
    </>
  );
}
