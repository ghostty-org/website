import classNames from "classnames";
import React, { UIEvent, useEffect, useRef, useState } from "react";
import { Code, P } from "../text";
import s from "./Terminal.module.css";

import { X, Menu, LayoutGrid, SquarePlus } from "lucide-react";

export type TerminalFontSize = "xtiny" | "tiny" | "small" | "medium" | "large";
export interface TerminalProps {
  className?: string;
  columns: number;
  rows: number;
  fontSize?: TerminalFontSize;
  title?: string;
  lines?: string[];
  whitespacePadding?: number;
  disableScrolling?: boolean;
}

export default function Terminal({
  columns,
  rows,
  fontSize = "medium",
  className,
  title,
  lines,
  whitespacePadding = 0,
  disableScrolling = false,
}: TerminalProps) {
  const [platformStyle, setPlatformStyle] = useState("macos");
  useEffect(() => {
    const userAgent = window?.navigator.userAgent;
    const isLinux = /Linux/i.test(userAgent);
    setPlatformStyle(isLinux ? "adwaita" : "macos");
  }, []);

  const [autoScroll, setAutoScroll] = useState(true);
  const handleScroll = (e: UIEvent<HTMLElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target as HTMLElement;
    const position = Math.ceil(
      (scrollTop / (scrollHeight - clientHeight)) * 100,
    );
    if (position < 100) {
      setAutoScroll(false);
    }
    if (position == 100) {
      setAutoScroll(true);
    }
  };

  const codeRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (autoScroll) {
      codeRef.current?.scrollTo({
        top: codeRef.current.scrollHeight,
        behavior: "instant",
      });
    }
  }, [lines?.length, autoScroll]);

  const padding = " ".repeat(whitespacePadding);
  return (
    <div
      className={classNames(
        s.terminal,
        className,
        {
          [s.fontXTiny]: fontSize === "xtiny",
          [s.fontTiny]: fontSize === "tiny",
          [s.fontSmall]: fontSize === "small",
          [s.fontMedium]: fontSize === "medium",
          [s.fontLarge]: fontSize === "large",
        },
        {
          [s.adwaita]: platformStyle === "adwaita",
          [s.macos]: platformStyle === "macos",
        },
      )}
      style={
        {
          "--columns": columns + 2 * whitespacePadding,
          "--rows": rows,
        } as React.CSSProperties
      }
    >
      <div className={s.header}>
        {platformStyle === "adwaita" && <AdwaitaButtons />}
        {platformStyle === "macos" && <MacosButtons />}
        <P className={s.title}>{title}</P>
      </div>
      <Code
        ref={codeRef}
        className={classNames(s.content, {
          [s.disableScrolling]: disableScrolling,
        })}
        onScroll={handleScroll}
      >
        {lines?.map((line, i) => {
          return (
            <div
              key={i + line}
              dangerouslySetInnerHTML={{
                __html: `${padding}${line}${padding}`,
              }}
            />
          );
        })}
      </Code>
    </div>
  );
}

function AdwaitaButtons() {
  // NOTE:
  // It is entirely intentional that the maximize/minimize buttons are missing.
  // Blame GNOME.

  return (
    <>
      <ul className={classNames(s.windowControls, s.start)}>
        <li>
          <SquarePlus className={s.icon} />
        </li>
      </ul>
      <ul className={classNames(s.windowControls, s.end)}>
        <li>
          <LayoutGrid className={s.icon} />
        </li>
        <li>
          <Menu className={s.icon} />
        </li>
        <li className={s.circularButton}>
          <X className={s.icon} />
        </li>
      </ul>
    </>
  );
}
function MacosButtons() {
  return (
    <ul className={classNames(s.windowControls, s.start)}>
      <li className={s.circularButton} />
      <li className={s.circularButton} />
      <li className={s.circularButton} />
    </ul>
  );
}
