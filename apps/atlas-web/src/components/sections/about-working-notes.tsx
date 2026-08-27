import type { AboutFixture } from "@/content/about";

type AboutWorkingNotesProps = {
  data: AboutFixture["workingNotes"];
};

/**
 * Story-First Working Notes — observations + closing thought.
 * Desktop 616:16 asymmetric; Tablet/Mobile vertically sequenced.
 */
export function AboutWorkingNotes({ data }: AboutWorkingNotesProps) {
  return (
    <section
      aria-labelledby="about-working-notes"
      className="bg-atlas-cream"
    >
      <div className="atlas-pad-x mx-auto max-w-[var(--atlas-page)]">
        <div
          className="h-px bg-atlas-border desktop:max-w-[47.5rem]"
          aria-hidden="true"
        />
        <div className="grid gap-16 pt-10 pb-24 tablet:gap-[4.75rem] tablet:pt-14 tablet:pb-24 desktop:grid-cols-[minmax(0,41.25rem)_minmax(0,26.25rem)] desktop:items-start desktop:gap-x-[9.25rem] desktop:gap-y-0 desktop:pt-16 desktop:pb-20">
          <div className="flex min-w-0 flex-col">
            <p className="m-0 font-sans text-[10px] font-medium tracking-[0.08em] text-atlas-label uppercase tablet:text-[12px]">
              {data.chapter}
            </p>
            <h2
              id="about-working-notes"
              className="m-0 mt-4 font-display text-[1.5rem] leading-[1.3] font-semibold text-atlas-ink tablet:mt-[17px] tablet:text-[2rem] tablet:leading-[39px] desktop:text-[42px] desktop:leading-[49px]"
            >
              {data.title}
            </h2>
            <p className="m-0 mt-6 max-w-[41.25rem] font-sans text-[16px] leading-[26px] text-atlas-label tablet:mt-6 tablet:text-[18px] tablet:leading-7 desktop:mt-9 desktop:text-[19px] desktop:leading-8">
              {data.body}
            </p>
          </div>

          <ol className="m-0 flex list-none flex-col p-0 desktop:col-start-2 desktop:row-span-2 desktop:pt-[18px]">
            {data.observations.map((observation, index) => (
              <li
                key={observation.label}
                className={
                  index === 0
                    ? "pt-0"
                    : "mt-3.5 tablet:mt-3 desktop:mt-6"
                }
              >
                <span
                  className={
                    index === 0
                      ? "block h-[3px] w-full bg-atlas-gold"
                      : "block h-px w-full bg-atlas-border"
                  }
                  aria-hidden="true"
                />
                <h3 className="m-0 mt-6 font-sans text-[12px] font-medium tracking-[0.08em] text-atlas-rust-ink uppercase desktop:mt-5 desktop:text-[13px]">
                  {observation.label}
                </h3>
                <p className="m-0 mt-3 font-sans text-[15px] leading-6 text-atlas-ink tablet:mt-3 tablet:text-[16px] tablet:leading-[25px] desktop:mt-2 desktop:leading-[25px]">
                  {observation.body}
                </p>
              </li>
            ))}
          </ol>

          <ClosingThought
            text={data.closing}
            className="desktop:col-start-1 desktop:mt-[11.25rem]"
          />
        </div>
      </div>
    </section>
  );
}

function ClosingThought({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div
        className="h-px w-full bg-atlas-border desktop:max-w-[32.5rem]"
        aria-hidden="true"
      />
      <p className="m-0 mt-8 max-w-[40rem] font-display text-[1.25rem] leading-7 font-semibold text-atlas-ink tablet:mt-[34px] tablet:text-[22px] tablet:leading-[30px] desktop:mt-[30px] desktop:text-[1.5rem] desktop:leading-8">
        {text}
      </p>
    </div>
  );
}
