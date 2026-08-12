import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReadingProgress } from "@/components/chrome/reading-progress";
import { CaseStudyToc } from "@/components/editorial/case-study-toc";
import { DocBody } from "@/components/sections/doc-body";
import { DocContact } from "@/components/sections/doc-contact";
import { DocHeader } from "@/components/sections/doc-header";
import { DocPrevNext } from "@/components/sections/doc-prev-next";
import { DocRelated } from "@/components/sections/doc-related";
import { getDocContent, getDocSlugs } from "@/lib/content";
import { slugFromParams } from "@/content/docs";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

export async function generateStaticParams() {
  const slugs = await getDocSlugs();
  return slugs.map((slug) => ({
    slug: slug.split("/"),
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const key = slugFromParams(slug);
  if (!key) return {};
  const doc = await getDocContent(key);
  if (!doc) return {};
  return {
    title: doc.seo.title,
    description: doc.seo.description,
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const key = slugFromParams(slug);
  if (!key) notFound();
  const data = await getDocContent(key);
  if (!data) notFound();

  return (
    <>
      <ReadingProgress />
      <main id="main" tabIndex={-1} className="outline-none">
        <article>
          <DocHeader data={data.header} />
          <CaseStudyToc items={data.toc} ariaLabel="Documentation contents" />
          <DocBody sections={data.sections} />
          <DocRelated data={data.related} />
          <DocPrevNext data={data.prevNext} />
          <DocContact data={data.contact} />
        </article>
      </main>
    </>
  );
}
