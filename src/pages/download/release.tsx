import { ButtonLink } from "@/components/link";
import GenericCard from "@/components/generic-card";
import { CodeXml, Download, Package } from "lucide-react";
import s from "./DownloadPage.module.css";
import { DownloadPageProps } from "./index";

export default function ReleaseDownloadPage({
  latestVersion,
  docsNavTree,
}: DownloadPageProps) {
  return (
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
            href="/docs/install/binary#linux"
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
  );
}
