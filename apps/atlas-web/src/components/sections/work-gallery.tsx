import Image from "next/image";
import Link from "next/link";
import type { WorkFixture, WorkProject } from "@/content/work";

type WorkGalleryProps = {
  projects: WorkFixture["gallery"]["projects"];
};

const MEDIA_TONES: Record<
  NonNullable<WorkProject["mediaTone"]>,
  string
> = {
  "ink-gold": "from-atlas-ink-blue to-atlas-gold",
  "moss-clay": "from-atlas-moss to-atlas-clay",
  "ink-rust": "from-atlas-ink-blue to-atlas-rust",
  "clay-moss": "from-atlas-clay to-atlas-moss",
};

function ProjectMedia({ project }: { project: WorkProject }) {
  const toneClass =
    MEDIA_TONES[project.mediaTone ?? "ink-gold"] ?? MEDIA_TONES["ink-gold"];
  const label = project.mediaLabel
    ? `PHOTO — ${project.mediaLabel}`
    : `PHOTO — ${project.name}`;

  if (project.mediaSrc && project.mediaWidth && project.mediaHeight) {
    return (
      <div className="relative h-[220px] w-full overflow-hidden tablet:h-[280px] desktop:h-[380px] desktop:w-[560px] desktop:shrink-0">
        <Image
          src={project.mediaSrc}
          alt={project.mediaLabel ?? project.name}
          width={project.mediaWidth}
          height={project.mediaHeight}
          sizes={project.mediaSizes ?? "(min-width: 1440px) 560px, 100vw"}
          className={
            project.mediaSrc.endsWith(".svg")
              ? "h-full w-full bg-atlas-ink-blue object-contain p-6"
              : "h-full w-full object-cover object-top"
          }
          unoptimized={project.mediaSrc.endsWith(".svg")}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex h-[220px] w-full items-center justify-center bg-gradient-to-br ${toneClass} px-8 tablet:h-[280px] desktop:h-[380px] desktop:w-[560px] desktop:shrink-0`}
      role="img"
      aria-label={label}
    >
      <p className="m-0 max-w-[21rem] text-center font-sans text-[12px] font-medium leading-normal text-white">
        {label}
      </p>
    </div>
  );
}

function ProjectCopy({ project }: { project: WorkProject }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3.5 desktop:max-w-[28.75rem] desktop:gap-4">
      <p className="m-0 font-sans text-[12px] font-medium tracking-[0.08em] text-atlas-rust-ink uppercase">
        {project.category}
      </p>
      <h3 className="m-0 font-display text-[1.5rem] leading-tight font-semibold text-atlas-ink tablet:text-[1.625rem] desktop:text-[1.875rem]">
        {project.name}
      </h3>
      <p className="m-0 hidden font-sans text-base leading-[1.55] text-atlas-body desktop:block">
        {project.summary}
      </p>
      <p className="m-0 hidden font-sans text-[15px] leading-[1.55] text-atlas-body tablet:block desktop:hidden">
        {project.summaryTablet ?? project.summary}
      </p>
      <p className="m-0 font-sans text-sm leading-[1.55] text-atlas-body tablet:hidden">
        {project.summaryMobile ?? project.summary}
      </p>
      {project.metaNote ? (
        <p className="m-0 font-sans text-[13px] font-medium text-atlas-body">
          {project.metaNote}
        </p>
      ) : null}
      {project.href && project.ctaLabel ? (
        <Link
          href={project.href}
          className="mt-1 w-fit font-sans text-[15px] font-semibold text-atlas-rust-ink no-underline transition-opacity duration-[var(--atlas-motion-fast)] hover:opacity-80"
        >
          {project.ctaLabel}
        </Link>
      ) : project.ctaLabel ? (
        <p className="mt-1 m-0 font-sans text-[15px] font-semibold text-atlas-rust-ink">
          {project.ctaLabel}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Story-First work gallery — four alternating full-bleed rows (Figma 616:12 / 632:3 / 616:19).
 * Desktop: media|copy / copy|media rhythm. Tablet/mobile: stacked media → copy.
 */
export function WorkGallery({ projects }: WorkGalleryProps) {
  return (
    <section aria-labelledby="work-gallery-title" className="w-full">
      <h2 id="work-gallery-title" className="sr-only">
        Project gallery
      </h2>
      <div className="flex flex-col">
        {projects.map((project, index) => {
          const mediaLeft =
            (project.mediaSide ?? (index % 2 === 0 ? "left" : "right")) ===
            "left";
          const elevated = index % 2 === 0;

          return (
            <article
              key={project.id}
              className={
                elevated
                  ? "bg-atlas-elevated"
                  : "bg-atlas-paper"
              }
            >
              <div
                className={`atlas-pad-x mx-auto flex max-w-[var(--atlas-page)] flex-col gap-8 py-12 tablet:gap-10 tablet:py-14 desktop:flex-row desktop:items-center desktop:gap-[4.5rem] desktop:py-[4.5rem] ${
                  mediaLeft ? "" : "desktop:flex-row-reverse"
                }`}
              >
                <ProjectMedia project={project} />
                <ProjectCopy project={project} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
