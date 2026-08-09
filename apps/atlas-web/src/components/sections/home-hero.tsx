import Link from "next/link";
import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { HomepageFixture } from "@/content/homepage";

type HomeHeroProps = {
  data: HomepageFixture["hero"];
};

export function HomeHero({ data }: HomeHeroProps) {
  return (
    <section
      aria-labelledby="hero-title"
      className="mx-auto grid max-w-[var(--atlas-page)] grid-cols-1 desktop:grid-cols-[minmax(0,880px)_minmax(0,560px)]"
    >
      {/* Media chapter — full-bleed visual plane on desktop left */}
      {/* Secondary plane — real media replaces this (Editorial Image Direction). */}
      <div
        className="min-h-[320px] bg-atlas-secondary tablet:min-h-[420px] desktop:min-h-[680px]"
        role="img"
        aria-label={`${data.mediaLabel}. ${data.mediaNote.replace(/\n/g, " ")}`}
      />

      {/* Copy — low-right statement field on desktop */}
      <div className="atlas-pad-x flex flex-col justify-end gap-5 py-10 desktop:px-10 desktop:pt-0 desktop:pb-14 desktop:pl-10">
        <ChapterMarker>{data.chapter}</ChapterMarker>
        <h1
          id="hero-title"
          className="m-0 font-display text-[1.75rem] leading-[1.15] font-semibold tracking-tight whitespace-pre-line text-atlas-ink tablet:text-[2rem] desktop:text-[2.25rem]"
        >
          {data.title}
        </h1>
        <p className="m-0 max-w-[29rem] font-sans text-sm leading-relaxed text-atlas-body">
          {data.deck}
        </p>
        <div className="flex flex-wrap items-center gap-5 pt-2">
          <Link
            href={data.primaryCta.href}
            className="font-sans text-xs font-medium text-atlas-ink no-underline"
          >
            {data.primaryCta.label}
          </Link>
          <Link
            href={data.secondaryCta.href}
            className="font-sans text-xs text-atlas-body no-underline"
          >
            {data.secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
