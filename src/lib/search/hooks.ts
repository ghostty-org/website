import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DocsSearchEngine } from "./engine";
import { SEARCH_QUERY_PARAM } from "./query-param";

// useDocsSearchEngine exposes the lazily loaded search engine.
// Call prepare to start loading, e.g. when the user hovers the search button.
export function useDocsSearchEngine(): {
  engine: DocsSearchEngine | null;
  failed: boolean;
  prepare: () => void;
} {
  const [engine, setEngine] = useState<DocsSearchEngine | null>(null);
  const [failed, setFailed] = useState(false);

  const prepare = useCallback(() => {
    DocsSearchEngine.load().then(
      (loaded) => {
        setEngine(loaded);
        setFailed(false);
      },
      () => setFailed(true),
    );
  }, []);

  return { engine, failed, prepare };
}

// useSearchShortcut calls onToggle on Cmd/Ctrl+K, or "/" outside text fields.
export function useSearchShortcut(onToggle: () => void): void {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isModK =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      const isSlash = event.key === "/" && !isTypingTarget(event.target);
      if (isModK || isSlash) {
        event.preventDefault();
        onToggle();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onToggle]);
}

// useSearchQueryParam calls onQuery with the `?q=` value whenever it is set or changes.
// It reads search params, so the calling component must be inside <Suspense>.
export function useSearchQueryParam(onQuery: (query: string) => void): void {
  const query = useSearchParams().get(SEARCH_QUERY_PARAM);
  useEffect(() => {
    if (query) {
      onQuery(query);
    }
  }, [query, onQuery]);
}

// useShortcutLabel returns the platform's label for the search shortcut.
// The platform is only known on the client, so it starts as "Ctrl K".
export function useShortcutLabel(): string {
  const [label, setLabel] = useState("Ctrl K");
  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform)) {
      setLabel("⌘K");
    }
  }, []);
  return label;
}

// isTypingTarget reports whether a key event originated from an editable element.
function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}
