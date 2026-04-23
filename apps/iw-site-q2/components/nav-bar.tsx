"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { accountsUrl, navLinks } from "@/lib/site";
import { IntraWebSymbol } from "@/components/intraweb-symbol";
import { IntraWebWordmark } from "@/components/intraweb-wordmark";
import { Btn, StatusDot } from "@/components/primitives";

export function NavBar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: scrolled ? "10px 0" : "18px 0",
        background: scrolled ? "rgba(5, 9, 18, 0.72)" : "transparent",
        backdropFilter: scrolled ? "blur(18px) saturate(160%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(18px) saturate(160%)" : "none",
        borderBottom: scrolled ? "1px solid var(--iw-hairline)" : "1px solid transparent",
        transition: "all 280ms var(--ease)",
      }}
    >
      <div className="container nav-shell">
        <div className="nav-shell__left">
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }} aria-label="IntraWeb — home">
            <IntraWebSymbol size={28} priority />
            <IntraWebWordmark size="nav" />
          </Link>

          <div className="nav-shell__links">
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
          <a
            href={accountsUrl}
            rel="noopener noreferrer"
            target="_blank"
            className="nav-shell__signin"
            style={{ padding: "8px 12px", fontSize: 14, fontWeight: 500, whiteSpace: "nowrap" }}
          >
            Sign in
          </a>
          <div className="mono nav-shell__badge">
            <StatusDot color="var(--iw-teal)" size={5} />
            <span>ACCEPTING Q2 ENGAGEMENTS</span>
          </div>
          <Btn variant="secondary" href="/start" icon={false}>
            Get started
          </Btn>
          <Btn variant="primary" href="/diagnostic">
            Get a Free Diagnostic
          </Btn>
        </div>
      </div>
    </nav>
  );
}
