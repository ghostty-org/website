import { execFileSync } from "node:child_process";

// COMMIT_DATE_SENTINEL prefixes each commit date in `git log` output. `git log
// --name-only` interleaves commit headers with bare file paths, and a path is
// otherwise indistinguishable from a header, so the date line is marked with a
// NUL byte -- the one character a path cannot contain.
const COMMIT_DATE_SENTINEL = "\0";

// COMMIT_DATE_FORMAT asks git for that same sentinel using git's own `%x00`
// escape rather than a literal NUL. The two are not interchangeable: Node
// rejects any argv entry containing a NUL byte outright, so the sentinel can
// only reach git as an escape for git itself to expand.
const COMMIT_DATE_FORMAT = "--pretty=format:%x00%cI";

// GIT_LOG_MAX_BUFFER caps the `git log` output we are willing to read. The
// default 1MB is not enough for a repository with a few thousand commits when
// every touched path is listed.
const GIT_LOG_MAX_BUFFER = 64 * 1024 * 1024;

// LastModifiedByPath maps a repository-relative path to the commit date of the
// most recent commit that touched it.
export type LastModifiedByPath = ReadonlyMap<string, Date>;

// runGit runs one git command in the working directory, returning its stdout,
// or null if git is missing, this is not a repository, or the command failed.
// Every caller treats a null as "git cannot tell us", never as an error.
function runGit(args: string[]): string | null {
  try {
    return execFileSync("git", args, {
      encoding: "utf8",
      maxBuffer: GIT_LOG_MAX_BUFFER,
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null;
  }
}

// isUsableRepository reports whether git history here is complete enough to
// date files from, explaining on stderr when it is not.
//
// A shallow clone is the case that matters, because it fails silently rather
// than loudly: `git log -- some/file` in a shallow clone still answers, but for
// any file last touched before the clone's boundary it answers with the
// boundary commit's date instead. Every such file then claims to have been
// modified on the same recent day. That is worse than saying nothing, so we
// say nothing.
function isUsableRepository(): boolean {
  if (runGit(["rev-parse", "--is-inside-work-tree"])?.trim() !== "true") {
    console.warn(
      "sitemap: not a git working tree, omitting <lastmod> from the sitemap.",
    );
    return false;
  }

  if (runGit(["rev-parse", "--is-shallow-repository"])?.trim() === "true") {
    console.warn(
      "sitemap: shallow git clone, omitting <lastmod> from the sitemap. " +
        "Set VERCEL_DEEP_CLONE=true (Vercel clones with --depth=10 by " +
        "default) so that file modification dates can be read from history.",
    );
    return false;
  }

  return true;
}

// loadGitLastModified returns the date of the most recent commit to touch each
// path in the repository.
//
// The map is empty whenever git cannot answer reliably. Callers are expected
// to omit `lastModified` for a path that is absent rather than substituting
// something -- a file's mtime is the checkout's own mtime on a fresh CI
// checkout, so falling back to it would date every page to the deploy.
export function loadGitLastModified(): LastModifiedByPath {
  const lastModifiedByPath = new Map<string, Date>();
  if (!isUsableRepository()) return lastModifiedByPath;

  // `git log` walks newest first, so the first time a path appears is the last
  // time it was committed. Merge commits list no paths of their own, which is
  // what we want: they introduce no changes to date a file from.
  const gitLog = runGit([
    // Without this git escapes any path containing a non-ASCII byte into a
    // C-style quoted string, which would not match the path we look up.
    "-c",
    "core.quotePath=false",
    "log",
    COMMIT_DATE_FORMAT,
    "--name-only",
  ]);
  if (gitLog === null) {
    console.warn(
      "sitemap: `git log` failed, omitting <lastmod> from the sitemap.",
    );
    return lastModifiedByPath;
  }

  let commitDate: Date | null = null;
  for (const line of gitLog.split("\n")) {
    if (line.startsWith(COMMIT_DATE_SENTINEL)) {
      const parsed = new Date(line.slice(COMMIT_DATE_SENTINEL.length));
      commitDate = Number.isNaN(parsed.getTime()) ? null : parsed;
      continue;
    }

    const path = line.trim();
    if (path === "" || commitDate === null) continue;
    if (!lastModifiedByPath.has(path)) lastModifiedByPath.set(path, commitDate);
  }

  return lastModifiedByPath;
}
