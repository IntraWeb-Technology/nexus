import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { homepageFixture } from "@/content/homepage";
import { workFixture } from "@/content/work";
import { aboutFixture } from "@/content/about";
import { contactFixture } from "@/content/contact";
import {
  getAboutContent,
  getContactContent,
  getHomepageContent,
  getWorkContent,
} from "./index.js";

const ORIGINAL = { ...process.env };

afterEach(() => {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL)) delete process.env[key];
  }
  Object.assign(process.env, ORIGINAL);
});

describe("static core content loaders (Atlas v1)", () => {
  it("returns committed fixtures even when ATLAS_CONTENT_SOURCE=strapi", async () => {
    process.env.ATLAS_CONTENT_SOURCE = "strapi";
    process.env.STRAPI_URL = "http://example.invalid";

    assert.equal(await getHomepageContent(), homepageFixture);
    assert.equal(await getWorkContent(), workFixture);
    assert.equal(await getAboutContent(), aboutFixture);
    assert.equal(await getContactContent(), contactFixture);
  });
});
