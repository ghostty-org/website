import { ButtonLink } from "@/components/link";
import GenericCard from "@/components/generic-card";
import { CodeXml, Github, Globe } from "lucide-react";
import s from "./DownloadPage.module.css";
import { DownloadPageProps } from "./index";

export default function TipDownloadPage({
  latestVersion,
  docsNavTree,
}: DownloadPageProps) {
  return (
    <div className={s.downloadCards}>
      <GenericCard
        title="Tip Build"
        description="You are viewing the tip branch. macOS builds are available via GitHub. Other platforms must build from source."
      >
        <div className={s.tipLinks}>
          <ButtonLink
            size="large"
            href="https://github.com/ghostty-org/ghostty/releases/tag/tip"
            text="GitHub"
            icon={<Github strokeWidth={2} size={18} />}
            showExternalIcon={true}
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
      <GenericCard
        title="Stable Build"
        description="Looking for the latest stable release? Visit the main Ghostty website for the latest released version."
      >
        <div className={s.tipLinks}>
          <ButtonLink
            size="large"
            href="https://ghostty.org/download"
            text="Ghostty.org"
            icon={<Globe strokeWidth={2} size={18} />}
            showExternalIcon={true}
          />
        </div>
      </GenericCard>
    </div>
  );
}
