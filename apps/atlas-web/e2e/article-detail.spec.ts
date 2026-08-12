import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const FEATURED = "/articles/why-we-chose-react-server-components";
const STRUCTURED = "/articles/playwright-at-scale";
const SHORT = "/articles/ai-assisted-engineering-workflows";

test.describe("article detail — Why We Chose React Server Components", () => {
  test("renders primary landmarks and publishing primitives", async ({
    page,
  }) => {
    await page.goto(FEATURED);

    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Article contents" }),
    ).toBeVisible();
    await expect(page.locator("#main")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Why We Chose React Server Components",
      }),
    ).toBeVisible();

    for (const id of ["context", "decision", "evidence", "what-followed", "contact"]) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }

    await expect(page.getByText("TRADEOFF")).toBeVisible();
    await expect(page.getByText("TYPESCRIPT")).toBeVisible();
    await expect(page.getByText("YAML")).toBeVisible();
    await expect(page.getByText("TERMINAL")).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Continue in the same register.",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Adjacent articles" }),
    ).toBeVisible();
  });

  test("marks Articles as the current nav item", async ({ page }) => {
    await page.goto(FEATURED);
    await expect(
      page
        .getByRole("navigation", { name: "Primary" })
        .getByRole("link", { name: "Articles" }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("shows DATE / TOPIC / READING / STATUS metadata", async ({ page }) => {
    await page.goto(FEATURED);
    const header = page.locator("header").filter({
      has: page.getByRole("heading", { level: 1 }),
    });
    await expect(header.getByText("DATE")).toBeVisible();
    await expect(header.getByText("TOPIC")).toBeVisible();
    await expect(header.getByText("READING")).toBeVisible();
    await expect(header.getByText("STATUS")).toBeVisible();
    await expect(header.getByText("2025-04-02")).toBeVisible();
    await expect(header.getByText("Architecture")).toBeVisible();
    await expect(header.getByText("14 min")).toBeVisible();
    await expect(header.getByText("Published")).toBeVisible();
  });

  test("TOC anchors scroll to sections", async ({ page }) => {
    await page.goto(FEATURED);
    await page
      .getByRole("navigation", { name: "Article contents" })
      .getByRole("link", { name: /Decision/i })
      .first()
      .click();
    await expect(page.locator("#decision")).toBeInViewport();
  });

  test("reading progress exposes progressbar", async ({ page }) => {
    await page.goto(FEATURED);
    const bar = page.getByRole("progressbar", { name: "Reading progress" });
    await expect(bar).toBeVisible();
    await page.evaluate(() =>
      window.scrollTo(0, document.body.scrollHeight / 2),
    );
    await expect(bar).toHaveAttribute("aria-valuenow", /\d+/);
  });

  test("prev/next and related navigate between articles", async ({ page }) => {
    await page.goto(FEATURED);
    await page
      .getByRole("navigation", { name: "Adjacent articles" })
      .getByRole("link", { name: /Playwright at Scale/i })
      .click();
    await expect(page).toHaveURL(/\/articles\/playwright-at-scale$/);

    await page.goto(FEATURED);
    await page
      .getByRole("link", { name: /Lessons from Building Atlas/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/articles\/lessons-from-building-atlas$/);
  });

  test("contact bridge links to Contact and Work", async ({ page }) => {
    await page.goto(FEATURED);
    await expect(
      page.getByRole("link", { name: "Start a conversation" }),
    ).toHaveAttribute("href", "/contact");
    await expect(
      page.getByRole("link", { name: /browse Work/i }),
    ).toHaveAttribute("href", "/work");
  });

  test("unknown slug returns 404", async ({ page }) => {
    const response = await page.goto("/articles/does-not-exist");
    expect(response?.status()).toBe(404);
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await page.goto(FEATURED);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test("visual regression — full page", async ({ page }, testInfo) => {
    await page.goto(FEATURED);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot(
      `article-detail-${testInfo.project.name}.png`,
      {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      },
    );
  });
});

test.describe("article detail — Playwright at Scale (structured)", () => {
  test("renders table, callout, and evidence primitives", async ({ page }) => {
    await page.goto(STRUCTURED);

    await expect(
      page.getByRole("heading", { level: 1, name: "Playwright at Scale" }),
    ).toBeVisible();

    await expect(page.getByText("NOTE")).toBeVisible();
    await expect(
      page.getByRole("table"),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Layer" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Owns" }),
    ).toBeVisible();
    await expect(page.getByLabel("TEST evidence")).toBeVisible();
    await expect(page.getByText("Passing — 3 viewports")).toBeVisible();
    await expect(page.getByText("TYPESCRIPT")).toBeVisible();
    await expect(page.getByText("TERMINAL")).toBeVisible();
  });

  test("evidence link resolves to Documentation", async ({ page }) => {
    await page.goto(STRUCTURED);
    await expect(
      page.getByRole("link", { name: "Documentation handbook →" }),
    ).toHaveAttribute("href", "/docs");
  });

  test("prev/next bookends resolve", async ({ page }) => {
    await page.goto(STRUCTURED);
    const adjacent = page.getByRole("navigation", {
      name: "Adjacent articles",
    });
    await expect(
      adjacent.getByRole("link", { name: /Why We Chose React Server Components/i }),
    ).toBeVisible();
    await expect(
      adjacent.getByRole("link", { name: /Lessons from Building Atlas/i }),
    ).toBeVisible();
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await page.goto(STRUCTURED);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test("visual regression — full page", async ({ page }, testInfo) => {
    await page.goto(STRUCTURED);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot(
      `article-structured-${testInfo.project.name}.png`,
      {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      },
    );
  });
});

test.describe("article detail — AI-Assisted Engineering Workflows (short)", () => {
  test("renders concise editorial shape without empty chrome", async ({
    page,
  }) => {
    await page.goto(SHORT);

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "AI-Assisted Engineering Workflows",
      }),
    ).toBeVisible();
    await expect(page.locator("#bound")).toBeVisible();
    await expect(page.locator("#review")).toBeVisible();
    await expect(page.getByText("WARNING")).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Continue in the same register.",
      }),
    ).toBeVisible();
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await page.goto(SHORT);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
});
