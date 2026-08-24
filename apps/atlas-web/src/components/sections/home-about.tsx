import Link from "next/link";
import type { HomepageFixture } from "@/content/homepage";

type HomeAboutProps = {
  data: HomepageFixture["about"];
};

/**
 * Story-First about teaser — elevated surface, clay portrait placeholder,
 * title + two body paragraphs + rust CTA.
 */
export function HomeAbout({ data }: HomeAboutProps) {
  const title = data.title ?? "A bit about me";

  return (
    <section
      aria-labelledby="about-preview-title"
      className="border-y border-atlas-border bg-atlas-elevated"
    >
      <div className="atlas-pad-x mx-auto flex max-w-[var(--atlas-page)] flex-col gap-8 py-14 tablet:flex-row tablet:items-start tablet:gap-10 tablet:py-16 desktop:gap-16 desktop:py-[6.25rem]">
        <div
          className="aspect-[340/400] w-full max-w-[21.25rem] shrink-0 rounded-[2px] bg-atlas-clay tablet:w-[14rem] desktop:w-[21.25rem]"
          role="img"
          aria-label="Portrait placeholder"
        />
        <div className="flex max-w-[35rem] flex-col gap-4 desktop:pt-12">
          <h2
            id="about-preview-title"
            className="m-0 font-display text-[1.5rem] leading-tight font-semibold text-atlas-ink desktop:text-[1.875rem]"
          >
            {title}
          </h2>
          <p className="m-0 font-sans text-[15px] leading-relaxed text-atlas-body">
            {data.summary}
          </p>
          {data.body ? (
            <p className="m-0 font-sans text-[15px] leading-relaxed text-atlas-body">
              {data.body}
            </p>
          ) : null}
          <Link
            href={data.href}
            className="mt-2 w-fit font-sans text-[15px] font-medium text-atlas-rust-ink no-underline transition-opacity duration-[var(--atlas-motion-fast)] hover:opacity-80"
          >
            {data.ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
