"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { SocialIcons } from "@/components/chrome/social-icons";
import type { SocialLink } from "@/content/chrome";
import type { NavLink } from "@/content/types";
import {
  motionDurations,
  usePrefersReducedMotion,
} from "@/lib/motion";

export type NavActive = "work" | "about" | "contact" | "articles" | null;

type SiteNavProps = {
  brand: NavLink;
  brandMark?: string;
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
        className={`absolute top-[5px] left-[1px] h-px rounded-full bg-atlas-ink transition-transform duration-[var(--atlas-motion-fast)] ease-[var(--atlas-motion-ease-standard)] ${
          open ? "w-[22px] translate-y-[7px] rotate-45" : "w-[22px]"
        }`}
      />
      <span
        className={`absolute top-[12px] left-[9px] h-px w-[14px] rounded-full bg-atlas-ink transition-opacity duration-[var(--atlas-motion-fast)] ease-[var(--atlas-motion-ease-standard)] ${
          open ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`absolute top-[19px] left-0 h-px rounded-full bg-atlas-ink transition-transform duration-[var(--atlas-motion-fast)] ease-[var(--atlas-motion-ease-standard)] ${
          open ? "left-[1px] w-[22px] -translate-y-[7px] -rotate-45" : "w-[26px]"
        }`}
      />
    </span>
  );
}

function BrandMark({ mark }: { mark: string }) {
  return (
    <span
      className="inline-flex size-[22px] shrink-0 items-center justify-center rounded-full border border-atlas-ink/40 font-display text-[9px] font-semibold text-atlas-ink tablet:size-[24px] tablet:text-[10px] desktop:size-[26px] desktop:text-[11px]"
      aria-hidden="true"
    >
      {mark}
    </span>
  );
}

export function SiteNav({
  brand,
  brandMark = "JS",
  links,
  socialLinks,
  active = null,
}: SiteNavProps) {
  const [open, setOpen] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [closing, setClosing] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    queueMicrotask(() => triggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (open) {
      setRendered(true);
      setClosing(false);
      return;
    }

    if (!rendered) return;

    if (reducedMotion) {
      setRendered(false);
      setClosing(false);
      return;
    }

    setClosing(true);
    const timeout = window.setTimeout(() => {
      setRendered(false);
      setClosing(false);
    }, motionDurations.fast);
    return () => window.clearTimeout(timeout);
  }, [open, reducedMotion, rendered]);

  useEffect(() => {
    if (!open || !rendered) return;

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
  }, [open, rendered, close]);

  return (
    <header className="sticky top-0 z-40 border-b border-atlas-border bg-atlas-paper">
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
          className="inline-flex items-center gap-2.5 font-sans text-[13px] font-semibold tracking-[0.4px] text-atlas-ink no-underline tablet:text-[14px] desktop:text-[15px]"
          onClick={() => setOpen(false)}
        >
          <BrandMark mark={brandMark} />
          <span>{brand.label}</span>
        </Link>

        <ul className="hidden list-none items-center gap-7 p-0 tablet:flex desktop:gap-10">
          {links.map((link) => {
            const isActive = isActiveLink(active, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`font-sans text-[14px] no-underline transition-colors duration-[var(--atlas-motion-fast)] ease-[var(--atlas-motion-ease-standard)] desktop:text-[15px] ${
                    isActive
                      ? "font-semibold text-atlas-ink"
                      : "font-medium text-atlas-umber hover:text-atlas-ink"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <button
          ref={triggerRef}
          type="button"
          className="inline-flex size-9 items-center justify-center border-0 bg-transparent p-0 tablet:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <MenuIcon open={open} />
        </button>

        {rendered ? (
          <div
            ref={panelRef}
            id={menuId}
            role="dialog"
            aria-modal={open ? "true" : undefined}
            aria-label="Menu"
            aria-hidden={open ? undefined : true}
            data-open={open ? "true" : "false"}
            data-closing={closing ? "true" : undefined}
            className="atlas-menu-panel absolute inset-x-0 top-full z-50 border-b border-atlas-border bg-atlas-paper px-6 pt-12 pb-10 tablet:hidden"
          >
            <ul className="m-0 list-none space-y-[1.625rem] p-0">
              {links.map((link) => {
                const isActive = isActiveLink(active, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      tabIndex={open ? 0 : -1}
                      className={`block font-sans text-sm leading-[1.5] no-underline ${
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
            <div
              className="mt-10 mb-6 h-px w-full bg-atlas-ink/20"
              aria-hidden="true"
            />
            <SocialIcons links={socialLinks} />
          </div>
        ) : null}
      </nav>
    </header>
  );
}
