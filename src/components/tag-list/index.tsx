import classNames from "classnames";
import s from "./TagList.module.css";
import { Span } from "../text";

type TagColor =
  | "brand"
  | "blue"
  | "green"
  | "yellow"
  | "purple"
  | "red"
  | "orange"
  | "teal"
  | "gray"
  | "white";

interface TagProps {
  name: string;
  color?: TagColor;
}

interface TagListProps {
  tags: TagProps[];
  className?: string;
}

export default function TagList({ tags, className }: TagListProps) {
  return (
    <ul className={classNames(s.tagList, className)}>
      {tags.map(({ name, color }, index) => (
        <Tag key={`${name}_${index}`} name={name} color={color} />
      ))}
    </ul>
  );
}

function Tag({ name, color }: TagProps) {
  return (
    <li
      className={classNames(s.tag, {
        [s.brand]: color === "brand",
        [s.blue]: color === "blue",
        [s.green]: color === "green",
        [s.yellow]: color === "yellow",
        [s.purple]: color === "purple",
        [s.red]: color === "red",
        [s.orange]: color === "orange",
        [s.teal]: color === "teal",
        [s.gray]: color === "gray",
        [s.white]: color === "white",
      })}
    >
      <Span className={s.text}>{name}</Span>
    </li>
  );
}
