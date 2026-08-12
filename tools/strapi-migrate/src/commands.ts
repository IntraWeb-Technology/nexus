import { randomUUID } from "node:crypto";
import { discoverAll } from "./discover.js";
import { writeReports } from "./report.js";
import { liveUpsert, rollbackBatch, requireStrapiEnv, StrapiNotConfiguredError } from "./strapi.js";
import type { MigrationRunResult } from "./types.js";

function nowIso() {
  return new Date().toISOString();
}

export async function runDryRun(): Promise<MigrationRunResult> {
  const startedAt = nowIso();
  const batch = randomUUID();
  const discovery = await discoverAll(batch);
  const finishedAt = nowIso();

  const duplicates = discovery.plan.filter((p) => p.action === "skip-duplicate").length;
  const result: MigrationRunResult = {
    migrationBatch: batch,
    mode: "dry-run",
    startedAt,
    finishedAt,
    counts: discovery.counts,
    plan: discovery.plan,
    reviewQueue: discovery.reviewQueue,
    migrated: 0,
    skipped: 0,
    duplicates,
    errors: [],
  };

  return writeReports({
    result,
    reportsDir: discovery.paths.reportsDir,
    migrationReportPath: discovery.paths.migrationReport,
    reviewQueuePath: discovery.paths.reviewQueue,
  });
}

export async function runMigrate(): Promise<MigrationRunResult> {
  const startedAt = nowIso();
  try {
    requireStrapiEnv();
  } catch (err) {
    if (err instanceof StrapiNotConfiguredError) {
      throw err;
    }
    throw err;
  }

  const batch = randomUUID();
  const discovery = await discoverAll(batch);
  const live = await liveUpsert(discovery.plan, batch);
  const finishedAt = nowIso();

  const result: MigrationRunResult = {
    migrationBatch: batch,
    mode: "live",
    startedAt,
    finishedAt,
    counts: discovery.counts,
    plan: live.plan,
    reviewQueue: discovery.reviewQueue,
    migrated: live.migrated,
    skipped: live.skipped,
    duplicates: live.duplicates,
    errors: live.errors,
  };

  return writeReports({
    result,
    reportsDir: discovery.paths.reportsDir,
    migrationReportPath: discovery.paths.migrationReport,
    reviewQueuePath: discovery.paths.reviewQueue,
  });
}

export async function runValidate(): Promise<MigrationRunResult> {
  const startedAt = nowIso();
  const batch = randomUUID();
  const discovery = await discoverAll(batch);
  const errors: string[] = [];

  const c = discovery.counts;
  if (c.portfolioArticles < 1) {
    errors.push("No portfolio blog articles discovered — check PORTFOLIO_SITE_ROOT");
  }
  if (c.hashnodeArticles < 1) {
    errors.push("No Hashnode mirror articles — check HASHNODE_MIRROR_ROOT");
  }
  if (c.articlesAfterDedupe < 1) {
    errors.push("Articles dedupe produced zero records");
  }
  if (c.caseStudies < 1) {
    errors.push("No case studies discovered");
  }
  if (c.projects < 1) {
    errors.push("No projects discovered");
  }
  if (c.faqItems < 1) {
    errors.push("No IntraWeb FAQ items discovered");
  }
  if (c.navigations < 1) {
    errors.push("No IntraWeb navigation discovered");
  }

  // Expected approximate targets from audit
  if (c.portfolioArticles !== 28) {
    errors.push(
      `Expected ~28 portfolio articles, found ${c.portfolioArticles}`,
    );
  }
  if (c.hashnodeArticles !== 27) {
    errors.push(
      `Expected ~27 Hashnode articles, found ${c.hashnodeArticles}`,
    );
  }
  if (c.caseStudies !== 3) {
    errors.push(`Expected 3 case studies, found ${c.caseStudies}`);
  }
  if (c.projects !== 6) {
    errors.push(`Expected 6 projects, found ${c.projects}`);
  }

  const finishedAt = nowIso();
  const result: MigrationRunResult = {
    migrationBatch: batch,
    mode: "validate",
    startedAt,
    finishedAt,
    counts: discovery.counts,
    plan: discovery.plan,
    reviewQueue: discovery.reviewQueue,
    migrated: 0,
    skipped: 0,
    duplicates: discovery.plan.filter((p) => p.action === "skip-duplicate").length,
    errors,
  };

  return writeReports({
    result,
    reportsDir: discovery.paths.reportsDir,
    migrationReportPath: discovery.paths.migrationReport,
    reviewQueuePath: discovery.paths.reviewQueue,
  });
}

export async function runRollback(batchId?: string): Promise<MigrationRunResult> {
  const startedAt = nowIso();
  requireStrapiEnv();

  const migrationBatch = batchId ?? process.env.MIGRATION_BATCH;
  if (!migrationBatch) {
    throw new Error(
      "Rollback requires a batch id: pass as CLI arg or set MIGRATION_BATCH",
    );
  }

  const rb = await rollbackBatch(migrationBatch);
  const discovery = await discoverAll(migrationBatch);
  const finishedAt = nowIso();

  const result: MigrationRunResult = {
    migrationBatch,
    mode: "rollback",
    startedAt,
    finishedAt,
    counts: discovery.counts,
    plan: [],
    reviewQueue: [],
    migrated: 0,
    skipped: 0,
    duplicates: 0,
    errors: rb.errors,
  };

  // Annotate deleted count in errors/summary via a note
  if (rb.deleted > 0) {
    result.migrated = rb.deleted; // reuse field as "affected"
  } else if (rb.errors.length === 0) {
    result.errors.push("No entries found for migrationBatch (nothing deleted).");
  }

  return writeReports({
    result,
    reportsDir: discovery.paths.reportsDir,
    migrationReportPath: discovery.paths.migrationReport,
    reviewQueuePath: discovery.paths.reviewQueue,
  });
}
