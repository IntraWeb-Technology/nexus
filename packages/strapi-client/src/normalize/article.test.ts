import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shapeArticle } from "./index.js";

describe("shapeArticle", () => {
  it("normalizes a Strapi 5 flat article document", () => {
    const raw = {
      id: 12,
      documentId: "art_doc_1",
      title: "Shipping multi-site content",
      slug: "shipping-multi-site-content",
      excerpt: "How we share articles across sites.",
      body: "## Hello\n\nBody",
      contentFormat: "markdown",
      publishedDate: "2026-08-01T12:00:00.000Z",
      updatedDate: "2026-08-02T12:00:00.000Z",
      hashnodeId: "cuid123",
      featured: true,
      featuredImage: {
        documentId: "media_1",
        url: "/uploads/cover.png",
        alternativeText: "Cover",
        width: 1200,
        height: 630,
        mime: "image/png",
        name: "cover.png",
      },
      author: {
        documentId: "author_1",
        name: "John Schibelli",
        slug: "john-schibelli",
        biography: "Engineer",
        avatar: {
          url: "https://cdn.example.com/avatar.jpg",
          alternativeText: null,
        },
      },
      categories: [
        { documentId: "cat_1", name: "Engineering", slug: "engineering" },
      ],
      tags: [{ documentId: "tag_1", name: "Strapi", slug: "strapi" }],
      sites: [
        { documentId: "site_1", key: "personal", name: "Personal" },
        { documentId: "site_2", key: "intraweb", name: "IntraWeb" },
      ],
      seo: {
        metaTitle: "SEO title",
        metaDescription: "SEO description",
        noIndex: false,
      },
    };

    const article = shapeArticle(raw, "personal", {
      mediaBaseUrl: "https://cms.example.com",
    });

    assert.ok(article);
    assert.equal(article.documentId, "art_doc_1");
    assert.equal(article.title, "Shipping multi-site content");
    assert.equal(article.slug, "shipping-multi-site-content");
    assert.equal(article.excerpt, "How we share articles across sites.");
    assert.deepEqual(article.siteKeys, ["personal", "intraweb"]);
    assert.equal(
      article.featuredImage?.url,
      "https://cms.example.com/uploads/cover.png",
    );
    assert.equal(article.author?.name, "John Schibelli");
    assert.equal(article.categories[0]?.slug, "engineering");
    assert.equal(article.tags[0]?.slug, "strapi");
    assert.equal(article.seo?.metaTitle, "SEO title");
    assert.equal(article.hashnodeId, "cuid123");
    assert.equal(article.featured, true);
  });

  it("supports v4-style attributes wrapper", () => {
    const raw = {
      id: 1,
      attributes: {
        title: "Wrapped",
        slug: "wrapped",
        sites: {
          data: [{ attributes: { key: "intraweb", name: "IntraWeb" } }],
        },
      },
    };

    const article = shapeArticle(raw, "intraweb");
    assert.ok(article);
    assert.equal(article.slug, "wrapped");
    assert.deepEqual(article.siteKeys, ["intraweb"]);
  });

  it("returns null when required fields are missing", () => {
    assert.equal(shapeArticle({ documentId: "x" }), null);
    assert.equal(shapeArticle({ title: "Only title" }), null);
  });
});
