#!/usr/bin/env node
import {
  checkConnectivity,
  createEntry,
  findOne,
  relationSet,
  updateEntry,
} from "../../migrate/src/lib/strapiClient";
import { ATLAS_SITE_KEY, strapi } from "./config";
import { loadAtlasFixtures } from "./loadFixtures";
import { buildAtlasMigrationPlan, printMigrationPlan, type UpsertPlanItem } from "./payloads";
import { printSchemaValidationResult, validateAtlasSchemas } from "./schema-validate";
import { printValidationResult, validateAtlasFixtures } from "./validate";

type RunMode = "dry-run" | "write" | "validate-only";

function parseArgs(argv: string[]): RunMode {
  if (argv.includes("--validate-only")) return "validate-only";
  if (argv.includes("--write")) return "write";
  return "dry-run";
}

function makeBatchId(): string {
  return new Date().toISOString();
}

async function resolveSiteId(): Promise<number | string | undefined> {
  const site = await findOne("sites", { key: { $eq: ATLAS_SITE_KEY } });
  return site?.documentId ?? site?.id;
}

function stripInternalFields(payload: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(
    JSON.stringify(payload, (_key, value) => {
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const copy = { ...(value as Record<string, unknown>) };
        delete copy._sourcePath;
        return copy;
      }
      return value;
    }),
  ) as Record<string, unknown>;
}

async function attachSiteRelations(
  payload: Record<string, unknown>,
  siteId: number | string,
): Promise<Record<string, unknown>> {
  const next = { ...payload };
  if (Array.isArray(next.sites)) {
    next.sites = relationSet([siteId]);
  }
  if (next.site && typeof next.site === "object" && "key" in (next.site as object)) {
    next.site = siteId;
  }
  if (next.relatedProject && typeof next.relatedProject === "object" && "slug" in (next.relatedProject as object)) {
    const slug = (next.relatedProject as { slug: string }).slug;
    const project = await findOne("projects", { slug: { $eq: slug } });
    if (project?.documentId) next.relatedProject = project.documentId;
    else delete next.relatedProject;
  }
  if (next.featuredProject && typeof next.featuredProject === "object" && "slug" in (next.featuredProject as object)) {
    const slug = (next.featuredProject as { slug: string }).slug;
    const project = await findOne("projects", { slug: { $eq: slug } });
    if (project?.documentId) next.featuredProject = project.documentId;
    else delete next.featuredProject;
  }
  if (Array.isArray(next.selected)) {
    next.selected = await Promise.all(
      (next.selected as Array<Record<string, unknown>>).map(async (item) => {
        const copy = { ...item };
        if (copy.project && typeof copy.project === "object" && "slug" in (copy.project as object)) {
          const slug = (copy.project as { slug: string }).slug;
          const project = await findOne("projects", { slug: { $eq: slug } });
          if (project?.documentId) copy.project = project.documentId;
        }
        return copy;
      }),
    );
  }
  if (Array.isArray(next.writingItems)) {
    next.writingItems = await Promise.all(
      (next.writingItems as Array<Record<string, unknown>>).map(async (item) => {
        const copy = { ...item };
        if (copy.article && typeof copy.article === "object" && "slug" in (copy.article as object)) {
          const slug = (copy.article as { slug: string }).slug;
          const article = await findOne("articles", { slug: { $eq: slug } });
          if (article?.documentId) copy.article = article.documentId;
        }
        return copy;
      }),
    );
  }
  return next;
}

async function upsertItem(
  item: UpsertPlanItem,
  siteId: number | string,
): Promise<"created" | "updated" | "would-create" | "would-update"> {
  const payload = stripInternalFields(await attachSiteRelations(item.payload, siteId));
  const filters =
    item.uid === "home-pages" ||
    item.uid === "about-pages" ||
    item.uid === "work-pages" ||
    item.uid === "contact-pages"
      ? { site: { key: { $eq: ATLAS_SITE_KEY } } }
      : item.key.startsWith("doc:")
        ? { slug: { $eq: item.key.slice(4) }, surface: { $eq: "documentation" } }
        : item.uid === "articles"
          ? { slug: { $eq: item.key }, surface: { $eq: payload.surface ?? "writing" } }
          : { slug: { $eq: item.key } };

  const existing = await findOne(item.uid, filters);
  if (existing?.documentId) {
    await updateEntry(item.uid, existing.documentId, payload, { published: true });
    return "updated";
  }
  await createEntry(item.uid, payload, { published: true });
  return "created";
}

async function runWrite(plan: ReturnType<typeof buildAtlasMigrationPlan> extends infer P ? P : never): Promise<void> {
  if (!strapi.token) {
    throw new Error(
      "STRAPI_API_TOKEN is required for --write. Set STRAPI_URL and STRAPI_API_TOKEN, then ensure Strapi is reachable.",
    );
  }
  const reachable = await checkConnectivity();
  if (!reachable) {
    throw new Error(`Strapi is unreachable at ${strapi.url}. Start Strapi or fix STRAPI_URL before --write.`);
  }

  const siteId = await resolveSiteId();
  if (!siteId) {
    throw new Error(`Site "${ATLAS_SITE_KEY}" not found in Strapi. Run seed:sites first.`);
  }

  console.log(`Writing ${plan.items.length} entries to ${strapi.url} …`);
  for (const item of plan.items) {
    try {
      const action = await upsertItem(item, siteId);
      console.log(`  ✓ ${item.uid} :: ${item.key} → ${action}`);
    } catch (err) {
      console.error(`  ✗ ${item.uid} :: ${item.key} → ${(err as Error).message}`);
      throw err;
    }
  }
}

async function main() {
  const mode = parseArgs(process.argv.slice(2));
  console.log(`\n=== Atlas CMS migration — mode: ${mode} ===`);
  console.log(`Strapi URL: ${strapi.url} (token ${strapi.token ? "present" : "MISSING"})\n`);

  const schemaResult = validateAtlasSchemas();
  const schemaExit = printSchemaValidationResult(schemaResult);

  const fixtureResult = await validateAtlasFixtures();
  const fixtureExit = printValidationResult(fixtureResult);

  if (schemaExit !== 0 || fixtureExit !== 0) {
    process.exit(1);
  }

  if (mode === "validate-only") {
    console.log("Validation complete (--validate-only).");
    return;
  }

  const fixtures = await loadAtlasFixtures();
  const batchId = makeBatchId();
  const plan = buildAtlasMigrationPlan(fixtures, batchId);
  printMigrationPlan(plan);

  if (mode === "write") {
    await runWrite(plan);
    console.log("Write complete.");
  } else {
    console.log("Dry-run complete. Re-run with --write when Strapi is available.");
  }
}

main().catch((err) => {
  console.error("Atlas migration failed:", err);
  process.exit(1);
});
