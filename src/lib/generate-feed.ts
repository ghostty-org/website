import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import { Feed } from "feed";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

const BASE_URL = "https://ghostty.org";
const RELEASE_NOTES_DIRECTORY = "./docs/install/release-notes/";
const FEED_FILENAME = "feed.json";

async function mdToHtml(md: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(md);

  return result.toString();
}

export async function generateFeed(): Promise<string> {
  const releaseNotesUrl = new URL(RELEASE_NOTES_DIRECTORY, BASE_URL).href;
  const feedUrl = new URL(FEED_FILENAME, releaseNotesUrl).href;
  const currentYear = new Date().getFullYear();

  const feed = new Feed({
    title: "Ghostty Release Notes",
    description: "Release notes for Ghostty",
    id: feedUrl,
    link: releaseNotesUrl,
    feedLinks: {
      json: feedUrl,
    },
    favicon: new URL("favicon.ico", BASE_URL).href,
    copyright: `© ${currentYear} Mitchell Hashimoto`,
  });

  const releaseNotesDir = path.join(process.cwd(), RELEASE_NOTES_DIRECTORY);
  const filenames = (await fs.readdir(releaseNotesDir, { withFileTypes: true }))
    .filter((dirent) =>
      dirent.isFile() && dirent.name !== "index.mdx" &&
      dirent.name.endsWith(".mdx")
    )
    .map((dirent) => dirent.name)
    .toReversed();

  for (const filename of filenames) {
    const filePath = path.join(RELEASE_NOTES_DIRECTORY, filename);

    const { data, content } = matter.read(filePath);
    const contentHtml = await mdToHtml(content);

    const slug = filename.replace(".mdx", "");

    const fileUrl = new URL(slug, releaseNotesUrl).href;
    const dateString = data.description?.match(
      /released on ([A-Za-z]+ \d+, \d{4})/i,
    )?.[1];
    const date = dateString ? new Date(dateString) : new Date();

    feed.addItem({
      title: data.title,
      id: fileUrl,
      link: fileUrl,
      description: data.description,
      content: contentHtml,
      date,
    });
  }

  return feed.json1();
}
