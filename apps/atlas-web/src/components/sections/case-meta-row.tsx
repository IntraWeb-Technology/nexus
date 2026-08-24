import type { CaseStudyFixture } from "@/content/case-study";

type CaseMetaRowProps = {
  items: CaseStudyFixture["hero"]["meta"];
};

/**
 * Story-First meta row — TIMELINE / ROLE / STATUS / STACK (Figma 616:13).
 */
export function CaseMetaRow({ items }: CaseMetaRowProps) {
  return (
    <section
      aria-label="Case study metadata"
      className="border-b border-atlas-border bg-atlas-elevated"
    >
      <div className="atlas-pad-x mx-auto grid max-w-[var(--atlas-page)] grid-cols-2 gap-6 py-8 tablet:grid-cols-4 tablet:gap-8 tablet:py-10 desktop:gap-12 desktop:py-10">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col gap-1.5">
            <p className="m-0 font-sans text-[11px] font-medium tracking-[0.08em] text-atlas-label uppercase">
              {item.label}
            </p>
            <p className="m-0 font-sans text-[14px] font-medium text-atlas-ink tablet:text-[15px]">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
