import { AtlasPrimaryButton } from "@/components/editorial/atlas-button";
import { ChapterMarker } from "@/components/editorial/chapter-marker";
import { Figure } from "@/components/editorial/figure";
import type { HomepageFixture } from "@/content/homepage";

type HomeFeaturedProps = {
  data: HomepageFixture["featured"];
};

export function HomeFeatured({ data }: HomeFeaturedProps) {
  return (
    <section
      aria-labelledby="featured-title"
      className="mx-auto max-w-[var(--atlas-page)]"
    >
      <div className="atlas-pad-x flex flex-wrap items-baseline justify-between gap-3 pt-4 pb-5">
        <ChapterMarker>{data.chapter}</ChapterMarker>
        <p className="m-0 font-mono text-[11px] text-atlas-body">{data.meta}</p>
      </div>

      <div className="atlas-pad-x">
        <Figure
          alt={data.figureAlt}
          caption={data.figureCaption}
          src={data.figureSrc}
          width={data.figureWidth}
          height={data.figureHeight}
          sizes={data.figureSizes}
          mediaClassName="min-h-[240px] tablet:min-h-[360px] desktop:min-h-[560px]"
        />
      </div>

      <div className="atlas-pad-x pt-9 pb-5">
        <h2
          id="featured-title"
          className="m-0 font-display text-[1.5rem] leading-tight font-semibold text-atlas-ink desktop:text-[1.75rem]"
        >
          {data.title}
        </h2>
      </div>

      <div className="atlas-pad-x grid gap-0 desktop:grid-cols-2">
        <div className="border-t border-atlas-border py-6 desktop:pr-8">
          <ChapterMarker className="mb-3">{data.problemLabel}</ChapterMarker>
          <p className="m-0 font-sans text-sm leading-relaxed text-atlas-body">
            {data.problem}
          </p>
        </div>
        <div className="border-t border-atlas-border py-6 desktop:pl-8">
          <ChapterMarker className="mb-3">{data.outcomeLabel}</ChapterMarker>
          <p className="m-0 font-sans text-sm leading-relaxed text-atlas-body">
            {data.outcome}
          </p>
        </div>
      </div>

      <div className="atlas-pad-x border-t border-atlas-border py-6">
        <ChapterMarker className="mb-4">{data.highlightsLabel}</ChapterMarker>
        <ul className="m-0 flex list-none flex-col gap-2 p-0 tablet:flex-row tablet:flex-wrap tablet:gap-x-8">
          {data.highlights.map((item) => (
            <li key={item} className="font-sans text-xs text-atlas-body">
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="atlas-pad-x pt-2 pb-10">
        <AtlasPrimaryButton href={data.cta.href}>
          {data.cta.label}
        </AtlasPrimaryButton>
      </div>
    </section>
  );
}
