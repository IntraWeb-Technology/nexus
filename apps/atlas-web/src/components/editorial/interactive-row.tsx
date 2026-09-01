/**
 * Semantic interactive row — compose onto existing `<Link>` / `<a>`.
 * Does not replace anchors with buttons or clickable divs.
 */

export const interactiveRowClassName =
  "atlas-interactive-row no-underline";

export const interactiveRowTitleClassName = "atlas-interactive-title";

export const interactiveRowArrowClassName = "atlas-interactive-arrow";

type InteractiveRowClassOptions = {
  className?: string;
};

/** Merge InteractiveRow affordance classes onto an existing link className. */
export function interactiveRowClasses({
  className = "",
}: InteractiveRowClassOptions = {}): string {
  return `${interactiveRowClassName} ${className}`.trim();
}
