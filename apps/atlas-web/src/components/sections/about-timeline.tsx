import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { AboutFixture } from "@/content/about";

type AboutTimelineProps = {
  data: AboutFixture["timeline"];
};

/** Career Arc — date / title / detail columns per approved About. */
export function AboutTimeline({ data }: AboutTimelineProps) {
  return (
    <section
      aria-labelledby="about-career-arc"
      className="mx-auto max-w-[var(--atlas-page)]"
    >
      <div className="atlas-pad-x space-y-6 py-10 tablet:py-12 desktop:py-14">
        <ChapterMarker>{data.chapter}</ChapterMarker>
        {data.title ? (
          <h2
            id="about-career-arc"
            className="m-0 font-display text-[1.625rem] leading-8 font-medium text-atlas-ink"
          >
            {data.title}
          </h2>
        ) : (
          <h2 id="about-career-arc" className="sr-only">
            Career arc
          </h2>
        )}
        <ol className="m-0 list-none space-y-0 border-t border-atlas-border p-0">
          {data.entries.map((entry) => (
            <li
              key={`${entry.period}-${entry.title}`}
              className="grid gap-2 border-b border-atlas-border py-5 tablet:grid-cols-[11rem_minmax(0,22.5rem)_minmax(0,1fr)] tablet:gap-8 desktop:py-6"
            >
              <span className="font-mono text-xs text-atlas-sage">
                {entry.period}
              </span>
              <p className="m-0 font-sans text-sm font-semibold text-atlas-ink desktop:text-[15px]">
                {entry.title}
              </p>
              <p className="m-0 font-sans text-sm leading-[22px] text-atlas-body">
                {entry.note}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
