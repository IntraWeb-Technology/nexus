import fs from "node:fs";
import path from "node:path";
import type {
  ContentDomain,
  ReviewQueueItem,
  RunMode,
  SourceCounts,
  UpsertResult,
  ValidationIssue,
} from "../types";
import { paths } from "../config";

export class MigrationReport {
  readonly batchId: string;
  readonly mode: RunMode;
  readonly startedAt: string;
  strapiReachable: boolean | null = null;
  blockers: string[] = [];
  sourceCounts = new Map<ContentDomain, SourceCounts>();
  results: UpsertResult[] = [];
  validationIssues: ValidationIssue[] = [];
  reviewQueue: ReviewQueueItem[] = [];

  constructor(batchId: string, mode: RunMode) {
    this.batchId = batchId;
    this.mode = mode;
    this.startedAt = new Date().toISOString();
  }

  addSourceCount(domain: ContentDomain, counts: SourceCounts) {
    this.sourceCounts.set(domain, counts);
  }

  addResult(result: UpsertResult) {
    this.results.push(result);
  }

  addValidationIssue(issue: ValidationIssue) {
    this.validationIssues.push(issue);
  }

  addReviewItem(item: ReviewQueueItem) {
    this.reviewQueue.push(item);
  }

  addBlocker(message: string) {
    this.blockers.push(message);
  }

  private resultsByDomain(domain: ContentDomain): UpsertResult[] {
    return this.results.filter((r) => r.domain === domain);
  }

  private tally(domain: ContentDomain) {
    const rows = this.resultsByDomain(domain);
    const count = (action: string) => rows.filter((r) => r.action === action).length;
    return {
      created: count("created") + count("would-create"),
      updated: count("updated") + count("would-update"),
      skippedDuplicate: count("skipped-duplicate"),
      skippedInvalid: count("skipped-invalid"),
      errors: count("error"),
    };
  }

  toMarkdown(): string {
    const lines: string[] = [];
    lines.push(`# Migration report`);
    lines.push("");
    lines.push(`**Batch ID:** \`${this.batchId}\`  `);
    lines.push(`**Mode:** \`${this.mode}\`  `);
    lines.push(`**Run started:** ${this.startedAt}  `);
    lines.push(
      `**Strapi reachable:** ${
        this.strapiReachable === null ? "not checked" : this.strapiReachable ? "yes" : "no"
      }`
    );
    lines.push("");

    if (this.blockers.length) {
      lines.push(`## Blockers`);
      lines.push("");
      for (const b of this.blockers) lines.push(`- ⚠️ ${b}`);
      lines.push("");
    }

    lines.push(`## Source counts`);
    lines.push("");
    lines.push(`| Domain | Files scanned | Items extracted | Duplicates skipped |`);
    lines.push(`|---|---:|---:|---:|`);
    for (const [domain, counts] of this.sourceCounts.entries()) {
      lines.push(
        `| ${domain} | ${counts.filesScanned} | ${counts.itemsExtracted} | ${counts.duplicatesSkipped} |`
      );
    }
    lines.push("");

    lines.push(`## Upsert plan / results`);
    lines.push("");
    lines.push(`| Domain | Created | Updated | Skipped (duplicate) | Skipped (invalid) | Errors |`);
    lines.push(`|---|---:|---:|---:|---:|---:|`);
    const domains = new Set<ContentDomain>(this.results.map((r) => r.domain));
    for (const domain of domains) {
      const t = this.tally(domain);
      lines.push(
        `| ${domain} | ${t.created} | ${t.updated} | ${t.skippedDuplicate} | ${t.skippedInvalid} | ${t.errors} |`
      );
    }
    lines.push("");

    lines.push(`### Detail`);
    lines.push("");
    for (const domain of domains) {
      const rows = this.resultsByDomain(domain);
      if (!rows.length) continue;
      lines.push(`<details><summary>${domain} (${rows.length})</summary>`);
      lines.push("");
      lines.push(`| Identifier | Action | Document ID | Detail | Source |`);
      lines.push(`|---|---|---|---|---|`);
      for (const r of rows) {
        lines.push(
          `| ${escapeCell(r.identifier)} | ${r.action} | ${r.documentId ?? "-"} | ${escapeCell(
            r.detail ?? ""
          )} | ${escapeCell(r.sourceFiles?.join(", ") ?? r.sourceFile ?? "")} |`
        );
      }
      lines.push("");
      lines.push(`</details>`);
      lines.push("");
    }

    lines.push(`## Validation issues (${this.validationIssues.length})`);
    lines.push("");
    if (this.validationIssues.length) {
      lines.push(`| Domain | Identifier | Field | Severity | Message | Source |`);
      lines.push(`|---|---|---|---|---|---|`);
      for (const issue of this.validationIssues) {
        lines.push(
          `| ${issue.domain} | ${escapeCell(issue.identifier)} | ${issue.field} | ${
            issue.severity
          } | ${escapeCell(issue.message)} | ${escapeCell(issue.sourceFile ?? "")} |`
        );
      }
    } else {
      lines.push(`_None._`);
    }
    lines.push("");

    lines.push(`## Manual review queue (${this.reviewQueue.length})`);
    lines.push("");
    lines.push(
      `Full machine-readable copy: \`docs/strapi-migration/review-queue.json\`.`
    );
    lines.push("");
    if (this.reviewQueue.length) {
      lines.push(`| Domain | Identifier | Reason | Suggested sites | Source |`);
      lines.push(`|---|---|---|---|---|`);
      for (const item of this.reviewQueue) {
        lines.push(
          `| ${item.domain} | ${escapeCell(item.identifier)} | ${escapeCell(item.reason)} | ${item.suggestedSites.join(
            ", "
          )} | ${escapeCell(item.sourceFile ?? "")} |`
        );
      }
    } else {
      lines.push(`_None._`);
    }
    lines.push("");

    lines.push(`## Assumptions & known limitations`);
    lines.push("");
    lines.push(
      `- Media (cover/og images) are **not** uploaded to the Strapi Media Library by default. Source image URLs are preserved in each item's detail column above / the dry-run JSON. Re-run with \`--with-media\` to attempt best-effort upload+attach.`
    );
    lines.push(
      `- Hashnode canonical URLs are reconstructed as \`https://<host>/<slug>\` using the documented publication host (see \`src/config.ts\`); verify against the live Hashnode publication before treating as authoritative.`
    );
    lines.push(
      `- Case studies whose body could not be confidently split into Challenge/Solution/Results sections have the full body placed in \`solution\` and are flagged in the review queue.`
    );
    lines.push(
      `- Site assignment never guesses \`intraweb\` ownership for articles — ambiguous items stay \`personal\` and are queued for human review.`
    );
    lines.push("");

    return lines.join("\n");
  }

  write() {
    fs.mkdirSync(paths.docsDir, { recursive: true });
    const reportPath = path.join(paths.docsDir, "migration-report.md");
    fs.writeFileSync(reportPath, this.toMarkdown(), "utf8");

    const queuePath = path.join(paths.docsDir, "review-queue.json");
    fs.writeFileSync(
      queuePath,
      JSON.stringify(
        {
          generatedAt: this.startedAt,
          migrationBatch: this.batchId,
          mode: this.mode,
          items: this.reviewQueue,
        },
        null,
        2
      ),
      "utf8"
    );

    fs.mkdirSync(paths.outDir, { recursive: true });
    const fileSafeBatchId = this.batchId.replace(/[:.]/g, "-");
    const planPath = path.join(paths.outDir, `${this.mode}-${fileSafeBatchId}.json`);
    fs.writeFileSync(
      planPath,
      JSON.stringify(
        {
          batchId: this.batchId,
          mode: this.mode,
          startedAt: this.startedAt,
          strapiReachable: this.strapiReachable,
          blockers: this.blockers,
          results: this.results,
          validationIssues: this.validationIssues,
          reviewQueue: this.reviewQueue,
        },
        null,
        2
      ),
      "utf8"
    );

    return { reportPath, queuePath, planPath };
  }
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ").slice(0, 300);
}
