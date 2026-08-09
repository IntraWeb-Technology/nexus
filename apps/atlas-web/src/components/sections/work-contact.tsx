import Link from "next/link";
import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { WorkFixture } from "@/content/work";

type WorkContactProps = {
  data: WorkFixture["contact"];
};

/**
 * Work contact bridge — left local intentionally.
 * Shares the ink-surface + CTA pattern with HomeContact, but Figma compositions
 * differ (mobile body, CTA width, stage context). Not extracted under Rule of Two.
 */
export function WorkContact({ data }: WorkContactProps) {
  return (
    <section
      id="contact"
      aria-labelledby="work-contact-title"
      className="bg-atlas-ink text-atlas-elevated"
    >
      <div className="atlas-pad-x mx-auto flex max-w-[var(--atlas-page)] flex-col gap-5 py-10 tablet:gap-5 tablet:py-14 desktop:flex-row desktop:items-center desktop:gap-12 desktop:pt-[4.5rem] desktop:pb-20">
        <div className="min-w-0 flex-1 space-y-3.5">
          <ChapterMarker className="!text-atlas-secondary">
            {data.chapter}
          </ChapterMarker>
          <h2
            id="work-contact-title"
            className="m-0 font-display text-[1.375rem] leading-snug font-semibold text-atlas-paper tablet:text-2xl desktop:text-[1.625rem] desktop:leading-[33px]"
          >
            {data.title}
          </h2>
          <p className="m-0 hidden font-sans text-sm leading-[22px] text-atlas-secondary tablet:block">
            {data.body}
          </p>
          <p className="m-0 font-sans text-[13px] leading-5 text-atlas-secondary tablet:hidden">
            {data.bodyMobile}
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 desktop:w-[280px] desktop:shrink-0">
          <Link
            href={data.cta.href}
            className="inline-flex w-full items-center justify-center bg-atlas-elevated px-[18px] py-3.5 font-sans text-xs font-semibold text-atlas-ink no-underline"
          >
            {data.cta.label}
          </Link>
          <p className="m-0 hidden font-sans text-xs text-atlas-secondary tablet:block">
            {data.meta}
          </p>
        </div>
      </div>
    </section>
  );
}
