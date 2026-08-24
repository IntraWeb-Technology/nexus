import type { SocialLink } from "@/content/chrome";

type SocialIconsProps = {
  links: readonly SocialLink[];
  className?: string;
};

/**
 * Icon-only social row — accessible names, no visible text beside icons.
 * Story-First chrome: LinkedIn, GitHub, Bluesky, Upwork (Figma 709:2 / 709:11).
 */
export function SocialIcons({ links, className = "" }: SocialIconsProps) {
  return (
    <ul
      className={`m-0 flex list-none items-center gap-4 p-0 ${className}`}
      aria-label="Social profiles"
    >
      {links.map((link) => (
        <li key={link.id}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-8 items-center justify-center overflow-hidden rounded-full border border-atlas-ink/28 font-sans text-xs font-medium text-atlas-ink no-underline"
            aria-label={link.label}
          >
            {link.id === "bluesky" && !link.glyph ? (
              // Native img — Next/Image does not serve local SVG without extra config
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/images/brand/icon-bluesky.svg"
                alt=""
                width={32}
                height={32}
                className="size-8"
                aria-hidden
              />
            ) : (
              <span aria-hidden="true">{link.glyph}</span>
            )}
          </a>
        </li>
      ))}
    </ul>
  );
}
