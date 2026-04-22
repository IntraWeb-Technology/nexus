"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { navLinks } from "@/lib/site";
import { Btn, StatusDot } from "@/components/primitives";

export function NavBar() {
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
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 26,
              height: 26,
              position: "relative",
              display: "grid",
              placeItems: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, var(--iw-teal) 0%, var(--iw-amber) 100%)",
                borderRadius: 4,
                filter: "blur(8px)",
                opacity: 0.6,
              }}
            />
            <div
              style={{
                position: "relative",
                width: 24,
                height: 24,
                background: "var(--iw-fg)",
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--iw-display)",
                fontWeight: 800,
                fontSize: 13,
                color: "var(--iw-void)",
                letterSpacing: "-0.03em",
              }}
            >
              IW
            </div>
          </div>
          <span
            style={{
              fontFamily: "var(--iw-display)",
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: "-0.02em",
            }}
          >
            IntraWeb Technologies
          </span>
        </Link>

        <div className="nav-shell__links">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              style={{
                padding: "8px 12px",
                fontSize: 14,
                color: "var(--iw-fg-1)",
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="nav-shell__cta">
          <div className="mono nav-shell__badge">
            <StatusDot color="var(--iw-teal)" size={5} />
            <span>ACCEPTING Q2 ENGAGEMENTS</span>
          </div>
          <Btn variant="primary" icon href="/diagnostic">
            Get a Free Diagnostic
          </Btn>
        </div>
      </div>
    </nav>
  );
}
