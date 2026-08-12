#!/usr/bin/env node
/**
 * Rollback is intentionally NOT implemented as an automatic delete-by-batch
 * operation. Deleting content by `migrationBatch` is risky:
 *
 *   1. `migrationBatch` currently only exists on the `article` content type
 *      (see `src/api/article/content-types/article/schema.json`). Projects,
 *      case studies, FAQ items, and navigation have no batch stamp, so a
 *      generic "delete everything from batch X" cannot cover them without a
 *      schema change first.
 *   2. A batch delete on `article` alone could still destroy manual edits an
 *      editor made in the Strapi admin after the import ran, since documents
 *      are matched/updated in place (idempotent upsert), not just created.
 *   3. Draft & Publish means "deleting" a document should also consider
 *      published vs draft versions and any relations (tags/technologies)
 *      that may now be orphaned.
 *
 * TODO (follow-up, needs explicit approval before implementing):
 *   - Add `migrationBatch` to Project / Case Study / FAQ Item schemas.
 *   - Snapshot affected documentIds to `out/<batch>.json` before every write
 *     run (already done — see MigrationReport.write()) so a rollback script
 *     can diff "created by this batch" vs "updated by this batch" and only
 *     hard-delete the former.
 *   - Require an interactive confirmation (or --yes-really flag) before any
 *     delete call against Strapi.
 *
 * Until that lands, use the JSON artifact under `scripts/migrate/out/` for a
 * given batch to manually identify and review documents in the Strapi admin.
 */

const batch = process.argv.find((a) => a.startsWith("--batch="))?.split("=")[1];

console.warn("=".repeat(72));
console.warn("migrate:content:rollback is a STUB. No content has been deleted.");
console.warn(
  batch
    ? `Requested batch: ${batch}. Inspect scripts/migrate/out/write-${batch.replace(
        /[:.]/g,
        "-"
      )}.json and the Strapi admin manually.`
    : "Pass --batch=<migrationBatch ISO timestamp> to see batch-specific guidance."
);
console.warn("See scripts/migrate/src/rollback.ts for why this is not automated yet.");
console.warn("=".repeat(72));

process.exitCode = 1;
