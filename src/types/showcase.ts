import { ImageProps } from "next/image";

export interface ShowcaseContent {
  id: string;
  title: string;
  author: string;
  tags: string[];
  description: string;
  images: Pick<ImageProps, "src" | "alt">[];
  code: string;
}
