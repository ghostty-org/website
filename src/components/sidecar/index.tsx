import React, { useEffect, useMemo, useRef, useState } from "react";
import classNames from "classnames";
import { H6, P } from "../text";
import s from "./Sidecar.module.css";
import { useStore } from "@/lib/use-store";

interface SidecarItem {
  id: string;
  title: string;
  depth: number;
}

interface SidecarProps {
  className?: string;
  items: SidecarItem[];
  hidden?: boolean;
  alphabeticallySorted?: boolean;
}

// If there's less items than this, the sidecar content won't render
// it does not make sense to have a single item in the sidecar.
const MIN_SIDECAR_ITEMS = 2;

// H4s and below will only display in the sidecar
const MAX_SIDECAR_HEADER_DEPTH = 4;

export default function Sidecar({
  className,
  items,
  hidden = false,
  alphabeticallySorted = false,
}: SidecarProps) {
  const activeItemRef = useRef<HTMLLIElement>(null);
  const sidecarRef = useRef<HTMLDivElement>(null);
  const headerIdsInView = useStore((state) => state.headerIdsInView);
  const shownItems = useMemo(() => {
    return items.filter((v) => v.depth <= MAX_SIDECAR_HEADER_DEPTH);
  }, [items]);
  const activeHeaderID = useMemo(() => {
    return shownItems.find((v) => headerIdsInView.includes(v.id))?.id;
  }, [shownItems, headerIdsInView]);
  const sortedItems = useMemo(() => {
    if (alphabeticallySorted) {
      return items.sort((a, b) => a.title.localeCompare(b.title));
    }
    return items;
  }, [items, alphabeticallySorted]);

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
    <div ref={sidecarRef} className={classNames(s.sidecar, className)}>
      {sortedItems.length > MIN_SIDECAR_ITEMS && !hidden && (
        <ul>
          {sortedItems.map(({ id, title, depth }) => {
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
  );
}
