import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { CaseStudyFixture } from "@/content/case-study";

type CaseProblemProps = {
  data: CaseStudyFixture["problem"];
};

export function CaseProblem({ data }: CaseProblemProps) {
  return (
    <section
      id="problem"
      aria-labelledby="case-problem-title"
      className="atlas-pad-x mx-auto max-w-[var(--atlas-page)] scroll-mt-24 py-5 tablet:py-7 desktop:py-6 desktop:pb-12"
    >
      <div className="mb-3 space-y-2.5 desktop:mb-5">
        <ChapterMarker>{data.chapter}</ChapterMarker>
        <h2
          id="case-problem-title"
          className="m-0 font-display text-xl leading-[26px] font-semibold text-atlas-ink tablet:text-[1.375rem] tablet:leading-7 desktop:text-[1.75rem] desktop:leading-9"
        >
          <span className="tablet:hidden">{data.titleMobile}</span>
          <span className="hidden tablet:inline">{data.title}</span>
        </h2>
      </div>

      <div className="hidden max-w-[var(--atlas-reading)] space-y-4 desktop:block">
        {data.paragraphs.map((p) => (
          <p
            key={p.slice(0, 32)}
            className="m-0 font-sans text-[15px] leading-[23px] text-atlas-body"
          >
            {p}
          </p>
        ))}
      </div>

      <div className="hidden space-y-3 tablet:block desktop:hidden">
        {data.paragraphsTablet.map((p) => (
          <p
            key={p.slice(0, 24)}
            className="m-0 font-sans text-sm leading-[22px] text-atlas-body"
          >
            {p}
          </p>
        ))}
      </div>

      <p className="m-0 font-sans text-sm leading-[22px] text-atlas-body tablet:hidden">
        {data.bodyMobile}
      </p>
    </section>
  );
}
