import Link from "next/link";
import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { DocDetail } from "@/content/doc";

type DocContactProps = {
  data: DocDetail["contact"];
};

/**
 * Documentation contact bridge — left local (Stability).
 * Parallel to ArticleContact; not extracted with Home/Work bridges.
 */
export function DocContact({ data }: DocContactProps) {
  return (
    <section
      id="contact"
      aria-labelledby="doc-contact-title"
      className="bg-atlas-ink text-atlas-elevated"
    >
      <div className="atlas-pad-x mx-auto flex max-w-[var(--atlas-page)] flex-col gap-4 py-10 tablet:gap-4 tablet:py-10 desktop:gap-4 desktop:pt-14 desktop:pb-16">
        <ChapterMarker className="!text-atlas-secondary">{data.chapter}</ChapterMarker>
        <h2
          id="doc-contact-title"
          className="m-0 font-display text-[1.375rem] leading-[30px] font-semibold text-atlas-paper tablet:text-2xl tablet:leading-[30px] desktop:text-[1.625rem] desktop:leading-[34px]"
        >
          {data.title}
        </h2>
        <p className="m-0 hidden max-w-[40rem] font-sans text-sm leading-[22px] text-atlas-secondary desktop:block">
          {data.body}
        </p>
        <p className="m-0 max-w-[40rem] font-sans text-sm leading-[22px] text-atlas-secondary desktop:hidden">
          {data.bodyCompact ?? data.body}
        </p>
        <Link
          href={data.cta.href}
          className="mt-1 inline-flex w-fit bg-atlas-elevated px-[18px] py-3 font-sans text-xs font-semibold text-atlas-ink no-underline"
        >
          {data.cta.label}
        </Link>
        <p className="m-0">
          <Link
            href={data.workLink.href}
            className="font-sans text-xs text-atlas-secondary no-underline"
          >
            {data.workLink.label}
          </Link>
        </p>
      </div>
    </section>
  );
}
