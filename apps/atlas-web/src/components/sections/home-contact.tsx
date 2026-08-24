import { AppLink } from "@/components/chrome/app-link";
import { atlasStoryInverseButtonClassName } from "@/components/editorial/atlas-button";
import type { HomepageFixture } from "@/content/homepage";

type HomeContactProps = {
  data: HomepageFixture["contact"];
};

/**
 * Story-First contact invite — full-bleed rust band, white title,
 * blush/cream body, white inverse CTA.
 */
export function HomeContact({ data }: HomeContactProps) {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="bg-atlas-rust"
    >
      <div className="atlas-pad-x mx-auto flex max-w-[var(--atlas-page)] flex-col items-center gap-5 py-16 text-center tablet:py-20 desktop:gap-6 desktop:py-[6.5rem]">
        <h2
          id="contact-title"
          className="m-0 max-w-[40rem] font-display text-[1.75rem] leading-snug font-semibold text-white tablet:text-[2rem] desktop:text-[2.5rem]"
        >
          {data.title}
        </h2>
        <p className="m-0 max-w-[32.5rem] font-sans text-[15px] leading-relaxed text-atlas-cream tablet:text-base">
          {data.body}
        </p>
        <AppLink
          href={data.cta.href}
          className={`${atlasStoryInverseButtonClassName} mt-2`}
        >
          {data.cta.label}
        </AppLink>
      </div>
    </section>
  );
}
