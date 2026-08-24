import type { CaseStudyFixture } from "@/content/case-study";

type CaseHeroProps = {
  data: CaseStudyFixture["hero"];
};

/**
 * Story-First case study hero — full-bleed ink→gold gradient (Figma 616:13).
 * Meta row is rendered separately below.
 */
export function CaseHero({ data }: CaseHeroProps) {
  return (
    <header className="flex min-h-[320px] items-end bg-gradient-to-br from-atlas-ink-blue via-[#2a3a52] to-atlas-gold text-white tablet:min-h-[420px] desktop:min-h-[640px]">
      <div className="atlas-pad-x mx-auto flex w-full max-w-[var(--atlas-page)] flex-col gap-4 pb-12 pt-16 tablet:gap-4 tablet:pb-14 tablet:pt-20 desktop:gap-4 desktop:pb-[4.5rem] desktop:pt-24">
        <p className="m-0 font-sans text-[12px] font-medium tracking-[0.08em] text-white/90 uppercase">
          {data.chapter}
        </p>
        <h1 className="m-0 max-w-[47.5rem] font-display text-[2rem] leading-tight font-semibold text-white tablet:text-[2.75rem] tablet:leading-[1.1] desktop:text-[3.5rem]">
          {data.title}
        </h1>
        <p className="m-0 hidden max-w-[43.75rem] font-sans text-lg leading-[1.5] text-white desktop:block">
          {data.deck}
        </p>
        <p className="m-0 hidden max-w-[43.75rem] font-sans text-[15px] leading-[1.5] text-white tablet:block desktop:hidden">
          {data.deckTablet}
        </p>
        <p className="m-0 max-w-[43.75rem] font-sans text-sm leading-[1.5] text-white tablet:hidden">
          {data.deckMobile}
        </p>
      </div>
    </header>
  );
}
