import classNames from "classnames";
import { FocusEvent, forwardRef, Ref } from "react";
import s from "./Button.module.css";

export type ButtonSize = "small" | "medium" | "large";
export type ButtonTheme = "neutral" | "brand";

interface ButtonProps {
  size?: ButtonSize;
  theme?: ButtonTheme;
  className?: string;
  children?: React.ReactNode;
  onBlur?: (e: FocusEvent<HTMLButtonElement, Element>) => void;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

function Button(
  {
    size = "medium",
    theme = "neutral",
    className,
    children,
    onBlur,
    onClick,
  }: ButtonProps,
  ref?: Ref<HTMLButtonElement>
) {
  return (
    <button
      ref={ref}
      onClick={onClick}
      onBlur={onBlur}
      className={classNames(s.button, className, {
        [s.small]: size === "small",
        [s.medium]: size === "medium",
        [s.large]: size === "large",
        [s.neutral]: theme === "neutral",
        [s.brand]: theme === "brand",
      })}
    >
      {children}
    </button>
  );
}

export default forwardRef(Button);
