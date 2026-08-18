import { AtlasPrimaryButton } from "@/components/editorial/atlas-button";
import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { HomepageFixture } from "@/content/homepage";

type HomeContactProps = {
  data: HomepageFixture["contact"];
};

/**
 * Home contact bridge — elevated paper field + umber primary (M9D).
 * Fixture copy unchanged; visual treatment only.
 */
export function HomeContact({ data }: HomeContactProps) {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="border-y border-[#c8beaa] bg-atlas-elevated"
    >
      <div className="atlas-pad-x mx-auto flex max-w-[var(--atlas-page)] flex-col gap-8 py-14 tablet:flex-row tablet:items-center tablet:justify-between tablet:gap-12 desktop:py-[4.5rem]">
        <div className="max-w-3xl space-y-3.5">
          <ChapterMarker className="!text-atlas-sage">{data.chapter}</ChapterMarker>
          <h2
            id="contact-title"
            className="m-0 font-display text-[1.5rem] leading-snug font-semibold text-atlas-ink desktop:text-[1.625rem] desktop:leading-8"
          >
            {data.title}
          </h2>
          <p className="m-0 max-w-xl font-sans text-sm leading-relaxed text-atlas-body">
            {data.body}
          </p>
        </div>
        <div className="flex flex-col items-start gap-3">
          <AtlasPrimaryButton href={data.cta.href} className="py-3.5">
            {data.cta.label}
          </AtlasPrimaryButton>
          <p className="m-0 font-sans text-xs text-atlas-body">{data.meta}</p>
        </div>
      </div>
    </section>
  );
}
