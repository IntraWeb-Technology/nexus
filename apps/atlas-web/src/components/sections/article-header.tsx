import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { ArticleDetail } from "@/content/article";

type ArticleHeaderProps = {
  data: ArticleDetail["header"];
};

export function ArticleHeader({ data }: ArticleHeaderProps) {
  return (
    <header className="mx-auto max-w-[var(--atlas-page)]">
      <div className="atlas-pad-x space-y-5 pt-10 pb-8 tablet:space-y-5 tablet:pt-11 tablet:pb-7 desktop:space-y-5 desktop:pt-14 desktop:pb-8">
        <ChapterMarker>{data.chapter}</ChapterMarker>
        <h1 className="m-0 max-w-[52rem] font-display text-[1.75rem] leading-[42px] font-semibold text-atlas-ink tablet:text-[2rem] tablet:leading-[42px] desktop:text-[2.75rem] desktop:leading-[54px]">
          {data.title}
        </h1>
        <p className="m-0 hidden max-w-[45rem] font-sans text-lg leading-7 text-atlas-body desktop:block">
          {data.dek}
        </p>
        <p className="m-0 max-w-[45rem] font-sans text-base leading-7 text-atlas-body desktop:hidden">
          {data.dekCompact ?? data.dek}
        </p>

        <dl className="m-0 flex flex-wrap gap-x-10 gap-y-4 p-0 tablet:gap-x-9">
          {data.meta.map((item) => (
            <div key={item.label} className="flex flex-col gap-1.5">
              <dt className="m-0 font-sans text-[10px] font-medium tracking-[0.16em] text-atlas-umber uppercase">
                {item.label}
              </dt>
              <dd className="m-0 font-mono text-xs text-atlas-ink">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}
