import { DOCS_DIRECTORY } from "@/lib/docs/config";
import { buildDocsSearchIndex } from "@/lib/search/build-index";

// Generate the index once at build time and serve it as a static file.
export const dynamic = "force-static";

// GET returns every docs section as JSON for the client-side search dialog.
export async function GET(): Promise<Response> {
  return Response.json(await buildDocsSearchIndex(DOCS_DIRECTORY));
}
