import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("case study — Portfolio OS", () => {
  test("renders primary landmarks and required sections", async ({ page }) => {
    await page.goto("/work/portfolio-os");

    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Case study contents" })).toBeVisible();
    await expect(page.locator("#main")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();

    await expect(
      page.getByRole("heading", { level: 1, name: "Portfolio OS" }),
    ).toBeVisible();

    for (const id of [
      "overview",
      "problem",
      "constraints",
      "architecture",
      "decisions",
      "implementation",
      "delivery",
      "outcomes",
      "lessons",
      "contact",
    ]) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
  });

  test("marks Work as the current nav item", async ({ page }) => {
    await page.goto("/work/portfolio-os");
    await expect(
      page
        .getByRole("navigation", { name: "Primary" })
        .getByRole("link", { name: "Work" }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("navigates from work index to case study", async ({ page }) => {
    await page.goto("/work");
    await page.getByRole("link", { name: "Read case study" }).first().click();
    await expect(page).toHaveURL(/\/work\/portfolio-os$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Portfolio OS" }),
    ).toBeVisible();
  });

  test("TOC anchors scroll to sections", async ({ page }) => {
    await page.goto("/work/portfolio-os");
    await page
      .getByRole("navigation", { name: "Case study contents" })
      .getByRole("link", { name: /Architecture/i })
      .first()
      .click();
    await expect(page.locator("#architecture")).toBeInViewport();
  });

  test("reading progress exposes progressbar", async ({ page }) => {
    await page.goto("/work/portfolio-os");
    const bar = page.getByRole("progressbar", { name: "Reading progress" });
    await expect(bar).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await expect(bar).toHaveAttribute("aria-valuenow", /\d+/);
  });

  test("skip link moves focus to main", async ({ page }) => {
    await page.goto("/work/portfolio-os");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
  });

  test("unknown slug returns 404", async ({ page }) => {
    const response = await page.goto("/work/does-not-exist");
    expect(response?.status()).toBe(404);
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await page.goto("/work/portfolio-os");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test("visual regression — full page", async ({ page }, testInfo) => {
    await page.goto("/work/portfolio-os");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot(
      `case-study-${testInfo.project.name}.png`,
      {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      },
    );
  });
});
