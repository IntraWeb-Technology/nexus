"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export function ContactBlock({
  heading,
  text,
  email,
}: {
  heading: string;
  text: string;
  email: string;
}) {
  return (
    <div className="legal-contact-block">
      <h3>{heading}</h3>
      <p>
        {text}{" "}
        <a href={`mailto:${email}`}>{email}</a>
      </p>
    </div>
  );
}

function TableOfContents({ headings, activeId }: { headings: { id: string; text: string }[]; activeId: string }) {
  if (headings.length < 5) return null;
  return (
    <nav className="legal-toc" aria-label="On this page">
      <p className="legal-toc-title">On this page</p>
      <ul>
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={activeId === h.id ? "legal-toc--active" : undefined}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function LegalPageLayout({
  title,
  eyebrow = "Legal",
  lastUpdated,
  children,
  showToc = false,
}: {
  title: string;
  eyebrow?: string;
  lastUpdated: string;
  children: ReactNode;
  showToc?: boolean;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = useState<{ id: string; text: string }[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (!showToc || !contentRef.current) return;
    const h2s = contentRef.current.querySelectorAll("h2");
    const items: { id: string; text: string }[] = [];
    h2s.forEach((el) => {
      if (!el.id) {
        el.id = (el.textContent || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }
      items.push({ id: el.id, text: (el.textContent || "").replace(/\s+/g, " ").trim() });
    });
    setHeadings(items);
  }, [showToc]);

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    const visible = entries.filter((e) => e.isIntersecting);
    if (visible.length > 0) {
      setActiveId(visible[0]!.target.id);
    }
  }, []);

  useEffect(() => {
    if (!showToc || headings.length < 5 || !contentRef.current) return;
    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: "-96px 0px -60% 0px",
      threshold: 0,
    });
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [showToc, headings, handleIntersect]);

  const showSidebar = showToc && headings.length >= 5;

  return (
    <div className="legal-page-shell">
      <div
        className="container"
        style={
          showSidebar
            ? { maxWidth: 1024, display: "flex", gap: "3rem", alignItems: "flex-start" }
            : undefined
        }
      >
        {showSidebar && <TableOfContents headings={headings} activeId={activeId} />}

        <div
          style={{
            minWidth: 0,
            flex: showSidebar ? 1 : undefined,
            maxWidth: 720,
            margin: showSidebar ? 0 : "0 auto",
            width: "100%",
          }}
        >
          <div className="legal-hero">
            <p className="legal-hero-eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p className="legal-hero-meta">Last updated: {lastUpdated}</p>
            <hr className="legal-hero-rule" />
          </div>
          <div ref={contentRef} className="legal-prose-dark">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
