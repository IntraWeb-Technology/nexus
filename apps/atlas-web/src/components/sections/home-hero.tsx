import Image from "next/image";
import { AppLink } from "@/components/chrome/app-link";
import {
  atlasStoryPrimaryButtonClassName,
  atlasStorySecondaryOnDarkButtonClassName,
} from "@/components/editorial/atlas-button";
import type { HomepageFixture } from "@/content/homepage";

type HomeHeroProps = {
  data: HomepageFixture["hero"];
};

/** Tablet (768–1439): full-bleed photo band, stacked above copy (Figma 632:2). */
const tabletMediaFrameClassName =
  "tablet:order-first tablet:h-[420px] tablet:min-h-[420px] tablet:w-[calc(100%+2*var(--atlas-pad-x))] tablet:-mx-[var(--atlas-pad-x)] tablet:rounded-none desktop:order-none desktop:mx-0 desktop:h-auto desktop:min-h-[520px] desktop:w-auto desktop:rounded-[2px]";

/**
 * Story-First homepage hero — full-bleed ink-blue band, gold chapter,
 * white Newsreader title, cream deck, rust + cream-outline CTAs,
 * media on the right (desktop) with gradient fallback.
 * Tablet (Figma 632:2 / C3 / C8): photo then copy, one rust primary CTA.
 * Desktop and mobile retain both CTAs (C3/C8).
 */
export function HomeHero({ data }: HomeHeroProps) {
  const hasMedia = Boolean(data.mediaSrc && data.mediaWidth && data.mediaHeight);

  return (
    <section
      aria-labelledby="hero-title"
      className="bg-atlas-ink-blue text-white"
    >
      <div className="mx-auto grid max-w-[var(--atlas-page)] grid-cols-1 items-center gap-10 px-[var(--atlas-pad-x)] py-16 tablet:gap-0 tablet:py-0 desktop:grid-cols-[minmax(0,1fr)_minmax(0,560px)] desktop:gap-16 desktop:py-24">
        <div className="flex max-w-[37.5rem] flex-col gap-5 tablet:pt-14 tablet:pb-16 desktop:gap-6 desktop:py-0">
          <p className="m-0 font-sans text-[13px] leading-4 font-medium tracking-[0.04em] text-atlas-gold">
            {data.chapter}
          </p>
          <h1
            id="hero-title"
            className="m-0 font-display text-[2rem] leading-[1.15] font-semibold tracking-tight text-white tablet:text-[2.5rem] desktop:text-[3.25rem] desktop:leading-[1.12]"
          >
            {data.title}
          </h1>
          <p className="m-0 max-w-[35rem] font-sans text-[15px] leading-relaxed text-atlas-cream tablet:text-base">
            {data.deck}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <AppLink
              href={data.primaryCta.href}
              className={atlasStoryPrimaryButtonClassName}
            >
              {data.primaryCta.label}
            </AppLink>
            <AppLink
              href={data.secondaryCta.href}
              className={`${atlasStorySecondaryOnDarkButtonClassName} tablet:hidden desktop:inline-flex`}
            >
              {data.secondaryCta.label}
            </AppLink>
          </div>
        </div>

        {hasMedia ? (
          <div
            className={`relative min-h-[280px] overflow-hidden rounded-[2px] bg-gradient-to-br from-atlas-ink-blue via-[#24344d] to-atlas-moss ${tabletMediaFrameClassName}`}
          >
            <Image
              src={data.mediaSrc!}
              alt={data.mediaAlt}
              width={data.mediaWidth}
              height={data.mediaHeight}
              sizes={data.mediaSizes}
              priority
              className="h-full w-full object-cover object-top opacity-90"
            />
          </div>
        ) : (
          <div
            className={`min-h-[280px] rounded-[2px] bg-gradient-to-br from-[#24344d] via-atlas-ink-blue to-atlas-moss ${tabletMediaFrameClassName}`}
            role="img"
            aria-label={`${data.mediaLabel}. ${data.mediaNote.replace(/\n/g, " ")}`}
          />
        )}
      </div>
    </section>
  );
}
