import Image from "next/image";
import Link from "next/link";
import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { HomepageFixture } from "@/content/homepage";

type HomeSelectedProps = {
  data: HomepageFixture["selected"];
};

export function HomeSelected({ data }: HomeSelectedProps) {
  const feature = data.projects.find((p) => p.layout === "feature");
  const offset = data.projects.find((p) => p.layout === "offset");
  const band = data.projects.find((p) => p.layout === "band");

  return (
    <section
      id="selected-work"
      aria-labelledby="selected-title"
      className="mx-auto max-w-[var(--atlas-page)]"
    >
      <div className="atlas-pad-x space-y-2 pt-2 pb-9">
        <ChapterMarker>{data.chapter}</ChapterMarker>
        <h2
          id="selected-title"
          className="m-0 font-display text-[1.25rem] leading-snug font-semibold text-atlas-ink desktop:text-[1.375rem]"
        >
          {data.headline}
        </h2>
      </div>

      {feature ? (
        <article className="atlas-pad-x border-t border-atlas-border py-10">
          {feature.mediaSrc && feature.mediaWidth && feature.mediaHeight ? (
            <div className="relative mb-4 min-h-[180px] overflow-hidden bg-atlas-secondary tablet:min-h-[280px] desktop:min-h-[360px]">
              <Image
                src={feature.mediaSrc}
                alt={feature.mediaAlt ?? feature.title}
                width={feature.mediaWidth}
                height={feature.mediaHeight}
                sizes={feature.mediaSizes}
                className="h-full w-full object-contain object-left p-4 desktop:p-8"
                unoptimized={feature.mediaSrc.endsWith(".svg")}
              />
            </div>
          ) : (
            <div className="mb-4 min-h-[180px] bg-atlas-secondary tablet:min-h-[280px] desktop:min-h-[360px]" />
          )}
          <ChapterMarker className="mb-2">{feature.eyebrow}</ChapterMarker>
          <h3 className="m-0 font-display text-lg font-semibold text-atlas-ink">
            {feature.title}
          </h3>
          <p className="mt-2 mb-4 font-sans text-[13px] text-atlas-body">
            {feature.outcome}
          </p>
          <Link
            href={feature.href}
            className="font-sans text-xs text-atlas-ink no-underline"
          >
            {feature.ctaLabel}
          </Link>
        </article>
      ) : null}

      {offset ? (
        <article className="atlas-pad-x border-t border-atlas-border py-10 desktop:pl-[280px]">
          <ChapterMarker className="mb-2">{offset.eyebrow}</ChapterMarker>
          <h3 className="m-0 font-display text-lg font-semibold text-atlas-ink">
            {offset.title}
          </h3>
          <p className="mt-2 mb-4 max-w-xl font-sans text-[13px] text-atlas-body">
            {offset.outcome}
          </p>
          <Link
            href={offset.href}
            className="font-sans text-xs text-atlas-ink no-underline"
          >
            {offset.ctaLabel}
          </Link>
        </article>
      ) : null}

      {band ? (
        <article className="atlas-pad-x flex flex-col gap-4 border-t border-atlas-border py-8 tablet:flex-row tablet:items-center tablet:justify-between">
          <div>
            <ChapterMarker className="mb-2">{band.eyebrow}</ChapterMarker>
            <h3 className="m-0 font-display text-base font-semibold text-atlas-ink">
              {band.title}
            </h3>
          </div>
          <Link
            href={band.href}
            className="shrink-0 font-sans text-xs text-atlas-ink no-underline"
          >
            {band.ctaLabel}
          </Link>
        </article>
      ) : null}
    </section>
  );
}
