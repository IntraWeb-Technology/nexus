#!/usr/bin/env node
import {
  runDryRun,
  runMigrate,
  runRollback,
  runValidate,
} from "./commands.js";
import { StrapiNotConfiguredError } from "./strapi.js";

function printSummary(label: string, result: Awaited<ReturnType<typeof runDryRun>>) {
  console.log(`\n[${label}] batch=${result.migrationBatch}`);
  console.log(
    `  articles: portfolio=${result.counts.portfolioArticles} hashnode=${result.counts.hashnodeArticles} deduped=${result.counts.articlesAfterDedupe}`,
  );
  console.log(
    `  caseStudies=${result.counts.caseStudies} projects=${result.counts.projects}`,
  );
  console.log(
    `  nav=${result.counts.navigations} faq=${result.counts.faqItems} services=${result.counts.servicesExtracted}`,
  );
  console.log(
    `  plan=${result.plan.length} migrated=${result.migrated} skipped=${result.skipped} duplicates=${result.duplicates} review=${result.reviewQueue.length} errors=${result.errors.length}`,
  );
  if (result.reportPath) console.log(`  report: ${result.reportPath}`);
  if (result.reviewQueuePath) console.log(`  review: ${result.reviewQueuePath}`);
  if (result.errors.length) {
    for (const e of result.errors) console.error(`  ERROR: ${e}`);
  }
}

async function main() {
  const cmd = process.argv[2] ?? "dry-run";
  const arg = process.argv[3];

  try {
    switch (cmd) {
      case "dry-run": {
        const result = await runDryRun();
        printSummary("dry-run", result);
        break;
      }
      case "migrate": {
        const result = await runMigrate();
        printSummary("migrate", result);
        if (result.errors.length) process.exitCode = 1;
        break;
      }
      case "validate": {
        const result = await runValidate();
        printSummary("validate", result);
        if (result.errors.length) process.exitCode = 1;
        break;
      }
      case "rollback": {
        const result = await runRollback(arg);
        printSummary("rollback", result);
        if (result.errors.length) process.exitCode = 1;
        break;
      }
      default:
        console.error(
          `Unknown command: ${cmd}\nUsage: tsx src/cli.ts <dry-run|migrate|validate|rollback> [batchId]`,
        );
        process.exitCode = 1;
    }
  } catch (err) {
    if (err instanceof StrapiNotConfiguredError) {
      console.error(err.message);
      process.exitCode = 1;
      return;
    }
    console.error(err);
    process.exitCode = 1;
  }
}

main();
