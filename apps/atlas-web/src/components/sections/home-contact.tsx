import Link from "next/link";
import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { HomepageFixture } from "@/content/homepage";

type HomeContactProps = {
  data: HomepageFixture["contact"];
};

export function HomeContact({ data }: HomeContactProps) {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="bg-atlas-ink text-atlas-elevated"
    >
      <div className="atlas-pad-x mx-auto flex max-w-[var(--atlas-page)] flex-col gap-8 py-14 tablet:flex-row tablet:items-end tablet:justify-between tablet:gap-12 desktop:py-20">
        <div className="max-w-3xl">
          <ChapterMarker className="mb-4 !text-atlas-secondary">
            {data.chapter}
          </ChapterMarker>
          <h2
            id="contact-title"
            className="m-0 font-display text-[1.5rem] leading-snug font-semibold text-atlas-elevated desktop:text-[1.625rem]"
          >
            {data.title}
          </h2>
          <p className="mt-4 mb-0 max-w-xl font-sans text-sm leading-relaxed text-atlas-secondary">
            {data.body}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Link
            href={data.cta.href}
            className="inline-flex w-fit bg-atlas-elevated px-4 py-3 font-sans text-[13px] font-medium text-atlas-ink no-underline"
          >
            {data.cta.label}
          </Link>
          <p className="m-0 font-mono text-[11px] text-atlas-secondary">{data.meta}</p>
        </div>
      </div>
    </section>
  );
}
