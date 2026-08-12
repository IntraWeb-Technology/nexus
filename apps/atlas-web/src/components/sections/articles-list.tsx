import Link from "next/link";
import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { ArticleSummary, ArticlesIndexFixture } from "@/content/article";
import { summaryMetaCompact } from "@/content/articles/summaries";

type ArticlesListRowProps = {
  article: ArticleSummary;
};

export function ArticlesListRow({ article }: ArticlesListRowProps) {
  return (
    <li className="border-t border-atlas-border">
      {/* Desktop: date | title+excerpt | meta */}
      <Link
        href={article.href}
        className="hidden items-start gap-6 py-5 no-underline desktop:flex"
      >
        <time
          dateTime={article.publishedDate}
          className="w-24 shrink-0 font-mono text-xs text-atlas-body"
        >
          {article.publishedDate}
        </time>
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="m-0 font-display text-xl leading-[26px] font-semibold text-atlas-ink">
            {article.title}
          </p>
          <p className="m-0 font-sans text-[13px] leading-5 text-atlas-body">
            {article.excerpt}
          </p>
        </div>
        <p className="m-0 shrink-0 font-mono text-[11px] text-atlas-body whitespace-pre">
          {summaryMetaCompact(article)}
        </p>
      </Link>

      {/* Tablet + mobile: stacked */}
      <Link
        href={article.href}
        className="block space-y-2 py-[18px] no-underline desktop:hidden"
      >
        <time
          dateTime={article.publishedDate}
          className="font-mono text-[11px] text-atlas-body"
        >
          {article.publishedDate}
        </time>
        <p className="m-0 font-display text-lg leading-6 font-semibold text-atlas-ink tablet:text-xl tablet:leading-6">
          {article.title}
        </p>
        <p className="m-0 font-sans text-[13px] leading-5 text-atlas-body">
          {article.excerptCompact ?? article.excerpt}
        </p>
        <p className="m-0 font-mono text-[11px] text-atlas-body">
          {summaryMetaCompact(article)}
        </p>
      </Link>
    </li>
  );
}

type ArticlesListProps = {
  data: ArticlesIndexFixture["list"];
};

export function ArticlesList({ data }: ArticlesListProps) {
  return (
    <section
      aria-labelledby="articles-list-title"
      className="mx-auto max-w-[var(--atlas-page)]"
    >
      <div className="atlas-pad-x pt-2 pb-12 tablet:pb-10 desktop:pb-12">
        <div className="mb-4 space-y-2 tablet:mb-4 desktop:mb-4">
          <ChapterMarker>{data.chapter}</ChapterMarker>
          <h2
            id="articles-list-title"
            className="m-0 font-display text-[1.375rem] leading-7 font-semibold text-atlas-ink tablet:text-2xl tablet:leading-7 desktop:text-2xl desktop:leading-[30px]"
          >
            {data.headline}
          </h2>
        </div>

        <ul className="m-0 list-none p-0">
          {data.articles.map((article) => (
            <ArticlesListRow key={article.id} article={article} />
          ))}
        </ul>

        <hr className="atlas-hairline" />
      </div>
    </section>
  );
}
