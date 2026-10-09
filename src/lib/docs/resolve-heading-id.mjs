import slugify from "slugify";

/**
 * EasyList / Fanboy Annoyances ships a global cosmetic filter
 * `###desktop-notifications` that hides any element with that id
 * (notification-permission nags). Our config reference heading for the
 * `desktop-notifications` option therefore disappears for uBlock users —
 * see https://github.com/ghostty-org/website/issues/387.
 *
 * Remap known colliding ids to a prefixed form so anchors and the TOC
 * still work with ad blockers enabled. Display text is unchanged.
 */
const AD_BLOCKER_ID_ALIASES = {
  "desktop-notifications": "config-desktop-notifications",
};

// resolveHeadingBaseId slugifies heading text, then applies ad-blocker aliases.
export function resolveHeadingBaseId(text) {
  const baseId = slugify(text.toLowerCase());
  return AD_BLOCKER_ID_ALIASES[baseId] ?? baseId;
}
