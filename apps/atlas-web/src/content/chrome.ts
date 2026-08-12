/**
 * Application-static site chrome (M8A: navigation remains application-owned).
 * Not migrated to Strapi.
 */

import type { NavLink } from "@/content/types";

export const siteChrome = {
  brand: { label: "ATLAS", href: "/" },
  navLinks: [
    { label: "Work", href: "/work" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Articles", href: "/articles" },
  ] satisfies NavLink[],
  footerLinks: [
    { label: "Work", href: "/work" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Articles", href: "/articles" },
  ] satisfies NavLink[],
  mark: "ATLAS",
} as const;
