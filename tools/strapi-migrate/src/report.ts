import fs from "node:fs";
import path from "node:path";
import type { DiscoveryCounts, MigrationRunResult, ReviewItem, UpsertPlanItem } from "./types.js";

function countByType(plan: UpsertPlanItem[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of plan) {
    if (item.action === "skip-duplicate") continue;
    out[item.type] = (out[item.type] ?? 0) + 1;
  }
  return out;
}

export function renderMigrationReportMd(result: MigrationRunResult): string {
  const byType = countByType(result.plan);
  const createCount = result.plan.filter((p) => p.action === "create").length;
  const updateCount = result.plan.filter((p) => p.action === "update").length;
  const dupCount = result.plan.filter((p) => p.action === "skip-duplicate").length;
  const skipCount = result.plan.filter((p) => p.action === "skip").length;

  const lines: string[] = [
    `# Migration report — ${result.mode}`,
    "",
    `| Field | Value |`,
    `|---|---|`,
    `| migrationBatch | \`${result.migrationBatch}\` |`,
    `| mode | ${result.mode} |`,
    `| startedAt | ${result.startedAt} |`,
    `| finishedAt | ${result.finishedAt} |`,
    "",
    "## Discovery counts",
    "",
    `| Source | Count |`,
    `|---|---:|`,
    `| Portfolio blog articles | ${result.counts.portfolioArticles} |`,
    `| Hashnode mirror articles | ${result.counts.hashnodeArticles} |`,
    `| Articles after dedupe | ${result.counts.articlesAfterDedupe} |`,
    `| Case studies | ${result.counts.caseStudies} |`,
    `| Projects | ${result.counts.projects} |`,
    `| Navigations | ${result.counts.navigations} |`,
    `| FAQ items | ${result.counts.faqItems} |`,
    `| Services extracted | ${result.counts.servicesExtracted} |`,
    `| Services review-queued | ${result.counts.servicesReviewQueued} |`,
    "",
    "## Plan summary",
    "",
    `| Metric | Count |`,
    `|---|---:|`,
    `| Discovered (unique plan create/update) | ${createCount + updateCount} |`,
    `| Migrated (live writes) | ${result.migrated} |`,
    `| Skipped | ${result.skipped + skipCount} |`,
    `| Duplicates | ${result.duplicates + dupCount} |`,
    `| Review queue items | ${result.reviewQueue.length} |`,
    `| Errors | ${result.errors.length} |`,
    "",
    "### By content type",
    "",
    `| Type | Count |`,
    `|---|---:|`,
    ...Object.entries(byType).map(([t, n]) => `| ${t} | ${n} |`),
    "",
    "## Site assignment notes",
    "",
    "- Articles default to `personal`.",
    "- Projects/case studies with \"intraweb\" in name/slug/client → `[personal, intraweb]`.",
    "- IntraWeb nav / FAQ / services → `intraweb`.",
    "- Ambiguous ownership is never guessed — see review queue.",
    "",
  ];

  if (result.reviewQueue.length) {
    lines.push("## Review queue (summary)", "");
    for (const item of result.reviewQueue.slice(0, 40)) {
      lines.push(
        `- **${item.reason}**${item.slug ? ` (\`${item.slug}\`)` : ""}${item.notes ? ` — ${item.notes}` : ""}`,
      );
    }
    if (result.reviewQueue.length > 40) {
      lines.push(`- …and ${result.reviewQueue.length - 40} more (see JSON)`);
    }
    lines.push("");
  }

  if (result.errors.length) {
    lines.push("## Errors", "");
    for (const err of result.errors) {
      lines.push(`- ${err}`);
    }
    lines.push("");
  }

  lines.push(
    "## Artifacts",
    "",
    result.reportPath ? `- Report: \`${result.reportPath}\`` : "- Report: (inline)",
    result.reviewQueuePath
      ? `- Review queue: \`${result.reviewQueuePath}\``
      : "- Review queue: (none)",
    "",
    "## Live upsert field map (pending schema)",
    "",
    "Live mode requires Strapi content-types. Planned mapping:",
    "",
    "| Normalized field | Strapi target |",
    "|---|---|",
    "| `slug` / `title` / `body` | Article / Case Study / Project fields |",
    "| `hashnodeId` | Article.`hashnodeId` (cuid) |",
    "| `siteKeys` | relation → Site |",
    "| `publishedAt` | draft & publish timestamps |",
    "| `coverUrl` / `ogImageUrl` | media or URL fields + shared.seo |",
    "| `tags` / `technologies` | Tag / Technology relations |",
    "| `migrationBatch` | custom field on all migrated entries |",
    "| `upsertKey` | lookup: hashnodeId or slug+type |",
    "",
  );

  return lines.join("\n");
}

export function writeReviewQueue(
  filePath: string,
  migrationBatch: string,
  items: ReviewItem[],
): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    JSON.stringify(
      {
        migrationBatch,
        generatedAt: new Date().toISOString(),
        count: items.length,
        items,
      },
      null,
      2,
    ),
    "utf8",
  );
}

export function writeReports(opts: {
  result: MigrationRunResult;
  reportsDir: string;
  migrationReportPath: string;
  reviewQueuePath: string;
}): MigrationRunResult {
  const { result, reportsDir, migrationReportPath, reviewQueuePath } = opts;
  fs.mkdirSync(reportsDir, { recursive: true });

  const stamp = result.startedAt.replace(/[:.]/g, "-");
  const reportName =
    result.mode === "dry-run"
      ? `dry-run-${stamp}.md`
      : `${result.mode}-${stamp}.md`;
  const reportPath = path.join(reportsDir, reportName);

  const withPaths: MigrationRunResult = {
    ...result,
    reportPath,
    reviewQueuePath,
  };

  const md = renderMigrationReportMd(withPaths);
  fs.writeFileSync(reportPath, md, "utf8");
  writeReviewQueue(reviewQueuePath, result.migrationBatch, result.reviewQueue);

  // Also update canonical summary
  const summary = [
    `# Migration report (latest)`,
    "",
    `Last run: **${result.mode}** at ${result.finishedAt}`,
    "",
    `Batch: \`${result.migrationBatch}\``,
    "",
    "## Latest discovery",
    "",
    formatCountsTable(result.counts),
    "",
    `| Metric | Value |`,
    `|---|---|`,
    `| Unique plan items | ${result.plan.filter((p) => p.action !== "skip-duplicate").length} |`,
    `| Migrated | ${result.migrated} |`,
    `| Skipped | ${result.skipped} |`,
    `| Duplicates | ${result.duplicates} |`,
    `| Review queue | ${result.reviewQueue.length} |`,
    `| Errors | ${result.errors.length} |`,
    "",
    `Full report: [\`${path.relative(path.dirname(migrationReportPath), reportPath).replace(/\\/g, "/")}\`](./reports/${path.basename(reportPath)})`,
    "",
    `Review queue: [\`reports/review-queue.json\`](./reports/review-queue.json)`,
    "",
  ].join("\n");

  fs.writeFileSync(migrationReportPath, summary, "utf8");

  return withPaths;
}

function formatCountsTable(counts: DiscoveryCounts): string {
  return [
    `| Source | Count |`,
    `|---|---:|`,
    `| Portfolio blog | ${counts.portfolioArticles} |`,
    `| Hashnode mirror | ${counts.hashnodeArticles} |`,
    `| Articles (deduped) | ${counts.articlesAfterDedupe} |`,
    `| Case studies | ${counts.caseStudies} |`,
    `| Projects | ${counts.projects} |`,
    `| Nav | ${counts.navigations} |`,
    `| FAQ | ${counts.faqItems} |`,
    `| Services extracted | ${counts.servicesExtracted} |`,
  ].join("\n");
}
