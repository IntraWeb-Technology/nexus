import type { CaseStudyFixture } from "@/content/case-study";

type CaseStoryOverviewProps = {
  data: CaseStudyFixture["overview"];
};

/**
 * Story-First Overview — What was built / Why it mattered / What I owned.
 * Desktop (Figma 616:13): three-column triptych.
 * Tablet (Figma 632:4 / C4): stacked single column, not the desktop triptych.
 */
export function CaseStoryOverview({ data }: CaseStoryOverviewProps) {
  return (
    <section
      id="overview"
      aria-labelledby="case-overview-title"
      className="bg-atlas-paper"
    >
      <div className="atlas-pad-x mx-auto flex max-w-[var(--atlas-page)] flex-col gap-10 py-14 tablet:py-[4.5rem] desktop:gap-14 desktop:py-[6.25rem]">
        <h2
          id="case-overview-title"
          className="m-0 font-display text-[1.75rem] font-semibold text-atlas-ink desktop:text-[2rem]"
        >
          {data.title}
        </h2>
        <div className="grid grid-cols-1 gap-10 desktop:grid-cols-3 desktop:gap-12">
          {data.columns.map((column) => (
            <div
              key={column.id}
              className="flex flex-col gap-3.5 tablet:gap-2.5 desktop:gap-3.5"
            >
              <h3 className="m-0 font-sans text-[16px] font-semibold text-atlas-ink tablet:text-[17px]">
                {column.label}
              </h3>
              <p className="m-0 font-sans text-[14px] leading-[1.55] text-atlas-body tablet:text-[15px]">
                {column.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
