import Image from "next/image";
import Link from "next/link";
import { P } from "../text";
import s from "./SponsorCard.module.css";

interface SponsorCardProps {
  name: string;
  logo: string;
  href: string;
  description: string;
  since?: string;
}

export default function SponsorCard({
  name,
  logo,
  href,
  description,
  since,
}: SponsorCardProps) {
  return (
    <Link href={href} className={s.card} target="_blank" rel="noopener noreferrer">
      <div className={s.logoContainer}>
        <Image
          src={logo}
          alt={`${name} logo`}
          width={180}
          height={48}
          className={s.logo}
        />
      </div>
      <div className={s.content}>
        <P className={s.description}>{description}</P>
        {since && <span className={s.since}>Supporter since {since}</span>}
      </div>
    </Link>
  );
}
