"use client";

import { Check, Copy, Heart, Building2, Coins, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { H3, P } from "../text";
import s from "./DonateCard.module.css";

interface DonateCardProps {
  href?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  ein?: string;
  contactName?: string;
  contactEmail?: string;
}

export default function DonateCard({
  href = "https://donate.ghostty.org",
  title = "Support Ghostty",
  description = "Your contribution helps sustain development and keeps Ghostty free and open source.",
  buttonText = "Donate Now",
  ein = "81-2908499",
  contactName = "Paul at Hack Club",
  contactEmail = "paul@hackclub.com",
}: DonateCardProps) {
  const [copied, setCopied] = useState(false);

  const copyEin = async () => {
    await navigator.clipboard.writeText(ein);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={s.donateCard}>
      <div className={s.main}>
        <div className={s.iconContainer}>
          <Heart className={s.icon} />
        </div>
        <div className={s.content}>
          <H3 className={s.title}>{title}</H3>
          <P className={s.description}>{description}</P>
          <div className={s.actions}>
            <Link href={href} className={s.button}>
              <Heart className={s.buttonIcon} />
              {buttonText}
            </Link>
            <button onClick={copyEin} className={s.einButton} title="Copy EIN">
              <span className={s.einText}>
                <span className={s.einLabel}>EIN:</span>
                <span className={s.einValue}>{ein}</span>
              </span>
              {copied ? (
                <Check className={s.copyIcon} />
              ) : (
                <Copy className={s.copyIcon} />
              )}
            </button>
          </div>
        </div>
      </div>
      <div className={s.methods}>
        <div className={`${s.method} ${s.methodDaf}`}>
          <div className={s.methodIcon}>
            <Building2 />
          </div>
          <div className={s.methodContent}>
            <span className={s.methodTitle}>DAF or Foundation</span>
            <span className={s.methodDesc}>
              Use the EIN above and specify &quot;Ghostty&quot; as the recipient in the notes
            </span>
          </div>
        </div>
        <div className={`${s.method} ${s.methodCrypto}`}>
          <div className={s.methodIcon}>
            <Coins />
          </div>
          <div className={s.methodContent}>
            <span className={s.methodTitle}>Stock, Cryptocurrency, or Other Assets</span>
            <span className={s.methodDesc}>
              Contact{" "}
              <a href={`mailto:${contactEmail}`} className={s.methodLink}>
                {contactName}
              </a>.
            </span>
          </div>
        </div>
        <div className={`${s.method} ${s.methodOther}`}>
          <div className={s.methodIcon}>
            <HelpCircle />
          </div>
          <div className={s.methodContent}>
            <span className={s.methodTitle}>Other Questions</span>
            <span className={s.methodDesc}>
              Reach out to{" "}
              <a href={`mailto:${contactEmail}`} className={s.methodLink}>
                {contactName}
              </a>{" "}
              for any other inquiries
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
