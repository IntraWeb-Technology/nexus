import type { CaseStudyFixture } from "@/content/case-study";

type CaseStoryOverviewProps = {
  data: CaseStudyFixture["overview"];
};

/**
 * Story-First Overview triptych — What was built / Why it mattered / What I owned.
 */
export function CaseStoryOverview({ data }: CaseStoryOverviewProps) {
  return (
    <section
      id="overview"
      aria-labelledby="case-overview-title"
      className="bg-atlas-paper"
    >
      <div className="atlas-pad-x mx-auto flex max-w-[var(--atlas-page)] flex-col gap-10 py-14 tablet:gap-12 tablet:py-16 desktop:gap-14 desktop:py-[6.25rem]">
        <h2
          id="case-overview-title"
          className="m-0 font-display text-[1.75rem] font-semibold text-atlas-ink tablet:text-[1.875rem] desktop:text-[2rem]"
        >
          {data.title}
        </h2>
        <div className="grid grid-cols-1 gap-10 tablet:grid-cols-3 tablet:gap-8 desktop:gap-12">
          {data.columns.map((column) => (
            <div key={column.id} className="flex flex-col gap-3.5">
              <h3 className="m-0 font-sans text-[16px] font-semibold text-atlas-ink desktop:text-[17px]">
                {column.label}
              </h3>
              <p className="m-0 font-sans text-[14px] leading-[1.55] text-atlas-body desktop:text-[15px]">
                {column.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
