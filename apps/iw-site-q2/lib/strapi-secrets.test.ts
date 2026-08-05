import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  extractPreviewSecret,
  extractWebhookSecret,
  safeRedirectPath,
  secretsMatch,
} from "./strapi-secrets";
import {
  parseRevalidatePayload,
  pathsForUid,
  resolveRevalidatePaths,
  shouldRevalidateForSite,
} from "./strapi-revalidate";

describe("secretsMatch", () => {
  it("returns false when expected is missing", () => {
    assert.equal(secretsMatch(undefined, "abc"), false);
    assert.equal(secretsMatch("", "abc"), false);
  });

  it("returns false when provided is missing", () => {
    assert.equal(secretsMatch("abc", null), false);
    assert.equal(secretsMatch("abc", ""), false);
  });

  it("returns false on length mismatch", () => {
    assert.equal(secretsMatch("abc", "ab"), false);
  });

  it("returns true for equal secrets", () => {
    assert.equal(secretsMatch("preview-secret", "preview-secret"), true);
  });

  it("returns false for unequal secrets of same length", () => {
    assert.equal(secretsMatch("preview-secret", "preview-secreX"), false);
  });
});

describe("extractWebhookSecret", () => {
  it("reads x-strapi-webhook-secret", () => {
    const headers = new Headers({ "x-strapi-webhook-secret": "whsec" });
    assert.equal(extractWebhookSecret(headers), "whsec");
  });

  it("reads Bearer Authorization", () => {
    const headers = new Headers({ authorization: "Bearer tok123" });
    assert.equal(extractWebhookSecret(headers), "tok123");
  });
});

describe("extractPreviewSecret", () => {
  it("prefers query secret", () => {
    const params = new URLSearchParams("secret=from-query");
    const headers = new Headers({ "x-strapi-preview-secret": "from-header" });
    assert.equal(extractPreviewSecret(params, headers), "from-query");
  });
});

describe("safeRedirectPath", () => {
  it("allows relative paths", () => {
    assert.equal(safeRedirectPath("/services"), "/services");
  });

  it("rejects open redirects", () => {
    assert.equal(safeRedirectPath("//evil.com"), "/");
    assert.equal(safeRedirectPath("https://evil.com"), "/");
    assert.equal(safeRedirectPath(null), "/");
  });
});

describe("parseRevalidatePayload", () => {
  it("accepts contract-shaped payload", () => {
    const result = parseRevalidatePayload({
      event: "entry.publish",
      uid: "api::article.article",
      entryId: "1",
      siteKeys: ["intraweb"],
      slugs: { article: "hello" },
      paths: ["/blog/hello"],
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.payload.uid, "api::article.article");
      assert.deepEqual(result.payload.paths, ["/blog/hello"]);
    }
  });

  it("rejects missing fields", () => {
    const result = parseRevalidatePayload({ event: "entry.publish" });
    assert.equal(result.ok, false);
  });
});

describe("shouldRevalidateForSite", () => {
  it("matches site key", () => {
    assert.equal(
      shouldRevalidateForSite({
        event: "entry.publish",
        uid: "api::article.article",
        siteKeys: ["intraweb"],
      }),
      true,
    );
  });

  it("skips other site without paths", () => {
    assert.equal(
      shouldRevalidateForSite({
        event: "entry.publish",
        uid: "api::article.article",
        siteKeys: ["personal"],
      }),
      false,
    );
  });

  it("accepts explicit paths even for other siteKeys", () => {
    assert.equal(
      shouldRevalidateForSite({
        event: "entry.publish",
        uid: "api::article.article",
        siteKeys: ["personal"],
        paths: ["/blog"],
      }),
      true,
    );
  });
});

describe("pathsForUid", () => {
  it("maps article slug", () => {
    assert.deepEqual(pathsForUid("api::article.article", { article: "x" }), [
      "/blog",
      "/blog/x",
    ]);
  });

  it("maps service", () => {
    assert.deepEqual(pathsForUid("api::service.service"), ["/services"]);
  });
});

describe("resolveRevalidatePaths", () => {
  it("prefers explicit paths", () => {
    assert.deepEqual(
      resolveRevalidatePaths({
        event: "entry.publish",
        uid: "api::article.article",
        paths: ["/custom"],
      }),
      ["/custom"],
    );
  });
});
