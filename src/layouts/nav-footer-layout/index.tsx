import Footer from "@/components/footer";
import { SimpleLink } from "@/components/link";
import { NavTreeNode } from "@/components/nav-tree";
import Navbar from "@/components/navbar";
import RootLayout, { RootLayoutProps } from "../root-layout";

const navLinks: Array<SimpleLink> = [
  {
    text: "Docs",
    href: "/docs",
  },
  {
    text: "Discord",
    href: "https://discord.gg/ghostty",
  },
  {
    text: "GitHub",
    href: "https://github.com/ghostty-org/ghostty",
  },
];

type NavFooterLayoutProps = RootLayoutProps & {
  docsNavTree: NavTreeNode[];
};

export default function NavFooterLayout(props: NavFooterLayoutProps) {
  const currentYear = new Date().getFullYear();

  const { children, docsNavTree, ...otherProps } = props;
  return (
    <RootLayout {...otherProps}>
      <Navbar
        links={navLinks}
        docsNavTree={docsNavTree}
        cta={{
          href: "/download",
          text: "Download",
        }}
      />
      {children}
      <Footer
        links={[
          ...navLinks,
          {
            text: "Download",
            href: "/download",
          },
        ]}
        copyright={`© ${currentYear} Ghostty`}
      />
    </RootLayout>
  );
}
