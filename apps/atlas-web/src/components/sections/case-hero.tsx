import { ChapterMarker } from "@/components/editorial/chapter-marker";
import { MetadataRow } from "@/components/editorial/metadata-row";
import type { CaseStudyFixture } from "@/content/case-study";

type CaseHeroProps = {
  data: CaseStudyFixture["hero"];
};

export function CaseHero({ data }: CaseHeroProps) {
  return (
    <header className="atlas-pad-x mx-auto max-w-[var(--atlas-page)] pt-8 pb-7 tablet:pt-10 tablet:pb-7 desktop:pt-16 desktop:pb-10">
      <div className="flex max-w-[55rem] flex-col gap-3.5 tablet:gap-3.5 desktop:gap-5">
        <ChapterMarker>{data.chapter}</ChapterMarker>
        <h1 className="m-0 font-display text-[1.875rem] leading-9 font-semibold text-atlas-ink tablet:text-4xl tablet:leading-[42px] desktop:text-[3rem] desktop:leading-[60px]">
          {data.title}
        </h1>
        <p className="m-0 hidden max-w-[55rem] font-sans text-lg leading-7 text-atlas-body desktop:block">
          {data.deck}
        </p>
        <p className="m-0 hidden font-sans text-sm leading-[22px] text-atlas-body tablet:block desktop:hidden">
          {data.deckTablet}
        </p>
        <p className="m-0 font-sans text-sm leading-[22px] text-atlas-body tablet:hidden">
          {data.deckMobile}
        </p>

        {/* Desktop metadata grid */}
        <MetadataRow className="hidden desktop:flex" items={data.meta} />

        {/* Tablet compact meta */}
        <div className="hidden space-y-1.5 tablet:block desktop:hidden">
          <p className="m-0 font-mono text-[11px] whitespace-pre text-atlas-body">
            {data.metaLineTablet}
          </p>
          <p className="m-0 font-mono text-[11px] text-atlas-body">
            {data.stackLine}
          </p>
        </div>

        {/* Mobile compact meta */}
        <div className="space-y-1 tablet:hidden">
          <p className="m-0 font-mono text-[10px] text-atlas-body">
            {data.metaLineMobileYear}
          </p>
          <p className="m-0 font-mono text-[10px] text-atlas-body">
            {data.metaLineMobileRole}
          </p>
        </div>
      </div>
    </header>
  );
}
