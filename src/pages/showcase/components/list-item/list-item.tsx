import s from "./ListItem.module.css";
import Button from "@/components/button";
import Image, { ImageProps } from "next/image";
import { H3, P } from "@/components/text";

interface ListItemProps {
  image: ImageProps;
}
export default function ListItem({ image }: ListItemProps) {
  return (
    <li className={s.ListItem}>
      <Image {...image} />
      <section className={s.content}>
        <H3 className={s.title}>title</H3>
        <P className={s.description}>desc</P>
        <Button theme="brand">View config</Button>
      </section>
    </li>
  );
}
