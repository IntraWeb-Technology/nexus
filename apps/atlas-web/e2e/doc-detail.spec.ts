import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const ARCHITECTURE = "/docs/atlas-architecture";

test.describe("documentation detail — Atlas Architecture", () => {
  test("renders primary landmarks and publishing primitives", async ({
    page,
  }) => {
    await page.goto(ARCHITECTURE);

    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Documentation contents" }),
    ).toBeVisible();
    await expect(page.locator("#main")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Atlas Architecture",
      }),
    ).toBeVisible();

    for (const id of ["purpose", "boundaries", "contracts", "evidence"]) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }

    await expect(page.getByText("NOTE").first()).toBeVisible();
    await expect(page.getByText(/TYPESCRIPT/i).first()).toBeVisible();
    await expect(page.getByText("TERMINAL").first()).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Continue in the handbook.",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Adjacent documentation" }),
    ).toBeVisible();
  });

  test("shows UPDATED / CATEGORY / READING / STATUS metadata", async ({
    page,
  }) => {
    await page.goto(ARCHITECTURE);
    const header = page.locator("header").filter({
      has: page.getByRole("heading", { level: 1 }),
    });
    await expect(header.getByText("UPDATED")).toBeVisible();
    await expect(header.getByText("CATEGORY")).toBeVisible();
    await expect(header.getByText("READING")).toBeVisible();
    await expect(header.getByText("STATUS")).toBeVisible();
    await expect(header.getByText("2025-04-08")).toBeVisible();
    await expect(header.getByText("Architecture", { exact: true })).toBeVisible();
    await expect(header.getByText("12 min")).toBeVisible();
    await expect(header.getByText("Published")).toBeVisible();
  });

  test("TOC anchors scroll to sections", async ({ page }) => {
    await page.goto(ARCHITECTURE);
    await page
      .getByRole("navigation", { name: "Documentation contents" })
      .getByRole("link", { name: /Boundaries/i })
      .first()
      .click();
    await expect(page.locator("#boundaries")).toBeInViewport();
  });

  test("reading progress exposes progressbar", async ({ page }) => {
    await page.goto(ARCHITECTURE);
    const bar = page.getByRole("progressbar", { name: "Reading progress" });
    await expect(bar).toBeVisible();
    await page.evaluate(() =>
      window.scrollTo(0, document.body.scrollHeight / 2),
    );
    await expect(bar).toHaveAttribute("aria-valuenow", /\d+/);
  });

  test("prev/next and related navigate between docs", async ({ page }) => {
    await page.goto(ARCHITECTURE);
    await page
      .getByRole("navigation", { name: "Adjacent documentation" })
      .getByRole("link", { name: /Editorial Publishing System/i })
      .click();
    await expect(page).toHaveURL(/\/docs\/editorial-system$/);

    await page.goto(ARCHITECTURE);
    await page
      .getByRole("link", { name: /Editorial Publishing System/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/docs\/editorial-system$/);
  });

  test("required documentation routes resolve", async ({ page }) => {
    test.setTimeout(90_000);
    for (const slug of [
      "atlas-architecture",
      "editorial-system",
      "design-system",
      "frontend-architecture",
      "testing-strategy",
    ]) {
      const response = await page.goto(`/docs/${slug}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator("#main")).toBeVisible();
    }
  });

  test("contact bridge links to Contact and Work", async ({ page }) => {
    await page.goto(ARCHITECTURE);
    await expect(
      page.getByRole("link", { name: "Start a conversation" }),
    ).toHaveAttribute("href", "/contact");
    await expect(
      page.getByRole("link", { name: /browse Work/i }),
    ).toHaveAttribute("href", "/work");
  });

  test("unknown slug returns 404", async ({ page }) => {
    const response = await page.goto("/docs/does-not-exist");
    expect(response?.status()).toBe(404);
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await page.goto(ARCHITECTURE);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test("visual regression — full page", async ({ page }, testInfo) => {
    await page.goto(ARCHITECTURE);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot(
      `doc-detail-${testInfo.project.name}.png`,
      {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      },
    );
  });
});
