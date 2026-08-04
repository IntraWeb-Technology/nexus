"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { accountsUrl, navLinks as defaultNavLinks, systemsCallUrl } from "@/lib/site";
import type { SiteNavLink } from "@/lib/cms-content-types";
import { IntraWebLogo } from "@/components/intraweb-logo";
import { Btn } from "@/components/primitives";
import { Ic } from "@/components/icons";

const WIDE_BP = 960;

type Props = {
  /** Optional CMS/header links; defaults to hardcoded `navLinks` from `lib/site`. */
  links?: SiteNavLink[];
};

export function NavBar({ links }: Props = {}) {
  const navLinks = links?.length ? links : defaultNavLinks;
  const pathname = usePathname();
  const menuId = useId();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = useCallback(() => setMenuOpen(false), []);
  const toggle = useCallback(() => setMenuOpen((o) => !o), []);

  useEffect(() => {
    queueMicrotask(() => close());
  }, [pathname, close]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, close]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => {
      if (window.innerWidth >= WIDE_BP) setMenuOpen(false);
    };
    const mq = window.matchMedia(`(min-width: ${WIDE_BP}px)`);
    const onMq = () => {
      if (mq.matches) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize, { passive: true });
    mq.addEventListener("change", onMq);
    onResize();
    return () => {
      window.removeEventListener("resize", onResize);
      mq.removeEventListener("change", onMq);
    };
  }, []);

  const linkPointer = { pointerEvents: "auto" as const };

  const mobileOverlay =
    menuOpen && typeof document !== "undefined"
      ? createPortal(
          <>
            <button type="button" className="nav-mobile-dim" aria-label="Close menu" onClick={close} />
            <div
              id={menuId}
              className="nav-mobile-panel"
              style={{ pointerEvents: "none" }}
              role="dialog"
              aria-label="Menu"
            >
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {navLinks.map(({ label, href }) => {
                  const active = pathname === href;
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className="nav-mobile-panel__item"
                        onClick={close}
                        style={linkPointer}
                        aria-current={active ? "page" : undefined}
                      >
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div
                className="nav-mobile-panel__section"
                style={{ borderTop: "1px solid var(--iw-hairline)", marginTop: 8, paddingTop: 4 }}
              >
                <p className="nav-mobile-panel__eyebrow">Account</p>
                <a
                  href={accountsUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="nav-mobile-panel__item"
                  style={linkPointer}
                >
                  Sign in
                </a>
              </div>
              <div className="nav-mobile-panel__section">
                <p className="nav-mobile-panel__eyebrow">Next step</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, pointerEvents: "auto" }}>
                  <Btn variant="primary" href={systemsCallUrl} onClick={close}>
                    Book a Systems Call
                  </Btn>
                </div>
              </div>
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: menuOpen ? 200 : 50,
          padding: scrolled ? "10px 0" : "16px 0",
          background:
            menuOpen || scrolled ? "rgba(7, 16, 25, 0.94)" : "rgba(7, 16, 25, 0.35)",
          backdropFilter: "none",
          WebkitBackdropFilter: "none",
          borderBottom: menuOpen || scrolled ? "1px solid var(--iw-border-soft)" : "1px solid transparent",
          transition: "all 280ms var(--ease)",
        }}
      >
        <div className="container nav-shell">
          <div className="nav-shell__left">
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }} aria-label="IntraWeb — home">
              <IntraWebLogo height={36} priority />
            </Link>

            <div className="nav-desktop-only nav-shell__links">
              {navLinks.map(({ label, href }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    style={{
                      padding: "8px 12px",
                      fontSize: 14,
                      borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
                      marginBottom: -2,
                      fontWeight: active ? 600 : 400,
                      color: active ? "var(--accent)" : "var(--iw-fg-1)",
                    }}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="nav-shell__right">
            <div
              className="nav-desktop-only"
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "10px 14px",
              }}
            >
              <a
                href={accountsUrl}
                rel="noopener noreferrer"
                target="_blank"
                className="nav-shell__signin"
                style={{ padding: "8px 12px", fontSize: 14, fontWeight: 500, whiteSpace: "nowrap" }}
              >
                Sign in
              </a>
              <a className="btn btn-outline-accent" href={systemsCallUrl}>
                <span>Book a Systems Call</span>
                <span className="arrow" aria-hidden>
                  →
                </span>
              </a>
            </div>
            <button
              type="button"
              className="nav-mobile-only nav-shell__menu-btn"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls={menuOpen ? menuId : undefined}
              onClick={toggle}
            >
              {menuOpen ? <Ic.x width={20} height={20} /> : <Ic.menu width={20} height={20} />}
            </button>
          </div>
        </div>
      </nav>
      {mobileOverlay}
    </>
  );
}
