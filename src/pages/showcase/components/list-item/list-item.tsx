import s from "./ListItem.module.css";
import Button from "@/components/button";
import Image, { ImageProps } from "next/image";
import { H3, P } from "@/components/text";
import TagList from "@/components/tag-list";
import { ShowcaseContent } from "@/types/showcase";

interface ListItemProps
  extends Pick<ShowcaseContent, "title" | "description" | "tags"> {
  image: ImageProps;
  onClick: () => void;
}
export default function ListItem({
  image,
  title,
  tags,
  description,
  onClick,
}: ListItemProps) {
  return (
    <li className={s.ListItem}>
      <Image {...image} />
      <section className={s.content}>
        <H3 className={s.title}>{title}</H3>
        <P className={s.description}>{description}</P>
        <Button theme="brand" onClick={onClick}>
          View config
        </Button>
        <TagList
          className={s.tagList}
          tags={tags.map((tag) => ({ name: tag, color: "white" }))}
        />
      </section>
    </li>
  );
}
