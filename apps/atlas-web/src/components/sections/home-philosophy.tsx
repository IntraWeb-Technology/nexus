import type { HomepageFixture } from "@/content/homepage";

type HomePhilosophyProps = {
  data: HomepageFixture["philosophy"];
};

/**
 * Story-First philosophy — full-bleed moss band, centered white quote,
 * blush principle labels (no diagram box).
 */
export function HomePhilosophy({ data }: HomePhilosophyProps) {
  return (
    <section aria-labelledby="philosophy-quote" className="bg-atlas-moss">
      <div className="atlas-pad-x mx-auto flex max-w-[var(--atlas-page)] flex-col items-center gap-10 py-16 text-center tablet:py-20 desktop:gap-12 desktop:py-[6.5rem]">
        <blockquote
          id="philosophy-quote"
          className="m-0 max-w-[51.25rem] font-display text-[1.375rem] leading-snug font-medium text-white tablet:text-[1.625rem] desktop:text-[1.875rem] desktop:leading-[1.35]"
        >
          {data.quote}
        </blockquote>
        <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-x-6 gap-y-3 p-0 tablet:gap-x-8 desktop:gap-x-10">
          {data.stages.map((stage) => (
            <li
              key={stage}
              className="font-sans text-[11px] font-medium tracking-[0.12em] text-atlas-cream uppercase"
            >
              {stage}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
