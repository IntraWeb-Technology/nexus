import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { paths } from "./config";
import {
  validateAtlasFixtureContract,
  validateAtlasFixtures,
  type ExpectedIdentity,
  type FixtureContractInput,
} from "./validate";

function loadContract(): ExpectedIdentity {
  return JSON.parse(fs.readFileSync(path.join(paths.expectedDir, "identity.json"), "utf8")) as ExpectedIdentity;
}

function makeFixtures(
  overrides: Partial<{
    gallery: Array<{ id?: string; slug: string; href?: string; mediaSrc?: string; mediaLabel?: string }>;
    selected: Array<{ id?: string; slug: string; mediaSrc?: string; mediaLabel?: string }>;
    featuredHref: string;
    homeSelected: Array<{ id: string; href?: string; mediaSrc?: string; mediaAlt?: string }>;
    caseStudyBySlug: Record<string, unknown>;
    articleSummaries: Array<{ slug: string }>;
    docSummaries: Array<{ slug: string }>;
  }> = {},
): FixtureContractInput {
  const contract = loadContract();
  return {
    workFixture: {
      featured: { cta: { href: overrides.featuredHref ?? `/work/${contract.workFeaturedSlug}` } },
      selected: { projects: overrides.selected ?? [] },
      gallery: {
        projects:
          overrides.gallery ??
          contract.workGallerySlugs.map((slug) => ({
            id: slug,
            slug,
            ...(slug === "atlas" || slug === "portfolio-os"
              ? { href: `/work/${contract.workFeaturedSlug}` }
              : {}),
          })),
      },
    },
    homepageFixture: {
      selected: {
        projects:
          overrides.homeSelected ??
          contract.homeSelectedIds.map((id) => ({
            id,
            href: id === contract.workFeaturedSlug ? `/work/${id}` : "/work",
          })),
      },
    },
    caseStudyBySlug: overrides.caseStudyBySlug ?? { "portfolio-os": {} },
    articleSummaries:
      overrides.articleSummaries ?? contract.writingArticleSlugs.map((slug) => ({ slug })),
    docSummaries: overrides.docSummaries ?? contract.documentationSlugs.map((slug) => ({ slug })),
  };
}

describe("Atlas Story-First fixture contract", () => {
  it("passes approved Story-First fixtures against the independent identity contract", async () => {
    const result = await validateAtlasFixtures();
    assert.equal(result.ok, true, result.errors.join("\n"));
    assert.deepEqual(result.errors, []);
  });

  it("passes isolated fixtures that match identity.json without requiring Home === Work selected", () => {
    const result = validateAtlasFixtureContract(loadContract(), makeFixtures());
    assert.equal(result.ok, true, result.errors.join("\n"));
  });

  it("fails when a Story-First gallery identity is missing", () => {
    const contract = loadContract();
    const result = validateAtlasFixtureContract(
      contract,
      makeFixtures({
        gallery: contract.workGallerySlugs.slice(1).map((slug) => ({ id: slug, slug })),
      }),
    );
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some((error) => error.includes("Work gallery slugs mismatch")),
      result.errors.join("\n"),
    );
  });

  it("fails when Work gallery is empty instead of treating empty as success", () => {
    const result = validateAtlasFixtureContract(loadContract(), makeFixtures({ gallery: [] }));
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some((error) => error.includes("Work gallery slugs is empty")),
      result.errors.join("\n"),
    );
  });

  it("fails when Home selected is empty instead of treating empty as success", () => {
    const result = validateAtlasFixtureContract(loadContract(), makeFixtures({ homeSelected: [] }));
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some((error) => error.includes("Home selected ids is empty")),
      result.errors.join("\n"),
    );
  });

  it("fails an unexpected Home selected identity", () => {
    const contract = loadContract();
    const result = validateAtlasFixtureContract(
      contract,
      makeFixtures({
        homeSelected: [...contract.homeSelectedIds.slice(0, 2), "not-a-project"].map((id) => ({
          id,
          href: "/work",
        })),
      }),
    );
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some((error) => error.includes("Home selected ids mismatch")),
      result.errors.join("\n"),
    );
  });

  it("fails a Work gallery href that is not an implemented case study", () => {
    const contract = loadContract();
    const result = validateAtlasFixtureContract(
      contract,
      makeFixtures({
        gallery: contract.workGallerySlugs.map((slug) => ({
          id: slug,
          slug,
          href: slug === "intraweb-portal" ? "/work/intraweb-portal" : undefined,
        })),
      }),
    );
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some((error) =>
        error.includes('Work gallery "intraweb-portal" href /work/intraweb-portal is not an implemented case study'),
      ),
      result.errors.join("\n"),
    );
  });

  it("fails A-05 when vehicle-maintenance is present with media", () => {
    const result = validateAtlasFixtureContract(
      loadContract(),
      makeFixtures({
        selected: [
          {
            id: "vehicle-maintenance",
            slug: "vehicle-maintenance",
            mediaSrc: "/images/work/vehicle-maintenance.svg",
            mediaLabel: "fabricated",
          },
        ],
      }),
    );
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some((error) => error.includes("A-05 violation") && error.includes("Work selected list")),
      result.errors.join("\n"),
    );
  });

  it("does not require vehicle-maintenance in Story-First gallery or Work selected", () => {
    const result = validateAtlasFixtureContract(loadContract(), makeFixtures({ selected: [] }));
    assert.equal(result.ok, true, result.errors.join("\n"));
    assert.equal(
      result.errors.some((error) => error.includes("vehicle-maintenance project missing")),
      false,
    );
  });

  it("still rejects an unknown slug in the legacy Work selected list", () => {
    const result = validateAtlasFixtureContract(
      loadContract(),
      makeFixtures({
        selected: [{ id: "made-up", slug: "made-up" }],
      }),
    );
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some((error) => error.includes("Unexpected project slug in Work selected list: made-up")),
      result.errors.join("\n"),
    );
  });

  it("still fails a missing case study identity", () => {
    const result = validateAtlasFixtureContract(
      loadContract(),
      makeFixtures({ caseStudyBySlug: {} }),
    );
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((error) => error.includes("Missing expected case study slug: portfolio-os")));
    assert.ok(result.errors.some((error) => error.includes("Expected case study slug portfolio-os")));
  });

  it("still fails a writing-article identity mismatch", () => {
    const contract = loadContract();
    const result = validateAtlasFixtureContract(
      contract,
      makeFixtures({
        articleSummaries: contract.writingArticleSlugs.slice(0, 5).map((slug) => ({ slug })),
      }),
    );
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((error) => error.includes("Expected 6 writing article slugs, found 5")));
    assert.ok(result.errors.some((error) => error.includes("Writing article slug mismatch")));
  });

  it("still fails a documentation identity mismatch", () => {
    const contract = loadContract();
    const result = validateAtlasFixtureContract(
      contract,
      makeFixtures({
        docSummaries: contract.documentationSlugs.slice(0, 4).map((slug) => ({ slug })),
      }),
    );
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((error) => error.includes("Expected 5 documentation slugs, found 4")));
    assert.ok(result.errors.some((error) => error.includes("Documentation slug mismatch")));
  });

  it("fails when the independent gallery contract is emptied", () => {
    const emptied = { ...loadContract(), workGallerySlugs: [] };
    const result = validateAtlasFixtureContract(emptied, makeFixtures());
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some((error) => error.includes("identity.json workGallerySlugs must be a non-empty string array")),
      result.errors.join("\n"),
    );
  });
});
