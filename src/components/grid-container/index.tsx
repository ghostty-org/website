import classNames from "classnames";
import s from "./GridContainer.module.css";
import { UnitProp } from "@/types/style";

export const NavAndFooterGridConfig: GridConfig = {
  mobilePadding: "28px",
  desktopPadding: "40px",
  maxWidth: "1700px",
};

export const StandardGridConfig: GridConfig = {
  desktopPadding: "48px",
  mobilePadding: "24px",
  maxWidth: "1300px",
};

interface GridContainerProps {
  className?: string;
  children?: React.ReactNode;
  gridConfig?: GridConfig;
}

interface GridConfig {
  desktopPadding: UnitProp;
  mobilePadding: UnitProp;
  maxWidth: UnitProp;
}

export default function GridContainer({
  className,
  children,
  gridConfig = StandardGridConfig,
}: GridContainerProps) {
  return (
    <div
      className={classNames(s.gridContainer, className)}
      style={
        {
          "--desktop-padding": gridConfig.desktopPadding,
          "--mobile-padding": gridConfig.mobilePadding,
          "--max-width": gridConfig.maxWidth,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
