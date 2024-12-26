import { DOCS_PAGES_ROOT_PATH } from "@/pages/docs/[...path]";
import classNames from "classnames";
import Image from "next/image";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import GridContainer, { NavAndFooterGridConfig } from "../grid-container";
import Link, { ButtonLink, SimpleLink } from "../link";
import NavTree, { BreakNode, LinkNode, NavTreeNode } from "../nav-tree";
import GhosttyWordmark from "./ghostty-wordmark.svg";
import '@docsearch/css';
import s from "./Navbar.module.css";
import { DocSearch } from "@docsearch/react"
import { useRouter } from "next/router";

export interface NavbarProps {
  className?: string;
  links?: SimpleLink[];
  cta?: SimpleLink;
  docsNavTree: NavTreeNode[];
}

const MOBILE_MENU_BREAKPOINT = 768;

export default function Navbar({
  className,
  links,
  cta,
  docsNavTree,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileContentRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    function handleSizeUpdated() {
      if (window.innerWidth > MOBILE_MENU_BREAKPOINT && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    }
    window.addEventListener("resize", handleSizeUpdated);
    return () => window.removeEventListener("resize", handleSizeUpdated);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add("noScroll");
      // Scroll to active item when mobile menu is opened, so it's not hidden
      if (activeItemRef.current && mobileContentRef.current) {
        const mobileContent = mobileContentRef.current;
        const activeItem = activeItemRef.current;
        const mobileContentRect = mobileContent.getBoundingClientRect();
        const activeItemRect = activeItem.getBoundingClientRect();

        if (
          activeItemRect.top < mobileContentRect.top ||
          activeItemRect.bottom > mobileContentRect.bottom
        ) {
          mobileContent.scrollTo({
            top:
              activeItem.offsetTop -
              mobileContent.offsetTop -
              mobileContentRect.height / 2 +
              activeItemRect.height / 2,
            behavior: "instant", // easing here felt... wrong
          });
        }
      }
    } else {
      document.body.classList.remove("noScroll");
    }
  }, [mobileMenuOpen]);

  /* Instead of closing the menu with the NavTree's onNavLinkClicked prop,
    * we'll close it when the route changes. This avoids the annoying flicker
    * between the old and new pages when the menu closes. */
  useEffect(() => {
    const handleRouteChangeComplete = () => {
      setMobileMenuOpen(false);
    };

    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, [router]);

  return (
    <nav className={classNames(s.navbar, className)}>
      <GridContainer
        className={s.gridContainer}
        gridConfig={NavAndFooterGridConfig}
      >
        <NextLink href="/">
          <Image src={GhosttyWordmark} alt="Ghostty" />
        </NextLink>
      <div className={s.search}>
      <DocSearch
        appId="PVKTWXOYZX"
        indexName="ghostty"
        apiKey="4b2b0f475ce709fe29e07740b277de61"
      />
      </div>
        <div className={s.desktopLinks}>
          {links && (
            <ul className={s.linkList}>
              {links.map((link) => {
                return (
                  <li key={link.text}>
                    <Link
                      className={classNames({
                        [s.active]: pathname == link.href,
                      })}
                      {...link}
                    />
                  </li>
                );
              })}
            </ul>
          )}
          {cta && (
            <ButtonLink
              className={s.cta}
              size="large"
              theme="brand"
              href={cta.href}
              text={cta.text}
            />
          )}
        </div>
        <MenuToggle
          isOpen={mobileMenuOpen}
          onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
      </GridContainer>
      <div
        ref={mobileContentRef}
        className={classNames(s.mobileContent, {
          [s.mobileMenuOpen]: mobileMenuOpen,
        })}
      >
        <NavTree
          className={s.navTree}
          nodeGroups={[
            {
              rootPath: "",
              nodes: [
                // Adds our CTA first
                ...(cta
                  ? [
                      {
                        type: "link",
                        title: cta.text,
                        path: cta.href,
                        active: pathname === cta.href,
                      } as LinkNode,
                    ]
                  : []),
                // Next our Nav Links, but exclude docs, that's going to get
                // special treatment in the next node group below.
                ...(links
                  ? links
                      .filter((link) => link.href != "/docs")
                      .map((link) => {
                        return {
                          type: "link",
                          title: link.text,
                          path: link.href,
                          active: pathname === link.href,
                        } as LinkNode;
                      })
                  : []),

                { type: "break" } as BreakNode,
              ],
            },
            // Render the docs links
            {
              rootPath: DOCS_PAGES_ROOT_PATH,
              nodes: docsNavTree,
            },
          ]}
          activeItemRef={activeItemRef}
        />
      </div>
    </nav>
  );
}

interface MenuToggleProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

function MenuToggle({ isOpen, onToggle }: MenuToggleProps) {
  return (
    <button type="button" onClick={onToggle} className={s.menuToggle}>
      <div className={classNames(s.hamburger)} data-open={isOpen}>
        <div className={s.hamburgerLayer}></div>
        <div className={s.hamburgerLayer}></div>
        <div className={s.hamburgerLayer}></div>
      </div>
    </button>
  );
}
