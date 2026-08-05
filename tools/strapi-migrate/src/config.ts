import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Nexus monorepo root (tools/strapi-migrate/src → ../../..) */
export const NEXUS_ROOT = path.resolve(__dirname, "../../..");

export const DEFAULT_PATHS = {
  portfolioSite: path.normalize(
    "C:/Users/jschi/OneDrive/Desktop/Projects/2025_portfolio/portfolio-os/apps/site",
  ),
  hashnodeMirror: path.join(
    path.dirname(NEXUS_ROOT),
    "hashnode-schibelli",
  ),
  iwSite: path.join(NEXUS_ROOT, "apps/iw-site-q2"),
  reportsDir: path.join(NEXUS_ROOT, "docs/strapi-migration/reports"),
  migrationReport: path.join(NEXUS_ROOT, "docs/strapi-migration/migration-report.md"),
  reviewQueue: path.join(NEXUS_ROOT, "docs/strapi-migration/reports/review-queue.json"),
} as const;

export function getEnvPaths() {
  return {
    portfolioSite:
      process.env.PORTFOLIO_SITE_ROOT ?? DEFAULT_PATHS.portfolioSite,
    hashnodeMirror:
      process.env.HASHNODE_MIRROR_ROOT ?? DEFAULT_PATHS.hashnodeMirror,
    iwSite: process.env.IW_SITE_ROOT ?? DEFAULT_PATHS.iwSite,
    reportsDir: process.env.MIGRATION_REPORTS_DIR ?? DEFAULT_PATHS.reportsDir,
    migrationReport:
      process.env.MIGRATION_REPORT_PATH ?? DEFAULT_PATHS.migrationReport,
    reviewQueue: process.env.REVIEW_QUEUE_PATH ?? DEFAULT_PATHS.reviewQueue,
  };
}

export function getStrapiEnv(): { url: string; token: string } | null {
  const url = process.env.STRAPI_URL?.replace(/\/$/, "");
  const token = process.env.STRAPI_API_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

export type SiteKey = "personal" | "intraweb";

export const SITE_KEYS = ["personal", "intraweb"] as const satisfies readonly SiteKey[];
