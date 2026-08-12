import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { AboutFixture } from "@/content/about";

type AboutOpeningProps = {
  data: AboutFixture["opening"];
};

export function AboutOpening({ data }: AboutOpeningProps) {
  return (
    <header className="mx-auto max-w-[var(--atlas-page)]">
      <div className="atlas-pad-x pt-9 pb-8 tablet:pt-12 tablet:pb-10 desktop:pt-[4.5rem] desktop:pb-12">
        <div className="flex flex-col gap-8 desktop:flex-row desktop:gap-16">
          <div className="max-w-[45rem] space-y-5">
            <ChapterMarker>{data.chapter}</ChapterMarker>
            <h1 className="m-0 font-display text-[1.75rem] leading-[1.2] font-semibold text-atlas-ink tablet:text-[2rem] desktop:text-[2.625rem] desktop:leading-[48px]">
              {data.title}
            </h1>
            <p className="m-0 hidden font-sans text-[15px] leading-7 text-atlas-body desktop:block desktop:text-[17px]">
              {data.deck}
            </p>
            <p className="m-0 font-sans text-sm leading-[1.55] text-atlas-body desktop:hidden">
              {data.deckCondensed}
            </p>
            <p className="m-0 hidden font-mono text-[11px] whitespace-pre text-atlas-body desktop:block">
              {data.meta}
            </p>
            <p className="m-0 font-mono text-[10px] text-atlas-body desktop:hidden">
              {data.metaCondensed}
            </p>
          </div>

          <aside className="hidden w-full max-w-[25rem] shrink-0 space-y-4 pt-12 desktop:block">
            <div className="h-px w-12 bg-atlas-border" aria-hidden="true" />
            <p className="m-0 font-mono text-[9px] tracking-[0.08em] text-atlas-body">
              {data.marginNote.label}
            </p>
            <p className="m-0 font-sans text-[13px] leading-5 text-atlas-body">
              {data.marginNote.body}
            </p>
          </aside>
        </div>
      </div>
    </header>
  );
}
