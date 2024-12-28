import GenericCard from "@/components/generic-card";
import s from "./ListItem.module.css";
import Button from "@/components/button";

export default function ListItem() {
  return (
    <li className={s.ListItem}>
      <GenericCard
        title="title"
        description="desc"
        padding="12px 12px 24px"
        image={{
          src: "/placeholder.png",
          alt: "placeholder image",
          width: 500,
          height: 300,
        }}
      >
        <Button theme="brand">View config</Button>
      </GenericCard>
    </li>
  );
}
