import Link from "next/link";
import { ChapterMarker } from "@/components/editorial/chapter-marker";
import {
  interactiveRowArrowClassName,
  interactiveRowClasses,
  interactiveRowTitleClassName,
} from "@/components/editorial/interactive-row";
import type { ArticleDetail } from "@/content/article";

type ArticleRelatedProps = {
  data: ArticleDetail["related"];
};

export function ArticleRelated({ data }: ArticleRelatedProps) {
  return (
    <section
      aria-labelledby="article-related-title"
      className="mx-auto max-w-[var(--atlas-page)] border-t border-atlas-border"
    >
      <div className="atlas-pad-x pt-8 pb-10 tablet:pt-7 tablet:pb-9 desktop:pt-8 desktop:pb-10">
        <ChapterMarker className="mb-4">{data.chapter}</ChapterMarker>
        <h2
          id="article-related-title"
          className="m-0 mb-4 font-display text-[1.375rem] leading-7 font-semibold text-atlas-ink tablet:text-[1.375rem] tablet:leading-7 desktop:mb-4 desktop:text-2xl desktop:leading-[30px]"
        >
          {data.title}
        </h2>

        <ul className="m-0 list-none p-0">
          {data.items.map((item) => (
            <li key={item.slug} className="border-t border-atlas-border">
              <Link
                href={item.href}
                className={interactiveRowClasses({
                  className:
                    "hidden items-center justify-between gap-6 py-4 desktop:flex",
                })}
              >
                <div className="min-w-0 space-y-1">
                  <p
                    className={`m-0 font-display text-lg leading-6 font-semibold text-atlas-ink ${interactiveRowTitleClassName}`}
                  >
                    {item.title}
                  </p>
                  <p className="m-0 font-mono text-[11px] text-atlas-sage whitespace-pre">
                    {item.topic}
                    {"  ·  "}
                    {item.readingTime}
                  </p>
                </div>
                <span
                  className={`shrink-0 font-sans text-[13px] font-medium text-atlas-umber ${interactiveRowArrowClassName}`}
                >
                  Read →
                </span>
              </Link>

              <Link
                href={item.href}
                className={interactiveRowClasses({
                  className: "block space-y-1.5 py-3.5 desktop:hidden",
                })}
              >
                <p
                  className={`m-0 font-display text-base leading-[22px] font-semibold text-atlas-ink tablet:text-lg tablet:leading-[22px] ${interactiveRowTitleClassName}`}
                >
                  {item.title}
                </p>
                <p className="m-0 font-mono text-[11px] text-atlas-sage">
                  {item.topic} · {item.readingTime} ·{" "}
                  <span className={interactiveRowArrowClassName}>Read →</span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
