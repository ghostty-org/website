import s from "./PreviewBanner.module.css";

/**
 * PreviewBanner displays a warning banner when viewing the
 * development/tip version of the site.
 *
 * This component checks the GIT_COMMIT_REF environment variable
 * at build time. When the site is built from the "tip" branch
 * (nightly/development version), it shows a yellow warning banner
 * at the top of every page informing users they're viewing the
 * development version and provides a link to the stable site.
 *
 * The banner is conditionally rendered - it returns null when
 * not on the tip branch, ensuring zero impact on the stable
 * production site.
 */
export default function PreviewBanner() {
  if (process.env.GIT_COMMIT_REF !== "tip") {
    return null;
  }

  return (
    <div className={s.previewBanner}>
      <span>⚠️</span>
      <span>
        You are viewing the website for the tip (nightly) version of Ghostty.
      </span>
      <span className="link">
        <a href="https://ghostty.org">Click here for the latest stable version.</a>
      </span>
    </div>
  );
}
