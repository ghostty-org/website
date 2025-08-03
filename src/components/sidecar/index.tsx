import React, { useEffect, useMemo, useRef, useState } from "react";
import classNames from "classnames";
import { H6, P } from "../text";
import s from "./Sidecar.module.css";
import { useStore } from "@/lib/use-store";
import Fuse from "fuse.js";

interface SidecarItem {
  id: string;
  title: string;
  depth: number;
}

interface SidecarProps {
  className?: string;
  items: SidecarItem[];
  hidden?: boolean;
}

// If there's less items than this, the sidecar content won't render
// it does not make sense to have a single item in the sidecar.
const MIN_SIDECAR_ITEMS = 2;

// If there are less items than this, the search bar will not render
// as it is not useful to have a search bar for less than 12 items.
const MIN_SIDECAR_SEARCH_ITEMS = 12;

// H4s and below will only display in the sidecar
const MAX_SIDECAR_HEADER_DEPTH = 4;

export default function Sidecar({
  className,
  items,
  hidden = false,
}: SidecarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const activeItemRef = useRef<HTMLLIElement>(null);
  const sidecarRef = useRef<HTMLDivElement>(null);
  const headerIdsInView = useStore((state) => state.headerIdsInView);
  const shownItems = useMemo(() => {
    return items.filter((v) => v.depth <= MAX_SIDECAR_HEADER_DEPTH);
  }, [items]);

  const fuse = useMemo(() => {
    return new Fuse(shownItems, {
      keys: ["title"],
      threshold: 0.3, // This felt pretty good
    });
  }, [shownItems]);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return shownItems;
    return fuse
      .search(searchTerm)
      .map((result: { item: SidecarItem }) => result.item);
  }, [shownItems, searchTerm, fuse]);

  const [lastActiveHeaderID, setLastActiveHeaderID] = useState<string | null>(
    null,
  );
  const activeHeaderID = useMemo(() => {
    const currentActiveID = filteredItems.find((v) =>
      headerIdsInView.includes(v.id),
    )?.id;
    if (currentActiveID && currentActiveID !== lastActiveHeaderID) {
      setLastActiveHeaderID(currentActiveID);
      return currentActiveID;
    }
    return lastActiveHeaderID;
  }, [filteredItems, headerIdsInView, lastActiveHeaderID]);

  useEffect(() => {
    if (activeItemRef.current && sidecarRef.current) {
      const sidecarElement = sidecarRef.current;
      const activeItemRect = activeItemRef.current.getBoundingClientRect();
      const sidecarRect = sidecarElement.getBoundingClientRect();

      // Keep the active item in the center of the sidecar, if possible
      const targetPosition = sidecarRect.height / 2 - activeItemRect.height / 2;
      const currentPosition = activeItemRect.top - sidecarRect.top;
      const scrollAmount = currentPosition - targetPosition;

      sidecarElement.scrollBy({ top: scrollAmount, behavior: "smooth" });
    }
  }, [activeHeaderID]);

  return (
    <div className={classNames(s.sidecarWrapper, className)}>
      {items.length > MIN_SIDECAR_SEARCH_ITEMS && !hidden && (
        <input
          type="text"
          placeholder="🔎 Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={s.searchBar}
        />
      )}
      <div ref={sidecarRef} className={classNames(s.sidecar, className)}>
        {items.length > MIN_SIDECAR_ITEMS && !hidden && (
          <ul>
            {filteredItems.map(({ id, title, depth }) => {
              const active = id === activeHeaderID;
              return (
                <li
                  key={`${id}${active}`}
                  ref={active ? activeItemRef : null}
                  className={classNames({ [s.active]: active })}
                  style={
                    {
                      "--depth": depth,
                    } as React.CSSProperties
                  }
                >
                  {/* Intentionally using an a tag and not next/link:
              as we want our :target selectors to trigger here.
              See: https://github.com/vercel/next.js/issues/51346
              Also, we're remaining on the same page always here,
              so no client-side routing handing is needed. */}
                  <a href={`#${id}`}>
                    <P weight={active ? "medium" : "regular"}>{title}</P>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
