import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { AboutFixture } from "@/content/about";

type AboutFocusProps = {
  data: AboutFixture["focus"];
};

/** Current Focus — centered editorial prose per approved About. */
export function AboutFocus({ data }: AboutFocusProps) {
  return (
    <section
      aria-labelledby="about-focus-title"
      className="mx-auto max-w-[var(--atlas-page)]"
    >
      <div className="atlas-pad-x flex flex-col items-start gap-4 py-10 tablet:items-center tablet:py-12 desktop:py-14">
        <ChapterMarker>{data.chapter}</ChapterMarker>
        <h2 id="about-focus-title" className="sr-only">
          Current focus
        </h2>
        <p className="m-0 max-w-[40rem] font-sans text-[15px] leading-7 text-atlas-body tablet:text-center desktop:text-base desktop:leading-[1.75]">
          {data.body}
        </p>
      </div>
    </section>
  );
}
