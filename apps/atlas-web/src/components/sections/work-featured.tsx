import Link from "next/link";
import { ChapterMarker } from "@/components/editorial/chapter-marker";
import { Figure } from "@/components/editorial/figure";
import type { WorkFixture } from "@/content/work";

type WorkFeaturedProps = {
  data: WorkFixture["featured"];
};

export function WorkFeatured({ data }: WorkFeaturedProps) {
  return (
    <section
      aria-labelledby="work-featured-title"
      className="mx-auto max-w-[var(--atlas-page)]"
    >
      <div className="atlas-pad-x pb-4 pt-2 desktop:flex desktop:items-end desktop:justify-between desktop:gap-8 desktop:pb-7">
        <div className="max-w-[45rem] space-y-2.5">
          <ChapterMarker>{data.chapter}</ChapterMarker>
          <h2
            id="work-featured-title"
            className="m-0 font-display text-2xl leading-tight font-semibold text-atlas-ink tablet:text-[1.75rem] desktop:text-[2.25rem] desktop:leading-[47px]"
          >
            {data.title}
          </h2>
          <p className="m-0 hidden font-sans text-[15px] leading-[23px] text-atlas-body desktop:block">
            {data.summary}
          </p>
        </div>

        <div className="mt-3 desktop:mt-0 desktop:flex desktop:shrink-0 desktop:flex-col desktop:items-end desktop:gap-6 desktop:pb-2">
          <p className="m-0 hidden font-mono text-[11px] text-atlas-body desktop:block">
            {data.flagshipLabel}
          </p>
          <p className="m-0 hidden font-mono text-[11px] text-atlas-body whitespace-pre tablet:block desktop:hidden">
            {data.status}
            {"  ·  "}
            {data.timeframe}
          </p>
          <ChapterMarker className="tablet:hidden desktop:block">
            {data.status}
          </ChapterMarker>
          <p className="m-0 hidden font-mono text-[11px] text-atlas-body desktop:block">
            {data.timeframe}
          </p>
          <p className="m-0 hidden font-mono text-[11px] text-atlas-body whitespace-pre desktop:block">
            Role{"  ·  "}
            {data.role}
          </p>
        </div>
      </div>

      <div className="atlas-pad-x desktop:px-12">
        <Figure
          tone="ink"
          alt={data.figureAlt}
          caption={data.figureCaption}
          className="hidden desktop:block"
          mediaClassName="min-h-[620px] w-full"
        />
        <Figure
          tone="ink"
          alt={data.figureAlt}
          caption={data.figureCaptionShort}
          className="desktop:hidden"
          mediaClassName="min-h-[220px] w-full tablet:min-h-[360px]"
        />
      </div>

      <div className="atlas-pad-x space-y-4 pt-4 pb-8 tablet:pb-10 desktop:hidden">
        <p className="m-0 hidden font-sans text-sm leading-[22px] text-atlas-body tablet:block">
          {data.summary}
        </p>
        <p className="m-0 font-sans text-[13px] leading-5 text-atlas-body tablet:hidden">
          {data.summaryMobile}
        </p>
        <p className="m-0 hidden font-mono text-[11px] text-atlas-body tablet:block">
          {data.themesCompact}
        </p>
        <Link
          href={data.cta.href}
          className="inline-flex bg-atlas-umber px-5 py-3.5 font-sans text-xs font-medium text-atlas-elevated no-underline"
        >
          {data.cta.label}
        </Link>
      </div>

      <div className="atlas-pad-x hidden flex-col gap-7 pt-9 pb-12 desktop:flex">
        <div className="space-y-3">
          <ChapterMarker>{data.themesLabel}</ChapterMarker>
          <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
            {data.themes.map((theme) => (
              <li
                key={theme}
                className="rounded-[2px] border border-atlas-border bg-atlas-elevated px-4 py-3.5 font-sans text-xs text-atlas-ink"
              >
                {theme}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-between gap-8">
          <Link
            href={data.cta.href}
            className="inline-flex bg-atlas-umber px-5 py-3.5 font-sans text-xs font-medium text-atlas-elevated no-underline"
          >
            {data.cta.label}
          </Link>
          <p className="m-0 max-w-[23rem] font-sans text-[13px] leading-5 text-atlas-body">
            {data.ctaNote}
          </p>
        </div>
      </div>
    </section>
  );
}
