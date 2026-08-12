import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { AboutFixture } from "@/content/about";

type AboutTimelineProps = {
  data: AboutFixture["timeline"];
};

export function AboutTimeline({ data }: AboutTimelineProps) {
  return (
    <section
      aria-labelledby="about-timeline-title"
      className="mx-auto max-w-[var(--atlas-page)]"
    >
      <div className="atlas-pad-x space-y-5 py-8 tablet:py-10 desktop:space-y-6 desktop:py-12">
        <ChapterMarker>{data.chapter}</ChapterMarker>
        <h2
          id="about-timeline-title"
          className="m-0 hidden font-display text-[1.625rem] leading-8 font-medium text-atlas-ink desktop:block"
        >
          {data.title}
        </h2>
        <ol className="m-0 list-none space-y-0 p-0">
          {data.entries.map((entry) => (
            <li
              key={`${entry.period}-${entry.title}`}
              className="flex flex-col gap-2 border-t border-atlas-border py-4 tablet:flex-row tablet:gap-6 desktop:gap-8 desktop:py-5"
            >
              <span className="shrink-0 font-mono text-xs text-atlas-sage tablet:w-[12.5rem]">
                {entry.period}
              </span>
              <div className="min-w-0 space-y-1.5">
                <p className="m-0 font-sans text-sm font-semibold text-atlas-ink desktop:text-[15px]">
                  {entry.title}
                </p>
                <p className="m-0 hidden font-sans text-sm leading-[22px] text-atlas-body desktop:block">
                  {entry.note}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
