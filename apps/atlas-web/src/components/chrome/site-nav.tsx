"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { SocialIcons } from "@/components/chrome/social-icons";
import type { SocialLink } from "@/content/chrome";
import type { NavLink } from "@/content/types";

export type NavActive = "work" | "about" | "contact" | "articles" | null;

type SiteNavProps = {
  brand: NavLink;
  links: NavLink[];
  socialLinks: readonly SocialLink[];
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

/**
 * Custom hamburger — three uneven strokes (M9D Approval Polish).
 */
function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block size-[22px]" aria-hidden="true">
      <span
        className={`absolute top-[5px] left-[1px] h-px rounded-full bg-atlas-ink transition-transform ${
          open ? "w-[22px] translate-y-[7px] rotate-45" : "w-[22px]"
        }`}
      />
      <span
        className={`absolute top-[12px] left-[9px] h-px w-[14px] rounded-full bg-atlas-ink transition-opacity ${
          open ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`absolute top-[19px] left-0 h-px rounded-full bg-atlas-ink transition-transform ${
          open ? "left-[1px] w-[22px] -translate-y-[7px] -rotate-45" : "w-[26px]"
        }`}
      />
    </span>
  );
}

export function SiteNav({
  brand,
  links,
  socialLinks,
  active = null,
}: SiteNavProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    queueMicrotask(() => triggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    const firstLink = panelRef.current?.querySelector<HTMLElement>("a");
    firstLink?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <header className="sticky top-0 z-40 border-b border-atlas-border/60 bg-atlas-elevated">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-4 focus:z-50 focus:bg-atlas-elevated focus:px-3 focus:py-2 focus:text-sm focus:text-atlas-ink"
      >
        Skip to content
      </a>
      <nav
        className="atlas-pad-x relative mx-auto flex h-[var(--atlas-nav-h)] max-w-[var(--atlas-page)] items-center justify-between"
        aria-label="Primary"
      >
        <Link
          href={brand.href}
          className="font-sans text-[13px] font-semibold tracking-[0.12em] text-atlas-ink no-underline"
          onClick={() => setOpen(false)}
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

        {/* Mobile: custom hamburger */}
        <button
          ref={triggerRef}
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-[3px] border border-[#cfc7ba] bg-transparent p-0 tablet:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <MenuIcon open={open} />
        </button>

        {open ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 cursor-default bg-atlas-ink/20 tablet:hidden"
              aria-label="Close menu backdrop"
              onClick={close}
            />
            <div
              ref={panelRef}
              id={menuId}
              role="dialog"
              aria-modal="true"
              aria-label="Atlas menu"
              className="absolute top-[calc(100%+4px)] right-[var(--atlas-pad-x)] left-[var(--atlas-pad-x)] z-50 rounded border border-[#bfb7aa] bg-[#f6f1e8] px-5 pt-5 pb-6 tablet:hidden"
            >
              <p className="m-0 font-sans text-[10px] tracking-[0.08em] text-atlas-muted uppercase">
                Atlas menu
              </p>
              <ul className="m-0 mt-4 list-none p-0">
                {links.map((link) => {
                  const isActive = isActiveLink(active, link.href);
                  return (
                    <li
                      key={link.href}
                      className="border-b border-atlas-border last:border-b-0"
                    >
                      <Link
                        href={link.href}
                        className={`block py-3 font-sans text-lg no-underline ${
                          isActive
                            ? "font-semibold text-atlas-ink"
                            : "font-normal text-atlas-ink"
                        }`}
                        aria-current={isActive ? "page" : undefined}
                        onClick={close}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <p className="m-0 mt-5 font-sans text-[10px] tracking-[0.08em] text-atlas-muted uppercase">
                Social
              </p>
              <SocialIcons links={socialLinks} className="mt-2" />
            </div>
          </>
        ) : null}
      </nav>
    </header>
  );
}
