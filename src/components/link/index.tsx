import classNames from "classnames";
import { SquareArrowOutUpRight } from "lucide-react";
import NextLink from "next/link";
import { pretendardStdVariable } from "../text";
import s from "./Link.module.css";

export interface SimpleLink {
  text: string;
  href: string;
}

export interface LinkProps extends SimpleLink {
  className?: string;
  weight?: "light" | "regular" | "medium";
  showExternalIcon?: boolean;
  icon?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export default function Link({
  className,
  text,
  href,
  weight = "light",
  icon,
  showExternalIcon = true,
  onClick,
}: LinkProps) {
  const isExternal = !href.startsWith("/");
  return (
    <NextLink
      onClick={onClick}
      className={classNames(
        s.link,
        pretendardStdVariable.className,
        className,
        {
          [s.weightLight]: weight === "light",
          [s.weightRegular]: weight === "regular",
          [s.weightMedium]: weight === "medium",
        },
      )}
      href={href}
      target={isExternal ? "_blank" : ""}
    >
      {icon && <div className={s.icon}>{icon}</div>}
      {text}{" "}
      {showExternalIcon && isExternal && (
        <SquareArrowOutUpRight className={s.externalLinkIcon} size={16} />
      )}
    </NextLink>
  );
}

export type ButtonSize = "small" | "medium" | "large";
export type ButtonTheme = "neutral" | "brand";

export interface ButtonLinkProps extends LinkProps {
  size?: ButtonSize;
  theme?: ButtonTheme;
}

export function ButtonLink({
  size = "medium",
  theme = "brand",
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={classNames(s.buttonLink, className, {
        [s.brand]: theme === "brand",
        [s.neutral]: theme === "neutral",
        [s.small]: size === "small",
        [s.medium]: size === "medium",
        [s.large]: size === "large",
      })}
      {...props}
    />
  );
}
