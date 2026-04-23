"use client";

import Link from "next/link";

export type BreadcrumbItem = { name: string; href?: string; current?: true };

type Props = { items: BreadcrumbItem[] };

/**
 * Visible breadcrumb. Use `buildBreadcrumbJsonLd` on the same page for `BreadcrumbList` JSON-LD.
 */
export function BreadcrumbNav({ items }: Props) {
  return (
    <nav
      className="container"
      style={{
        paddingTop: "var(--space-hero-pt)",
        paddingBottom: 12,
        fontSize: 13,
        color: "var(--iw-fg-2)",
        borderBottom: "1px solid var(--iw-hairline)",
      }}
      aria-label="Breadcrumb"
    >
      <ol
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
          listStyle: "none",
          margin: 0,
          padding: 0,
        }}
      >
        {items.map((it, i) => (
          <li key={`${it.name}-${i}`} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            {it.current || !it.href ? (
              <span aria-current={it.current ? "page" : undefined} style={{ color: "var(--iw-fg-1)" }}>
                {it.name}
              </span>
            ) : (
              <Link href={it.href} style={{ color: "var(--color-accent)" }}>
                {it.name}
              </Link>
            )}
            {i < items.length - 1 ? <span aria-hidden> / </span> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
