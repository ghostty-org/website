import { visit } from "unist-util-visit";
import { createHeadingIdResolver, headingText } from "./heading-ids.mjs";

// remarkHeadingIds applies stable IDs and de-duplication indices to heading nodes.
export default function remarkHeadingIds() {
  return (node) => {
    // resolveHeadingId de-duplicates IDs so each heading receives a unique anchor.
    const resolveHeadingId = createHeadingIdResolver();

    visit(node, "heading", (headingNode) => {
      if (!Array.isArray(headingNode.children) || headingNode.children.length === 0) {
        return;
      }

      const { id, index } = resolveHeadingId(headingText(headingNode));

      if (!headingNode.data) {
        headingNode.data = {};
      }
      headingNode.data.hProperties = {
        ...headingNode.data.hProperties,
        id,
      };

      if (index >= 2) {
        headingNode.data.hProperties = {
          ...headingNode.data.hProperties,
          "data-index": index.toString(),
        };
      }
    });
  };
}
