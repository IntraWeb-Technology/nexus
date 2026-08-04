#!/usr/bin/env node
import { checkConnectivity, findOne, publishEntry, relationSet } from "./lib/strapiClient";
import { upsertGeneric, TaxonomyCache } from "./lib/taxonomies";
import { uploadMediaFromUrl } from "./lib/media";
import { MigrationReport } from "./lib/report";
import { strapi } from "./config";

import { extractHashnodeArticles } from "./sources/hashnodeArticles";
import { extractPortfolioArticles } from "./sources/portfolioArticles";
import { extractCaseStudies } from "./sources/caseStudies";
import { extractProjects } from "./sources/projects";
import { extractIntrawebFaq } from "./sources/intrawebFaq";
import { extractIntrawebNav } from "./sources/intrawebNav";

import {
  validateArticle,
  validateCaseStudy,
  validateFaq,
  validateNav,
  validateProject,
} from "./validate";

import type {
  ArticlePlan,
  CaseStudyPlan,
  ContentDomain,
  RunMode,
  SourceCounts,
  UpsertResult,
} from "./types";

// ---------------------------------------------------------------------------
// CLI parsing
// ---------------------------------------------------------------------------

function parseArgs(argv: string[]) {
  const args = new Set(argv);
  let mode: RunMode = "dry-run";
  if (args.has("--write")) mode = "write";
  else if (args.has("--validate")) mode = "validate";
  else if (args.has("--dry-run")) mode = "dry-run";

  const typesArg = argv.find((a) => a.startsWith("--types="));
  const allTypes: ContentDomain[] = ["sites", "articles", "projects", "case-studies", "faq", "nav"];
  const types = new Set<ContentDomain>(
    typesArg
      ? (typesArg.split("=")[1].split(",") as ContentDomain[])
      : allTypes
  );

  return {
    mode,
    types,
    withMedia: args.has("--with-media"),
    verbose: args.has("--verbose"),
  };
}

function makeBatchId(): { stamped: string; fileSafe: string } {
  const iso = new Date().toISOString();
  return { stamped: iso, fileSafe: iso.replace(/[:.]/g, "-") };
}

// ---------------------------------------------------------------------------
// Article pipeline (Hashnode + portfolio, dedupe by hashnodeId / slug+site)
// ---------------------------------------------------------------------------

function mergeArticlePlans(
  hashnodePlans: ArticlePlan[],
  portfolioPlans: ArticlePlan[]
): { merged: ArticlePlan[]; duplicatesSkipped: number } {
  const byHashnodeId = new Map<string, ArticlePlan>();
  const bySlugSite = new Map<string, ArticlePlan>();
  const merged: ArticlePlan[] = [];
  let duplicatesSkipped = 0;

  // Hashnode mirror is the documented canonical offline source (audit.md §3.2/3.8);
  // it is processed first so portfolio-os duplicates of the same cuid are skipped.
  for (const plan of [...hashnodePlans, ...portfolioPlans]) {
    const slugSiteKey = `${plan.sites.slice().sort().join(",")}::${plan.slug}`;

    if (plan.hashnodeId && byHashnodeId.has(plan.hashnodeId)) {
      duplicatesSkipped += 1;
      continue;
    }
    if (bySlugSite.has(slugSiteKey)) {
      duplicatesSkipped += 1;
      continue;
    }

    if (plan.hashnodeId) byHashnodeId.set(plan.hashnodeId, plan);
    bySlugSite.set(slugSiteKey, plan);
    merged.push(plan);
  }

  return { merged, duplicatesSkipped };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const { stamped: batchId } = makeBatchId();
  const report = new MigrationReport(batchId, opts.mode);

  console.log(`\n=== Strapi content migration — mode: ${opts.mode} — batch: ${batchId} ===`);
  console.log(`Strapi URL: ${strapi.url} (token ${strapi.token ? "present" : "MISSING"})\n`);

  // Connectivity is informational in dry-run/validate; a hard gate only in write mode.
  report.strapiReachable = await checkConnectivity().catch(() => false);
  if (opts.mode === "write" && !report.strapiReachable) {
    report.addBlocker(
      `Strapi is unreachable at ${strapi.url}. No writes were attempted — verify STRAPI_URL/STRAPI_API_TOKEN and that the instance is running, then re-run migrate:content.`
    );
    console.warn(`⚠️  Strapi unreachable at ${strapi.url}. Falling back to plan-only output.`);
  }
  const effectiveWrite = opts.mode === "write" && report.strapiReachable === true;
  const effectiveMode: RunMode = effectiveWrite ? "write" : opts.mode === "write" ? "dry-run" : opts.mode;

  const taxonomy = new TaxonomyCache();
  if (opts.types.has("sites")) {
    await taxonomy.ensureSite("personal", effectiveMode, "Personal portfolio", "johnschibelli.dev");
    await taxonomy.ensureSite("intraweb", effectiveMode, "IntraWeb Technology", "intrawebtech.com");
  }

  if (opts.types.has("articles")) {
    await runArticles(effectiveMode, opts.withMedia, taxonomy, batchId, report);
  }
  if (opts.types.has("projects")) {
    await runProjects(effectiveMode, taxonomy, report);
  }
  if (opts.types.has("case-studies")) {
    await runCaseStudies(effectiveMode, taxonomy, report);
  }
  if (opts.types.has("faq")) {
    await runFaq(effectiveMode, taxonomy, report);
  }
  if (opts.types.has("nav")) {
    await runNav(effectiveMode, taxonomy, report);
  }

  const written = report.write();
  printSummary(report, written);
}

async function runArticles(
  mode: RunMode,
  withMedia: boolean,
  taxonomy: TaxonomyCache,
  batchId: string,
  report: MigrationReport
) {
  const hashnode = extractHashnodeArticles();
  const portfolio = extractPortfolioArticles();
  const { merged, duplicatesSkipped } = mergeArticlePlans(hashnode.plans, portfolio.plans);

  report.addSourceCount("articles", combineCounts([hashnode.counts, portfolio.counts], duplicatesSkipped));

  for (const plan of merged) {
    const issues = validateArticle(plan);
    issues.forEach((i) => report.addValidationIssue(i));

    if (plan.reviewFlags.length) {
      for (const reason of plan.reviewFlags) {
        report.addReviewItem({
          domain: "articles",
          identifier: plan.slug,
          reason,
          sourceFile: plan.sourceFile,
          suggestedSites: plan.sites,
          notes: "Default site assignment kept as personal; human should confirm intraweb duplication.",
        });
      }
    }

    const hasBlockingError = issues.some((i) => i.severity === "error");
    if (hasBlockingError) {
      report.addResult({
        domain: "articles",
        identifier: plan.slug,
        action: "skipped-invalid",
        detail: issues.filter((i) => i.severity === "error").map((i) => i.message).join("; "),
        sourceFile: plan.sourceFile,
      });
      continue;
    }

    try {
      const siteIds = await Promise.all(plan.sites.map((s) => taxonomy.getSiteId(s) ?? taxonomy.ensureSite(s, mode, s, "")));
      const tagIds = await taxonomy.resolveManyByName(
        plan.tagSlugs,
        (name, m) => taxonomy.ensureTag(name, m),
        mode
      );
      const authorId = plan.authorName
        ? await taxonomy.ensureAuthor(plan.authorName, plan.authorEmail, mode)
        : undefined;

      let featuredImageId: number | undefined;
      if (withMedia && mode === "write" && plan.featuredImageUrl) {
        featuredImageId = await uploadMediaFromUrl(plan.featuredImageUrl, plan.slug);
      }

      const payload: Record<string, unknown> = {
        title: plan.title,
        slug: plan.slug,
        excerpt: plan.excerpt,
        body: plan.body,
        contentFormat: plan.contentFormat,
        sites: relationSet(siteIds),
        tags: relationSet(tagIds),
        ...(authorId ? { author: authorId } : {}),
        ...(featuredImageId ? { featuredImage: featuredImageId } : {}),
        originalSource: plan.originalSource,
        originalUrl: plan.originalUrl,
        canonicalUrl: plan.canonicalUrl,
        hashnodeId: plan.hashnodeId,
        hashnodePublication: plan.hashnodePublication,
        publishedDate: plan.publishedDate,
        featured: plan.featured,
        seo: {
          metaTitle: plan.seoMetaTitle?.slice(0, 70),
          metaDescription: plan.seoMetaDescription?.slice(0, 160),
          canonicalUrl: plan.canonicalUrl,
        },
        migrationBatch: batchId,
      };

      const findFilters = plan.hashnodeId
        ? { hashnodeId: { $eq: plan.hashnodeId } }
        : { slug: { $eq: plan.slug }, sites: { key: { $eq: plan.sites[0] } } };

      const { documentId, action } = await upsertGeneric("articles", findFilters, payload, mode);

      if (mode === "write" && documentId && plan.shouldPublish) {
        await publishEntry("articles", documentId).catch((err) =>
          console.warn(`[articles] publish failed for ${plan.slug}: ${(err as Error).message}`)
        );
      }

      report.addResult(toUpsertResult("articles", plan.slug, action, documentId, plan.sourceFile));
    } catch (err) {
      report.addResult({
        domain: "articles",
        identifier: plan.slug,
        action: "error",
        detail: (err as Error).message,
        sourceFile: plan.sourceFile,
      });
    }
  }
}

async function runProjects(mode: RunMode, taxonomy: TaxonomyCache, report: MigrationReport) {
  const { plans, counts } = await extractProjects();
  report.addSourceCount("projects", counts);

  for (const plan of plans) {
    const issues = validateProject(plan);
    issues.forEach((i) => report.addValidationIssue(i));
    if (plan.reviewFlags.length) {
      for (const reason of plan.reviewFlags) {
        report.addReviewItem({
          domain: "projects",
          identifier: plan.slug,
          reason,
          sourceFile: plan.sourceFile,
          suggestedSites: plan.sites,
        });
      }
    }
    if (issues.some((i) => i.severity === "error")) {
      report.addResult({
        domain: "projects",
        identifier: plan.slug,
        action: "skipped-invalid",
        detail: issues.map((i) => i.message).join("; "),
        sourceFile: plan.sourceFile,
      });
      continue;
    }

    try {
      const siteIds = await Promise.all(plan.sites.map((s) => taxonomy.getSiteId(s) ?? taxonomy.ensureSite(s, mode, s, "")));
      const techIds = await taxonomy.resolveManyByName(
        plan.technologyNames,
        (name, m) => taxonomy.ensureTechnology(name, m),
        mode
      );

      const payload: Record<string, unknown> = {
        name: plan.name,
        slug: plan.slug,
        summary: plan.summary,
        description: plan.description,
        sites: relationSet(siteIds),
        projectType: plan.projectType,
        technologies: relationSet(techIds),
        repositoryUrl: plan.repositoryUrl,
        liveUrl: plan.liveUrl,
        documentationUrl: plan.documentationUrl,
        status: plan.status,
        startDate: plan.startDate,
        endDate: plan.endDate,
        featured: plan.featured,
        seo: {
          metaTitle: plan.name.slice(0, 70),
          metaDescription: plan.summary.slice(0, 160),
        },
      };

      const { documentId, action } = await upsertGeneric(
        "projects",
        { slug: { $eq: plan.slug } },
        payload,
        mode
      );
      if (mode === "write" && documentId) {
        await publishEntry("projects", documentId).catch((err) =>
          console.warn(`[projects] publish failed for ${plan.slug}: ${(err as Error).message}`)
        );
      }
      report.addResult(toUpsertResult("projects", plan.slug, action, documentId, plan.sourceFile));
    } catch (err) {
      report.addResult({
        domain: "projects",
        identifier: plan.slug,
        action: "error",
        detail: (err as Error).message,
        sourceFile: plan.sourceFile,
      });
    }
  }
}

async function runCaseStudies(mode: RunMode, taxonomy: TaxonomyCache, report: MigrationReport) {
  const { plans, counts } = extractCaseStudies();
  report.addSourceCount("case-studies", counts);

  // Resolve related-project documentIds only after projects have (hopefully)
  // been upserted in this same run — best effort, never blocking.
  const relatedProjectIds = new Map<string, string>();

  for (const plan of plans as CaseStudyPlan[]) {
    const issues = validateCaseStudy(plan);
    issues.forEach((i) => report.addValidationIssue(i));
    if (plan.reviewFlags.length) {
      for (const reason of plan.reviewFlags) {
        report.addReviewItem({
          domain: "case-studies",
          identifier: plan.slug,
          reason,
          sourceFile: plan.sourceFile,
          suggestedSites: plan.sites,
          notes:
            reason === "case-study-body-not-split"
              ? "Full MDX body was placed in `solution`; split into challenge/solution/results manually."
              : undefined,
        });
      }
    }
    if (issues.some((i) => i.severity === "error")) {
      report.addResult({
        domain: "case-studies",
        identifier: plan.slug,
        action: "skipped-invalid",
        detail: issues.map((i) => i.message).join("; "),
        sourceFile: plan.sourceFile,
      });
      continue;
    }

    try {
      const siteIds = await Promise.all(plan.sites.map((s) => taxonomy.getSiteId(s) ?? taxonomy.ensureSite(s, mode, s, "")));
      const techIds = await taxonomy.resolveManyByName(
        plan.technologyNames,
        (name, m) => taxonomy.ensureTechnology(name, m),
        mode
      );

      let relatedProjectId = plan.relatedProjectSlug ? relatedProjectIds.get(plan.relatedProjectSlug) : undefined;
      if (!relatedProjectId && plan.relatedProjectSlug && mode === "write") {
        const found = await findOne("projects", { slug: { $eq: plan.relatedProjectSlug } }).catch(() => undefined);
        if (found) relatedProjectId = found.documentId;
      }

      const payload: Record<string, unknown> = {
        title: plan.title,
        slug: plan.slug,
        sites: relationSet(siteIds),
        clientName: plan.clientName,
        summary: plan.summary,
        challenge: plan.challenge,
        solution: plan.solution,
        results: plan.results,
        technologies: relationSet(techIds),
        ...(relatedProjectId ? { relatedProject: relatedProjectId } : {}),
        seo: {
          metaTitle: plan.seoMetaTitle?.slice(0, 70),
          metaDescription: plan.seoMetaDescription?.slice(0, 160),
          canonicalUrl: plan.canonicalUrl,
        },
      };

      const { documentId, action } = await upsertGeneric(
        "case-studies",
        { slug: { $eq: plan.slug } },
        payload,
        mode
      );
      if (mode === "write" && documentId && plan.shouldPublish) {
        await publishEntry("case-studies", documentId).catch((err) =>
          console.warn(`[case-studies] publish failed for ${plan.slug}: ${(err as Error).message}`)
        );
      }
      if (documentId) relatedProjectIds.set(plan.slug, documentId);
      report.addResult(toUpsertResult("case-studies", plan.slug, action, documentId, plan.sourceFile));
    } catch (err) {
      report.addResult({
        domain: "case-studies",
        identifier: plan.slug,
        action: "error",
        detail: (err as Error).message,
        sourceFile: plan.sourceFile,
      });
    }
  }
}

async function runFaq(mode: RunMode, taxonomy: TaxonomyCache, report: MigrationReport) {
  const { plans, counts } = await extractIntrawebFaq();
  report.addSourceCount("faq", counts);

  for (const plan of plans) {
    const issues = validateFaq(plan);
    issues.forEach((i) => report.addValidationIssue(i));
    if (issues.some((i) => i.severity === "error")) {
      report.addResult({
        domain: "faq",
        identifier: plan.question,
        action: "skipped-invalid",
        detail: issues.map((i) => i.message).join("; "),
        sourceFile: plan.sourceFile,
      });
      continue;
    }

    try {
      const siteIds = await Promise.all(plan.sites.map((s) => taxonomy.getSiteId(s) ?? taxonomy.ensureSite(s, mode, s, "")));
      const payload: Record<string, unknown> = {
        question: plan.question,
        answer: plan.answer,
        sites: relationSet(siteIds),
        sortOrder: plan.sortOrder,
        featured: false,
      };
      const { documentId, action } = await upsertGeneric(
        "faq-items",
        { question: { $eq: plan.question } },
        payload,
        mode
      );
      if (mode === "write" && documentId) {
        await publishEntry("faq-items", documentId).catch((err) =>
          console.warn(`[faq] publish failed for "${plan.question}": ${(err as Error).message}`)
        );
      }
      report.addResult(toUpsertResult("faq", plan.question, action, documentId, plan.sourceFile));
    } catch (err) {
      report.addResult({
        domain: "faq",
        identifier: plan.question,
        action: "error",
        detail: (err as Error).message,
        sourceFile: plan.sourceFile,
      });
    }
  }
}

async function runNav(mode: RunMode, taxonomy: TaxonomyCache, report: MigrationReport) {
  const { plans, counts } = await extractIntrawebNav();
  report.addSourceCount("nav", counts);

  for (const plan of plans) {
    const issues = validateNav(plan);
    issues.forEach((i) => report.addValidationIssue(i));
    if (issues.some((i) => i.severity === "error")) {
      report.addResult({
        domain: "nav",
        identifier: plan.name,
        action: "skipped-invalid",
        detail: issues.map((i) => i.message).join("; "),
        sourceFile: plan.sourceFile,
      });
      continue;
    }

    try {
      const siteId = taxonomy.getSiteId(plan.siteKey) ?? (await taxonomy.ensureSite(plan.siteKey, mode, plan.siteKey, ""));
      const payload: Record<string, unknown> = {
        name: plan.name,
        site: siteId,
        location: plan.location,
        items: plan.items,
      };
      const { documentId, action } = await upsertGeneric(
        "navigations",
        { site: { key: { $eq: plan.siteKey } }, location: { $eq: plan.location } },
        payload,
        mode
      );
      if (mode === "write" && documentId) {
        await publishEntry("navigations", documentId).catch((err) =>
          console.warn(`[nav] publish failed for ${plan.name}: ${(err as Error).message}`)
        );
      }
      report.addResult(toUpsertResult("nav", plan.name, action, documentId, plan.sourceFile));
    } catch (err) {
      report.addResult({
        domain: "nav",
        identifier: plan.name,
        action: "error",
        detail: (err as Error).message,
        sourceFile: plan.sourceFile,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function combineCounts(list: SourceCounts[], extraDuplicates = 0): SourceCounts {
  return list.reduce(
    (acc, c) => ({
      filesScanned: acc.filesScanned + c.filesScanned,
      itemsExtracted: acc.itemsExtracted + c.itemsExtracted,
      duplicatesSkipped: acc.duplicatesSkipped + c.duplicatesSkipped,
    }),
    { filesScanned: 0, itemsExtracted: 0, duplicatesSkipped: extraDuplicates }
  );
}

function toUpsertResult(
  domain: ContentDomain,
  identifier: string,
  action: "created" | "updated" | "would-create" | "would-update",
  documentId: string | undefined,
  sourceFile: string
): UpsertResult {
  return { domain, identifier, action, documentId, sourceFile };
}

function printSummary(report: MigrationReport, written: { reportPath: string; queuePath: string; planPath: string }) {
  console.log(`\n=== Summary ===`);
  console.log(`Mode: ${report.mode}`);
  console.log(`Batch: ${report.batchId}`);
  console.log(`Results: ${report.results.length}`);
  console.log(`Validation issues: ${report.validationIssues.length}`);
  console.log(`Review queue items: ${report.reviewQueue.length}`);
  if (report.blockers.length) {
    console.log(`Blockers:`);
    report.blockers.forEach((b) => console.log(`  - ${b}`));
  }
  console.log(`\nReport written to: ${written.reportPath}`);
  console.log(`Review queue written to: ${written.queuePath}`);
  console.log(`Raw plan/result JSON: ${written.planPath}\n`);
}

main().catch((err) => {
  console.error("Migration run failed:", err);
  process.exitCode = 1;
});
