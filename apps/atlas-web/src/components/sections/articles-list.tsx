import Link from "next/link";
import type { ArticleSummary, ArticlesIndexFixture } from "@/content/article";

type CoverTone = "rust" | "gold" | "clay" | "moss" | "ink-blue";

const TOPIC_COVER: Record<string, CoverTone> = {
  Architecture: "rust",
  Testing: "gold",
  Platform: "clay",
  Tooling: "moss",
  Delivery: "ink-blue",
};

const COVER_CLASS: Record<CoverTone, string> = {
  rust: "bg-atlas-rust",
  gold: "bg-atlas-gold",
  clay: "bg-atlas-clay",
  moss: "bg-atlas-moss",
  "ink-blue": "bg-atlas-ink-blue",
};

type ArticlesListRowProps = {
  article: ArticleSummary;
  className?: string;
};

export function ArticlesListRow({ article, className }: ArticlesListRowProps) {
  const tone = TOPIC_COVER[article.topic] ?? "clay";

  return (
    <li className={className}>
      <Link href={article.href} className="group flex flex-col gap-3 no-underline">
        <div
          className={`min-h-[140px] rounded-[2px] ${COVER_CLASS[tone]} transition-[filter] duration-[var(--atlas-motion-base)] group-hover:brightness-[1.05] group-focus-visible:brightness-[1.05] desktop:min-h-[180px]`}
          aria-hidden="true"
        />
        <p className="m-0 font-sans text-[11px] font-medium tracking-[0.08em] text-atlas-label uppercase">
          {article.topic}
          {article.type ? ` · ${article.type}` : ""}
        </p>
        <h3 className="m-0 font-display text-lg leading-snug font-semibold text-atlas-ink transition-colors duration-[var(--atlas-motion-fast)] group-hover:text-atlas-rust-ink group-focus-visible:text-atlas-rust-ink">
          {article.title}
        </h3>
      </Link>
    </li>
  );
}

type ArticlesListProps = {
  data: ArticlesIndexFixture["list"];
};

/** Page 28 tablet/mobile omit the fifth Turborepo card (632:5, 632:10). */
const COMPACT_OMITTED_SLUG = "turborepo-build-optimization";

/**
 * Story-First articles list — cover cards with topic eyebrows.
 */
export function ArticlesList({ data }: ArticlesListProps) {
  return (
    <section
      aria-labelledby="articles-list-title"
      className="mx-auto max-w-[var(--atlas-page)]"
    >
      <div className="atlas-pad-x pt-10 pb-14 tablet:pt-12 tablet:pb-16 desktop:pt-14 desktop:pb-20">
        <h2
          id="articles-list-title"
          className="m-0 mb-8 font-display text-[1.375rem] leading-7 font-semibold text-atlas-ink tablet:mb-10 tablet:text-2xl desktop:text-[1.625rem]"
        >
          {data.headline === "Newest first." ? "More writing" : data.headline}
        </h2>

        <ul className="m-0 grid list-none grid-cols-1 gap-8 p-0 tablet:grid-cols-2 desktop:grid-cols-3 desktop:gap-8">
          {data.articles.map((article) => (
            <ArticlesListRow
              key={article.id}
              article={article}
              className={
                article.slug === COMPACT_OMITTED_SLUG
                  ? "hidden desktop:block"
                  : undefined
              }
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
