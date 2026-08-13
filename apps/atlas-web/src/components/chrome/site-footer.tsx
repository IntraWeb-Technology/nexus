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
 * Centered footer stack — nav · copyright · icon-only socials (M9D).
 */
export function SiteFooter({ links, copyright, socialLinks }: SiteFooterProps) {
  return (
    <footer className="border-t border-atlas-border bg-atlas-paper">
      <div className="atlas-pad-x mx-auto flex max-w-[var(--atlas-page)] flex-col items-center gap-2 py-[18px]">
        <nav aria-label="Footer">
          <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-x-2 gap-y-1 p-0 font-sans text-xs text-atlas-body">
            {links.map((link, i) => (
              <li key={link.href} className="flex items-center gap-2">
                {i > 0 ? <span aria-hidden="true">·</span> : null}
                <Link href={link.href} className="text-atlas-body no-underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="m-0 font-sans text-xs text-atlas-body">{copyright}</p>
        <SocialIcons links={socialLinks} />
      </div>
    </footer>
  );
}
