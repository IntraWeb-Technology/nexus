import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  API_PATHS,
  POPULATE,
  buildQueryString,
  listQueryFromOptions,
  mergeFilters,
  siteFilter,
  sitesFilter,
  statusFromPreview,
} from "./query.js";

describe("site filter query building", () => {
  it("builds single-site deep filter for site.key.$eq", () => {
    const filters = siteFilter("personal");
    assert.deepEqual(filters, {
      site: { key: { $eq: "personal" } },
    });

    const qs = buildQueryString({ filters });
    assert.equal(qs, "filters[site][key][$eq]=personal");
  });

  it("builds many-site deep filter for sites.key.$eq", () => {
    const filters = sitesFilter("intraweb");
    assert.deepEqual(filters, {
      sites: { key: { $eq: "intraweb" } },
    });

    const qs = buildQueryString({
      filters,
      populate: { featuredImage: true },
      pagination: { page: 1, pageSize: 10 },
      sort: ["publishedDate:desc"],
      status: "published",
    });

    assert.match(qs, /sites/);
    assert.match(qs, /intraweb/);
    assert.match(qs, /pagination\[pageSize\]=10/);
    assert.match(qs, /status=published/);
    assert.match(qs, /publishedDate/);
  });

  it("merges site + slug filters with $and", () => {
    const filters = mergeFilters(sitesFilter("personal"), {
      slug: { $eq: "hello-world" },
    });
    assert.deepEqual(filters, {
      $and: [
        { sites: { key: { $eq: "personal" } } },
        { slug: { $eq: "hello-world" } },
      ],
    });
  });

  it("maps preview flag to draft status", () => {
    assert.equal(statusFromPreview(true), "draft");
    assert.equal(statusFromPreview(false), "published");
    assert.equal(statusFromPreview(undefined), "published");
  });

  it("includes Atlas singleton API paths", () => {
    assert.equal(API_PATHS.homePages, "/api/home-pages");
    assert.equal(API_PATHS.aboutPages, "/api/about-pages");
    assert.equal(API_PATHS.workPages, "/api/work-pages");
    assert.equal(API_PATHS.contactPages, "/api/contact-pages");
    assert.ok(POPULATE.homePage.selected);
    assert.ok(POPULATE.article.sections);
    assert.ok(POPULATE.project.cardMedia);
    assert.ok(POPULATE.caseStudy.figureSlots);
  });

  it("merges surface filter for articles via options.filters", () => {
    const qs = listQueryFromOptions(
      sitesFilter("personal"),
      { filters: { surface: { $eq: "writing" } } },
      POPULATE.article,
    );
    assert.match(qs, /surface/);
    assert.match(qs, /writing/);
    assert.match(qs, /personal/);
  });
});
