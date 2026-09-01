/**
 * Application-static site chrome (M8A: navigation remains application-owned).
 * Story-First Navigation / Chrome (Figma 705:2).
 * Not migrated to Strapi.
 */

import type { NavLink } from "@/content/types";

export type SocialLink = {
  id: "linkedin" | "github" | "bluesky" | "upwork";
  label: string;
  href: string;
  /** Visible glyph for text-styled icon buttons (Bluesky may use SVG). */
  glyph?: string;
};

export const siteChrome = {
  brand: { label: "JOHN SCHIBELLI", href: "/" },
  brandMark: "JS",
  navLinks: [
    { label: "Work", href: "/work" },
    { label: "Articles", href: "/articles" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ] satisfies NavLink[],
  footerLinks: [
    { label: "Work", href: "/work" },
    { label: "Articles", href: "/articles" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Docs", href: "/docs" },
  ] satisfies NavLink[],
  copyright: "© 2026 John Schibelli — Atlas",
  socialLinks: [
    {
      id: "linkedin",
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/johnschibelli",
      glyph: "in",
    },
    {
      id: "github",
      label: "GitHub",
      href: "https://github.com/johnschibelli",
      glyph: "gh",
    },
    {
      id: "bluesky",
      label: "Bluesky",
      href: "https://bsky.app/profile/johnschibelli.bsky.social",
      glyph: "b",
    },
    {
      id: "upwork",
      label: "Upwork",
      href: "https://www.upwork.com/freelancers/~johnschibelli",
      glyph: "up",
    },
  ] satisfies SocialLink[],
  mark: "JS",
} as const;
