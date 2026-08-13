import { AtlasCtaPair } from "@/components/editorial/atlas-button";
import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { ArticlesIndexFixture } from "@/content/article";

type ArticlesCueProps = {
  data: ArticlesIndexFixture["cue"];
};

/**
 * Quiet Contact / Work cue — primary button + secondary Work link.
 * Not a newsletter or marketing signup. No social icons.
 */
export function ArticlesCue({ data }: ArticlesCueProps) {
  return (
    <section
      aria-labelledby="articles-cue-title"
      className="bg-atlas-secondary"
    >
      <div className="mx-auto max-w-[var(--atlas-page)]">
        <div className="atlas-pad-x space-y-3 py-10 tablet:py-11 desktop:space-y-3.5 desktop:py-12">
          <ChapterMarker>{data.chapter}</ChapterMarker>
          <h2
            id="articles-cue-title"
            className="m-0 font-display text-[1.375rem] leading-7 font-semibold text-atlas-ink tablet:text-[1.625rem] tablet:leading-8 desktop:text-[1.875rem] desktop:leading-[41px]"
          >
            {data.title}
          </h2>
          <p className="m-0 hidden max-w-[40rem] font-sans text-base leading-[22px] text-atlas-body desktop:block">
            {data.body}
          </p>
          <p className="m-0 max-w-[40rem] font-sans text-sm leading-[22px] text-atlas-body desktop:hidden">
            {data.bodyCompact}
          </p>
          <AtlasCtaPair cta={data.cta} workLink={data.workLink} layout="row" />
        </div>
      </div>
    </section>
  );
}
