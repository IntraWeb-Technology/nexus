import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { CaseStudyFixture } from "@/content/case-study";

type CaseOverviewProps = {
  data: CaseStudyFixture["overview"];
};

export function CaseOverview({ data }: CaseOverviewProps) {
  return (
    <section
      id="overview"
      aria-labelledby="case-overview-title"
      className="atlas-pad-x mx-auto max-w-[var(--atlas-page)] scroll-mt-24 py-5 tablet:py-7 desktop:py-6 desktop:pb-12"
    >
      <div className="mb-3 space-y-2.5 tablet:mb-3 desktop:mb-7">
        <ChapterMarker>{data.chapter}</ChapterMarker>
        <h2
          id="case-overview-title"
          className="m-0 font-display text-xl leading-[26px] font-semibold text-atlas-ink tablet:text-[1.375rem] tablet:leading-7 desktop:text-[1.75rem] desktop:leading-9"
        >
          <span className="tablet:hidden">{data.titleMobile}</span>
          <span className="hidden tablet:inline">{data.title}</span>
        </h2>
      </div>

      {/* Desktop: three columns */}
      <div className="hidden gap-12 desktop:flex">
        {data.columns.map((col) => (
          <div key={col.id} className="min-w-0 flex-1 space-y-3">
            <ChapterMarker>{col.label}</ChapterMarker>
            <p className="m-0 font-sans text-[15px] leading-[23px] text-atlas-body">
              {col.body}
            </p>
          </div>
        ))}
      </div>

      {/* Tablet paragraphs */}
      <div className="hidden space-y-3 tablet:block desktop:hidden">
        {data.bodyTablet.map((p) => (
          <p
            key={p.slice(0, 24)}
            className="m-0 font-sans text-sm leading-[22px] text-atlas-body"
          >
            {p}
          </p>
        ))}
      </div>

      {/* Mobile */}
      <p className="m-0 font-sans text-sm leading-[22px] text-atlas-body tablet:hidden">
        {data.bodyMobile}
      </p>
    </section>
  );
}
