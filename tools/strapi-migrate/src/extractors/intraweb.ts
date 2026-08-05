import fs from "node:fs";
import path from "node:path";
import { normalizeSlug } from "../normalize.js";
import type { NormalizedRecord, ReviewItem } from "../types.js";

export interface IntrawebExtractResult {
  records: NormalizedRecord[];
  reviewQueue: ReviewItem[];
  navCount: number;
  faqCount: number;
  servicesExtracted: number;
  servicesReviewQueued: number;
}

/** Extract FAQ { q, a } pairs without JSON.parse (handles apostrophes in answers). */
function extractFaqPairs(src: string): Array<{ q: string; a: string }> {
  const block = src.match(
    /export\s+const\s+geoFaqItems\s*=\s*\[([\s\S]*?)\]\s*as\s+const/,
  );
  if (!block) return [];
  const pairs: Array<{ q: string; a: string }> = [];
  const re =
    /\{\s*q:\s*"((?:\\.|[^"\\])*)"\s*,\s*a:\s*"((?:\\.|[^"\\])*)"\s*,?\s*\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(block[1])) !== null) {
    pairs.push({
      q: m[1].replace(/\\"/g, '"'),
      a: m[2].replace(/\\"/g, '"'),
    });
  }
  return pairs;
}

function extractNavLinks(siteTs: string, sourcePath: string): NormalizedRecord[] {
  const block = siteTs.match(
    /export\s+const\s+navLinks\s*=\s*\[([\s\S]*?)\]\s*as\s+const/,
  );
  if (!block) return [];

  const items: Array<{ label: string; href: string }> = [];
  const re =
    /\{\s*label:\s*"((?:\\.|[^"\\])*)"\s*,\s*href:\s*"((?:\\.|[^"\\])*)"\s*,?\s*\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(block[1])) !== null) {
    items.push({
      label: m[1].replace(/\\"/g, '"'),
      href: m[2].replace(/\\"/g, '"'),
    });
  }
  if (!items.length) return [];

  return [
    {
      type: "navigation",
      upsertKey: "navigation:intraweb:header",
      slug: "header",
      title: "IntraWeb Header Navigation",
      siteKeys: ["intraweb"],
      sourcePath,
      sourceKind: "iw-nav",
      payload: {
        location: "header",
        items,
        contactEmail: undefined as string | undefined,
      },
    },
  ];
}

function extractFaqs(
  faqTs: string,
  sourcePath: string,
): NormalizedRecord[] {
  const items = extractFaqPairs(faqTs);
  if (!items.length) return [];

  return items.map((item, index) => {
    const question = item.q || `faq-${index + 1}`;
    const slug = normalizeSlug(question).slice(0, 80) || `faq-${index + 1}`;
    return {
      type: "faq-item" as const,
      upsertKey: `faq-item:intraweb:${slug}`,
      slug,
      title: question,
      siteKeys: ["intraweb" as const],
      body: item.a,
      sourcePath,
      sourceKind: "iw-faq" as const,
      payload: {
        question,
        answer: item.a,
        sortOrder: index,
      },
    };
  });
}

/**
 * Extract reliably parseable service structures from services-content.tsx.
 * Pricing tiers / complex JSX-only content goes to the review queue.
 */
function extractStringProp(block: string, key: string): string | undefined {
  const m = block.match(
    new RegExp(`${key}\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`),
  );
  return m ? m[1].replace(/\\"/g, '"') : undefined;
}

function extractStringArrayProp(block: string, key: string): string[] | undefined {
  const m = block.match(new RegExp(`${key}\\s*:\\s*\\[([\\s\\S]*?)\\]`));
  if (!m) return undefined;
  return [...m[1].matchAll(/"((?:\\.|[^"\\])*)"/g)].map((x) =>
    x[1].replace(/\\"/g, '"'),
  );
}

function extractServices(
  servicesTsx: string,
  sourcePath: string,
): { records: NormalizedRecord[]; review: ReviewItem[] } {
  const records: NormalizedRecord[] = [];
  const review: ReviewItem[] = [];

  // websiteProductCards — extract object blocks without JSON.parse
  const cardsMatch = servicesTsx.match(
    /const websiteProductCards\s*=\s*\[([\s\S]*?)\]\s*as const/,
  );
  if (cardsMatch) {
    const objBlocks = cardsMatch[1].match(/\{[\s\S]*?\n\s*\}/g) ?? [];
    for (const block of objBlocks) {
      const id = extractStringProp(block, "id");
      const name = extractStringProp(block, "name");
      const tagline = extractStringProp(block, "tagline");
      const pages = extractStringProp(block, "pages");
      const pagesNote = extractStringProp(block, "pagesNote");
      const highlights = extractStringArrayProp(block, "highlights");
      const slug = normalizeSlug(String(id ?? name ?? ""));
      if (!slug) continue;
      records.push({
        type: "service",
        upsertKey: `service:intraweb:${slug}`,
        slug,
        title: String(name ?? slug),
        siteKeys: ["intraweb"],
        excerpt: tagline,
        sourcePath,
        sourceKind: "iw-service",
        payload: {
          category: "website-package",
          pages,
          pagesNote,
          highlights,
        },
      });
    }
    if (!records.some((r) => r.payload?.category === "website-package")) {
      review.push({
        reason: "services-website-cards-parse-failed",
        sourcePath,
        notes: "Found websiteProductCards but extracted zero packages",
      });
    }
  } else {
    review.push({
      reason: "services-website-cards-not-found",
      sourcePath,
    });
  }

  // Simple string/object arrays that are reliably parseable
  const simpleArrays: Array<{
    name: string;
    category: string;
    shape: "string" | "tb" | "kb";
  }> = [
    { name: "addons", category: "website-addon", shape: "string" },
    { name: "autoEngagements", category: "automation-engagement", shape: "tb" },
    { name: "saasEng", category: "saas-engineering", shape: "tb" },
    { name: "retainers", category: "retainer", shape: "tb" },
    { name: "ecCards", category: "ecommerce-capability", shape: "kb" },
  ];

  for (const spec of simpleArrays) {
    const re = new RegExp(
      `const ${spec.name}\\s*=\\s*\\[([\\s\\S]*?)\\]\\s*;`,
    );
    const m = servicesTsx.match(re);
    if (!m) {
      review.push({
        reason: `services-${spec.name}-not-found`,
        sourcePath,
        notes: "Could not locate array; may need manual extraction",
      });
      continue;
    }

    try {
      if (spec.shape === "string") {
        const items = [...m[1].matchAll(/"((?:\\.|[^"\\])*)"/g)].map((x) =>
          x[1].replace(/\\"/g, '"'),
        );
        for (const name of items) {
          const slug = normalizeSlug(name);
          records.push({
            type: "service",
            upsertKey: `service:intraweb:${spec.category}:${slug}`,
            slug: `${spec.category}-${slug}`,
            title: name,
            siteKeys: ["intraweb"],
            sourcePath,
            sourceKind: "iw-service",
            payload: { category: spec.category },
          });
        }
      } else {
        const titleKey = spec.shape === "tb" ? "t" : "k";
        const objBlocks = m[1].match(/\{[\s\S]*?\}/g) ?? [];
        for (const block of objBlocks) {
          const title = extractStringProp(block, titleKey) ?? "";
          const body = extractStringProp(block, "b") ?? "";
          const slug = normalizeSlug(title);
          if (!slug) continue;
          records.push({
            type: "service",
            upsertKey: `service:intraweb:${spec.category}:${slug}`,
            slug: `${spec.category}-${slug}`,
            title,
            siteKeys: ["intraweb"],
            excerpt: body,
            body,
            sourcePath,
            sourceKind: "iw-service",
            payload: { category: spec.category, raw: { [titleKey]: title, b: body } },
          });
        }
      }
    } catch (err) {
      review.push({
        reason: `services-${spec.name}-parse-failed`,
        sourcePath,
        notes: String(err),
        data: { snippet: m[1].slice(0, 400) },
      });
    }
  }

  // Explicitly queue pricing ambiguity — no dollar amounts in source arrays.
  review.push({
    reason: "services-pricing-tiers-need-review",
    type: "service",
    sourcePath,
    suggestedSiteKeys: ["intraweb"],
    notes:
      "Website package tiers (Starter/Growth/Advanced) and retainers have no explicit prices in source. Map to Service + shared.feature after editorial pricing decisions; do not invent prices.",
    data: {
      extractedServiceCount: records.length,
      categories: [
        "website-package",
        "website-addon",
        "automation-engagement",
        "saas-engineering",
        "retainer",
        "ecommerce-capability",
      ],
    },
  });

  return { records, review };
}

export function extractIntraweb(iwSiteRoot: string): IntrawebExtractResult {
  const reviewQueue: ReviewItem[] = [];
  const records: NormalizedRecord[] = [];

  const siteTsPath = path.join(iwSiteRoot, "lib/site.ts");
  const faqTsPath = path.join(iwSiteRoot, "lib/geo-faq.ts");
  const servicesPath = path.join(
    iwSiteRoot,
    "components/pages/services-content.tsx",
  );

  let navCount = 0;
  let faqCount = 0;
  let servicesExtracted = 0;
  let servicesReviewQueued = 0;

  if (fs.existsSync(siteTsPath)) {
    const nav = extractNavLinks(fs.readFileSync(siteTsPath, "utf8"), siteTsPath);
    // Enrich with contact email from same file
    const siteSrc = fs.readFileSync(siteTsPath, "utf8");
    const emailMatch = siteSrc.match(
      /export const contactEmail\s*=\s*["']([^"']+)["']/,
    );
    if (nav[0] && emailMatch) {
      nav[0].payload = { ...nav[0].payload, contactEmail: emailMatch[1] };
    }
    records.push(...nav);
    navCount = nav.length;
  } else {
    reviewQueue.push({ reason: "iw-site-ts-missing", notes: siteTsPath });
  }

  if (fs.existsSync(faqTsPath)) {
    const faqs = extractFaqs(fs.readFileSync(faqTsPath, "utf8"), faqTsPath);
    records.push(...faqs);
    faqCount = faqs.length;
  } else {
    reviewQueue.push({ reason: "iw-geo-faq-missing", notes: faqTsPath });
  }

  if (fs.existsSync(servicesPath)) {
    const { records: services, review } = extractServices(
      fs.readFileSync(servicesPath, "utf8"),
      servicesPath,
    );
    records.push(...services);
    reviewQueue.push(...review);
    servicesExtracted = services.length;
    servicesReviewQueued = review.length;
  } else {
    reviewQueue.push({
      reason: "iw-services-content-missing",
      notes: servicesPath,
    });
  }

  return {
    records,
    reviewQueue,
    navCount,
    faqCount,
    servicesExtracted,
    servicesReviewQueued,
  };
}
