import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isStrapiRequired,
  resolveContentSource,
  usesStrapiFor,
} from "./source.js";

describe("resolveContentSource", () => {
  it("respects explicit ATLAS_CONTENT_SOURCE=fixture", () => {
    assert.equal(
      resolveContentSource({ ATLAS_CONTENT_SOURCE: "fixture" }),
      "fixture",
    );
  });

  it("respects explicit ATLAS_CONTENT_SOURCE=strapi", () => {
    assert.equal(
      resolveContentSource({ ATLAS_CONTENT_SOURCE: "strapi" }),
      "strapi",
    );
  });

  it("defaults to strapi when STRAPI_URL is set", () => {
    assert.equal(
      resolveContentSource({ STRAPI_URL: "http://localhost:1337" }),
      "strapi",
    );
  });

  it("defaults to strapi when STRAPI_API_URL is set", () => {
    assert.equal(
      resolveContentSource({ STRAPI_API_URL: "http://localhost:1337/api" }),
      "strapi",
    );
  });

  it("defaults to fixture when no env hints", () => {
    assert.equal(resolveContentSource({}), "fixture");
  });
});

describe("isStrapiRequired", () => {
  it("is true only when source resolves to strapi", () => {
    assert.equal(isStrapiRequired({ ATLAS_CONTENT_SOURCE: "strapi" }), true);
    assert.equal(isStrapiRequired({ ATLAS_CONTENT_SOURCE: "fixture" }), false);
    assert.equal(isStrapiRequired({}), false);
  });
});

describe("usesStrapiFor", () => {
  it("never uses Strapi for static core pages", () => {
    assert.equal(
      usesStrapiFor("static", { ATLAS_CONTENT_SOURCE: "strapi" }),
      false,
    );
    assert.equal(
      usesStrapiFor("static", { STRAPI_URL: "http://localhost:1337" }),
      false,
    );
    assert.equal(usesStrapiFor("static", {}), false);
  });

  it("uses Strapi for cms family only when source is strapi", () => {
    assert.equal(
      usesStrapiFor("cms", { ATLAS_CONTENT_SOURCE: "strapi" }),
      true,
    );
    assert.equal(
      usesStrapiFor("cms", { ATLAS_CONTENT_SOURCE: "fixture" }),
      false,
    );
    assert.equal(usesStrapiFor("cms", {}), false);
  });
});
