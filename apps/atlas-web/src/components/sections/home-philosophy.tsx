import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { HomepageFixture } from "@/content/homepage";

type HomePhilosophyProps = {
  data: HomepageFixture["philosophy"];
};

export function HomePhilosophy({ data }: HomePhilosophyProps) {
  return (
    <section
      aria-labelledby="philosophy-quote"
      className="atlas-pad-x mx-auto max-w-[var(--atlas-page)] py-14 desktop:py-[5.5rem]"
    >
      <ChapterMarker className="mb-6">{data.chapter}</ChapterMarker>
      <blockquote
        id="philosophy-quote"
        className="m-0 max-w-[50rem] font-display text-[1.375rem] leading-snug font-medium text-atlas-ink tablet:text-[1.625rem] desktop:text-[1.875rem]"
      >
        {data.quote}
      </blockquote>

      <div className="mt-9 grid gap-8 desktop:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] desktop:gap-8">
        <div className="border border-atlas-ink bg-atlas-elevated p-6">
          <p className="atlas-chapter mb-5">Architecture</p>
          <ol className="m-0 grid list-none grid-cols-2 gap-3 p-0 tablet:grid-cols-4">
            {data.stages.map((stage, i) => (
              <li
                key={stage}
                className="flex flex-col items-center gap-2 border border-atlas-ink bg-atlas-paper px-2 py-4 text-center"
              >
                <span
                  className="size-2 rounded-full bg-atlas-sage"
                  aria-hidden="true"
                />
                <span className="font-mono text-[10px] font-medium text-atlas-ink">
                  {String(i + 1).padStart(2, "0")} {stage}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-4 mb-0 font-sans text-[11px] text-atlas-body">
            {data.diagramCaption}
          </p>
        </div>

        <ul className="m-0 grid list-none gap-5 p-0 tablet:grid-cols-2 desktop:grid-cols-1">
          {data.principles.map((item) => (
            <li key={item.title}>
              <p className="m-0 font-sans text-[13px] font-semibold text-atlas-ink">
                {item.title}
              </p>
              <p className="mt-1 mb-0 font-sans text-xs text-atlas-body">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
