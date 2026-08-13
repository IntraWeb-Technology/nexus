import Image from "next/image";
import { AuthorIdentity } from "@/components/editorial/author-identity";
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

        <div className="flex flex-col gap-3.5 tablet:flex-row tablet:items-start tablet:gap-8">
          <AuthorIdentity author={data.author} size={34} />

          {/* Compact horizontal row on mobile; labeled columns from tablet up */}
          <dl className="m-0 flex flex-wrap gap-x-6 gap-y-2 p-0 tablet:gap-x-10 tablet:gap-y-4">
            {data.meta.map((item) => (
              <div
                key={item.label}
                className="flex flex-col gap-1 tablet:gap-1.5"
              >
                <dt className="m-0 font-sans text-[10px] font-medium tracking-[0.16em] text-atlas-sage uppercase">
                  {item.label}
                </dt>
                <dd className="m-0 font-mono text-xs text-atlas-sage">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {data.featuredImage ? (
        <div className="atlas-pad-x pb-8 desktop:pb-10">
          <figure className="m-0">
            <div className="relative aspect-[16/9] w-full overflow-hidden border border-atlas-border">
              <Image
                src={data.featuredImage.src}
                alt={data.featuredImage.alt}
                width={data.featuredImage.width ?? 1312}
                height={data.featuredImage.height ?? 738}
                className="size-full object-cover"
                sizes="(min-width: 1440px) 1312px, 100vw"
                priority
              />
            </div>
            {data.featuredImage.caption ? (
              <figcaption className="mt-3 font-mono text-[11px] text-atlas-sage">
                {data.featuredImage.caption}
              </figcaption>
            ) : null}
          </figure>
        </div>
      ) : null}
    </header>
  );
}
