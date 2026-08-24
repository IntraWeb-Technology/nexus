import Image from "next/image";
import type { AboutFixture } from "@/content/about";

type AboutOpeningProps = {
  data: AboutFixture["opening"];
};

const PORTRAIT_SRC = "/images/brand/john-schibelli-portrait.png";
const PORTRAIT_WIDTH = 450;
const PORTRAIT_HEIGHT = 495;

/**
 * Story-First about opening — large environmental portrait + hero copy (Figma 616:16).
 */
export function AboutOpening({ data }: AboutOpeningProps) {
  return (
    <header className="bg-atlas-paper">
      <div className="atlas-pad-x mx-auto flex max-w-[var(--atlas-page)] flex-col gap-10 py-12 tablet:gap-12 tablet:py-14 desktop:flex-row desktop:items-center desktop:gap-[4.5rem] desktop:py-[5.5rem]">
        <div className="relative aspect-[480/580] w-full max-w-[30rem] shrink-0 overflow-hidden bg-gradient-to-br from-atlas-clay to-atlas-moss desktop:h-[580px] desktop:w-[480px] desktop:max-w-none desktop:aspect-auto">
          <Image
            src={PORTRAIT_SRC}
            alt="Environmental portrait of John Schibelli, natural light"
            width={PORTRAIT_WIDTH}
            height={PORTRAIT_HEIGHT}
            sizes="(min-width: 1440px) 480px, 100vw"
            className="h-full w-full object-cover object-top"
            priority
          />
        </div>

        <div className="flex max-w-[35rem] flex-col gap-5">
          <p className="m-0 font-sans text-[12px] font-medium tracking-[0.08em] text-atlas-rust-ink uppercase">
            {data.chapter}
          </p>
          <h1 className="m-0 font-display text-[1.75rem] leading-[1.15] font-semibold text-atlas-ink tablet:text-[2.125rem] desktop:text-[2.375rem]">
            {data.title}
          </h1>
          <p className="m-0 max-w-[32.5rem] font-sans text-[15px] leading-[1.55] text-atlas-body desktop:text-[17px]">
            {data.deck}
          </p>
          <p className="m-0 font-sans text-[15px] font-medium text-atlas-label">
            {data.meta}
          </p>
        </div>
      </div>
    </header>
  );
}
