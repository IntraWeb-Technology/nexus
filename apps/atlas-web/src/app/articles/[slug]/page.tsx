import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReadingProgress } from "@/components/chrome/reading-progress";
import { CaseStudyToc } from "@/components/editorial/case-study-toc";
import { ArticleBody } from "@/components/sections/article-body";
import { ArticleContact } from "@/components/sections/article-contact";
import { ArticleHeader } from "@/components/sections/article-header";
import { ArticlePrevNext } from "@/components/sections/article-prev-next";
import { ArticleRelated } from "@/components/sections/article-related";
import { articleBySlug, getArticle } from "@/content/articles";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return Object.keys(articleBySlug).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.seo.title,
    description: article.seo.description,
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const data = getArticle(slug);
  if (!data) notFound();

  return (
    <>
      <ReadingProgress />
      <main id="main" tabIndex={-1} className="outline-none">
        <article>
          <ArticleHeader data={data.header} />
          <CaseStudyToc items={data.toc} ariaLabel="Article contents" />
          <ArticleBody sections={data.sections} />
          <ArticleRelated data={data.related} />
          <ArticlePrevNext data={data.prevNext} />
          <ArticleContact data={data.contact} />
        </article>
      </main>
    </>
  );
}
