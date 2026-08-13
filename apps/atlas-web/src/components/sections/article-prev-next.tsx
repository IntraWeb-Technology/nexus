import Link from "next/link";
import type { ArticleDetail, ArticleNavLink } from "@/content/article";

type ArticlePrevNextProps = {
  data: ArticleDetail["prevNext"];
};

function AdjacentCard({
  direction,
  article,
  align,
}: {
  direction: "Previous" | "Next";
  article: ArticleNavLink;
  align: "start" | "end";
}) {
  const title =
    direction === "Previous" ? `← ${article.title}` : `${article.title} →`;

  return (
    <Link
      href={article.href}
      className={`flex min-w-0 flex-1 flex-col gap-1.5 rounded-[4px] border border-atlas-border px-4 py-3.5 no-underline tablet:rounded-none tablet:border-0 tablet:px-0 tablet:py-0 ${
        align === "end" ? "tablet:items-end tablet:text-right" : ""
      }`}
    >
      <p className="m-0 font-sans text-[10px] font-medium tracking-[0.16em] text-atlas-sage uppercase">
        {direction}
      </p>
      <p className="m-0 font-display text-base leading-[22px] font-semibold text-atlas-ink tablet:text-lg tablet:leading-6">
        {title}
      </p>
      <p className="m-0 font-mono text-[11px] text-atlas-sage whitespace-pre">
        {article.topic}
        {"  ·  "}
        {article.readingTime}
      </p>
    </Link>
  );
}

export function ArticlePrevNext({ data }: ArticlePrevNextProps) {
  const { previous, next } = data;
  if (!previous && !next) return null;

  return (
    <nav
      aria-label="Adjacent articles"
      className="mx-auto max-w-[var(--atlas-page)]"
    >
      <div className="atlas-pad-x flex flex-col gap-3 pt-6 pb-10 tablet:flex-row tablet:items-start tablet:justify-between tablet:gap-6 tablet:pt-4 tablet:pb-8 desktop:pt-6 desktop:pb-10">
        {previous ? (
          <AdjacentCard
            direction="Previous"
            article={previous}
            align="start"
          />
        ) : (
          <div className="hidden flex-1 tablet:block" />
        )}

        {next ? (
          <AdjacentCard direction="Next" article={next} align="end" />
        ) : null}
      </div>
    </nav>
  );
}
