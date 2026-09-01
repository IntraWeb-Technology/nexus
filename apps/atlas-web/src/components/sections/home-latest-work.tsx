import Image from "next/image";
import Link from "next/link";
import type { HomepageFixture } from "@/content/homepage";

type HomeLatestWorkProps = {
  featured: HomepageFixture["featured"];
  selected: HomepageFixture["selected"];
};

/**
 * Story-First "Latest work" — section head + featured horizontal card + 3-col grid.
 * Combines former HomeFeatured + HomeSelected compositions.
 */
export function HomeLatestWork({ featured, selected }: HomeLatestWorkProps) {
  const sectionTitle = selected.sectionTitle ?? "Latest work";
  const viewAll = selected.viewAll ?? {
    label: "View all work →",
    href: "/work",
  };
  const deck = selected.deck ?? "A few things I've been building lately.";

  return (
    <section
      id="selected-work"
      aria-labelledby="latest-work-title"
      className="mx-auto max-w-[var(--atlas-page)]"
    >
      <div className="atlas-pad-x space-y-4 pt-16 pb-8 tablet:pt-20 desktop:pt-[7.5rem]">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2
            id="latest-work-title"
            className="m-0 font-display text-[1.75rem] leading-tight font-semibold text-atlas-ink tablet:text-[2rem] desktop:text-[2.125rem]"
          >
            {sectionTitle}
          </h2>
          <Link
            href={viewAll.href}
            className="font-sans text-[15px] font-medium text-atlas-rust-ink no-underline transition-opacity duration-[var(--atlas-motion-fast)] hover:opacity-80"
          >
            {viewAll.label}
          </Link>
        </div>
        <p className="m-0 max-w-[37.5rem] font-sans text-[15px] leading-relaxed text-atlas-body">
          {deck}
        </p>
      </div>

      <article className="atlas-pad-x pb-10">
        <div className="grid overflow-hidden rounded-[2px] border border-atlas-border bg-atlas-elevated desktop:grid-cols-[minmax(0,640px)_minmax(0,1fr)]">
          {featured.figureSrc &&
          featured.figureWidth &&
          featured.figureHeight ? (
            <div className="relative min-h-[220px] bg-atlas-secondary tablet:min-h-[280px] desktop:min-h-[420px]">
              <Image
                src={featured.figureSrc}
                alt={featured.figureAlt}
                width={featured.figureWidth}
                height={featured.figureHeight}
                sizes={featured.figureSizes}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div
              className="min-h-[220px] bg-gradient-to-br from-atlas-secondary via-atlas-cream to-atlas-blush tablet:min-h-[280px] desktop:min-h-[420px]"
              role="img"
              aria-label={featured.figureAlt}
            />
          )}
          <div className="flex flex-col justify-center gap-4 p-6 tablet:p-8 desktop:px-14 desktop:py-10">
            <p className="m-0 font-sans text-[11px] font-medium tracking-[0.08em] text-atlas-label uppercase">
              {featured.chapter}
            </p>
            <h3 className="m-0 font-display text-[1.75rem] leading-tight font-semibold text-atlas-ink desktop:text-[2rem]">
              {featured.title}
            </h3>
            <p className="m-0 max-w-[28.75rem] font-sans text-sm leading-relaxed text-atlas-body">
              {featured.summary ?? featured.outcome}
            </p>
            <Link
              href={featured.cta.href}
              className="mt-1 w-fit font-sans text-[15px] font-medium text-atlas-rust-ink no-underline transition-opacity duration-[var(--atlas-motion-fast)] hover:opacity-80"
            >
              {featured.cta.label}
            </Link>
          </div>
        </div>
      </article>

      <ul className="atlas-pad-x m-0 grid list-none grid-cols-1 gap-8 p-0 pb-16 tablet:grid-cols-2 tablet:gap-6 desktop:grid-cols-3 desktop:gap-8 desktop:pb-20">
        {selected.projects.map((project) => (
          <li key={project.id}>
            <article className="flex h-full flex-col gap-3.5">
              {project.mediaSrc &&
              project.mediaWidth &&
              project.mediaHeight ? (
                <div className="relative min-h-[160px] overflow-hidden rounded-[2px] bg-atlas-secondary tablet:min-h-[200px] desktop:min-h-[260px]">
                  <Image
                    src={project.mediaSrc}
                    alt={project.mediaAlt ?? project.title}
                    width={project.mediaWidth}
                    height={project.mediaHeight}
                    sizes={project.mediaSizes}
                    className="h-full w-full object-contain object-left p-4"
                    unoptimized={project.mediaSrc.endsWith(".svg")}
                  />
                </div>
              ) : (
                <div
                  className="min-h-[160px] rounded-[2px] bg-gradient-to-br from-atlas-secondary to-atlas-cream tablet:min-h-[200px] desktop:min-h-[260px]"
                  aria-hidden="true"
                />
              )}
              <p className="m-0 font-sans text-[11px] font-medium tracking-[0.08em] text-atlas-label uppercase">
                {project.eyebrow}
              </p>
              <h3 className="m-0 font-display text-lg font-semibold text-atlas-ink">
                {project.href ? (
                  <Link
                    href={project.href}
                    className="text-inherit no-underline transition-colors duration-[var(--atlas-motion-fast)] hover:text-atlas-rust-ink"
                  >
                    {project.title}
                  </Link>
                ) : (
                  project.title
                )}
              </h3>
              <p className="m-0 font-sans text-[13px] leading-relaxed text-atlas-body">
                {project.outcome}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
