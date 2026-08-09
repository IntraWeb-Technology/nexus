import Link from "next/link";
import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { HomepageFixture } from "@/content/homepage";

type HomeAboutProps = {
  data: HomepageFixture["about"];
};

export function HomeAbout({ data }: HomeAboutProps) {
  return (
    <section
      aria-labelledby="about-preview-title"
      className="atlas-pad-x mx-auto flex max-w-[var(--atlas-page)] flex-col gap-6 py-9 tablet:flex-row tablet:items-start tablet:gap-6"
    >
      <div
        className="size-[7rem] shrink-0 bg-atlas-secondary"
        aria-hidden="true"
      />
      <div>
        <h2 id="about-preview-title" className="sr-only">
          About
        </h2>
        <ChapterMarker className="mb-2" aria-hidden="true">
          {data.chapter}
        </ChapterMarker>
        <p className="m-0 max-w-2xl font-display text-base font-semibold text-atlas-ink">
          {data.summary}
        </p>
        <Link
          href={data.href}
          className="mt-3 inline-block font-sans text-xs text-atlas-ink no-underline"
        >
          {data.ctaLabel}
        </Link>
      </div>
    </section>
  );
}
