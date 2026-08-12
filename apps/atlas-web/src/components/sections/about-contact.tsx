import Link from "next/link";
import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { AboutFixture } from "@/content/about";

type AboutContactProps = {
  data: AboutFixture["contact"];
};

/**
 * About contact bridge — left local (Stability).
 * Differs from Home/Work/Case bridges in title, body, and stack rhythm.
 */
export function AboutContact({ data }: AboutContactProps) {
  return (
    <section
      id="contact"
      aria-labelledby="about-contact-title"
      className="bg-atlas-ink text-atlas-elevated"
    >
      <div className="atlas-pad-x mx-auto flex max-w-[var(--atlas-page)] flex-col gap-4 py-10 tablet:py-14 desktop:gap-4 desktop:p-16">
        <ChapterMarker className="!text-atlas-secondary">
          {data.chapter}
        </ChapterMarker>
        <h2
          id="about-contact-title"
          className="m-0 font-display text-[1.375rem] leading-snug font-medium text-atlas-elevated tablet:text-2xl desktop:text-[1.75rem] desktop:leading-[34px]"
        >
          {data.title}
        </h2>
        <p className="m-0 hidden max-w-[40rem] font-sans text-[15px] leading-6 text-atlas-secondary desktop:block">
          {data.body}
        </p>
        <p className="m-0 max-w-[40rem] font-sans text-sm leading-[22px] text-atlas-secondary desktop:hidden">
          {data.bodyCondensed}
        </p>
        <Link
          href={data.cta.href}
          className="mt-1 inline-flex w-fit rounded-[2px] bg-atlas-elevated px-[18px] py-3 font-sans text-[13px] font-medium text-atlas-ink no-underline"
        >
          {data.cta.label}
        </Link>
        <p className="m-0 hidden font-mono text-[11px] text-atlas-secondary desktop:block">
          {data.meta}
        </p>
      </div>
    </section>
  );
}
