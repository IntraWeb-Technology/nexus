import { AtlasPrimaryButton } from "@/components/editorial/atlas-button";
import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { CaseStudyFixture } from "@/content/case-study";

type CaseContactProps = {
  data: CaseStudyFixture["contact"];
};

/**
 * Case study contact bridge — elevated paper + umber primary (M9D).
 * Left local under Rule of Stability (ContactBridge still deferred).
 */
export function CaseContact({ data }: CaseContactProps) {
  return (
    <section
      id="contact"
      aria-labelledby="case-contact-title"
      className="border-y border-[#c8beaa] bg-atlas-elevated"
    >
      <div className="atlas-pad-x mx-auto flex max-w-[var(--atlas-page)] flex-col gap-3.5 py-9 tablet:gap-3.5 tablet:py-12 desktop:flex-row desktop:items-start desktop:justify-between desktop:gap-12 desktop:pt-[4.5rem] desktop:pb-20">
        <div className="min-w-0 space-y-3.5 desktop:max-w-[56rem]">
          <ChapterMarker className="!text-atlas-sage">
            {data.chapter}
          </ChapterMarker>
          <h2
            id="case-contact-title"
            className="m-0 font-display text-xl leading-[26px] font-semibold text-atlas-ink tablet:text-2xl tablet:leading-[30px] desktop:text-[1.625rem] desktop:leading-[34px]"
          >
            {data.title}
          </h2>
          <p className="m-0 hidden font-sans text-sm leading-[22px] text-atlas-body desktop:block">
            {data.body}
          </p>
        </div>
        <div className="flex flex-col items-start gap-3">
          <AtlasPrimaryButton href={data.cta.href} className="py-3.5">
            {data.cta.label}
          </AtlasPrimaryButton>
          <p className="m-0 hidden font-sans text-xs text-atlas-body desktop:block">
            {data.meta}
          </p>
        </div>
      </div>
    </section>
  );
}
