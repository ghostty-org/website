interface Image {
  src: string;
  altText: string;
}

export interface ShowcaseContent {
  id: string;
  title: string;
  author: string;
  description: string;
  images: Image[];
  code: string;
}
