"use client";

import { usePathname } from "next/navigation";
import {
  SiteNav,
  type NavActive,
} from "@/components/chrome/site-nav";
import type { SocialLink } from "@/content/chrome";
import type { NavLink } from "@/content/types";

type SiteNavActiveProps = {
  brand: NavLink;
  links: NavLink[];
  socialLinks: readonly SocialLink[];
};

function activeFromPath(pathname: string): NavActive {
  if (pathname === "/work" || pathname.startsWith("/work/")) return "work";
  if (pathname === "/about" || pathname.startsWith("/about/")) return "about";
  if (pathname === "/contact" || pathname.startsWith("/contact/"))
    return "contact";
  if (pathname === "/articles" || pathname.startsWith("/articles/"))
    return "articles";
  return null;
}

/** Client island — route-derived aria-current + mobile menu. */
export function SiteNavActive({
  brand,
  links,
  socialLinks,
}: SiteNavActiveProps) {
  const pathname = usePathname();
  return (
    <SiteNav
      brand={brand}
      links={links}
      socialLinks={socialLinks}
      active={activeFromPath(pathname)}
    />
  );
}
