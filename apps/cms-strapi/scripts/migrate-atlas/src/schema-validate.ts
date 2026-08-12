import fs from "node:fs";
import path from "node:path";
import { paths } from "./config";

type SchemaJson = {
  attributes?: Record<
    string,
    {
      type?: string;
      enum?: string[];
      component?: string;
      target?: string;
      relation?: string;
      required?: boolean;
    }
  >;
};

function readSchema(relativePath: string): SchemaJson {
  const filePath = path.join(paths.schemasRoot, relativePath);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Schema file missing: ${relativePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as SchemaJson;
}

function assertEnum(
  errors: string[],
  label: string,
  actual: string[] | undefined,
  allowed: string[],
  forbidden: string[] = [],
): void {
  if (!actual) {
    errors.push(`${label}: enum attribute missing`);
    return;
  }
  for (const value of allowed) {
    if (!actual.includes(value)) {
      errors.push(`${label}: enum missing value "${value}"`);
    }
  }
  for (const value of forbidden) {
    if (actual.includes(value)) {
      errors.push(`${label}: forbidden enum value "${value}"`);
    }
  }
}

export type SchemaValidationResult = {
  ok: boolean;
  errors: string[];
};

export function validateAtlasSchemas(): SchemaValidationResult {
  const errors: string[] = [];

  const publishingMedia = readSchema("components/publishing/media.json");
  assertEnum(
    errors,
    "publishing.media.evidenceClass",
    publishingMedia.attributes?.evidenceClass?.enum,
    ["production", "composed"],
    ["deferred"],
  );

  const article = readSchema("api/article/content-types/article/schema.json");
  if (!article.attributes?.surface) {
    errors.push("article schema missing surface attribute");
  } else {
    assertEnum(
      errors,
      "article.surface",
      article.attributes.surface.enum,
      ["writing", "documentation"],
    );
  }

  for (const [uid, relPath] of [
    ["home-page", "api/home-page/content-types/home-page/schema.json"],
    ["about-page", "api/about-page/content-types/about-page/schema.json"],
    ["work-page", "api/work-page/content-types/work-page/schema.json"],
    ["contact-page", "api/contact-page/content-types/contact-page/schema.json"],
  ] as const) {
    const schema = readSchema(relPath);
    const site = schema.attributes?.site;
    if (!site) {
      errors.push(`${uid} schema missing site relation`);
    } else if (site.type !== "relation" || site.target !== "api::site.site") {
      errors.push(`${uid}.site must be relation → api::site.site`);
    }
  }

  const caseStudy = readSchema("api/case-study/content-types/case-study/schema.json");
  for (const field of ["challenge", "solution", "results"] as const) {
    if (!caseStudy.attributes?.[field]) {
      errors.push(`case-study schema missing legacy field: ${field}`);
    }
  }

  const project = readSchema("api/project/content-types/project/schema.json");
  const cardMedia = project.attributes?.cardMedia;
  if (!cardMedia) {
    errors.push("project schema missing cardMedia component");
  } else if (cardMedia.component !== "publishing.media") {
    errors.push(`project.cardMedia must use publishing.media, got ${cardMedia.component}`);
  }

  return { ok: errors.length === 0, errors };
}

export function printSchemaValidationResult(result: SchemaValidationResult): number {
  if (result.ok) {
    console.log("✓ Atlas CMS schema validation passed");
    return 0;
  }
  console.error(`✗ Atlas CMS schema validation failed (${result.errors.length} issue(s)):`);
  for (const error of result.errors) {
    console.error(`  - ${error}`);
  }
  return 1;
}
