import { AtlasCtaPair } from "@/components/editorial/atlas-button";
import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { ArticleDetail } from "@/content/article";

type ArticleContactProps = {
  data: ArticleDetail["contact"];
};

/**
 * Article contact bridge — secondary band + primary umber CTA (M9D).
 * No social icons in the CTA area.
 */
export function ArticleContact({ data }: ArticleContactProps) {
  return (
    <section
      id="contact"
      aria-labelledby="article-contact-title"
      className="border-y border-atlas-border bg-atlas-secondary"
    >
      <div className="atlas-pad-x mx-auto flex max-w-[var(--atlas-page)] flex-col gap-3 py-10 tablet:gap-3.5 tablet:py-11 desktop:gap-4 desktop:pt-14 desktop:pb-16">
        <ChapterMarker>{data.chapter}</ChapterMarker>
        <h2
          id="article-contact-title"
          className="m-0 font-display text-[1.375rem] leading-[30px] font-semibold text-atlas-ink tablet:text-2xl tablet:leading-[30px] desktop:text-[1.625rem] desktop:leading-[34px]"
        >
          {data.title}
        </h2>
        <p className="m-0 hidden max-w-[40rem] font-sans text-sm leading-[22px] text-atlas-body desktop:block">
          {data.body}
        </p>
        <p className="m-0 max-w-[40rem] font-sans text-sm leading-[22px] text-atlas-body desktop:hidden">
          {data.bodyCompact ?? data.body}
        </p>
        <AtlasCtaPair cta={data.cta} workLink={data.workLink} layout="stack" />
      </div>
    </section>
  );
}
