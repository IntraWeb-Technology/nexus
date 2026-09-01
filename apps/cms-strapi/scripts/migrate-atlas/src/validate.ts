import fs from "node:fs";
import path from "node:path";
import { paths } from "./config";
import { loadAtlasFixtures, type AtlasFixtures } from "./loadFixtures";

export type ExpectedIdentity = {
  projectSlugs: string[];
  workFeaturedSlug: string;
  workGallerySlugs: string[];
  homeSelectedIds: string[];
  caseStudySlugs: string[];
  writingArticleSlugs: string[];
  documentationSlugs: string[];
  projectsWithoutMedia: string[];
};

type WorkProjectRef = {
  id?: string;
  slug: string;
  href?: string;
  mediaSrc?: string;
  mediaLabel?: string;
  mediaWidth?: number;
};

type HomeSelectedRef = {
  id: string;
  href?: string;
  mediaSrc?: string;
  mediaAlt?: string;
  mediaWidth?: number;
};

type WorkFixtureShape = {
  featured: { cta: { href: string } };
  selected: { projects: WorkProjectRef[] };
  gallery?: { projects: WorkProjectRef[] };
};

type HomepageFixtureShape = {
  selected: { projects: HomeSelectedRef[] };
};

export type FixtureContractInput = {
  workFixture: unknown;
  homepageFixture: unknown;
  caseStudyBySlug: Record<string, unknown>;
  articleSummaries: Array<{ slug: string }>;
  docSummaries: Array<{ slug: string }>;
};

function loadExpectedIdentity(): ExpectedIdentity {
  const filePath = path.join(paths.expectedDir, "identity.json");
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as ExpectedIdentity;
}

function slugFromWorkHref(href: string | undefined): string {
  if (!href) return "";
  const match = href.match(/^\/work\/([^/?#]+)$/);
  return match?.[1] ?? "";
}

function projectHasMedia(project: {
  mediaSrc?: string;
  mediaLabel?: string;
  mediaWidth?: number;
}): boolean {
  return Boolean(project.mediaSrc || project.mediaLabel || project.mediaWidth);
}

function homeProjectHasMedia(project: {
  mediaSrc?: string;
  mediaAlt?: string;
  mediaWidth?: number;
}): boolean {
  return Boolean(project.mediaSrc || project.mediaAlt || project.mediaWidth);
}

function requireNonEmptyStringArray(
  errors: string[],
  label: string,
  value: unknown,
): string[] {
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== "string")) {
    errors.push(`identity.json ${label} must be a non-empty string array`);
    return [];
  }
  const seen = new Set<string>();
  for (const item of value) {
    if (seen.has(item)) {
      errors.push(`identity.json ${label} has duplicate identity: ${item}`);
    }
    seen.add(item);
  }
  return value;
}

function assertExactOrderedList(
  errors: string[],
  label: string,
  expected: string[],
  actual: string[],
): void {
  if (expected.length === 0) return;
  if (actual.length === 0) {
    errors.push(`${label} is empty; expected: ${expected.join(", ")}`);
    return;
  }
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    errors.push(
      `${label} mismatch.\n  expected: ${expected.join(", ")}\n  actual:   ${actual.join(", ")}`,
    );
  }
}

export type ValidationResult = {
  ok: boolean;
  errors: string[];
};

export function validateAtlasFixtureContract(
  expected: ExpectedIdentity,
  fixtures: FixtureContractInput,
): ValidationResult {
  const errors: string[] = [];

  const projectSlugs = requireNonEmptyStringArray(errors, "projectSlugs", expected.projectSlugs);
  const workGallerySlugs = requireNonEmptyStringArray(
    errors,
    "workGallerySlugs",
    expected.workGallerySlugs,
  );
  const homeSelectedIds = requireNonEmptyStringArray(
    errors,
    "homeSelectedIds",
    expected.homeSelectedIds,
  );
  const caseStudySlugs = requireNonEmptyStringArray(
    errors,
    "caseStudySlugs",
    expected.caseStudySlugs,
  );
  const writingArticleSlugs = requireNonEmptyStringArray(
    errors,
    "writingArticleSlugs",
    expected.writingArticleSlugs,
  );
  const documentationSlugs = requireNonEmptyStringArray(
    errors,
    "documentationSlugs",
    expected.documentationSlugs,
  );
  const projectsWithoutMedia = Array.isArray(expected.projectsWithoutMedia)
    ? expected.projectsWithoutMedia
    : [];

  const workFeaturedSlug =
    typeof expected.workFeaturedSlug === "string" ? expected.workFeaturedSlug : "";
  if (!workFeaturedSlug) {
    errors.push("identity.json workFeaturedSlug is missing");
  } else if (caseStudySlugs.length > 0 && !caseStudySlugs.includes(workFeaturedSlug)) {
    errors.push(`workFeaturedSlug "${workFeaturedSlug}" is not in caseStudySlugs`);
  }

  for (const slug of projectsWithoutMedia) {
    if (projectSlugs.length > 0 && !projectSlugs.includes(slug)) {
      errors.push(`projectsWithoutMedia identity "${slug}" is not in projectSlugs catalog`);
    }
  }

  const work = fixtures.workFixture as WorkFixtureShape;
  const homepage = fixtures.homepageFixture as HomepageFixtureShape;
  const galleryProjects = work.gallery?.projects ?? [];
  const selectedProjects = work.selected?.projects ?? [];
  const homeSelected = homepage.selected?.projects ?? [];

  const featuredSlug = slugFromWorkHref(work.featured?.cta?.href);
  if (!featuredSlug) {
    errors.push("Work featured CTA is missing an implemented /work/[slug] destination");
  } else if (workFeaturedSlug && featuredSlug !== workFeaturedSlug) {
    errors.push(
      `Work featured CTA slug mismatch. expected: ${workFeaturedSlug}, actual: ${featuredSlug}`,
    );
  }

  const gallerySlugs = galleryProjects.map((project) => project.slug);
  assertExactOrderedList(errors, "Work gallery slugs", workGallerySlugs, gallerySlugs);

  for (const project of galleryProjects) {
    if (project.id && project.id !== project.slug) {
      errors.push(`Work gallery identity mismatch: id "${project.id}" vs slug "${project.slug}"`);
    }
    const dest = slugFromWorkHref(project.href);
    if (project.href && project.href.startsWith("/work/") && dest && !caseStudySlugs.includes(dest)) {
      errors.push(
        `Work gallery "${project.slug}" href /work/${dest} is not an implemented case study`,
      );
    }
  }

  const actualHomeSelectedIds = homeSelected.map((project) => project.id);
  assertExactOrderedList(errors, "Home selected ids", homeSelectedIds, actualHomeSelectedIds);

  for (const project of homeSelected) {
    const dest = slugFromWorkHref(project.href);
    if (project.href && project.href.startsWith("/work/") && dest && !caseStudySlugs.includes(dest)) {
      errors.push(
        `Home selected "${project.id}" href /work/${dest} is not an implemented case study`,
      );
    }
  }

  for (const project of selectedProjects) {
    if (projectSlugs.length > 0 && !projectSlugs.includes(project.slug)) {
      errors.push(`Unexpected project slug in Work selected list: ${project.slug}`);
    }
  }

  for (const slug of projectsWithoutMedia) {
    const selected = selectedProjects.find((project) => project.slug === slug);
    if (selected && projectHasMedia(selected)) {
      errors.push(`A-05 violation: ${slug} must have no media in Work selected list`);
    }
    const gallery = galleryProjects.find((project) => project.slug === slug);
    if (gallery && projectHasMedia(gallery)) {
      errors.push(`A-05 violation: ${slug} must have no media in Work gallery`);
    }
    const home = homeSelected.find((project) => project.id === slug);
    if (home && homeProjectHasMedia(home)) {
      errors.push(`A-05 violation: ${slug} must have no media on Home selected`);
    }
  }

  const caseSlugs = Object.keys(fixtures.caseStudyBySlug);
  for (const slug of caseStudySlugs) {
    if (!caseSlugs.includes(slug)) {
      errors.push(`Missing expected case study slug: ${slug}`);
    }
  }
  if (!caseSlugs.includes("portfolio-os")) {
    errors.push("Expected case study slug portfolio-os");
  }

  const articleSlugs = fixtures.articleSummaries.map((article) => article.slug).sort();
  const expectedArticles = [...writingArticleSlugs].sort();
  if (articleSlugs.length !== 6) {
    errors.push(`Expected 6 writing article slugs, found ${articleSlugs.length}`);
  }
  if (expectedArticles.length > 0 && JSON.stringify(articleSlugs) !== JSON.stringify(expectedArticles)) {
    errors.push(
      `Writing article slug mismatch.\n  expected: ${expectedArticles.join(", ")}\n  actual:   ${articleSlugs.join(", ")}`,
    );
  }

  const docSlugs = fixtures.docSummaries.map((doc) => doc.slug).sort();
  const expectedDocs = [...documentationSlugs].sort();
  if (docSlugs.length !== 5) {
    errors.push(`Expected 5 documentation slugs, found ${docSlugs.length}`);
  }
  if (expectedDocs.length > 0 && JSON.stringify(docSlugs) !== JSON.stringify(expectedDocs)) {
    errors.push(
      `Documentation slug mismatch.\n  expected: ${expectedDocs.join(", ")}\n  actual:   ${docSlugs.join(", ")}`,
    );
  }

  return { ok: errors.length === 0, errors };
}

export async function validateAtlasFixtures(): Promise<ValidationResult> {
  const expected = loadExpectedIdentity();
  const fixtures = await loadAtlasFixtures();
  return validateAtlasFixtureContract(expected, fixtures as AtlasFixtures);
}

export function printValidationResult(result: ValidationResult, label = "Atlas fixture validation"): number {
  if (result.ok) {
    console.log(`✓ ${label} passed`);
    return 0;
  }
  console.error(`✗ ${label} failed (${result.errors.length} issue(s)):`);
  for (const error of result.errors) {
    console.error(`  - ${error}`);
  }
  return 1;
}
