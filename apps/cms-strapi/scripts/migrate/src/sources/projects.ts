import fs from "node:fs";
import path from "node:path";
import { assertSourceDirExists, paths } from "../config";
import { tryDynamicImport } from "../lib/dynamicImport";
import { normalizeSlug } from "../lib/slug";
import { deriveExcerpt, truncate } from "../lib/text";
import { isIntrawebSlug } from "../lib/siteAssignment";
import type { ProjectPlan, SiteKey, SourceCounts } from "../types";

/** Mirrors `apps/personal-site/apps/site/data/projects/types.ts` (kept
 * loosely typed here — this tool must not depend on the frontend package). */
interface RawProjectMeta {
  id: string;
  title: string;
  slug: string;
  description: string;
  image?: string;
  tags?: string[];
  liveUrl?: string;
  caseStudyUrl?: string;
  githubUrl?: string;
  documentationUrl?: string;
  featured?: boolean;
  status?: "completed" | "in-progress" | "planned" | "archived";
  startDate?: string;
  endDate?: string;
  technologies?: string[];
  category?: string;
  client?: string;
  industry?: string;
  teamSize?: string;
  duration?: string;
}

const STATUS_MAP: Record<string, ProjectPlan["status"]> = {
  completed: "completed",
  "in-progress": "active",
  planned: "planned",
  archived: "archived",
};

const SKIP_FILES = new Set(["index.ts", "types.ts"]);

function isProjectMeta(value: unknown): value is RawProjectMeta {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as RawProjectMeta).slug === "string" &&
    typeof (value as RawProjectMeta).title === "string"
  );
}

/** Regex fallback used only if dynamic `import()` fails on a given file
 * (e.g. a syntax variant tsx can't parse). Best-effort single-object scrape. */
function regexExtractProject(source: string): RawProjectMeta | undefined {
  const field = (name: string) => {
    const m = source.match(new RegExp(`${name}:\\s*'([^']*)'`)) || source.match(new RegExp(`${name}:\\s*"([^"]*)"`));
    return m?.[1];
  };
  const arrayField = (name: string) => {
    const m = source.match(new RegExp(`${name}:\\s*\\[([^\\]]*)\\]`));
    if (!m) return [] as string[];
    return m[1]
      .split(",")
      .map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
      .filter(Boolean);
  };
  const title = field("title");
  const slug = field("slug");
  if (!title || !slug) return undefined;
  return {
    id: field("id") || slug,
    title,
    slug,
    description: field("description") || "",
    image: field("image"),
    tags: arrayField("tags"),
    liveUrl: field("liveUrl"),
    caseStudyUrl: field("caseStudyUrl"),
    githubUrl: field("githubUrl"),
    documentationUrl: field("documentationUrl"),
    featured: /featured:\s*true/.test(source),
    status: (field("status") as RawProjectMeta["status"]) || "completed",
    startDate: field("startDate"),
    endDate: field("endDate"),
    technologies: arrayField("technologies"),
    category: field("category"),
    client: field("client"),
    industry: field("industry"),
    teamSize: field("teamSize"),
    duration: field("duration"),
  };
}

export async function extractProjects(): Promise<{ plans: ProjectPlan[]; counts: SourceCounts }> {
  const dir = paths.projectsDir;
  const counts: SourceCounts = { filesScanned: 0, itemsExtracted: 0, duplicatesSkipped: 0 };
  if (!assertSourceDirExists("Projects data dir", dir)) return { plans: [], counts };

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".ts") && !SKIP_FILES.has(f))
    .map((f) => path.join(dir, f));
  counts.filesScanned = files.length;

  const plans: ProjectPlan[] = [];
  for (const filePath of files) {
    let raw: RawProjectMeta | undefined;
    let usedFallback = false;

    const mod = await tryDynamicImport(filePath);
    if (mod) {
      raw = Object.values(mod).find(isProjectMeta) as RawProjectMeta | undefined;
    }
    if (!raw) {
      usedFallback = true;
      raw = regexExtractProject(fs.readFileSync(filePath, "utf8"));
    }
    if (!raw) {
      console.warn(`[projects] Could not extract project data from ${filePath}`);
      continue;
    }

    const slug = normalizeSlug(raw.slug || raw.title);
    const sites: SiteKey[] = isIntrawebSlug(slug) ? ["personal", "intraweb"] : ["personal"];
    const reviewFlags: string[] = usedFallback ? ["regex-fallback-partial-extraction"] : [];

    plans.push({
      name: raw.title,
      slug,
      summary: truncate(raw.description || "", 300),
      description: raw.description || deriveExcerpt(raw.description || ""),
      sites,
      projectType: raw.category,
      technologyNames: raw.technologies ?? [],
      repositoryUrl: raw.githubUrl,
      liveUrl: raw.liveUrl,
      documentationUrl: raw.documentationUrl,
      featuredImageUrl: raw.image,
      status: STATUS_MAP[raw.status ?? "completed"] ?? "completed",
      startDate: raw.startDate,
      endDate: raw.endDate,
      featured: Boolean(raw.featured),
      originalSource: "hardcoded-ts",
      sourceFile: filePath,
      reviewFlags,
    });
    counts.itemsExtracted += 1;
  }

  return { plans, counts };
}
