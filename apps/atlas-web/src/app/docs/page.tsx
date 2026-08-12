import type { Metadata } from "next";
import { DocsIntro } from "@/components/sections/docs-intro";
import { DocsLandingClient } from "@/components/sections/docs-landing-client";
import { getDocsIndexContent } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getDocsIndexContent();
  return {
    title: data.seo.title,
    description: data.seo.description,
  };
}

export default async function DocsPage() {
  const data = await getDocsIndexContent();

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <DocsIntro data={data.intro} />
      <DocsLandingClient data={data} />
    </main>
  );
}
