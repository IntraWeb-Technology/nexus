import type { Metadata } from "next";
import { ArticlesCue } from "@/components/sections/articles-cue";
import { ArticlesFeatured } from "@/components/sections/articles-featured";
import { ArticlesIntro } from "@/components/sections/articles-intro";
import { ArticlesList } from "@/components/sections/articles-list";
import { ArticlesTopicRow } from "@/components/sections/articles-topic-row";
import { articlesIndexFixture } from "@/content/articles";

export const metadata: Metadata = {
  title: articlesIndexFixture.seo.title,
  description: articlesIndexFixture.seo.description,
};

export default function ArticlesPage() {
  const data = articlesIndexFixture;

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <ArticlesIntro data={data.intro} />
      <ArticlesTopicRow data={data.topics} />
      <ArticlesFeatured data={data.featured} />
      <ArticlesList data={data.list} />
      <ArticlesCue data={data.cue} />
    </main>
  );
}
