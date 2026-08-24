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
 * Story-First career timeline — “What shaped my craft” (Figma 616:16).
 * Compact four-column desktop; stacked tablet/mobile. No extra sections.
 */
export function AboutTimeline({ data }: AboutTimelineProps) {
  return (
    <section
      aria-labelledby="about-career-arc"
      className="bg-atlas-elevated"
    >
      <div className="atlas-pad-x mx-auto flex max-w-[var(--atlas-page)] flex-col gap-9 py-14 tablet:gap-10 tablet:py-16 desktop:gap-9 desktop:py-24">
        <h2
          id="about-career-arc"
          className="m-0 font-display text-[1.5rem] font-semibold text-atlas-ink desktop:text-[1.875rem]"
        >
          {data.title || "What shaped my craft"}
        </h2>
        <ol className="m-0 grid list-none grid-cols-1 gap-8 p-0 tablet:grid-cols-2 tablet:gap-8 desktop:grid-cols-4 desktop:gap-8">
          {data.entries.map((entry, index) => (
            <li
              key={`${entry.period}-${entry.title}`}
              className="flex flex-col gap-3"
            >
              <span
                className={`block h-1.5 w-full ${RULE_TONES[index % RULE_TONES.length]}`}
                aria-hidden="true"
              />
              <span className="font-sans text-[12px] font-medium text-atlas-label">
                {entry.period}
              </span>
              <p className="m-0 font-display text-[16px] font-semibold leading-snug text-atlas-ink desktop:text-[18px]">
                {entry.title}
              </p>
              <p className="m-0 font-sans text-[13px] leading-[1.5] text-atlas-body">
                {entry.note}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
