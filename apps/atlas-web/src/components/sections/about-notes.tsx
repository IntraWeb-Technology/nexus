import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { AboutFixture } from "@/content/about";

type AboutNotesProps = {
  data: AboutFixture["notes"];
};

/** Desktop-only personal notes — condensed note lives under focus on T/M. */
export function AboutNotes({ data }: AboutNotesProps) {
  return (
    <section
      aria-labelledby="about-notes-title"
      className="mx-auto hidden max-w-[var(--atlas-page)] desktop:block"
    >
      <div className="atlas-pad-x space-y-5 pt-12 pb-[4.5rem]">
        <ChapterMarker>{data.chapter}</ChapterMarker>
        <h2 id="about-notes-title" className="sr-only">
          Personal notes
        </h2>
        <blockquote className="m-0">
          <p className="m-0 max-w-[56.25rem] font-display text-[1.375rem] leading-8 text-atlas-ink italic">
            {data.pullQuote}
          </p>
        </blockquote>
        <p className="m-0 max-w-[45rem] font-sans text-[15px] leading-6 text-atlas-body">
          {data.body}
        </p>
      </div>
    </section>
  );
}
