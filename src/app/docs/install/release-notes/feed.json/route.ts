import { NextResponse } from "next/server";
import { generateFeed } from "@/lib/generate-feed";

export async function GET() {
  const feed = await generateFeed();

  return new NextResponse(feed, {
    headers: {
      "Content-Type": "application/feed+json",
    },
  });
}
