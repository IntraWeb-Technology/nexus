import Link from "next/link";
import type { ArticleDetail } from "@/content/article";

type ArticlePrevNextProps = {
  data: ArticleDetail["prevNext"];
};

export function ArticlePrevNext({ data }: ArticlePrevNextProps) {
  const { previous, next } = data;
  if (!previous && !next) return null;

  return (
    <nav
      aria-label="Adjacent articles"
      className="mx-auto max-w-[var(--atlas-page)]"
    >
      <div className="atlas-pad-x flex flex-col gap-8 pt-6 pb-10 tablet:gap-8 tablet:pt-4 tablet:pb-8 desktop:flex-row desktop:items-start desktop:justify-between desktop:gap-6 desktop:pt-6 desktop:pb-10">
        {previous ? (
          <Link
            href={previous.href}
            className="min-w-0 flex-1 space-y-2 no-underline desktop:space-y-2"
          >
            <p className="m-0 font-sans text-[10px] font-medium tracking-[0.16em] text-atlas-body uppercase">
              Previous
            </p>
            <p className="m-0 font-display text-lg leading-6 font-semibold text-atlas-ink">
              ← {previous.title}
            </p>
            <p className="m-0 font-mono text-[11px] text-atlas-body whitespace-pre">
              {previous.topic}
              {"  ·  "}
              {previous.readingTime}
            </p>
          </Link>
        ) : (
          <div className="hidden flex-1 desktop:block" />
        )}

        {next ? (
          <Link
            href={next.href}
            className="min-w-0 flex-1 space-y-2 no-underline desktop:space-y-2 desktop:text-right"
          >
            <p className="m-0 font-sans text-[10px] font-medium tracking-[0.16em] text-atlas-body uppercase">
              Next
            </p>
            <p className="m-0 font-display text-lg leading-6 font-semibold text-atlas-ink">
              {next.title} →
            </p>
            <p className="m-0 font-mono text-[11px] text-atlas-body whitespace-pre">
              {next.topic}
              {"  ·  "}
              {next.readingTime}
            </p>
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
