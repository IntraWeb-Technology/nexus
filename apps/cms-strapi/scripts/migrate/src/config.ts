import path from "node:path";
import fs from "node:fs";

// Best-effort load of apps/cms-strapi/.env so STRAPI_URL / STRAPI_API_TOKEN
// are picked up the same way they would be for the Strapi server itself.
// Never throws — env vars already set in the shell always win, and a
// missing/absent .env is fine (CI, or STRAPI_URL passed inline).
try {
  const envFile = path.resolve(__dirname, "../../../.env");
  if (fs.existsSync(envFile) && typeof (process as any).loadEnvFile === "function") {
    (process as any).loadEnvFile(envFile);
  }
} catch {
  // ignore — malformed .env should not block dry-run/validate
}

/**
 * All absolute source paths live here so the rest of the tool never hardcodes
 * a filesystem path inline. Every path can be overridden via env var so this
 * still works if content moves or is run from a different machine.
 */

const REPO_ROOT = path.resolve(__dirname, "../../../../.."); // nexus/
const CMS_STRAPI_ROOT = path.resolve(__dirname, "../../.."); // apps/cms-strapi/

function envPath(envVar: string, fallback: string): string {
  return process.env[envVar]?.trim() || fallback;
}

export const paths = {
  repoRoot: REPO_ROOT,
  cmsStrapiRoot: CMS_STRAPI_ROOT,

  hashnodeMirrorDir: envPath(
    "MIGRATE_HASHNODE_DIR",
    path.resolve(REPO_ROOT, "..", "hashnode-schibelli")
  ),

  legacyPortfolioBlogDir: envPath(
    "MIGRATE_PORTFOLIO_BLOG_DIR",
    "C:\\Users\\jschi\\OneDrive\\Desktop\\Projects\\2025_portfolio\\portfolio-os\\apps\\site\\content\\blog"
  ),

  legacyCaseStudiesDir: envPath(
    "MIGRATE_CASE_STUDIES_DIR",
    "C:\\Users\\jschi\\OneDrive\\Desktop\\Projects\\2025_portfolio\\portfolio-os\\apps\\site\\content\\case-studies"
  ),

  projectsDir: envPath(
    "MIGRATE_PROJECTS_DIR",
    path.resolve(REPO_ROOT, "apps/personal-site/apps/site/data/projects")
  ),

  intrawebFaqFile: envPath(
    "MIGRATE_INTRAWEB_FAQ_FILE",
    path.resolve(REPO_ROOT, "apps/iw-site-q2/lib/geo-faq.ts")
  ),

  intrawebNavFile: envPath(
    "MIGRATE_INTRAWEB_NAV_FILE",
    path.resolve(REPO_ROOT, "apps/iw-site-q2/lib/site.ts")
  ),

  docsDir: envPath(
    "MIGRATE_DOCS_DIR",
    path.resolve(REPO_ROOT, "docs/strapi-migration")
  ),

  outDir: path.resolve(__dirname, "../out"),
};

export const strapi = {
  url: (process.env.STRAPI_URL || "http://localhost:1337").replace(/\/+$/, ""),
  token: process.env.STRAPI_API_TOKEN || "",
};

export function assertSourceDirExists(label: string, dir: string): boolean {
  if (!fs.existsSync(dir)) {
    // eslint-disable-next-line no-console
    console.warn(`[config] ${label} not found at: ${dir} (skipping that source)`);
    return false;
  }
  return true;
}

/** Hashnode publication host, used to reconstruct canonical URLs for articles
 * that don't carry an explicit source URL in frontmatter. Documented assumption:
 * the `hashnode-schibelli` mirror was exported from `mindware.hashnode.dev`
 * (per nexus/docs/strapi-migration/audit.md §3.2 and §3.8). If this assumption
 * is wrong for a given batch, fix via MIGRATE_HASHNODE_HOST env var.
 */
export const HASHNODE_HOST = envPath(
  "MIGRATE_HASHNODE_HOST",
  "mindware.hashnode.dev"
);

/** Personal site canonical domain, used to reconstruct canonical URLs for
 * portfolio-native content (no Hashnode mirror) such as hand-authored posts
 * and case studies.
 */
export const PERSONAL_DOMAIN = envPath(
  "MIGRATE_PERSONAL_DOMAIN",
  "https://johnschibelli.dev"
);
