import classNames from "classnames";
import localFont from "next/font/local";

import { JetBrains_Mono } from "next/font/google";

import { forwardRef, UIEventHandler } from "react";
import s from "./Text.module.css";

// https://github.com/orioncactus/pretendard/tree/main/packages/pretendard-std
export const pretendardStdVariable = localFont({
  src: "./font/pretendard-std-variable.woff2",
  display: "auto",
  variable: "--pretendard-std-variable",
});

export const jetbrainsMono = JetBrains_Mono({
  display: "auto",
  weight: "400",
  variable: "--jetbrains-mono",
  subsets: ["latin"],
});

interface TextProps {
  children?: React.ReactNode;
  className?: string;
  id?: string;
  as: "code" | "p" | "span" | "li" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  font?: "display" | "body" | "code";
  weight?: "light" | "regular" | "medium";
  onScroll?: UIEventHandler<HTMLElement>;
}

const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {
    as: Tag,
    children,
    className,
    id,
    font = "body",
    weight = "light",
    onScroll,
  }: TextProps,
  ref: React.Ref<HTMLElement>,
) {
  return (
    <Tag
      id={id}
      ref={ref as any}
      onScroll={onScroll}
      className={classNames(s.text, className, {
        [pretendardStdVariable.className]:
          font === "display" || font === "body",
        [jetbrainsMono.className]: font === "code",
        [s.weightLight]: weight === "light",
        [s.weightRegular]: weight === "regular",
        [s.weightMedium]: weight === "medium",
      })}
    >
      {children}
    </Tag>
  );
});
export default Text;

type SpecificTagTextProps = Omit<TextProps, "as">;

export const Code = forwardRef<HTMLElement, SpecificTagTextProps>(function Code(
  props: SpecificTagTextProps,
  ref: React.Ref<HTMLElement>,
) {
  return <Text ref={ref} font="code" weight="regular" as="code" {...props} />;
});

export function LI(props: SpecificTagTextProps) {
  return <Text as="li" font="body" weight="regular" {...props} />;
}

export function BodyParagraph(props: SpecificTagTextProps) {
  const { className, ...otherProps } = props;
  return (
    <Text
      font="body"
      weight="regular"
      as="p"
      className={classNames(s.body, className)}
      {...otherProps}
    />
  );
}

export function P(props: SpecificTagTextProps) {
  return <Text as="p" font="body" weight="light" {...props} />;
}

export function Span(props: SpecificTagTextProps) {
  return <Text as="span" font="body" weight="light" {...props} />;
}

export function H1(props: SpecificTagTextProps) {
  return <Text as="h1" font="display" weight="medium" {...props} />;
}

export function H2(props: SpecificTagTextProps) {
  return <Text as="h2" font="display" weight="medium" {...props} />;
}

export function H3(props: SpecificTagTextProps) {
  return <Text as="h3" font="display" weight="medium" {...props} />;
}

export function H4(props: SpecificTagTextProps) {
  return <Text as="h4" font="display" weight="medium" {...props} />;
}

export function H5(props: SpecificTagTextProps) {
  return <Text as="h5" font="display" weight="medium" {...props} />;
}

export function H6(props: SpecificTagTextProps) {
  return <Text as="h6" font="display" weight="medium" {...props} />;
}
