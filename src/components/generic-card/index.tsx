import { SpacingProp } from "@/types/style";
import { H2, P } from "../text";
import s from "./GenericCard.module.css";
import { ImageProps } from "next/image";

interface GenericCardProps {
  title: string;
  image?: ImageProps;
  description: string;
  padding?: SpacingProp;
  children?: React.ReactNode;
}

export default function GenericCard({
  title,
  padding = "56px",
  description,
  children,
}: GenericCardProps) {
  return (
    <div className={s.genericCard} style={{ padding }}>
      <H2 className={s.title}>{title}</H2>
      <P className={s.description}>{description}</P>
      {children ? <div className={s.children}>{children}</div> : null}
    </div>
  );
}
