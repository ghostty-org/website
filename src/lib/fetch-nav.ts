import {
  BreakNode,
  FolderNode,
  LinkNode,
  NavTreeNode,
} from "@/components/nav-tree";
import { promises as fs } from "fs";

// The format that is stored inside of the nav.json file slightly differs
// from what is required from the nav-tree. Specifically, there is no concept
// of "open" (for folders) or "active" (for links), as the nav.json does not
// concern itself with the context page in which you are viewing the nav from.
type NavFileFolderNode = Omit<Omit<FolderNode, "open">, "children"> & {
  children: NavFileFolderNode[];
};
type NavFileLinkNode = Omit<LinkNode, "active">;
type NavFileBreakNode = BreakNode;
type NavFileNavTreeNode =
  | NavFileFolderNode
  | NavFileLinkNode
  | NavFileBreakNode;
type NavFile = {
  items: NavFileNavTreeNode[];
};

// loadDocsNavTreeData will load the NavTreeNodes from our nav.json file
// and set them in an appropriate initial state for the activePageSlug.
export async function loadDocsNavTreeData(
  docsDirectory: string,
  activePageSlug: string
): Promise<NavTreeNode[]> {
  const docsFilePath = `${docsDirectory}/nav.json`;
  try {
    const data = await fs.readFile(docsFilePath, "utf8");
    const jsonData: NavFile = JSON.parse(data);
    return contextualizeNavFile(jsonData, activePageSlug);
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error(
        `Failed to parse ${docsFilePath}:

${err.message}}`,
        { cause: err }
      );
    }
    throw err;
  }
}

// contextualizeNavFile converts the NavFile, into the NavTreeNodes[]
// in a state which is appropriate for the initial page-load for a page
// with the given activePageSlug.
function contextualizeNavFile(
  navFile: NavFile,
  activePageSlug: string
): Array<NavTreeNode> {
  return [
    {
      type: "link",
      path: "",
      title: "Introduction",
      active: activePageSlug === "index",
    },
    ...navFile.items.map(contextualizeNavTreeNode(activePageSlug, "")),
  ];
}

function contextualizeNavTreeNode(
  activePageSlug: string,
  accumulatedSlug: string
): (a: NavFileNavTreeNode) => NavTreeNode {
  return (t: NavFileNavTreeNode): NavTreeNode => {
    switch (t.type) {
      case "break":
        return t;
      case "folder":
        var nextAccSlug = `${accumulatedSlug}${t.path.substring(1)}/`;
        return {
          type: "folder",
          title: t.title,
          path: t.path,
          open: activePageSlug.startsWith(nextAccSlug.slice(0, -1)),
          children: t.children.map(
            contextualizeNavTreeNode(activePageSlug, nextAccSlug)
          ),
        } as FolderNode;
      case "link":
        var fullSlug = `${accumulatedSlug}${t.path.substring(1)}`;
        // The value of `fullSlug` for index pages end up having
        // a trailing slash. Remove that so we can compare against
        // the activePageSlug (which will never have a trailing
        // slash due to our redirect rules).
        fullSlug =
          fullSlug.slice(-1) === "/" ? fullSlug.slice(0, -1) : fullSlug;
        return {
          type: "link",
          title: t.title,
          path: t.path,
          active: activePageSlug === fullSlug,
        } as LinkNode;
      default:
        throw new Error(
          `There is an unexpected item in the 'nav.json' file:
${JSON.stringify(t, null, 2)}`
        );
    }
  };
}
