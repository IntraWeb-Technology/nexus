import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { CaseStudyFixture } from "@/content/case-study";

type CaseDecisionsProps = {
  data: CaseStudyFixture["decisions"];
};

export function CaseDecisions({ data }: CaseDecisionsProps) {
  return (
    <section
      id="decisions"
      aria-labelledby="case-decisions-title"
      className="atlas-pad-x mx-auto max-w-[var(--atlas-page)] scroll-mt-24 py-5 tablet:py-7 desktop:py-6 desktop:pb-14"
    >
      <div className="mb-4 space-y-2.5 desktop:mb-8">
        <ChapterMarker>{data.chapter}</ChapterMarker>
        <h2
          id="case-decisions-title"
          className="m-0 font-display text-xl font-semibold text-atlas-ink tablet:text-[1.375rem] desktop:text-[1.75rem] desktop:leading-9"
        >
          {data.title}
        </h2>
        <p className="m-0 hidden max-w-[var(--atlas-reading)] font-sans text-[15px] leading-[23px] text-atlas-body desktop:block">
          {data.intro}
        </p>
      </div>

      <div className="flex flex-col">
        {data.items.map((item) => (
          <article
            key={item.id}
            className="border-t border-atlas-border py-3 tablet:py-4 desktop:space-y-4 desktop:py-7"
          >
            <div className="flex flex-col gap-1.5 tablet:gap-2 desktop:flex-row desktop:gap-5">
              <p className="m-0 font-mono text-[10px] text-atlas-sage tablet:text-[11px] desktop:text-xs">
                {item.id}
              </p>
              <h3 className="m-0 font-display text-[15px] leading-5 font-semibold text-atlas-ink tablet:text-base tablet:leading-[22px] desktop:text-xl desktop:leading-[26px]">
                <span className="tablet:hidden">
                  {item.statementMobile ?? item.statement}
                </span>
                <span className="hidden tablet:inline desktop:hidden">
                  {item.statementTablet ?? item.statement}
                </span>
                <span className="hidden desktop:inline">{item.statement}</span>
              </h3>
            </div>

            {/* Desktop decision matrix */}
            <div className="hidden gap-6 desktop:flex">
              {(
                [
                  ["CONTEXT", item.context],
                  ["CHOICE", item.choice],
                  ["TRADEOFF", item.tradeoff],
                  ["CONSEQUENCE", item.consequence],
                ] as const
              ).map(([label, body]) => (
                <div key={label} className="min-w-0 flex-1 space-y-2">
                  <ChapterMarker>{label}</ChapterMarker>
                  <p className="m-0 font-sans text-[13px] leading-[22px] text-atlas-body">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </article>
        ))}
        <div className="h-px bg-atlas-border" aria-hidden="true" />
      </div>
    </section>
  );
}
