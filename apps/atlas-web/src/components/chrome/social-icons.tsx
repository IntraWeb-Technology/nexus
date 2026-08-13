import type { SocialLink } from "@/content/chrome";

type SocialIconsProps = {
  links: readonly SocialLink[];
  className?: string;
};

/**
 * Icon-only social row — accessible names, no visible text beside icons.
 */
export function SocialIcons({ links, className = "" }: SocialIconsProps) {
  return (
    <ul
      className={`m-0 flex list-none items-center gap-2 p-0 ${className}`}
      aria-label="Social profiles"
    >
      {links.map((link) => (
        <li key={link.id}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={
              link.id === "bluesky"
                ? "inline-flex size-7 overflow-hidden rounded-full no-underline"
                : "inline-flex size-7 items-center justify-center rounded-full border border-[#bfb7aa] font-sans text-[10px] font-medium text-atlas-ink no-underline"
            }
            aria-label={link.label}
          >
            {link.id === "bluesky" ? (
              // Native img — Next/Image does not serve local SVG without extra config
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/images/brand/icon-bluesky.svg"
                alt=""
                width={28}
                height={28}
                className="size-7"
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
