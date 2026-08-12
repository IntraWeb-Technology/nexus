import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isStrapiRequired,
  resolveContentSource,
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
