import { NavTreeNode } from "@/components/nav-tree";
import SectionWrapper from "@/components/section-wrapper";
import { H1, P } from "@/components/text";
import NavFooterLayout from "@/layouts/nav-footer-layout";
import { fetchLatestGhosttyVersion } from "@/lib/fetch-latest-ghostty-version";
import { loadDocsNavTreeData } from "@/lib/fetch-nav";
import Image from "next/image";
import SVGIMG from "../../../public/ghostty-logo.svg";
import { DOCS_DIRECTORY } from "../docs/[...path]";
import s from "./DownloadPage.module.css";
import ReleaseDownloadPage from "./release";
import TipDownloadPage from "./tip";

export async function getStaticProps() {
  return {
    props: {
      latestVersion: await fetchLatestGhosttyVersion(),
      docsNavTree: await loadDocsNavTreeData(DOCS_DIRECTORY, ""),
    },
  };
}

export interface DownloadPageProps {
  latestVersion: string;
  docsNavTree: NavTreeNode[];
}

export default function DownloadPage({
  latestVersion,
  docsNavTree,
}: DownloadPageProps) {
  const isTip = process.env.GIT_COMMIT_REF === "tip";

  return (
    <NavFooterLayout
      docsNavTree={docsNavTree}
      meta={{
        title: "Download Ghostty",
        description:
          "Ghostty is a fast, feature-rich, and cross-platform terminal emulator that uses platform-native UI and GPU acceleration.",
      }}
    >
      <main className={s.downloadPage}>
        <SectionWrapper>
          <div className={s.header}>
            <Image src={SVGIMG} alt={""} />
            <H1 className={s.pageTitle}>Download Ghostty</H1>
            {!isTip && (
              <P weight="regular" className={s.versionInfo}>
                Version {latestVersion} -{" "}
                <a
                  href={
                    "/docs/install/release-notes/" +
                    latestVersion.replace(/\./g, "-")
                  }
                >
                  Release Notes
                </a>
              </P>
            )}
          </div>
          {isTip ? (
            <TipDownloadPage
              latestVersion={latestVersion}
              docsNavTree={docsNavTree}
            />
          ) : (
            <ReleaseDownloadPage
              latestVersion={latestVersion}
              docsNavTree={docsNavTree}
            />
          )}
        </SectionWrapper>
      </main>
    </NavFooterLayout>
  );
}
