import path from "node:path";
import { pathToFileURL } from "node:url";
import { paths } from "./config";

async function importFromContent<T>(relativePath: string): Promise<T> {
  const filePath = path.join(paths.atlasContentRoot, relativePath);
  return (await import(pathToFileURL(filePath).href)) as T;
}

export async function loadAtlasFixtures() {
  const [workMod, homeMod, aboutMod, contactMod, caseMod, articleMod, docMod] = await Promise.all([
    importFromContent<{ workFixture: unknown }>("work.ts"),
    importFromContent<{ homepageFixture: unknown }>("homepage.ts"),
    importFromContent<{ aboutFixture: unknown }>("about.ts"),
    importFromContent<{ contactFixture: unknown }>("contact.ts"),
    importFromContent<{ caseStudyBySlug: Record<string, unknown> }>("case-studies/index.ts"),
    importFromContent<{
      articleBySlug: Record<string, unknown>;
      articleSummaries: Array<{ slug: string }>;
    }>("articles/index.ts"),
    importFromContent<{
      docBySlug: Record<string, unknown>;
      docSummaries: Array<{ slug: string }>;
    }>("docs/index.ts"),
  ]);

  return {
    workFixture: workMod.workFixture,
    homepageFixture: homeMod.homepageFixture,
    aboutFixture: aboutMod.aboutFixture,
    contactFixture: contactMod.contactFixture,
    caseStudyBySlug: caseMod.caseStudyBySlug,
    articleBySlug: articleMod.articleBySlug,
    docBySlug: docMod.docBySlug,
    articleSummaries: articleMod.articleSummaries,
    docSummaries: docMod.docSummaries,
  };
}

export type AtlasFixtures = Awaited<ReturnType<typeof loadAtlasFixtures>>;
