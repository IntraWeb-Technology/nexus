import { AppLink } from "@/components/chrome/app-link";
import type { NavLink } from "@/content/types";

/** Shared primary CTA surface — umber fill, paper text, centered (M9D). */
export const atlasPrimaryButtonClassName =
  "inline-flex items-center justify-center rounded-[3px] bg-atlas-umber px-[18px] py-3 text-center font-sans text-xs font-semibold text-atlas-paper no-underline transition-[background-color,color,opacity,transform] duration-[var(--atlas-motion-fast)] ease-[var(--atlas-motion-ease-standard)] hover:opacity-90 active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atlas-ink disabled:cursor-not-allowed disabled:opacity-60";

/** Story-First primary CTA — rust fill, white text (Figma 705:70). */
export const atlasStoryPrimaryButtonClassName =
  "inline-flex items-center justify-center rounded-[2px] bg-atlas-rust px-8 py-4 text-center font-sans text-[15px] font-semibold text-white no-underline transition-[background-color,color,opacity,transform] duration-[var(--atlas-motion-fast)] ease-[var(--atlas-motion-ease-standard)] hover:opacity-90 active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atlas-ink disabled:cursor-not-allowed disabled:opacity-60";

/** Story-First secondary CTA — ink outline on paper (Figma 705:72). */
export const atlasStorySecondaryButtonClassName =
  "inline-flex items-center justify-center rounded-[2px] border border-atlas-ink/35 bg-transparent px-8 py-4 text-center font-sans text-[15px] font-semibold text-atlas-ink no-underline transition-[background-color,color,opacity,transform] duration-[var(--atlas-motion-fast)] ease-[var(--atlas-motion-ease-standard)] hover:bg-atlas-ink/5 active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atlas-ink disabled:cursor-not-allowed disabled:opacity-60";

type AtlasPrimaryButtonProps = {
  href: string;
  children: string;
  className?: string;
};

/**
 * Primary CTA — umber fill, paper text, centered label (M9D Approval Polish).
 * Shared by Articles cue, Article contact, Home/Case/About bridges.
 */
export function AtlasPrimaryButton({
  href,
  children,
  className = "",
}: AtlasPrimaryButtonProps) {
  return (
    <AppLink
      href={href}
      className={`${atlasPrimaryButtonClassName} ${className}`.trim()}
    >
      {children}
    </AppLink>
  );
}

type AtlasCtaPairProps = {
  cta: NavLink;
  workLink: NavLink;
  /** Horizontal pair on desktop cue; stacked on contact bridge. */
  layout?: "row" | "stack";
};

export function AtlasCtaPair({
  cta,
  workLink,
  layout = "row",
}: AtlasCtaPairProps) {
  return (
    <div
      className={
        layout === "row"
          ? "flex flex-wrap items-center gap-x-5 gap-y-3 pt-1"
          : "flex flex-col items-start gap-3 pt-1"
      }
    >
      <AtlasPrimaryButton href={cta.href}>{cta.label}</AtlasPrimaryButton>
      <AppLink
        href={workLink.href}
        className="font-sans text-xs text-atlas-ink no-underline transition-colors duration-[var(--atlas-motion-fast)] ease-[var(--atlas-motion-ease-standard)] hover:text-atlas-umber"
      >
        {workLink.label}
      </AppLink>
    </div>
  );
}
