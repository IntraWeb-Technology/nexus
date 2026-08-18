/**
 * Application-static site chrome (M8A: navigation remains application-owned).
 * Not migrated to Strapi.
 */

import type { NavLink } from "@/content/types";

export type SocialLink = {
  id: "linkedin" | "facebook" | "upwork" | "bluesky";
  label: string;
  href: string;
  /** Visible glyph for text-styled icon buttons (Bluesky uses SVG instead). */
  glyph?: string;
};

export const siteChrome = {
  brand: { label: "ATLAS", href: "/" },
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
  ] satisfies NavLink[],
  copyright: "© 2026 johnschibelli.dev",
  socialLinks: [
    {
      id: "linkedin",
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/johnschibelli",
      glyph: "in",
    },
    {
      id: "facebook",
      label: "Facebook",
      href: "https://www.facebook.com/johnschibelli",
      glyph: "f",
    },
    {
      id: "upwork",
      label: "Upwork",
      href: "https://www.upwork.com/freelancers/~johnschibelli",
      glyph: "up",
    },
    {
      id: "bluesky",
      label: "Bluesky",
      href: "https://bsky.app/profile/johnschibelli.bsky.social",
    },
  ] satisfies SocialLink[],
  mark: "ATLAS",
} as const;
