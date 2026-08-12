import type { Metadata } from "next";
import { DocsIntro } from "@/components/sections/docs-intro";
import { DocsLandingClient } from "@/components/sections/docs-landing-client";
import { docsIndexFixture } from "@/content/docs";

export const metadata: Metadata = {
  title: docsIndexFixture.seo.title,
  description: docsIndexFixture.seo.description,
};

export default function DocsPage() {
  const data = docsIndexFixture;

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <DocsIntro data={data.intro} />
      <DocsLandingClient data={data} />
    </main>
  );
}
