import Link from "next/link";
import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { CaseStudyFixture } from "@/content/case-study";

type CaseContactProps = {
  data: CaseStudyFixture["contact"];
};

/**
 * Case study contact bridge — left local.
 * Shares ink + CTA pattern with Home/Work, but Figma spacing and meta differ.
 * Not extracted under Rule of Two / Stability (ContactBridge still deferred).
 */
export function CaseContact({ data }: CaseContactProps) {
  return (
    <section
      id="contact"
      aria-labelledby="case-contact-title"
      className="bg-atlas-ink text-atlas-elevated"
    >
      <div className="atlas-pad-x mx-auto flex max-w-[var(--atlas-page)] flex-col gap-3.5 py-9 tablet:gap-3.5 tablet:py-12 desktop:flex-row desktop:items-start desktop:justify-between desktop:gap-12 desktop:pt-[4.5rem] desktop:pb-20">
        <div className="min-w-0 space-y-3.5 desktop:max-w-[56rem]">
          <ChapterMarker className="!text-atlas-secondary">
            {data.chapter}
          </ChapterMarker>
          <h2
            id="case-contact-title"
            className="m-0 font-display text-xl leading-[26px] font-semibold text-atlas-paper tablet:text-2xl tablet:leading-[30px] desktop:text-[1.625rem] desktop:leading-[34px]"
          >
            {data.title}
          </h2>
          <p className="m-0 hidden font-sans text-sm leading-[22px] text-atlas-secondary desktop:block">
            {data.body}
          </p>
        </div>
        <div className="flex flex-col gap-3 desktop:items-start">
          <Link
            href={data.cta.href}
            className="inline-flex items-center justify-center bg-atlas-elevated px-4 py-3.5 font-sans text-xs font-semibold text-atlas-ink no-underline tablet:px-[18px]"
          >
            {data.cta.label}
          </Link>
          <p className="m-0 hidden font-sans text-xs text-atlas-secondary desktop:block">
            {data.meta}
          </p>
        </div>
      </div>
    </section>
  );
}
