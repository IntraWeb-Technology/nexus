import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { AboutFixture } from "@/content/about";

type AboutArchitectureProps = {
  data: AboutFixture["architecture"];
};

/** Desktop-only — tablet/mobile Figma omits architecture mindset + boundary diagram. */
export function AboutArchitecture({ data }: AboutArchitectureProps) {
  return (
    <section
      aria-labelledby="about-architecture-title"
      className="mx-auto hidden max-w-[var(--atlas-page)] desktop:block"
    >
      <div className="atlas-pad-x space-y-6 py-12">
        <ChapterMarker>{data.chapter}</ChapterMarker>
        <h2
          id="about-architecture-title"
          className="m-0 font-display text-2xl leading-[30px] font-medium text-atlas-ink"
        >
          {data.title}
        </h2>
        <div className="flex gap-10">
          <p className="m-0 max-w-[35rem] font-sans text-[15px] leading-6 text-atlas-body">
            {data.body}
          </p>
          <figure
            className="m-0 flex w-full max-w-[35rem] shrink-0 flex-col gap-3 border-[1.5px] border-atlas-ink bg-atlas-secondary p-6"
            aria-label={data.figureCaption}
          >
            <div className="flex flex-col gap-2" role="list">
              {data.layers.map((layer) => (
                <div
                  key={layer.name}
                  role="listitem"
                  className="flex items-center justify-between border border-atlas-ink bg-atlas-elevated px-3.5 py-3"
                >
                  <span className="font-sans text-[13px] font-semibold text-atlas-ink">
                    {layer.name}
                  </span>
                  <span className="font-mono text-[11px] text-atlas-body">
                    {layer.note}
                  </span>
                </div>
              ))}
            </div>
            <figcaption className="font-sans text-xs leading-4 text-atlas-body">
              {data.figureCaption}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
