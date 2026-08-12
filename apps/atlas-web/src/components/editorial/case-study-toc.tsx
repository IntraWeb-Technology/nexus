type TocItem = {
  id: string;
  label: string;
  href: string;
};

type CaseStudyTocProps = {
  items: TocItem[];
  /** Accessible name — case study default; articles pass "Article contents". */
  ariaLabel?: string;
  /** Desktop: discrete links. Tablet: single wrapped line. Mobile: stacked. */
};

/**
 * In-page contents. Anchors only — no mobile sheet this milestone.
 * Shared by case study and article detail (Rule of Two / Manifest TOC).
 */
export function CaseStudyToc({
  items,
  ariaLabel = "Case study contents",
}: CaseStudyTocProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className="atlas-pad-x pb-6 pt-2 desktop:pb-8"
    >
      <p className="m-0 mb-2.5 font-sans text-[10px] font-medium tracking-[0.16em] text-atlas-body uppercase desktop:mb-2.5">
        Contents
      </p>

      {/* Desktop: horizontal links */}
      <ul className="m-0 hidden list-none flex-wrap gap-x-7 gap-y-2 p-0 desktop:flex">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={item.href}
              className="font-mono text-[11px] text-atlas-body no-underline hover:text-atlas-ink"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      {/* Tablet: single wrapped line of links */}
      <p className="m-0 hidden font-mono text-[11px] leading-[18px] text-atlas-body tablet:block desktop:hidden">
        {items.map((item, i) => (
          <span key={item.id}>
            {i > 0 ? " · " : null}
            <a href={item.href} className="text-atlas-body no-underline hover:text-atlas-ink">
              {item.label}
            </a>
          </span>
        ))}
      </p>

      {/* Mobile: stacked */}
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0 tablet:hidden">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={item.href}
              className="font-mono text-[11px] text-atlas-body no-underline hover:text-atlas-ink"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
