import { ShowcaseContent } from "@/types/showcase";
import { promises as fs } from "fs";

export async function loadShowcaseContent(): Promise<ShowcaseContent[]> {
  const docsFilePath = `showcase/showcaseConfig.json`;
  try {
    const data = await fs.readFile(docsFilePath, "utf8");
    const jsonData: { content: ShowcaseContent[] } = JSON.parse(data);
    return jsonData.content;
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error(
        `Failed to parse showcase content:

${err.message}}`,
        { cause: err },
      );
    }
    throw err;
  }
}
