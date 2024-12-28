import { jetbrainsMono, pretendardVariable } from "@/components/text";
import classNames from "classnames";
import Head from "next/head";
import s from "./RootLayout.module.css";

export interface PageMeta {
  title: string;
  description: string;
}

export interface RootLayoutProps {
  meta: PageMeta;
  children?: React.ReactNode;
  className?: string;
}

export default function RootLayout({
  meta: { title, description },
  className,
  children,
}: RootLayoutProps) {
  return (
    <div
      className={classNames(
        s.rootLayout,
        pretendardVariable.variable,
        jetbrainsMono.variable,
        className,
      )}
    >
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ghostty.org" />
        <meta property="og:site_name" content="Ghostty" />
        <meta property="og:description" content={description} />

        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta property="og:image" content="/social-share-card.jpg" />
        <meta
          name="twitter:image"
          content="https://ghostty.org/social-share-card.jpg"
        />

        <meta name="darkreader-lock" />
      </Head>
      {children}
    </div>
  );
}
