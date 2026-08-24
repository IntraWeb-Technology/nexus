import Image from "next/image";
import Link from "next/link";
import { AuthorIdentity } from "@/components/editorial/author-identity";
import { ChapterMarker } from "@/components/editorial/chapter-marker";
import { interactiveRowTitleClassName } from "@/components/editorial/interactive-row";
import type { ArticlesIndexFixture } from "@/content/article";
import { featuredMetaLine } from "@/content/articles/summaries";

type ArticlesFeaturedProps = {
  data: ArticlesIndexFixture["featured"];
};

/**
 * Image-led featured article — full band background through author + metadata.
 * Whole block is the article link (no standalone Read CTA).
 */
export function ArticlesFeatured({ data }: ArticlesFeaturedProps) {
  const { article, chapter, author, image } = data;

  return (
    <section
      aria-labelledby="articles-featured-title"
      className="bg-atlas-secondary"
    >
      <div className="mx-auto max-w-[var(--atlas-page)]">
        <Link
          href={article.href}
          className="atlas-pad-x group block py-8 no-underline tablet:py-9 desktop:grid desktop:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] desktop:items-start desktop:gap-12 desktop:py-10"
        >
          <div className="relative mb-6 aspect-[710/420] w-full overflow-hidden rounded-[4px] desktop:mb-0">
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width ?? 1420}
              height={image.height ?? 840}
              className="size-full object-cover transition-[filter,opacity] duration-[var(--atlas-motion-base)] ease-[var(--atlas-motion-ease-out)] group-hover:brightness-[1.03] group-focus-visible:brightness-[1.03]"
              sizes="(min-width: 1440px) 710px, (min-width: 768px) 90vw, 100vw"
              priority
            />
          </div>

          <div className="flex min-w-0 flex-col gap-4 desktop:pt-5">
            <ChapterMarker>{chapter}</ChapterMarker>
            <h2
              id="articles-featured-title"
              className={`m-0 max-w-[30rem] font-display text-[1.75rem] leading-9 font-semibold text-atlas-ink transition-colors duration-[var(--atlas-motion-base)] ease-[var(--atlas-motion-ease-standard)] group-hover:text-atlas-umber group-focus-visible:text-atlas-umber tablet:text-[2rem] tablet:leading-10 desktop:text-[2rem] desktop:leading-[43px] ${interactiveRowTitleClassName}`}
            >
              {article.title}
            </h2>
            <p className="m-0 max-w-[30rem] font-sans text-base leading-[22px] text-atlas-body">
              {article.excerpt}
            </p>

            <div className="mt-2 flex flex-col gap-4 tablet:flex-row tablet:items-center tablet:justify-between tablet:gap-6">
              <AuthorIdentity author={author} size={36} />
              <p className="m-0 font-sans text-[13px] leading-[18px] text-atlas-sage whitespace-pre">
                {featuredMetaLine(article)}
              </p>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
