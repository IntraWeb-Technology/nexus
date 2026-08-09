import { ChapterMarker } from "@/components/editorial/chapter-marker";
import { EditorialTable } from "@/components/editorial/editorial-table";
import type { CaseStudyFixture } from "@/content/case-study";

type CaseConstraintsProps = {
  data: CaseStudyFixture["constraints"];
};

export function CaseConstraints({ data }: CaseConstraintsProps) {
  return (
    <section
      id="constraints"
      aria-labelledby="case-constraints-title"
      className="atlas-pad-x mx-auto max-w-[var(--atlas-page)] scroll-mt-24 py-5 tablet:py-7 desktop:py-6 desktop:pb-12"
    >
      <div className="mb-3 space-y-2.5 desktop:mb-6">
        <ChapterMarker>{data.chapter}</ChapterMarker>
        <h2
          id="case-constraints-title"
          className="m-0 font-display text-xl leading-[26px] font-semibold text-atlas-ink tablet:text-[1.375rem] tablet:leading-7 desktop:text-[1.75rem] desktop:leading-9"
        >
          <span className="tablet:hidden">{data.titleMobile}</span>
          <span className="hidden tablet:inline">{data.title}</span>
        </h2>
      </div>

      <EditorialTable className="hidden desktop:block" rows={data.rows} />

      <p className="m-0 hidden font-sans text-sm leading-[22px] text-atlas-body tablet:block desktop:hidden">
        {data.summaryTablet}
      </p>
      <p className="m-0 font-sans text-sm leading-[22px] text-atlas-body tablet:hidden">
        {data.summaryMobile}
      </p>
    </section>
  );
}
