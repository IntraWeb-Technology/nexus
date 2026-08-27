import Image from "next/image";
import type { AboutFixture } from "@/content/about";

type AboutOpeningProps = {
  data: AboutFixture["opening"];
};

const PORTRAIT_ALT =
  "John Schibelli standing with arms crossed in a sunlit room, wearing glasses and a striped shirt.";

/**
 * Story-First opening — art-directed portrait + introductory narrative.
 * Desktop 616:16 side-by-side; Tablet 632:7 680px full-bleed; Mobile 632:12 full-width.
 */
function AboutPortrait() {
  return (
    <div className="relative z-0 h-[380px] w-full shrink-0 overflow-hidden bg-atlas-secondary tablet:h-[680px] desktop:h-[580px] desktop:w-[480px]">
      <Image
        src="/images/brand/about/portrait-mobile.png"
        alt={PORTRAIT_ALT}
        width={780}
        height={760}
        sizes="100vw"
        priority
        className="h-full w-full object-cover object-center tablet:hidden"
      />
      <Image
        src="/images/brand/about/portrait-tablet.png"
        alt={PORTRAIT_ALT}
        width={1536}
        height={1360}
        sizes="100vw"
        className="hidden h-full w-full object-cover object-center tablet:block desktop:hidden"
      />
      <Image
        src="/images/brand/about/portrait-desktop.png"
        alt={PORTRAIT_ALT}
        width={960}
        height={1160}
        sizes="480px"
        className="hidden h-full w-full object-cover object-center desktop:block"
      />
    </div>
  );
}

export function AboutOpening({ data }: AboutOpeningProps) {
  return (
    <header className="bg-atlas-paper">
      <div className="desktop:atlas-pad-x desktop:mx-auto desktop:flex desktop:max-w-[var(--atlas-page)] desktop:items-center desktop:gap-[4.5rem] desktop:py-[5.5rem]">
        <AboutPortrait />
        <div className="atlas-pad-x flex flex-col gap-3.5 pt-8 pb-10 tablet:gap-[18px] tablet:pt-12 tablet:pb-14 desktop:max-w-[35rem] desktop:gap-5 desktop:px-0 desktop:py-0">
          <p className="m-0 font-sans text-[12px] font-medium tracking-[0.08em] text-atlas-rust-ink uppercase">
            {data.chapter}
          </p>
          <h1 className="m-0 font-display text-[1.5rem] leading-[1.15] font-semibold text-atlas-ink tablet:text-[2rem] desktop:text-[2.375rem]">
            {data.title}
          </h1>
          <p className="m-0 max-w-[32.5rem] font-sans text-[14px] leading-[1.55] text-atlas-body tablet:text-[15px] desktop:text-[17px]">
            {data.deck}
          </p>
          <p className="m-0 font-sans text-[13px] font-medium text-atlas-label tablet:text-[14px] desktop:text-[15px]">
            {data.meta}
          </p>
        </div>
      </div>
    </header>
  );
}
