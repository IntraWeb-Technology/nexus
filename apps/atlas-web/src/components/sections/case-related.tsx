import Link from "next/link";
import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { CaseStudyFixture } from "@/content/case-study";

type CaseRelatedProps = {
  data: CaseStudyFixture["related"];
};

export function CaseRelated({ data }: CaseRelatedProps) {
  return (
    <section
      aria-labelledby="case-related-title"
      className="atlas-pad-x mx-auto max-w-[var(--atlas-page)] py-4 tablet:py-4 desktop:py-6 desktop:pb-12"
    >
      <ChapterMarker className="mb-2.5">{data.chapter}</ChapterMarker>

      <h2
        id="case-related-title"
        className="m-0 font-display font-semibold text-atlas-ink desktop:mb-5 desktop:text-2xl desktop:leading-[31px]"
      >
        <Link
          href={data.cta.href}
          className="text-base text-atlas-ink no-underline tablet:text-lg desktop:hidden"
        >
          <span className="tablet:hidden">{data.titleMobile}</span>
          <span className="hidden tablet:inline">{data.titleTablet}</span>
        </Link>
        <span className="hidden desktop:inline">{data.title}</span>
      </h2>

      <Link
        href={data.cta.href}
        className="hidden items-center justify-between gap-8 border-y border-atlas-border py-7 no-underline desktop:flex"
      >
        <div className="space-y-2">
          <p className="m-0 font-display text-lg leading-[23px] font-semibold text-atlas-ink">
            {data.projectName}
          </p>
          <p className="m-0 font-sans text-sm leading-[22px] text-atlas-body">
            {data.projectSummary}
          </p>
        </div>
        <span className="shrink-0 font-sans text-[13px] font-medium text-atlas-umber">
          {data.cta.label}
        </span>
      </Link>
    </section>
  );
}
