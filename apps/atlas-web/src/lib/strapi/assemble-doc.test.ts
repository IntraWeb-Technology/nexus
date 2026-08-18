import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Article } from "@repo/strapi-client";
import { assembleDocsIndex } from "./assemble-doc.js";

function docArticle(
  slug: string,
  categoryName: string,
  title: string,
): Article {
  return {
    documentId: `doc-${slug}`,
    slug,
    title,
    excerpt: `${title} excerpt`,
    dek: null,
    dekCompact: null,
    surface: "documentation",
    publishedDate: "2025-01-01",
    updatedDate: "2025-06-01",
    readingTime: "5 min",
    editorialType: null,
    docKind: "guide",
    featured: false,
    categories: [{ documentId: "c1", name: categoryName, slug: categoryName.toLowerCase() }],
    author: null,
    featuredImage: null,
    headerChapter: null,
    headerMeta: [],
    sections: [],
    seo: null,
    contactBridge: null,
    contentFormat: "blocks",
  } as unknown as Article;
}

describe("assembleDocsIndex category hrefs", () => {
  it("derives handbook category links from assembled doc slugs", () => {
    const articles = [
      docArticle("custom-architecture-slug", "Architecture", "Custom Architecture"),
      docArticle("design-tokens-v2", "Design System", "Design Tokens"),
      docArticle("frontend-notes", "Frontend", "Frontend Notes"),
      docArticle("testing-playbook", "Testing", "Testing Playbook"),
      docArticle("editorial-guide", "Publishing", "Editorial Guide"),
    ];

    const index = assembleDocsIndex(articles);
    const handbookItems = index.categories.items.filter((item) =>
      ["architecture", "design-system", "frontend", "testing", "publishing"].includes(
        item.id,
      ),
    );

    assert.deepEqual(
      handbookItems.map((item) => item.href),
      [
        "/docs/custom-architecture-slug",
        "/docs/design-tokens-v2",
        "/docs/frontend-notes",
        "/docs/testing-playbook",
        "/docs/editorial-guide",
      ],
    );
  });

  it("omits handbook categories with no matching documentation records", () => {
    const index = assembleDocsIndex([
      docArticle("only-architecture", "Architecture", "Only Architecture"),
    ]);

    const handbookIds = index.categories.items
      .filter((item) => item.id !== "articles" && item.id !== "work" && item.id !== "recent")
      .map((item) => item.id);

    assert.deepEqual(handbookIds, ["architecture"]);
    assert.equal(index.categories.items.find((i) => i.id === "architecture")?.href, "/docs/only-architecture");
  });
});
