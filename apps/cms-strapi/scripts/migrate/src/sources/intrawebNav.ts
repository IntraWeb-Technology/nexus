import fs from "node:fs";
import { paths } from "../config";
import { tryDynamicImport } from "../lib/dynamicImport";
import type { NavPlan, SourceCounts } from "../types";

interface RawNavLink {
  label: string;
  href: string;
}

function regexExtractNavLinks(source: string): RawNavLink[] {
  const links: RawNavLink[] = [];
  const blockRegex = /\{\s*label:\s*"([^"]*)"\s*,\s*href:\s*"([^"]*)"\s*,?\s*\}/g;
  for (const match of source.matchAll(blockRegex)) {
    links.push({ label: match[1], href: match[2] });
  }
  return links;
}

export async function extractIntrawebNav(): Promise<{ plans: NavPlan[]; counts: SourceCounts }> {
  const filePath = paths.intrawebNavFile;
  const counts: SourceCounts = { filesScanned: 0, itemsExtracted: 0, duplicatesSkipped: 0 };
  if (!fs.existsSync(filePath)) {
    console.warn(`[intrawebNav] not found at: ${filePath} (skipping)`);
    return { plans: [], counts };
  }
  counts.filesScanned = 1;

  let links: RawNavLink[] = [];
  const mod = await tryDynamicImport(filePath);
  const candidate = mod?.navLinks as RawNavLink[] | undefined;
  if (Array.isArray(candidate) && candidate.length) {
    links = candidate;
  } else {
    links = regexExtractNavLinks(fs.readFileSync(filePath, "utf8"));
  }

  if (!links.length) return { plans: [], counts };

  const plan: NavPlan = {
    name: "IntraWeb Primary Navigation",
    siteKey: "intraweb",
    location: "header",
    items: links.map((l) => ({ label: l.label, href: l.href })),
    sourceFile: filePath,
  };
  counts.itemsExtracted = 1;

  return { plans: [plan], counts };
}
