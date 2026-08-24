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
 * Story-First featured article — split cover + copy.
 */
export function ArticlesFeatured({ data }: ArticlesFeaturedProps) {
  const { article, chapter, author, image } = data;

  return (
    <section
      aria-labelledby="articles-featured-title"
      className="border-y border-atlas-border bg-atlas-elevated"
    >
      <div className="mx-auto max-w-[var(--atlas-page)]">
        <Link
          href={article.href}
          className="group grid no-underline desktop:grid-cols-[minmax(0,760px)_minmax(0,1fr)]"
        >
          <div className="relative aspect-[760/460] w-full overflow-hidden bg-atlas-secondary">
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width ?? 1420}
              height={image.height ?? 840}
              className="size-full object-cover transition-[filter,opacity] duration-[var(--atlas-motion-base)] ease-[var(--atlas-motion-ease-out)] group-hover:brightness-[1.03] group-focus-visible:brightness-[1.03]"
              sizes="(min-width: 1440px) 760px, 100vw"
              priority
            />
          </div>

          <div className="atlas-pad-x flex min-w-0 flex-col justify-center gap-4 py-8 desktop:px-14 desktop:py-10">
            <ChapterMarker className="!text-atlas-label">
              {chapter}
              {article.topic ? ` · ${article.topic.toUpperCase()}` : ""}
            </ChapterMarker>
            <h2
              id="articles-featured-title"
              className={`m-0 max-w-[30rem] font-display text-[1.75rem] leading-9 font-semibold text-atlas-ink transition-colors duration-[var(--atlas-motion-base)] ease-[var(--atlas-motion-ease-standard)] group-hover:text-atlas-rust-ink group-focus-visible:text-atlas-rust-ink tablet:text-[2rem] tablet:leading-10 desktop:text-[2rem] desktop:leading-[43px] ${interactiveRowTitleClassName}`}
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
            <p className="m-0 font-sans text-[15px] font-medium text-atlas-rust-ink">
              Read the essay →
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}
