import type { CaseStudyFixture } from "@/content/case-study";

type CaseStoryOutcomesProps = {
  data: NonNullable<CaseStudyFixture["storyOutcomes"]>;
};

/**
 * Story-First Outcomes & lessons — short closing band (Figma 616:13).
 */
export function CaseStoryOutcomes({ data }: CaseStoryOutcomesProps) {
  return (
    <section
      id="outcomes"
      aria-labelledby="case-outcomes-title"
      className="bg-atlas-paper"
    >
      <div className="atlas-pad-x mx-auto flex max-w-[var(--atlas-page)] flex-col gap-5 py-14 tablet:gap-5 tablet:py-16 desktop:py-24">
        <h2
          id="case-outcomes-title"
          className="m-0 font-display text-[1.625rem] font-semibold text-atlas-ink tablet:text-[1.75rem] desktop:text-[1.875rem]"
        >
          {data.title}
        </h2>
        <p className="m-0 max-w-[40rem] font-sans text-[15px] leading-[1.55] text-atlas-body desktop:text-base">
          {data.body}
        </p>
      </div>
    </section>
  );
}
