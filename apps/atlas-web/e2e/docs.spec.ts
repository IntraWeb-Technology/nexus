import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("docs index", () => {
  test("renders primary landmarks and handbook sections", async ({ page }) => {
    await page.goto("/docs");

    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Engineering handbook.",
      }),
    ).toBeVisible();
    await expect(page.getByLabel("Search documentation")).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "Categories" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "Recently updated" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "READING PROGRESS" }),
    ).toBeVisible();
  });

  test("is category-driven and distinct from Articles chronology", async ({
    page,
  }) => {
    await page.goto("/docs");
    await expect(page.getByRole("main")).toContainText(/Engineering handbook/i);
    await expect(page.getByRole("main")).toContainText(/Distinct from/i);
    await expect(page.getByRole("main")).not.toContainText(/Newest first/i);
    await expect(
      page.getByRole("link", { name: /Architecture/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Design System/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Frontend/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Testing/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Publishing/i }).first(),
    ).toBeVisible();
  });

  test("lists required handbook fixtures", async ({ page }) => {
    await page.goto("/docs");
    await expect(
      page.getByRole("link", { name: /Atlas Architecture/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Editorial Publishing System/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Design System/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Frontend Architecture/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Testing Strategy/i }).first(),
    ).toBeVisible();
  });

  test("filters recently updated with search", async ({ page }) => {
    await page.goto("/docs");
    const recent = page.locator("#recently-updated");
    const search = page.getByLabel("Search documentation");
    await search.click();
    await search.fill("playwright");
    await expect(
      recent.getByRole("link", { name: /Testing Strategy/i }),
    ).toBeVisible();
    await expect(
      recent.getByRole("link", { name: /Atlas Architecture/i }),
    ).toHaveCount(0);
  });

  test("Articles category links to chronological journal", async ({ page }) => {
    await page.goto("/docs");
    await expect(
      page.getByRole("link", { name: /Chronological engineering journal/i }),
    ).toHaveAttribute("href", "/articles");
  });

  test("skip link moves focus to main", async ({ page }) => {
    await page.goto("/docs");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await page.goto("/docs");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test("visual regression — full page", async ({ page }, testInfo) => {
    await page.goto("/docs");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot(`docs-${testInfo.project.name}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});
