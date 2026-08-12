import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createStrapiClient } from "./client.js";
import { StrapiHttpError, StrapiTimeoutError, StrapiValidationError } from "./errors.js";

describe("createStrapiClient integration (mocked fetch)", () => {
  it("returns null for missing article by slug", async () => {
    const client = createStrapiClient({
      baseUrl: "https://cms.example.com",
      token: "test-token",
      fetch: async () =>
        new Response(
          JSON.stringify({
            data: [],
            meta: {
              pagination: {
                page: 1,
                pageSize: 1,
                pageCount: 0,
                total: 0,
              },
            },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
    });

    const article = await client.getArticleBySlug("personal", "missing-slug");
    assert.equal(article, null);
  });

  it("throws StrapiValidationError on invalid response shape", async () => {
    const client = createStrapiClient({
      baseUrl: "https://cms.example.com",
      token: "test-token",
      fetch: async () =>
        new Response(JSON.stringify({ unexpected: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    });

    await assert.rejects(
      () => client.getArticles("personal"),
      (error: unknown) => {
        assert.ok(error instanceof StrapiValidationError);
        assert.equal(error.code, "VALIDATION");
        return true;
      },
    );
  });

  it("sends Authorization Bearer header and site filter", async () => {
    let seenUrl = "";
    let seenAuth = "";

    const client = createStrapiClient({
      baseUrl: "https://cms.example.com/",
      token: "secret-token",
      fetch: async (input, init) => {
        seenUrl = String(input);
        const headers = init?.headers as Record<string, string> | undefined;
        seenAuth = String(headers?.Authorization ?? "");
        return new Response(
          JSON.stringify({
            data: [
              {
                documentId: "a1",
                title: "Hello",
                slug: "hello",
                surface: "writing",
                sites: [{ key: "personal", name: "Personal" }],
              },
            ],
            meta: {
              pagination: {
                page: 1,
                pageSize: 25,
                pageCount: 1,
                total: 1,
              },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    });

    const result = await client.getArticles("personal", {
      filters: { surface: { $eq: "writing" } },
    });
    assert.equal(seenAuth, "Bearer secret-token");
    assert.match(seenUrl, /^https:\/\/cms\.example\.com\/api\/articles\?/);
    assert.match(seenUrl, /personal/);
    assert.match(seenUrl, /surface/);
    assert.equal(result.items.length, 1);
    assert.equal(result.items[0]?.slug, "hello");
    assert.equal(result.items[0]?.surface, "writing");
  });

  it("throws StrapiHttpError on a non-2xx response", async () => {
    const client = createStrapiClient({
      baseUrl: "https://cms.example.com",
      token: "test-token",
      fetch: async () =>
        new Response(JSON.stringify({ error: { message: "Forbidden" } }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }),
    });

    await assert.rejects(
      () => client.getArticleBySlug("personal", "any-slug"),
      (error: unknown) => {
        assert.ok(error instanceof StrapiHttpError);
        assert.equal(error.code, "HTTP_ERROR");
        assert.equal(error.status, 403);
        return true;
      },
    );
  });

  it("throws StrapiTimeoutError when the request exceeds the timeout", async () => {
    const client = createStrapiClient({
      baseUrl: "https://cms.example.com",
      token: "test-token",
      fetch: (_input, init) =>
        new Promise((_resolve, reject) => {
          const signal = init?.signal as AbortSignal | undefined;
          signal?.addEventListener("abort", () => {
            const abortError = new Error("This operation was aborted");
            abortError.name = "AbortError";
            reject(abortError);
          });
        }),
    });

    await assert.rejects(
      () => client.getArticleBySlug("personal", "any-slug", { timeoutMs: 20 }),
      (error: unknown) => {
        assert.ok(error instanceof StrapiTimeoutError);
        assert.equal(error.code, "TIMEOUT");
        assert.equal(error.timeoutMs, 20);
        return true;
      },
    );
  });
});
