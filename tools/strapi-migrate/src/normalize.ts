import type { SiteKey } from "./config.js";

/** Normalize slugs: lowercase, trim, collapse separators */
export function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Parse Hashnode-style datePublished strings, ISO dates, and Date-ish values.
 * Returns ISO-8601 or null.
 */
export function normalizeDate(raw: unknown): string | null {
  if (raw == null || raw === "") return null;
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    return raw.toISOString();
  }
  const s = String(raw).trim();
  if (!s) return null;

  // Already ISO-ish
  const isoTry = Date.parse(s);
  if (!Number.isNaN(isoTry)) {
    return new Date(isoTry).toISOString();
  }

  // Hashnode: "Thu Nov 14 2024 05:00:00 GMT+0000 (Coordinated Universal Time)"
  const withoutParen = s.replace(/\s*\([^)]*\)\s*$/, "").trim();
  const retry = Date.parse(withoutParen);
  if (!Number.isNaN(retry)) {
    return new Date(retry).toISOString();
  }

  return null;
}

/** True when name/slug confidently references IntraWeb */
export function mentionsIntraweb(...parts: Array<string | undefined | null>): boolean {
  const hay = parts.filter(Boolean).join(" ").toLowerCase();
  return /\bintraweb\b/.test(hay);
}

/**
 * Site assignment for articles: default personal.
 * Projects/case studies with "intraweb" in name/slug → personal+intraweb when confident.
 */
export function assignSites(opts: {
  type: "article" | "case-study" | "project" | "faq-item" | "navigation" | "service";
  slug: string;
  title?: string;
  id?: string;
  client?: string;
  forced?: SiteKey[];
}): { siteKeys: SiteKey[]; ambiguous: boolean; reason?: string } {
  if (opts.forced?.length) {
    return { siteKeys: opts.forced, ambiguous: false };
  }

  if (opts.type === "article") {
    return { siteKeys: ["personal"], ambiguous: false };
  }

  if (opts.type === "faq-item" || opts.type === "navigation" || opts.type === "service") {
    return { siteKeys: ["intraweb"], ambiguous: false };
  }

  // case-study / project
  const confident = mentionsIntraweb(opts.slug, opts.title, opts.id, opts.client);
  if (confident) {
    return { siteKeys: ["personal", "intraweb"], ambiguous: false };
  }

  // Portfolio-os is personal-only (confident)
  if (
    /\bportfolio[- ]?os\b/i.test([opts.slug, opts.title, opts.id].filter(Boolean).join(" "))
  ) {
    return { siteKeys: ["personal"], ambiguous: false };
  }

  // Default personal for portfolio projects/case studies without intraweb signal
  return { siteKeys: ["personal"], ambiguous: false };
}
