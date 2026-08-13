import { AtlasPrimaryButton } from "@/components/editorial/atlas-button";
import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { AboutFixture } from "@/content/about";

type AboutContactProps = {
  data: AboutFixture["contact"];
};

/**
 * About contact bridge — elevated paper + umber primary (M9D).
 * Left local (Stability); title/body rhythm differ from Home/Case.
 */
export function AboutContact({ data }: AboutContactProps) {
  return (
    <section
      id="contact"
      aria-labelledby="about-contact-title"
      className="border-y border-[#c8beaa] bg-atlas-elevated"
    >
      <div className="atlas-pad-x mx-auto flex max-w-[var(--atlas-page)] flex-col items-start gap-4 py-10 tablet:py-14 desktop:gap-4 desktop:p-16">
        <ChapterMarker className="!text-atlas-sage">
          {data.chapter}
        </ChapterMarker>
        <h2
          id="about-contact-title"
          className="m-0 font-display text-[1.375rem] leading-snug font-semibold text-atlas-ink tablet:text-2xl desktop:text-[1.75rem] desktop:leading-[34px]"
        >
          {data.title}
        </h2>
        <p className="m-0 hidden max-w-[40rem] font-sans text-[15px] leading-6 text-atlas-body desktop:block">
          {data.body}
        </p>
        <p className="m-0 max-w-[40rem] font-sans text-sm leading-[22px] text-atlas-body desktop:hidden">
          {data.bodyCondensed}
        </p>
        <AtlasPrimaryButton href={data.cta.href} className="mt-1">
          {data.cta.label}
        </AtlasPrimaryButton>
        <p className="m-0 hidden font-mono text-[11px] text-atlas-body desktop:block">
          {data.meta}
        </p>
      </div>
    </section>
  );
}
