import type { Root } from "mdast";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";

// mdxParser parses MDX source into an mdast tree with GFM and MDX syntax enabled.
const mdxParser = unified().use(remarkParse).use(remarkMdx).use(remarkGfm);

// parseMdx parses docs MDX source (without frontmatter) into an mdast tree.
export function parseMdx(source: string): Root {
  return mdxParser.parse(source);
}
