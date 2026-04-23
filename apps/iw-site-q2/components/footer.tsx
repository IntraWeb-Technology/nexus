import Link from "next/link";
import { companyLegalName, contactEmail } from "@/lib/site";
import { IntraWebSymbol } from "@/components/intraweb-symbol";
import { IntraWebWordmark } from "@/components/intraweb-wordmark";
import { StatusDot } from "@/components/primitives";
import { Ic } from "@/components/icons";

const footerColumns = [
  {
    h: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Work", href: "/work" },
      { label: "Blog", href: "/blog" },
      { label: "Get started", href: "/start" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    h: "Services",
    links: [
      { label: "Services overview", href: "/services" },
      { label: "Diagnostic", href: "/diagnostic" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    h: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer
      style={{
        padding: "80px 0 40px",
        borderTop: "1px solid var(--iw-hairline)",
        position: "relative",
        zIndex: 2,
      }}
    >
      <div className="container">
        <div
          style={{
            fontFamily: "var(--iw-display)",
            fontSize: "clamp(80px, 16vw, 240px)",
            fontWeight: 800,
            letterSpacing: "-0.055em",
            lineHeight: 0.9,
            background: "linear-gradient(180deg, var(--iw-fg-1) 0%, transparent 120%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: 60,
            userSelect: "none",
          }}
        >
          IntraWeb
          <span style={{ color: "var(--accent)", WebkitTextFillColor: "var(--accent)" }}>.</span>
        </div>

        <div className="footer-grid">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <IntraWebSymbol size={24} />
              <IntraWebWordmark size="compact" />
            </div>
            <p style={{ fontSize: 14, color: "var(--iw-fg-2)", maxWidth: 340, lineHeight: 1.55 }}>
              AI systems and automation infrastructure for SMBs that want to operate smarter. Based in New Jersey,
              serving the NY metro area and remote nationwide.
            </p>
            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
              <a
                href={`mailto:${contactEmail}`}
                className="footer-icon-link"
                aria-label="Email"
                style={{
                  width: 36,
                  height: 36,
                  border: "1px solid var(--iw-hairline)",
                  borderRadius: 4,
                  display: "grid",
                  placeItems: "center",
                  color: "var(--iw-fg-1)",
                }}
              >
                <Ic.mail width={16} height={16} />
              </a>
              <a
                href="https://www.linkedin.com/"
                className="footer-icon-link"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: 36,
                  height: 36,
                  border: "1px solid var(--iw-hairline)",
                  borderRadius: 4,
                  display: "grid",
                  placeItems: "center",
                  color: "var(--iw-fg-1)",
                }}
              >
                <Ic.linkedin width={16} height={16} />
              </a>
              <a
                href="https://github.com/"
                className="footer-icon-link"
                aria-label="GitHub"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: 36,
                  height: 36,
                  border: "1px solid var(--iw-hairline)",
                  borderRadius: 4,
                  display: "grid",
                  placeItems: "center",
                  color: "var(--iw-fg-1)",
                }}
              >
                <Ic.github width={16} height={16} />
              </a>
            </div>
          </div>

          {footerColumns.map((col) => (
            <div key={col.h}>
              <div
                className="mono"
                style={{ fontSize: 10, color: "var(--iw-fg-3)", letterSpacing: "0.2em", marginBottom: 16 }}
              >
                {col.h.toUpperCase()}
              </div>
              <ul
                style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}
              >
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} style={{ fontSize: 14, color: "var(--iw-fg-1)" }}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          style={{
            paddingTop: 30,
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            fontFamily: "var(--iw-mono)",
            fontSize: 11,
            color: "var(--iw-fg-3)",
            letterSpacing: "0.1em",
          }}
        >
          <span>© 2026 {companyLegalName}</span>
          <span style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span>
              <StatusDot size={5} /> SYSTEM OPERATIONAL
            </span>
            <span>NJ · USA</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
