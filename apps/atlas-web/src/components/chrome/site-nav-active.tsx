"use client";

import { usePathname } from "next/navigation";
import { SiteNav } from "@/components/chrome/site-nav";
import type { NavLink } from "@/content/types";

type SiteNavActiveProps = {
  brand: NavLink;
  links: NavLink[];
};

function activeFromPath(
  pathname: string,
): "work" | "about" | "contact" | null {
  if (pathname === "/work" || pathname.startsWith("/work/")) return "work";
  if (pathname === "/about" || pathname.startsWith("/about/")) return "about";
  if (pathname === "/contact" || pathname.startsWith("/contact/"))
    return "contact";
  return null;
}

/** Client island — route-derived aria-current only. */
export function SiteNavActive({ brand, links }: SiteNavActiveProps) {
  const pathname = usePathname();
  return (
    <SiteNav brand={brand} links={links} active={activeFromPath(pathname)} />
  );
}
