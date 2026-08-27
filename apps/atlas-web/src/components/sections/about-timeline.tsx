import type { AboutFixture } from "@/content/about";

type AboutTimelineProps = {
  data: AboutFixture["timeline"];
};

const RULE_TONES = [
  "bg-atlas-rust",
  "bg-atlas-gold",
  "bg-atlas-moss",
  "bg-atlas-ink-blue",
] as const;

/**
 * Story-First career timeline — “What shaped my craft”.
 * Desktop 4-column; Tablet 2-column; Mobile single column. Condensed notes on T/M.
 */
export function AboutTimeline({ data }: AboutTimelineProps) {
  return (
    <section
      aria-labelledby="about-career-arc"
      className="bg-atlas-elevated"
    >
      <div className="atlas-pad-x mx-auto flex max-w-[var(--atlas-page)] flex-col gap-6 py-10 tablet:gap-8 tablet:pt-16 tablet:pb-[4.5rem] desktop:gap-9 desktop:py-24">
        <h2
          id="about-career-arc"
          className="m-0 font-display text-[21px] font-semibold text-atlas-ink tablet:text-[26px] desktop:text-[30px]"
        >
          {data.title}
        </h2>
        <ol className="m-0 grid list-none grid-cols-1 gap-6 p-0 tablet:grid-cols-2 tablet:gap-8 desktop:grid-cols-4">
          {data.entries.map((entry, index) => (
            <li
              key={`${entry.period}-${entry.title}`}
              className="flex flex-col gap-2 tablet:gap-2.5 desktop:gap-3"
            >
              <span
                className={`block h-1 w-full tablet:h-[5px] desktop:h-1.5 ${RULE_TONES[index % RULE_TONES.length]}`}
                aria-hidden="true"
              />
              <span className="font-sans text-[11px] font-medium text-atlas-label desktop:text-[12px]">
                {entry.period}
              </span>
              <p className="m-0 font-display text-[17px] leading-snug font-semibold text-atlas-ink desktop:text-[18px]">
                {entry.title}
              </p>
              <p className="m-0 font-sans text-[13px] leading-normal text-atlas-body desktop:leading-[1.5]">
                <span className="desktop:hidden">{entry.noteCondensed}</span>
                <span className="hidden desktop:inline">{entry.note}</span>
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
