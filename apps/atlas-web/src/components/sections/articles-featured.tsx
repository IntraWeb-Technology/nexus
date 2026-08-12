import Link from "next/link";
import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { ArticlesIndexFixture } from "@/content/article";
import { summaryMetaLine } from "@/content/articles/summaries";

type ArticlesFeaturedProps = {
  data: ArticlesIndexFixture["featured"];
};

export function ArticlesFeatured({ data }: ArticlesFeaturedProps) {
  const { article, chapter, ctaLabel } = data;

  return (
    <section
      aria-labelledby="articles-featured-title"
      className="mx-auto max-w-[var(--atlas-page)]"
    >
      <div className="atlas-pad-x space-y-5 py-6 tablet:space-y-4 tablet:py-5 desktop:space-y-5 desktop:pt-6 desktop:pb-10">
        <div className="flex items-start justify-between gap-6">
          <ChapterMarker>{chapter}</ChapterMarker>
          <p className="m-0 hidden font-mono text-[11px] text-atlas-body whitespace-pre desktop:block">
            {summaryMetaLine(article)}
          </p>
        </div>

        <p className="m-0 font-mono text-[11px] text-atlas-body desktop:hidden">
          {summaryMetaLine(article)}
        </p>

        <h2
          id="articles-featured-title"
          className="m-0 max-w-[45rem] font-display text-[1.75rem] leading-10 font-semibold text-atlas-ink tablet:text-[2rem] tablet:leading-10 desktop:text-4xl desktop:leading-[44px]"
        >
          <Link href={article.href} className="text-atlas-ink no-underline">
            {article.title}
          </Link>
        </h2>

        <p className="m-0 max-w-[45rem] font-sans text-base leading-[26px] text-atlas-body">
          {article.excerpt}
        </p>

        <p className="m-0">
          <Link
            href={article.href}
            className="font-sans text-[13px] font-medium text-atlas-umber no-underline"
          >
            {ctaLabel}
          </Link>
        </p>

        <hr className="atlas-hairline" />
      </div>
    </section>
  );
}
