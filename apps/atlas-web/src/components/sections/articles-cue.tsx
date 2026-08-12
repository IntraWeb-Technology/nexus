import Link from "next/link";
import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { ArticlesIndexFixture } from "@/content/article";

type ArticlesCueProps = {
  data: ArticlesIndexFixture["cue"];
};

/**
 * Quiet Contact / Work cue — not a newsletter or marketing signup.
 */
export function ArticlesCue({ data }: ArticlesCueProps) {
  return (
    <section
      aria-labelledby="articles-cue-title"
      className="mx-auto max-w-[var(--atlas-page)] border-t border-atlas-border"
    >
      <div className="atlas-pad-x space-y-3 pt-10 pb-14 tablet:space-y-3 tablet:pt-8 tablet:pb-12 desktop:space-y-3 desktop:pt-10 desktop:pb-14">
        <ChapterMarker>{data.chapter}</ChapterMarker>
        <h2
          id="articles-cue-title"
          className="m-0 font-display text-[1.375rem] leading-7 font-semibold text-atlas-ink tablet:text-[1.375rem] tablet:leading-[26px] desktop:text-[1.375rem] desktop:leading-7"
        >
          {data.title}
        </h2>
        <p className="m-0 hidden max-w-[40rem] font-sans text-sm leading-[22px] text-atlas-body desktop:block">
          {data.body}
        </p>
        <p className="m-0 max-w-[40rem] font-sans text-sm leading-[22px] text-atlas-body desktop:hidden">
          {data.bodyCompact}
        </p>
        <p className="m-0 flex gap-6 pt-1 font-sans text-[13px] font-medium">
          {data.links.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={`no-underline ${
                i === 0 ? "text-atlas-umber" : "text-atlas-body"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </p>
      </div>
    </section>
  );
}
