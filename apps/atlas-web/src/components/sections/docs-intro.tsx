import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { DocsIndexFixture } from "@/content/doc";

type DocsIntroProps = {
  data: DocsIndexFixture["intro"];
};

export function DocsIntro({ data }: DocsIntroProps) {
  return (
    <header className="mx-auto max-w-[var(--atlas-page)]">
      <div className="atlas-pad-x space-y-5 pt-9 pb-0 tablet:space-y-5 tablet:pt-14 tablet:pb-0 desktop:gap-5 desktop:pt-14 desktop:pb-0">
        <ChapterMarker>{data.chapter}</ChapterMarker>
        <h1 className="m-0 font-display text-[1.75rem] leading-[34px] font-semibold text-atlas-ink tablet:text-[2.5rem] tablet:leading-[46px] desktop:text-[2.5rem] desktop:leading-[46px]">
          {data.title}
        </h1>
        <p className="m-0 hidden max-w-[40rem] font-sans text-base leading-6 text-atlas-body desktop:block">
          {data.dek}
        </p>
        <p className="m-0 max-w-[40rem] font-sans text-sm leading-6 text-atlas-body tablet:text-base desktop:hidden">
          {data.dekCompact}
        </p>
      </div>
    </header>
  );
}
