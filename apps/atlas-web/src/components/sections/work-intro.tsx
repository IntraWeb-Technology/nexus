import type { WorkFixture } from "@/content/work";

type WorkIntroProps = {
  data: WorkFixture["intro"];
};

/**
 * Story-First work hero — SELECTED WORK eyebrow, Newsreader title, deck (Figma 616:12).
 */
export function WorkIntro({ data }: WorkIntroProps) {
  return (
    <header className="bg-atlas-paper">
      <div className="atlas-pad-x mx-auto flex max-w-[var(--atlas-page)] flex-col gap-5 pt-14 pb-12 tablet:gap-5 tablet:pt-16 tablet:pb-14 desktop:gap-5 desktop:pt-[6.25rem] desktop:pb-20">
        <p className="m-0 font-sans text-[12px] font-medium tracking-[0.08em] text-atlas-rust-ink uppercase">
          {data.chapter}
        </p>
        <h1 className="m-0 max-w-[43.75rem] font-display text-[1.875rem] leading-[1.15] font-semibold text-atlas-ink tablet:text-[2.25rem] desktop:text-[2.875rem]">
          {data.title}
        </h1>
        <p className="m-0 hidden max-w-[40rem] font-sans text-[15px] leading-[1.55] text-atlas-body tablet:block desktop:text-[17px]">
          {data.deck}
        </p>
        <p className="m-0 max-w-[40rem] font-sans text-sm leading-[1.55] text-atlas-body tablet:hidden">
          {data.deckMobile}
        </p>
      </div>
    </header>
  );
}
