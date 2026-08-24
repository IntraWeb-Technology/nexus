import Link from "next/link";
import { ChapterMarker } from "@/components/editorial/chapter-marker";
import {
  interactiveRowArrowClassName,
  interactiveRowClasses,
  interactiveRowTitleClassName,
} from "@/components/editorial/interactive-row";
import type { ArticleSummary, ArticlesIndexFixture } from "@/content/article";
import { archiveMetaLine } from "@/content/articles/summaries";

type EvidenceThumbProps = {
  topic: ArticleSummary["topic"];
};

/**
 * Decorative geometric evidence placeholder keyed by topic — not stock photos.
 */
function EvidenceThumb({ topic }: EvidenceThumbProps) {
  return (
    <div
      aria-hidden="true"
      className="relative h-[70px] w-[112px] shrink-0 overflow-hidden rounded-[4px] border border-atlas-border bg-atlas-secondary"
    >
      {topic === "Testing" ? (
        <div className="absolute inset-0 flex flex-col justify-center gap-2 px-2.5">
          <span className="block h-0.5 w-full bg-atlas-sage" />
          <span className="block h-0.5 w-full bg-atlas-border" />
          <span className="block h-0.5 w-full bg-atlas-sage" />
          <span className="block h-0.5 w-full bg-atlas-border" />
          <span className="block h-0.5 w-full bg-atlas-sage" />
        </div>
      ) : null}
      {topic === "Architecture" ? (
        <>
          <span className="absolute top-[15px] left-[11px] h-3.5 w-[22px] rounded-[2px] border border-atlas-umber bg-atlas-paper" />
          <span className="absolute top-[33px] left-[45px] h-3.5 w-[22px] rounded-[2px] border border-atlas-umber bg-atlas-paper" />
          <span className="absolute top-[15px] left-[79px] h-3.5 w-[22px] rounded-[2px] border border-atlas-umber bg-atlas-paper" />
          <span className="absolute top-[27px] left-[33px] h-px w-[70px] bg-atlas-umber" />
        </>
      ) : null}
      {topic === "Platform" ? (
        <div className="absolute inset-0 flex items-center justify-center gap-2.5 px-2.5">
          <span className="h-[46px] w-[22px] border border-atlas-border bg-atlas-paper" />
          <span className="h-[46px] w-[22px] border border-atlas-border bg-[#949e8a]" />
          <span className="h-[46px] w-[22px] border border-atlas-border bg-atlas-paper" />
        </div>
      ) : null}
      {topic === "Tooling" ? (
        <>
          <span className="absolute top-[17px] left-[9px] h-2 w-5 border border-atlas-border bg-atlas-paper" />
          <span className="absolute top-[35px] left-[37px] h-2 w-5 border border-atlas-border bg-atlas-paper" />
          <span className="absolute top-[17px] left-[65px] h-2 w-5 border border-atlas-border bg-[#7d7363]" />
          <span className="absolute top-[35px] left-[81px] h-2 w-5 border border-atlas-border bg-atlas-paper" />
        </>
      ) : null}
      {topic === "Delivery" ? (
        <div className="absolute inset-0 flex flex-col justify-center gap-1.5 px-2.5">
          <span className="block h-[5px] w-[40%] bg-atlas-border" />
          <span className="block h-[5px] w-[52%] bg-atlas-border" />
          <span className="block h-[5px] w-[62%] bg-atlas-border" />
          <span className="block h-[5px] w-[74%] bg-atlas-sage" />
        </div>
      ) : null}
    </div>
  );
}

type ArticlesListRowProps = {
  article: ArticleSummary;
};

export function ArticlesListRow({ article }: ArticlesListRowProps) {
  return (
    <li className="border-t border-atlas-border">
      <Link
        href={article.href}
        className={interactiveRowClasses({
          className:
            "flex items-start gap-4 py-5 tablet:gap-6 desktop:gap-8",
        })}
      >
        <EvidenceThumb topic={article.topic} />
        <div className="min-w-0 flex-1 space-y-1.5">
          <p
            className={`m-0 font-display text-lg leading-6 font-semibold text-atlas-ink tablet:text-[1.375rem] tablet:leading-[31px] desktop:text-[1.4375rem] ${interactiveRowTitleClassName}`}
          >
            {article.title}
          </p>
          <p className="m-0 font-sans text-[13px] leading-5 text-atlas-body tablet:text-sm tablet:leading-[19px]">
            {article.excerptCompact ?? article.excerpt}
          </p>
          <p className="m-0 flex flex-wrap items-center gap-x-2 font-sans text-xs leading-4 text-atlas-sage break-words whitespace-normal tablet:whitespace-pre">
            <span>{archiveMetaLine(article)}</span>
            <span
              aria-hidden="true"
              className={`text-atlas-umber ${interactiveRowArrowClassName}`}
            >
              →
            </span>
          </p>
        </div>
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
      <div className="atlas-pad-x pt-8 pb-6 tablet:pt-9 tablet:pb-6 desktop:pt-10 desktop:pb-6">
        <div className="mb-4 space-y-2">
          <ChapterMarker>{data.chapter}</ChapterMarker>
          <h2
            id="articles-list-title"
            className="m-0 font-display text-[1.375rem] leading-7 font-semibold text-atlas-ink tablet:text-2xl tablet:leading-7 desktop:text-[1.75rem] desktop:leading-[38px]"
          >
            {data.headline}
          </h2>
        </div>

        <ul className="m-0 list-none p-0">
          {data.articles.map((article) => (
            <ArticlesListRow key={article.id} article={article} />
          ))}
        </ul>
      </div>
    </section>
  );
}
