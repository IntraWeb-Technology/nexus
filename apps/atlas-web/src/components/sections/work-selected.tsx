import Image from "next/image";
import Link from "next/link";
import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { WorkFixture, WorkProject } from "@/content/work";

type WorkSelectedProps = {
  data: WorkFixture["selected"];
};

function ProjectMedia({
  project,
  className,
  contain = false,
}: {
  project: WorkProject;
  className: string;
  contain?: boolean;
}) {
  if (!project.mediaSrc || !project.mediaWidth || !project.mediaHeight) {
    return null;
  }

  return (
    <div
      className={`relative overflow-hidden rounded-[2px] border border-atlas-border bg-atlas-ink ${className}`.trim()}
    >
      <Image
        src={project.mediaSrc}
        alt={project.mediaLabel ?? project.name}
        width={project.mediaWidth}
        height={project.mediaHeight}
        sizes={project.mediaSizes}
        className={
          contain
            ? "h-full w-full object-contain p-3"
            : "h-full w-full object-cover object-top"
        }
        unoptimized={project.mediaSrc.endsWith(".svg")}
      />
    </div>
  );
}

function ProjectLink({ project }: { project: WorkProject }) {
  return (
    <Link
      href={project.href}
      className="font-sans text-xs font-medium text-atlas-umber no-underline"
    >
      {project.ctaLabel}
    </Link>
  );
}

export function WorkSelected({ data }: WorkSelectedProps) {
  const feature = data.projects.find((p) => p.layout === "feature");
  const offset = data.projects.find((p) => p.layout === "offset");
  const band = data.projects.find((p) => p.layout === "band");

  return (
    <section
      aria-labelledby="work-selected-title"
      className="mx-auto max-w-[var(--atlas-page)]"
    >
      <div className="atlas-pad-x space-y-3 pt-4 pb-8 tablet:pt-6 tablet:pb-8 desktop:space-y-3 desktop:pt-8 desktop:pb-0">
        <ChapterMarker>{data.chapter}</ChapterMarker>
        <h2
          id="work-selected-title"
          className="m-0 font-display text-xl leading-snug font-semibold text-atlas-ink tablet:text-2xl desktop:text-[1.75rem] desktop:leading-9"
        >
          {data.headline}
        </h2>
        <p className="m-0 hidden max-w-[45rem] font-sans text-[15px] leading-[23px] text-atlas-body desktop:block">
          {data.deck}
        </p>
      </div>

      <div className="atlas-pad-x flex flex-col gap-7 pb-8 tablet:gap-8 tablet:pb-10 desktop:gap-14 desktop:pb-12">
        {feature ? (
          <>
            <article className="hidden gap-10 desktop:flex">
              <ProjectMedia
                project={feature}
                contain
                className="h-[420px] w-[760px] shrink-0"
              />
              <div className="flex max-w-[32rem] flex-col gap-3.5">
                <ChapterMarker>{feature.category}</ChapterMarker>
                <h3 className="m-0 font-display text-2xl leading-[30px] font-semibold text-atlas-ink">
                  {feature.name}
                </h3>
                <p className="m-0 font-sans text-sm leading-[22px] text-atlas-body">
                  {feature.summary}
                </p>
                <div className="space-y-1.5 font-mono text-[11px] text-atlas-body">
                  <p className="m-0 whitespace-pre">
                    Theme{"  ·  "}
                    {feature.themes.join(" · ")}
                  </p>
                  <p className="m-0 whitespace-pre">
                    Status{"  ·  "}
                    {feature.statusLabel}
                  </p>
                </div>
                <ProjectLink project={feature} />
              </div>
            </article>

            <article className="bg-atlas-elevated desktop:hidden">
              {feature.mediaSrc && feature.mediaWidth && feature.mediaHeight ? (
                <div className="relative min-h-[160px] overflow-hidden rounded-[2px] border border-atlas-border bg-atlas-secondary tablet:min-h-[240px]">
                  <Image
                    src={feature.mediaSrc}
                    alt={feature.mediaLabel ?? feature.name}
                    width={feature.mediaWidth}
                    height={feature.mediaHeight}
                    sizes="100vw"
                    className="h-full w-full object-contain p-3"
                    unoptimized={feature.mediaSrc.endsWith(".svg")}
                  />
                </div>
              ) : null}
              <div className="space-y-2.5 px-4 py-3.5 tablet:space-y-2.5 tablet:px-6 tablet:py-5">
                <ChapterMarker>{feature.category}</ChapterMarker>
                <h3 className="m-0 font-display text-[17px] font-semibold text-atlas-ink tablet:text-xl">
                  {feature.name}
                </h3>
                <p className="m-0 font-sans text-[13px] leading-5 text-atlas-body tablet:text-sm tablet:leading-[22px]">
                  {feature.summaryMobile ??
                    feature.summaryTablet ??
                    feature.summary}
                </p>
                <ProjectLink project={feature} />
              </div>
            </article>
          </>
        ) : null}

        {offset ? (
          <>
            <article className="hidden items-center gap-12 bg-atlas-secondary py-10 pr-10 pl-[7.5rem] desktop:flex">
              <div className="flex w-[420px] shrink-0 flex-col gap-3">
                <ChapterMarker>{offset.category}</ChapterMarker>
                <h3 className="m-0 font-display text-[22px] leading-7 font-semibold text-atlas-ink">
                  {offset.name}
                </h3>
                <p className="m-0 font-sans text-sm leading-[22px] text-atlas-body">
                  {offset.summary}
                </p>
                <p className="m-0 font-mono text-[11px] text-atlas-body whitespace-pre">
                  Theme{"  ·  "}
                  {offset.themes.join(" · ")}
                </p>
                <ProjectLink project={offset} />
              </div>
              <ProjectMedia
                project={offset}
                contain
                className="h-[300px] w-[560px] shrink-0"
              />
            </article>

            <article className="hidden space-y-3.5 bg-atlas-secondary px-6 py-7 tablet:block desktop:hidden">
              <ChapterMarker>{offset.category}</ChapterMarker>
              <h3 className="m-0 font-display text-lg font-semibold text-atlas-ink">
                {offset.name}
              </h3>
              <p className="m-0 font-sans text-sm leading-[22px] text-atlas-body">
                {offset.summaryTablet ?? offset.summary}
              </p>
              {offset.mediaSrc && offset.mediaWidth && offset.mediaHeight ? (
                <div className="relative min-h-[180px] overflow-hidden rounded-[2px] border border-atlas-border bg-atlas-ink">
                  <Image
                    src={offset.mediaSrc}
                    alt={offset.mediaLabel ?? offset.name}
                    width={offset.mediaWidth}
                    height={offset.mediaHeight}
                    sizes="100vw"
                    className="h-full w-full object-contain p-3"
                    unoptimized={offset.mediaSrc.endsWith(".svg")}
                  />
                </div>
              ) : null}
              <ProjectLink project={offset} />
            </article>

            <article className="bg-atlas-elevated tablet:hidden">
              {offset.mediaSrc && offset.mediaWidth && offset.mediaHeight ? (
                <div className="relative min-h-[160px] overflow-hidden rounded-[2px] border border-atlas-border bg-atlas-ink">
                  <Image
                    src={offset.mediaSrc}
                    alt={offset.mediaLabel ?? offset.name}
                    width={offset.mediaWidth}
                    height={offset.mediaHeight}
                    sizes="100vw"
                    className="h-full w-full object-contain p-3"
                    unoptimized={offset.mediaSrc.endsWith(".svg")}
                  />
                </div>
              ) : null}
              <div className="space-y-2 px-4 py-3.5">
                <ChapterMarker>{offset.category}</ChapterMarker>
                <h3 className="m-0 font-display text-[17px] font-semibold text-atlas-ink">
                  {offset.name}
                </h3>
                <p className="m-0 font-sans text-[13px] leading-5 text-atlas-body">
                  {offset.summaryMobile ?? offset.summary}
                </p>
                <ProjectLink project={offset} />
              </div>
            </article>
          </>
        ) : null}

        {band ? (
          <>
            <article className="hidden items-center justify-between gap-6 border border-atlas-border bg-atlas-elevated px-7 py-8 desktop:flex">
              <ProjectMedia
                project={band}
                className="h-[140px] w-[220px] shrink-0"
              />
              <div className="max-w-[48.75rem] flex-1 space-y-2">
                <ChapterMarker>{band.category}</ChapterMarker>
                <h3 className="m-0 font-display text-lg leading-[23px] font-semibold text-atlas-ink">
                  {band.name}
                </h3>
                <p className="m-0 font-sans text-[13px] leading-5 text-atlas-body">
                  {band.summary}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <ProjectLink project={band} />
                {band.metaNote ? (
                  <p className="m-0 font-mono text-[10px] text-atlas-body">
                    {band.metaNote}
                  </p>
                ) : null}
              </div>
            </article>

            <article className="hidden items-center gap-4 border border-atlas-border bg-atlas-elevated p-5 tablet:flex desktop:hidden">
              {band.mediaSrc && band.mediaWidth && band.mediaHeight ? (
                <div className="relative h-20 w-[100px] shrink-0 overflow-hidden rounded-[2px] border border-atlas-border bg-atlas-ink">
                  <Image
                    src={band.mediaSrc}
                    alt={band.mediaLabel ?? band.name}
                    width={band.mediaWidth}
                    height={band.mediaHeight}
                    sizes="100px"
                    className="h-full w-full object-contain p-1"
                    unoptimized={band.mediaSrc.endsWith(".svg")}
                  />
                </div>
              ) : null}
              <div className="min-w-0 space-y-1.5">
                <ChapterMarker>{band.category}</ChapterMarker>
                <h3 className="m-0 font-display text-base font-semibold text-atlas-ink">
                  {band.name}
                </h3>
                <ProjectLink project={band} />
              </div>
            </article>

            <article className="space-y-2 border border-atlas-border bg-atlas-elevated px-4 py-3.5 tablet:hidden">
              <ChapterMarker>{band.category}</ChapterMarker>
              <h3 className="m-0 font-display text-[17px] font-semibold text-atlas-ink">
                {band.name}
              </h3>
              <p className="m-0 font-sans text-[13px] leading-5 text-atlas-body">
                {band.summaryMobile ?? band.summary}
              </p>
              <ProjectLink project={band} />
            </article>
          </>
        ) : null}
      </div>
    </section>
  );
}
