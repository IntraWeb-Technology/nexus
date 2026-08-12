import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { CaseStudyFixture } from "@/content/case-study";

type CaseOutcomesProps = {
  data: CaseStudyFixture["outcomes"];
};

export function CaseOutcomes({ data }: CaseOutcomesProps) {
  return (
    <section
      id="outcomes"
      aria-labelledby="case-outcomes-title"
      className="atlas-pad-x mx-auto max-w-[var(--atlas-page)] scroll-mt-24 py-5 tablet:py-7 desktop:py-6 desktop:pb-12"
    >
      <div className="mb-3 space-y-2.5 desktop:mb-6">
        <ChapterMarker>{data.chapter}</ChapterMarker>
        <h2
          id="case-outcomes-title"
          className="m-0 font-display text-xl leading-[26px] font-semibold text-atlas-ink tablet:text-[1.375rem] tablet:leading-7 desktop:text-[1.75rem] desktop:leading-9"
        >
          <span className="tablet:hidden">{data.titleMobile}</span>
          <span className="hidden tablet:inline">{data.title}</span>
        </h2>
        <p className="m-0 hidden max-w-[var(--atlas-reading)] font-sans text-[15px] leading-[23px] text-atlas-body desktop:block">
          {data.intro}
        </p>
      </div>

      <div className="hidden gap-6 desktop:grid desktop:grid-cols-4">
        {data.items.map((item) => (
          <div
            key={item.id}
            className="rounded-[2px] border border-atlas-border bg-atlas-elevated px-5 py-6"
          >
            <h3 className="m-0 mb-3 font-display text-base leading-[21px] font-semibold text-atlas-ink">
              {item.title}
            </h3>
            <p className="m-0 font-sans text-[13px] leading-[22px] text-atlas-body">
              {item.body}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-6 hidden font-mono text-[11px] text-atlas-body desktop:block">
        {data.note}
      </p>

      <p className="m-0 hidden font-sans text-sm leading-[22px] text-atlas-body tablet:block desktop:hidden">
        {data.summaryTablet}
      </p>
      <p className="m-0 font-sans text-sm leading-[22px] text-atlas-body tablet:hidden">
        {data.summaryMobile}
      </p>
    </section>
  );
}
