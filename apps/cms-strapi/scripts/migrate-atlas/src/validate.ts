import fs from "node:fs";
import path from "node:path";
import { paths } from "./config";
import { loadAtlasFixtures } from "./loadFixtures";

type ExpectedIdentity = {
  projectSlugs: string[];
  caseStudySlugs: string[];
  writingArticleSlugs: string[];
  documentationSlugs: string[];
  projectsWithoutMedia: string[];
};

function loadExpectedIdentity(): ExpectedIdentity {
  const filePath = path.join(paths.expectedDir, "identity.json");
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as ExpectedIdentity;
}

function slugFromHref(href: string): string {
  const match = href.match(/\/work\/([^/?#]+)/);
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

export type ValidationResult = {
  ok: boolean;
  errors: string[];
};

export async function validateAtlasFixtures(): Promise<ValidationResult> {
  const errors: string[] = [];
  const expected = loadExpectedIdentity();
  const fixtures = await loadAtlasFixtures();

  const featuredSlug = slugFromHref((fixtures.workFixture as { featured: { cta: { href: string } } }).featured.cta.href);
  const selectedWorkSlugs = (
    fixtures.workFixture as {
      selected: { projects: Array<{ slug: string; mediaSrc?: string; mediaLabel?: string; mediaWidth?: number }> };
    }
  ).selected.projects.map((p) => p.slug);
  const projectSlugs = featuredSlug ? [featuredSlug, ...selectedWorkSlugs] : selectedWorkSlugs;

  for (const slug of expected.projectSlugs) {
    if (!projectSlugs.includes(slug)) {
      errors.push(`Missing expected project slug: ${slug}`);
    }
  }
  for (const slug of projectSlugs) {
    if (!expected.projectSlugs.includes(slug)) {
      errors.push(`Unexpected project slug in Work fixture: ${slug}`);
    }
  }

  const vehicleMaintenance = (
    fixtures.workFixture as {
      selected: { projects: Array<{ slug: string; mediaSrc?: string; mediaLabel?: string; mediaWidth?: number }> };
    }
  ).selected.projects.find((p) => p.slug === "vehicle-maintenance");
  if (!vehicleMaintenance) {
    errors.push("vehicle-maintenance project missing from Work selected list");
  } else if (projectHasMedia(vehicleMaintenance)) {
    errors.push("A-05 violation: vehicle-maintenance must have no media in Work fixture");
  }

  const homeSelected = (
    fixtures.homepageFixture as {
      selected: { projects: Array<{ id: string; mediaSrc?: string; mediaAlt?: string; mediaWidth?: number }> };
    }
  ).selected.projects;
  const workSelectedIds = (
    fixtures.workFixture as { selected: { projects: Array<{ id: string }> } }
  ).selected.projects.map((p) => p.id);
  const homeSelectedIds = homeSelected.map((p) => p.id);

  if (homeSelectedIds.length !== workSelectedIds.length) {
    errors.push(
      `Home selected count (${homeSelectedIds.length}) does not match Work selected count (${workSelectedIds.length})`,
    );
  }
  for (const id of workSelectedIds) {
    if (!homeSelectedIds.includes(id)) {
      errors.push(`Home selected missing Work project id: ${id}`);
    }
  }
  for (const id of homeSelectedIds) {
    if (!workSelectedIds.includes(id)) {
      errors.push(`Home selected has unexpected project id not in Work selected: ${id}`);
    }
  }

  const homeVehicle = homeSelected.find((p) => p.id === "vehicle-maintenance");
  if (homeVehicle && homeProjectHasMedia(homeVehicle)) {
    errors.push("A-05 violation: vehicle-maintenance must have no media on Home selected");
  }

  const caseSlugs = Object.keys(fixtures.caseStudyBySlug);
  for (const slug of expected.caseStudySlugs) {
    if (!caseSlugs.includes(slug)) {
      errors.push(`Missing expected case study slug: ${slug}`);
    }
  }
  if (!caseSlugs.includes("portfolio-os")) {
    errors.push("Expected case study slug portfolio-os");
  }

  const articleSlugs = fixtures.articleSummaries.map((a) => a.slug).sort();
  const expectedArticles = [...expected.writingArticleSlugs].sort();
  if (articleSlugs.length !== 6) {
    errors.push(`Expected 6 writing article slugs, found ${articleSlugs.length}`);
  }
  if (JSON.stringify(articleSlugs) !== JSON.stringify(expectedArticles)) {
    errors.push(
      `Writing article slug mismatch.\n  expected: ${expectedArticles.join(", ")}\n  actual:   ${articleSlugs.join(", ")}`,
    );
  }

  const docSlugs = fixtures.docSummaries.map((d) => d.slug).sort();
  const expectedDocs = [...expected.documentationSlugs].sort();
  if (docSlugs.length !== 5) {
    errors.push(`Expected 5 documentation slugs, found ${docSlugs.length}`);
  }
  if (JSON.stringify(docSlugs) !== JSON.stringify(expectedDocs)) {
    errors.push(
      `Documentation slug mismatch.\n  expected: ${expectedDocs.join(", ")}\n  actual:   ${docSlugs.join(", ")}`,
    );
  }

  return { ok: errors.length === 0, errors };
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
