import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { AboutFixture } from "@/content/about";

type AboutPhilosophyProps = {
  data: AboutFixture["philosophy"];
};

export function AboutPhilosophy({ data }: AboutPhilosophyProps) {
  return (
    <section
      aria-labelledby="about-philosophy-title"
      className="mx-auto max-w-[var(--atlas-page)]"
    >
      <div className="atlas-pad-x space-y-5 py-8 tablet:py-10 desktop:space-y-6 desktop:py-12">
        <ChapterMarker>{data.chapter}</ChapterMarker>
        <h2 id="about-philosophy-title" className="sr-only">
          Engineering philosophy
        </h2>
        <blockquote className="m-0">
          <p className="m-0 hidden font-display text-[2rem] leading-[42px] text-atlas-ink italic desktop:block">
            {data.quote}
          </p>
          <p className="m-0 font-display text-[1.25rem] leading-snug text-atlas-ink italic desktop:hidden">
            {data.quoteCondensed}
          </p>
        </blockquote>
        <p className="m-0 hidden font-mono text-[11px] text-atlas-body desktop:block">
          {data.attribution}
        </p>
        <p className="m-0 hidden max-w-[45rem] font-sans text-base leading-[26px] text-atlas-body desktop:block">
          {data.body}
        </p>
      </div>
    </section>
  );
}
