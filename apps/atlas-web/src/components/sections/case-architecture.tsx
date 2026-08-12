import { ArchitectureDiagram } from "@/components/editorial/architecture-diagram";
import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { CaseStudyFixture } from "@/content/case-study";

type CaseArchitectureProps = {
  data: CaseStudyFixture["architecture"];
  caption: string;
  captionShort: string;
};

export function CaseArchitecture({
  data,
  caption,
  captionShort,
}: CaseArchitectureProps) {
  return (
    <section
      id="architecture"
      aria-labelledby="case-architecture-title"
      className="atlas-pad-x mx-auto max-w-[var(--atlas-page)] scroll-mt-24 py-5 tablet:py-7 desktop:py-8 desktop:pb-14"
    >
      <div className="mb-4 space-y-2.5 desktop:mb-6">
        <ChapterMarker>{data.chapter}</ChapterMarker>
        <h2
          id="case-architecture-title"
          className="m-0 font-display text-xl leading-[26px] font-semibold text-atlas-ink tablet:text-[1.375rem] tablet:leading-7 desktop:text-[1.75rem] desktop:leading-9"
        >
          {data.title}
        </h2>
        <p className="m-0 hidden max-w-[var(--atlas-reading)] font-sans text-[15px] leading-[23px] text-atlas-body desktop:block">
          {data.intro}
        </p>
      </div>

      <ArchitectureDiagram
        requestPath={data.requestPath}
        deliveryPath={data.deliveryPath}
        tabletRequest={data.tabletRequest}
        tabletDelivery={data.tabletDelivery}
        mobileNodes={data.mobileNodes}
        legend={data.legend}
        caption={caption}
        captionShort={captionShort}
      />
    </section>
  );
}
