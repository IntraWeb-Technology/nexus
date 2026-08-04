import fs from "node:fs";
import { paths } from "../config";
import { tryDynamicImport } from "../lib/dynamicImport";
import type { FaqPlan, SourceCounts } from "../types";

interface RawFaqItem {
  q: string;
  a: string;
}

/** Regex fallback if dynamic import of `geo-faq.ts` fails for any reason. */
function regexExtractFaq(source: string): RawFaqItem[] {
  const items: RawFaqItem[] = [];
  const blockRegex = /\{\s*q:\s*"([^"]*)"\s*,\s*a:\s*"([^"]*)"\s*,?\s*\}/gs;
  for (const match of source.matchAll(blockRegex)) {
    items.push({ q: match[1], a: match[2] });
  }
  return items;
}

export async function extractIntrawebFaq(): Promise<{ plans: FaqPlan[]; counts: SourceCounts }> {
  const filePath = paths.intrawebFaqFile;
  const counts: SourceCounts = { filesScanned: 0, itemsExtracted: 0, duplicatesSkipped: 0 };
  if (!fs.existsSync(filePath)) {
    console.warn(`[intrawebFaq] not found at: ${filePath} (skipping)`);
    return { plans: [], counts };
  }
  counts.filesScanned = 1;

  let items: RawFaqItem[] = [];
  const mod = await tryDynamicImport(filePath);
  const candidate = mod?.geoFaqItems as RawFaqItem[] | undefined;
  if (Array.isArray(candidate) && candidate.length) {
    items = candidate;
  } else {
    items = regexExtractFaq(fs.readFileSync(filePath, "utf8"));
  }

  const plans: FaqPlan[] = items.map((item, index) => ({
    question: item.q,
    answer: item.a,
    sites: ["intraweb"],
    sortOrder: index,
    sourceFile: filePath,
  }));
  counts.itemsExtracted = plans.length;

  return { plans, counts };
}
