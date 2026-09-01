import type { Metadata } from "next";
import { ArticlesFeatured } from "@/components/sections/articles-featured";
import { ArticlesIntro } from "@/components/sections/articles-intro";
import { ArticlesList } from "@/components/sections/articles-list";
import { ArticlesPaginationNav } from "@/components/sections/articles-pagination";
import { getArticlesIndexContent } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getArticlesIndexContent();
  return {
    title: data.seo.title,
    description: data.seo.description,
  };
}

export default async function ArticlesPage() {
  const data = await getArticlesIndexContent();

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <ArticlesIntro data={data.intro} />
      <ArticlesFeatured data={data.featured} />
      <ArticlesList data={data.list} />
      {data.pagination ? (
        <ArticlesPaginationNav data={data.pagination} />
      ) : null}
    </main>
  );
}
