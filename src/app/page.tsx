import HomeContent from "./HomeContent";
import { loadAllTerminalFiles } from "./terminal-data";
import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/metadata";

/** Defines document metadata for the Ghostty homepage. */
export const metadata: Metadata = {
  ...canonicalMetadata("/"),
  title: "Ghostty",
  description:
    "Ghostty is a fast, feature-rich, and cross-platform terminal emulator that uses platform-native UI and GPU acceleration.",
};

/** Loads homepage terminal data and renders the client-side home content. */
export default async function HomePage() {
  const terminalData = await loadAllTerminalFiles("/home");
  return <HomeContent terminalData={terminalData} />;
}
