import Link from "next/link";
import type { NavLink } from "@/content/types";

export type NavActive = "work" | "about" | "contact" | "articles" | null;

type SiteNavProps = {
  brand: NavLink;
  links: NavLink[];
  /** Current section — homepage has no active Work/About/Contact/Articles */
  active?: NavActive;
};

function isActiveLink(active: NavActive, href: string): boolean {
  if (!active) return false;
  if (active === "work") return href === "/work";
  if (active === "about") return href === "/about";
  if (active === "contact") return href === "/contact";
  if (active === "articles") return href === "/articles";
  return false;
}

export function SiteNav({ brand, links, active = null }: SiteNavProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-atlas-border/60 bg-atlas-elevated">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-4 focus:z-50 focus:bg-atlas-elevated focus:px-3 focus:py-2 focus:text-sm focus:text-atlas-ink"
      >
        Skip to content
      </a>
      <nav
        className="atlas-pad-x mx-auto flex h-[var(--atlas-nav-h)] max-w-[var(--atlas-page)] items-center justify-between"
        aria-label="Primary"
      >
        <Link
          href={brand.href}
          className="font-sans text-[13px] font-semibold text-atlas-ink no-underline"
        >
          {brand.label}
        </Link>

        {/* Tablet + desktop: discrete links */}
        <ul className="hidden list-none items-center gap-7 p-0 tablet:flex desktop:gap-8">
          {links.map((link) => {
            const isActive = isActiveLink(active, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`font-sans text-[13px] no-underline ${
                    isActive
                      ? "font-semibold text-atlas-ink"
                      : "font-normal text-atlas-body"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mobile: condensed string (Navigation System) */}
        <p className="m-0 font-sans text-[11px] text-atlas-body tablet:hidden">
          {links.map((l, i) => {
            const isActive = isActiveLink(active, l.href);
            return (
              <span key={l.href}>
                {i > 0 ? " · " : null}
                <Link
                  href={l.href}
                  className={`no-underline ${
                    isActive
                      ? "font-semibold text-atlas-ink"
                      : "text-atlas-body"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {l.label}
                </Link>
              </span>
            );
          })}
        </p>
      </nav>
    </header>
  );
}
