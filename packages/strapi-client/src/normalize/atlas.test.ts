import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createStrapiClient } from "../client.js";
import { shapeHomePage, shapeProject } from "../normalize/index.js";

describe("shapeHomePage", () => {
  it("normalizes a populated home-page singleton", () => {
    const raw = {
      documentId: "home_1",
      site: { key: "personal", name: "Personal" },
      writingChapter: "04 · Writing",
      hero: {
        chapter: "01 · Home",
        title: "Atlas rebuild",
        deck: "Editorial portfolio.",
        primaryCta: { label: "View work", href: "/work" },
        secondaryCta: { label: "About", href: "/about" },
      },
      featured: {
        chapter: "02 · Featured",
        title: "Portfolio OS",
        problemLabel: "Problem",
        problem: "Rebuild the portfolio.",
        outcomeLabel: "Outcome",
        outcome: "Shipped Atlas.",
        cta: { label: "Read case study", href: "/work/portfolio-os" },
      },
      featuredProject: {
        documentId: "proj_1",
        name: "Portfolio OS",
        slug: "portfolio-os",
      },
      selected: [
        {
          layout: "feature",
          outcome: "Canonical work identity.",
          project: {
            documentId: "proj_1",
            name: "Portfolio OS",
            slug: "portfolio-os",
          },
        },
      ],
      philosophy: {
        chapter: "03 · Philosophy",
        quote: "Build with intent.",
        stages: ["Discover", "Design", "Deliver"],
        principles: [{ title: "Clarity", body: "Prefer explicit systems." }],
      },
      writingItems: [
        {
          note: "On boundaries",
          article: {
            documentId: "art_1",
            title: "Atlas boundaries",
            slug: "atlas-boundaries",
          },
        },
      ],
      aboutTeaser: {
        chapter: "05 · About",
        title: "About me",
      },
      contactBridge: {
        chapter: "06 · Contact",
        title: "Get in touch",
      },
    };

    const home = shapeHomePage(raw, "personal");
    assert.ok(home);
    assert.equal(home.siteKey, "personal");
    assert.equal(home.featuredProject.slug, "portfolio-os");
    assert.equal(home.selected[0]?.layout, "feature");
    assert.equal(home.writingItems[0]?.article.slug, "atlas-boundaries");
  });
});

describe("shapeProject", () => {
  it("normalizes additive Atlas project fields including absent cardMedia", () => {
    const raw = {
      documentId: "proj_vm",
      name: "Vehicle Maintenance",
      slug: "vehicle-maintenance",
      sortOrder: 4,
      layout: "band",
      category: "Product",
      themes: ["Automation"],
      statusLabel: "In progress",
      sites: [{ key: "personal", name: "Personal" }],
    };

    const project = shapeProject(raw, "personal");
    assert.ok(project);
    assert.equal(project.slug, "vehicle-maintenance");
    assert.equal(project.sortOrder, 4);
    assert.equal(project.layout, "band");
    assert.deepEqual(project.themes, ["Automation"]);
    assert.equal(project.cardMedia, null);
  });
});

describe("createStrapiClient home getter", () => {
  it("requests home-pages with site filter", async () => {
    let seenUrl = "";

    const client = createStrapiClient({
      baseUrl: "https://cms.example.com",
      token: "test-token",
      fetch: async (input) => {
        seenUrl = String(input);
        return new Response(
          JSON.stringify({
            data: [
              {
                documentId: "home_1",
                site: { key: "personal", name: "Personal" },
                writingChapter: "04 · Writing",
                hero: {
                  chapter: "01 · Home",
                  title: "Atlas rebuild",
                  deck: "Editorial portfolio.",
                  primaryCta: { label: "View work", href: "/work" },
                  secondaryCta: { label: "About", href: "/about" },
                },
                featured: {
                  chapter: "02 · Featured",
                  title: "Portfolio OS",
                  problemLabel: "Problem",
                  problem: "Rebuild the portfolio.",
                  outcomeLabel: "Outcome",
                  outcome: "Shipped Atlas.",
                  cta: { label: "Read case study", href: "/work/portfolio-os" },
                },
                featuredProject: {
                  documentId: "proj_1",
                  name: "Portfolio OS",
                  slug: "portfolio-os",
                },
                selected: [
                  {
                    layout: "feature",
                    outcome: "Canonical work identity.",
                    project: {
                      documentId: "proj_1",
                      name: "Portfolio OS",
                      slug: "portfolio-os",
                    },
                  },
                ],
                philosophy: {
                  chapter: "03 · Philosophy",
                  quote: "Build with intent.",
                  stages: ["Discover", "Design", "Deliver"],
                  principles: [{ title: "Clarity", body: "Prefer explicit systems." }],
                },
                writingItems: [
                  {
                    note: "On boundaries",
                    article: {
                      documentId: "art_1",
                      title: "Atlas boundaries",
                      slug: "atlas-boundaries",
                    },
                  },
                ],
                aboutTeaser: {
                  chapter: "05 · About",
                  title: "About me",
                },
                contactBridge: {
                  chapter: "06 · Contact",
                  title: "Get in touch",
                },
              },
            ],
            meta: { pagination: { page: 1, pageSize: 1, pageCount: 1, total: 1 } },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    });

    const home = await client.getHomePage("personal");
    assert.match(seenUrl, /home-pages/);
    assert.match(seenUrl, /personal/);
    assert.ok(home);
    assert.equal(home.featuredProject.slug, "portfolio-os");
  });
});
