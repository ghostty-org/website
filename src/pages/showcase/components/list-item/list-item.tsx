import GenericCard from "@/components/generic-card";
import s from "./ListItem.module.css";
import Button from "@/components/button";
import { ImageProps } from "next/image";

interface ListItemProps {
  image: ImageProps;
}
export default function ListItem({ image }: ListItemProps) {
  return (
    <li className={s.ListItem}>
      <GenericCard
        title="title"
        description="desc"
        padding="12px 12px 24px"
        image={image}
      >
        <Button theme="brand">View config</Button>
      </GenericCard>
    </li>
  );
}
