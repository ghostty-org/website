import { ButtonLink } from "@/components/link";
import { NavTreeNode } from "@/components/nav-tree";
import SectionWrapper from "@/components/section-wrapper";
import { H1, P, Span } from "@/components/text";
import NavFooterLayout from "@/layouts/nav-footer-layout";
import { fetchLatestGhosttyVersion } from "@/lib/fetch-latest-ghostty-version";
import { loadDocsNavTreeData } from "@/lib/fetch-nav";
import { CodeXml, Download, Package } from "lucide-react";
import Image from "next/image";
import SVGIMG from "../../../public/ghostty-logo.svg";
import { DOCS_DIRECTORY } from "../docs/[...path]";
import s from "./DownloadPage.module.css";
import GenericCard from "@/components/generic-card";

export async function getStaticProps() {
  return {
    props: {
      latestVersion: await fetchLatestGhosttyVersion(),
      docsNavTree: await loadDocsNavTreeData(DOCS_DIRECTORY, ""),
    },
  };
}

interface DownloadPageProps {
  latestVersion: string;
  docsNavTree: NavTreeNode[];
}

export default function DownloadPage({
  latestVersion,
  docsNavTree,
}: DownloadPageProps) {
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
          </div>
          <div className={s.downloadCards}>
            <GenericCard
              title="macOS"
              description="A universal binary that works on both Apple Silicon and Intel machines. Requires macOS 13+ (Ventura or later)."
            >
              <div className={s.macosLinks}>
                <ButtonLink
                  size="large"
                  href={`https://release.files.ghostty.org/${latestVersion}/Ghostty.dmg`}
                  text="Universal Binary"
                  icon={<Download strokeWidth={2} size={17} />}
                  showExternalIcon={false}
                />
                <ButtonLink
                  size="large"
                  href="/docs/install/binary#macos"
                  text="Package Manager"
                  icon={<Package strokeWidth={2} size={18} />}
                  showExternalIcon={false}
                />
              </div>
            </GenericCard>
            <GenericCard
              title="Linux"
              description="Choose a pre-built package for quick setup on your Linux distribution, or build source for complete control."
            >
              <div className={s.linuxLinks}>
                <ButtonLink
                  size="large"
                  href="/docs/install/binary#linux-(official)"
                  text="Package Manager"
                  icon={<Package strokeWidth={2} size={18} />}
                  showExternalIcon={false}
                />
                <ButtonLink
                  size="large"
                  href="/docs/install/build"
                  text="Build From Source"
                  icon={<CodeXml strokeWidth={2} size={18} />}
                  showExternalIcon={false}
                />
              </div>
            </GenericCard>
          </div>
        </SectionWrapper>
      </main>
    </NavFooterLayout>
  );
}
