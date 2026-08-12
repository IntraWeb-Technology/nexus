import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { AboutFixture } from "@/content/about";

type AboutApproachProps = {
  data: AboutFixture["approach"];
};

export function AboutApproach({ data }: AboutApproachProps) {
  return (
    <section
      aria-labelledby="about-approach-title"
      className="mx-auto max-w-[var(--atlas-page)]"
    >
      <div className="atlas-pad-x space-y-5 py-8 tablet:py-10 desktop:space-y-7 desktop:py-12">
        <ChapterMarker className="hidden desktop:block">
          {data.chapter}
        </ChapterMarker>
        <ChapterMarker className="desktop:hidden">
          {data.chapterCondensed}
        </ChapterMarker>
        <h2
          id="about-approach-title"
          className="m-0 max-w-[45rem] font-display text-[1.375rem] leading-snug font-medium text-atlas-ink tablet:text-[1.5rem] desktop:text-[1.75rem] desktop:leading-[34px]"
        >
          {data.title}
        </h2>

        <div className="flex flex-col gap-8 desktop:flex-row desktop:gap-12">
          <p className="m-0 hidden max-w-[35rem] font-sans text-[15px] leading-6 text-atlas-body desktop:block">
            {data.body}
          </p>
          <p className="m-0 font-sans text-sm leading-[22px] text-atlas-body desktop:hidden">
            {data.bodyCondensed}
          </p>

          <figure className="m-0 hidden w-full max-w-[35rem] shrink-0 flex-col gap-3 rounded-[2px] border border-atlas-border bg-atlas-elevated px-6 py-7 desktop:flex">
            <div
              className="flex gap-3"
              role="list"
              aria-label="Problem approach stages"
            >
              {data.stages.map((stage) => (
                <div
                  key={stage.id}
                  role="listitem"
                  className="flex flex-1 flex-col items-center gap-1.5 border-[1.5px] border-atlas-ink bg-atlas-paper px-3 py-3.5"
                >
                  <span
                    className="size-2 rounded-full bg-atlas-sage"
                    aria-hidden="true"
                  />
                  <span className="font-mono text-[10px] font-medium whitespace-pre text-atlas-ink">
                    {stage.id}
                    {"  "}
                    {stage.label}
                  </span>
                </div>
              ))}
            </div>
            <figcaption className="font-sans text-xs leading-4 text-atlas-body">
              {data.figureCaption}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
