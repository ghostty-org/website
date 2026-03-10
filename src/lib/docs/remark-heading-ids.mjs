import slugify from "slugify";
import { visit } from "unist-util-visit";

// remarkHeadingIds applies stable IDs and de-duplication indices to heading nodes.
export default function remarkHeadingIds() {
  return (node) => {
    // encounteredIDs tracks duplicate IDs so each heading receives a unique anchor.
    const encounteredIDs = new Map();

    visit(node, "heading", (headingNode) => {
      if (!Array.isArray(headingNode.children) || headingNode.children.length === 0) {
        return;
      }

      const text = headingNode.children
        .map((child) => (typeof child.value === "string" ? child.value : ""))
        .join("");
      const baseId = slugify(text.toLowerCase());
      const encounteredCount = (encounteredIDs.get(baseId) || 0) + 1;
      encounteredIDs.set(baseId, encounteredCount);
      const resolvedID = encounteredCount >= 2 ? `${baseId}-${encounteredCount}` : baseId;

      if (!headingNode.data) {
        headingNode.data = {};
      }
      headingNode.data.hProperties = {
        ...headingNode.data.hProperties,
        id: resolvedID,
      };

      if (encounteredCount >= 2) {
        headingNode.data.hProperties = {
          ...headingNode.data.hProperties,
          "data-index": encounteredCount.toString(),
        };
      }
    });
  };
}
