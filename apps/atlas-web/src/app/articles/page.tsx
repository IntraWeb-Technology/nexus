import type { Metadata } from "next";
import { ArticlesCue } from "@/components/sections/articles-cue";
import { ArticlesFeatured } from "@/components/sections/articles-featured";
import { ArticlesIntro } from "@/components/sections/articles-intro";
import { ArticlesList } from "@/components/sections/articles-list";
import { ArticlesPaginationNav } from "@/components/sections/articles-pagination";
import { ArticlesTopicRow } from "@/components/sections/articles-topic-row";
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
      <ArticlesTopicRow data={data.topics} />
      <ArticlesFeatured data={data.featured} />
      <ArticlesList data={data.list} />
      <ArticlesPaginationNav data={data.pagination} />
      <ArticlesCue data={data.cue} />
    </main>
  );
}
