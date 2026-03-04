import { ArrowRight, Heart } from "lucide-react";
import Link from "next/link";
import s from "./SponsorBanner.module.css";

interface SponsorBannerProps {
  title?: string;
  description?: string;
  href?: string;
}

/** A compact sponsorship call-to-action banner for use in release notes and other content pages. */
export default function SponsorBanner({
  title = "Ghostty is non-profit! Please support development.",
  description = "Almost all donations go directly to paying contributors. Learn more about how you can help.",
  href = "/docs/sponsor",
}: SponsorBannerProps) {
  return (
    <Link href={href} className={s.banner}>
      <div className={s.iconContainer}>
        <Heart className={s.icon} />
      </div>
      <div className={s.content}>
        <span className={s.title}>{title}</span>
        <span className={s.description}>{description}</span>
      </div>
      <ArrowRight className={s.arrow} />
      <span className={s.mobileAction}>Learn more →</span>
    </Link>
  );
}
