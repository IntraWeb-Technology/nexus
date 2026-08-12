import fs from "node:fs";
import path from "node:path";

const SCRIPT_ROOT = path.resolve(__dirname, "..");
const CMS_STRAPI_ROOT = path.resolve(SCRIPT_ROOT, "../..");
const REPO_ROOT = path.resolve(CMS_STRAPI_ROOT, "../..");

try {
  const envFile = path.resolve(CMS_STRAPI_ROOT, ".env");
  if (fs.existsSync(envFile) && typeof (process as NodeJS.Process & { loadEnvFile?: (p: string) => void }).loadEnvFile === "function") {
    (process as NodeJS.Process & { loadEnvFile: (p: string) => void }).loadEnvFile(envFile);
  }
} catch {
  // missing or malformed .env must not block dry-run / validate
}

export const paths = {
  repoRoot: REPO_ROOT,
  cmsStrapiRoot: CMS_STRAPI_ROOT,
  atlasContentRoot: path.join(REPO_ROOT, "apps/atlas-web/src/content"),
  expectedDir: path.join(SCRIPT_ROOT, "expected"),
  schemasRoot: path.join(CMS_STRAPI_ROOT, "src"),
  atlasPublicImages: path.join(REPO_ROOT, "apps/atlas-web/public/images"),
};

export const strapi = {
  url: (process.env.STRAPI_URL || "http://localhost:1337").replace(/\/+$/, ""),
  token: process.env.STRAPI_API_TOKEN || "",
};

export const ATLAS_SITE_KEY = "personal";
