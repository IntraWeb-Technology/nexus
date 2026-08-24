import Link from "next/link";
import { SocialIcons } from "@/components/chrome/social-icons";
import type { SocialLink } from "@/content/chrome";
import type { NavLink } from "@/content/types";

type SiteFooterProps = {
  links: NavLink[];
  copyright: string;
  socialLinks: readonly SocialLink[];
};

/**
 * Story-First footer — copyright · socials · links (Figma 705:58).
 */
export function SiteFooter({ links, copyright, socialLinks }: SiteFooterProps) {
  return (
    <footer className="border-t border-atlas-border bg-atlas-paper">
      <div className="atlas-pad-x mx-auto flex max-w-[var(--atlas-page)] flex-col gap-5 py-6 tablet:flex-row tablet:items-center tablet:justify-between tablet:gap-6 tablet:py-8">
        <p className="m-0 font-sans text-[13px] text-atlas-body">{copyright}</p>
        <SocialIcons links={socialLinks} className="order-3 tablet:order-none" />
        <nav aria-label="Footer">
          <ul className="m-0 flex list-none flex-wrap items-center gap-x-7 gap-y-2 p-0 font-sans text-[13px] text-atlas-umber">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-atlas-umber no-underline hover:text-atlas-ink">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
